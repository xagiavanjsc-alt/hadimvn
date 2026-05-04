import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useStudySync } from "@/hooks/useStudySync";
import { generateQuiz, type QuizQuestion, type AIConfig } from "@/services/aiService";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";
import ShareResultCard from "@/components/feature/ShareResultCard";

// --- TTS ------------------------------------------------------------------
function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

// --- Quiz Question Component ----------------------------------------------
function QuizCard({ q, index, total, onAnswer, answered }: {
  q: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (idx: number) => void;
  answered: number | null;
}) {
  const isCorrect = (i: number) => i === q.correctIndex;
  const typeLabel = q.type === "vocab" ? "T? v?ng" : q.type === "grammar" ? "Ng? pháp" : "Ði?n vào ch? tr?ng";
  const typeColor = q.type === "vocab" ? "app-accent-primary" : q.type === "grammar" ? "#a78bfa" : "#34d399";

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || answered !== null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 30 && dy < 60) {
      setSwipeDir(dx > 0 ? "right" : "left");
    } else {
      setSwipeDir(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setSwipeDir(null);
    if (touchStartX.current === null || answered !== null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    touchStartX.current = null;
    touchStartY.current = null;
    // Swipe right = option A (0), swipe left = option B (1) — just a quick pick shortcut
    if (Math.abs(dx) > 80 && dy < 80) {
      if (dx > 0 && q.options.length > 0) onAnswer(0);
      else if (dx < 0 && q.options.length > 1) onAnswer(1);
    }
  };

  return (
    <div
      className="bg-app-bg border border-app-border rounded-2xl p-6 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe direction indicator */}
      {swipeDir && (
        <div className={`absolute inset-y-0 ${swipeDir === "right" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"} from-[app-accent-primary]/10 to-transparent w-24 pointer-events-none transition-opacity`} />
      )}

      {/* Mobile swipe hint */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-white/15 mb-3 md:hidden">
        <i className="ri-arrow-left-right-line"></i>
        <span>Vu?t trái/ph?i d? ch?n nhanh A/B</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>
            {typeLabel}
          </span>
          {q.word && (
            <button
              onClick={() => speakKorean(q.word!)}
              className="flex items-center gap-1 text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer transition-colors"
            >
              <i className="ri-volume-up-line text-xs"></i>
              {q.word}
            </button>
          )}
        </div>
        <span className="text-app-text-muted text-xs">{index + 1} / {total}</span>
      </div>

      {/* Question */}
      <p className="text-white font-semibold text-base leading-relaxed mb-6">{q.question}</p>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          let style = "border-app-border bg-app-surface/50 text-white/70 hover:border-white/15 hover:bg-app-card/50";
          if (answered !== null) {
            if (i === q.correctIndex) style = "border-emerald-500/40 bg-emerald-500/10 text-app-accent-success";
            else if (i === answered && answered !== q.correctIndex) style = "border-red-500/40 bg-red-500/10 text-red-400";
            else style = "border-app-border bg-white/2 text-app-text-muted";
          }
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left text-sm font-medium ${style} ${answered === null ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className="w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: answered !== null && i === q.correctIndex ? "#34d39920" : answered !== null && i === answered ? "#f8717120" : "rgba(255,255,255,0.05)",
                  color: answered !== null && i === q.correctIndex ? "#34d399" : answered !== null && i === answered ? "#f87171" : "rgba(255,255,255,0.3)",
                }}
              >
                {["A", "B", "C", "D"][i]}
              </span>
              {opt}
              {answered !== null && i === q.correctIndex && (
                <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto flex-shrink-0"></i>
              )}
              {answered !== null && i === answered && answered !== q.correctIndex && (
                <i className="ri-close-circle-fill text-red-400 ml-auto flex-shrink-0"></i>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered !== null && (
        <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${answered === q.correctIndex ? "border-emerald-500/20 bg-emerald-500/5 text-app-accent-success/80" : "border-red-500/20 bg-red-500/5 text-red-400/80"}`}>
          <div className="flex items-start gap-2">
            <i className={`${answered === q.correctIndex ? "ri-lightbulb-line" : "ri-information-line"} text-sm flex-shrink-0 mt-0.5`}></i>
            <p>{q.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Result Screen --------------------------------------------------------
function QuizResult({ score, total, questions, answers, onRetry, onNew, lessonTitle }: {
  score: number; total: number;
  questions: QuizQuestion[];
  answers: (number | null)[];
  onRetry: () => void;
  onNew: () => void;
  lessonTitle?: string;
}) {
  const [showShare, setShowShare] = useState(false);
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? { label: "Xu?t s?c!", color: "#34d399", icon: "ri-trophy-line" }
    : pct >= 60 ? { label: "Khá t?t!", color: "app-accent-primary", icon: "ri-medal-line" }
    : { label: "C?n ôn thêm!", color: "#fb923c", icon: "ri-refresh-line" };

  return (
    <>
    <div className="bg-app-bg border border-app-border rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
          <i className={`${grade.icon} text-4xl`} style={{ color: grade.color }}></i>
        </div>
        <h2 className="text-white font-bold text-2xl mb-1">{grade.label}</h2>
        <p className="text-app-text-secondary text-sm mb-4">
          B?n tr? l?i dúng <span className="font-bold" style={{ color: grade.color }}>{score}/{total}</span> câu ({pct}%)
        </p>
        <div className="w-full max-w-xs mx-auto h-2 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: grade.color }} />
        </div>
      </div>

      {/* Review */}
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {questions.map((q, i) => {
          const correct = answers[i] === q.correctIndex;
          return (
            <div key={q.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${correct ? "border-emerald-500/15 bg-emerald-500/5" : "border-red-500/15 bg-red-500/5"}`}>
              <i className={`${correct ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"} text-sm flex-shrink-0 mt-0.5`}></i>
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-xs leading-relaxed truncate">{q.question}</p>
                {!correct && (
                  <p className="text-app-accent-success/70 text-[10px] mt-0.5">Ðáp án dúng: {q.options[q.correctIndex]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mb-3">
        <button onClick={onRetry} className="flex-1 py-3 rounded-xl border border-app-border text-white/60 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">
          Làm l?i
        </button>
        <button onClick={onNew} className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap">
          Quiz m?i
        </button>
      </div>
      <button
        onClick={() => setShowShare(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#34d399]/20 bg-[#34d399]/8 hover:bg-[#34d399]/15 text-[#34d399] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
      >
        <i className="ri-share-line"></i>Chia s? k?t qu?
      </button>
    </div>
    {showShare && (
      <ShareResultCard
        type="quiz"
        score={score}
        total={total}
        quizType="kpop"
        onClose={() => setShowShare(false)}
      />
    )}
    </>
  );
}

// --- EPS Weak Topic Quiz --------------------------------------------------
function EpsWeakQuiz({ weakTopicId, onBack }: { weakTopicId: string; onBack: () => void }) {
  const [answeredMap, setAnsweredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone] = useState(false);

  const questions = useMemo(() => {
    const topicQs = epsQuestions.filter(q => q.topic === weakTopicId);
    // Prioritize unanswered or wrong ones
    const wrong = topicQs.filter(q => answeredMap[q.id] !== undefined && answeredMap[q.id] !== q.correctIndex);
    const unanswered = topicQs.filter(q => answeredMap[q.id] === undefined);
    const correct = topicQs.filter(q => answeredMap[q.id] === q.correctIndex);
    return [...wrong, ...unanswered, ...correct].slice(0, 10);
  }, [weakTopicId, answeredMap]);

  const currentQ = questions[currentIdx];
  const answered = sessionAnswers[currentQ?.id ?? ""] ?? null;
  const score = questions.filter(q => sessionAnswers[q.id] === q.correctIndex).length;

  const handleAnswer = (i: number) => {
    if (!currentQ || answered !== null) return;
    setSessionAnswers(prev => ({ ...prev, [currentQ.id]: i }));
    setAnsweredMap(prev => ({ ...prev, [currentQ.id]: i }));
  };

  if (done || (currentIdx >= questions.length && questions.length > 0)) {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
    return (
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${color}15` }}>
          <i className={`${pct >= 80 ? "ri-trophy-line" : "ri-refresh-line"} text-2xl`} style={{ color }}></i>
        </div>
        <p className="text-white font-bold text-xl mb-1">{pct >= 80 ? "Xu?t s?c!" : "C?n ôn thêm!"}</p>
        <p className="text-app-text-secondary text-sm mb-5">{score}/{questions.length} câu dúng ({pct}%)</p>
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-app-border text-white/60 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50">
            Ch?n ch? d? khác
          </button>
          <button onClick={() => { setSessionAnswers({}); setCurrentIdx(0); setDone(false); }} className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">
            Làm l?i
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const topic = EPS_TOPICS.find(t => t.id === weakTopicId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{currentIdx + 1}/{questions.length}</span>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        {topic && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>
              <i className={`${topic.icon} mr-1`}></i>{topic.label}
            </span>
            {currentQ.audioText && (
              <button onClick={() => { const u = new SpeechSynthesisUtterance(currentQ.audioText!); u.lang = "ko-KR"; u.rate = 0.8; window.speechSynthesis.speak(u); }}
                className="ml-auto text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer flex items-center gap-1">
                <i className="ri-volume-up-line"></i>Nghe
              </button>
            )}
          </div>
        )}
        <p className="text-white font-semibold text-sm leading-relaxed mb-1">{currentQ.question}</p>
        <p className="text-app-text-secondary text-xs italic mb-4">{currentQ.questionVi}</p>
        <div className="space-y-2">
          {currentQ.options.map((opt, i) => {
            let cls = "border-app-border bg-app-surface/50 hover:border-white/15 cursor-pointer";
            if (answered !== null) {
              if (i === currentQ.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/10 cursor-default";
              else if (i === answered) cls = "border-red-500/40 bg-red-500/10 cursor-default";
              else cls = "border-app-border opacity-40 cursor-default";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={answered !== null}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${cls}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 ${answered !== null && i === currentQ.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : answered !== null && i === answered ? "bg-red-500/20 text-red-400" : "bg-app-card/50 text-app-text-muted"}`}>
                  {["A","B","C","D"][i]}
                </span>
                <div>
                  <p className={`text-sm ${answered !== null && i === currentQ.correctIndex ? "text-app-accent-success" : answered !== null && i === answered ? "text-red-400" : "text-white/70"}`}>{opt}</p>
                  <p className="text-app-text-muted text-[10px]">{currentQ.optionsVi[i]}</p>
                </div>
              </button>
            );
          })}
        </div>
        {answered !== null && (
          <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${answered === currentQ.correctIndex ? "border-emerald-500/20 bg-emerald-500/5 text-app-accent-success/80" : "border-orange-500/20 bg-orange-500/5 text-orange-400/80"}`}>
            <i className="ri-lightbulb-line mr-1.5"></i>{currentQ.explanation}
          </div>
        )}
      </div>

      {answered !== null && (
        <button onClick={() => { if (currentIdx + 1 >= questions.length) setDone(true); else setCurrentIdx(i => i + 1); }}
          className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">
          {currentIdx + 1 >= questions.length ? "Xem k?t qu?" : "Câu ti?p theo"}
        </button>
      )}
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function QuizPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { syncToCloud, updateLeaderboard } = useStudySync();
  const [aiConfig] = useLocalStorage<AIConfig | null>("kts_ai_config", null);
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [selectedRank, setSelectedRank] = useState<number | "all">("all");
  const [questionCount, setQuestionCount] = useState(8);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState<"setup" | "quiz" | "result">("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useLocalStorage<{ date: string; score: number; total: number; lesson: string }[]>("kts_quiz_history", []);
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [quizMode, setQuizMode] = useState<"kpop" | "eps-weak">("kpop");
  const [selectedWeakTopic, setSelectedWeakTopic] = useState<string | null>(null);

  // Compute weak topics from EPS practice
  const weakTopics = useMemo(() => {
    return EPS_TOPICS.map(t => {
      const qs = epsQuestions.filter(q => q.topic === t.id);
      const done = qs.filter(q => answeredMap[q.id] !== undefined);
      const correct = done.filter(q => answeredMap[q.id] === q.correctIndex).length;
      const pct = done.length > 0 ? Math.round((correct / done.length) * 100) : -1;
      return { ...t, pct, done: done.length, total: qs.length };
    }).sort((a, b) => {
      if (a.pct === -1 && b.pct === -1) return 0;
      if (a.pct === -1) return 1;
      if (b.pct === -1) return -1;
      return a.pct - b.pct;
    });
  }, [answeredMap]);

  const selectedLesson = useMemo(() => {
    if (selectedRank === "all") return null;
    return approvedLessons.find(l => l.song.rank === selectedRank) ?? null;
  }, [selectedRank, approvedLessons]);

  const handleStartQuiz = useCallback(async () => {
    if (!aiConfig?.apiKey) {
      setError("Chua c?u hình API Key. Vào Cài d?t API d? thêm key.");
      return;
    }
    const lesson = selectedLesson ?? approvedLessons[Math.floor(Math.random() * approvedLessons.length)];
    if (!lesson) { setError("Chua có bài h?c nào. T?o bài h?c trong K-pop Lesson tru?c!"); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await generateQuiz(
        aiConfig,
        lesson.song.title,
        lesson.vocab ?? [],
        lesson.grammar?.map(g => `${g.pattern}: ${g.explanation}`).join("\n") ?? "",
        questionCount
      );
      setQuestions(result.questions);
      setAnswers(new Array(result.questions.length).fill(null));
      setCurrentIdx(0);
      setMode("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "L?i không xác d?nh");
    } finally {
      setLoading(false);
    }
  }, [aiConfig, selectedLesson, approvedLessons, questionCount]);

  const handleAnswer = useCallback((optIdx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIdx] = optIdx;
      return next;
    });
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        const score = questions.filter((q, i) => answers[i] === q.correctIndex || (i === currentIdx && optIdx === q.correctIndex)).length;
        const finalScore = questions.filter((q, i) => {
          const ans = i === currentIdx ? optIdx : answers[i];
          return ans === q.correctIndex;
        }).length;
        setQuizHistory(prev => [{
          date: new Date().toISOString(),
          score: finalScore,
          total: questions.length,
          lesson: selectedLesson?.song.title ?? "Random",
        }, ...prev.slice(0, 19)]);
        setMode("result");
        // Auto-sync after quiz completion
        if (user) {
          const displayName = profile?.display_name || user.email?.split("@")[0] || "H?c viên";
          Promise.all([syncToCloud(user.id), updateLeaderboard(user.id, displayName)]);
        }
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 1200);
  }, [currentIdx, questions, answers, selectedLesson, setQuizHistory]);

  const finalScore = useMemo(() => {
    return questions.filter((q, i) => answers[i] === q.correctIndex).length;
  }, [questions, answers]);

  const avgScore = useMemo(() => {
    if (quizHistory.length === 0) return 0;
    return Math.round(quizHistory.reduce((s, h) => s + (h.score / h.total) * 100, 0) / quizHistory.length);
  }, [quizHistory]);

  return (
    <DashboardLayout
      title="Quiz & Ki?m tra"
      subtitle="Tr?c nghi?m t? v?ng + ng? pháp — luy?n theo ch? d? y?u"
    >
      {/* Mode tabs */}
      <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl mb-5 w-fit">
        {([["kpop", "ri-music-2-line", "Quiz K-pop"], ["eps-weak", "ri-focus-3-line", "Luy?n ch? d? y?u EPS"]] as const).map(([m, icon, label]) => (
          <button key={m} onClick={() => { setQuizMode(m); setSelectedWeakTopic(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${quizMode === m ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>
            <i className={icon}></i>{label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: Quiz area */}
        <div>
          {/* EPS Weak mode */}
          {quizMode === "eps-weak" && (
            <div>
              {selectedWeakTopic ? (
                <EpsWeakQuiz weakTopicId={selectedWeakTopic} onBack={() => setSelectedWeakTopic(null)} />
              ) : (
                <div className="bg-app-bg border border-app-border rounded-2xl p-6">
                  <h3 className="text-white font-bold text-base mb-2">Ch?n ch? d? c?n ôn</h3>
                  <p className="text-app-text-secondary text-xs mb-5">Ch? d? du?c s?p x?p t? y?u nh?t — t?p trung vào nh?ng ch? d? d? tru?c!</p>
                  <div className="space-y-2">
                    {weakTopics.map(t => {
                      const color = t.pct === -1 ? "rgba(255,255,255,0.2)" : t.pct >= 80 ? "#34d399" : t.pct >= 60 ? "app-accent-primary" : "#f87171";
                      return (
                        <button key={t.id} onClick={() => setSelectedWeakTopic(t.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-app-surface/50 hover:bg-app-card/50 border border-app-border hover:border-app-border transition-all cursor-pointer text-left">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                            <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-sm font-medium">{t.label}</p>
                            <p className="text-app-text-muted text-[10px]">{t.done > 0 ? `${t.done}/${t.total} câu dã làm` : "Chua làm câu nào"}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {t.done > 0 && (
                              <div className="w-16 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: color }} />
                              </div>
                            )}
                            <span className="text-sm font-bold w-10 text-right" style={{ color }}>
                              {t.pct === -1 ? "M?i" : `${t.pct}%`}
                            </span>
                            <i className="ri-arrow-right-line text-app-text-muted text-xs"></i>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {quizMode === "kpop" && mode === "setup" && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-6">
              <h3 className="text-white font-bold text-base mb-5">Cài d?t Quiz</h3>

              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <i className="ri-error-warning-line text-red-400 text-sm"></i>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              {/* Lesson select */}
              <div className="mb-4">
                <label className="text-app-text-secondary text-xs font-medium block mb-2">Ch?n bài h?c</label>
                <select
                  value={selectedRank === "all" ? "all" : String(selectedRank)}
                  onChange={e => setSelectedRank(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                  className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary/40 transition-colors cursor-pointer"
                >
                  <option value="all" className="bg-app-bg">Ng?u nhiên t? t?t c? bài h?c</option>
                  {approvedLessons.map(l => (
                    <option key={l.song.rank} value={l.song.rank} className="bg-app-bg">
                      {l.song.title} — {l.song.artist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question count */}
              <div className="mb-6">
                <label className="text-app-text-secondary text-xs font-medium block mb-2">S? câu h?i</label>
                <div className="flex gap-2">
                  {[5, 8, 10, 15].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${questionCount === n ? "border-app-accent-primary/40 bg-app-accent-primary/10 text-app-accent-primary" : "border-app-border bg-app-surface/50 text-app-text-secondary hover:border-white/15"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question types info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { type: "T? v?ng", icon: "ri-translate-2", color: "app-accent-primary", desc: "Ch?n nghia dúng" },
                  { type: "Ng? pháp", icon: "ri-graduation-cap-line", color: "#a78bfa", desc: "Ch?n c?u trúc dúng" },
                  { type: "Ði?n ch? tr?ng", icon: "ri-edit-line", color: "#34d399", desc: "Hoàn thành câu" },
                ].map(t => (
                  <div key={t.type} className="p-3 rounded-xl bg-app-surface/50 border border-app-border text-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${t.color}15` }}>
                      <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                    </div>
                    <p className="text-white/60 text-xs font-semibold">{t.type}</p>
                    <p className="text-app-text-muted text-[10px]">{t.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={loading || approvedLessons.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <><i className="ri-loader-4-line animate-spin"></i> AI dang t?o câu h?i...</>
                ) : (
                  <><i className="ri-play-line"></i> B?t d?u Quiz ({questionCount} câu)</>
                )}
              </button>

              {approvedLessons.length === 0 && (
                <p className="text-app-text-muted text-xs text-center mt-3">C?n có bài h?c trong K-pop Lesson tru?c</p>
              )}
            </div>
          )}

          {quizMode === "kpop" && mode === "quiz" && questions[currentIdx] && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-app-accent-primary transition-all"
                    style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setMode("setup")}
                  className="text-app-text-muted hover:text-white/50 text-xs cursor-pointer transition-colors whitespace-nowrap"
                >
                  Thoát
                </button>
              </div>
              <QuizCard
                q={questions[currentIdx]}
                index={currentIdx}
                total={questions.length}
                onAnswer={handleAnswer}
                answered={answers[currentIdx]}
              />
            </div>
          )}

          {quizMode === "kpop" && mode === "result" && (
            <QuizResult
              score={finalScore}
              total={questions.length}
              questions={questions}
              answers={answers}
              lessonTitle={selectedLesson?.song.title}
              onRetry={() => {
                setAnswers(new Array(questions.length).fill(null));
                setCurrentIdx(0);
                setMode("quiz");
              }}
              onNew={() => setMode("setup")}
            />
          )}
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Th?ng kê</h3>
            <div className="space-y-3">
              {[
                { label: "L?n làm quiz", value: quizHistory.length, icon: "ri-survey-line", color: "app-accent-primary" },
                { label: "Ði?m trung bình", value: `${avgScore}%`, icon: "ri-bar-chart-line", color: "#34d399" },
                { label: "Bài h?c có quiz", value: new Set(quizHistory.map(h => h.lesson)).size, icon: "ri-book-2-line", color: "#a78bfa" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                    <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text-secondary text-[10px]">{stat.label}</p>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {quizHistory.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">L?ch s?</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {quizHistory.slice(0, 10).map((h, i) => {
                  const pct = Math.round((h.score / h.total) * 100);
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#fb923c";
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-app-surface/50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-xs font-bold" style={{ backgroundColor: `${color}15`, color }}>
                        {pct}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-xs truncate">{h.lesson}</p>
                        <p className="text-app-text-muted text-[10px]">{h.score}/{h.total} câu dúng</p>
                      </div>
                      <p className="text-app-text-muted text-[10px] flex-shrink-0">{new Date(h.date).toLocaleDateString("vi-VN")}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TTS tip */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
            <div className="flex items-start gap-2">
              <i className="ri-volume-up-line text-app-text-muted text-sm mt-0.5 flex-shrink-0"></i>
              <div>
                <p className="text-white/50 text-xs font-semibold mb-1">Phát âm tích h?p</p>
                <p className="text-app-text-muted text-[10px] leading-relaxed">
                  Nh?n vào t? ti?ng Hàn trong câu h?i d? nghe phát âm chu?n tru?c khi tr? l?i.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


