import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  best_score: number;
  streak: number;
  level: string;
}

interface WeeklyReward {
  id: string;
  week_start: string;
  rank: number;
  badge_id: string;
  xp_bonus: number;
  note: string;
  awarded_at: string;
  display_name: string;
  avatar_url: string | null;
  awarded_by_name: string;
}

const BADGE_CONFIG = {
  gold_weekly:   { label: "Vàng", color: "#FFD700", icon: "ri-trophy-fill",  xp: 500 },
  silver_weekly: { label: "Bạc",  color: "#C0C0C0", icon: "ri-medal-fill",   xp: 300 },
  bronze_weekly: { label: "Đồng", color: "#CD7F32", icon: "ri-medal-line",   xp: 200 },
};

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function AdminWeeklyRewardsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<WeeklyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => formatDate(getMonday(new Date())));
  const [customXP, setCustomXP] = useState<Record<string, string>>({});
  const [customNote, setCustomNote] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [lb, hist] = await Promise.all([
      supabase.from("leaderboard").select("*").order("xp", { ascending: false }).limit(20),
      supabase.from("weekly_rewards_summary").select("*").order("week_start", { ascending: false }).limit(50),
    ]);
    setLeaderboard(lb.data || []);
    setHistory(hist.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const awardRank = useCallback(async (userId: string, rank: 1 | 2 | 3) => {
    setAwarding(`${userId}-${rank}`);
    try {
      const { error } = await supabase.rpc("admin_grant_weekly_reward", {
        p_user_id: userId,
        p_rank: rank,
        p_week_start: weekStart,
        p_note: customNote[userId] || null,
      });
      if (error) throw error;
      showToast(`Đã thưởng ${BADGE_CONFIG[rank === 1 ? "gold_weekly" : rank === 2 ? "silver_weekly" : "bronze_weekly"].label} cho user!`);
      fetchData();
    } catch (e: any) {
      showToast(e.message || "Lỗi không xác định", "error");
    } finally {
      setAwarding(null);
    }
  }, [weekStart, customNote, fetchData]);

  const awardCustomXP = useCallback(async (userId: string) => {
    const amount = parseInt(customXP[userId] || "0");
    if (!amount || amount <= 0) return showToast("Nhập số XP hợp lệ", "error");
    const note = customNote[userId] || "Thưởng XP admin";
    setAwarding(`xp-${userId}`);
    try {
      const { error } = await supabase.rpc("admin_grant_xp", {
        p_user_id: userId,
        p_amount: amount,
        p_reason: note,
      });
      if (error) throw error;
      showToast(`Đã thưởng ${amount} XP!`);
      setCustomXP(p => ({ ...p, [userId]: "" }));
      fetchData();
    } catch (e: any) {
      showToast(e.message || "Lỗi", "error");
    } finally {
      setAwarding(null);
    }
  }, [customXP, customNote, fetchData]);

  if (!profile?.is_admin) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-app-text-secondary">Chỉ admin mới truy cập được trang này.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-app-text-secondary hover:text-white transition-colors">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <div>
            <h1 className="text-white font-bold text-2xl">Thưởng tuần</h1>
            <p className="text-app-text-secondary text-sm">Trao huy hiệu + XP cho top người dùng hàng tuần</p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl font-semibold text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        )}

        {/* Week selector */}
        <div className="bg-app-surface border border-app-border rounded-2xl p-4 mb-6">
          <label className="text-white/70 text-sm font-semibold mb-2 block">Chọn tuần thưởng (ngày thứ 2):</label>
          <input
            type="date"
            value={weekStart}
            onChange={e => setWeekStart(e.target.value)}
            className="bg-app-bg border border-app-border rounded-xl px-4 py-2 text-white text-sm w-full max-w-xs focus:outline-none focus:border-app-accent-primary"
          />
        </div>

        {/* Reward badges info */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {([["gold_weekly", 1], ["silver_weekly", 2], ["bronze_weekly", 3]] as const).map(([key, rank]) => {
            const cfg = BADGE_CONFIG[key];
            return (
              <div key={key} className="bg-app-surface border border-app-border rounded-2xl p-4 text-center">
                <i className={`${cfg.icon} text-3xl mb-2`} style={{ color: cfg.color }}></i>
                <p className="text-white font-bold text-sm">Top {rank} — Huy hiệu {cfg.label}</p>
                <p className="text-app-accent-primary text-xs font-semibold mt-1">+{cfg.xp} XP</p>
              </div>
            );
          })}
        </div>

        {/* Leaderboard + award buttons */}
        <div className="bg-app-surface border border-app-border rounded-2xl overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-app-border">
            <h2 className="text-white font-bold">Top 20 bảng xếp hạng</h2>
            <p className="text-app-text-secondary text-xs mt-0.5">Chọn huy hiệu hoặc nhập XP để thưởng</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-app-text-secondary text-sm">Đang tải...</div>
          ) : (
            <div className="divide-y divide-app-border">
              {leaderboard.map((entry, idx) => (
                <div key={entry.user_id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Rank */}
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${
                      idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      idx === 1 ? "bg-gray-400/20 text-gray-300" :
                      idx === 2 ? "bg-orange-700/20 text-orange-400" :
                      "bg-app-bg text-app-text-secondary"
                    }`}>
                      {idx + 1}
                    </span>
                    {/* Avatar */}
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-app-accent-primary/20 flex items-center justify-center flex-shrink-0">
                        <i className="ri-user-line text-app-accent-primary text-sm"></i>
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{entry.display_name}</p>
                      <p className="text-app-text-secondary text-xs">{entry.xp} XP · {entry.level}</p>
                    </div>
                  </div>

                  {/* Award buttons — chỉ top 3 */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {([1, 2, 3] as const).filter(r => r === idx + 1).map(rank => {
                      const cfg = BADGE_CONFIG[rank === 1 ? "gold_weekly" : rank === 2 ? "silver_weekly" : "bronze_weekly"];
                      const key = `${entry.user_id}-${rank}`;
                      return (
                        <button
                          key={rank}
                          onClick={() => awardRank(entry.user_id, rank)}
                          disabled={awarding === key}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-50"
                          style={{ background: cfg.color + "20", color: cfg.color, border: `1px solid ${cfg.color}40` }}
                        >
                          <i className={cfg.icon}></i>
                          {awarding === key ? "Đang thưởng..." : `Trao huy hiệu ${cfg.label} (+${cfg.xp} XP)`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom XP + note */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="XP tự do"
                      value={customXP[entry.user_id] || ""}
                      onChange={e => setCustomXP(p => ({ ...p, [entry.user_id]: e.target.value }))}
                      className="bg-app-bg border border-app-border rounded-lg px-3 py-1.5 text-white text-xs w-24 focus:outline-none focus:border-app-accent-primary"
                    />
                    <input
                      type="text"
                      placeholder="Lý do..."
                      value={customNote[entry.user_id] || ""}
                      onChange={e => setCustomNote(p => ({ ...p, [entry.user_id]: e.target.value }))}
                      className="bg-app-bg border border-app-border rounded-lg px-3 py-1.5 text-white text-xs flex-1 focus:outline-none focus:border-app-accent-primary"
                    />
                    <button
                      onClick={() => awardCustomXP(entry.user_id)}
                      disabled={awarding === `xp-${entry.user_id}`}
                      className="px-3 py-1.5 bg-app-accent-primary text-black text-xs font-bold rounded-lg hover:bg-[#d4b43a] transition-colors disabled:opacity-50"
                    >
                      {awarding === `xp-${entry.user_id}` ? "..." : "Thưởng XP"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-app-surface border border-app-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-app-border">
            <h2 className="text-white font-bold">Lịch sử thưởng tuần</h2>
          </div>
          {history.length === 0 ? (
            <div className="p-8 text-center text-app-text-secondary text-sm">Chưa có lịch sử thưởng.</div>
          ) : (
            <div className="divide-y divide-app-border">
              {history.map(h => {
                const cfg = BADGE_CONFIG[h.badge_id as keyof typeof BADGE_CONFIG];
                return (
                  <div key={h.id} className="flex items-center gap-3 px-5 py-3">
                    <i className={`${cfg?.icon || "ri-gift-line"} text-xl`} style={{ color: cfg?.color || "#aaa" }}></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{h.display_name}</p>
                      <p className="text-app-text-secondary text-xs">
                        Tuần {h.week_start} · Top {h.rank} · +{h.xp_bonus} XP
                        {h.note && ` · "${h.note}"`}
                      </p>
                    </div>
                    <span className="text-app-text-secondary text-xs whitespace-nowrap">
                      {new Date(h.awarded_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
