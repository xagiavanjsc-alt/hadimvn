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
      title: "Ôn lại Hangul cơ bản",
      desc: "5 phút ôn bảng chữ cái — khởi động nhẹ nhàng",
      duration: 5,
      xp: 10,
      icon: "ri-font-size",
      color: "app-accent-primary",
      path: "/hangul",
      priority: "medium",
      reason: "Streak mới bắt đầu — xây dựng thói quen học mỗi ngày",
      completed: completedToday.includes("hangul-warmup"),
    });
  } else {
    tasks.push({
      id: "flashcard-review",
      type: "flashcard",
      title: "Ôn Flashcard hàng ngày",
      desc: "20 thẻ từ vựng — duy trì streak " + streak + " ngày (Lưu ý: XP từ vựng giới hạn 500 từ. Ví dụ: Học 100 từ = 400 XP, 500 từ = 2000 XP tối đa. Từ đã học sẽ không lặp lại. Tăng XP qua làm bài thi EPS)",
      duration: 10,
      xp: 25,
      icon: "ri-stack-line",
      color: "#4ade80",
      path: "/flashcard",
      priority: "medium",
      reason: `Streak ${streak} ngày — tiếp tục duy trì đà học tốt! (Lưu ý: XP từ vựng giới hạn ở 500 từ đã học. Học 500 từ = 2000 XP tối đa. Từ đã học sẽ không lặp lại. Tăng XP qua làm bài thi EPS để đạt thứ hạng cao hơn.)`,
      completed: completedToday.includes("flashcard-review"),
    });
  }

  // Task 2: Weak topic EPS (if has history)
  if (weakTopics.length > 0) {
    const weakest = weakTopics[0];
    tasks.push({
      id: `eps-weak-${weakest.id}`,
      type: "eps",
      title: `Luyện EPS: ${weakest.label}`,
      desc: `Điểm yếu nhất của bạn (${weakest.score}%) — tập trung ôn chủ đề này`,
      duration: 15,
      xp: 30,
      icon: "ri-file-list-3-line",
      color: "#f87171",
      path: "/quiz",
      priority: "high",
      reason: `AI phát hiện bạn chỉ đạt ${weakest.score}% ở chủ đề này — cần ôn gấp!`,
      completed: completedToday.includes(`eps-weak-${weakest.id}`),
    });
  } else {
    tasks.push({
      id: "eps-practice",
      type: "eps",
      title: "Luyện thi EPS hôm nay",
      desc: "10 câu EPS ngẫu nhiên — kiểm tra kiến thức tổng hợp",
      duration: 15,
      xp: 30,
      icon: "ri-file-list-3-line",
      color: "#60a5fa",
      path: "/eps",
      priority: "medium",
      reason: "Chưa có lịch sử thi — bắt đầu luyện để AI phân tích điểm yếu",
      completed: completedToday.includes("eps-practice"),
    });
  }

  // Task 3: News reading
  tasks.push({
    id: "news-reading",
    type: "news",
    title: "Đọc tin tức tiếng Hàn",
    desc: "1 bài báo + học từ vựng inline — học trong ngữ cảnh thật",
    duration: 20,
    xp: 20,
    icon: "ri-newspaper-line",
    color: "#a78bfa",
    path: "/news",
    priority: "medium",
    reason: "Học từ vựng qua tin tức thật giúp nhớ lâu hơn 3x so với học thuộc lòng",
    completed: completedToday.includes("news-reading"),
  });

  // Task 4: Mock exam (if hasn't done in 3+ days)
  if (daysSinceExam >= 3 || !hasExamHistory) {
    tasks.push({
      id: "eps-exam",
      type: "quiz",
      title: "Thi thử EPS đầy đủ",
      desc: "40 câu · 50 phút — đo lường tiến độ thực tế",
      duration: 50,
      xp: 20,
      icon: "ri-timer-line",
      color: "#fb923c",
      path: "/eps-exam",
      priority: hasExamHistory ? "medium" : "high",
      reason: hasExamHistory
        ? `Đã ${daysSinceExam} ngày chưa thi — cần cập nhật phân tích điểm yếu`
        : "Chưa có lịch sử thi — làm bài đầu tiên để AI lập lộ trình cho bạn!",
      completed: completedToday.includes("eps-exam"),
    });
  }

  // Task 5: Second weak topic (if exists)
  if (weakTopics.length > 1) {
    const second = weakTopics[1];
    tasks.push({
      id: `eps-weak2-${second.id}`,
      type: "review",
      title: `Ôn lại: ${second.label}`,
      desc: `Điểm ${second.score}% — cần cải thiện thêm`,
      duration: 10,
      xp: 15,
      icon: "ri-refresh-line",
      color: "#f59e0b",
      path: "/quiz",
      priority: "low",
      reason: `Chủ đề yếu thứ 2 — ôn thêm để cân bằng điểm số`,
      completed: completedToday.includes(`eps-weak2-${second.id}`),
    });
  }

  return tasks;
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "Ưu tiên cao", color: "text-red-400 bg-red-400/10" },
  medium: { label: "Nên làm", color: "text-app-accent-primary bg-app-accent-primary/10" },
  low: { label: "Tùy chọn", color: "text-app-text-secondary bg-app-card/50" },
};

