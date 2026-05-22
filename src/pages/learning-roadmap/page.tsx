import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Goal = "eps" | "seoul" | "topik" | "hanja" | "conversation";
type Level = "beginner" | "intermediate" | "advanced";
type LevelFilter = "all" | "beginner" | "advanced";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  estimatedDays: number;
  isOptional?: boolean;
  badge?: string;
}

interface PhaseGroup {
  label: string;
  steps: RoadmapStep[];
}

const GOAL_ROADMAPS: Record<Goal, { title: string; subtitle: string; icon: string; color: string; beginnerFriendly: boolean; levelLabel: string; phases: PhaseGroup[] }> = {
  eps: {
    title: "Luyện thi EPS-TOPIK",
    subtitle: "Không biết tiếng Hàn cũng học được — lộ trình rõ từng bước",
    icon: "ri-file-list-3-line",
    color: "#4ade80",
    beginnerFriendly: true,
    levelLabel: "Phù hợp người mới 100%",
    phases: [
      {
        label: "Nền tảng",
        steps: [
          { id: "eps-hangul", title: "Học bảng chữ Hangul", description: "Bắt đầu từ đây! Học 40 ký tự trong 7 ngày — ai cũng làm được", icon: "ri-font-size", color: "#34d399", path: "/hangul", estimatedDays: 7 },
          { id: "eps-vocab-basic", title: "Từ vựng cơ bản EPS", description: "500 từ vựng hay gặp nhất trong đề thi, học kèm hình ảnh dễ nhớ", icon: "ri-translate-2", color: "#4ade80", path: "/eps-vocabulary", estimatedDays: 14 },
        ],
      },
      {
        label: "Học bài chính thức",
        steps: [
          { id: "eps-lessons", title: "60 Bài học EPS", description: "Học từng bài một theo giáo trình chính thức — không cần học hết một lúc", icon: "ri-book-open-line", color: "#eab308", path: "/eps-lessons", estimatedDays: 30 },
          { id: "eps-grammar", title: "Ngữ pháp EPS", description: "Chỉ cần nắm các mẫu câu hay xuất hiện trong đề thi", icon: "ri-book-2-line", color: "#fb923c", path: "/eps-grammar", estimatedDays: 14, isOptional: true },
        ],
      },
      {
        label: "Luyện tập",
        steps: [
          { id: "eps-listening", title: "Luyện nghe EPS", description: "Nghe nhiều lần quen tai — đây là phần dễ lấy điểm nhất", icon: "ri-headphone-line", color: "#60a5fa", path: "/eps-listening", estimatedDays: 14 },
          { id: "eps-flashcard", title: "Flashcard EPS", description: "Ôn từ vựng mỗi ngày 10 phút bằng thẻ thông minh", icon: "ri-stack-line", color: "#a78bfa", path: "/eps-flashcard", estimatedDays: 21, isOptional: true },
        ],
      },
      {
        label: "Ôn thi",
        steps: [
          { id: "eps-mock", title: "Thi thử mô phỏng", description: "Làm đề 40 câu trong 50 phút — quen áp lực trước khi thi thật", icon: "ri-timer-line", color: "#f87171", path: "/eps-exam", estimatedDays: 7, badge: "Quan trọng" },
          { id: "eps-wrong", title: "Ôn câu sai", description: "Xem lại những câu làm sai và ôn kỹ — cách hiệu quả nhất để tăng điểm", icon: "ri-error-warning-line", color: "#fb923c", path: "/eps-smart-wrong", estimatedDays: 7 },
        ],
      },
      {
        label: "Chinh phục đề thi",
        steps: [
          { id: "eps-final", title: "Thi thử toàn bộ", description: "Đạt 80%+ ổn định thì bạn đã sẵn sàng thi thật!", icon: "ri-trophy-line", color: "#4ade80", path: "/eps-mock-exam", estimatedDays: 14, badge: "Mục tiêu" },
        ],
      },
    ],
  },
  seoul: {
    title: "Giáo trình Seoul (Du học)",
    subtitle: "Lộ trình học bài bản từ Seoul 1A đến TOPIK I",
    icon: "ri-book-3-line",
    color: "#60a5fa",
    beginnerFriendly: true,
    levelLabel: "Phù hợp người mới",
    phases: [
      { label: "Nền tảng", steps: [
        { id: "seoul-hangul", title: "Bảng chữ Hangul", description: "Học đọc và viết Hangul — bắt buộc trước khi học Seoul", icon: "ri-font-size", color: "#34d399", path: "/hangul", estimatedDays: 7 },
        { id: "seoul-placement", title: "Kiểm tra đầu vào", description: "Xác định trình độ hiện tại để bắt đầu đúng cấp độ", icon: "ri-brain-line", color: "#a78bfa", path: "/seoul-placement", estimatedDays: 1 },
      ]},
      { label: "Sơ cấp", steps: [
        { id: "seoul-1a", title: "Seoul 1A — Nhập môn", description: "Chào hỏi, giới thiệu bản thân, số đếm, ngày tháng", icon: "ri-book-3-line", color: "#60a5fa", path: "/seoul-textbook", estimatedDays: 30 },
        { id: "seoul-1b", title: "Seoul 1B — Cơ bản", description: "Mua sắm, giao thông, thời tiết, gia đình", icon: "ri-book-3-line", color: "#60a5fa", path: "/seoul-textbook", estimatedDays: 30 },
      ]},
      { label: "Trung cấp", steps: [
        { id: "seoul-2a", title: "Seoul 2A — Sơ cấp", description: "Sở thích, kế hoạch, kinh nghiệm, cảm xúc", icon: "ri-book-3-line", color: "#38bdf8", path: "/seoul-textbook", estimatedDays: 45 },
        { id: "seoul-flashcard", title: "Flashcard Seoul", description: "Ôn tập từ vựng theo từng bài học", icon: "ri-stack-line", color: "#a78bfa", path: "/seoul-flashcard", estimatedDays: 30, isOptional: true },
      ]},
      { label: "Nâng cao", steps: [
        { id: "seoul-2b", title: "Seoul 2B — Trung cấp", description: "Xã hội, văn hóa, tin tức, thảo luận", icon: "ri-book-3-line", color: "#38bdf8", path: "/seoul-textbook", estimatedDays: 45 },
        { id: "seoul-exam", title: "Kiểm tra định kỳ", description: "Thi thử theo từng bài để đánh giá tiến độ", icon: "ri-file-list-2-line", color: "#eab308", path: "/seoul-exam", estimatedDays: 7 },
      ]},
      { label: "Chinh phục TOPIK", steps: [
        { id: "seoul-topik", title: "Luyện thi TOPIK I", description: "Sau Seoul 2B, bạn đủ trình độ thi TOPIK I (cấp 1-2)", icon: "ri-trophy-line", color: "#60a5fa", path: "/topik-test", estimatedDays: 30, badge: "Mục tiêu" },
      ]},
    ],
  },
  topik: {
    title: "Luyện thi TOPIK (Chứng chỉ)",
    subtitle: "Lộ trình đạt chứng chỉ TOPIK I hoặc II — cần biết cơ bản",
    icon: "ri-survey-line",
    color: "#f472b6",
    beginnerFriendly: false,
    levelLabel: "Cần biết cơ bản trước",
    phases: [
      { label: "Tích lũy kiến thức", steps: [
        { id: "topik-vocab", title: "Từ vựng tần suất cao", description: "1000 từ xuất hiện nhiều nhất trong đề thi TOPIK", icon: "ri-translate-2", color: "#f472b6", path: "/topik-frequency-vocab", estimatedDays: 21 },
        { id: "topik-grammar", title: "Ngữ pháp theo cấp độ", description: "Các mẫu ngữ pháp quan trọng cho TOPIK I và II", icon: "ri-book-2-line", color: "#e879f9", path: "/topik-dictionary", estimatedDays: 21 },
      ]},
      { label: "Luyện kỹ năng", steps: [
        { id: "topik-listening", title: "Luyện nghe TOPIK", description: "Luyện nghe theo từng dạng câu hỏi trong đề thi", icon: "ri-headphone-line", color: "#60a5fa", path: "/topik-listening", estimatedDays: 14 },
        { id: "topik-reading", title: "Luyện đọc TOPIK", description: "Luyện đọc hiểu các dạng văn bản trong đề thi", icon: "ri-book-read-line", color: "#34d399", path: "/topik-reading", estimatedDays: 14 },
      ]},
      { label: "Ôn tập", steps: [
        { id: "topik-flashcard", title: "Flashcard TOPIK", description: "Ôn tập từ vựng và ngữ pháp bằng thẻ ghi nhớ", icon: "ri-stack-line", color: "#a78bfa", path: "/topik-flashcard", estimatedDays: 21, isOptional: true },
        { id: "topik-quiz", title: "Quiz theo chủ đề", description: "Luyện tập theo từng chủ đề: gia đình, công việc, xã hội...", icon: "ri-survey-line", color: "#fb923c", path: "/topik-topic-quiz", estimatedDays: 14 },
      ]},
      { label: "Chinh phục đề thi", steps: [
        { id: "topik-test1", title: "Thi thử TOPIK I", description: "Làm đề thi thử TOPIK I đầy đủ, mục tiêu 80%+", icon: "ri-file-list-2-line", color: "#f472b6", path: "/topik-test", estimatedDays: 7, badge: "Quan trọng" },
        { id: "topik-test2", title: "Thi thử TOPIK II", description: "Nâng cao — luyện thi TOPIK II cho cấp 3-6", icon: "ri-file-list-3-line", color: "#f87171", path: "/topik2-test", estimatedDays: 14, isOptional: true },
      ]},
    ],
  },
  hanja: {
    title: "Hán Hàn VIP",
    subtitle: "Lộ trình học 2.691 từ Hán Hàn chuyên sâu",
    icon: "ri-character-recognition-line",
    color: "#eab308",
    beginnerFriendly: false,
    levelLabel: "Trung cấp trở lên",
    phases: [
      { label: "Làm quen", steps: [
        { id: "hanja-intro", title: "Giới thiệu Hán Hàn", description: "Hiểu về từ gốc Hán trong tiếng Hàn và tầm quan trọng", icon: "ri-information-line", color: "#eab308", path: "/hanja-detail", estimatedDays: 3 },
        { id: "hanja-flashcard-basic", title: "Flashcard Hán Hàn", description: "Ôn tập từ Hán Hàn bằng thẻ lật để nhớ nhanh và lâu hơn", icon: "ri-stack-line", color: "#fb923c", path: "/hanja-flashcard", estimatedDays: 14 },
      ]},
      { label: "Học hàng ngày", steps: [
        { id: "hanja-daily", title: "Học từ mới hôm nay", description: "Mỗi ngày học 8 từ mới — duy trì streak học tập", icon: "ri-sun-line", color: "#4ade80", path: "/daily-words", estimatedDays: 30, badge: "Hàng ngày" },
        { id: "hanja-flashcard", title: "Flashcard Hán Hàn", description: "Ôn tập từ đã học bằng thẻ ghi nhớ thông minh", icon: "ri-stack-line", color: "#a78bfa", path: "/flashcard", estimatedDays: 30 },
      ]},
      { label: "Luyện tập nâng cao", steps: [
        { id: "hanja-sr", title: "Spaced Repetition", description: "Hệ thống ôn tập thông minh — không bao giờ quên từ đã học", icon: "ri-brain-line", color: "#a78bfa", path: "/hanja-dashboard", estimatedDays: 60, badge: "Quan trọng" },
        { id: "hanja-search", title: "Tra cứu Hán Hàn", description: "Tra từ điển nâng cao khi gặp từ mới trong cuộc sống", icon: "ri-search-2-line", color: "#60a5fa", path: "/advanced-dictionary", estimatedDays: 0, isOptional: true },
      ]},
      { label: "Mục tiêu dài hạn", steps: [
        { id: "hanja-1000", title: "Mục tiêu 1000 từ", description: "Học và thuộc 1000 từ Hán Hàn đầu tiên", icon: "ri-trophy-line", color: "#eab308", path: "/hanja-dashboard", estimatedDays: 90, badge: "Mục tiêu" },
        { id: "hanja-2691", title: "Mục tiêu 2691 từ", description: "Hoàn thành toàn bộ 2.691 từ Hán Hàn VIP", icon: "ri-vip-crown-line", color: "#f87171", path: "/hanja-dashboard", estimatedDays: 365, badge: "VIP" },
      ]},
    ],
  },
  conversation: {
    title: "Giao tiếp thực tế",
    subtitle: "Lộ trình nói tiếng Hàn tự nhiên trong cuộc sống",
    icon: "ri-chat-voice-line",
    color: "#fb923c",
    beginnerFriendly: true,
    levelLabel: "Phù hợp người mới",
    phases: [
      { label: "Nền tảng", steps: [
        { id: "conv-hangul", title: "Bảng chữ Hangul", description: "Đọc và viết Hangul — nền tảng bắt buộc", icon: "ri-font-size", color: "#34d399", path: "/hangul", estimatedDays: 7 },
        { id: "conv-basic", title: "Từ vựng giao tiếp cơ bản", description: "200 từ và cụm từ thường dùng nhất trong giao tiếp", icon: "ri-translate-2", color: "#fb923c", path: "/vocabulary", estimatedDays: 14 },
      ]},
      { label: "Luyện phát âm", steps: [
        { id: "conv-pronunciation", title: "Luyện phát âm AI", description: "AI chấm phát âm và sửa lỗi theo thời gian thực", icon: "ri-mic-line", color: "#f472b6", path: "/ai-pronunciation", estimatedDays: 21 },
        { id: "conv-phrases", title: "Cụm từ giao tiếp", description: "Học các cụm từ thực tế: mua sắm, nhà hàng, đường phố", icon: "ri-chat-3-line", color: "#60a5fa", path: "/phrase-dictionary", estimatedDays: 14 },
      ]},
      { label: "Luyện hội thoại", steps: [
        { id: "conv-ai", title: "Gia sư AI", description: "Luyện hội thoại với AI — không ngại nói sai", icon: "ri-robot-2-line", color: "#a78bfa", path: "/ai-chatbot", estimatedDays: 30, badge: "AI" },
        { id: "conv-kdrama", title: "Học qua phim Hàn", description: "Nghe và học từ vựng tự nhiên qua phim, K-pop", icon: "ri-film-line", color: "#fb923c", path: "/kdrama-learn", estimatedDays: 30, isOptional: true },
      ]},
      { label: "Nâng cao", steps: [
        { id: "conv-podcast", title: "Luyện nghe Podcast", description: "Nghe podcast tiếng Hàn theo cấp độ", icon: "ri-headphone-line", color: "#34d399", path: "/podcast-learn", estimatedDays: 30 },
        { id: "conv-writing", title: "Luyện viết AI", description: "AI chấm bài viết và gợi ý cải thiện", icon: "ri-quill-pen-line", color: "#fb923c", path: "/ai-writing", estimatedDays: 21, isOptional: true },
      ]},
    ],
  },
};

