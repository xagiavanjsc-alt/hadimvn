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
  return new Date().toISOString().slice(0, 10);
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
    // Migration from old formats
    return migrateOldFormat(data);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} };
  }
}

function migrateOldFormat(data: any): StreakData {
  // Handle kts_streak format: { count, lastDate }
  if (typeof data.count === "number" && data.lastDate) {
    return {
      currentStreak: data.count,
      longestStreak: data.longestStreak || data.count,
      lastStudyDate: data.lastDate,
      history: {},
    };
  }
  // Handle array format: string[] of dates
  if (Array.isArray(data)) {
    const history: Record<string, number> = {};
    data.forEach(d => history[d] = 1);
    return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history };
  }
  return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} };
}

function saveStreak(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// Record activity for today (e.g., studying a word, completing a lesson)
export function recordActivity(count: number = 1): StreakData {
  const data = loadStreak();
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  
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
