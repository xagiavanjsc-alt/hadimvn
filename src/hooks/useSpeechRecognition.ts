import { useState, useEffect, useRef } from "react";

interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Trình duyệt không hỗ trợ nhận diện giọng nói");
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = options.lang || "ko-KR";
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults || false;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscriptText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscriptText += transcript;
        }
      }

      setTranscript(finalTranscript);
      setInterimTranscript(interimTranscriptText);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [options.lang, options.continuous, options.interimResults]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    setTranscript("");
    setInterimTranscript("");
    setError(null);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const reset = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
