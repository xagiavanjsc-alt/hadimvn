import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { EPS_EXAMS, EPSExam, EPSQuestion } from "@/data/epsExams";
import { useXPSystem } from "@/hooks/useXPSystem";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useEpsExamList } from "@/hooks/useEpsExams";
import ShareResultCard from "@/components/feature/ShareResultCard";

interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
}

interface ExamResult {
  examId: string;
  score: number;
  total: number;
  answers: UserAnswer[];
  timeSpent: number; // in seconds
  completedAt: string;
  questionTimes: Record<string, number>; // time spent per question
  readingScore: number;
  listeningScore: number;
}

export default function EPSExamsPage() {
  // Overlay DB titles lên 2 đề tĩnh — admin có thể đổi tên qua /admin/eps-exam-manager.
  // Đề tĩnh eps_01 / eps_02 ↔ DB slug eps-de-1 / eps-de-2 (seed bởi migration 122).
  const { exams: dbExams } = useEpsExamList();
  const dbBySlug = useMemo(() => new Map(dbExams.map(e => [e.slug, e])), [dbExams]);
  const mergedExams: EPSExam[] = useMemo(() => {
    const slugFor: Record<string, string> = { eps_01: "eps-de-1", eps_02: "eps-de-2" };
    return EPS_EXAMS.map(e => {
      const db = dbBySlug.get(slugFor[e.id] ?? "");
      return db ? { ...e, title: db.title } : e;
    });
  }, [dbBySlug]);

  usePageSEO({
    title: "Đề Thi EPS-TOPIK 2025 Có Đáp Án — Luyện Thi XKLĐ Hàn Quốc | Hàn Quốc Ơi!",
    description: "Bộ đề thi EPS-TOPIK 2025 chính thức có đáp án và audio. Luyện thi miễn phí đi XKLĐ Hàn Quốc. Đầy đủ 40 câu nghe + đọc, giải thích chi tiết tiếng Việt.",
    keywords: "đề thi EPS 2025, đề thi EPS-TOPIK, đề EPS có đáp án, luyện thi EPS, XKLĐ Hàn Quốc, thi EPS-TOPIK 2026",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Đề thi EPS-TOPIK 2025",
      description: "Danh sách đề thi EPS-TOPIK chính thức có đáp án.",
      numberOfItems: mergedExams.length,
      itemListElement: mergedExams.map((exam, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Quiz",
          name: exam.title,
          numberOfQuestions: exam.questions?.length || 40,
          isAccessibleForFree: true,
        },
      })),
    },
  });

  const navigate = useNavigate();
  const { awardXP } = useXPSystem();
  const [selectedExam, setSelectedExam] = useState<EPSExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showShare, setShowShare] = useState(false);
  const [history, setHistory] = useState<Array<{ date: string; score: number; reading: number; listening: number }>>([]);
  const [navigatorFilter, setNavigatorFilter] = useState<"all" | "reading" | "listening">("all");

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = (exam: EPSExam) => {
    setSelectedExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(exam.duration * 60);
    setIsTimerRunning(true);
    setShowResult(false);
    setExamResult(null);
    setReviewMode(false);
    setQuestionTimes({});
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (questionId: string, selectedOption: number) => {
    // Track time spent on this question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    setQuestionTimes(prev => ({ ...prev, [questionId]: timeSpent }));
    setQuestionStartTime(Date.now());

    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, selectedOption } : a);
      }
      return [...prev, { questionId, selectedOption }];
    });
  };

  const handleNextQuestion = () => {
    if (selectedExam && currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    if (!selectedExam) return;

    setIsTimerRunning(false);

    let correctCount = 0;
    let readingCorrect = 0;
    let listeningCorrect = 0;
    const processedAnswers = selectedExam.questions.map(q => {
      const userAnswer = answers.find(a => a.questionId === q.id);
      const isCorrect = userAnswer && userAnswer.selectedOption === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
        if (q.section === "reading") readingCorrect++;
        if (q.section === "listening") listeningCorrect++;
      }
      return {
        questionId: q.id,
        selectedOption: userAnswer?.selectedOption || null
      };
    });

    const readingQuestions = selectedExam.questions.filter(q => q.section === "reading");
    const listeningQuestions = selectedExam.questions.filter(q => q.section === "listening");
    const readingScore = readingCorrect;
    const listeningScore = listeningCorrect;

    const result: ExamResult = {
      examId: selectedExam.id,
      score: correctCount,
      total: selectedExam.questions.length,
      answers: processedAnswers,
      timeSpent: selectedExam.duration * 60 - timeRemaining,
      completedAt: new Date().toISOString(),
      questionTimes,
      readingScore,
      listeningScore
    };

    setExamResult(result);
    setShowResult(true);

    // Award XP
    const percentage = (correctCount / selectedExam.questions.length) * 100;
    let xpAmount = 0;
    if (percentage >= 80) xpAmount = 50;
    else if (percentage >= 60) xpAmount = 30;
    else if (percentage >= 40) xpAmount = 15;
    else xpAmount = 5;

    awardXP({
      type: "manual_bonus",
      amount: xpAmount,
      meta: { reason: `EPS Exam: ${selectedExam.title} (${percentage.toFixed(0)}%)` }
    });

    // Save to history
    setHistory(prev => [...prev.slice(-9), {
      date: new Date().toISOString(),
      score: correctCount,
      reading: readingScore,
      listening: listeningScore
    }]);

    // Save to localStorage
    const legacyHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.EPS_EXAM_HISTORY_LEGACY) || "[]");
    legacyHistory.push(result);
    localStorage.setItem(STORAGE_KEYS.EPS_EXAM_HISTORY_LEGACY, JSON.stringify(legacyHistory));
  };

  const handleBackToSelection = () => {
    setSelectedExam(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(0);
    setShowResult(false);
    setExamResult(null);
    setReviewMode(false);
    setQuestionTimes({});
    setQuestionStartTime(0);
  };

  const handleRetry = () => {
    if (selectedExam) {
      handleStartExam(selectedExam);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { label: "Xuất sắc", color: "#e8c84a" };
    if (percentage >= 75) return { label: "Giỏi", color: "#34d399" };
    if (percentage >= 60) return { label: "Khá", color: "#38bdf8" };
    if (percentage >= 40) return { label: "Đạt", color: "#a78bfa" };
    return { label: "Cần cố gắng", color: "#f87171" };
  };

  const currentQuestion = selectedExam?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.find(a => a.questionId === currentQuestion.id) : null;

  const EXAM_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
    eps_01: { color: "#4ade80", bg: "rgba(74,222,128,0.08)", icon: "ri-headphone-line" },
    eps_02: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", icon: "ri-file-list-3-line" },
    default: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", icon: "ri-file-list-3-line" },
  };

  if (!selectedExam) {
    return (
      <DashboardLayout title="Bộ đề EPS" subtitle="Luyện thi EPS-TOPIK chuẩn">
        <div className="max-w-2xl">
          <p className="text-app-text-secondary text-xs mb-3">Chọn đề để bắt đầu</p>
          <div className="flex flex-col gap-3">
            {mergedExams.map(exam => {
              const c = EXAM_COLORS[exam.id] ?? EXAM_COLORS.default;
              return (
                <button
                  key={exam.id}
                  onClick={() => handleStartExam(exam)}
                  className="w-full p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ backgroundColor: c.bg, borderColor: c.color + "30" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: c.color + "20" }}>
                      <i className={`${c.icon} text-xl`} style={{ color: c.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{exam.title}</p>
                      <p className="text-app-text-secondary text-xs mt-0.5">
                        {exam.questionCount ?? exam.questions.length} câu · {exam.duration} phút · Audio TTS
                      </p>
                    </div>
                    <i className="ri-arrow-right-line text-sm flex-shrink-0" style={{ color: c.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (showResult && examResult) {
    const percentage = (examResult.score / examResult.total) * 100;
    const grade = getGrade(percentage);
    const readingQuestions = selectedExam.questions.filter(q => q.section === "reading");
    const listeningQuestions = selectedExam.questions.filter(q => q.section === "listening");
    const readingPct = Math.round((examResult.readingScore / readingQuestions.length) * 100);
    const listeningPct = Math.round((examResult.listeningScore / listeningQuestions.length) * 100);

    return (
      <DashboardLayout title={`Kết quả ${selectedExam.title}`} subtitle="Phân tích chi tiết theo từng phần">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score card */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4`} style={{ backgroundColor: `${grade.color}15`, color: grade.color }}>
              <i className="ri-trophy-fill"></i>
              {grade.label}
            </div>
            <div className="text-7xl font-black mb-2" style={{ color: grade.color }}>{percentage.toFixed(0)}%</div>
            <p className="text-app-text-muted text-sm mb-1">{examResult.score}/{examResult.total} câu đúng</p>
            <p className="text-app-text-muted text-xs">Thời gian: {formatTime(examResult.timeSpent)}</p>

            {/* Progress bar */}
            <div className="mt-6 bg-app-card/50 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: grade.color }}></div>
            </div>
          </div>

          {/* Section breakdown */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Đọc hiểu (Q1-20)", score: examResult.readingScore, max: readingQuestions.length, pct: readingPct, color: "#a78bfa", icon: "ri-book-open-line" },
              { label: "Nghe (Q21-40)", score: examResult.listeningScore, max: listeningQuestions.length, pct: listeningPct, color: "#38bdf8", icon: "ri-headphone-line" },
            ].map(sec => {
              const isWeak = sec.pct < 60;
              return (
                <div key={sec.label} className={`bg-app-bg border rounded-2xl p-5 ${isWeak ? "border-red-500/20" : "border-app-border"}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${sec.color}15` }}>
                      <i className={`${sec.icon} text-base`} style={{ color: sec.color }}></i>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">{sec.label}</p>
                      <p className="text-app-text-muted text-[10px]">{sec.max} câu</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: sec.color }}>{sec.score}/{sec.max}</div>
                  <p className="text-app-text-muted text-xs mb-3">{sec.pct}% đúng</p>
                  <div className="bg-app-card/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sec.pct}%`, backgroundColor: sec.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weak areas */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white/50 text-sm font-semibold mb-4">Khu vực yếu cần cải thiện</p>
            <div className="space-y-2">
              {[
                { label: "Đọc hiểu", correct: examResult.readingScore, total: readingQuestions.length, color: "#a78bfa" },
                { label: "Nghe hiểu", correct: examResult.listeningScore, total: listeningQuestions.length, color: "#38bdf8" },
              ].map(item => {
                const pct = Math.round((item.correct / item.total) * 100);
                const isWeak = pct < 60;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs w-20" style={{ color: isWeak ? "#f87171" : "var(--admin-text-muted)" }}>{item.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-app-card/50">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }}></div>
                    </div>
                    <span className="text-xs" style={{ color: isWeak ? "#f87171" : "var(--admin-text-muted)" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress history */}
          {history.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white/50 text-sm font-semibold mb-4">Lịch sử điểm số (10 lần gần nhất)</p>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-app-text-faint w-24">{new Date(h.date).toLocaleDateString("vi-VN")}</span>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-app-card/50">
                        <div className="h-full rounded-full" style={{ width: `${(h.reading / 20) * 100}%`, backgroundColor: "#a78bfa" }}></div>
                      </div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-app-card/50">
                        <div className="h-full rounded-full" style={{ width: `${(h.listening / 20) * 100}%`, backgroundColor: "#38bdf8" }}></div>
                      </div>
                    </div>
                    <span className="text-app-text-muted w-12 text-right">{h.score}/40</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setReviewMode(true)}
              className="flex-1 py-4 rounded-2xl bg-app-card text-white font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-eye-line mr-2"></i>Xem lại đáp án
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-2"></i>Thi lại
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-[#34d399]/25 bg-[#34d399]/10 hover:bg-[#34d399]/20 text-[#34d399] font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-share-line"></i>Chia sẻ
            </button>
          </div>
          {showShare && (
            <ShareResultCard
              type="eps"
              score={examResult.score}
              total={examResult.total}
              quizType="eps"
              onClose={() => setShowShare(false)}
            />
          )}

          {/* Review mode */}
          {reviewMode && (
            <div className="space-y-4 mt-6">
              <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                <p className="text-white/50 text-sm font-semibold mb-4">Xem lại chi tiết từng câu</p>
                <div className="space-y-4">
                  {selectedExam.questions.map((q, idx) => {
                    const userAnswer = examResult.answers.find(a => a.questionId === q.id);
                    const isCorrect = userAnswer?.selectedOption === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className={`bg-app-card border rounded-xl p-4 ${
                          isCorrect ? "border-emerald-500/20" : "border-rose-500/20"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span className={`text-2xl font-bold ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                            {isCorrect ? "✓" : "✗"}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-3">
                              Câu {q.number}: {q.question}
                            </p>
                            {q.audio && (
                              <audio controls className="w-full max-w-sm mb-3">
                                <source src={q.audio} type="audio/mpeg" />
                                Trình duyệt của bạn không hỗ trợ phát âm thanh.
                              </audio>
                            )}
                            {q.image && !q.optionImages && (
                              <img loading="lazy" decoding="async" src={q.image} alt="" className="max-w-xs rounded-lg mb-3" />
                            )}
                            {q.optionImages ? (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {q.optionImages.map((src, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`relative rounded-xl overflow-hidden border-4 ${
                                      optIdx === q.correctAnswer
                                        ? "border-emerald-500"
                                        : optIdx === userAnswer?.selectedOption
                                        ? "border-rose-500"
                                        : "border-transparent opacity-50"
                                    }`}
                                  >
                                    <img loading="lazy" decoding="async" src={src} alt={`Option ${optIdx + 1}`} className="w-full object-contain bg-white" style={{ maxHeight: "120px" }} />
                                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      optIdx === q.correctAnswer ? "bg-emerald-500 text-white"
                                      : optIdx === userAnswer?.selectedOption ? "bg-rose-500 text-white"
                                      : "bg-black/40 text-white"
                                    }`}>{optIdx + 1}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-lg ${
                                      optIdx === q.correctAnswer
                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                        : optIdx === userAnswer?.selectedOption
                                        ? "bg-rose-500/10 border border-rose-500/20"
                                        : "bg-app-card2"
                                    }`}
                                  >
                                    <span className="text-app-text-secondary mr-2">{optIdx + 1}.</span>
                                    <span className={optIdx === q.correctAnswer ? "text-emerald-400" : "text-white"}>
                                      {opt}
                                    </span>
                                    {optIdx === q.correctAnswer && (
                                      <span className="text-emerald-400 ml-2">(Đáp án đúng)</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.explanation && (
                              <p className="text-app-text-faint text-sm mt-3">
                                Giải thích: {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={selectedExam.title} subtitle={`Câu ${currentQuestionIndex + 1}/${selectedExam.questions.length}`}>
      {/* Section Tags */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setCurrentQuestionIndex(0)}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
            currentQuestionIndex < 20
              ? "bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white shadow-lg shadow-app-accent-primary/25"
              : "bg-gradient-to-r from-app-card to-app-card2 text-app-text-secondary border border-app-border hover:text-white"
          }`}
        >
          <i className="ri-book-open-line mr-2" />
          Đọc hiểu (1-20)
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(20)}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
            currentQuestionIndex >= 20
              ? "bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white shadow-lg shadow-app-accent-primary/25"
              : "bg-gradient-to-r from-app-card to-app-card2 text-app-text-secondary border border-app-border hover:text-white"
          }`}
        >
          <i className="ri-headphone-line mr-2" />
          Nghe (21-40)
        </button>
      </div>

      {/* Timer and Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 ${
            timeRemaining < 300
              ? "bg-rose-500/10 text-rose-400 border-2 border-rose-500/20 animate-pulse"
              : "bg-gradient-to-r from-app-card to-app-card2 text-white border border-app-border"
          }`}>
            <i className="ri-time-line" />
            {formatTime(timeRemaining)}
          </div>
          <div className="bg-gradient-to-r from-app-card to-app-card2 px-6 py-3 rounded-xl text-white font-bold border border-app-border">
            Câu {currentQuestionIndex + 1} / {selectedExam.questions.length}
          </div>
        </div>
        <button
          onClick={handleSubmitExam}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25"
        >
          Nộp bài
        </button>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-gradient-to-br from-app-card to-app-card2 border border-app-border rounded-3xl p-8 mb-6 shadow-xl">
          {currentQuestion.audio && (
            <div className="mb-6">
              <audio controls className="w-full max-w-md mx-auto">
                <source src={currentQuestion.audio} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát âm thanh.
              </audio>
            </div>
          )}
          {currentQuestion.image && !currentQuestion.optionImages && (
            <div className="mb-6">
              <img loading="lazy" decoding="async"
                src={currentQuestion.image}
                alt=""
                className="max-w-2xl rounded-2xl mx-auto shadow-2xl"
              />
            </div>
          )}
          <p className="text-white text-xl font-medium mb-8 leading-relaxed">
            {currentQuestion.question}
          </p>
          
          {currentQuestion.optionImages ? (
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.optionImages.map((src, idx) => {
                const isSelected = currentAnswer?.selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, idx)}
                    className={`relative rounded-2xl overflow-hidden border-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-app-accent-primary shadow-lg shadow-app-accent-primary/30"
                        : "border-transparent hover:border-app-accent-primary/40"
                    }`}
                  >
                    <img loading="lazy" decoding="async" src={src} alt={`Option ${idx + 1}`} className="w-full object-contain bg-white" style={{ maxHeight: "180px" }} />
                    <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow ${
                      isSelected ? "bg-app-accent-primary text-app-bg" : "bg-black/50 text-white"
                    }`}>
                      {idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion.id, idx)}
                  className={`w-full p-5 rounded-2xl text-left transition-all font-medium text-lg ${
                    currentAnswer?.selectedOption === idx
                      ? "bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white border-2 border-app-accent-primary shadow-lg shadow-app-accent-primary/25"
                      : "bg-app-card text-app-text-secondary hover:bg-app-card2 hover:text-white border-2 border-transparent"
                  }`}
                >
                  <span className="font-bold mr-4 text-xl">{idx + 1}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-card to-app-card2 text-white font-bold hover:from-app-card2 hover:to-app-card transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
        >
          <i className="ri-arrow-left-line text-xl" />
          Câu trước
        </button>
        
        {currentQuestionIndex === selectedExam.questions.length - 1 ? (
          <button
            onClick={handleSubmitExam}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25 flex items-center gap-3"
          >
            Nộp bài
            <i className="ri-check-line text-xl" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white font-bold hover:from-app-accent-primary/90 hover:to-app-accent-primary/70 transition-all shadow-lg shadow-app-accent-primary/25 flex items-center gap-3"
          >
            Câu tiếp
            <i className="ri-arrow-right-line text-xl" />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-gradient-to-br from-app-card to-app-card2 border border-app-border rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-app-text-secondary text-sm font-medium">Danh sách câu hỏi</p>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "reading", label: "Đọc (1-20)" },
              { key: "listening", label: "Nghe (21-40)" },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setNavigatorFilter(filter.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  navigatorFilter === filter.key
                    ? "bg-app-accent-primary text-app-bg"
                    : "bg-app-card text-app-text-secondary hover:bg-app-card2"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedExam.questions
            .filter(q => {
              if (navigatorFilter === "all") return true;
              return q.section === navigatorFilter;
            })
            .map((q, idx) => {
              const originalIdx = selectedExam.questions.findIndex(sq => sq.id === q.id);
              const answered = answers.find(a => a.questionId === q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(originalIdx)}
                  className={`w-12 h-12 rounded-xl font-bold transition-all text-lg ${
                    originalIdx === currentQuestionIndex
                      ? "bg-gradient-to-r from-app-accent-primary to-app-accent-primary/80 text-white shadow-lg shadow-app-accent-primary/25"
                      : answered
                      ? "bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/20"
                      : "bg-app-card text-app-text-secondary hover:bg-app-card2 border-2 border-transparent"
                  }`}
                >
                  {originalIdx + 1}
                </button>
              );
            })}
        </div>
      </div>
    </DashboardLayout>
  );
}
