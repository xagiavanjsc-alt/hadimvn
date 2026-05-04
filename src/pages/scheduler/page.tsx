import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ScheduleConfig {
  enabled: boolean;
  dayOfWeek: number; // 0=Sun, 1=Mon...
  hour: number;
  minute: number;
  notifyBrowser: boolean;
  notifySound: boolean;
  lastRun: string | null;
  nextRun: string | null;
  runCount: number;
}

interface ScanLog {
  id: string;
  runAt: string;
  status: "success" | "error" | "skipped";
  newSongs: number;
  message: string;
}

const DEFAULT_CONFIG: ScheduleConfig = {
  enabled: false,
  dayOfWeek: 1, // Monday
  hour: 9,
  minute: 0,
  notifyBrowser: true,
  notifySound: false,
  lastRun: null,
  nextRun: null,
  runCount: 0,
};

const DAY_NAMES = ["Ch? nh?t", "Th? Hai", "Th? Ba", "Th? Tu", "Th? Nam", "Th? Sáu", "Th? B?y"];
const DAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function calcNextRun(config: ScheduleConfig): Date {
  const now = new Date();
  const next = new Date();
  next.setHours(config.hour, config.minute, 0, 0);
  const dayDiff = (config.dayOfWeek - now.getDay() + 7) % 7;
  next.setDate(now.getDate() + (dayDiff === 0 && next <= now ? 7 : dayDiff));
  return next;
}

function formatRelative(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  const prefix = diff > 0 ? "còn " : "";
  const suffix = diff < 0 ? " tru?c" : "";
  if (days > 0) return `${prefix}${days} ngày${suffix}`;
  if (hours > 0) return `${prefix}${hours} gi?${suffix}`;
  return `${prefix}${mins} phút${suffix}`;
}

const MOCK_LOGS: ScanLog[] = [
  { id: "1", runAt: new Date(Date.now() - 7 * 86400000).toISOString(), status: "success", newSongs: 12, message: "Tìm th?y 12 bài m?i trong top 100 Melon" },
  { id: "2", runAt: new Date(Date.now() - 14 * 86400000).toISOString(), status: "success", newSongs: 8, message: "Tìm th?y 8 bài m?i, 3 bài dã có trong h? th?ng" },
  { id: "3", runAt: new Date(Date.now() - 21 * 86400000).toISOString(), status: "error", newSongs: 0, message: "L?i k?t n?i Apify — Actor timeout sau 120s" },
  { id: "4", runAt: new Date(Date.now() - 28 * 86400000).toISOString(), status: "success", newSongs: 15, message: "Tìm th?y 15 bài m?i, chart tu?n này có nhi?u thay d?i" },
];

