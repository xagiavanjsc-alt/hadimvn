import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockMelonSongs } from "@/mocks/melonSongs";
import { MelonLessonResult } from "@/services/aiService";

/* -- Types ------------------------------------------------------------------- */
interface QuizScore { rank: number; score: number; total: number; date: string; }
interface VocabEntry { word: string; meaning: string; rank: number; songTitle: string; reviewCount: number; }

/* -- Local helpers ----------------------------------------------------------- */
function loadLearnedRanks(): number[] {
  try { return JSON.parse(localStorage.getItem("melon_learned_ranks") ?? "[]"); }
  catch { return []; }
}
function loadQuizScores(): QuizScore[] {
  try { return JSON.parse(localStorage.getItem("melon_quiz_scores") ?? "[]"); }
  catch { return []; }
}
function loadAnalysis(rank: number): MelonLessonResult | null {
  try {
    const raw = localStorage.getItem(`melon_analysis_${rank}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function loadFlashcardProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("melon_flashcard_progress") ?? "{}"); }
  catch { return {}; }
}

/* -- Mini bar chart ----------------------------------------------------------- */
function BarChart({ data, color = "#22c55e" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-app-text-muted">{d.value > 0 ? d.value : ""}</span>
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${(d.value / max) * 72}px`, backgroundColor: color, opacity: d.value > 0 ? 1 : 0.15 }}
          />
          <span className="text-[9px] text-app-text-muted whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* -- Donut chart --------------------------------------------------------------- */
function DonutChart({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{pct}%</text>
      </svg>
      <span className="text-[10px] text-app-text-secondary">{label}</span>
    </div>
  );
}

export default function MelonStatsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "vocab" | "songs" | "quiz">("overview");

  /* -- Aggregate data ------------------------------------------------------- */
  const learnedRanks = useMemo(() => loadLearnedRanks(), []);
  const quizScores = useMemo(() => loadQuizScores(), []);
  const flashProgress = useMemo(() => loadFlashcardProgress(), []);

  const learnedSongs = useMemo(() =>
    learnedRanks.map(r => ({
      rank: r,
      song: mockMelonSongs.find(s => s.rank === r),
      analysis: loadAnalysis(r),
      quiz: quizScores.find(q => q.rank === r),
    })).filter(s => s.song),
    [learnedRanks, quizScores]
  );

  /* -- Vocab aggregation --------------------------------------------------- */
  const allVocab = useMemo<VocabEntry[]>(() => {
    const entries: VocabEntry[] = [];
    learnedSongs.forEach(({ rank, song, analysis }) => {
      if (!analysis || !song) return;
      analysis.vocabulary.forEach(v => {
        const key = `${rank}_${v.word}`;
        entries.push({
          word: v.word,
          meaning: v.meaning,
          rank,
          songTitle: song.title,
          reviewCount: flashProgress[key] ?? 0,
        });
      });
    });
    return entries;
  }, [learnedSongs, flashProgress]);

  const forgottenVocab = useMemo(() =>
    allVocab.filter(v => v.reviewCount === 0).slice(0, 10),
    [allVocab]
  );

  /* -- Weekly chart (last 7 days) ------------------------------------------- */
  const weeklyData = useMemo(() => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const count = quizScores.filter(q => q.date.startsWith(dateStr)).length;
      return { label: days[d.getDay()], value: count };
    });
  }, [quizScores]);

  /* -- Genre breakdown ------------------------------------------------------- */
  const genreData = useMemo(() => {
    const map: Record<string, number> = {};
    learnedSongs.forEach(({ song }) => {
      if (!song) return;
      const g = song.genre.split("/")[0].trim();
      map[g] = (map[g] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [learnedSongs]);

  /* -- Quiz stats ----------------------------------------------------------- */
  const quizDone = quizScores.length;
  const avgScore = quizDone > 0
    ? Math.round(quizScores.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizDone)
    : 0;
  const perfectQuiz = quizScores.filter(q => q.score === q.total).length;

  /* -- Favorite songs (most vocab) ------------------------------------------- */
  const favoriteSongs = useMemo(() =>
    learnedSongs
      .filter(s => s.analysis)
      .sort((a, b) => (b.analysis?.vocabulary.length ?? 0) - (a.analysis?.vocabulary.length ?? 0))
      .slice(0, 5),
    [learnedSongs]
  );

  const TABS = [
    { id: "overview", label: "T?ng quan", icon: "ri-dashboard-line" },
    { id: "vocab", label: "T? v?ng", icon: "ri-translate-2" },
    { id: "songs", label: "Bài hát", icon: "ri-music-2-line" },
    { id: "quiz", label: "Quiz", icon: "ri-lightbulb-flash-line" },
  ] as const;

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-app-bg/95 backdrop-blur-md border-b border-app-border h-14 flex items-center px-4 md:px-6 gap-3">
        <button
          onClick={() => navigate("/melon")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer flex-shrink-0"
        >
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Th?ng kê h?c Melon</p>
          <p className="text-app-text-muted text-[10px]">{learnedSongs.length} bài dã h?c · {allVocab.length} t? v?ng</p>
        </div>
        <button
          onClick={() => navigate("/melon-history")}
          className="flex items-center gap-1.5 text-xs text-app-text-secondary hover:text-white/70 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-history-line" />
          L?ch s?
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-5">

        {/* Empty state */}
        {learnedSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-4">
              <i className="ri-bar-chart-grouped-line text-app-text-muted text-2xl" />
            </div>
            <p className="text-app-text-secondary text-sm font-medium mb-1">Chua có d? li?u th?ng kê</p>
            <p className="text-app-text-muted text-xs mb-5">H?c ít nh?t 1 bài hát d? xem th?ng kê</p>
            <button
              onClick={() => navigate("/melon")}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
            >
              Ð?n Melon Chart
            </button>
          </div>
        )}

        {learnedSongs.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-app-card/50 p-1 rounded-xl mb-5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id ? "bg-app-card/70 text-white" : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <i className={`${tab.icon} text-sm`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* -- OVERVIEW TAB ----------------------------------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* KPI cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: "ri-music-2-line", val: learnedSongs.length, label: "Bài dã h?c", color: "#22c55e" },
                    { icon: "ri-translate-2", val: allVocab.length, label: "T? v?ng", color: "app-accent-primary" },
                    { icon: "ri-lightbulb-flash-line", val: quizDone, label: "Quiz hoàn thành", color: "#f97316" },
                    { icon: "ri-percent-line", val: quizDone > 0 ? `${avgScore}%` : "—", label: "Ði?m TB quiz", color: "#ec4899" },
                  ].map(s => (
                    <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-2xl p-4 text-center">
                      <div className="w-9 h-9 flex items-center justify-center mx-auto mb-2 rounded-xl" style={{ backgroundColor: `${s.color}15` }}>
                        <i className={`${s.icon} text-base`} style={{ color: s.color }} />
                      </div>
                      <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-app-text-muted text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Weekly activity chart */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/70 text-sm font-semibold">Ho?t d?ng 7 ngày qua</p>
                    <span className="text-[10px] text-app-text-muted">Quiz hoàn thành / ngày</span>
                  </div>
                  <BarChart data={weeklyData} color="#22c55e" />
                </div>

                {/* Donut row */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-4">T? l? hoàn thành</p>
                  <div className="flex justify-around">
                    <DonutChart
                      value={learnedSongs.filter(s => s.analysis).length}
                      total={learnedSongs.length}
                      color="#22c55e"
                      label="Ðã phân tích AI"
                    />
                    <DonutChart
                      value={quizDone}
                      total={learnedSongs.length}
                      color="app-accent-primary"
                      label="Ðã làm quiz"
                    />
                    <DonutChart
                      value={perfectQuiz}
                      total={quizDone || 1}
                      color="#ec4899"
                      label="Quiz hoàn h?o"
                    />
                  </div>
                </div>

                {/* Genre breakdown */}
                {genreData.length > 0 && (
                  <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                    <p className="text-white/70 text-sm font-semibold mb-4">Th? lo?i yêu thích</p>
                    <div className="space-y-2.5">
                      {genreData.map(([genre, count]) => (
                        <div key={genre} className="flex items-center gap-3">
                          <span className="text-white/50 text-xs w-24 truncate">{genre}</span>
                          <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#22c55e] transition-all duration-500"
                              style={{ width: `${(count / learnedSongs.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-app-text-muted text-xs w-6 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -- VOCAB TAB -------------------------------------------------- */}
            {activeTab === "vocab" && (
              <div className="space-y-4">
                {/* Vocab chart by song */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-4">T? v?ng theo bài hát (top 7)</p>
                  <BarChart
                    data={favoriteSongs.slice(0, 7).map(s => ({
                      label: s.song?.title.slice(0, 6) ?? "",
                      value: s.analysis?.vocabulary.length ?? 0,
                    }))}
                    color="app-accent-primary"
                  />
                </div>

                {/* Forgotten vocab */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/70 text-sm font-semibold">T? hay quên nh?t</p>
                    <span className="text-[10px] text-app-text-muted">Chua ôn qua flashcard</span>
                  </div>
                  {forgottenVocab.length === 0 ? (
                    <p className="text-app-text-muted text-xs text-center py-4">Tuy?t v?i! B?n dã ôn h?t r?i</p>
                  ) : (
                    <div className="space-y-2">
                      {forgottenVocab.map((v, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                          <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/10 flex-shrink-0">
                            <i className="ri-alarm-warning-line text-red-400 text-xs" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm font-semibold">{v.word}</p>
                            <p className="text-white/35 text-xs truncate">{v.meaning}</p>
                          </div>
                          <span className="text-[10px] text-app-text-muted truncate max-w-[80px]">{v.songTitle}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {forgottenVocab.length > 0 && (
                    <button
                      onClick={() => navigate("/melon-flashcard")}
                      className="mt-3 w-full py-2.5 rounded-xl bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary text-xs font-semibold cursor-pointer hover:bg-app-accent-primary/15 transition-colors whitespace-nowrap"
                    >
                      <i className="ri-stack-line mr-1.5" />
                      Ôn ngay v?i Flashcard
                    </button>
                  )}
                </div>

                {/* All vocab list */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-3">T?t c? t? v?ng ({allVocab.length})</p>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {allVocab.map((v, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-1.5">
                        <span className="text-app-text-muted text-[10px] w-5 text-right flex-shrink-0">{i + 1}</span>
                        <span className="text-white/75 text-sm font-medium w-28 flex-shrink-0">{v.word}</span>
                        <span className="text-white/35 text-xs flex-1 truncate">{v.meaning}</span>
                        {v.reviewCount > 0 ? (
                          <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            ×{v.reviewCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-app-accent-error/60 bg-red-500/8 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            Chua ôn
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -- SONGS TAB -------------------------------------------------- */}
            {activeTab === "songs" && (
              <div className="space-y-4">
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-4">Bài hát yêu thích (nhi?u t? v?ng nh?t)</p>
                  <div className="space-y-3">
                    {favoriteSongs.map(({ song, analysis, quiz }, i) => (
                      <div
                        key={song?.rank}
                        className="flex items-center gap-3 cursor-pointer hover:bg-app-surface/50 rounded-xl p-2 -mx-2 transition-colors"
                        onClick={() => navigate(`/melon/${song?.rank}`)}
                      >
                        <span className="text-app-text-muted text-sm font-bold w-5 text-center flex-shrink-0">{i + 1}</span>
                        <img
                          src={song?.albumArt}
                          alt={song?.title}
                          className="w-10 h-10 rounded-xl object-cover object-top flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-semibold truncate">{song?.title}</p>
                          <p className="text-white/35 text-xs">{song?.artist}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-app-accent-primary font-bold">{analysis?.vocabulary.length ?? 0} t?</span>
                          {quiz && (
                            <span className="text-[10px] text-green-400">{quiz.score}/{quiz.total}</span>
                          )}
                        </div>
                        <i className="ri-arrow-right-s-line text-white/15 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* All learned songs */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-3">T?t c? bài dã h?c ({learnedSongs.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {learnedSongs.map(({ song, quiz }) => (
                      <div
                        key={song?.rank}
                        className="relative cursor-pointer rounded-xl overflow-hidden aspect-square"
                        onClick={() => navigate(`/melon/${song?.rank}`)}
                      >
                        <img
                          src={song?.albumArt}
                          alt={song?.title}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <p className="absolute bottom-1 left-1 right-1 text-white text-[9px] font-semibold truncate">{song?.title}</p>
                        {quiz && (
                          <div className="absolute top-1 right-1 bg-app-accent-primary text-app-bg text-[9px] font-bold px-1 py-0.5 rounded-full">
                            {quiz.score}/{quiz.total}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -- QUIZ TAB --------------------------------------------------- */}
            {activeTab === "quiz" && (
              <div className="space-y-4">
                {/* Quiz KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: quizDone, label: "Quiz dã làm", color: "#22c55e", icon: "ri-check-double-line" },
                    { val: `${avgScore}%`, label: "Ði?m trung bình", color: "app-accent-primary", icon: "ri-percent-line" },
                    { val: perfectQuiz, label: "Quiz hoàn h?o", color: "#ec4899", icon: "ri-trophy-line" },
                  ].map(s => (
                    <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-2xl p-4 text-center">
                      <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2 rounded-xl" style={{ backgroundColor: `${s.color}15` }}>
                        <i className={`${s.icon} text-sm`} style={{ color: s.color }} />
                      </div>
                      <p className="text-lg font-black" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-app-text-muted text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quiz score chart */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-4">Ði?m quiz theo bài</p>
                  {quizScores.length === 0 ? (
                    <p className="text-app-text-muted text-xs text-center py-6">Chua có d? li?u quiz</p>
                  ) : (
                    <BarChart
                      data={quizScores.slice(-7).map(q => {
                        const song = mockMelonSongs.find(s => s.rank === q.rank);
                        return {
                          label: song?.title.slice(0, 5) ?? `#${q.rank}`,
                          value: Math.round((q.score / q.total) * 100),
                        };
                      })}
                      color="#f97316"
                    />
                  )}
                </div>

                {/* Quiz history list */}
                <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
                  <p className="text-white/70 text-sm font-semibold mb-3">L?ch s? quiz</p>
                  {quizScores.length === 0 ? (
                    <p className="text-app-text-muted text-xs text-center py-4">Chua làm quiz nào</p>
                  ) : (
                    <div className="space-y-2">
                      {[...quizScores].reverse().map((q, i) => {
                        const song = mockMelonSongs.find(s => s.rank === q.rank);
                        const pct = Math.round((q.score / q.total) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                            <img
                              src={song?.albumArt}
                              alt={song?.title}
                              className="w-9 h-9 rounded-lg object-cover object-top flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white/75 text-xs font-semibold truncate">{song?.title ?? `Bài #${q.rank}`}</p>
                              <p className="text-app-text-muted text-[10px]">{q.date ? new Date(q.date).toLocaleDateString("vi-VN") : ""}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: pct >= 80 ? "#22c55e" : pct >= 60 ? "app-accent-primary" : "#f97316",
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-bold w-10 text-right"
                                style={{ color: pct >= 80 ? "#22c55e" : pct >= 60 ? "app-accent-primary" : "#f97316" }}
                              >
                                {q.score}/{q.total}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

