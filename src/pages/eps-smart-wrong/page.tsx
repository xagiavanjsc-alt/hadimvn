import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsQuestions, EpsQuestion } from "@/mocks/epsQuestions";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WrongAnswer {
  questionId: string;
  question: EpsQuestion;
  selectedIndex: number;
  wrongCount: number;
  lastWrong: string;
  source: string;
}

interface ReviewSession {
  questions: EpsQuestion[];
  answers: (number | null)[];
  results: { isCorrect: boolean; selectedIndex: number }[];
  phase: "quiz" | "result";
  currentIndex: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getWrongAnswers(): WrongAnswer[] {
  try {
    return JSON.parse(localStorage.getItem("kts_eps_wrong_answers") || "[]");
  } catch {
    return [];
  }
}

function saveWrongAnswers(data: WrongAnswer[]) {
  localStorage.setItem("kts_eps_wrong_answers", JSON.stringify(data));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  return "Vừa xong";
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
        <i className="ri-check-double-line text-emerald-400 text-4xl"></i>
      </div>
      <h3 className="text-white font-bold text-lg mb-2">Chưa có câu sai nào!</h3>
      <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
        Làm bài thi EPS để hệ thống tự động ghi lại câu sai và tạo đề ôn tập cá nhân hóa cho bạn.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => navigate("/eps-mock-exam")}
          className="px-5 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
        >
          Thi mô phỏng thật
        </button>
        <button
          onClick={() => navigate("/eps-exam")}
          className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
        >
          Thi thử 40 câu
        </button>
      </div>
    </div>
  );
}

// ─── Wrong Answer Card ────────────────────────────────────────────────────────
interface WrongCardProps {
  item: WrongAnswer;
  onRemove: (id: string) => void;
}

