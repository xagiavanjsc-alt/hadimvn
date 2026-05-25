import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { vocabularyData, VOCAB_CATEGORIES, type VocabItem } from "@/mocks/vocabularyData";
import ShareResultModal from "@/components/feature/ShareResultModal";
import { usePageSEO } from "@/hooks/usePageSEO";

type QuizQuestion = {
  id: string;
  word: VocabItem;
  options: string[];
  correctAnswer: string;
  questionType: "ko2vi" | "vi2ko";
};

type QuizResult = {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
};

const LEVELS = [
  { id: "all", label: "Tất cả", color: "#e8c84a" },
  { id: "A1", label: "A1", color: "#34d399" },
  { id: "A2", label: "A2", color: "#38bdf8" },
  { id: "B1", label: "B1", color: "#fb923c" },
  { id: "B2", label: "B2", color: "#f87171" },
];

const QUESTION_COUNTS = [10, 20, 30, 50];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(
  words: VocabItem[],
  allWords: VocabItem[],
  count: number
): QuizQuestion[] {
  const selected = shuffle(words).slice(0, count);
  return selected.map((word) => {
    const isKo2Vi = Math.random() > 0.4;
    const wrongPool = allWords.filter((w) => w.id !== word.id);
    const wrongs = shuffle(wrongPool)
      .slice(0, 3)
      .map((w) => (isKo2Vi ? w.vietnamese : w.korean));
    const correct = isKo2Vi ? word.vietnamese : word.korean;
    const options = shuffle([correct, ...wrongs]);
    return {
      id: word.id,
      word,
      options,
      correctAnswer: correct,
      questionType: isKo2Vi ? "ko2vi" : "vi2ko",
    };
  });
}

