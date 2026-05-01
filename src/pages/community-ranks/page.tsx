import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";

// ─── Rank System ─────────────────────────────────────────────────────────────
export const RANKS = [
  {
    id: "newbie",
    name: "Tân binh",
    nameKo: "신병",
    icon: "ri-seedling-line",
    color: "#94a3b8",
    bgColor: "#94a3b815",
    borderColor: "#94a3b830",
    minXP: 0,
    maxXP: 99,
    description: "Mới bắt đầu hành trình học tiếng Hàn",
    perks: ["Tham gia cộng đồng", "Đăng bài và bình luận"],
  },
  {
    id: "learner",
    name: "Học viên",
    nameKo: "학습자",
    icon: "ri-book-open-line",
    color: "#34d399",
    bgColor: "#34d39915",
    borderColor: "#34d39930",
    minXP: 100,
    maxXP: 499,
    description: "Đang xây dựng nền tảng tiếng Hàn vững chắc",
    perks: ["Huy hiệu Học viên", "Ưu tiên hiển thị bài đăng", "Tham gia sự kiện cộng đồng"],
  },
  {
    id: "warrior",
    name: "Chiến binh",
    nameKo: "전사",
    icon: "ri-sword-line",
    color: "#60a5fa",
    bgColor: "#60a5fa15",
    borderColor: "#60a5fa30",
    minXP: 500,
    maxXP: 1499,
    description: "Kiên trì luyện tập mỗi ngày, không bỏ cuộc",
    perks: ["Huy hiệu Chiến binh", "Khung avatar đặc biệt", "Quyền tạo nhóm học tập"],
  },
  {
    id: "master",
    name: "Cao thủ",
    nameKo: "고수",
    icon: "ri-vip-crown-line",
    color: "#f59e0b",
    bgColor: "#f59e0b15",
    borderColor: "#f59e0b30",
    minXP: 1500,
    maxXP: 4999,
    description: "Thành thạo tiếng Hàn, truyền cảm hứng cho cộng đồng",
    perks: ["Huy hiệu Cao thủ", "Nhãn xác minh", "Quyền ghim bài đăng", "Tư vấn thành viên mới"],
  },
  {
    id: "legend",
    name: "Huyền thoại",
    nameKo: "전설",
    icon: "ri-fire-fill",
    color: "#e8c84a",
    bgColor: "#e8c84a15",
    borderColor: "#e8c84a40",
    minXP: 5000,
    maxXP: Infinity,
    description: "Đỉnh cao của cộng đồng — biểu tượng học tiếng Hàn",
    perks: ["Huy hiệu Huyền thoại", "Tên hiển thị màu vàng", "Quyền moderator", "Phần thưởng độc quyền hàng tháng"],
  },
];

