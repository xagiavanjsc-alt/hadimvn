import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface GrammarPoint {
  id: number;
  lesson_id: number;
  lesson_title: string;
  lesson_title_vi: string;
  topic: string;
  level: string;
  pattern: string;
  explanation: string;
  notes: string | null;
  examples: { id: number; korean: string; vietnamese: string }[];
}

interface QuizQuestion {
  id: string;
  grammarId: number;
  pattern: string;
  explanation: string;
  examples: { korean: string; vietnamese: string }[];
  options: string[];
  correctIndex: number;
  type: "identify" | "example";
}

const BOOKS = [
  { id: "all", label: "Tất cả", color: "#e8c84a" },
  { id: "1A", label: "Seoul 1A", color: "#34d399", lessonRange: [1, 7] },
  { id: "1B", label: "Seoul 1B", color: "#34d399", lessonRange: [8, 14] },
  { id: "2A", label: "Seoul 2A", color: "#60a5fa", lessonRange: [1, 9] },
  { id: "2B", label: "Seoul 2B", color: "#60a5fa", lessonRange: [10, 18] },
  { id: "3A", label: "Seoul 3A", color: "#a78bfa", lessonRange: [1, 9] },
  { id: "3B", label: "Seoul 3B", color: "#a78bfa", lessonRange: [10, 17] },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#34d399",
  intermediate: "#e8c84a",
  advanced: "#f87171",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export default function SeoulGrammarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grammar, setGrammar] = useState<GrammarPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [mode, setMode] = useState<"browse" | "quiz">("browse");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessons, setLessons] = useState<{ id: number; title: string; title_vi: string }[]>([]);

  useEffect(() => {
    fetchGrammar();
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    const { data } = await supabase
      .from("seoul_lessons")
      .select("id, title, title_vi")
      .order("id");
    if (data) setLessons(data);
  };

  const fetchGrammar = async () => {
    setLoading(true);
    const { data: grammarData, error } = await supabase
      .from("seoul_grammar")
      .select("*")
      .order("lesson_id", { ascending: true });

    if (error || !grammarData) {
      setLoading(false);
      return;
    }

    const ids = grammarData.map((g: GrammarPoint) => g.id);
    const { data: examplesData } = await supabase
      .from("seoul_grammar_examples")
      .select("*")
      .in("grammar_id", ids);

    const examplesByGrammar: Record<number, { id: number; korean: string; vietnamese: string }[]> = {};
    (examplesData || []).forEach((ex: { id: number; grammar_id: number; korean: string; vietnamese: string }) => {
      if (!examplesByGrammar[ex.grammar_id]) examplesByGrammar[ex.grammar_id] = [];
      examplesByGrammar[ex.grammar_id].push({ id: ex.id, korean: ex.korean, vietnamese: ex.vietnamese });
    });

    const combined = grammarData.map((g: GrammarPoint) => ({
      ...g,
      examples: examplesByGrammar[g.id] || [],
    }));

    setGrammar(combined);
    setLoading(false);
  };

  const filteredGrammar = grammar.filter(g => {
    const matchLevel = selectedLevel === "all" || g.level === selectedLevel;
    const matchSearch = !searchQuery ||
      g.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLesson = selectedLesson === null || g.lesson_id === selectedLesson;
    return matchLevel && matchSearch && matchLesson;
  });

  const generateQuiz = useCallback(() => {
    const pool = selectedLesson
      ? grammar.filter(g => g.lesson_id === selectedLesson)
      : filteredGrammar;

    if (pool.length < 2) return;

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
    const questions: QuizQuestion[] = shuffled.map((g, idx) => {
      const otherPatterns = pool.filter(p => p.id !== g.id).map(p => p.pattern);
      const wrongOptions = otherPatterns.sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [...wrongOptions, g.pattern].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.indexOf(g.pattern);

      return {
        id: `q${idx}`,
        grammarId: g.id,
        pattern: g.pattern,
        explanation: g.explanation,
        examples: g.examples.slice(0, 2),
        options: allOptions,
        correctIndex,
        type: "identify",
      };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizDone(false);
    setMode("quiz");
  }, [grammar, filteredGrammar, selectedLesson]);

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

  const currentQ = quizQuestions[quizIndex];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1117] p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/seoul-textbook")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-white/60 text-sm"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Ngữ pháp Seoul</h1>
              <p className="text-white/40 text-sm">141 điểm ngữ pháp từ Seoul 1A đến 3B</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: "Tổng điểm ngữ pháp", value: grammar.length, icon: "ri-book-2-line", color: "#e8c84a" },
              { label: "Sơ cấp", value: grammar.filter(g => g.level === "beginner").length, icon: "ri-seedling-line", color: "#34d399" },
              { label: "Trung cấp", value: grammar.filter(g => g.level === "intermediate").length, icon: "ri-plant-line", color: "#e8c84a" },
              { label: "Nâng cao", value: grammar.filter(g => g.level === "advanced").length, icon: "ri-tree-line", color: "#f87171" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
                  </div>
                  <span className="text-white/40 text-xs">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode("browse")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                mode === "browse" ? "bg-[#e8c84a] text-black" : "text-white/50 hover:text-white/80"
              }`}
            >
              <i className="ri-book-open-line mr-1.5"></i>Học ngữ pháp
            </button>
            <button
              onClick={generateQuiz}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                mode === "quiz" ? "bg-[#e8c84a] text-black" : "text-white/50 hover:text-white/80"
              }`}
            >
              <i className="ri-question-line mr-1.5"></i>Quiz ngữ pháp
            </button>
          </div>

          {mode === "browse" && (
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
              <input
                type="text"
                placeholder="Tìm kiếm ngữ pháp..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e8c84a]/40"
              />
            </div>
          )}
        </div>

        {mode === "browse" ? (
          <div className="flex gap-5">
            {/* Sidebar filters */}
            <div className="w-52 flex-shrink-0 space-y-4">
              {/* Level filter */}
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="text-white/50 text-xs font-semibold tracking-wider mb-3">Cấp độ</p>
                <div className="space-y-1">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "beginner", label: "Sơ cấp" },
                    { id: "intermediate", label: "Trung cấp" },
                    { id: "advanced", label: "Nâng cao" },
                  ].map(lv => (
                    <button
                      key={lv.id}
                      onClick={() => setSelectedLevel(lv.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                        selectedLevel === lv.id
                          ? "bg-[#e8c84a]/15 text-[#e8c84a] font-medium"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}
                    >
                      {lv.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lesson filter */}
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="text-white/50 text-xs font-semibold tracking-wider mb-3">Bài học</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedLesson === null
                        ? "bg-[#e8c84a]/15 text-[#e8c84a] font-medium"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    Tất cả bài
                  </button>
                  {lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                        selectedLesson === lesson.id
                          ? "bg-[#e8c84a]/15 text-[#e8c84a] font-medium"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-white/30 mr-1">Bài {lesson.id}:</span>
                      {lesson.title_vi || lesson.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grammar list */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
                </div>
              ) : filteredGrammar.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <i className="ri-book-2-line text-4xl mb-3 block"></i>
                  <p>Không tìm thấy ngữ pháp phù hợp</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/40 text-sm mb-4">
                    Hiển thị <span className="text-white font-medium">{filteredGrammar.length}</span> điểm ngữ pháp
                  </p>
                  {filteredGrammar.map(g => (
                    <div
                      key={g.id}
                      className="bg-white/3 border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-all"
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                        className="w-full text-left p-4 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: `${LEVEL_COLORS[g.level]}20`,
                                  color: LEVEL_COLORS[g.level],
                                }}
                              >
                                {LEVEL_LABELS[g.level]}
                              </span>
                              <span className="text-white/30 text-[10px]">Bài {g.lesson_id}</span>
                              <span className="text-white/20 text-[10px]">•</span>
                              <span className="text-white/30 text-[10px] truncate">{g.lesson_title_vi}</span>
                            </div>
                            <p className="text-[#e8c84a] font-bold text-base mb-1">{g.pattern}</p>
                            <p className="text-white/60 text-sm line-clamp-2">{g.explanation}</p>
                          </div>
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <i className={`text-white/30 text-sm transition-transform duration-200 ${
                              expandedId === g.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                            }`}></i>
                          </div>
                        </div>
                      </button>

                      {expandedId === g.id && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3">
                          <p className="text-white/70 text-sm mb-3">{g.explanation}</p>
                          {g.examples.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-white/40 text-xs font-semibold tracking-wider">Ví dụ</p>
                              {g.examples.map((ex, i) => (
                                <div key={i} className="bg-white/3 rounded-lg p-3">
                                  <p className="text-white font-medium text-sm">{ex.korean}</p>
                                  <p className="text-white/50 text-xs mt-0.5">{ex.vietnamese}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {g.notes && (
                            <div className="mt-3 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-lg p-3">
                              <p className="text-[#e8c84a]/80 text-xs">{g.notes}</p>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedLesson(g.lesson_id);
                              generateQuiz();
                            }}
                            className="mt-3 px-4 py-2 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 border border-[#e8c84a]/20 rounded-lg text-[#e8c84a] text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-question-line mr-1.5"></i>Quiz bài này
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Quiz mode */
          <div className="max-w-2xl mx-auto">
            {quizDone ? (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-[#e8c84a]/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-trophy-line text-[#e8c84a] text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Hoàn thành!</h2>
                <p className="text-white/50 mb-6">
                  Bạn trả lời đúng <span className="text-[#e8c84a] font-bold text-xl">{quizScore}</span>/{quizQuestions.length} câu
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={generateQuiz}
                    className="px-6 py-3 bg-[#e8c84a] text-black rounded-xl font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-[#e8c84a]/90 transition-colors"
                  >
                    <i className="ri-refresh-line mr-1.5"></i>Làm lại
                  </button>
                  <button
                    onClick={() => setMode("browse")}
                    className="px-6 py-3 bg-white/5 text-white/70 rounded-xl font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-white/10 transition-colors"
                  >
                    <i className="ri-book-open-line mr-1.5"></i>Xem ngữ pháp
                  </button>
                </div>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <i className="ri-question-line text-4xl mb-3 block"></i>
                <p>Không đủ ngữ pháp để tạo quiz. Cần ít nhất 2 điểm ngữ pháp.</p>
                <button
                  onClick={() => setMode("browse")}
                  className="mt-4 px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
            ) : (
              <div>
                {/* Progress */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/40 text-sm">Câu {quizIndex + 1}/{quizQuestions.length}</span>
                  <span className="text-[#e8c84a] text-sm font-medium">{quizScore} điểm</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-[#e8c84a] rounded-full transition-all duration-300"
                    style={{ width: `${((quizIndex) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>

                {/* Question */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-4">
                  <p className="text-white/40 text-xs font-semibold tracking-wider mb-3">
                    Chọn cấu trúc ngữ pháp phù hợp với giải thích sau:
                  </p>
                  <p className="text-white text-base font-medium mb-4">{currentQ.explanation}</p>
                  {currentQ.examples.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {currentQ.examples.map((ex, i) => (
                        <div key={i} className="bg-white/5 rounded-lg px-3 py-2">
                          <p className="text-white/80 text-sm">{ex.korean}</p>
                          <p className="text-white/40 text-xs">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3 mb-4">
                  {currentQ.options.map((opt, idx) => {
                    let btnClass = "bg-white/3 border border-white/10 text-white/70 hover:bg-white/8 hover:border-white/20";
                    if (selectedAnswer !== null) {
                      if (idx === currentQ.correctIndex) {
                        btnClass = "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400";
                      } else if (idx === selectedAnswer && idx !== currentQ.correctIndex) {
                        btnClass = "bg-red-500/15 border border-red-500/40 text-red-400";
                      } else {
                        btnClass = "bg-white/3 border border-white/8 text-white/30";
                      }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${btnClass}`}
                      >
                        <span className="text-white/30 mr-2">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <div className="flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-3 bg-[#e8c84a] text-black rounded-xl font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-[#e8c84a]/90 transition-colors"
                    >
                      {quizIndex + 1 >= quizQuestions.length ? "Xem kết quả" : "Câu tiếp theo"}
                      <i className="ri-arrow-right-line ml-1.5"></i>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
