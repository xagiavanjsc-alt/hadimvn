import { ReactNode, useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminTheme, adminThemeVars } from "@/hooks/useAdminTheme";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { relativeTime } from "@/utils/exportUtils";
import { AdminToastProvider } from "@/contexts/AdminToastContext";
import AdminGuard from "@/components/feature/AdminGuard";

// ─── Full Admin Nav Groups ────────────────────────────────────────────────────
const adminNavGroups = [
  {
    label: "Tổng quan",
    color: "#f87171",
    items: [
      { path: "/admin", icon: "ri-dashboard-line", label: "Dashboard" },
      { path: "/admin/stats", icon: "ri-bar-chart-line", label: "Thống kê hệ thống" },
      { path: "/admin/learn-stats", icon: "ri-graduation-cap-line", label: "Thống kê học tập" },
    ],
  },
  {
    label: "Người dùng",
    color: "#34d399",
    items: [
      { path: "/admin/users", icon: "ri-user-settings-line", label: "Quản lý thành viên" },
      { path: "/admin/roles", icon: "ri-shield-keyhole-line", label: "Phân quyền Admin" },
      { path: "/admin/coupon", icon: "ri-coupon-3-line", label: "Coupon & Mã giảm giá" },
    ],
  },
  {
    label: "Nội dung học",
    color: "#a78bfa",
    items: [
      { path: "/admin/content", icon: "ri-article-line", label: "Duyệt nội dung" },
      { path: "/admin/content-learn", icon: "ri-book-open-line", label: "Quản lý nội dung học" },
      { path: "/admin/series", icon: "ri-stack-line", label: "Series & Ebook" },
      { path: "/admin/eps", icon: "ri-image-edit-line", label: "Quản lý EPS" },
      { path: "/admin/eps-new", icon: "ri-add-circle-line", label: "Thêm bài EPS mới" },
      { path: "/admin/eps-upload", icon: "ri-upload-cloud-2-line", label: "Upload ảnh EPS" },
      { path: "/admin/upload", icon: "ri-upload-cloud-2-line", label: "Upload & AI tổng hợp" },
    ],
  },
  {
    label: "Doanh thu",
    color: "#34d399",
    items: [
      { path: "/admin/revenue", icon: "ri-line-chart-line", label: "Phân tích doanh thu" },
      { path: "/admin/vip-transactions", icon: "ri-exchange-line", label: "Lịch sử giao dịch VIP" },
      { path: "/admin/pricing", icon: "ri-vip-crown-line", label: "Gói VIP & Giá" },
    ],
  },
  {
    label: "Truyền thông",
    color: "#fb923c",
    items: [
      { path: "/admin/broadcast", icon: "ri-broadcast-line", label: "Broadcast email" },
      { path: "/admin/zalo-reminder", icon: "ri-chat-1-line", label: "Nhắc nhở Zalo OA" },
    ],
  },
  {
    label: "Hỗ trợ & Báo cáo",
    color: "#f87171",
    items: [
      { path: "/admin/bugs", icon: "ri-bug-line", label: "Báo cáo lỗi & Vi phạm" },
      { path: "/admin/feedback", icon: "ri-chat-smile-2-line", label: "Góp ý & Đánh giá" },
    ],
  },
  {
    label: "Hệ thống",
    color: "#e8c84a",
    items: [
      { path: "/admin/control", icon: "ri-settings-4-line", label: "Cài đặt admin" },
      { path: "/admin/settings", icon: "ri-settings-3-line", label: "Cài đặt API & Keys" },
      { path: "/admin/backup", icon: "ri-save-line", label: "Backup & Restore" },
      { path: "/admin/audit", icon: "ri-history-line", label: "Audit Log" },
      { path: "/admin/security", icon: "ri-shield-keyhole-line", label: "Bảo mật hệ thống" },
    ],
  },
];

