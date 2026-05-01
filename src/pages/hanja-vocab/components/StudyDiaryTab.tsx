import { useState, useMemo } from "react";
import { useVipYearGuard, addCsvWatermark } from "@/hooks/useVipYearGuard";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";

interface DiaryEntry {
  date: string; // YYYY-MM-DD
  wordsLearned: number;
  quizScore: number;
  quizTotal: number;
  srReviewed: number;
  streakDay: number;
  note?: string;
  mood?: "great" | "good" | "okay" | "bad";
}

const DIARY_KEY = "hanja_study_diary";
const SR_KEY = "hanja_sr_data";
const STREAK_KEY = "hanja_streak";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadDiary(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(DIARY_KEY) || "[]"); }
  catch { return []; }
}

function saveDiary(entries: DiaryEntry[]) {
  localStorage.setItem(DIARY_KEY, JSON.stringify(entries));
}

function loadSRStats() {
  try {
    const data = JSON.parse(localStorage.getItem(SR_KEY) || "{}");
    return Object.keys(data).length;
  } catch { return 0; }
}

function loadStreakData() {
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY) || "null");
    return data ?? { currentStreak: 0, history: {} };
  } catch { return { currentStreak: 0, history: {} }; }
}

const MOOD_CONFIG = {
  great: { icon: "ri-emotion-laugh-line", label: "Tuyệt vời", color: "text-green-500", bg: "bg-green-50" },
  good: { icon: "ri-emotion-happy-line", label: "Tốt", color: "text-emerald-500", bg: "bg-emerald-50" },
  okay: { icon: "ri-emotion-normal-line", label: "Bình thường", color: "text-amber-500", bg: "bg-amber-50" },
  bad: { icon: "ri-emotion-unhappy-line", label: "Khó khăn", color: "text-red-500", bg: "bg-red-50" },
};

