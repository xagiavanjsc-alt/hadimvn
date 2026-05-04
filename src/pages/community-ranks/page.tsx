import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { RANKS, BADGES } from "@/data/ranks";

// Re-export for backward compatibility
export { RANKS, BADGES };

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
              <i className="ri-lock-line text-app-text-secondary text-sm"></i>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base">{rank.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: rank.bgColor, color: rank.color }}>{rank.nameKo}</span>
            {isCurrentRank && <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/70 text-white/60 font-medium">Cấp hiện tại</span>}
          </div>
          <p className="text-app-text-secondary text-xs mt-0.5">{rank.description}</p>
          <p className="text-app-text-muted text-[10px] mt-1">
            {rank.maxXP === Infinity ? `Từ ${rank.minXP.toLocaleString()} XP` : `${rank.minXP.toLocaleString()} – ${rank.maxXP.toLocaleString()} XP`}
          </p>
        </div>
        <i className={`ri-arrow-down-s-line text-app-text-muted transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}></i>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-app-border pt-3">
          <p className="text-app-text-secondary text-xs font-medium mb-2">Quyền lợi cấp bậc:</p>
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
    <div className={`rounded-xl border p-3 transition-all ${earned ? "border-app-border" : "border-app-border opacity-50"}`}
      style={{ backgroundColor: earned ? `${badge.color}08` : "rgba(255,255,255,0.02)" }}>
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center relative"
          style={{ backgroundColor: `${badge.color}15`, border: `1.5px solid ${badge.color}30` }}
        >
          <i className={`${badge.icon} text-xl`} style={{ color: earned ? badge.color : "#ffffff30" }}></i>
          {!earned && (
            <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
              <i className="ri-lock-line text-app-text-muted text-xs"></i>
            </div>
          )}
        </div>
        <div>
          <p className="text-white/70 text-xs font-semibold leading-tight">{badge.name}</p>
          <p className="text-app-text-muted text-[10px] mt-0.5">{badge.nameKo}</p>
        </div>
        <div className="flex items-center gap-1">
          <i className="ri-star-line text-app-accent-primary text-[10px]"></i>
          <span className="text-app-accent-primary text-[10px] font-bold">+{badge.xpReward} XP</span>
        </div>
        <p className="text-app-text-muted text-[9px] leading-relaxed">{badge.condition}</p>
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
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isMe ? "border" : "hover:bg-app-surface/50"}`}
      style={isMe ? { backgroundColor: "app-accent-primary08", borderColor: "app-accent-primary25" } : {}}>
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {entry.rank <= 3 ? (
          <i className={`${medals[entry.rank - 1]} text-lg`} style={{ color: medalColors[entry.rank - 1] }}></i>
        ) : (
          <span className="text-app-text-muted text-sm font-bold">{entry.rank}</span>
        )}
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rank.bgColor, border: `1.5px solid ${rank.borderColor}` }}>
        <i className={`${rank.icon} text-sm`} style={{ color: rank.color }}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${isMe ? "text-app-accent-primary" : "text-white/80"}`}>{entry.name}</span>
          {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">Bạn</span>}
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: rank.bgColor, color: rank.color }}>{rank.name}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-app-text-muted text-[10px]"><i className="ri-fire-line text-[#fb923c] mr-0.5"></i>{entry.streak} ngày</span>
          <div className="flex gap-1">
            {entry.badges.slice(0, 3).map(bid => {
              const b = getBadgeById(bid);
              if (!b) return null;
              return <i key={bid} className={`${b.icon} text-xs`} style={{ color: b.color }} title={b.name}></i>;
            })}
            {entry.badges.length > 3 && <span className="text-app-text-muted text-[10px]">+{entry.badges.length - 3}</span>}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-white font-bold text-sm">{entry.xp.toLocaleString()}</p>
        <p className="text-app-text-muted text-[10px]">XP</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div>
          {/* User rank card */}
          <div className="rounded-2xl border border-app-border p-5 mb-6 relative overflow-hidden"
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
                  <span className="text-white/60"><i className="ri-star-line text-app-accent-primary mr-1"></i>{userXP.toLocaleString()} XP</span>
                  <span className="text-app-text-secondary"><i className="ri-fire-line text-[#fb923c] mr-1"></i>{streak.count} ngày streak</span>
                  <span className="text-app-text-secondary"><i className="ri-medal-line text-[#a78bfa] mr-1"></i>{earnedBadgeIds.length} huy hiệu</span>
                </div>
                {nextRank && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-app-text-muted text-[10px]">Tiến độ lên {nextRank.name}</span>
                      <span className="text-app-text-secondary text-[10px]">Còn {xpToNext.toLocaleString()} XP</span>
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
          <div className="flex items-center gap-1 bg-app-card/50 rounded-xl p-1 mb-5 w-fit max-w-full overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${badgeCategory === cat.id ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60 border border-app-border"}`}>
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
            <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ri-trophy-fill text-app-accent-primary"></i>
                  <span className="text-white font-semibold text-sm">Bảng phong thần tháng này</span>
                </div>
                <span className="text-app-text-muted text-xs">Top 10 XP</span>
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
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-star-line text-app-accent-primary mr-2"></i>Cách kiếm XP</h3>
            <div className="space-y-2.5">
              {[
                { action: "Học flashcard", xp: "+5 XP/từ", icon: "ri-stack-line", color: "#34d399" },
                { action: "Làm bài thi EPS", xp: "+20 XP/bài", icon: "ri-file-list-3-line", color: "#fb923c" },
                { action: "Duy trì streak", xp: "+10 XP/ngày", icon: "ri-fire-line", color: "#ef4444" },
                { action: "Đăng bài cộng đồng", xp: "+15 XP/bài", icon: "ri-article-line", color: "#a78bfa" },
                { action: "Nhận lượt thích", xp: "+2 XP/like", icon: "ri-heart-line", color: "#f43f5e" },
                { action: "Hoàn thành quiz", xp: "+10 XP/quiz", icon: "ri-survey-line", color: "#22d3ee" },
                { action: "Streak 7 ngày", xp: "+50 XP bonus", icon: "ri-gift-line", color: "app-accent-primary" },
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
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-vip-crown-line text-app-accent-primary mr-2"></i>Tổng quan cấp bậc</h3>
            <div className="space-y-2">
              {RANKS.map(rank => (
                <div key={rank.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: rank.bgColor }}>
                    <i className={`${rank.icon} text-xs`} style={{ color: rank.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">{rank.name}</p>
                    <p className="text-app-text-muted text-[10px]">
                      {rank.maxXP === Infinity ? `${rank.minXP.toLocaleString()}+ XP` : `${rank.minXP.toLocaleString()}–${rank.maxXP.toLocaleString()} XP`}
                    </p>
                  </div>
                  {rank.id === currentRank.id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-app-text-secondary">Bạn</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent badges */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-medal-line text-app-accent-primary mr-2"></i>Huy hiệu của bạn</h3>
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
                <p className="text-app-text-muted text-xs">Chưa có huy hiệu nào</p>
                <p className="text-app-text-muted text-[10px] mt-1">Duy trì streak 7 ngày để nhận huy hiệu đầu tiên!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


