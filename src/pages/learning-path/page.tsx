import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsLessons } from "@/mocks/epsLessons";
import { epsQuestions } from "@/mocks/epsQuestions";

interface PathStep {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  type: "lesson" | "flashcard" | "exam" | "quiz" | "listening" | "hangul";
  estimatedMinutes: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  progress?: number;
  badge?: string;
}

interface PathPhase {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  steps: PathStep[];
}

const PHASE_COLORS = ["#e8c84a", "#34d399", "#fb923c", "#a78bfa", "#06b6d4", "#f87171"];

export default function LearningPathPage() {
  const navigate = useNavigate();
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardProgress] = useLocalStorage<Record<string, boolean>>("flashcard_known", {});
  const [hangulProgress] = useLocalStorage<Record<string, boolean>>("kts_hangul_known", {});
  const [lessonProgress] = useLocalStorage<Record<number, boolean>>("kts_lesson_done", {});
  const [examResults] = useLocalStorage<{ score: number; total: number }[]>("kts_eps_exam_results", []);
  const [quizHistory] = useLocalStorage<{ score: number; total: number }[]>("kts_quiz_history", []);
  const [expandedPhase, setExpandedPhase] = useState<string | null>("phase1");

  // Computed progress
  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const flashcardKnown = Object.values(flashcardProgress).filter(Boolean).length;
  const hangulKnown = Object.values(hangulProgress).filter(Boolean).length;
  const lessonsDone = Object.values(lessonProgress).filter(Boolean).length;
  const validExams = examResults.filter(r => r && r.total > 0);
  const bestExamScore = validExams.length > 0
    ? Math.max(...validExams.map(r => Math.round((r.score / r.total) * 100)))
    : 0;

  const phases: PathPhase[] = useMemo(() => [
    {
      id: "phase1",
      title: "Giai đoạn 1: Nền tảng",
      description: "Học bảng chữ Hangul và từ vựng cơ bản",
      color: PHASE_COLORS[0],
      icon: "ri-seedling-line",
      steps: [
        {
          id: "hangul-basic",
          title: "Bảng chữ Hangul",
          titleVi: "Học 40 ký tự cơ bản",
          description: "Nắm vững nguyên âm và phụ âm tiếng Hàn",
          icon: "ri-font-size",
          color: "#e8c84a",
          route: "/hangul",
          type: "hangul",
          estimatedMinutes: 30,
          isCompleted: hangulKnown >= 30,
          isUnlocked: true,
          progress: Math.min(100, Math.round((hangulKnown / 40) * 100)),
          badge: hangulKnown >= 40 ? "Hangul Master" : undefined,
        },
        {
          id: "eps-lesson-1",
          title: "Bài 1: Giới thiệu bản thân",
          titleVi: "자기소개 — 40 từ vựng",
          description: "Học cách giới thiệu bản thân, quốc tịch, nghề nghiệp",
          icon: "ri-hand-heart-line",
          color: "#e8c84a",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 20,
          isCompleted: !!lessonProgress[1],
          isUnlocked: hangulKnown >= 10,
          progress: lessonProgress[1] ? 100 : 0,
        },
        {
          id: "eps-lesson-2",
          title: "Bài 2: Đồ dùng sinh hoạt",
          titleVi: "생활용품 — 27 từ vựng",
          description: "Tên các đồ dùng hàng ngày trong tiếng Hàn",
          icon: "ri-home-3-line",
          color: "#e8c84a",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 20,
          isCompleted: !!lessonProgress[2],
          isUnlocked: !!lessonProgress[1],
          progress: lessonProgress[2] ? 100 : 0,
        },
        {
          id: "flashcard-start",
          title: "Flashcard từ vựng",
          titleVi: "Thuộc 20 từ đầu tiên",
          description: "Luyện nhớ từ vựng qua thẻ ghi nhớ",
          icon: "ri-stack-line",
          color: "#34d399",
          route: "/flashcard",
          type: "flashcard",
          estimatedMinutes: 15,
          isCompleted: flashcardKnown >= 20,
          isUnlocked: !!lessonProgress[1],
          progress: Math.min(100, Math.round((flashcardKnown / 20) * 100)),
        },
      ],
    },
    {
      id: "phase2",
      title: "Giai đoạn 2: Xây dựng vốn từ",
      description: "Mở rộng từ vựng qua các bài học EPS",
      color: PHASE_COLORS[1],
      icon: "ri-book-open-line",
      steps: [
        {
          id: "eps-lesson-3",
          title: "Bài 3: Vị trí và Địa điểm",
          titleVi: "위치와 장소 — 34 từ vựng",
          description: "Học cách hỏi và chỉ đường, địa điểm",
          icon: "ri-map-pin-line",
          color: "#34d399",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 20,
          isCompleted: !!lessonProgress[3],
          isUnlocked: !!lessonProgress[2],
          progress: lessonProgress[3] ? 100 : 0,
        },
        {
          id: "eps-lesson-4",
          title: "Bài 4: Hành động và Đồ vật",
          titleVi: "동작과 사물 — 23 từ vựng",
          description: "Động từ hành động thường dùng hàng ngày",
          icon: "ri-run-line",
          color: "#34d399",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 20,
          isCompleted: !!lessonProgress[4],
          isUnlocked: !!lessonProgress[3],
          progress: lessonProgress[4] ? 100 : 0,
        },
        {
          id: "eps-lesson-5",
          title: "Bài 5: Ngày tháng và Thứ",
          titleVi: "날짜와 요일 — 35 từ vựng",
          description: "Học cách nói ngày tháng, thứ trong tuần",
          icon: "ri-calendar-line",
          color: "#34d399",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 20,
          isCompleted: !!lessonProgress[5],
          isUnlocked: !!lessonProgress[4],
          progress: lessonProgress[5] ? 100 : 0,
        },
        {
          id: "flashcard-50",
          title: "Flashcard nâng cao",
          titleVi: "Thuộc 50 từ vựng",
          description: "Mục tiêu: thuộc 50 từ qua flashcard",
          icon: "ri-stack-line",
          color: "#34d399",
          route: "/flashcard",
          type: "flashcard",
          estimatedMinutes: 20,
          isCompleted: flashcardKnown >= 50,
          isUnlocked: flashcardKnown >= 20,
          progress: Math.min(100, Math.round((flashcardKnown / 50) * 100)),
          badge: flashcardKnown >= 50 ? "Flashcard Pro" : undefined,
        },
      ],
    },
    {
      id: "phase3",
      title: "Giai đoạn 3: Sinh hoạt hàng ngày",
      description: "Học tiếng Hàn trong cuộc sống thực tế",
      color: PHASE_COLORS[2],
      icon: "ri-sun-line",
      steps: [
        {
          id: "eps-lesson-6",
          title: "Bài 6: Sinh hoạt hàng ngày",
          titleVi: "하루 일과 — Giờ giấc, thói quen",
          description: "Học cách nói giờ, mô tả thói quen hàng ngày",
          icon: "ri-time-line",
          color: "#fb923c",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 25,
          isCompleted: !!lessonProgress[6],
          isUnlocked: !!lessonProgress[5],
          progress: lessonProgress[6] ? 100 : 0,
        },
        {
          id: "eps-lesson-7",
          title: "Bài 7: Thời tiết và Mùa",
          titleVi: "계절과 날씨 — 31 từ vựng",
          description: "Mô tả thời tiết, 4 mùa ở Hàn Quốc",
          icon: "ri-sun-cloudy-line",
          color: "#fb923c",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 20,
          isCompleted: !!lessonProgress[7],
          isUnlocked: !!lessonProgress[6],
          progress: lessonProgress[7] ? 100 : 0,
        },
        {
          id: "eps-lesson-8",
          title: "Bài 8: Gia đình và Bạn bè",
          titleVi: "가족과 친구 — Kính ngữ",
          description: "Xưng hô gia đình, kính ngữ tiếng Hàn",
          icon: "ri-team-line",
          color: "#fb923c",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 25,
          isCompleted: !!lessonProgress[8],
          isUnlocked: !!lessonProgress[7],
          progress: lessonProgress[8] ? 100 : 0,
        },
        {
          id: "quiz-basic",
          title: "Quiz kiểm tra",
          titleVi: "Kiểm tra bài 1–8",
          description: "Ôn tập và kiểm tra kiến thức đã học",
          icon: "ri-survey-line",
          color: "#fb923c",
          route: "/quiz",
          type: "quiz",
          estimatedMinutes: 15,
          isCompleted: quizHistory.length >= 3,
          isUnlocked: !!lessonProgress[6],
          progress: Math.min(100, Math.round((quizHistory.length / 3) * 100)),
        },
      ],
    },
    {
      id: "phase4",
      title: "Giai đoạn 4: Thực hành giao tiếp",
      description: "Đặt món, mua sắm, giao thông",
      color: PHASE_COLORS[3],
      icon: "ri-chat-3-line",
      steps: [
        {
          id: "eps-lesson-9",
          title: "Bài 9: Đặt món ăn",
          titleVi: "음식 주문 — Đơn vị đếm",
          description: "Gọi món, đơn vị đếm tiếng Hàn",
          icon: "ri-restaurant-line",
          color: "#a78bfa",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 22,
          isCompleted: !!lessonProgress[9],
          isUnlocked: !!lessonProgress[8],
          progress: lessonProgress[9] ? 100 : 0,
        },
        {
          id: "eps-lesson-10",
          title: "Bài 10: Mua sắm đồ dùng",
          titleVi: "물건 구입 — Tiền tệ, giá cả",
          description: "Hỏi giá, thanh toán, mặc cả",
          icon: "ri-shopping-bag-line",
          color: "#a78bfa",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 22,
          isCompleted: !!lessonProgress[10],
          isUnlocked: !!lessonProgress[9],
          progress: lessonProgress[10] ? 100 : 0,
        },
        {
          id: "eps-lesson-11",
          title: "Bài 11: Việc nhà",
          titleVi: "집안일 — Phân loại rác",
          description: "Việc nhà, phân loại rác ở Hàn Quốc",
          icon: "ri-home-gear-line",
          color: "#a78bfa",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 22,
          isCompleted: !!lessonProgress[11],
          isUnlocked: !!lessonProgress[10],
          progress: lessonProgress[11] ? 100 : 0,
        },
        {
          id: "eps-lesson-12",
          title: "Bài 12: Giao thông công cộng",
          titleVi: "대중교통 — Phương tiện",
          description: "Sử dụng tàu điện ngầm, xe buýt, taxi",
          icon: "ri-bus-line",
          color: "#a78bfa",
          route: "/eps-lessons",
          type: "lesson",
          estimatedMinutes: 22,
          isCompleted: !!lessonProgress[12],
          isUnlocked: !!lessonProgress[11],
          progress: lessonProgress[12] ? 100 : 0,
        },
      ],
    },
    {
      id: "phase5",
      title: "Giai đoạn 5: Luyện thi EPS",
      description: "Chuẩn bị cho kỳ thi EPS-TOPIK",
      color: PHASE_COLORS[4],
      icon: "ri-trophy-line",
      steps: [
        {
          id: "eps-vocab",
          title: "Từ vựng EPS chuyên sâu",
          titleVi: "Học từ vựng theo chủ đề",
          description: "Từ vựng an toàn lao động, pháp luật, y tế",
          icon: "ri-book-2-line",
          color: "#06b6d4",
          route: "/eps-vocabulary",
          type: "lesson",
          estimatedMinutes: 30,
          isCompleted: epsDone >= 50,
          isUnlocked: !!lessonProgress[12],
          progress: Math.min(100, Math.round((epsDone / 50) * 100)),
        },
        {
          id: "eps-listening",
          title: "Luyện nghe EPS",
          titleVi: "Nghe và hiểu tiếng Hàn",
          description: "Luyện kỹ năng nghe qua bài tập thực tế",
          icon: "ri-headphone-line",
          color: "#06b6d4",
          route: "/eps-listening",
          type: "listening",
          estimatedMinutes: 25,
          isCompleted: false,
          isUnlocked: epsDone >= 30,
          progress: 0,
        },
        {
          id: "eps-exam-practice",
          title: "Thi thử EPS (40 câu)",
          titleVi: "Mục tiêu: đạt 60%+",
          description: "Làm đề thi thử đầy đủ 40 câu, 50 phút",
          icon: "ri-file-list-3-line",
          color: "#06b6d4",
          route: "/eps-exam",
          type: "exam",
          estimatedMinutes: 50,
          isCompleted: bestExamScore >= 60,
          isUnlocked: epsDone >= 50,
          progress: Math.min(100, Math.round((bestExamScore / 60) * 100)),
          badge: bestExamScore >= 80 ? "EPS Champion" : undefined,
        },
        {
          id: "eps-exam-advanced",
          title: "Thi thử nâng cao",
          titleVi: "Mục tiêu: đạt 80%+",
          description: "Luyện thi đến khi đạt điểm cao",
          icon: "ri-medal-line",
          color: "#06b6d4",
          route: "/eps-exam",
          type: "exam",
          estimatedMinutes: 50,
          isCompleted: bestExamScore >= 80,
          isUnlocked: bestExamScore >= 60,
          progress: Math.min(100, Math.round((bestExamScore / 80) * 100)),
        },
      ],
    },
    {
      id: "phase6",
      title: "Giai đoạn 6: Thành thạo",
      description: "Hoàn thiện kỹ năng và chuẩn bị đi Hàn",
      color: PHASE_COLORS[5],
      icon: "ri-vip-crown-line",
      steps: [
        {
          id: "topik-vocab",
          title: "Từ vựng TOPIK",
          titleVi: "Mở rộng vốn từ TOPIK I/II",
          description: "Học từ vựng cấp độ TOPIK để giao tiếp tự nhiên",
          icon: "ri-global-line",
          color: "#f87171",
          route: "/vocabulary",
          type: "lesson",
          estimatedMinutes: 30,
          isCompleted: flashcardKnown >= 100,
          isUnlocked: bestExamScore >= 60,
          progress: Math.min(100, Math.round((flashcardKnown / 100) * 100)),
        },
        {
          id: "grammar-advanced",
          title: "Ngữ pháp nâng cao",
          titleVi: "Cấu trúc câu phức tạp",
          description: "Học ngữ pháp để viết và nói tự nhiên hơn",
          icon: "ri-edit-line",
          color: "#f87171",
          route: "/grammar",
          type: "lesson",
          estimatedMinutes: 35,
          isCompleted: false,
          isUnlocked: bestExamScore >= 60,
          progress: 0,
        },
        {
          id: "eps-full-mastery",
          title: "Hoàn thành EPS",
          titleVi: "Đạt 80%+ tất cả chủ đề",
          description: "Mục tiêu cuối: thành thạo toàn bộ EPS-TOPIK",
          icon: "ri-vip-crown-line",
          color: "#f87171",
          route: "/eps-stats",
          type: "exam",
          estimatedMinutes: 60,
          isCompleted: epsAccuracy >= 80 && epsDone >= 100,
          isUnlocked: bestExamScore >= 80,
          progress: Math.min(100, Math.round(((epsAccuracy / 80) * 0.5 + (epsDone / 100) * 0.5) * 100)),
          badge: epsAccuracy >= 80 ? "EPS Master" : undefined,
        },
      ],
    },
  ], [answeredMap, flashcardProgress, hangulProgress, lessonProgress, examResults, quizHistory, epsDone, epsCorrect, epsAccuracy, flashcardKnown, hangulKnown, lessonsDone, bestExamScore]);

  // Find next recommended step
  const nextStep = useMemo(() => {
    for (const phase of phases) {
      for (const step of phase.steps) {
        if (step.isUnlocked && !step.isCompleted) {
          return { step, phase };
        }
      }
    }
    return null;
  }, [phases]);

  const totalSteps = phases.reduce((s, p) => s + p.steps.length, 0);
  const completedSteps = phases.reduce((s, p) => s + p.steps.filter(st => st.isCompleted).length, 0);
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  const currentPhaseIndex = phases.findIndex(p => p.steps.some(s => s.isUnlocked && !s.isCompleted));
  const currentPhase = phases[currentPhaseIndex] ?? phases[phases.length - 1];

  return (
    <DashboardLayout
      title="Lộ trình học"
      subtitle="Hệ thống gợi ý bài tiếp theo dựa trên tiến độ của bạn"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-4 py-2">
            <i className="ri-route-line text-app-accent-primary"></i>
            <span className="text-white/60 text-sm">{completedSteps}/{totalSteps} bước</span>
            <div className="w-20 h-1.5 bg-app-card/70 rounded-full overflow-hidden ml-1">
              <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-app-accent-primary text-sm font-bold">{overallProgress}%</span>
          </div>
        </div>
      }
    >
      {/* Next step banner */}
      {nextStep && (
        <div
          className="mb-6 rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg, ${nextStep.phase.color}15, ${nextStep.phase.color}08)`, border: `1px solid ${nextStep.phase.color}25` }}
          onClick={() => navigate(nextStep.step.route)}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${nextStep.phase.color}20` }}>
              <i className={`${nextStep.step.icon} text-2xl`} style={{ color: nextStep.phase.color }}></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${nextStep.phase.color}20`, color: nextStep.phase.color }}>
                  Tiếp theo
                </span>
                <span className="text-app-text-muted text-xs">{nextStep.phase.title}</span>
              </div>
              <h3 className="text-white font-bold text-base">{nextStep.step.title}</h3>
              <p className="text-white/50 text-sm">{nextStep.step.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-app-text-muted text-xs">{nextStep.step.estimatedMinutes} phút</p>
                {nextStep.step.progress !== undefined && nextStep.step.progress > 0 && (
                  <p className="text-xs font-semibold" style={{ color: nextStep.phase.color }}>{nextStep.step.progress}% hoàn thành</p>
                )}
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: `${nextStep.phase.color}20` }}>
                <i className="ri-arrow-right-line" style={{ color: nextStep.phase.color }}></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase list */}
      <div className="space-y-4">
        {phases.map((phase, phaseIdx) => {
          const phaseCompleted = phase.steps.filter(s => s.isCompleted).length;
          const phaseTotal = phase.steps.length;
          const phaseProgress = Math.round((phaseCompleted / phaseTotal) * 100);
          const isExpanded = expandedPhase === phase.id;
          const isCurrent = phase.id === currentPhase.id;
          const isLocked = phaseIdx > 0 && phases[phaseIdx - 1].steps.every(s => !s.isCompleted);

          return (
            <div
              key={phase.id}
              className={`rounded-2xl border transition-all ${isCurrent ? "border-white/15" : "border-app-border"}`}
              style={{ backgroundColor: isCurrent ? `${phase.color}08` : "#0f1117" }}
            >
              {/* Phase header */}
              <button
                className="w-full flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${phase.color}15` }}>
                  {phaseCompleted === phaseTotal ? (
                    <i className="ri-checkbox-circle-fill text-xl" style={{ color: phase.color }}></i>
                  ) : (
                    <i className={`${phase.icon} text-xl`} style={{ color: isLocked ? "rgba(255,255,255,0.2)" : phase.color }}></i>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-bold text-sm ${isLocked ? "text-app-text-muted" : "text-white"}`}>{phase.title}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${phase.color}20`, color: phase.color }}>
                        Đang học
                      </span>
                    )}
                    {phaseCompleted === phaseTotal && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success">
                        Hoàn thành
                      </span>
                    )}
                  </div>
                  <p className="text-app-text-muted text-xs">{phase.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: phase.color }}>{phaseCompleted}/{phaseTotal}</p>
                    <div className="w-16 h-1 bg-app-card/70 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full transition-all" style={{ width: `${phaseProgress}%`, backgroundColor: phase.color }} />
                    </div>
                  </div>
                  <i className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line text-app-text-muted text-lg`}></i>
                </div>
              </button>

              {/* Steps */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-3">
                  {phase.steps.map((step, stepIdx) => {
                    const isStepLocked = !step.isUnlocked;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          step.isCompleted
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : isStepLocked
                            ? "border-app-border bg-white/2 opacity-50"
                            : "border-app-border bg-app-surface/50 cursor-pointer hover:bg-app-card/50"
                        }`}
                        onClick={() => !isStepLocked && navigate(step.route)}
                      >
                        {/* Step number / status */}
                        <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: step.isCompleted ? "rgba(52,211,153,0.15)" : isStepLocked ? "rgba(255,255,255,0.05)" : `${step.color}15` }}>
                          {step.isCompleted ? (
                            <i className="ri-check-line text-app-accent-success text-sm"></i>
                          ) : isStepLocked ? (
                            <i className="ri-lock-line text-app-text-muted text-sm"></i>
                          ) : (
                            <i className={`${step.icon} text-sm`} style={{ color: step.color }}></i>
                          )}
                        </div>

                        {/* Step info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-sm font-semibold ${step.isCompleted ? "text-app-accent-success" : isStepLocked ? "text-app-text-muted" : "text-white"}`}>
                              {step.title}
                            </p>
                            {step.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">
                                {step.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-app-text-muted text-xs truncate">{step.titleVi}</p>
                          {step.progress !== undefined && step.progress > 0 && !step.isCompleted && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-app-card/70 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${step.progress}%`, backgroundColor: step.color }} />
                              </div>
                              <span className="text-[10px] font-semibold" style={{ color: step.color }}>{step.progress}%</span>
                            </div>
                          )}
                        </div>

                        {/* Time + action */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-app-text-muted text-xs">{step.estimatedMinutes}p</span>
                          {!isStepLocked && !step.isCompleted && (
                            <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${step.color}15` }}>
                              <i className="ri-arrow-right-line text-xs" style={{ color: step.color }}></i>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          { label: "Bài học hoàn thành", value: lessonsDone, icon: "ri-book-open-line", color: "#e8c84a" },
          { label: "Từ vựng đã thuộc", value: flashcardKnown, icon: "ri-stack-line", color: "#34d399" },
          { label: "Câu EPS đã làm", value: epsDone, icon: "ri-file-list-3-line", color: "#fb923c" },
          { label: "Điểm thi cao nhất", value: `${bestExamScore}%`, icon: "ri-trophy-line", color: "#a78bfa" },
        ].map((stat, i) => (
          <div key={i} className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
            </div>
            <p className="text-white font-bold text-xl">{stat.value}</p>
            <p className="text-app-text-muted text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
