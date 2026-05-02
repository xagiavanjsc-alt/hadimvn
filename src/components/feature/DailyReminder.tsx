import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ReminderSettings {
  enabled: boolean;
  time: string;
  topics: string[];
  dismissedDate: string;
  emailRegistered: boolean;
  email: string;
}

const STUDY_TOPICS = [
  { id: "eps", label: "EPS-TOPIK", icon: "ri-file-list-3-line", color: "app-accent-primary" },
  { id: "topik1", label: "TOPIK I", icon: "ri-book-2-line", color: "#10b981" },
  { id: "topik2", label: "TOPIK II", icon: "ri-book-3-line", color: "#7c3aed" },
  { id: "vocab", label: "Từ vựng", icon: "ri-translate-2", color: "#f59e0b" },
  { id: "grammar", label: "Ngữ pháp", icon: "ri-edit-line", color: "#ec4899" },
  { id: "listening", label: "Nghe hiểu", icon: "ri-headphone-line", color: "#0d9488" },
];

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  time: "20:00",
  topics: ["eps", "topik1"],
  dismissedDate: "",
  emailRegistered: false,
  email: "",
};

export default function DailyReminder() {
  const navigate = useNavigate();
  const [streak] = useLocalStorage<{ count: number; lastDate: string }>("kts_streak", { count: 0, lastDate: "" });
  const [settings, setSettings] = useLocalStorage<ReminderSettings>("kts_reminder_v2", DEFAULT_SETTINGS);
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localTime, setLocalTime] = useState(settings.time);
  const [localTopics, setLocalTopics] = useState<string[]>(settings.topics);
  const [emailInput, setEmailInput] = useState(settings.email);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const studiedToday = streak.lastDate === today;
  const missedYesterday = streak.lastDate !== today && streak.lastDate !== new Date(Date.now() - 86400000).toISOString().split("T")[0];

  useEffect(() => {
    if (!settings.enabled) return;
    if (studiedToday) return;
    if (settings.dismissedDate === today) return;

    // Check if current time is past reminder time
    const now = new Date();
    const [rh, rm] = settings.time.split(":").map(Number);
    const reminderMinutes = rh * 60 + rm;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const delay = nowMinutes >= reminderMinutes ? 1500 : (reminderMinutes - nowMinutes) * 60 * 1000;
    const timer = setTimeout(() => setVisible(true), Math.min(delay, 3000));
    return () => clearTimeout(timer);
  }, [settings, studiedToday, today]);

  const handleDismiss = () => {
    setSettings({ ...settings, dismissedDate: today });
    setVisible(false);
  };

  const handleSaveSettings = () => {
    setSettings({ ...settings, time: localTime, topics: localTopics });
    setShowSettings(false);
  };

  const toggleTopic = (id: string) => {
    setLocalTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new URLSearchParams();
    data.append("email", emailInput);
    data.append("reminder_time", settings.time);
    data.append("topics", settings.topics.join(", "));
    data.append("streak", String(streak.count));
    try {
      await fetch("https://readdy.ai/api/form/d7ev5deivmjfhtdrfkd0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
    } catch {
      // silent
    }
    setSettings({ ...settings, emailRegistered: true, email: emailInput });
    setEmailSubmitted(true);
    setTimeout(() => {
      setShowEmailForm(false);
    }, 2000);
  };

  if (!visible) return null;

  const topicLabels = settings.topics
    .map(id => STUDY_TOPICS.find(t => t.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
      <div className="bg-[#13161e] border border-white/12 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between ${missedYesterday ? "bg-[#f87171]/8 border-b border-[#f87171]/15" : "bg-app-accent-primary/8 border-b border-app-accent-primary/15"}`}>
          <div className="flex items-center gap-2">
            <i className={`text-base ${missedYesterday ? "ri-alarm-warning-line text-[#f87171]" : "ri-notification-3-line text-app-accent-primary"}`}></i>
            <span className={`text-sm font-semibold ${missedYesterday ? "text-[#f87171]" : "text-app-accent-primary"}`}>
              {missedYesterday ? "Streak có nguy cơ bị mất!" : "Nhắc học hôm nay"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/60 cursor-pointer transition-colors"
            >
              <i className="ri-settings-3-line text-sm"></i>
            </button>
            <button onClick={handleDismiss} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/60 cursor-pointer transition-colors">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings ? (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-white/50 text-xs mb-2 block">Giờ nhắc học hàng ngày</label>
              <input
                type="time"
                value={localTime}
                onChange={e => setLocalTime(e.target.value)}
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary/40"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-2 block">Chủ đề muốn nhắc</label>
              <div className="grid grid-cols-2 gap-2">
                {STUDY_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      localTopics.includes(topic.id)
                        ? "border-app-accent-primary/40 bg-app-accent-primary/10 text-app-accent-primary"
                        : "border-app-border bg-app-surface/50 text-app-text-secondary hover:bg-white/6"
                    }`}
                  >
                    <i className={`${topic.icon} text-sm`} style={{ color: localTopics.includes(topic.id) ? topic.color : undefined }}></i>
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-app-accent-primary text-[#0a0c10] font-semibold py-2 rounded-lg text-xs hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer"
              >
                Lưu cài đặt
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 bg-app-card/50 text-white/50 rounded-lg text-xs hover:bg-white/8 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : showEmailForm ? (
          <div className="p-4">
            {emailSubmitted ? (
              <div className="text-center py-3">
                <i className="ri-check-double-line text-[#4ade80] text-2xl mb-2 block"></i>
                <p className="text-white font-semibold text-sm">Đã đăng ký!</p>
                <p className="text-white/50 text-xs mt-1">Nhắc nhở lúc {settings.time} mỗi ngày</p>
              </div>
            ) : (
              <form data-readdy-form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Email nhận nhắc nhở</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/40"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-app-accent-primary text-[#0a0c10] font-semibold py-2 rounded-lg text-xs hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer">
                    Đăng ký
                  </button>
                  <button type="button" onClick={() => setShowEmailForm(false)} className="px-3 bg-app-card/50 text-white/50 rounded-lg text-xs hover:bg-white/8 transition-colors cursor-pointer">
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Main body */
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-app-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-fire-line text-app-accent-primary text-lg"></i>
              </div>
              <div>
                <p className="text-white text-sm font-medium mb-0.5">
                  {missedYesterday ? `Streak ${streak.count} ngày sắp bị reset!` : "Bạn chưa học hôm nay"}
                </p>
                <p className="text-white/50 text-xs leading-relaxed">
                  {missedYesterday
                    ? "Học ngay để giữ streak. Chỉ cần 10 phút thôi!"
                    : `Hôm nay ôn: ${topicLabels || "EPS, TOPIK"}. Học 15 phút để duy trì thói quen.`}
                </p>
              </div>
            </div>

            {/* Topic quick links */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {settings.topics.map(id => {
                const topic = STUDY_TOPICS.find(t => t.id === id);
                if (!topic) return null;
                const routes: Record<string, string> = {
                  eps: "/eps",
                  topik1: "/topik-test",
                  topik2: "/topik2-test",
                  vocab: "/vocabulary",
                  grammar: "/grammar",
                  listening: "/eps-listening",
                };
                return (
                  <button
                    key={id}
                    onClick={() => navigate(routes[id] || "/dashboard")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-all hover:opacity-80"
                    style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                  >
                    <i className={`${topic.icon} text-[10px]`}></i>
                    {topic.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => navigate("/daily-plan")}
                className="flex-1 bg-app-accent-primary text-[#0a0c10] font-semibold py-2 rounded-lg text-xs hover:bg-[#f0d060] transition-colors whitespace-nowrap cursor-pointer"
              >
                Học ngay
              </button>
              {!settings.emailRegistered ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex-1 bg-app-card/50 text-white/60 py-2 rounded-lg text-xs hover:bg-white/8 transition-colors whitespace-nowrap cursor-pointer border border-app-border"
                >
                  Nhắc qua email
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2">
                  <i className="ri-check-line text-app-accent-success text-xs"></i>
                  <span className="text-app-accent-success text-[10px]">Đã đăng ký</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-app-text-muted text-[10px]">
                Nhắc lúc {settings.time} · {settings.topics.length} chủ đề
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="text-app-text-muted text-[10px] hover:text-white/60 cursor-pointer flex items-center gap-1"
              >
                <i className="ri-settings-3-line text-[10px]"></i>
                Cài đặt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
