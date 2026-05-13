import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsLessons } from "@/mocks/epsLessons";

// ─── Notification Settings ────────────────────────────────────────────────
interface NotificationSettings {
  enabled: boolean;
  permission: "default" | "granted" | "denied";
  reminderTime: string; // HH:MM
  reminderDays: number[]; // 0=CN, 1=T2, ..., 6=T7
  advanceMinutes: number; // nhắc trước bao nhiêu phút
}

function NotificationPanel({
  settings,
  onUpdate,
}: {
  settings: NotificationSettings;
  onUpdate: (s: NotificationSettings) => void;
}) {
  const [testing, setTesting] = useState(false);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    onUpdate({ ...settings, permission: perm as "granted" | "denied" | "default", enabled: perm === "granted" });
  };

  const testNotification = async () => {
    if (settings.permission !== "granted") return;
    setTesting(true);
    new Notification("Nhắc nhở học tập", {
      body: "Đây là thông báo thử nghiệm từ Hàn Quốc Ơi! Đến giờ ôn bài rồi!",
      icon: "/images/brand/logo.svg",
    });
    setTimeout(() => setTesting(false), 2000);
  };

  const toggleDay = (day: number) => {
    const days = settings.reminderDays.includes(day)
      ? settings.reminderDays.filter(d => d !== day)
      : [...settings.reminderDays, day];
    onUpdate({ ...settings, reminderDays: days });
  };

  const DAYS_LABEL = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <i className="ri-notification-3-line text-app-accent-primary text-sm"></i>
        <p className="text-white font-semibold text-sm">Nhắc nhở học tập</p>
      </div>

      {/* Permission status */}
      {settings.permission === "default" && (
        <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-3">
          <p className="text-app-accent-primary text-xs font-medium mb-2">Bật thông báo để nhận nhắc nhở</p>
          <button
            onClick={requestPermission}
            className="w-full py-2 rounded-lg bg-app-accent-primary/15 hover:bg-app-accent-primary/25 text-app-accent-primary text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Cho phép thông báo
          </button>
        </div>
      )}

      {settings.permission === "denied" && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
          <p className="text-red-400 text-xs">Thông báo bị chặn. Vui lòng bật lại trong cài đặt trình duyệt.</p>
        </div>
      )}

      {settings.permission === "granted" && (
        <>
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">Bật nhắc nhở</span>
            <button
              onClick={() => onUpdate({ ...settings, enabled: !settings.enabled })}
              className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${settings.enabled ? "bg-app-accent-primary" : "bg-app-card/70"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.enabled ? "left-5" : "left-0.5"}`}></div>
            </button>
          </div>

          {settings.enabled && (
            <>
              {/* Time picker */}
              <div>
                <p className="text-app-text-secondary text-xs mb-2">Giờ nhắc nhở</p>
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={e => onUpdate({ ...settings, reminderTime: e.target.value })}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Days picker */}
              <div>
                <p className="text-app-text-secondary text-xs mb-2">Ngày nhắc nhở</p>
                <div className="flex gap-1.5">
                  {DAYS_LABEL.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        settings.reminderDays.includes(i)
                          ? "bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/30"
                          : "bg-app-card/50 text-app-text-muted hover:text-white/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advance minutes */}
              <div>
                <p className="text-app-text-secondary text-xs mb-2">Nhắc trước (phút)</p>
                <div className="flex gap-2">
                  {[0, 5, 10, 15, 30].map(min => (
                    <button
                      key={min}
                      onClick={() => onUpdate({ ...settings, advanceMinutes: min })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        settings.advanceMinutes === min
                          ? "bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/30"
                          : "bg-app-card/50 text-app-text-muted hover:text-white/50"
                      }`}
                    >
                      {min === 0 ? "Đúng giờ" : `${min}p`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test button */}
              <button
                onClick={testNotification}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-app-border hover:border-white/20 text-white/50 hover:text-white/80 text-xs font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <i className={`${testing ? "ri-loader-4-line animate-spin" : "ri-notification-line"}`}></i>
                {testing ? "Đang gửi..." : "Thử thông báo"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────
interface ScheduledLesson {
  lessonId: number;
  scheduledDate: string; // YYYY-MM-DD
  note: string;
  reminded: boolean;
  completed: boolean;
}

interface DaySchedule {
  date: string;
  lessons: ScheduledLesson[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS_VI = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

const REMINDER_COLORS = [
  { label: "Quan trọng", color: "#f87171", bg: "bg-red-500/10", border: "border-red-500/25", text: "text-red-400" },
  { label: "Bình thường", color: "app-accent-primary", bg: "bg-app-accent-primary/10", border: "border-app-accent-primary/25", text: "text-app-accent-primary" },
  { label: "Nhẹ nhàng", color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-app-accent-success" },
];

// ─── Add Lesson Modal ─────────────────────────────────────────────────────
function AddLessonModal({
  date,
  onClose,
  onAdd,
  existingIds,
}: {
  date: string;
  onClose: () => void;
  onAdd: (lesson: ScheduledLesson) => void;
  existingIds: number[];
}) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return epsLessons.filter(l =>
      !existingIds.includes(l.id) &&
      (search === "" || l.titleVi.toLowerCase().includes(search.toLowerCase()) || l.title.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 20);
  }, [search, existingIds]);

  const handleAdd = () => {
    if (!selectedLesson) return;
    onAdd({
      lessonId: selectedLesson,
      scheduledDate: date,
      note,
      reminded: false,
      completed: false,
    });
    onClose();
  };

  const dateObj = parseDate(date);
  const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div>
            <p className="text-white font-bold text-sm">Thêm bài ôn tập</p>
            <p className="text-app-text-secondary text-xs mt-0.5">Ngày {dateStr}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-app-text-secondary cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-4 border-b border-app-border">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm bài học..."
              className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {filtered.map(l => (
            <button
              key={l.id}
              onClick={() => setSelectedLesson(l.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedLesson === l.id ? "border-app-accent-primary/40 bg-app-accent-primary/8" : "border-app-border bg-white/2 hover:border-white/15"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-app-text-muted text-xs font-bold w-6 flex-shrink-0">{l.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{l.titleVi}</p>
                  <p className="text-app-text-muted text-xs truncate">{l.title}</p>
                </div>
                {selectedLesson === l.id && <i className="ri-checkbox-circle-fill text-app-accent-primary flex-shrink-0"></i>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-app-text-muted text-sm text-center py-6">Không tìm thấy bài học</p>
          )}
        </div>

        <div className="p-4 border-t border-app-border space-y-3">
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú (tùy chọn)..."
            className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
          />
          <button
            onClick={handleAdd}
            disabled={!selectedLesson}
            className="w-full py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Thêm vào lịch
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────
function DayDetailPanel({
  date,
  schedules,
  onClose,
  onAdd,
  onToggleComplete,
  onRemove,
}: {
  date: string;
  schedules: ScheduledLesson[];
  onClose: () => void;
  onAdd: () => void;
  onToggleComplete: (lessonId: number) => void;
  onRemove: (lessonId: number) => void;
}) {
  const navigate = useNavigate();
  const dateObj = parseDate(date);
  const today = formatDate(new Date());
  const isPast = date < today;
  const isToday = date === today;

  const dateStr = `${WEEKDAYS[dateObj.getDay()]}, ${dateObj.getDate()} ${MONTHS_VI[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">{dateStr}</p>
          {isToday && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary mt-1 inline-block">Hôm nay</span>}
          {isPast && !isToday && <span className="text-[10px] text-app-text-muted mt-1 inline-block">Đã qua</span>}
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-app-text-secondary cursor-pointer">
          <i className="ri-close-line text-sm"></i>
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-6">
          <i className="ri-calendar-line text-app-text-muted text-2xl block mb-2"></i>
          <p className="text-app-text-muted text-sm">Chưa có bài ôn tập</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map(s => {
            const lesson = epsLessons.find(l => l.id === s.lessonId);
            if (!lesson) return null;
            return (
              <div key={s.lessonId} className={`p-3 rounded-xl border transition-all ${s.completed ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-white/2"}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleComplete(s.lessonId)}
                    className={`w-5 h-5 flex items-center justify-center rounded-md border flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${s.completed ? "border-emerald-500/50 bg-emerald-500/20 text-app-accent-success" : "border-white/20 hover:border-white/40"}`}
                  >
                    {s.completed && <i className="ri-check-line text-xs"></i>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${s.completed ? "text-app-text-secondary line-through" : "text-white/80"}`}>
                      Bài {lesson.id}: {lesson.titleVi}
                    </p>
                    {s.note && <p className="text-app-text-muted text-xs mt-0.5 italic">{s.note}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => navigate("/eps-lessons")}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/8 text-app-text-muted hover:text-white/60 cursor-pointer transition-colors"
                    >
                      <i className="ri-external-link-line text-xs"></i>
                    </button>
                    <button
                      onClick={() => onRemove(s.lessonId)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/10 text-app-text-muted hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 hover:border-app-accent-primary/30 hover:bg-app-accent-primary/5 text-app-text-muted hover:text-app-accent-primary text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
      >
        <i className="ri-add-line"></i>
        Thêm bài ôn tập
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ReviewSchedulePage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate(today));
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDate, setAddModalDate] = useState<string>("");

  const [schedules, setSchedules] = useLocalStorage<ScheduledLesson[]>("kts_review_schedule", []);
  const [completedLessons] = useLocalStorage<Record<number, { score: number; completedAt: string }>>("kts_eps_lessons_progress", {});

  const [notifSettings, setNotifSettings] = useLocalStorage<NotificationSettings>("kts_notif_settings", {
    enabled: false,
    permission: (typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default") as "default" | "granted" | "denied",
    reminderTime: "08:00",
    reminderDays: [1, 2, 3, 4, 5],
    advanceMinutes: 0,
  });

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window && notifSettings.permission !== Notification.permission) {
      setNotifSettings(prev => ({ ...prev, permission: Notification.permission as "default" | "granted" | "denied" }));
    }
  }, []);

  // Schedule daily notification check
  const checkAndNotify = useCallback(() => {
    if (!notifSettings.enabled || notifSettings.permission !== "granted") return;
    const now = new Date();
    const dayOfWeek = now.getDay();
    if (!notifSettings.reminderDays.includes(dayOfWeek)) return;

    const [h, m] = notifSettings.reminderTime.split(":").map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(h, m - notifSettings.advanceMinutes, 0, 0);

    const diff = Math.abs(now.getTime() - targetTime.getTime());
    if (diff < 60000) { // within 1 minute
      const todayStr = formatDate(now);
      const todaySchedules = schedules.filter(s => s.scheduledDate === todayStr && !s.completed);
      if (todaySchedules.length > 0) {
        new Notification("Nhắc nhở ôn tập EPS", {
          body: `Bạn có ${todaySchedules.length} bài cần ôn hôm nay. Hãy học ngay!`,
          icon: "/images/brand/logo.svg",
        });
      }
    }
  }, [notifSettings, schedules]);

  useEffect(() => {
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [checkAndNotify]);

  // Auto-generate smart review schedule based on completed lessons
  const autoSchedule = useMemo(() => {
    const completed = Object.entries(completedLessons).map(([id, data]) => ({
      lessonId: Number(id),
      completedAt: data.completedAt,
    }));

    const suggestions: { lessonId: number; date: string; reason: string }[] = [];
    const todayStr = formatDate(today);

    completed.forEach(({ lessonId, completedAt }) => {
      const completedDate = new Date(completedAt);
      // Spaced repetition: review after 1, 3, 7, 14, 30 days
      [1, 3, 7, 14, 30].forEach(days => {
        const reviewDate = formatDate(addDays(completedDate, days));
        if (reviewDate >= todayStr) {
          const alreadyScheduled = schedules.some(s => s.lessonId === lessonId && s.scheduledDate === reviewDate);
          if (!alreadyScheduled) {
            suggestions.push({
              lessonId,
              date: reviewDate,
              reason: `Ôn lại sau ${days} ngày`,
            });
          }
        }
      });
    });

    return suggestions.slice(0, 20);
  }, [completedLessons, schedules]);

  // Group schedules by date
  const scheduleByDate = useMemo(() => {
    const map: Record<string, ScheduledLesson[]> = {};
    schedules.forEach(s => {
      if (!map[s.scheduledDate]) map[s.scheduledDate] = [];
      map[s.scheduledDate].push(s);
    });
    return map;
  }, [schedules]);

  const handleAddLesson = (lesson: ScheduledLesson) => {
    setSchedules(prev => [...prev, lesson]);
  };

  const handleToggleComplete = (date: string, lessonId: number) => {
    setSchedules(prev => prev.map(s =>
      s.scheduledDate === date && s.lessonId === lessonId
        ? { ...s, completed: !s.completed }
        : s
    ));
  };

  const handleRemove = (date: string, lessonId: number) => {
    setSchedules(prev => prev.filter(s => !(s.scheduledDate === date && s.lessonId === lessonId)));
  };

  const handleAddAutoSuggestion = (suggestion: { lessonId: number; date: string; reason: string }) => {
    const newSchedule: ScheduledLesson = {
      lessonId: suggestion.lessonId,
      scheduledDate: suggestion.date,
      note: suggestion.reason,
      reminded: false,
      completed: false,
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  // Calendar data
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(today);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  };

  // Stats
  const totalScheduled = schedules.length;
  const totalCompleted = schedules.filter(s => s.completed).length;
  const todaySchedules = scheduleByDate[todayStr] || [];
  const upcomingCount = schedules.filter(s => s.scheduledDate > todayStr && !s.completed).length;

  const selectedSchedules = selectedDate ? (scheduleByDate[selectedDate] || []) : [];

  return (
    <DashboardLayout
      title="Lịch ôn tập"
      subtitle="Lên lịch ôn bài theo ngày với nhắc nhở thông minh — dựa trên phương pháp lặp lại ngắt quãng"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Tổng lịch ôn", value: totalScheduled, icon: "ri-calendar-line", color: "app-accent-primary" },
          { label: "Đã hoàn thành", value: totalCompleted, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Hôm nay", value: todaySchedules.length, icon: "ri-sun-line", color: "#fb923c" },
          { label: "Sắp tới", value: upcomingCount, icon: "ri-time-line", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-3 md:p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Calendar */}
        <div className="space-y-4">
          {/* Calendar header */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-app-text-secondary hover:text-white/70 cursor-pointer transition-colors">
                <i className="ri-arrow-left-s-line text-lg"></i>
              </button>
              <h2 className="text-white font-bold text-base">{MONTHS_VI[currentMonth]} {currentYear}</h2>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-app-text-secondary hover:text-white/70 cursor-pointer transition-colors">
                <i className="ri-arrow-right-s-line text-lg"></i>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-app-text-muted text-xs font-semibold py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const daySchedules = scheduleByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const isPast = dateStr < todayStr;
                const completedCount = daySchedules.filter(s => s.completed).length;
                const allDone = daySchedules.length > 0 && completedCount === daySchedules.length;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-app-accent-primary text-app-bg"
                        : isToday
                        ? "border border-app-accent-primary/40 text-app-accent-primary"
                        : isPast
                        ? "text-app-text-muted hover:bg-app-surface/50"
                        : "text-white/60 hover:bg-app-card/50"
                    }`}
                  >
                    <span>{day}</span>
                    {daySchedules.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {daySchedules.slice(0, 3).map((_, di) => (
                          <div
                            key={di}
                            className={`w-1 h-1 rounded-full ${
                              isSelected
                                ? "bg-app-bg/50"
                                : allDone
                                ? "bg-emerald-400"
                                : "bg-app-accent-primary"
                            }`}
                          />
                        ))}
                        {daySchedules.length > 3 && (
                          <span className={`text-[8px] ${isSelected ? "text-app-bg/50" : "text-app-text-muted"}`}>+</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-app-border">
              <div className="flex items-center gap-1.5 text-xs text-app-text-muted">
                <div className="w-2 h-2 rounded-full bg-app-accent-primary"></div>
                Có lịch ôn
              </div>
              <div className="flex items-center gap-1.5 text-xs text-app-text-muted">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Đã hoàn thành
              </div>
              <div className="flex items-center gap-1.5 text-xs text-app-text-muted">
                <div className="w-2 h-2 rounded-full border border-app-accent-primary/40"></div>
                Hôm nay
              </div>
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDate && (
            <DayDetailPanel
              date={selectedDate}
              schedules={selectedSchedules}
              onClose={() => setSelectedDate(null)}
              onAdd={() => { setAddModalDate(selectedDate); setShowAddModal(true); }}
              onToggleComplete={(lessonId) => handleToggleComplete(selectedDate, lessonId)}
              onRemove={(lessonId) => handleRemove(selectedDate, lessonId)}
            />
          )}

          {/* Today's schedule if no date selected */}
          {!selectedDate && todaySchedules.length > 0 && (
            <div className="bg-app-bg border border-app-accent-primary/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-sun-line text-app-accent-primary"></i>
                <p className="text-white font-semibold text-sm">Lịch ôn hôm nay</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">{todaySchedules.length} bài</span>
              </div>
              <div className="space-y-2">
                {todaySchedules.map(s => {
                  const lesson = epsLessons.find(l => l.id === s.lessonId);
                  if (!lesson) return null;
                  return (
                    <div key={s.lessonId} className={`flex items-center gap-3 p-3 rounded-xl border ${s.completed ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-white/2"}`}>
                      <button
                        onClick={() => handleToggleComplete(todayStr, s.lessonId)}
                        className={`w-5 h-5 flex items-center justify-center rounded-md border flex-shrink-0 cursor-pointer transition-colors ${s.completed ? "border-emerald-500/50 bg-emerald-500/20 text-app-accent-success" : "border-white/20 hover:border-white/40"}`}
                      >
                        {s.completed && <i className="ri-check-line text-xs"></i>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${s.completed ? "text-app-text-secondary line-through" : "text-white/80"}`}>
                          Bài {lesson.id}: {lesson.titleVi}
                        </p>
                        {s.note && <p className="text-app-text-muted text-xs">{s.note}</p>}
                      </div>
                      {s.completed && <i className="ri-checkbox-circle-fill text-app-accent-success flex-shrink-0"></i>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Smart suggestions + upcoming */}
        <div className="space-y-4">
          {/* Quick add */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-white font-semibold text-sm mb-3">Thêm lịch ôn nhanh</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              {["Hôm nay", "Ngày mai", "Tuần sau"].map((label, i) => {
                const d = addDays(today, i === 0 ? 0 : i === 1 ? 1 : 7);
                const dateStr = formatDate(d);
                return (
                  <button
                    key={label}
                    onClick={() => { setAddModalDate(dateStr); setShowAddModal(true); }}
                    className="py-2 rounded-lg border border-app-border bg-white/2 hover:border-app-accent-primary/30 hover:bg-app-accent-primary/5 text-white/50 hover:text-app-accent-primary text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {selectedDate && (
              <button
                onClick={() => { setAddModalDate(selectedDate); setShowAddModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-app-accent-primary/25 bg-app-accent-primary/5 hover:bg-app-accent-primary/10 text-app-accent-primary text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                Thêm vào ngày đã chọn
              </button>
            )}
          </div>

          {/* Smart suggestions */}
          {autoSchedule.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-magic-line text-[#a78bfa] text-sm"></i>
                <p className="text-white font-semibold text-sm">Gợi ý ôn tập thông minh</p>
              </div>
              <p className="text-app-text-muted text-xs mb-3">Dựa trên lịch sử học — phương pháp lặp lại ngắt quãng</p>
              <div className="space-y-2">
                {autoSchedule.slice(0, 5).map((s, i) => {
                  const lesson = epsLessons.find(l => l.id === s.lessonId);
                  if (!lesson) return null;
                  const d = parseDate(s.date);
                  const dateLabel = s.date === todayStr ? "Hôm nay" : s.date === formatDate(addDays(today, 1)) ? "Ngày mai" : `${d.getDate()}/${d.getMonth() + 1}`;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-app-border bg-white/2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-medium truncate">Bài {lesson.id}: {lesson.titleVi}</p>
                        <p className="text-app-text-muted text-[10px] mt-0.5">{s.reason} — {dateLabel}</p>
                      </div>
                      <button
                        onClick={() => handleAddAutoSuggestion(s)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#a78bfa] cursor-pointer transition-colors flex-shrink-0"
                      >
                        <i className="ri-add-line text-xs"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming schedule */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-white font-semibold text-sm mb-3">Lịch ôn sắp tới</p>
            {schedules.filter(s => s.scheduledDate >= todayStr && !s.completed).length === 0 ? (
              <div className="text-center py-6">
                <i className="ri-calendar-check-line text-app-text-muted text-2xl block mb-2"></i>
                <p className="text-app-text-muted text-sm">Chưa có lịch ôn sắp tới</p>
                <p className="text-app-text-muted text-xs mt-1">Thêm bài ôn tập vào lịch</p>
              </div>
            ) : (
              <div className="space-y-2">
                {schedules
                  .filter(s => s.scheduledDate >= todayStr && !s.completed)
                  .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
                  .slice(0, 8)
                  .map((s, i) => {
                    const lesson = epsLessons.find(l => l.id === s.lessonId);
                    if (!lesson) return null;
                    const d = parseDate(s.scheduledDate);
                    const isToday = s.scheduledDate === todayStr;
                    const isTomorrow = s.scheduledDate === formatDate(addDays(today, 1));
                    const dateLabel = isToday ? "Hôm nay" : isTomorrow ? "Ngày mai" : `${d.getDate()}/${d.getMonth() + 1}`;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-app-border bg-white/2">
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isToday ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted"}`}>
                          {dateLabel}
                        </div>
                        <p className="text-white/60 text-xs flex-1 truncate">Bài {lesson.id}: {lesson.titleVi}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Notification Panel */}
          <NotificationPanel
            settings={notifSettings}
            onUpdate={setNotifSettings}
          />

          {/* Tips */}
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
            <p className="text-app-accent-primary text-xs font-semibold mb-2">Phương pháp lặp lại ngắt quãng</p>
            <div className="space-y-1.5">
              {[
                { day: "Ngày 1", desc: "Học bài mới" },
                { day: "Ngày 2", desc: "Ôn lại lần 1" },
                { day: "Ngày 4", desc: "Ôn lại lần 2" },
                { day: "Ngày 8", desc: "Ôn lại lần 3" },
                { day: "Ngày 15", desc: "Ôn lại lần 4" },
                { day: "Ngày 31", desc: "Ôn lại lần 5" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-app-accent-primary font-bold w-14 flex-shrink-0">{t.day}</span>
                  <span className="text-app-text-secondary">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showAddModal && (
        <AddLessonModal
          date={addModalDate}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddLesson}
          existingIds={(scheduleByDate[addModalDate] || []).map(s => s.lessonId)}
        />
      )}
    </DashboardLayout>
  );
}