export default function SchedulerPage() {
  const [config, setConfig] = useLocalStorage<ScheduleConfig>("kts_scheduler_config", DEFAULT_CONFIG);
  const [logs] = useLocalStorage<ScanLog[]>("kts_scheduler_logs", MOCK_LOGS);
  const [notifPermission, setNotifPermission] = useState<"default" | "granted" | "denied">("default");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Countdown to next run
  useEffect(() => {
    if (!config.enabled || !config.nextRun) return;
    const interval = setInterval(() => {
      const diff = new Date(config.nextRun!).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Ðang ch?y...");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (days > 0) setCountdown(`${days}d ${hours}h ${mins}m`);
      else setCountdown(`${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [config.enabled, config.nextRun]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const requestNotifPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") showToast("Ðã b?t thông báo trình duy?t!");
  }, []);

  const handleSave = () => {
    setSaving(true);
    const nextRun = calcNextRun(config);
    setConfig((prev) => ({ ...prev, nextRun: nextRun.toISOString() }));
    setTimeout(() => {
      setSaving(false);
      showToast("Ðã luu l?ch quét!");
    }, 600);
  };

  const handleToggle = () => {
    const nextEnabled = !config.enabled;
    const nextRun = nextEnabled ? calcNextRun(config).toISOString() : null;
    setConfig((prev) => ({ ...prev, enabled: nextEnabled, nextRun }));
    showToast(nextEnabled ? "Ðã b?t l?ch quét t? d?ng" : "Ðã t?t l?ch quét");
  };

  const handleTestRun = () => {
    setTestRunning(true);
    setTimeout(() => {
      setTestRunning(false);
      showToast("Test thành công! Thông báo s? hi?n khi có bài m?i.");
      if (notifPermission === "granted") {
        new Notification("Hàn Vi?t KTS — Test thông báo", {
          body: "L?ch quét Melon ho?t d?ng bình thu?ng. S? thông báo khi có bài m?i!",
          icon: "https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png",
        });
      }
    }, 2000);
  };

  const nextRunDate = config.nextRun ? new Date(config.nextRun) : null;

  return (
    <DashboardLayout
      title="Lên l?ch quét t? d?ng"
      subtitle="T? d?ng quét Melon Top 100 theo l?ch d?t s?n"
      actions={
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            config.enabled
              ? "bg-emerald-500/10 border-emerald-500/25 text-app-accent-success"
              : "bg-app-card/50 border-app-border text-app-text-secondary"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.enabled ? "bg-emerald-400 animate-pulse" : "bg-app-border/200"}`}></div>
            {config.enabled ? "Ðang ho?t d?ng" : "Ðã t?t"}
          </div>
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              config.enabled
                ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25"
                : "bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg"
            }`}
          >
            <i className={config.enabled ? "ri-pause-circle-line" : "ri-play-circle-line"}></i>
            {config.enabled ? "T?t l?ch" : "B?t l?ch"}
          </button>
        </div>
      }
    >
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white">
          <i className="ri-checkbox-circle-line"></i>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Left: Config */}
        <div className="col-span-2 space-y-4">
          {/* Next run banner */}
          {config.enabled && nextRunDate && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-xl flex-shrink-0">
                <i className="ri-timer-line text-app-accent-success text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="text-app-accent-success font-semibold text-sm">L?n quét ti?p theo</p>
                <p className="text-white/60 text-xs mt-0.5">
                  {DAY_NAMES[nextRunDate.getDay()]}, {nextRunDate.toLocaleDateString("vi-VN")} lúc {nextRunDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-app-accent-success font-bold text-lg font-mono">{countdown}</p>
                <p className="text-app-text-muted text-[10px]">còn l?i</p>
              </div>
            </div>
          )}

          {/* Schedule config */}
          <div className="bg-app-bg border border-app-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
                <i className="ri-calendar-schedule-line text-app-accent-primary text-base"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">C?u hình l?ch</h3>
                <p className="text-app-text-secondary text-xs">Ch?n ngày và gi? quét t? d?ng</p>
              </div>
            </div>

            {/* Day of week */}
            <div className="mb-5">
              <p className="text-app-text-secondary text-xs tracking-normal mb-3">Ngày trong tu?n</p>
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_SHORT.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setConfig((prev) => ({ ...prev, dayOfWeek: i }))}
                    className={`flex flex-col items-center py-2.5 rounded-xl transition-all cursor-pointer ${
                      config.dayOfWeek === i
                        ? "bg-app-accent-primary text-app-bg"
                        : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70 hover:text-white/70"
                    }`}
                  >
                    <span className="text-xs font-bold">{day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="mb-5">
              <p className="text-app-text-secondary text-xs tracking-normal mb-3">Gi? quét</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-app-text-muted text-[10px] mb-1.5 block">Gi?</label>
                  <select
                    value={config.hour}
                    onChange={(e) => setConfig((prev) => ({ ...prev, hour: Number(e.target.value) }))}
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} className="bg-app-bg">
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-app-text-muted text-[10px] mb-1.5 block">Phút</label>
                  <select
                    value={config.minute}
                    onChange={(e) => setConfig((prev) => ({ ...prev, minute: Number(e.target.value) }))}
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m} className="bg-app-bg">
                        :{String(m).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-app-text-muted text-[10px] mb-1.5 block">Preview</label>
                  <div className="bg-app-surface/50 border border-app-border rounded-lg px-3 py-2.5 text-app-accent-primary text-sm font-mono">
                    {DAY_SHORT[config.dayOfWeek]} {String(config.hour).padStart(2, "0")}:{String(config.minute).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="mb-5">
              <p className="text-app-text-secondary text-xs tracking-normal mb-3">Thông báo khi có bài m?i</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-app-surface/50 border border-app-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center bg-sky-500/10 rounded-lg">
                      <i className="ri-notification-3-line text-sky-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Thông báo trình duy?t</p>
                      <p className="text-app-text-muted text-xs">
                        {notifPermission === "granted"
                          ? "Ðã c?p quy?n"
                          : notifPermission === "denied"
                          ? "B? t? ch?i — vào cài d?t trình duy?t d? b?t"
                          : "Chua c?p quy?n"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifPermission !== "granted" && notifPermission !== "denied" && (
                      <button
                        onClick={requestNotifPermission}
                        className="text-sky-400 text-xs hover:text-sky-300 cursor-pointer underline underline-offset-2 whitespace-nowrap"
                      >
                        C?p quy?n
                      </button>
                    )}
                    <button
                      onClick={() => setConfig((prev) => ({ ...prev, notifyBrowser: !prev.notifyBrowser }))}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                        config.notifyBrowser && notifPermission === "granted" ? "bg-sky-500" : "bg-app-card/70"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        config.notifyBrowser && notifPermission === "granted" ? "left-5" : "left-0.5"
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-50 text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                Luu c?u hình
              </button>
              <button
                onClick={handleTestRun}
                disabled={testRunning}
                className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 disabled:opacity-50 text-white/60 text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                {testRunning ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-test-tube-line"></i>}
                Test thông báo
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-app-bg border border-app-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-information-line text-app-text-muted text-sm"></i>
              <p className="text-app-text-secondary text-xs tracking-normal">Cách ho?t d?ng</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: "ri-calendar-check-line", color: "text-app-accent-primary", title: "L?ch du?c luu local", desc: "L?ch quét luu trong trình duy?t — c?n m? tab KTS dúng gi? d? kích ho?t" },
                { icon: "ri-notification-3-line", color: "text-sky-400", title: "Thông báo bài m?i", desc: "Khi phát hi?n bài m?i trong top 100 Melon, trình duy?t s? hi?n thông báo ngay" },
                { icon: "ri-history-line", color: "text-app-accent-success", title: "L?ch s? quét", desc: "M?i l?n quét du?c ghi l?i — xem bao nhiêu bài m?i m?i tu?n" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-7 h-7 flex items-center justify-center bg-app-card/50 rounded-lg flex-shrink-0 mt-0.5">
                    <i className={`${item.icon} ${item.color} text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">{item.title}</p>
                    <p className="text-app-text-muted text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats + logs */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-app-bg border border-app-border rounded-xl p-4">
            <p className="text-app-text-muted text-[10px] tracking-normal mb-4">Th?ng kê</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">T?ng l?n quét</span>
                <span className="text-white/80 font-bold text-sm">{config.runCount + logs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Thành công</span>
                <span className="text-app-accent-success font-bold text-sm">{logs.filter((l) => l.status === "success").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">L?i</span>
                <span className="text-red-400 font-bold text-sm">{logs.filter((l) => l.status === "error").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Bài m?i tìm du?c</span>
                <span className="text-app-accent-primary font-bold text-sm">
                  {logs.reduce((sum, l) => sum + l.newSongs, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Scan logs */}
          <div className="bg-app-bg border border-app-border rounded-xl p-4">
            <p className="text-app-text-muted text-[10px] tracking-normal mb-3">L?ch s? quét</p>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-app-text-muted text-xs text-center py-4">Chua có l?ch s?</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={`rounded-lg px-3 py-2.5 border ${
                    log.status === "success"
                      ? "bg-emerald-500/5 border-emerald-500/15"
                      : log.status === "error"
                      ? "bg-red-500/5 border-red-500/15"
                      : "bg-app-surface/50 border-app-border"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <i className={`text-[10px] ${
                          log.status === "success" ? "ri-checkbox-circle-fill text-app-accent-success" :
                          log.status === "error" ? "ri-error-warning-fill text-red-400" :
                          "ri-skip-forward-fill text-app-text-muted"
                        }`}></i>
                        <span className={`text-[10px] font-medium ${
                          log.status === "success" ? "text-app-accent-success" :
                          log.status === "error" ? "text-red-400" : "text-app-text-muted"
                        }`}>
                          {log.status === "success" ? `+${log.newSongs} bài m?i` : log.status === "error" ? "L?i" : "B? qua"}
                        </span>
                      </div>
                      <span className="text-app-text-muted text-[9px]">{formatRelative(log.runAt)}</span>
                    </div>
                    <p className="text-white/35 text-[10px] leading-relaxed">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