// ─── All searchable items (flatten all nav items) ────────────────────────────
const ALL_NAV_ITEMS = adminNavGroups.flatMap(g =>
  g.items.map(item => ({ ...item, group: g.label, color: g.color }))
);

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useAdminNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 rounded-2xl border z-50 overflow-hidden"
      style={{
        backgroundColor: "var(--admin-card)",
        borderColor: "var(--admin-border2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div className="flex items-center gap-2">
          <i className="ri-notification-3-line text-rose-400 text-sm"></i>
          <span className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
            Thông báo
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs cursor-pointer whitespace-nowrap transition-colors"
            style={{ color: "var(--admin-text-muted)" }}
          >
            Đọc tất cả
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y" style={{ borderColor: "var(--admin-border)" }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-notification-off-line text-3xl mb-2" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không có thông báo</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group"
              style={{ backgroundColor: n.read ? "transparent" : `${n.color}08` }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${n.color}18` }}
              >
                <i className={`${n.icon} text-sm`} style={{ color: n.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: n.read ? "var(--admin-text-muted)" : "var(--admin-text)" }}
                  >
                    {n.title}
                  </p>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1"></div>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
                  {n.message}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>
                  {relativeTime(n.time)}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded flex-shrink-0 cursor-pointer"
                style={{ color: "var(--admin-text-faint)" }}
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function SidebarNavItem({ item, isActive }: { item: { path: string; icon: string; label: string }; isActive: boolean }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/admin"}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
      style={{
        backgroundColor: isActive ? "rgba(244,63,94,0.10)" : "transparent",
        color: isActive ? "#f87171" : "var(--admin-text-muted)",
        border: isActive ? "1px solid rgba(244,63,94,0.15)" : "1px solid transparent",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <i className={`${item.icon} text-sm`}></i>
      </div>
      <span className="flex-1 truncate">{item.label}</span>
    </NavLink>
  );
}

// ─── Quick Search ─────────────────────────────────────────────────────────────
function QuickSearch({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (!q.trim()) return ALL_NAV_ITEMS.slice(0, 8);
    const lower = q.toLowerCase();
    return ALL_NAV_ITEMS.filter(item =>
      item.label.toLowerCase().includes(lower) ||
      item.group.toLowerCase().includes(lower)
    ).slice(0, 10);
  }, [q]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="px-2 pb-2">
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2"
        style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border2)" }}
      >
        <i className="ri-search-line text-xs flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}></i>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tìm tác vụ..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: "var(--admin-text)" }}
        />
        {q && (
          <button onClick={() => setQ("")} className="cursor-pointer flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}>
            <i className="ri-close-line text-xs"></i>
          </button>
        )}
      </div>
      <div className="space-y-0.5">
        {results.map(item => (
          <button
            key={item.path}
            onClick={() => handleSelect(item.path)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer text-left hover:bg-white/5"
            style={{ color: "var(--admin-text-muted)" }}
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
              <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate" style={{ color: "var(--admin-text)" }}>{item.label}</p>
              <p className="text-[9px] truncate" style={{ color: "var(--admin-text-faint)" }}>{item.group}</p>
            </div>
          </button>
        ))}
        {results.length === 0 && (
          <p className="text-center py-4 text-xs" style={{ color: "var(--admin-text-faint)" }}>Không tìm thấy</p>
        )}
      </div>
    </div>
  );
}

// ─── Quick Search Toggle Button ──────────────────────────────────────────────────
function QuickSearchToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer"
        style={{
          backgroundColor: open ? "var(--admin-hover)" : "var(--admin-card2)",
          border: `1px solid ${open ? "rgba(244,63,94,0.20)" : "var(--admin-border)"}`,
          color: open ? "#f87171" : "var(--admin-text-faint)",
        }}
      >
        <i className="ri-search-line text-xs flex-shrink-0"></i>
        <span className="flex-1 text-left">Tìm tác vụ nhanh...</span>
        <kbd className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-faint)" }}>Ctrl+K</kbd>
      </button>
      {open && (
        <div className="mt-1 rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
          <QuickSearch onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Collapsible Nav Group ────────────────────────────────────────────────────
function NavGroup({
  group,
  defaultOpen = false,
}: {
  group: typeof adminNavGroups[0];
  defaultOpen?: boolean;
}) {
  const location = useLocation();
  const hasActive = group.items.some(item =>
    item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path)
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer group hover:bg-white/3"
      >
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: hasActive ? group.color : "var(--admin-text-faint)" }}
        />
        <p
          className="flex-1 text-left text-[9px] uppercase tracking-widest font-bold transition-colors"
          style={{ color: hasActive ? group.color : "var(--admin-text-faint)" }}
        >
          {group.label}
        </p>
        <i
          className={`text-[10px] transition-transform duration-200 ${open ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"}`}
          style={{ color: "var(--admin-text-faint)" }}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="space-y-0.5 pb-1 pl-1 pt-0.5">
          {group.items.map(item => {
            const isActive = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return <SidebarNavItem key={item.path} item={item} isActive={isActive} />;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export default function AdminLayout({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle, isDark } = useAdminTheme();
  const { unreadCount } = useAdminNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const vars = adminThemeVars[theme];
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    return () => {
      Object.keys(vars).forEach(k => root.style.removeProperty(k));
    };
  }, [theme]);

  return (
    <AdminGuard>
    <AdminToastProvider>
      <div className="flex min-h-screen" style={{ backgroundColor: "var(--admin-bg)" }}>

        {/* ── Sidebar ── */}
        <aside
          className="min-h-screen flex flex-col border-r flex-shrink-0 transition-all duration-200"
          style={{
            width: sidebarCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
            backgroundColor: "var(--admin-sidebar)",
            borderColor: "var(--admin-border)",
          }}
        >
          {/* Logo + collapse toggle */}
          <div
            className="flex items-center gap-2.5 px-3 py-3.5 border-b flex-shrink-0"
            style={{ borderColor: "var(--admin-border)" }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <i className="ri-shield-keyhole-line text-white text-sm"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight" style={{ color: "var(--admin-text)" }}>Admin Panel</p>
                <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>Hàn Quốc Ơi!</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className="w-6 h-6 flex items-center justify-center rounded-md cursor-pointer transition-colors flex-shrink-0"
              style={{ color: "var(--admin-text-faint)" }}
            >
              <i className={`text-xs ${sidebarCollapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"}`}></i>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-3">
            {!sidebarCollapsed ? (
              <>
                {/* Quick search toggle */}
                <QuickSearchToggle />

                {adminNavGroups.map((group, i) => (
                  <NavGroup key={group.label} group={group} defaultOpen={i === 0} />
                ))}

                {/* Divider */}
                <div className="border-t pt-2" style={{ borderColor: "var(--admin-border)" }}>
                  <p className="text-[9px] uppercase tracking-widest font-bold px-3 pb-1.5" style={{ color: "var(--admin-text-faint)" }}>
                    Điều hướng
                  </p>
                  <NavLink
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
                    style={{ color: "var(--admin-text-muted)" }}
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-arrow-left-line text-sm"></i>
                    </div>
                    Về trang học viên
                  </NavLink>
                </div>
              </>
            ) : (
              /* Collapsed: chỉ hiện icons */
              <div className="space-y-1">
                {adminNavGroups.flatMap(g => g.items).map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all cursor-pointer"
                      style={{
                        backgroundColor: isActive ? "rgba(244,63,94,0.10)" : "transparent",
                        color: isActive ? "#f87171" : "var(--admin-text-muted)",
                      }}
                    >
                      <i className={`${item.icon} text-base`}></i>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div
              className="px-3 py-3 border-t space-y-1 flex-shrink-0"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <button
                onClick={toggle}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
                style={{ color: "var(--admin-text-muted)" }}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className={isDark ? "ri-sun-line text-sm" : "ri-moon-line text-sm"}></i>
                </div>
                {isDark ? "Chế độ sáng" : "Chế độ tối"}
              </button>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: "var(--admin-hover)" }}
              >
                <div className="w-6 h-6 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-line text-rose-400 text-[10px]"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate" style={{ color: "var(--admin-text-muted)" }}>
                    {profile?.display_name || "Admin"}
                  </p>
                  <p className="text-[9px] truncate" style={{ color: "var(--admin-text-faint)" }}>
                    {user?.email || "admin"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header
            className="backdrop-blur-md border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-20"
            style={{
              backgroundColor: "var(--admin-header)",
              borderColor: "var(--admin-border)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Breadcrumb back */}
              <button
                onClick={() => navigate(-1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors flex-shrink-0"
                style={{ color: "var(--admin-text-faint)", backgroundColor: "var(--admin-hover)" }}
              >
                <i className="ri-arrow-left-s-line text-sm"></i>
              </button>
              <div className="min-w-0">
                {title && (
                  <h1 className="font-semibold text-sm leading-tight truncate" style={{ color: "var(--admin-text)" }}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--admin-text-muted)" }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotif(v => !v)}
                  className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                  style={{
                    backgroundColor: showNotif ? "rgba(244,63,94,0.12)" : "var(--admin-hover)",
                    border: `1px solid ${showNotif ? "rgba(244,63,94,0.25)" : "var(--admin-border)"}`,
                  }}
                >
                  <i
                    className="ri-notification-3-line text-sm"
                    style={{ color: showNotif ? "#f87171" : "var(--admin-text-muted)" }}
                  ></i>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--admin-hover)",
                  border: `1px solid var(--admin-border)`,
                }}
              >
                <i
                  className={`${isDark ? "ri-sun-line" : "ri-moon-line"} text-sm`}
                  style={{ color: "var(--admin-text-muted)" }}
                ></i>
              </button>

              {/* Admin badge */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.20)" }}
              >
                <i className="ri-shield-check-line text-rose-400 text-xs"></i>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminToastProvider>
    </AdminGuard>
  );
}
