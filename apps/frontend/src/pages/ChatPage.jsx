import React, { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, Send, Loader2, XCircle, Headphones, MessageSquare } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import MessageBubble from "../components/MessageBubble";
import VoiceChatModal from "../components/VoiceChatModal";
import DictionaryModal from "../components/DictionaryModal";
import VocabularyModal from "../components/VocabularyModal";
import FeedbackModal from "../components/FeedbackModal";
import { useSpeechRecognition, useTextToSpeech } from "../hooks/useSpeech";
import { chatService, voiceService } from "../services/api";
import { useAuth } from "../context/useAuth";

const ChatPage = () => {
  const { user } = useAuth();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
    hasBrowserSTT,
  } = useSpeechRecognition();
  const { speak } = useTextToSpeech();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [inflight, setInflight] = useState(null);
  const messagesEndRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceReplyMode, setVoiceReplyMode] = useState(false); // false: STT to text, true: voice-to-voice
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordChunksRef = useRef([]);
  const textAreaRef = useRef(null);
  const [sttLanguage, setSttLanguage] = useState('en');

  useEffect(() => {
    // Commit finalized transcript from browser STT by replacing input,
    // avoiding duplication between interim and final segments.
    if (transcript) setInput(transcript);
  }, [transcript]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // satisfy linter that sidebarRefreshKey is used in this file
  useEffect(() => {}, [sidebarRefreshKey]);

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const convo = await chatService.createConversation("New Chat");
    const cid = convo?.id || convo?.conversation?.id || null;
    setConversationId(cid);
    return cid;
  };

  const loadMessages = async (cid) => {
    if (!cid) return;
    const result = await chatService.listMessages(cid);
    const items = result?.messages || result || [];
    const mapped = items.map((m) => ({
      text: m.content || m.text || "",
      role: m.role || "user",
      timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
    }));
    setMessages(mapped);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg = { text: input, role: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTranscript("");
    setIsProcessing(true);

    try {
      const cid = await ensureConversation();
      const controller = new AbortController();
      setInflight(controller);
      await chatService.sendMessage(cid, userMsg.text, { signal: controller.signal });
      await loadMessages(cid);
      setSidebarRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsProcessing(false);
      setInflight(null);
    }
  };

  const handleCancel = async () => {
    try {
      if (inflight) inflight.abort();
    } catch {
      // ignore abort errors
    }
    setIsProcessing(false);
    setInflight(null);
    try {
      if (conversationId) await loadMessages(conversationId);
    } catch {
      // ignore reload errors
    }
  };
  

  // Auto-resize input up to ~4 lines, then scroll
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxPx = 112; // ~4 lines
    const next = Math.min(el.scrollHeight, maxPx);
    el.style.height = `${next}px`;
  }, [input]);

  // Server-side STT fallback (MediaRecorder -> /stt)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        try {
          const blob = new Blob(recordChunksRef.current, { type: mr.mimeType || 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const filename = `audio_${Date.now()}.webm`;
          if (voiceReplyMode) {
            // Voice -> Voice: send audio and play reply
            const result = await voiceService.voiceChat({ audioBase64: base64, filename, language: 'en', conversationId });
            const { audioBase64: outB64, contentType, conversationId: newCid } = result || {};
            if (newCid && !conversationId) setConversationId(newCid);
            // Update messages list to reflect DB saved messages
            try { await loadMessages(newCid || conversationId); } catch { /* ignore */ }
            // Autoplay returned audio
            if (outB64) {
              const audioBlob = b64ToBlob(outB64, contentType || 'audio/mp3');
              const url = URL.createObjectURL(audioBlob);
              const audio = new Audio(url);
              audio.play().catch(() => {});
            }
          } else {
            // Voice -> Text: transcribe and append to input
            const res = await voiceService.stt({ audioBase64: base64, filename, language: sttLanguage });
            const text = (res?.text || '').trim();
            if (text) {
              // Replace input with STT result to avoid duplication
              setInput(text);
              setTranscript(text);
            }
          }
        } catch (err) {
          console.error('STT error:', err);
        } finally {
          // stop all tracks
          try { stream.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
          setIsRecording(false);
          mediaRecorderRef.current = null;
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
  };

  const b64ToBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  const handleSelectConversation = async (convo) => {
    const cid = convo?.id;
    setConversationId(cid);
    setMessages([]);
    await loadMessages(cid);
  };
  const handleVoiceReplied = async (cid) => {
    if (cid) setConversationId(cid);
    await loadMessages(cid || conversationId);
    setSidebarRefreshKey((k) => k + 1);
  };
  // On first render, select an existing conversation if any; do not auto-create
  useEffect(() => {
    (async () => {
      try {
        const data = await chatService.listConversations();
        const convos = data?.conversations || data || [];
        const first = convos[0];
        if (first) {
          setConversationId(first.id);
          await loadMessages(first.id);
        }
      } catch (e) {
        console.error('Load conversations failed', e);
      }
    })();
  }, []);

  return (
    <MainLayout onSelectConversation={handleSelectConversation} selectedConversationId={conversationId} sidebarRefreshKey={sidebarRefreshKey} onOpenVocabulary={() => setVocabOpen(true)}>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
        <div className="relative max-w-3xl mx-auto min-h-full flex flex-col justify-end">
          {messages.length === 0 ? (
            <div className="text-center opacity-60 mb-20">
              <h2 className="text-3xl font-bold text-[#1D2957] mb-3">
                Hello, {user?.displayName || user?.email || user?.username || "Learner"}
              </h2>
              <p className="text-gray-600">Start speaking to practice your English!</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageBubble
                key={i}
                text={m.text}
                role={m.role}
                onWordClick={setSelectedWord}
                onSpeak={speak}
              />
            ))
          )}
          <div className="flex gap-2 text-[#00BDB6] text-sm items-center ml-2 mb-4 font-medium">
            {isProcessing && (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>AI is thinking...</span>
                <button
                  onClick={handleCancel}
                  className="ml-3 flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-800 text-white hover:bg-gray-700"
                >
                  <XCircle size={14} /> Cancel
                </button>
              </>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 relative">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-3">
            <div
              className={`flex-1 relative flex items-end gap-3 bg-gray-50 p-2 rounded-2xl shadow-inner border border-gray-100 ${
                isProcessing ? "opacity-60" : ""
              }`}
            >
          {/* Mic control: browser STT or server recording; include Voice Reply toggle when using server */}
          {hasBrowserSTT ? (
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing && !isListening}
                className={`p-3 rounded-xl transition-all shadow-sm ${
                  isProcessing && !isListening
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isListening
                    ? "bg-red-500 text-white animate-pulse shadow-red-200"
                    : "bg-white text-[#1D2957] hover:bg-gray-100 border border-gray-200"
                }`}
                title="Browser Speech Recognition (STT to text)"
              >
                {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
              </button>
          ) : (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`p-3 rounded-xl transition-all shadow-sm ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse shadow-red-200"
                    : isProcessing
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#1D2957] hover:bg-gray-100 border border-gray-200"
                }`}
                title={voiceReplyMode ? "Record voice (AI replies with voice)" : "Record audio (transcribe to text)"}
              >
                {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
              </button>
              <select
                value={sttLanguage}
                onChange={(e) => setSttLanguage(e.target.value)}
                disabled={isProcessing || isRecording}
                className="px-3 py-2 rounded-xl border text-sm bg-white text-[#1D2957] border-gray-200 hover:bg-gray-100"
                title="STT language"
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
              <button
                onClick={() => setVoiceReplyMode((v) => !v)}
                disabled={isProcessing || isRecording}
                className={`px-3 py-2 rounded-xl border text-sm ${
                  voiceReplyMode ? "bg-[#00BDB6] text-white border-[#00BDB6]" : "bg-white text-[#1D2957] border-gray-200 hover:bg-gray-100"
                }`}
                title="Toggle voice reply mode"
              >
                {voiceReplyMode ? "Voice Reply" : "STT → Text"}
              </button>
            </>
          )}

          <div className="flex-1 py-1">
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isProcessing ? "AI is thinking..." : isListening ? "Listening..." : "Type a message..."
              }
              disabled={isProcessing}
              className={`w-full bg-transparent border-none outline-none resize-none overflow-y-auto max-h-[112px] text-[#1D2957] placeholder-gray-400 text-sm leading-tight ${
                isProcessing ? "cursor-not-allowed" : ""
              }`}
              rows={1}
            />
            {isListening && !isProcessing && (
              <p className="text-xs text-[#00BDB6] animate-pulse px-1 absolute top-1 font-medium">
                {transcript}
              </p>
            )}
          </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className={`p-3 rounded-xl transition-all shadow-md ${
                  !input.trim() || isProcessing
                    ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                    : "bg-[#00BDB6] text-white hover:bg-[#00a8a2] shadow-[#00BDB6]/30"
                }`}
              >
                <Send size={24} />
              </button>
              <button
                onClick={() => setVoiceModalOpen(true)}
                disabled={isProcessing || isRecording}
                className={`p-3 rounded-xl transition-all shadow-sm ml-1 ${
                  isProcessing || isRecording
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#1D2957] hover:bg-gray-100 border border-gray-200"
                }`}
                title="Open Voice Chat (voice↔voice)"
              >
                <Headphones size={24} />
              </button>
            </div>
          </div>
        </div>
        {/* Desktop: inline feedback button (kept compact) */}
        <button
          onClick={() => setFeedbackOpen(true)}
          className="hidden md:flex p-2 rounded-xl transition-all shadow-sm bg-white text-[#1D2957] hover:bg-gray-100 border border-gray-200 absolute right-4 top-1/2 -translate-y-1/2"
          title="Send Feedback"
        >
          <MessageSquare size={18} className="mr-2" /> Feedback
        </button>

        {/* Mobile: floating circular icon button that avoids overlapping input controls */}
        <button
          onClick={() => setFeedbackOpen(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 p-3 rounded-full bg-[#00BDB6] text-white shadow-lg hover:bg-[#00a8a2]"
          title="Send Feedback"
          aria-label="Send Feedback"
        >
          <MessageSquare size={20} />
        </button>
      </div>

      <DictionaryModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
      <VoiceChatModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        conversationId={conversationId}
        onReplied={handleVoiceReplied}
      />
      <VocabularyModal isOpen={vocabOpen} onClose={() => setVocabOpen(false)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </MainLayout>
  );
};

export default ChatPage;
