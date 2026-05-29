// ─── Unified Streak Management for entire system ───────────────────────────────
// All modules should use this to ensure streak data consistency across leaderboard

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  history: Record<string, number>; // date → activity count
}

const STREAK_KEY = "hanja_streak";

function getToday(): string {
  // Use local date components — Vietnam is UTC+7. Using toISOString() (UTC)
  // would let a single VN day span two UTC days, double-counting the streak
  // for users who study early morning then again late at night.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} };
    const data = JSON.parse(raw);
    // Ensure structure is correct
    if (typeof data.currentStreak === "number" && typeof data.longestStreak === "number") {
      return data;
    }
    console.error("[Streak] Invalid streak data structure:", data);
    return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} };
  } catch (error) {
    console.error("[Streak] Failed to load streak data:", error);
    return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} };
  }
}

function saveStreak(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// Record activity for today (e.g., studying a word, completing a lesson)
export function recordActivity(count: number = 1): StreakData {
  const data = loadStreak();
  const today = getToday();
  const yesterday = getYesterday();
  
  data.history[today] = (data.history[today] || 0) + count;
  
  if (data.lastStudyDate === today) {
    // already recorded today, just update count
  } else if (data.lastStudyDate === yesterday) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }
  
  data.lastStudyDate = today;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  
  saveStreak(data);
  return data;
}

// Get current streak data
export function getStreakData(): StreakData {
  return loadStreak();
}

// Get just the current streak count (for simple display)
export function getCurrentStreak(): number {
  return loadStreak().currentStreak;
}

// Reset streak (for testing or user request)
export function resetStreak(): void {
  const today = getToday();
  saveStreak({ currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} });
}

// Get activity history as date array (for dashboard compatibility)
export function getActivityDates(): string[] {
  const data = loadStreak();
  return Object.keys(data.history).filter(k => data.history[k] > 0);
}