export default function StudyDiaryTab() {
  const { isVipYear, isVipMonth, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();
  const [diary, setDiary] = useState<DiaryEntry[]>(loadDiary);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "calendar" | "stats">("timeline");
  const [form, setForm] = useState({
    wordsLearned: "",
    quizScore: "",
    quizTotal: "",
    note: "",
    mood: "good" as DiaryEntry["mood"],
  });

  const srTotal = loadSRStats();
  const streakData = loadStreakData();

  const todayEntry = useMemo(() => diary.find(e => e.date === getToday()), [diary]);

  const buildCSVContent = (entries: DiaryEntry[]) => {
    const header = "Ngày,Từ đã học,Quiz đúng,Tổng câu,Độ chính xác,SR đã ôn,Streak,Cảm xúc,Ghi chú\n";
    const rows = entries.map(e => {
      const acc = e.quizTotal > 0 ? Math.round((e.quizScore / e.quizTotal) * 100) : 0;
      const moodLabel = { great: "Tuyệt vời", good: "Tốt", okay: "Bình thường", bad: "Khó khăn" }[e.mood ?? "good"];
      return [e.date, e.wordsLearned, e.quizScore, e.quizTotal, `${acc}%`, e.srReviewed, e.streakDay, moodLabel, `"${(e.note || "").replace(/"/g, '""')}"`].join(",");
    }).join("\n");
    return header + rows;
  };

  const doExportCSV = () => {
    const content = buildCSVContent(diary);
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nhat_ky_hoc_tap.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const doExportCSVLimited = (limit: number) => {
    const limited = diary.slice(0, limit);
    const content = addCsvWatermark(buildCSVContent(limited), limit);
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `nhat_ky_${limit}ngay.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => checkAndRun(doExportCSV, doExportCSVLimited);

  const addEntry = () => {
    const today = getToday();
    const newEntry: DiaryEntry = {
      date: today,
      wordsLearned: parseInt(form.wordsLearned) || 0,
      quizScore: parseInt(form.quizScore) || 0,
      quizTotal: parseInt(form.quizTotal) || 0,
      srReviewed: srTotal,
      streakDay: streakData.currentStreak || 0,
      note: form.note.trim() || undefined,
      mood: form.mood,
    };
    const updated = [newEntry, ...diary.filter(e => e.date !== today)].sort((a, b) => b.date.localeCompare(a.date));
    setDiary(updated);
    saveDiary(updated);
    setShowAddForm(false);
    setForm({ wordsLearned: "", quizScore: "", quizTotal: "", note: "", mood: "good" });
  };

  // Stats
  const stats = useMemo(() => {
    if (diary.length === 0) return null;
    const totalWords = diary.reduce((s, e) => s + e.wordsLearned, 0);
    const totalQuiz = diary.reduce((s, e) => s + e.quizTotal, 0);
    const totalCorrect = diary.reduce((s, e) => s + e.quizScore, 0);
    const avgWords = Math.round(totalWords / diary.length);
    const accuracy = totalQuiz > 0 ? Math.round((totalCorrect / totalQuiz) * 100) : 0;
    const bestDay = diary.reduce((best, e) => e.wordsLearned > best.wordsLearned ? e : best, diary[0]);
    const last7 = diary.slice(0, 7);
    return { totalWords, avgWords, accuracy, bestDay, last7, totalDays: diary.length };
  }, [diary]);

  // Calendar view — last 30 days
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const entry = diary.find(e => e.date === d);
      days.push({ date: d, entry, label: new Date(d).getDate() });
    }
    return days;
  }, [diary]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Nhật ký học tập</h2>
          <p className="text-sm text-gray-500">{diary.length} ngày đã ghi · Theo dõi tiến độ mỗi ngày</p>
        </div>
        <div className="flex gap-2">
          {diary.length > 0 && (
            <button
              onClick={exportCSV}
              className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap ${
                isVipYear || isVipMonth ? "border-gray-200 text-gray-600 hover:bg-gray-50" : "border-gray-200 text-gray-400 bg-gray-50"
              }`}
            >
              <i className={isVipYear || isVipMonth ? "ri-download-line" : "ri-lock-line"}></i>
              {isVipYear ? "Xuất CSV" : isVipMonth ? "Xuất CSV (50 ngày)" : "VIP Năm"}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            {todayEntry ? "Cập nhật hôm nay" : "Ghi hôm nay"}
          </button>
        </div>

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        open={modalOpen}
        onClose={closeModal}
        reason={modalReason ?? "not_vip_year"}
        featureName="Xuất CSV nhật ký học tập"
      />
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Ghi nhật ký — {formatDateShort(getToday())}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Mood */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Cảm giác học hôm nay?</p>
              <div className="flex gap-2">
                {(Object.entries(MOOD_CONFIG) as [DiaryEntry["mood"], typeof MOOD_CONFIG.great][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setForm(f => ({ ...f, mood: key }))}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 cursor-pointer transition-all ${form.mood === key ? `border-rose-400 ${cfg.bg}` : "border-gray-200"}`}
                  >
                    <i className={`${cfg.icon} ${form.mood === key ? cfg.color : "text-gray-400"} text-lg`}></i>
                    <span className={`text-[10px] font-medium ${form.mood === key ? cfg.color : "text-gray-400"}`}>{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Từ đã học</label>
                <input
                  type="number" min="0" value={form.wordsLearned}
                  onChange={e => setForm(f => ({ ...f, wordsLearned: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Quiz đúng</label>
                <input
                  type="number" min="0" value={form.quizScore}
                  onChange={e => setForm(f => ({ ...f, quizScore: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Tổng câu</label>
                <input
                  type="number" min="0" value={form.quizTotal}
                  onChange={e => setForm(f => ({ ...f, quizTotal: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Ghi chú (tùy chọn)</label>
              <textarea
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Hôm nay học được gì? Khó khăn gặp phải?..."
                rows={3}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <p className="text-xs text-gray-400 text-right">{form.note.length}/300</p>
            </div>

            <div className="flex gap-3">
              <button onClick={addEntry} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
                Lưu nhật ký
              </button>
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {([
          { key: "timeline", label: "Timeline", icon: "ri-time-line" },
          { key: "calendar", label: "Lịch", icon: "ri-calendar-line" },
          { key: "stats", label: "Thống kê", icon: "ri-bar-chart-line" },
        ] as { key: typeof viewMode; label: string; icon: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setViewMode(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${viewMode === t.key ? "bg-white text-rose-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <i className={t.icon}></i>{t.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {diary.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 flex items-center justify-center bg-rose-50 rounded-2xl mx-auto mb-4">
            <i className="ri-book-2-line text-rose-300 text-3xl"></i>
          </div>
          <p className="font-medium text-gray-500 mb-1">Chưa có nhật ký nào</p>
          <p className="text-sm mb-6">Nhấn "Ghi hôm nay" để bắt đầu theo dõi tiến độ học tập</p>
          <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
            Ghi nhật ký đầu tiên
          </button>
        </div>
      )}

      {/* Timeline view */}
      {viewMode === "timeline" && diary.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>
          <div className="space-y-4">
            {diary.map((entry, i) => {
              const mood = MOOD_CONFIG[entry.mood ?? "good"];
              const quizPct = entry.quizTotal > 0 ? Math.round((entry.quizScore / entry.quizTotal) * 100) : null;
              const isToday = entry.date === getToday();
              return (
                <div key={i} className="flex gap-4 relative">
                  {/* Timeline dot */}
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 z-10 border-2 ${isToday ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white"}`}>
                    <i className={`${mood.icon} ${mood.color} text-lg`}></i>
                  </div>
                  {/* Card */}
                  <div className={`flex-1 bg-white border rounded-2xl p-4 mb-1 ${isToday ? "border-rose-200" : "border-gray-100"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{formatDate(entry.date)}</p>
                        {isToday && <span className="text-xs text-rose-500 font-medium">Hôm nay</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mood.bg} ${mood.color}`}>{mood.label}</span>
                        {entry.streakDay > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 font-medium">
                            <i className="ri-fire-line mr-0.5"></i>{entry.streakDay} ngày
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-3 mb-3 flex-wrap">
                      {entry.wordsLearned > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg">
                          <i className="ri-book-open-line text-rose-500 text-xs"></i>
                          <span className="text-xs font-semibold text-rose-700">{entry.wordsLearned} từ</span>
                        </div>
                      )}
                      {quizPct !== null && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${quizPct >= 80 ? "bg-green-50" : quizPct >= 50 ? "bg-amber-50" : "bg-red-50"}`}>
                          <i className={`ri-gamepad-line text-xs ${quizPct >= 80 ? "text-green-500" : quizPct >= 50 ? "text-amber-500" : "text-red-500"}`}></i>
                          <span className={`text-xs font-semibold ${quizPct >= 80 ? "text-green-700" : quizPct >= 50 ? "text-amber-700" : "text-red-700"}`}>
                            Quiz {quizPct}% ({entry.quizScore}/{entry.quizTotal})
                          </span>
                        </div>
                      )}
                      {entry.srReviewed > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg">
                          <i className="ri-brain-line text-indigo-500 text-xs"></i>
                          <span className="text-xs font-semibold text-indigo-700">{entry.srReviewed} SR</span>
                        </div>
                      )}
                    </div>

                    {entry.note && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-amber-700 leading-relaxed">
                          <i className="ri-sticky-note-line mr-1"></i>{entry.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar view */}
      {viewMode === "calendar" && diary.length > 0 && (
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">30 ngày gần nhất</p>
            <div className="grid grid-cols-7 gap-1.5">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
              {/* Offset for first day */}
              {(() => {
                const firstDay = new Date(calendarDays[0].date).getDay();
                return Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`}></div>);
              })()}
              {calendarDays.map((day, i) => {
                const mood = day.entry ? MOOD_CONFIG[day.entry.mood ?? "good"] : null;
                const isToday = day.date === getToday();
                return (
                  <div
                    key={i}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      day.entry
                        ? `${mood?.bg} ${mood?.color} border border-current/20`
                        : isToday
                        ? "border-2 border-rose-300 text-rose-400"
                        : "text-gray-300"
                    }`}
                    title={day.entry ? `${day.entry.wordsLearned} từ · Quiz ${day.entry.quizScore}/${day.entry.quizTotal}` : ""}
                  >
                    <span>{day.label}</span>
                    {day.entry && <i className={`${mood?.icon} text-[8px] mt-0.5`}></i>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {(Object.entries(MOOD_CONFIG) as [string, typeof MOOD_CONFIG.great][]).map(([key, cfg]) => (
              <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 ${cfg.bg} rounded-full`}>
                <i className={`${cfg.icon} ${cfg.color} text-xs`}></i>
                <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats view */}
      {viewMode === "stats" && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tổng ngày học", value: stats.totalDays, icon: "ri-calendar-check-line", color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Tổng từ đã học", value: stats.totalWords, icon: "ri-book-open-line", color: "text-amber-600", bg: "bg-amber-50" },
              { label: "TB từ/ngày", value: stats.avgWords, icon: "ri-bar-chart-line", color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Độ chính xác quiz", value: `${stats.accuracy}%`, icon: "ri-gamepad-line", color: "text-green-600", bg: "bg-green-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <i className={`${s.icon} ${s.color} text-lg`}></i>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 7-day chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Từ học được — 7 ngày gần nhất</p>
            <div className="flex items-end gap-2 h-24">
              {stats.last7.map((entry, i) => {
                const maxWords = Math.max(...stats.last7.map(e => e.wordsLearned), 1);
                const h = Math.max((entry.wordsLearned / maxWords) * 80, entry.wordsLearned > 0 ? 4 : 2);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full rounded-t-sm transition-all" style={{ height: `${h}px`, backgroundColor: entry.wordsLearned > 0 ? "#f43f5e" : "#f3f4f6" }}></div>
                    <span className="text-xs text-gray-400" style={{ fontSize: "9px" }}>{formatDateShort(entry.date)}</span>
                    {entry.wordsLearned > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {entry.wordsLearned} từ
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best day */}
          {stats.bestDay && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-xl">
                <i className="ri-trophy-line text-amber-600 text-xl"></i>
              </div>
              <div>
                <p className="font-semibold text-amber-800">Ngày học tốt nhất</p>
                <p className="text-sm text-amber-600">{formatDate(stats.bestDay.date)} — {stats.bestDay.wordsLearned} từ</p>
              </div>
            </div>
          )}

          {/* Mood distribution */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Phân bố cảm xúc học tập</p>
            <div className="space-y-2">
              {(Object.entries(MOOD_CONFIG) as [DiaryEntry["mood"], typeof MOOD_CONFIG.great][]).map(([key, cfg]) => {
                const count = diary.filter(e => (e.mood ?? "good") === key).length;
                const pct = diary.length > 0 ? Math.round((count / diary.length) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-7 h-7 flex items-center justify-center ${cfg.bg} rounded-lg flex-shrink-0`}>
                      <i className={`${cfg.icon} ${cfg.color} text-sm`}></i>
                    </div>
                    <span className="text-sm text-gray-600 w-24">{cfg.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct > 0 ? "#f43f5e" : "transparent" }}></div>
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{count} ngày ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
