import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsLessons, EPS_LESSON_TOPICS } from "@/mocks/epsLessons";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";

// --- Types ----------------------------------------------------------------
interface PlacementResult {
  topicScores: Record<string, number>; // topic -> % correct
  level: "beginner" | "intermediate" | "advanced";
  completedAt: string;
}

interface RoadmapStep {
  id: string;
  type: "lesson" | "quiz" | "review" | "milestone";
  lessonId?: number;
  topicId?: string;
  title: string;
  desc: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  isCompleted: boolean;
  isUnlocked: boolean;
  xpReward: number;
}

const LEVEL_COLORS = {
  beginner: "#34d399",
  intermediate: "app-accent-primary",
  advanced: "#f87171",
};

const LEVEL_LABELS = {
  beginner: "Ngu?i m?i b?t d?u",
  intermediate: "Trung c?p",
  advanced: "Nâng cao",
};

// --- Placement Quiz -------------------------------------------------------
function PlacementQuiz({ onComplete }: { onComplete: (result: PlacementResult) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [started, setStarted] = useState(false);

  // Pick 20 questions across all topics
  const questions = useMemo(() => {
    const byTopic: Record<string, typeof epsQuestions> = {};
    EPS_TOPICS.forEach(t => {
      byTopic[t.id] = epsQuestions.filter(q => q.topic === t.id).slice(0, 3);
    });
    return Object.values(byTopic).flat().sort(() => Math.random() - 0.5).slice(0, 20);
  }, []);

  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  const handleAnswer = (optIdx: number) => {
    if (answers[currentIdx] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        // Calculate results
        const topicScores: Record<string, { correct: number; total: number }> = {};
        questions.forEach((q, i) => {
          if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
          topicScores[q.topic].total++;
          if (answers[i] === q.correctIndex) topicScores[q.topic].correct++;
        });
        const pctScores: Record<string, number> = {};
        Object.entries(topicScores).forEach(([t, s]) => {
          pctScores[t] = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        });
        const avgScore = Object.values(pctScores).reduce((a, b) => a + b, 0) / Object.values(pctScores).length;
        const level: PlacementResult["level"] = avgScore >= 70 ? "advanced" : avgScore >= 40 ? "intermediate" : "beginner";
        onComplete({ topicScores: pctScores, level, completedAt: new Date().toISOString() });
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 500);
  };

  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-app-accent-primary/15 mx-auto mb-6">
          <i className="ri-brain-line text-app-accent-primary text-3xl"></i>
        </div>
        <h2 className="text-white font-bold text-xl mb-3">Ki?m tra trình d? EPS</h2>
        <p className="text-white/50 text-sm mb-2 leading-relaxed">
          Làm 20 câu h?i ng?n d? AI phân tích di?m m?nh/y?u và t?o l? trình h?c phù h?p nh?t v?i b?n.
        </p>
        <p className="text-app-text-muted text-xs mb-8">Th?i gian: ~5-10 phút · Không gi?i h?n th?i gian</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: "ri-survey-line", label: "20 câu h?i", color: "app-accent-primary" },
            { icon: "ri-folder-line", label: "9 ch? d?", color: "#34d399" },
            { icon: "ri-route-line", label: "L? trình cá nhân", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-xl p-3 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white/50 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          B?t d?u ki?m tra
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-app-text-secondary text-sm">{currentIdx + 1}/{questions.length}</span>
        <div className="flex-1 mx-4 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-app-accent-primary text-sm font-bold">{Math.round(progress)}%</span>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          {(() => {
            const t = EPS_TOPICS.find(t => t.id === current.topic);
            return t ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                {t.label}
              </span>
            ) : null;
          })()}
        </div>
        <p className="text-white font-bold text-base mb-1 leading-relaxed">{current.question}</p>
        {current.questionVi && <p className="text-app-text-secondary text-sm italic">{current.questionVi}</p>}
      </div>

      <div className="space-y-2.5">
        {current.options.map((opt, i) => {
          const answered = answers[currentIdx] !== undefined;
          const isSelected = answers[currentIdx] === i;
          const isCorrect = i === current.correctIndex;
          let cls = "border-app-border bg-white/2 hover:border-white/20 hover:bg-white/4 cursor-pointer";
          if (answered) {
            if (isCorrect) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
            else if (isSelected) cls = "border-red-500/40 bg-red-500/8 cursor-default";
            else cls = "border-app-border opacity-40 cursor-default";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl border transition-all text-left ${cls}`}
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary text-xs font-bold flex-shrink-0">
                {["A", "B", "C", "D"][i]}
              </span>
              <span className="text-white/80 text-sm">{opt}</span>
              {answered && isCorrect && <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto"></i>}
              {answered && isSelected && !isCorrect && <i className="ri-close-circle-fill text-red-400 ml-auto"></i>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Roadmap Step Card ----------------------------------------------------
function StepCard({
  step,
  index,
  onStart,
}: {
  step: RoadmapStep;
  index: number;
  onStart: (step: RoadmapStep) => void;
}) {
  const priorityColor = step.priority === "high" ? "#f87171" : step.priority === "medium" ? "app-accent-primary" : "#34d399";
  const priorityLabel = step.priority === "high" ? "Uu tiên cao" : step.priority === "medium" ? "Trung bình" : "B? sung";

  const typeIcon = step.type === "lesson" ? "ri-book-open-line" : step.type === "quiz" ? "ri-survey-line" : step.type === "review" ? "ri-refresh-line" : "ri-trophy-line";
  const typeColor = step.type === "lesson" ? "app-accent-primary" : step.type === "quiz" ? "#a78bfa" : step.type === "review" ? "#34d399" : "#fb923c";

  return (
    <div className={`relative flex gap-4 ${!step.isUnlocked ? "opacity-40" : ""}`}>
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 z-10 ${step.isCompleted ? "bg-emerald-500/20" : step.isUnlocked ? "" : "bg-app-card/50"}`}
          style={step.isUnlocked && !step.isCompleted ? { backgroundColor: `${typeColor}15` } : {}}>
          {step.isCompleted ? (
            <i className="ri-checkbox-circle-fill text-app-accent-success text-lg"></i>
          ) : (
            <i className={`${typeIcon} text-base`} style={{ color: step.isUnlocked ? typeColor : "rgba(255,255,255,0.2)" }}></i>
          )}
        </div>
        <div className="w-px flex-1 bg-app-card/50 mt-1"></div>
      </div>

      {/* Content */}
      <div className={`flex-1 pb-5 ${step.type === "milestone" ? "bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-2xl p-4 mb-2" : ""}`}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}>
                {priorityLabel}
              </span>
              <span className="text-[9px] text-app-text-muted flex items-center gap-0.5">
                <i className="ri-time-line"></i>{step.estimatedMinutes} phút
              </span>
              <span className="text-[9px] text-[#a78bfa]/70 font-bold">+{step.xpReward} XP</span>
            </div>
            <p className={`font-semibold text-sm ${step.isCompleted ? "text-app-text-secondary line-through" : "text-white"}`}>{step.title}</p>
            <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
          </div>
          {step.isUnlocked && !step.isCompleted && (
            <button
              onClick={() => onStart(step)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}25` }}
            >
              B?t d?u
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function EpsPersonalizedRoadmapPage() {
  const [placementResult, setPlacementResult] = useLocalStorage<PlacementResult | null>("kts_eps_placement_result", null);
  const [completedLessons] = useLocalStorage<Record<number, { score: number }>>("kts_eps_lessons_progress", {});
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [view, setView] = useState<"roadmap" | "placement">(placementResult ? "roadmap" : "placement");
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  const handlePlacementComplete = (result: PlacementResult) => {
    setPlacementResult(result);
    setView("roadmap");
  };

  // Generate personalized roadmap based on placement result
  const roadmapPhases = useMemo(() => {
    if (!placementResult) return [];

    const weakTopics = Object.entries(placementResult.topicScores)
      .filter(([, score]) => score < 50)
      .map(([topic]) => topic);

    const mediumTopics = Object.entries(placementResult.topicScores)
      .filter(([, score]) => score >= 50 && score < 80)
      .map(([topic]) => topic);

    const strongTopics = Object.entries(placementResult.topicScores)
      .filter(([, score]) => score >= 80)
      .map(([topic]) => topic);

    // Phase 1: Foundation (weak topics)
    const phase1Steps: RoadmapStep[] = [];
    weakTopics.slice(0, 3).forEach((topicId, i) => {
      const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === topicId) || EPS_TOPICS.find(t => t.id === topicId);
      const topicLessons = epsLessons.filter(l => l.topic === topicId).slice(0, 2);
      topicLessons.forEach((lesson, j) => {
        phase1Steps.push({
          id: `p1_${topicId}_${j}`,
          type: "lesson",
          lessonId: lesson.id,
          topicId,
          title: `Bài ${lesson.id}: ${lesson.titleVi.replace(/^Bài\s+\d+[:\s]+/i, "")}`,
          desc: `H?c t? v?ng và ng? pháp ch? d? ${topicInfo?.label || topicId} — di?m y?u c?n c?i thi?n`,
          estimatedMinutes: lesson.estimatedMinutes,
          priority: "high",
          isCompleted: !!completedLessons[lesson.id],
          isUnlocked: j === 0 || !!completedLessons[topicLessons[j - 1]?.id],
          xpReward: 50,
        });
      });
      phase1Steps.push({
        id: `p1_quiz_${topicId}`,
        type: "quiz",
        topicId,
        title: `Ki?m tra ch? d?: ${topicInfo?.label || topicId}`,
        desc: "Làm 10 câu h?i d? ki?m tra m?c d? ti?n b?",
        estimatedMinutes: 10,
        priority: "high",
        isCompleted: false,
        isUnlocked: topicLessons.every(l => !!completedLessons[l.id]),
        xpReward: 80,
      });
    });

    // Phase 2: Improvement (medium topics)
    const phase2Steps: RoadmapStep[] = [];
    mediumTopics.slice(0, 3).forEach((topicId, i) => {
      const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === topicId) || EPS_TOPICS.find(t => t.id === topicId);
      const topicLessons = epsLessons.filter(l => l.topic === topicId).slice(0, 3);
      topicLessons.forEach((lesson, j) => {
        phase2Steps.push({
          id: `p2_${topicId}_${j}`,
          type: "lesson",
          lessonId: lesson.id,
          topicId,
          title: `Bài ${lesson.id}: ${lesson.titleVi.replace(/^Bài\s+\d+[:\s]+/i, "")}`,
          desc: `Nâng cao k? nang ch? d? ${topicInfo?.label || topicId}`,
          estimatedMinutes: lesson.estimatedMinutes,
          priority: "medium",
          isCompleted: !!completedLessons[lesson.id],
          isUnlocked: true,
          xpReward: 40,
        });
      });
    });

    // Phase 3: Advanced (strong topics + exam prep)
    const phase3Steps: RoadmapStep[] = [
      {
        id: "p3_mock1",
        type: "quiz",
        title: "Thi th? EPS (20 câu)",
        desc: "Ki?m tra t?ng h?p t?t c? ch? d? dã h?c",
        estimatedMinutes: 25,
        priority: "high",
        isCompleted: false,
        isUnlocked: phase2Steps.length > 0,
        xpReward: 100,
      },
      {
        id: "p3_review",
        type: "review",
        title: "Ôn t?p câu sai theo ch? d?",
        desc: "Xem l?i t?t c? câu tr? l?i sai và h?c l?i",
        estimatedMinutes: 20,
        priority: "medium",
        isCompleted: false,
        isUnlocked: true,
        xpReward: 60,
      },
      {
        id: "p3_mock2",
        type: "quiz",
        title: "Thi th? EPS d?y d? (40 câu)",
        desc: "Mô ph?ng d? thi th?t — 40 câu trong 60 phút",
        estimatedMinutes: 60,
        priority: "high",
        isCompleted: false,
        isUnlocked: false,
        xpReward: 200,
      },
    ];

    // Milestone
    const milestone: RoadmapStep = {
      id: "milestone_final",
      type: "milestone",
      title: "S?n sàng thi EPS-TOPIK!",
      desc: "Hoàn thành l? trình — b?n dã s?n sàng cho k? thi th?t",
      estimatedMinutes: 0,
      priority: "high",
      isCompleted: false,
      isUnlocked: false,
      xpReward: 500,
    };

    return [
      { phase: 1, title: "Giai do?n 1: C?ng c? n?n t?ng", color: "#f87171", steps: phase1Steps, desc: `T?p trung vào ${weakTopics.length} ch? d? di?m y?u` },
      { phase: 2, title: "Giai do?n 2: Nâng cao k? nang", color: "app-accent-primary", steps: phase2Steps, desc: `C?i thi?n ${mediumTopics.length} ch? d? trung bình` },
      { phase: 3, title: "Giai do?n 3: Luy?n thi t?ng h?p", color: "#34d399", steps: [...phase3Steps, milestone], desc: "Thi th? và ôn t?p toàn di?n" },
    ];
  }, [placementResult, completedLessons]);

  const totalSteps = roadmapPhases.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = roadmapPhases.reduce((sum, p) => sum + p.steps.filter(s => s.isCompleted).length, 0);
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (view === "placement") {
    return (
      <DashboardLayout
        title="L? trình EPS cá nhân hóa"
        subtitle="Ki?m tra trình d? d? AI t?o l? trình h?c phù h?p nh?t v?i b?n"
      >
        {placementResult && (
          <div className="mb-4">
            <button onClick={() => setView("roadmap")} className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 text-sm cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-arrow-left-line"></i>Xem l? trình hi?n t?i
            </button>
          </div>
        )}
        <PlacementQuiz onComplete={handlePlacementComplete} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="L? trình EPS cá nhân hóa"
      subtitle="L? trình h?c du?c t?o d?a trên k?t qu? ki?m tra trình d? c?a b?n"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Roadmap */}
        <div className="space-y-5">
          {/* Level badge */}
          {placementResult && (
            <div className="flex items-center gap-4 p-5 bg-app-bg border border-app-border rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${LEVEL_COLORS[placementResult.level]}15` }}>
                <i className="ri-brain-line text-2xl" style={{ color: LEVEL_COLORS[placementResult.level] }}></i>
              </div>
              <div className="flex-1">
                <p className="text-app-text-secondary text-xs mb-0.5">Trình d? c?a b?n</p>
                <p className="text-white font-bold text-lg" style={{ color: LEVEL_COLORS[placementResult.level] }}>
                  {LEVEL_LABELS[placementResult.level]}
                </p>
                <p className="text-app-text-muted text-xs">Ki?m tra lúc {new Date(placementResult.completedAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-2xl">{overallProgress}%</p>
                <p className="text-app-text-muted text-xs">Hoàn thành</p>
              </div>
              <button
                onClick={() => setView("placement")}
                className="px-3 py-2 rounded-xl border border-app-border text-app-text-secondary text-xs hover:text-white/60 cursor-pointer whitespace-nowrap transition-colors"
              >
                Làm l?i
              </button>
            </div>
          )}

          {/* Progress bar */}
          <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
            <div className="h-full bg-app-accent-primary rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
          </div>

          {/* Phases */}
          {roadmapPhases.map((phase, phaseIdx) => {
            const phaseCompleted = phase.steps.filter(s => s.isCompleted).length;
            const isOpen = expandedPhase === phaseIdx;
            return (
              <div key={phase.phase} className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(isOpen ? -1 : phaseIdx)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/2 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${phase.color}15` }}>
                    <span className="font-bold text-sm" style={{ color: phase.color }}>{phase.phase}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-sm">{phase.title}</p>
                    <p className="text-app-text-muted text-xs mt-0.5">{phase.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold" style={{ color: phase.color }}>{phaseCompleted}/{phase.steps.length}</span>
                    <i className={`text-app-text-muted text-sm ${isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-app-border pt-4">
                    {phase.steps.map((step, stepIdx) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        index={stepIdx}
                        onStart={(s) => {
                          if (s.type === "lesson" && s.lessonId) {
                            window.location.href = "/eps-lessons";
                          } else if (s.type === "quiz") {
                            window.location.href = "/eps";
                          } else if (s.type === "review") {
                            window.location.href = "/eps-wrong-topic";
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {roadmapPhases.length === 0 && (
            <div className="text-center py-12 text-app-text-muted">
              <i className="ri-route-line text-3xl mb-2 block"></i>
              <p>Làm bài ki?m tra d? t?o l? trình</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Topic scores */}
          {placementResult && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-4">Ði?m theo ch? d?</p>
              <div className="space-y-3">
                {Object.entries(placementResult.topicScores).map(([topicId, score]) => {
                  const topicInfo = EPS_TOPICS.find(t => t.id === topicId);
                  const color = score >= 80 ? "#34d399" : score >= 50 ? "app-accent-primary" : "#f87171";
                  return (
                    <div key={topicId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/50 text-xs">{topicInfo?.label || topicId}</span>
                        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">Ti?n d? l? trình</p>
            <div className="space-y-2">
              {[
                { label: "T?ng bu?c", value: totalSteps, color: "app-accent-primary" },
                { label: "Ðã hoàn thành", value: completedSteps, color: "#34d399" },
                { label: "Còn l?i", value: totalSteps - completedSteps, color: "#f87171" },
              ].map(s => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-app-text-secondary text-xs">{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
            <p className="text-app-accent-primary text-xs font-semibold mb-2">M?o h?c theo l? trình</p>
            <div className="space-y-2 text-white/35 text-[10px] leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Uu tiên hoàn thành Giai do?n 1 tru?c</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>H?c d?u d?n 30 phút/ngày</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Làm l?i bài ki?m tra sau 2 tu?n d? c?p nh?t l? trình</p>
              <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Ôn t?p câu sai ngay sau m?i bài</p>
            </div>
          </div>

          <button
            onClick={() => setView("placement")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-app-text-secondary text-sm hover:bg-app-surface/50 cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-refresh-line"></i>Làm l?i bài ki?m tra
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}


