import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { seoulBooks } from "@/mocks/seoulTextbook";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizHistory {
  lessonId: string;
  bookId: string;
  score: number;
  total: number;
  date: string;
}

interface WrongWord {
  korean: string;
  vietnamese: string;
  bookId: string;
  lessonId: string;
  addedAt: string;
}

const BOOK_COLORS: Record<string, string> = {
  "1A": "#34d399", "1B": "#6ee7b7",
  "2A": "#60a5fa", "2B": "#93c5fd",
  "3A": "#f472b6", "3B": "#f9a8d4",
  "4A": "#fb923c", "4B": "#fcd34d",
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({
  data,
  color = "#e8c84a",
  isEmpty = false,
}: {
  data: { label: string; value: number; max: number }[];
  color?: string;
  isEmpty?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="relative">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#1a1d27]/80 rounded-xl">
          <i className="ri-bar-chart-line text-3xl text-app-text-muted mb-2"></i>
          <p className="text-app-text-muted text-xs">Làm quiz để xem dữ liệu thật</p>
          <p className="text-app-text-muted text-[10px] mt-1">Đang hiển thị dữ liệu mẫu</p>
        </div>
      )}
      <div className="flex items-end gap-1.5 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 relative"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {hovered === i && d.value > 0 && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                {d.value}
              </div>
            )}
            <div className="w-full rounded-t-sm transition-all duration-500 cursor-default" style={{
              height: d.max > 0 ? `${Math.max(4, (d.value / d.max) * 96)}px` : "4px",
              backgroundColor: d.value > 0 ? (hovered === i ? color + "ee" : color) : "rgba(255,255,255,0.06)",
              opacity: isEmpty ? 0.35 : 1,
            }}></div>
            <span className="text-[9px] text-app-text-muted truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{Math.round(pct)}%</span>
        </div>
      </div>
      <p className="text-xs text-white/50 text-center">{label}</p>
      <p className="text-xs text-app-text-muted">{value}/{max}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SeoulStatsPage() {
  const navigate = useNavigate();
  const [quizHistory] = useLocalStorage<QuizHistory[]>("kts_seoul_quiz_history", []);
  const [wrongWords] = useLocalStorage<WrongWord[]>("kts_seoul_wrong_words", []);
  const [completedLessons] = useLocalStorage<string[]>("kts_seoul_completed", []);
  const [streakData] = useLocalStorage<{ count: number; totalDays: number; longestStreak: number }>(
    "kts_seoul_streak", { count: 0, totalDays: 0, longestStreak: 0 }
  );

  const [activeTab, setActiveTab] = useState<"overview" | "books" | "weekly" | "wrong">("overview");

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalVocab = useMemo(() =>
    seoulBooks.reduce((s, b) => s + b.lessons
      .filter(l => !l.id.includes("-REMOVED") && !l.id.includes("-placeholder"))
      .reduce((ls, l) => ls + l.vocabulary.length, 0), 0), []);

  const totalLessons = useMemo(() =>
    seoulBooks.reduce((s, b) => s + b.lessons
      .filter(l => !l.id.includes("-REMOVED") && !l.id.includes("-placeholder")).length, 0), []);

  const hasRealData = quizHistory.length > 0;

  // Demo data khi chưa có quiz history thật
  const demoWeeklyData = useMemo(() => {
    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const demoValues = [12, 25, 8, 30, 18, 42, 15];
    return labels.map((label, i) => ({ label, value: demoValues[i], day: "" }));
  }, []);

  const demoMonthlyData = useMemo(() => [
    { label: "T1", value: 85 },
    { label: "T2", value: 120 },
    { label: "T3", value: 95 },
    { label: "T4", value: 150 },
  ], []);

  const bookStats = useMemo(() => seoulBooks.map(book => {
    const lessons = book.lessons.filter(l => !l.id.includes("-REMOVED") && !l.id.includes("-placeholder"));
    const completed = lessons.filter(l => completedLessons.includes(l.id)).length;
    const bookQuizzes = quizHistory.filter(q => q.bookId === book.id);
    const avgScore = bookQuizzes.length > 0
      ? Math.round(bookQuizzes.reduce((s, q) => s + (q.score / q.total) * 100, 0) / bookQuizzes.length)
      : 0;
    const vocabCount = lessons.reduce((s, l) => s + l.vocabulary.length, 0);
    return { ...book, completed, total: lessons.length, avgScore, vocabCount, quizCount: bookQuizzes.length };
  }), [completedLessons, quizHistory]);

  // Weekly vocab learned (last 7 days) — real data
  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return d.toISOString().split("T")[0];
    });
    return days.map(day => {
      const dayQuizzes = quizHistory.filter(q => q.date?.startsWith(day));
      const vocabLearned = dayQuizzes.reduce((s, q) => s + q.total, 0);
      const label = new Date(day).toLocaleDateString("vi-VN", { weekday: "short" });
      return { label, value: vocabLearned, day };
    });
  }, [quizHistory]);

  const displayWeeklyData = hasRealData ? weeklyData : demoWeeklyData;
  const maxWeekly = Math.max(...displayWeeklyData.map(d => d.value), 1);

  // Monthly data (last 4 weeks)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(Date.now() - (3 - i) * 7 * 86400000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      const weekQuizzes = quizHistory.filter(q => {
        const d = new Date(q.date || "");
        return d >= weekStart && d < weekEnd;
      });
      const vocab = weekQuizzes.reduce((s, q) => s + q.total, 0);
      return { label: `T${i + 1}`, value: vocab };
    });
  }, [quizHistory]);

  const displayMonthlyData = hasRealData ? monthlyData : demoMonthlyData;
  const maxMonthly = Math.max(...displayMonthlyData.map(d => d.value), 1);

  // Wrong words by book
  const wrongByBook = useMemo(() => {
    const map: Record<string, number> = {};
    wrongWords.forEach(w => { map[w.bookId] = (map[w.bookId] || 0) + 1; });
    return map;
  }, [wrongWords]);

  // Quiz accuracy by book
  const accuracyByBook = useMemo(() => {
    return seoulBooks.map(book => {
      const bookQ = quizHistory.filter(q => q.bookId === book.id);
      const acc = bookQ.length > 0
        ? Math.round(bookQ.reduce((s, q) => s + (q.score / q.total) * 100, 0) / bookQ.length)
        : 0;
      return { bookId: book.id, bookName: book.name, accuracy: acc, count: bookQ.length, color: book.color };
    });
  }, [quizHistory]);

  // Demo accuracy data
  const demoAccuracy = useMemo(() => seoulBooks.map((book, i) => ({
    bookId: book.id, bookName: book.name,
    accuracy: [85, 72, 90, 68, 78, 82, 0, 0][i] || 0,
    count: [5, 3, 7, 2, 4, 3, 0, 0][i] || 0,
    color: book.color,
  })), []);

  const displayAccuracy = hasRealData ? accuracyByBook : demoAccuracy;

  const totalCompleted = completedLessons.length;
  const totalQuizzes = quizHistory.length;
  const overallAccuracy = totalQuizzes > 0
    ? Math.round(quizHistory.reduce((s, q) => s + (q.score / q.total) * 100, 0) / totalQuizzes)
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white transition-all cursor-pointer">
            <i className="ri-arrow-left-line"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Thống kê Seoul chi tiết</h1>
            <p className="text-app-text-secondary text-sm">
              {hasRealData
                ? `Dữ liệu thật từ ${totalQuizzes} lần quiz`
                : `${totalVocab.toLocaleString()} từ vựng · ${totalLessons} bài học`}
            </p>
          </div>
          {!hasRealData && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <i className="ri-information-line text-amber-400 text-xs"></i>
              <span className="text-amber-400 text-xs">Dữ liệu mẫu</span>
            </div>
          )}
          {hasRealData && (
            <button onClick={() => navigate("/seoul-textbook")} className="ml-auto px-4 py-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-xl text-app-accent-primary text-sm font-medium cursor-pointer whitespace-nowrap transition-all">
              <i className="ri-book-3-line mr-1.5"></i>Giáo trình
            </button>
          )}
        </div>

        {/* Top KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Bài đã hoàn thành", value: totalCompleted, max: totalLessons, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Tổng quiz đã làm", value: totalQuizzes, max: null, icon: "ri-file-list-3-line", color: "#60a5fa" },
            { label: "Tỷ lệ đúng TB", value: overallAccuracy, max: null, icon: "ri-percent-line", color: "#e8c84a", suffix: "%" },
            { label: "Streak hiện tại", value: streakData.count, max: null, icon: "ri-fire-line", color: "#fb923c", suffix: " ngày" },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#1a1d27] border border-app-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: kpi.color + "18" }}>
                  <i className={`${kpi.icon} text-sm`} style={{ color: kpi.color }}></i>
                </div>
                <p className="text-app-text-secondary text-xs">{kpi.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}{kpi.suffix || ""}</p>
              {kpi.max && <p className="text-app-text-muted text-xs mt-1">/ {kpi.max} tổng</p>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-app-card/50 border border-app-border rounded-xl p-1 mb-6 w-fit">
          {(["overview", "books", "weekly", "wrong"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/60"
              }`}>
              {tab === "overview" ? "Tổng quan" : tab === "books" ? "Theo cuốn" : tab === "weekly" ? "Theo tuần" : "Từ sai"}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-5">Tiến độ tổng thể</h3>
              <div className="flex items-center justify-around">
                <DonutChart value={totalCompleted} max={totalLessons} color="#34d399" label="Bài hoàn thành" />
                <DonutChart value={overallAccuracy} max={100} color="#e8c84a" label="Tỷ lệ đúng TB" />
                <DonutChart value={wrongWords.length} max={Math.max(wrongWords.length, 50)} color="#f87171" label="Từ sai tích lũy" />
              </div>
            </div>

            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-5">Thống kê tổng</h3>
              <div className="space-y-4">
                {[
                  { label: "Streak hiện tại", value: `${streakData.count} ngày`, icon: "ri-fire-line", color: "#fb923c" },
                  { label: "Streak dài nhất", value: `${streakData.longestStreak || streakData.count} ngày`, icon: "ri-trophy-line", color: "#e8c84a" },
                  { label: "Tổng từ vựng giáo trình", value: `${totalVocab.toLocaleString()} từ`, icon: "ri-translate-2", color: "#34d399" },
                  { label: "Từ sai cần ôn", value: `${wrongWords.length} từ`, icon: "ri-error-warning-line", color: "#f87171" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: s.color + "18" }}>
                      <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/50 text-xs">{s.label}</p>
                    </div>
                    <p className="text-white font-semibold text-sm">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5 lg:col-span-2">
              <h3 className="text-white font-semibold text-sm mb-4">Hành động nhanh</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Ôn từ sai", icon: "ri-error-warning-line", color: "#f87171", path: "/seoul-wrong-review" },
                  { label: "Thi thử theo bài", icon: "ri-file-list-3-line", color: "#60a5fa", path: "/seoul-lesson-quiz" },
                  { label: "Ôn theo chủ đề", icon: "ri-apps-line", color: "#a78bfa", path: "/seoul-topic-review" },
                  { label: "Xuất từ vựng", icon: "ri-download-line", color: "#34d399", path: "/seoul-vocab-export" },
                ].map((a, i) => (
                  <button key={i} onClick={() => navigate(a.path)}
                    className="flex flex-col items-center gap-2 p-4 bg-app-surface/50 hover:bg-white/6 border border-app-border hover:border-white/15 rounded-xl transition-all cursor-pointer">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: a.color + "18" }}>
                      <i className={`${a.icon} text-base`} style={{ color: a.color }}></i>
                    </div>
                    <span className="text-white/60 text-xs text-center">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: By book */}
        {activeTab === "books" && (
          <div className="space-y-4">
            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-semibold text-sm">Tỷ lệ đúng quiz theo cuốn</h3>
                {!hasRealData && <span className="text-amber-400/60 text-xs">Dữ liệu mẫu</span>}
              </div>
              <p className="text-app-text-muted text-xs mb-5">Di chuột vào cột để xem chi tiết</p>
              <div className="flex items-end gap-3 h-36">
                {displayAccuracy.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {b.accuracy > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {b.accuracy}% ({b.count} quiz)
                      </div>
                    )}
                    <span className="text-[10px] text-white/50">{b.accuracy > 0 ? `${b.accuracy}%` : "-"}</span>
                    <div className="w-full rounded-t-md transition-all duration-700 group-hover:opacity-80" style={{
                      height: `${Math.max(4, b.accuracy)}px`,
                      backgroundColor: b.accuracy > 0 ? (BOOK_COLORS[b.bookId] || "#e8c84a") : "rgba(255,255,255,0.06)",
                      opacity: !hasRealData ? 0.5 : 1,
                    }}></div>
                    <span className="text-[10px] text-white/35">{b.bookId}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {bookStats.map(book => {
                const color = BOOK_COLORS[book.id] || "#e8c84a";
                const pct = book.total > 0 ? Math.round((book.completed / book.total) * 100) : 0;
                return (
                  <div key={book.id} className="bg-[#1a1d27] border border-app-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: color + "20" }}>
                        <span className="text-xs font-bold" style={{ color }}>{book.id}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{book.name}</p>
                        <p className="text-app-text-muted text-xs">{book.vocabCount.toLocaleString()} từ</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-app-text-secondary">Hoàn thành</span>
                          <span style={{ color }}>{book.completed}/{book.total}</span>
                        </div>
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-app-text-secondary">Tỷ lệ đúng TB</span>
                        <span className="text-white/70">{book.avgScore > 0 ? `${book.avgScore}%` : "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-app-text-secondary">Số lần quiz</span>
                        <span className="text-white/70">{book.quizCount}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-app-text-secondary">Từ sai</span>
                        <span className="text-red-400">{wrongByBook[book.id] || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Weekly */}
        {activeTab === "weekly" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-semibold text-sm">Từ vựng học trong 7 ngày qua</h3>
                {!hasRealData && <span className="text-amber-400/60 text-xs">Mẫu</span>}
              </div>
              <p className="text-app-text-muted text-xs mb-5">Số từ vựng đã ôn qua quiz mỗi ngày</p>
              <BarChart
                data={displayWeeklyData.map(d => ({ label: d.label, value: d.value, max: maxWeekly }))}
                color="#e8c84a"
                isEmpty={!hasRealData}
              />
              {hasRealData && weeklyData.every(d => d.value === 0) && (
                <p className="text-center text-app-text-muted text-xs mt-3">Chưa có quiz trong 7 ngày qua</p>
              )}
            </div>

            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-semibold text-sm">Từ vựng học theo tuần (4 tuần)</h3>
                {!hasRealData && <span className="text-amber-400/60 text-xs">Mẫu</span>}
              </div>
              <p className="text-app-text-muted text-xs mb-5">Tổng từ vựng ôn mỗi tuần</p>
              <BarChart
                data={displayMonthlyData.map(d => ({ label: d.label, value: d.value, max: maxMonthly }))}
                color="#34d399"
                isEmpty={!hasRealData}
              />
            </div>

            {/* Recent quiz history */}
            <div className="bg-[#1a1d27] border border-app-border rounded-xl p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Lịch sử quiz gần đây</h3>
                {hasRealData && <span className="text-app-text-muted text-xs">{quizHistory.length} lần quiz</span>}
              </div>
              {quizHistory.length === 0 ? (
                <div className="text-center py-10 text-app-text-muted">
                  <i className="ri-history-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Chưa có lịch sử quiz</p>
                  <p className="text-xs mt-1">Hãy làm quiz bài học để xem lịch sử</p>
                  <button onClick={() => navigate("/seoul-lesson-quiz")}
                    className="mt-4 px-4 py-2 bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl text-app-accent-primary text-sm cursor-pointer hover:bg-app-accent-primary/20 transition-all">
                    Làm quiz ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...quizHistory].reverse().slice(0, 20).map((q, i) => {
                    const pct = Math.round((q.score / q.total) * 100);
                    const book = seoulBooks.find(b => b.id === q.bookId);
                    const lesson = book?.lessons.find(l => l.id === q.lessonId);
                    const color = BOOK_COLORS[q.bookId] || "#e8c84a";
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-app-surface/50 rounded-xl">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: color + "18" }}>
                          <span className="text-[10px] font-bold" style={{ color }}>{q.bookId}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs truncate">{lesson?.title || q.lessonId}</p>
                          <p className="text-app-text-muted text-[10px]">{q.date ? new Date(q.date).toLocaleDateString("vi-VN") : "—"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "#e8c84a" : "#f87171" }}>{pct}%</p>
                          <p className="text-app-text-muted text-[10px]">{q.score}/{q.total}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Wrong words */}
        {activeTab === "wrong" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
              {[
                { label: "Tổng từ sai", value: wrongWords.length, color: "#f87171", icon: "ri-error-warning-line" },
                { label: "Cuốn nhiều lỗi nhất", value: Object.entries(wrongByBook).sort((a, b) => b[1] - a[1])[0]?.[0] || "—", color: "#fb923c", icon: "ri-book-3-line" },
                { label: "Cần ôn lại", value: `${wrongWords.length} từ`, color: "#e8c84a", icon: "ri-refresh-line" },
              ].map((s, i) => (
                <div key={i} className="bg-[#1a1d27] border border-app-border rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: s.color + "18" }}>
                    <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
                  </div>
                  <div>
                    <p className="text-app-text-secondary text-xs">{s.label}</p>
                    <p className="text-white font-semibold text-sm">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {wrongWords.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d27] border border-app-border rounded-xl text-app-text-muted">
                <i className="ri-checkbox-circle-line text-4xl mb-3 block text-app-accent-success/50"></i>
                <p className="text-sm">Chưa có từ sai nào!</p>
                <p className="text-xs mt-1">Hãy làm quiz để theo dõi từ sai</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wrongWords.slice(0, 30).map((w, i) => {
                  const color = BOOK_COLORS[w.bookId] || "#e8c84a";
                  return (
                    <div key={i} className="bg-[#1a1d27] border border-red-500/15 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-white font-semibold">{w.korean}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: color + "18", color }}>
                          {w.bookId}
                        </span>
                      </div>
                      <p className="text-app-accent-primary text-sm">{w.vietnamese}</p>
                      <p className="text-app-text-muted text-[10px] mt-2">{w.addedAt ? new Date(w.addedAt).toLocaleDateString("vi-VN") : ""}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {wrongWords.length > 0 && (
              <div className="flex justify-center mt-4">
                <button onClick={() => navigate("/seoul-wrong-review")}
                  className="px-6 py-2.5 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-xl text-app-accent-primary font-medium cursor-pointer whitespace-nowrap transition-all">
                  <i className="ri-refresh-line mr-2"></i>Ôn tập từ sai ngay
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
