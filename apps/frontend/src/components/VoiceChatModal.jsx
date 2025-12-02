import React, { useRef, useState } from "react";
import { Mic, StopCircle, X, Loader2, Volume2, Repeat } from "lucide-react";
import { voiceService } from "../services/api";

// removed: b64ToBlob no longer needed when fetching TTS as binary

export default function VoiceChatModal({ isOpen, onClose, conversationId, onReplied }) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("Tap to record");
  const [lastTranscript, setLastTranscript] = useState("");
  const [handsFree, setHandsFree] = useState(true);

  if (!isOpen) return null;

  const startRecording = async () => {
    if (isProcessing) return;
    try {
      setLastTranscript("");
      // stop any playing audio before recording
      try { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } } catch { /* ignore */ }
      try { if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; } } catch { /* ignore */ }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        await handleUpload();
        try { stream.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
        streamRef.current = null;
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setStatus("Recording... tap to stop");
    } catch (err) {
      console.error("mic error", err);
      setStatus("Microphone error");
    }
  };

  const stopRecording = () => {
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    setIsRecording(false);
    setStatus("Processing...");
  };

  const handleUpload = async () => {
    try {
      setIsProcessing(true);
      const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const filename = `audio_${Date.now()}.webm`;
      const result = await voiceService.voiceChat({ audioBase64: base64, filename, language: 'auto', conversationId, skipTts: true });
      const { transcript, replyText, conversationId: newCid } = result || {};
      if (transcript) setLastTranscript(transcript);
      if (typeof onReplied === 'function') {
        await onReplied(newCid || conversationId);
      }
      // fetch TTS as binary for faster playback
      if (replyText && replyText.trim().length > 0) {
        const ttsResp = await fetch('/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: replyText, voice: 'auto', format: 'mp3' })
        });
        if (ttsResp.ok) {
          const audioBlob = await ttsResp.blob();
          const url = URL.createObjectURL(audioBlob);
          // cleanup previous
          try { if (audioRef.current) audioRef.current.pause(); } catch { /* ignore */ }
          try { if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); } catch { /* ignore */ }
          audioUrlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;
          setIsPlaying(true);
          setStatus('Playing AI reply...');
          audio.onended = () => {
            setIsPlaying(false);
            setStatus(handsFree ? 'Auto recording...' : 'Tap to record');
            if (handsFree) {
              setTimeout(() => {
                if (!isProcessing) startRecording();
              }, 500);
            }
          };
          try { await audio.play(); } catch { /* ignore */ }
        }
      }
      setStatus("Tap to record");
    } catch (err) {
      console.error("voiceChat upload error", err);
      setStatus("Failed. Try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrimaryClick = () => {
    if (isRecording) stopRecording(); else startRecording();
  };

  const handleClose = () => {
    if (isRecording) stopRecording();
    if (streamRef.current) { try { streamRef.current.getTracks().forEach(t => t.stop()); } catch { /* ignore */ } }
    try { if (audioRef.current) audioRef.current.pause(); } catch { /* ignore */ }
    try { if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); } catch { /* ignore */ }
    audioRef.current = null; audioUrlRef.current = null;
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="absolute top-4 right-4">
        <button onClick={handleClose} className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 text-white select-none">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-1">Voice Chat</div>
          <div className="text-sm opacity-80">{status}</div>
        </div>

        <button
          onClick={handlePrimaryClick}
          disabled={isProcessing || isPlaying}
          className={`w-40 h-40 rounded-full shadow-xl flex items-center justify-center transition-all border-4 ${
            isRecording
              ? 'bg-red-500 border-red-300 animate-pulse'
              : (isProcessing || isPlaying)
              ? 'bg-gray-400 border-gray-300 cursor-not-allowed'
              : 'bg-[#00BDB6] border-teal-200 hover:scale-105'
          }`}
          title={isRecording ? 'Stop' : 'Record'}
        >
          {isProcessing ? (
            <Loader2 size={56} className="animate-spin" />
          ) : isRecording ? (
            <StopCircle size={72} />
          ) : (
            <Mic size={72} />
          )}
        </button>

        <button
          onClick={() => setHandsFree(v => !v)}
          disabled={isProcessing}
          className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 ${
            handsFree ? 'bg-white/90 text-gray-800 border-white' : 'bg-transparent border-white/60 text-white'
          }`}
          title="Hands-free loop"
        >
          <Repeat size={16} /> {handsFree ? 'Hands-free: ON' : 'Hands-free: OFF'}
        </button>

        {lastTranscript && (
          <div className="max-w-md bg-white/10 rounded-xl p-4 text-sm leading-relaxed">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Volume2 size={16} />
              <span className="font-medium">You said</span>
            </div>
            <div className="opacity-95">{lastTranscript}</div>
          </div>
        )}
      </div>
    </div>
  );
}
