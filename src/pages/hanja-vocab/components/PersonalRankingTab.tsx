import { useState, useMemo } from "react";
import { useHanjaData } from "@/contexts/HanjaDataContext";
import { getStreakData, type StreakData } from "@/utils/streak";

const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function getDayLabel(dateStr: string): string {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[new Date(dateStr).getDay()];
}

export default function PersonalRankingTab() {
  const HANJA_DATA = useHanjaData();
  const [period, setPeriod] = useState<"7" | "30" | "all">("30");

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const streakData = useMemo(() => getStreakData(), []);

  // Build daily history
  const days = useMemo(() => {
    const n = period === "7" ? 7 : period === "30" ? 30 : 90;
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(Date.now() - (n - 1 - i) * 86400000).toISOString().slice(0, 10);
      return {
        date: d,
        count: streakData.history[d] || 0,
        label: formatDate(d),
        dayLabel: getDayLabel(d),
        isToday: d === getToday(),
      };
    });
  }, [period, streakData]);

  const maxCount = useMemo(() => Math.max(...days.map(d => d.count), 1), [days]);

  // Best day
  const bestDay = useMemo(() => {
    const entries = Object.entries(streakData.history);
    if (entries.length === 0) return null;
    const best = entries.reduce((a, b) => b[1] > a[1] ? b : a);
    return { date: best[0], count: best[1] };
  }, [streakData]);

  // Total studied
  const totalStudied = useMemo(() =>
    Object.values(streakData.history).reduce((s, v) => s + v, 0),
    [streakData]
  );

  // Mastery breakdown
  const masteryStats = useMemo(() => {
    let newCount = 0, learningCount = 0, masteredCount = 0;
    HANJA_DATA.forEach(d => {
      const card = srData[d.korean];
      if (!card) newCount++;
      else if (card.interval >= 21) masteredCount++;
      else learningCount++;
    });
    return { new: newCount, learning: learningCount, mastered: masteredCount };
  }, [srData]);

  // Top reviewed words
  const topWords = useMemo(() => {
    return Object.values(srData)
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 10)
      .map(card => {
        const entry = HANJA_DATA.find(e => e.korean === card.korean);
        return { ...card, vietnamese: entry?.vietnamese ?? "", hanja: entry?.hanja ?? "" };
      });
  }, [srData]);

  // Streak calendar (last 5 weeks)
  const calendarWeeks = useMemo(() => {
    const weeks: { date: string; count: number; isToday: boolean }[][] = [];
    const today = new Date();
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 34);
    // align to Monday
    const dow = startDay.getDay();
    startDay.setDate(startDay.getDate() - (dow === 0 ? 6 : dow - 1));

    let week: { date: string; count: number; isToday: boolean }[] = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      week.push({ date: dateStr, count: streakData.history[dateStr] || 0, isToday: dateStr === getToday() });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) weeks.push(week);
    return weeks;
  }, [streakData]);

  // Achievements
  const achievements = useMemo(() => [
    {
      id: "first_word",
      label: "Từ đầu tiên",
      desc: "Học từ đầu tiên",
      icon: "ri-seedling-line",
      color: "text-green-400",
      bg: "bg-green-500/10",
      unlocked: totalStudied >= 1,
    },
    {
      id: "streak_3",
      label: "3 ngày liên tiếp",
      desc: "Học 3 ngày liên tiếp",
      icon: "ri-fire-line",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      unlocked: streakData.longestStreak >= 3,
    },
    {
      id: "streak_7",
      label: "1 tuần liên tiếp",
      desc: "Học 7 ngày liên tiếp",
      icon: "ri-fire-fill",
      color: "text-red-400",
      bg: "bg-red-500/10",
      unlocked: streakData.longestStreak >= 7,
    },
    {
      id: "mastered_10",
      label: "Thuộc 10 từ",
      desc: "Đã thuộc 10 từ",
      icon: "ri-star-line",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      unlocked: masteryStats.mastered >= 10,
    },
    {
      id: "mastered_50",
      label: "Thuộc 50 từ",
      desc: "Đã thuộc 50 từ",
      icon: "ri-star-fill",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      unlocked: masteryStats.mastered >= 50,
    },
    {
      id: "mastered_100",
      label: "Thuộc 100 từ",
      desc: "Đã thuộc 100 từ",
      icon: "ri-trophy-line",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      unlocked: masteryStats.mastered >= 100,
    },
    {
      id: "reviewed_100",
      label: "Ôn 100 lần",
      desc: "Tổng ôn tập 100 lần",
      icon: "ri-refresh-line",
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      unlocked: totalStudied >= 100,
    },
    {
      id: "streak_30",
      label: "30 ngày liên tiếp",
      desc: "Học 30 ngày liên tiếp",
      icon: "ri-medal-line",
      color: "text-app-accent-primary",
      bg: "bg-app-accent-primary/10",
      unlocked: streakData.longestStreak >= 30,
    },
  ], [totalStudied, streakData, masteryStats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div>
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Streak hiện tại", value: `${streakData.currentStreak} ngày`, icon: "ri-fire-line", color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Kỷ lục streak", value: `${streakData.longestStreak} ngày`, icon: "ri-trophy-line", color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Tổng lần ôn", value: totalStudied.toLocaleString(), icon: "ri-refresh-line", color: "text-teal-400", bg: "bg-teal-500/10" },
          { label: "Đã thuộc", value: `${masteryStats.mastered} từ`, icon: "ri-check-double-line", color: "text-green-400", bg: "bg-green-500/10" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <i className={`${s.icon} ${s.color}`}></i>
              <span className="text-xs text-white/50">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white/80">Hoạt động học tập</p>
          <div className="flex gap-1 bg-app-surface/50 rounded-lg p-1">
            {(["7", "30", "all"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${period === p ? "bg-app-surface/50 text-app-accent-primary" : "text-white/50"}`}>
                {p === "7" ? "7 ngày" : p === "30" ? "30 ngày" : "90 ngày"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-0.5 h-24 overflow-x-auto">
          {days.map((d, i) => (
            <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center gap-0.5 group relative">
              <div
                className={`w-full rounded-t-sm transition-all cursor-default ${d.isToday ? "bg-app-accent-primary" : d.count > 0 ? "bg-app-accent-primary/60" : "bg-app-surface/50"}`}
                style={{ height: `${Math.max(4, (d.count / maxCount) * 80)}px` }}
              ></div>
              {/* Tooltip */}
              {d.count > 0 && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {d.label}: {d.count} từ
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/40">
          <span>{days[0]?.label}</span>
          <span>{days[Math.floor(days.length / 2)]?.label}</span>
          <span>{days[days.length - 1]?.label}</span>
        </div>
      </div>

      {/* Streak calendar */}
      <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5 mb-5">
        <p className="text-sm font-semibold text-white/80 mb-3">Lịch học 5 tuần gần nhất</p>
        <div className="flex gap-1 mb-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
            <div key={d} className="flex-1 text-center text-xs text-white/40">{d}</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {calendarWeeks.map((week, wi) => (
            <div key={wi} className="flex gap-1">
              {week.map((day, di) => (
                <div key={di} title={`${day.date}: ${day.count} từ`}
                  className={`flex-1 aspect-square rounded-sm cursor-default transition-all ${
                    day.isToday ? "ring-2 ring-rose-400 ring-offset-1" : ""
                  } ${
                    day.count === 0 ? "bg-app-surface/50" :
                    day.count < 5 ? "bg-app-accent-primary/30" :
                    day.count < 15 ? "bg-app-accent-primary" : "bg-app-accent-primary/90"
                  }`}
                ></div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
          <span>Ít</span>
          {["bg-app-surface/50", "bg-app-accent-primary/30", "bg-app-accent-primary", "bg-app-accent-primary/90"].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`}></div>
          ))}
          <span>Nhiều</span>
        </div>
      </div>

      {/* Best day & records */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-calendar-check-line text-app-accent-primary"></i>
            <span className="text-xs font-semibold text-white/70">Ngày học nhiều nhất</span>
          </div>
          {bestDay ? (
            <>
              <p className="text-2xl font-bold text-app-accent-primary">{bestDay.count} từ</p>
              <p className="text-xs text-white/40">{formatDate(bestDay.date)} ({getDayLabel(bestDay.date)})</p>
            </>
          ) : (
            <p className="text-sm text-white/40">Chưa có dữ liệu</p>
          )}
        </div>
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-bar-chart-2-line text-amber-400"></i>
            <span className="text-xs font-semibold text-white/70">Trung bình / ngày</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {days.filter(d => d.count > 0).length > 0
              ? Math.round(days.reduce((s, d) => s + d.count, 0) / Math.max(1, days.filter(d => d.count > 0).length))
              : 0} từ
          </p>
          <p className="text-xs text-white/40">Trong {period === "all" ? "90" : period} ngày qua</p>
        </div>
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-time-line text-teal-400"></i>
            <span className="text-xs font-semibold text-white/70">Ngày học gần nhất</span>
          </div>
          {streakData.lastStudyDate ? (
            <>
              <p className="text-2xl font-bold text-teal-400">{formatDate(streakData.lastStudyDate)}</p>
              <p className="text-xs text-white/40">{getDayLabel(streakData.lastStudyDate)} · {streakData.history[streakData.lastStudyDate] || 0} từ</p>
            </>
          ) : (
            <p className="text-sm text-white/40">Chưa học lần nào</p>
          )}
        </div>
      </div>

      {/* Top reviewed words */}
      {topWords.length > 0 && (
        <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden mb-5">
          <div className="p-4 border-b border-app-border">
            <p className="text-sm font-semibold text-white/80">Top 10 từ ôn nhiều nhất</p>
          </div>
          <div className="divide-y divide-app-border">
            {topWords.map((w, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-app-surface/50 transition-colors">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-amber-500/20 text-amber-400" :
                  i === 1 ? "bg-app-surface/70 text-white/70" :
                  i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-app-surface/50 text-white/50"
                }`}>{i + 1}</span>
                <span className="font-bold text-white w-20 flex-shrink-0">{w.korean}</span>
                <span className="text-app-accent-primary font-bold w-16 flex-shrink-0">{w.hanja}</span>
                <span className="text-sm text-white/50 flex-1 truncate">{w.vietnamese}</span>
                <span className="text-xs text-white/40 flex-shrink-0">{w.totalReviews} lần</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <i className="ri-fire-line text-orange-400 text-xs"></i>
                  <span className="text-xs text-orange-400">{w.correctStreak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white/80">Thành tích</p>
          <span className="text-xs text-white/40">{unlockedCount} / {achievements.length} đã mở khóa</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map(a => (
            <div key={a.id} className={`rounded-xl p-3 text-center transition-all ${a.unlocked ? a.bg : "bg-app-surface/30 opacity-50"}`}>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full mx-auto mb-2 ${a.unlocked ? "bg-app-surface/50" : "bg-app-surface/70"}`}>
                <i className={`${a.icon} text-lg ${a.unlocked ? a.color : "text-white/40"}`}></i>
              </div>
              <p className={`text-xs font-bold ${a.unlocked ? "text-white/90" : "text-white/40"}`}>{a.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{a.desc}</p>
              {a.unlocked && (
                <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                  <i className="ri-check-line text-xs"></i>Đạt được
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
