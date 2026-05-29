import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  streak: number;
  best_score: number;
  words_learned: number;
  level: string;
  is_vip: boolean;
  vip_expires_at: string | null;
  updated_at: string;
}

export function useRealtimeLeaderboard(limit = 50) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial fetch
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("xp", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else if (mounted) {
        setLeaderboard(data || []);
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to realtime updates (skip if WebSocket not available)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("leaderboard-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "leaderboard",
          },
          (payload) => {
            if (!mounted) return;

            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newEntry = payload.new as LeaderboardEntry;
              // Defensive: a future schema change that drops/renames `xp`
              // would otherwise produce NaN ordering and break the UI.
              if (typeof newEntry?.xp !== "number" || !newEntry?.user_id) return;
              setLeaderboard((prev) => {
                const filtered = prev.filter((e) => e.user_id !== newEntry.user_id);
                return [...filtered, newEntry].sort((a, b) => b.xp - a.xp).slice(0, limit);
              });
            } else if (payload.eventType === "DELETE") {
              const deletedId = payload.old.user_id;
              setLeaderboard((prev) => prev.filter((e) => e.user_id !== deletedId));
            }
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn("[Leaderboard] Realtime error (non-fatal):", err.message);
        });
    } catch (e) {
      console.warn("[Leaderboard] WebSocket not available, realtime disabled:", e);
    }

    return () => {
      mounted = false;
      try {
        if (channel) supabase.removeChannel(channel);
      } catch {}
    };
  }, [limit]);

  return { leaderboard, loading };
}