// ─── Badge System ─────────────────────────────────────────────────────────────
export const BADGES = [
  // Streak badges
  { id: "streak7", name: "Streak 7 ngày", nameKo: "7일 연속", icon: "ri-fire-line", color: "#fb923c", category: "streak", condition: "Duy trì streak 7 ngày liên tiếp", xpReward: 50 },
  { id: "streak30", name: "Streak 30 ngày", nameKo: "30일 연속", icon: "ri-fire-fill", color: "#ef4444", category: "streak", condition: "Duy trì streak 30 ngày liên tiếp", xpReward: 200 },
  { id: "streak100", name: "Streak 100 ngày", nameKo: "100일 연속", icon: "ri-meteor-line", color: "#e8c84a", category: "streak", condition: "Duy trì streak 100 ngày liên tiếp", xpReward: 500 },
  // Achievement badges
  { id: "eps_pass", name: "Đậu EPS", nameKo: "EPS 합격", icon: "ri-trophy-fill", color: "#FFD700", category: "achievement", condition: "Đạt điểm đậu trong bài thi thử EPS", xpReward: 300 },
  { id: "topik1_pass", name: "Đậu TOPIK I", nameKo: "TOPIK I 합격", icon: "ri-medal-line", color: "#34d399", category: "achievement", condition: "Đạt điểm đậu trong bài thi thử TOPIK I", xpReward: 200 },
  { id: "topik2_pass", name: "Đậu TOPIK II", nameKo: "TOPIK II 합격", icon: "ri-medal-fill", color: "#60a5fa", category: "achievement", condition: "Đạt điểm đậu trong bài thi thử TOPIK II", xpReward: 400 },
  // Community badges
  { id: "first_post", name: "Bài đăng đầu tiên", nameKo: "첫 게시물", icon: "ri-quill-pen-line", color: "#a78bfa", category: "community", condition: "Đăng bài đầu tiên trong cộng đồng", xpReward: 20 },
  { id: "helpful", name: "Người hữu ích", nameKo: "도움이 되는 사람", icon: "ri-heart-fill", color: "#f43f5e", category: "community", condition: "Nhận 50 lượt thích trong cộng đồng", xpReward: 100 },
  { id: "top10", name: "Top 10 BXH", nameKo: "상위 10위", icon: "ri-bar-chart-fill", color: "#e8c84a", category: "community", condition: "Lọt vào top 10 bảng xếp hạng", xpReward: 150 },
  // Learning badges
  { id: "vocab200", name: "200 từ vựng", nameKo: "단어 200개", icon: "ri-translate-2", color: "#22d3ee", category: "learning", condition: "Học 200 từ vựng EPS", xpReward: 100 },
  { id: "hangul_master", name: "Thành thạo Hangul", nameKo: "한글 마스터", icon: "ri-font-size", color: "#84cc16", category: "learning", condition: "Hoàn thành tất cả bài học Hangul", xpReward: 80 },
  { id: "perfect_score", name: "Điểm tuyệt đối", nameKo: "만점", icon: "ri-star-fill", color: "#f59e0b", category: "learning", condition: "Đạt 100% trong một bài thi thử", xpReward: 200 },
  // Special badges
  { id: "early_bird", name: "Chim sớm", nameKo: "얼리버드", icon: "ri-sun-line", color: "#fbbf24", category: "special", condition: "Học trước 7 giờ sáng 10 ngày", xpReward: 60 },
  { id: "night_owl", name: "Cú đêm", nameKo: "올빼미", icon: "ri-moon-line", color: "#818cf8", category: "special", condition: "Học sau 11 giờ đêm 10 ngày", xpReward: 60 },
  { id: "veteran", name: "Lão làng", nameKo: "베테랑", icon: "ri-time-line", color: "#94a3b8", category: "special", condition: "Tham gia cộng đồng hơn 1 năm", xpReward: 100 },
];

const BADGE_CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "streak", label: "Streak" },
  { id: "achievement", label: "Thành tích thi" },
  { id: "community", label: "Cộng đồng" },
  { id: "learning", label: "Học tập" },
  { id: "special", label: "Đặc biệt" },
];

// ─── Mock leaderboard data ────────────────────────────────────────────────────
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Nguyễn Văn Hùng", xp: 8420, streak: 142, badges: ["streak100", "eps_pass", "top10", "perfect_score"], rankId: "legend" },
  { rank: 2, name: "Trần Thị Mai", xp: 6850, streak: 98, badges: ["streak100", "topik2_pass", "helpful"], rankId: "legend" },
  { rank: 3, name: "Lê Minh Tuấn", xp: 5200, streak: 67, badges: ["streak30", "eps_pass", "vocab200"], rankId: "legend" },
  { rank: 4, name: "Phạm Thu Hà", xp: 3800, streak: 45, badges: ["streak30", "topik1_pass", "first_post"], rankId: "master" },
  { rank: 5, name: "Hoàng Đức Nam", xp: 2900, streak: 38, badges: ["streak30", "helpful", "hangul_master"], rankId: "master" },
  { rank: 6, name: "Vũ Thị Lan", xp: 2100, streak: 29, badges: ["streak7", "vocab200", "first_post"], rankId: "master" },
  { rank: 7, name: "Đặng Quốc Bảo", xp: 1650, streak: 22, badges: ["streak7", "eps_pass"], rankId: "master" },
  { rank: 8, name: "Bùi Thị Hoa", xp: 1200, streak: 18, badges: ["streak7", "first_post"], rankId: "warrior" },
  { rank: 9, name: "Ngô Văn Thắng", xp: 980, streak: 15, badges: ["streak7", "hangul_master"], rankId: "warrior" },
  { rank: 10, name: "Đinh Thị Yến", xp: 750, streak: 12, badges: ["first_post", "vocab200"], rankId: "warrior" },
];

