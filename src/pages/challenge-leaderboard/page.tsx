import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ChallengeSession {
  id: string;
  createdAt: string;
  creatorName: string;
  topic: string;
  questionCount: number;
  questions: string[];
  myScore?: number;
  myTime?: number;
  opponentScore?: number;
  opponentName?: string;
  opponentTime?: number;
  status: "waiting" | "completed";
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
  avgScore: number;
  bestScore: number;
  streak: number;
  xpEarned: number;
  badge: string;
  badgeColor: string;
  isMe?: boolean;
}

// Leaderboard built from real local challenge history (no mock)

const PERIOD_OPTIONS = [
  { id: "week", label: "Tuần này" },
  { id: "month", label: "Tháng này" },
  { id: "all", label: "Tất cả" },
];

const TOPIC_LABELS: Record<string, string> = {
  all: "Tất cả", greeting: "Chào hỏi", workplace: "Nơi làm việc",
  safety: "An toàn", law: "Pháp luật", daily: "Sinh hoạt",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-app-accent-primary/20"><i className="ri-trophy-fill text-app-accent-primary text-base"></i></div>;
  if (rank === 2) return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15"><i className="ri-medal-fill text-white/60 text-base"></i></div>;
  if (rank === 3) return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fb923c]/20"><i className="ri-medal-fill text-[#fb923c] text-base"></i></div>;
  return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-app-card/50 text-app-text-muted text-sm font-bold">{rank}</div>;
}