const GOAL_OPTIONS: { id: Goal; title: string; subtitle: string; icon: string; color: string; beginnerFriendly: boolean; levelLabel: string }[] = [
  { id: "eps", title: "EPS-TOPIK", subtitle: "Không biết tiếng Hàn cũng học được", icon: "ri-file-list-3-line", color: "#4ade80", beginnerFriendly: true, levelLabel: "Phù hợp người mới 100%" },
  { id: "conversation", title: "Giao tiếp", subtitle: "Nói chuyện tự nhiên", icon: "ri-chat-voice-line", color: "#fb923c", beginnerFriendly: true, levelLabel: "Phù hợp người mới" },
  { id: "seoul", title: "Giáo trình Seoul", subtitle: "Du học, học thuật", icon: "ri-book-3-line", color: "#60a5fa", beginnerFriendly: true, levelLabel: "Phù hợp người mới" },
  { id: "topik", title: "Luyện thi TOPIK", subtitle: "Chứng chỉ quốc tế", icon: "ri-survey-line", color: "#f472b6", beginnerFriendly: false, levelLabel: "Cần biết cơ bản trước" },
  { id: "hanja", title: "Hán Hàn VIP", subtitle: "Từ vựng chuyên sâu", icon: "ri-character-recognition-line", color: "#eab308", beginnerFriendly: false, levelLabel: "Trung cấp trở lên" },
];