export default function TopikTopicQuizPage() {
  usePageSEO({
    title: "Quiz từ vựng TOPIK theo chủ đề | Hàn Quốc Ơi!",
    description: "Quiz từ vựng TOPIK phân theo chủ đề: gia đình, công việc, du lịch... Luyện nhanh, có giải thích từng câu. Miễn phí.",
    keywords: "quiz TOPIK, từ vựng TOPIK theo chủ đề, kiểm tra từ vựng tiếng Hàn",
    path: "/topik-topic-quiz",
  });
  const [phase, setPhase] = useState<"setup" | "quiz" | "result">("setup");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timer, setTimer] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong">("all");

  const filteredWords = vocabularyData.filter((w) => {
    const catOk = selectedCategory === "all" || w.category === selectedCategory;
    const lvlOk = selectedLevel === "all" || w.topikLevel === selectedLevel;
    return catOk && lvlOk;
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === "quiz") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const startQuiz = () => {
    if (filteredWords.length < 4) return;
    const qs = generateQuestions(filteredWords, vocabularyData, Math.min(questionCount, filteredWords.length));
    setQuestions(qs);
    setCurrentIdx(0);
    setResults([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimer(0);
    setStartTime(Date.now());
    setPhase("quiz");
  };

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;
      const q = questions[currentIdx];
      const isCorrect = answer === q.correctAnswer;
      const timeSpent = Date.now() - startTime;
      setSelectedAnswer(answer);
      setShowExplanation(true);
      setResults((prev) => [...prev, { question: q, userAnswer: answer, isCorrect, timeSpent }]);
    },
    [selectedAnswer, questions, currentIdx, startTime]
  );

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setTotalTime(timer);
      setPhase("result");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    }
  };

  const [showShare, setShowShare] = useState(false);
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  const xpEarned = correctCount * 15;

  const reviewResults = results.filter((r) => {
    if (reviewFilter === "correct") return r.isCorrect;
    if (reviewFilter === "wrong") return !r.isCorrect;
    return true;
  });

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (phase === "setup") {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Luyện thi TOPIK theo chủ đề</h1>
            <p className="text-app-text-secondary text-sm">Chọn chủ đề và cấp độ, làm bài trắc nghiệm với giải thích đáp án chi tiết</p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <p className="text-white/60 text-xs tracking-normal mb-3">Chủ đề từ vựng</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategory === "all"
                    ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-app-accent-primary"
                    : "border-app-border text-app-text-secondary hover:text-white/70 hover:border-white/20"
                }`}
              >
                <i className="ri-apps-line mr-1.5"></i>Tất cả
              </button>
              {VOCAB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat.id
                      ? "border-opacity-40 text-white"
                      : "border-app-border text-app-text-secondary hover:text-white/70 hover:border-white/20"
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}60`, color: cat.color }
                      : {}
                  }
                >
                  <i className={`${cat.icon} mr-1.5`}></i>{cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="mb-6">
            <p className="text-white/60 text-xs tracking-normal mb-3">Cấp độ TOPIK</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  onClick={() => setSelectedLevel(lv.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedLevel === lv.id
                      ? "text-white"
                      : "border-app-border text-app-text-secondary hover:text-white/70"
                  }`}
                  style={
                    selectedLevel === lv.id
                      ? { backgroundColor: `${lv.color}20`, borderColor: `${lv.color}60`, color: lv.color }
                      : {}
                  }
                >
                  {lv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="mb-8">
            <p className="text-white/60 text-xs tracking-normal mb-3">Số câu hỏi</p>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    questionCount === n
                      ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-app-accent-primary"
                      : "border-app-border text-app-text-secondary hover:text-white/70"
                  }`}
                >
                  {n} câu
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-6 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-app-accent-primary">{filteredWords.length}</p>
              <p className="text-app-text-secondary text-xs">Từ có sẵn</p>
            </div>
            <div className="w-px h-10 bg-white/8"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{Math.min(questionCount, filteredWords.length)}</p>
              <p className="text-app-text-secondary text-xs">Câu sẽ thi</p>
            </div>
            <div className="w-px h-10 bg-white/8"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-app-accent-success">{Math.min(questionCount, filteredWords.length) * 15}</p>
              <p className="text-app-text-secondary text-xs">XP tối đa</p>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={filteredWords.length < 4}
            className="w-full py-3.5 bg-app-accent-primary hover:bg-app-accent-primary/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="ri-play-fill mr-2"></i>Bắt đầu luyện thi
          </button>
          {filteredWords.length < 4 && (
            <p className="text-red-400 text-xs text-center mt-2">Cần ít nhất 4 từ để tạo bài thi. Hãy chọn chủ đề khác.</p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (phase === "quiz") {
    const q = questions[currentIdx];
    const progress = ((currentIdx + (selectedAnswer ? 1 : 0)) / questions.length) * 100;

    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase("setup")}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-white/50 cursor-pointer"
              >
                <i className="ri-arrow-left-line text-sm"></i>
              </button>
              <div>
                <p className="text-white font-semibold text-sm">Câu {currentIdx + 1} / {questions.length}</p>
                <p className="text-app-text-muted text-xs">{correctCount} đúng</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-app-card/50 px-3 py-1.5 rounded-lg">
              <i className="ri-time-line text-app-text-secondary text-sm"></i>
              <span className="text-white/60 text-sm font-mono">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-white/8 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-app-accent-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="bg-app-surface/50 border border-app-border rounded-2xl p-6 mb-6 text-center">
            <p className="text-app-text-secondary text-xs mb-3 tracking-normal">
              {q.questionType === "ko2vi" ? "Từ tiếng Hàn → Nghĩa tiếng Việt" : "Nghĩa tiếng Việt → Từ tiếng Hàn"}
            </p>
            <p className="text-3xl font-bold text-white mb-2">
              {q.questionType === "ko2vi" ? q.word.korean : q.word.vietnamese}
            </p>
            {q.questionType === "ko2vi" && (
              <p className="text-app-text-muted text-sm">[{q.word.reading}]</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{
                  backgroundColor: LEVELS.find((l) => l.id === q.word.topikLevel)?.color + "20",
                  color: LEVELS.find((l) => l.id === q.word.topikLevel)?.color,
                }}
              >
                {q.word.topikLevel}
              </span>
              <span className="text-app-text-muted text-xs">
                {VOCAB_CATEGORIES.find((c) => c.id === q.word.category)?.label}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {q.options.map((opt, i) => {
              let style = "border-app-border text-white/70 hover:border-white/30 hover:bg-app-card/50";
              if (selectedAnswer !== null) {
                if (opt === q.correctAnswer) style = "border-emerald-500/60 bg-emerald-500/10 text-app-accent-success";
                else if (opt === selectedAnswer && opt !== q.correctAnswer)
                  style = "border-red-500/60 bg-red-500/10 text-red-400";
                else style = "border-app-border text-app-text-muted";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={selectedAnswer !== null}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer whitespace-nowrap ${style}`}
                >
                  <span className="text-app-text-muted mr-3">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {selectedAnswer !== null && opt === q.correctAnswer && (
                    <i className="ri-check-line text-app-accent-success float-right mt-0.5"></i>
                  )}
                  {selectedAnswer !== null && opt === selectedAnswer && opt !== q.correctAnswer && (
                    <i className="ri-close-line text-red-400 float-right mt-0.5"></i>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-4">
              <p className="text-white/50 text-xs mb-2 tracking-normal">Ví dụ câu</p>
              <p className="text-white/80 text-sm mb-1">{q.word.example}</p>
              <p className="text-app-text-secondary text-xs italic">{q.word.exampleVi}</p>
            </div>
          )}

          {selectedAnswer && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-app-accent-primary hover:bg-app-accent-primary/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              {currentIdx + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Result phase
  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Score card */}
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: accuracy >= 80 ? "rgba(52,211,153,0.15)" : accuracy >= 60 ? "rgba(232,200,74,0.15)" : "rgba(248,113,113,0.15)",
              border: `2px solid ${accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#e8c84a" : "#f87171"}40`,
            }}
          >
            <span className="text-xl font-bold" style={{ color: accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#e8c84a" : "#f87171" }}>
              {accuracy}%
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {accuracy >= 80 ? "Xuất sắc!" : accuracy >= 60 ? "Tốt lắm!" : "Cần cố gắng thêm!"}
          </h2>
          <p className="text-app-text-secondary text-sm mb-4">
            {correctCount}/{results.length} câu đúng · {formatTime(totalTime)}
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-app-accent-success">{correctCount}</p>
              <p className="text-app-text-muted text-xs">Đúng</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{results.length - correctCount}</p>
              <p className="text-app-text-muted text-xs">Sai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-app-accent-primary">+{xpEarned}</p>
              <p className="text-app-text-muted text-xs">XP</p>
            </div>
          </div>
        </div>

        {/* Review filter */}
        <div className="flex gap-2 mb-4">
          {(["all", "correct", "wrong"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setReviewFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                reviewFilter === f
                  ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-app-accent-primary"
                  : "border-app-border text-app-text-secondary hover:text-white/70"
              }`}
            >
              {f === "all" ? `Tất cả (${results.length})` : f === "correct" ? `Đúng (${correctCount})` : `Sai (${results.length - correctCount})`}
            </button>
          ))}
        </div>

        {/* Review list */}
        <div className="space-y-3 mb-6">
          {reviewResults.map((r, i) => (
            <div
              key={i}
              className={`bg-app-surface/50 border rounded-xl p-4 ${r.isCorrect ? "border-emerald-500/20" : "border-red-500/20"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${r.isCorrect ? "text-app-accent-success" : "text-red-400"}`}>
                      {r.isCorrect ? "✓ Đúng" : "✗ Sai"}
                    </span>
                    <span className="text-app-text-muted text-xs">{r.question.word.topikLevel}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{r.question.word.korean}</p>
                  <p className="text-app-text-secondary text-xs">[{r.question.word.reading}]</p>
                  <p className="text-white/60 text-xs mt-1">{r.question.word.vietnamese}</p>
                  {!r.isCorrect && (
                    <p className="text-red-400/70 text-xs mt-1">Bạn chọn: {r.userAnswer}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-app-text-muted text-xs">{r.question.word.example}</p>
                  <p className="text-white/15 text-xs italic">{r.question.word.exampleVi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase("setup")}
            className="flex-1 py-3 bg-app-card/50 hover:bg-app-card/70 text-white/70 font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap border border-app-border"
          >
            <i className="ri-settings-3-line mr-2"></i>Cài đặt lại
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="py-3 px-4 bg-app-card/50 hover:bg-app-card/70 text-white/60 font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap border border-app-border"
          >
            <i className="ri-share-line mr-1"></i>Chia sẻ
          </button>
          <button
            onClick={startQuiz}
            className="flex-1 py-3 bg-app-accent-primary hover:bg-app-accent-primary/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line mr-2"></i>Làm lại
          </button>
        </div>
      </div>
      {showShare && (
        <ShareResultModal
          score={correctCount}
          total={results.length}
          level={selectedLevel}
          quizType="vocab"
          onClose={() => setShowShare(false)}
        />
      )}
    </DashboardLayout>
  );
}

