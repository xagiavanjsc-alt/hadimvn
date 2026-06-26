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

function getSafeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

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
  const storage = getSafeStorage();
  if (!storage) return SEED_NOTIFICATIONS;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminNotification[];
  } catch { /* ignore */ }
  return SEED_NOTIFICATIONS;
}

function saveNotifications(notifs: AdminNotification[]) {
  const storage = getSafeStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  } catch { /* ignore */ }
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(loadNotifications);

  // Persist on change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // HIDDEN 2026-05-29: removed mock notification generator — it produced
  // fake "user signed up" / "exam completed" toasts via Math.random() that
  // were not real events. Violates CLAUDE.md rule 5 (no AI/fake content
  // labelled as real). Re-add when wired to a real Supabase realtime
  // subscription on user_profiles, exam_results, vip_payment_requests.

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
