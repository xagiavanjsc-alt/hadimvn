import { useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RANKS, BADGES } from "@/data/ranks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { computeXP, deriveLevel } from "@/lib/xp";

/**
 * XP event types for tracking user achievements
 */
export interface XPEvent {
  type:
    | "flashcard_learned"
    | "eps_exam_completed"
    | "eps_question_correct"
    | "streak_day"
    | "streak_bonus_7"
    | "streak_bonus_30"
    | "streak_bonus_100"
    | "community_post"
    | "community_like_received"
    | "quiz_completed"
    | "topik_exam_completed"
    | "topic_drill_completed"
    | "hanja_word_learned"
    | "hanja_tree_completed"
    | "hanja_quiz_completed"
    | "manual_bonus"; // Generic bonus awarded via addXP(amount, reason)
  amount?: number; // override default XP
  meta?: Record<string, unknown>;
}

/**
 * XP notification for displaying to user
 */
export interface XPNotification {
  id: string;
  type: "level_up" | "badge_earned" | "xp_gained";
  title: string;
  message: string;
  xpAmount?: number;
  rankId?: string;
  badgeId?: string;
  timestamp: number;
}

/**
 * XP rewards configuration for each event type
 */

const XP_REWARDS: Record<XPEvent["type"], number> = {
  flashcard_learned: 5,
  eps_question_correct: 3,
  eps_exam_completed: 20,
  streak_day: 10,
  streak_bonus_7: 50,
  streak_bonus_30: 200,
  streak_bonus_100: 500,
  community_post: 15,
  community_like_received: 2,
  quiz_completed: 10,
  topik_exam_completed: 25,
  topic_drill_completed: 15,
  hanja_word_learned: 3,
  hanja_tree_completed: 30,
  hanja_quiz_completed: 15,
  manual_bonus: 0, // Amount must be explicitly provided
};

// ─── Anti-cheat: max XP events per type per day ─────────────────────────────
// Hard cap to prevent farming via spam clicking. Server-side `compute_user_xp`
// trigger (003_xp_formula.sql) is the source of truth for leaderboard rank.
const DAILY_EVENT_CAPS: Partial<Record<XPEvent["type"], number>> = {
  flashcard_learned: 100,        // 500 XP/day max
  eps_question_correct: 200,     // 600 XP/day
  eps_exam_completed: 5,         // 5 exams/day
  topik_exam_completed: 5,
  topic_drill_completed: 10,
  community_post: 5,
  community_like_received: 100,
  quiz_completed: 10,
  hanja_word_learned: 100,
  hanja_quiz_completed: 10,
  hanja_tree_completed: 5,
  streak_day: 1,                 // exactly once/day for daily login bonus
  // manual_bonus intentionally uncapped — callers must validate legitimacy
};

