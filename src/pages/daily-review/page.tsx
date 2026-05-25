import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { grammarPatterns } from "@/mocks/grammarData";
import { vocabularyData } from "@/mocks/vocabularyData";
import { getStreakData, recordActivity } from "@/utils/streak";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = "vocab_meaning" | "vocab_korean" | "grammar_choose" | "grammar_fill";

interface ReviewQuestion {
  id: string;
  type: QuestionType;
  question: string;
  questionSub?: string;
  options: string[];
  answer: string;
  explanation: string;
  source: string;
  level: string;
}

interface DailySession {
  date: string;
  questions: ReviewQuestion[];
  answers: Record<string, string>;
  completed: boolean;
  score: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDailyQuestions(): ReviewQuestion[] {
  const questions: ReviewQuestion[] = [];

  // 4 vocab meaning questions (Korean → Vietnamese)
  const vocabPool = shuffle(vocabularyData).slice(0, 20);
  for (let i = 0; i < 4; i++) {
    const item = vocabPool[i];
    const wrongOptions = shuffle(vocabularyData.filter(v => v.id !== item.id))
      .slice(0, 3)
      .map(v => v.vietnamese);
    const opts = shuffle([item.vietnamese, ...wrongOptions]);
    questions.push({
      id: `vq_${item.id}`,
      type: "vocab_meaning",
      question: item.korean,
      questionSub: item.reading,
      options: opts,
      answer: item.vietnamese,
      explanation: `${item.korean} (${item.reading}) = ${item.vietnamese}\nVí dụ: ${item.example}\n→ ${item.exampleVi}`,
      source: "Từ vựng",
      level: item.topikLevel,
    });
  }

  // 3 vocab Korean questions (Vietnamese → Korean)
  for (let i = 4; i < 7; i++) {
    const item = vocabPool[i];
    const wrongOptions = shuffle(vocabularyData.filter(v => v.id !== item.id))
      .slice(0, 3)
      .map(v => v.korean);
    const opts = shuffle([item.korean, ...wrongOptions]);
    questions.push({
      id: `vk_${item.id}`,
      type: "vocab_korean",
      question: item.vietnamese,
      questionSub: `Chọn từ tiếng Hàn đúng`,
      options: opts,
      answer: item.korean,
      explanation: `${item.vietnamese} = ${item.korean} (${item.reading})\nVí dụ: ${item.example}\n→ ${item.exampleVi}`,
      source: "Từ vựng",
      level: item.topikLevel,
    });
  }

  // 3 grammar choose questions
  const grammarPool = shuffle(grammarPatterns.filter(g => g.exercises.some(e => e.type === "choose")));
  let grammarCount = 0;
  for (const pattern of grammarPool) {
    if (grammarCount >= 3) break;
    const ex = pattern.exercises.find(e => e.type === "choose");
    if (!ex || !ex.options) continue;
    questions.push({
      id: `gc_${ex.id}`,
      type: "grammar_choose",
      question: ex.question,
      questionSub: ex.questionVi,
      options: ex.options,
      answer: ex.answer,
      explanation: `${pattern.pattern}: ${pattern.meaning}\n${ex.explanation}`,
      source: "Ngữ pháp",
      level: pattern.level,
    });
    grammarCount++;
  }

  return shuffle(questions.slice(0, 10));
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ value, max, size = 80, color = "#e8c84a" }: { value: number; max: number; size?: number; color?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  answered,
  selectedAnswer,
}: {
  question: ReviewQuestion;
  index: number;
  total: number;
  onAnswer: (answer: string) => void;
  answered: boolean;
  selectedAnswer: string;
}) {
  const isCorrect = selectedAnswer === question.answer;

  const typeLabel: Record<QuestionType, string> = {
    vocab_meaning: "Nghĩa từ vựng",
    vocab_korean: "Từ tiếng Hàn",
    grammar_choose: "Ngữ pháp",
    grammar_fill: "Điền vào chỗ trống",
  };

  const typeColor: Record<QuestionType, string> = {
    vocab_meaning: "#34d399",
    vocab_korean: "#38bdf8",
    grammar_choose: "#e8c84a",
    grammar_fill: "#fb923c",
  };

  const color = typeColor[question.type];

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-6 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
          {typeLabel[question.type]}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{question.level}</span>
          <span className="text-app-text-muted text-xs">{index + 1}/{total}</span>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <p className="text-white font-bold text-2xl mb-1">{question.question}</p>
        {question.questionSub && (
          <p className="text-app-text-secondary text-sm">{question.questionSub}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          let btnClass = "border border-app-border bg-app-surface/50 text-white/70 hover:border-white/20 hover:bg-app-card/50";
          if (answered) {
            if (opt === question.answer) {
              btnClass = "border-2 border-emerald-400/60 bg-emerald-400/10 text-emerald-300";
            } else if (opt === selectedAnswer && !isCorrect) {
              btnClass = "border-2 border-red-400/60 bg-red-400/10 text-red-300";
            } else {
              btnClass = "border border-app-border bg-white/2 text-app-text-muted";
            }
          }
          return (
            <button
              key={i}
              onClick={() => !answered && onAnswer(opt)}
              disabled={answered}
              className={`${btnClass} rounded-xl px-4 py-3 text-sm font-medium text-left transition-all cursor-pointer whitespace-normal leading-snug`}
            >
              {answered && opt === question.answer && (
                <i className="ri-check-line text-app-accent-success mr-1.5"></i>
              )}
              {answered && opt === selectedAnswer && !isCorrect && (
                <i className="ri-close-line text-red-400 mr-1.5"></i>
              )}
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? "bg-emerald-400/5 border-emerald-400/15" : "bg-red-400/5 border-red-400/15"}`}>
          <div className="flex items-center gap-2 mb-2">
            <i className={`${isCorrect ? "ri-check-double-line text-app-accent-success" : "ri-information-line text-red-400"} text-sm`}></i>
            <span className={`text-xs font-bold ${isCorrect ? "text-app-accent-success" : "text-red-400"}`}>
              {isCorrect ? "Chính xác!" : "Chưa đúng"}
            </span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  questions,
  answers,
  onRestart,
  streak,
}: {
  questions: ReviewQuestion[];
  answers: Record<string, string>;
  onRestart: () => void;
  streak: number;
}) {
  const correct = questions.filter(q => answers[q.id] === q.answer).length;
  const pct = Math.round((correct / questions.length) * 100);

  const bySource = questions.reduce<Record<string, { correct: number; total: number }>>((acc, q) => {
    if (!acc[q.source]) acc[q.source] = { correct: 0, total: 0 };
    acc[q.source].total++;
    if (answers[q.id] === q.answer) acc[q.source].correct++;
    return acc;
  }, {});

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Score card */}
      <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-8 text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <ProgressRing value={correct} max={questions.length} size={100} color={pct >= 70 ? "#34d399" : pct >= 50 ? "#e8c84a" : "#f87171"} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-xl">{correct}/{questions.length}</span>
            <span className="text-app-text-secondary text-[10px]">đúng</span>
          </div>
        </div>
        <h2 className="text-white font-bold text-xl mb-1">
          {pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Tốt lắm!" : "Cố gắng hơn nhé!"}
        </h2>
        <p className="text-app-text-secondary text-sm mb-4">Bạn đạt {pct}% hôm nay</p>
        <div className="flex items-center justify-center gap-2 text-[#fb923c]">
          <i className="ri-fire-line text-lg"></i>
          <span className="font-bold text-base">{streak} ngày streak</span>
        </div>
      </div>

      {/* By source */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Kết quả theo module</h3>
        <div className="space-y-3">
          {Object.entries(bySource).map(([src, stat]) => (
            <div key={src} className="flex items-center gap-3">
              <span className="text-white/60 text-sm w-24 flex-shrink-0">{src}</span>
              <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(stat.correct / stat.total) * 100}%`,
                    backgroundColor: stat.correct / stat.total >= 0.7 ? "#34d399" : "#e8c84a",
                  }}
                />
              </div>
              <span className="text-app-text-secondary text-xs w-12 text-right">{stat.correct}/{stat.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review wrong answers */}
      {questions.some(q => answers[q.id] !== q.answer) && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">
            <i className="ri-error-warning-line text-app-accent-primary mr-2"></i>
            Câu cần ôn lại ({questions.filter(q => answers[q.id] !== q.answer).length})
          </h3>
          <div className="space-y-3">
            {questions.filter(q => answers[q.id] !== q.answer).map(q => (
              <div key={q.id} className="p-3 bg-red-400/5 border border-red-400/10 rounded-xl">
                <p className="text-white/70 text-sm font-medium mb-1">{q.question}</p>
                <p className="text-app-accent-success text-xs">
                  <i className="ri-check-line mr-1"></i>Đáp án đúng: <strong>{q.answer}</strong>
                </p>
                {answers[q.id] && (
                  <p className="text-red-400/70 text-xs mt-0.5">
                    <i className="ri-close-line mr-1"></i>Bạn chọn: {answers[q.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full py-3 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
      >
        <i className="ri-refresh-line mr-2"></i>Ôn tập lại
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DailyReviewPage() {
  const [session, setSession] = useLocalStorage<DailySession | null>("kts_daily_review_session", null);
  const streak = getStreakData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useLocalStorage<{ date: string; score: number; total: number }[]>("kts_review_history", []);

  const todayKey = getTodayKey();

  // Init or restore session
  useEffect(() => {
    if (!session || session.date !== todayKey) {
      const questions = generateDailyQuestions();
      const newSession: DailySession = {
        date: todayKey,
        questions,
        answers: {},
        completed: false,
        score: 0,
      };
      setSession(newSession);
      setAnswers({});
      setCurrentIndex(0);
      setShowResult(false);
    } else {
      setAnswers(session.answers);
      if (session.completed) {
        setShowResult(true);
      } else {
        const firstUnanswered = session.questions.findIndex(q => !session.answers[q.id]);
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      }
    }
  }, []);

  const questions = session?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = useCallback((answer: string) => {
    if (!session) return;
    const q = questions[currentIndex];
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);
    const updatedSession = { ...session, answers: newAnswers };
    setSession(updatedSession);
  }, [session, questions, currentIndex, answers]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // Complete session
      const correct = questions.filter(q => answers[q.id] === q.answer).length;
      const updatedSession = { ...session!, answers, completed: true, score: correct };
      setSession(updatedSession);

      // Update streak using centralized function
      recordActivity(1);

      // Save history
      setHistory(prev => [{ date: todayKey, score: correct, total: questions.length }, ...prev.slice(0, 29)]);
      setShowResult(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [isLastQuestion, questions, answers, session, todayKey]);

  const handleRestart = useCallback(() => {
    const newQuestions = generateDailyQuestions();
    const newSession: DailySession = {
      date: todayKey,
      questions: newQuestions,
      answers: {},
      completed: false,
      score: 0,
    };
    setSession(newSession);
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  }, [todayKey]);

  const currentQuestion = questions[currentIndex];
  const currentAnswered = currentQuestion ? !!answers[currentQuestion.id] : false;

  // Streak heatmap (last 14 days)
  const heatmapDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      const entry = history.find(h => h.date === key);
      return { key, hasData: !!entry, score: entry ? Math.round((entry.score / entry.total) * 100) : 0 };
    });
  }, [history]);

  return (
    <DashboardLayout
      title="Ôn tập hàng ngày"
      subtitle="10 câu mỗi ngày — duy trì streak và củng cố kiến thức"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        {/* Main content */}
        <div>
          {!session || questions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
            </div>
          ) : showResult ? (
            <ResultScreen
              questions={questions}
              answers={answers}
              onRestart={handleRestart}
              streak={streak.currentStreak}
            />
          ) : (
            <div className="space-y-5">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-app-accent-primary rounded-full transition-all duration-500"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-app-text-secondary text-xs whitespace-nowrap">{answeredCount}/{questions.length}</span>
              </div>

              {/* Question dots */}
              <div className="flex gap-1.5 justify-center flex-wrap">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      i === currentIndex
                        ? "bg-app-accent-primary text-app-bg"
                        : answers[q.id]
                          ? answers[q.id] === q.answer
                            ? "bg-emerald-400/20 text-app-accent-success border border-emerald-400/30"
                            : "bg-red-400/20 text-red-400 border border-red-400/30"
                          : "bg-app-card/50 text-app-text-muted border border-app-border"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Question */}
              {currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  index={currentIndex}
                  total={questions.length}
                  onAnswer={handleAnswer}
                  answered={currentAnswered}
                  selectedAnswer={answers[currentQuestion.id] || ""}
                />
              )}

              {/* Next button */}
              {currentAnswered && (
                <div className="flex justify-center">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold px-8 py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                  >
                    {isLastQuestion ? (
                      <><i className="ri-flag-line"></i>Xem kết quả</>
                    ) : (
                      <><i className="ri-arrow-right-line"></i>Câu tiếp theo</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Streak */}
          <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#fb923c]/15">
                <i className="ri-fire-line text-[#fb923c] text-xl"></i>
              </div>
              <div>
                <p className="text-white font-bold text-xl">{streak.currentStreak} ngày</p>
                <p className="text-app-text-secondary text-xs">Streak hiện tại</p>
              </div>
            </div>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              {streak.currentStreak >= 30
                ? "Top 5% cộng đồng! Bạn thật xuất sắc!"
                : streak.currentStreak >= 7
                  ? "Đang tiến bộ tốt — tiếp tục nhé!"
                  : "Học mỗi ngày để duy trì streak!"}
            </p>
          </div>

          {/* Today's progress */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Hôm nay</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ProgressRing value={answeredCount} max={questions.length || 10} size={64} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{answeredCount}</span>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-base">{answeredCount}/{questions.length || 10}</p>
                <p className="text-app-text-secondary text-xs">câu đã làm</p>
                {showResult && session && (
                  <p className="text-app-accent-success text-xs mt-1 font-semibold">
                    <i className="ri-check-double-line mr-1"></i>Hoàn thành!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">14 ngày gần đây</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {heatmapDays.map(day => (
                <div
                  key={day.key}
                  title={day.hasData ? `${day.key}: ${day.score}%` : day.key}
                  className="w-full aspect-square rounded-md transition-all"
                  style={{
                    backgroundColor: day.hasData
                      ? day.score >= 80
                        ? "rgba(52,211,153,0.6)"
                        : day.score >= 60
                          ? "rgba(232,200,74,0.5)"
                          : "rgba(248,113,113,0.4)"
                      : "rgba(255,255,255,0.04)",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-app-text-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/60 inline-block"></span>80%+</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-app-accent-primary/50 inline-block"></span>60%+</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400/40 inline-block"></span>&lt;60%</span>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Lịch sử gần đây</h3>
              <div className="space-y-2">
                {history.slice(0, 5).map(h => {
                  const pct = Math.round((h.score / h.total) * 100);
                  return (
                    <div key={h.date} className="flex items-center gap-3">
                      <span className="text-app-text-muted text-[10px] w-20 flex-shrink-0">{h.date.slice(5)}</span>
                      <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171",
                          }}
                        />
                      </div>
                      <span className="text-app-text-secondary text-[10px] w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">
              <i className="ri-lightbulb-line text-app-accent-primary mr-2"></i>Mẹo học
            </h3>
            <ul className="space-y-2 text-app-text-secondary text-xs leading-relaxed">
              <li className="flex gap-2"><span className="text-app-accent-primary flex-shrink-0">•</span>Học 10 câu mỗi ngày hiệu quả hơn học 100 câu một lần</li>
              <li className="flex gap-2"><span className="text-app-accent-primary flex-shrink-0">•</span>Câu sai hôm nay sẽ xuất hiện lại ngày mai</li>
              <li className="flex gap-2"><span className="text-app-accent-primary flex-shrink-0">•</span>Streak 21 ngày giúp hình thành thói quen học tập</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

