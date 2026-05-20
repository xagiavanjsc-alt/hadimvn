import { useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getStreakData, recordActivity } from "@/utils/streak";

/**
 * Award random 1–5 XP **once per calendar day** whenever a logged-in user is
 * active. Triggers on: mount after auth + tab visibility change + window focus,
 * so users who leave the tab open across midnight still get the bonus without
 * logging out / in.
 *
 * Anti-cheat: per-day cap (`streak_day` = 1/day) enforced by useXPSystem, and
 * server-side trigger validates total XP via `compute_user_xp(user_id)`.
 */
export function useDailyLoginBonus() {
  const { user, loading } = useAuth();
  const { awardXP } = useXPSystem();
  const [lastDate, setLastDate] = useLocalStorage<string>("kts_daily_login_date", "");

  const claimIfNewDay = useCallback(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    if (lastDate === today) return;

    // Update streak using centralized function
    const streakData = recordActivity(1);
    const newCount = streakData.currentStreak;

    const bonus = Math.floor(Math.random() * 5) + 1;
    awardXP({ type: "streak_day", amount: bonus });
    setLastDate(today);

    if (newCount === 7) awardXP({ type: "streak_bonus_7" });
    else if (newCount === 30) awardXP({ type: "streak_bonus_30" });
    else if (newCount === 100) awardXP({ type: "streak_bonus_100" });
  }, [user, lastDate, setLastDate, awardXP]);

  // Run on initial mount / auth change
  useEffect(() => {
    if (loading) return;
    claimIfNewDay();
  }, [loading, claimIfNewDay]);

  // Re-check when tab becomes visible / regains focus (covers midnight rollover)
  useEffect(() => {
    if (!user) return;
    const handler = () => {
      if (document.visibilityState === "visible") claimIfNewDay();
    };
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("focus", claimIfNewDay);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("focus", claimIfNewDay);
    };
  }, [user, claimIfNewDay]);
}

/** Component wrapper so the hook can be mounted in App. */
export function DailyLoginBonusGate() {
  useDailyLoginBonus();
  return null;
}
