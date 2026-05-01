import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuditLog {
  id: string;
  action_type: string;
  action_label: string;
  actor_id: string | null;
  actor_name: string | null;
  target_id: string | null;
  target_name: string | null;
  detail: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SystemEvent {
  id: string;
  type: string;
  label: string;
  detail: string;
  actor: string;
  timestamp: string;
  color: string;
  icon: string;
  source: "admin_log" | "user_joined" | "exam" | "post";
  ip?: string;
}

// ─── Action type config ───────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  vip_granted: { color: "#e8c84a", icon: "ri-vip-crown-line", label: "Cấp VIP" },
  vip_revoked: { color: "#f87171", icon: "ri-close-circle-line", label: "Hủy VIP" },
  bulk_vip_granted: { color: "#e8c84a", icon: "ri-vip-crown-2-line", label: "Cấp VIP hàng loạt" },
  admin_granted: { color: "#f87171", icon: "ri-shield-keyhole-line", label: "Cấp Admin" },
  admin_revoked: { color: "#f87171", icon: "ri-shield-cross-line", label: "Hủy Admin" },
  broadcast_sent: { color: "#a78bfa", icon: "ri-broadcast-line", label: "Broadcast" },
  email_sent: { color: "#38bdf8", icon: "ri-mail-send-line", label: "Gửi email" },
  email_bulk_sent: { color: "#38bdf8", icon: "ri-mail-send-line", label: "Email hàng loạt" },
  content_deleted: { color: "#f87171", icon: "ri-delete-bin-line", label: "Xóa nội dung" },
  content_approved: { color: "#34d399", icon: "ri-checkbox-circle-line", label: "Duyệt nội dung" },
  data_export: { color: "#34d399", icon: "ri-download-2-line", label: "Xuất dữ liệu" },
  settings_updated: { color: "#fb923c", icon: "ri-settings-3-line", label: "Cập nhật cài đặt" },
  backup_created: { color: "#34d399", icon: "ri-save-line", label: "Tạo backup" },
  admin_login: { color: "#a78bfa", icon: "ri-login-circle-line", label: "Đăng nhập Admin" },
  user_joined: { color: "#34d399", icon: "ri-user-add-line", label: "Đăng ký" },
  exam_taken: { color: "#a78bfa", icon: "ri-file-list-3-line", label: "Thi thử" },
  post_created: { color: "#fb923c", icon: "ri-article-line", label: "Bài viết" },
};

function getActionConfig(type: string) {
  return ACTION_CONFIG[type] || { color: "#6b7280", icon: "ri-history-line", label: type };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return `${Math.floor(d / 30)} tháng trước`;
}

