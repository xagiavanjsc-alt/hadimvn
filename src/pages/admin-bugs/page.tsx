import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface BugReport {
  id: string;
  user_name: string;
  user_email: string;
  page_url: string;
  category: string;
  title: string;
  description: string;
  device_info: string;
  status: "open" | "in_progress" | "resolved" | "wontfix";
  admin_note: string;
  created_at: string;
}

interface VipViolation {
  id: string;
  reporter_name: string;
  suspected_email: string;
  reason: string;
  evidence: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  admin_note: string;
  created_at: string;
}

const STATUS_CONFIG = {
  open: { label: "Mới", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  in_progress: { label: "Đang xử lý", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  resolved: { label: "Đã xử lý", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  wontfix: { label: "Không fix", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  pending: { label: "Chờ xem xét", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  investigating: { label: "Đang điều tra", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  dismissed: { label: "Bỏ qua", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const CAT_ICONS: Record<string, string> = {
  bug: "ri-bug-line",
  ui: "ri-layout-line",
  content: "ri-file-warning-line",
  feature: "ri-settings-line",
  payment: "ri-vip-crown-line",
  other: "ri-question-line",
};

function BugDetailModal({ bug, onClose, onUpdate, onDelete }: {
  bug: BugReport;
  onClose: () => void;
  onUpdate: (id: string, status: string, note: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(bug.status);
  const [note, setNote] = useState(bug.admin_note || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(bug.id, status, note);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(bug.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const statusOptions = ["open", "in_progress", "resolved", "wontfix"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/12 flex items-center justify-center">
              <i className={`${CAT_ICONS[bug.category] || "ri-bug-line"} text-rose-400 text-sm`} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết báo cáo</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{bug.user_name} · {new Date(bug.created_at).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Tiêu đề</p>
            <p className="text-sm font-medium" style={{ color: "var(--admin-text)" }}>{bug.title}</p>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Mô tả</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--admin-text-muted)" }}>{bug.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Trang</p>
              <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{bug.page_url}</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Email</p>
              <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{bug.user_email || "—"}</p>
            </div>
          </div>
          {bug.device_info && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Thiết bị</p>
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--admin-text-faint)" }}>{bug.device_info}</p>
            </div>
          )}

          <div className="pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text-muted)" }}>Cập nhật trạng thái</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {statusOptions.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-left"
                    style={{
                      backgroundColor: status === s ? cfg.bg : "var(--admin-card2)",
                      borderColor: status === s ? cfg.color + "40" : "var(--admin-border)",
                    }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                    <span className="text-xs font-medium" style={{ color: status === s ? cfg.color : "var(--admin-text-muted)" }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Ghi chú admin</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={500}
              placeholder="Ghi chú về cách xử lý, nguyên nhân..."
              className="w-full rounded-xl px-3 py-2 text-sm outline-none border resize-none"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t flex-shrink-0" style={{ borderColor: "var(--admin-border)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
            style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <i className="ri-delete-bin-line mr-1"></i>Xóa
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "#ef444415" }}>
                <i className="ri-delete-bin-line text-xl" style={{ color: "#ef4444" }}></i>
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Xóa báo cáo lỗi này?</p>
              <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>
                Hành động này không thể hoàn tác. Báo cáo sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl border text-xs cursor-pointer"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
                  Hủy
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer">
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [violations, setViolations] = useState<VipViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bugs" | "violations">("bugs");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bugsRes, violationsRes] = await Promise.all([
        supabase.from("bug_reports").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("vip_violation_reports").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setBugs(bugsRes.data as BugReport[] || []);
      setViolations(violationsRes.data as VipViolation[] || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateBug = useCallback(async (id: string, status: string, note: string) => {
    const { error } = await supabase.from("bug_reports").update({
      status,
      admin_note: note,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { showToast("Lỗi cập nhật"); return; }
    setBugs(prev => prev.map(b => b.id === id ? { ...b, status: status as BugReport["status"], admin_note: note } : b));
    showToast("Đã cập nhật!");
  }, []);

  const deleteBug = useCallback(async (id: string) => {
    const { error } = await supabase.from("bug_reports").delete().eq("id", id);
    if (error) { showToast("Lỗi xóa"); return; }
    setBugs(prev => prev.filter(b => b.id !== id));
    showToast("Đã xóa báo cáo!");
  }, []);

  const updateViolation = useCallback(async (id: string, status: string, note: string) => {
    const { error } = await supabase.from("vip_violation_reports").update({ status, admin_note: note }).eq("id", id);
    if (error) { showToast("Lỗi cập nhật"); return; }
    setViolations(prev => prev.map(v => v.id === id ? { ...v, status: status as VipViolation["status"], admin_note: note } : v));
    showToast("Đã cập nhật!");
  }, []);

  const filteredBugs = statusFilter === "all" ? bugs : bugs.filter(b => b.status === statusFilter);
  const openCount = bugs.filter(b => b.status === "open").length;
  const inProgressCount = bugs.filter(b => b.status === "in_progress").length;
  const pendingViolations = violations.filter(v => v.status === "pending").length;

  return (
    <AdminLayout
      title="Báo cáo lỗi & Vi phạm"
      subtitle={`${openCount} lỗi mới · ${inProgressCount} đang xử lý · ${pendingViolations} vi phạm VIP chờ xem xét`}
      actions={
        <button onClick={fetchData}
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          <i className="ri-refresh-line" />Làm mới
        </button>
      }
    >
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white bg-emerald-600">
          <i className="ri-checkbox-circle-line mr-2" />{toast}
        </div>
      )}

      {selectedBug && (
        <BugDetailModal bug={selectedBug} onClose={() => setSelectedBug(null)} onUpdate={updateBug} onDelete={deleteBug} />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Lỗi mới", value: openCount, icon: "ri-bug-line", color: "#f87171" },
          { label: "Đang xử lý", value: inProgressCount, icon: "ri-loader-4-line", color: "#fb923c" },
          { label: "Đã giải quyết", value: bugs.filter(b => b.status === "resolved").length, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Vi phạm VIP", value: pendingViolations, icon: "ri-shield-cross-line", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }} />
            </div>
            <div>
              <p className="font-bold text-lg leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex bg-app-card/50 rounded-xl p-1 mb-5 border" style={{ borderColor: "var(--admin-border)" }}>
        <button onClick={() => setActiveTab("bugs")}
          className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap font-medium ${activeTab === "bugs" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
          <i className="ri-bug-line mr-1.5" />Báo cáo lỗi ({bugs.length})
        </button>
        <button onClick={() => setActiveTab("violations")}
          className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap font-medium relative ${activeTab === "violations" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
          <i className="ri-shield-cross-line mr-1.5" />Vi phạm VIP ({violations.length})
          {pendingViolations > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 flex items-center justify-center bg-rose-400 rounded-full text-[9px] font-bold text-white">{pendingViolations}</span>
          )}
        </button>
      </div>

      {activeTab === "bugs" && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "open", "in_progress", "resolved", "wontfix"].map(s => {
              const cfg = s === "all" ? { label: "Tất cả", color: "var(--admin-text-muted)" } : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
              const count = s === "all" ? bugs.length : bugs.filter(b => b.status === s).length;
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: statusFilter === s ? (s === "all" ? "var(--admin-hover)" : (STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] as { bg: string }).bg) : "var(--admin-card2)",
                    borderColor: statusFilter === s ? (s === "all" ? "var(--admin-border2)" : (STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] as { color: string }).color + "40") : "var(--admin-border)",
                    color: statusFilter === s ? (s === "all" ? "var(--admin-text)" : (STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] as { color: string }).color) : "var(--admin-text-muted)",
                  }}>
                  {(cfg as { label: string }).label} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : filteredBugs.length === 0 ? (
            <div className="text-center py-16">
              <i className="ri-checkbox-circle-line text-3xl mb-3" style={{ color: "var(--admin-text-faint)" }} />
              <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không có báo cáo nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBugs.map(bug => {
                const cfg = STATUS_CONFIG[bug.status] || STATUS_CONFIG.open;
                return (
                  <div key={bug.id}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl border cursor-pointer hover:bg-white/2 transition-colors"
                    style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
                    onClick={() => setSelectedBug(bug)}>
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(248,113,113,0.10)" }}>
                      <i className={`${CAT_ICONS[bug.category] || "ri-bug-line"} text-sm text-rose-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--admin-text)" }}>{bug.title}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <p className="text-xs truncate mb-1" style={{ color: "var(--admin-text-muted)" }}>{bug.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                          <i className="ri-user-line mr-1" />{bug.user_name}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                          <i className="ri-link mr-1" />{bug.page_url}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                          {new Date(bug.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-sm flex-shrink-0 mt-1" style={{ color: "var(--admin-text-faint)" }} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === "violations" && (
        <div className="space-y-2">
          {violations.length === 0 ? (
            <div className="text-center py-16">
              <i className="ri-shield-check-line text-3xl mb-3" style={{ color: "var(--admin-text-faint)" }} />
              <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Chưa có báo cáo vi phạm nào</p>
            </div>
          ) : violations.map(v => {
            const cfg = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            return (
              <div key={v.id} className="px-4 py-3.5 rounded-xl border"
                style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 flex-shrink-0">
                    <i className="ri-shield-cross-line text-sm text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                        Tài khoản nghi ngờ: <span className="text-rose-400">{v.suspected_email || "Không rõ"}</span>
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: (cfg as { bg: string }).bg, color: (cfg as { color: string }).color }}>{(cfg as { label: string }).label}</span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: "var(--admin-text-muted)" }}>{v.reason}</p>
                    {v.evidence && <p className="text-[10px] italic" style={{ color: "var(--admin-text-faint)" }}>Bằng chứng: {v.evidence}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                        Báo cáo bởi: {v.reporter_name}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                        {new Date(v.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => updateViolation(v.id, "investigating", "")}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
                      style={{ backgroundColor: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.20)" }}>
                      Điều tra
                    </button>
                    <button onClick={() => updateViolation(v.id, "resolved", "Đã xác nhận vi phạm")}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
                      style={{ backgroundColor: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.20)" }}>
                      Xác nhận
                    </button>
                    <button onClick={() => updateViolation(v.id, "dismissed", "")}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-faint)", border: "1px solid var(--admin-border)" }}>
                      Bỏ qua
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
