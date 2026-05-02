import { useState, useEffect, useRef, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";

interface StaticNotif {
  id: string;
  type: "streak" | "xp" | "like" | "comment" | "system" | "badge" | "level_up" | "challenge";
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [streak] = useLocalStorage<{ count: number }>("kts_streak", { count: 0 });
  const [readIds, setReadIds] = useLocalStorage<string[]>("kts_notif_read_v2", []);
  const panelRef = useRef<HTMLDivElement>(null);

  const { notifications: xpNotifs, dismissNotification, clearAllNotifications } = useXPSystem();

  // Static/contextual notifications
  const staticNotifs = useMemo<StaticNotif[]>(() => {
    const items: StaticNotif[] = [];
    if (streak.count >= 3) {
      items.push({
        id: `streak-${streak.count}`,
        type: "streak",
        title: `🔥 ${streak.count} ngày streak!`,
        message: `Tuyệt vời! Bạn đang duy trì ${streak.count} ngày học liên tiếp. Tiếp tục nhé!`,
        time: "Hôm nay",
        icon: "ri-fire-line",
        color: "#fb923c",
      });
    }
    items.push({
      id: "weekly-challenge-reminder",
      type: "challenge",
      title: "Thử thách tuần này đang chờ!",
      message: "7 thử thách mới đã sẵn sàng. Hoàn thành để nhận tới 1.000+ XP thưởng.",
      time: "Đầu tuần",
      icon: "ri-trophy-line",
      color: "app-accent-primary",
    });
    items.push({
      id: "community-like-1",
      type: "like",
      title: "Bài đăng được yêu thích",
      message: "Minh Tuấn và 12 người khác đã thích bài đăng của bạn.",
      time: "2 giờ trước",
      icon: "ri-heart-line",
      color: "#f472b6",
    });
    items.push({
      id: "system-new-content",
      type: "system",
      title: "Nội dung mới",
      message: "15 bài học K-pop mới vừa được thêm vào thư viện. Khám phá ngay!",
      time: "2 ngày trước",
      icon: "ri-notification-3-line",
      color: "#34d399",
    });
    return items;
  }, [streak.count]);

  // Merge XP notifications + static
  const allNotifications = useMemo(() => {
    const xpItems = xpNotifs.slice(0, 5).map(n => ({
      id: n.id,
      type: n.type as string,
      title: n.title,
      message: n.message,
      time: timeAgo(n.timestamp),
      icon: n.type === "level_up" ? "ri-arrow-up-circle-fill" : n.type === "badge_earned" ? "ri-medal-fill" : "ri-star-fill",
      color: n.type === "level_up" ? "app-accent-primary" : n.type === "badge_earned" ? "#a78bfa" : "#34d399",
      isXP: true,
      xpAmount: n.xpAmount,
    }));
    const staticItems = staticNotifs.map(n => ({
      ...n,
      isXP: false,
      xpAmount: undefined,
    }));
    return [...xpItems, ...staticItems];
  }, [xpNotifs, staticNotifs]);

  const unreadCount = useMemo(() => {
    const xpUnread = xpNotifs.length;
    const staticUnread = staticNotifs.filter(n => !readIds.includes(n.id)).length;
    return Math.min(xpUnread + staticUnread, 99);
  }, [xpNotifs, staticNotifs, readIds]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAllRead = () => {
    // Dismiss all XP notifications
    xpNotifs.forEach(n => dismissNotification(n.id));
    // Mark static as read
    setReadIds(staticNotifs.map(n => n.id));
  };

  const handleItemClick = (item: typeof allNotifications[0]) => {
    if (item.isXP) {
      dismissNotification(item.id);
    } else {
      setReadIds(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
    }
  };

  const isRead = (item: typeof allNotifications[0]) => {
    if (item.isXP) return false; // XP notifs always show as unread until dismissed
    return readIds.includes(item.id);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white/80 transition-all cursor-pointer"
      >
        <i className="ri-notification-3-line text-base"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-app-accent-primary text-app-bg text-[9px] font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-app-bg border border-app-border rounded-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-app-accent-primary/15 text-app-accent-primary text-[10px] font-bold rounded-full">{unreadCount} mới</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-app-text-muted hover:text-app-accent-primary/70 cursor-pointer whitespace-nowrap transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* XP section header */}
          {xpNotifs.length > 0 && (
            <div className="px-4 py-2 bg-app-accent-primary/5 border-b border-app-accent-primary/10">
              <p className="text-app-accent-primary text-[10px] font-bold tracking-normal">XP & Cấp bậc</p>
            </div>
          )}

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/3">
            {allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <i className="ri-notification-off-line text-white/15 text-3xl mb-2"></i>
                <p className="text-app-text-muted text-sm">Không có thông báo mới</p>
              </div>
            ) : (
              allNotifications.map(n => {
                const read = isRead(n);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${!read ? "bg-white/2 hover:bg-app-card/50" : "hover:bg-app-surface/50"}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: `${n.color}15` }}>
                      <i className={`${n.icon} text-sm`} style={{ color: n.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-tight ${!read ? "text-white" : "text-white/60"}`}>{n.title}</p>
                        {!read && <div className="w-1.5 h-1.5 rounded-full bg-app-accent-primary flex-shrink-0 mt-1"></div>}
                      </div>
                      <p className="text-white/35 text-[10px] leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-app-text-muted text-[10px]">{n.time}</p>
                        {n.xpAmount && (
                          <span className="text-[10px] font-bold text-app-accent-primary">+{n.xpAmount} XP</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-app-border flex items-center justify-between">
            <button
              onClick={() => { clearAllNotifications(); setReadIds(staticNotifs.map(n => n.id)); setOpen(false); }}
              className="text-[10px] text-app-text-muted hover:text-app-text-secondary cursor-pointer whitespace-nowrap transition-colors"
            >
              Xóa tất cả
            </button>
            <span className="text-[10px] text-app-text-muted">{allNotifications.length} thông báo</span>
          </div>
        </div>
      )}
    </div>
  );
}