function StepCard({ step, isCompleted, isCurrent, onStart }: {
  step: RoadmapStep;
  isCompleted: boolean;
  isCurrent: boolean;
  onStart: () => void;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all ${
        isCurrent ? "border-opacity-60 scale-[1.01]" : isCompleted ? "opacity-70" : ""
      }`}
      style={{
        backgroundColor: isCurrent ? `${step.color}08` : "#0f1117",
        borderColor: isCurrent ? `${step.color}40` : isCompleted ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
      }}
    >
      {step.badge && (
        <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold"
          style={{ backgroundColor: `${step.color}20`, color: step.color }}>
          {step.badge}
        </span>
      )}
      {step.isOptional && (
        <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted font-medium">
          Tùy chọn
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${isCompleted ? "bg-app-accent-success/15" : ""}`}
          style={{ backgroundColor: isCompleted ? undefined : `${step.color}15` }}>
          {isCompleted ? (
            <i className="ri-check-line text-app-accent-success text-base"></i>
          ) : (
            <i className={`${step.icon} text-base`} style={{ color: step.color }}></i>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>{step.title}</p>
          <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{step.description}</p>
          {step.estimatedDays > 0 && (
            <p className="text-app-text-muted text-[10px] mt-1.5">
              <i className="ri-time-line mr-1"></i>
              ~{step.estimatedDays} ngày
            </p>
          )}
        </div>
      </div>

      {isCurrent && (
        <button
          onClick={onStart}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
          style={{ backgroundColor: `${step.color}20`, color: step.color, border: `1px solid ${step.color}30` }}
        >
          <i className="ri-play-fill"></i>
          Bắt đầu ngay
        </button>
      )}
    </div>
  );
}

export default function LearningRoadmapPage() {
  const navigate = useNavigate();
  const [savedGoal, setSavedGoal] = useLocalStorage<Goal | null>("kts_roadmap_goal", null);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>("kts_roadmap_completed", []);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(savedGoal);
  const [showGoalPicker, setShowGoalPicker] = useState(!savedGoal);
  const [hanjaCount, setHanjaCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("hanja_pro").select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count !== null) setHanjaCount(count); });
  }, []);

  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const rawRoadmap = selectedGoal ? GOAL_ROADMAPS[selectedGoal] : null;
  const roadmap = useMemo(() => {
    if (!rawRoadmap || selectedGoal !== "hanja" || hanjaCount === null) return rawRoadmap;
    const n = hanjaCount.toLocaleString("vi-VN");
    return {
      ...rawRoadmap,
      subtitle: `Lộ trình học ${n} từ Hán Hàn chuyên sâu`,
      phases: rawRoadmap.phases.map(phase => ({
        ...phase,
        steps: phase.steps.map(step =>
          step.id === "hanja-2691"
            ? { ...step, title: `Mục tiêu ${n} từ`, description: `Hoàn thành toàn bộ ${n} từ Hán Hàn VIP` }
            : step
        ),
      })),
    };
  }, [rawRoadmap, selectedGoal, hanjaCount]);

  const allSteps = roadmap ? roadmap.phases.flatMap(p => p.steps) : [];
  const totalSteps = allSteps.filter(s => !s.isOptional).length;
  const doneSteps = allSteps.filter(s => completedSteps.includes(s.id) && !s.isOptional).length;
  const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const currentPhaseIdx = roadmap
    ? roadmap.phases.findIndex(phase => phase.steps.some(s => !completedSteps.includes(s.id) && !s.isOptional))
    : -1;

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setSavedGoal(goal);
    setShowGoalPicker(false);
  };

  const handleToggleStep = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId]
    );
  };

  const totalDays = roadmap
    ? allSteps.filter(s => !s.isOptional).reduce((sum, s) => sum + s.estimatedDays, 0)
    : 0;

  return (
    <DashboardLayout title="Lộ trình học" subtitle="Từ người mới hoàn toàn đến nâng cao — chọn đưỜng phù hợp với bạn">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Goal picker */}
        {showGoalPicker ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-white text-2xl font-bold mb-2">Bạn muốn học theo hướng nào?</h2>
              <p className="text-app-text-secondary text-sm">Chưa biết gì cũng không sao — có lộ trình cho mọi cấp độ, từ người mới đến nâng cao</p>
            </div>
            {/* Level filter */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {(["all", "beginner", "advanced"] as LevelFilter[]).map(f => (
                <button key={f} onClick={() => setLevelFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap border ${
                    levelFilter === f ? "bg-app-accent-primary/15 text-app-accent-primary border-app-accent-primary/30" : "bg-app-card/40 text-app-text-muted border-app-border"
                  }`}>
                  {f === "all" ? "Tất cả" : f === "beginner" ? "✦ Mới bắt đầu" : "Đã biết cơ bản"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOAL_OPTIONS
                .filter(g => levelFilter === "all" || (levelFilter === "beginner" ? g.beginnerFriendly : !g.beginnerFriendly))
                .map(goal => (
                <button
                  key={goal.id}
                  onClick={() => handleSelectGoal(goal.id)}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] text-center relative"
                  style={{ backgroundColor: "#0f1117", borderColor: goal.beginnerFriendly ? `${goal.color}25` : "rgba(255,255,255,0.07)" }}
                >
                  {goal.beginnerFriendly && (
                    <span className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400">
                      Người mới ✓
                    </span>
                  )}
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl" style={{ backgroundColor: `${goal.color}15` }}>
                    <i className={`${goal.icon} text-2xl`} style={{ color: goal.color }}></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{goal.title}</p>
                    <p className="text-app-text-secondary text-xs mt-0.5">{goal.subtitle}</p>
                    <p className="text-[10px] mt-1.5 font-semibold" style={{ color: goal.beginnerFriendly ? "#4ade80" : "#94a3b8" }}>
                      {goal.levelLabel}
                    </p>
                  </div>
                  <div className="w-full py-2 rounded-xl text-xs font-semibold transition-all" style={{ backgroundColor: `${goal.color}12`, color: goal.color }}>
                    Chọn lộ trình này
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : roadmap && selectedGoal ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl" style={{ backgroundColor: `${roadmap.color}15` }}>
                  <i className={`${roadmap.icon} text-2xl`} style={{ color: roadmap.color }}></i>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{roadmap.title}</h2>
                  <p className="text-app-text-secondary text-xs">{roadmap.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoalPicker(true)}
                className="text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-colors whitespace-nowrap"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <i className="ri-refresh-line mr-1"></i>
                Đổi mục tiêu
              </button>
            </div>

            {/* Progress */}
            <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">Tiến độ lộ trình</p>
                  <p className="text-white/35 text-xs mt-0.5">{doneSteps}/{totalSteps} bước hoàn thành · ~{totalDays} ngày</p>
                </div>
                <span className="text-2xl font-bold" style={{ color: roadmap.color }}>{progressPct}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden bg-app-card/50">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, backgroundColor: roadmap.color }}
                />
              </div>
              {progressPct === 100 && (
                <div className="mt-3 flex items-center gap-2 text-app-accent-success text-xs font-semibold">
                  <i className="ri-trophy-fill"></i>
                  Chúc mừng! Bạn đã hoàn thành lộ trình!
                </div>
              )}
            </div>

            {/* Phases */}
            <div className="space-y-6">
              {roadmap.phases.map((phase, phaseIdx) => {
                const isCurrentPhase = phaseIdx === currentPhaseIdx;
                const isPastPhase = phaseIdx < currentPhaseIdx;

                return (
                  <div key={phaseIdx}>
                    {/* Phase header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                        isPastPhase ? "bg-emerald-500/20 text-app-accent-success" : isCurrentPhase ? "text-white" : "bg-app-card/50 text-app-text-muted"
                      }`} style={isCurrentPhase ? { backgroundColor: `${roadmap.color}20`, color: roadmap.color } : {}}>
                        {isPastPhase ? <i className="ri-check-line text-xs"></i> : phaseIdx + 1}
                      </div>
                      <p className={`text-sm font-semibold ${isPastPhase ? "text-app-text-secondary" : isCurrentPhase ? "text-white" : "text-app-text-muted"}`}>
                        {phase.label}
                        {isCurrentPhase && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${roadmap.color}20`, color: roadmap.color }}>Đang học</span>}
                      </p>
                      <div className="flex-1 h-px bg-app-card/50"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                      {phase.steps.map(step => (
                        <div key={step.id} className="relative">
                          <StepCard
                            step={step}
                            isCompleted={completedSteps.includes(step.id)}
                            isCurrent={isCurrentPhase && !completedSteps.includes(step.id) && !step.isOptional}
                            onStart={() => navigate(step.path)}
                          />
                          {/* Manual complete toggle */}
                          <button
                            onClick={() => handleToggleStep(step.id)}
                            className={`absolute top-3 left-3 w-5 h-5 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                              completedSteps.includes(step.id)
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-white/15 bg-transparent hover:border-white/30"
                            }`}
                            title={completedSteps.includes(step.id) ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
                          >
                            {completedSteps.includes(step.id) && <i className="ri-check-line text-white text-[9px]"></i>}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="mt-8 p-5 rounded-2xl border border-white/6 bg-white/2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/10 flex-shrink-0">
                  <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-semibold mb-1">Mẹo học hiệu quả</p>
                  <p className="text-app-text-secondary text-xs leading-relaxed">
                    Nhấn vào ô tròn bên trái mỗi bước để đánh dấu hoàn thành. Học đều đặn mỗi ngày 30-60 phút sẽ hiệu quả hơn học dồn. Đừng bỏ qua bước nào — mỗi bước đều có lý do!
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
