import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";
import { epsVocabulary } from "@/mocks/epsVocabulary";
import { topikQuestions } from "@/mocks/topikQuestions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  id: string;
  type: "vocab_kr_to_vi" | "vocab_vi_to_kr" | "topik";
  question: string;
  options: string[];
  correctIdx: number;
  explanation?: string;
  category?: string;
}

interface QuizResult {
  date: string;
  score: number;
  total: number;
  timeSeconds: number;
  mode: string;
}

// ─── Question generators ──────────────────────────────────────────────────────
function generateVocabQuestions(count: number): QuizQuestion[] {
  const vocab = [...epsVocabulary].sort(() => Math.random() - 0.5).slice(0, count * 2);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < Math.min(count, vocab.length); i++) {
    const item = vocab[i];
    const isKrToVi = Math.random() > 0.5;

    if (isKrToVi) {
      // Korean → Vietnamese
      const wrongOptions = vocab
        .filter(v => v.id !== item.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(v => v.vietnamese);
      const options = [...wrongOptions, item.vietnamese].sort(() => Math.random() - 0.5);
      questions.push({
        id: `q_${i}`,
        type: "vocab_kr_to_vi",
        question: item.korean,
        options,
        correctIdx: options.indexOf(item.vietnamese),
        explanation: `[${item.reading}] — ${item.vietnamese}`,
        category: "Từ vựng EPS",
      });
    } else {
      // Vietnamese → Korean
      const wrongOptions = vocab
        .filter(v => v.id !== item.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(v => v.korean);
      const options = [...wrongOptions, item.korean].sort(() => Math.random() - 0.5);
      questions.push({
        id: `q_${i}`,
        type: "vocab_vi_to_kr",
        question: item.vietnamese,
        options,
        correctIdx: options.indexOf(item.korean),
        explanation: `${item.korean} [${item.reading}]`,
        category: "Từ vựng EPS",
      });
    }
  }
  return questions;
}

function generateTopikQuestions(count: number): QuizQuestion[] {
  const shuffled = [...topikQuestions].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((q, i) => ({
    id: `tq_${i}`,
    type: "topik" as const,
    question: q.questionKr || q.question || "",
    options: q.options || [],
    correctIdx: q.correctIndex ?? 0,
    explanation: q.explanation || "",
    category: "TOPIK",
  }));
}

// ─── Quiz modes ───────────────────────────────────────────────────────────────
const QUIZ_MODES = [
  { id: "vocab_eps", label: "Từ vựng EPS", icon: "ri-translate-2", color: "#fb923c", desc: "Hàn ↔ Việt từ vựng EPS-TOPIK", time: 120 },
  { id: "topik", label: "TOPIK I", icon: "ri-file-list-2-line", color: "#60a5fa", desc: "Câu hỏi thi thử TOPIK I", time: 120 },
  { id: "mixed", label: "Tổng hợp", icon: "ri-shuffle-line", color: "#e8c84a", desc: "Kết hợp từ vựng + TOPIK", time: 120 },
];

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  score, total, timeUsed, mode, answers, questions, onRetry, onHome,
}: {
  score: number; total: number; timeUsed: number; mode: string;
  answers: number[]; questions: QuizQuestion[];
  onRetry: () => void; onHome: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 90 ? { label: "Xuất sắc!", color: "#34d399", icon: "ri-trophy-fill" }
    : pct >= 70 ? { label: "Tốt!", color: "#e8c84a", icon: "ri-thumb-up-fill" }
    : pct >= 50 ? { label: "Khá!", color: "#60a5fa", icon: "ri-star-fill" }
    : { label: "Cần cố gắng hơn", color: "#f87171", icon: "ri-refresh-line" };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score card */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8 text-center mb-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
          <i className={`${grade.icon} text-4xl`} style={{ color: grade.color }}></i>
        </div>
        <h2 className="text-white font-bold text-2xl mb-1">{grade.label}</h2>
        <p className="text-white/40 text-sm mb-5">Bài kiểm tra nhanh 2 phút — {mode}</p>
        <div className="flex justify-center gap-6 mb-5">
          <div>
            <p className="font-bold text-4xl" style={{ color: grade.color }}>{pct}%</p>
            <p className="text-white/30 text-xs mt-1">Điểm số</p>
          </div>
          <div className="w-px bg-white/5"></div>
          <div>
            <p className="text-white font-bold text-4xl">{score}/{total}</p>
            <p className="text-white/30 text-xs mt-1">Câu đúng</p>
          </div>
          <div className="w-px bg-white/5"></div>
          <div>
            <p className="text-white font-bold text-4xl">{timeUsed}s</p>
            <p className="text-white/30 text-xs mt-1">Thời gian</p>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-5">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: grade.color }}></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onRetry} className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-colors" style={{ backgroundColor: "#e8c84a", color: "#0f1117" }}>
            <i className="ri-refresh-line mr-2"></i>Làm lại
          </button>
          <button onClick={onHome} className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-colors bg-white/5 text-white/60 hover:bg-white/8">
            <i className="ri-home-line mr-2"></i>Về trang chủ
          </button>
        </div>
      </div>

      {/* Review answers */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Xem lại đáp án</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === q.correctIdx;
            return (
              <div key={q.id} className={`rounded-xl p-4 border ${isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-start gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    <i className={`${isCorrect ? "ri-check-line text-emerald-400" : "ri-close-line text-red-400"} text-[10px]`}></i>
                  </div>
                  <p className="text-white/75 text-sm font-medium">{q.question}</p>
                </div>
                <div className="pl-7 space-y-1">
                  {q.options.map((opt, j) => (
                    <div key={j} className={`text-xs px-2 py-1 rounded-lg ${j === q.correctIdx ? "text-emerald-400 font-semibold" : j === userAns && !isCorrect ? "text-red-400 line-through" : "text-white/30"}`}>
                      {j === q.correctIdx && <i className="ri-check-line mr-1"></i>}
                      {j === userAns && !isCorrect && <i className="ri-close-line mr-1"></i>}
                      {opt}
                    </div>
                  ))}
                  {q.explanation && <p className="text-white/25 text-[10px] italic mt-1">{q.explanation}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuickQuizPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"select" | "quiz" | "result">("select");
  const [selectedMode, setSelectedMode] = useState("vocab_eps");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timeUsed, setTimeUsed] = useState(0);
  const [history, setHistory] = useLocalStorage<QuizResult[]>("kts_quick_quiz_history", []);

  const TOTAL_QUESTIONS = 10;

  const startQuiz = useCallback(() => {
    let qs: QuizQuestion[] = [];
    if (selectedMode === "vocab_eps") {
      qs = generateVocabQuestions(TOTAL_QUESTIONS);
    } else if (selectedMode === "topik") {
      qs = generateTopikQuestions(TOTAL_QUESTIONS);
    } else {
      qs = [...generateVocabQuestions(5), ...generateTopikQuestions(5)].sort(() => Math.random() - 0.5);
    }
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowFeedback(false);
    setTimeLeft(120);
    setTimeUsed(0);
    setPhase("quiz");
  }, [selectedMode]);

  // Timer
  useEffect(() => {
    if (phase !== "quiz") return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setPhase("result");
          return 0;
        }
        return prev - 1;
      });
      setTimeUsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const handleAnswer = useCallback((optIdx: number) => {
    if (showFeedback) return;
    setSelectedOption(optIdx);
    setShowFeedback(true);
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        const score = newAnswers.filter((a, i) => a === questions[i].correctIdx).length;
        setHistory(prev => [{
          date: new Date().toISOString(),
          score,
          total: questions.length,
          timeSeconds: timeUsed,
          mode: QUIZ_MODES.find(m => m.id === selectedMode)?.label || selectedMode,
        }, ...prev.slice(0, 19)]);
        setPhase("result");
      } else {
        setCurrentIdx(i => i + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      }
    }, 800);
  }, [showFeedback, answers, currentIdx, questions, timeUsed, selectedMode]);

  const score = useMemo(() => answers.filter((a, i) => a === questions[i]?.correctIdx).length, [answers, questions]);

  const currentQ = questions[currentIdx];
  const timerPct = (timeLeft / 120) * 100;
  const timerColor = timeLeft > 60 ? "#34d399" : timeLeft > 30 ? "#e8c84a" : "#f87171";

  if (phase === "result") {
    return (
      <DashboardLayout title="Kết quả Quiz" subtitle="Bài kiểm tra nhanh 2 phút">
        <ResultScreen
          score={score}
          total={questions.length}
          timeUsed={timeUsed}
          mode={QUIZ_MODES.find(m => m.id === selectedMode)?.label || ""}
          answers={answers}
          questions={questions}
          onRetry={startQuiz}
          onHome={() => setPhase("select")}
        />
      </DashboardLayout>
    );
  }

  if (phase === "quiz" && currentQ) {
    return (
      <DashboardLayout title="Quiz nhanh 2 phút" subtitle={`Câu ${currentIdx + 1}/${questions.length} · ${currentQ.category}`}>
        <div className="max-w-2xl mx-auto">
          {/* Timer bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <i className="ri-timer-line text-sm" style={{ color: timerColor }}></i>
                <span className="font-mono font-bold text-sm" style={{ color: timerColor }}>{timeLeft}s</span>
              </div>
              <span className="text-white/30 text-xs">{currentIdx + 1}/{questions.length} câu · {score} đúng</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, backgroundColor: timerColor }}></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8 mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/35">{currentQ.category}</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ backgroundColor: currentQ.type === "vocab_kr_to_vi" ? "rgba(251,146,60,0.12)" : "rgba(96,165,250,0.12)", color: currentQ.type === "vocab_kr_to_vi" ? "#fb923c" : "#60a5fa" }}>
                {currentQ.type === "vocab_kr_to_vi" ? "Hàn → Việt" : currentQ.type === "vocab_vi_to_kr" ? "Việt → Hàn" : "TOPIK"}
              </span>
            </div>
            <p className="text-white font-bold text-3xl leading-snug">{currentQ.question}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              let style = "bg-[#0f1117] border-white/8 text-white/70 hover:border-white/20 hover:bg-white/3";
              if (showFeedback) {
                if (i === currentQ.correctIdx) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
                else if (i === selectedOption) style = "bg-red-500/15 border-red-500/40 text-red-400";
                else style = "bg-[#0f1117] border-white/5 text-white/30";
              } else if (selectedOption === i) {
                style = "bg-[#e8c84a]/10 border-[#e8c84a]/40 text-[#e8c84a]";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                  className={`p-4 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer whitespace-normal disabled:cursor-default ${style}`}
                >
                  <span className="text-[10px] font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {showFeedback && i === currentQ.correctIdx && <i className="ri-check-line ml-2 text-emerald-400"></i>}
                  {showFeedback && i === selectedOption && i !== currentQ.correctIdx && <i className="ri-close-line ml-2 text-red-400"></i>}
                </button>
              );
            })}
          </div>

          {showFeedback && currentQ.explanation && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-white/40 text-xs"><i className="ri-information-line mr-1"></i>{currentQ.explanation}</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Select mode screen
  return (
    <DashboardLayout title="Bài kiểm tra nhanh" subtitle="2 phút · 10 câu · Kết quả ngay lập tức">
      <div className="max-w-2xl mx-auto">
        {/* Mode selection */}
        <div className="mb-6">
          <h3 className="text-white/50 text-xs tracking-wider mb-3">Chọn chủ đề</h3>
          <div className="grid grid-cols-3 gap-3">
            {QUIZ_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className="p-4 rounded-2xl border text-left transition-all cursor-pointer"
                style={{
                  backgroundColor: selectedMode === mode.id ? `${mode.color}12` : "rgba(15,17,23,1)",
                  borderColor: selectedMode === mode.id ? `${mode.color}40` : "rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${mode.color}15` }}>
                  <i className={`${mode.icon} text-lg`} style={{ color: mode.color }}></i>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{mode.label}</p>
                <p className="text-white/35 text-xs">{mode.desc}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <i className="ri-timer-line text-[10px]" style={{ color: mode.color }}></i>
                  <span className="text-[10px]" style={{ color: mode.color }}>{mode.time}s · 10 câu</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-2xl font-bold text-base cursor-pointer whitespace-nowrap transition-all mb-6"
          style={{ backgroundColor: "#e8c84a", color: "#0f1117" }}
        >
          <span className="flex items-center justify-center gap-2">
            <i className="ri-play-fill text-lg"></i>
            Bắt đầu Quiz ngay!
          </span>
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Lịch sử gần đây</h3>
            <div className="space-y-2.5">
              {history.slice(0, 5).map((h, i) => {
                const pct = Math.round((h.score / h.total) * 100);
                const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/65 text-xs font-medium">{h.mode}</p>
                      <p className="text-white/25 text-[10px]">{h.score}/{h.total} đúng · {h.timeSeconds}s · {new Date(h.date).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
