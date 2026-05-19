import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { HANJA_DATA } from "@/mocks/hanjaData";

interface DailyWord {
  id: string;
  korean: string;
  hanja?: string;
  vietnamese: string;
  pronunciation?: string;
  example?: string;
  exampleMeaning?: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
}

interface QuizQuestion {
  word: DailyWord;
  choices: string[];
  correctIdx: number;
}

function pickDailyWords(count = 8): DailyWord[] {
  const today = new Date().toISOString().split("T")[0];
  const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);
  const all = HANJA_DATA.slice(0, 200);
  const shuffled = [...all].sort((a, b) => {
    const ha = (seed * (all.indexOf(a) + 1)) % 997;
    const hb = (seed * (all.indexOf(b) + 1)) % 997;
    return ha - hb;
  });
  return shuffled.slice(0, count).map((w, i) => ({
    id: `word-${i}`,
    korean: w.korean || "",
    hanja: w.hanja || "",
    vietnamese: w.vietnamese || "",
    pronunciation: "",
    example: "",
    exampleMeaning: "",
    difficulty: "medium" as DailyWord["difficulty"],
    category: "",
  }));
}

function buildQuiz(words: DailyWord[]): QuizQuestion[] {
  const allVietnamese = HANJA_DATA.slice(0, 100).map((w) => w.vietnamese || "").filter(Boolean);
  return words.map((word) => {
    const wrongPool = allVietnamese.filter((v) => v !== word.vietnamese);
    const shuffledWrong = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [...shuffledWrong, word.vietnamese].sort(() => Math.random() - 0.5);
    const correctIdx = choices.indexOf(word.vietnamese);
    return { word, choices, correctIdx };
  });
}

const DIFF_COLORS = {
  easy: { bg: "rgba(74,222,128,0.12)", text: "#4ade80", label: "Dễ" },
  medium: { bg: "rgba(232,200,74,0.12)", text: "app-accent-primary", label: "TB" },
  hard: { bg: "rgba(248,113,113,0.12)", text: "#f87171", label: "Khó" },
};

