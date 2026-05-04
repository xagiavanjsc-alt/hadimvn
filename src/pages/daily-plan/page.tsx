import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { EPS_TOPICS } from "@/mocks/epsQuestions";

interface ExamResult {
  date: string;
  score: number;
  total: number;
  topicScores: Record<string, { correct: number; total: number }>;
}

interface DailyTask {
  id: string;
  type: "eps" | "flashcard" | "news" | "hangul" | "quiz" | "review";
  title: string;
  desc: string;
  duration: number;
  xp: number;
  icon: string;
  color: string;
  path: string;
  priority: "high" | "medium" | "low";
  reason: string;
  completed: boolean;
}

interface WeakTopic {
  id: string;
  label: string;
  score: number;
  color: string;
}

function getWeakTopics(examResults: ExamResult[]): WeakTopic[] {
  if (!examResults.length) return [];
  const topicTotals: Record<string, { correct: number; total: number }> = {};
  examResults.slice(-3).forEach((r) => {
    Object.entries(r.topicScores || {}).forEach(([tid, s]) => {
      if (!topicTotals[tid]) topicTotals[tid] = { correct: 0, total: 0 };
      topicTotals[tid].correct += s.correct;
      topicTotals[tid].total += s.total;
    });
  });
  return EPS_TOPICS.map((t) => {
    const s = topicTotals[t.id];
    const score = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : -1;
    return { id: t.id, label: t.label, score, color: t.color };
  })
    .filter((t) => t.score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

function generateDailyPlan(
  streak: number,
  examResults: ExamResult[],
  completedToday: string[]
): DailyTask[] {
  const weakTopics = getWeakTopics(examResults);
  const hasExamHistory = examResults.length > 0;
  const lastExam = examResults[examResults.length - 1];
  const daysSinceExam = lastExam
    ? Math.floor((Date.now() - new Date(lastExam.date).getTime()) / 86400000)
    : 999;

  const tasks: DailyTask[] = [];

  // Task 1: Warm-up based on streak
  if (streak < 3) {
    tasks.push({
      id: "hangul-warmup",
      type: "hangul",
      title: "Ôn l?i Hangul co b?n",
      desc: "5 phút ôn b?ng ch? cái — kh?i d?ng nh? nhàng",
      duration: 5,
      xp: 10,
      icon: "ri-font-size",
      color: "app-accent-primary",
      path: "/hangul",
      priority: "medium",
      reason: "Streak m?i b?t d?u — xây d?ng thói quen h?c m?i ngày",
      completed: completedToday.includes("hangul-warmup"),
    });
  } else {
    tasks.push({
      id: "flashcard-review",
      type: "flashcard",
      title: "Ôn Flashcard hàng ngày",
      desc: "20 th? t? v?ng — duy trì streak " + streak + " ngày",
      duration: 10,
      xp: 25,
      icon: "ri-stack-line",
      color: "#4ade80",
      path: "/flashcard",
      priority: "medium",
      reason: `Streak ${streak} ngày — ti?p t?c duy trì dà h?c t?t!`,
      completed: completedToday.includes("flashcard-review"),
    });
  }

  // Task 2: Weak topic EPS (if has history)
  if (weakTopics.length > 0) {
    const weakest = weakTopics[0];
    tasks.push({
      id: `eps-weak-${weakest.id}`,
      type: "eps",
      title: `Luy?n EPS: ${weakest.label}`,
      desc: `Ði?m y?u nh?t c?a b?n (${weakest.score}%) — t?p trung ôn ch? d? này`,
      duration: 15,
      xp: 30,
      icon: "ri-file-list-3-line",
      color: "#f87171",
      path: "/quiz",
      priority: "high",
      reason: `AI phát hi?n b?n ch? d?t ${weakest.score}% ? ch? d? này — c?n ôn g?p!`,
      completed: completedToday.includes(`eps-weak-${weakest.id}`),
    });
  } else {
    tasks.push({
      id: "eps-practice",
      type: "eps",
      title: "Luy?n thi EPS hôm nay",
      desc: "10 câu EPS ng?u nhiên — ki?m tra ki?n th?c t?ng h?p",
      duration: 15,
      xp: 30,
      icon: "ri-file-list-3-line",
      color: "#60a5fa",
      path: "/eps",
      priority: "medium",
      reason: "Chua có l?ch s? thi — b?t d?u luy?n d? AI phân tích di?m y?u",
      completed: completedToday.includes("eps-practice"),
    });
  }

  // Task 3: News reading
  tasks.push({
    id: "news-reading",
    type: "news",
    title: "Ð?c tin t?c ti?ng Hàn",
    desc: "1 bài báo + h?c t? v?ng inline — h?c trong ng? c?nh th?t",
    duration: 20,
    xp: 20,
    icon: "ri-newspaper-line",
    color: "#a78bfa",
    path: "/news",
    priority: "medium",
    reason: "H?c t? v?ng qua tin t?c th?t giúp nh? lâu hon 3x so v?i h?c thu?c lòng",
    completed: completedToday.includes("news-reading"),
  });

  // Task 4: Mock exam (if hasn't done in 3+ days)
  if (daysSinceExam >= 3 || !hasExamHistory) {
    tasks.push({
      id: "eps-exam",
      type: "quiz",
      title: "Thi th? EPS d?y d?",
      desc: "40 câu · 50 phút — do lu?ng ti?n d? th?c t?",
      duration: 50,
      xp: 20,
      icon: "ri-timer-line",
      color: "#fb923c",
      path: "/eps-exam",
      priority: hasExamHistory ? "medium" : "high",
      reason: hasExamHistory
        ? `Ðã ${daysSinceExam} ngày chua thi — c?n c?p nh?t phân tích di?m y?u`
        : "Chua có l?ch s? thi — làm bài d?u tiên d? AI l?p l? trình cho b?n!",
      completed: completedToday.includes("eps-exam"),
    });
  }

  // Task 5: Second weak topic (if exists)
  if (weakTopics.length > 1) {
    const second = weakTopics[1];
    tasks.push({
      id: `eps-weak2-${second.id}`,
      type: "review",
      title: `Ôn l?i: ${second.label}`,
      desc: `Ði?m ${second.score}% — c?n c?i thi?n thêm`,
      duration: 10,
      xp: 15,
      icon: "ri-refresh-line",
      color: "#f59e0b",
      path: "/quiz",
      priority: "low",
      reason: `Ch? d? y?u th? 2 — ôn thêm d? cân b?ng di?m s?`,
      completed: completedToday.includes(`eps-weak2-${second.id}`),
    });
  }

  return tasks;
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "Uu tiên cao", color: "text-red-400 bg-red-400/10" },
  medium: { label: "Nên làm", color: "text-app-accent-primary bg-app-accent-primary/10" },
  low: { label: "Tùy ch?n", color: "text-app-text-secondary bg-app-card/50" },
};

export default function DailyPlanPage() {
  const navigate = useNavigate();
  const { addXP } = useXPSystem();
  const [examResults] = useLocalStorage<ExamResult[]>("kts_exam_results", []);
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [completedToday, setCompletedToday] = useLocalStorage<string[]>("kts_daily_completed", []);
  const [lastCompletedDate, setLastCompletedDate] = useLocalStorage<string>("kts_daily_date", "");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Reset completed tasks if new day
    if (lastCompletedDate !== today) {
      setCompletedToday([]);
      setLastCompletedDate(today);
    }
  }, []);

  useEffect(() => {
    const plan = generateDailyPlan(streak.count, examResults, completedToday);
    setTasks(plan);
    const xp = plan.filter((t) => t.completed).reduce((sum, t) => sum + t.xp, 0);
    setXpGained(xp);
  }, [examResults, streak.count, completedToday]);

  const totalXp = tasks.reduce((sum, t) => sum + t.xp, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
  const remainingMinutes = tasks.filter((t) => !t.completed).reduce((sum, t) => sum + t.duration, 0);

  const handleMarkDone = (taskId: string) => {
    if (!completedToday.includes(taskId)) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Award XP based on task type
        let xpEvent: { type: string; amount?: number } | null = null;
        switch (task.type) {
          case "flashcard":
            xpEvent = { type: "flashcard_learned", amount: task.xp };
            break;
          case "eps":
          case "review":
            xpEvent = { type: "eps_question_correct", amount: task.xp };
            break;
          case "quiz":
            xpEvent = { type: "eps_exam_completed", amount: task.xp };
            break;
          case "news":
            xpEvent = { type: "manual_bonus", amount: task.xp };
            break;
          case "hangul":
            xpEvent = { type: "manual_bonus", amount: task.xp };
            break;
          default:
            xpEvent = { type: "manual_bonus", amount: task.xp };
        }
        if (xpEvent) {
          addXP(xpEvent.amount, xpEvent.type);
        }
      }
      setCompletedToday([...completedToday, taskId]);
    }
    setSelectedTask(null);
  };

  const handleStartTask = (task: DailyTask) => {
    navigate(task.path);
  };

  const weakTopics = getWeakTopics(examResults);

  const dateStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-app-bg text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-app-text-secondary text-xs mb-2">
            <i className="ri-calendar-line"></i>
            <span>{dateStr}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">L? trình h?c hôm nay</h1>
          <p className="text-white/50 text-sm">AI dã phân tích k?t qu? c?a b?n và t?o k? ho?ch t?i uu</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Daily Progress */}
          <div className="md:col-span-2 bg-app-surface/50 border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/50 text-xs mb-1">Ti?n d? hôm nay</p>
                <p className="text-white font-bold text-xl">
                  {completedCount}/{tasks.length} nhi?m v?
                </p>
              </div>
              <div className="text-right">
                <p className="text-app-accent-primary font-bold text-xl">+{xpGained} XP</p>
                <p className="text-app-text-secondary text-xs">/{totalXp} XP t?ng</p>
              </div>
            </div>
            <div className="w-full bg-white/8 rounded-full h-2.5 mb-3">
              <div
                className="bg-gradient-to-r from-[app-accent-primary] to-[#f0d060] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-app-text-secondary">
              <span>{Math.round(progress)}% hoàn thành</span>
              <span>Còn {remainingMinutes} phút</span>
            </div>
          </div>

          {/* Streak + Stats */}
          <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-app-accent-primary/10 flex items-center justify-center">
                <i className="ri-fire-line text-app-accent-primary text-xl"></i>
              </div>
              <div>
                <p className="text-white font-bold text-xl">{streak.count}</p>
                <p className="text-app-text-secondary text-xs">ngày liên ti?p</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">T?ng th?i gian</span>
                <span className="text-white">{totalMinutes} phút</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">L?n thi g?n nh?t</span>
                <span className="text-white">
                  {examResults.length > 0
                    ? `${examResults[examResults.length - 1].score}/${examResults[examResults.length - 1].total}`
                    : "Chua thi"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {weakTopics.length > 0 && (
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-robot-line text-app-accent-primary text-sm"></i>
              </div>
              <div>
                <p className="text-app-accent-primary font-semibold text-sm mb-1">Phân tích AI</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  D?a trên {examResults.length} l?n thi g?n dây, AI phát hi?n b?n c?n c?i thi?n:{" "}
                  {weakTopics.map((t, i) => (
                    <span key={t.id}>
                      <strong className="text-white">{t.label}</strong> ({t.score}%)
                      {i < weakTopics.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  . L? trình hôm nay du?c t?i uu d? t?p trung vào các ch? d? này.
                </p>
              </div>
            </div>
          </div>
        )}

        {!examResults.length && (
          <div className="bg-[#60a5fa]/5 border border-[#60a5fa]/15 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#60a5fa]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-[#60a5fa] text-sm"></i>
              </div>
              <div>
                <p className="text-[#60a5fa] font-semibold text-sm mb-1">Chua có d? li?u phân tích</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  Làm bài thi th? EPS d?u tiên d? AI phân tích di?m y?u và t?o l? trình cá nhân hóa cho b?n. L? trình hi?n t?i là m?c d?nh cho ngu?i m?i b?t d?u.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3 mb-8">
          <h2 className="text-white font-semibold text-base mb-4">Nhi?m v? hôm nay</h2>
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                task.completed
                  ? "bg-white/2 border-app-border opacity-60"
                  : "bg-app-surface/50 border-app-border hover:border-white/15"
              }`}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start gap-4">
                {/* Number + Icon */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${task.color}18` }}
                  >
                    {task.completed ? (
                      <i className="ri-check-line text-lg" style={{ color: task.color }}></i>
                    ) : (
                      <i className={`${task.icon} text-lg`} style={{ color: task.color }}></i>
                    )}
                  </div>
                  <span className="text-app-text-muted text-[9px]">#{idx + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold text-sm ${task.completed ? "line-through text-app-text-secondary" : "text-white"}`}>
                      {task.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_LABELS[task.priority].color}`}>
                      {PRIORITY_LABELS[task.priority].label}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mb-2">{task.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-white/35">
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line"></i>
                      {task.duration} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-star-line text-app-accent-primary"></i>
                      +{task.xp} XP
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                {!task.completed && (
                  <i className="ri-arrow-right-s-line text-app-text-muted text-lg flex-shrink-0 mt-2"></i>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Banner */}
        {completedCount === tasks.length && tasks.length > 0 && (
          <div className="bg-gradient-to-r from-[app-accent-primary]/10 to-[#4ade80]/10 border border-app-accent-primary/20 rounded-2xl p-6 text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-app-accent-primary/15 flex items-center justify-center mx-auto mb-3">
              <i className="ri-trophy-line text-app-accent-primary text-2xl"></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Hoàn thành l? trình hôm nay!</h3>
            <p className="text-white/50 text-sm mb-3">
              B?n dã ki?m du?c <strong className="text-app-accent-primary">+{xpGained} XP</strong> hôm nay. Tuy?t v?i!
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="bg-app-accent-primary text-[#0a0c10] font-semibold px-5 py-2 rounded-lg text-sm hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer"
            >
              Xem h? so h?c viên
            </button>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white/2 border border-app-border rounded-2xl p-5">
          <p className="text-app-text-secondary text-xs tracking-normal mb-4">Truy c?p nhanh</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Thi th? EPS", icon: "ri-timer-line", path: "/eps-exam", color: "#fb923c" },
              { label: "So sánh ti?n d?", icon: "ri-radar-line", path: "/progress", color: "#a78bfa" },
              { label: "Th?ng kê", icon: "ri-bar-chart-box-line", path: "/learn-stats", color: "#4ade80" },
              { label: "H? so", icon: "ri-user-3-line", path: "/profile", color: "app-accent-primary" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center gap-2 p-3 bg-app-surface/50 border border-app-border rounded-xl hover:border-white/15 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className={`${link.icon} text-lg`} style={{ color: link.color }}></i>
                </div>
                <span className="text-white/60 text-xs text-center">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#13161e] border border-app-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${selectedTask.color}18` }}
              >
                <i className={`${selectedTask.icon} text-2xl`} style={{ color: selectedTask.color }}></i>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1">{selectedTask.title}</h3>
                <p className="text-white/50 text-sm">{selectedTask.desc}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-app-text-muted hover:text-white cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* AI Reason */}
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-3 mb-5">
              <div className="flex items-start gap-2">
                <i className="ri-robot-line text-app-accent-primary text-sm mt-0.5"></i>
                <p className="text-white/60 text-xs leading-relaxed">{selectedTask.reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-5 text-sm">
              <div className="flex items-center gap-1.5 text-white/50">
                <i className="ri-time-line"></i>
                <span>{selectedTask.duration} phút</span>
              </div>
              <div className="flex items-center gap-1.5 text-app-accent-primary">
                <i className="ri-star-line"></i>
                <span>+{selectedTask.xp} XP</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_LABELS[selectedTask.priority].color}`}>
                {PRIORITY_LABELS[selectedTask.priority].label}
              </span>
            </div>

            {selectedTask.completed ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-app-card/50 rounded-xl text-app-text-secondary text-sm">
                <i className="ri-check-double-line text-[#4ade80]"></i>
                Ðã hoàn thành hôm nay
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleStartTask(selectedTask)}
                  className="w-full bg-app-accent-primary text-[#0a0c10] font-bold py-3 rounded-xl text-sm hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer"
                >
                  B?t d?u ngay
                </button>
                <p className="text-center text-app-text-muted text-[11px] mt-3">
                  <i className="ri-information-line mr-1"></i>
                  XP du?c c?ng t? d?ng khi b?n hoàn thành bài h?c th?c t? (thi, flashcard, dang bài...)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
