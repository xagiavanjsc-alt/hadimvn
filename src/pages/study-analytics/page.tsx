import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Types ────────────────────────────────────────────────────────────────
interface DayData {
  date: string; // YYYY-MM-DD
  minutes: number;
  xp: number;
  words: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function getDayKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }
  return days;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }
  return days;
}

function getLast12Weeks(): { label: string; days: string[] }[] {
  const weeks: { label: string; days: string[] }[] = [];
  for (let w = 11; w >= 0; w--) {
    const days: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - w * 7 - d);
      days.push(getDayKey(date));
    }
    const startDate = new Date(days[0]);
    weeks.push({
      label: `T${startDate.getMonth() + 1}/${startDate.getDate()}`,
      days,
    });
  }
  return weeks;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function getDayOfWeek(dateStr: string): string {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[new Date(dateStr).getDay()];
}

// ─── Mock data generator (based on localStorage) ─────────────────────────
function generateStudyData(
  xpHistory: Record<string, number>,
  completedLessons: Record<number, { completedAt: string }>,
  quizHistory: { date: string; score: number }[]
): Record<string, DayData> {
  const data: Record<string, DayData> = {};

  // From XP history
  Object.entries(xpHistory).forEach(([date, xp]) => {
    if (!data[date]) data[date] = { date, minutes: 0, xp: 0, words: 0 };
    data[date].xp += xp;
    data[date].minutes += Math.round(xp / 5);
  });

  // From completed lessons
  Object.values(completedLessons).forEach(({ completedAt }) => {
    const date = completedAt.split("T")[0];
    if (!data[date]) data[date] = { date, minutes: 0, xp: 0, words: 0 };
    data[date].minutes += 20;
    data[date].words += 15;
  });

  // From quiz history
  quizHistory.forEach(({ date }) => {
    if (!data[date]) data[date] = { date, minutes: 0, xp: 0, words: 0 };
    data[date].minutes += 10;
  });

  return data;
}

// ─── Streak Calendar ──────────────────────────────────────────────────────
function StreakCalendar({ studyData }: { studyData: Record<string, DayData> }) {
  const weeks = getLast12Weeks();
  const maxMinutes = Math.max(...Object.values(studyData).map(d => d.minutes), 1);

  const getColor = (minutes: number) => {
    if (minutes === 0) return "bg-app-card/50";
    const ratio = minutes / maxMinutes;
    if (ratio < 0.25) return "bg-app-accent-primary/20";
    if (ratio < 0.5) return "bg-app-accent-primary/45";
    if (ratio < 0.75) return "bg-app-accent-primary/70";
    return "bg-app-accent-primary";
  };

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Lịch học tập (12 tuần)</h3>
        <div className="flex items-center gap-2 text-xs text-app-text-muted">
          <span>Ít</span>
          <div className="flex gap-1">
            {["bg-app-card/50", "bg-app-accent-primary/20", "bg-app-accent-primary/45", "bg-app-accent-primary/70", "bg-app-accent-primary"].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`}></div>
            ))}
          </div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mb-1 ml-10">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-app-text-muted truncate">{w.label}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-1">
        {/* Day of week labels */}
        <div className="flex flex-col gap-1 mr-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
            <div key={d} className="h-3 flex items-center text-[9px] text-app-text-muted w-8">{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex-1 flex flex-col gap-1">
            {/* Mon=1..Sun=0, reorder to Mon-Sun */}
            {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
              const dayStr = week.days.find(d => new Date(d).getDay() === dayOfWeek);
              if (!dayStr) return <div key={dayOfWeek} className="h-3 rounded-sm bg-transparent"></div>;
              const data = studyData[dayStr];
              const minutes = data?.minutes || 0;
              return (
                <div
                  key={dayOfWeek}
                  title={`${formatDate(dayStr)}: ${minutes} phút`}
                  className={`h-3 rounded-sm transition-all ${getColor(minutes)}`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────
function WeeklyChart({
  studyData,
  metric,
}: {
  studyData: Record<string, DayData>;
  metric: "minutes" | "xp" | "words";
}) {
  const days = getLast7Days();
  const values = days.map(d => studyData[d]?.[metric] || 0);
  const maxVal = Math.max(...values, 1);

  const metricLabel = metric === "minutes" ? "phút" : metric === "xp" ? "XP" : "từ";
  const metricColor = metric === "minutes" ? "app-accent-primary" : metric === "xp" ? "#a78bfa" : "#34d399";

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-32">
        {days.map((day, i) => {
          const val = values[i];
          const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isToday = day === getDayKey(new Date());
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-app-text-secondary">{val > 0 ? val : ""}</span>
              <div className="w-full flex items-end" style={{ height: "80px" }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(height, val > 0 ? 4 : 0)}%`,
                    backgroundColor: isToday ? metricColor : `${metricColor}60`,
                    minHeight: val > 0 ? "4px" : "0",
                  }}
                ></div>
              </div>
              <span className={`text-[10px] font-medium ${isToday ? "text-white" : "text-app-text-secondary"}`}>
                {getDayOfWeek(day)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-app-text-muted">
        <span>7 ngày qua</span>
        <span>Tổng: {values.reduce((a, b) => a + b, 0)} {metricLabel}</span>
      </div>
    </div>
  );
}

