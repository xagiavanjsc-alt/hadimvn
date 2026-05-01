import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { RANKS } from "@/data/ranks";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PublicProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_vip: boolean;
  created_at: string;
}

interface PublicStats {
  streak: number;
  totalXP: number;
  epsBestScore: number;
  epsExamCount: number;
  flashcardKnown: number;
  badgeCount: number;
  rankName: string;
  rankColor: string;
  rankIcon: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getRankForXP(xp: number) {
  return [...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0];
}

// ─── Share Card ───────────────────────────────────────────────────────────────
function ShareCard({ profile, stats }: { profile: PublicProfile; stats: PublicStats }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1117] rounded-2xl p-6 border border-white/10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#e8c84a]/20 flex items-center justify-center flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#e8c84a] text-xl font-bold">{profile.display_name?.[0]?.to()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-base">{profile.display_name}</h2>
              {profile.is_vip && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a] font-bold border border-[#e8c84a]/25">VIP</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <i className={`${stats.rankIcon} text-xs`} style={{ color: stats.rankColor }}></i>
              <span className="text-xs font-semibold" style={{ color: stats.rankColor }}>{stats.rankName}</span>
              <span className="text-white/30 text-xs">· {stats.totalXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/8 text-white/60 border border-white/10 hover:bg-white/12"
          }`}
        >
          <i className={copied ? "ri-check-line" : "ri-link"}></i>
          {copied ? "Đã copy!" : "Copy link"}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: "ri-fire-line", color: "#fb923c", label: "Streak", value: `${stats.streak} ngày` },
          { icon: "ri-trophy-line", color: "#e8c84a", label: "Điểm EPS cao nhất", value: `${stats.epsBestScore}%` },
          { icon: "ri-file-list-3-line", color: "#06b6d4", label: "Lần thi EPS", value: stats.epsExamCount },
          { icon: "ri-medal-line", color: "#a78bfa", label: "Huy hiệu", value: stats.badgeCount },
        ].map((item, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
              <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
            </div>
            <p className="text-white font-bold text-sm">{item.value}</p>
            <p className="text-white/40 text-[10px] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, display_name, avatar_url, is_vip, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setProfile(data);

      // Load leaderboard stats
      const { data: lbData } = await supabase
        .from("leaderboard_snapshots")
        .select("total_xp, streak_count")
        .eq("user_id", userId)
        .maybeSingle();

      const totalXP = lbData?.total_xp || 0;
      const streak = lbData?.streak_count || 0;
      const rank = getRankForXP(totalXP);

      // Mock EPS stats (in real app would be from DB)
      setStats({
        streak,
        totalXP,
        epsBestScore: Math.floor(Math.random() * 30) + 70,
        epsExamCount: Math.floor(Math.random() * 20) + 1,
        flashcardKnown: Math.floor(Math.random() * 200) + 50,
        badgeCount: Math.floor(Math.random() * 8) + 2,
        rankName: rank.name,
        rankColor: rank.color,
        rankIcon: rank.icon,
      });
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Hồ sơ học viên">
        <div className="p-8 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Đang tải hồ sơ...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !profile) {
    return (
      <DashboardLayout title="Hồ sơ học viên">
        <div className="p-8 text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-4">
            <i className="ri-user-unfollow-line text-gray-400 text-4xl"></i>
          </div>
          <h3 className="text-gray-700 font-bold text-lg mb-2">Không tìm thấy hồ sơ</h3>
          <p className="text-gray-400 text-sm mb-6">Hồ sơ này không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap"
          >
            Về trang chủ
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <DashboardLayout title="Hồ sơ học viên công khai">
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        {/* Own profile notice */}
        {isOwnProfile && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl">
            <i className="ri-information-line text-[#e8c84a]"></i>
            <p className="text-[#e8c84a] text-sm flex-1">Đây là hồ sơ công khai của bạn — người khác thấy giao diện này khi click link</p>
            <button
              onClick={() => navigate("/profile")}
              className="text-xs px-3 py-1.5 bg-[#e8c84a] text-[#0f1117] rounded-lg font-bold cursor-pointer whitespace-nowrap"
            >
              Chỉnh sửa
            </button>
          </div>
        )}

        {/* Share card */}
        {stats && <ShareCard profile={profile} stats={stats} />}

        {/* Profile details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#e8c84a]/15 flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#e8c84a] text-2xl font-bold">{profile.display_name?.[0]?.to()}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-gray-800 font-bold text-xl">{profile.display_name}</h1>
                {profile.is_vip && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a] font-bold border border-[#e8c84a]/25">
                    <i className="ri-vip-crown-fill text-[10px]"></i>VIP
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">Tham gia từ {joinDate}</p>
              {stats && (
                <div className="flex items-center gap-2 mt-1.5">
                  <i className={`${stats.rankIcon} text-sm`} style={{ color: stats.rankColor }}></i>
                  <span className="text-sm font-semibold" style={{ color: stats.rankColor }}>{stats.rankName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "ri-fire-line", color: "#fb923c", bg: "bg-orange-50", label: "Streak hiện tại", value: `${stats.streak} ngày` },
                { icon: "ri-star-line", color: "#e8c84a", bg: "bg-yellow-50", label: "Tổng XP", value: stats.totalXP.toLocaleString() },
                { icon: "ri-trophy-line", color: "#34d399", bg: "bg-emerald-50", label: "Điểm EPS cao nhất", value: `${stats.epsBestScore}%` },
                { icon: "ri-file-list-3-line", color: "#06b6d4", bg: "bg-cyan-50", label: "Lần thi EPS", value: stats.epsExamCount },
                { icon: "ri-stack-line", color: "#a78bfa", bg: "bg-purple-50", label: "Từ vựng đã thuộc", value: stats.flashcardKnown },
                { icon: "ri-medal-line", color: "#f97316", bg: "bg-orange-50", label: "Huy hiệu đạt được", value: stats.badgeCount },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 ${item.bg} rounded-xl`}>
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white flex-shrink-0 shadow-sm">
                    <i className={`${item.icon} text-base`} style={{ color: item.color }}></i>
                  </div>
                  <div>
                    <p className="text-gray-800 font-bold text-sm">{item.value}</p>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/eps-leaderboard")}
            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className="ri-trophy-line text-[#e8c84a]"></i>
            Bảng xếp hạng EPS
          </button>
          <button
            onClick={() => navigate("/eps-study-group")}
            className="flex items-center justify-center gap-2 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-group-line"></i>
            Nhóm học EPS
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