/** Per-day counts for anti-cheat. Resets when day changes. */
interface DailyCounts {
  date: string;
  counts: Partial<Record<string, number>>;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const EVENT_LABELS: Record<XPEvent["type"], string> = {
  flashcard_learned: "Học từ vựng mới",
  eps_question_correct: "Trả lời đúng câu EPS",
  eps_exam_completed: "Hoàn thành thi thử EPS",
  streak_day: "Đăng nhập hằng ngày",
  streak_bonus_7: "Streak 7 ngày liên tiếp!",
  streak_bonus_30: "Streak 30 ngày — kỷ lục!",
  streak_bonus_100: "Streak 100 ngày — huyền thoại!",
  community_post: "Đăng bài cộng đồng",
  community_like_received: "Bài viết được yêu thích",
  quiz_completed: "Hoàn thành quiz",
  topik_exam_completed: "Hoàn thành thi TOPIK",
  topic_drill_completed: "Hoàn thành luyện tập theo chủ đề",
  hanja_word_learned: "Học từ Hán Hàn mới",
  hanja_tree_completed: "Hoàn thành cây Hán",
  hanja_quiz_completed: "Hoàn thành quiz Hán",
  manual_bonus: "Phần thưởng XP",
};

function getEventLabel(type: XPEvent["type"]): string {
  return EVENT_LABELS[type] || "Hoạt động học";
}

/**
 * Get rank for given XP amount
 * @param xp - Total XP points
 * @returns Rank object with minimum XP threshold
 */
function getRankForXP(xp: number) {
  return (
    [...RANKS].reverse().find((r) => xp >= r.minXP) || RANKS[0]
  );
}

/**
 * Check if user has earned new badges based on XP and streak
 * @param xp - Total XP points
 * @param streak - Current streak count
 * @param earnedBadgeIds - IDs of badges already earned
 * @returns Array of newly earned badge IDs
 */
function checkBadges(
  xp: number,
  streak: number,
  earnedBadgeIds: string[]
): string[] {
  const newBadges: string[] = [];
  if (streak >= 7 && !earnedBadgeIds.includes("streak7"))
    newBadges.push("streak7");
  if (streak >= 30 && !earnedBadgeIds.includes("streak30"))
    newBadges.push("streak30");
  if (streak >= 100 && !earnedBadgeIds.includes("streak100"))
    newBadges.push("streak100");
  return newBadges;
}

/**
 * Main hook for XP system - tracks user XP, ranks, badges, and notifications
 * Provides functions to add XP events, dismiss notifications, and clear notifications
 * 
 * @returns Object containing:
 * - xp: Total XP points
 * - rank: Current rank object
 * - badges: Earned badges
 * - notifications: XP notifications to display
 * - addXPEvent: Function to add an XP event
 * - dismissNotification: Function to dismiss a notification
 * - clearAllNotifications: Function to clear all notifications
 */
export function useXPSystem() {
  const [xpData, setXPData] = useLocalStorage<{
    total: number;
    history: { type: string; amount: number; ts: number }[];
  }>("kts_xp_total", { total: 0, history: [] });

  const [earnedBadgeIds, setEarnedBadgeIds] = useLocalStorage<string[]>(
    "kts_earned_badges",
    []
  );

  const [notifications, setNotifications] = useLocalStorage<XPNotification[]>(
    "kts_xp_notifications",
    []
  );

  const [streak] = useLocalStorage<{ count: number }>("kts_streak", {
    count: 0,
  });

  const [dailyCounts, setDailyCounts] = useLocalStorage<DailyCounts>(
    "kts_xp_daily_counts",
    { date: todayKey(), counts: {} }
  );

  const { user, profile } = useAuth();
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track previous rank to detect level-up
  const prevRankRef = useRef<string>(getRankForXP(xpData.total).id);

  // Always-current total XP — used by the debounced server sync so it reads the
  // freshest value at the moment of upload rather than a stale closure value.
  const xpTotalRef = useRef<number>(xpData.total);
  useEffect(() => {
    xpTotalRef.current = xpData.total;
  }, [xpData.total]);

  /**
   * Debounced sync to Supabase user_progress (drives leaderboard).
   *
   * XP RULE (applies site-wide):
   *   server_xp = max(computed_formula_xp, local_total_xp)
   * This guarantees XP NEVER decreases on sync. `computedXP` is the baseline
   * derived from flashcards/exams; `local_total_xp` includes every granular
   * bonus awarded via `awardXP` / `addXP` (e.g. lesson completion, correct
   * answers, streak bonuses, manual rewards).
   */
  const scheduleServerSync = useCallback(() => {
    if (!user) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const flashcardKnown = JSON.parse(localStorage.getItem("kts_flashcard_known") || "{}");
        const examResults = JSON.parse(localStorage.getItem("kts_eps_exam_results") || "[]");
        const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length;
        const validExams = examResults as { score: number; total: number; correctIds?: string[] }[];
        const bestScore = validExams.length > 0
          ? Math.max(...validExams.map(r => Math.round((r.score / r.total) * 100)))
          : 0;
        const avgScore = validExams.length > 0
          ? Math.round(validExams.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / validExams.length)
          : 0;
        const totalCorrect = validExams.reduce((sum, r) => sum + (r.correctIds?.length ?? r.score ?? 0), 0);

        const computedXP = computeXP({
          streakDays: streak.count || 0,
          bestScorePct: bestScore,
          averageScorePct: avgScore,
          wordsLearned,
          totalCorrectAnswers: totalCorrect,
          validExamsCount: validExams.length,
        });
        const level = deriveLevel(bestScore);

        // NEVER decrease: upload the greater of (formula baseline, local total).
        const finalXP = Math.max(computedXP, xpTotalRef.current);

        await supabase.from("user_progress").upsert({
          user_id: user.id,
          xp: finalXP,
          level,
          streak_count: streak.count || 0,
          words_learned: wordsLearned,
          best_score: bestScore,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      } catch {
        // silent fail; will retry on next award
      }
    }, 1500);
  }, [user, streak.count]);

