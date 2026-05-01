import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";

// ─── Types ────────────────────────────────────────────────────────────────
interface TopicProgress {
  done: number;
  correct: number;
  total: number;
  lastStudied?: string;
}

// ─── Topic Detail Modal ───────────────────────────────────────────────────
function TopicDetailModal({
  topicId,
  onClose,
  onStartPractice,
}: {
  topicId: string;
  onClose: () => void;
  onStartPractice: (topicId: string) => void;
}) {
  const topic = EPS_TOPICS.find(t => t.id === topicId);
  const questions = epsQuestions.filter(q => q.topic === topicId);
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});

  if (!topic) return null;

  const done = questions.filter(q => answeredMap[q.id] !== undefined).length;
  const correct = questions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const pct = questions.length > 0 ? Math.round((done / questions.length) * 100) : 0;

  const byDifficulty = {
    easy: questions.filter(q => q.difficulty === "easy").length,
    medium: questions.filter(q => q.difficulty === "medium").length,
    hard: questions.filter(q => q.difficulty === "hard").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
            <i className={`${topic.icon} text-2xl`} style={{ color: topic.color }}></i>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{topic.label}</h2>
            <p className="text-white/40 text-sm">{questions.length} câu hỏi</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 cursor-pointer">
            <i className="ri-close-line text-white/40"></i>
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white/3 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-xs">Tiến độ</p>
            <span className="text-sm font-bold" style={{ color: topic.color }}>{pct}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: topic.color }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-white font-bold text-lg">{done}</p>
              <p className="text-white/30 text-[10px]">Đã làm</p>
            </div>
            <div>
              <p className="text-emerald-400 font-bold text-lg">{correct}</p>
              <p className="text-white/30 text-[10px]">Đúng</p>
            </div>
            <div>
              <p className="text-white/60 font-bold text-lg">{questions.length - done}</p>
              <p className="text-white/30 text-[10px]">Còn lại</p>
            </div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Dễ", count: byDifficulty.easy, color: "#34d399" },
            { label: "Trung bình", count: byDifficulty.medium, color: "#e8c84a" },
            { label: "Khó", count: byDifficulty.hard, color: "#f87171" },
          ].map(d => (
            <div key={d.label} className="bg-white/3 rounded-xl p-3 text-center">
              <p className="font-bold text-base" style={{ color: d.color }}>{d.count}</p>
              <p className="text-white/30 text-[10px]">{d.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
          >
            Đóng
          </button>
          <button
            onClick={() => onStartPractice(topicId)}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: topic.color, color: "#0f1117" }}
          >
            Bắt đầu luyện tập
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Topic Card ───────────────────────────────────────────────────────────
function TopicCard({
  topic,
  progress,
  onClick,
}: {
  topic: typeof EPS_TOPICS[0];
  progress: TopicProgress;
  onClick: () => void;
}) {
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const isCompleted = pct === 100;
  const isStarted = progress.done > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#0f1117] border border-white/5 hover:border-white/12 rounded-2xl p-5 transition-all cursor-pointer group"
    >
      {/* Icon + badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${topic.color}15` }}>
          <i className={`${topic.icon} text-xl`} style={{ color: topic.color }}></i>
        </div>
        {isCompleted ? (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
            <i className="ri-checkbox-circle-fill text-xs"></i>
            Hoàn thành
          </span>
        ) : isStarted ? (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 text-white/40">
            {pct}%
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 text-white/25">
            Chưa học
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-white transition-colors">{topic.label}</h3>
      <p className="text-white/30 text-xs mb-4">{progress.total} câu hỏi</p>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: topic.color }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-white/25">{progress.done}/{progress.total} đã làm</span>
        {progress.done > 0 && (
          <span className="text-emerald-400/70">{progress.correct} đúng</span>
        )}
      </div>
    </button>
  );
}

// ─── Learning Path Section ────────────────────────────────────────────────
const LEARNING_PATHS = [
  {
    id: "beginner",
    label: "Người mới bắt đầu",
    icon: "ri-seedling-line",
    color: "#34d399",
    desc: "Giao tiếp cơ bản, văn hóa, sinh hoạt hàng ngày",
    topics: ["greeting", "culture", "daily"],
    duration: "2-3 tuần",
  },
  {
    id: "worker",
    label: "Lao động phổ thông",
    icon: "ri-tools-line",
    color: "#fb923c",
    desc: "An toàn lao động, nơi làm việc, tình huống khẩn cấp",
    topics: ["safety", "workplace", "emergency"],
    duration: "3-4 tuần",
  },
  {
    id: "eps",
    label: "Thi EPS-TOPIK",
    icon: "ri-trophy-line",
    color: "#e8c84a",
    desc: "Pháp luật, nghe hiểu, đọc hiểu — chuẩn bị thi",
    topics: ["law", "listening", "reading"],
    duration: "4-6 tuần",
  },
  {
    id: "full",
    label: "Toàn diện",
    icon: "ri-star-line",
    color: "#a78bfa",
    desc: "Tất cả 9 chủ đề — chuẩn bị kỹ nhất",
    topics: EPS_TOPICS.map(t => t.id),
    duration: "8-10 tuần",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────
export default function EpsTopicsPage() {
  const navigate = useNavigate();
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [selectedPath, setSelectedPath] = useState<string>("full");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [view, setView] = useState<"path" | "all">("path");

  // Compute progress per topic
  const topicProgress: Record<string, TopicProgress> = {};
  EPS_TOPICS.forEach(t => {
    const qs = epsQuestions.filter(q => q.topic === t.id);
    const done = qs.filter(q => answeredMap[q.id] !== undefined).length;
    const correct = qs.filter(q => answeredMap[q.id] === q.correctIndex).length;
    topicProgress[t.id] = { done, correct, total: qs.length };
  });

  const totalDone = Object.keys(answeredMap).length;
  const totalCorrect = epsQuestions.filter(q => answeredMap[q.id] === q.correctIndex).length;
  const overallPct = epsQuestions.length > 0 ? Math.round((totalDone / epsQuestions.length) * 100) : 0;

  const activePath = LEARNING_PATHS.find(p => p.id === selectedPath);
  const displayTopics = view === "path" && activePath
    ? EPS_TOPICS.filter(t => activePath.topics.includes(t.id))
    : EPS_TOPICS;

  const handleStartPractice = (topicId: string) => {
    // Navigate to EPS page with topic pre-selected via localStorage
    localStorage.setItem("kts_eps_start_topic", topicId);
    navigate("/eps");
  };

  return (
    <DashboardLayout
      title="Học EPS theo Chủ đề"
      subtitle="Lộ trình học có hệ thống — từ giao tiếp cơ bản đến pháp luật lao động"
    >
      {/* Overall stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng câu hỏi", value: epsQuestions.length, icon: "ri-survey-line", color: "#e8c84a" },
          { label: "Đã hoàn thành", value: `${overallPct}%`, icon: "ri-pie-chart-line", color: "#34d399" },
          { label: "Câu đúng", value: totalCorrect, icon: "ri-checkbox-circle-line", color: "#a78bfa" },
          { label: "Chủ đề", value: EPS_TOPICS.length, icon: "ri-folder-line", color: "#fb923c" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left: Topics */}
        <div>
          {/* View toggle */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setView("path")}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${view === "path" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
              >
                Theo lộ trình
              </button>
              <button
                onClick={() => setView("all")}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${view === "all" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}
              >
                Tất cả chủ đề
              </button>
            </div>
            {view === "path" && activePath && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activePath.color }}></div>
                <span className="text-white/40 text-xs">{activePath.label}</span>
              </div>
            )}
          </div>

          {/* Topic grid */}
          <div className="grid grid-cols-2 gap-3">
            {displayTopics.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={topicProgress[topic.id]}
                onClick={() => setSelectedTopic(topic.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Learning paths */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Chọn lộ trình học</h3>
            <div className="space-y-2">
              {LEARNING_PATHS.map(path => {
                const pathTopics = EPS_TOPICS.filter(t => path.topics.includes(t.id));
                const pathDone = pathTopics.reduce((sum, t) => sum + topicProgress[t.id].done, 0);
                const pathTotal = pathTopics.reduce((sum, t) => sum + topicProgress[t.id].total, 0);
                const pathPct = pathTotal > 0 ? Math.round((pathDone / pathTotal) * 100) : 0;
                const isActive = selectedPath === path.id;

                return (
                  <button
                    key={path.id}
                    onClick={() => { setSelectedPath(path.id); setView("path"); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${isActive ? "border-white/15 bg-white/5" : "border-white/5 hover:border-white/10"}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${path.color}15` }}>
                        <i className={`${path.icon} text-sm`} style={{ color: path.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isActive ? "text-white" : "text-white/60"}`}>{path.label}</p>
                        <p className="text-white/25 text-[10px]">{path.duration}</p>
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: path.color }}>{pathPct}%</span>
                    </div>
                    <p className="text-white/30 text-[10px] leading-relaxed mb-2">{path.desc}</p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pathPct}%`, backgroundColor: path.color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
            <p className="text-[#e8c84a]/80 text-xs font-semibold mb-2">Gợi ý học hiệu quả</p>
            <div className="space-y-2">
              {[
                { icon: "ri-time-line", text: "Học 20-30 phút/ngày, đều đặn hơn học dồn" },
                { icon: "ri-repeat-line", text: "Ôn lại câu sai ngay sau khi làm xong" },
                { icon: "ri-volume-up-line", text: "Nghe và đọc to câu hỏi để nhớ lâu hơn" },
                { icon: "ri-trophy-line", text: "Hoàn thành 1 chủ đề trước khi sang chủ đề khác" },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <i className={`${tip.icon} text-[#e8c84a]/50 text-xs flex-shrink-0 mt-0.5`}></i>
                  <p className="text-white/35 text-[10px] leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <button
              onClick={() => navigate("/eps-exam")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f87171]/10 flex-shrink-0">
                <i className="ri-timer-line text-[#f87171] text-sm"></i>
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs font-medium">Thi thử EPS (40 câu)</p>
                <p className="text-white/25 text-[10px]">Mô phỏng đề thi thật</p>
              </div>
              <i className="ri-arrow-right-line text-white/20 ml-auto"></i>
            </button>
            <button
              onClick={() => navigate("/placement-test")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#a78bfa]/10 flex-shrink-0">
                <i className="ri-brain-line text-[#a78bfa] text-sm"></i>
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs font-medium">Kiểm tra đầu vào</p>
                <p className="text-white/25 text-[10px]">AI phân tích trình độ</p>
              </div>
              <i className="ri-arrow-right-line text-white/20 ml-auto"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Topic detail modal */}
      {selectedTopic && (
        <TopicDetailModal
          topicId={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onStartPractice={(id) => { setSelectedTopic(null); handleStartPractice(id); }}
        />
      )}
    </DashboardLayout>
  );
}
