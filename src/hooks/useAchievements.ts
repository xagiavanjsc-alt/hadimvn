import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  badge_url?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("achievements")
        .select("*")
        .order("condition_value");

      if (achievementsError) throw achievementsError;

      // Fetch user achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)");

      if (userAchievementsError) throw userAchievementsError;

      setAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);
    } catch (err: any) {
      console.error("Error fetching achievements:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async () => {
    try {
      const { data, error } = await supabase.rpc("check_and_award_achievements", {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      // Refetch achievements after awarding
      if (data && data.length > 0) {
        await fetchAchievements();
        return data; // Return newly awarded achievements
      }

      return [];
    } catch (err: any) {
      console.error("Error awarding achievements:", err);
      return [];
    }
  };

  const getUnlockedAchievements = () => {
    return userAchievements.map((ua) => ua.achievement);
  };

  const getLockedAchievements = () => {
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
    return achievements.filter((a) => !unlockedIds.has(a.id));
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter((a) => a.category === category);
  };

  const getUnlockedCount = () => userAchievements.length;
  const getTotalCount = () => achievements.length;
  const getProgress = () => (getUnlockedCount() / getTotalCount()) * 100;

  return {
    achievements,
    userAchievements,
    loading,
    error,
    fetchAchievements,
    checkAndAwardAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByCategory,
    getUnlockedCount,
    getTotalCount,
    getProgress,
  };
}
