import { useState, useEffect, useCallback } from "react";

const MELON_STREAK_KEY = "melon_streak";
const MELON_LEARNED_TODAY_KEY = "melon_learned_today";
const LEARNED_KEY = "melon_learned_ranks";

export interface MelonStreak {
  count: number;
  lastDate: string;
  history: string[];
}

// ─── Pure helpers (no side effects) ──────────────────────────────────────────

function readStreak(): MelonStreak {
  try {
    const raw = localStorage.getItem(MELON_STREAK_KEY);
    return raw ? (JSON.parse(raw) as MelonStreak) : { count: 0, lastDate: "", history: [] };
  } catch {
    return { count: 0, lastDate: "", history: [] };
  }
}

function writeStreak(streak: MelonStreak): void {
  localStorage.setItem(MELON_STREAK_KEY, JSON.stringify(streak));
}

function readLearnedRanks(): number[] {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function writeLearnedRanks(ranks: number[]): void {
  localStorage.setItem(LEARNED_KEY, JSON.stringify(ranks));
}

function readLearnedToday(): boolean {
  try {
    const raw = localStorage.getItem(MELON_LEARNED_TODAY_KEY);
    if (!raw) return false;
    const { date } = JSON.parse(raw) as { date: string };
    return date === new Date().toISOString().split("T")[0];
  } catch {
    return false;
  }
}

function writeLearnedToday(): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(MELON_LEARNED_TODAY_KEY, JSON.stringify({ date: today }));
}

function computeUpdatedStreak(current: MelonStreak): MelonStreak {
  const today = new Date().toISOString().split("T")[0];
  if (current.lastDate === today) return current;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newCount = current.lastDate === yesterday ? current.count + 1 : 1;
  const newHistory = [...(current.history || []).slice(-29), today];
  return { count: newCount, lastDate: today, history: newHistory };
}

export function getHoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return (midnight.getTime() - now.getTime()) / 3600000;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMelonStreak() {
  const [streak, setStreakState] = useState<MelonStreak>(readStreak);
  const [learnedRanks, setLearnedRanksState] = useState<number[]>(readLearnedRanks);
  const [learnedToday, setLearnedToday] = useState<boolean>(readLearnedToday);

  // Bump streak when a new song is learned today
  const bumpStreak = useCallback(() => {
    const current = readStreak();
    const updated = computeUpdatedStreak(current);
    writeStreak(updated);
    setStreakState(updated);
  }, []);

  // Mark a rank as learned; also bumps streak + marks today
  const markLearned = useCallback(
    (rank: number) => {
      const current = readLearnedRanks();
      if (!current.includes(rank)) {
        const next = [...current, rank];
        writeLearnedRanks(next);
        setLearnedRanksState(next);
      }
      if (!readLearnedToday()) {
        writeLearnedToday();
        setLearnedToday(true);
        bumpStreak();
      }
    },
    [bumpStreak]
  );

  // Re-read learned ranks from storage (e.g. after modal closes)
  const refreshLearnedRanks = useCallback(() => {
    const ranks = readLearnedRanks();
    setLearnedRanksState(ranks);
    if (!learnedToday && ranks.length > 0) {
      writeLearnedToday();
      setLearnedToday(true);
      bumpStreak();
    }
  }, [learnedToday, bumpStreak]);

  // On mount: if streak was last updated yesterday, bump it now
  useEffect(() => {
    const current = readStreak();
    const today = new Date().toISOString().split("T")[0];
    if (current.lastDate !== today && learnedRanks.length > 0) {
      const updated = computeUpdatedStreak(current);
      writeStreak(updated);
      setStreakState(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLearned = useCallback(
    (rank: number) => learnedRanks.includes(rank),
    [learnedRanks]
  );

  return {
    streak,
    learnedRanks,
    learnedToday,
    markLearned,
    refreshLearnedRanks,
    isLearned,
  };
}
