import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
  estimatedDays: number;
  xpReward: number;
  type: "lesson" | "practice" | "test" | "review";
  completed?: boolean;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetLevel: string;
  totalDays: number;
  steps: RoadmapStep[];
  color: string;
  icon: string;
}

const EPS_PATH: LearningPath = {
  id: "eps",
  name: "Lộ trình EPS-TOPIK",
  description: "Chuẩn bị thi EPS-TOPIK để đi làm tại Hàn Quốc",
  targetLevel: "EPS Pass",
  totalDays: 90,
  color: "app-accent-primary",
  icon: "ri-briefcase-line",
  steps: [
    { id: "e1", title: "Hangul cơ bản", description: "Học bảng chữ cái và phát âm chuẩn", path: "/hangul", icon: "ri-font-size", color: "text-amber-400", estimatedDays: 7, xpReward: 200, type: "lesson" },
    { id: "e2", title: "Từ vựng EPS 205 từ", description: "Học toàn bộ 205 từ vựng EPS cơ bản", path: "/eps-vocabulary", icon: "ri-translate-2", color: "text-app-accent-success", estimatedDays: 14, xpReward: 500, type: "lesson" },
    { id: "e3", title: "60 Bài học EPS", description: "Học theo bài có cấu trúc rõ ràng", path: "/eps-lessons", icon: "ri-book-open-line", color: "text-sky-400", estimatedDays: 21, xpReward: 800, type: "lesson" },
    { id: "e4", title: "Luyện nghe EPS", description: "Nghe audio câu hỏi EPS thật", path: "/eps-listening", icon: "ri-headphone-line", color: "text-violet-400", estimatedDays: 14, xpReward: 400, type: "practice" },
    { id: "e5", title: "Luyện nói EPS", description: "Ghi âm và so sánh phát âm chuẩn", path: "/eps-speaking", icon: "ri-mic-line", color: "text-pink-400", estimatedDays: 14, xpReward: 400, type: "practice" },
    { id: "e6", title: "Luyện thi theo chủ đề", description: "Ôn tập từng chủ đề EPS", path: "/eps-topic-drill", icon: "ri-focus-3-line", color: "text-orange-400", estimatedDays: 10, xpReward: 300, type: "practice" },
    { id: "e7", title: "Ôn tập thông minh", description: "Spaced repetition từ vựng EPS", path: "/smart-review", icon: "ri-brain-line", color: "text-teal-400", estimatedDays: 7, xpReward: 200, type: "review" },
    { id: "e8", title: "Thi thử EPS 40 câu", description: "Mô phỏng đề thi thật 40 câu", path: "/eps-exam", icon: "ri-timer-line", color: "text-red-400", estimatedDays: 3, xpReward: 300, type: "test" },
  ],
};

const SEOUL_1A_PATH: LearningPath = {
  id: "seoul-1a",
  name: "Lộ trình Seoul 1A–1B",
  description: "Tiếng Hàn sơ cấp — giao tiếp cơ bản hàng ngày",
  targetLevel: "A1 → A1+",
  totalDays: 60,
  color: "#34d399",
  icon: "ri-book-3-line",
  steps: [
    { id: "s1", title: "Kiểm tra trình độ", description: "Xác định điểm bắt đầu phù hợp", path: "/seoul-placement", icon: "ri-brain-line", color: "text-violet-400", estimatedDays: 1, xpReward: 100, type: "test" },
    { id: "s2", title: "Hangul & Phát âm", description: "Nền tảng bảng chữ cái Hangul", path: "/hangul", icon: "ri-font-size", color: "text-amber-400", estimatedDays: 7, xpReward: 200, type: "lesson" },
    { id: "s3", title: "Seoul 1A — 15 bài học", description: "Chào hỏi, giới thiệu, số đếm, thời gian", path: "/seoul-textbook", icon: "ri-book-3-line", color: "text-app-accent-success", estimatedDays: 21, xpReward: 750, type: "lesson" },
    { id: "s4", title: "Flashcard Seoul 1A", description: "Ôn từ vựng bằng flashcard lật thẻ", path: "/seoul-flashcard", icon: "ri-stack-line", color: "text-sky-400", estimatedDays: 7, xpReward: 200, type: "review" },
    { id: "s5", title: "Seoul 1B — 15 bài học", description: "Quá khứ, tương lai, so sánh, cảm xúc", path: "/seoul-textbook", icon: "ri-book-3-line", color: "text-teal-400", estimatedDays: 21, xpReward: 750, type: "lesson" },
    { id: "s6", title: "Ôn tập thông minh", description: "Spaced repetition từ vựng Seoul", path: "/smart-review", icon: "ri-brain-line", color: "text-orange-400", estimatedDays: 7, xpReward: 200, type: "review" },
    { id: "s7", title: "Bài thi thử Seoul 1A", description: "Kiểm tra tổng hợp ngữ pháp + từ vựng", path: "/seoul-exam", icon: "ri-file-list-2-line", color: "text-red-400", estimatedDays: 2, xpReward: 200, type: "test" },
    { id: "s8", title: "Bài thi thử Seoul 1B", description: "Kiểm tra tổng hợp ngữ pháp + từ vựng", path: "/seoul-exam", icon: "ri-file-list-2-line", color: "text-pink-400", estimatedDays: 2, xpReward: 200, type: "test" },
  ],
};

