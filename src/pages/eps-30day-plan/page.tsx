import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DayPlan {
  day: number;
  title: string;
  tasks: { type: string; label: string; duration: number; icon: string; color: string }[];
  topic: string;
  isRest?: boolean;
}

const TOPICS_30 = [
  "Giao tiếp cơ bản", "An toàn lao động", "Văn hóa Hàn Quốc", "Nơi làm việc",
  "Pháp luật lao động", "Sinh hoạt hàng ngày", "Giao thông", "Y tế & Sức khỏe",
  "Tài chính & Ngân hàng", "Khẩn cấp & Tai nạn",
];

function buildPlan(): DayPlan[] {
  const plan: DayPlan[] = [];
  for (let day = 1; day <= 30; day++) {
    const isRest = day % 7 === 0;
    const topicIdx = Math.floor((day - 1) / 3) % TOPICS_30.length;
    const topic = TOPICS_30[topicIdx];
    const weekNum = Math.ceil(day / 7);

    if (isRest) {
      plan.push({
        day,
        title: `Ngày nghỉ & Ôn tổng hợp tuần ${weekNum}`,
        topic: "Ôn tập",
        isRest: true,
        tasks: [
          { type: "review", label: "Ôn tập câu sai tuần này", duration: 15, icon: "ri-error-warning-line", color: "#f59e0b" },
          { type: "flashcard", label: "Flashcard từ vựng đã học", duration: 10, icon: "ri-stack-line", color: "#8b5cf6" },
        ],
      });
    } else {
      const dayInWeek = ((day - 1) % 7) + 1;
      const tasks = [];

      if (dayInWeek === 1 || dayInWeek === 4) {
        tasks.push({ type: "vocab", label: `Từ vựng: ${topic}`, duration: 15, icon: "ri-translate-2", color: "#10b981" });
        tasks.push({ type: "flashcard", label: "Flashcard 20 từ mới", duration: 10, icon: "ri-stack-line", color: "#8b5cf6" });
        tasks.push({ type: "quiz", label: "Quiz 10 câu nhanh", duration: 10, icon: "ri-survey-line", color: "#f59e0b" });
      } else if (dayInWeek === 2 || dayInWeek === 5) {
        tasks.push({ type: "lesson", label: `Bài học: ${topic}`, duration: 20, icon: "ri-book-open-line", color: "#3b82f6" });
        tasks.push({ type: "listening", label: "Luyện nghe 5 câu", duration: 10, icon: "ri-headphone-line", color: "#ec4899" });
        tasks.push({ type: "review", label: "Ôn lại từ hôm qua", duration: 5, icon: "ri-refresh-line", color: "#6b7280" });
      } else if (dayInWeek === 3 || dayInWeek === 6) {
        tasks.push({ type: "exam", label: "Thi thử 20 câu theo chủ đề", duration: 25, icon: "ri-timer-line", color: "#ea580c" });
        tasks.push({ type: "wrong", label: "Xem lại câu sai", duration: 10, icon: "ri-error-warning-line", color: "#dc2626" });
        tasks.push({ type: "vocab", label: "Ôn từ vựng chủ đề", duration: 10, icon: "ri-translate-2", color: "#10b981" });
      }

      plan.push({ day, title: `Ngày ${day}: ${topic}`, topic, tasks });
    }
  }
  return plan;
}

const PLAN_30 = buildPlan();

