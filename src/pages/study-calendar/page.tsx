import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

interface StudyDay {
  date: string;
  count: number; // 0-4 intensity
  activities: string[];
}

function generateStudyData(): StudyDay[] {
  const days: StudyDay[] = [];
  const today = new Date();
  // Generate 52 weeks = 364 days back
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // Simulate realistic study pattern
    const dayOfWeek = d.getDay();
    const rand = Math.random();
    let count = 0;
    let activities: string[] = [];
    if (rand > 0.35) {
      count = Math.floor(Math.random() * 4) + 1;
      const pool = ["Flashcard", "Quiz", "Tin tức", "EPS", "Hangul", "Từ điển"];
      const n = Math.min(count, pool.length);
      activities = pool.sort(() => Math.random() - 0.5).slice(0, n);
    }
    // Weekends slightly less active
    if ((dayOfWeek === 0 || dayOfWeek === 6) && rand > 0.5) {
      count = Math.max(0, count - 1);
    }
    days.push({ date: dateStr, count, activities });
  }
  return days;
}

const MOCK_STUDY_DATA = generateStudyData();

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-white/5 border border-white/8";
  if (count === 1) return "bg-[#e8c84a]/20 border border-[#e8c84a]/25";
  if (count === 2) return "bg-[#e8c84a]/45 border border-[#e8c84a]/50";
  if (count === 3) return "bg-[#e8c84a]/70 border border-[#e8c84a]/75";
  return "bg-[#e8c84a] border border-[#e8c84a]";
}

function ContributionGraph({ data }: { data: StudyDay[] }) {
  const [tooltip, setTooltip] = useState<{ day: StudyDay; x: number; y: number } | null>(null);

  // Group by weeks
  const weeks = useMemo(() => {
    const result: StudyDay[][] = [];
    let week: StudyDay[] = [];
    // Pad start
    const firstDay = new Date(data[0].date);
    const startDow = firstDay.getDay();
    for (let i = 0; i < startDow; i++) week.push({ date: "", count: -1, activities: [] });
    data.forEach(day => {
      week.push(day);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    });
    if (week.length > 0) result.push(week);
    return result;
  }, [data]);

  const months = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const validDay = week.find(d => d.date);
      if (validDay) {
        const m = new Date(validDay.date).getMonth();
        if (m !== lastMonth) {
          labels.push({ label: new Date(validDay.date).toLocaleDateString("vi-VN", { month: "short" }), col: wi });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-white/30 text-[10px] absolute"
            style={{ left: `${m.col * 14 + 32}px` }}
          >
            {m.label}
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1.5">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
            <div key={d} className="w-6 h-[11px] text-white/20 text-[9px] flex items-center justify-end pr-1">
              {d === "T2" || d === "T4" || d === "T6" ? d : ""}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex gap-0.5 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-[11px] h-[11px] rounded-sm cursor-pointer transition-transform hover:scale-125 ${
                    day.count === -1 ? "opacity-0" : getIntensityClass(day.count)
                  }`}
                  onMouseEnter={e => {
                    if (day.date) {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ day, x: rect.left, y: rect.top });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Tooltip */}
      {tooltip && tooltip.day.date && (
        <div
          className="fixed z-50 bg-[#1a1d27] border border-white/10 rounded-lg px-3 py-2 text-xs pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 16, top: tooltip.y - 60 }}
        >
          <p className="text-white/70 font-medium">
            {new Date(tooltip.day.date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {tooltip.day.count === 0 ? (
            <p className="text-white/30 mt-0.5">Chưa học ngày này</p>
          ) : (
            <>
              <p className="text-[#e8c84a] mt-0.5">{tooltip.day.count} hoạt động</p>
              <p className="text-white/40 mt-0.5">{tooltip.day.activities.join(", ")}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StreakCalendar({ data }: { data: StudyDay[] }) {
  const today = new Date().toISOString().split("T")[0];
  // Get last 35 days (5 weeks)
  const last35 = data.slice(-35);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
        <div key={d} className="text-center text-white/25 text-[10px] font-medium pb-1">{d}</div>
      ))}
      {last35.map((day, i) => {
        const isToday = day.date === today;
        const hasStudy = day.count > 0;
        const d = new Date(day.date);
        return (
          <div
            key={i}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all cursor-pointer
              ${isToday ? "ring-2 ring-[#e8c84a] ring-offset-1 ring-offset-[#0f1117]" : ""}
              ${hasStudy ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "bg-white/3 text-white/20"}
            `}
          >
            <span className="text-[11px]">{d.getDate()}</span>
            {hasStudy && <div className="w-1 h-1 rounded-full bg-[#e8c84a] mt-0.5"></div>}
          </div>
        );
      })}
    </div>
  );
}

