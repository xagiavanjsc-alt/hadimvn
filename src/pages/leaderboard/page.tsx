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
  is_vip?: boolean;
  vip_expires_at?: string | null;
  isCurrentUser?: boolean;
}

type SortKey = "xp" | "streak" | "best_score" | "words_learned";
type Period = "all" | "month" | "week";

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: "xp", label: "Ði?m XP", icon: "ri-star-line" },
  { key: "streak", label: "Streak", icon: "ri-fire-line" },
  { key: "best_score", label: "Ði?m EPS cao nh?t", icon: "ri-trophy-line" },
  { key: "words_learned", label: "T? dã h?c", icon: "ri-book-open-line" },
];

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_ICONS = ["ri-trophy-fill", "ri-medal-fill", "ri-award-fill"];

function AvatarCell({ player, size = 36 }: { player: LeaderboardPlayer; size?: number }) {
  const isActiveVip = player.is_vip && (!player.vip_expires_at || new Date(player.vip_expires_at).getTime() > Date.now());
  const ringClass = isActiveVip ? "ring-2 ring-[app-accent-primary]/60" : "";
  
  if (player.isCurrentUser) {
    return (
      <div
        className={`rounded-full bg-app-accent-primary/15 border border-app-accent-primary/30 flex items-center justify-center flex-shrink-0 ${ringClass}`}
        style={{ width: size, height: size }}
      >
        <i className="ri-user-3-line text-app-accent-primary text-sm"></i>
      </div>
    );
  }
  if (player.avatar_url) {
    return (
      <img
        src={player.avatar_url}
        alt={player.display_name}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = player.display_name.slice(0, 2).toUpperCase();
  const colors = ["app-accent-primary", "#34d399", "#fb923c", "#a78bfa", "#06b6d4", "#f87171"];
  const colorIdx = player.display_name.charCodeAt(0) % colors.length;
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-app-bg text-xs ${ringClass}`}
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
        display_name: row.display_name || "H?c viên",
        avatar_url: row.avatar_url,
        level: row.level || "Co b?n",
        streak: row.streak || 0,
        best_score: row.best_score || 0,
        words_learned: row.words_learned || 0,
        xp: row.xp || 0,
        updated_at: row.updated_at,
        is_vip: row.is_vip || false,
        vip_expires_at: row.vip_expires_at || null,
        isCurrentUser: user ? row.user_id === user.id : false,
      }));

      // If current user not in list, add them
      if (user) {
        const hasMe = mapped.some((p) => p.user_id === user.id);
        if (!hasMe) {
          const myEntry: LeaderboardPlayer = {
            id: "me-local",
            user_id: user.id,
            display_name: profile?.display_name || "B?n",
            avatar_url: profile?.avatar_url || null,
            level: deriveLevel(myBestScore),
            streak: streak.count,
            best_score: myBestScore,
            words_learned: myWordsLearned,
            xp: myXp,
            updated_at: new Date().toISOString(),
            is_vip: profile?.is_vip || false,
            vip_expires_at: profile?.vip_expires_at || null,
            isCurrentUser: true,
          };
          mapped.push(myEntry);
          mapped.sort((a, b) => b[sortKey] - a[sortKey]);
        }
      }

      setPlayers(mapped);
      setLastRefresh(new Date());
    } catch {
      // fallback: gi? data cu n?u có, ch? thay th? cho user logged in
      if (user) {
        const myEntry: LeaderboardPlayer = {
          id: "me-local",
          user_id: user.id,
          display_name: profile?.display_name || "B?n",
          avatar_url: profile?.avatar_url || null,
          level: deriveLevel(myBestScore),
          streak: streak.count,
          best_score: myBestScore,
          words_learned: myWordsLearned,
          xp: myXp,
          updated_at: new Date().toISOString(),
          is_vip: profile?.is_vip || false,
          vip_expires_at: profile?.vip_expires_at || null,
          isCurrentUser: true,
        };
        // Gi? data cu + thêm user entry
        setPlayers(prev => {
          const filtered = prev.filter(p => !p.isCurrentUser);
          return [...filtered, myEntry];
        });
      }
      // Guests: gi? data cu, không set r?ng
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
    <DashboardLayout title="B?ng x?p h?ng" subtitle="So sánh ti?n d? v?i h?c viên khác">
      <div className="space-y-6">

        {/* My Rank Banner */}
        <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/15 rounded-2xl p-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-app-accent-primary/15 flex items-center justify-center">
                {user && profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <i className="ri-user-3-line text-app-accent-primary text-2xl"></i>
                )}
              </div>
              {myRank > 0 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-app-bg border border-app-accent-primary/30 flex items-center justify-center">
                  <span className="text-app-accent-primary text-[10px] font-bold">#{myRank}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-bold text-base">
                  {user ? (profile?.display_name || "B?n") : "X?p h?ng c?a b?n"}
                </p>
                {myRank > 0 && (
                  <span className="bg-app-accent-primary/10 text-app-accent-primary text-xs px-2 py-0.5 rounded-full font-medium">
                    #{myRank} / {sortedPlayers.length}
                  </span>
                )}
                {!user && (
                  <span className="bg-app-card/50 text-app-text-secondary text-xs px-2 py-0.5 rounded-full">
                    Chua dang nh?p
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm">
                {!user
                  ? "Ðang nh?p d? xu?t hi?n trên b?ng x?p h?ng"
                  : myRank <= 0
                  ? "Hoàn thành bài h?c d? lên b?ng x?p h?ng"
                  : myRank <= 3
                  ? "Top 3! Xu?t s?c l?m!"
                  : myRank <= 5
                  ? "G?n top 3 r?i — c? lên!"
                  : myEntry && sortedPlayers[myRank - 2]
                  ? `C?n thêm ${(sortedPlayers[myRank - 2][sortKey] - myEntry[sortKey]).toLocaleString()} di?m d? vu?t h?ng`
                  : "Ti?p t?c h?c d? leo h?ng!"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "XP", value: myXp.toLocaleString(), color: "app-accent-primary" },
                { label: "Streak", value: `${streak.count}d`, color: "#fb923c" },
                { label: "EPS cao nh?t", value: myBestScore > 0 ? `${myBestScore}%` : "—", color: "#4ade80" },
                { label: "T? dã h?c", value: myWordsLearned, color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-app-text-secondary text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && top3.length >= 3 && (
          <div className="bg-white/2 border border-app-border rounded-2xl p-6">
            <h2 className="text-white font-semibold text-sm mb-6 text-center">Top 3 h?c viên xu?t s?c</h2>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <AvatarCell player={top3[1]} size={56} />
                  <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center">
                    <span className="text-app-bg text-[10px] font-bold">2</span>
                  </div>
                </div>
                <p className="text-white/70 text-xs font-medium text-center max-w-[80px] truncate">{top3[1]?.display_name}</p>
                <p className="text-app-text-secondary text-[10px]">{top3[1]?.[sortKey].toLocaleString()}</p>
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
                    <span className="text-app-bg text-xs font-bold">1</span>
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
                    <span className="text-app-bg text-[10px] font-bold">3</span>
                  </div>
                </div>
                <p className="text-white/70 text-xs font-medium text-center max-w-[80px] truncate">{top3[2]?.display_name}</p>
                <p className="text-app-text-secondary text-[10px]">{top3[2]?.[sortKey].toLocaleString()}</p>
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
                    ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25"
                    : "bg-app-surface/50 text-white/50 border border-app-border hover:text-white/70"
                }`}
              >
                <i className={opt.icon}></i>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-app-text-muted text-[10px]">
                C?p nh?t {lastRefresh.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
            >
              <i className={`ri-refresh-line ${loading ? "animate-spin" : ""}`}></i>
              Làm m?i
            </button>
            <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-lg p-1">
              {(["week", "month", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${
                    period === p ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"
                  }`}
                >
                  {p === "week" ? "Tu?n" : p === "month" ? "Tháng" : "T?t c?"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-white/2 border border-app-border rounded-2xl overflow-hidden">
          {/* Desktop Table - only show on sm and up */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="grid grid-cols-[48px_1fr_120px_100px_100px_100px_100px] gap-0 px-5 py-3 border-b border-app-border min-w-[600px]">
              <span className="text-app-text-muted text-[10px] tracking-normal">#</span>
              <span className="text-app-text-muted text-[10px] tracking-normal">H?c viên</span>
              <span className="text-app-text-muted text-[10px] tracking-normal text-right">XP</span>
              <span className="text-app-text-muted text-[10px] tracking-normal text-right">Streak</span>
              <span className="text-app-text-muted text-[10px] tracking-normal text-right">EPS cao nh?t</span>
              <span className="text-app-text-muted text-[10px] tracking-normal text-right">T? dã h?c</span>
              <span className="text-app-text-muted text-[10px] tracking-normal text-right">C?p d?</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
                <p className="text-app-text-muted text-sm">Ðang t?i b?ng x?p h?ng...</p>
              </div>
            ) : sortedPlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <i className="ri-trophy-line text-white/10 text-4xl"></i>
                <p className="text-app-text-muted text-sm">Chua có h?c viên nào</p>
                <p className="text-app-text-muted text-xs">Hãy là ngu?i d?u tiên lên b?ng x?p h?ng!</p>
              </div>
            ) : (
              sortedPlayers.map((player, idx) => {
                const rank = idx + 1;
                const isMe = player.isCurrentUser;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={player.id}
                    className={`grid grid-cols-[48px_1fr_120px_100px_100px_100px_100px] gap-0 px-5 py-3.5 border-b border-white/3 transition-colors min-w-[600px] ${
                      isMe
                        ? "bg-app-accent-primary/5 border-l-2 border-l-[app-accent-primary]/40"
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
                        <span className={`text-sm font-bold ${isMe ? "text-app-accent-primary" : "text-app-text-muted"}`}>
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => !isMe && navigate(`/member/${player.user_id}`)}
                        className={`flex-shrink-0 ${!isMe ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}`}
                        title={!isMe ? `Xem h? so ${player.display_name}` : ""}
                      >
                        <AvatarCell player={player} size={36} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => !isMe && navigate(`/member/${player.user_id}`)}
                            className={`text-sm font-medium transition-colors ${isMe ? "text-app-accent-primary cursor-default" : "text-white/80 hover:text-app-accent-primary/80 cursor-pointer"}`}
                          >
                            {player.display_name}
                            {isMe && <span className="ml-1 text-[10px] text-app-accent-primary/60">(B?n)</span>}
                          </button>
                          {player.is_vip && (!player.vip_expires_at || new Date(player.vip_expires_at).getTime() > Date.now()) && (
                            <span className="flex items-center gap-0.5 bg-app-accent-primary/15 text-app-accent-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-app-accent-primary/25" title="Thành viên VIP">
                              <i className="ri-vip-crown-fill text-[10px]"></i>
                              VIP
                            </span>
                          )}
                          {!isMe && (
                            <button
                              onClick={() => navigate(`/member/${player.user_id}`)}
                              className="text-app-text-muted hover:text-[#a78bfa]/70 transition-colors cursor-pointer"
                              title="Xem h? so"
                            >
                              <i className="ri-user-line text-[10px]"></i>
                            </button>
                          )}
                        </div>
                        <p className="text-app-text-muted text-[10px] mt-0.5">{player.level}</p>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="flex items-center justify-end">
                      <span className={`text-sm font-bold ${sortKey === "xp" ? "text-app-accent-primary" : "text-white/60"}`}>
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
                          ? "bg-app-accent-primary/10 text-app-accent-primary"
                          : player.level === "TOPIK I"
                          ? "bg-[#4ade80]/10 text-[#4ade80]"
                          : "bg-app-card/50 text-app-text-secondary"
                      }`}>
                        {player.level}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Mobile Card Layout - only show on mobile */}
          <div className="sm:hidden p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
                <p className="text-app-text-muted text-sm">Ðang t?i b?ng x?p h?ng...</p>
              </div>
            ) : sortedPlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <i className="ri-trophy-line text-white/10 text-4xl"></i>
                <p className="text-app-text-muted text-sm">Chua có h?c viên nào</p>
                <p className="text-app-text-muted text-xs">Hãy là ngu?i d?u tiên lên b?ng x?p h?ng!</p>
              </div>
            ) : (
              sortedPlayers.map((player, idx) => {
                const rank = idx + 1;
                const isMe = player.isCurrentUser;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={player.id}
                    className={`bg-app-surface/50 border rounded-xl p-4 transition-colors ${
                      isMe
                        ? "bg-app-accent-primary/5 border-app-accent-primary/30"
                        : "border-app-border hover:bg-app-card/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {isTop3 ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${RANK_COLORS[rank - 1]}18` }}>
                            <i className={`${RANK_ICONS[rank - 1]} text-sm`} style={{ color: RANK_COLORS[rank - 1] }}></i>
                          </div>
                        ) : (
                          <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-app-card/50 ${isMe ? "text-app-accent-primary" : "text-app-text-muted"}`}>
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Player */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => !isMe && navigate(`/member/${player.user_id}`)}
                            className="flex-shrink-0"
                          >
                            <AvatarCell player={player} size={32} />
                          </button>
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => !isMe && navigate(`/member/${player.user_id}`)}
                              className={`text-sm font-medium truncate transition-colors ${isMe ? "text-app-accent-primary cursor-default" : "text-white/80 hover:text-app-accent-primary/80 cursor-pointer"}`}
                            >
                              {player.display_name}
                              {isMe && <span className="ml-1 text-[10px] text-app-accent-primary/60">(B?n)</span>}
                              {player.is_vip && (!player.vip_expires_at || new Date(player.vip_expires_at).getTime() > Date.now()) && (
                                <i className="ri-vip-crown-fill text-app-accent-primary text-[11px] ml-1" title="VIP"></i>
                              )}
                            </button>
                            <p className="text-app-text-muted text-[10px] mt-0.5 truncate">{player.level}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-app-surface/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-app-text-muted mb-0.5">XP</p>
                        <p className={`text-sm font-bold ${sortKey === "xp" ? "text-app-accent-primary" : "text-white/60"}`}>
                          {player.xp.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-app-surface/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-app-text-muted mb-0.5">Streak</p>
                        <p className={`text-sm font-bold ${sortKey === "streak" ? "text-[#fb923c]" : "text-white/60"}`}>
                          {player.streak}
                        </p>
                      </div>
                      <div className="bg-app-surface/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-app-text-muted mb-0.5">EPS</p>
                        <p className={`text-sm font-bold ${sortKey === "best_score" ? "text-[#4ade80]" : "text-white/60"}`}>
                          {player.best_score > 0 ? `${player.best_score}%` : "—" }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Login CTA if not logged in */}
        {!user && (
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-app-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <i className="ri-user-add-line text-app-accent-primary text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-1">Ðang nh?p d? lên b?ng x?p h?ng</p>
              <p className="text-white/50 text-xs leading-relaxed">
                T?o tài kho?n mi?n phí d? luu ti?n d? lên cloud và c?nh tranh v?i h?c viên KTS trên toàn qu?c!
              </p>
            </div>
          </div>
        )}

        {/* --- XP Rules: how to earn / lose XP ------------------------- */}
        <div className="bg-white/2 border border-app-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-app-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <i className="ri-medal-line text-app-accent-primary text-lg"></i>
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Cách tính di?m XP</h2>
              <p className="text-app-text-muted text-xs">Minh b?ch — h?c dúng cách d? leo top nhanh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cách ki?m XP */}
            <div>
              <h3 className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs uppercase tracking-wide mb-3">
                <i className="ri-arrow-up-line"></i>Cách ki?m XP
              </h3>
              <ul className="space-y-2">
                {[
                  { icon: "ri-login-circle-line", label: "Ðang nh?p hàng ngày", xp: "+1 d?n +5 XP", note: "Random m?i ngày" },
                  { icon: "ri-fire-line", label: "Streak 7 / 14 / 30 ngày", xp: "+200 XP", note: "Bonus m?c dài h?n" },
                  { icon: "ri-timer-line", label: "Thi th? EPS-TOPIK", xp: "+15 XP / 1%", note: "Theo % câu dúng" },
                  { icon: "ri-stack-line", label: "Flashcard d?t Mastered", xp: "+10 XP / t?", note: "Ch? tính l?n d?u" },
                  { icon: "ri-translate-2", label: "H?c t? v?ng m?i", xp: "+2 XP / t?", note: "Daily Words" },
                  { icon: "ri-mic-line", label: "Luy?n phát âm chu?n", xp: "+5 XP / l?n", note: "Score = 80%" },
                  { icon: "ri-trophy-line", label: "Hoàn thành thách th?c tu?n", xp: "+70 d?n +200 XP", note: "Tùy nhi?m v?" },
                  { icon: "ri-share-line", label: "Chia s? ti?n d?", xp: "+10 XP / ngày", note: "T?i da 1 l?n/ngày" },
                ].map(r => (
                  <li key={r.label} className="flex items-start gap-2.5 bg-app-surface/40 rounded-lg p-2.5 border border-app-border">
                    <i className={`${r.icon} text-emerald-400 text-base mt-0.5 flex-shrink-0`}></i>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium">{r.label}</p>
                        <span className="text-emerald-400 text-xs font-bold whitespace-nowrap">{r.xp}</span>
                      </div>
                      <p className="text-app-text-muted text-[11px] mt-0.5">{r.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ph?t / m?t XP */}
            <div>
              <h3 className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs uppercase tracking-wide mb-3">
                <i className="ri-arrow-down-line"></i>M?t / ph?t XP
              </h3>
              <ul className="space-y-2">
                {[
                  { icon: "ri-fire-line", label: "M?t streak", xp: "-50 XP", note: "B? h?c quá 24h" },
                  { icon: "ri-time-line", label: "B? thách th?c tu?n gi?a ch?ng", xp: "-30 XP", note: "Ðã b?t d?u nên hoàn thành" },
                  { icon: "ri-spam-2-line", label: "Spam / vi ph?m c?ng d?ng", xp: "-100 XP", note: "Mod xác nh?n" },
                  { icon: "ri-error-warning-line", label: "B? báo cáo gian l?n thi", xp: "-200 XP", note: "Reset bài thi dó" },
                  { icon: "ri-flag-line", label: "B? banned t?m th?i", xp: "Reset XP tu?n", note: "Khôi ph?c sau 7 ngày" },
                ].map(r => (
                  <li key={r.label} className="flex items-start gap-2.5 bg-app-surface/40 rounded-lg p-2.5 border border-app-border">
                    <i className={`${r.icon} text-rose-400 text-base mt-0.5 flex-shrink-0`}></i>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium">{r.label}</p>
                        <span className="text-rose-400 text-xs font-bold whitespace-nowrap">{r.xp}</span>
                      </div>
                      <p className="text-app-text-muted text-[11px] mt-0.5">{r.note}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Bonus / Rank thu?ng */}
              <h3 className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase tracking-wide mt-5 mb-3">
                <i className="ri-vip-crown-line"></i>Ph?n thu?ng theo h?ng
              </h3>
              <ul className="space-y-2">
                {[
                  { rank: "Top 1", reward: "Huy hi?u Vàng + 1 tháng VIP mi?n phí", color: "#FFD700" },
                  { rank: "Top 2-3", reward: "Huy hi?u B?c/Ð?ng + 200 XP bonus tu?n", color: "#C0C0C0" },
                  { rank: "Top 10", reward: "Frame avatar d?c bi?t + uu tiên vào nhóm VIP", color: "#a78bfa" },
                  { rank: "Top 50", reward: "Badge tu?n + 50 XP bonus", color: "#34d399" },
                ].map(r => (
                  <li key={r.rank} className="flex items-start gap-2.5 bg-app-surface/40 rounded-lg p-2.5 border border-app-border">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0" style={{ backgroundColor: `${r.color}20`, color: r.color }}>{r.rank}</span>
                    <p className="text-white/85 text-xs flex-1">{r.reward}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button onClick={() => navigate("/rewards")} className="flex items-center gap-1.5 bg-app-accent-primary/15 text-app-accent-primary text-xs px-3 py-2 rounded-lg hover:bg-app-accent-primary/25 transition-colors whitespace-nowrap cursor-pointer font-medium">
              <i className="ri-gift-2-line"></i>Ð?i XP l?y quà
            </button>
            <button onClick={() => navigate("/daily-plan")} className="flex items-center gap-1.5 bg-app-card/50 text-white/70 text-xs px-3 py-2 rounded-lg hover:bg-app-card/70 transition-colors whitespace-nowrap cursor-pointer font-medium">
              <i className="ri-route-line"></i>L? trình hôm nay
            </button>
            <button onClick={() => navigate("/eps-exam")} className="flex items-center gap-1.5 bg-app-card/50 text-white/70 text-xs px-3 py-2 rounded-lg hover:bg-app-card/70 transition-colors whitespace-nowrap cursor-pointer font-medium">
              <i className="ri-timer-line"></i>Thi th? EPS
            </button>
            <button onClick={() => navigate("/weekly-challenge")} className="flex items-center gap-1.5 bg-app-card/50 text-white/70 text-xs px-3 py-2 rounded-lg hover:bg-app-card/70 transition-colors whitespace-nowrap cursor-pointer font-medium">
              <i className="ri-calendar-check-line"></i>Thách th?c tu?n
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

