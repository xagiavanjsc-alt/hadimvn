import { useState, useMemo, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useAdminUsers, useLoginSessions, type AdminUser, type LoginSession } from "@/hooks/useAdminUsers";
import VirtualList from "@/components/base/VirtualList";
import { exportUsersCSV } from "@/utils/exportUtils";
import { supabase } from "@/lib/supabase";

// ─── VIP helpers ──────────────────────────────────────────────────────────────
function getVipType(user: AdminUser): "none" | "month" | "year" {
  if (!user.is_vip || !user.vip_expires_at) return "none";
  const daysLeft = Math.floor((new Date(user.vip_expires_at).getTime() - Date.now()) / 86400000);
  return daysLeft > 30 ? "year" : "month";
}
function getVipDaysLeft(user: AdminUser): number | null {
  if (!user.is_vip || !user.vip_expires_at) return null;
  return Math.floor((new Date(user.vip_expires_at).getTime() - Date.now()) / 86400000);
}

// ─── Send email via edge function ────────────────────────────────────────────
async function sendEmail(payload: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("send-email-resend", { body: payload });
  return res;
}

// ─── Bulk Action Modal ────────────────────────────────────────────────────────
function BulkActionModal({
  selectedUsers,
  onClose,
  onGrantVip,
  onSendEmail,
}: {
  selectedUsers: AdminUser[];
  onClose: () => void;
  onGrantVip: (userIds: string[], type: "month" | "year", expiresAt: string) => Promise<void>;
  onSendEmail: (users: AdminUser[], type: "vip_expiry_reminder" | "bulk_notification", extra?: Record<string, unknown>) => Promise<void>;
}) {
  const [action, setAction] = useState<"vip_grant" | "vip_revoke" | "email_expiry" | "email_bulk" | null>(null);
  const [vipType, setVipType] = useState<"month" | "year">("month");
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const getExpiresAt = () => {
    const d = new Date();
    if (vipType === "month") d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  };

  const handleExecute = async () => {
    if (!action) return;
    setSaving(true);
    setProgress(0);

    try {
      if (action === "vip_grant") {
        await onGrantVip(selectedUsers.map(u => u.id), vipType, getExpiresAt());
        setProgress(100);
      } else if (action === "vip_revoke") {
        for (let i = 0; i < selectedUsers.length; i++) {
          await supabase.functions.invoke("admin-grant-vip", {
            body: { action: "revoke_vip", userId: selectedUsers[i].id },
          });
          setProgress(Math.round(((i + 1) / selectedUsers.length) * 100));
        }
      } else if (action === "email_expiry") {
        await onSendEmail(selectedUsers, "vip_expiry_reminder");
        setProgress(100);
      } else if (action === "email_bulk") {
        await onSendEmail(selectedUsers, "bulk_notification", { bulkTitle, bulkBody });
        setProgress(100);
      }
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  const actions = [
    { id: "vip_grant" as const, icon: "ri-vip-crown-line", label: "Cấp VIP hàng loạt", color: "app-accent-primary", desc: `Cấp VIP cho ${selectedUsers.length} thành viên` },
    { id: "vip_revoke" as const, icon: "ri-close-circle-line", label: "Hủy VIP hàng loạt", color: "#f87171", desc: `Hủy VIP của ${selectedUsers.length} thành viên` },
    { id: "email_expiry" as const, icon: "ri-mail-send-line", label: "Gửi email nhắc gia hạn", color: "#fb923c", desc: "Gửi email nhắc gia hạn VIP" },
    { id: "email_bulk" as const, icon: "ri-broadcast-line", label: "Gửi email thông báo", color: "#a78bfa", desc: "Gửi email tùy chỉnh" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/12 flex items-center justify-center">
              <i className="ri-checkbox-multiple-line text-rose-400 text-sm"></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Bulk Actions</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{selectedUsers.length} thành viên được chọn</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-500/12 mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-app-accent-success text-3xl"></i>
            </div>
            <p className="font-bold text-base mb-1" style={{ color: "var(--admin-text)" }}>Hoàn thành!</p>
            <p className="text-sm mb-6" style={{ color: "var(--admin-text-muted)" }}>
              Đã thực hiện thành công cho {selectedUsers.length} thành viên
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
              Đóng
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Selected users preview */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedUsers.slice(0, 5).map(u => (
                <span key={u.id} className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
                  {u.display_name}
                </span>
              ))}
              {selectedUsers.length > 5 && (
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-faint)" }}>
                  +{selectedUsers.length - 5} khác
                </span>
              )}
            </div>

            {/* Action selector */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text-muted)" }}>Chọn hành động</p>
              <div className="grid grid-cols-2 gap-2">
                {actions.map(a => (
                  <button key={a.id} onClick={() => setAction(a.id)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all cursor-pointer text-left"
                    style={{
                      backgroundColor: action === a.id ? `${a.color}10` : "var(--admin-card2)",
                      borderColor: action === a.id ? `${a.color}35` : "var(--admin-border)",
                    }}>
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${a.color}15` }}>
                      <i className={`${a.icon} text-sm`} style={{ color: a.color }}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: action === a.id ? a.color : "var(--admin-text)" }}>{a.label}</p>
                      <p className="text-[10px] truncate" style={{ color: "var(--admin-text-faint)" }}>{a.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* VIP grant options */}
            {action === "vip_grant" && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text-muted)" }}>Loại VIP</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { type: "month" as const, label: "VIP Tháng", sub: "30 ngày", color: "#34d399" },
                    { type: "year" as const, label: "VIP Năm", sub: "365 ngày", color: "app-accent-primary" },
                  ]).map(opt => (
                    <button key={opt.type} onClick={() => setVipType(opt.type)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer"
                      style={{ backgroundColor: vipType === opt.type ? `${opt.color}10` : "var(--admin-card2)", borderColor: vipType === opt.type ? `${opt.color}35` : "var(--admin-border)" }}>
                      <i className="ri-vip-crown-line text-sm" style={{ color: vipType === opt.type ? opt.color : "var(--admin-text-faint)" }}></i>
                      <div>
                        <p className="text-xs font-bold" style={{ color: vipType === opt.type ? opt.color : "var(--admin-text-muted)" }}>{opt.label}</p>
                        <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk email options */}
            {action === "email_bulk" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Tiêu đề email</label>
                  <input value={bulkTitle} onChange={e => setBulkTitle(e.target.value)} placeholder="VD: Tính năng mới đã ra mắt!"
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none border"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Nội dung</label>
                  <textarea value={bulkBody} onChange={e => setBulkBody(e.target.value)} rows={4} maxLength={500}
                    placeholder="Nội dung email..."
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none border resize-none"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                  <p className="text-[10px] mt-1 text-right" style={{ color: "var(--admin-text-faint)" }}>{bulkBody.length}/500</p>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {saving && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Đang xử lý...</p>
                  <p className="text-xs font-bold" style={{ color: "#34d399" }}>{progress}%</p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                  <div className="h-full rounded-full transition-all duration-300 bg-emerald-400" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
              <button onClick={handleExecute} disabled={!action || saving || (action === "email_bulk" && (!bulkTitle.trim() || !bulkBody.trim()))}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {saving ? "Đang xử lý..." : `Thực hiện (${selectedUsers.length} người)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VIP Grant Modal ──────────────────────────────────────────────────────────
function VipGrantModal({ user, onClose, onGrant }: {
  user: AdminUser;
  onClose: () => void;
  onGrant: (userId: string, type: "month" | "year", expiresAt: string) => Promise<void>;
}) {
  const [vipType, setVipType] = useState<"month" | "year">("month");
  const [customDate, setCustomDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const getExpiresAt = () => {
    if (customDate) return new Date(customDate).toISOString();
    const d = new Date();
    if (vipType === "month") d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  };

  const handleGrant = async () => {
    setSaving(true);
    try {
      const expiresAt = getExpiresAt();
      await onGrant(user.id, vipType, expiresAt);
      if (sendEmail && user.email && user.email.includes("@")) {
        const { error: emailErr } = await supabase.functions.invoke("send-email-resend", {
          body: {
            type: "vip_granted",
            to: user.email,
            displayName: user.display_name,
            vipType,
            vipExpiresAt: new Date(expiresAt).toLocaleDateString("vi-VN"),
          },
        });
        if (emailErr) {
          console.warn("Email gửi không thành công:", emailErr);
        }
      }
      onClose();
    } catch (err) {
      console.error("Lỗi cấp VIP:", err);
    } finally {
      setSaving(false);
    }
  };

  const expiresAt = getExpiresAt();
  const daysLeft = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86400000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-app-accent-primary/12 flex items-center justify-center">
              <i className="ri-vip-crown-line text-app-accent-primary text-sm"></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Cấp VIP</p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{user.display_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {([
              { type: "month" as const, label: "VIP Tháng", sub: "30 ngày", color: "#34d399" },
              { type: "year" as const, label: "VIP Năm", sub: "365 ngày", color: "app-accent-primary" },
            ]).map(opt => (
              <button key={opt.type} onClick={() => setVipType(opt.type)}
                className="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer"
                style={{ backgroundColor: vipType === opt.type ? `${opt.color}10` : "var(--admin-card2)", borderColor: vipType === opt.type ? `${opt.color}40` : "var(--admin-border)" }}>
                <i className="ri-vip-crown-line text-xl" style={{ color: vipType === opt.type ? opt.color : "var(--admin-text-faint)" }}></i>
                <div className="text-center">
                  <p className="text-xs font-bold" style={{ color: vipType === opt.type ? opt.color : "var(--admin-text-muted)" }}>{opt.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--admin-text-muted)" }}>Ngày hết hạn tùy chỉnh <span style={{ color: "var(--admin-text-faint)" }}>(để trống = tự động)</span></p>
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
          <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.15)" }}>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              <span className="font-bold" style={{ color: "var(--admin-text)" }}>{user.display_name}</span> → VIP {vipType === "month" ? "Tháng" : "Năm"} đến{" "}
              <span className="font-bold" style={{ color: "app-accent-primary" }}>{new Date(expiresAt).toLocaleDateString("vi-VN")}</span> ({daysLeft} ngày)
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="w-4 h-4 rounded accent-rose-500" />
            <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Gửi email thông báo VIP cho thành viên</span>
          </label>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
            <button onClick={handleGrant} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-50 text-black font-bold text-sm cursor-pointer whitespace-nowrap">
              {saving ? "Đang cấp..." : "Cấp VIP ngay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Advanced Filter ──────────────────────────────────────────────────────────
interface AdvancedFilters {
  dateFrom: string; dateTo: string; xpMin: string; xpMax: string;
  streakMin: string; streakMax: string; activeWithin: "all" | "1d" | "7d" | "30d" | "inactive";
  vipType: "all" | "none" | "month" | "year";
}
const DEFAULT_FILTERS: AdvancedFilters = { dateFrom: "", dateTo: "", xpMin: "", xpMax: "", streakMin: "", streakMax: "", activeWithin: "all", vipType: "all" };
function hasActiveFilters(f: AdvancedFilters) {
  return f.dateFrom || f.dateTo || f.xpMin || f.xpMax || f.streakMin || f.streakMax || f.activeWithin !== "all" || f.vipType !== "all";
}

function AdvancedFilterPanel({ filters, onChange, onReset, resultCount }: {
  filters: AdvancedFilters; onChange: (f: AdvancedFilters) => void; onReset: () => void; resultCount: number;
}) {
  const set = (key: keyof AdvancedFilters, val: string) => onChange({ ...filters, [key]: val });
  const inputCls = "w-full rounded-lg px-3 py-2 text-xs outline-none border";
  const inputStyle = { backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" };
  return (
    <div className="rounded-2xl border p-4 mb-4 space-y-4" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ri-filter-3-line text-rose-400 text-sm"></i>
          <span className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>Bộ lọc nâng cao</span>
          {hasActiveFilters(filters) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold">Đang lọc · {resultCount} kết quả</span>}
        </div>
        {hasActiveFilters(filters) && <button onClick={onReset} className="text-xs cursor-pointer whitespace-nowrap" style={{ color: "var(--admin-text-muted)" }}><i className="ri-refresh-line mr-1"></i>Xóa bộ lọc</button>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] font-semibold mb-2 tracking-normal" style={{ color: "var(--admin-text-faint)" }}>Ngày đăng ký</p>
          <div className="space-y-2">
            <input type="date" value={filters.dateFrom} onChange={e => set("dateFrom", e.target.value)} className={inputCls} style={inputStyle} />
            <input type="date" value={filters.dateTo} onChange={e => set("dateTo", e.target.value)} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold mb-2 tracking-normal" style={{ color: "var(--admin-text-faint)" }}>XP tích lũy</p>
          <div className="space-y-2">
            <input type="number" min={0} placeholder="XP tối thiểu" value={filters.xpMin} onChange={e => set("xpMin", e.target.value)} className={inputCls} style={inputStyle} />
            <input type="number" min={0} placeholder="XP tối đa" value={filters.xpMax} onChange={e => set("xpMax", e.target.value)} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold mb-2 tracking-normal" style={{ color: "var(--admin-text-faint)" }}>Streak & Hoạt động</p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <input type="number" min={0} placeholder="Min" value={filters.streakMin} onChange={e => set("streakMin", e.target.value)} className={inputCls} style={inputStyle} />
              <input type="number" min={0} placeholder="Max" value={filters.streakMax} onChange={e => set("streakMax", e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <select value={filters.activeWithin} onChange={e => set("activeWithin", e.target.value)} className={inputCls + " cursor-pointer"} style={inputStyle}>
              <option value="all">Tất cả</option>
              <option value="1d">24 giờ qua</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="inactive">Không hoạt động &gt;30 ngày</option>
            </select>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold mb-2 tracking-normal" style={{ color: "var(--admin-text-faint)" }}>Loại VIP</p>
          <select value={filters.vipType} onChange={e => set("vipType", e.target.value)} className={inputCls + " cursor-pointer"} style={inputStyle}>
            <option value="all">Tất cả</option>
            <option value="none">Chưa có VIP</option>
            <option value="month">VIP Tháng</option>
            <option value="year">VIP Năm</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t" style={{ borderColor: "var(--admin-border)" }}>
        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>Nhanh:</span>
        {[
          { label: "VIP sắp hết hạn", action: () => onChange({ ...filters, vipType: "month" }) },
          { label: "VIP Năm", action: () => onChange({ ...filters, vipType: "year" }) },
          { label: "Không hoạt động", action: () => onChange({ ...filters, activeWithin: "inactive" }) },
          { label: "XP cao (>10k)", action: () => onChange({ ...filters, xpMin: "10000" }) },
        ].map(p => (
          <button key={p.label} onClick={p.action} className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────
function UserDetailDrawer({ user, onClose, onToggleVip, onToggleAdmin, onGrantVip }: {
  user: AdminUser; onClose: () => void;
  onToggleVip: (id: string, cur: boolean) => void;
  onToggleAdmin: (id: string, cur: boolean) => void;
  onGrantVip: (user: AdminUser) => void;
}) {
  const vipType = getVipType(user);
  const daysLeft = getVipDaysLeft(user);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendExpiryEmail = async () => {
    setSendingEmail(true);
    try {
      await supabase.functions.invoke("send-email-resend", {
        body: {
          type: "vip_expiry_reminder",
          to: user.email || `user-${user.id}@placeholder.com`,
          displayName: user.display_name,
          daysLeft: daysLeft || 7,
          vipExpiresAt: user.vip_expires_at ? new Date(user.vip_expires_at).toLocaleDateString("vi-VN") : "",
          vipType,
          renewUrl: `${window.location.origin}/pricing`,
        },
      });
      setEmailSent(true);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="w-[420px] min-h-screen flex flex-col border-l overflow-y-auto"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
          style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" /> : <i className="ri-user-line text-rose-400 text-base"></i>}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>{user.display_name}</p>
              <p className="text-xs truncate max-w-[180px]" style={{ color: "var(--admin-text-muted)" }}>{user.email || `ID: ${user.id.slice(0, 12)}...`}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {user.is_vip ? (
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: vipType === "year" ? "rgba(232,200,74,0.12)" : "rgba(52,211,153,0.10)", color: vipType === "year" ? "app-accent-primary" : "#34d399", border: `1px solid ${vipType === "year" ? "rgba(232,200,74,0.25)" : "rgba(52,211,153,0.20)"}` }}>
                <i className="ri-vip-crown-line mr-1"></i>VIP {vipType === "year" ? "Năm" : "Tháng"}
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>Free</span>
            )}
            {user.is_admin && (() => {
              const role = user.user_role || "super_admin";
              const map: Record<string, { label: string; color: string }> = {
                super_admin: { label: "Super Admin", color: "#f43f5e" },
                smod: { label: "SMod", color: "#a855f7" },
                moderator: { label: "Moderator", color: "#3b82f6" },
              };
              const r = map[role] || map.super_admin;
              return <span className="text-xs px-3 py-1 rounded-full font-medium border" style={{ backgroundColor: `${r.color}20`, color: r.color, borderColor: `${r.color}40` }}><i className="ri-shield-keyhole-line mr-1"></i>{r.label}</span>;
            })()}
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
              <i className="ri-calendar-line mr-1"></i>{new Date(user.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>

          {/* VIP expiry */}
          {user.is_vip && user.vip_expires_at && (
            <div className="px-4 py-3 rounded-xl space-y-2"
              style={{ backgroundColor: vipType === "year" ? "rgba(232,200,74,0.06)" : "rgba(52,211,153,0.06)", border: `1px solid ${vipType === "year" ? "rgba(232,200,74,0.15)" : "rgba(52,211,153,0.15)"}` }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: vipType === "year" ? "app-accent-primary" : "#34d399" }}>VIP {vipType === "year" ? "Năm" : "Tháng"}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${daysLeft !== null && daysLeft <= 7 ? "bg-rose-500/15 text-rose-400" : "bg-app-accent-success/15 text-app-accent-success"}`}>
                  {daysLeft !== null ? (daysLeft <= 0 ? "Đã hết hạn" : `Còn ${daysLeft} ngày`) : ""}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Hết hạn: <span className="font-semibold">{new Date(user.vip_expires_at).toLocaleDateString("vi-VN")}</span></p>
              {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                <button onClick={handleSendExpiryEmail} disabled={sendingEmail || emailSent}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  style={{ backgroundColor: emailSent ? "rgba(52,211,153,0.10)" : "rgba(251,146,60,0.10)", color: emailSent ? "#34d399" : "#fb923c", border: `1px solid ${emailSent ? "rgba(52,211,153,0.20)" : "rgba(251,146,60,0.20)"}` }}>
                  <i className={emailSent ? "ri-checkbox-circle-line" : "ri-mail-send-line"}></i>
                  {emailSent ? "Đã gửi email nhắc gia hạn" : sendingEmail ? "Đang gửi..." : "Gửi email nhắc gia hạn"}
                </button>
              )}
            </div>
          )}

          {/* Stats */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--admin-text-muted)" }}>Thống kê học tập</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "XP tổng", value: (user.xp_total || 0).toLocaleString(), icon: "ri-star-line", color: "app-accent-primary" },
                { label: "Streak", value: `${user.streak_count || 0} ngày`, icon: "ri-fire-line", color: "#fb923c" },
                { label: "Từ đã học", value: (user.words_learned || 0).toLocaleString(), icon: "ri-book-open-line", color: "#34d399" },
                { label: "Cấp độ", value: user.level || "A1", icon: "ri-bar-chart-line", color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Quản lý quyền</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onGrantVip(user)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: "rgba(232,200,74,0.10)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.20)" }}>
                <i className="ri-vip-crown-line"></i>Cấp / Gia hạn VIP
              </button>
              {user.is_vip && (
                <button onClick={() => onToggleVip(user.id, user.is_vip)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: "rgba(244,63,94,0.08)", color: "#f87171", border: "1px solid rgba(244,63,94,0.15)" }}>
                  <i className="ri-close-circle-line"></i>Hủy VIP
                </button>
              )}
              <button onClick={() => onToggleAdmin(user.id, user.is_admin)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: user.is_admin ? "rgba(244,63,94,0.10)" : "var(--admin-hover)", color: user.is_admin ? "#f87171" : "var(--admin-text-muted)", border: `1px solid ${user.is_admin ? "rgba(244,63,94,0.20)" : "var(--admin-border)"}` }}>
                <i className="ri-shield-keyhole-line"></i>{user.is_admin ? "Hủy Admin" : "Cấp Admin"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({ user, selected, onSelect, onToggleVip, onToggleAdmin, onViewDetail, onGrantVip }: {
  user: AdminUser; selected: boolean;
  onSelect: (id: string) => void;
  onToggleVip: (id: string, cur: boolean) => void;
  onToggleAdmin: (id: string, cur: boolean) => void;
  onViewDetail: (u: AdminUser) => void;
  onGrantVip: (u: AdminUser) => void;
}) {
  const vipType = getVipType(user);
  const daysLeft = getVipDaysLeft(user);
  const daysSinceActive = user.last_active ? Math.floor((Date.now() - new Date(user.last_active).getTime()) / 86400000) : null;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${selected ? "border-rose-500/30" : ""}`}
      style={{ backgroundColor: selected ? "rgba(244,63,94,0.04)" : "var(--admin-card2)", borderColor: selected ? "rgba(244,63,94,0.30)" : "var(--admin-border)" }}>
      {/* Checkbox */}
      <div className="flex-shrink-0" onClick={e => { e.stopPropagation(); onSelect(user.id); }}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${selected ? "bg-rose-500 border-rose-500" : "border-white/20 hover:border-rose-400"}`}>
          {selected && <i className="ri-check-line text-white text-[10px]"></i>}
        </div>
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer" style={{ backgroundColor: "var(--admin-hover)" }}
        onClick={() => onViewDetail(user)}>
        {user.avatar_url ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" /> : <i className="ri-user-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewDetail(user)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold truncate" style={{ color: "var(--admin-text)" }}>{user.display_name}</p>
          {user.is_admin && (() => {
            const role = user.user_role || "super_admin";
            const map: Record<string, { label: string; color: string }> = {
              super_admin: { label: "SUPER", color: "#f43f5e" },
              smod: { label: "SMOD", color: "#a855f7" },
              moderator: { label: "MOD", color: "#3b82f6" },
            };
            const r = map[role] || map.super_admin;
            return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${r.color}25`, color: r.color }}>{r.label}</span>;
          })()}
          {user.is_vip && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${vipType === "year" ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-accent-success/15 text-app-accent-success"}`}>
              VIP {vipType === "year" ? "Năm" : "Tháng"}
            </span>
          )}
        </div>
        <p className="text-[10px] truncate" style={{ color: "var(--admin-text-faint)" }}>
          {user.email ? user.email : `${user.level || "A1"} · ${new Date(user.created_at).toLocaleDateString("vi-VN")}`}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>XP</p>
          <p className="text-app-accent-primary text-xs font-bold">{(user.xp_total || 0).toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>Streak</p>
          <p className="text-orange-400 text-xs font-bold">{user.streak_count || 0}d</p>
        </div>
        {user.is_vip && daysLeft !== null && (
          <div className="text-center">
            <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>VIP còn</p>
            <p className={`text-xs font-bold ${daysLeft <= 7 ? "text-rose-400" : "text-app-accent-success"}`}>{daysLeft}d</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>Hoạt động</p>
          <p className="text-xs" style={{ color: daysSinceActive !== null && daysSinceActive <= 1 ? "#34d399" : daysSinceActive !== null && daysSinceActive <= 7 ? "app-accent-primary" : "var(--admin-text-faint)" }}>
            {daysSinceActive === null ? "—" : daysSinceActive === 0 ? "Hôm nay" : `${daysSinceActive}d`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button onClick={() => onGrantVip(user)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
          <i className="ri-vip-crown-line text-xs"></i>
        </button>
        <button onClick={() => onToggleAdmin(user.id, user.is_admin)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ backgroundColor: user.is_admin ? "rgba(244,63,94,0.12)" : "var(--admin-hover)", color: user.is_admin ? "#f87171" : "var(--admin-text-faint)" }}>
          <i className="ri-shield-keyhole-line text-xs"></i>
        </button>
        <button onClick={() => onViewDetail(user)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
          <i className="ri-eye-line text-xs"></i>
        </button>
      </div>
    </div>
  );
}

// ─── Login Sessions Panel ────────────────────────────────────────────────────
function LoginSessionsPanel() {
  const { sessions, loading, refetch } = useLoginSessions();
  const suspicious = sessions.filter(s => s.is_suspicious);

  const deviceIcon = (type: string) => {
    if (type === "mobile") return "ri-smartphone-line";
    if (type === "tablet") return "ri-tablet-line";
    return "ri-computer-line";
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Tổng phiên", value: sessions.length, icon: "ri-login-circle-line", color: "#34d399" },
          { label: "Bất thường", value: suspicious.length, icon: "ri-alarm-warning-line", color: "#f87171" },
          { label: "Hôm nay", value: sessions.filter(s => s.created_at.startsWith(new Date().toISOString().split("T")[0])).length, icon: "ri-calendar-check-line", color: "app-accent-primary" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-bold text-lg leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suspicious alert */}
      {suspicious.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)", color: "#f87171" }}>
          <i className="ri-shield-cross-line flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="font-bold mb-1">{suspicious.length} phiên đăng nhập bất thường</p>
            <p className="text-rose-300/70">Có thể là đăng nhập từ nhiều thiết bị cùng lúc hoặc nhiều lần trong thời gian ngắn. Kiểm tra ngay.</p>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Lịch sử đăng nhập gần đây</p>
          <button onClick={refetch} className="text-xs cursor-pointer" style={{ color: "var(--admin-text-faint)" }}>
            <i className="ri-refresh-line mr-1"></i>Làm mới
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10">
            <i className="ri-login-circle-line text-2xl mb-2" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Chưa có dữ liệu đăng nhập</p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-text-faint)" }}>Dữ liệu sẽ được ghi lại khi thành viên đăng nhập</p>
          </div>
        ) : (
          sessions.slice(0, 50).map((s: LoginSession) => (
            <div key={s.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              s.is_suspicious ? "border-rose-500/25 bg-rose-500/5" : "border-app-border bg-white/2"
            }`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 ${
                s.is_suspicious ? "bg-rose-500/15" : "bg-app-card/50"
              }`}>
                <i className={`${deviceIcon(s.device_type)} text-sm ${
                  s.is_suspicious ? "text-rose-400" : "text-app-text-secondary"
                }`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>
                    {s.device_type === "mobile" ? "Điện thoại" : s.device_type === "tablet" ? "Máy tính bảng" : "Máy tính"}
                  </p>
                  {s.is_suspicious && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold">
                      BẤT THƯỜNG
                    </span>
                  )}
                </div>
                <p className="text-[10px] truncate" style={{ color: "var(--admin-text-faint)" }}>
                  {s.suspicious_reason || s.user_agent?.slice(0, 60) || "—"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                  {new Date(s.created_at).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                  {new Date(s.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security tips */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "rgba(232,200,74,0.05)", border: "1px solid rgba(232,200,74,0.12)" }}>
        <p className="text-xs font-bold" style={{ color: "app-accent-primary" }}><i className="ri-shield-check-line mr-1.5"></i>Gợi ý bảo mật</p>
        <ul className="space-y-1.5">
          {[
            "Nếu thấy đăng nhập bất thường, liên hệ thành viên để xác nhận",
            "Tài khoản VIP không nên chia sẻ — 1 tài khoản chỉ dùng cho 1 người",
            "Đăng nhập từ nhiều IP khác nhau trong thời gian ngắn = dấu hiệu chia sẻ tài khoản",
            "Có thể hủy VIP nếu phát hiện vi phạm điều khoản sử dụng",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: "var(--admin-text-muted)" }}>
              <i className="ri-checkbox-circle-line text-app-accent-primary/60 flex-shrink-0 mt-0.5"></i>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { users, loading, error, refetch, updateVip, updateAdmin } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "vip" | "admin" | "free">("all");
  const [sortBy, setSortBy] = useState<"newest" | "xp" | "streak" | "active" | "vip_expiry">("newest");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advFilters, setAdvFilters] = useState<AdvancedFilters>(DEFAULT_FILTERS);
  const [actionMsg, setActionMsg] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [grantVipUser, setGrantVipUser] = useState<AdminUser | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"members" | "sessions">("members");

  const showMsg = (msg: string, type: "ok" | "err" = "ok") => {
    setActionMsg({ msg, type });
    setTimeout(() => setActionMsg(null), 2500);
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.display_name.toLowerCase().includes(q) ||
        u.id.includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    if (filterRole === "vip") list = list.filter(u => u.is_vip);
    else if (filterRole === "admin") list = list.filter(u => u.is_admin);
    else if (filterRole === "free") list = list.filter(u => !u.is_vip);
    if (advFilters.dateFrom) list = list.filter(u => new Date(u.created_at).getTime() >= new Date(advFilters.dateFrom).getTime());
    if (advFilters.dateTo) list = list.filter(u => new Date(u.created_at).getTime() <= new Date(advFilters.dateTo + "T23:59:59").getTime());
    if (advFilters.xpMin !== "") list = list.filter(u => (u.xp_total || 0) >= parseInt(advFilters.xpMin));
    if (advFilters.xpMax !== "") list = list.filter(u => (u.xp_total || 0) <= parseInt(advFilters.xpMax));
    if (advFilters.streakMin !== "") list = list.filter(u => (u.streak_count || 0) >= parseInt(advFilters.streakMin));
    if (advFilters.streakMax !== "") list = list.filter(u => (u.streak_count || 0) <= parseInt(advFilters.streakMax));
    if (advFilters.activeWithin !== "all") {
      const now = Date.now();
      if (advFilters.activeWithin === "inactive") list = list.filter(u => !u.last_active || (now - new Date(u.last_active).getTime()) > 30 * 86400000);
      else {
        const days = advFilters.activeWithin === "1d" ? 1 : advFilters.activeWithin === "7d" ? 7 : 30;
        list = list.filter(u => u.last_active && (now - new Date(u.last_active).getTime()) <= days * 86400000);
      }
    }
    if (advFilters.vipType !== "all") list = list.filter(u => getVipType(u) === advFilters.vipType);
    if (sortBy === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "xp") list.sort((a, b) => (b.xp_total || 0) - (a.xp_total || 0));
    else if (sortBy === "streak") list.sort((a, b) => (b.streak_count || 0) - (a.streak_count || 0));
    else if (sortBy === "active") list.sort((a, b) => (b.last_active ? new Date(b.last_active).getTime() : 0) - (a.last_active ? new Date(a.last_active).getTime() : 0));
    else if (sortBy === "vip_expiry") list.sort((a, b) => (a.vip_expires_at ? new Date(a.vip_expires_at).getTime() : Infinity) - (b.vip_expires_at ? new Date(b.vip_expires_at).getTime() : Infinity));
    return list;
  }, [users, search, filterRole, sortBy, advFilters]);

  const handleToggleVip = useCallback(async (id: string, cur: boolean) => {
    try {
      if (cur) {
        // Revoke VIP via edge function
        const res = await supabase.functions.invoke("admin-grant-vip", {
          body: { action: "revoke_vip", userId: id },
        });
        if (res.error || res.data?.error) throw new Error(res.error?.message || res.data?.error || "Lỗi");
      } else {
        await updateVip(id, true);
      }
      showMsg(!cur ? "Đã cấp VIP" : "Đã hủy VIP");
      setSelectedUser(prev => prev?.id === id ? { ...prev, is_vip: !cur } : prev);
      refetch();
    } catch { showMsg("Lỗi cập nhật VIP", "err"); }
  }, [updateVip, refetch]);

  const handleToggleAdmin = useCallback(async (id: string, cur: boolean) => {
    try {
      const res = await supabase.functions.invoke("admin-grant-vip", {
        body: { action: "toggle_admin", userId: id, isAdmin: !cur },
      });
      if (res.error || res.data?.error) throw new Error(res.error?.message || res.data?.error || "Lỗi");
      showMsg(!cur ? "Đã cấp Admin" : "Đã hủy Admin");
      setSelectedUser(prev => prev?.id === id ? { ...prev, is_admin: !cur } : prev);
      refetch();
    } catch { showMsg("Lỗi cập nhật Admin", "err"); }
  }, [refetch]);

  const handleGrantVip = useCallback(async (userId: string, type: "month" | "year", expiresAt: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("admin-grant-vip", {
      body: { action: "grant_vip", userId, vipType: type, expiresAt },
    });
    if (res.error) throw new Error(res.error.message || "Lỗi cấp VIP");
    if (res.data?.error) throw new Error(res.data.error);
    showMsg("Đã cấp VIP thành công!");
    refetch();
  }, [refetch]);

  const handleBulkGrantVip = useCallback(async (userIds: string[], type: "month" | "year", expiresAt: string) => {
    let granted = 0;
    for (const id of userIds) {
      const res = await supabase.functions.invoke("admin-grant-vip", {
        body: { action: "grant_vip", userId: id, vipType: type, expiresAt },
      });
      if (!res.error && !res.data?.error) granted++;
    }
    showMsg(`Đã cấp VIP cho ${granted}/${userIds.length} thành viên!`);
    refetch();
    setSelectedIds(new Set());
  }, [refetch]);

  const handleBulkEmail = useCallback(async (targetUsers: AdminUser[], type: "vip_expiry_reminder" | "bulk_notification", extra?: Record<string, unknown>) => {
    for (const u of targetUsers) {
      await supabase.functions.invoke("send-email-resend", {
        body: {
          type,
          to: u.email || `user-${u.id}@placeholder.com`,
          displayName: u.display_name,
          daysLeft: getVipDaysLeft(u) || 7,
          vipExpiresAt: u.vip_expires_at ? new Date(u.vip_expires_at).toLocaleDateString("vi-VN") : "",
          vipType: getVipType(u),
          renewUrl: `${window.location.origin}/pricing`,
          ...extra,
        },
      });
    }
    showMsg(`Đã gửi email cho ${targetUsers.length} thành viên!`);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(u => u.id)));
  };

  const selectedUsers = useMemo(() => users.filter(u => selectedIds.has(u.id)), [users, selectedIds]);
  const vipCount = users.filter(u => u.is_vip).length;
  const vipYearCount = users.filter(u => getVipType(u) === "year").length;
  const vipMonthCount = users.filter(u => getVipType(u) === "month").length;
  const adminCount = users.filter(u => u.is_admin).length;
  const activeToday = users.filter(u => u.last_active && Math.floor((Date.now() - new Date(u.last_active).getTime()) / 86400000) <= 1).length;
  const vipExpiringSoon = users.filter(u => { const d = getVipDaysLeft(u); return d !== null && d <= 7 && d > 0; }).length;

  return (
    <AdminLayout
      title="Quản lý Thành viên"
      subtitle={`${users.length} thành viên · ${vipCount} VIP (${vipYearCount} năm, ${vipMonthCount} tháng) · ${adminCount} admin`}
      actions={
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap bg-rose-500 hover:bg-rose-400 text-white">
              <i className="ri-checkbox-multiple-line"></i>Bulk ({selectedIds.size})
            </button>
          )}
          <button onClick={refetch} className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
            <i className="ri-refresh-line"></i>Làm mới
          </button>
          <button onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: showAdvanced || hasActiveFilters(advFilters) ? "rgba(244,63,94,0.12)" : "var(--admin-hover)", color: showAdvanced || hasActiveFilters(advFilters) ? "#f87171" : "var(--admin-text-muted)", border: `1px solid ${showAdvanced || hasActiveFilters(advFilters) ? "rgba(244,63,94,0.25)" : "var(--admin-border)"}` }}>
            <i className="ri-filter-3-line"></i>Bộ lọc
          </button>
          <button onClick={() => exportUsersCSV(users)}
            className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "rgba(52,211,153,0.10)", color: "#34d399", border: "1px solid rgba(52,211,153,0.20)" }}>
            <i className="ri-download-2-line"></i>Export CSV
          </button>
        </div>
      }
    >
      {actionMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white ${actionMsg.type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <i className={`${actionMsg.type === "ok" ? "ri-checkbox-circle-line" : "ri-error-warning-line"} mr-2`}></i>{actionMsg.msg}
        </div>
      )}

      {/* Main tab switcher */}
      <div className="flex bg-app-card/50 rounded-xl p-1 mb-5 border" style={{ borderColor: "var(--admin-border)" }}>
        <button
          onClick={() => setActiveMainTab("members")}
          className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap font-medium ${
            activeMainTab === "members" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/60"
          }`}
        >
          <i className="ri-user-line mr-1.5"></i>Thành viên ({users.length})
        </button>
        <button
          onClick={() => setActiveMainTab("sessions")}
          className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap font-medium relative ${
            activeMainTab === "sessions" ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/60"
          }`}
        >
          <i className="ri-shield-keyhole-line mr-1.5"></i>Đăng nhập & Bảo mật
        </button>
      </div>

      {activeMainTab === "sessions" && <LoginSessionsPanel />}

      {activeMainTab === "members" && <>
      {/* Summary cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: "Tổng thành viên", value: users.length, icon: "ri-user-line", color: "#f87171" },
          { label: "VIP Năm", value: vipYearCount, icon: "ri-vip-crown-2-line", color: "app-accent-primary" },
          { label: "VIP Tháng", value: vipMonthCount, icon: "ri-vip-crown-line", color: "#34d399" },
          { label: "Admin", value: adminCount, icon: "ri-shield-keyhole-line", color: "#a78bfa" },
          { label: "Hoạt động hôm nay", value: activeToday, icon: "ri-pulse-line", color: "#34d399" },
          { label: "VIP sắp hết hạn", value: vipExpiringSoon, icon: "ri-alarm-warning-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* VIP expiring warning */}
      {vipExpiringSoon > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-xs"
          style={{ backgroundColor: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.20)", color: "#fb923c" }}>
          <i className="ri-alarm-warning-line flex-shrink-0"></i>
          <span><strong>{vipExpiringSoon} thành viên VIP</strong> sắp hết hạn trong 7 ngày. Gửi email nhắc gia hạn hàng loạt?</span>
          <button onClick={() => {
            setAdvFilters(f => ({ ...f, vipType: "month" }));
            const expiring = users.filter(u => { const d = getVipDaysLeft(u); return d !== null && d <= 7 && d > 0; });
            setSelectedIds(new Set(expiring.map(u => u.id)));
            setShowBulkModal(true);
          }} className="ml-auto text-xs font-bold cursor-pointer whitespace-nowrap underline">
            Gửi email ngay ({vipExpiringSoon})
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Select all checkbox */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.size === filtered.length && filtered.length > 0 ? "bg-rose-500 border-rose-500" : "border-white/20 hover:border-rose-400"}`}
            onClick={toggleSelectAll}>
            {selectedIds.size === filtered.length && filtered.length > 0 && <i className="ri-check-line text-white text-[10px]"></i>}
          </div>
          {selectedIds.size > 0 && <span className="text-xs font-semibold" style={{ color: "#f87171" }}>{selectedIds.size} đã chọn</span>}
        </div>

        <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px] border"
          style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
          <i className="ri-search-line text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc ID..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--admin-text)" }} />
          {search && <button onClick={() => setSearch("")} className="cursor-pointer" style={{ color: "var(--admin-text-faint)" }}><i className="ri-close-line text-sm"></i></button>}
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as typeof filterRole)}
          className="rounded-lg px-3 py-2 text-xs outline-none cursor-pointer border"
          style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>
          <option value="all">Tất cả</option>
          <option value="vip">Chỉ VIP</option>
          <option value="admin">Chỉ Admin</option>
          <option value="free">Chỉ Free</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg px-3 py-2 text-xs outline-none cursor-pointer border"
          style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>
          <option value="newest">Mới nhất</option>
          <option value="xp">XP cao nhất</option>
          <option value="streak">Streak cao nhất</option>
          <option value="active">Hoạt động gần đây</option>
          <option value="vip_expiry">VIP sắp hết hạn</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: "var(--admin-text-faint)" }}>{filtered.length}/{users.length}</span>
      </div>

      {showAdvanced && (
        <AdvancedFilterPanel filters={advFilters} onChange={setAdvFilters}
          onReset={() => setAdvFilters(DEFAULT_FILTERS)} resultCount={filtered.length} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Đang tải từ Supabase...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <i className="ri-error-warning-line text-rose-400 text-3xl mb-3"></i>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--admin-text)" }}>Lỗi tải dữ liệu</p>
          <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>{error}</p>
          <button onClick={refetch} className="px-4 py-2 rounded-xl bg-rose-500/15 text-rose-400 text-xs cursor-pointer whitespace-nowrap">
            <i className="ri-refresh-line mr-1"></i>Thử lại
          </button>
        </div>
      ) : (
        <VirtualList
          items={filtered}
          itemHeight={72}
          containerHeight={520}
          overscan={8}
          renderItem={(user: unknown) => (
            <UserRow user={user as AdminUser}
              selected={selectedIds.has((user as AdminUser).id)}
              onSelect={toggleSelect}
              onToggleVip={handleToggleVip}
              onToggleAdmin={handleToggleAdmin}
              onViewDetail={setSelectedUser}
              onGrantVip={setGrantVipUser}
            />
          )}
          emptyState={
            <div className="text-center py-16">
              <i className="ri-user-search-line text-3xl mb-3" style={{ color: "var(--admin-text-faint)" }}></i>
              <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không tìm thấy thành viên nào</p>
            </div>
          }
        />
      )}

      {selectedUser && (
        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)}
          onToggleVip={handleToggleVip} onToggleAdmin={handleToggleAdmin} onGrantVip={setGrantVipUser} />
      )}
      {grantVipUser && (
        <VipGrantModal user={grantVipUser} onClose={() => setGrantVipUser(null)} onGrant={handleGrantVip} />
      )}
      {showBulkModal && selectedUsers.length > 0 && (
        <BulkActionModal
          selectedUsers={selectedUsers}
          onClose={() => { setShowBulkModal(false); setSelectedIds(new Set()); }}
          onGrantVip={handleBulkGrantVip}
          onSendEmail={handleBulkEmail}
        />
      )}
      </>
      }
    </AdminLayout>
  );
}


