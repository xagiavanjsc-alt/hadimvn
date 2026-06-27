import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
}

export function useGamification() {
  const [xp, setXp] = useLocalStorage<number>("user_xp", 0);
  const [streak, setStreak] = useLocalStorage<number>("user_streak", 0);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage<string>("last_active_date", "");
  const [achievements, setAchievements] = useLocalStorage<Record<string, Achievement>>("user_achievements", {});
  const [leaderboard, setLeaderboard] = useLocalStorage<LeaderboardEntry[]>("leaderboard", []);

  // Check and update streak
  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActiveDate === today) {
      // Already active today, no change
      return;
    }

    if (lastActiveDate === yesterday) {
      // Active yesterday, increment streak
      setStreak(s => s + 1);
    } else if (lastActiveDate !== today) {
      // Missed a day or first time, reset to 1
      setStreak(1);
    }

    setLastActiveDate(today);
  }, [lastActiveDate, setLastActiveDate, setStreak]);

  const addXP = useCallback((amount: number) => {
    setXp(prev => prev + amount);
    checkAchievements();
  }, [setXp]);

  const checkAchievements = useCallback(() => {
    const newAchievements = { ...achievements };
    let updated = false;

    // XP achievements
    if (xp >= 100 && !achievements["xp_100"]) {
      newAchievements["xp_100"] = {
        id: "xp_100",
        title: "Người mới bắt đầu",
        description: "Đạt 100 XP",
        icon: "ri-seedling-line",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      updated = true;
    }

    if (xp >= 500 && !achievements["xp_500"]) {
      newAchievements["xp_500"] = {
        id: "xp_500",
        title: "Học chăm chỉ",
        description: "Đạt 500 XP",
        icon: "ri-fire-line",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      updated = true;
    }

    if (xp >= 1000 && !achievements["xp_1000"]) {
      newAchievements["xp_1000"] = {
        id: "xp_1000",
        title: "Bậc thầy học tập",
        description: "Đạt 1000 XP",
        icon: "ri-trophy-line",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      updated = true;
    }

    // Streak achievements
    if (streak >= 3 && !achievements["streak_3"]) {
      newAchievements["streak_3"] = {
        id: "streak_3",
        title: "3 ngày liên tiếp",
        description: "Học 3 ngày liên tiếp",
        icon: "ri-calendar-check-line",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      updated = true;
    }

    if (streak >= 7 && !achievements["streak_7"]) {
      newAchievements["streak_7"] = {
        id: "streak_7",
        title: "Tuần học tập",
        description: "Học 7 ngày liên tiếp",
        icon: "ri-calendar-todo-line",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      updated = true;
    }

    if (streak >= 30 && !achievements["streak_30"]) {
      newAchievements["streak_30"] = {
        id: "streak_30",
        title: "Tháng học tập",
        description: "Học 30 ngày liên tiếp",
        icon: "ri-calendar-2-line",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      updated = true;
    }

    if (updated) {
      setAchievements(newAchievements);
    }
  }, [xp, streak, achievements, setAchievements]);

  const getLevel = useCallback(() => {
    // Level formula: level = sqrt(xp / 100)
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }, [xp]);

  const getXPForNextLevel = useCallback(() => {
    const level = getLevel();
    return level * level * 100;
  }, [getLevel]);

  const getXPProgress = useCallback(() => {
    const level = getLevel();
    const currentLevelXP = (level - 1) * (level - 1) * 100;
    const nextLevelXP = level * level * 100;
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  }, [xp, getLevel]);

  const updateLeaderboard = useCallback((name: string) => {
    setLeaderboard(prev => {
      const existingIndex = prev.findIndex(entry => entry.id === "user");
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], name, xp, streak };
        return updated.sort((a, b) => b.xp - a.xp);
      }
      return [...prev, { id: "user", name, xp, streak }].sort((a, b) => b.xp - a.xp);
    });
  }, [xp, streak, setLeaderboard]);

  const resetGamification = useCallback(() => {
    setXp(0);
    setStreak(0);
    setLastActiveDate("");
    setAchievements({});
  }, [setXp, setStreak, setLastActiveDate, setAchievements]);

  return {
    xp,
    streak,
    achievements,
    leaderboard,
    addXP,
    getLevel,
    getXPForNextLevel,
    getXPProgress,
    updateLeaderboard,
    resetGamification,
  };
}
