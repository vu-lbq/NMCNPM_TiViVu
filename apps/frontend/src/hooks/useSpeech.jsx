import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const [hasBrowserSTT, setHasBrowserSTT] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setHasBrowserSTT(true);
    }
  }, []);

  useEffect(() => {
    if (!hasBrowserSTT) return;
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
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setIsListening(false);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [hasBrowserSTT]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
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
  const lastTextRef = useRef(null);

  // Load available voices (browsers may populate asynchronously)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const detectLanguage = (text) => {
    if (!text) return "en";
    // Count Vietnamese diacritic characters
    const viChars = text.match(
      /[ăâđêôơưĂÂĐÊÔƠƯàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/g
    );
    const viCount = viChars ? viChars.length : 0;
    // Basic heuristic: if diacritics > 3 or > 2% of length, assume Vietnamese
    if (viCount >= 3 || (viCount > 0 && viCount / text.length > 0.02))
      return "vi";
    return "en";
  };

  const pickVoice = (langShortCode) => {
    const voices = voicesRef.current || [];
    if (!voices.length) return null;

    if (langShortCode === "vi") {
      return (
        voices.find((v) => v.lang === "vi-VN") ||
        voices.find((v) => /vietnam/i.test(v.name))
      );
    } else {
      let usVoice = voices.find(
        (v) => v.lang === "en-US" && !v.name.includes("Zira")
      );
      if (!usVoice) usVoice = voices.find((v) => v.lang === "en-US");
      if (!usVoice) usVoice = voices.find((v) => v.lang.startsWith("en"));
      return usVoice;
    }
  };

  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (lastTextRef.current === text) {
        lastTextRef.current = null;
        return;
      }
    }

    lastTextRef.current = text;

    try {
      const langCode = detectLanguage(text); // 'en' or 'vi'
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = langCode === "vi" ? "vi-VN" : "en-US";
      // Rate adjustments: Vietnamese often shorter—slightly slower for clarity
      utterance.rate = langCode === "vi" ? 0.95 : 0.9;
      const voice = pickVoice(langCode);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS speak error:", e);
    }
  };
  return { speak };
};