const SEOUL_2A_PATH: LearningPath = {
  id: "seoul-2a",
  name: "Lộ trình Seoul 2A–2B",
  description: "Tiếng Hàn sơ-trung cấp — giao tiếp tự nhiên hơn",
  targetLevel: "A2 → A2+",
  totalDays: 60,
  color: "#fb923c",
  icon: "ri-book-3-line",
  steps: [
    { id: "s1", title: "Kiểm tra trình độ", description: "Xác nhận đã đạt A1+", path: "/seoul-placement", icon: "ri-brain-line", color: "text-violet-400", estimatedDays: 1, xpReward: 100, type: "test" },
    { id: "s2", title: "Seoul 2A — 14 bài học", description: "Kinh nghiệm, nhờ vả, ý kiến", path: "/seoul-textbook", icon: "ri-book-3-line", color: "text-app-accent-success", estimatedDays: 21, xpReward: 700, type: "lesson" },
    { id: "s3", title: "Flashcard Seoul 2A", description: "Ôn từ vựng 2A bằng flashcard", path: "/seoul-flashcard", icon: "ri-stack-line", color: "text-sky-400", estimatedDays: 7, xpReward: 200, type: "review" },
    { id: "s4", title: "Seoul 2B — 14 bài học", description: "Nguyên nhân, điều kiện, tình huống phức tạp", path: "/seoul-textbook", icon: "ri-book-3-line", color: "text-teal-400", estimatedDays: 21, xpReward: 700, type: "lesson" },
    { id: "s5", title: "Ôn tập thông minh", description: "Spaced repetition từ vựng 2A-2B", path: "/smart-review", icon: "ri-brain-line", color: "text-orange-400", estimatedDays: 7, xpReward: 200, type: "review" },
    { id: "s6", title: "Bài thi thử Seoul 2A", description: "Kiểm tra tổng hợp", path: "/seoul-exam", icon: "ri-file-list-2-line", color: "text-red-400", estimatedDays: 2, xpReward: 200, type: "test" },
    { id: "s7", title: "Bài thi thử Seoul 2B", description: "Kiểm tra tổng hợp", path: "/seoul-exam", icon: "ri-file-list-2-line", color: "text-pink-400", estimatedDays: 2, xpReward: 200, type: "test" },
  ],
};

const TOPIK_PATH: LearningPath = {
  id: "topik",
  name: "Lộ trình TOPIK I",
  description: "Chuẩn bị thi TOPIK I (cấp 1-2) — chứng chỉ tiếng Hàn quốc tế",
  targetLevel: "TOPIK I Level 2",
  totalDays: 90,
  color: "#a78bfa",
  icon: "ri-award-line",
  steps: [
    { id: "t1", title: "Kiểm tra đầu vào", description: "Đánh giá trình độ hiện tại", path: "/placement-test", icon: "ri-brain-line", color: "text-violet-400", estimatedDays: 1, xpReward: 100, type: "test" },
    { id: "t2", title: "Từ vựng TOPIK I", description: "Học 800+ từ vựng cần thiết", path: "/vocabulary", icon: "ri-translate-2", color: "text-amber-400", estimatedDays: 21, xpReward: 600, type: "lesson" },
    { id: "t3", title: "Ngữ pháp cơ bản", description: "Các điểm ngữ pháp TOPIK I", path: "/grammar", icon: "ri-book-2-line", color: "text-app-accent-success", estimatedDays: 14, xpReward: 400, type: "lesson" },
    { id: "t4", title: "Luyện nghe TOPIK", description: "Nghe hiểu theo format TOPIK", path: "/listen-practice", icon: "ri-headphone-line", color: "text-sky-400", estimatedDays: 14, xpReward: 400, type: "practice" },
    { id: "t5", title: "Ôn tập thông minh", description: "Spaced repetition từ vựng TOPIK", path: "/smart-review", icon: "ri-brain-line", color: "text-teal-400", estimatedDays: 14, xpReward: 300, type: "review" },
    { id: "t6", title: "Thi thử TOPIK I", description: "Đề thi mô phỏng 50 câu", path: "/topik-test", icon: "ri-file-list-2-line", color: "text-red-400", estimatedDays: 7, xpReward: 400, type: "test" },
    { id: "t7", title: "Ôn tập từ yêu thích", description: "Ôn lại từ đã đánh dấu", path: "/vocab-favorites", icon: "ri-bookmark-fill", color: "text-pink-400", estimatedDays: 7, xpReward: 200, type: "review" },
    { id: "t8", title: "Thi thử TOPIK II", description: "Thử sức với đề TOPIK II", path: "/topik2-test", icon: "ri-file-list-3-line", color: "text-orange-400", estimatedDays: 7, xpReward: 500, type: "test" },
  ],
};

