import { useState, useEffect, useRef, useCallback } from "react";

interface AntiCheatConfig {
  minTimeMs?: number; // Minimum time required
  requireScroll?: boolean; // Require scrolling through content
  scrollThreshold?: number; // Percentage of scroll required (0-100)
  requireInteraction?: boolean; // Require user interaction
  interactionCount?: number; // Minimum number of interactions
}

interface AntiCheatResult {
  isValid: boolean;
  timeSpent: number;
  scrollDepth: number;
  interactionCount: number;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Anti-cheat hook for learning activities
 * Tracks time, scroll, and interactions to ensure users actually engage with content
 * 
 * @param config - Anti-cheat configuration
 * @returns Object containing validation state and methods
 */
export function useAntiCheat(config: AntiCheatConfig = {}): AntiCheatResult {
  const {
    minTimeMs = 0,
    requireScroll = false,
    scrollThreshold = 80,
    requireInteraction = false,
    interactionCount = 3,
  } = config;

  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [interactions, setInteractions] = useState(0);
  const isValidRef = useRef(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  // Track scroll depth
  useEffect(() => {
    if (!requireScroll) return;

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const depth = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollDepth(Math.min(depth, 100));
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [requireScroll]);

  // Track interactions
  const trackInteraction = useCallback(() => {
    setInteractions(prev => prev + 1);
  }, []);

  // Validate all conditions
  const validate = useCallback(() => {
    const timeValid = timeSpent >= minTimeMs;
    const scrollValid = !requireScroll || scrollDepth >= scrollThreshold;
    const interactionValid = !requireInteraction || interactions >= interactionCount;

    isValidRef.current = timeValid && scrollValid && interactionValid;
    return isValidRef.current;
  }, [timeSpent, minTimeMs, requireScroll, scrollDepth, scrollThreshold, requireInteraction, interactions, interactionCount]);

  // Reset tracking
  const reset = useCallback(() => {
    setTimeSpent(0);
    setScrollDepth(0);
    setInteractions(0);
    isValidRef.current = false;
  }, []);

  return {
    isValid: isValidRef.current,
    timeSpent,
    scrollDepth,
    interactionCount: interactions,
    validate,
    reset,
    trackInteraction,
    scrollContainerRef,
  };
}

/**
 * Quiz-specific anti-cheat hook
 * Ensures users spend minimum time per question and don't spam answers
 */
export function useQuizAntiCheat(minTimePerQuestionMs: number = 3000) {
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, { timeSpent: number }>>({});

  const startQuestion = useCallback((questionId: number) => {
    setQuestionStartTime(Date.now());
  }, []);

  const submitAnswer = useCallback((questionId: number): boolean => {
    if (!questionStartTime) return false;

    const timeSpent = Date.now() - questionStartTime;
    const isValid = timeSpent >= minTimePerQuestionMs;

    setAnswers(prev => ({
      ...prev,
      [questionId]: { timeSpent },
    }));

    setQuestionStartTime(null);
    return isValid;
  }, [questionStartTime, minTimePerQuestionMs]);

  return {
    startQuestion,
    submitAnswer,
    answers,
  };
}

/**
 * Reading-specific anti-cheat hook
 * Ensures users scroll through content and spend minimum time
 */
export function useReadingAntiCheat(minTimeMs: number = 10000, scrollThreshold: number = 80) {
  const antiCheat = useAntiCheat({
    minTimeMs,
    requireScroll: true,
    scrollThreshold,
    requireInteraction: true,
    interactionCount: 2,
  });

  return antiCheat;
}
