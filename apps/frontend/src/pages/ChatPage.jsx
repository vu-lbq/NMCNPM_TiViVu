import React, { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, Send, Loader2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import MessageBubble from "../components/MessageBubble";
import DictionaryModal from "../components/DictionaryModal";
import { useSpeechRecognition, useTextToSpeech } from "../hooks/useSpeech";
import { chatService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ChatPage = () => {
  const { user } = useAuth();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechRecognition();
  const { speak } = useTextToSpeech();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (transcript) setInput((prev) => (prev ? prev + " " : "") + transcript);
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
      await chatService.sendMessage(cid, userMsg.text);
      await loadMessages(cid);
      setSidebarRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectConversation = async (convo) => {
    const cid = convo?.id;
    setConversationId(cid);
    setMessages([]);
    await loadMessages(cid);
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
    <MainLayout onSelectConversation={handleSelectConversation} selectedConversationId={conversationId} sidebarRefreshKey={sidebarRefreshKey}>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
          {messages.length === 0 ? (
            <div className="text-center opacity-60 mb-20">
              <h2 className="text-3xl font-bold text-[#1D2957] mb-3">
                Hello, {user?.email || user?.username || "Learner"}
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

          {isProcessing && (
            <div className="flex gap-2 text-[#00BDB6] text-sm items-center ml-2 mb-4 font-medium">
              <Loader2 size={16} className="animate-spin" /> AI is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto relative flex items-end gap-3 bg-gray-50 p-2 rounded-2xl shadow-inner border border-gray-100">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-xl transition-all shadow-sm ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-red-200"
                : "bg-white text-[#1D2957] hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
          </button>

          <div className="flex-1 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? "Listening..." : "Type a message..."}
              className="w-full bg-transparent border-none outline-none resize-none max-h-32 text-[#1D2957] placeholder-gray-400"
              rows={1}
            />
            {isListening && (
              <p className="text-xs text-[#00BDB6] animate-pulse px-1 absolute top-1 font-medium">
                {transcript}
              </p>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className={`p-3 rounded-xl transition-all shadow-md ${
              input.trim()
                ? "bg-[#00BDB6] text-white hover:bg-[#00a8a2] shadow-[#00BDB6]/30"
                : "bg-gray-200 text-gray-400 shadow-none"
            }`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>

      <DictionaryModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </MainLayout>
  );
};

export default ChatPage;
