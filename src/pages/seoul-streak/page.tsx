import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { seoulBooks } from "@/mocks/seoulTextbook";

// ─── Types ──────────────────────────────────────────────────────────────────
interface SeoulStreak {
  count: number;
  lastDate: string;
  totalDays: number;
  longestStreak: number;
}

interface DayRecord {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getWeekDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ─── Streak flame animation ───────────────────────────────────────────────────
function FlameIcon({ size = 48, active = true }: { size?: number; active?: boolean }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <i
        className="ri-fire-fill"
        style={{
          fontSize: size * 0.75,
          color: active ? "#f97316" : "rgba(255,255,255,0.15)",
          filter: active ? "drop-shadow(0 0 8px rgba(249,115,22,0.6))" : "none",
        }}
      ></i>
    </div>
  );
}

// ─── XP Bonus table ───────────────────────────────────────────────────────────
const XP_BONUSES = [
  { days: 3, bonus: 15, label: "3 ngày" },
  { days: 7, bonus: 35, label: "1 tuần" },
  { days: 14, bonus: 70, label: "2 tuần" },
  { days: 30, bonus: 150, label: "1 tháng" },
  { days: 60, bonus: 300, label: "2 tháng" },
  { days: 100, bonus: 500, label: "100 ngày" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SeoulStreakPage() {
  const navigate = useNavigate();
  const [streak, setStreak] = useLocalStorage<SeoulStreak>("kts_seoul_streak", {
    count: 0,
    lastDate: "",
    totalDays: 0,
    longestStreak: 0,
  });
  const [completedMap] = useLocalStorage<Record<string, boolean>>("kts_seoul_progress", {});
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });
  const [dayHistory] = useLocalStorage<DayRecord[]>("kts_seoul_day_history", []);
  const [showCelebration, setShowCelebration] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isActiveToday = streak.lastDate === today;
  const weekDays = getWeekDays();
  const last30 = getLast30Days();

  // Check if streak is broken
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const isStreakAlive = streak.lastDate === today || streak.lastDate === yesterday;

  // Total lessons completed
  const totalCompleted = Object.values(completedMap).filter(Boolean).length;
  const totalLessons = seoulBooks.reduce((sum, b) => sum + b.lessons.length, 0);

  // Next milestone
  const nextMilestone = XP_BONUSES.find(m => m.days > streak.count);
  const prevMilestone = [...XP_BONUSES].reverse().find(m => m.days <= streak.count);

  // Simulate "check in" for today (mark streak active)
  const handleCheckIn = () => {
    if (isActiveToday) return;
    const yesterday2 = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newCount = streak.lastDate === yesterday2 ? streak.count + 1 : 1;
    const newLongest = Math.max(streak.longestStreak || 0, newCount);
    setStreak({
      count: newCount,
      lastDate: today,
      totalDays: (streak.totalDays || 0) + 1,
      longestStreak: newLongest,
    });
    // Award XP
    const bonus = Math.min(newCount * 5, 50);
    setXpData({ total: (xpData.total || 0) + bonus + 10 });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // Days with activity (from history or completedMap)
  const activeDays = new Set<string>(dayHistory.map(d => d.date));
  if (isActiveToday) activeDays.add(today);

  return (
    <DashboardLayout
      title="Streak học Seoul"
      subtitle="Theo dõi chuỗi ngày học liên tiếp và nhận XP bonus"
      actions={
        <button
          onClick={() => navigate("/seoul-textbook")}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-book-3-line"></i>Giáo trình Seoul
        </button>
      }
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-[#f97316]/20 border border-[#f97316]/40 rounded-2xl px-8 py-6 text-center animate-bounce">
            <p className="text-4xl mb-2">🔥</p>
            <p className="text-white font-bold text-lg">Streak {streak.count} ngày!</p>
            <p className="text-[#f97316] text-sm">+{Math.min(streak.count * 5, 50) + 10} XP</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main streak card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#f97316]/15 to-[#f97316]/5 border border-[#f97316]/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <i className="ri-fire-fill text-[120px] text-[#f97316]"></i>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <FlameIcon size={72} active={isStreakAlive} />
              {isStreakAlive && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-xs"></i>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black text-white">{streak.count}</span>
                <span className="text-[#f97316] font-semibold text-lg">ngày liên tiếp</span>
              </div>
              <p className="text-white/50 text-sm">
                {isActiveToday
                  ? "Hôm nay đã học rồi! Tiếp tục duy trì nhé."
                  : isStreakAlive
                  ? "Hôm nay chưa học. Đừng để streak bị gián đoạn!"
                  : streak.count === 0
                  ? "Bắt đầu streak của bạn ngay hôm nay!"
                  : "Streak đã bị gián đoạn. Bắt đầu lại nào!"}
              </p>
              {!isActiveToday && (
                <button
                  onClick={handleCheckIn}
                  className="mt-3 flex items-center gap-2 bg-[#f97316] hover:bg-[#f97316]/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-fire-line"></i>
                  Điểm danh hôm nay (+10 XP)
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#f97316] text-2xl font-black">{streak.count}</p>
              <p className="text-white/40 text-xs mt-0.5">Streak hiện tại</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white text-2xl font-black">{streak.longestStreak || 0}</p>
              <p className="text-white/40 text-xs mt-0.5">Streak dài nhất</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-emerald-400 text-2xl font-black">{streak.totalDays || 0}</p>
              <p className="text-white/40 text-xs mt-0.5">Tổng ngày học</p>
            </div>
          </div>
        </div>

        {/* Weekly calendar */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Tuần này</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const isToday = day === today;
              const hasActivity = activeDays.has(day) || (day === today && isActiveToday);
              const isPast = day < today;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-white/30 text-[10px]">{DAY_LABELS[i]}</span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      hasActivity
                        ? "bg-[#f97316]/20 border border-[#f97316]/40"
                        : isToday
                        ? "bg-white/8 border border-white/20"
                        : isPast
                        ? "bg-white/3 border border-white/5"
                        : "bg-white/2 border border-white/3"
                    }`}
                  >
                    {hasActivity ? (
                      <i className="ri-fire-fill text-[#f97316] text-sm"></i>
                    ) : isToday ? (
                      <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    ) : isPast ? (
                      <div className="w-2 h-2 rounded-full bg-white/10"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Mốc tiếp theo</h3>
              <span className="text-[#f97316] text-xs font-semibold">+{nextMilestone.bonus} XP bonus</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 text-xs">{streak.count} ngày</span>
                  <span className="text-[#f97316] text-xs font-semibold">{nextMilestone.label}</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (streak.count / nextMilestone.days) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-white/30 text-xs mt-1.5">
                  Còn {nextMilestone.days - streak.count} ngày nữa để nhận {nextMilestone.bonus} XP bonus
                </p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#f97316]/10 flex-shrink-0">
                <i className="ri-trophy-line text-[#f97316] text-xl"></i>
              </div>
            </div>
          </div>
        )}

        {/* XP Bonus milestones */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Mốc thưởng XP</h3>
          <div className="space-y-2">
            {XP_BONUSES.map(milestone => {
              const achieved = streak.count >= milestone.days;
              const isCurrent = nextMilestone?.days === milestone.days;
              return (
                <div
                  key={milestone.days}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    achieved
                      ? "bg-[#f97316]/8 border-[#f97316]/20"
                      : isCurrent
                      ? "bg-white/5 border-white/15"
                      : "bg-white/2 border-white/5"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      achieved ? "bg-[#f97316]/20" : "bg-white/5"
                    }`}
                  >
                    {achieved ? (
                      <i className="ri-checkbox-circle-fill text-[#f97316]"></i>
                    ) : (
                      <i className="ri-fire-line text-white/20"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${achieved ? "text-white" : "text-white/40"}`}>
                      {milestone.label} liên tiếp
                    </p>
                    <p className="text-white/30 text-xs">{milestone.days} ngày học Seoul</p>
                  </div>
                  <div className={`text-right flex-shrink-0 ${achieved ? "text-[#f97316]" : "text-white/25"}`}>
                    <p className="text-sm font-bold">+{milestone.bonus} XP</p>
                    {isCurrent && !achieved && (
                      <p className="text-[10px] text-white/30">Còn {milestone.days - streak.count} ngày</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress summary */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Tiến độ học tập</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/50 text-xs">Bài đã học</span>
                <span className="text-white text-xs font-semibold">{totalCompleted}/{totalLessons}</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                  style={{ width: `${totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/50 text-xs">Tổng XP</span>
                <span className="text-[#e8c84a] text-xs font-semibold">{(xpData.total || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e8c84a] to-[#fbbf24] transition-all"
                  style={{ width: `${Math.min(100, ((xpData.total || 0) / 10000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => navigate("/seoul-textbook")}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-book-3-line text-[#a78bfa]"></i>
              </div>
              <span className="text-white/50 text-xs text-center">Học bài mới</span>
            </button>
            <button
              onClick={() => navigate("/seoul-lesson-quiz")}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-file-list-3-line text-[#34d399]"></i>
              </div>
              <span className="text-white/50 text-xs text-center">Thi thử bài</span>
            </button>
            <button
              onClick={() => navigate("/seoul-wrong-review")}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-error-warning-line text-red-400"></i>
              </div>
              <span className="text-white/50 text-xs text-center">Ôn từ sai</span>
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#f97316]/5 border border-[#f97316]/15 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-[#f97316] text-sm"></i>
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold mb-1">Mẹo duy trì streak</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Học ít nhất 1 bài mỗi ngày để duy trì streak. Làm quiz bài học sẽ tự động cập nhật streak và tiến độ. Streak càng dài, XP bonus càng nhiều!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
