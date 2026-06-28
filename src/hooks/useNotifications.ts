import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getStreakData } from "@/utils/streak";

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:MM format
  reviewReminder: boolean;
  reviewReminderInterval: number; // hours
  lastNotificationTime: number;
}

interface Notification {
  id: string;
  type: "daily_reminder" | "review_reminder" | "streak_warning";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>("kts_notification_settings", {
    enabled: true,
    dailyReminder: true,
    dailyReminderTime: "09:00",
    reviewReminder: true,
    reviewReminderInterval: 24, // 24 hours
    lastNotificationTime: 0,
  });
  const [notifications, setNotifications] = useLocalStorage<Notification[]>("kts_notifications", []);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    }
    return false;
  };

  const showNotification = (title: string, message: string) => {
    if (!settings.enabled) return;

    // Add to in-app notifications
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "daily_reminder",
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Show browser notification if permitted
    if (permission === "granted" && "Notification" in window) {
      new Notification(title, {
        body: message,
        icon: "/images/brand/logo.svg",
        badge: "/images/brand/logo.svg",
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const checkDailyReminder = () => {
    if (!settings.enabled || !settings.dailyReminder) return;

    const now = new Date();
    const [hours, minutes] = settings.dailyReminderTime.split(":").map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    const timeSinceLastNotification = Date.now() - settings.lastNotificationTime;
    const hoursSinceLastNotification = timeSinceLastNotification / (1000 * 60 * 60);

    if (hoursSinceLastNotification >= 24 && now >= reminderTime) {
      const streak = getStreakData();
      showNotification(
        "Đừng quên học tiếng Hàn!",
        `Bạn đang có ${streak.currentStreak} ngày liên tiếp. Học ngay để giữ streak nhé!`
      );
      setSettings(prev => ({ ...prev, lastNotificationTime: Date.now() }));
    }
  };

  const checkReviewReminder = () => {
    if (!settings.enabled || !settings.reviewReminder) return;

    const timeSinceLastNotification = Date.now() - settings.lastNotificationTime;
    const hoursSinceLastNotification = timeSinceLastNotification / (1000 * 60 * 60);

    if (hoursSinceLastNotification >= settings.reviewReminderInterval) {
      showNotification(
        "Đến giờ ôn tập từ vựng!",
        "Có từ vựng cần review. Hãy vào phần Ôn tập từ vựng (SRS) để học nhé!"
      );
      setSettings(prev => ({ ...prev, lastNotificationTime: Date.now() }));
    }
  };

  // Check reminders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkDailyReminder();
      checkReviewReminder();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [settings, permission]);

  return {
    settings,
    notifications,
    permission,
    unreadCount: notifications.filter(n => !n.read).length,
    requestPermission,
    showNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
  };
}
