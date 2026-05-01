import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useAdminToast } from "@/contexts/AdminToastContext";

type ErrorType = "api" | "auth" | "database" | "runtime" | "network" | "all";

interface ErrorLog {
  id: number;
  user_id: string | null;
  error_type: string;
  message: string;
  stack_trace: string | null;
  page_url: string | null;
  user_agent: string | null;
  is_resolved: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  api: { label: "API", color: "#fb923c", icon: "ri-cloud-line" },
  auth: { label: "Auth", color: "#f87171", icon: "ri-shield-keyhole-line" },
  database: { label: "Database", color: "#e8c84a", icon: "ri-database-2-line" },
  runtime: { label: "Runtime", color: "#f87171", icon: "ri-bug-line" },
  network: { label: "Network", color: "#60a5fa", icon: "ri-wifi-off-line" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function AdminErrorLogsPage() {
  const { showToast } = useAdminToast();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ErrorType | "all">("all");
  const [filterResolved, setFilterResolved] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (filterType !== "all") query = query.eq("error_type", filterType);
    if (filterResolved === "resolved") query = query.eq("is_resolved", true);
    else if (filterResolved === "unresolved") query = query.eq("is_resolved", false);

    const { data, error } = await query;
    if (error) {
      showToast({ type: "error", title: "Lỗi tải log", message: error.message });
    } else if (data) {
      setErrors(data as ErrorLog[]);
    }
    setLoading(false);
  }, [filterType, filterResolved, showToast]);

  useEffect(() => { fetchErrors(); }, [fetchErrors]);

  const handleResolve = async (id: number) => {
    const { error } = await supabase.from("error_logs").update({ is_resolved: true }).eq("id", id);
    if (error) {
      showToast({ type: "error", title: "Lỗi cập nhật", message: error.message });
      return;
    }
    setErrors(prev => prev.map(e => e.id === id ? { ...e, is_resolved: true } : e));
    if (selectedError?.id === id) setSelectedError(prev => prev ? { ...prev, is_resolved: true } : null);
    showToast({ type: "success", title: "Đã đánh dấu xử lý" });
  };

