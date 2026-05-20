import { useEffect, useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getStreakData, recordActivity } from "@/utils/streak";

/**
 * Streak data stored in localStorage
 */
interface StreakData {
  count: number;
  lastDate: string;
}

/**
 * Streak status for UI display
 */
interface StreakStatus {
  count: number;
  studiedToday: boolean;
  isAtRisk: boolean; // streak will reset if not studied today
  hoursLeft: number; // hours until midnight
  minutesLeft: number;
  wasReset: boolean; // streak was just reset (missed yesterday)
}

/**
 * Hook for managing user study streak
 * Automatically tracks streak, detects resets, and warns when streak is at risk
 * 
 * @returns Object containing:
 * - status: Current streak status
 * - markStudiedToday: Function to mark today as studied
 */
export function useStreakGuard() {
  const streak = getStreakData();
  const [status, setStatus] = useState<StreakStatus>({
    count: streak.currentStreak,
    studiedToday: false,
    isAtRisk: false,
    hoursLeft: 24,
    minutesLeft: 0,
    wasReset: false,
  });

  /**
   * Compute streak status based on current date and last study date
   * Handles auto-reset for missed days and at-risk detection
   */
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

    const studiedToday = streak.lastStudyDate === today;
    const studiedYesterday = streak.lastStudyDate === yesterday;
    const missedDays = streak.lastStudyDate && streak.lastStudyDate !== today && streak.lastStudyDate !== yesterday;

    // At risk: has streak, studied yesterday (not today), and less than 3 hours left
    const isAtRisk = streak.currentStreak > 0 && studiedYesterday && !studiedToday && hoursLeft < 3;

    setStatus({
      count: streak.currentStreak,
      studiedToday,
      isAtRisk,
      hoursLeft,
      minutesLeft,
      wasReset: missedDays && streak.currentStreak === 0,
    });
  }, [streak]);

  /**
   * Mark today as studied and increment streak
   * If studied yesterday, increment count. Otherwise, start new streak from 1.
   */
  const markStudiedToday = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (streak.lastStudyDate === today) return; // already marked

    // Use centralized recordActivity function
    recordActivity(1);
  }, [streak.lastStudyDate]);

  useEffect(() => {
    computeStatus();
    // Re-check every minute
    const interval = setInterval(computeStatus, 60000);
    return () => clearInterval(interval);
  }, [computeStatus]);

  return { status, markStudiedToday };
}
