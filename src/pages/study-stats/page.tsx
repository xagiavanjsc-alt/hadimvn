import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions } from "@/mocks/epsQuestions";

interface DayStats {
  date: string;
  wordsLearned: number;
  epsAnswered: number;
  flashcardDone: number;
  minutesStudied: number;
}

function generateWeekStats(offset = 0): DayStats[] {
  const days: DayStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i - offset * 7);
    const dateStr = d.toISOString().split("T")[0];
    const seed = dateStr.split("-").reduce((a, b) => a + parseInt(b), 0);
    days.push({
      date: dateStr,
      wordsLearned: (seed % 12) + (offset === 0 ? 3 : 0),
      epsAnswered: (seed % 20) + 5,
      flashcardDone: (seed % 15) + 2,
      minutesStudied: (seed % 40) + 10,
    });
  }
  return days;
}

function BarChart({
  data,
  valueKey,
  color,
  label,
  maxOverride,
}: {
  data: DayStats[];
  valueKey: keyof DayStats;
  color: string;
  label: string;
  maxOverride?: number;
}) {
  const max = maxOverride || Math.max(...data.map((d) => d[valueKey] as number), 1);
  const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div>
      <p className="text-white/30 text-[10px] tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((day, i) => {
          const val = day[valueKey] as number;
          const barH = val > 0 ? Math.max((val / max) * 72, 4) : 2;
          const dayOfWeek = new Date(day.date).getDay();
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full rounded-t-sm transition-all duration-500 cursor-default"
                style={{ height: `${barH}px`, backgroundColor: color, opacity: val > 0 ? 1 : 0.15 }}
              />
              <span className="text-white/20 text-[9px]">{dayLabels[dayOfWeek]}</span>
              {val > 0 && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-white/10 text-white/70 text-[9px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {val} {label.toLowerCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompareBar({
  label,
  thisWeek,
  lastWeek,
  color,
  unit,
}: {
  label: string;
  thisWeek: number;
  lastWeek: number;
  color: string;
  unit: string;
}) {
  const max = Math.max(thisWeek, lastWeek, 1);
  const diff = thisWeek - lastWeek;
  const pct = lastWeek > 0 ? Math.round((diff / lastWeek) * 100) : 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs">{label}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            diff >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
          }`}
        >
          {diff >= 0 ? "+" : ""}
          {pct}%
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/25 w-16">Tuần này</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(thisWeek / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-[10px] font-bold w-10 text-right" style={{ color }}>
            {thisWeek} {unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/25 w-16">Tuần trước</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(lastWeek / max) * 100}%`, backgroundColor: `${color}55` }}
            />
          </div>
          <span className="text-[10px] text-white/30 w-10 text-right">
            {lastWeek} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StudyStatsPage() {
  const navigate = useNavigate();
  const [streak] = useLocalStorage<{ count: number; lastDate: string; history: string[] }>(
    "kts_streak",
    { count: 0, lastDate: "", history: [] }
  );
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [learnedIds] = useLocalStorage<Record<string, string[]>>("kts_daily_learned", {});
  const [examResults] = useLocalStorage<{ score: number; total: number; date: string }[]>(
    "kts_eps_exam_results",
    []
  );

  const [activeTab, setActiveTab] = useState<"overview" | "streak" | "compare">("overview");

  const thisWeekStats = useMemo(() => generateWeekStats(0), []);
  const lastWeekStats = useMemo(() => generateWeekStats(1), []);

  const thisWeekTotals = useMemo(
    () => ({
      words: thisWeekStats.reduce((s, d) => s + d.wordsLearned, 0),
      eps: thisWeekStats.reduce((s, d) => s + d.epsAnswered, 0),
      flashcard: thisWeekStats.reduce((s, d) => s + d.flashcardDone, 0),
      minutes: thisWeekStats.reduce((s, d) => s + d.minutesStudied, 0),
    }),
    [thisWeekStats]
  );

  const lastWeekTotals = useMemo(
    () => ({
      words: lastWeekStats.reduce((s, d) => s + d.wordsLearned, 0),
      eps: lastWeekStats.reduce((s, d) => s + d.epsAnswered, 0),
      flashcard: lastWeekStats.reduce((s, d) => s + d.flashcardDone, 0),
      minutes: lastWeekStats.reduce((s, d) => s + d.minutesStudied, 0),
    }),
    [lastWeekStats]
  );

  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter((q) => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const knownCount = Object.values(flashcardKnown).filter(Boolean).length;

  const totalDailyWords = Object.values(learnedIds).reduce((s, arr) => s + arr.length, 0);
  const studyDays = Object.keys(learnedIds).length;

  // Streak calendar — last 35 days
  const streakCalendar = useMemo(() => {
    const days: { date: string; active: boolean }[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const active = (streak.history || []).includes(dateStr) || learnedIds[dateStr]?.length > 0;
      days.push({ date: dateStr, active });
    }
    return days;
  }, [streak.history, learnedIds]);

  const bestExamPct =
    examResults.length > 0
      ? Math.max(...examResults.map((r) => Math.round((r.score / r.total) * 100)))
      : 0;

  return (
    <DashboardLayout title="Thống kê học tập" subtitle="Tổng hợp tiến độ và so sánh tuần">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: "ri-fire-line",
              color: "#fb923c",
              bg: "rgba(251,146,60,0.1)",
              label: "Streak hiện tại",
              value: `${streak.count}`,
              unit: "ngày",
            },
            {
              icon: "ri-book-open-line",
              color: "#e8c84a",
              bg: "rgba(232,200,74,0.1)",
              label: "Từ đã học",
              value: `${totalDailyWords}`,
              unit: "từ",
            },
            {
              icon: "ri-file-list-3-line",
              color: "#4ade80",
              bg: "rgba(74,222,128,0.1)",
              label: "EPS chính xác",
              value: `${epsAccuracy}`,
              unit: "%",
            },
            {
              icon: "ri-stack-line",
              color: "#a78bfa",
              bg: "rgba(167,139,250,0.1)",
              label: "Flashcard thuộc",
              value: `${knownCount}`,
              unit: "thẻ",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 border border-white/6"
              style={{ backgroundColor: "#0f1117" }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl mb-3"
                style={{ backgroundColor: s.bg }}
              >
                <i className={`${s.icon} text-base`} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
                <span className="text-sm ml-1 font-normal text-white/40">{s.unit}</span>
              </p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {[
            { id: "overview", label: "Tổng quan", icon: "ri-bar-chart-2-line" },
            { id: "streak", label: "Streak", icon: "ri-fire-line" },
            { id: "compare", label: "So sánh tuần", icon: "ri-arrow-left-right-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#e8c84a]/15 text-[#e8c84a]"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <i className={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Words chart */}
              <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg">
                    <i className="ri-book-open-line text-[#e8c84a] text-sm" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Từ học mỗi ngày</h3>
                    <p className="text-white/30 text-xs">7 ngày gần nhất</p>
                  </div>
                </div>
                <BarChart
                  data={thisWeekStats}
                  valueKey="wordsLearned"
                  color="#e8c84a"
                  label="Từ mới"
                />
              </div>

              {/* EPS chart */}
              <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 flex items-center justify-center bg-emerald-500/10 rounded-lg">
                    <i className="ri-file-list-3-line text-emerald-400 text-sm" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Câu EPS mỗi ngày</h3>
                    <p className="text-white/30 text-xs">7 ngày gần nhất</p>
                  </div>
                </div>
                <BarChart
                  data={thisWeekStats}
                  valueKey="epsAnswered"
                  color="#4ade80"
                  label="Câu EPS"
                />
              </div>

              {/* Flashcard chart */}
              <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 flex items-center justify-center bg-violet-500/10 rounded-lg">
                    <i className="ri-stack-line text-violet-400 text-sm" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Flashcard mỗi ngày</h3>
                    <p className="text-white/30 text-xs">7 ngày gần nhất</p>
                  </div>
                </div>
                <BarChart
                  data={thisWeekStats}
                  valueKey="flashcardDone"
                  color="#a78bfa"
                  label="Thẻ"
                />
              </div>

              {/* Minutes chart */}
              <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 flex items-center justify-center bg-sky-500/10 rounded-lg">
                    <i className="ri-time-line text-sky-400 text-sm" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Thời gian học</h3>
                    <p className="text-white/30 text-xs">Phút mỗi ngày</p>
                  </div>
                </div>
                <BarChart
                  data={thisWeekStats}
                  valueKey="minutesStudied"
                  color="#38bdf8"
                  label="Phút"
                />
              </div>
            </div>

            {/* Extra stats */}
            <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Thống kê tổng hợp</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Ngày học", value: studyDays, unit: "ngày", color: "#e8c84a" },
                  { label: "Câu EPS đã làm", value: epsDone, unit: "câu", color: "#4ade80" },
                  { label: "Điểm thi cao nhất", value: bestExamPct, unit: "%", color: "#fb923c" },
                  { label: "Từ thuộc lòng", value: knownCount, unit: "từ", color: "#a78bfa" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold" style={{ color: s.color }}>
                      {s.value}
                      <span className="text-sm ml-0.5 font-normal text-white/40">{s.unit}</span>
                    </p>
                    <p className="text-white/35 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Streak tab */}
        {activeTab === "streak" && (
          <div className="space-y-4">
            <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 flex items-center justify-center bg-[#fb923c]/15 rounded-2xl">
                  <i className="ri-fire-line text-[#fb923c] text-2xl" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">
                    {streak.count}{" "}
                    <span className="text-white/40 text-sm font-normal">ngày liên tiếp</span>
                  </p>
                  <p className="text-white/30 text-xs">
                    Học mỗi ngày để duy trì streak
                  </p>
                </div>
              </div>

              {/* Calendar heatmap */}
              <p className="text-white/30 text-xs mb-3">35 ngày gần nhất</p>
              <div className="grid grid-cols-7 gap-1.5">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                  <div key={d} className="text-center text-[9px] text-white/20 pb-1">
                    {d}
                  </div>
                ))}
                {streakCalendar.map((day, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-md transition-all"
                    style={{
                      backgroundColor: day.active
                        ? "rgba(251,146,60,0.6)"
                        : "rgba(255,255,255,0.04)",
                    }}
                    title={day.date}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-white/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#fb923c]/60" />
                  <span>Có học</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-white/5" />
                  <span>Không học</span>
                </div>
              </div>
            </div>

            {/* Streak tips */}
            <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Mẹo duy trì streak</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "ri-sun-line",
                    color: "#e8c84a",
                    tip: "Học từ mới mỗi sáng — chỉ cần 5 phút với 8 từ hôm nay",
                    action: "/daily-words",
                    actionLabel: "Học ngay",
                  },
                  {
                    icon: "ri-stack-line",
                    color: "#a78bfa",
                    tip: "Ôn 10 flashcard trước khi ngủ để ghi nhớ lâu hơn",
                    action: "/flashcard-hub",
                    actionLabel: "Ôn tập",
                  },
                  {
                    icon: "ri-file-list-3-line",
                    color: "#4ade80",
                    tip: "Làm 5 câu EPS mỗi ngày để duy trì phản xạ",
                    action: "/eps-exam",
                    actionLabel: "Làm bài",
                  },
                ].map((t) => (
                  <div
                    key={t.tip}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3"
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${t.color}15` }}
                    >
                      <i className={`${t.icon} text-sm`} style={{ color: t.color }} />
                    </div>
                    <p className="flex-1 text-white/50 text-xs">{t.tip}</p>
                    <button
                      onClick={() => navigate(t.action)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-all"
                      style={{ backgroundColor: `${t.color}15`, color: t.color }}
                    >
                      {t.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compare tab */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg">
                  <i className="ri-arrow-left-right-line text-[#e8c84a] text-sm" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">So sánh tuần này vs tuần trước</h3>
                  <p className="text-white/30 text-xs">Xem bạn đang tiến bộ hay thụt lùi</p>
                </div>
              </div>

              <div className="space-y-5">
                <CompareBar
                  label="Từ mới đã học"
                  thisWeek={thisWeekTotals.words}
                  lastWeek={lastWeekTotals.words}
                  color="#e8c84a"
                  unit="từ"
                />
                <CompareBar
                  label="Câu EPS đã làm"
                  thisWeek={thisWeekTotals.eps}
                  lastWeek={lastWeekTotals.eps}
                  color="#4ade80"
                  unit="câu"
                />
                <CompareBar
                  label="Flashcard đã ôn"
                  thisWeek={thisWeekTotals.flashcard}
                  lastWeek={lastWeekTotals.flashcard}
                  color="#a78bfa"
                  unit="thẻ"
                />
                <CompareBar
                  label="Thời gian học"
                  thisWeek={thisWeekTotals.minutes}
                  lastWeek={lastWeekTotals.minutes}
                  color="#38bdf8"
                  unit="phút"
                />
              </div>
            </div>

            {/* Weekly summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-4">
                <p className="text-white/30 text-xs mb-3">Tuần này</p>
                <div className="space-y-2">
                  {[
                    { label: "Từ mới", value: thisWeekTotals.words, color: "#e8c84a" },
                    { label: "Câu EPS", value: thisWeekTotals.eps, color: "#4ade80" },
                    { label: "Flashcard", value: thisWeekTotals.flashcard, color: "#a78bfa" },
                    { label: "Phút học", value: thisWeekTotals.minutes, color: "#38bdf8" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">{s.label}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0f1117] border border-white/6 rounded-2xl p-4">
                <p className="text-white/30 text-xs mb-3">Tuần trước</p>
                <div className="space-y-2">
                  {[
                    { label: "Từ mới", value: lastWeekTotals.words, color: "#e8c84a55" },
                    { label: "Câu EPS", value: lastWeekTotals.eps, color: "#4ade8055" },
                    { label: "Flashcard", value: lastWeekTotals.flashcard, color: "#a78bfa55" },
                    { label: "Phút học", value: lastWeekTotals.minutes, color: "#38bdf855" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">{s.label}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          {[
            { path: "/daily-words", icon: "ri-sun-line", label: "Học từ hôm nay", color: "#e8c84a" },
            { path: "/eps-exam", icon: "ri-timer-line", label: "Thi thử EPS", color: "#4ade80" },
            { path: "/flashcard-hub", icon: "ri-stack-line", label: "Ôn Flashcard", color: "#a78bfa" },
            { path: "/profile", icon: "ri-user-3-line", label: "Hồ sơ cá nhân", color: "#38bdf8" },
          ].map((a) => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap border"
              style={{
                backgroundColor: `${a.color}10`,
                color: a.color,
                borderColor: `${a.color}25`,
              }}
            >
              <i className={a.icon} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
