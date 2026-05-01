import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { vocabularyData, VOCAB_CATEGORIES, type VocabItem } from "@/mocks/vocabularyData";

type Phase = "setup" | "listening" | "result";
type QuestionType = "word-meaning" | "sentence-fill" | "dialogue";

interface ListeningQuestion {
  id: string;
  type: QuestionType;
  audioText: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  word: VocabItem;
}

interface SessionResult {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeMs: number;
}

const LEVELS = [
  { id: "A1", label: "A1 - Sơ cấp 1", color: "#34d399", desc: "Từ vựng cơ bản hàng ngày" },
  { id: "A2", label: "A2 - Sơ cấp 2", color: "#38bdf8", desc: "Từ vựng giao tiếp thông dụng" },
  { id: "B1", label: "B1 - Trung cấp 1", color: "#fb923c", desc: "Từ vựng xã hội, công việc" },
  { id: "B2", label: "B2 - Trung cấp 2", color: "#f87171", desc: "Từ vựng học thuật, nâng cao" },
];

const SESSION_SIZES = [10, 15, 20, 30];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(words: VocabItem[], count: number): ListeningQuestion[] {
  const pool = shuffle(words).slice(0, count);
  return pool.map((word, idx) => {
    const qType = idx % 3 === 0 ? "sentence-fill" : idx % 3 === 1 ? "dialogue" : "word-meaning";

    // Generate wrong options from same level
    const sameLevel = words.filter((w) => w.id !== word.id && w.topikLevel === word.topikLevel);
    const wrongOptions = shuffle(sameLevel)
      .slice(0, 3)
      .map((w) => w.vietnamese);

    const correctAnswer = word.vietnamese;
    const allOptions = shuffle([correctAnswer, ...wrongOptions]);
    const correctIndex = allOptions.indexOf(correctAnswer);

    let audioText = word.korean;
    let question = "";

    if (qType === "word-meaning") {
      audioText = word.korean;
      question = `Từ vừa nghe có nghĩa là gì?`;
    } else if (qType === "sentence-fill") {
      audioText = word.example;
      question = `Câu vừa nghe, từ "${word.korean}" có nghĩa là gì?`;
    } else {
      audioText = `${word.korean}. ${word.example}`;
      question = `Trong đoạn hội thoại, "${word.korean}" có nghĩa là gì?`;
    }

    return {
      id: `q_${word.id}_${idx}`,
      type: qType,
      audioText,
      question,
      options: allOptions,
      correctIndex,
      explanation: `"${word.korean}" [${word.reading}] = ${word.vietnamese}. Ví dụ: ${word.example} — ${word.exampleVi}`,
      word,
    };
  });
}