function getRankById(id: string) {
  return RANKS.find(r => r.id === id) || RANKS[0];
}

function getBadgeById(id: string) {
  return BADGES.find(b => b.id === id);
}

function getXPProgress(xp: number) {
  const rank = RANKS.find(r => xp >= r.minXP && xp <= r.maxXP) || RANKS[RANKS.length - 1];
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  if (!nextRank) return { rank, nextRank: null, progress: 100, xpToNext: 0 };
  const progress = ((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100;
  return { rank, nextRank, progress: Math.min(progress, 100), xpToNext: nextRank.minXP - xp };
}

// ─── Rank Card ────────────────────────────────────────────────────────────────
function RankCard({ rank, isCurrentRank, userXP }: { rank: typeof RANKS[0]; isCurrentRank: boolean; userXP: number }) {
  const [expanded, setExpanded] = useState(false);
  const isUnlocked = userXP >= rank.minXP;

  return (
    <div
      className={`rounded-2xl border transition-all cursor-pointer ${isCurrentRank ? "border-2" : "border"}`}
      style={{
        backgroundColor: isCurrentRank ? rank.bgColor : "rgba(255,255,255,0.02)",
        borderColor: isCurrentRank ? rank.color : "rgba(255,255,255,0.06)",
      }}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="flex items-center gap-4 p-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
          style={{ backgroundColor: rank.bgColor, border: `2px solid ${rank.borderColor}` }}
        >
          <i className={`${rank.icon} text-2xl`} style={{ color: rank.color }}></i>
          {!isUnlocked && (
            <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
              <i className="ri-lock-line text-white/40 text-sm"></i>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base">{rank.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: rank.bgColor, color: rank.color }}>{rank.nameKo}</span>
            {isCurrentRank && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-medium">Cấp hiện tại</span>}
          </div>
          <p className="text-white/40 text-xs mt-0.5">{rank.description}</p>
          <p className="text-white/25 text-[10px] mt-1">
            {rank.maxXP === Infinity ? `Từ ${rank.minXP.toLocaleString()} XP` : `${rank.minXP.toLocaleString()} – ${rank.maxXP.toLocaleString()} XP`}
          </p>
        </div>
        <i className={`ri-arrow-down-s-line text-white/30 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}></i>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-white/40 text-xs font-medium mb-2">Quyền lợi cấp bậc:</p>
          <div className="space-y-1.5">
            {rank.perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-checkbox-circle-fill text-sm" style={{ color: rank.color }}></i>
                </div>
                <span className="text-white/60 text-xs">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Badge Card ───────────────────────────────────────────────────────────────
function BadgeCard({ badge, earned }: { badge: typeof BADGES[0]; earned: boolean }) {
  return (
    <div className={`rounded-xl border p-3 transition-all ${earned ? "border-white/10" : "border-white/5 opacity-50"}`}
      style={{ backgroundColor: earned ? `${badge.color}08` : "rgba(255,255,255,0.02)" }}>
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center relative"
          style={{ backgroundColor: `${badge.color}15`, border: `1.5px solid ${badge.color}30` }}
        >
          <i className={`${badge.icon} text-xl`} style={{ color: earned ? badge.color : "#ffffff30" }}></i>
          {!earned && (
            <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
              <i className="ri-lock-line text-white/30 text-xs"></i>
            </div>
          )}
        </div>
        <div>
          <p className="text-white/70 text-xs font-semibold leading-tight">{badge.name}</p>
          <p className="text-white/30 text-[10px] mt-0.5">{badge.nameKo}</p>
        </div>
        <div className="flex items-center gap-1">
          <i className="ri-star-line text-[#e8c84a] text-[10px]"></i>
          <span className="text-[#e8c84a] text-[10px] font-bold">+{badge.xpReward} XP</span>
        </div>
        <p className="text-white/25 text-[9px] leading-relaxed">{badge.condition}</p>
      </div>
    </div>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function LeaderboardRow({ entry, isMe }: { entry: typeof MOCK_LEADERBOARD[0]; isMe: boolean }) {
  const rank = getRankById(entry.rankId);
  const medals = ["ri-medal-fill", "ri-medal-fill", "ri-medal-fill"];
  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isMe ? "border" : "hover:bg-white/3"}`}
      style={isMe ? { backgroundColor: "#e8c84a08", borderColor: "#e8c84a25" } : {}}>
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {entry.rank <= 3 ? (
          <i className={`${medals[entry.rank - 1]} text-lg`} style={{ color: medalColors[entry.rank - 1] }}></i>
        ) : (
          <span className="text-white/30 text-sm font-bold">{entry.rank}</span>
        )}
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rank.bgColor, border: `1.5px solid ${rank.borderColor}` }}>
        <i className={`${rank.icon} text-sm`} style={{ color: rank.color }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${isMe ? "text-[#e8c84a]" : "text-white/80"}`}>{entry.name}</span>
          {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a]">Bạn</span>}
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: rank.bgColor, color: rank.color }}>{rank.name}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-white/30 text-[10px]"><i className="ri-fire-line text-[#fb923c] mr-0.5"></i>{entry.streak} ngày</span>
          <div className="flex gap-1">
            {entry.badges.slice(0, 3).map(bid => {
              const b = getBadgeById(bid);
              if (!b) return null;
              return <i key={bid} className={`${b.icon} text-xs`} style={{ color: b.color }} title={b.name}></i>;
            })}
            {entry.badges.length > 3 && <span className="text-white/20 text-[10px]">+{entry.badges.length - 3}</span>}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-white font-bold text-sm">{entry.xp.toLocaleString()}</p>
        <p className="text-white/30 text-[10px]">XP</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityRanksPage() {
  const [activeTab, setActiveTab] = useState<"ranks" | "badges" | "leaderboard">("ranks");
  const [badgeCategory, setBadgeCategory] = useState("all");
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [xpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const { user, profile } = useAuth();

  const userXP = xpData.total || 0;
  const { rank: currentRank, nextRank, progress, xpToNext } = getXPProgress(userXP);

  // Determine earned badges based on local data
  const earnedBadgeIds = useMemo(() => {
    const earned: string[] = [];
    if (streak.count >= 7) earned.push("streak7");
    if (streak.count >= 30) earned.push("streak30");
    if (streak.count >= 100) earned.push("streak100");
    return earned;
  }, [streak.count]);

  const filteredBadges = useMemo(() => {
    if (badgeCategory === "all") return BADGES;
    return BADGES.filter(b => b.category === badgeCategory);
  }, [badgeCategory]);

  const tabs = [
    { id: "ranks" as const, label: "Cấp bậc", icon: "ri-vip-crown-line" },
    { id: "badges" as const, label: "Huy hiệu", icon: "ri-medal-line" },
    { id: "leaderboard" as const, label: "Bảng phong thần", icon: "ri-trophy-line" },
  ];

  return (
    <DashboardLayout
      title="Cấp bậc & Huy hiệu"
      subtitle="Hệ thống gamification — leo hạng và sưu tầm huy hiệu thành tích"
    >
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div>
          {/* User rank card */}
          <div className="rounded-2xl border border-white/8 p-5 mb-6 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${currentRank.bgColor}, rgba(15,17,23,0.8))` }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
              style={{ background: currentRank.color, transform: "translate(30%, -30%)" }}></div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: currentRank.bgColor, border: `2px solid ${currentRank.borderColor}` }}>
                <i className={`${currentRank.icon} text-3xl`} style={{ color: currentRank.color }}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-lg">{user ? (profile?.display_name || "Học viên") : "Khách"}</span>
                  <span className="text-sm px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: currentRank.bgColor, color: currentRank.color, border: `1px solid ${currentRank.borderColor}` }}>
                    <i className={`${currentRank.icon} mr-1`}></i>{currentRank.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/60"><i className="ri-star-line text-[#e8c84a] mr-1"></i>{userXP.toLocaleString()} XP</span>
                  <span className="text-white/40"><i className="ri-fire-line text-[#fb923c] mr-1"></i>{streak.count} ngày streak</span>
                  <span className="text-white/40"><i className="ri-medal-line text-[#a78bfa] mr-1"></i>{earnedBadgeIds.length} huy hiệu</span>
                </div>
                {nextRank && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/30 text-[10px]">Tiến độ lên {nextRank.name}</span>
                      <span className="text-white/40 text-[10px]">Còn {xpToNext.toLocaleString()} XP</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: currentRank.color }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-5 w-fit">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}>
                <i className={`${tab.icon} text-sm`}></i>{tab.label}
              </button>
            ))}
          </div>

          {/* Ranks tab */}
          {activeTab === "ranks" && (
            <div className="space-y-3">
              {RANKS.map(rank => (
                <RankCard key={rank.id} rank={rank} isCurrentRank={rank.id === currentRank.id} userXP={userXP} />
              ))}
            </div>
          )}

          {/* Badges tab */}
          {activeTab === "badges" && (
            <div>
              <div className="flex gap-2 flex-wrap mb-4">
                {BADGE_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setBadgeCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${badgeCategory === cat.id ? "bg-[#e8c84a] text-[#0f1117]" : "bg-white/5 text-white/40 hover:text-white/60 border border-white/8"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredBadges.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.includes(badge.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard tab */}
          {activeTab === "leaderboard" && (
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ri-trophy-fill text-[#e8c84a]"></i>
                  <span className="text-white font-semibold text-sm">Bảng phong thần tháng này</span>
                </div>
                <span className="text-white/30 text-xs">Top 10 XP</span>
              </div>
              <div className="divide-y divide-white/3">
                {MOCK_LEADERBOARD.map(entry => (
                  <LeaderboardRow key={entry.rank} entry={entry} isMe={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* How to earn XP */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-star-line text-[#e8c84a] mr-2"></i>Cách kiếm XP</h3>
            <div className="space-y-2.5">
              {[
                { action: "Học flashcard", xp: "+5 XP/từ", icon: "ri-stack-line", color: "#34d399" },
                { action: "Làm bài thi EPS", xp: "+20 XP/bài", icon: "ri-file-list-3-line", color: "#fb923c" },
                { action: "Duy trì streak", xp: "+10 XP/ngày", icon: "ri-fire-line", color: "#ef4444" },
                { action: "Đăng bài cộng đồng", xp: "+15 XP/bài", icon: "ri-article-line", color: "#a78bfa" },
                { action: "Nhận lượt thích", xp: "+2 XP/like", icon: "ri-heart-line", color: "#f43f5e" },
                { action: "Hoàn thành quiz", xp: "+10 XP/quiz", icon: "ri-survey-line", color: "#22d3ee" },
                { action: "Streak 7 ngày", xp: "+50 XP bonus", icon: "ri-gift-line", color: "#e8c84a" },
              ].map(item => (
                <div key={item.action} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
                  </div>
                  <span className="text-white/50 text-xs flex-1">{item.action}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.xp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rank overview */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-vip-crown-line text-[#e8c84a] mr-2"></i>Tổng quan cấp bậc</h3>
            <div className="space-y-2">
              {RANKS.map(rank => (
                <div key={rank.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: rank.bgColor }}>
                    <i className={`${rank.icon} text-xs`} style={{ color: rank.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">{rank.name}</p>
                    <p className="text-white/25 text-[10px]">
                      {rank.maxXP === Infinity ? `${rank.minXP.toLocaleString()}+ XP` : `${rank.minXP.toLocaleString()}–${rank.maxXP.toLocaleString()} XP`}
                    </p>
                  </div>
                  {rank.id === currentRank.id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/40">Bạn</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent badges */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-medal-line text-[#e8c84a] mr-2"></i>Huy hiệu của bạn</h3>
            {earnedBadgeIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {earnedBadgeIds.map(id => {
                  const b = getBadgeById(id);
                  if (!b) return null;
                  return (
                    <div key={id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border" style={{ backgroundColor: `${b.color}10`, borderColor: `${b.color}25` }}>
                      <i className={`${b.icon} text-xs`} style={{ color: b.color }}></i>
                      <span className="text-xs font-medium" style={{ color: b.color }}>{b.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="ri-medal-line text-white/10 text-3xl mb-2 block"></i>
                <p className="text-white/30 text-xs">Chưa có huy hiệu nào</p>
                <p className="text-white/20 text-[10px] mt-1">Duy trì streak 7 ngày để nhận huy hiệu đầu tiên!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
