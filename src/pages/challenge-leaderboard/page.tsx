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

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Nguyễn Thị Lan", avatar: "L", wins: 47, losses: 8, draws: 3, totalGames: 58, winRate: 81, avgScore: 87, bestScore: 100, streak: 12, xpEarned: 2850, badge: "Vô địch", badgeColor: "#e8c84a" },
  { rank: 2, name: "Trần Văn Minh", avatar: "M", wins: 39, losses: 12, draws: 5, totalGames: 56, winRate: 70, avgScore: 82, bestScore: 95, streak: 8, xpEarned: 2340, badge: "Cao thủ", badgeColor: "#a78bfa" },
  { rank: 3, name: "Lê Thị Hoa", avatar: "H", wins: 35, losses: 15, draws: 4, totalGames: 54, winRate: 65, avgScore: 79, bestScore: 100, streak: 5, xpEarned: 2100, badge: "Xuất sắc", badgeColor: "#34d399" },
  { rank: 4, name: "Phạm Quốc Bảo", avatar: "B", wins: 28, losses: 18, draws: 6, totalGames: 52, winRate: 54, avgScore: 74, bestScore: 90, streak: 3, xpEarned: 1680, badge: "Giỏi", badgeColor: "#fb923c" },
  { rank: 5, name: "Hoàng Thị Mai", avatar: "M", wins: 24, losses: 20, draws: 3, totalGames: 47, winRate: 51, avgScore: 71, bestScore: 85, streak: 2, xpEarned: 1440, badge: "Khá", badgeColor: "#38bdf8" },
  { rank: 6, name: "Vũ Đức Thành", avatar: "T", wins: 21, losses: 22, draws: 4, totalGames: 47, winRate: 45, avgScore: 68, bestScore: 80, streak: 1, xpEarned: 1260, badge: "Trung bình", badgeColor: "#94a3b8" },
  { rank: 7, name: "Đặng Thị Linh", avatar: "L", wins: 18, losses: 25, draws: 2, totalGames: 45, winRate: 40, avgScore: 65, bestScore: 85, streak: 0, xpEarned: 1080, badge: "Đang học", badgeColor: "#64748b" },
  { rank: 8, name: "Bùi Văn Hùng", avatar: "H", wins: 15, losses: 28, draws: 3, totalGames: 46, winRate: 33, avgScore: 61, bestScore: 75, streak: 0, xpEarned: 900, badge: "Đang học", badgeColor: "#64748b" },
  { rank: 9, name: "Ngô Thị Thu", avatar: "T", wins: 12, losses: 30, draws: 1, totalGames: 43, winRate: 28, avgScore: 58, bestScore: 70, streak: 0, xpEarned: 720, badge: "Mới bắt đầu", badgeColor: "#475569" },
  { rank: 10, name: "Bạn", avatar: "B", wins: 2, losses: 1, draws: 0, totalGames: 3, winRate: 67, avgScore: 80, bestScore: 80, streak: 1, xpEarned: 120, badge: "Mới bắt đầu", badgeColor: "#475569", isMe: true },
];

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
  if (rank === 1) return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e8c84a]/20"><i className="ri-trophy-fill text-[#e8c84a] text-base"></i></div>;
  if (rank === 2) return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15"><i className="ri-medal-fill text-white/60 text-base"></i></div>;
  if (rank === 3) return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fb923c]/20"><i className="ri-medal-fill text-[#fb923c] text-base"></i></div>;
  return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/30 text-sm font-bold">{rank}</div>;
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

  const leaderboard = useMemo(() => {
    // Merge my real stats into mock
    return MOCK_LEADERBOARD.map(e => {
      if (e.isMe) {
        return {
          ...e,
          wins: myStats.wins || e.wins,
          losses: myStats.losses || e.losses,
          draws: myStats.draws || e.draws,
          totalGames: myStats.total || e.totalGames,
          winRate: myStats.total > 0 ? Math.round((myStats.wins / myStats.total) * 100) : e.winRate,
          avgScore: myStats.avgScore || e.avgScore,
        };
      }
      return e;
    }).sort((a, b) => b.wins - a.wins).map((e, i) => ({ ...e, rank: i + 1 }));
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
        <div className="flex items-center bg-white/5 rounded-xl p-1">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${period === p.id ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white/5 rounded-xl p-1">
          {(["overall", "topic", "streak"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === t ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
            >
              {t === "overall" ? "Tổng hợp" : t === "topic" ? "Theo chủ đề" : "Streak"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Left: Leaderboard */}
        <div className="space-y-5">
          {/* Top 3 podium */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-5">Top 3 tuần này</p>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              {top3[1] && (
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white/60 font-bold text-lg">{top3[1].avatar}</div>
                  <p className="text-white/60 text-xs font-semibold text-center truncate w-full">{top3[1].name}</p>
                  <div className="w-full h-16 bg-white/5 rounded-t-xl flex flex-col items-center justify-center border border-white/8">
                    <i className="ri-medal-fill text-white/40 text-lg mb-1"></i>
                    <span className="text-white/50 text-xs font-bold">{top3[1].wins}W</span>
                  </div>
                </div>
              )}
              {/* 1st */}
              {top3[0] && (
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#e8c84a]/20 text-[#e8c84a] font-bold text-xl border-2 border-[#e8c84a]/40">{top3[0].avatar}</div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <i className="ri-vip-crown-fill text-[#e8c84a] text-sm"></i>
                    </div>
                  </div>
                  <p className="text-white font-semibold text-xs text-center truncate w-full">{top3[0].name}</p>
                  <div className="w-full h-24 bg-[#e8c84a]/8 rounded-t-xl flex flex-col items-center justify-center border border-[#e8c84a]/20">
                    <i className="ri-trophy-fill text-[#e8c84a] text-xl mb-1"></i>
                    <span className="text-[#e8c84a] text-sm font-bold">{top3[0].wins}W</span>
                    <span className="text-[#e8c84a]/50 text-[10px]">{top3[0].winRate}%</span>
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
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-4 text-[10px] text-white/25 font-semibold uppercase tracking-wider">
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
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${entry.isMe ? "bg-[#e8c84a]/5 border-l-2 border-[#e8c84a]" : "hover:bg-white/2"}`}
                >
                  <div className="w-8 flex-shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${entry.isMe ? "bg-[#e8c84a]/20 text-[#e8c84a]" : "bg-white/8 text-white/50"}`}>
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${entry.isMe ? "text-[#e8c84a]" : "text-white/70"}`}>
                        {entry.name}
                        {entry.isMe && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8c84a]/15 text-[#e8c84a]">Bạn</span>}
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
                  <span className="w-12 text-center text-emerald-400 font-bold text-sm">{entry.wins}</span>
                  <span className="w-12 text-center text-red-400/70 text-sm">{entry.losses}</span>
                  <div className="w-16 text-center">
                    <span className={`text-sm font-bold ${entry.winRate >= 60 ? "text-emerald-400" : entry.winRate >= 40 ? "text-[#e8c84a]" : "text-red-400/70"}`}>
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
          <div className="bg-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Thống kê của bạn</p>
            {myEntry && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Hạng hiện tại</span>
                  <span className="text-[#e8c84a] font-bold text-lg">#{myEntry.rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Tổng trận</span>
                  <span className="text-white font-bold">{myEntry.totalGames}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Thắng / Thua / Hòa</span>
                  <span className="text-sm font-bold">
                    <span className="text-emerald-400">{myEntry.wins}</span>
                    <span className="text-white/20 mx-1">/</span>
                    <span className="text-red-400">{myEntry.losses}</span>
                    <span className="text-white/20 mx-1">/</span>
                    <span className="text-white/40">{myEntry.draws}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Tỷ lệ thắng</span>
                  <span className={`font-bold ${myEntry.winRate >= 60 ? "text-emerald-400" : myEntry.winRate >= 40 ? "text-[#e8c84a]" : "text-red-400"}`}>
                    {myEntry.winRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">XP từ thách đấu</span>
                  <span className="text-[#a78bfa] font-bold">+{myEntry.xpEarned}</span>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="/friend-challenge" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-sword-line"></i>Tạo thách đấu mới
              </a>
            </div>
          </div>

          {/* Season info */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">Mùa giải hiện tại</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Mùa</span>
                <span className="text-white font-bold">Mùa 1 · Tháng 4/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Kết thúc</span>
                <span className="text-[#e8c84a] font-bold">30/04/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Phần thưởng Top 3</span>
                <span className="text-[#a78bfa] font-bold">+500 XP</span>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
            <p className="text-[#e8c84a] text-xs font-semibold mb-2">Cách tính điểm</p>
            <div className="space-y-1.5 text-[10px] text-white/35 leading-relaxed">
              <p><i className="ri-trophy-line text-[#e8c84a] mr-1"></i>Thắng: +3 điểm xếp hạng</p>
              <p><i className="ri-scales-3-line text-white/30 mr-1"></i>Hòa: +1 điểm xếp hạng</p>
              <p><i className="ri-close-line text-red-400/50 mr-1"></i>Thua: 0 điểm</p>
              <p><i className="ri-time-line text-white/30 mr-1"></i>Thắng nhanh hơn: +1 điểm bonus</p>
              <p><i className="ri-fire-line text-[#fb923c] mr-1"></i>Streak 5 trận: +5 điểm bonus</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