export default function DailyPlanPage() {
  const navigate = useNavigate();
  const { addXP } = useXPSystem();
  const [examResults] = useLocalStorage<ExamResult[]>("kts_exam_results", []);
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [completedToday, setCompletedToday] = useLocalStorage<string[]>("kts_daily_completed", []);
  const [startedToday, setStartedToday] = useLocalStorage<string[]>("kts_daily_started", []);
  const [lastCompletedDate, setLastCompletedDate] = useLocalStorage<string>("kts_daily_date", "");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Reset completed tasks if new day
    if (lastCompletedDate !== today) {
      setCompletedToday([]);
      setStartedToday([]);
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
    if (!startedToday.includes(task.id)) {
      setStartedToday([...startedToday, task.id]);
    }
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-app-text-secondary text-xs">
              <i className="ri-calendar-line"></i>
              <span>{dateStr}</span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm cursor-pointer transition-colors"
            >
              <i className="ri-home-line"></i>Trang chủ
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Lộ trình học hôm nay</h1>
          <p className="text-white/50 text-sm">AI đã phân tích kết quả của bạn và tạo kế hoạch tối ưu</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Daily Progress */}
          <div className="md:col-span-2 bg-app-surface/50 border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/50 text-xs mb-1">Tiến độ hôm nay</p>
                <p className="text-white font-bold text-xl">
                  {completedCount}/{tasks.length} nhiệm vụ
                </p>
              </div>
              <div className="text-right">
                <p className="text-app-accent-primary font-bold text-xl">+{xpGained} XP</p>
                <p className="text-app-text-secondary text-xs">/{totalXp} XP tổng</p>
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
                <p className="text-app-text-secondary text-xs">ngày liên tiếp</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">Tổng thời gian</span>
                <span className="text-white">{totalMinutes} phút</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">Lần thi gần nhất</span>
                <span className="text-white">
                  {examResults.length > 0
                    ? `${examResults[examResults.length - 1].score}/${examResults[examResults.length - 1].total}`
                    : "Chưa thi"}
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
                  Dựa trên {examResults.length} lần thi gần đây, AI phát hiện bạn cần cải thiện:{" "}
                  {weakTopics.map((t, i) => (
                    <span key={t.id}>
                      <strong className="text-white">{t.label}</strong> ({t.score}%)
                      {i < weakTopics.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  . Lộ trình hôm nay được tối ưu để tập trung vào các chủ đề này.
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
                <p className="text-[#60a5fa] font-semibold text-sm mb-1">Chưa có dữ liệu phân tích</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  Làm bài thi thử EPS đầu tiên để AI phân tích điểm yếu và tạo lộ trình cá nhân hóa cho bạn. Lộ trình hiện tại là mặc định cho người mới bắt đầu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3 mb-8">
          <h2 className="text-white font-semibold text-base mb-4">Nhiệm vụ hôm nay</h2>
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
            <h3 className="text-white font-bold text-lg mb-1">Hoàn thành lộ trình hôm nay!</h3>
            <p className="text-white/50 text-sm mb-3">
              Bạn đã kiếm được <strong className="text-app-accent-primary">+{xpGained} XP</strong> hôm nay. Tuyệt vời!
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="bg-app-accent-primary text-[#0a0c10] font-semibold px-5 py-2 rounded-lg text-sm hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer"
            >
              Xem hồ sơ học viên
            </button>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white/2 border border-app-border rounded-2xl p-5">
          <p className="text-app-text-secondary text-xs tracking-normal mb-4">Truy cập nhanh</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Thi thử EPS", icon: "ri-timer-line", path: "/eps-exam", color: "#fb923c" },
              { label: "So sánh tiến độ", icon: "ri-radar-line", path: "/progress", color: "#a78bfa" },
              { label: "Thống kê", icon: "ri-bar-chart-box-line", path: "/learn-stats", color: "#4ade80" },
              { label: "Hồ sơ", icon: "ri-user-3-line", path: "/profile", color: "app-accent-primary" },
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
                Đã hoàn thành hôm nay
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStartTask(selectedTask)}
                  className="w-full bg-app-accent-primary text-[#0a0c10] font-bold py-3 rounded-xl text-sm hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {startedToday.includes(selectedTask.id) ? "Tiếp tục học" : "Bắt đầu ngay"}
                </button>
                {startedToday.includes(selectedTask.id) ? (
                  <button
                    onClick={() => handleMarkDone(selectedTask.id)}
                    className="w-full bg-[#4ade80]/15 text-[#4ade80] font-bold py-3 rounded-xl text-sm hover:bg-[#4ade80]/25 transition-colors whitespace-nowrap cursor-pointer border border-[#4ade80]/20"
                  >
                    <i className="ri-check-line mr-1"></i>
                    Đánh dấu hoàn thành · +{selectedTask.xp} XP
                  </button>
                ) : (
                  <p className="text-center text-app-text-muted text-[11px]">
                    <i className="ri-information-line mr-1"></i>
                    Bắt đầu học trước để nhận XP khi hoàn thành
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
