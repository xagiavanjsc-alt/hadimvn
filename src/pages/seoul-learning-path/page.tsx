import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { seoulBooks, type SeoulBook, type SeoulLesson } from "@/mocks/seoulTextbook";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PathStep {
  book: SeoulBook;
  lesson: SeoulLesson;
  isCompleted: boolean;
  isNext: boolean;
  isLocked: boolean;
  stepIndex: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRecommendedPath(completedMap: Record<string, boolean>): PathStep[] {
  const steps: PathStep[] = [];
  let foundNext = false;
  let stepIndex = 0;

  for (const book of seoulBooks) {
    for (const lesson of book.lessons) {
      const isCompleted = !!completedMap[lesson.id];
      const isNext = !isCompleted && !foundNext;
      if (isNext) foundNext = true;
      steps.push({
        book,
        lesson,
        isCompleted,
        isNext,
        isLocked: !isCompleted && !isNext && steps.some(s => !s.isCompleted && s.book.id === book.id),
        stepIndex: stepIndex++,
      });
    }
  }
  return steps;
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({
  step,
  onClick,
}: {
  step: PathStep;
  onClick: () => void;
}) {
  const { book, lesson, isCompleted, isNext, isLocked } = step;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all cursor-pointer group ${
        isCompleted
          ? "border-emerald-500/20 bg-emerald-500/3 hover:border-emerald-500/30"
          : isNext
          ? "border-[#a78bfa]/40 bg-[#a78bfa]/8 hover:border-[#a78bfa]/60 shadow-lg shadow-[#a78bfa]/5"
          : isLocked
          ? "border-white/5 bg-white/1 opacity-50 cursor-not-allowed"
          : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
      }`}
    >
      {/* Step indicator */}
      <div
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl flex-shrink-0 font-bold text-sm transition-all ${
          isCompleted
            ? "bg-emerald-500/15 text-emerald-400"
            : isNext
            ? "text-white"
            : isLocked
            ? "bg-white/5 text-white/20"
            : "bg-white/5 text-white/40"
        }`}
        style={isNext ? { backgroundColor: `${book.color}25`, color: book.color } : {}}
      >
        {isCompleted ? (
          <i className="ri-checkbox-circle-fill text-lg md:text-xl"></i>
        ) : isLocked ? (
          <i className="ri-lock-line text-base"></i>
        ) : (
          lesson.lessonNumber
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${book.color}20`, color: book.color }}
          >
            {book.level}
          </span>
          {isNext && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] animate-pulse">
              Tiếp theo
            </span>
          )}
        </div>
        <p
          className={`text-xs md:text-sm font-semibold truncate ${
            isCompleted ? "text-white/70" : isNext ? "text-white" : "text-white/60"
          }`}
        >
          {lesson.titleVi}
        </p>
        <p className="text-white/30 text-[10px] truncate">{lesson.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-white/25 flex items-center gap-0.5">
            <i className="ri-translate-2 text-xs"></i>{lesson.vocabulary.length} từ
          </span>
          <span className="text-[9px] text-white/25 flex items-center gap-0.5">
            <i className="ri-book-2-line text-xs"></i>{lesson.grammarPoints.length} NP
          </span>
        </div>
      </div>

      {/* Arrow */}
      {!isLocked && (
        <i
          className={`ri-arrow-right-s-line text-sm flex-shrink-0 transition-colors ${
            isNext ? "text-[#a78bfa]" : "text-white/20 group-hover:text-white/50"
          }`}
        ></i>
      )}
    </button>
  );
}

// ─── Book Section ─────────────────────────────────────────────────────────────
function BookSection({
  book,
  steps,
  onStepClick,
  isExpanded,
  onToggle,
}: {
  book: SeoulBook;
  steps: PathStep[];
  onStepClick: (step: PathStep) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completedCount = steps.filter(s => s.isCompleted).length;
  const hasNext = steps.some(s => s.isNext);
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${
        hasNext
          ? "border-[#a78bfa]/25 bg-[#a78bfa]/3"
          : completedCount === steps.length && steps.length > 0
          ? "border-emerald-500/20 bg-emerald-500/2"
          : "border-white/8 bg-white/1"
      }`}
    >
      {/* Book header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 cursor-pointer hover:bg-white/3 transition-colors text-left"
      >
        <div
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: `${book.color}20`, color: book.color }}
        >
          {book.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-white font-bold text-sm">{book.name}</p>
            {hasNext && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] font-semibold">
                Đang học
              </span>
            )}
            {completedCount === steps.length && steps.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                <i className="ri-checkbox-circle-fill mr-0.5"></i>Hoàn thành
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[120px]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: book.color }}
              />
            </div>
            <span className="text-white/30 text-[10px]">{completedCount}/{steps.length} bài</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/40 text-xs font-bold">{progress}%</span>
          <i className={`text-white/30 text-sm transition-transform ${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
        </div>
      </button>

      {/* Lessons */}
      {isExpanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
          {steps.map(step => (
            <StepCard key={step.lesson.id} step={step} onClick={() => onStepClick(step)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stats Overview ───────────────────────────────────────────────────────────
function StatsOverview({ completedMap }: { completedMap: Record<string, boolean> }) {
  const navigate = useNavigate();
  const totalLessons = seoulBooks.reduce((sum, b) => sum + b.totalLessons, 0);
  const totalCompleted = Object.values(completedMap).filter(Boolean).length;
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Find current book
  const currentBook = useMemo(() => {
    for (const book of seoulBooks) {
      const hasIncomplete = book.lessons.some(l => !completedMap[l.id]);
      if (hasIncomplete) return book;
    }
    return seoulBooks[seoulBooks.length - 1];
  }, [completedMap]);

  // Estimate remaining time (avg 30 min/lesson)
  const remainingLessons = totalLessons - totalCompleted;
  const estimatedHours = Math.round((remainingLessons * 30) / 60);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
      <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#a78bfa]/15">
            <i className="ri-route-line text-[#a78bfa] text-sm"></i>
          </div>
          <span className="text-white/40 text-xs">Tiến độ</span>
        </div>
        <p className="text-[#a78bfa] text-2xl font-black">{overallPct}%</p>
        <p className="text-white/30 text-[10px] mt-0.5">{totalCompleted}/{totalLessons} bài</p>
      </div>
      <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/15">
            <i className="ri-checkbox-circle-line text-emerald-400 text-sm"></i>
          </div>
          <span className="text-white/40 text-xs">Đã học</span>
        </div>
        <p className="text-emerald-400 text-2xl font-black">{totalCompleted}</p>
        <p className="text-white/30 text-[10px] mt-0.5">bài hoàn thành</p>
      </div>
      <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${currentBook.color}15` }}>
            <i className="ri-book-3-line text-sm" style={{ color: currentBook.color }}></i>
          </div>
          <span className="text-white/40 text-xs">Đang học</span>
        </div>
        <p className="text-white font-black text-lg">{currentBook.level}</p>
        <p className="text-white/30 text-[10px] mt-0.5">{currentBook.cefrLevel}</p>
      </div>
      <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#e8c84a]/15">
            <i className="ri-time-line text-[#e8c84a] text-sm"></i>
          </div>
          <span className="text-white/40 text-xs">Còn lại</span>
        </div>
        <p className="text-[#e8c84a] text-2xl font-black">{estimatedHours}h</p>
        <p className="text-white/30 text-[10px] mt-0.5">{remainingLessons} bài · ~30 phút/bài</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SeoulLearningPathPage() {
  const navigate = useNavigate();
  const [completedMap] = useLocalStorage<Record<string, boolean>>("kts_seoul_progress", {});
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(() => {
    // Auto-expand the current book
    const expanded = new Set<string>();
    for (const book of seoulBooks) {
      const hasIncomplete = book.lessons.some(l => !completedMap[l.id]);
      if (hasIncomplete) {
        expanded.add(book.id);
        break;
      }
    }
    return expanded;
  });
  const [filterMode, setFilterMode] = useState<"all" | "inprogress" | "completed" | "upcoming">("all");

  const allSteps = useMemo(() => getRecommendedPath(completedMap), [completedMap]);

  const nextStep = useMemo(() => allSteps.find(s => s.isNext), [allSteps]);

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const expandAll = () => setExpandedBooks(new Set(seoulBooks.map(b => b.id)));
  const collapseAll = () => setExpandedBooks(new Set());

  // Group steps by book
  const stepsByBook = useMemo(() => {
    const map = new Map<string, PathStep[]>();
    for (const step of allSteps) {
      const key = step.book.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(step);
    }
    return map;
  }, [allSteps]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return seoulBooks.filter(book => {
      const steps = stepsByBook.get(book.id) || [];
      if (filterMode === "all") return true;
      if (filterMode === "inprogress") return steps.some(s => s.isNext) || (steps.some(s => s.isCompleted) && steps.some(s => !s.isCompleted));
      if (filterMode === "completed") return steps.length > 0 && steps.every(s => s.isCompleted);
      if (filterMode === "upcoming") return steps.every(s => !s.isCompleted);
      return true;
    });
  }, [filterMode, stepsByBook]);

  const handleStepClick = (step: PathStep) => {
    if (step.isLocked) return;
    navigate("/seoul-textbook");
  };

  return (
    <DashboardLayout
      title="Học theo lộ trình"
      subtitle="Gợi ý bài học tiếp theo dựa trên tiến độ của bạn"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/seoul-textbook")}
            className="flex items-center gap-2 bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#a78bfa] text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-book-3-line"></i>Giáo trình
          </button>
          <button
            onClick={() => navigate("/seoul-streak")}
            className="flex items-center gap-2 bg-[#f97316]/10 hover:bg-[#f97316]/20 text-[#f97316] text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-fire-line"></i>Streak
          </button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Stats */}
        <StatsOverview completedMap={completedMap} />

        {/* Next lesson highlight */}
        {nextStep && (
          <div
            className="rounded-2xl p-4 md:p-5 border"
            style={{
              background: `linear-gradient(135deg, ${nextStep.book.color}15, ${nextStep.book.color}05)`,
              borderColor: `${nextStep.book.color}30`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: `${nextStep.book.color}25`, color: nextStep.book.color }}
              >
                {nextStep.lesson.lessonNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${nextStep.book.color}20`, color: nextStep.book.color }}
                  >
                    {nextStep.book.level}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa]">
                    Bài tiếp theo của bạn
                  </span>
                </div>
                <p className="text-white font-bold text-sm md:text-base">{nextStep.lesson.titleVi}</p>
                <p className="text-white/40 text-xs mt-0.5">{nextStep.lesson.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <i className="ri-translate-2 text-xs"></i>{nextStep.lesson.vocabulary.length} từ vựng
                  </span>
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <i className="ri-book-2-line text-xs"></i>{nextStep.lesson.grammarPoints.length} ngữ pháp
                  </span>
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <i className="ri-time-line text-xs"></i>~30 phút
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/seoul-textbook")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap flex-shrink-0 text-[#0f1117] hover:opacity-90 active:scale-95"
                style={{ backgroundColor: nextStep.book.color }}
              >
                <i className="ri-play-fill"></i>Học ngay
              </button>
            </div>

            {/* Objectives */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {nextStep.lesson.objectives.map((obj, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter + controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "Tất cả" },
              { id: "inprogress", label: "Đang học" },
              { id: "completed", label: "Hoàn thành" },
              { id: "upcoming", label: "Sắp tới" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as typeof filterMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === f.id
                    ? "bg-[#a78bfa]/20 text-[#a78bfa]"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={expandAll} className="text-white/30 hover:text-white/60 text-xs cursor-pointer whitespace-nowrap transition-colors">
              Mở tất cả
            </button>
            <span className="text-white/15">·</span>
            <button onClick={collapseAll} className="text-white/30 hover:text-white/60 text-xs cursor-pointer whitespace-nowrap transition-colors">
              Thu gọn
            </button>
          </div>
        </div>

        {/* Book sections */}
        <div className="space-y-3">
          {filteredBooks.map(book => {
            const steps = stepsByBook.get(book.id) || [];
            return (
              <BookSection
                key={book.id}
                book={book}
                steps={steps}
                onStepClick={handleStepClick}
                isExpanded={expandedBooks.has(book.id)}
                onToggle={() => toggleBook(book.id)}
              />
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "ri-stack-line", color: "#e8c84a", label: "Flashcard Seoul", path: "/seoul-flashcard" },
            { icon: "ri-file-list-3-line", color: "#34d399", label: "Thi thử bài", path: "/seoul-lesson-quiz" },
            { icon: "ri-headphone-line", color: "#06b6d4", label: "Nghe & nhận biết", path: "/seoul-listening-quiz" },
            { icon: "ri-error-warning-line", color: "#f87171", label: "Ôn từ sai", path: "/seoul-wrong-review" },
          ].map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all cursor-pointer group"
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: `${a.color}15` }}
              >
                <i className={`${a.icon} text-base`} style={{ color: a.color }}></i>
              </div>
              <p className="text-white/50 text-[10px] md:text-xs text-center font-medium group-hover:text-white/70 transition-colors">{a.label}</p>
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-[#a78bfa]/5 border border-[#a78bfa]/15 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-[#a78bfa] text-sm"></i>
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold mb-1">Mẹo học theo lộ trình</p>
              <ul className="text-white/40 text-xs leading-relaxed space-y-1">
                <li>• Học theo thứ tự từ 1A đến 4B để đảm bảo nền tảng vững chắc</li>
                <li>• Mỗi bài học khoảng 30 phút — học 1 bài/ngày để duy trì streak</li>
                <li>• Sau mỗi bài, làm quiz để củng cố và nhận XP</li>
                <li>• Ôn lại từ sai thường xuyên để không quên kiến thức cũ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