  const handleResolveAll = async () => {
    const ids = filtered.filter(e => !e.is_resolved).map(e => e.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("error_logs").update({ is_resolved: true }).in("id", ids);
    if (error) {
      showToast({ type: "error", title: "Lỗi cập nhật", message: error.message });
      return;
    }
    setErrors(prev => prev.map(e => ids.includes(e.id) ? { ...e, is_resolved: true } : e));
    showToast({ type: "success", title: `Đã xử lý ${ids.length} lỗi` });
  };

  const handleDeleteResolved = async () => {
    const { error } = await supabase.from("error_logs").delete().eq("is_resolved", true);
    if (error) {
      showToast({ type: "error", title: "Lỗi xóa", message: error.message });
      return;
    }
    setErrors(prev => prev.filter(e => !e.is_resolved));
    showToast({ type: "delete", title: "Đã xóa các lỗi đã xử lý" });
  };

  const filtered = useMemo(() => errors, [errors]);

  const stats = useMemo(() => ({
    total: errors.length,
    unresolved: errors.filter(e => !e.is_resolved).length,
    api: errors.filter(e => e.error_type === "api" && !e.is_resolved).length,
    auth: errors.filter(e => e.error_type === "auth" && !e.is_resolved).length,
    database: errors.filter(e => e.error_type === "database" && !e.is_resolved).length,
  }), [errors]);

  return (
    <AdminLayout title="Lỗi hệ thống" subtitle="Theo dõi và xử lý lỗi từ người dùng">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tổng lỗi", value: stats.total, color: "#a78bfa", icon: "ri-bug-line" },
            { label: "Chưa xử lý", value: stats.unresolved, color: "#f87171", icon: "ri-error-warning-line" },
            { label: "API lỗi", value: stats.api, color: "#fb923c", icon: "ri-cloud-line" },
            { label: "Auth lỗi", value: stats.auth, color: "#e8c84a", icon: "ri-shield-keyhole-line" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                </div>
                <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
            {(["all", "api", "auth", "database", "runtime", "network"] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: filterType === t ? "var(--admin-hover)" : "transparent", color: filterType === t ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
                {t === "all" ? "Tất cả" : TYPE_CONFIG[t]?.label || t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
            {(["unresolved", "resolved", "all"] as const).map(r => (
              <button key={r} onClick={() => setFilterResolved(r)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: filterResolved === r ? "var(--admin-hover)" : "transparent", color: filterResolved === r ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
                {r === "all" ? "Tất cả" : r === "unresolved" ? "Chưa xử lý" : "Đã xử lý"}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {stats.unresolved > 0 && (
            <button onClick={handleResolveAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">
              <i className="ri-checkbox-circle-line"></i>Xử lý tất cả
            </button>
          )}
          <button onClick={handleDeleteResolved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
            <i className="ri-delete-bin-line"></i>Xóa đã xử lý
          </button>
        </div>

        {/* Error list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <i className="ri-checkbox-circle-line text-emerald-400 text-4xl"></i>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không có lỗi nào</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "var(--admin-card2)", borderBottom: "1px solid var(--admin-border)" }}>
                  {["Loại", "Thông báo", "Trang", "Thời gian", "Trạng thái", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(err => {
                  const tc = TYPE_CONFIG[err.error_type] || TYPE_CONFIG.runtime;
                  return (
                    <tr key={err.id} className="border-t transition-colors cursor-pointer"
                      style={{ borderColor: "var(--admin-border)", backgroundColor: selectedError?.id === err.id ? "rgba(167,139,250,0.04)" : "transparent" }}
                      onClick={() => setSelectedError(err)}>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: `${tc.color}15`, color: tc.color }}>
                          <i className={`${tc.icon} mr-1`}></i>{tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[300px]">
                        <p className="truncate font-medium" style={{ color: "var(--admin-text)" }}>{err.message}</p>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--admin-text-muted)" }}>{err.page_url || "-"}</td>
                      <td className="px-4 py-3" style={{ color: "var(--admin-text-faint)" }}>{timeAgo(err.created_at)}</td>
                      <td className="px-4 py-3">
                        {err.is_resolved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                            <i className="ri-checkbox-circle-line mr-1"></i>Đã xử lý
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                            <i className="ri-error-warning-line mr-1"></i>Chưa xử lý
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        {!err.is_resolved && (
                          <button onClick={() => handleResolve(err.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                            style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399" }} title="Đánh dấu đã xử lý">
                            <i className="ri-checkbox-circle-line text-xs"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail drawer */}
        {selectedError && (
          <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelectedError(null)}>
            <div className="w-full max-w-lg h-full border-l flex flex-col overflow-hidden"
              style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--admin-border)" }}>
                <span className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết lỗi</span>
                <button onClick={() => setSelectedError(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Thông báo</p>
                  <p className="text-sm" style={{ color: "var(--admin-text)" }}>{selectedError.message}</p>
                </div>
                {selectedError.stack_trace && (
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Stack trace</p>
                    <pre className="text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap" style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
                      {selectedError.stack_trace}
                    </pre>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Loại</p>
                    <p className="text-sm" style={{ color: "var(--admin-text)" }}>{TYPE_CONFIG[selectedError.error_type]?.label || selectedError.error_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Trang</p>
                    <p className="text-sm" style={{ color: "var(--admin-text)" }}>{selectedError.page_url || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>User ID</p>
                    <p className="text-sm font-mono" style={{ color: "var(--admin-text)" }}>{selectedError.user_id || "Khách"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Thời gian</p>
                    <p className="text-sm" style={{ color: "var(--admin-text)" }}>{new Date(selectedError.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
                {selectedError.user_agent && (
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>User Agent</p>
                    <p className="text-xs break-all" style={{ color: "var(--admin-text-faint)" }}>{selectedError.user_agent}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--admin-border)" }}>
                {!selectedError.is_resolved && (
                  <button onClick={() => handleResolve(selectedError.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
                    <i className="ri-checkbox-circle-line mr-1"></i>Đánh dấu đã xử lý
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