export default function ChallengeLeaderboardPage() {
  const [challenges] = useLocalStorage<ChallengeSession[]>("kts_friend_challenges", []);
  const [period, setPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState<"overall" | "topic" | "streak">("overall");
  const [selectedTopic, setSelectedTopic] = useState("all");

  // My stats from local challenges
  const myStats = useMemo(() => {
    const completed = challenges.filter(c => c.status === "completed" && c.myScore !== undefined && c.opponentScore !== undefined);
    const wins = completed.filter(c => c.myScore! > c.opponentScore!).length;
    const losses = completed.filter(c => c.myScore! < c.opponentScore!).length;
    const draws = completed.filter(c => c.myScore! === c.opponentScore!).length;
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((s, c) => s + (c.myScore! / c.questionCount) * 100, 0) / completed.length)
      : 0;
    return { wins, losses, draws, total: completed.length, avgScore };
  }, [challenges]);

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    if (myStats.total === 0) return [];
    const badge = myStats.wins >= 10 ? "Cao thủ" : myStats.wins >= 5 ? "Giỏi" : myStats.wins >= 1 ? "Khá" : "Mới bắt đầu";
    const badgeColor = myStats.wins >= 10 ? "app-accent-primary" : myStats.wins >= 5 ? "#fb923c" : myStats.wins >= 1 ? "#38bdf8" : "#64748b";
    return [{
      rank: 1,
      name: "Bạn",
      avatar: "B",
      wins: myStats.wins,
      losses: myStats.losses,
      draws: myStats.draws,
      totalGames: myStats.total,
      winRate: myStats.total > 0 ? Math.round((myStats.wins / myStats.total) * 100) : 0,
      avgScore: myStats.avgScore,
      bestScore: myStats.avgScore,
      streak: myStats.wins,
      xpEarned: myStats.wins * 50 + myStats.total * 20,
      badge,
      badgeColor,
      isMe: true,
    }];
  }, [myStats]);

  const myEntry = leaderboard.find(e => e.isMe);
  const top3 = leaderboard.slice(0, 3);

  return (
    <DashboardLayout
      title="Bảng xếp hạng thách đấu"
      subtitle="Top người thắng nhiều nhất — cạnh tranh và leo hạng mỗi tuần"
    >
      {/* Period selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${period === p.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          {(["overall", "topic", "streak"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === t ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
            >
              {t === "overall" ? "Tổng hợp" : t === "topic" ? "Theo chủ đề" : "Streak"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Leaderboard */}
        <div className="space-y-5">
          {/* Top 3 podium */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-5">Top 3 tuần này</p>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              {top3[1] && (
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-app-card/70 text-white/60 font-bold text-lg">{top3[1].avatar}</div>
                  <p className="text-white/60 text-xs font-semibold text-center truncate w-full">{top3[1].name}</p>
                  <div className="w-full h-16 bg-app-card/50 rounded-t-xl flex flex-col items-center justify-center border border-app-border">
                    <i className="ri-medal-fill text-app-text-secondary text-lg mb-1"></i>
                    <span className="text-white/50 text-xs font-bold">{top3[1].wins}W</span>
                  </div>
                </div>
              )}
              {/* 1st */}
              {top3[0] && (
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-app-accent-primary/20 text-app-accent-primary font-bold text-xl border-2 border-app-accent-primary/40">{top3[0].avatar}</div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <i className="ri-vip-crown-fill text-app-accent-primary text-sm"></i>
                    </div>
                  </div>
                  <p className="text-white font-semibold text-xs text-center truncate w-full">{top3[0].name}</p>
                  <div className="w-full h-24 bg-app-accent-primary/8 rounded-t-xl flex flex-col items-center justify-center border border-app-accent-primary/20">
                    <i className="ri-trophy-fill text-app-accent-primary text-xl mb-1"></i>
                    <span className="text-app-accent-primary text-sm font-bold">{top3[0].wins}W</span>
                    <span className="text-app-accent-primary/50 text-[10px]">{top3[0].winRate}%</span>
                  </div>
                </div>
              )}
              {/* 3rd */}
              {top3[2] && (
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fb923c]/10 text-[#fb923c] font-bold text-lg">{top3[2].avatar}</div>
                  <p className="text-white/60 text-xs font-semibold text-center truncate w-full">{top3[2].name}</p>
                  <div className="w-full h-12 bg-[#fb923c]/5 rounded-t-xl flex flex-col items-center justify-center border border-[#fb923c]/15">
                    <i className="ri-medal-fill text-[#fb923c] text-base mb-0.5"></i>
                    <span className="text-[#fb923c] text-xs font-bold">{top3[2].wins}W</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full leaderboard */}
          <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-app-border flex items-center gap-4 text-[10px] text-app-text-muted font-semibold tracking-normal">
              <span className="w-8">Hạng</span>
              <span className="flex-1">Người chơi</span>
              <span className="w-12 text-center">Thắng</span>
              <span className="w-12 text-center">Thua</span>
              <span className="w-16 text-center">Tỷ lệ</span>
              <span className="w-16 text-center">TB điểm</span>
              <span className="w-16 text-center">XP</span>
            </div>
            <div className="divide-y divide-white/3">
              {leaderboard.map(entry => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${entry.isMe ? "bg-app-accent-primary/5 border-l-2 border-app-accent-primary" : "hover:bg-white/2"}`}
                >
                  <div className="w-8 flex-shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${entry.isMe ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-white/8 text-white/50"}`}>
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${entry.isMe ? "text-app-accent-primary" : "text-white/70"}`}>
                        {entry.name}
                        {entry.isMe && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">Bạn</span>}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${entry.badgeColor}15`, color: entry.badgeColor }}>
                          {entry.badge}
                        </span>
                        {entry.streak > 0 && (
                          <span className="text-[9px] text-[#fb923c] flex items-center gap-0.5">
                            <i className="ri-fire-line"></i>{entry.streak} streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="w-12 text-center text-app-accent-success font-bold text-sm">{entry.wins}</span>
                  <span className="w-12 text-center text-red-400/70 text-sm">{entry.losses}</span>
                  <div className="w-16 text-center">
                    <span className={`text-sm font-bold ${entry.winRate >= 60 ? "text-app-accent-success" : entry.winRate >= 40 ? "text-app-accent-primary" : "text-red-400/70"}`}>
                      {entry.winRate}%
                    </span>
                  </div>
                  <span className="w-16 text-center text-white/50 text-sm">{entry.avgScore}%</span>
                  <span className="w-16 text-center text-[#a78bfa] text-xs font-bold">+{entry.xpEarned}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* My stats */}
          <div className="bg-app-bg border border-app-accent-primary/15 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Thống kê của bạn</p>
            {myEntry && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Hạng hiện tại</span>
                  <span className="text-app-accent-primary font-bold text-lg">#{myEntry.rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Tổng trận</span>
                  <span className="text-white font-bold">{myEntry.totalGames}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Thắng / Thua / Hòa</span>
                  <span className="text-sm font-bold">
                    <span className="text-app-accent-success">{myEntry.wins}</span>
                    <span className="text-app-text-muted mx-1">/</span>
                    <span className="text-red-400">{myEntry.losses}</span>
                    <span className="text-app-text-muted mx-1">/</span>
                    <span className="text-app-text-secondary">{myEntry.draws}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">Tỷ lệ thắng</span>
                  <span className={`font-bold ${myEntry.winRate >= 60 ? "text-app-accent-success" : myEntry.winRate >= 40 ? "text-app-accent-primary" : "text-red-400"}`}>
                    {myEntry.winRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-app-text-secondary text-xs">XP từ thách đấu</span>
                  <span className="text-[#a78bfa] font-bold">+{myEntry.xpEarned}</span>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-app-border">
              <a href="/challenge" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-sword-line"></i>Tạo thách đấu mới
              </a>
            </div>
          </div>

          {/* Season info */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">Mùa giải hiện tại</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-app-text-secondary">Mùa</span>
                <span className="text-white font-bold">Mùa 1 · Tháng 4/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-text-secondary">Kết thúc</span>
                <span className="text-app-accent-primary font-bold">30/04/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-text-secondary">Phần thưởng Top 3</span>
                <span className="text-[#a78bfa] font-bold">+500 XP</span>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
            <p className="text-app-accent-primary text-xs font-semibold mb-2">Cách tính điểm</p>
            <div className="space-y-1.5 text-[10px] text-white/35 leading-relaxed">
              <p><i className="ri-trophy-line text-app-accent-primary mr-1"></i>Thắng: +3 điểm xếp hạng</p>
              <p><i className="ri-scales-3-line text-app-text-muted mr-1"></i>Hòa: +1 điểm xếp hạng</p>
              <p><i className="ri-close-line text-red-400/50 mr-1"></i>Thua: 0 điểm</p>
              <p><i className="ri-time-line text-app-text-muted mr-1"></i>Thắng nhanh hơn: +1 điểm bonus</p>
              <p><i className="ri-fire-line text-[#fb923c] mr-1"></i>Streak 5 trận: +5 điểm bonus</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

