import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface DayRecord {
  date: string; // YYYY-MM-DD
  wordsLearned: string[];
  quizScore: number;
  studyMinutes: number;
  xpEarned: number;
  activities: { type: string; label: string; count: number; icon: string; color: string }[];
}

interface WordRecord {
  word: string;
  meaning: string;
  learnedAt: string; // YYYY-MM-DD
  reviewCount: number;
  lastReview: string;
  mastery: number; // 0-100
  category: string;
}

type ViewMode = "calendar" | "list" | "words";

export default function StudyHistoryDetailPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);
  const [wordFilter, setWordFilter] = useState("all");
  const [wordSort, setWordSort] = useState<"date" | "mastery" | "review">("date");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [wordHistory, setWordHistory] = useState<WordRecord[]>([]);

  // Load lịch sử học thật từ study_history + topik_quiz_history
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceStr = since.toISOString().split("T")[0];

      const [{ data: historyRows }, { data: quizRows }] = await Promise.all([
        supabase.from("study_history")
          .select("study_date, study_time, vocab_count, grammar_count")
          .eq("user_id", user.id)
          .gte("study_date", sinceStr),
        supabase.from("topik_quiz_history")
          .select("score, total, created_at")
          .eq("user_id", user.id)
          .gte("created_at", since.toISOString()),
      ]);

      if (cancelled) return;

      // Gộp quiz theo ngày để tính trung bình score
      const quizByDate: Record<string, { total: number; count: number }> = {};
      (quizRows || []).forEach((row: { score: number; total: number; created_at: string }) => {
        const d = row.created_at.split("T")[0];
        if (!quizByDate[d]) quizByDate[d] = { total: 0, count: 0 };
        if (row.total > 0) {
          quizByDate[d].total += Math.round((row.score / row.total) * 100);
          quizByDate[d].count += 1;
        }
      });

      const records: DayRecord[] = [];
      (historyRows || []).forEach((row: { study_date: string; study_time?: number; vocab_count?: number; grammar_count?: number }) => {
        const minutes = Math.round((row.study_time || 0) / 60);
        const numWords = row.vocab_count || 0;
        const numGrammar = row.grammar_count || 0;
        const xp = numWords * 5 + numGrammar * 10;
        const quiz = quizByDate[row.study_date];
        const avgQuiz = quiz ? Math.round(quiz.total / quiz.count) : 0;

        records.push({
          date: row.study_date,
          wordsLearned: [],
          quizScore: avgQuiz,
          studyMinutes: minutes,
          xpEarned: xp,
          activities: [
            { type: "vocab", label: "Từ vựng", count: numWords, icon: "ri-translate-2", color: "text-sky-500" },
            { type: "quiz", label: "Quiz", count: quiz?.count || 0, icon: "ri-survey-line", color: "text-amber-500" },
            { type: "grammar", label: "Ngữ pháp", count: numGrammar, icon: "ri-stack-line", color: "text-violet-500" },
          ],
        });
      });
      setHistory(records);

      // Load từ đã biết từ study_progress.vocab_known / flashcard_known
      const { data: spData } = await supabase
        .from("study_progress")
        .select("vocab_known, flashcard_known")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled || !spData) return;

      const knownIds = [
        ...(Array.isArray(spData.vocab_known) ? spData.vocab_known : []),
        ...(Array.isArray(spData.flashcard_known) ? spData.flashcard_known : []),
      ];
      // Lấy chi tiết từ vựng
      if (knownIds.length > 0) {
        const { data: vocabRows } = await supabase
          .from("topik_vocabulary")
          .select("id, korean, vietnamese, category")
          .in("id", knownIds.slice(0, 200));
        if (cancelled) return;
        const today = new Date().toISOString().split("T")[0];
        setWordHistory(
          (vocabRows || []).map((v: { korean: string; vietnamese: string; category?: string }) => ({
            word: v.korean,
            meaning: v.vietnamese,
            category: v.category || "Khác",
            learnedAt: today,
            reviewCount: 1,
            lastReview: today,
            mastery: 70,
          }))
        );
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const totalDays = history.length;
  const totalWords = useMemo(() => history.reduce((s, d) => s + (d.activities.find(a => a.type === "vocab")?.count || 0), 0), [history]);
  const totalMinutes = useMemo(() => history.reduce((s, d) => s + d.studyMinutes, 0), [history]);
  const totalXP = useMemo(() => history.reduce((s, d) => s + d.xpEarned, 0), [history]);
  const avgScore = history.length > 0 ? Math.round(history.reduce((s, d) => s + d.quizScore, 0) / history.length) : 0;

  const historyMap = useMemo(() => Object.fromEntries(history.map(d => [d.date, d])), [history]);

  // Calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().split("T")[0];
    }),
  ];

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setSelectedDay(historyMap[date] || null);
  };

  const getIntensity = (date: string) => {
    const d = historyMap[date];
    if (!d) return 0;
    if (d.studyMinutes >= 40) return 4;
    if (d.studyMinutes >= 25) return 3;
    if (d.studyMinutes >= 15) return 2;
    return 1;
  };

  const intensityColors = ["bg-gray-100", "bg-emerald-100", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"];

  const categories = ["all", ...Array.from(new Set(wordHistory.map(w => w.category)))];
  const filteredWords = wordHistory
    .filter(w => wordFilter === "all" || w.category === wordFilter)
    .sort((a, b) => {
      if (wordSort === "date") return b.learnedAt.localeCompare(a.learnedAt);
      if (wordSort === "mastery") return b.mastery - a.mastery;
      return b.reviewCount - a.reviewCount;
    });

  const masteryColor = (m: number) => m >= 80 ? "text-emerald-500" : m >= 60 ? "text-amber-500" : "text-rose-500";
  const masteryBg = (m: number) => m >= 80 ? "bg-emerald-500" : m >= 60 ? "bg-amber-500" : "bg-rose-500";

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8f7f4] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-teal-500/10 rounded-xl">
            <i className="ri-history-line text-teal-500 text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Lịch sử học tập
            </h1>
            <p className="text-gray-500 text-sm">Theo dõi chi tiết từng ngày, từng từ đã học</p>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Ngày học", value: totalDays, icon: "ri-calendar-check-line", color: "text-teal-500", bg: "bg-teal-50" },
            { label: "Từ đã học", value: totalWords, icon: "ri-translate-2", color: "text-sky-500", bg: "bg-sky-50" },
            { label: "Phút học", value: totalMinutes, icon: "ri-time-line", color: "text-violet-500", bg: "bg-violet-50" },
            { label: "Tổng XP", value: totalXP, icon: "ri-star-line", color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Điểm TB", value: `${avgScore}%`, icon: "ri-bar-chart-line", color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <div className={`w-8 h-8 flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <i className={`${s.icon} text-xl`}></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* View mode tabs */}
        <div className="flex gap-2 mb-5">
          {(["calendar", "list", "words"] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${viewMode === mode ? "bg-teal-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}
            >
              <i className={`${mode === "calendar" ? "ri-calendar-2-line" : mode === "list" ? "ri-list-check-2" : "ri-translate-2"}`}></i>
              {mode === "calendar" ? "Lịch học" : mode === "list" ? "Theo ngày" : "Từ đã học"}
            </button>
          ))}
        </div>

        {/* Calendar view */}
        {viewMode === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer">
                  <i className="ri-arrow-left-s-line text-gray-500"></i>
                </button>
                <p className="font-bold text-gray-800">{monthNames[month]} {year}</p>
                <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer">
                  <i className="ri-arrow-right-s-line text-gray-500"></i>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={i}></div>;
                  const intensity = getIntensity(date);
                  const isSelected = selectedDate === date;
                  const isToday = date === new Date().toISOString().split("T")[0];
                  return (
                    <button
                      key={date}
                      onClick={() => handleDayClick(date)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-teal-500 ring-offset-1" : ""
                      } ${isToday ? "font-bold" : ""} ${intensityColors[intensity]} hover:opacity-80`}
                    >
                      <span className={`text-xs ${intensity > 0 ? (intensity >= 3 ? "text-white" : "text-gray-700") : "text-gray-400"}`}>
                        {new Date(date).getDate()}
                      </span>
                      {intensity > 0 && (
                        <div className={`w-1 h-1 rounded-full mt-0.5 ${intensity >= 3 ? "bg-white/60" : "bg-emerald-600/40"}`}></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-xs text-gray-400">Ít</span>
                {intensityColors.map((c, i) => (
                  <div key={i} className={`w-4 h-4 rounded ${c}`}></div>
                ))}
                <span className="text-xs text-gray-400">Nhiều</span>
              </div>
            </div>

            {/* Day detail */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {selectedDay ? (
                <div>
                  <p className="font-bold text-gray-800 mb-4">
                    {new Date(selectedDay.date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Phút học", value: selectedDay.studyMinutes, icon: "ri-time-line", color: "text-violet-500" },
                      { label: "Từ học", value: selectedDay.wordsLearned.length, icon: "ri-translate-2", color: "text-sky-500" },
                      { label: "Điểm quiz", value: `${selectedDay.quizScore}%`, icon: "ri-survey-line", color: "text-amber-500" },
                      { label: "XP kiếm", value: selectedDay.xpEarned, icon: "ri-star-line", color: "text-emerald-500" },
                    ].map((s, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                        <i className={`${s.icon} ${s.color} text-lg block mb-1`}></i>
                        <p className="text-lg font-bold text-gray-800">{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 tracking-normal mb-2">Hoạt động</p>
                  <div className="space-y-2 mb-4">
                    {selectedDay.activities.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <i className={`${a.icon} ${a.color} text-sm`}></i>
                        <span className="text-sm text-gray-700 flex-1">{a.label}</span>
                        <span className="text-xs font-bold text-gray-500">{a.count}x</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 tracking-normal mb-2">Từ đã học ({selectedDay.wordsLearned.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDay.wordsLearned.map(w => (
                      <span key={w} className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">{w}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <div className="text-center">
                    <i className="ri-calendar-line text-4xl mb-2 block"></i>
                    <p className="text-sm">Chọn ngày để xem chi tiết</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {[...history].reverse().map(day => (
              <div key={day.date} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">
                      {new Date(day.date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500"><i className="ri-time-line mr-1"></i>{day.studyMinutes} phút</span>
                      <span className="text-xs text-gray-500"><i className="ri-translate-2 mr-1"></i>{day.wordsLearned.length} từ</span>
                      <span className="text-xs text-gray-500"><i className="ri-star-line mr-1"></i>{day.xpEarned} XP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${day.quizScore >= 80 ? "text-emerald-500" : day.quizScore >= 60 ? "text-amber-500" : "text-rose-500"}`}>
                      {day.quizScore}%
                    </p>
                    <p className="text-xs text-gray-400">Quiz</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {day.wordsLearned.map(w => (
                    <span key={w} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-lg text-xs">{w}</span>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  {day.activities.map((a, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                      <i className={`${a.icon} ${a.color}`}></i>
                      {a.label} ×{a.count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Words view */}
        {viewMode === "words" && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setWordFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${wordFilter === c ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    {c === "all" ? "Tất cả" : c}
                  </button>
                ))}
              </div>
              <select
                value={wordSort}
                onChange={e => setWordSort(e.target.value as typeof wordSort)}
                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="date">Mới nhất</option>
                <option value="mastery">Độ thành thạo</option>
                <option value="review">Số lần ôn</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWords.map((w, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{w.word}</p>
                      <p className="text-sm text-gray-500">{w.meaning}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{w.category}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Độ thành thạo</span>
                      <span className={`text-xs font-bold ${masteryColor(w.mastery)}`}>{w.mastery}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${masteryBg(w.mastery)}`} style={{ width: `${w.mastery}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span><i className="ri-calendar-line mr-1"></i>Học: {new Date(w.learnedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}</span>
                    <span><i className="ri-refresh-line mr-1"></i>Ôn: {w.reviewCount} lần</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