function FlipCard({
  word,
  isLearned,
  onLearn,
  index,
}: {
  word: DailyWord;
  isLearned: boolean;
  onLearn: () => void;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const diff = DIFF_COLORS[word.difficulty];

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const handleFlip = () => setFlipped((f) => !f);
  const handleLearn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLearn();
  };

  return (
    <div
      className={`transition-all duration-500 ${animIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "200px",
        }}
        onClick={handleFlip}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-5 select-none"
          style={{
            backfaceVisibility: "hidden",
            backgroundColor: isLearned ? "rgba(74,222,128,0.06)" : "#0f1117",
            borderColor: isLearned ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.07)",
          }}
        >
          {isLearned && (
            <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/20">
              <i className="ri-check-line text-app-accent-success text-xs" />
            </div>
          )}
          <span
            className="text-[9px] px-2 py-0.5 rounded-full mb-3 font-bold"
            style={{ backgroundColor: diff.bg, color: diff.text }}
          >
            {diff.label}
          </span>
          <p className="text-3xl font-bold text-white mb-1">{word.korean}</p>
          {word.hanja && <p className="text-app-text-muted text-sm">{word.hanja}</p>}
          <p className="text-app-text-muted text-[10px] mt-3 flex items-center gap-1">
            <i className="ri-refresh-line" />
            Nhấn để xem nghĩa
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-5 select-none"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: isLearned ? "rgba(74,222,128,0.08)" : "rgba(232,200,74,0.05)",
            borderColor: isLearned ? "rgba(74,222,128,0.3)" : "rgba(232,200,74,0.2)",
          }}
        >
          <p className="text-xl font-bold text-white mb-1 text-center">{word.vietnamese}</p>
          {word.pronunciation && (
            <p className="text-app-text-secondary text-xs mb-2">[{word.pronunciation}]</p>
          )}
          {word.example && (
            <div className="mt-2 text-center">
              <p className="text-white/50 text-xs italic">{word.example}</p>
              {word.exampleMeaning && (
                <p className="text-app-text-muted text-[10px] mt-0.5">{word.exampleMeaning}</p>
              )}
            </div>
          )}
          <button
            onClick={handleLearn}
            className={`mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isLearned
                ? "bg-emerald-500/20 text-app-accent-success border border-emerald-500/30"
                : "bg-app-accent-primary text-app-bg"
            }`}
          >
            <i className="ri-check-line text-xs" />
            {isLearned ? "Đã học ✓" : "Đánh dấu đã học"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PronounceButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const speak = useCallback(() => {
    if (!window.speechSynthesis || speaking) return;
    setSpeaking(true);
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = 0.85;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [text, speaking]);

  return (
    <button
      onClick={speak}
      disabled={speaking}
      className={`w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-all ${speaking ? "bg-app-accent-primary/20" : "bg-app-card/50 hover:bg-app-card/70"}`}
      title="Nghe phát âm"
    >
      <i
        className={`${speaking ? "ri-volume-up-fill text-app-accent-primary" : "ri-volume-up-line text-app-text-secondary"} text-sm`}
      />
    </button>
  );
}

function QuizMode({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = questions[qIdx];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIdx) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIdx < questions.length - 1) {
      setQIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      onFinish(score);
    }
  };

  const progress = ((qIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-app-accent-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">
          {qIdx + 1}/{questions.length}
        </span>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-6 mb-4 text-center">
        <p className="text-app-text-secondary text-xs mb-3">Nghĩa của từ này là gì?</p>
        <p className="text-4xl font-bold text-white mb-2">{q.word.korean}</p>
        {q.word.hanja && <p className="text-app-accent-primary/50 text-lg">{q.word.hanja}</p>}
        <div className="flex items-center justify-center mt-3">
          <PronounceButton text={q.word.korean} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {q.choices.map((choice, idx) => {
          let style = "bg-app-card/50 border-app-border text-white/70 hover:bg-white/8";
          if (answered) {
            if (idx === q.correctIdx) {
              style = "bg-emerald-500/20 border-emerald-500/40 text-app-accent-success";
            } else if (idx === selected && idx !== q.correctIdx) {
              style = "bg-rose-500/20 border-rose-500/40 text-rose-400";
            } else {
              style = "bg-app-surface/50 border-app-border text-app-text-muted";
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all text-center ${style}`}
            >
              {choice}
              {answered && idx === q.correctIdx && <i className="ri-check-line ml-1.5" />}
              {answered && idx === selected && idx !== q.correctIdx && (
                <i className="ri-close-line ml-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold text-sm cursor-pointer transition-all hover:bg-[#d4b43a] whitespace-nowrap"
        >
          {qIdx < questions.length - 1 ? "Câu tiếp theo →" : "Xem kết quả"}
        </button>
      )}
    </div>
  );
}