// ─── Module Progress Cards ────────────────────────────────────────────────
function ModuleProgressCard({
  title,
  icon,
  color,
  completed,
  total,
  details,
  href,
}: {
  title: string;
  icon: string;
  color: string;
  completed: number;
  total: number;
  details: { label: string; value: string }[];
  href: string;
}) {
  const navigate = useNavigate();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 28;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div
      onClick={() => navigate(href)}
      className="bg-app-bg border border-app-border rounded-2xl p-5 cursor-pointer hover:border-app-border transition-all group"
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Circle progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={color} strokeWidth="5"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{pct}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 flex items-center justify-center rounded-md" style={{ backgroundColor: `${color}20` }}>
              <i className={`${icon} text-xs`} style={{ color }}></i>
            </div>
            <p className="text-white font-semibold text-sm truncate">{title}</p>
          </div>
          <p className="text-app-text-secondary text-xs">{completed}/{total} hoàn thành</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {details.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-white font-semibold text-sm">{d.value}</p>
            <p className="text-app-text-muted text-[10px]">{d.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-app-text-muted group-hover:text-white/50 transition-colors">
        <span className="text-xs">Xem chi tiết</span>
        <i className="ri-arrow-right-s-line text-sm"></i>
      </div>
    </div>
  );
}

// ─── Vocabulary Heatmap by Topic ──────────────────────────────────────────
function VocabTopicChart({ completedLessons }: { completedLessons: Record<number, { score: number }> }) {
  const topics = [
    { label: "Chào hỏi", range: [1, 5], color: "app-accent-primary" },
    { label: "Sinh hoạt", range: [6, 12], color: "#a78bfa" },
    { label: "Cuối tuần", range: [13, 19], color: "#34d399" },
    { label: "Internet", range: [20, 25], color: "#06b6d4" },
  ];

  return (
    <div className="space-y-3">
      {topics.map(t => {
        const total = t.range[1] - t.range[0] + 1;
        let done = 0;
        for (let i = t.range[0]; i <= t.range[1]; i++) {
          if (completedLessons[i]) done++;
        }
        const pct = Math.round((done / total) * 100);
        return (
          <div key={t.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">{t.label} (Bài {t.range[0]}–{t.range[1]})</span>
              <span className="font-semibold" style={{ color: t.color }}>{done}/{total}</span>
            </div>
            <div className="h-2 bg-app-card/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: t.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function StudyAnalyticsPage() {
  const navigate = useNavigate();
  const [chartMetric, setChartMetric] = useState<"minutes" | "xp" | "words">("minutes");
  const [completedLessons] = useLocalStorage<Record<number, { score: number; completedAt: string }>>("kts_eps_lessons_progress", {});
  const [xpLog] = useLocalStorage<{ amount: number; reason: string; date: string }[]>("kts_xp_log", []);
  const [quizHistory] = useLocalStorage<{ date: string; score: number; total: number }[]>("kts_quiz_history", []);
  const [streak] = useLocalStorage<number>("kts_streak", 0);
  const [totalXP] = useLocalStorage<number>("kts_total_xp", 0);
  const [flashcardCount] = useLocalStorage<number>("kts_flashcard_total", 0);

  // Build XP by date
  const xpByDate = useMemo(() => {
    const map: Record<string, number> = {};
    xpLog.forEach(entry => {
      const date = entry.date?.split("T")[0] || getDayKey(new Date());
      map[date] = (map[date] || 0) + entry.amount;
    });
    return map;
  }, [xpLog]);

  const studyData = useMemo(() =>
    generateStudyData(xpByDate, completedLessons, quizHistory),
    [xpByDate, completedLessons, quizHistory]
  );

  // Stats
  const last7 = getLast7Days();
  const last30 = getLast30Days();
  const activeDays7 = last7.filter(d => studyData[d]?.minutes > 0).length;
  const activeDays30 = last30.filter(d => studyData[d]?.minutes > 0).length;
  const totalMinutes7 = last7.reduce((s, d) => s + (studyData[d]?.minutes || 0), 0);
  const totalWords7 = last7.reduce((s, d) => s + (studyData[d]?.words || 0), 0);
  const avgMinutes7 = activeDays7 > 0 ? Math.round(totalMinutes7 / activeDays7) : 0;
  const totalLessons = Object.keys(completedLessons).length;
  const totalVocabLearned = totalLessons * 18; // avg 18 words per lesson

  // Best day
  const bestDay = useMemo(() => {
    let best = { date: "", minutes: 0 };
    Object.values(studyData).forEach(d => {
      if (d.minutes > best.minutes) best = d;
    });
    return best;
  }, [studyData]);

  // Streak calendar data
  const streakDays = useMemo(() => {
    const days: string[] = [];
    let current = new Date();
    while (studyData[getDayKey(current)]?.minutes > 0) {
      days.push(getDayKey(current));
      current.setDate(current.getDate() - 1);
    }
    return days;
  }, [studyData]);

  return (
    <DashboardLayout
      title="Thống kê học tập"
      subtitle="Phân tích chi tiết tiến độ và thói quen học tập của bạn"
    >
      {/* Top KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: "Streak hiện tại", value: `${streak} ngày`, icon: "ri-fire-line", color: "#fb923c", sub: "Liên tiếp" },
          { label: "Ngày học (30 ngày)", value: `${activeDays30} ngày`, icon: "ri-calendar-check-line", color: "#34d399", sub: `${Math.round((activeDays30 / 30) * 100)}% tháng này` },
          { label: "Tổng XP", value: totalXP.toLocaleString(), icon: "ri-star-line", color: "app-accent-primary", sub: "Điểm kinh nghiệm" },
          { label: "Từ vựng đã học", value: `~${totalVocabLearned}`, icon: "ri-book-2-line", color: "#a78bfa", sub: `${totalLessons} bài hoàn thành` },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-xl leading-none mb-1">{s.value}</p>
            <p className="text-app-text-muted text-xs">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly chart */}
        <div className="lg:col-span-2 bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-white font-semibold text-sm">Biểu đồ 7 ngày qua</h3>
            <div className="flex rounded-lg border border-app-border overflow-hidden">
              {(["minutes", "xp", "words"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${chartMetric === m ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"}`}
                >
                  {m === "minutes" ? "Thời gian" : m === "xp" ? "XP" : "Từ vựng"}
                </button>
              ))}
            </div>
          </div>
          <WeeklyChart studyData={studyData} metric={chartMetric} />
        </div>

        {/* Quick stats */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Tóm tắt tuần này</h3>
          <div className="space-y-4">
            {[
              { label: "Ngày học", value: `${activeDays7}/7`, icon: "ri-calendar-line", color: "#34d399" },
              { label: "Tổng thời gian", value: `${totalMinutes7} phút`, icon: "ri-time-line", color: "app-accent-primary" },
              { label: "TB mỗi ngày học", value: `${avgMinutes7} phút`, icon: "ri-bar-chart-line", color: "#a78bfa" },
              { label: "Từ vựng ôn", value: `~${totalWords7} từ`, icon: "ri-book-open-line", color: "#06b6d4" },
              { label: "Ngày học tốt nhất", value: bestDay.date ? `${formatDate(bestDay.date)} (${bestDay.minutes}p)` : "—", icon: "ri-trophy-line", color: "#fb923c" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-app-text-secondary text-xs">{s.label}</p>
                  <p className="text-white font-semibold text-sm">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="mb-6">
        <StreakCalendar studyData={studyData} />
      </div>

      {/* Module progress */}
      <div className="mb-6">
        <h3 className="text-white font-semibold text-sm mb-4">Tiến độ theo module</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModuleProgressCard
            title="EPS-TOPIK"
            icon="ri-book-open-line"
            color="app-accent-primary"
            completed={totalLessons}
            total={60}
            details={[
              { label: "Bài học", value: `${totalLessons}/60` },
              { label: "Từ vựng", value: `~${totalVocabLearned}` },
              { label: "XP", value: `+${totalXP}` },
            ]}
            href="/eps-lessons"
          />
          <ModuleProgressCard
            title="TOPIK I/II"
            icon="ri-file-text-line"
            color="#a78bfa"
            completed={quizHistory.length}
            total={50}
            details={[
              { label: "Bài thi", value: `${quizHistory.length}` },
              { label: "Flashcard", value: `${flashcardCount}` },
              { label: "Streak", value: `${streak}` },
            ]}
            href="/topik-test"
          />
          <ModuleProgressCard
            title="Giáo trình Seoul"
            icon="ri-graduation-cap-line"
            color="#34d399"
            completed={Math.min(Math.floor(totalLessons / 3), 20)}
            total={20}
            details={[
              { label: "Bài học", value: `${Math.min(Math.floor(totalLessons / 3), 20)}/20` },
              { label: "Cụm từ", value: "—" },
              { label: "Bài thi", value: "—" },
            ]}
            href="/seoul-textbook"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vocab by topic */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Từ vựng EPS theo chủ đề</h3>
          <VocabTopicChart completedLessons={completedLessons} />
          <button
            onClick={() => navigate("/eps-lessons")}
            className="mt-4 w-full py-2.5 rounded-xl border border-app-accent-primary/20 bg-app-accent-primary/5 text-app-accent-primary text-xs font-semibold hover:bg-app-accent-primary/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            Tiếp tục học EPS
          </button>
        </div>

        {/* Study habits */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Thói quen học tập</h3>
          <div className="space-y-3">
            {/* Best time of day — mock */}
            <div className="p-3 rounded-xl bg-app-surface/50 border border-app-border">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-sun-line text-app-accent-primary text-sm"></i>
                <p className="text-white/60 text-xs font-medium">Thời điểm học tốt nhất</p>
              </div>
              <p className="text-white font-semibold text-sm">Buổi tối (19:00 – 22:00)</p>
              <p className="text-app-text-muted text-xs mt-0.5">Dựa trên lịch sử học tập</p>
            </div>

            {/* Consistency */}
            <div className="p-3 rounded-xl bg-app-surface/50 border border-app-border">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-repeat-line text-[#34d399] text-sm"></i>
                <p className="text-white/60 text-xs font-medium">Tính nhất quán</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-app-card/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#34d399]" style={{ width: `${Math.round((activeDays30 / 30) * 100)}%` }} />
                </div>
                <span className="text-[#34d399] font-bold text-sm">{Math.round((activeDays30 / 30) * 100)}%</span>
              </div>
              <p className="text-app-text-muted text-xs mt-1">{activeDays30}/30 ngày trong tháng</p>
            </div>

            {/* Avg session */}
            <div className="p-3 rounded-xl bg-app-surface/50 border border-app-border">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-timer-line text-[#a78bfa] text-sm"></i>
                <p className="text-white/60 text-xs font-medium">Thời gian học trung bình</p>
              </div>
              <p className="text-white font-semibold text-sm">{avgMinutes7} phút / buổi</p>
              <p className="text-app-text-muted text-xs mt-0.5">
                {avgMinutes7 >= 30 ? "Tốt! Duy trì nhé" : avgMinutes7 >= 15 ? "Khá tốt, cố gắng thêm" : "Hãy học thêm mỗi ngày"}
              </p>
            </div>

            {/* Recommendation */}
            <div className="p-3 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15">
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
                <p className="text-app-accent-primary text-xs font-semibold">Gợi ý hôm nay</p>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {totalLessons < 5
                  ? "Bắt đầu với bài 1–5 EPS để xây dựng nền tảng vững chắc!"
                  : totalLessons < 15
                  ? "Tiếp tục học bài EPS và ôn lại từ vựng bằng flashcard!"
                  : "Thử thi thử EPS để kiểm tra trình độ của bạn!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tiếp tục học EPS", icon: "ri-book-open-line", color: "app-accent-primary", href: "/eps-lessons" },
            { label: "Ôn flashcard", icon: "ri-stack-line", color: "#a78bfa", href: "/eps-flashcard" },
            { label: "Thi thử EPS", icon: "ri-file-text-line", color: "#34d399", href: "/eps-exam" },
            { label: "Lộ trình học", icon: "ri-map-2-line", color: "#fb923c", href: "/learning-path" },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.href)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-app-border bg-white/2 hover:border-app-border hover:bg-white/4 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${a.color}15` }}>
                <i className={`${a.icon} text-lg`} style={{ color: a.color }}></i>
              </div>
              <p className="text-white/60 text-xs text-center group-hover:text-white/80 transition-colors">{a.label}</p>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

