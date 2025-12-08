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
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("Tap to record");
  const [lastTranscript, setLastTranscript] = useState("");
  const [handsFree, setHandsFree] = useState(true);
  const [readyToast, setReadyToast] = useState(false);
  const showReadyToast = () => {
    setReadyToast(true);
    setTimeout(() => setReadyToast(false), 2000);
  };

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

      // Setup WebAudio analyser to detect silence for hands-free auto stop
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch {
        audioCtxRef.current = null;
        analyserRef.current = null;
      }
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
      setStatus("Recording... Tap to stop (or pause 2s)");

      // Hands-free: auto-stop after 2s of silence
      if (handsFree && analyserRef.current) {
        const analyser = analyserRef.current;
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        let lastSoundTs = Date.now();
        const SILENCE_THRESHOLD = 10; // amplitude avg threshold
        const SILENCE_MS = 2000; // 2 seconds
        silenceTimerRef.current = setInterval(() => {
          try {
            analyser.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += Math.abs(dataArray[i] - 128);
            }
            const avg = sum / bufferLength;
            if (avg > SILENCE_THRESHOLD) {
              lastSoundTs = Date.now();
            }
            if (Date.now() - lastSoundTs >= SILENCE_MS) {
              try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
              clearInterval(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } catch {
            clearInterval(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }, 200);
      }
    } catch (err) {
      console.error("mic error", err);
      setStatus("Microphone error");
    }
  };

  const stopRecording = () => {
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    setIsRecording(false);
    setStatus("Processing...");
    if (silenceTimerRef.current) { clearInterval(silenceTimerRef.current); silenceTimerRef.current = null; }
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const handleUpload = async () => {
    try {
      setIsProcessing(true);
      const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const filename = `audio_${Date.now()}.webm`;
      const result = await voiceService.voiceChat({ audioBase64: base64, filename, language: 'auto', conversationId });
      const { transcript, audioBase64: outB64, contentType, conversationId: newCid } = result || {};
      if (transcript) setLastTranscript(transcript);
      if (typeof onReplied === 'function') {
        await onReplied(newCid || conversationId);
      }
      // play audio from base64 response
      if (outB64) {
        const audioBlob = new Blob([Uint8Array.from(atob(outB64), c => c.charCodeAt(0))], { type: contentType || 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
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
            }, 1000);
          } else {
            setTimeout(() => {
              showReadyToast();
            }, 1000);
          }
        };
        try { await audio.play(); } catch { /* ignore */ }
        // no analyser cleanup here; handled on stopRecording/mr.onstop
      }
      setStatus("Tap to record");
      // If no audio returned (provider muted), ensure flags reset
      if (!outB64) {
        setIsPlaying(false);
      }
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
    setIsPlaying(false);
    setIsProcessing(false);
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
        {readyToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-2 rounded shadow-lg z-50">
            Ready to record
          </div>
        )}
      </div>
    </div>
  );
}
