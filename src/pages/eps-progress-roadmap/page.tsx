import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsLessons, EPS_LESSON_TOPICS } from "@/mocks/epsLessons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LessonProgress {
  completed: boolean;
  score: number;
  lastStudied: string;
}

type ViewMode = "roadmap" | "grid" | "topic";

const BOOK_RANGES = [
  { label: "Quyển 1", range: [1, 30], color: "app-accent-primary", icon: "ri-book-open-line" },
  { label: "Quyển 2", range: [31, 60], color: "#34d399", icon: "ri-book-2-line" },
];

export default function EpsProgressRoadmapPage() {
  const navigate = useNavigate();
  const [lessonProgress] = useLocalStorage<Record<number, LessonProgress>>("eps_lesson_progress", {});
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = epsLessons.length;
    const completed = Object.values(lessonProgress).filter(p => p.completed).length;
    const avgScore = Object.values(lessonProgress).filter(p => p.score > 0).reduce((sum, p, _, arr) => sum + p.score / arr.length, 0);
    const book1Done = epsLessons.filter(l => l.id <= 30 && lessonProgress[l.id]?.completed).length;
    const book2Done = epsLessons.filter(l => l.id > 30 && lessonProgress[l.id]?.completed).length;
    return { total, completed, avgScore, book1Done, book2Done, percent: Math.round((completed / total) * 100) };
  }, [lessonProgress]);

  const filteredLessons = useMemo(() => {
    if (selectedTopic === "all") return epsLessons;
    return epsLessons.filter(l => l.topic === selectedTopic);
  }, [selectedTopic]);

  const getLessonStatus = (id: number) => {
    const p = lessonProgress[id];
    if (!p) return "locked";
    if (p.completed) return "completed";
    return "in_progress";
  };

  const getStatusColor = (status: string, topicColor: string) => {
    if (status === "completed") return topicColor;
    if (status === "in_progress") return "#f59e0b";
    return "#374151";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return "ri-checkbox-circle-fill";
    if (status === "in_progress") return "ri-time-line";
    return "ri-lock-line";
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-app-bg text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1d2e] to-[#0f1117] border-b border-app-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-app-card/70 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line text-white/60"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Bảng tiến độ EPS</h1>
                <p className="text-app-text-secondary text-sm">Roadmap 60 bài học trực quan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/eps-quick-review")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-app-accent-primary/15 hover:bg-app-accent-primary/25 border border-app-accent-primary/30 rounded-lg text-app-accent-primary text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-flashlight-line text-xs"></i>
                Ôn tập nhanh
              </button>
              {(["roadmap", "grid", "topic"] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === mode ? "bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/30" : "text-app-text-secondary hover:text-white/70 hover:bg-app-card/50"
                  }`}
                >
                  {mode === "roadmap" ? "Roadmap" : mode === "grid" ? "Lưới" : "Chủ đề"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Hoàn thành", value: `${stats.completed}/${stats.total}`, sub: `${stats.percent}%`, icon: "ri-checkbox-circle-line", color: "#34d399" },
              { label: "Điểm TB", value: stats.avgScore > 0 ? `${Math.round(stats.avgScore)}%` : "—", sub: "Trung bình", icon: "ri-bar-chart-line", color: "app-accent-primary" },
              { label: "Quyển 1", value: `${stats.book1Done}/30`, sub: `${Math.round((stats.book1Done / 30) * 100)}%`, icon: "ri-book-open-line", color: "app-accent-primary" },
              { label: "Quyển 2", value: `${stats.book2Done}/30`, sub: `${Math.round((stats.book2Done / 30) * 100)}%`, icon: "ri-book-2-line", color: "#34d399" },
            ].map((s, i) => (
              <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}20` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <span className="text-white/50 text-xs">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-app-text-muted text-xs mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm font-medium">Tiến độ tổng thể</span>
              <span className="text-app-accent-primary font-bold">{stats.percent}%</span>
            </div>
            <div className="h-3 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.percent}%`, background: "linear-gradient(90deg, app-accent-primary, #34d399)" }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-app-text-muted text-xs">Bài 1</span>
              <span className="text-app-text-muted text-xs">Bài 60</span>
            </div>
          </div>

          {/* View: Roadmap */}
          {viewMode === "roadmap" && (
            <div className="space-y-8">
              {BOOK_RANGES.map(book => {
                const bookLessons = epsLessons.filter(l => l.id >= book.range[0] && l.id <= book.range[1]);
                const bookDone = bookLessons.filter(l => lessonProgress[l.id]?.completed).length;
                return (
                  <div key={book.label}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${book.color}20` }}>
                        <i className={`${book.icon} text-sm`} style={{ color: book.color }}></i>
                      </div>
                      <div>
                        <h2 className="text-white font-semibold">{book.label}</h2>
                        <p className="text-app-text-secondary text-xs">Bài {book.range[0]}–{book.range[1]} • {bookDone}/{bookLessons.length} hoàn thành</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(bookDone / bookLessons.length) * 100}%`, backgroundColor: book.color }}></div>
                        </div>
                        <span className="text-xs font-medium" style={{ color: book.color }}>{Math.round((bookDone / bookLessons.length) * 100)}%</span>
                      </div>
                    </div>

                    {/* Roadmap grid — 6 per row */}
                    <div className="grid grid-cols-6 gap-3">
                      {bookLessons.map((lesson, idx) => {
                        const status = getLessonStatus(lesson.id);
                        const statusColor = getStatusColor(status, lesson.topicColor);
                        const isHovered = hoveredLesson === lesson.id;
                        const progress = lessonProgress[lesson.id];

                        return (
                          <div key={lesson.id} className="relative">
                            {/* Connector line */}
                            {idx < bookLessons.length - 1 && (
                              <div className="absolute top-6 left-full w-3 h-0.5 z-0" style={{ backgroundColor: status === "completed" ? book.color : "#374151" }}></div>
                            )}

                            <button
                              onClick={() => navigate("/eps-lessons", { state: { openLessonId: lesson.id } })}
                              onMouseEnter={() => setHoveredLesson(lesson.id)}
                              onMouseLeave={() => setHoveredLesson(null)}
                              className="relative z-10 w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 cursor-pointer group"
                              style={{
                                borderColor: isHovered ? statusColor : `${statusColor}40`,
                                backgroundColor: isHovered ? `${statusColor}15` : `${statusColor}08`,
                              }}
                            >
                              {/* Lesson number circle */}
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                                style={{
                                  backgroundColor: status === "completed" ? statusColor : `${statusColor}20`,
                                  color: status === "completed" ? "#0f1117" : statusColor,
                                  border: `2px solid ${statusColor}`,
                                }}
                              >
                                {status === "completed" ? (
                                  <i className="ri-check-line text-base"></i>
                                ) : (
                                  lesson.id
                                )}
                              </div>

                              {/* Topic icon */}
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className={`${lesson.topicIcon} text-xs`} style={{ color: statusColor, opacity: status === "locked" ? 0.4 : 1 }}></i>
                              </div>

                              {/* Score badge */}
                              {progress?.score > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: statusColor, color: "#0f1117" }}>
                                  {Math.round(progress.score / 10)}
                                </div>
                              )}
                            </button>

                            {/* Tooltip */}
                            {isHovered && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 bg-[#1a1d2e] border border-app-border rounded-lg p-2.5 shadow-xl pointer-events-none">
                                <p className="text-white text-xs font-semibold leading-tight mb-1">{lesson.titleVi}</p>
                                <p className="text-app-text-secondary text-[10px] mb-1.5">{lesson.title}</p>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-3 h-3 flex items-center justify-center">
                                    <i className={`${getStatusIcon(status)} text-[10px]`} style={{ color: statusColor }}></i>
                                  </div>
                                  <span className="text-[10px]" style={{ color: statusColor }}>
                                    {status === "completed" ? "Đã hoàn thành" : status === "in_progress" ? "Đang học" : "Chưa học"}
                                  </span>
                                </div>
                                {progress?.score > 0 && (
                                  <p className="text-app-text-secondary text-[10px] mb-1.5">Điểm: {Math.round(progress.score)}%</p>
                                )}
                                <div className="flex items-center gap-1 bg-app-accent-primary/15 rounded-md px-2 py-1">
                                  <i className="ri-play-circle-line text-app-accent-primary text-[10px]"></i>
                                  <span className="text-app-accent-primary text-[10px] font-medium">Bắt đầu học</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View: Grid */}
          {viewMode === "grid" && (
            <div>
              {/* Topic filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedTopic("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === "all" ? "bg-white/15 text-white" : "bg-app-card/50 text-app-text-secondary hover:text-white/70"}`}
                >
                  Tất cả ({epsLessons.length})
                </button>
                {EPS_LESSON_TOPICS.map(topic => {
                  const count = epsLessons.filter(l => l.topic === topic.id).length;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === topic.id ? "text-white border" : "text-app-text-secondary hover:text-white/70 bg-app-card/50"}`}
                      style={selectedTopic === topic.id ? { backgroundColor: `${topic.color}20`, borderColor: `${topic.color}50`, color: topic.color } : {}}
                    >
                      <i className={`${topic.icon} mr-1`}></i>
                      {topic.label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredLessons.map(lesson => {
                  const status = getLessonStatus(lesson.id);
                  const statusColor = getStatusColor(status, lesson.topicColor);
                  const progress = lessonProgress[lesson.id];

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigate("/eps-lessons", { state: { openLessonId: lesson.id } })}
                      className="bg-app-surface/50 border border-app-border rounded-xl p-3 text-left hover:border-white/20 hover:bg-app-card/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${statusColor}20`, color: statusColor, border: `1.5px solid ${statusColor}40` }}
                        >
                          {status === "completed" ? <i className="ri-check-line"></i> : lesson.id}
                        </div>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={`${getStatusIcon(status)} text-xs`} style={{ color: statusColor }}></i>
                        </div>
                      </div>
                      <p className="text-white/80 text-xs font-medium leading-tight mb-1 line-clamp-2">{lesson.titleVi}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className={`${lesson.topicIcon} text-[10px]`} style={{ color: lesson.topicColor }}></i>
                        </div>
                        <span className="text-app-text-muted text-[10px]">{lesson.estimatedMinutes} phút</span>
                      </div>
                      {progress?.score > 0 && (
                        <div className="mb-2 h-1 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${progress.score}%`, backgroundColor: statusColor }}></div>
                        </div>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="ri-play-circle-line text-app-accent-primary text-[10px]"></i>
                        <span className="text-app-accent-primary text-[10px]">Bắt đầu học</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View: Topic */}
          {viewMode === "topic" && (
            <div className="space-y-6">
              {EPS_LESSON_TOPICS.map(topic => {
                const topicLessons = epsLessons.filter(l => l.topic === topic.id);
                const topicDone = topicLessons.filter(l => lessonProgress[l.id]?.completed).length;
                if (topicLessons.length === 0) return null;

                return (
                  <div key={topic.id} className="bg-app-surface/50 border border-app-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${topic.color}20` }}>
                        <i className={`${topic.icon} text-base`} style={{ color: topic.color }}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">{topic.label}</h3>
                        <p className="text-app-text-secondary text-xs">{topicDone}/{topicLessons.length} bài hoàn thành</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(topicDone / topicLessons.length) * 100}%`, backgroundColor: topic.color }}></div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: topic.color }}>{Math.round((topicDone / topicLessons.length) * 100)}%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {topicLessons.map(lesson => {
                        const status = getLessonStatus(lesson.id);
                        const statusColor = getStatusColor(status, topic.color);
                        return (
                          <div key={lesson.id} className="relative group">
                            <button
                              onClick={() => navigate("/eps-lessons", { state: { openLessonId: lesson.id } })}
                              title={lesson.titleVi}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110"
                              style={{
                                backgroundColor: status === "completed" ? statusColor : `${statusColor}20`,
                                color: status === "completed" ? "#0f1117" : statusColor,
                                border: `1.5px solid ${statusColor}50`,
                              }}
                            >
                              {status === "completed" ? <i className="ri-check-line text-sm"></i> : lesson.id}
                            </button>
                            {/* Mini tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-36 bg-[#1a1d2e] border border-app-border rounded-lg p-2 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-[10px] font-medium leading-tight mb-1">{lesson.titleVi}</p>
                              <div className="flex items-center gap-1">
                                <i className="ri-play-circle-line text-app-accent-primary text-[9px]"></i>
                                <span className="text-app-accent-primary text-[9px]">Bắt đầu học</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Vocab Stats Section */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10">
                <i className="ri-translate-2 text-app-accent-primary text-sm"></i>
              </div>
              <h3 className="text-white font-semibold text-sm">Thống kê từ vựng theo bài</h3>
              <span className="ml-auto text-app-text-muted text-xs">
                {epsLessons.filter(l => l.vocabulary && l.vocabulary.length > 0).reduce((sum, l) => sum + l.vocabulary.length, 0)} từ tổng cộng
              </span>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {(() => {
                const totalVocab = epsLessons.reduce((sum, l) => sum + (l.vocabulary?.length || 0), 0);
                const studiedLessons = epsLessons.filter(l => lessonProgress[l.id]?.completed || lessonProgress[l.id]?.score > 0);
                const studiedVocab = studiedLessons.reduce((sum, l) => sum + (l.vocabulary?.length || 0), 0);
                const completedVocab = epsLessons.filter(l => lessonProgress[l.id]?.completed).reduce((sum, l) => sum + (l.vocabulary?.length || 0), 0);
                return (
                  <>
                    <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-app-accent-success">{completedVocab}</p>
                      <p className="text-app-accent-success/60 text-[10px] mt-0.5">Đã hoàn thành</p>
                    </div>
                    <div className="bg-app-accent-primary/8 border border-app-accent-primary/15 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-app-accent-primary">{studiedVocab}</p>
                      <p className="text-app-accent-primary/60 text-[10px] mt-0.5">Đã tiếp xúc</p>
                    </div>
                    <div className="bg-app-card/50 border border-app-border rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white/60">{totalVocab - studiedVocab}</p>
                      <p className="text-app-text-muted text-[10px] mt-0.5">Chưa học</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Per-lesson vocab bars — show first 20 lessons with vocab */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {epsLessons.filter(l => l.vocabulary && l.vocabulary.length > 0).slice(0, 49).map(lesson => {
                const progress = lessonProgress[lesson.id];
                const status = progress?.completed ? "completed" : progress?.score > 0 ? "in_progress" : "locked";
                const vocabCount = lesson.vocabulary?.length || 0;
                const maxVocab = 70;
                const barWidth = Math.min((vocabCount / maxVocab) * 100, 100);
                const color = status === "completed" ? "#34d399" : status === "in_progress" ? "#f59e0b" : "#374151";

                return (
                  <div key={lesson.id} className="flex items-center gap-2 group">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                    >
                      {lesson.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-white/50 text-[10px] truncate">{lesson.titleVi}</span>
                        <span className="text-app-text-muted text-[10px] flex-shrink-0 ml-2">{vocabCount} từ</span>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, backgroundColor: color }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/eps-lessons", { state: { openLessonId: lesson.id } })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <i className="ri-play-circle-line text-app-accent-primary text-xs"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-app-border">
            <span className="text-app-text-muted text-xs">Chú thích:</span>
            {[
              { color: "#34d399", label: "Đã hoàn thành" },
              { color: "#f59e0b", label: "Đang học" },
              { color: "#374151", label: "Chưa học" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-app-text-secondary text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

