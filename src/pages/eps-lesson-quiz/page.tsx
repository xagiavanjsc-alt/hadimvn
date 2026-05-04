import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsLessons, EPS_LESSON_TOPICS, type EpsLesson } from "@/mocks/epsLessons";

// --- Types ----------------------------------------------------------------
interface QuizQuestion {
  id: string;
  type: "meaning_kr_to_vi" | "meaning_vi_to_kr" | "fill_blank" | "pronunciation";
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example: string;
  exampleVi: string;
  options: string[];
  correctIndex: number;
}

interface QuizResult {
  lessonId: number;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  timeSeconds: number;
}

// --- Generate quiz questions from lesson vocabulary -----------------------
function generateQuestions(lesson: EpsLesson, count = 10): QuizQuestion[] {
  const vocab = lesson.vocabulary;
  const shuffled = [...vocab].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, vocab.length));

  return selected.map((v, i) => {
    const type = i % 3 === 0 ? "meaning_vi_to_kr" : i % 3 === 1 ? "fill_blank" : "meaning_kr_to_vi";

    // Generate wrong options from other vocab
    const others = vocab.filter(x => x.korean !== v.korean);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);

    if (type === "meaning_kr_to_vi") {
      const wrongOptions = shuffledOthers.slice(0, 3).map(x => x.vietnamese);
      const allOptions = [v.vietnamese, ...wrongOptions].sort(() => Math.random() - 0.5);
      return {
        id: `q${i}`,
        type,
        korean: v.korean,
        vietnamese: v.vietnamese,
        pronunciation: v.pronunciation,
        example: v.example,
        exampleVi: v.exampleVi,
        options: allOptions,
        correctIndex: allOptions.indexOf(v.vietnamese),
      };
    } else if (type === "meaning_vi_to_kr") {
      const wrongOptions = shuffledOthers.slice(0, 3).map(x => x.korean);
      const allOptions = [v.korean, ...wrongOptions].sort(() => Math.random() - 0.5);
      return {
        id: `q${i}`,
        type,
        korean: v.korean,
        vietnamese: v.vietnamese,
        pronunciation: v.pronunciation,
        example: v.example,
        exampleVi: v.exampleVi,
        options: allOptions,
        correctIndex: allOptions.indexOf(v.korean),
      };
    } else {
      // fill_blank: show example with blank
      const wrongOptions = shuffledOthers.slice(0, 3).map(x => x.korean);
      const allOptions = [v.korean, ...wrongOptions].sort(() => Math.random() - 0.5);
      return {
        id: `q${i}`,
        type,
        korean: v.korean,
        vietnamese: v.vietnamese,
        pronunciation: v.pronunciation,
        example: v.example,
        exampleVi: v.exampleVi,
        options: allOptions,
        correctIndex: allOptions.indexOf(v.korean),
      };
    }
  });
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// --- Lesson Selector ------------------------------------------------------
function LessonSelector({
  onSelect,
  completedLessons,
  quizHistory,
}: {
  onSelect: (lesson: EpsLesson) => void;
  completedLessons: Record<number, { score: number; completedAt: string }>;
  quizHistory: Record<number, QuizResult[]>;
}) {
  const [filterTopic, setFilterTopic] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return epsLessons.filter(l => {
      if (filterTopic !== "all" && l.topic !== filterTopic) return false;
      if (search && !l.titleVi.toLowerCase().includes(search.toLowerCase()) && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filterTopic, search]);

  return (
    <div>
      {/* Header */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-app-accent-primary/15">
            <i className="ri-file-list-3-line text-app-accent-primary text-xl"></i>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Thi th? theo bài</h2>
            <p className="text-app-text-secondary text-sm">Ch?n bài h?c d? thi th? — câu h?i t? d?ng t?o t? t? v?ng</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { label: "Bài có th? thi", value: epsLessons.length, color: "app-accent-primary" },
            { label: "Ðã thi th?", value: Object.keys(quizHistory).length, color: "#34d399" },
            { label: "Bài dã h?c", value: Object.keys(completedLessons).length, color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-app-surface/50 border border-app-border">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm bài h?c..."
            className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
          />
        </div>
        <select
          value={filterTopic}
          onChange={e => setFilterTopic(e.target.value)}
          className="bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
        >
          <option value="all">T?t c? ch? d?</option>
          {EPS_LESSON_TOPICS.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Lesson list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map(lesson => {
          const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === lesson.topic);
          const isStudied = !!completedLessons[lesson.id];
          const history = quizHistory[lesson.id] || [];
          const bestScore = history.length > 0 ? Math.max(...history.map(h => h.percentage)) : null;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson)}
              className="text-left p-4 rounded-xl border border-app-border bg-white/2 hover:border-white/18 hover:bg-white/4 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 text-sm font-bold bg-app-card/50 text-app-text-muted group-hover:bg-white/8 transition-colors">
                  {lesson.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-semibold truncate group-hover:text-white transition-colors">{lesson.titleVi}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${topicInfo?.color}15`, color: topicInfo?.color }}>
                      {topicInfo?.label}
                    </span>
                    <span className="text-[9px] text-app-text-muted flex items-center gap-0.5">
                      <i className="ri-book-2-line"></i>{lesson.vocabulary.length} t?
                    </span>
                    {isStudied && (
                      <span className="text-[9px] text-app-accent-success font-bold flex items-center gap-0.5">
                        <i className="ri-checkbox-circle-fill"></i>Ðã h?c
                      </span>
                    )}
                    {bestScore !== null && (
                      <span className={`text-[9px] font-bold ${bestScore >= 80 ? "text-app-accent-success" : bestScore >= 60 ? "text-app-accent-primary" : "text-red-400"}`}>
                        Cao nh?t: {bestScore}%
                      </span>
                    )}
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-app-text-muted group-hover:text-white/50 transition-colors flex-shrink-0 mt-1"></i>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Quiz Screen ----------------------------------------------------------
function QuizScreen({
  lesson,
  onFinish,
  onBack,
}: {
  lesson: EpsLesson;
  onFinish: (result: QuizResult) => void;
  onBack: () => void;
}) {
  const [questions] = useState(() => generateQuestions(lesson, Math.min(10, lesson.vocabulary.length)));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timerActive, setTimerActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  // Reset question timer when moving to next question
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setShowAnswer(false);
    setTimerActive(true);
    setTimeLeft(30);
  }, [currentIdx]);

  const current = questions[currentIdx];
  const progress = Math.round(((currentIdx) / questions.length) * 100);
  const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === lesson.topic);

  // Timer
  useState(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          if (answers[currentIdx] === undefined) {
            setAnswers(prev => ({ ...prev, [currentIdx]: -1 }));
          }
          setShowAnswer(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleAnswer = (optionIdx: number) => {
    if (showAnswer) return;
    
    // Validate minimum time per question (2 seconds)
    const timeSpent = Date.now() - questionStartTime;
    if (timeSpent < 2000) {
      alert("Vui lòng d?c k? câu h?i tru?c khi tr? l?i (t?i thi?u 2 giây).");
      return;
    }
    
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    setShowAnswer(true);
    setTimerActive(false);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      // Calculate result
      let correct = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctIndex) correct++;
      });
      const timeSeconds = Math.round((Date.now() - startTime) / 1000);
      onFinish({
        lessonId: lesson.id,
        score: correct,
        total: questions.length,
        percentage: Math.round((correct / questions.length) * 100),
        completedAt: new Date().toISOString(),
        timeSeconds,
      });
    } else {
      setCurrentIdx(i => i + 1);
      setShowAnswer(false);
      setTimeLeft(30);
      setTimerActive(true);
    }
  };

  const isCorrect = answers[currentIdx] === current.correctIndex;
  const timerColor = timeLeft > 15 ? "text-app-accent-success" : timeLeft > 7 ? "text-app-accent-primary" : "text-red-400";
  const timerBg = timeLeft > 15 ? "bg-emerald-400" : timeLeft > 7 ? "bg-app-accent-primary" : "bg-red-400";

  const getQuestionText = () => {
    if (current.type === "meaning_kr_to_vi") return `"${current.korean}" có nghia là gì?`;
    if (current.type === "meaning_vi_to_kr") return `"${current.vietnamese}" trong ti?ng Hàn là gì?`;
    return `Ði?n t? còn thi?u: ${current.example.replace(current.korean, "___")}`;
  };

  const getQuestionSubtext = () => {
    if (current.type === "meaning_kr_to_vi") return `[${current.pronunciation}]`;
    if (current.type === "meaning_vi_to_kr") return current.exampleVi;
    return current.exampleVi.replace(current.vietnamese, "___");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 text-sm transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-arrow-left-line"></i>Thoát
        </button>
        <div className="flex items-center gap-3">
          <span className="text-app-text-secondary text-sm">{currentIdx + 1}/{questions.length}</span>
          <span className={`font-bold text-lg ${timerColor}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden mb-5">
        <div className="h-full rounded-full bg-app-accent-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-app-card/50 rounded-full overflow-hidden mb-6">
        <div className={`h-full rounded-full transition-all duration-1000 ${timerBg}`} style={{ width: `${(timeLeft / 30) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${topicInfo?.color}15`, color: topicInfo?.color }}>
            Bài {lesson.id}
          </span>
          <span className="text-[10px] text-app-text-muted">
            {current.type === "meaning_kr_to_vi" ? "Hàn ? Vi?t" : current.type === "meaning_vi_to_kr" ? "Vi?t ? Hàn" : "Ði?n vào ch? tr?ng"}
          </span>
        </div>
        <p className="text-white font-bold text-xl mb-2">{getQuestionText()}</p>
        <p className="text-app-text-secondary text-sm italic">{getQuestionSubtext()}</p>
        {current.type === "meaning_kr_to_vi" && (
          <button
            onClick={() => speakKorean(current.korean)}
            className="mt-3 flex items-center gap-2 text-app-accent-primary/70 hover:text-app-accent-primary text-xs transition-colors cursor-pointer"
          >
            <i className="ri-volume-up-line"></i>Nghe phát âm
          </button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {current.options.map((opt, i) => {
          let cls = "border-app-border bg-white/2 hover:border-white/18 hover:bg-white/4 cursor-pointer";
          if (showAnswer) {
            if (i === current.correctIndex) cls = "border-emerald-500/50 bg-emerald-500/10 cursor-default";
            else if (answers[currentIdx] === i) cls = "border-red-500/50 bg-red-500/10 cursor-default";
            else cls = "border-app-border opacity-40 cursor-default";
          } else if (answers[currentIdx] === i) {
            cls = "border-app-accent-primary/40 bg-app-accent-primary/8 cursor-pointer";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={showAnswer}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all text-left ${cls}`}
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-muted text-xs font-bold flex-shrink-0">
                {["A","B","C","D"][i]}
              </span>
              <span className="text-white/80 text-sm flex-1">{opt}</span>
              {showAnswer && i === current.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success text-lg flex-shrink-0"></i>}
              {showAnswer && answers[currentIdx] === i && i !== current.correctIndex && <i className="ri-close-circle-fill text-red-400 text-lg flex-shrink-0"></i>}
            </button>
          );
        })}
      </div>

      {/* Answer feedback */}
      {showAnswer && (
        <div className={`p-4 rounded-xl border mb-4 ${isCorrect ? "border-emerald-500/25 bg-emerald-500/8" : "border-red-500/25 bg-red-500/8"}`}>
          <div className="flex items-start gap-3">
            <i className={`${isCorrect ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"} text-lg flex-shrink-0 mt-0.5`}></i>
            <div>
              <p className={`font-semibold text-sm ${isCorrect ? "text-app-accent-success" : "text-red-400"}`}>
                {isCorrect ? "Chính xác!" : answers[currentIdx] === -1 ? "H?t gi?!" : "Chua dúng!"}
              </p>
              {!isCorrect && (
                <p className="text-white/50 text-xs mt-1">
                  Ðáp án dúng: <span className="text-white font-semibold">{current.options[current.correctIndex]}</span>
                </p>
              )}
              <p className="text-app-text-secondary text-xs mt-1 italic">{current.example} — {current.exampleVi}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {showAnswer && (
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          {currentIdx + 1 >= questions.length ? "Xem k?t qu?" : "Câu ti?p theo"}
          <i className="ri-arrow-right-line ml-2"></i>
        </button>
      )}
    </div>
  );
}

// --- Result Screen --------------------------------------------------------
function ResultScreen({
  result,
  lesson,
  onRetry,
  onBack,
  onSelectAnother,
}: {
  result: QuizResult;
  lesson: EpsLesson;
  onRetry: () => void;
  onBack: () => void;
  onSelectAnother: () => void;
}) {
  const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === lesson.topic);
  const pct = result.percentage;
  const grade = pct >= 90 ? { label: "Xu?t s?c", color: "#34d399", icon: "ri-trophy-fill" }
    : pct >= 75 ? { label: "T?t", color: "app-accent-primary", icon: "ri-star-fill" }
    : pct >= 60 ? { label: "Khá", color: "#fb923c", icon: "ri-thumb-up-fill" }
    : { label: "C?n c? g?ng", color: "#f87171", icon: "ri-refresh-line" };

  const mins = Math.floor(result.timeSeconds / 60);
  const secs = result.timeSeconds % 60;

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Grade badge */}
      <div className="w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
        <i className={`${grade.icon} text-3xl`} style={{ color: grade.color }}></i>
      </div>
      <p className="text-white font-bold text-2xl mb-1">{grade.label}!</p>
      <p className="text-app-text-secondary text-sm mb-6">Bài {lesson.id}: {lesson.titleVi}</p>

      {/* Score circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={grade.color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-bold text-3xl" style={{ color: grade.color }}>{pct}%</p>
          <p className="text-app-text-secondary text-xs">{result.score}/{result.total}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Câu dúng", value: result.score, color: "#34d399" },
          { label: "Câu sai", value: result.total - result.score, color: "#f87171" },
          { label: "Th?i gian", value: `${mins}:${secs.toString().padStart(2, "0")}`, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-app-surface/50 border border-app-border">
            <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* XP earned */}
      <div className="p-3 rounded-xl bg-app-accent-primary/8 border border-app-accent-primary/20 mb-6">
        <p className="text-app-accent-primary font-bold text-sm">
          <i className="ri-star-fill mr-1"></i>
          +{result.score * 5 + (pct >= 80 ? 20 : 0)} XP dã nh?n
          {pct >= 80 && <span className="text-[10px] ml-1 opacity-70">(+20 bonus di?m cao)</span>}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-2"></i>Thi l?i bài này
        </button>
        <button
          onClick={onSelectAnother}
          className="w-full py-3 rounded-xl border border-app-border bg-app-surface/50 hover:bg-white/6 text-white/70 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-list-check mr-2"></i>Ch?n bài khác
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl border border-app-border bg-white/2 hover:bg-white/4 text-app-text-secondary text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-book-open-line mr-2"></i>V? trang bài h?c
        </button>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsLessonQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addXP } = useXPSystem();

  const [completedLessons] = useLocalStorage<Record<number, { score: number; completedAt: string }>>("kts_eps_lessons_progress", {});
  const [quizHistory, setQuizHistory] = useLocalStorage<Record<number, QuizResult[]>>("kts_eps_lesson_quiz_history", {});

  const initialLessonId = searchParams.get("lesson") ? parseInt(searchParams.get("lesson")!) : null;
  const initialLesson = initialLessonId ? epsLessons.find(l => l.id === initialLessonId) || null : null;

  const [selectedLesson, setSelectedLesson] = useState<EpsLesson | null>(initialLesson);
  const [quizKey, setQuizKey] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [phase, setPhase] = useState<"select" | "quiz" | "result">(initialLesson ? "quiz" : "select");

  const handleSelectLesson = (lesson: EpsLesson) => {
    setSelectedLesson(lesson);
    setResult(null);
    setQuizKey(k => k + 1);
    setPhase("quiz");
  };

  const handleFinish = useCallback((r: QuizResult) => {
    setResult(r);
    setPhase("result");
    // Save to history
    setQuizHistory(prev => ({
      ...prev,
      [r.lessonId]: [...(prev[r.lessonId] || []).slice(-4), r],
    }));
    // Award XP
    const xp = r.score * 5 + (r.percentage >= 80 ? 20 : 0);
    addXP(xp, `Thi th? bài EPS ${r.lessonId} — ${r.percentage}%`);
  }, [addXP, setQuizHistory]);

  const handleRetry = () => {
    setResult(null);
    setQuizKey(k => k + 1);
    setPhase("quiz");
  };

  // Recent quiz history
  const recentHistory = useMemo(() => {
    const all: (QuizResult & { lesson: EpsLesson })[] = [];
    Object.entries(quizHistory).forEach(([lessonId, results]) => {
      const lesson = epsLessons.find(l => l.id === parseInt(lessonId));
      if (lesson) {
        results.forEach(r => all.push({ ...r, lesson }));
      }
    });
    return all.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 5);
  }, [quizHistory]);

  return (
    <DashboardLayout
      title="Thi th? theo bài EPS"
      subtitle="Ki?m tra t? v?ng t?ng bài — câu h?i t? d?ng t?o t? t? v?ng dã h?c"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {phase === "select" && (
            <LessonSelector
              onSelect={handleSelectLesson}
              completedLessons={completedLessons}
              quizHistory={quizHistory}
            />
          )}
          {phase === "quiz" && selectedLesson && (
            <QuizScreen
              key={quizKey}
              lesson={selectedLesson}
              onFinish={handleFinish}
              onBack={() => setPhase("select")}
            />
          )}
          {phase === "result" && result && selectedLesson && (
            <ResultScreen
              result={result}
              lesson={selectedLesson}
              onRetry={handleRetry}
              onBack={() => navigate("/eps-lessons")}
              onSelectAnother={() => setPhase("select")}
            />
          )}
        </div>

        {/* Sidebar: recent history */}
        {phase === "select" && (
          <div className="w-full lg:w-72 space-y-4">
            {/* How it works */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-4">
              <p className="text-white font-semibold text-sm mb-3">Cách ho?t d?ng</p>
              <div className="space-y-2.5">
                {[
                  { icon: "ri-book-open-line", color: "app-accent-primary", text: "Ch?n bài h?c mu?n thi th?" },
                  { icon: "ri-question-line", color: "#a78bfa", text: "10 câu h?i t? d?ng t? t? v?ng" },
                  { icon: "ri-timer-line", color: "#fb923c", text: "30 giây m?i câu" },
                  { icon: "ri-star-line", color: "#34d399", text: "Nh?n XP d?a trên di?m s?" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent history */}
            {recentHistory.length > 0 && (
              <div className="bg-app-bg border border-app-border rounded-2xl p-4">
                <p className="text-white font-semibold text-sm mb-3">L?ch s? g?n dây</p>
                <div className="space-y-2">
                  {recentHistory.map((h, i) => {
                    const pctColor = h.percentage >= 80 ? "text-app-accent-success" : h.percentage >= 60 ? "text-app-accent-primary" : "text-red-400";
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectLesson(h.lesson)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/4 transition-colors cursor-pointer text-left"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-muted text-xs font-bold flex-shrink-0">
                          {h.lesson.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs truncate">{h.lesson.titleVi}</p>
                          <p className="text-app-text-muted text-[10px]">{h.score}/{h.total} câu dúng</p>
                        </div>
                        <span className={`font-bold text-sm ${pctColor}`}>{h.percentage}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* XP info */}
            <div className="bg-[#a78bfa]/5 border border-[#a78bfa]/15 rounded-xl p-4">
              <p className="text-[#a78bfa] text-xs font-semibold mb-2">Ph?n thu?ng XP</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">M?i câu dúng</span>
                  <span className="text-[#a78bfa] font-bold">+5 XP</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Ði?m &ge;80%</span>
                  <span className="text-[#a78bfa] font-bold">+20 XP bonus</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Ði?m 100%</span>
                  <span className="text-[#a78bfa] font-bold">+70 XP t?ng</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

