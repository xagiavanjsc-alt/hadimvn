import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsLessons, EPS_LESSON_TOPICS } from "@/mocks/epsLessons";
import LessonCard from "./components/LessonCard";
import WrongSavedToast from "./components/WrongSavedToast";
import TopicProgressPanel from "./components/TopicProgressPanel";

const LESSONS_PER_PAGE = 20;

export default function EpsLessonsPage() {
  const navigate = useNavigate();
  const { addXP } = useXPSystem();
  const [completedLessons, setCompletedLessons] = useLocalStorage<Record<number, { score: number; completedAt: string }>>("kts_eps_lessons_progress", {});
  const [wrongToastCount, setWrongToastCount] = useState(0);
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLessons = useMemo(() => {
    return epsLessons.filter(l => {
      if (filterTopic !== "all" && l.topic !== filterTopic) return false;
      if (filterLevel !== "all" && l.level !== filterLevel) return false;
      if (filterStatus === "completed" && !completedLessons[l.id]) return false;
      if (filterStatus === "pending" && completedLessons[l.id]) return false;
      if (search && !l.titleVi.toLowerCase().includes(search.toLowerCase()) && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filterTopic, filterLevel, filterStatus, search, completedLessons]);

  const totalPages = Math.ceil(filteredLessons.length / LESSONS_PER_PAGE);
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * LESSONS_PER_PAGE;
    return filteredLessons.slice(start, start + LESSONS_PER_PAGE);
  }, [filteredLessons, currentPage]);

  const handleFilterChange = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const totalCompleted = Object.keys(completedLessons).length;
  const totalXPEarned = Object.values(completedLessons).reduce((sum, v) => sum + (v.score * 10), 0);
  const overallProgress = Math.round((totalCompleted / epsLessons.length) * 100);

  const handleMarkComplete = (lessonId: number, score: number) => {
    if (completedLessons[lessonId]) return;
    const xpGain = 30 + score * 10;
    setCompletedLessons(prev => ({
      ...prev,
      [lessonId]: { score, completedAt: new Date().toISOString() },
    }));
    addXP(xpGain, `Hoàn thành bài EPS số ${lessonId}`);
  };

  return (
    <DashboardLayout
      title="60 Bài Học EPS"
      subtitle="Học tiếng Hàn theo bài — từ vựng, ngữ pháp và bài tập từng bài chuẩn EPS-TOPIK"
    >
      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: "Tổng bài học", value: epsLessons.length, icon: "ri-book-open-line", color: "#e8c84a" },
          { label: "Đã hoàn thành", value: totalCompleted, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Tiến độ", value: `${overallProgress}%`, icon: "ri-pie-chart-2-line", color: "#a78bfa" },
          { label: "XP đã nhận", value: `+${totalXPEarned}`, icon: "ri-star-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-3 md:p-4 flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base md:text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg md:text-xl leading-none">{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-app-bg border border-app-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/60 text-sm font-medium">Tiến độ tổng thể</p>
          <p className="text-app-accent-primary text-sm font-bold">{totalCompleted}/{epsLessons.length} bài</p>
        </div>
        <div className="h-2.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-app-accent-primary transition-all duration-700" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Lesson list */}
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-0">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={e => handleFilterChange(setSearch, e.target.value)}
                placeholder="Tìm bài học..."
                className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterTopic}
                onChange={e => handleFilterChange(setFilterTopic, e.target.value)}
                className="flex-1 sm:flex-none bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả chủ đề</option>
                {EPS_LESSON_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterLevel}
                onChange={e => handleFilterChange(setFilterLevel, e.target.value)}
                className="flex-1 sm:flex-none bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            <div className="flex rounded-lg border border-app-border overflow-hidden">
              {(["all", "pending", "completed"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleFilterChange(setFilterStatus, s)}
                  className={`flex-1 sm:flex-none px-3 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${filterStatus === s ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"}`}
                >
                  {s === "all" ? "Tất cả" : s === "pending" ? "Chưa học" : "Đã học"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-app-text-muted text-xs">{filteredLessons.length} bài học</p>
            {totalPages > 1 && (
              <p className="text-app-text-muted text-xs">
                Trang {currentPage}/{totalPages} · Hiển thị {(currentPage - 1) * LESSONS_PER_PAGE + 1}–{Math.min(currentPage * LESSONS_PER_PAGE, filteredLessons.length)}
              </p>
            )}
          </div>

          {/* Lesson list */}
          <div className="space-y-1.5 md:space-y-2">
            {paginatedLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={!!completedLessons[lesson.id]}
                score={completedLessons[lesson.id]?.score}
                onClick={() => navigate(`/eps-lesson/${lesson.id}`)}
              />
            ))}
            {filteredLessons.length === 0 && (
              <div className="text-center py-12 text-app-text-muted">
                <i className="ri-search-line text-3xl mb-2 block"></i>
                <p className="text-sm">Không tìm thấy bài học phù hợp</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-app-border bg-app-surface/50 text-app-text-secondary hover:text-white/70 hover:bg-white/6 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="ri-arrow-left-s-line text-base"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                const isActive = page === currentPage;
                const isNear = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                if (!isNear && Math.abs(page - currentPage) === 2) {
                  return <span key={page} className="text-app-text-muted text-xs px-1">...</span>;
                }
                if (!isNear) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive ? "bg-app-accent-primary text-black font-bold" : "border border-app-border bg-app-surface/50 text-white/50 hover:text-white/60"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-app-border bg-app-surface/50 text-app-text-secondary hover:text-white/70 hover:bg-white/6 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="ri-arrow-right-s-line text-base"></i>
              </button>
            </div>
          )}
        </div>

        {/* Right: Topic progress */}
        <TopicProgressPanel
          completedLessons={completedLessons}
          filterTopic={filterTopic}
          onFilterTopic={(topic) => handleFilterChange(setFilterTopic, topic)}
        />
      </div>

      {wrongToastCount > 0 && (
        <WrongSavedToast count={wrongToastCount} onDone={() => setWrongToastCount(0)} />
      )}
    </DashboardLayout>
  );
}