function QuizResult({
  score,
  total,
  onRetry,
  onDone,
}: {
  score: number;
  total: number;
  onRetry: () => void;
  onDone: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 80 ? "#4ade80" : pct >= 60 ? "app-accent-primary" : "#f87171";
  const msg =
    pct >= 80
      ? "Xuất sắc! Bạn đã ghi nhớ rất tốt 🎉"
      : pct >= 60
      ? "Khá tốt! Ôn thêm một chút nữa nhé"
      : "Cần ôn lại — đừng nản, học lại là được!";

  return (
    <div className="max-w-sm mx-auto text-center py-8">
      <div
        className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <span className="text-3xl font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <p className="text-white font-bold text-lg mb-1">{score}/{total} câu đúng</p>
      <p className="text-app-text-secondary text-sm mb-6">{msg}</p>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl bg-white/8 text-white/60 text-sm font-medium cursor-pointer hover:bg-white/12 transition-all whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-1.5" />
          Làm lại
        </button>
        <button
          onClick={onDone}
          className="flex-1 py-3 rounded-xl bg-app-accent-primary text-app-bg text-sm font-bold cursor-pointer hover:bg-[#d4b43a] transition-all whitespace-nowrap"
        >
          Hoàn thành ✓
        </button>
      </div>
    </div>
  );
}

export default function DailyWordsPage() {
  const navigate = useNavigate();
  const [learnedIds, setLearnedIds] = useLocalStorage<Record<string, string[]>>(
    "kts_daily_learned",
    {}
  );
  const today = new Date().toISOString().split("T")[0];
  const todayLearned = learnedIds[today] || [];

  const [words] = useState<DailyWord[]>(() => pickDailyWords(8));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState<"grid" | "focus">("grid");
  const [phase, setPhase] = useState<"learn" | "quiz" | "result">("learn");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const learnedCount = words.filter((w) => todayLearned.includes(w.id)).length;
  const allDone = learnedCount === words.length;

  useEffect(() => {
    if (allDone && phase === "learn") {
      const timer = setTimeout(() => {
        setQuizQuestions(buildQuiz(words));
        setPhase("quiz");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allDone, phase, words]);

  const handleLearn = useCallback(
    (id: string) => {
      setLearnedIds((prev) => {
        const todayList = prev[today] || [];
        if (todayList.includes(id)) return prev;
        return { ...prev, [today]: [...todayList, id] };
      });
    },
    [today, setLearnedIds]
  );

  const handleUnlearn = useCallback(
    (id: string) => {
      setLearnedIds((prev) => ({
        ...prev,
        [today]: (prev[today] || []).filter((x) => x !== id),
      }));
    },
    [today, setLearnedIds]
  );

  const handleQuizFinish = (score: number) => {
    setQuizScore(score);
    setPhase("result");
  };

  const handleRetryQuiz = () => {
    setQuizQuestions(buildQuiz(words));
    setPhase("quiz");
  };

  const currentWord = words[currentIdx];

  return (
    <DashboardLayout
      title="Học từ mới hôm nay"
      subtitle={`${today} · ${learnedCount}/${words.length} từ đã học`}
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Phase indicator */}
        <div className="flex items-center gap-2 mb-5">
          {(["learn", "quiz", "result"] as const).map((p, i) => {
            const phaseOrder = ["learn", "quiz", "result"];
            const currentOrder = phaseOrder.indexOf(phase);
            const thisOrder = phaseOrder.indexOf(p);
            const isDone = thisOrder < currentOrder;
            const isActive = p === phase;
            const icons: Record<string, string> = {
              learn: "ri-book-open-line",
              quiz: "ri-question-line",
              result: "ri-trophy-line",
            };
            const labels: Record<string, string> = {
              learn: "Học từ",
              quiz: "Kiểm tra",
              result: "Kết quả",
            };
            return (
              <div key={p} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-app-accent-primary/15 text-app-accent-primary"
                      : isDone
                      ? "bg-emerald-500/10 text-app-accent-success"
                      : "bg-app-card/50 text-app-text-muted"
                  }`}
                >
                  <i className={`${isDone ? "ri-check-line" : icons[p]} text-xs`} />
                  {labels[p]}
                </div>
                {i < 2 && (
                  <div
                    className={`w-6 h-px ${isDone ? "bg-emerald-500/30" : "bg-white/8"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── LEARN PHASE ── */}
        {phase === "learn" && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-2 rounded-full overflow-hidden bg-app-card/50">
                <div
                  ref={progressRef}
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(learnedCount / words.length) * 100}%`,
                    backgroundColor: allDone ? "#4ade80" : "app-accent-primary",
                  }}
                />
              </div>
              <span
                className="text-sm font-bold whitespace-nowrap"
                style={{ color: allDone ? "#4ade80" : "app-accent-primary" }}
              >
                {learnedCount}/{words.length}
              </span>
              <div className="flex items-center gap-1 bg-app-card/50 p-1 rounded-xl">
                <button
                  onClick={() => setMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    mode === "grid" ? "bg-app-card/70 text-white" : "text-app-text-secondary"
                  }`}
                >
                  <i className="ri-grid-line mr-1" />
                  Lưới
                </button>
                <button
                  onClick={() => setMode("focus")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    mode === "focus" ? "bg-app-card/70 text-white" : "text-app-text-secondary"
                  }`}
                >
                  <i className="ri-focus-3-line mr-1" />
                  Tập trung
                </button>
              </div>
            </div>

            {allDone && (
              <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-emerald-500/20 flex-shrink-0">
                  <i className="ri-trophy-line text-app-accent-success text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-app-accent-success font-bold text-sm">
                    Học xong! Đang chuyển sang kiểm tra...
                  </p>
                  <p className="text-app-text-secondary text-xs mt-0.5">
                    Ôn tập thông minh sẽ bắt đầu ngay
                  </p>
                </div>
                <button
                  onClick={() => {
                    setQuizQuestions(buildQuiz(words));
                    setPhase("quiz");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-app-accent-success text-xs font-bold cursor-pointer whitespace-nowrap border border-emerald-500/30"
                >
                  Kiểm tra ngay
                </button>
              </div>
            )}

            {mode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {words.map((word, i) => (
                  <div key={word.id}>
                    <FlipCard
                      word={word}
                      isLearned={todayLearned.includes(word.id)}
                      onLearn={() => handleLearn(word.id)}
                      index={i}
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <PronounceButton text={word.korean} />
                        <span className="text-app-text-muted text-xs">{word.korean}</span>
                      </div>
                      {todayLearned.includes(word.id) && (
                        <button
                          onClick={() => handleUnlearn(word.id)}
                          className="text-[10px] text-app-text-muted hover:text-app-text-secondary cursor-pointer"
                        >
                          Bỏ đánh dấu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mode === "focus" && currentWord && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm mb-6" style={{ perspective: "1200px" }}>
                  <FlipCard
                    word={currentWord}
                    isLearned={todayLearned.includes(currentWord.id)}
                    onLearn={() => {
                      handleLearn(currentWord.id);
                      if (currentIdx < words.length - 1) {
                        setTimeout(() => setCurrentIdx((i) => i + 1), 600);
                      }
                    }}
                    index={0}
                  />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <PronounceButton text={currentWord.korean} />
                  <span className="text-app-text-secondary text-sm">
                    {currentWord.korean} — {currentWord.vietnamese}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-card/50 text-app-text-secondary disabled:opacity-30 cursor-pointer hover:bg-app-card/70 transition-all"
                  >
                    <i className="ri-arrow-left-line" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {words.map((w, i) => (
                      <button
                        key={w.id}
                        onClick={() => setCurrentIdx(i)}
                        className={`rounded-full transition-all cursor-pointer ${
                          i === currentIdx
                            ? "w-5 h-2 bg-app-accent-primary"
                            : todayLearned.includes(w.id)
                            ? "w-2 h-2 bg-emerald-400/60"
                            : "w-2 h-2 bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentIdx((i) => Math.min(words.length - 1, i + 1))}
                    disabled={currentIdx === words.length - 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-card/50 text-app-text-secondary disabled:opacity-30 cursor-pointer hover:bg-app-card/70 transition-all"
                  >
                    <i className="ri-arrow-right-line" />
                  </button>
                </div>
                <div className="mt-8 w-full grid grid-cols-4 gap-2">
                  {words.map((w, i) => (
                    <button
                      key={w.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium cursor-pointer transition-all text-center ${
                        i === currentIdx
                          ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/30"
                          : todayLearned.includes(w.id)
                          ? "bg-emerald-500/10 text-app-accent-success/70 border border-emerald-500/20"
                          : "bg-app-surface/50 text-app-text-secondary border border-app-border"
                      }`}
                    >
                      {w.korean}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/hanja-flashcard")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-app-card/50 text-white/60 text-sm font-medium cursor-pointer hover:bg-white/8 transition-all border border-app-border whitespace-nowrap"
              >
                <i className="ri-stack-line" />
                Ôn flashcard Hán Hàn
              </button>
              {learnedCount > 0 && (
                <button
                  onClick={() => {
                    setQuizQuestions(buildQuiz(words));
                    setPhase("quiz");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary/10 text-app-accent-primary text-sm font-bold cursor-pointer hover:bg-app-accent-primary/15 transition-all border border-app-accent-primary/20 whitespace-nowrap"
                >
                  <i className="ri-question-line" />
                  Kiểm tra ngay ({learnedCount} từ)
                </button>
              )}
            </div>
          </>
        )}

        {/* ── QUIZ PHASE ── */}
        {phase === "quiz" && quizQuestions.length > 0 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-white font-bold text-lg">Ôn tập thông minh</h2>
              <p className="text-app-text-secondary text-sm mt-1">
                Kiểm tra xem bạn đã nhớ được bao nhiêu từ hôm nay
              </p>
            </div>
            <QuizMode questions={quizQuestions} onFinish={handleQuizFinish} />
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === "result" && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-white font-bold text-lg">Kết quả kiểm tra</h2>
            </div>
            <QuizResult
              score={quizScore}
              total={quizQuestions.length}
              onRetry={handleRetryQuiz}
              onDone={() => {
                setPhase("learn");
                navigate("/hanja-dashboard");
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
