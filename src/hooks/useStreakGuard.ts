import { useEffect, useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface StreakData {
  count: number;
  lastDate: string;
}

interface StreakStatus {
  count: number;
  studiedToday: boolean;
  isAtRisk: boolean; // streak will reset if not studied today
  hoursLeft: number; // hours until midnight
  minutesLeft: number;
  wasReset: boolean; // streak was just reset (missed yesterday)
}

export function useStreakGuard() {
  const [streak, setStreak] = useLocalStorage<StreakData>("kts_streak", { count: 0, lastDate: "" });
  const [status, setStatus] = useState<StreakStatus>({
    count: streak.count,
    studiedToday: false,
    isAtRisk: false,
    hoursLeft: 24,
    minutesLeft: 0,
    wasReset: false,
  });

  const computeStatus = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

    // Time until midnight
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msLeft = midnight.getTime() - now.getTime();
    const hoursLeft = Math.floor(msLeft / 3600000);
    const minutesLeft = Math.floor((msLeft % 3600000) / 60000);

    const studiedToday = streak.lastDate === today;
    const studiedYesterday = streak.lastDate === yesterday;
    const missedDays = streak.lastDate && streak.lastDate !== today && streak.lastDate !== yesterday;

    // Auto-reset if missed more than 1 day
    let currentCount = streak.count;
    let wasReset = false;
    if (missedDays && streak.count > 0) {
      currentCount = 0;
      wasReset = true;
      setStreak({ count: 0, lastDate: streak.lastDate });
    }

    // At risk: has streak, studied yesterday (not today), and less than 3 hours left
    const isAtRisk = currentCount > 0 && studiedYesterday && !studiedToday && hoursLeft < 3;

    setStatus({
      count: currentCount,
      studiedToday,
      isAtRisk,
      hoursLeft,
      minutesLeft,
      wasReset,
    });
  }, [streak, setStreak]);

  // Mark today as studied
  const markStudiedToday = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (streak.lastDate === today) return; // already marked

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
    setStreak({ count: newCount, lastDate: today });
  }, [streak, setStreak]);

  useEffect(() => {
    computeStatus();
    // Re-check every minute
    const interval = setInterval(computeStatus, 60000);
    return () => clearInterval(interval);
  }, [computeStatus]);

  return { status, markStudiedToday };
}
