import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

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

// Generate mock history for last 30 days
function generateHistory(): DayRecord[] {
  const records: DayRecord[] = [];
  const today = new Date();
  const wordPool = [
    { w: "사랑", m: "Tình yêu" }, { w: "행복", m: "Hạnh phúc" }, { w: "공부", m: "Học tập" },
    { w: "친구", m: "Bạn bè" }, { w: "가족", m: "Gia đình" }, { w: "음식", m: "Thức ăn" },
    { w: "여행", m: "Du lịch" }, { w: "음악", m: "Âm nhạc" }, { w: "영화", m: "Phim ảnh" },
    { w: "날씨", m: "Thời tiết" }, { w: "시간", m: "Thời gian" }, { w: "학교", m: "Trường học" },
    { w: "노력", m: "Nỗ lực" }, { w: "성공", m: "Thành công" }, { w: "경험", m: "Kinh nghiệm" },
    { w: "발전", m: "Phát triển" }, { w: "문화", m: "Văn hóa" }, { w: "사회", m: "Xã hội" },
    { w: "경제", m: "Kinh tế" }, { w: "환경", m: "Môi trường" },
  ];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const active = Math.random() > 0.25; // 75% chance of studying
    if (!active) continue;

    const numWords = Math.floor(Math.random() * 8) + 3;
    const words = wordPool.sort(() => Math.random() - 0.5).slice(0, numWords).map(w => w.w);
    const minutes = Math.floor(Math.random() * 45) + 10;
    const score = Math.floor(Math.random() * 40) + 60;
    const xp = Math.floor(minutes * 2.5 + numWords * 3);

    records.push({
      date: dateStr,
      wordsLearned: words,
      quizScore: score,
      studyMinutes: minutes,
      xpEarned: xp,
      activities: [
        { type: "vocab", label: "Từ vựng", count: numWords, icon: "ri-translate-2", color: "text-sky-500" },
        { type: "quiz", label: "Quiz", count: Math.floor(Math.random() * 3) + 1, icon: "ri-survey-line", color: "text-amber-500" },
        { type: "flashcard", label: "Flashcard", count: Math.floor(Math.random() * 20) + 5, icon: "ri-stack-line", color: "text-violet-500" },
        ...(Math.random() > 0.5 ? [{ type: "listen", label: "Nghe", count: 1, icon: "ri-headphone-line", color: "text-emerald-500" }] : []),
      ],
    });
  }
  return records;
}

function generateWordHistory(): WordRecord[] {
  const words = [
    { word: "사랑", meaning: "Tình yêu", category: "Cảm xúc" },
    { word: "행복", meaning: "Hạnh phúc", category: "Cảm xúc" },
    { word: "공부", meaning: "Học tập", category: "Giáo dục" },
    { word: "친구", meaning: "Bạn bè", category: "Người" },
    { word: "가족", meaning: "Gia đình", category: "Người" },
    { word: "음식", meaning: "Thức ăn", category: "Ăn uống" },
    { word: "여행", meaning: "Du lịch", category: "Hoạt động" },
    { word: "음악", meaning: "Âm nhạc", category: "Văn hóa" },
    { word: "영화", meaning: "Phim ảnh", category: "Văn hóa" },
    { word: "날씨", meaning: "Thời tiết", category: "Thiên nhiên" },
    { word: "노력", meaning: "Nỗ lực", category: "Tư duy" },
    { word: "성공", meaning: "Thành công", category: "Tư duy" },
    { word: "경험", meaning: "Kinh nghiệm", category: "Tư duy" },
    { word: "발전", meaning: "Phát triển", category: "Xã hội" },
    { word: "문화", meaning: "Văn hóa", category: "Xã hội" },
    { word: "경제", meaning: "Kinh tế", category: "Xã hội" },
    { word: "환경", meaning: "Môi trường", category: "Thiên nhiên" },
    { word: "시간", meaning: "Thời gian", category: "Cơ bản" },
    { word: "학교", meaning: "Trường học", category: "Giáo dục" },
    { word: "사회", meaning: "Xã hội", category: "Xã hội" },
  ];

  const today = new Date();
  return words.map(w => {
    const daysAgo = Math.floor(Math.random() * 30);
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const reviewDaysAgo = Math.floor(Math.random() * daysAgo);
    const rd = new Date(today);
    rd.setDate(rd.getDate() - reviewDaysAgo);
    return {
      ...w,
      learnedAt: d.toISOString().split("T")[0],
      reviewCount: Math.floor(Math.random() * 8) + 1,
      lastReview: rd.toISOString().split("T")[0],
      mastery: Math.floor(Math.random() * 60) + 40,
    };
  });
}

const HISTORY = generateHistory();
const WORD_HISTORY = generateWordHistory();

type ViewMode = "calendar" | "list" | "words";

export default function StudyHistoryDetailPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);
  const [wordFilter, setWordFilter] = useState("all");
  const [wordSort, setWordSort] = useState<"date" | "mastery" | "review">("date");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const totalDays = HISTORY.length;
  const totalWords = HISTORY.reduce((s, d) => s + d.wordsLearned.length, 0);
  const totalMinutes = HISTORY.reduce((s, d) => s + d.studyMinutes, 0);
  const totalXP = HISTORY.reduce((s, d) => s + d.xpEarned, 0);
  const avgScore = Math.round(HISTORY.reduce((s, d) => s + d.quizScore, 0) / HISTORY.length);

  const historyMap = Object.fromEntries(HISTORY.map(d => [d.date, d]));

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

  const categories = ["all", ...Array.from(new Set(WORD_HISTORY.map(w => w.category)))];
  const filteredWords = WORD_HISTORY
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
            {[...HISTORY].reverse().map(day => (
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
