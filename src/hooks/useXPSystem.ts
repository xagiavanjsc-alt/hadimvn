import { useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RANKS, BADGES } from "@/data/ranks";

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
    | "topic_drill_completed";
  amount?: number; // override default XP
  meta?: Record<string, unknown>;
}

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
};

function getRankForXP(xp: number) {
  return (
    [...RANKS].reverse().find((r) => xp >= r.minXP) || RANKS[0]
  );
}

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

  // Track previous rank to detect level-up
  const prevRankRef = useRef<string>(getRankForXP(xpData.total).id);

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

      setXPData((prev) => {
        const newTotal = prev.total + amount;
        const oldRank = getRankForXP(prev.total);
        const newRank = getRankForXP(newTotal);

        // Level up notification
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
            ...prev.history.slice(0, 99),
          ],
        };
      });

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
    dismissNotification,
    clearAllNotifications,
  };
}
