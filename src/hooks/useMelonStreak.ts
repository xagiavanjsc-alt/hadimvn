import { useState, useEffect, useCallback } from "react";

const MELON_STREAK_KEY = "melon_streak";
const MELON_LEARNED_TODAY_KEY = "melon_learned_today";
const LEARNED_KEY = "melon_learned_ranks";

function getSafeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export interface MelonStreak {
  count: number;
  lastDate: string;
  history: string[];
}

// ─── Pure helpers (no side effects) ──────────────────────────────────────────

function readStreak(): MelonStreak {
  const storage = getSafeStorage();
  if (!storage) return { count: 0, lastDate: "", history: [] };

  try {
    const raw = storage.getItem(MELON_STREAK_KEY);
    return raw ? (JSON.parse(raw) as MelonStreak) : { count: 0, lastDate: "", history: [] };
  } catch {
    return { count: 0, lastDate: "", history: [] };
  }
}

function writeStreak(streak: MelonStreak): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(MELON_STREAK_KEY, JSON.stringify(streak));
  } catch {
    // ignore storage errors
  }
}

function readLearnedRanks(): number[] {
  const storage = getSafeStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(LEARNED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function writeLearnedRanks(ranks: number[]): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(LEARNED_KEY, JSON.stringify(ranks));
  } catch {
    // ignore storage errors
  }
}

function readLearnedToday(): boolean {
  const storage = getSafeStorage();
  if (!storage) return false;

  try {
    const raw = storage.getItem(MELON_LEARNED_TODAY_KEY);
    if (!raw) return false;
    const { date } = JSON.parse(raw) as { date: string };
    return date === new Date().toISOString().split("T")[0];
  } catch {
    return false;
  }
}

function writeLearnedToday(): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    const today = new Date().toISOString().split("T")[0];
    storage.setItem(MELON_LEARNED_TODAY_KEY, JSON.stringify({ date: today }));
  } catch {
    // ignore storage errors
  }
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
  // Intentionally empty deps - should only run on mount
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
