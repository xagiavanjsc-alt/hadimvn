import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { epsQuestions } from "@/mocks/epsQuestions";
import { epsVocabulary } from "@/mocks/epsVocabulary";

// --- Types --------------------------------------------------------------------
interface WrongItem {
  id: string;
  type: "eps_question" | "eps_vocab";
  korean?: string;
  question?: string;
  questionVi?: string;
  answer?: string;
  correctAnswer?: string;
  topic: string;
  date: string;
  reviewCount: number;
  nextReview: string;
  difficulty: "easy" | "medium" | "hard";
}

interface DayActivity {
  date: string;
  label: string;
  sessions: number;
  words: number;
  xp: number;
  quizzes: number;
}

const SR_INTERVALS = [1, 3, 7, 14, 30, 60];

function getNextReviewDate(reviewCount: number): string {
  const days = SR_INTERVALS[Math.min(reviewCount, SR_INTERVALS.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isDueForReview(nextReview: string): boolean {
  return new Date(nextReview) <= new Date();
}

// --- Empty activity data (placeholder khi chua có data th?t) ----------------
function emptyActivityData(days: number): DayActivity[] {
  const result: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      sessions: 0, words: 0, xp: 0, quizzes: 0,
    });
  }
  return result;
}

// --- Bar Chart ----------------------------------------------------------------
function BarChart({ data, metric, color }: { data: DayActivity[]; metric: keyof DayActivity; color: string }) {
  const values = data.map(d => d[metric] as number);
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const val = d[metric] as number;
        const height = max > 0 ? (val / max) * 100 : 0;
        const isToday = d.date === new Date().toISOString().split("T")[0];
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${Math.max(height, val > 0 ? 4 : 0)}%`,
                  backgroundColor: isToday ? color : `${color}60`,
                  minHeight: val > 0 ? "3px" : "0",
                }}
              ></div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border rounded-lg px-2 py-1 text-[9px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d.label}: {val}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Heatmap ------------------------------------------------------------------
function ActivityHeatmap({ data }: { data: DayActivity[] }) {
  const maxXP = Math.max(...data.map(d => d.xp), 1);
  return (
    <div className="flex flex-wrap gap-1">
      {data.map((d, i) => {
        const intensity = d.xp / maxXP;
        const bg = d.xp === 0 ? "bg-app-card/50" : intensity > 0.7 ? "bg-app-accent-primary" : intensity > 0.4 ? "bg-app-accent-primary/60" : "bg-app-accent-primary/25";
        return (
          <div key={i} title={`${d.label}: ${d.xp} XP`}
            className={`w-3 h-3 rounded-sm cursor-default ${bg} transition-all hover:scale-125`}></div>
        );
      })}
    </div>
  );
}

// --- Trend Heatmap (gi? x ngày trong tu?n) -----------------------------------
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

interface HourlyCell {
  day: number;   // 0=CN..6=T7
  hour: number;  // 0..23
  xp: number;
  sessions: number;
}

function generateHourlyData(activityData: DayActivity[]): HourlyCell[] {
  // Grid 7×24. Schema không luu hour-level data ? phân b? d?u XP ngày theo peak hours h?p lý.
  // Không dùng Math.random — phân b? deterministic.
  const grid: HourlyCell[] = [];
  // Compute daily totals theo weekday
  const byWeekday: Record<number, { xp: number; sessions: number }> = {};
  for (const d of activityData) {
    if (d.sessions === 0) continue;
    const weekday = new Date(d.date).getDay();
    if (!byWeekday[weekday]) byWeekday[weekday] = { xp: 0, sessions: 0 };
    byWeekday[weekday].xp += d.xp;
    byWeekday[weekday].sessions += d.sessions;
  }
  // Phân b? theo peak hours (morning 7-9, evening 20-22) — ch? dùng khi có activity
  const HOUR_WEIGHTS: Record<number, number> = {};
  for (let h = 0; h < 24; h++) HOUR_WEIGHTS[h] = 0.01;
  [7, 8, 9, 20, 21, 22].forEach(h => (HOUR_WEIGHTS[h] = 0.15));
  [6, 10, 19, 23].forEach(h => (HOUR_WEIGHTS[h] = 0.06));
  const weightSum = Object.values(HOUR_WEIGHTS).reduce((s, v) => s + v, 0);

  for (let day = 0; day < 7; day++) {
    const total = byWeekday[day] || { xp: 0, sessions: 0 };
    for (let hour = 0; hour < 24; hour++) {
      const share = HOUR_WEIGHTS[hour] / weightSum;
      grid.push({
        day,
        hour,
        xp: Math.round(total.xp * share),
        sessions: Math.round(total.sessions * share),
      });
    }
  }
  return grid;
}

function TrendHeatmap({ activityData }: { activityData: DayActivity[] }) {
  const [metric, setMetric] = useState<"xp" | "sessions">("xp");
  const [hoveredCell, setHoveredCell] = useState<HourlyCell | null>(null);

  const grid = useMemo(() => generateHourlyData(activityData), [activityData]);
  const maxVal = Math.max(...grid.map(c => metric === "xp" ? c.xp : c.sessions), 1);

  // Peak analysis
  const peakHour = HOURS.reduce((best, h) => {
    const total = grid.filter(c => c.hour === h).reduce((s, c) => s + (metric === "xp" ? c.xp : c.sessions), 0);
    const bestTotal = grid.filter(c => c.hour === best).reduce((s, c) => s + (metric === "xp" ? c.xp : c.sessions), 0);
    return total > bestTotal ? h : best;
  }, 0);
  const peakDay = [0,1,2,3,4,5,6].reduce((best, d) => {
    const total = grid.filter(c => c.day === d).reduce((s, c) => s + (metric === "xp" ? c.xp : c.sessions), 0);
    const bestTotal = grid.filter(c => c.day === best).reduce((s, c) => s + (metric === "xp" ? c.xp : c.sessions), 0);
    return total > bestTotal ? d : best;
  }, 0);

  const getColor = (val: number) => {
    if (val === 0) return "rgba(255,255,255,0.04)";
    const intensity = val / maxVal;
    if (intensity > 0.8) return "app-accent-primary";
    if (intensity > 0.55) return "rgba(232,200,74,0.7)";
    if (intensity > 0.3) return "rgba(232,200,74,0.4)";
    return "rgba(232,200,74,0.18)";
  };

  // Show only every 3 hours on x-axis
  const xLabels = HOURS.filter(h => h % 3 === 0);

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Xu hu?ng h?c theo gi? &amp; ngày</h3>
          <p className="text-app-text-muted text-[10px] mt-0.5">Gi? nào, ngày nào b?n h?c hi?u qu? nh?t</p>
        </div>
        <div className="flex items-center gap-1 bg-app-surface/50 p-1 rounded-lg">
          {(["xp", "sessions"] as const).map(m => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                metric === m ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"
              }`}>
              {m === "xp" ? "XP" : "Phuong"}
            </button>
          ))}
        </div>
      </div>

      {/* Peak insights */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-app-accent-primary/8 border border-app-accent-primary/15">
          <i className="ri-time-line text-app-accent-primary text-xs"></i>
          <span className="text-[10px] text-white/60">Gi? d?nh: <strong className="text-app-accent-primary">{peakHour}:00 - {peakHour+1}:00</strong></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#34d399]/8 border border-[#34d399]/15">
          <i className="ri-calendar-line text-[#34d399] text-xs"></i>
          <span className="text-[10px] text-white/60">Ngày d?nh: <strong className="text-[#34d399]">{DAYS_OF_WEEK[peakDay]}</strong></span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* X-axis hour labels */}
          <div className="flex items-center mb-1 pl-8">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-center">
                {h % 3 === 0 && (
                  <span className="text-[8px] text-app-text-muted">{h}h</span>
                )}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAYS_OF_WEEK.map((dayLabel, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-0.5 mb-0.5">
              <span className="text-[9px] text-app-text-muted w-7 text-right pr-1 flex-shrink-0">{dayLabel}</span>
              {HOURS.map(hour => {
                const cell = grid.find(c => c.day === dayIdx && c.hour === hour)!;
                const val = metric === "xp" ? cell.xp : cell.sessions;
                return (
                  <div
                    key={hour}
                    className="flex-1 h-5 rounded-sm cursor-default transition-all hover:scale-110 relative group"
                    style={{ backgroundColor: getColor(val) }}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hoveredCell === cell && val > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 pointer-events-none">
                        <div className="bg-[#1a1d27] border border-app-border rounded-lg px-2 py-1 text-center whitespace-nowrap">
                          <p className="text-[9px] font-bold text-app-accent-primary">
                            {metric === "xp" ? `${val} XP` : `${val} phiên`}
                          </p>
                          <p className="text-[8px] text-app-text-secondary">{dayLabel} {hour}:00</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[9px] text-app-text-muted">Th?p</span>
            {[0.04, 0.18, 0.4, 0.7, 1].map((intensity, i) => (
              <div key={i} className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: intensity === 0.04 ? "rgba(255,255,255,0.04)" : `rgba(232,200,74,${intensity})` }}
              />
            ))}
            <span className="text-[9px] text-app-text-muted">Cao</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Wrong Items hook ---------------------------------------------------------
function useWrongItems() {
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [masteredVocab] = useLocalStorage<string[]>("kts_eps_vocab_mastered", []);
  const [srData, setSrData] = useLocalStorage<Record<string, { reviewCount: number; nextReview: string }>>("kts_sr_data", {});

  const wrongQuestions: WrongItem[] = useMemo(() => {
    return epsQuestions
      .filter(q => answeredMap[q.id] !== undefined && answeredMap[q.id] !== q.correctIndex)
      .map(q => {
        const sr = srData[`q_${q.id}`] || { reviewCount: 0, nextReview: new Date().toISOString() };
        return {
          id: `q_${q.id}`,
          type: "eps_question" as const,
          question: q.question,
          questionVi: q.questionVi,
          answer: q.options[answeredMap[q.id]],
          correctAnswer: q.options[q.correctIndex],
          topic: q.topic,
          date: new Date().toISOString(),
          reviewCount: sr.reviewCount,
          nextReview: sr.nextReview,
          difficulty: q.difficulty,
        };
      });
  }, [answeredMap, srData]);

  const wrongVocab: WrongItem[] = useMemo(() => {
    return epsVocabulary
      .filter(v => !masteredVocab.includes(v.id))
      .slice(0, 20)
      .map(v => {
        const sr = srData[`v_${v.id}`] || { reviewCount: 0, nextReview: new Date().toISOString() };
        return {
          id: `v_${v.id}`,
          type: "eps_vocab" as const,
          korean: v.korean,
          question: v.vietnamese,
          topic: v.topic,
          date: new Date().toISOString(),
          reviewCount: sr.reviewCount,
          nextReview: sr.nextReview,
          difficulty: v.difficulty as "easy" | "medium" | "hard",
        };
      });
  }, [masteredVocab, srData]);

  const markReviewed = (id: string) => {
    setSrData(prev => {
      const current = prev[id] || { reviewCount: 0, nextReview: new Date().toISOString() };
      const newCount = current.reviewCount + 1;
      return { ...prev, [id]: { reviewCount: newCount, nextReview: getNextReviewDate(newCount) } };
    });
  };

  return { wrongQuestions, wrongVocab, markReviewed, srData };
}

// --- Review Card --------------------------------------------------------------
interface ReviewCardProps {
  item: WrongItem;
  onMarkReviewed: (id: string) => void;
}

function ReviewCard({ item, onMarkReviewed }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isDue = isDueForReview(item.nextReview);
  const srLevel = Math.min(item.reviewCount, SR_INTERVALS.length - 1);
  const nextDays = SR_INTERVALS[Math.min(item.reviewCount + 1, SR_INTERVALS.length - 1)];

  return (
    <div className={`bg-app-bg border rounded-xl overflow-hidden transition-all ${isDue ? "border-app-accent-primary/20" : "border-app-border"}`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/2" onClick={() => setExpanded(e => !e)}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${item.type === "eps_question" ? "bg-[#fb923c]/10" : "bg-[#38bdf8]/10"}`}>
          <i className={`${item.type === "eps_question" ? "ri-survey-line text-[#fb923c]" : "ri-translate-2 text-[#38bdf8]"} text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-medium truncate">
            {item.type === "eps_question" ? item.questionVi : item.korean}
          </p>
          {item.type === "eps_question" && item.correctAnswer && (
            <p className="text-app-accent-success/60 text-[10px] truncate">? {item.correctAnswer}</p>
          )}
          {item.type === "eps_vocab" && item.question && (
            <p className="text-app-accent-primary/60 text-[10px]">{item.question}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDue && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">Ôn ngay</span>}
          <div className="flex gap-0.5">
            {SR_INTERVALS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= srLevel ? "bg-app-accent-primary" : "bg-app-card/70"}`}></div>
            ))}
          </div>
          <i className={`ri-arrow-down-s-line text-app-text-muted text-sm transition-transform ${expanded ? "rotate-180" : ""}`}></i>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-app-border pt-3">
          {item.type === "eps_question" && (
            <div className="space-y-2 mb-3">
              <p className="text-white/50 text-xs">{item.question}</p>
              {item.answer && <div className="flex items-center gap-2"><span className="text-[10px] text-red-400/70">B?n ch?n:</span><span className="text-red-400 text-xs">{item.answer}</span></div>}
              {item.correctAnswer && <div className="flex items-center gap-2"><span className="text-[10px] text-app-accent-success/70">Ðáp án dúng:</span><span className="text-app-accent-success text-xs font-semibold">{item.correctAnswer}</span></div>}
            </div>
          )}
          {item.type === "eps_vocab" && <div className="mb-3"><p className="text-app-text-secondary text-xs">T? chua thu?c — hãy ôn l?i trong Flashcard EPS</p></div>}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-app-text-muted">L?n ôn ti?p: {isDue ? "Hôm nay" : `${nextDays} ngày n?a`}</span>
            <button onClick={() => onMarkReviewed(item.id)}
              className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-check-line text-xs"></i>Ðã ôn xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function StudyHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wrongQuestions, wrongVocab, markReviewed, srData } = useWrongItems();
  const [activeTab, setActiveTab] = useState<"chart" | "due" | "questions" | "vocab">("chart");
  const [chartRange, setChartRange] = useState<7 | 14 | 30>(14);
  const [chartMetric, setChartMetric] = useState<"xp" | "words" | "sessions" | "quizzes">("xp");
  const [supabaseActivity, setSupabaseActivity] = useState<DayActivity[] | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const localActivity = useMemo(() => emptyActivityData(30), []);

  const fetchSupabaseActivity = useCallback(async () => {
    if (!user) return;
    setLoadingActivity(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceStr = since.toISOString().split("T")[0];

      // Query b?ng study_history (schema th?t: study_date, study_time, vocab_count, grammar_count)
      const { data: historyData } = await supabase
        .from("study_history")
        .select("study_date, study_time, vocab_count, grammar_count")
        .eq("user_id", user.id)
        .gte("study_date", sinceStr)
        .order("study_date", { ascending: true });

      // Ð?m s? quiz th?t t? topik_quiz_history
      const { data: quizData } = await supabase
        .from("topik_quiz_history")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString());

      // G?p quiz theo ngày
      const quizByDate: Record<string, number> = {};
      (quizData || []).forEach((row: { created_at: string }) => {
        const date = row.created_at.split("T")[0];
        quizByDate[date] = (quizByDate[date] || 0) + 1;
      });

      // G?p activity theo ngày (m?i row là 1 session)
      const byDate: Record<string, DayActivity> = {};
      (historyData || []).forEach((row: { study_date: string; study_time?: number; vocab_count?: number; grammar_count?: number }) => {
        const date = row.study_date;
        const d = new Date(date);
        if (!byDate[date]) {
          byDate[date] = {
            date,
            label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
            sessions: 0, words: 0, xp: 0, quizzes: 0,
          };
        }
        byDate[date].sessions += 1;
        byDate[date].words += row.vocab_count || 0;
        // XP approx = vocab * 5 + grammar * 10 (vì schema không luu xp per day)
        byDate[date].xp += (row.vocab_count || 0) * 5 + (row.grammar_count || 0) * 10;
      });

      // Fill d? 30 ngày v?i data th?t
      const result: DayActivity[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const entry = byDate[dateStr] || {
          date: dateStr,
          label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
          sessions: 0, words: 0, xp: 0, quizzes: 0,
        };
        entry.quizzes = quizByDate[dateStr] || 0;
        result.push(entry);
      }
      setSupabaseActivity(result);
    } catch {
      // fallback to empty
    }
    setLoadingActivity(false);
  }, [user]);

  useEffect(() => { fetchSupabaseActivity(); }, [fetchSupabaseActivity]);

  const activityData = (supabaseActivity || localActivity).slice(-chartRange);

  const allItems = [...wrongQuestions, ...wrongVocab];
  const dueItems = allItems.filter(item => isDueForReview(item.nextReview));

  const totalXP = activityData.reduce((s, d) => s + d.xp, 0);
  const totalWords = activityData.reduce((s, d) => s + d.words, 0);
  const activeDays = activityData.filter(d => d.sessions > 0).length;
  const avgXP = activeDays > 0 ? Math.round(totalXP / activeDays) : 0;

  // Compare with previous period
  const prevData = (supabaseActivity || localActivity).slice(-chartRange * 2, -chartRange);
  const prevXP = prevData.reduce((s, d) => s + d.xp, 0);
  const xpChange = prevXP > 0 ? Math.round(((totalXP - prevXP) / prevXP) * 100) : 0;

  const metricConfig = {
    xp: { label: "XP", color: "app-accent-primary", icon: "ri-star-line" },
    words: { label: "T? h?c", color: "#34d399", icon: "ri-translate-2" },
    sessions: { label: "Phiên h?c", color: "#fb923c", icon: "ri-time-line" },
    quizzes: { label: "Quiz", color: "#a78bfa", icon: "ri-survey-line" },
  };

  const upcomingDays = [0, 1, 3, 7].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split("T")[0];
    const count = allItems.filter(item => item.nextReview.startsWith(dateStr)).length;
    return { label: offset === 0 ? "Hôm nay" : offset === 1 ? "Ngày mai" : `+${offset} ngày`, count };
  });

  return (
    <DashboardLayout
      title="L?ch s? h?c t?p"
      subtitle="Bi?u d? ti?n d? theo ngày/tu?n — Spaced Repetition thông minh"
    >
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: `T?ng XP (${chartRange} ngày)`, value: totalXP.toLocaleString(), icon: "ri-star-line", color: "app-accent-primary", sub: xpChange !== 0 ? `${xpChange > 0 ? "+" : ""}${xpChange}% so v?i k? tru?c` : undefined },
          { label: "Ngày h?c tích c?c", value: `${activeDays}/${chartRange}`, icon: "ri-calendar-check-line", color: "#34d399", sub: `${Math.round((activeDays / chartRange) * 100)}% t? l?` },
          { label: "T? dã h?c", value: totalWords.toLocaleString(), icon: "ri-translate-2", color: "#fb923c", sub: `TB ${Math.round(totalWords / Math.max(activeDays, 1))}/ngày` },
          { label: "C?n ôn ngay", value: dueItems.length, icon: "ri-alarm-line", color: dueItems.length > 0 ? "#f87171" : "#34d399", sub: dueItems.length > 0 ? "Hãy ôn ngay!" : "T?t c? dã ôn" },
        ].map(stat => (
          <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
              </div>
              <p className="text-app-text-secondary text-[10px]">{stat.label}</p>
            </div>
            <p className="text-white font-black text-2xl">{stat.value}</p>
            {stat.sub && <p className="text-app-text-muted text-[10px] mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-app-card/50 rounded-xl p-1 mb-5 w-fit max-w-full overflow-x-auto">
        {([
          { id: "chart", label: "Bi?u d?", icon: "ri-bar-chart-line" },
          { id: "due", label: `Ôn t?p (${dueItems.length})`, icon: "ri-alarm-line" },
          { id: "questions", label: `Câu sai (${wrongQuestions.length})`, icon: "ri-close-circle-line" },
          { id: "vocab", label: `T? v?ng (${wrongVocab.length})`, icon: "ri-translate-2" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chart" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Chart area */}
          <div className="space-y-5">
            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-app-surface/50 p-1 rounded-lg">
                {([7, 14, 30] as const).map(r => (
                  <button key={r} onClick={() => setChartRange(r)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${chartRange === r ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
                    {r} ngày
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-app-surface/50 p-1 rounded-lg">
                {(Object.entries(metricConfig) as [keyof typeof metricConfig, typeof metricConfig[keyof typeof metricConfig]][]).map(([key, cfg]) => (
                  <button key={key} onClick={() => setChartMetric(key)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${chartMetric === key ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
                    <i className={cfg.icon}></i>{cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">{metricConfig[chartMetric].label} theo ngày</h3>
                  {user && supabaseActivity && <p className="text-app-accent-success/60 text-[10px] mt-0.5"><i className="ri-cloud-line mr-1"></i>D? li?u th?t t? cloud</p>}
                  {!user && <p className="text-app-text-muted text-[10px] mt-0.5">Ðang nh?p d? xem d? li?u th?t</p>}
                </div>
                {loadingActivity && <div className="w-4 h-4 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>}
              </div>
              <BarChart data={activityData} metric={chartMetric} color={metricConfig[chartMetric].color} />
              {/* X-axis labels */}
              <div className="flex gap-1 mt-1">
                {activityData.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    {(i === 0 || i === Math.floor(activityData.length / 2) || i === activityData.length - 1) && (
                      <span className="text-[8px] text-app-text-muted">{d.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Trend heatmap gi? x ngày */}
            <TrendHeatmap activityData={activityData} />

            {/* Activity heatmap */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">B?n d? ho?t d?ng (30 ngày)</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-app-text-muted">
                  <div className="w-2.5 h-2.5 rounded-sm bg-app-card/50"></div>
                  <span>Không h?c</span>
                  <div className="w-2.5 h-2.5 rounded-sm bg-app-accent-primary/25"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-app-accent-primary/60"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-app-accent-primary"></div>
                  <span>Nhi?u</span>
                </div>
              </div>
              <ActivityHeatmap data={supabaseActivity || localActivity} />
            </div>

            {/* Weekly comparison */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">So sánh tu?n này vs tu?n tru?c</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "XP ki?m du?c", thisWeek: activityData.slice(-7).reduce((s, d) => s + d.xp, 0), lastWeek: activityData.slice(-14, -7).reduce((s, d) => s + d.xp, 0), color: "app-accent-primary" },
                  { label: "T? dã h?c", thisWeek: activityData.slice(-7).reduce((s, d) => s + d.words, 0), lastWeek: activityData.slice(-14, -7).reduce((s, d) => s + d.words, 0), color: "#34d399" },
                  { label: "Ngày h?c", thisWeek: activityData.slice(-7).filter(d => d.sessions > 0).length, lastWeek: activityData.slice(-14, -7).filter(d => d.sessions > 0).length, color: "#fb923c" },
                ].map(item => {
                  const diff = item.lastWeek > 0 ? Math.round(((item.thisWeek - item.lastWeek) / item.lastWeek) * 100) : 0;
                  const isUp = diff >= 0;
                  return (
                    <div key={item.label} className="text-center p-3 bg-app-surface/50 rounded-xl">
                      <p className="text-app-text-muted text-[10px] mb-2">{item.label}</p>
                      <p className="text-white font-bold text-xl">{item.thisWeek}</p>
                      <p className="text-app-text-muted text-[10px]">vs {item.lastWeek}</p>
                      {item.lastWeek > 0 && (
                        <p className={`text-[10px] font-semibold mt-1 ${isUp ? "text-app-accent-success" : "text-red-400"}`}>
                          <i className={`${isUp ? "ri-arrow-up-line" : "ri-arrow-down-line"} mr-0.5`}></i>
                          {Math.abs(diff)}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">L?ch ôn t?p s?p t?i</h3>
              <div className="space-y-3">
                {upcomingDays.map(({ label, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="text-white/50 text-xs">{label}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-app-accent-primary"
                          style={{ width: `${Math.min((count / Math.max(allItems.length, 1)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-app-text-secondary text-xs w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">C?p d? SR</h3>
              <div className="space-y-2">
                {SR_INTERVALS.map((days, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {SR_INTERVALS.map((_, j) => (
                        <div key={j} className={`w-1.5 h-1.5 rounded-full ${j <= i ? "bg-app-accent-primary" : "bg-app-card/70"}`}></div>
                      ))}
                    </div>
                    <p className="text-app-text-secondary text-[10px]">C?p {i + 1} — {days} ngày</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm mb-2">Ôn t?p ngay</h3>
              {[
                { icon: "ri-file-list-3-line", label: "Luy?n thi EPS", path: "/eps", color: "app-accent-primary" },
                { icon: "ri-stack-line", label: "Flashcard EPS", path: "/eps-flashcard", color: "#34d399" },
                { icon: "ri-brain-line", label: "Ki?m tra d?u vào", path: "/placement-test", color: "#a78bfa" },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-app-border hover:border-app-border hover:bg-app-surface/50 transition-all cursor-pointer">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-white/60 text-xs">{item.label}</p>
                  <i className="ri-arrow-right-line text-app-text-muted ml-auto text-xs"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeTab === "due" || activeTab === "questions" || activeTab === "vocab") && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {activeTab === "due" && dueItems.length > 0 && (
              <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-3 mb-4 flex items-start gap-2">
                <i className="ri-brain-line text-app-accent-primary text-sm flex-shrink-0 mt-0.5"></i>
                <p className="text-app-text-secondary text-xs leading-relaxed">
                  <strong className="text-app-accent-primary/80">Spaced Repetition:</strong> Ôn dúng lúc giúp nh? lâu g?p 5 l?n. Hãy ôn {dueItems.length} m?c hôm nay!
                </p>
              </div>
            )}
            {(() => {
              const items = activeTab === "due" ? dueItems : activeTab === "questions" ? wrongQuestions : wrongVocab;
              return items.length === 0 ? (
                <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
                  <i className="ri-checkbox-circle-line text-app-accent-success text-3xl mb-3 block"></i>
                  <p className="text-app-text-secondary text-sm">Không có gì c?n ôn!</p>
                  <p className="text-app-text-muted text-xs mt-1">Làm thêm bài t?p d? xem l?ch s?</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => <ReviewCard key={item.id} item={item} onMarkReviewed={markReviewed} />)}
                </div>
              );
            })()}
          </div>
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">L?ch ôn t?p s?p t?i</h3>
              <div className="space-y-3">
                {upcomingDays.map(({ label, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="text-white/50 text-xs">{label}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-app-accent-primary"
                          style={{ width: `${Math.min((count / Math.max(allItems.length, 1)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-app-text-secondary text-xs w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}



