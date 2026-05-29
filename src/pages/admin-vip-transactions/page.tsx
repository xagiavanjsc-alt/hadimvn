import { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

// ─── Export helpers ───────────────────────────────────────────────────────────
function exportToCSV(transactions: VipTransaction[]) {
  const headers = ["ID", "Thành viên", "Loại hành động", "Loại VIP", "Số tiền (VNĐ)", "Admin thực hiện", "Ghi chú", "Ngày hết hạn VIP", "Thời gian"];
  const rows = transactions.map(tx => [
    tx.id,
    tx.display_name,
    ACTION_LABELS[tx.action_type]?.label || tx.action_type,
    tx.vip_type ? VIP_TYPE_LABELS[tx.vip_type]?.label || tx.vip_type : "—",
    tx.amount,
    tx.actor_name,
    tx.note,
    tx.vip_expires_at ? new Date(tx.vip_expires_at).toLocaleDateString("vi-VN") : "—",
    new Date(tx.created_at).toLocaleString("vi-VN"),
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vip-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToExcel(transactions: VipTransaction[]) {
  // Build HTML table that Excel can open
  const headers = ["ID", "Thành viên", "Loại hành động", "Loại VIP", "Số tiền (VNĐ)", "Admin thực hiện", "Ghi chú", "Ngày hết hạn VIP", "Thời gian"];
  const rows = transactions.map(tx => [
    tx.id,
    tx.display_name,
    ACTION_LABELS[tx.action_type]?.label || tx.action_type,
    tx.vip_type ? VIP_TYPE_LABELS[tx.vip_type]?.label || tx.vip_type : "—",
    tx.amount,
    tx.actor_name,
    tx.note,
    tx.vip_expires_at ? new Date(tx.vip_expires_at).toLocaleDateString("vi-VN") : "—",
    new Date(tx.created_at).toLocaleString("vi-VN"),
  ]);
  const tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>td{mso-number-format:"@";}</style></head><body><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vip-transactions-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface VipTransaction {
  id: string;
  user_id: string;
  display_name: string;
  action_type: "grant_vip" | "revoke_vip" | "auto_renew" | "expire";
  vip_type: "month" | "year" | null;
  amount: number;
  actor_name: string;
  note: string;
  created_at: string;
  vip_expires_at: string | null;
  // Additional properties from revenue log
  user_name?: string;
  granted_by?: string;
  granted_at?: string;
  expires_at?: string;
}

interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  is_vip: boolean;
  vip_expires_at: string | null;
  created_at: string;
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  grant_vip: { label: "Cấp VIP", color: "#34d399", icon: "ri-vip-crown-line" },
  revoke_vip: { label: "Thu hồi VIP", color: "#f87171", icon: "ri-vip-crown-2-line" },
  auto_renew: { label: "Tự động gia hạn", color: "#a78bfa", icon: "ri-refresh-line" },
  expire: { label: "Hết hạn", color: "#6b7280", icon: "ri-time-line" },
};

const VIP_TYPE_LABELS: Record<string, { label: string; price: number; color: string }> = {
  month: { label: "VIP Tháng", price: 79000, color: "#34d399" },
  year: { label: "VIP Năm", price: 708000, color: "#e8c84a" },
};

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({ tx, onViewUser }: { tx: VipTransaction; onViewUser: (id: string) => void }) {
  const action = ACTION_LABELS[tx.action_type] || ACTION_LABELS.grant_vip;
  const vipType = tx.vip_type ? VIP_TYPE_LABELS[tx.vip_type] : null;

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0 hover:bg-white/1 transition-colors"
      style={{ borderColor: "var(--admin-border)" }}
    >
      {/* Action icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${action.color}15` }}
      >
        <i className={`${action.icon} text-sm`} style={{ color: action.color }}></i>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onViewUser(tx.user_id)}
            className="text-sm font-semibold cursor-pointer hover:underline whitespace-nowrap"
            style={{ color: "var(--admin-text)" }}
          >
            {tx.display_name}
          </button>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
            style={{ backgroundColor: `${action.color}15`, color: action.color }}
          >
            {action.label}
          </span>
          {vipType && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
              style={{ backgroundColor: `${vipType.color}15`, color: vipType.color }}
            >
              {vipType.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
            <i className="ri-user-settings-line mr-1"></i>
            {tx.actor_name}
          </span>
          {tx.vip_expires_at && (
            <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
              <i className="ri-calendar-line mr-1"></i>
              Hết hạn: {new Date(tx.vip_expires_at).toLocaleDateString("vi-VN")}
            </span>
          )}
          {tx.note && (
            <span className="text-[10px] italic" style={{ color: "var(--admin-text-faint)" }}>
              &ldquo;{tx.note}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        {tx.amount > 0 ? (
          <p className="text-sm font-black" style={{ color: "#34d399" }}>
            +{formatVND(tx.amount)}
          </p>
        ) : tx.amount < 0 ? (
          <p className="text-sm font-black" style={{ color: "#f87171" }}>
            {formatVND(tx.amount)}
          </p>
        ) : (
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text-faint)" }}>—</p>
        )}
        <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>
          {new Date(tx.created_at).toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminVipTransactionsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "grant_vip" | "revoke_vip" | "auto_renew">("all");
  const [filterVipType, setFilterVipType] = useState<"all" | "month" | "year">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [page, setPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const PAGE_SIZE = 20;

  // ─── Pending payment requests (with coupon support) ─────────────────────────
  interface PendingPayment {
    id: string;
    user_id: string;
    email: string;
    amount: number;
    original_amount: number | null;
    billing_cycle: "monthly" | "yearly";
    proof_url: string;
    note: string | null;
    coupon_code: string | null;
    created_at: string;
    user_name?: string;
  }
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  const showPaymentToast = (msg: string) => {
    setPaymentToast(msg);
    setTimeout(() => setPaymentToast(null), 3000);
  };

  const fetchPendingPayments = useCallback(async () => {
    const { data } = await supabase
      .from("vip_payment_requests")
      .select("id, user_id, email, amount, original_amount, billing_cycle, proof_url, note, coupon_code, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!data) return;
    // Hydrate display names
    const ids = Array.from(new Set(data.map(d => d.user_id)));
    const { data: profs } = ids.length ? await supabase
      .from("user_profiles")
      .select("id, display_name")
      .in("id", ids) : { data: [] };
    const nameMap = new Map((profs ?? []).map(p => [p.id, p.display_name]));
    setPendingPayments(data.map(d => ({ ...d, user_name: nameMap.get(d.user_id) })) as PendingPayment[]);
  }, []);

  const handleApprovePayment = useCallback(async (p: PendingPayment) => {
    setProcessingId(p.id);
    try {
      const vipType: "month" | "year" = p.billing_cycle === "yearly" ? "year" : "month";
      const expiresAt = new Date(Date.now() + (vipType === "year" ? 365 : 30) * 86400000).toISOString();

      const grantRes = await supabase.functions.invoke("admin-grant-vip", {
        body: { action: "grant_vip", userId: p.user_id, vipType, expiresAt },
      });
      if (grantRes.error || grantRes.data?.error) {
        throw new Error(grantRes.error?.message || grantRes.data?.error || "Lỗi cấp VIP");
      }

      // Flip payment status. Trigger 119 auto-consumes the coupon redemption
      // and bumps coupons.usage_count.
      const { error: updErr } = await supabase
        .from("vip_payment_requests")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", p.id);
      if (updErr) throw updErr;

      showPaymentToast(`Đã duyệt và cấp ${vipType === "year" ? "VIP Năm" : "VIP Tháng"} cho ${p.user_name || p.email}`);
      await fetchPendingPayments();
    } catch (e) {
      console.error("[approve payment]", e);
      showPaymentToast("Lỗi duyệt thanh toán — kiểm tra console");
    } finally {
      setProcessingId(null);
    }
  }, [fetchPendingPayments]);

  const handleRejectPayment = useCallback(async (p: PendingPayment) => {
    if (!confirm(`Từ chối thanh toán của ${p.user_name || p.email}?\nCoupon (nếu có) sẽ được giải phóng để dùng lại.`)) return;
    setProcessingId(p.id);
    try {
      // Trigger 119 auto-releases the coupon redemption.
      const { error: updErr } = await supabase
        .from("vip_payment_requests")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", p.id);
      if (updErr) throw updErr;
      showPaymentToast(`Đã từ chối thanh toán của ${p.user_name || p.email}`);
      await fetchPendingPayments();
    } catch (e) {
      console.error("[reject payment]", e);
      showPaymentToast("Lỗi từ chối thanh toán");
    } finally {
      setProcessingId(null);
    }
  }, [fetchPendingPayments]);

  useEffect(() => { fetchPendingPayments(); }, [fetchPendingPayments]);

  // Build transactions from user_profiles + vip_revenue_log
  const [revenueLog, setRevenueLog] = useState<Array<{
    id: string;
    user_id: string;
    action: string;
    vip_type: string;
    amount: number;
    actor: string;
    note: string;
    created_at: string;
    vip_expires_at: string | null;
    user_name?: string;
    granted_by?: string;
    granted_at?: string;
    expires_at?: string;
  }>>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [usersRes, logRes] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("id, display_name, is_vip, vip_expires_at, created_at")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("vip_revenue_log")
          .select("*")
          .order("granted_at", { ascending: false })
          .limit(500),
      ]);
      setUsers(usersRes.data || []);
      setRevenueLog(logRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Build transactions list from revenue log + user profiles
  const transactions = useMemo<VipTransaction[]>(() => {
    const userMap = new Map(users.map(u => [u.id, u]));

    // From revenue log
    const fromLog: VipTransaction[] = revenueLog.map(log => ({
      id: log.id,
      user_id: log.user_id,
      display_name: userMap.get(log.user_id)?.display_name || log.user_name || `User ${log.user_id.slice(0, 8)}`,
      action_type: "grant_vip" as VipTransaction["action_type"],
      vip_type: (log.vip_type as "month" | "year") || null,
      amount: log.amount || 0,
      actor_name: log.granted_by ? `Admin (${log.granted_by.slice(0, 8)})` : "Admin",
      note: log.note || "",
      created_at: log.granted_at || log.id,
      vip_expires_at: log.expires_at,
    }));

    // From user_profiles (VIP users without log entries)
    const loggedUserIds = new Set(revenueLog.map(l => l.user_id));
    const fromProfiles: VipTransaction[] = users
      .filter(u => u.is_vip && !loggedUserIds.has(u.id))
      .map(u => {
        const daysLeft = u.vip_expires_at
          ? Math.floor((new Date(u.vip_expires_at).getTime() - Date.now()) / 86400000)
          : null;
        const vipType: "month" | "year" = daysLeft !== null && daysLeft > 30 ? "year" : "month";
        return {
          id: `profile_${u.id}`,
          user_id: u.id,
          display_name: u.display_name,
          action_type: "grant_vip",
          vip_type: vipType,
          amount: vipType === "year" ? 708000 : 79000,
          actor_name: "Admin",
          note: "Dữ liệu từ hồ sơ người dùng",
          created_at: u.created_at,
          vip_expires_at: u.vip_expires_at,
        };
      });

    return [...fromLog, ...fromProfiles].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [revenueLog, users]);

  // Filtered transactions
  const filtered = useMemo(() => {
    let list = transactions;
    if (filterType !== "all") list = list.filter(t => t.action_type === filterType);
    if (filterVipType !== "all") list = list.filter(t => t.vip_type === filterVipType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.display_name.toLowerCase().includes(q) ||
        t.actor_name.toLowerCase().includes(q) ||
        t.note.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filterType, filterVipType, searchQuery]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  // Stats
  const totalRevenue = transactions
    .filter(t => t.action_type === "grant_vip" || t.action_type === "auto_renew")
    .reduce((s, t) => s + t.amount, 0);
  const totalGrants = transactions.filter(t => t.action_type === "grant_vip").length;
  const totalRevokes = transactions.filter(t => t.action_type === "revoke_vip").length;
  const totalAutoRenew = transactions.filter(t => t.action_type === "auto_renew").length;
  const vipUsers = users.filter(u => u.is_vip).length;

  // Monthly revenue chart data
  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      months[d.toISOString().slice(0, 7)] = 0;
    }
    transactions
      .filter(t => t.action_type === "grant_vip" || t.action_type === "auto_renew")
      .forEach(t => {
        const m = t.created_at.slice(0, 7);
        if (m in months) months[m] += t.amount;
      });
    return Object.entries(months).map(([month, revenue]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("vi-VN", { month: "short" }),
      revenue,
    }));
  }, [transactions]);

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const handleViewUser = (userId: string) => {
    const u = users.find(u => u.id === userId);
    if (u) setSelectedUser(u);
  };

  return (
    <AdminLayout
      title="Lịch sử giao dịch VIP"
      subtitle="Theo dõi chi tiết từng lần cấp, gia hạn, thu hồi VIP"
      actions={
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "rgba(52,211,153,0.10)", color: "#34d399", border: "1px solid rgba(52,211,153,0.20)" }}
            >
              <i className="ri-download-2-line"></i>
              Xuất báo cáo
              <i className="ri-arrow-down-s-line"></i>
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-20 rounded-xl border overflow-hidden w-44"
                  style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}
                >
                  <button
                    onClick={() => { exportToCSV(filtered); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors text-left"
                    style={{ color: "var(--admin-text-muted)" }}
                  >
                    <i className="ri-file-text-line text-app-accent-success"></i>
                    Xuất CSV
                    <span className="ml-auto text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{filtered.length} dòng</span>
                  </button>
                  <button
                    onClick={() => { exportToExcel(filtered); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors text-left border-t"
                    style={{ color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}
                  >
                    <i className="ri-file-excel-2-line text-app-accent-success"></i>
                    Xuất Excel (.xls)
                    <span className="ml-auto text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{filtered.length} dòng</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={async () => {
              setLoading(true);
              const [usersRes, logRes] = await Promise.all([
                supabase.from("user_profiles").select("id, display_name, is_vip, vip_expires_at, created_at").order("created_at", { ascending: false }).limit(500),
                supabase.from("vip_revenue_log").select("*").order("granted_at", { ascending: false }).limit(500),
              ]);
              setUsers(usersRes.data || []);
              setRevenueLog(logRes.data || []);
              setLoading(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
          >
            <i className="ri-refresh-line"></i>
            Làm mới
          </button>
        </div>
      }
    >
      {/* Toast for payment actions */}
      {paymentToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-app-accent-success px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg">
          <i className="ri-checkbox-circle-line"></i>{paymentToast}
        </div>
      )}

      {/* ─── Pending payment requests ─────────────────────────────────────── */}
      {pendingPayments.length > 0 && (
        <div className="mb-6 rounded-2xl border" style={{ backgroundColor: "var(--admin-card)", borderColor: "rgba(251,146,60,0.30)" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(251,146,60,0.15)" }}>
                <i className="ri-time-line text-sm" style={{ color: "#fb923c" }}></i>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Đơn chờ duyệt</p>
                <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>{pendingPayments.length} đơn cần xử lý</p>
              </div>
            </div>
            <button
              onClick={() => void fetchPendingPayments()}
              className="text-[10px] px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
              style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}
            >
              <i className="ri-refresh-line mr-1"></i>Tải lại
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {pendingPayments.map(p => {
              const hasCoupon = !!p.coupon_code && p.original_amount && p.original_amount > p.amount;
              const discount = hasCoupon ? (p.original_amount as number) - p.amount : 0;
              const isProcessing = processingId === p.id;
              return (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4 flex-wrap" style={{ borderColor: "var(--admin-border)" }}>
                  {/* Proof thumbnail */}
                  <a href={p.proof_url} target="_blank" rel="noreferrer" className="flex-shrink-0 group">
                    <img
                      src={p.proof_url}
                      alt="Minh chứng"
                      loading="lazy"
                      className="w-14 h-14 rounded-xl object-cover bg-app-card/50 border border-app-border group-hover:border-app-accent-primary/50 transition-all"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </a>

                  {/* User + meta */}
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                        {p.user_name || p.email || `User ${p.user_id.slice(0, 8)}`}
                      </p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{ backgroundColor: p.billing_cycle === "yearly" ? "rgba(232,200,74,0.15)" : "rgba(52,211,153,0.15)", color: p.billing_cycle === "yearly" ? "#e8c84a" : "#34d399" }}
                      >
                        {p.billing_cycle === "yearly" ? "VIP Năm" : "VIP Tháng"}
                      </span>
                      {hasCoupon && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 bg-emerald-500/10 text-app-accent-success">
                          <i className="ri-coupon-3-line"></i>
                          {p.coupon_code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                        <i className="ri-time-line mr-1"></i>
                        {new Date(p.created_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {p.email && (
                        <span className="text-[10px] truncate max-w-[180px]" style={{ color: "var(--admin-text-faint)" }}>
                          <i className="ri-mail-line mr-1"></i>{p.email}
                        </span>
                      )}
                      {p.note && (
                        <span className="text-[10px] italic truncate max-w-[200px]" style={{ color: "var(--admin-text-faint)" }}>
                          &ldquo;{p.note}&rdquo;
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + discount */}
                  <div className="text-right flex-shrink-0">
                    {hasCoupon ? (
                      <>
                        <p className="text-[10px] line-through" style={{ color: "var(--admin-text-faint)" }}>
                          {formatVND(p.original_amount as number)}
                        </p>
                        <p className="text-sm font-black" style={{ color: "#34d399" }}>{formatVND(p.amount)}</p>
                        <p className="text-[10px] text-app-accent-success">−{formatVND(discount)}</p>
                      </>
                    ) : (
                      <p className="text-sm font-black" style={{ color: "#34d399" }}>{formatVND(p.amount)}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprovePayment(p)}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      style={{ backgroundColor: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.30)" }}
                    >
                      {isProcessing ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectPayment(p)}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      style={{ backgroundColor: "rgba(248,113,113,0.10)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
                    >
                      <i className="ri-close-line"></i>Từ chối
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Tổng doanh thu VIP", value: formatVND(totalRevenue), icon: "ri-money-dollar-circle-line", color: "#34d399" },
          { label: "Tổng giao dịch", value: transactions.length, icon: "ri-exchange-line", color: "#e8c84a" },
          { label: "Lần cấp VIP", value: totalGrants, icon: "ri-vip-crown-line", color: "#a78bfa" },
          { label: "Tự động gia hạn", value: totalAutoRenew, icon: "ri-refresh-line", color: "#fb923c" },
          { label: "VIP đang hoạt động", value: vipUsers, icon: "ri-user-star-line", color: "#f87171" },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div className="min-w-0">
              <p className="font-black text-lg leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Doanh thu VIP theo tháng</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>6 tháng gần nhất</p>
          </div>
          <span className="text-sm font-black" style={{ color: "#34d399" }}>{formatVND(totalRevenue)}</span>
        </div>
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          {monthlyRevenue.map((m, i) => {
            const pct = (m.revenue / maxRevenue) * 100;
            const isLast = i === monthlyRevenue.length - 1;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div
                    className="px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                    style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)", color: "var(--admin-text)" }}
                  >
                    {formatVND(m.revenue)}
                  </div>
                </div>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max(pct, 3)}%`,
                    backgroundColor: isLast ? "#34d399" : "#34d39960",
                  }}
                />
                <span className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Action type filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--admin-hover)" }}>
          {([
            { val: "all", label: "Tất cả" },
            { val: "grant_vip", label: "Cấp VIP" },
            { val: "revoke_vip", label: "Thu hồi" },
            { val: "auto_renew", label: "Tự động gia hạn" },
          ] as const).map(f => (
            <button
              key={f.val}
              onClick={() => { setFilterType(f.val); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: filterType === f.val ? "var(--admin-card)" : "transparent",
                color: filterType === f.val ? "var(--admin-text)" : "var(--admin-text-muted)",
                border: filterType === f.val ? "1px solid var(--admin-border)" : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* VIP type filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--admin-hover)" }}>
          {([
            { val: "all", label: "Tất cả loại" },
            { val: "month", label: "VIP Tháng" },
            { val: "year", label: "VIP Năm" },
          ] as const).map(f => (
            <button
              key={f.val}
              onClick={() => { setFilterVipType(f.val); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: filterVipType === f.val ? "var(--admin-card)" : "transparent",
                color: filterVipType === f.val ? "var(--admin-text)" : "var(--admin-text-muted)",
                border: filterVipType === f.val ? "1px solid var(--admin-border)" : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px]"
          style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
        >
          <i className="ri-search-line text-xs flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, admin..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--admin-text)" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="cursor-pointer flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}>
              <i className="ri-close-line text-xs"></i>
            </button>
          )}
        </div>

        <span className="text-xs flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}>
          {filtered.length} giao dịch
        </span>
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-exchange-line text-4xl mb-3 block" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không có giao dịch nào</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 border-b"
              style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-card2)" }}
            >
              <span className="text-[10px] tracking-normal font-semibold w-9" style={{ color: "var(--admin-text-faint)" }}>Loại</span>
              <span className="text-[10px] tracking-normal font-semibold" style={{ color: "var(--admin-text-faint)" }}>Thành viên & Chi tiết</span>
              <span className="text-[10px] tracking-normal font-semibold text-right" style={{ color: "var(--admin-text-faint)" }}>Số tiền / Thời gian</span>
            </div>

            {paginated.map(tx => (
              <TransactionRow key={tx.id} tx={tx} onViewUser={handleViewUser} />
            ))}

            {hasMore && (
              <div className="px-5 py-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                  style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
                >
                  Xem thêm ({filtered.length - paginated.length} giao dịch còn lại)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-sm rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết thành viên</p>
              <button onClick={() => setSelectedUser(null)} className="cursor-pointer" style={{ color: "var(--admin-text-faint)" }}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--admin-hover)" }}>
                  <i className="ri-user-line text-xl" style={{ color: "var(--admin-text-faint)" }}></i>
                </div>
                <div>
                  <p className="font-bold" style={{ color: "var(--admin-text)" }}>{selectedUser.display_name}</p>
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>ID: {selectedUser.id.slice(0, 16)}...</p>
                </div>
              </div>
              {[
                { label: "Trạng thái VIP", value: selectedUser.is_vip ? "Đang hoạt động" : "Không có VIP", color: selectedUser.is_vip ? "#34d399" : "#6b7280" },
                { label: "Hết hạn VIP", value: selectedUser.vip_expires_at ? new Date(selectedUser.vip_expires_at).toLocaleDateString("vi-VN") : "—", color: "var(--admin-text)" },
                { label: "Ngày đăng ký", value: new Date(selectedUser.created_at).toLocaleDateString("vi-VN"), color: "var(--admin-text)" },
                {
                  label: "Số giao dịch",
                  value: transactions.filter(t => t.user_id === selectedUser.id).length,
                  color: "#e8c84a",
                },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                  <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.label}</span>
                  <span className="text-sm font-bold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
