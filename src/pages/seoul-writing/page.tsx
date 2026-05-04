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
            prompt: `Ði?n vào ch? tr?ng:\n${blank}\n(${vocab.exampleVi})`,
            answer: vocab.korean,
            hint: `[${vocab.pronunciation}] - ${vocab.vietnamese}`,
            explanation: `Ðáp án: ${vocab.korean} (${vocab.vietnamese})`,
          });
        }
        // Translate Vietnamese ? Korean
        if (vi % 3 === 0) {
          questions.push({
            id: `${book.id}-${lesson.lessonNumber}-trvi-${vi}`,
            bookId: book.id,
            bookName: book.name,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleVi,
            type: "translate-vi",
            prompt: `D?ch sang ti?ng Hàn:\n"${vocab.vietnamese}"`,
            answer: vocab.korean,
            hint: `Phiên âm: [${vocab.pronunciation}]`,
            explanation: `${vocab.korean} [${vocab.pronunciation}] = ${vocab.vietnamese}`,
          });
        }
        // Translate Korean ? Vietnamese
        if (vi % 3 === 1) {
          questions.push({
            id: `${book.id}-${lesson.lessonNumber}-trko-${vi}`,
            bookId: book.id,
            bookName: book.name,
            lessonNumber: lesson.lessonNumber,
            lessonTitle: lesson.titleVi,
            type: "translate-ko",
            prompt: `D?ch sang ti?ng Vi?t:\n"${vocab.korean}"`,
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
    "fill-blank": "Ði?n vào ch? tr?ng",
    "translate-vi": "D?ch Vi?t ? Hàn",
    "translate-ko": "D?ch Hàn ? Vi?t",
  };

  const typeColors: Record<string, string> = {
    "fill-blank": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "translate-vi": "text-app-accent-success bg-emerald-500/10 border-emerald-500/20",
    "translate-ko": "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  const scoreColors: Record<ScoreResult, string> = {
    correct: "border-emerald-500/30 bg-emerald-500/10",
    partial: "border-amber-500/30 bg-amber-500/10",
    wrong: "border-red-500/30 bg-red-500/10",
  };

  const scoreLabels: Record<ScoreResult, string> = {
    correct: "Chính xác! +20 XP",
    partial: "G?n dúng! +10 XP",
    wrong: "Chua dúng",
  };

  const scoreIcons: Record<ScoreResult, string> = {
    correct: "ri-checkbox-circle-fill text-app-accent-success",
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
              Luy?n vi?t Seoul
            </h1>
            <p className="text-app-text-secondary text-sm mt-0.5">Luy?n vi?t câu theo bài h?c Seoul v?i ch?m di?m t? d?ng</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-app-card/50 border border-app-border rounded-xl p-4 text-center">
              <p className="text-white font-bold text-2xl">{ALL_QUESTIONS.length}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">T?ng câu h?i</p>
            </div>
            <div className="bg-app-card/50 border border-app-border rounded-xl p-4 text-center">
              <p className="text-white font-bold text-2xl">{seoulBooks.length}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">Cu?n sách</p>
            </div>
            <div className="bg-app-card/50 border border-app-border rounded-xl p-4 text-center">
              <p className="text-app-accent-primary font-bold text-2xl">3</p>
              <p className="text-app-text-secondary text-xs mt-0.5">D?ng bài</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Tùy ch?nh bài luy?n</h2>

            {/* Book filter */}
            <div>
              <p className="text-app-text-secondary text-xs mb-2">Ch?n cu?n sách</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBook("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${selectedBook === "all" ? "bg-white/15 text-white border-white/20" : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border-transparent"}`}
                >
                  T?t c?
                </button>
                {seoulBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      selectedBook === book.id
                        ? "bg-app-accent-primary/15 text-app-accent-primary border-app-accent-primary/30"
                        : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border-transparent"
                    }`}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <p className="text-app-text-secondary text-xs mb-2">D?ng bài</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "T?t c? d?ng" },
                  { id: "fill-blank", label: "Ði?n vào ch? tr?ng" },
                  { id: "translate-vi", label: "D?ch Vi?t ? Hàn" },
                  { id: "translate-ko", label: "D?ch Hàn ? Vi?t" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id as "all" | "fill-blank" | "translate-vi" | "translate-ko")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      selectedType === t.id
                        ? "bg-app-accent-primary/15 text-app-accent-primary border-app-accent-primary/30"
                        : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border-transparent"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-app-text-muted text-xs">
              {filteredQuestions.length} câu h?i phù h?p v?i b? l?c
            </p>
          </div>

          {/* Start buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { count: 10, label: "10 câu", desc: "Luy?n nhanh", xp: "200 XP" },
              { count: 20, label: "20 câu", desc: "Luy?n v?a", xp: "400 XP" },
              { count: 30, label: "30 câu", desc: "Luy?n sâu", xp: "600 XP" },
            ].map(opt => (
              <button
                key={opt.count}
                onClick={() => startSession(Math.min(opt.count, filteredQuestions.length))}
                disabled={filteredQuestions.length === 0}
                className="bg-app-card/50 hover:bg-app-card/70 border border-app-border hover:border-white/20 rounded-2xl p-5 text-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="text-white font-bold text-xl">{opt.label}</p>
                <p className="text-app-text-secondary text-xs mt-1">{opt.desc}</p>
                <p className="text-app-accent-primary text-xs mt-2 font-medium">T?i da {opt.xp}</p>
              </button>
            ))}
          </div>

          {/* Type guide */}
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm">Hu?ng d?n ch?m di?m</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-checkbox-circle-fill text-app-accent-success text-base"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Chính xác — +20 XP</p>
                  <p className="text-app-text-muted text-xs">Câu tr? l?i kh?p hoàn toàn v?i dáp án</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-error-warning-fill text-amber-400 text-base"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">G?n dúng — +10 XP</p>
                  <p className="text-app-text-muted text-xs">Câu tr? l?i ch?a ít nh?t 60% t? khóa dúng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-close-circle-fill text-red-400 text-base"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Chua dúng — +0 XP</p>
                  <p className="text-app-text-muted text-xs">Xem dáp án và ghi nh? d? l?n sau làm dúng</p>
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
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-app-accent-primary/10 rounded-full mx-auto">
              <i className="ri-trophy-line text-app-accent-primary text-3xl"></i>
            </div>
            <h2 className="text-white font-bold text-2xl">Hoàn thành!</h2>
            <p className="text-app-text-secondary text-sm">B?n dã luy?n vi?t {sessionStats.total} câu</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-app-accent-success font-bold text-xl">{sessionStats.correct}</p>
                <p className="text-app-accent-success/60 text-xs">Ðúng</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-amber-400 font-bold text-xl">{sessionStats.partial}</p>
                <p className="text-amber-400/60 text-xs">G?n dúng</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-red-400 font-bold text-xl">{sessionStats.wrong}</p>
                <p className="text-app-accent-error/60 text-xs">Sai</p>
              </div>
              <div className="bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl p-3 text-center">
                <p className="text-app-accent-primary font-bold text-xl">{sessionStats.xpEarned}</p>
                <p className="text-app-accent-primary/60 text-xs">XP</p>
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-app-text-secondary text-xs">Ð? chính xác</span>
                <span className="text-white font-bold text-sm">{accuracy}%</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${accuracy}%`,
                    backgroundColor: accuracy >= 80 ? "#34d399" : accuracy >= 60 ? "app-accent-primary" : "#f87171",
                  }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setMode("setup")}
                className="flex-1 py-3 rounded-xl border border-app-border text-white/60 text-sm hover:text-white/80 transition-all cursor-pointer whitespace-nowrap"
              >
                V? trang ch?
              </button>
              <button
                onClick={() => startSession(sessionStats.total)}
                className="flex-1 py-3 rounded-xl bg-app-accent-primary/15 border border-app-accent-primary/30 text-app-accent-primary text-sm font-medium hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap"
              >
                Luy?n l?i
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
            className="flex items-center gap-1.5 text-app-text-secondary hover:text-white/60 text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line text-sm"></i>
            </div>
            Thoát
          </button>
          <div className="flex items-center gap-3">
            <span className="text-app-text-secondary text-sm">{currentIdx + 1}/{sessionQuestions.length}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-star-fill text-app-accent-primary text-xs"></i>
              </div>
              <span className="text-app-accent-primary text-sm font-medium">{sessionStats.xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-app-accent-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question card */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl p-6 space-y-4">
          {/* Type badge */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[currentQ.type]}`}>
              {typeLabels[currentQ.type]}
            </span>
            <span className="text-app-text-muted text-xs">{currentQ.bookName} · Bài {currentQ.lessonNumber}</span>
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
              className="flex items-center gap-2 px-3 py-2 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-xl text-white/50 text-sm transition-all cursor-pointer whitespace-nowrap"
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
                  ? "Nh?p câu tr? l?i b?ng ti?ng Hàn..."
                  : currentQ.type === "translate-ko"
                  ? "Nh?p câu tr? l?i b?ng ti?ng Vi?t..."
                  : "Ði?n t? còn thi?u..."
              }
              rows={3}
              className={`w-full rounded-xl px-4 py-3 text-white text-base placeholder-white/20 focus:outline-none resize-none transition-all border ${
                submitted && scoreResult
                  ? scoreColors[scoreResult]
                  : "bg-app-card/50 border-app-border focus:border-white/25"
              }`}
              style={{ fontFamily: currentQ.type !== "translate-ko" ? "'Noto Sans KR', sans-serif" : "inherit" }}
            />
            <p className="text-app-text-muted text-xs mt-1">Nh?n Enter d? n?p bài</p>
          </div>

          {/* Hint */}
          {!submitted && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-app-text-muted hover:text-white/50 text-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-lightbulb-line text-xs"></i>
              </div>
              {showHint ? "?n g?i ý" : "Xem g?i ý"}
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
              <p className="text-app-text-secondary text-xs mb-1">Ðáp án dúng:</p>
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
              className="flex-1 py-3 rounded-xl bg-app-accent-primary/15 border border-app-accent-primary/30 text-app-accent-primary font-medium text-sm hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              N?p bài
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary/15 border border-app-accent-primary/30 text-app-accent-primary font-medium text-sm hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap"
            >
              {currentIdx + 1 >= sessionQuestions.length ? "Xem k?t qu?" : "Câu ti?p theo"}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          )}
        </div>

        {/* Mini stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-2.5 text-center">
            <p className="text-app-accent-success font-bold">{sessionStats.correct}</p>
            <p className="text-app-accent-success/50 text-xs">Ðúng</p>
          </div>
          <div className="flex-1 bg-amber-500/8 border border-amber-500/15 rounded-xl p-2.5 text-center">
            <p className="text-amber-400 font-bold">{sessionStats.partial}</p>
            <p className="text-amber-400/50 text-xs">G?n dúng</p>
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


