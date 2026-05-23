import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface PushSettings {
  enabled: boolean;
  weeklyReport: boolean;
  weeklyReportDay: number;
  weeklyReportHour: number;
  studyReminder: boolean;
  studyReminderHour: number;
  srReminder: boolean;
  srReminderHour: number;
  lastNotified: string;
  lastSRNotified: string;
}

const DEFAULT_SETTINGS: PushSettings = {
  enabled: false,
  weeklyReport: true,
  weeklyReportDay: 1,
  weeklyReportHour: 8,
  studyReminder: true,
  studyReminderHour: 20,
  srReminder: true,
  srReminderHour: 9,
  lastNotified: "",
  lastSRNotified: "",
};

export function useWebPush() {
  const [settings, setSettings] = useLocalStorage<PushSettings>("kts_push_settings", DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<"default" | "granted" | "denied">("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      const result = await Notification.requestPermission() as "default" | "granted" | "denied";
      setPermission(result);
      if (result === "granted") {
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [supported, setSettings]);

  const sendNotification = useCallback((title: string, body: string, options?: { tag?: string; icon?: string; badge?: string }) => {
    if (!supported || permission !== "granted") return;
    try {
      const n = new Notification(title, {
        body,
        icon: "/images/brand/logo.svg",
        badge: "/images/brand/logo.svg",
        tag: "hanquocoi",
        ...options,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      // Notification failed silently
    }
  }, [supported, permission]);

  // ─── Count SR cards due today ─────────────────────────────────────────
  const countSRDueToday = useCallback((): number => {
    try {
      const srData = localStorage.getItem(STORAGE_KEYS.SR_VOCAB);
      if (!srData) return 0;
      const cards: Array<{ nextReview?: string; dueDate?: string }> = JSON.parse(srData);
      const today = new Date().toISOString().split("T")[0];
      return cards.filter(c => {
        const due = c.nextReview || c.dueDate || "";
        return due <= today;
      }).length;
    } catch {
      return 0;
    }
  }, []);

  // ─── Check SR due notification ────────────────────────────────────────
  const checkSRNotification = useCallback(() => {
    if (!settings.enabled || !settings.srReminder || permission !== "granted") return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const hour = now.getHours();

    if (hour === settings.srReminderHour && settings.lastSRNotified !== today) {
      const dueCount = countSRDueToday();
      if (dueCount > 0) {
        sendNotification(
          `🧠 ${dueCount} thẻ SR đến hạn ôn hôm nay!`,
          `Bạn có ${dueCount} thẻ Spaced Repetition cần ôn tập hôm nay. Ôn ngay để không quên!`,
          { tag: "sr-reminder" }
        );
        setSettings(prev => ({ ...prev, lastSRNotified: today }));
      }
    }
  }, [settings, permission, sendNotification, setSettings, countSRDueToday]);

  // ─── Check weekly report notification ────────────────────────────────
  const checkWeeklyReportNotification = useCallback(() => {
    if (!settings.enabled || !settings.weeklyReport || permission !== "granted") return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    if (dayOfWeek === settings.weeklyReportDay && hour === settings.weeklyReportHour) {
      if (settings.lastNotified !== today) {
        sendNotification(
          "📊 Báo cáo học tập tuần — Hàn Quốc Ơi!",
          "Tuần mới bắt đầu! Xem báo cáo học tập tuần trước và đặt mục tiêu cho tuần này.",
          { tag: "weekly-report" }
        );
        setSettings(prev => ({ ...prev, lastNotified: today }));
      }
    }
  }, [settings, permission, sendNotification, setSettings]);

  // ─── Check study reminder ─────────────────────────────────────────────
  const checkStudyReminder = useCallback(() => {
    if (!settings.enabled || !settings.studyReminder || permission !== "granted") return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const hour = now.getHours();

    const lastStudyKey = "kts_last_study_date";
    const lastStudy = localStorage.getItem(lastStudyKey) || "";

    if (hour === settings.studyReminderHour && lastStudy !== today) {
      const reminderKey = `kts_reminder_sent_${today}`;
      if (!localStorage.getItem(reminderKey)) {
        sendNotification(
          "📚 Đừng quên học tiếng Hàn hôm nay!",
          "Chỉ cần 15 phút mỗi ngày để duy trì streak và tiến bộ đều đặn.",
          { tag: "study-reminder" }
        );
        localStorage.setItem(reminderKey, "1");
      }
    }
  }, [settings, permission, sendNotification]);

  // ─── Auto-check every minute ──────────────────────────────────────────
  useEffect(() => {
    if (!settings.enabled || permission !== "granted") return;

    checkWeeklyReportNotification();
    checkStudyReminder();
    checkSRNotification();

    const interval = setInterval(() => {
      checkWeeklyReportNotification();
      checkStudyReminder();
      checkSRNotification();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.enabled, permission, checkWeeklyReportNotification, checkStudyReminder, checkSRNotification]);

  const updateSettings = useCallback((updates: Partial<PushSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  const testNotification = useCallback(() => {
    sendNotification(
      "🔔 Thông báo thử nghiệm — Hàn Quốc Ơi!",
      "Web Push Notifications đã được bật thành công! Bạn sẽ nhận nhắc nhở học tập đúng giờ.",
      { tag: "test" }
    );
  }, [sendNotification]);

  const testSRNotification = useCallback(() => {
    const dueCount = countSRDueToday();
    sendNotification(
      `🧠 ${dueCount > 0 ? dueCount : "Nhiều"} thẻ SR đến hạn ôn hôm nay!`,
      `Bạn có ${dueCount > 0 ? dueCount : "nhiều"} thẻ Spaced Repetition cần ôn tập. Ôn ngay để không quên!`,
      { tag: "sr-reminder-test" }
    );
  }, [sendNotification, countSRDueToday]);

  return {
    supported,
    permission,
    settings,
    requestPermission,
    updateSettings,
    testNotification,
    testSRNotification,
    sendNotification,
    countSRDueToday,
  };
}
