import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { usePageSEO } from "@/hooks/usePageSEO";

interface GrammarItem {
  id: number;
  lesson_id: number;
  lesson_title: string;
  lesson_title_vi: string;
  topic: string;
  level: string;
  pattern: string;
  explanation: string;
  notes: string;
  examples: { id: number; korean: string; vietnamese: string }[];
  isFavorite?: boolean;
}

interface QuizQuestion {
  grammar: GrammarItem;
  options: string[];
  correctIndex: number;
}

type Mode = "browse" | "quiz";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-app-accent-success/15 text-app-accent-success border-emerald-500/20",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const TOPIC_ICONS: Record<string, string> = {
  greeting: "ri-hand-heart-line",
  daily: "ri-sun-line",
  transport: "ri-bus-line",
  workplace: "ri-building-2-line",
  law: "ri-scales-3-line",
  safety: "ri-shield-check-line",
  culture: "ri-palette-line",
  health: "ri-heart-pulse-line",
};

export default function EpsGrammarPage() {
  const { user } = useAuth();
  const [grammars, setGrammars] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("browse");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  usePageSEO({
    title: "Ngữ pháp EPS-TOPIK — Cấu trúc câu + Ví dụ | Hàn Quốc Ơi!",
    description: "Trọn bộ ngữ pháp EPS-TOPIK theo từng bài. Mỗi cấu trúc có nghĩa Việt, ví dụ song ngữ, lọc theo bài và trình độ. Miễn phí cho người Việt thi XKLĐ.",
    keywords: "ngữ pháp EPS, ngữ pháp tiếng Hàn EPS-TOPIK, cấu trúc câu tiếng Hàn, ngữ pháp XKLĐ Hàn Quốc",
    path: "/eps-grammar",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Ngữ pháp EPS-TOPIK",
      description: "Bộ ngữ pháp EPS-TOPIK theo từng bài có ví dụ song ngữ.",
      learningResourceType: "Lesson",
      educationalLevel: "EPS-TOPIK",
      inLanguage: ["vi", "ko"],
      isAccessibleForFree: true,
      provider: {
        "@type": "EducationalOrganization",
        name: "Hàn Quốc Ơi!",
        url: "https://hanquocoi.vn",
      },
    },
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [savingFav, setSavingFav] = useState<number | null>(null);

  // Load grammar data
  useEffect(() => {
    loadGrammars();
  }, []);

  // Load favorites
  useEffect(() => {
    if (user) loadFavorites();
  }, [user]);

  const loadGrammars = async () => {
    setLoading(true);
    try {
      const { data: grammarData } = await supabase
        .from("eps_grammar")
        .select("*")
        .order("lesson_id", { ascending: true });

      const { data: examplesData } = await supabase
        .from("eps_grammar_examples")
        .select("*")
        .order("id", { ascending: true });

      if (grammarData) {
        const enriched = grammarData.map(g => ({
          ...g,
          examples: (examplesData || []).filter(e => e.grammar_id === g.id),
        }));
        setGrammars(enriched);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("grammar_favorites")
      .select("grammar_id")
      .eq("user_id", user.id)
      .eq("grammar_type", "eps");
    if (data) {
      setFavorites(new Set(data.map(f => f.grammar_id)));
    }
  };

  const toggleFavorite = async (grammarId: number) => {
    if (!user) return;
    setSavingFav(grammarId);
    const isFav = favorites.has(grammarId);
    try {
      if (isFav) {
        await supabase
          .from("grammar_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("grammar_type", "eps")
          .eq("grammar_id", grammarId);
        setFavorites(prev => { const s = new Set(prev); s.delete(grammarId); return s; });
      } else {
        await supabase
          .from("grammar_favorites")
          .insert({ user_id: user.id, grammar_type: "eps", grammar_id: grammarId });
        setFavorites(prev => new Set([...prev, grammarId]));
      }
    } finally {
      setSavingFav(null);
    }
  };

  // Filtered grammars
  const filtered = grammars.filter(g => {
    if (levelFilter !== "all" && g.level !== levelFilter) return false;
    if (lessonFilter !== null && g.lesson_id !== lessonFilter) return false;
    if (showFavoritesOnly && !favorites.has(g.id)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.pattern.toLowerCase().includes(q) || g.explanation.toLowerCase().includes(q);
    }
    return true;
  });

  // Unique lessons
  const lessons = Array.from(new Set(grammars.map(g => g.lesson_id))).sort((a, b) => a - b);

  // Start quiz
  const startQuiz = useCallback((sourceGrammars?: GrammarItem[]) => {
    const pool = sourceGrammars || filtered;
    if (pool.length < 4) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
    const questions: QuizQuestion[] = shuffled.map(g => {
      const wrongOptions = grammars
        .filter(x => x.id !== g.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(x => x.explanation);
      const allOptions = [g.explanation, ...wrongOptions].sort(() => Math.random() - 0.5);
      return {
        grammar: g,
        options: allOptions,
        correctIndex: allOptions.indexOf(g.explanation),
      };
    });
    setQuizQuestions(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizDone(false);
    setMode("quiz");
  }, [filtered, grammars]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === quizQuestions[quizIndex].correctIndex) {
      setQuizScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setQuizIndex(i => i + 1);
      setSelectedAnswer(null);
    }
  };

  const getLessonTitle = (lessonId: number) => {
    const g = grammars.find(x => x.lesson_id === lessonId);
    return g ? `Bài ${lessonId}: ${g.lesson_title_vi || g.lesson_title}` : `Bài ${lessonId}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-app-text-secondary text-sm">Đang tải ngữ pháp EPS...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/15 rounded-xl border border-amber-500/20">
              <i className="ri-book-2-line text-amber-400 text-xl"></i>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Ngữ pháp EPS-TOPIK</h1>
              <p className="text-app-text-secondary text-sm">100 điểm ngữ pháp từ 60 bài học EPS</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-app-text-secondary">
              <i className="ri-book-open-line text-amber-400"></i>
              <span>{grammars.length} điểm ngữ pháp</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-app-text-secondary">
              <i className="ri-heart-line text-rose-400"></i>
              <span>{favorites.size} yêu thích</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-app-text-secondary">
              <i className="ri-list-check-2 text-app-accent-success"></i>
              <span>{filtered.length} đang hiển thị</span>
            </div>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-2 mb-5 bg-app-card/50 rounded-xl p-1 w-fit">
          <button
            onClick={() => setMode("browse")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              mode === "browse" ? "bg-amber-500/20 text-amber-400" : "text-app-text-secondary hover:text-white/70"
            }`}
          >
            <i className="ri-book-open-line mr-1.5"></i>Học ngữ pháp
          </button>
          <button
            onClick={() => startQuiz()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              mode === "quiz" ? "bg-amber-500/20 text-amber-400" : "text-app-text-secondary hover:text-white/70"
            }`}
          >
            <i className="ri-question-line mr-1.5"></i>Quiz ngữ pháp
          </button>
        </div>

        {/* ─── BROWSE MODE ─── */}
        {mode === "browse" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm cấu trúc ngữ pháp..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-500/40 text-sm"
                />
              </div>

              {/* Level filter */}
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value as LevelFilter)}
                className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-amber-500/40 cursor-pointer"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Sơ cấp</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>

              {/* Lesson filter */}
              <select
                value={lessonFilter ?? ""}
                onChange={e => setLessonFilter(e.target.value ? Number(e.target.value) : null)}
                className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-amber-500/40 cursor-pointer"
              >
                <option value="">Tất cả bài học</option>
                {lessons.map(l => (
                  <option key={l} value={l}>Bài {l}</option>
                ))}
              </select>

              {/* Favorites toggle */}
              {user && (
                <button
                  onClick={() => setShowFavoritesOnly(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer whitespace-nowrap ${
                    showFavoritesOnly
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      : "bg-app-card/50 border-app-border text-white/50 hover:text-white/70"
                  }`}
                >
                  <i className={showFavoritesOnly ? "ri-heart-fill" : "ri-heart-line"}></i>
                  Yêu thích
                </button>
              )}

              {/* Quiz filtered */}
              {filtered.length >= 4 && (
                <button
                  onClick={() => startQuiz(filtered)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-play-circle-line"></i>
                  Quiz ({filtered.length})
                </button>
              )}
            </div>

            {/* Grammar list */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-app-text-muted">
                <i className="ri-search-line text-4xl mb-3 block"></i>
                <p>Không tìm thấy ngữ pháp phù hợp</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(g => {
                  const isExpanded = expandedId === g.id;
                  const isFav = favorites.has(g.id);
                  return (
                    <div
                      key={g.id}
                      className="bg-white/4 border border-app-border rounded-xl overflow-hidden hover:border-white/15 transition-all"
                    >
                      {/* Header row */}
                      <div
                        className="flex items-start gap-3 p-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : g.id)}
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-app-card/50 rounded-lg flex-shrink-0 mt-0.5">
                          <i className={`${TOPIC_ICONS[g.topic] || "ri-book-line"} text-amber-400 text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-app-text-muted text-xs">Bài {g.lesson_id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${LEVEL_COLORS[g.level] || "bg-app-card/70 text-app-text-secondary border-app-border"}`}>
                              {LEVEL_LABELS[g.level] || g.level}
                            </span>
                          </div>
                          <p className="text-white font-semibold text-sm leading-snug">{g.pattern}</p>
                          <p className="text-white/50 text-xs mt-1 line-clamp-2">{g.explanation}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {user && (
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavorite(g.id); }}
                              disabled={savingFav === g.id}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                                isFav ? "text-rose-400 bg-rose-500/10" : "text-app-text-muted hover:text-rose-400 hover:bg-rose-500/10"
                              }`}
                            >
                              <i className={isFav ? "ri-heart-fill" : "ri-heart-line"}></i>
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); startQuiz([g]); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-app-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                            title="Quiz bài này"
                          >
                            <i className="ri-question-line text-sm"></i>
                          </button>
                          <i className={`text-app-text-muted text-sm transition-transform ${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-3">
                          {/* Full explanation */}
                          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                            <p className="text-amber-400/70 text-xs font-semibold mb-1 tracking-wide">Giải thích</p>
                            <p className="text-white/70 text-sm leading-relaxed">{g.explanation}</p>
                          </div>

                          {/* Notes */}
                          {g.notes && (
                            <div className="bg-app-surface/50 rounded-lg p-3">
                              <p className="text-app-text-muted text-xs font-semibold mb-1 tracking-wide">Ghi chú</p>
                              <p className="text-white/55 text-sm leading-relaxed">{g.notes}</p>
                            </div>
                          )}

                          {/* Examples */}
                          {g.examples.length > 0 && (
                            <div>
                              <p className="text-app-text-muted text-xs font-semibold mb-2 tracking-wide">Ví dụ</p>
                              <div className="space-y-2">
                                {g.examples.map(ex => (
                                  <div key={ex.id} className="bg-app-surface/50 rounded-lg p-3">
                                    <p className="text-white font-medium text-sm">{ex.korean}</p>
                                    <p className="text-white/45 text-xs mt-0.5">{ex.vietnamese}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── QUIZ MODE ─── */}
        {mode === "quiz" && (
          <div className="max-w-2xl mx-auto">
            {quizDone ? (
              /* Result screen */
              <div className="text-center py-12">
                <div className="w-20 h-20 flex items-center justify-center bg-amber-500/15 rounded-full mx-auto mb-4 border border-amber-500/20">
                  <i className="ri-trophy-line text-amber-400 text-3xl"></i>
                </div>
                <h2 className="text-white font-bold text-2xl mb-2">Hoàn thành!</h2>
                <p className="text-white/50 text-sm mb-6">
                  Bạn trả lời đúng <span className="text-amber-400 font-bold">{quizScore}/{quizQuestions.length}</span> câu
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => startQuiz()}
                    className="px-5 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-1.5"></i>Làm lại
                  </button>
                  <button
                    onClick={() => setMode("browse")}
                    className="px-5 py-2.5 bg-app-card/50 border border-app-border text-white/60 rounded-lg text-sm font-medium hover:bg-app-card/70 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-book-open-line mr-1.5"></i>Xem ngữ pháp
                  </button>
                </div>
              </div>
            ) : quizQuestions.length > 0 ? (
              /* Quiz question */
              <div>
                {/* Progress */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-app-text-secondary text-sm">Câu {quizIndex + 1}/{quizQuestions.length}</span>
                  <span className="text-amber-400 text-sm font-medium">{quizScore} điểm</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${((quizIndex) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>

                {/* Question */}
                <div className="bg-white/4 border border-app-border rounded-xl p-5 mb-5">
                  <p className="text-app-text-secondary text-xs mb-2 tracking-wide">Cấu trúc ngữ pháp là gì?</p>
                  <p className="text-white font-bold text-lg leading-snug">{quizQuestions[quizIndex].grammar.pattern}</p>
                  {quizQuestions[quizIndex].grammar.examples.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/6">
                      <p className="text-app-text-muted text-xs mb-1">Ví dụ:</p>
                      <p className="text-white/60 text-sm italic">{quizQuestions[quizIndex].grammar.examples[0].korean}</p>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2.5 mb-5">
                  {quizQuestions[quizIndex].options.map((opt, idx) => {
                    let cls = "bg-white/4 border-app-border text-white/70 hover:bg-white/8 hover:border-white/20";
                    if (selectedAnswer !== null) {
                      if (idx === quizQuestions[quizIndex].correctIndex) {
                        cls = "bg-app-accent-success/15 border-emerald-500/30 text-app-accent-success";
                      } else if (idx === selectedAnswer) {
                        cls = "bg-rose-500/15 border-rose-500/30 text-rose-400";
                      } else {
                        cls = "bg-app-surface/50 border-white/6 text-app-text-muted";
                      }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${cls}`}
                      >
                        <span className="font-medium mr-2 text-xs opacity-60">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {quizIndex + 1 >= quizQuestions.length ? "Xem kết quả" : "Câu tiếp theo"}
                    <i className="ri-arrow-right-line ml-1.5"></i>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-app-text-muted">
                <i className="ri-error-warning-line text-4xl mb-3 block"></i>
                <p>Cần ít nhất 4 điểm ngữ pháp để bắt đầu quiz</p>
                <button
                  onClick={() => setMode("browse")}
                  className="mt-4 px-4 py-2 bg-app-card/50 rounded-lg text-sm text-white/50 hover:bg-app-card/70 cursor-pointer whitespace-nowrap"
                >
                  Quay lại
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