function MonthlyBarChart({ data }: { data: StudyDay[] }) {
  // Group by month, count study days
  const months = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => {
      if (d.count > 0) {
        const key = d.date.slice(0, 7);
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map).slice(-6).map(([key, val]) => ({
      label: new Date(key + "-01").toLocaleDateString("vi-VN", { month: "short" }),
      value: val,
    }));
  }, [data]);

  const max = Math.max(...months.map(m => m.value), 1);

  return (
    <div className="flex items-end gap-3 h-28">
      {months.map((m, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-white/50 text-[10px]">{m.value}</span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-[#e8c84a]/60 to-[#e8c84a]/30 transition-all"
            style={{ height: `${(m.value / max) * 80}px` }}
          />
          <span className="text-white/30 text-[10px]">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudyCalendarPage() {
  const navigate = useNavigate();
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [activeTab, setActiveTab] = useState<"contribution" | "calendar">("contribution");

  const studyData = MOCK_STUDY_DATA;

  const totalStudyDays = studyData.filter(d => d.count > 0).length;
  const totalActivities = studyData.reduce((sum, d) => sum + d.count, 0);
  const thisMonthDays = studyData.filter(d => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return d.date.startsWith(thisMonth) && d.count > 0;
  }).length;

  // Longest streak calculation
  let longestStreak = 0;
  let cur = 0;
  studyData.forEach(d => {
    if (d.count > 0) { cur++; longestStreak = Math.max(longestStreak, cur); }
    else cur = 0;
  });

  const stats = [
    { icon: "ri-fire-line", label: "Streak hiện tại", value: `${streak.count} ngày`, color: "text-orange-400" },
    { icon: "ri-trophy-line", label: "Streak dài nhất", value: `${longestStreak} ngày`, color: "text-[#e8c84a]" },
    { icon: "ri-calendar-check-line", label: "Ngày học tháng này", value: `${thisMonthDays} ngày`, color: "text-emerald-400" },
    { icon: "ri-bar-chart-2-line", label: "Tổng hoạt động", value: `${totalActivities}`, color: "text-sky-400" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Lịch học tập</h1>
            <p className="text-white/40 text-sm mt-1">Theo dõi hành trình học tiếng Hàn của bạn</p>
          </div>
          <button
            onClick={() => navigate("/learn-stats")}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-bar-chart-box-line text-sm"></i>
            Thống kê chi tiết
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#1a1d27] border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className={`${s.icon} ${s.color} text-lg`}></i>
                </div>
                <span className="text-white/40 text-xs">{s.label}</span>
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Contribution Graph */}
        <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Biểu đồ hoạt động</h2>
              <p className="text-white/35 text-xs mt-0.5">{totalStudyDays} ngày học trong 12 tháng qua</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-xs">Ít</span>
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} className={`w-3 h-3 rounded-sm ${getIntensityClass(v)}`} />
              ))}
              <span className="text-white/30 text-xs">Nhiều</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <ContributionGraph data={studyData} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak Calendar */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">Lịch 5 tuần gần nhất</h2>
                <p className="text-white/35 text-xs mt-0.5">Ngày có chấm vàng = đã học</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <i className="ri-fire-line text-orange-400 text-xs"></i>
                <span className="text-orange-400 text-xs font-bold">{streak.count} ngày</span>
              </div>
            </div>
            <StreakCalendar data={studyData} />
          </div>

          {/* Monthly bar */}
          <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-white font-semibold">Ngày học theo tháng</h2>
              <p className="text-white/35 text-xs mt-0.5">6 tháng gần nhất</p>
            </div>
            <MonthlyBarChart data={studyData} />

            {/* Activity breakdown */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-white/40 text-xs mb-3">Hoạt động phổ biến nhất</p>
              <div className="space-y-2">
                {[
                  { name: "Flashcard", pct: 82, color: "bg-[#e8c84a]" },
                  { name: "Quiz & Kiểm tra", pct: 67, color: "bg-emerald-400" },
                  { name: "Luyện thi EPS", pct: 54, color: "bg-sky-400" },
                  { name: "Học qua Tin tức", pct: 41, color: "bg-purple-400" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/50 text-xs w-28 truncate">{a.name}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${a.color} rounded-full`} style={{ width: `${a.pct}%` }} />
                    </div>
                    <span className="text-white/30 text-xs w-8 text-right">{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity log */}
        <div className="bg-[#1a1d27] border border-white/8 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Nhật ký học tập gần đây</h2>
          <div className="space-y-2">
            {studyData.filter(d => d.count > 0).slice(-7).reverse().map((day, i) => (
              <div key={i} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                <div className="w-20 text-white/40 text-xs">
                  {new Date(day.date).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })}
                </div>
                <div className="flex gap-1.5 flex-wrap flex-1">
                  {day.activities.map((act, j) => (
                    <span key={j} className="px-2 py-0.5 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-full text-[#e8c84a] text-[10px]">
                      {act}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: day.count }).map((_, k) => (
                    <div key={k} className="w-1.5 h-1.5 rounded-full bg-[#e8c84a]/60" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