function WrongCard({ item, onRemove }: WrongCardProps) {
  const [expanded, setExpanded] = useState(false);
  const q = item.question;

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Wrong count badge */}
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${
          item.wrongCount >= 3 ? "bg-rose-500/20" : item.wrongCount >= 2 ? "bg-amber-500/20" : "bg-white/8"
        }`}>
          <span className={`text-xs font-bold ${
            item.wrongCount >= 3 ? "text-rose-400" : item.wrongCount >= 2 ? "text-amber-400" : "text-white/50"
          }`}>{item.wrongCount}x</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40">{q.topicVi}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              q.difficulty === "easy" ? "bg-emerald-500/15 text-emerald-400" :
              q.difficulty === "medium" ? "bg-amber-500/15 text-amber-400" :
              "bg-rose-500/15 text-rose-400"
            }`}>
              {q.difficulty === "easy" ? "Dễ" : q.difficulty === "medium" ? "TB" : "Khó"}
            </span>
            <span className="text-white/20 text-[10px]">{timeAgo(item.lastWrong)}</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{q.questionVi}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onRemove(item.questionId); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
          <i className={`text-white/30 text-sm transition-transform ${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          {/* Question */}
          <div className="bg-white/3 rounded-lg p-3">
            <p className="text-white text-sm font-medium mb-1">{q.question}</p>
            <p className="text-white/40 text-xs">{q.questionVi}</p>
          </div>

          {/* Options */}
          <div className="space-y-1.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isWrong = i === item.selectedIndex && !isCorrect;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                    isCorrect ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" :
                    isWrong ? "bg-rose-500/10 border border-rose-500/20 text-rose-300" :
                    "bg-white/3 text-white/40"
                  }`}
                >
                  <span className="flex-shrink-0 font-bold">{["①", "②", "③", "④"][i]}</span>
                  <div className="flex-1">
                    <p>{opt}</p>
                    <p className="opacity-60 mt-0.5">{q.optionsVi[i]}</p>
                  </div>
                  {isCorrect && <i className="ri-check-line flex-shrink-0 mt-0.5"></i>}
                  {isWrong && <i className="ri-close-line flex-shrink-0 mt-0.5"></i>}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-lg p-3">
            <p className="text-[#e8c84a] text-[10px] font-semibold mb-1 flex items-center gap-1">
              <i className="ri-lightbulb-line"></i> Giải thích
            </p>
            <p className="text-white/50 text-xs leading-relaxed">{q.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review Quiz ──────────────────────────────────────────────────────────────
interface ReviewQuizProps {
  session: ReviewSession;
  onAnswer: (idx: number) => void;
  onNext: () => void;
  onFinish: () => void;
}

function ReviewQuiz({ session, onAnswer, onNext, onFinish }: ReviewQuizProps) {
  const { questions, answers, results, phase, currentIndex } = session;
  const q = questions[currentIndex];
  const answered = answers[currentIndex];
  const result = results[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  if (phase === "result") {
    const correct = results.filter(r => r.isCorrect).length;
    const score = Math.round((correct / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${score >= 80 ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
          <span className={`text-3xl font-black ${score >= 80 ? "text-emerald-400" : "text-rose-400"}`}>{score}</span>
        </div>
        <h3 className={`text-lg font-bold mb-1 ${score >= 80 ? "text-emerald-400" : "text-rose-400"}`}>
          {score >= 80 ? "Xuất sắc! Đã nắm vững!" : "Cần ôn thêm!"}
        </h3>
        <p className="text-white/50 text-sm mb-6">{correct}/{questions.length} câu đúng</p>
        <button
          onClick={onFinish}
          className="px-6 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
        >
          Hoàn thành
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs">Câu {currentIndex + 1}/{questions.length}</span>
        <div className="h-1.5 flex-1 mx-3 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-[#e8c84a] rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="text-white/40 text-xs">{q.topicVi}</span>
      </div>

      {/* Question */}
      <div className="bg-white/3 rounded-xl p-4 border border-white/5">
        <p className="text-white font-medium text-sm leading-relaxed">{q.question}</p>
        <p className="text-white/40 text-xs mt-2">{q.questionVi}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let style = "bg-white/3 border-white/8 text-white/70 hover:bg-white/6";
          if (answered !== null) {
            if (i === q.correctIndex) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
            else if (i === answered) style = "bg-rose-500/15 border-rose-500/40 text-rose-300";
            else style = "bg-white/3 border-white/5 text-white/30";
          } else if (answered === i) {
            style = "bg-[#e8c84a]/12 border-[#e8c84a]/40 text-[#e8c84a]";
          }
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left cursor-pointer ${style}`}
            >
              <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 bg-white/8 mt-0.5">
                {["①", "②", "③", "④"][i]}
              </span>
              <div className="flex-1">
                <p className="text-sm">{opt}</p>
                <p className="text-xs opacity-60 mt-0.5">{q.optionsVi[i]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation after answer */}
      {answered !== null && (
        <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
          <p className="text-[#e8c84a] text-xs font-semibold mb-1 flex items-center gap-1">
            <i className="ri-lightbulb-line"></i> Giải thích
          </p>
          <p className="text-white/50 text-xs leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {answered !== null && (
        <button
          onClick={isLast ? onFinish : onNext}
          className="w-full py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
        >
          {isLast ? "Xem kết quả" : "Câu tiếp theo"}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpsSmartWrongPage() {
  const navigate = useNavigate();
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [filter, setFilter] = useState<"all" | "frequent" | "recent">("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [view, setView] = useState<"list" | "quiz">("list");

  useEffect(() => {
    setWrongAnswers(getWrongAnswers());
  }, []);

  const handleRemove = useCallback((id: string) => {
    const updated = wrongAnswers.filter(w => w.questionId !== id);
    setWrongAnswers(updated);
    saveWrongAnswers(updated);
  }, [wrongAnswers]);

  const handleClearAll = useCallback(() => {
    setWrongAnswers([]);
    saveWrongAnswers([]);
  }, []);

  // Filter logic
  const filtered = wrongAnswers.filter(w => {
    if (topicFilter !== "all" && w.question.topic !== topicFilter) return false;
    return true;
  }).sort((a, b) => {
    if (filter === "frequent") return b.wrongCount - a.wrongCount;
    if (filter === "recent") return new Date(b.lastWrong).getTime() - new Date(a.lastWrong).getTime();
    return b.wrongCount - a.wrongCount;
  });

  // Start review session
  const startReview = useCallback((count: number = 20) => {
    const toReview = filtered.slice(0, count).map(w => w.question);
    if (toReview.length === 0) return;
    setSession({
      questions: toReview,
      answers: new Array(toReview.length).fill(null),
      results: [],
      phase: "quiz",
      currentIndex: 0,
    });
    setView("quiz");
  }, [filtered]);

  const handleAnswer = useCallback((idx: number) => {
    if (!session) return;
    const q = session.questions[session.currentIndex];
    const isCorrect = idx === q.correctIndex;
    setSession(prev => {
      if (!prev) return prev;
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentIndex] = idx;
      const newResults = [...prev.results, { isCorrect, selectedIndex: idx }];

      // If correct, reduce wrong count
      if (isCorrect) {
        const updated = wrongAnswers.map(w =>
          w.questionId === q.id ? { ...w, wrongCount: Math.max(0, w.wrongCount - 1) } : w
        ).filter(w => w.wrongCount > 0);
        setWrongAnswers(updated);
        saveWrongAnswers(updated);
      }

      return { ...prev, answers: newAnswers, results: newResults };
    });
  }, [session, wrongAnswers]);

  const handleNext = useCallback(() => {
    setSession(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : prev);
  }, []);

  const handleFinish = useCallback(() => {
    if (!session) return;
    if (session.phase === "quiz") {
      setSession(prev => prev ? { ...prev, phase: "result" } : prev);
    } else {
      setView("list");
      setSession(null);
      setWrongAnswers(getWrongAnswers());
    }
  }, [session]);

  // Topics from wrong answers
  const topics = Array.from(new Set(wrongAnswers.map(w => w.question.topic)));
  const topicLabels: Record<string, string> = {};
  wrongAnswers.forEach(w => { topicLabels[w.question.topic] = w.question.topicVi; });

  // Stats
  const totalWrong = wrongAnswers.length;
  const frequentWrong = wrongAnswers.filter(w => w.wrongCount >= 3).length;
  const recentWrong = wrongAnswers.filter(w => {
    const diff = Date.now() - new Date(w.lastWrong).getTime();
    return diff < 86400000 * 7;
  }).length;

  if (view === "quiz" && session) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => { setView("list"); setSession(null); }}
              className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer text-sm"
            >
              <i className="ri-arrow-left-line"></i>
              Thoát ôn tập
            </button>
            <h2 className="text-white font-semibold text-sm">Ôn tập câu sai thông minh</h2>
          </div>
          <ReviewQuiz
            session={session}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onFinish={handleFinish}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/15">
              <i className="ri-error-warning-line text-rose-400 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Ôn tập câu sai thông minh</h1>
              <p className="text-white/40 text-sm">Tổng hợp câu sai từ mọi bài thi</p>
            </div>
          </div>
          {wrongAnswers.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-white/30 hover:text-rose-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {wrongAnswers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Tổng câu sai", value: totalWrong, color: "#f87171", icon: "ri-close-circle-line" },
                { label: "Sai ≥3 lần", value: frequentWrong, color: "#fb923c", icon: "ri-alarm-warning-line" },
                { label: "Sai tuần này", value: recentWrong, color: "#e8c84a", icon: "ri-calendar-line" },
              ].map((item, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-white font-bold text-xl">{item.value}</p>
                  <p className="text-white/40 text-xs">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Start review CTA */}
            <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm">Bắt đầu ôn tập ngay</h3>
                  <p className="text-white/40 text-xs mt-0.5">Hệ thống tự tạo đề ôn tập cá nhân hóa từ câu sai của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: "Ôn 10 câu", count: 10 },
                  { label: "Ôn 20 câu", count: 20 },
                  { label: "Ôn tất cả", count: filtered.length },
                ].map(item => (
                  <button
                    key={item.count}
                    onClick={() => startReview(item.count)}
                    disabled={filtered.length === 0}
                    className="px-4 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-500/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40"
                  >
                    {item.label} ({Math.min(item.count, filtered.length)})
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "frequent", label: "Sai nhiều nhất" },
                  { key: "recent", label: "Gần đây" },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      filter === f.key ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {topics.length > 0 && (
                <select
                  value={topicFilter}
                  onChange={e => setTopicFilter(e.target.value)}
                  className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {topics.map(t => (
                    <option key={t} value={t}>{topicLabels[t]}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Wrong answer list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">Không có câu sai nào phù hợp bộ lọc</div>
              ) : (
                filtered.map(item => (
                  <WrongCard key={item.questionId} item={item} onRemove={handleRemove} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
