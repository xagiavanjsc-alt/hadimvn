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

const AVATAR_COLORS = ["#e8c84a", "#34d399", "#fb923c", "#f472b6", "#38bdf8", "#a78bfa", "#f87171", "#06b6d4"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Vừa xong";
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return `${Math.floor(d / 7)} tuần trước`;
}

function StreakFlame({ count }: { count: number }) {
  const size = count >= 30 ? "text-2xl" : count >= 7 ? "text-xl" : "text-base";
  const color = count >= 30 ? "#ef4444" : count >= 14 ? "#fb923c" : count >= 7 ? "#e8c84a" : "#94a3b8";
  return (
    <div className="flex items-center gap-1">
      <i className={`ri-fire-fill ${size}`} style={{ color }}></i>
      <span className="font-black text-white" style={{ fontSize: count >= 30 ? "1.25rem" : "1rem" }}>{count}</span>
    </div>
  );
}

// ─── Mock leaderboard data ────────────────────────────────────────────────────
const MOCK_FRIENDS: FriendStreak[] = [
  { id: "m1", display_name: "Nguyễn Thị Lan", streak_count: 47, last_active: new Date(Date.now() - 3600000).toISOString(), total_xp: 12400, avatar_color: "#e8c84a" },
  { id: "m2", display_name: "Trần Văn Minh", streak_count: 32, last_active: new Date(Date.now() - 7200000).toISOString(), total_xp: 8900, avatar_color: "#34d399" },
  { id: "m3", display_name: "Lê Thị Hoa", streak_count: 28, last_active: new Date(Date.now() - 86400000).toISOString(), total_xp: 7200, avatar_color: "#f472b6" },
  { id: "m4", display_name: "Phạm Quốc Hùng", streak_count: 21, last_active: new Date(Date.now() - 43200000).toISOString(), total_xp: 5600, avatar_color: "#fb923c" },
  { id: "m5", display_name: "Hoàng Thị Mai", streak_count: 15, last_active: new Date(Date.now() - 172800000).toISOString(), total_xp: 4100, avatar_color: "#38bdf8" },
  { id: "m6", display_name: "Vũ Đức Thắng", streak_count: 12, last_active: new Date(Date.now() - 259200000).toISOString(), total_xp: 3200, avatar_color: "#a78bfa" },
  { id: "m7", display_name: "Đặng Thị Thu", streak_count: 8, last_active: new Date(Date.now() - 86400000).toISOString(), total_xp: 2100, avatar_color: "#f87171" },
  { id: "m8", display_name: "Bùi Văn Nam", streak_count: 5, last_active: new Date(Date.now() - 432000000).toISOString(), total_xp: 1400, avatar_color: "#06b6d4" },
  { id: "m9", display_name: "Ngô Thị Linh", streak_count: 3, last_active: new Date(Date.now() - 604800000).toISOString(), total_xp: 800, avatar_color: "#e8c84a" },
  { id: "m10", display_name: "Đinh Văn Tú", streak_count: 1, last_active: new Date(Date.now() - 86400000).toISOString(), total_xp: 300, avatar_color: "#34d399" },
];

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
      const { data } = await supabase
        .from("leaderboard_snapshots")
        .select("user_id, display_name, streak_count, total_xp, updated_at")
        .order("streak_count", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const mapped: FriendStreak[] = data.map((d: { user_id: string; display_name: string; streak_count: number; total_xp: number; updated_at: string }) => ({
          id: d.user_id,
          display_name: d.display_name || "Học viên",
          streak_count: d.streak_count || 0,
          last_active: d.updated_at,
          total_xp: d.total_xp || 0,
          avatar_color: getAvatarColor(d.display_name || ""),
        }));
        setLeaderboard(mapped);
      } else {
        setLeaderboard(MOCK_FRIENDS);
      }
    } catch {
      setLeaderboard(MOCK_FRIENDS);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const sorted = [...leaderboard].sort((a, b) =>
    tab === "streak" ? b.streak_count - a.streak_count : b.total_xp - a.total_xp
  );

  const myRank = sorted.findIndex(f => f.id === user?.id) + 1;

  const shareChallenge = () => {
    const text = `Tôi đang có streak ${myStreak.count} ngày học tiếng Hàn liên tiếp trên Hàn Quốc Ơi! Bạn có dám thách đấu không? 🔥`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout
      title="Streak Bạn Bè"
      subtitle="Xem streak của cộng đồng — cạnh tranh duy trì streak dài nhất"
      actions={
        <button onClick={shareChallenge}
          className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap font-bold ${copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117]"}`}>
          <i className={copied ? "ri-check-line" : "ri-share-line"}></i>
          {copied ? "Đã copy!" : "Thách đấu bạn bè"}
        </button>
      }
    >
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Main leaderboard */}
        <div>
          {/* My stats card */}
          <div className="bg-gradient-to-r from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/20 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e8c84a]/15 flex items-center justify-center flex-shrink-0">
                <i className="ri-fire-fill text-[#e8c84a] text-2xl"></i>
              </div>
              <div className="flex-1">
                <p className="text-white/40 text-xs mb-1">Streak của bạn</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-black text-3xl">{myStreak.count}</span>
                  <span className="text-white/40 text-sm">ngày liên tiếp</span>
                </div>
                {myRank > 0 && (
                  <p className="text-[#e8c84a]/70 text-xs mt-1">Hạng #{myRank} trong cộng đồng</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs mb-1">Tổng XP</p>
                <p className="text-white font-bold text-xl">{(myXP.total || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tab */}
          <div className="flex items-center gap-1 bg-white/3 p-1 rounded-lg mb-4 w-fit">
            {([["streak", "ri-fire-line", "Streak"], ["xp", "ri-star-line", "XP"]] as const).map(([t, icon, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
                <i className={icon}></i>{label}
              </button>
            ))}
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
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
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isMe ? "bg-[#e8c84a]/5 border-[#e8c84a]/20" : "bg-[#0f1117] border-white/5 hover:border-white/10"}`}>
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {rank <= 3 ? (
                        <i className="ri-trophy-fill text-lg" style={{ color: rankColor }}></i>
                      ) : (
                        <span className="text-white/30 text-sm font-bold">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ backgroundColor: `${friend.avatar_color}20`, color: friend.avatar_color }}>
                      {friend.display_name.charAt(0).to()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isMe ? "text-[#e8c84a]" : "text-white/80"}`}>
                          {friend.display_name}
                          {isMe && <span className="text-[10px] ml-1 text-[#e8c84a]/60">(bạn)</span>}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-white/25 text-[10px]">{timeAgo(friend.last_active)}</p>
                    </div>

                    {/* Streak / XP */}
                    <div className="text-right flex-shrink-0">
                      {tab === "streak" ? (
                        <StreakFlame count={friend.streak_count} />
                      ) : (
                        <div>
                          <p className="text-white font-bold text-base">{friend.total_xp.toLocaleString()}</p>
                          <p className="text-white/30 text-[10px]">XP</p>
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
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Cột mốc Streak</h3>
            <div className="space-y-3">
              {[
                { days: 3, icon: "ri-seedling-line", color: "#34d399", label: "Khởi đầu", desc: "3 ngày liên tiếp" },
                { days: 7, icon: "ri-fire-line", color: "#e8c84a", label: "Tuần đầu", desc: "7 ngày liên tiếp" },
                { days: 14, icon: "ri-fire-fill", color: "#fb923c", label: "Hai tuần", desc: "14 ngày liên tiếp" },
                { days: 30, icon: "ri-fire-fill", color: "#ef4444", label: "Một tháng", desc: "30 ngày liên tiếp" },
                { days: 100, icon: "ri-vip-crown-fill", color: "#FFD700", label: "Huyền thoại", desc: "100 ngày liên tiếp" },
              ].map(m => {
                const achieved = myStreak.count >= m.days;
                return (
                  <div key={m.days} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${achieved ? "bg-white/3" : "opacity-40"}`}>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                      <i className={`${m.icon} text-sm`} style={{ color: m.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-semibold">{m.label}</p>
                      <p className="text-white/30 text-[10px]">{m.desc}</p>
                    </div>
                    {achieved && <i className="ri-check-line text-emerald-400 text-sm flex-shrink-0"></i>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-[#e8c84a] text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Mẹo duy trì streak</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Học ít nhất 10 phút mỗi ngày",
                "Đặt giờ học cố định",
                "Bật thông báo nhắc nhở",
                "Học flashcard trước khi ngủ",
                "Tham gia thử thách tuần",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-white/50 text-xs">
                  <i className="ri-checkbox-circle-line text-[#e8c84a]/60 text-sm flex-shrink-0 mt-0.5"></i>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats summary */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Thống kê cộng đồng</h3>
            <div className="space-y-2.5">
              {[
                { icon: "ri-group-line", label: "Đang học", value: `${leaderboard.length}+ người`, color: "#e8c84a" },
                { icon: "ri-fire-line", label: "Streak TB", value: `${Math.round(leaderboard.reduce((s, f) => s + f.streak_count, 0) / Math.max(leaderboard.length, 1))} ngày`, color: "#fb923c" },
                { icon: "ri-trophy-line", label: "Streak cao nhất", value: `${Math.max(...leaderboard.map(f => f.streak_count), 0)} ngày`, color: "#FFD700" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/30 text-[10px]">{s.label}</p>
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
