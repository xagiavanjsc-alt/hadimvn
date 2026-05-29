import { useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getStreakData } from "@/utils/streak";

interface NotificationSettings {
  streakWarning: boolean;
  dailyReminder: boolean;
  communityActivity: boolean;
}

/**
 * useStreakNotification
 * - Requests browser push notification permission
 * - Sends a warning notification when streak is at risk (after 20:00 if not studied today)
 * - Sends a daily reminder at configured time
 * - Simulates community activity notifications
 */
export function useStreakNotification() {
  const streak = getStreakData();
  const [settings] = useLocalStorage<NotificationSettings>("kts_notif_settings", {
    streakWarning: true,
    dailyReminder: true,
    communityActivity: true,
  });
  const [permissionGranted, setPermissionGranted] = useLocalStorage<boolean>("kts_notif_permission", false);
  const [lastStreakWarnDate, setLastStreakWarnDate] = useLocalStorage<string>("streak_warn_date", "");
  const [lastCommunityNotif, setLastCommunityNotif] = useLocalStorage<string>("kts_community_notif_date", "");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
      setPermissionGranted(true);
      return true;
    }
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    const granted = result === "granted";
    setPermissionGranted(granted);
    return granted;
  }, [setPermissionGranted]);

  // Send a notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: icon || "/images/brand/logo.svg",
        badge: "/images/brand/logo.svg",
        tag: title,
      });
    } catch {
      // Notification API not available in this context
    }
  }, []);

  // Check streak warning — fires after 20:00 if user hasn't studied today
  const checkStreakWarning = useCallback(() => {
    if (!settings.streakWarning || !permissionGranted) return;
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const hour = now.getHours();

    // Only warn between 20:00 and 23:30
    if (hour < 20 || hour >= 23) return;

    // Already warned today
    if (lastStreakWarnDate === today) return;

    // Check if studied today
    const studiedToday = streak.lastStudyDate === today;
    if (studiedToday) return;

    // Streak at risk!
    if (streak.currentStreak > 0) {
      sendNotification(
        "🔥 Streak sắp mất rồi!",
        `Bạn đang có ${streak.currentStreak} ngày streak. Học ít nhất 1 bài hôm nay để giữ streak nhé!`
      );
    } else {
      sendNotification(
        "📚 Hàn Quốc Ơi! nhắc bạn học",
        "Hôm nay bạn chưa học tiếng Hàn. Chỉ cần 10 phút thôi!"
      );
    }
    setLastStreakWarnDate(today);
  }, [settings.streakWarning, permissionGranted, streak, lastStreakWarnDate, sendNotification, setLastStreakWarnDate]);

  // Simulate community activity notification (once per day)
  const checkCommunityNotif = useCallback(() => {
    if (!settings.communityActivity || !permissionGranted) return;
    const today = new Date().toISOString().split("T")[0];
    if (lastCommunityNotif === today) return;

    const messages = [
      { title: "💬 Bình luận mới", body: "Có người vừa trả lời bình luận của bạn trong cộng đồng Hàn Quốc Ơi!" },
      { title: "❤️ Bài đăng được thích", body: "12 người vừa thích bài đăng của bạn. Cộng đồng đang chú ý đến bạn!" },
      { title: "🏆 Bạn lên hạng mới!", body: "Bạn vừa vào Top 50 bảng xếp hạng tuần này. Tiếp tục học nhé!" },
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    sendNotification(msg.title, msg.body);
    setLastCommunityNotif(today);
  }, [settings.communityActivity, permissionGranted, lastCommunityNotif, sendNotification, setLastCommunityNotif]);

  // Auto-request permission on first load (after 3 seconds)
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default" && !permissionGranted) {
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (Notification.permission === "granted") {
      setPermissionGranted(true);
    }
  }, []);

  // Check every minute. Stash callbacks in refs so the interval is created
  // exactly once — depending on the callbacks directly causes the interval
  // to be torn down + recreated whenever any upstream state changes (streak
  // count, last-warn date, etc.), and if that happens more than once per
  // minute the interval may never tick.
  const checkStreakWarningRef = useRef(checkStreakWarning);
  const checkCommunityNotifRef = useRef(checkCommunityNotif);
  useEffect(() => { checkStreakWarningRef.current = checkStreakWarning; }, [checkStreakWarning]);
  useEffect(() => { checkCommunityNotifRef.current = checkCommunityNotif; }, [checkCommunityNotif]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      checkStreakWarningRef.current();
      checkCommunityNotifRef.current();
    }, 60 * 1000);

    // Also check immediately
    checkStreakWarningRef.current();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    permissionGranted,
    requestPermission,
    sendNotification,
    isSupported: "Notification" in window,
  };
}