// ─── Log Detail Modal ─────────────────────────────────────────────────────────
function LogDetailModal({ log, onClose }: { log: SystemEvent; onClose: () => void }) {
  const cfg = getActionConfig(log.type);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cfg.color}15` }}>
              <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{log.label}</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{new Date(log.timestamp).toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "Người thực hiện", value: log.actor },
            { label: "Chi tiết", value: log.detail },
            { label: "IP Address", value: log.ip || "—" },
            { label: "Thời gian", value: new Date(log.timestamp).toLocaleString("vi-VN") },
            { label: "Nguồn", value: log.source === "admin_log" ? "Admin Panel" : "Hệ thống" },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
              <span className="text-[10px] font-semibold tracking-normal w-28 flex-shrink-0 mt-0.5" style={{ color: "var(--admin-text-faint)" }}>{row.label}</span>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAuditPage() {
  const [adminLogs, setAdminLogs] = useState<AuditLog[]>([]);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSource, setFilterSource] = useState<"all" | "admin" | "system" | "email">("all");
  const [selectedLog, setSelectedLog] = useState<SystemEvent | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adminRes, profileRes, examRes, postRes] = await Promise.all([
        supabase.from("admin_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("user_profiles")
          .select("id, display_name, is_vip, is_admin, created_at, updated_at")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("exam_results")
          .select("id, user_id, score, total, taken_at")
          .order("taken_at", { ascending: false })
          .limit(100),
        supabase.from("community_posts")
          .select("id, user_id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const logs = adminRes.data || [];
      setAdminLogs(logs);

      const profiles = profileRes.data || [];
      const profileMap = new Map(profiles.map(p => [p.id, p]));
      const events: SystemEvent[] = [];

      // Admin logs → events
      logs.forEach(log => {
        const cfg = getActionConfig(log.action_type);
        events.push({
          id: `al_${log.id}`,
          type: log.action_type,
          label: log.action_label,
          detail: log.detail || "",
          actor: log.actor_name || "Admin",
          timestamp: log.created_at,
          color: cfg.color,
          icon: cfg.icon,
          source: "admin_log",
          ip: log.ip_address || undefined,
        });
      });

      // User joined events
      profiles.forEach(p => {
        events.push({
          id: `uj_${p.id}`,
          type: "user_joined",
          label: "Thành viên mới đăng ký",
          detail: `${p.display_name || "Người dùng"} đã đăng ký tài khoản`,
          actor: p.display_name || "Người dùng",
          timestamp: p.created_at,
          color: "#34d399",
          icon: "ri-user-add-line",
          source: "user_joined",
        });
      });

      // Exam events
      (examRes.data || []).forEach(e => {
        const profile = profileMap.get(e.user_id);
        const pct = e.total > 0 ? Math.round((e.score / e.total) * 100) : 0;
        events.push({
          id: `ex_${e.id}`,
          type: "exam_taken",
          label: "Thi thử EPS",
          detail: `${profile?.display_name || "Học viên"} — ${e.score}/${e.total} (${pct}%)`,
          actor: profile?.display_name || "Học viên",
          timestamp: e.taken_at,
          color: "#a78bfa",
          icon: "ri-file-list-3-line",
          source: "system",
        });
      });

      // Post events
      (postRes.data || []).forEach(p => {
        const profile = profileMap.get(p.user_id);
        events.push({
          id: `po_${p.id}`,
          type: "post_created",
          label: "Bài viết cộng đồng",
          detail: `${profile?.display_name || "Thành viên"}: ${p.title || "Bài viết mới"}`,
          actor: profile?.display_name || "Thành viên",
          timestamp: p.created_at,
          color: "#fb923c",
          icon: "ri-article-line",
          source: "system",
        });
      });

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSystemEvents(events);
    } catch (err) {
      console.error("Audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allTypes = useMemo(() => {
    const types = new Set(systemEvents.map(e => e.type));
    return Array.from(types);
  }, [systemEvents]);

  const filtered = useMemo(() => {
    let list = [...systemEvents];
    if (filterSource === "admin") list = list.filter(e => e.source === "admin_log");
    else if (filterSource === "system") list = list.filter(e => e.source !== "admin_log");
    else if (filterSource === "email") list = list.filter(e => e.type === "email_sent" || e.type === "email_bulk_sent" || e.type === "broadcast_sent");
    if (filterType !== "all") list = list.filter(e => e.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.detail.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || e.label.toLowerCase().includes(q));
    }
    return list;
  }, [systemEvents, filterType, filterSource, search]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const todayCount = systemEvents.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length;
  const adminActionsCount = adminLogs.length;
  const typeCount = (t: string) => systemEvents.filter(e => e.type === t).length;
  const emailCount = systemEvents.filter(e => e.type === "email_sent" || e.type === "email_bulk_sent" || e.type === "broadcast_sent").length;

  const handleExport = () => {
    const csv = [
      ["Thời gian", "Loại", "Hành động", "Chi tiết", "Người thực hiện", "IP", "Nguồn"].join(","),
      ...filtered.map(e => [
        new Date(e.timestamp).toLocaleString("vi-VN"),
        e.type,
        e.label,
        `"${e.detail.replace(/"/g, '""')}"`,
        e.actor,
        e.ip || "—",
        e.source === "admin_log" ? "Admin Panel" : "Hệ thống",
      ].join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Audit Log"
      subtitle="Lịch sử hành động admin + hoạt động hệ thống từ Supabase thực"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap border"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>
            <i className="ri-refresh-line"></i>Làm mới
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 text-white">
            <i className="ri-download-line"></i>Export CSV
          </button>
        </div>
      }
    >
      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Tổng sự kiện", value: systemEvents.length, color: "#a78bfa", icon: "ri-history-line" },
          { label: "Hành động Admin", value: adminActionsCount, color: "#f87171", icon: "ri-shield-keyhole-line" },
          { label: "Hôm nay", value: todayCount, color: "#34d399", icon: "ri-calendar-check-line" },
          { label: "Lần thi thử", value: typeCount("exam_taken"), color: "#e8c84a", icon: "ri-file-list-3-line" },
          { label: "Email đã gửi", value: emailCount, color: "#38bdf8", icon: "ri-mail-send-line" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-black text-2xl leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Source filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-hover)" }}>
          {([
            { val: "all" as const, label: "Tất cả" },
            { val: "admin" as const, label: "Admin Actions" },
            { val: "email" as const, label: "Email Scheduler" },
            { val: "system" as const, label: "Hệ thống" },
          ]).map(s => (
            <button key={s.val} onClick={() => setFilterSource(s.val)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: filterSource === s.val ? "var(--admin-card)" : "transparent", color: filterSource === s.val ? "var(--admin-text)" : "var(--admin-text-muted)", border: filterSource === s.val ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px] border"
          style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
          <i className="ri-search-line text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sự kiện, người dùng, IP..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--admin-text)" }} />
          {search && <button onClick={() => setSearch("")} className="cursor-pointer" style={{ color: "var(--admin-text-faint)" }}><i className="ri-close-line text-sm"></i></button>}
        </div>

        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="rounded-lg px-3 py-2 text-xs outline-none cursor-pointer border"
          style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>
          <option value="all">Tất cả loại ({systemEvents.length})</option>
          {allTypes.map(t => {
            const cfg = getActionConfig(t);
            return <option key={t} value={t}>{cfg.label} ({typeCount(t)})</option>;
          })}
        </select>

        <span className="text-xs ml-auto" style={{ color: "var(--admin-text-faint)" }}>{filtered.length} kết quả</span>
      </div>

      {/* Email Scheduler Panel */}
      {filterSource === "email" && !loading && (
        <div className="rounded-2xl border p-5 mb-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#38bdf815" }}>
              <i className="ri-mail-send-line text-sm" style={{ color: "#38bdf8" }}></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Email Scheduler Monitor</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Theo dõi email tự động gửi bởi VIP Expiry Scheduler</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Tổng email đã gửi", value: emailCount, color: "#38bdf8", icon: "ri-mail-check-line" },
              { label: "Broadcast", value: typeCount("broadcast_sent"), color: "#a78bfa", icon: "ri-broadcast-line" },
              { label: "Email hàng loạt", value: typeCount("email_bulk_sent"), color: "#fb923c", icon: "ri-mail-send-line" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <p className="font-black text-xl leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 rounded-xl border" style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text)" }}>Cron Job Status</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>vip-expiry-scheduler — Chạy mỗi ngày lúc 08:00 UTC</p>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">Active</span>
            </div>
            <p className="text-[10px] mt-2" style={{ color: "var(--admin-text-faint)" }}>
              Gửi nhắc nhở gia hạn VIP: 7 ngày, 3 ngày, 1 ngày trước khi hết hạn
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Đang tải từ Supabase...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            {paginated.length === 0 ? (
              <div className="text-center py-16">
                <i className="ri-history-line text-4xl mb-3 block" style={{ color: "var(--admin-text-faint)" }}></i>
                <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không tìm thấy sự kiện nào</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
                {paginated.map(entry => {
                  const cfg = getActionConfig(entry.type);
                  return (
                    <div key={entry.id}
                      onClick={() => setSelectedLog(entry)}
                      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors group"
                      style={{ backgroundColor: "var(--admin-card)" }}>
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ backgroundColor: `${cfg.color}12` }}>
                        <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{entry.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {entry.source === "admin_log" && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500/12 text-rose-400">Admin</span>
                          )}
                        </div>
                        <p className="text-xs truncate" style={{ color: "var(--admin-text-muted)" }}>{entry.detail}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                            <i className="ri-user-line mr-1"></i>{entry.actor}
                          </span>
                          {entry.ip && (
                            <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                              <i className="ri-global-line mr-1"></i>{entry.ip}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{timeAgo(entry.timestamp)}</p>
                        <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>
                          {new Date(entry.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <i className="ri-arrow-right-s-line text-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}></i>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <button onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap border"
                style={{ backgroundColor: "var(--admin-card)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>
                Tải thêm ({filtered.length - paginated.length} còn lại)
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
