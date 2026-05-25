import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { topikQuestions, type TopikQuestion } from "@/mocks/topikQuestions";
import ShareResultCard from "@/components/feature/ShareResultCard";
import { usePageSEO } from "@/hooks/usePageSEO";
import { SITE_URL } from "@/lib/siteConfig";

const TOTAL_TIME = 100 * 60; // 100 phút = 6000 giây
const TOTAL_QUESTIONS = 50;
const LISTENING_COUNT = 30;
const READING_COUNT = 20;

type TestPhase = "intro" | "exam" | "result";

// ─── Timer ────────────────────────────────────────────────────────────────
function useTimer(active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(TOTAL_TIME);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current!); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = (remaining / TOTAL_TIME) * 100;
  const isWarning = remaining < 600; // < 10 phút
  const isDanger = remaining < 180;  // < 3 phút

  return { remaining, minutes, seconds, pct, isWarning, isDanger };
}

// ─── Question Item ────────────────────────────────────────────────────────
function QuestionItem({
  q,
  selectedAnswer,
  onAnswer,
  showResult,
}: {
  q: TopikQuestion;
  selectedAnswer: number | null;
  onAnswer: (idx: number) => void;
  showResult: boolean;
}) {
  const sectionLabel = q.section === "listening" ? "Nghe" : "Đọc";
  const sectionColor = q.section === "listening" ? "#38bdf8" : "#a78bfa";

  return (
    <div id={`q-${q.number}`} className="bg-app-bg border border-app-border rounded-2xl p-5 scroll-mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-app-accent-primary/10 text-app-accent-primary text-sm font-bold flex-shrink-0">{q.number}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sectionColor}15`, color: sectionColor }}>{sectionLabel}</span>
        <span className="text-[10px] text-app-text-muted">{q.points} điểm</span>
        <span className="text-[10px] text-app-text-muted ml-auto">{q.type.replace(/_/g, " ")}</span>
      </div>

      {/* Passage */}
      {q.passage && (
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-3">
          <p className="text-white/60 text-sm whitespace-pre-line leading-relaxed">{q.passage}</p>
          {q.passageVi && <p className="text-app-text-muted text-xs italic mt-1.5 whitespace-pre-line">{q.passageVi}</p>}
        </div>
      )}

      {/* Question */}
      <p className="text-white/80 text-sm font-medium mb-1">{q.question}</p>
      <p className="text-app-text-muted text-xs italic mb-4">{q.questionVi}</p>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = "border-app-border bg-app-surface/50 hover:border-white/15 cursor-pointer";
          if (showResult) {
            if (i === q.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
            else if (i === selectedAnswer && i !== q.correctIndex) cls = "border-red-500/40 bg-red-500/8 cursor-default";
            else cls = "border-app-border opacity-40 cursor-default";
          } else if (selectedAnswer === i) {
            cls = "border-app-accent-primary/40 bg-app-accent-primary/8 cursor-pointer";
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && onAnswer(i)}
              disabled={showResult}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${cls}`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold flex-shrink-0 ${showResult && i === q.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : showResult && i === selectedAnswer ? "bg-red-500/20 text-red-400" : selectedAnswer === i ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted"}`}>
                {["①","②","③","④"][i]}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${showResult && i === q.correctIndex ? "text-app-accent-success font-medium" : showResult && i === selectedAnswer && i !== q.correctIndex ? "text-red-400" : selectedAnswer === i ? "text-app-accent-primary" : "text-white/60"}`}>{opt}</p>
                {q.optionsVi[i] && <p className="text-app-text-muted text-[10px] mt-0.5">{q.optionsVi[i]}</p>}
              </div>
              {showResult && i === q.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success flex-shrink-0"></i>}
              {showResult && i === selectedAnswer && i !== q.correctIndex && <i className="ri-close-circle-fill text-red-400 flex-shrink-0"></i>}
            </button>
          );
        })}
      </div>

      {/* Explanation (result mode) */}
      {showResult && (
        <div className="mt-3 flex items-start gap-2 bg-app-surface/50 rounded-xl p-3">
          <i className="ri-lightbulb-line text-app-accent-primary text-xs flex-shrink-0 mt-0.5"></i>
          <p className="text-app-text-secondary text-xs leading-relaxed">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────
function ResultScreen({
  answers,
  onRetry,
}: {
  answers: Record<string, number>;
  onRetry: () => void;
}) {
  const [showShare, setShowShare] = useState(false);
  const listeningQs = topikQuestions.filter(q => q.section === "listening");
  const readingQs = topikQuestions.filter(q => q.section === "reading");

  const calcScore = (qs: TopikQuestion[]) =>
    qs.reduce((sum, q) => {
      if (answers[q.id] === q.correctIndex) return sum + q.points;
      return sum;
    }, 0);

  const listeningScore = calcScore(listeningQs);
  const readingScore = calcScore(readingQs);
  const totalScore = listeningScore + readingScore;
  const maxListening = listeningQs.reduce((s, q) => s + q.points, 0);
  const maxReading = readingQs.reduce((s, q) => s + q.points, 0);
  const maxTotal = maxListening + maxReading;

  const listeningCorrect = listeningQs.filter(q => answers[q.id] === q.correctIndex).length;
  const readingCorrect = readingQs.filter(q => answers[q.id] === q.correctIndex).length;
  const totalCorrect = listeningCorrect + readingCorrect;

  const pct = Math.round((totalScore / maxTotal) * 100);
  const passed = totalScore >= 80 && listeningScore >= 40 && readingScore >= 40;

  const getGrade = () => {
    if (totalScore >= 140) return { label: "Xuất sắc", color: "#e8c84a" };
    if (totalScore >= 120) return { label: "Giỏi", color: "#34d399" };
    if (totalScore >= 100) return { label: "Khá", color: "#38bdf8" };
    if (totalScore >= 80) return { label: "Đạt", color: "#a78bfa" };
    return { label: "Chưa đạt", color: "#f87171" };
  };
  const grade = getGrade();

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4`} style={{ backgroundColor: `${grade.color}15`, color: grade.color }}>
          <i className={passed ? "ri-trophy-fill" : "ri-close-circle-line"}></i>
          {grade.label} — {passed ? "ĐẠT TOPIK I" : "CHƯA ĐẠT"}
        </div>
        <div className="text-7xl font-black mb-2" style={{ color: grade.color }}>{totalScore}</div>
        <p className="text-app-text-muted text-sm mb-1">/ {maxTotal} điểm</p>
        <p className="text-app-text-muted text-xs">Điều kiện đạt: Tổng ≥ 80 điểm, mỗi phần ≥ 40 điểm</p>

        {/* Progress bar */}
        <div className="mt-6 bg-app-card/50 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: grade.color }}></div>
        </div>
        <p className="text-app-text-muted text-xs mt-2">{pct}% tổng điểm</p>
      </div>

      {/* Section breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Phần Nghe (듣기)", score: listeningScore, max: maxListening, correct: listeningCorrect, total: LISTENING_COUNT, color: "#38bdf8", icon: "ri-headphone-line" },
          { label: "Phần Đọc (읽기)", score: readingScore, max: maxReading, correct: readingCorrect, total: READING_COUNT, color: "#a78bfa", icon: "ri-book-open-line" },
        ].map(sec => {
          const secPassed = sec.score >= 40;
          return (
            <div key={sec.label} className={`bg-app-bg border rounded-2xl p-5 ${secPassed ? "border-app-border" : "border-red-500/20"}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${sec.color}15` }}>
                  <i className={`${sec.icon} text-base`} style={{ color: sec.color }}></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">{sec.label}</p>
                  <p className="text-app-text-muted text-[10px]">{sec.total} câu</p>
                </div>
                <div className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${secPassed ? "bg-emerald-500/10 text-app-accent-success" : "bg-red-500/10 text-red-400"}`}>
                  {secPassed ? "ĐẠT" : "CHƯA ĐẠT"}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: sec.color }}>{sec.score}</div>
              <p className="text-app-text-muted text-xs mb-3">/ {sec.max} điểm · {sec.correct}/{sec.total} câu đúng</p>
              <div className="bg-app-card/50 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(sec.score / sec.max) * 100}%`, backgroundColor: sec.color }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed answers */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <p className="text-white/50 text-sm font-semibold mb-4">Xem lại chi tiết từng câu</p>
        <div className="space-y-4">
          {topikQuestions.map(q => (
            <QuestionItem
              key={q.id}
              q={q}
              selectedAnswer={answers[q.id] ?? null}
              onAnswer={() => {}}
              showResult
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
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
          type="topik"
          score={totalScore}
          total={maxTotal}
          quizType="topik"
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function TopikTestPage() {
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState<"listening" | "reading">("listening");
  const [bestScore, setBestScore] = useLocalStorage<number>("kts_topik1_best", 0);
  const [attemptCount, setAttemptCount] = useLocalStorage<number>("kts_topik1_attempts", 0);

  usePageSEO({
    title: "Thi thử TOPIK I online — 50 câu, 100 phút | Hàn Quốc Ơi!",
    description: "Thi thử TOPIK I miễn phí: 50 câu nghe + đọc trong 100 phút. Đúng format đề thi TOPIK I chính thức, có đáp án và giải thích. Dành cho người mới đến trung cấp.",
    keywords: "thi thử TOPIK I, đề TOPIK 1, thi TOPIK online, luyện thi TOPIK, đề thi tiếng Hàn TOPIK",
    path: "/topik-test",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Thi thử TOPIK I online",
      description: "Bài thi thử TOPIK I 50 câu trong 100 phút theo chuẩn đề chính thức.",
      educationalLevel: "TOPIK I",
      learningResourceType: "Practice Exam",
      inLanguage: ["ko", "vi"],
      timeRequired: "PT100M",
      numberOfQuestions: 50,
      isAccessibleForFree: true,
      provider: {
        "@type": "EducationalOrganization",
        name: "Hàn Quốc Ơi!",
        url: SITE_URL,
      },
    },
  });

  const handleExpire = useCallback(() => {
    setPhase("result");
    const total = topikQuestions.reduce((sum, q) => answers[q.id] === q.correctIndex ? sum + q.points : sum, 0);
    if (total > bestScore) setBestScore(total);
    setAttemptCount(c => c + 1);
  }, [answers, bestScore]);

  const { minutes, seconds, pct, isWarning, isDanger } = useTimer(phase === "exam", handleExpire);

  const handleStart = () => {
    setAnswers({});
    setCurrentSection("listening");
    setPhase("exam");
  };

  const handleAnswer = (qId: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = () => {
    setPhase("result");
    const total = topikQuestions.reduce((sum, q) => answers[q.id] === q.correctIndex ? sum + q.points : sum, 0);
    if (total > bestScore) setBestScore(total);
    setAttemptCount(c => c + 1);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentSection("listening");
    setPhase("intro");
  };

  const answeredCount = Object.keys(answers).length;
  const listeningAnswered = topikQuestions.filter(q => q.section === "listening" && answers[q.id] !== undefined).length;
  const readingAnswered = topikQuestions.filter(q => q.section === "reading" && answers[q.id] !== undefined).length;

  const displayedQuestions = topikQuestions.filter(q => q.section === currentSection);

  // ── Intro ──
  if (phase === "intro") {
    return (
      <DashboardLayout title="Thi thử TOPIK I" subtitle="Format chuẩn — 50 câu, 100 phút, phân tích kết quả chi tiết">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Hero */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-4">
              <i className="ri-file-list-3-line text-app-accent-primary text-3xl"></i>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">TOPIK I</h2>
            <p className="text-app-text-secondary text-sm mb-6">한국어능력시험 — Kỳ thi năng lực tiếng Hàn</p>
            {bestScore > 0 && (
              <div className="inline-flex items-center gap-2 bg-app-accent-primary/8 border border-app-accent-primary/15 rounded-xl px-4 py-2 mb-4">
                <i className="ri-trophy-line text-app-accent-primary text-sm"></i>
                <span className="text-app-accent-primary text-sm font-semibold">Điểm cao nhất: {bestScore} điểm</span>
                <span className="text-app-text-muted text-xs">({attemptCount} lần thi)</span>
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "ri-time-line", label: "Thời gian", value: "100 phút", color: "#e8c84a" },
              { icon: "ri-question-line", label: "Số câu hỏi", value: "50 câu", color: "#34d399" },
              { icon: "ri-headphone-line", label: "Phần Nghe", value: "30 câu", color: "#38bdf8" },
              { icon: "ri-book-open-line", label: "Phần Đọc", value: "20 câu", color: "#a78bfa" },
              { icon: "ri-bar-chart-line", label: "Điểm tối đa", value: "200 điểm", color: "#fb923c" },
              { icon: "ri-checkbox-circle-line", label: "Điểm đạt", value: "≥ 80 điểm", color: "#f472b6" },
            ].map(info => (
              <div key={info.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${info.color}15` }}>
                  <i className={`${info.icon} text-base`} style={{ color: info.color }}></i>
                </div>
                <div>
                  <p className="text-app-text-secondary text-[10px]">{info.label}</p>
                  <p className="text-white font-bold text-sm">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white/50 text-sm font-semibold mb-3">Lưu ý trước khi thi</p>
            <ul className="space-y-2">
              {[
                "Mỗi câu có 4 lựa chọn, chỉ có 1 đáp án đúng",
                "Phần nghe: đọc kỹ hội thoại/đoạn văn được cung cấp",
                "Điều kiện đạt: Tổng ≥ 80 điểm VÀ mỗi phần ≥ 40 điểm",
                "Có thể chuyển qua lại giữa phần Nghe và Đọc",
                "Kết quả sẽ được phân tích chi tiết sau khi nộp bài",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-app-text-secondary text-xs">
                  <i className="ri-checkbox-blank-circle-fill text-app-accent-primary/40 text-[6px] mt-1.5 flex-shrink-0"></i>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-black text-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-fill mr-2"></i>Bắt đầu thi
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Result ──
  if (phase === "result") {
    return (
      <DashboardLayout title="Kết quả TOPIK I" subtitle="Phân tích chi tiết theo từng phần">
        <ResultScreen answers={answers} onRetry={handleRetry} />
      </DashboardLayout>
    );
  }

  // ── Exam ──
  return (
    <DashboardLayout
      title="Thi thử TOPIK I"
      subtitle={`${answeredCount}/${TOTAL_QUESTIONS} câu đã trả lời`}
      actions={
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-send-plane-fill"></i>
          Nộp bài ({answeredCount}/{TOTAL_QUESTIONS})
        </button>
      }
    >
      {/* Timer bar */}
      <div className={`sticky top-0 z-10 bg-[#0a0c10]/95 backdrop-blur-sm border-b mb-5 py-3 px-1 -mx-1 ${isDanger ? "border-red-500/30" : isWarning ? "border-app-accent-primary/20" : "border-app-border"}`}>
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${isDanger ? "border-red-500/30 bg-red-500/8 text-red-400" : isWarning ? "border-app-accent-primary/25 bg-app-accent-primary/8 text-app-accent-primary" : "border-app-border bg-app-surface/50 text-white/70"}`}>
            <i className={`ri-time-line text-base ${isDanger ? "animate-pulse" : ""}`}></i>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-app-text-muted text-[10px]">Thời gian còn lại</span>
              <span className="text-app-text-muted text-[10px]">{Math.round(pct)}%</span>
            </div>
            <div className="bg-app-card/50 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isDanger ? "#f87171" : isWarning ? "#e8c84a" : "#34d399" }}></div>
            </div>
          </div>

          {/* Section progress */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#38bdf8]/70">Nghe: {listeningAnswered}/{LISTENING_COUNT}</span>
            <span className="text-[#a78bfa]/70">Đọc: {readingAnswered}/{READING_COUNT}</span>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center bg-app-card/50 rounded-xl p-1 mb-5 w-fit">
        {(["listening", "reading"] as const).map(sec => (
          <button
            key={sec}
            onClick={() => setCurrentSection(sec)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${currentSection === sec ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={sec === "listening" ? "ri-headphone-line" : "ri-book-open-line"}></i>
            {sec === "listening" ? `Phần Nghe (${listeningAnswered}/${LISTENING_COUNT})` : `Phần Đọc (${readingAnswered}/${READING_COUNT})`}
          </button>
        ))}
      </div>

      {/* Question navigator */}
      <div className="flex flex-wrap gap-1.5 mb-5 bg-app-bg border border-app-border rounded-xl p-3">
        {displayedQuestions.map(q => {
          const isAnswered = answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              onClick={() => document.getElementById(`q-${q.number}`)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${isAnswered ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-muted hover:bg-app-card/70"}`}
            >
              {q.number}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {displayedQuestions.map(q => (
          <QuestionItem
            key={q.id}
            q={q}
            selectedAnswer={answers[q.id] ?? null}
            onAnswer={idx => handleAnswer(q.id, idx)}
            showResult={false}
          />
        ))}
      </div>

      {/* Bottom submit */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base px-10 py-4 rounded-2xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-send-plane-fill"></i>
          Nộp bài ({answeredCount}/{TOTAL_QUESTIONS} câu)
        </button>
      </div>
    </DashboardLayout>
  );
}


