import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { computeXP, deriveLevel } from "@/lib/xp";

interface ExamResult {
  date: string;
  score: number;
  total: number;
  correctIds?: string[];
}

interface LeaderboardPlayer {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  level: string;
  streak: number;
  best_score: number;
  words_learned: number;
  xp: number;
  updated_at: string;
  isCurrentUser?: boolean;
}

type SortKey = "xp" | "streak" | "best_score" | "words_learned";
type Period = "all" | "month" | "week";

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: "xp", label: "Điểm XP", icon: "ri-star-line" },
  { key: "streak", label: "Streak", icon: "ri-fire-line" },
  { key: "best_score", label: "Điểm EPS cao nhất", icon: "ri-trophy-line" },
  { key: "words_learned", label: "Từ đã học", icon: "ri-book-open-line" },
];

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_ICONS = ["ri-trophy-fill", "ri-medal-fill", "ri-award-fill"];

function AvatarCell({ player, size = 36 }: { player: LeaderboardPlayer; size?: number }) {
  if (player.isCurrentUser) {
    return (
      <div
        className="rounded-full bg-[#e8c84a]/15 border border-[#e8c84a]/30 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <i className="ri-user-3-line text-[#e8c84a] text-sm"></i>
      </div>
    );
  }
  if (player.avatar_url) {
    return (
      <img
        src={player.avatar_url}
        alt={player.display_name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = player.display_name.slice(0, 2).toUpperCase();
  const colors = ["#e8c84a", "#34d399", "#fb923c", "#a78bfa", "#06b6d4", "#f87171"];
  const colorIdx = player.display_name.charCodeAt(0) % colors.length;
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#0f1117] text-xs"
      style={{ width: size, height: size, backgroundColor: colors[colorIdx] }}
    >
      {initials}
    </div>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("xp");
  const [period, setPeriod] = useState<Period>("all");
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Local stats for current user
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [examResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_results", []);
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});

  const myBestScore = examResults.length > 0
    ? Math.max(...examResults.map((r) => Math.round((r.score / r.total) * 100)))
    : 0;
  const myAvgScore = examResults.length > 0
    ? Math.round(examResults.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / examResults.length)
    : 0;
  const myTotalCorrect = examResults.reduce((sum, r) => sum + (r.correctIds?.length ?? r.score ?? 0), 0);
  const myWordsLearned = Object.values(flashcardKnown).filter(Boolean).length;
  const myXp = computeXP({
    streakDays: streak.count,
    bestScorePct: myBestScore,
    averageScorePct: myAvgScore,
    wordsLearned: myWordsLearned,
    totalCorrectAnswers: myTotalCorrect,
    validExamsCount: examResults.length,
  });

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order(sortKey, { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped: LeaderboardPlayer[] = (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        display_name: row.display_name || "Học viên",
        avatar_url: row.avatar_url,
        level: row.level || "Cơ bản",
        streak: row.streak || 0,
        best_score: row.best_score || 0,
        words_learned: row.words_learned || 0,
        xp: row.xp || 0,
        updated_at: row.updated_at,
        isCurrentUser: user ? row.user_id === user.id : false,
      }));

      // If current user not in list, add them
      if (user) {
        const hasMe = mapped.some((p) => p.user_id === user.id);
        if (!hasMe) {
          const myEntry: LeaderboardPlayer = {
            id: "me-local",
            user_id: user.id,
            display_name: profile?.display_name || "Bạn",
            avatar_url: profile?.avatar_url || null,
            level: deriveLevel(myBestScore),
            streak: streak.count,
            best_score: myBestScore,
            words_learned: myWordsLearned,
            xp: myXp,
            updated_at: new Date().toISOString(),
            isCurrentUser: true,
          };
          mapped.push(myEntry);
          mapped.sort((a, b) => b[sortKey] - a[sortKey]);
        }
      }

      setPlayers(mapped);
      setLastRefresh(new Date());
    } catch {
      // fallback: show only current user if logged in
      if (user) {
        const myEntry: LeaderboardPlayer = {
          id: "me-local",
          user_id: user.id,
          display_name: profile?.display_name || "Bạn",
          avatar_url: profile?.avatar_url || null,
          level: deriveLevel(myBestScore),
          streak: streak.count,
          best_score: myBestScore,
          words_learned: myWordsLearned,
          xp: myXp,
          updated_at: new Date().toISOString(),
          isCurrentUser: true,
        };
        setPlayers([myEntry]);
      }
    } finally {
      setLoading(false);
    }
  }, [sortKey, user, profile, streak.count, myBestScore, myWordsLearned, myXp]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b[sortKey] - a[sortKey]);
  }, [players, sortKey]);

  const myRank = sortedPlayers.findIndex((p) => p.isCurrentUser) + 1;
  const myEntry = sortedPlayers.find((p) => p.isCurrentUser);
  const top3 = sortedPlayers.slice(0, 3);

  return (
    <DashboardLayout title="Bảng xếp hạng" subtitle="So sánh tiến độ với học viên khác">
      <div className="space-y-6">

        {/* My Rank Banner */}
        <div className="bg-gradient-to-r from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#e8c84a]/15 flex items-center justify-center">
                {user && profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <i className="ri-user-3-line text-[#e8c84a] text-2xl"></i>
                )}
              </div>
              {myRank > 0 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0f1117] border border-[#e8c84a]/30 flex items-center justify-center">
                  <span className="text-[#e8c84a] text-[10px] font-bold">#{myRank}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-bold text-base">
                  {user ? (profile?.display_name || "Bạn") : "Xếp hạng của bạn"}
                </p>
                {myRank > 0 && (
                  <span className="bg-[#e8c84a]/10 text-[#e8c84a] text-xs px-2 py-0.5 rounded-full font-medium">
                    #{myRank} / {sortedPlayers.length}
                  </span>
                )}
                {!user && (
                  <span className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded-full">
                    Chưa đăng nhập
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm">
                {!user
                  ? "Đăng nhập để xuất hiện trên bảng xếp hạng"
                  : myRank <= 0
                  ? "Hoàn thành bài học để lên bảng xếp hạng"
                  : myRank <= 3
                  ? "Top 3! Xuất sắc lắm!"
                  : myRank <= 5
                  ? "Gần top 3 rồi — cố lên!"
                  : myEntry && sortedPlayers[myRank - 2]
                  ? `Cần thêm ${(sortedPlayers[myRank - 2][sortKey] - myEntry[sortKey]).toLocaleString()} điểm để vượt hạng`
                  : "Tiếp tục học để leo hạng!"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "XP", value: myXp.toLocaleString(), color: "#e8c84a" },
                { label: "Streak", value: `${streak.count}d`, color: "#fb923c" },
                { label: "EPS cao nhất", value: myBestScore > 0 ? `${myBestScore}%` : "—", color: "#4ade80" },
                { label: "Từ đã học", value: myWordsLearned, color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-white/40 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && top3.length >= 3 && (
          <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-sm mb-6 text-center">Top 3 học viên xuất sắc</h2>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <AvatarCell player={top3[1]} size={56} />
                  <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center">
                    <span className="text-[#0f1117] text-[10px] font-bold">2</span>
                  </div>
                </div>
                <p className="text-white/70 text-xs font-medium text-center max-w-[80px] truncate">{top3[1]?.display_name}</p>
                <p className="text-white/40 text-[10px]">{top3[1]?.[sortKey].toLocaleString()}</p>
                <div className="w-20 bg-[#C0C0C0]/20 border border-[#C0C0C0]/30 rounded-t-lg flex items-center justify-center" style={{ height: "60px" }}>
                  <i className="ri-medal-fill text-[#C0C0C0] text-xl"></i>
                </div>
              </div>

              {/* 1st */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-vip-crown-fill text-[#FFD700] text-xl"></i>
                </div>
                <div className="relative">
                  <AvatarCell player={top3[0]} size={72} />
                  <div className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-[#FFD700] flex items-center justify-center">
                    <span className="text-[#0f1117] text-xs font-bold">1</span>
                  </div>
                </div>
                <p className="text-white font-semibold text-sm text-center max-w-[90px] truncate">{top3[0]?.display_name}</p>
                <p className="text-[#FFD700] text-xs font-bold">{top3[0]?.[sortKey].toLocaleString()}</p>
                <div className="w-24 bg-[#FFD700]/15 border border-[#FFD700]/30 rounded-t-lg flex items-center justify-center" style={{ height: "80px" }}>
                  <i className="ri-trophy-fill text-[#FFD700] text-2xl"></i>
                </div>
              </div>

              {/* 3rd */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <AvatarCell player={top3[2]} size={56} />
                  <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center">
                    <span className="text-[#0f1117] text-[10px] font-bold">3</span>
                  </div>
                </div>
                <p className="text-white/70 text-xs font-medium text-center max-w-[80px] truncate">{top3[2]?.display_name}</p>
                <p className="text-white/40 text-[10px]">{top3[2]?.[sortKey].toLocaleString()}</p>
                <div className="w-20 bg-[#CD7F32]/20 border border-[#CD7F32]/30 rounded-t-lg flex items-center justify-center" style={{ height: "45px" }}>
                  <i className="ri-award-fill text-[#CD7F32] text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  sortKey === opt.key
                    ? "bg-[#e8c84a]/15 text-[#e8c84a] border border-[#e8c84a]/25"
                    : "bg-white/3 text-white/50 border border-white/8 hover:text-white/70"
                }`}
              >
                <i className={opt.icon}></i>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-white/20 text-[10px]">
                Cập nhật {lastRefresh.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/3 text-white/40 border border-white/8 hover:text-white/60 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
            >
              <i className={`ri-refresh-line ${loading ? "animate-spin" : ""}`}></i>
              Làm mới
            </button>
            <div className="flex items-center gap-1 bg-white/3 border border-white/8 rounded-lg p-1">
              {(["week", "month", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${
                    period === p ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Tất cả"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_120px_100px_100px_100px_100px] gap-0 px-5 py-3 border-b border-white/5">
            <span className="text-white/25 text-[10px] tracking-normal">#</span>
            <span className="text-white/25 text-[10px] tracking-normal">Học viên</span>
            <span className="text-white/25 text-[10px] tracking-normal text-right">XP</span>
            <span className="text-white/25 text-[10px] tracking-normal text-right">Streak</span>
            <span className="text-white/25 text-[10px] tracking-normal text-right">EPS cao nhất</span>
            <span className="text-white/25 text-[10px] tracking-normal text-right">Từ đã học</span>
            <span className="text-white/25 text-[10px] tracking-normal text-right">Cấp độ</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
              <p className="text-white/30 text-sm">Đang tải bảng xếp hạng...</p>
            </div>
          ) : sortedPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <i className="ri-trophy-line text-white/10 text-4xl"></i>
              <p className="text-white/30 text-sm">Chưa có học viên nào</p>
              <p className="text-white/20 text-xs">Hãy là người đầu tiên lên bảng xếp hạng!</p>
            </div>
          ) : (
            sortedPlayers.map((player, idx) => {
              const rank = idx + 1;
              const isMe = player.isCurrentUser;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={player.id}
                  className={`grid grid-cols-[48px_1fr_120px_100px_100px_100px_100px] gap-0 px-5 py-3.5 border-b border-white/3 transition-colors ${
                    isMe
                      ? "bg-[#e8c84a]/5 border-l-2 border-l-[#e8c84a]/40"
                      : "hover:bg-white/2"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    {isTop3 ? (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${RANK_COLORS[rank - 1]}18` }}>
                        <i className={`${RANK_ICONS[rank - 1]} text-sm`} style={{ color: RANK_COLORS[rank - 1] }}></i>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold ${isMe ? "text-[#e8c84a]" : "text-white/30"}`}>
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => !isMe && navigate(`/member/${player.user_id}`)}
                      className={`flex-shrink-0 ${!isMe ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}`}
                      title={!isMe ? `Xem hồ sơ ${player.display_name}` : ""}
                    >
                      <AvatarCell player={player} size={36} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => !isMe && navigate(`/member/${player.user_id}`)}
                          className={`text-sm font-medium transition-colors ${isMe ? "text-[#e8c84a] cursor-default" : "text-white/80 hover:text-[#e8c84a]/80 cursor-pointer"}`}
                        >
                          {player.display_name}
                          {isMe && <span className="ml-1 text-[10px] text-[#e8c84a]/60">(Bạn)</span>}
                        </button>
                        {!isMe && (
                          <button
                            onClick={() => navigate(`/member/${player.user_id}`)}
                            className="text-white/20 hover:text-[#a78bfa]/70 transition-colors cursor-pointer"
                            title="Xem hồ sơ"
                          >
                            <i className="ri-user-line text-[10px]"></i>
                          </button>
                        )}
                      </div>
                      <p className="text-white/30 text-[10px] mt-0.5">{player.level}</p>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex items-center justify-end">
                    <span className={`text-sm font-bold ${sortKey === "xp" ? "text-[#e8c84a]" : "text-white/60"}`}>
                      {player.xp.toLocaleString()}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center justify-end gap-1">
                    <i className="ri-fire-line text-[#fb923c] text-xs"></i>
                    <span className={`text-sm ${sortKey === "streak" ? "text-[#fb923c] font-bold" : "text-white/60"}`}>
                      {player.streak}
                    </span>
                  </div>

                  {/* Best Score */}
                  <div className="flex items-center justify-end">
                    <span className={`text-sm ${sortKey === "best_score" ? "text-[#4ade80] font-bold" : "text-white/60"}`}>
                      {player.best_score > 0 ? `${player.best_score}%` : "—"}
                    </span>
                  </div>

                  {/* Words */}
                  <div className="flex items-center justify-end">
                    <span className={`text-sm ${sortKey === "words_learned" ? "text-[#a78bfa] font-bold" : "text-white/60"}`}>
                      {player.words_learned.toLocaleString()}
                    </span>
                  </div>

                  {/* Level */}
                  <div className="flex items-center justify-end">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      player.level === "TOPIK II"
                        ? "bg-[#e8c84a]/10 text-[#e8c84a]"
                        : player.level === "TOPIK I"
                        ? "bg-[#4ade80]/10 text-[#4ade80]"
                        : "bg-white/5 text-white/40"
                    }`}>
                      {player.level}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Login CTA if not logged in */}
        {!user && (
          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#e8c84a]/10 flex items-center justify-center flex-shrink-0">
              <i className="ri-user-add-line text-[#e8c84a] text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-1">Đăng nhập để lên bảng xếp hạng</p>
              <p className="text-white/50 text-xs leading-relaxed">
                Tạo tài khoản miễn phí để lưu tiến độ lên cloud và cạnh tranh với học viên KTS trên toàn quốc!
              </p>
            </div>
          </div>
        )}

        {/* Motivational note */}
        <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#e8c84a]/10 flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-[#e8c84a] text-lg"></i>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-1">Cách tăng hạng nhanh nhất</p>
            <p className="text-white/50 text-xs leading-relaxed">
              Duy trì streak mỗi ngày (+50 XP/ngày), làm bài thi thử EPS (+10 XP/%), học flashcard (+5 XP/từ). Chỉ cần học 20 phút/ngày là đủ để leo hạng đều đặn!
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={() => navigate("/daily-plan")} className="flex items-center gap-1.5 bg-[#e8c84a]/10 text-[#e8c84a] text-xs px-3 py-1.5 rounded-lg hover:bg-[#e8c84a]/20 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-route-line"></i>
                Lộ trình hôm nay
              </button>
              <button onClick={() => navigate("/eps-exam")} className="flex items-center gap-1.5 bg-white/5 text-white/60 text-xs px-3 py-1.5 rounded-lg hover:bg-white/8 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-timer-line"></i>
                Thi thử EPS
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

