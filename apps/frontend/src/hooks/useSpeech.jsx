import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const initialHas = typeof window !== 'undefined' && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const [hasBrowserSTT] = useState(initialHas);

  useEffect(() => {
    if (hasBrowserSTT) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech Rec Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [hasBrowserSTT]);

  const startListening = () => {
    setTranscript("");
    recognitionRef.current?.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
    hasBrowserSTT,
  };
};

export const useTextToSpeech = () => {
  const voicesRef = useRef([]);

  // Load available voices (browsers may populate asynchronously)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const detectLanguage = (text) => {
    if (!text) return 'en';
    // Count Vietnamese diacritic characters
    const viChars = text.match(/[ăâđêôơưĂÂĐÊÔƠƯàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/g);
    const viCount = viChars ? viChars.length : 0;
    // Basic heuristic: if diacritics > 3 or > 2% of length, assume Vietnamese
    if (viCount >= 3 || (viCount > 0 && viCount / text.length > 0.02)) return 'vi';
    return 'en';
  };

  const pickVoice = (langCode) => {
    const voices = voicesRef.current || [];
    if (!voices.length) return null;
    // Prefer exact lang match
    let match = voices.find(v => v.lang.toLowerCase().startsWith(langCode));
    // Fallback: any voice containing language name
    if (!match && langCode === 'vi') match = voices.find(v => /vietnam/i.test(v.name));
    return match || null;
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const langCode = detectLanguage(text); // 'en' or 'vi'
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'vi' ? 'vi-VN' : 'en-US';
      // Rate adjustments: Vietnamese often shorter—slightly slower for clarity
      utterance.rate = langCode === 'vi' ? 0.95 : 0.9;
      const voice = pickVoice(utterance.lang.toLowerCase());
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS speak error:', e);
    }
  };
  return { speak };
};