  const addNotification = useCallback(
    (notif: Omit<XPNotification, "id" | "timestamp">) => {
      const newNotif: XPNotification = {
        ...notif,
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    },
    [setNotifications]
  );

  const awardXP = useCallback(
    (event: XPEvent) => {
      const amount = event.amount ?? XP_REWARDS[event.type];
      if (!amount) return;

      // ─── Anti-cheat: daily cap per event type ──────────────────────────
      const today = todayKey();
      const cap = DAILY_EVENT_CAPS[event.type];
      const currentDay = dailyCounts.date === today ? dailyCounts : { date: today, counts: {} as Record<string, number> };
      const used = currentDay.counts[event.type] || 0;
      if (cap !== undefined && used >= cap) {
        // Silently reject — don't spam toast for repeat clicks
        return;
      }
      setDailyCounts({
        date: today,
        counts: { ...currentDay.counts, [event.type]: used + 1 },
      });

      setXPData((prev) => {
        const newTotal = prev.total + amount;
        const oldRank = getRankForXP(prev.total);
        const newRank = getRankForXP(newTotal);

        // Always notify XP gain (small toast, auto-dismiss)
        addNotification({
          type: "xp_gained",
          title: `+${amount} XP`,
          message: getEventLabel(event.type),
          xpAmount: amount,
        });

        // Level up notification (additional)
        if (newRank.id !== oldRank.id) {
          addNotification({
            type: "level_up",
            title: `Lên cấp! ${newRank.name}`,
            message: `Chúc mừng! Bạn đã đạt cấp ${newRank.name} (${newRank.nameKo})`,
            xpAmount: amount,
            rankId: newRank.id,
          });
        }

        return {
          total: newTotal,
          history: [
            { type: event.type, amount, ts: Date.now() },
            ...(prev.history ?? []).slice(0, 99),
          ],
        };
      });

      // Sync to Supabase so leaderboard / profile stats reflect latest XP
      scheduleServerSync();

      // Check new badges
      const newBadges = checkBadges(
        xpData.total + amount,
        streak.count,
        earnedBadgeIds
      );
      if (newBadges.length > 0) {
        setEarnedBadgeIds((prev) => [...prev, ...newBadges]);
        newBadges.forEach((badgeId) => {
          const badge = BADGES.find((b) => b.id === badgeId);
          if (badge) {
            addNotification({
              type: "badge_earned",
              title: `Huy hiệu mới: ${badge.name}`,
              message: badge.condition,
              badgeId,
              xpAmount: badge.xpReward,
            });
            // Also award badge XP
            setXPData((prev) => ({
              ...prev,
              total: prev.total + badge.xpReward,
              history: [
                {
                  type: `badge_${badgeId}`,
                  amount: badge.xpReward,
                  ts: Date.now(),
                },
                ...prev.history.slice(0, 99),
              ],
            }));
          }
        });
      }
    },
    [
      xpData.total,
      streak.count,
      earnedBadgeIds,
      setXPData,
      setEarnedBadgeIds,
      addNotification,
      dailyCounts,
      setDailyCounts,
      scheduleServerSync,
    ]
  );

  const dismissNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotifications]
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const currentRank = getRankForXP(xpData.total);
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1] || null;
  const xpToNext = nextRank ? nextRank.minXP - xpData.total : 0;
  const progress = nextRank
    ? Math.min(
        100,
        ((xpData.total - currentRank.minXP) /
          (nextRank.minXP - currentRank.minXP)) *
          100
      )
    : 100;

  // Update prevRankRef
  useEffect(() => {
    prevRankRef.current = currentRank.id;
  }, [currentRank.id]);

  // Cleanup pending sync on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // ─── Realtime XP listener ────────────────────────────────────────────────
  // Subscribe to user_progress changes for the current user. Server-side
  // triggers (community approval, exam grading, admin grant_xp RPC) update
  // user_progress.xp; we surface those increases as toasts here so the user
  // sees "+N XP" without waiting for next sync round-trip.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user_progress:${user.id}`)
      .on(
        "postgres_changes" as never,
        {
          event: "UPDATE",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: { xp?: number } }) => {
          const newXP = Number(payload?.new?.xp) || 0;
          const local = xpTotalRef.current;
          // Only react to genuine external increases (not echoes of our own sync).
          if (newXP > local) {
            const delta = newXP - local;
            addNotification({
              type: "xp_gained",
              title: `+${delta} XP`,
              message: "Phần thưởng từ hoạt động cộng đồng / admin",
              xpAmount: delta,
            });
            setXPData((prev) => ({
              ...prev,
              total: newXP,
              history: [
                { type: "external_grant", amount: delta, ts: Date.now() },
                ...(prev.history ?? []).slice(0, 99),
              ],
            }));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification, setXPData]);

  // Reference profile so it updates after auth state changes (avoid stale closure)
  void profile;

  return {
    totalXP: xpData.total,
    xpHistory: xpData.history,
    currentRank,
    nextRank,
    xpToNext,
    progress,
    earnedBadgeIds,
    notifications,
    awardXP,
    /**
     * Dual-signature XP awarder used site-wide:
     *   addXP(event: XPEvent)           — typed event (preferred)
     *   addXP(amount: number, reason?)  — generic manual bonus
     *
     * Both paths:
     *   • increment local total (persisted in localStorage)
     *   • push a notification
     *   • debounce-sync to Supabase using the max(formula_xp, local_total) rule
     *     so XP on the server never decreases.
     */
    addXP: ((arg1: XPEvent | number, arg2?: string) => {
      if (typeof arg1 === "number") {
        if (!Number.isFinite(arg1) || arg1 <= 0) return;
        awardXP({
          type: "manual_bonus",
          amount: Math.floor(arg1),
          meta: { reason: arg2 },
        });
      } else {
        awardXP(arg1);
      }
    }) as (arg1: XPEvent | number, arg2?: string) => void,
    dismissNotification,
    clearAllNotifications,
  };
}
