import { useState, useMemo, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { seoulBooks } from "@/mocks/seoulTextbook";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface WritingQuestion {
  id: string;
  bookId: string;
  bookName: string;
  lessonNumber: number;
  lessonTitle: string;
  type: "fill-blank" | "translate-vi" | "translate-ko" | "rearrange";
  prompt: string;
  answer: string;
  hint?: string;
  explanation?: string;
}

function buildWritingQuestions(): WritingQuestion[] {
  const questions: WritingQuestion[] = [];
  seoulBooks.forEach(book => {
    book.lessons.forEach(lesson => {
      lesson.vocabulary.forEach((vocab, vi) => {
        // Fill in the blank
        if (vocab.example && vocab.example.includes(vocab.korean)) {
          const blank = vocab.example.replace(vocab.korean, "______");
          questions.push({
            id: `${book.id}-${lesson.lessonNumber}-fill-${vi}`,
            bookId: book.id,
            bookName: book.name,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleVi,
            type: "fill-blank",
            prompt: `Điền vào chỗ trống:\n${blank}\n(${vocab.exampleVi})`,
            answer: vocab.korean,
            hint: `[${vocab.pronunciation}] - ${vocab.vietnamese}`,
            explanation: `Đáp án: ${vocab.korean} (${vocab.vietnamese})`,
          });
        }
        // Translate Vietnamese → Korean
        if (vi % 3 === 0) {
          questions.push({
            id: `${book.id}-${lesson.lessonNumber}-trvi-${vi}`,
            bookId: book.id,
            bookName: book.name,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleVi,
            type: "translate-vi",
            prompt: `Dịch sang tiếng Hàn:\n"${vocab.vietnamese}"`,
            answer: vocab.korean,
            hint: `Phiên âm: [${vocab.pronunciation}]`,
            explanation: `${vocab.korean} [${vocab.pronunciation}] = ${vocab.vietnamese}`,
          });
        }
        // Translate Korean → Vietnamese
        if (vi % 3 === 1) {
          questions.push({
            id: `${book.id}-${lesson.lessonNumber}-trko-${vi}`,
            bookId: book.id,
            bookName: book.name,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleVi,
            type: "translate-ko",
            prompt: `Dịch sang tiếng Việt:\n"${vocab.korean}"`,
            answer: vocab.vietnamese,
            hint: `Phiên âm: [${vocab.pronunciation}]`,
            explanation: `${vocab.korean} = ${vocab.vietnamese}`,
          });
        }
      });
    });
  });
  return questions;
}

const ALL_QUESTIONS = buildWritingQuestions();

type ScoreResult = "correct" | "partial" | "wrong";

function scoreAnswer(userAnswer: string, correctAnswer: string): ScoreResult {
  const u = userAnswer.trim().toLowerCase().replace(/[.,!?]/g, "");
  const c = correctAnswer.trim().toLowerCase().replace(/[.,!?]/g, "");
  if (u === c) return "correct";
  // Partial: contains key words
  const cWords = c.split(/\s+/);
  const uWords = u.split(/\s+/);
  const matched = cWords.filter(w => uWords.some(uw => uw.includes(w) || w.includes(uw)));
  if (matched.length >= Math.ceil(cWords.length * 0.6)) return "partial";
  return "wrong";
}

interface SessionStats {
  correct: number;
  partial: number;
  wrong: number;
  total: number;
  xpEarned: number;
}

export default function SeoulWritingPage() {
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "fill-blank" | "translate-vi" | "translate-ko">("all");
  const [sessionQuestions, setSessionQuestions] = useState<WritingQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ correct: 0, partial: 0, wrong: 0, total: 0, xpEarned: 0 });
  const [sessionDone, setSessionDone] = useState(false);
  const [mode, setMode] = useState<"setup" | "practice">("setup");
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredQuestions = useMemo(() => {
    let q = ALL_QUESTIONS;
    if (selectedBook !== "all") q = q.filter(x => x.bookId === selectedBook);
    if (selectedType !== "all") q = q.filter(x => x.type === selectedType);
    return q;
  }, [selectedBook, selectedType]);

  const startSession = (count: number) => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5).slice(0, count);
    setSessionQuestions(shuffled);
    setCurrentIdx(0);
    setUserInput("");
    setSubmitted(false);
    setScoreResult(null);
    setShowHint(false);
    setSessionStats({ correct: 0, partial: 0, wrong: 0, total: 0, xpEarned: 0 });
    setSessionDone(false);
    setMode("practice");
  };

  useEffect(() => {
    if (mode === "practice" && !submitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIdx, mode, submitted]);

  const currentQ = sessionQuestions[currentIdx];

  const handleSubmit = () => {
    if (!userInput.trim() || !currentQ) return;
    const result = scoreAnswer(userInput, currentQ.answer);
    setScoreResult(result);
    setSubmitted(true);

    const xpMap: Record<ScoreResult, number> = { correct: 20, partial: 10, wrong: 0 };
    const xp = xpMap[result];
    setSessionStats(prev => ({
      correct: prev.correct + (result === "correct" ? 1 : 0),
      partial: prev.partial + (result === "partial" ? 1 : 0),
      wrong: prev.wrong + (result === "wrong" ? 1 : 0),
      total: prev.total + 1,
      xpEarned: prev.xpEarned + xp,
    }));
    if (xp > 0) {
      setXpData(prev => ({ total: (prev.total || 0) + xp }));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= sessionQuestions.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setUserInput("");
      setSubmitted(false);
      setScoreResult(null);
      setShowHint(false);
    }
  };

  const speakKorean = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = 0.85;
    synth.speak(utt);
  };

  const typeLabels: Record<string, string> = {
    "fill-blank": "Điền vào chỗ trống",
    "translate-vi": "Dịch Việt → Hàn",
    "translate-ko": "Dịch Hàn → Việt",
  };

  const typeColors: Record<string, string> = {
    "fill-blank": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "translate-vi": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "translate-ko": "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  const scoreColors: Record<ScoreResult, string> = {
    correct: "border-emerald-500/30 bg-emerald-500/10",
    partial: "border-amber-500/30 bg-amber-500/10",
    wrong: "border-red-500/30 bg-red-500/10",
  };

  const scoreLabels: Record<ScoreResult, string> = {
    correct: "Chính xác! +20 XP",
    partial: "Gần đúng! +10 XP",
    wrong: "Chưa đúng",
  };

  const scoreIcons: Record<ScoreResult, string> = {
    correct: "ri-checkbox-circle-fill text-emerald-400",
    partial: "ri-error-warning-fill text-amber-400",
    wrong: "ri-close-circle-fill text-red-400",
  };

  // Setup screen
  if (mode === "setup") {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Luyện viết Seoul
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Luyện viết câu theo bài học Seoul với chấm điểm tự động</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-white font-bold text-2xl">{ALL_QUESTIONS.length}</p>
              <p className="text-white/40 text-xs mt-0.5">Tổng câu hỏi</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-white font-bold text-2xl">{seoulBooks.length}</p>
              <p className="text-white/40 text-xs mt-0.5">Cuốn sách</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-[#e8c84a] font-bold text-2xl">3</p>
              <p className="text-white/40 text-xs mt-0.5">Dạng bài</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Tùy chỉnh bài luyện</h2>

            {/* Book filter */}
            <div>
              <p className="text-white/40 text-xs mb-2">Chọn cuốn sách</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBook("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${selectedBook === "all" ? "bg-white/15 text-white border-white/20" : "bg-white/5 text-white/40 hover:text-white/70 border-transparent"}`}
                >
                  Tất cả
                </button>
                {seoulBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      selectedBook === book.id
                        ? "bg-[#e8c84a]/15 text-[#e8c84a] border-[#e8c84a]/30"
                        : "bg-white/5 text-white/40 hover:text-white/70 border-transparent"
                    }`}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <p className="text-white/40 text-xs mb-2">Dạng bài</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tất cả dạng" },
                  { id: "fill-blank", label: "Điền vào chỗ trống" },
                  { id: "translate-vi", label: "Dịch Việt → Hàn" },
                  { id: "translate-ko", label: "Dịch Hàn → Việt" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id as "all" | "fill-blank" | "translate-vi" | "translate-ko")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      selectedType === t.id
                        ? "bg-[#e8c84a]/15 text-[#e8c84a] border-[#e8c84a]/30"
                        : "bg-white/5 text-white/40 hover:text-white/70 border-transparent"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-white/30 text-xs">
              {filteredQuestions.length} câu hỏi phù hợp với bộ lọc
            </p>
          </div>

          {/* Start buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { count: 10, label: "10 câu", desc: "Luyện nhanh", xp: "200 XP" },
              { count: 20, label: "20 câu", desc: "Luyện vừa", xp: "400 XP" },
              { count: 30, label: "30 câu", desc: "Luyện sâu", xp: "600 XP" },
            ].map(opt => (
              <button
                key={opt.count}
                onClick={() => startSession(Math.min(opt.count, filteredQuestions.length))}
                disabled={filteredQuestions.length === 0}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 text-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="text-white font-bold text-xl">{opt.label}</p>
                <p className="text-white/40 text-xs mt-1">{opt.desc}</p>
                <p className="text-[#e8c84a] text-xs mt-2 font-medium">Tối đa {opt.xp}</p>
              </button>
            ))}
          </div>

          {/* Type guide */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm">Hướng dẫn chấm điểm</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-checkbox-circle-fill text-emerald-400 text-base"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Chính xác — +20 XP</p>
                  <p className="text-white/30 text-xs">Câu trả lời khớp hoàn toàn với đáp án</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-error-warning-fill text-amber-400 text-base"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Gần đúng — +10 XP</p>
                  <p className="text-white/30 text-xs">Câu trả lời chứa ít nhất 60% từ khóa đúng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-close-circle-fill text-red-400 text-base"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Chưa đúng — +0 XP</p>
                  <p className="text-white/30 text-xs">Xem đáp án và ghi nhớ để lần sau làm đúng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Session done screen
  if (sessionDone) {
    const accuracy = sessionStats.total > 0
      ? Math.round(((sessionStats.correct + sessionStats.partial * 0.5) / sessionStats.total) * 100)
      : 0;

    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-[#e8c84a]/10 rounded-full mx-auto">
              <i className="ri-trophy-line text-[#e8c84a] text-3xl"></i>
            </div>
            <h2 className="text-white font-bold text-2xl">Hoàn thành!</h2>
            <p className="text-white/40 text-sm">Bạn đã luyện viết {sessionStats.total} câu</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-emerald-400 font-bold text-xl">{sessionStats.correct}</p>
                <p className="text-emerald-400/60 text-xs">Đúng</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-amber-400 font-bold text-xl">{sessionStats.partial}</p>
                <p className="text-amber-400/60 text-xs">Gần đúng</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-red-400 font-bold text-xl">{sessionStats.wrong}</p>
                <p className="text-red-400/60 text-xs">Sai</p>
              </div>
              <div className="bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl p-3 text-center">
                <p className="text-[#e8c84a] font-bold text-xl">{sessionStats.xpEarned}</p>
                <p className="text-[#e8c84a]/60 text-xs">XP</p>
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/40 text-xs">Độ chính xác</span>
                <span className="text-white font-bold text-sm">{accuracy}%</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${accuracy}%`,
                    backgroundColor: accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "#e8c84a" : "#f87171",
                  }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setMode("setup")}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:text-white/80 transition-all cursor-pointer whitespace-nowrap"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => startSession(sessionStats.total)}
                className="flex-1 py-3 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/30 text-[#e8c84a] text-sm font-medium hover:bg-[#e8c84a]/25 transition-all cursor-pointer whitespace-nowrap"
              >
                Luyện lại
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Practice screen
  if (!currentQ) return null;

  const progress = ((currentIdx) / sessionQuestions.length) * 100;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode("setup")}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line text-sm"></i>
            </div>
            Thoát
          </button>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm">{currentIdx + 1}/{sessionQuestions.length}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-star-fill text-[#e8c84a] text-xs"></i>
              </div>
              <span className="text-[#e8c84a] text-sm font-medium">{sessionStats.xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e8c84a] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {/* Type badge */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[currentQ.type]}`}>
              {typeLabels[currentQ.type]}
            </span>
            <span className="text-white/25 text-xs">{currentQ.bookName} · Bài {currentQ.lessonNumber}</span>
          </div>

          {/* Prompt */}
          <div className="space-y-1">
            {currentQ.prompt.split("\n").map((line, i) => (
              <p
                key={i}
                className={i === 0 ? "text-white/50 text-sm" : "text-white font-semibold text-xl leading-relaxed"}
                style={i > 0 ? { fontFamily: "'Noto Sans KR', sans-serif" } : {}}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Speak button for Korean prompts */}
          {currentQ.type === "translate-ko" && (
            <button
              onClick={() => speakKorean(currentQ.prompt.split("\n")[1]?.replace(/"/g, "") || "")}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-volume-up-line text-sm"></i>
              </div>
              Nghe phát âm
            </button>
          )}

          {/* Input */}
          <div>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && !submitted) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={submitted}
              placeholder={
                currentQ.type === "translate-vi"
                  ? "Nhập câu trả lời bằng tiếng Hàn..."
                  : currentQ.type === "translate-ko"
                  ? "Nhập câu trả lời bằng tiếng Việt..."
                  : "Điền từ còn thiếu..."
              }
              rows={3}
              className={`w-full rounded-xl px-4 py-3 text-white text-base placeholder-white/20 focus:outline-none resize-none transition-all border ${
                submitted && scoreResult
                  ? scoreColors[scoreResult]
                  : "bg-white/5 border-white/10 focus:border-white/25"
              }`}
              style={{ fontFamily: currentQ.type !== "translate-ko" ? "'Noto Sans KR', sans-serif" : "inherit" }}
            />
            <p className="text-white/20 text-xs mt-1">Nhấn Enter để nộp bài</p>
          </div>

          {/* Hint */}
          {!submitted && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/50 text-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-lightbulb-line text-xs"></i>
              </div>
              {showHint ? "Ẩn gợi ý" : "Xem gợi ý"}
            </button>
          )}
          {showHint && !submitted && currentQ.hint && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-2.5">
              <p className="text-amber-400/80 text-sm">{currentQ.hint}</p>
            </div>
          )}
        </div>

        {/* Result */}
        {submitted && scoreResult && (
          <div className={`border rounded-2xl p-5 space-y-3 ${scoreColors[scoreResult]}`}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${scoreIcons[scoreResult]} text-lg`}></i>
              </div>
              <p className="text-white font-semibold text-sm">{scoreLabels[scoreResult]}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Đáp án đúng:</p>
              <p
                className="text-white font-medium text-base"
                style={{ fontFamily: currentQ.type !== "translate-ko" ? "'Noto Sans KR', sans-serif" : "inherit" }}
              >
                {currentQ.answer}
              </p>
            </div>
            {currentQ.explanation && (
              <p className="text-white/50 text-sm">{currentQ.explanation}</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="flex-1 py-3 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/30 text-[#e8c84a] font-medium text-sm hover:bg-[#e8c84a]/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Nộp bài
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-[#e8c84a]/15 border border-[#e8c84a]/30 text-[#e8c84a] font-medium text-sm hover:bg-[#e8c84a]/25 transition-all cursor-pointer whitespace-nowrap"
            >
              {currentIdx + 1 >= sessionQuestions.length ? "Xem kết quả" : "Câu tiếp theo"}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          )}
        </div>

        {/* Mini stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-2.5 text-center">
            <p className="text-emerald-400 font-bold">{sessionStats.correct}</p>
            <p className="text-emerald-400/50 text-xs">Đúng</p>
          </div>
          <div className="flex-1 bg-amber-500/8 border border-amber-500/15 rounded-xl p-2.5 text-center">
            <p className="text-amber-400 font-bold">{sessionStats.partial}</p>
            <p className="text-amber-400/50 text-xs">Gần đúng</p>
          </div>
          <div className="flex-1 bg-red-500/8 border border-red-500/15 rounded-xl p-2.5 text-center">
            <p className="text-red-400 font-bold">{sessionStats.wrong}</p>
            <p className="text-red-400/50 text-xs">Sai</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


