import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export interface AdminNotification {
  id: string;
  type: "user" | "coupon" | "exam" | "revenue" | "system";
  title: string;
  message: string;
  time: string; // ISO string
  read: boolean;
  icon: string;
  color: string;
}

const STORAGE_KEY = "kts_admin_notifications";

const SEED_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "n1",
    type: "user",
    title: "Người dùng mới đăng ký",
    message: "Nguyễn Thị Lan vừa tạo tài khoản và bắt đầu học EPS",
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    icon: "ri-user-add-line",
    color: "#f87171",
  },
  {
    id: "n2",
    type: "revenue",
    title: "Đơn hàng mới",
    message: "Trần Văn Minh đã mua gói VIP Năm — 708.000đ",
    time: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    read: false,
    icon: "ri-money-dollar-circle-line",
    color: "#34d399",
  },
  {
    id: "n3",
    type: "coupon",
    title: "Coupon được dùng",
    message: "Mã ZALO20 vừa được sử dụng lần thứ 15",
    time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
    icon: "ri-coupon-3-line",
    color: "#fb923c",
  },
  {
    id: "n4",
    type: "exam",
    title: "Điểm thi cao",
    message: "Phạm Thu Hương đạt 95/100 trong bài thi EPS thử",
    time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: true,
    icon: "ri-trophy-line",
    color: "#e8c84a",
  },
  {
    id: "n5",
    type: "system",
    title: "Cập nhật hệ thống",
    message: "Service worker đã cache thành công 42 assets tĩnh",
    time: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    read: true,
    icon: "ri-server-line",
    color: "#a78bfa",
  },
  {
    id: "n6",
    type: "user",
    title: "Người dùng đạt streak 30 ngày",
    message: "Lê Quốc Bảo vừa đạt streak 30 ngày liên tiếp",
    time: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    read: true,
    icon: "ri-fire-line",
    color: "#fb923c",
  },
];

function loadNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminNotification[];
  } catch { /* ignore */ }
  return SEED_NOTIFICATIONS;
}

function saveNotifications(notifs: AdminNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  } catch { /* ignore */ }
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(loadNotifications);

  // Persist on change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Simulate real-time: check for new user signups / coupon usage every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const coupons = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || "[]") as { usageCount: number; code: string }[]; }
        catch { return []; }
      })();
      const totalUsage = coupons.reduce((s: number, c: { usageCount: number }) => s + c.usageCount, 0);

      // Only add notification if usage changed significantly (mock)
      if (Math.random() < 0.15) {
        const types: AdminNotification["type"][] = ["user", "exam", "coupon"];
        const picked = types[Math.floor(Math.random() * types.length)];
        const templates: Record<AdminNotification["type"], { title: string; message: string; icon: string; color: string }> = {
          user: { title: "Người dùng mới", message: "Một học viên mới vừa đăng ký tài khoản", icon: "ri-user-add-line", color: "#f87171" },
          exam: { title: "Bài thi hoàn thành", message: "Một học viên vừa hoàn thành bài thi EPS thử", icon: "ri-file-list-3-line", color: "#e8c84a" },
          coupon: { title: "Coupon được dùng", message: `Tổng ${totalUsage} lần dùng coupon hôm nay`, icon: "ri-coupon-3-line", color: "#fb923c" },
          revenue: { title: "Doanh thu mới", message: "Có đơn hàng mới vừa được ghi nhận", icon: "ri-money-dollar-circle-line", color: "#34d399" },
          system: { title: "Hệ thống", message: "Không có cảnh báo hệ thống", icon: "ri-server-line", color: "#a78bfa" },
        };
        const tpl = templates[picked];
        const newNotif: AdminNotification = {
          id: `n-${Date.now()}`,
          type: picked,
          title: tpl.title,
          message: tpl.message,
          time: new Date().toISOString(),
          read: false,
          icon: tpl.icon,
          color: tpl.color,
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notif: Omit<AdminNotification, "id" | "time" | "read">) => {
    const newNotif: AdminNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, dismiss, addNotification };
}