function DayCard({
  plan,
  isCompleted,
  isToday,
  isFuture,
  onToggle,
}: {
  plan: DayPlan;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  onToggle: () => void;
}) {
  const totalMin = plan.tasks.reduce((s, t) => s + t.duration, 0);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isToday
          ? "border-amber-400 bg-amber-50"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/50"
          : isFuture
          ? "border-gray-100 bg-gray-50/50 opacity-60"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isCompleted
                ? "bg-emerald-500 text-white"
                : isToday
                ? "bg-amber-500 text-white"
                : plan.isRest
                ? "bg-violet-100 text-violet-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isCompleted ? <i className="ri-check-line"></i> : plan.day}
          </div>
          <div>
            <p className={`text-sm font-semibold ${isToday ? "text-amber-700" : isCompleted ? "text-emerald-700" : "text-gray-700"}`}>
              {plan.title}
              {isToday && <span className="ml-2 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">Hôm nay</span>}
            </p>
            <p className="text-gray-400 text-xs">{totalMin} phút · {plan.tasks.length} hoạt động</p>
          </div>
        </div>
        {!isFuture && (
          <button
            onClick={onToggle}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              isCompleted
                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {isCompleted ? "Hoàn thành ✓" : "Đánh dấu xong"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {plan.tasks.map((task, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: `${task.color}12`, color: task.color }}
          >
            <i className={`${task.icon} text-[11px]`}></i>
            <span>{task.label}</span>
            <span className="opacity-60">· {task.duration}p</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Eps30DayPlanPage() {
  const [examDate, setExamDate] = useLocalStorage<string>("kts_eps_exam_target_date", "");
  const [startDate, setStartDate] = useLocalStorage<string>("kts_eps_plan_start_date", "");
  const [completedDays, setCompletedDays] = useLocalStorage<number[]>("kts_eps_30day_completed", []);
  const [showSetup, setShowSetup] = useState(!startDate);
  const [tempExamDate, setTempExamDate] = useState(examDate);
  const [filterWeek, setFilterWeek] = useState<number>(0); // 0 = all
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDateObj = startDate ? new Date(startDate) : null;
  const examDateObj = examDate ? new Date(examDate) : null;

  const daysUntilExam = examDateObj
    ? Math.ceil((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const todayDayNum = startDateObj
    ? Math.ceil((today.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  const completedCount = completedDays.length;
  const progressPct = Math.round((completedCount / 30) * 100);

  const handleSetup = () => {
    if (!tempExamDate) return;
    const examD = new Date(tempExamDate);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    setExamDate(tempExamDate);
    setStartDate(start.toISOString().split("T")[0]);
    setShowSetup(false);
  };

  const toggleDay = (day: number) => {
    setCompletedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const weeks = [1, 2, 3, 4];
  const filteredPlan = filterWeek === 0
    ? (showAll ? PLAN_30 : PLAN_30.slice(0, 14))
    : PLAN_30.filter(p => Math.ceil(p.day / 7) === filterWeek);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lộ trình EPS 30 ngày</h1>
            <p className="text-gray-500 text-sm mt-1">Kế hoạch học chi tiết từng ngày — đếm ngược đến ngày thi</p>
          </div>
          <button
            onClick={() => setShowSetup(true)}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-calendar-event-line"></i>
            {examDate ? `Ngày thi: ${new Date(examDate).toLocaleDateString("vi-VN")}` : "Chọn ngày thi"}
          </button>
        </div>

        {/* Countdown + progress */}
        {startDate && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Countdown */}
            <div className={`rounded-2xl p-5 text-center ${daysUntilExam !== null && daysUntilExam <= 7 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className="text-gray-500 text-xs mb-1">Còn lại đến ngày thi</p>
              <p className={`text-4xl font-extrabold ${daysUntilExam !== null && daysUntilExam <= 7 ? "text-red-500" : "text-amber-600"}`}>
                {daysUntilExam !== null ? `${daysUntilExam}` : "—"}
              </p>
              <p className="text-gray-400 text-xs mt-1">ngày</p>
              {daysUntilExam !== null && daysUntilExam <= 7 && (
                <p className="text-red-500 text-xs font-semibold mt-2">⚠️ Gần đến ngày thi rồi!</p>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-500 text-xs mb-2">Tiến độ lộ trình</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-extrabold text-gray-800">{completedCount}</p>
                <p className="text-gray-400 text-sm mb-1">/30 ngày</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-gray-400 text-xs mt-1">{progressPct}% hoàn thành</p>
            </div>

            {/* Today */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-500 text-xs mb-2">Hôm nay</p>
              {todayDayNum && todayDayNum >= 1 && todayDayNum <= 30 ? (
                <>
                  <p className="text-3xl font-extrabold text-gray-800">Ngày {todayDayNum}</p>
                  <p className="text-gray-500 text-sm mt-1">{PLAN_30[todayDayNum - 1]?.topic}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {completedDays.includes(todayDayNum) ? "✅ Đã hoàn thành hôm nay!" : "⏳ Chưa học hôm nay"}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Chưa bắt đầu lộ trình</p>
              )}
            </div>
          </div>
        )}

        {/* Week filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setFilterWeek(0); setShowAll(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${filterWeek === 0 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            Tất cả
          </button>
          {weeks.map(w => (
            <button
              key={w}
              onClick={() => setFilterWeek(w)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${filterWeek === w ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              Tuần {w}
            </button>
          ))}
        </div>

        {/* Plan list */}
        <div className="space-y-3">
          {filteredPlan.map(plan => {
            const isCompleted = completedDays.includes(plan.day);
            const isToday = todayDayNum === plan.day;
            const isFuture = todayDayNum !== null && plan.day > todayDayNum;
            return (
              <DayCard
                key={plan.day}
                plan={plan}
                isCompleted={isCompleted}
                isToday={isToday}
                isFuture={isFuture}
                onToggle={() => toggleDay(plan.day)}
              />
            );
          })}

          {filterWeek === 0 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Xem thêm 16 ngày còn lại →
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <h3 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
            <i className="ri-lightbulb-line text-amber-500"></i>
            Mẹo học hiệu quả
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "ri-time-line", text: "Học đúng giờ mỗi ngày — não bộ sẽ quen với thói quen và học hiệu quả hơn", color: "#f59e0b" },
              { icon: "ri-repeat-line", text: "Ôn lại từ vựng ngày hôm trước trước khi học từ mới — giúp nhớ lâu hơn", color: "#10b981" },
              { icon: "ri-error-warning-line", text: "Tập trung vào câu sai — đây là điểm yếu cần cải thiện nhất", color: "#dc2626" },
              { icon: "ri-trophy-line", text: "Thi thử ít nhất 3 lần/tuần để quen với áp lực thời gian thật", color: "#7c3aed" },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tip.color}15` }}>
                  <i className={`${tip.icon} text-sm`} style={{ color: tip.color }}></i>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Setup modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-800 font-bold text-lg">Thiết lập lộ trình 30 ngày</h3>
              {startDate && (
                <button onClick={() => setShowSetup(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm font-medium mb-2 block">Ngày thi EPS dự kiến</label>
                <input
                  type="date"
                  value={tempExamDate}
                  onChange={e => setTempExamDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-amber-400"
                />
                <p className="text-gray-400 text-xs mt-1.5">Chọn ngày thi EPS-TOPIK bạn đã đăng ký hoặc dự định thi</p>
              </div>

              {tempExamDate && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-amber-700 text-sm font-medium">
                    Còn {Math.ceil((new Date(tempExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày đến kỳ thi
                  </p>
                  <p className="text-amber-600/70 text-xs mt-1">Lộ trình 30 ngày sẽ bắt đầu từ hôm nay</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-xs font-semibold mb-2">Lộ trình bao gồm:</p>
                <ul className="space-y-1.5">
                  {[
                    "30 ngày học có cấu trúc rõ ràng",
                    "Mỗi ngày 35-45 phút học tập",
                    "Bao phủ 10 chủ đề EPS-TOPIK chính",
                    "Ngày nghỉ ôn tập mỗi cuối tuần",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-gray-500 text-xs">
                      <i className="ri-check-line text-emerald-500 text-xs"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {startDate && (
                <button onClick={() => setShowSetup(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">
                  Hủy
                </button>
              )}
              <button
                onClick={handleSetup}
                disabled={!tempExamDate}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {startDate ? "Cập nhật lộ trình" : "Bắt đầu lộ trình 30 ngày!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