export default function TopikListeningPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sessionSize, setSessionSize] = useState(15);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [filterTab, setFilterTab] = useState<"all" | "correct" | "wrong">("all");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const filteredWords = vocabularyData.filter((w) => {
    const catOk = selectedCategory === "all" || w.category === selectedCategory;
    const lvlOk = w.topikLevel === selectedLevel;
    return catOk && lvlOk;
  });

  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (isPlaying) {
        speechSynthesis.cancel();
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = playbackRate;
      u.pitch = 1.0;
      u.onstart = () => setIsPlaying(true);
      u.onend = () => {
        setIsPlaying(false);
        setPlayCount((c) => c + 1);
        if (onEnd) onEnd();
      };
      u.onerror = () => setIsPlaying(false);
      utteranceRef.current = u;
      speechSynthesis.speak(u);
    },
    [isPlaying, playbackRate]
  );

  const startSession = () => {
    if (filteredWords.length < 4) return;
    const qs = generateQuestions(filteredWords, Math.min(sessionSize, filteredWords.length));
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setResults([]);
    setPlayCount(0);
    setTimeLeft(30);
    setPhase("listening");
  };

  // Auto-play when question changes
  useEffect(() => {
    if (phase !== "listening" || !questions[currentIdx]) return;
    setPlayCount(0);
    setStartTime(Date.now());
    setTimeLeft(30);
    if (autoPlayEnabled) {
      setTimeout(() => speakText(questions[currentIdx].audioText), 500);
    }
  }, [currentIdx, phase]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "listening" || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time up — auto skip
          handleAnswer(-1);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, phase, showResult]);

  const handleAnswer = (optionIdx: number) => {
    if (showResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    speechSynthesis.cancel();
    setIsPlaying(false);

    const q = questions[currentIdx];
    const correct = optionIdx === q.correctIndex;
    const timeMs = Date.now() - startTime;

    setSelectedOption(optionIdx);
    setShowResult(true);
    setResults((prev) => [
      ...prev,
      { questionId: q.id, selectedIndex: optionIdx, correct, timeMs },
    ]);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
      setTimeLeft(30);
    }
  };

  const currentQ = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + (showResult ? 1 : 0)) / questions.length) * 100 : 0;
  const correctCount = results.filter((r) => r.correct).length;
  const score = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const levelInfo = LEVELS.find((l) => l.id === selectedLevel);

  // ─── Setup Phase ──────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Luyện nghe TOPIK</h1>
            <p className="text-white/40 text-sm">Nghe câu tiếng Hàn rồi chọn đáp án đúng — luyện kỹ năng nghe cho kỳ thi TOPIK</p>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "ri-volume-up-line", color: "#34d399", title: "Nghe", desc: "Hệ thống đọc câu tiếng Hàn" },
              { icon: "ri-checkbox-multiple-line", color: "#e8c84a", title: "Chọn đáp án", desc: "4 lựa chọn nghĩa tiếng Việt" },
              { icon: "ri-bar-chart-line", color: "#fb923c", title: "Xem kết quả", desc: "Giải thích chi tiết từng câu" },
            ].map((step) => (
              <div key={step.title} className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${step.color}20` }}>
                  <i className={`${step.icon} text-lg`} style={{ color: step.color }}></i>
                </div>
                <p className="text-white/80 text-sm font-semibold mb-1">{step.title}</p>
                <p className="text-white/30 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Level selection */}
          <div className="mb-5">
            <p className="text-white/60 text-xs tracking-normal mb-3">Cấp độ</p>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  onClick={() => setSelectedLevel(lv.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLevel === lv.id ? "border-opacity-60" : "border-white/8 hover:border-white/20"
                  }`}
                  style={
                    selectedLevel === lv.id
                      ? { backgroundColor: `${lv.color}15`, borderColor: `${lv.color}50` }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${lv.color}20`, color: lv.color }}>
                      {lv.id}
                    </span>
                    <span className="text-white/70 text-xs">{lv.label.split(" - ")[1]}</span>
                  </div>
                  <p className="text-white/30 text-xs">{lv.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <p className="text-white/60 text-xs tracking-normal mb-3">Chủ đề</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategory === "all"
                    ? "bg-[#e8c84a]/15 border-[#e8c84a]/40 text-[#e8c84a]"
                    : "border-white/8 text-white/40 hover:text-white/70"
                }`}
              >
                Tất cả
              </button>
              {VOCAB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat.id ? "text-white" : "border-white/8 text-white/40 hover:text-white/70"
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}60`, color: cat.color }
                      : {}
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session size */}
          <div className="mb-5">
            <p className="text-white/60 text-xs tracking-normal mb-3">Số câu</p>
            <div className="flex gap-2">
              {SESSION_SIZES.map((n) => (
                <button
                  key={n}
                  onClick={() => setSessionSize(n)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    sessionSize === n
                      ? "bg-[#e8c84a]/15 border-[#e8c84a]/40 text-[#e8c84a]"
                      : "border-white/8 text-white/40 hover:text-white/70"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-8 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setAutoPlayEnabled((a) => !a)}
                className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${autoPlayEnabled ? "bg-[#e8c84a]" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${autoPlayEnabled ? "left-5" : "left-0.5"}`}></div>
              </div>
              <span className="text-white/50 text-xs">Tự động phát âm</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-xs">Tốc độ:</span>
              {[0.7, 1.0, 1.2].map((r) => (
                <button
                  key={r}
                  onClick={() => setPlaybackRate(r)}
                  className={`px-2 py-1 rounded text-xs cursor-pointer whitespace-nowrap border transition-all ${
                    playbackRate === r ? "bg-[#e8c84a]/15 border-[#e8c84a]/40 text-[#e8c84a]" : "border-white/8 text-white/30"
                  }`}
                >
                  {r === 0.7 ? "Chậm" : r === 1.0 ? "Bình thường" : "Nhanh"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-white/30 text-xs">
              {filteredWords.length} từ có sẵn ở cấp {selectedLevel}
              {selectedCategory !== "all" ? ` · chủ đề ${VOCAB_CATEGORIES.find((c) => c.id === selectedCategory)?.label}` : ""}
            </p>
          </div>

          <button
            onClick={startSession}
            disabled={filteredWords.length < 4}
            className="w-full py-3.5 bg-[#e8c84a] hover:bg-[#e8c84a]/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
          >
            <i className="ri-headphone-line mr-2"></i>
            Bắt đầu luyện nghe ({Math.min(sessionSize, filteredWords.length)} câu)
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Result Phase ─────────────────────────────────────────────────────────
  if (phase === "result") {
    const avgTime = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.timeMs, 0) / results.length / 1000) : 0;
    const filteredResults = results.filter((r) => {
      if (filterTab === "correct") return r.correct;
      if (filterTab === "wrong") return !r.correct;
      return true;
    });

    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto">
          {/* Score header */}
          <div className="text-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4"
              style={{
                borderColor: score >= 80 ? "#34d399" : score >= 60 ? "#e8c84a" : "#f87171",
                backgroundColor: score >= 80 ? "#34d39920" : score >= 60 ? "#e8c84a20" : "#f8717120",
              }}
            >
              <span className="text-3xl font-bold text-white">{score}%</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {score >= 80 ? "Xuất sắc!" : score >= 60 ? "Khá tốt!" : "Cần luyện thêm!"}
            </h2>
            <p className="text-white/40 text-sm">
              {correctCount}/{results.length} câu đúng · Thời gian TB: {avgTime}s/câu
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Đúng", value: correctCount, color: "#34d399" },
              { label: "Sai", value: results.filter((r) => !r.correct).length, color: "#f87171" },
              { label: "Điểm", value: `${score}%`, color: "#e8c84a" },
              { label: "Thời gian TB", value: `${avgTime}s`, color: "#38bdf8" },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/30 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {(["all", "correct", "wrong"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  filterTab === tab ? "bg-[#e8c84a]/15 border-[#e8c84a]/40 text-[#e8c84a]" : "border-white/8 text-white/40"
                }`}
              >
                {tab === "all" ? `Tất cả (${results.length})` : tab === "correct" ? `Đúng (${correctCount})` : `Sai (${results.filter((r) => !r.correct).length})`}
              </button>
            ))}
          </div>

          {/* Question review */}
          <div className="space-y-3 mb-6">
            {filteredResults.map((r, i) => {
              const q = questions.find((q) => q.id === r.questionId);
              if (!q) return null;
              return (
                <div
                  key={r.questionId}
                  className={`border rounded-xl p-4 ${r.correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${r.correct ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                        <i className={`${r.correct ? "ri-check-line text-emerald-400" : "ri-close-line text-red-400"} text-xs`}></i>
                      </div>
                      <span className="text-white/50 text-xs">Câu {results.indexOf(r) + 1}</span>
                    </div>
                    <button
                      onClick={() => speakText(q.audioText)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 cursor-pointer flex-shrink-0"
                    >
                      <i className="ri-volume-up-line text-xs"></i>
                    </button>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{q.question}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`px-3 py-1.5 rounded-lg text-xs ${
                          oi === q.correctIndex
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : oi === r.selectedIndex && !r.correct
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-white/3 text-white/30 border border-white/5"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/30 text-xs italic">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPhase("setup")}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap border border-white/8"
            >
              Cài đặt lại
            </button>
            <button
              onClick={startSession}
              className="flex-1 py-3 bg-[#e8c84a] hover:bg-[#e8c84a]/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-2"></i>Luyện lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Listening Phase ──────────────────────────────────────────────────────
  const timerPercent = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? "#34d399" : timeLeft > 7 ? "#e8c84a" : "#f87171";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { speechSynthesis.cancel(); setPhase("setup"); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm"></i>
          </button>
          <div className="text-center">
            <p className="text-white/60 text-sm">{currentIdx + 1} / {questions.length}</p>
            <p className="text-white/20 text-xs">{levelInfo?.label}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-check-line text-emerald-400 text-xs"></i>
            </div>
            <span className="text-emerald-400 text-sm font-bold">{correctCount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/8 rounded-full mb-2 overflow-hidden">
          <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Timer bar */}
        {!showResult && (
          <div className="h-0.5 bg-white/5 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
            ></div>
          </div>
        )}

        {/* Audio player card */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{
                  backgroundColor: `${levelInfo?.color}20`,
                  color: levelInfo?.color,
                }}
              >
                {selectedLevel}
              </span>
              <span className="text-white/20 text-xs">
                {currentQ?.type === "word-meaning" ? "Nghe từ" : currentQ?.type === "sentence-fill" ? "Nghe câu" : "Nghe hội thoại"}
              </span>
            </div>
            {!showResult && (
              <div className="flex items-center gap-1">
                <i className="ri-time-line text-white/20 text-xs"></i>
                <span className="text-white/30 text-xs">{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Big play button */}
          <div className="flex flex-col items-center py-4">
            <button
              onClick={() => currentQ && speakText(currentQ.audioText)}
              disabled={isPlaying}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer mb-3 ${
                isPlaying
                  ? "bg-[#e8c84a]/20 border-2 border-[#e8c84a]/60 animate-pulse"
                  : "bg-[#e8c84a]/10 border-2 border-[#e8c84a]/30 hover:bg-[#e8c84a]/20 hover:border-[#e8c84a]/60"
              }`}
            >
              <i className={`${isPlaying ? "ri-volume-up-fill" : "ri-play-fill"} text-[#e8c84a] text-3xl`}></i>
            </button>
            <p className="text-white/30 text-xs mb-1">
              {isPlaying ? "Đang phát..." : `Nhấn để nghe${playCount > 0 ? ` (đã nghe ${playCount} lần)` : ""}`}
            </p>

            {/* Speed control */}
            <div className="flex gap-1.5 mt-2">
              {[0.7, 1.0, 1.2].map((r) => (
                <button
                  key={r}
                  onClick={() => setPlaybackRate(r)}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer whitespace-nowrap border transition-all ${
                    playbackRate === r ? "bg-[#e8c84a]/15 border-[#e8c84a]/40 text-[#e8c84a]" : "border-white/8 text-white/20"
                  }`}
                >
                  {r === 0.7 ? "0.7x" : r === 1.0 ? "1.0x" : "1.2x"}
                </button>
              ))}
            </div>
          </div>

          {/* Show text after answering */}
          {showResult && (
            <div className="mt-3 pt-3 border-t border-white/8 text-center">
              <p className="text-white/60 text-sm font-medium">{currentQ?.audioText}</p>
            </div>
          )}
        </div>

        {/* Question */}
        <p className="text-white/70 text-sm mb-4 text-center">{currentQ?.question}</p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {currentQ?.options.map((opt, oi) => {
            let btnClass = "border-white/10 bg-white/3 text-white/60 hover:border-white/30 hover:bg-white/8";
            if (showResult) {
              if (oi === currentQ.correctIndex) {
                btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
              } else if (oi === selectedOption && selectedOption !== currentQ.correctIndex) {
                btnClass = "border-red-500/50 bg-red-500/10 text-red-400";
              } else {
                btnClass = "border-white/5 bg-white/2 text-white/20";
              }
            }
            return (
              <button
                key={oi}
                onClick={() => !showResult && handleAnswer(oi)}
                disabled={showResult}
                className={`p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer whitespace-nowrap text-left ${btnClass}`}
              >
                <span className="text-white/30 text-xs mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation after answer */}
        {showResult && (
          <div className={`rounded-xl p-4 mb-4 border ${selectedOption === currentQ?.correctIndex ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"}`}>
            <div className="flex items-center gap-2 mb-2">
              <i className={`${selectedOption === currentQ?.correctIndex ? "ri-check-double-line text-emerald-400" : "ri-close-circle-line text-red-400"} text-base`}></i>
              <span className={`text-sm font-bold ${selectedOption === currentQ?.correctIndex ? "text-emerald-400" : "text-red-400"}`}>
                {selectedOption === currentQ?.correctIndex ? "Chính xác!" : selectedOption === -1 ? "Hết giờ!" : "Chưa đúng!"}
              </span>
            </div>
            <p className="text-white/50 text-xs">{currentQ?.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {showResult && (
          <button
            onClick={nextQuestion}
            className="w-full py-3 bg-[#e8c84a] hover:bg-[#e8c84a]/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            {currentIdx + 1 >= questions.length ? (
              <><i className="ri-flag-line mr-2"></i>Xem kết quả</>
            ) : (
              <><i className="ri-arrow-right-line mr-2"></i>Câu tiếp theo</>
            )}
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}
