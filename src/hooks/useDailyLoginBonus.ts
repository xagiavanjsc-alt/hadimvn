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
  const [claimedBonuses, setClaimedBonuses] = useLocalStorage<{ b7?: boolean; b30?: boolean; b100?: boolean }>("kts_streak_bonuses_claimed", {});

  const claimIfNewDay = useCallback(() => {
    if (!user) return;
    // Use local date components — toISOString() is UTC and would shift the
    // "today" boundary for VN users; see streak.ts getToday() for context.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (lastDate === today) return;

    // Update streak using centralized function
    const streakData = recordActivity(1);
    const newCount = streakData.currentStreak;

    const bonus = Math.floor(Math.random() * 5) + 1;
    awardXP({ type: "streak_day", amount: bonus });
    setLastDate(today);

    // Use >= and a per-tier claimed flag so a user who jumps past a milestone
    // (e.g. via streak freeze: 5 → 7) still gets the bonus, but can't claim
    // it twice as the streak keeps growing.
    if (newCount >= 7 && !claimedBonuses.b7) {
      awardXP({ type: "streak_bonus_7" });
      setClaimedBonuses({ ...claimedBonuses, b7: true });
    }
    if (newCount >= 30 && !claimedBonuses.b30) {
      awardXP({ type: "streak_bonus_30" });
      setClaimedBonuses({ ...claimedBonuses, b30: true });
    }
    if (newCount >= 100 && !claimedBonuses.b100) {
      awardXP({ type: "streak_bonus_100" });
      setClaimedBonuses({ ...claimedBonuses, b100: true });
    }
  }, [user, lastDate, setLastDate, awardXP, claimedBonuses, setClaimedBonuses]);

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
