import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { seoulBooks } from "@/mocks/seoulTextbook";

interface SeoulStreakData {
  count: number;
  lastDate: string;
  longestStreak: number;
  totalDays: number;
}

export default function SeoulStreakBanner() {
  const navigate = useNavigate();
  const [seoulStreak] = useLocalStorage<SeoulStreakData>("kts_seoul_streak", {
    count: 0,
    lastDate: "",
    longestStreak: 0,
    totalDays: 0,
  });
  const [completedMap] = useLocalStorage<Record<string, boolean>>("kts_seoul_progress", {});

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const isActiveToday = seoulStreak.lastDate === today;
  const isStreakAlive =
    seoulStreak.lastDate === today || seoulStreak.lastDate === yesterday;

  const totalCompleted = Object.values(completedMap).filter(Boolean).length;
  const totalLessons = seoulBooks.reduce((sum, b) => sum + b.totalLessons, 0);
  const overallPct =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const nextLesson = useMemo(() => {
    for (const book of seoulBooks) {
      for (const lesson of book.lessons) {
        if (!completedMap[lesson.id]) {
          return { book, lesson };
        }
      }
    }
    return null;
  }, [completedMap]);

  const streakColor =
    seoulStreak.count >= 30
      ? "#f87171"
      : seoulStreak.count >= 14
      ? "#fb923c"
      : seoulStreak.count >= 7
      ? "#e8c84a"
      : "#f97316";

  return (
    <div className="bg-gradient-to-r from-[#1a0f00] to-[#0f1117] border border-[#f97316]/15 rounded-2xl p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left: Streak info */}
        <div className="flex items-center gap-4 flex-1">
          <div
            className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              backgroundColor: `${streakColor}15`,
              border: `1px solid ${streakColor}30`,
            }}
          >
            <i
              className="ri-fire-fill text-2xl"
              style={{
                color: isStreakAlive ? streakColor : "rgba(255,255,255,0.15)",
                filter: isStreakAlive ? `drop-shadow(0 0 6px ${streakColor}60)` : "none",
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-bold text-sm">Seoul Streak</p>
              {isActiveToday && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                  <i className="ri-check-line mr-0.5" />
                  Hôm nay đã học
                </span>
              )}
              {!isActiveToday && isStreakAlive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] font-semibold animate-pulse">
                  Chưa học hôm nay!
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-black" style={{ color: streakColor }}>
                {seoulStreak.count}
              </span>
              <span className="text-white/40 text-sm">ngày liên tiếp</span>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-white/40 text-xs">{overallPct}% hoàn thành</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden w-full max-w-xs">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%`, backgroundColor: streakColor }}
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 flex-shrink-0">
          {nextLesson && (
            <button
              onClick={() => navigate("/seoul-textbook")}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#a78bfa]/25 bg-[#a78bfa]/8 hover:bg-[#a78bfa]/15 transition-all cursor-pointer text-left group"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#a78bfa]/15 flex-shrink-0">
                <i className="ri-book-3-line text-[#a78bfa] text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[#a78bfa] text-xs font-semibold whitespace-nowrap">Tiếp theo</p>
                <p className="text-white/50 text-[10px] truncate max-w-[140px]">
                  {nextLesson.book.level} ·{" "}
                  {nextLesson.lesson.titleVi.replace("Bài ", "").split(":")[0]}
                </p>
              </div>
              <i className="ri-arrow-right-line text-[#a78bfa]/50 text-xs group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          )}
          <button
            onClick={() => navigate("/seoul-streak")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#f97316]/20 bg-[#f97316]/8 hover:bg-[#f97316]/15 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-fire-line text-[#f97316] text-sm" />
            <span className="text-[#f97316] text-xs font-semibold">Xem Streak</span>
          </button>
          <button
            onClick={() => navigate("/seoul-learning-path")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/3 hover:bg-white/6 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-route-line text-white/50 text-sm" />
            <span className="text-white/50 text-xs font-semibold">Lộ trình</span>
          </button>
        </div>
      </div>
    </div>
  );
}
