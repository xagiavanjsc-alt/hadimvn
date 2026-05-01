import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsLessons, EPS_LESSON_TOPICS } from "@/mocks/epsLessons";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";

// ─── Types ────────────────────────────────────────────────────────────────
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
  intermediate: "#e8c84a",
  advanced: "#f87171",
};

const LEVEL_LABELS = {
  beginner: "Người mới bắt đầu",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

// ─── Placement Quiz ───────────────────────────────────────────────────────
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
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#e8c84a]/15 mx-auto mb-6">
          <i className="ri-brain-line text-[#e8c84a] text-3xl"></i>
        </div>
        <h2 className="text-white font-bold text-xl mb-3">Kiểm tra trình độ EPS</h2>
        <p className="text-white/50 text-sm mb-2 leading-relaxed">
          Làm 20 câu hỏi ngắn để AI phân tích điểm mạnh/yếu và tạo lộ trình học phù hợp nhất với bạn.
        </p>
        <p className="text-white/30 text-xs mb-8">Thời gian: ~5-10 phút · Không giới hạn thời gian</p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "ri-survey-line", label: "20 câu hỏi", color: "#e8c84a" },
            { icon: "ri-folder-line", label: "9 chủ đề", color: "#34d399" },
            { icon: "ri-route-line", label: "Lộ trình cá nhân", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white/50 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          Bắt đầu kiểm tra
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-sm">{currentIdx + 1}/{questions.length}</span>
        <div className="flex-1 mx-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#e8c84a] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[#e8c84a] text-sm font-bold">{Math.round(progress)}%</span>
      </div>

      <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-6">
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
        {current.questionVi && <p className="text-white/40 text-sm italic">{current.questionVi}</p>}
      </div>

      <div className="space-y-2.5">
        {current.options.map((opt, i) => {
          const answered = answers[currentIdx] !== undefined;
          const isSelected = answers[currentIdx] === i;
          const isCorrect = i === current.correctIndex;
          let cls = "border-white/8 bg-white/2 hover:border-white/20 hover:bg-white/4 cursor-pointer";
          if (answered) {
            if (isCorrect) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
            else if (isSelected) cls = "border-red-500/40 bg-red-500/8 cursor-default";
            else cls = "border-white/5 opacity-40 cursor-default";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl border transition-all text-left ${cls}`}
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 text-white/40 text-xs font-bold flex-shrink-0">
                {["A", "B", "C", "D"][i]}
              </span>
              <span className="text-white/80 text-sm">{opt}</span>
              {answered && isCorrect && <i className="ri-checkbox-circle-fill text-emerald-400 ml-auto"></i>}
              {answered && isSelected && !isCorrect && <i className="ri-close-circle-fill text-red-400 ml-auto"></i>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Roadmap Step Card ────────────────────────────────────────────────────
function StepCard({
  step,
  index,
  onStart,
}: {
  step: RoadmapStep;
  index: number;
  onStart: (step: RoadmapStep) => void;
}) {
  const priorityColor = step.priority === "high" ? "#f87171" : step.priority === "medium" ? "#e8c84a" : "#34d399";
  const priorityLabel = step.priority === "high" ? "Ưu tiên cao" : step.priority === "medium" ? "Trung bình" : "Bổ sung";

  const typeIcon = step.type === "lesson" ? "ri-book-open-line" : step.type === "quiz" ? "ri-survey-line" : step.type === "review" ? "ri-refresh-line" : "ri-trophy-line";
  const typeColor = step.type === "lesson" ? "#e8c84a" : step.type === "quiz" ? "#a78bfa" : step.type === "review" ? "#34d399" : "#fb923c";

  return (
    <div className={`relative flex gap-4 ${!step.isUnlocked ? "opacity-40" : ""}`}>
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 z-10 ${step.isCompleted ? "bg-emerald-500/20" : step.isUnlocked ? "" : "bg-white/5"}`}
          style={step.isUnlocked && !step.isCompleted ? { backgroundColor: `${typeColor}15` } : {}}>
          {step.isCompleted ? (
            <i className="ri-checkbox-circle-fill text-emerald-400 text-lg"></i>
          ) : (
            <i className={`${typeIcon} text-base`} style={{ color: step.isUnlocked ? typeColor : "rgba(255,255,255,0.2)" }}></i>
          )}
        </div>
        <div className="w-px flex-1 bg-white/5 mt-1"></div>
      </div>

      {/* Content */}
      <div className={`flex-1 pb-5 ${step.type === "milestone" ? "bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-2xl p-4 mb-2" : ""}`}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}>
                {priorityLabel}
              </span>
              <span className="text-[9px] text-white/25 flex items-center gap-0.5">
                <i className="ri-time-line"></i>{step.estimatedMinutes} phút
              </span>
              <span className="text-[9px] text-[#a78bfa]/70 font-bold">+{step.xpReward} XP</span>
            </div>
            <p className={`font-semibold text-sm ${step.isCompleted ? "text-white/40 line-through" : "text-white"}`}>{step.title}</p>
            <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
          </div>
          {step.isUnlocked && !step.isCompleted && (
            <button
              onClick={() => onStart(step)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}25` }}
            >
              Bắt đầu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
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
          desc: `Học từ vựng và ngữ pháp chủ đề ${topicInfo?.label || topicId} — điểm yếu cần cải thiện`,
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
        title: `Kiểm tra chủ đề: ${topicInfo?.label || topicId}`,
        desc: "Làm 10 câu hỏi để kiểm tra mức độ tiến bộ",
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
          desc: `Nâng cao kỹ năng chủ đề ${topicInfo?.label || topicId}`,
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
        title: "Thi thử EPS (20 câu)",
        desc: "Kiểm tra tổng hợp tất cả chủ đề đã học",
        estimatedMinutes: 25,
        priority: "high",
        isCompleted: false,
        isUnlocked: phase2Steps.length > 0,
        xpReward: 100,
      },
      {
        id: "p3_review",
        type: "review",
        title: "Ôn tập câu sai theo chủ đề",
        desc: "Xem lại tất cả câu trả lời sai và học lại",
        estimatedMinutes: 20,
        priority: "medium",
        isCompleted: false,
        isUnlocked: true,
        xpReward: 60,
      },
      {
        id: "p3_mock2",
        type: "quiz",
        title: "Thi thử EPS đầy đủ (40 câu)",
        desc: "Mô phỏng đề thi thật — 40 câu trong 60 phút",
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
      title: "Sẵn sàng thi EPS-TOPIK!",
      desc: "Hoàn thành lộ trình — bạn đã sẵn sàng cho kỳ thi thật",
      estimatedMinutes: 0,
      priority: "high",
      isCompleted: false,
      isUnlocked: false,
      xpReward: 500,
    };

    return [
      { phase: 1, title: "Giai đoạn 1: Củng cố nền tảng", color: "#f87171", steps: phase1Steps, desc: `Tập trung vào ${weakTopics.length} chủ đề điểm yếu` },
      { phase: 2, title: "Giai đoạn 2: Nâng cao kỹ năng", color: "#e8c84a", steps: phase2Steps, desc: `Cải thiện ${mediumTopics.length} chủ đề trung bình` },
      { phase: 3, title: "Giai đoạn 3: Luyện thi tổng hợp", color: "#34d399", steps: [...phase3Steps, milestone], desc: "Thi thử và ôn tập toàn diện" },
    ];
  }, [placementResult, completedLessons]);

  const totalSteps = roadmapPhases.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = roadmapPhases.reduce((sum, p) => sum + p.steps.filter(s => s.isCompleted).length, 0);
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (view === "placement") {
    return (
      <DashboardLayout
        title="Lộ trình EPS cá nhân hóa"
        subtitle="Kiểm tra trình độ để AI tạo lộ trình học phù hợp nhất với bạn"
      >
        {placementResult && (
          <div className="mb-4">
            <button onClick={() => setView("roadmap")} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-arrow-left-line"></i>Xem lộ trình hiện tại
            </button>
          </div>
        )}
        <PlacementQuiz onComplete={handlePlacementComplete} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Lộ trình EPS cá nhân hóa"
      subtitle="Lộ trình học được tạo dựa trên kết quả kiểm tra trình độ của bạn"
    >
      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Left: Roadmap */}
        <div className="space-y-5">
          {/* Level badge */}
          {placementResult && (
            <div className="flex items-center gap-4 p-5 bg-[#0f1117] border border-white/8 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${LEVEL_COLORS[placementResult.level]}15` }}>
                <i className="ri-brain-line text-2xl" style={{ color: LEVEL_COLORS[placementResult.level] }}></i>
              </div>
              <div className="flex-1">
                <p className="text-white/40 text-xs mb-0.5">Trình độ của bạn</p>
                <p className="text-white font-bold text-lg" style={{ color: LEVEL_COLORS[placementResult.level] }}>
                  {LEVEL_LABELS[placementResult.level]}
                </p>
                <p className="text-white/30 text-xs">Kiểm tra lúc {new Date(placementResult.completedAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-2xl">{overallProgress}%</p>
                <p className="text-white/30 text-xs">Hoàn thành</p>
              </div>
              <button
                onClick={() => setView("placement")}
                className="px-3 py-2 rounded-xl border border-white/10 text-white/40 text-xs hover:text-white/60 cursor-pointer whitespace-nowrap transition-colors"
              >
                Làm lại
              </button>
            </div>
          )}

          {/* Progress bar */}
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
          </div>

          {/* Phases */}
          {roadmapPhases.map((phase, phaseIdx) => {
            const phaseCompleted = phase.steps.filter(s => s.isCompleted).length;
            const isOpen = expandedPhase === phaseIdx;
            return (
              <div key={phase.phase} className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(isOpen ? -1 : phaseIdx)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/2 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${phase.color}15` }}>
                    <span className="font-bold text-sm" style={{ color: phase.color }}>{phase.phase}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-sm">{phase.title}</p>
                    <p className="text-white/30 text-xs mt-0.5">{phase.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold" style={{ color: phase.color }}>{phaseCompleted}/{phase.steps.length}</span>
                    <i className={`text-white/30 text-sm ${isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
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
            <div className="text-center py-12 text-white/30">
              <i className="ri-route-line text-3xl mb-2 block"></i>
              <p>Làm bài kiểm tra để tạo lộ trình</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Topic scores */}
          {placementResult && (
            <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-4">Điểm theo chủ đề</p>
              <div className="space-y-3">
                {Object.entries(placementResult.topicScores).map(([topicId, score]) => {
                  const topicInfo = EPS_TOPICS.find(t => t.id === topicId);
                  const color = score >= 80 ? "#34d399" : score >= 50 ? "#e8c84a" : "#f87171";
                  return (
                    <div key={topicId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/50 text-xs">{topicInfo?.label || topicId}</span>
                        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">Tiến độ lộ trình</p>
            <div className="space-y-2">
              {[
                { label: "Tổng bước", value: totalSteps, color: "#e8c84a" },
                { label: "Đã hoàn thành", value: completedSteps, color: "#34d399" },
                { label: "Còn lại", value: totalSteps - completedSteps, color: "#f87171" },
              ].map(s => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-white/40 text-xs">{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
            <p className="text-[#e8c84a] text-xs font-semibold mb-2">Mẹo học theo lộ trình</p>
            <div className="space-y-2 text-white/35 text-[10px] leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Ưu tiên hoàn thành Giai đoạn 1 trước</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Học đều đặn 30 phút/ngày</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Làm lại bài kiểm tra sau 2 tuần để cập nhật lộ trình</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Ôn tập câu sai ngay sau mỗi bài</p>
            </div>
          </div>

          <button
            onClick={() => setView("placement")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/40 text-sm hover:bg-white/3 cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-refresh-line"></i>Làm lại bài kiểm tra
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
