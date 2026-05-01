import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM"
  days: number[]; // 0=Sun, 1=Mon...6=Sat
  message: string;
  sound: boolean;
  type: "study" | "streak" | "challenge" | "custom";
}

interface ReminderLog {
  id: string;
  sentAt: string;
  message: string;
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAY_FULL = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const PRESET_MESSAGES = [
  "⏰ Đến giờ học tiếng Hàn rồi! Hãy duy trì streak của bạn nhé!",
  "🔥 Streak đang chờ bạn! Học 10 phút hôm nay để không mất streak!",
  "📚 Bạn có 10 từ vựng mới cần học hôm nay. Bắt đầu thôi!",
  "🏆 Thử thách tuần này chưa hoàn thành. Vào học ngay nào!",
  "✨ Chỉ cần 15 phút mỗi ngày để thành thạo tiếng Hàn!",
];

const REMINDER_TYPES = [
  { id: "study", label: "Học tập chung", icon: "ri-book-open-line", color: "#e8c84a", desc: "Nhắc nhở học bài hàng ngày" },
  { id: "streak", label: "Duy trì Streak", icon: "ri-fire-line", color: "#fb923c", desc: "Nhắc trước khi mất streak" },
  { id: "challenge", label: "Thử thách tuần", icon: "ri-trophy-line", color: "#34d399", desc: "Nhắc hoàn thành thử thách" },
  { id: "custom", label: "Tùy chỉnh", icon: "ri-settings-3-line", color: "#a78bfa", desc: "Tự đặt nội dung nhắc nhở" },
];

const DEFAULT_REMINDERS: ReminderConfig[] = [
  { enabled: true, time: "08:00", days: [1, 2, 3, 4, 5], message: PRESET_MESSAGES[0], sound: true, type: "study" },
  { enabled: false, time: "20:00", days: [0, 1, 2, 3, 4, 5, 6], message: PRESET_MESSAGES[1], sound: true, type: "streak" },
];

function requestNotificationPermission(): Promise<string> {
  if (!("Notification" in window)) return Promise.resolve("denied");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  return Notification.requestPermission();
}

function sendTestNotification(message: string) {
  if (Notification.permission !== "granted") return;
  new Notification("Hàn Quốc Ơi! 🇰🇷", {
    body: message,
    icon: "https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png",
    badge: "https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png",
    tag: "study-reminder",
  });
}

// Schedule next notification using setTimeout (browser-based, works while tab is open)
function scheduleNextNotification(reminders: ReminderConfig[]) {
  const now = new Date();
  const todayDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let soonestMs = Infinity;
  let soonestMsg = "";

  reminders.filter(r => r.enabled).forEach(r => {
    const [h, m] = r.time.split(":").map(Number);
    const reminderMinutes = h * 60 + m;

    // Check today
    if (r.days.includes(todayDay) && reminderMinutes > currentMinutes) {
      const ms = (reminderMinutes - currentMinutes) * 60 * 1000;
      if (ms < soonestMs) { soonestMs = ms; soonestMsg = r.message; }
    }

    // Check next 7 days
    for (let d = 1; d <= 7; d++) {
      const nextDay = (todayDay + d) % 7;
      if (r.days.includes(nextDay)) {
        const ms = d * 24 * 60 * 60 * 1000 + (reminderMinutes - currentMinutes) * 60 * 1000;
        if (ms < soonestMs) { soonestMs = ms; soonestMsg = r.message; }
        break;
      }
    }
  });

  if (soonestMs !== Infinity && soonestMs > 0 && soonestMs < 24 * 60 * 60 * 1000) {
    return { ms: soonestMs, msg: soonestMsg };
  }
  return null;
}

function ReminderCard({
  reminder,
  index,
  onChange,
  onDelete,
  onTest,
}: {
  reminder: ReminderConfig;
  index: number;
  onChange: (idx: number, r: ReminderConfig) => void;
  onDelete: (idx: number) => void;
  onTest: (msg: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = REMINDER_TYPES.find(t => t.id === reminder.type) || REMINDER_TYPES[0];

  const toggleDay = (day: number) => {
    const days = reminder.days.includes(day)
      ? reminder.days.filter(d => d !== day)
      : [...reminder.days, day].sort();
    onChange(index, { ...reminder, days });
  };

  return (
    <div className={`bg-[#0f1117] border rounded-2xl overflow-hidden transition-all ${reminder.enabled ? "border-white/8" : "border-white/3 opacity-60"}`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-5">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${typeInfo.color}15` }}>
          <i className={`${typeInfo.icon} text-lg`} style={{ color: typeInfo.color }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-semibold text-sm">{typeInfo.label}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
              {reminder.time}
            </span>
          </div>
          <p className="text-white/30 text-xs truncate">{reminder.message}</p>
          <div className="flex items-center gap-1 mt-1">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className={`text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${reminder.days.includes(i) ? "" : "opacity-20"}`}
                style={{ backgroundColor: reminder.days.includes(i) ? `${typeInfo.color}20` : "rgba(255,255,255,0.05)", color: reminder.days.includes(i) ? typeInfo.color : "rgba(255,255,255,0.3)" }}>
                {d}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onTest(reminder.message)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 cursor-pointer transition-colors"
            title="Gửi thử"
          >
            <i className="ri-send-plane-line text-xs"></i>
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 cursor-pointer transition-colors"
          >
            <i className={`${expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-sm`}></i>
          </button>
          {/* Toggle switch */}
          <button
            onClick={() => onChange(index, { ...reminder, enabled: !reminder.enabled })}
            className={`relative w-10 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${reminder.enabled ? "" : "bg-white/10"}`}
            style={{ backgroundColor: reminder.enabled ? typeInfo.color : undefined }}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${reminder.enabled ? "left-5" : "left-0.5"}`}></div>
          </button>
        </div>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
          {/* Time */}
          <div>
            <label className="text-white/40 text-xs mb-2 block">Giờ nhắc nhở</label>
            <input
              type="time"
              value={reminder.time}
              onChange={e => onChange(index, { ...reminder, time: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/25"
            />
          </div>

          {/* Days */}
          <div>
            <label className="text-white/40 text-xs mb-2 block">Ngày trong tuần</label>
            <div className="flex gap-2">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold cursor-pointer transition-all ${reminder.days.includes(i) ? "" : "bg-white/5 text-white/30 border border-white/8"}`}
                  style={reminder.days.includes(i) ? { backgroundColor: `${typeInfo.color}20`, color: typeInfo.color, border: `1px solid ${typeInfo.color}30` } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-white/40 text-xs mb-2 block">Nội dung thông báo</label>
            <textarea
              value={reminder.message}
              onChange={e => onChange(index, { ...reminder, message: e.target.value })}
              rows={2}
              maxLength={200}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm outline-none focus:border-white/25 resize-none"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {PRESET_MESSAGES.slice(0, 3).map((msg, i) => (
                <button
                  key={i}
                  onClick={() => onChange(index, { ...reminder, message: msg })}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/30 hover:text-white/60 cursor-pointer whitespace-nowrap transition-colors border border-white/8"
                >
                  Mẫu {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-white/40 text-xs mb-2 block">Loại nhắc nhở</label>
            <div className="grid grid-cols-2 gap-2">
              {REMINDER_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => onChange(index, { ...reminder, type: t.id as ReminderConfig["type"] })}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${reminder.type === t.id ? "" : "border-white/5 bg-white/2 hover:bg-white/5"}`}
                  style={reminder.type === t.id ? { backgroundColor: `${t.color}10`, borderColor: `${t.color}25` } : {}}
                >
                  <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                  <span className="text-xs font-medium" style={{ color: reminder.type === t.id ? t.color : "rgba(255,255,255,0.5)" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(index)}
            className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-delete-bin-line"></i>Xóa nhắc nhở này
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudyReminderPage() {
  const [reminders, setReminders] = useLocalStorage<ReminderConfig[]>("kts_reminders", DEFAULT_REMINDERS);
  const [permission, setPermission] = useState<string>(
    "Notification" in window ? Notification.permission : "denied"
  );
  const [testSent, setTestSent] = useState(false);
  const [logs] = useLocalStorage<ReminderLog[]>("kts_reminder_logs", []);
  const [nextReminder, setNextReminder] = useState<{ ms: number; msg: string; label: string } | null>(null);

  // Calculate next scheduled reminder
  useEffect(() => {
    const info = scheduleNextNotification(reminders);
    if (info) {
      const h = Math.floor(info.ms / 3600000);
      const m = Math.floor((info.ms % 3600000) / 60000);
      const label = h > 0 ? `${h} giờ ${m} phút nữa` : `${m} phút nữa`;
      setNextReminder({ ...info, label });

      // Auto-fire notification when time comes (only if tab is open)
      if (permission === "granted") {
        const timer = setTimeout(() => {
          sendTestNotification(info.msg);
        }, info.ms);
        return () => clearTimeout(timer);
      }
    } else {
      setNextReminder(null);
    }
  }, [reminders, permission]);

  const handleRequestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
  }, []);

  const handleTest = useCallback((msg: string) => {
    if (permission !== "granted") {
      handleRequestPermission().then(() => sendTestNotification(msg));
    } else {
      sendTestNotification(msg);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    }
  }, [permission, handleRequestPermission]);

  const handleChange = useCallback((idx: number, r: ReminderConfig) => {
    setReminders(prev => prev.map((item, i) => i === idx ? r : item));
  }, [setReminders]);

  const handleDelete = useCallback((idx: number) => {
    setReminders(prev => prev.filter((_, i) => i !== idx));
  }, [setReminders]);

  const handleAdd = useCallback(() => {
    setReminders(prev => [...prev, {
      enabled: true,
      time: "09:00",
      days: [1, 2, 3, 4, 5],
      message: PRESET_MESSAGES[0],
      sound: true,
      type: "study",
    }]);
  }, [setReminders]);

  const enabledCount = reminders.filter(r => r.enabled).length;

  return (
    <DashboardLayout
      title="Nhắc nhở học tập"
      subtitle="Cài đặt thông báo trình duyệt để không bỏ lỡ buổi học nào"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Permission banner */}
          {permission !== "granted" && (
            <div className="p-5 bg-[#e8c84a]/8 border border-[#e8c84a]/20 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#e8c84a]/15 flex-shrink-0">
                <i className="ri-notification-3-line text-[#e8c84a] text-2xl"></i>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-0.5">Cho phép thông báo trình duyệt</p>
                <p className="text-white/40 text-xs">
                  {permission === "denied"
                    ? "Thông báo bị chặn. Vào cài đặt trình duyệt → Site Settings → Notifications để bật lại."
                    : "Cần cấp quyền để nhận nhắc nhở học tập hàng ngày."}
                </p>
              </div>
              {permission !== "denied" && (
                <button
                  onClick={handleRequestPermission}
                  className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-notification-3-line"></i>Cho phép
                </button>
              )}
            </div>
          )}

          {permission === "granted" && (
            <div className="p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <i className="ri-checkbox-circle-fill text-emerald-400 text-lg"></i>
                <p className="text-emerald-400 text-sm font-medium">Thông báo trình duyệt đã được bật!</p>
                {testSent && <span className="ml-auto text-emerald-400/70 text-xs">Đã gửi thử ✓</span>}
              </div>
              {nextReminder && (
                <div className="flex items-center gap-2 mt-1 pl-7">
                  <i className="ri-time-line text-emerald-400/50 text-xs"></i>
                  <p className="text-emerald-400/60 text-xs">
                    Thông báo tiếp theo: <span className="font-semibold">{nextReminder.label}</span>
                    {" "}(tab phải mở)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reminder list */}
          <div className="space-y-3">
            {reminders.map((r, i) => (
              <ReminderCard
                key={i}
                reminder={r}
                index={i}
                onChange={handleChange}
                onDelete={handleDelete}
                onTest={handleTest}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/15 text-white/40 hover:text-white/60 hover:border-white/25 text-sm cursor-pointer whitespace-nowrap transition-all"
          >
            <i className="ri-add-line text-lg"></i>Thêm nhắc nhở mới
          </button>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Trạng thái</h3>
            <div className="space-y-3">
              {[
                { label: "Tổng nhắc nhở", value: reminders.length, color: "#e8c84a" },
                { label: "Đang bật", value: enabledCount, color: "#34d399" },
                { label: "Đang tắt", value: reminders.length - enabledCount, color: "#f87171" },
                { label: "Quyền thông báo", value: permission === "granted" ? "Đã bật" : "Chưa bật", color: permission === "granted" ? "#34d399" : "#fb923c" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{s.label}</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule preview */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Lịch nhắc nhở tuần này</h3>
            <div className="space-y-2">
              {DAY_FULL.map((day, dayIdx) => {
                const dayReminders = reminders.filter(r => r.enabled && r.days.includes(dayIdx));
                const isToday = new Date().getDay() === dayIdx;
                return (
                  <div key={dayIdx} className={`flex items-center gap-3 p-2 rounded-lg ${isToday ? "bg-[#e8c84a]/8 border border-[#e8c84a]/15" : ""}`}>
                    <span className={`text-xs w-16 ${isToday ? "text-[#e8c84a] font-bold" : "text-white/30"}`}>{day}</span>
                    <div className="flex-1 flex gap-1.5 flex-wrap">
                      {dayReminders.length === 0 ? (
                        <span className="text-white/15 text-[10px]">Không có</span>
                      ) : (
                        dayReminders.map((r, i) => {
                          const typeInfo = REMINDER_TYPES.find(t => t.id === r.type) || REMINDER_TYPES[0];
                          return (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
                              {r.time}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-[#e8c84a] text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Mẹo đặt nhắc nhở</h3>
            </div>
            <div className="space-y-2 text-white/40 text-xs leading-relaxed">
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Đặt nhắc nhở buổi sáng (7–9h) hiệu quả nhất</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Nhắc nhở tối (20–22h) để ôn lại trước khi ngủ</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Bật nhắc nhở Streak để không bao giờ mất chuỗi</p>
              <p><i className="ri-arrow-right-s-line text-[#e8c84a] mr-1"></i>Dùng nút "Gửi thử" để kiểm tra thông báo</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

