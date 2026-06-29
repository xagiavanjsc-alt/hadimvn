import { useState, useEffect, useRef } from "react";

interface MicroLearningSession {
  id: string;
  type: "vocabulary" | "grammar" | "listening" | "reading";
  duration: number; // seconds
  items: any[];
  currentIndex: number;
  score: number;
  completed: boolean;
}

export function useMicroLearning() {
  const [session, setSession] = useState<MicroLearningSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = (type: "vocabulary" | "grammar" | "listening" | "reading", duration: number = 300) => {
    // Mock items - in real implementation, this would fetch from API
    const mockItems = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
    }));

    setSession({
      id: Date.now().toString(),
      type,
      duration,
      items: mockItems,
      currentIndex: 0,
      score: 0,
      completed: false,
    });
    setTimeLeft(duration);
    setIsPaused(false);
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSession(null);
    setTimeLeft(0);
  };

  const answerQuestion = (correct: boolean) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        score: correct ? prev.score + 1 : prev.score,
        completed: prev.currentIndex + 1 >= prev.items.length,
      };
    });
  };

  const skipQuestion = () => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        completed: prev.currentIndex + 1 >= prev.items.length,
      };
    });
  };

  // Timer effect
  useEffect(() => {
    if (session && timeLeft > 0 && !isPaused && !session.completed) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session, timeLeft, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!session) return 0;
    return (session.currentIndex / session.items.length) * 100;
  };

  return {
    session,
    timeLeft,
    isPaused,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    answerQuestion,
    skipQuestion,
    formatTime,
    getProgress,
  };
}
