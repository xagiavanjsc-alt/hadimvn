import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { readJSON } from "@/utils/safeStorage";

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

// Leaderboard data fetched from exam_results + user_profiles (không còn mock)

const EXAM_TYPE_LABELS: Record<string, string> = {
  eps_mock: "Thi mô phỏng thật",
  eps_topic: "Thi theo chủ đề",
  eps_quick: "Ôn tập nhanh",
  eps: "Thi EPS",
};

const AVATAR_COLORS = [
  "app-accent-primary", "#34d399", "#06b6d4", "#a78bfa", "#f87171",
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
  const color = score >= 80 ? "#34d399" : score >= 60 ? "app-accent-primary" : "#f87171";
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
  const history = readJSON<{ score: number }[]>("kts_eps_exam_history", []);
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.score)) : null;
  const lastScore = history.length > 0 ? history[0].score : null;

  return (
    <div className="bg-app-accent-primary/8 border border-app-accent-primary/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-app-accent-primary font-semibold text-sm flex items-center gap-2">
          <i className="ri-user-star-line"></i>
          Điểm của bạn
        </h3>
        <button
          onClick={() => navigate("/eps-mock-exam")}
          className="text-xs px-3 py-1.5 bg-app-accent-primary text-app-bg rounded-lg font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
        >
          Thi ngay
        </button>
      </div>
      {bestScore !== null ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-bold text-app-accent-primary">{bestScore}</p>
            <p className="text-app-text-secondary text-xs">Điểm cao nhất</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{lastScore}</p>
            <p className="text-app-text-secondary text-xs">Lần thi gần nhất</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{history.length}</p>
            <p className="text-app-text-secondary text-xs">Lần đã thi</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-app-text-secondary text-sm">Bạn chưa thi lần nào</p>
          <p className="text-app-text-muted text-xs mt-1">Thi thử để xem điểm của bạn trên BXH</p>
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
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard thật từ exam_results + user_profiles
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("exam_results")
          .select("id, user_id, score, total, exam_type, created_at")
          .ilike("exam_type", "eps%");

        // Filter theo period
        if (period === "week") {
          const wAgo = new Date();
          wAgo.setDate(wAgo.getDate() - 7);
          query = query.gte("created_at", wAgo.toISOString());
        } else if (period === "month") {
          const mAgo = new Date();
          mAgo.setMonth(mAgo.getMonth() - 1);
          query = query.gte("created_at", mAgo.toISOString());
        }

        // Filter theo exam type
        if (examType === "mock") query = query.ilike("exam_type", "%mock%");
        else if (examType === "topic") query = query.ilike("exam_type", "%topic%");
        else if (examType === "quick") query = query.ilike("exam_type", "%quick%");

        const { data: rows } = await query
          .order("score", { ascending: false })
          .limit(100); // lấy nhiều để tính rank của user

        if (cancelled || !rows) return;

        // Gộp theo user_id, giữ điểm cao nhất (pct)
        const bestByUser: Record<string, { score: number; correct: number; total: number; exam_type: string; created_at: string }> = {};
        rows.forEach((r: { user_id: string; score: number; total: number; exam_type: string; created_at: string }) => {
          const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
          const existing = bestByUser[r.user_id];
          if (!existing || pct > existing.score) {
            bestByUser[r.user_id] = {
              score: pct,
              correct: r.score,
              total: r.total,
              exam_type: r.exam_type,
              created_at: r.created_at,
            };
          }
        });

        const userIds = Object.keys(bestByUser);
        if (userIds.length === 0) {
          setEntries([]);
          setLoading(false);
          return;
        }

        // Lấy display_name cho tất cả users
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, display_name")
          .in("id", userIds);

        if (cancelled) return;
        const nameMap = Object.fromEntries(
          (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name || "Học viên"])
        );

        const combined: LeaderboardEntry[] = userIds
          .map(uid => {
            const d = bestByUser[uid];
            const name = nameMap[uid] || "Học viên";
            return {
              rank: 0,
              userId: uid,
              name,
              avatar: name.charAt(0).toUpperCase(),
              score: d.score,
              correct: d.correct,
              total: d.total,
              examType: EXAM_TYPE_LABELS[d.exam_type] || "Thi EPS",
              date: d.created_at,
            };
          })
          .sort((a, b) => b.score - a.score)
          .map((e, i) => ({ ...e, rank: i + 1 }));

        const myIdx = user?.id ? combined.findIndex(e => e.userId === user.id) : -1;
        if (myIdx >= 0) setMyRank(myIdx + 1);
        else setMyRank(null);

        setEntries(combined.slice(0, 10));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [period, examType, user?.id, profile]);

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
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/15">
              <i className="ri-trophy-line text-app-accent-primary text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bảng xếp hạng EPS</h1>
              <p className="text-app-text-secondary text-sm">So sánh điểm thi thử với cộng đồng</p>
            </div>
          </div>
        </div>

        {/* My score */}
        <MyScoreCard />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1 bg-app-card/50 border border-app-border rounded-xl p-1">
            {(["week", "month", "alltime"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  period === p ? "bg-app-accent-primary text-app-bg" : "text-white/50 hover:text-white/80"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <select
            value={examType}
            onChange={e => setExamType(e.target.value as ExamType)}
            className="bg-app-card/50 border border-app-border rounded-xl px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả loại thi</option>
            <option value="mock">Thi mô phỏng thật</option>
            <option value="topic">Thi theo chủ đề</option>
            <option value="quick">Ôn tập nhanh</option>
          </select>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
            if (!entry) return <div key={podiumIdx} />;
            const heights = ["h-24", "h-32", "h-20"];
            const colors = ["#9ca3af", "app-accent-primary", "#cd7f32"];
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
                  <span className="text-xl font-bold" style={{ color: colors[podiumIdx] }}>{labels[podiumIdx]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full leaderboard */}
        <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Top 10 điểm cao nhất</h3>
            <span className="text-app-text-muted text-xs">{periodLabels[period]}</span>
          </div>
          {loading ? (
            <div className="py-10 text-center text-app-text-muted text-sm">Đang tải bảng xếp hạng...</div>
          ) : entries.length === 0 ? (
            <div className="py-10 text-center">
              <i className="ri-trophy-line text-app-text-muted text-4xl mb-2 block"></i>
              <p className="text-app-text-secondary text-sm">Chưa có ai thi EPS trong {periodLabels[period].toLowerCase()}</p>
              <p className="text-app-text-muted text-xs mt-1">Hãy là người đầu tiên!</p>
            </div>
          ) : (
          <div className="divide-y divide-white/5">
            {entries.map((entry) => {
              const isMe = entry.userId === (user?.id || "me");
              const avatarColor = AVATAR_COLORS[entry.rank % AVATAR_COLORS.length];
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isMe ? "bg-app-accent-primary/5" : "hover:bg-app-surface/50"}`}
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
                      <p className={`text-sm font-semibold truncate ${isMe ? "text-app-accent-primary" : "text-white"}`}>
                        {entry.name}
                        {isMe && <span className="ml-1 text-[10px] text-app-accent-primary/60">(Bạn)</span>}
                      </p>
                    </div>
                    <p className="text-app-text-muted text-xs">{entry.examType} • {entry.correct}/{entry.total} câu đúng</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ScoreBar score={entry.score} />
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* My rank if not in top 10 */}
        {myRank && myRank > 10 && (
          <div className="mt-3 bg-app-accent-primary/8 border border-app-accent-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-app-accent-primary/20">
              <span className="text-app-accent-primary text-xs font-bold">{myRank}</span>
            </div>
            <p className="text-app-accent-primary text-sm">Xếp hạng của bạn: #{myRank}</p>
            <button
              onClick={() => navigate("/eps-mock-exam")}
              className="ml-auto text-xs px-3 py-1.5 bg-app-accent-primary text-app-bg rounded-lg font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
            >
              Cải thiện điểm
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/eps-mock-exam")}
            className="flex items-center justify-center gap-2 py-3 bg-app-accent-primary text-app-bg rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-fill"></i>
            Thi thử ngay
          </button>
          <button
            onClick={() => navigate("/eps-exam-history")}
            className="flex items-center justify-center gap-2 py-3 bg-app-card/50 border border-app-border rounded-xl text-white/70 text-sm font-medium hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-history-line"></i>
            Lịch sử thi
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}


