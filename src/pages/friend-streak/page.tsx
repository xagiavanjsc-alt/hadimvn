import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface FriendStreak {
  id: string;
  display_name: string;
  streak_count: number;
  last_active: string;
  total_xp: number;
  avatar_color: string;
}

const AVATAR_COLORS = ["app-accent-primary", "#34d399", "#fb923c", "#f472b6", "#38bdf8", "#a78bfa", "#f87171", "#06b6d4"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "V?a xong";
  if (h < 24) return `${h} gi? tru?c`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày tru?c`;
  return `${Math.floor(d / 7)} tu?n tru?c`;
}

function StreakFlame({ count }: { count: number }) {
  const size = count >= 30 ? "text-2xl" : count >= 7 ? "text-xl" : "text-base";
  const color = count >= 30 ? "#ef4444" : count >= 14 ? "#fb923c" : count >= 7 ? "app-accent-primary" : "#94a3b8";
  return (
    <div className="flex items-center gap-1">
      <i className={`ri-fire-fill ${size}`} style={{ color }}></i>
      <span className="font-black text-white" style={{ fontSize: count >= 30 ? "1.25rem" : "1rem" }}>{count}</span>
    </div>
  );
}

// Leaderboard data fetched from Supabase (không còn mock)

export default function FriendStreakPage() {
  const { user } = useAuth();
  const [myStreak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [myXP] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const [leaderboard, setLeaderboard] = useState<FriendStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"streak" | "xp">("streak");
  const [copied, setCopied] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // leaderboard: user_id, streak, total_xp, last_activity
      const { data: lbRows } = await supabase
        .from("leaderboard")
        .select("user_id, streak, total_xp, last_activity")
        .order("streak", { ascending: false })
        .limit(50);

      if (!lbRows || lbRows.length === 0) {
        setLeaderboard([]);
        return;
      }

      const userIds = lbRows.map((r: { user_id: string }) => r.user_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, display_name")
        .in("id", userIds);

      const nameMap = Object.fromEntries(
        (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name || "H?c viên"])
      );

      const mapped: FriendStreak[] = lbRows.map((d: { user_id: string; streak: number; total_xp: number; last_activity: string }) => {
        const name = nameMap[d.user_id] || "H?c viên";
        return {
          id: d.user_id,
          display_name: name,
          streak_count: d.streak || 0,
          last_active: d.last_activity || new Date().toISOString(),
          total_xp: d.total_xp || 0,
          avatar_color: getAvatarColor(name),
        };
      });
      setLeaderboard(mapped);
    } catch {
      setLeaderboard([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const sorted = [...leaderboard].sort((a, b) =>
    tab === "streak" ? b.streak_count - a.streak_count : b.total_xp - a.total_xp
  );

  const myRank = sorted.findIndex(f => f.id === user?.id) + 1;

  const shareChallenge = () => {
    const text = `Tôi dang có streak ${myStreak.count} ngày h?c ti?ng Hàn liên ti?p trên Hàn Qu?c Oi! B?n có dám thách d?u không? ??`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout
      title="Streak B?n Bè"
      subtitle="Xem streak c?a c?ng d?ng — c?nh tranh duy trì streak dài nh?t"
      actions={
        <button onClick={shareChallenge}
          className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap font-bold ${copied ? "bg-emerald-500/20 text-app-accent-success border border-emerald-500/30" : "bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg"}`}>
          <i className={copied ? "ri-check-line" : "ri-share-line"}></i>
          {copied ? "Ðã copy!" : "Thách d?u b?n bè"}
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main leaderboard */}
        <div>
          {/* My stats card */}
          <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0">
                <i className="ri-fire-fill text-app-accent-primary text-2xl"></i>
              </div>
              <div className="flex-1">
                <p className="text-app-text-secondary text-xs mb-1">Streak c?a b?n</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-black text-3xl">{myStreak.count}</span>
                  <span className="text-app-text-secondary text-sm">ngày liên ti?p</span>
                </div>
                {myRank > 0 && (
                  <p className="text-app-accent-primary/70 text-xs mt-1">H?ng #{myRank} trong c?ng d?ng</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-app-text-secondary text-xs mb-1">T?ng XP</p>
                <p className="text-white font-bold text-xl">{(myXP.total || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tab */}
          <div className="flex items-center gap-1 bg-app-surface/50 p-1 rounded-lg mb-4 w-fit">
            {([["streak", "ri-fire-line", "Streak"], ["xp", "ri-star-line", "XP"]] as const).map(([t, icon, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${tab === t ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
                <i className={icon}></i>{label}
              </button>
            ))}
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <i className="ri-fire-line text-white/15 text-4xl mb-3 block"></i>
              <p className="text-app-text-secondary text-sm">Chua có d? li?u streak c?ng d?ng</p>
              <p className="text-app-text-muted text-xs mt-1">Hãy h?c m?i ngày d? có m?t trên b?ng x?p h?ng!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((friend, idx) => {
                const isMe = friend.id === user?.id;
                const rank = idx + 1;
                const rankColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : undefined;
                const isActive = Date.now() - new Date(friend.last_active).getTime() < 86400000;

                return (
                  <div key={friend.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isMe ? "bg-app-accent-primary/5 border-app-accent-primary/20" : "bg-app-bg border-app-border hover:border-app-border"}`}>
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {rank <= 3 ? (
                        <i className="ri-trophy-fill text-lg" style={{ color: rankColor }}></i>
                      ) : (
                        <span className="text-app-text-muted text-sm font-bold">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ backgroundColor: `${friend.avatar_color}20`, color: friend.avatar_color }}>
                      {friend.display_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isMe ? "text-app-accent-primary" : "text-white/80"}`}>
                          {friend.display_name}
                          {isMe && <span className="text-[10px] ml-1 text-app-accent-primary/60">(b?n)</span>}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-app-text-muted text-[10px]">{timeAgo(friend.last_active)}</p>
                    </div>

                    {/* Streak / XP */}
                    <div className="text-right flex-shrink-0">
                      {tab === "streak" ? (
                        <StreakFlame count={friend.streak_count} />
                      ) : (
                        <div>
                          <p className="text-white font-bold text-base">{friend.total_xp.toLocaleString()}</p>
                          <p className="text-app-text-muted text-[10px]">XP</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Streak milestones */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">C?t m?c Streak</h3>
            <div className="space-y-3">
              {[
                { days: 3, icon: "ri-seedling-line", color: "#34d399", label: "Kh?i d?u", desc: "3 ngày liên ti?p" },
                { days: 7, icon: "ri-fire-line", color: "app-accent-primary", label: "Tu?n d?u", desc: "7 ngày liên ti?p" },
                { days: 14, icon: "ri-fire-fill", color: "#fb923c", label: "Hai tu?n", desc: "14 ngày liên ti?p" },
                { days: 30, icon: "ri-fire-fill", color: "#ef4444", label: "M?t tháng", desc: "30 ngày liên ti?p" },
                { days: 100, icon: "ri-vip-crown-fill", color: "#FFD700", label: "Huy?n tho?i", desc: "100 ngày liên ti?p" },
              ].map(m => {
                const achieved = myStreak.count >= m.days;
                return (
                  <div key={m.days} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${achieved ? "bg-app-surface/50" : "opacity-40"}`}>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                      <i className={`${m.icon} text-sm`} style={{ color: m.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-semibold">{m.label}</p>
                      <p className="text-app-text-muted text-[10px]">{m.desc}</p>
                    </div>
                    {achieved && <i className="ri-check-line text-app-accent-success text-sm flex-shrink-0"></i>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
              <h3 className="text-white font-semibold text-sm">M?o duy trì streak</h3>
            </div>
            <ul className="space-y-2">
              {[
                "H?c ít nh?t 10 phút m?i ngày",
                "Ð?t gi? h?c c? d?nh",
                "B?t thông báo nh?c nh?",
                "H?c flashcard tru?c khi ng?",
                "Tham gia th? thách tu?n",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-white/50 text-xs">
                  <i className="ri-checkbox-circle-line text-app-accent-primary/60 text-sm flex-shrink-0 mt-0.5"></i>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats summary */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Th?ng kê c?ng d?ng</h3>
            <div className="space-y-2.5">
              {[
                { icon: "ri-group-line", label: "Ðang h?c", value: `${leaderboard.length}+ ngu?i`, color: "app-accent-primary" },
                { icon: "ri-fire-line", label: "Streak TB", value: `${Math.round(leaderboard.reduce((s, f) => s + f.streak_count, 0) / Math.max(leaderboard.length, 1))} ngày`, color: "#fb923c" },
                { icon: "ri-trophy-line", label: "Streak cao nh?t", value: `${Math.max(...leaderboard.map(f => f.streak_count), 0)} ngày`, color: "#FFD700" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text-muted text-[10px]">{s.label}</p>
                    <p className="text-white font-bold text-sm">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