const ALL_PATHS = [EPS_PATH, SEOUL_1A_PATH, SEOUL_2A_PATH, TOPIK_PATH];

const typeLabel: Record<string, string> = { lesson: "Bài học", practice: "Luyện tập", test: "Kiểm tra", review: "Ôn tập" };
const typeColor: Record<string, string> = {
  lesson: "bg-emerald-500/10 text-app-accent-success border-emerald-500/20",
  practice: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  test: "bg-red-500/10 text-red-400 border-red-500/20",
  review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function PersonalizedRoadmapPage() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [completedSteps, setCompletedSteps] = useLocalStorage<Record<string, string[]>>("kts_roadmap_completed", {});
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });

  const toggleStep = (pathId: string, stepId: string) => {
    setCompletedSteps(prev => {
      const pathSteps = prev[pathId] || [];
      if (pathSteps.includes(stepId)) {
        return { ...prev, [pathId]: pathSteps.filter(s => s !== stepId) };
      }
      const step = selectedPath?.steps.find(s => s.id === stepId);
      if (step) setXpData(p => ({ total: (p.total || 0) + step.xpReward }));
      return { ...prev, [pathId]: [...pathSteps, stepId] };
    });
  };

  const getPathProgress = (path: LearningPath) => {
    const done = (completedSteps[path.id] || []).length;
    return { done, total: path.steps.length, pct: Math.round((done / path.steps.length) * 100) };
  };

  const isStepDone = (pathId: string, stepId: string) => (completedSteps[pathId] || []).includes(stepId);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Lộ trình học cá nhân hóa
          </h1>
          <p className="text-app-text-secondary text-sm mt-0.5">Chọn mục tiêu học tập và theo dõi tiến độ từng bước</p>
        </div>

        {!selectedPath ? (
          <>
            {/* Path selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_PATHS.map(path => {
                const { done, total, pct } = getPathProgress(path);
                return (
                  <div
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className="bg-app-card/50 border border-app-border rounded-2xl p-6 hover:bg-white/8 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${path.color}15` }}>
                        <i className={`${path.icon} text-xl`} style={{ color: path.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base">{path.name}</h3>
                        <p className="text-app-text-secondary text-xs mt-0.5">{path.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: path.color, borderColor: `${path.color}30`, backgroundColor: `${path.color}10` }}>
                        {path.targetLevel}
                      </span>
                      <span className="text-app-text-muted text-xs">{path.totalDays} ngày</span>
                      <span className="text-app-text-muted text-xs">{path.steps.length} bước</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-app-text-secondary text-xs">Tiến độ</span>
                        <span className="text-xs font-medium" style={{ color: path.color }}>{done}/{total} bước</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: path.color }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-app-text-muted text-xs">
                        {path.steps.reduce((s, st) => s + st.xpReward, 0).toLocaleString()} XP tổng
                      </span>
                      <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: path.color }}>
                        Xem lộ trình
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-arrow-right-line text-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg flex-shrink-0">
                  <i className="ri-lightbulb-line text-amber-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-white/60 text-sm font-medium mb-1">Gợi ý chọn lộ trình</p>
                  <ul className="text-white/35 text-xs space-y-1 leading-relaxed">
                    <li>• <strong className="text-white/50">EPS-TOPIK</strong>: Nếu bạn muốn đi làm tại Hàn Quốc theo chương trình EPS</li>
                    <li>• <strong className="text-white/50">Seoul 1A–1B</strong>: Nếu bạn mới bắt đầu học tiếng Hàn từ đầu</li>
                    <li>• <strong className="text-white/50">Seoul 2A–2B</strong>: Nếu bạn đã biết cơ bản và muốn nâng cao</li>
                    <li>• <strong className="text-white/50">TOPIK I</strong>: Nếu bạn muốn có chứng chỉ tiếng Hàn quốc tế</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => setSelectedPath(null)}
              className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-all cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-left-line text-sm"></i>
              </div>
              Quay lại chọn lộ trình
            </button>

            {/* Path header */}
            <div className="bg-app-card/50 border border-app-border rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${selectedPath.color}15` }}>
                  <i className={`${selectedPath.icon} text-2xl`} style={{ color: selectedPath.color }}></i>
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{selectedPath.name}</h2>
                  <p className="text-app-text-secondary text-sm">{selectedPath.description}</p>
                </div>
              </div>

              {(() => {
                const { done, total, pct } = getPathProgress(selectedPath);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-app-text-secondary text-sm">Tiến độ tổng thể</span>
                      <span className="font-bold text-sm" style={{ color: selectedPath.color }}>{pct}% ({done}/{total} bước)</span>
                    </div>
                    <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: selectedPath.color }} />
                    </div>
                    <div className="flex gap-4 pt-1">
                      <span className="text-app-text-muted text-xs">{selectedPath.totalDays} ngày ước tính</span>
                      <span className="text-app-text-muted text-xs">{selectedPath.steps.reduce((s, st) => s + st.xpReward, 0).toLocaleString()} XP tổng</span>
                      <span className="text-app-text-muted text-xs">Mục tiêu: {selectedPath.targetLevel}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {selectedPath.steps.map((step, idx) => {
                const done = isStepDone(selectedPath.id, step.id);
                const prevDone = idx === 0 || isStepDone(selectedPath.id, selectedPath.steps[idx - 1].id);
                const isLocked = !prevDone && !done;

                return (
                  <div
                    key={step.id}
                    className={`bg-app-card/50 border rounded-xl p-5 transition-all ${done ? "border-white/15 opacity-80" : isLocked ? "border-app-border opacity-50" : "border-app-border hover:border-white/20"}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step number / check */}
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-all ${done ? "bg-emerald-500/20" : "bg-white/8"}`}>
                        {done ? (
                          <i className="ri-check-line text-app-accent-success text-lg"></i>
                        ) : (
                          <span className="text-app-text-secondary text-sm font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <i className={`${step.icon} text-sm ${step.color}`}></i>
                          </div>
                          <h3 className={`font-semibold text-sm ${done ? "text-white/50 line-through" : "text-white"}`}>{step.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${typeColor[step.type]}`}>{typeLabel[step.type]}</span>
                        </div>
                        <p className="text-app-text-secondary text-xs mb-3">{step.description}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-app-text-muted text-xs">{step.estimatedDays} ngày</span>
                          <span className="text-amber-400/60 text-xs">+{step.xpReward} XP</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isLocked && (
                          <button
                            onClick={() => navigate(step.path)}
                            className="flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
                          >
                            <div className="w-3 h-3 flex items-center justify-center">
                              <i className="ri-external-link-line text-xs"></i>
                            </div>
                            Học ngay
                          </button>
                        )}
                        <button
                          onClick={() => !isLocked && toggleStep(selectedPath.id, step.id)}
                          disabled={isLocked}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                            done
                              ? "bg-emerald-500/20 border-emerald-500/30 cursor-pointer"
                              : isLocked
                              ? "bg-app-surface/50 border-app-border cursor-not-allowed"
                              : "bg-white/8 border-white/15 hover:bg-app-accent-success/15 hover:border-emerald-500/30 cursor-pointer"
                          }`}
                        >
                          <i className={`text-sm ${done ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-checkbox-blank-circle-line text-app-text-muted"}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Connector line */}
                    {idx < selectedPath.steps.length - 1 && (
                      <div className="ml-5 mt-3 w-0.5 h-3 bg-app-card/70 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Completion message */}
            {getPathProgress(selectedPath).pct === 100 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-500/20 rounded-full mx-auto mb-4">
                  <i className="ri-trophy-line text-app-accent-success text-3xl"></i>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Hoàn thành lộ trình!</h3>
                <p className="text-white/50 text-sm">Bạn đã hoàn thành toàn bộ {selectedPath.steps.length} bước của lộ trình {selectedPath.name}!</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
