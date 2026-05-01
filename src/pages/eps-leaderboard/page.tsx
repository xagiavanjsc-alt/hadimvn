import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  correct: number;
  total: number;
  examType: string;
  date: string;
  badge?: string;
}

type Period = "week" | "month" | "alltime";
type ExamType = "all" | "mock" | "topic" | "quick";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", name: "Nguyễn Văn Hùng", avatar: "H", score: 98, correct: 39, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-15", badge: "👑" },
  { rank: 2, userId: "u2", name: "Trần Thị Mai", avatar: "M", score: 95, correct: 38, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-14", badge: "🥈" },
  { rank: 3, userId: "u3", name: "Lê Minh Tuấn", avatar: "T", score: 93, correct: 37, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-15", badge: "🥉" },
  { rank: 4, userId: "u4", name: "Phạm Thị Lan", avatar: "L", score: 90, correct: 36, total: 40, examType: "Thi theo chủ đề", date: "2026-04-13" },
  { rank: 5, userId: "u5", name: "Hoàng Văn Nam", avatar: "N", score: 88, correct: 35, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-12" },
  { rank: 6, userId: "u6", name: "Vũ Thị Hoa", avatar: "H", score: 85, correct: 34, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-11" },
  { rank: 7, userId: "u7", name: "Đặng Văn Bình", avatar: "B", score: 83, correct: 33, total: 40, examType: "Thi theo chủ đề", date: "2026-04-10" },
  { rank: 8, userId: "u8", name: "Bùi Thị Thu", avatar: "T", score: 80, correct: 32, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-09" },
  { rank: 9, userId: "u9", name: "Ngô Văn Đức", avatar: "Đ", score: 78, correct: 31, total: 40, examType: "Thi theo chủ đề", date: "2026-04-08" },
  { rank: 10, userId: "u10", name: "Đinh Thị Hằng", avatar: "H", score: 75, correct: 30, total: 40, examType: "Thi mô phỏng thật", date: "2026-04-07" },
];

const AVATAR_COLORS = [
  "#e8c84a", "#34d399", "#06b6d4", "#a78bfa", "#f87171",
  "#fb923c", "#ec4899", "#84cc16", "#22d3ee", "#f59e0b",
];

// ─── Components ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">👑</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return (
    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/8">
      <span className="text-white/50 text-xs font-bold">{rank}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#e8c84a" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── My Score Card ────────────────────────────────────────────────────────────
function MyScoreCard() {
  const navigate = useNavigate();
  const history = JSON.parse(localStorage.getItem("kts_eps_exam_history") || "[]");
  const bestScore = history.length > 0 ? Math.max(...history.map((h: { score: number }) => h.score)) : null;
  const lastScore = history.length > 0 ? history[0].score : null;

  return (
    <div className="bg-[#e8c84a]/8 border border-[#e8c84a]/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#e8c84a] font-semibold text-sm flex items-center gap-2">
          <i className="ri-user-star-line"></i>
          Điểm của bạn
        </h3>
        <button
          onClick={() => navigate("/eps-mock-exam")}
          className="text-xs px-3 py-1.5 bg-[#e8c84a] text-[#0f1117] rounded-lg font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
        >
          Thi ngay
        </button>
      </div>
      {bestScore !== null ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-black text-[#e8c84a]">{bestScore}</p>
            <p className="text-white/40 text-xs">Điểm cao nhất</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{lastScore}</p>
            <p className="text-white/40 text-xs">Lần thi gần nhất</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{history.length}</p>
            <p className="text-white/40 text-xs">Lần đã thi</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-white/40 text-sm">Bạn chưa thi lần nào</p>
          <p className="text-white/25 text-xs mt-1">Thi thử để xem điểm của bạn trên BXH</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpsLeaderboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [period, setPeriod] = useState<Period>("week");
  const [examType, setExamType] = useState<ExamType>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Merge local history into leaderboard
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("kts_eps_exam_history") || "[]");
    if (history.length === 0) return;

    const bestScore = Math.max(...history.map((h: { score: number }) => h.score));
    const bestEntry = history.find((h: { score: number }) => h.score === bestScore);

    const myName = profile?.display_name || user?.email?.split("@")[0] || "Bạn";
    const myEntry: LeaderboardEntry = {
      rank: 0,
      userId: user?.id || "me",
      name: myName,
      avatar: myName[0]?.toUpperCase() || "B",
      score: bestScore,
      correct: bestEntry?.correct || 0,
      total: bestEntry?.total || 40,
      examType: bestEntry?.typeLabel || "Thi thử",
      date: bestEntry?.date || new Date().toISOString(),
    };

    const combined = [...MOCK_LEADERBOARD, myEntry]
      .sort((a, b) => b.score - a.score)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    const myIdx = combined.findIndex(e => e.userId === (user?.id || "me"));
    if (myIdx >= 0) setMyRank(myIdx + 1);

    setEntries(combined.slice(0, 10));
  }, [user, profile]);

  const periodLabels: Record<Period, string> = {
    week: "Tuần này",
    month: "Tháng này",
    alltime: "Mọi thời đại",
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e8c84a]/15">
              <i className="ri-trophy-line text-[#e8c84a] text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bảng xếp hạng EPS</h1>
              <p className="text-white/40 text-sm">So sánh điểm thi thử với cộng đồng</p>
            </div>
          </div>
        </div>

        {/* My score */}
        <MyScoreCard />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
            {(["week", "month", "alltime"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  period === p ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/50 hover:text-white/80"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <select
            value={examType}
            onChange={e => setExamType(e.target.value as ExamType)}
            className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả loại thi</option>
            <option value="mock">Thi mô phỏng thật</option>
            <option value="topic">Thi theo chủ đề</option>
            <option value="quick">Ôn tập nhanh</option>
          </select>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
            if (!entry) return <div key={podiumIdx} />;
            const heights = ["h-24", "h-32", "h-20"];
            const colors = ["#9ca3af", "#e8c84a", "#cd7f32"];
            const labels = ["2nd", "1st", "3rd"];
            const avatarColor = AVATAR_COLORS[entry.rank % AVATAR_COLORS.length];
            return (
              <div key={entry.userId} className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2 text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: `${avatarColor}30`, border: `2px solid ${avatarColor}` }}>
                  {entry.avatar}
                </div>
                <p className="text-white text-xs font-semibold text-center mb-1 truncate w-full text-center">{entry.name}</p>
                <p className="text-xs font-bold mb-2" style={{ color: colors[podiumIdx] }}>{entry.score} điểm</p>
                <div
                  className={`w-full ${heights[podiumIdx]} rounded-t-xl flex items-center justify-center`}
                  style={{ backgroundColor: `${colors[podiumIdx]}20`, border: `1px solid ${colors[podiumIdx]}30` }}
                >
                  <span className="text-2xl font-black" style={{ color: colors[podiumIdx] }}>{labels[podiumIdx]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full leaderboard */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Top 10 điểm cao nhất</h3>
            <span className="text-white/30 text-xs">{periodLabels[period]}</span>
          </div>
          <div className="divide-y divide-white/5">
            {entries.map((entry) => {
              const isMe = entry.userId === (user?.id || "me");
              const avatarColor = AVATAR_COLORS[entry.rank % AVATAR_COLORS.length];
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isMe ? "bg-[#e8c84a]/5" : "hover:bg-white/3"}`}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
                  >
                    {entry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold truncate ${isMe ? "text-[#e8c84a]" : "text-white"}`}>
                        {entry.name}
                        {isMe && <span className="ml-1 text-[10px] text-[#e8c84a]/60">(Bạn)</span>}
                      </p>
                    </div>
                    <p className="text-white/30 text-xs">{entry.examType} • {entry.correct}/{entry.total} câu đúng</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ScoreBar score={entry.score} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My rank if not in top 10 */}
        {myRank && myRank > 10 && (
          <div className="mt-3 bg-[#e8c84a]/8 border border-[#e8c84a]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#e8c84a]/20">
              <span className="text-[#e8c84a] text-xs font-bold">{myRank}</span>
            </div>
            <p className="text-[#e8c84a] text-sm">Xếp hạng của bạn: #{myRank}</p>
            <button
              onClick={() => navigate("/eps-mock-exam")}
              className="ml-auto text-xs px-3 py-1.5 bg-[#e8c84a] text-[#0f1117] rounded-lg font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
            >
              Cải thiện điểm
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/eps-mock-exam")}
            className="flex items-center justify-center gap-2 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-fill"></i>
            Thi thử ngay
          </button>
          <button
            onClick={() => navigate("/eps-exam-history")}
            className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm font-medium hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-history-line"></i>
            Lịch sử thi
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
