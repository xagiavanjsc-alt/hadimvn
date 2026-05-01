import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockMelonSongs } from "@/mocks/melonSongs";
import { MelonLessonResult } from "@/services/aiService";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMelonSync, MelonStudyEntry } from "@/hooks/useMelonSync";
import { isSupabaseConfigured } from "@/lib/supabase";

const LEARNED_KEY = "melon_learned_ranks";
const QUIZ_SCORE_KEY = "melon_quiz_scores";
const GOAL_KEY = "melon_weekly_goal";

interface QuizScore { rank: number; score: number; total: number; date: string; }
interface SongItem {
  song: (typeof mockMelonSongs)[0];
  analysis: MelonLessonResult | null;
  quizScore: QuizScore | undefined;
  studiedAt?: string;
}
interface WeeklyGoal { songsPerWeek: number; }

/* ── Local helpers ─────────────────────────────────────────────────────────── */
function loadLearnedLocal(): number[] {
  try { return JSON.parse(localStorage.getItem(LEARNED_KEY) ?? "[]"); }
  catch { return []; }
}
function loadQuizScoresLocal(): QuizScore[] {
  try { return JSON.parse(localStorage.getItem(QUIZ_SCORE_KEY) ?? "[]"); }
  catch { return []; }
}
function loadAnalysisLocal(rank: number): MelonLessonResult | null {
  try {
    const raw = localStorage.getItem(`melon_analysis_${rank}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function loadGoal(): WeeklyGoal {
  try { return JSON.parse(localStorage.getItem(GOAL_KEY) ?? "null") ?? { songsPerWeek: 3 }; }
  catch { return { songsPerWeek: 3 }; }
}
function saveGoal(g: WeeklyGoal) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(g));
}

function buildFromLocal(): SongItem[] {
  const learnedRanks = loadLearnedLocal();
  const quizScores = loadQuizScoresLocal();
  return learnedRanks
    .map(r => {
      const song = mockMelonSongs.find(s => s.rank === r);
      if (!song) return null;
      return { song, analysis: loadAnalysisLocal(r), quizScore: quizScores.find(q => q.rank === r) };
    })
    .filter(Boolean) as SongItem[];
}
function buildFromCloud(entries: MelonStudyEntry[]): SongItem[] {
  return entries
    .map(e => {
      const rank = parseInt(e.song_id.replace("melon-", ""), 10);
      const song = mockMelonSongs.find(s => s.rank === rank);
      if (!song) return null;
      return {
        song,
        analysis: (e.vocabulary && (e.vocabulary as unknown[]).length > 0)
          ? {
              vocabulary: e.vocabulary as MelonLessonResult["vocabulary"],
              grammar: (e.ai_analysis as { grammar?: MelonLessonResult["grammar"] })?.grammar ?? [],
              topic: (e.ai_analysis as { topic?: string })?.topic ?? "",
              summary: (e.ai_analysis as { summary?: string })?.summary ?? "",
            }
          : loadAnalysisLocal(rank),
        quizScore: e.quiz_score != null && e.quiz_total != null
          ? { rank, score: e.quiz_score, total: e.quiz_total, date: e.studied_at ?? "" }
          : loadQuizScoresLocal().find(q => q.rank === rank),
        studiedAt: e.studied_at,
      };
    })
    .filter(Boolean) as SongItem[];
}

/* ── Goal Progress Banner ─────────────────────────────────────────────────── */
function GoalBanner({
  goal,
  songsThisWeek,
  onEdit,
}: {
  goal: WeeklyGoal;
  songsThisWeek: number;
  onEdit: () => void;
}) {
  const pct = Math.min(100, Math.round((songsThisWeek / goal.songsPerWeek) * 100));
  const done = songsThisWeek >= goal.songsPerWeek;

  return (
    <div className={`rounded-2xl p-4 border mb-5 ${done ? "bg-[#22c55e]/8 border-[#22c55e]/25" : "bg-white/3 border-white/8"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${done ? "bg-[#22c55e]/20" : "bg-white/5"}`}>
            <i className={`${done ? "ri-trophy-fill text-[#22c55e]" : "ri-focus-3-line text-white/40"} text-sm`} />
          </div>
          <div>
            <p className="text-white/80 text-xs font-semibold">
              {done ? "Đạt mục tiêu tuần này!" : "Mục tiêu tuần này"}
            </p>
            <p className="text-white/30 text-[10px]">
              {songsThisWeek}/{goal.songsPerWeek} bài · {done ? "Hoàn thành!" : `Còn ${goal.songsPerWeek - songsThisWeek} bài nữa`}
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-[10px] text-white/25 hover:text-white/50 cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <i className="ri-edit-line" />
          Sửa
        </button>
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: done ? "#22c55e" : "#e8c84a",
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-white/20">0</span>
        <span className="text-[10px]" style={{ color: done ? "#22c55e" : "#e8c84a" }}>{pct}%</span>
        <span className="text-[10px] text-white/20">{goal.songsPerWeek} bài</span>
      </div>
    </div>
  );
}

/* ── Goal Edit Modal ─────────────────────────────────────────────────────── */
function GoalModal({ goal, onSave, onClose }: { goal: WeeklyGoal; onSave: (g: WeeklyGoal) => void; onClose: () => void }) {
  const [val, setVal] = useState(goal.songsPerWeek);
  const OPTIONS = [1, 2, 3, 5, 7, 10, 14];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1d26] border border-white/10 rounded-2xl p-6 w-full max-w-sm z-10">
        <div className="flex items-center justify-between mb-5">
          <p className="text-white font-bold text-base">Đặt mục tiêu học Melon</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/40 cursor-pointer">
            <i className="ri-close-line text-sm" />
          </button>
        </div>
        <p className="text-white/40 text-xs mb-4">Chọn số bài hát muốn học mỗi tuần:</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setVal(n)}
              className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                val === n
                  ? "bg-[#22c55e] text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-white/25 text-xs text-center mb-5">
          {val} bài/tuần = ~{Math.round(val / 7 * 10) / 10} bài/ngày
        </p>
        <button
          onClick={() => { onSave({ songsPerWeek: val }); onClose(); }}
          className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          Lưu mục tiêu
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function MelonHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { loadMelonHistory } = useMelonSync();
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [learnedSongs, setLearnedSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"local" | "cloud">("local");
  const [goal, setGoal] = useState<WeeklyGoal>(loadGoal);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const local = buildFromLocal();
      if (mounted) setLearnedSongs(local);
      if (user && isSupabaseConfigured) {
        const entries = await loadMelonHistory(user.id);
        if (mounted) {
          if (entries.length > 0) { setLearnedSongs(buildFromCloud(entries)); setSource("cloud"); }
          setLoading(false);
        }
      } else {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [user, loadMelonHistory]);

  /* ── Songs learned this week ─────────────────────────────────────────── */
  const songsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return learnedSongs.filter(s => {
      if (!s.studiedAt) return false;
      return new Date(s.studiedAt) >= startOfWeek;
    }).length;
  }, [learnedSongs]);

  const totalVocab = useMemo(
    () => learnedSongs.reduce((acc, { analysis }) => acc + (analysis?.vocabulary.length ?? 0), 0),
    [learnedSongs]
  );
  const totalQuizDone = learnedSongs.filter(s => s.quizScore).length;
  const avgScore = totalQuizDone > 0
    ? Math.round(learnedSongs.reduce((acc, { quizScore }) => acc + (quizScore ? (quizScore.score / quizScore.total) * 100 : 0), 0) / totalQuizDone)
    : 0;

  const genreCounts = useMemo(() => {
    const map: Record<string, number> = {};
    learnedSongs.forEach(({ song }) => {
      const g = song.genre.split("/")[0].trim();
      map[g] = (map[g] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [learnedSongs]);

  const handleSaveGoal = (g: WeeklyGoal) => {
    setGoal(g);
    saveGoal(g);
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-md border-b border-white/8 h-14 flex items-center px-4 md:px-6 gap-3">
        <button
          onClick={() => navigate("/melon")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white cursor-pointer flex-shrink-0"
        >
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Lịch sử học Melon</p>
          {source === "cloud" && (
            <p className="text-[#22c55e] text-[10px] flex items-center gap-1">
              <i className="ri-cloud-line" /> Đồng bộ từ cloud
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/melon-stats")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 cursor-pointer whitespace-nowrap mr-1"
        >
          <i className="ri-bar-chart-grouped-line" />
          Thống kê
        </button>
        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode("timeline")}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors ${viewMode === "timeline" ? "bg-white/10 text-white" : "text-white/30"}`}
          >
            <i className="ri-timeline-view" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30"}`}
          >
            <i className="ri-grid-line" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">

        {/* Login prompt */}
        {!user && isSupabaseConfigured && (
          <div className="mb-5 bg-[#e8c84a]/8 border border-[#e8c84a]/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#e8c84a]/15 rounded-xl flex-shrink-0">
              <i className="ri-cloud-off-line text-[#e8c84a] text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-semibold">Đăng nhập để đồng bộ đa thiết bị</p>
              <p className="text-white/40 text-[11px] mt-0.5">Hiện đang dùng bộ nhớ cục bộ. Đăng nhập để lưu lịch sử lên cloud.</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && learnedSongs.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/3 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* ── GOAL BANNER ─────────────────────────────────────────────── */}
            <GoalBanner
              goal={goal}
              songsThisWeek={songsThisWeek}
              onEdit={() => setShowGoalModal(true)}
            />

            {/* Stats overview */}
            <div className="grid grid-cols-4 gap-3 mb-7">
              {[
                { icon: "ri-music-2-line", val: learnedSongs.length, label: "Bài đã học", color: "text-[#22c55e]" },
                { icon: "ri-translate-2", val: totalVocab, label: "Từ vựng", color: "text-[#e8c84a]" },
                { icon: "ri-lightbulb-flash-line", val: totalQuizDone, label: "Quiz xong", color: "text-orange-400" },
                { icon: "ri-percent-line", val: totalQuizDone > 0 ? `${avgScore}%` : "—", label: "Điểm TB", color: "text-green-400" },
              ].map(s => (
                <div key={s.label} className="bg-white/3 border border-white/5 rounded-2xl p-3 text-center">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-1">
                    <i className={`${s.icon} ${s.color} text-lg`} />
                  </div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-white/35 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Genre breakdown */}
            {genreCounts.length > 0 && (
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 mb-6">
                <p className="text-white/40 text-xs tracking-normal mb-3">Thể loại đã học</p>
                <div className="flex flex-wrap gap-2">
                  {genreCounts.map(([genre, count]) => (
                    <span key={genre} className="flex items-center gap-1.5 bg-white/5 border border-white/8 text-white/60 text-xs px-3 py-1.5 rounded-full">
                      {genre}
                      <span className="bg-[#e8c84a]/20 text-[#e8c84a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {learnedSongs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl mb-4">
                  <i className="ri-history-line text-white/20 text-2xl" />
                </div>
                <p className="text-white/40 text-sm font-medium mb-1">Chưa có lịch sử học</p>
                <p className="text-white/20 text-xs mb-5">Mở phân tích AI của bất kỳ bài hát nào<br />để bắt đầu ghi lịch sử</p>
                <button
                  onClick={() => navigate("/melon")}
                  className="bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  Đến Melon Chart
                </button>
              </div>
            )}

            {/* Timeline view */}
            {viewMode === "timeline" && learnedSongs.length > 0 && (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/8" />
                <div className="space-y-4">
                  {learnedSongs.map(({ song, analysis, quizScore, studiedAt }, idx) => (
                    <div key={song.rank} className="flex gap-4 items-start relative">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#0f1117] border-2 border-[#e8c84a]/40 z-10">
                        <span className="text-[#e8c84a] text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div
                        className="flex-1 bg-white/3 border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => navigate(`/melon/${song.rank}`)}
                      >
                        <div className="flex items-start gap-3">
                          <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-xl object-cover object-top flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/85 text-sm font-semibold truncate">{song.title}</p>
                            <p className="text-white/40 text-xs">{song.artist} · #{song.rank}</p>
                            {studiedAt && (
                              <p className="text-white/20 text-[10px] mt-0.5">
                                {new Date(studiedAt).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {analysis && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                  <i className="ri-translate-2" />
                                  {analysis.vocabulary.length} từ vựng
                                </span>
                              )}
                              {quizScore && (
                                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${quizScore.score >= quizScore.total * 0.8 ? "text-[#e8c84a] bg-[#e8c84a]/10" : "text-orange-400 bg-orange-500/10"}`}>
                                  <i className="ri-lightbulb-flash-line" />
                                  Quiz {quizScore.score}/{quizScore.total}
                                </span>
                              )}
                              {!analysis && (
                                <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full">Chưa phân tích AI</span>
                              )}
                            </div>
                          </div>
                          <i className="ri-arrow-right-s-line text-white/20 flex-shrink-0 mt-1" />
                        </div>
                        {analysis && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 flex-wrap">
                            {analysis.vocabulary.slice(0, 3).map((v, i) => (
                              <span key={i} className="text-[11px] text-[#e8c84a]/70 bg-[#e8c84a]/8 px-2 py-0.5 rounded-full">
                                {v.word.split("(")[0].trim()}
                              </span>
                            ))}
                            {analysis.vocabulary.length > 3 && (
                              <span className="text-[11px] text-white/25 px-2 py-0.5">+{analysis.vocabulary.length - 3} từ</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid view */}
            {viewMode === "grid" && learnedSongs.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {learnedSongs.map(({ song, analysis, quizScore }) => (
                  <div
                    key={song.rank}
                    className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => navigate(`/melon/${song.rank}`)}
                  >
                    <div className="relative w-full aspect-square">
                      <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-semibold truncate">{song.title}</p>
                        <p className="text-white/50 text-[10px] truncate">{song.artist}</p>
                      </div>
                      {quizScore && (
                        <div className="absolute top-2 right-2 bg-[#e8c84a] text-[#0f1117] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {quizScore.score}/{quizScore.total}
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-[10px] text-white/30">#{song.rank}</span>
                      {analysis ? (
                        <span className="text-[10px] text-green-400">{analysis.vocabulary.length} từ</span>
                      ) : (
                        <span className="text-[10px] text-white/20">Chưa AI</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Flashcard CTA */}
            {learnedSongs.some(s => s.analysis) && (
              <div
                className="mt-6 bg-gradient-to-r from-[#e8c84a]/10 to-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-2xl p-5 cursor-pointer hover:border-[#e8c84a]/30 transition-colors"
                onClick={() => navigate("/melon-flashcard")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#e8c84a]/15 rounded-xl flex-shrink-0">
                    <i className="ri-stack-line text-[#e8c84a] text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/85 text-sm font-semibold">Flashcard từ vựng K-pop</p>
                    <p className="text-white/35 text-xs">{totalVocab} từ từ {learnedSongs.filter(s => s.analysis).length} bài hát đã học</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-[#e8c84a]/50" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          goal={goal}
          onSave={handleSaveGoal}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </div>
  );
}
