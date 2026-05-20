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
      color: "text-green-600",
      bg: "bg-green-50",
      unlocked: totalStudied >= 1,
    },
    {
      id: "streak_3",
      label: "3 ngày liên tiếp",
      desc: "Học 3 ngày liên tiếp",
      icon: "ri-fire-line",
      color: "text-orange-600",
      bg: "bg-orange-50",
      unlocked: streakData.longestStreak >= 3,
    },
    {
      id: "streak_7",
      label: "1 tuần liên tiếp",
      desc: "Học 7 ngày liên tiếp",
      icon: "ri-fire-fill",
      color: "text-red-600",
      bg: "bg-red-50",
      unlocked: streakData.longestStreak >= 7,
    },
    {
      id: "mastered_10",
      label: "Thuộc 10 từ",
      desc: "Đã thuộc 10 từ",
      icon: "ri-star-line",
      color: "text-amber-600",
      bg: "bg-amber-50",
      unlocked: masteryStats.mastered >= 10,
    },
    {
      id: "mastered_50",
      label: "Thuộc 50 từ",
      desc: "Đã thuộc 50 từ",
      icon: "ri-star-fill",
      color: "text-amber-500",
      bg: "bg-amber-50",
      unlocked: masteryStats.mastered >= 50,
    },
    {
      id: "mastered_100",
      label: "Thuộc 100 từ",
      desc: "Đã thuộc 100 từ",
      icon: "ri-trophy-line",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      unlocked: masteryStats.mastered >= 100,
    },
    {
      id: "reviewed_100",
      label: "Ôn 100 lần",
      desc: "Tổng ôn tập 100 lần",
      icon: "ri-refresh-line",
      color: "text-teal-600",
      bg: "bg-teal-50",
      unlocked: totalStudied >= 100,
    },
    {
      id: "streak_30",
      label: "30 ngày liên tiếp",
      desc: "Học 30 ngày liên tiếp",
      icon: "ri-medal-line",
      color: "text-rose-600",
      bg: "bg-rose-50",
      unlocked: streakData.longestStreak >= 30,
    },
  ], [totalStudied, streakData, masteryStats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Streak hiện tại", value: `${streakData.currentStreak} ngày`, icon: "ri-fire-line", color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Kỷ lục streak", value: `${streakData.longestStreak} ngày`, icon: "ri-trophy-line", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Tổng lần ôn", value: totalStudied.toLocaleString(), icon: "ri-refresh-line", color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Đã thuộc", value: `${masteryStats.mastered} từ`, icon: "ri-check-double-line", color: "text-green-600", bg: "bg-green-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <i className={`${s.icon} ${s.color}`}></i>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Hoạt động học tập</p>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["7", "30", "all"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${period === p ? "bg-white text-rose-600" : "text-gray-500"}`}>
                {p === "7" ? "7 ngày" : p === "30" ? "30 ngày" : "90 ngày"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-0.5 h-24 overflow-x-auto">
          {days.map((d, i) => (
            <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center gap-0.5 group relative">
              <div
                className={`w-full rounded-t-sm transition-all cursor-default ${d.isToday ? "bg-rose-500" : d.count > 0 ? "bg-rose-300" : "bg-gray-100"}`}
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
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{days[0]?.label}</span>
          <span>{days[Math.floor(days.length / 2)]?.label}</span>
          <span>{days[days.length - 1]?.label}</span>
        </div>
      </div>

      {/* Streak calendar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Lịch học 5 tuần gần nhất</p>
        <div className="flex gap-1 mb-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
            <div key={d} className="flex-1 text-center text-xs text-gray-400">{d}</div>
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
                    day.count === 0 ? "bg-gray-100" :
                    day.count < 5 ? "bg-rose-200" :
                    day.count < 15 ? "bg-rose-400" : "bg-rose-600"
                  }`}
                ></div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span>Ít</span>
          {["bg-gray-100", "bg-rose-200", "bg-rose-400", "bg-rose-600"].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`}></div>
          ))}
          <span>Nhiều</span>
        </div>
      </div>

      {/* Best day & records */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-calendar-check-line text-rose-500"></i>
            <span className="text-xs font-semibold text-gray-600">Ngày học nhiều nhất</span>
          </div>
          {bestDay ? (
            <>
              <p className="text-2xl font-bold text-rose-600">{bestDay.count} từ</p>
              <p className="text-xs text-gray-400">{formatDate(bestDay.date)} ({getDayLabel(bestDay.date)})</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-bar-chart-2-line text-amber-500"></i>
            <span className="text-xs font-semibold text-gray-600">Trung bình / ngày</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {days.filter(d => d.count > 0).length > 0
              ? Math.round(days.reduce((s, d) => s + d.count, 0) / Math.max(1, days.filter(d => d.count > 0).length))
              : 0} từ
          </p>
          <p className="text-xs text-gray-400">Trong {period === "all" ? "90" : period} ngày qua</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-time-line text-teal-500"></i>
            <span className="text-xs font-semibold text-gray-600">Ngày học gần nhất</span>
          </div>
          {streakData.lastStudyDate ? (
            <>
              <p className="text-2xl font-bold text-teal-600">{formatDate(streakData.lastStudyDate)}</p>
              <p className="text-xs text-gray-400">{getDayLabel(streakData.lastStudyDate)} · {streakData.history[streakData.lastStudyDate] || 0} từ</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Chưa học lần nào</p>
          )}
        </div>
      </div>

      {/* Top reviewed words */}
      {topWords.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Top 10 từ ôn nhiều nhất</p>
          </div>
          <div className="divide-y divide-gray-50">
            {topWords.map((w, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-amber-100 text-amber-700" :
                  i === 1 ? "bg-gray-200 text-gray-600" :
                  i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                }`}>{i + 1}</span>
                <span className="font-bold text-gray-900 w-20 flex-shrink-0">{w.korean}</span>
                <span className="text-rose-400 font-bold w-16 flex-shrink-0">{w.hanja}</span>
                <span className="text-sm text-gray-500 flex-1 truncate">{w.vietnamese}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{w.totalReviews} lần</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <i className="ri-fire-line text-orange-400 text-xs"></i>
                  <span className="text-xs text-orange-500">{w.correctStreak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Thành tích</p>
          <span className="text-xs text-gray-400">{unlockedCount} / {achievements.length} đã mở khóa</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map(a => (
            <div key={a.id} className={`rounded-xl p-3 text-center transition-all ${a.unlocked ? a.bg : "bg-gray-50 opacity-50"}`}>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full mx-auto mb-2 ${a.unlocked ? "bg-white" : "bg-gray-200"}`}>
                <i className={`${a.icon} text-lg ${a.unlocked ? a.color : "text-gray-400"}`}></i>
              </div>
              <p className={`text-xs font-bold ${a.unlocked ? "text-gray-800" : "text-gray-400"}`}>{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
              {a.unlocked && (
                <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
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
