import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface CTVProfile {
  id: string;
  user_id: string;
  display_name: string;
  phone: string;
  bank_info: { bank?: string; account_number?: string; account_name?: string };
  ref_code: string;
  commission_rate: number;
  status: "pending" | "active" | "suspended";
  note: string;
  total_referred: number;
  total_sales: number;
  total_commission: number;
  paid_commission: number;
  created_at: string;
}

interface Commission {
  id: string;
  ctv_id: string;
  referred_user_name: string;
  vip_type: string;
  sale_amount: number;
  commission_amount: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
}

const STATUS_CONFIG = {
  pending:   { label: "Chờ duyệt",        cls: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
  active:    { label: "Hoạt động",         cls: "bg-emerald-500/15 border-emerald-500/30 text-app-accent-success" },
  suspended: { label: "Tạm dừng",          cls: "bg-rose-500/15 border-rose-500/30 text-rose-400" },
};

function fmt(n: number) { return n.toLocaleString("vi-VN") + "đ"; }

// ─── CTV Detail Modal ─────────────────────────────────────────────────────────
function CTVDetailModal({
  ctv,
  commissions,
  onUpdateStatus,
  onUpdateRate,
  onMarkPaid,
  onClose,
}: {
  ctv: CTVProfile;
  commissions: Commission[];
  onUpdateStatus: (id: string, status: CTVProfile["status"]) => Promise<void>;
  onUpdateRate: (id: string, rate: number) => Promise<void>;
  onMarkPaid: (ctvId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [rate, setRate] = useState(String(ctv.commission_rate));
  const [saving, setSaving] = useState(false);
  const pendingPay = commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d27] border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <div>
            <h2 className="text-base font-bold text-white/90">{ctv.display_name}</h2>
            <p className="text-xs text-app-text-muted">{ctv.phone} · <span className="font-mono">{ctv.ref_code}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/12 cursor-pointer">
            <i className="ri-close-line text-app-text-secondary"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Đã GT", value: ctv.total_referred + " người", color: "text-blue-400" },
              { label: "Doanh thu", value: fmt(ctv.total_sales), color: "text-app-accent-primary" },
              { label: "Hoa hồng", value: fmt(ctv.total_commission), color: "text-amber-400" },
              { label: "Chờ trả", value: fmt(pendingPay), color: "text-rose-400" },
            ].map((s, i) => (
              <div key={i} className="bg-app-card/50 border border-app-border rounded-xl p-3 text-center">
                <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-app-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bank info */}
          {ctv.bank_info?.account_number && (
            <div className="bg-app-card/50 border border-app-border rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold text-white/70 mb-2"><i className="ri-bank-line mr-2"></i>Tài khoản nhận tiền</p>
              <p className="text-app-text-muted">Ngân hàng: <span className="text-white/70">{ctv.bank_info.bank}</span></p>
              <p className="text-app-text-muted">Số TK: <span className="text-white/70 font-mono">{ctv.bank_info.account_number}</span></p>
              <p className="text-app-text-muted">Chủ TK: <span className="text-white/70">{ctv.bank_info.account_name}</span></p>
            </div>
          )}

          {/* Commission rate */}
          <div>
            <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">Tỉ lệ hoa hồng (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                min={0}
                max={100}
                step={0.5}
                className="w-28 px-3 py-2 bg-app-card/50 border border-app-border rounded-xl text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
              />
              <button
                onClick={async () => { setSaving(true); await onUpdateRate(ctv.id, parseFloat(rate)); setSaving(false); }}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 cursor-pointer transition-all"
              >
                Cập nhật
              </button>
            </div>
          </div>

          {/* Status actions */}
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2">Thay đổi trạng thái</p>
            <div className="flex gap-2 flex-wrap">
              {(["pending", "active", "suspended"] as CTVProfile["status"][]).map(s => (
                <button
                  key={s}
                  onClick={async () => { setSaving(true); await onUpdateStatus(ctv.id, s); setSaving(false); }}
                  disabled={ctv.status === s || saving}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all disabled:opacity-40 ${STATUS_CONFIG[s].cls}`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Pay button */}
          {pendingPay > 0 && (
            <button
              onClick={async () => { setSaving(true); await onMarkPaid(ctv.id); setSaving(false); }}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
            >
              <i className="ri-money-dollar-circle-line mr-2"></i>
              Đánh dấu đã thanh toán {fmt(pendingPay)}
            </button>
          )}

          {/* Commission list */}
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2">Lịch sử hoa hồng ({commissions.length})</p>
            {commissions.length === 0 ? (
              <p className="text-xs text-app-text-muted italic">Chưa có hoa hồng</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {commissions.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2 bg-app-card/30 rounded-lg text-xs">
                    <span className="flex-1 text-white/60 truncate">{c.referred_user_name || "Ẩn"}</span>
                    <span className="text-app-text-muted">{c.vip_type === "year" ? "VIP Năm" : "VIP Tháng"}</span>
                    <span className="font-bold text-app-accent-success">+{fmt(c.commission_amount)}</span>
                    <span className={`${c.status === "paid" ? "text-app-accent-success" : c.status === "cancelled" ? "text-app-text-muted" : "text-amber-400"}`}>
                      {c.status === "paid" ? "Đã trả" : c.status === "cancelled" ? "Huỷ" : "Chờ"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminCTVPage() {
  const [ctvs, setCtvs] = useState<CTVProfile[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CTVProfile | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | CTVProfile["status"]>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: ctvData }, { data: comData }] = await Promise.all([
      supabase.from("ctv_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("ctv_commissions").select("*").order("created_at", { ascending: false }),
    ]);
    setCtvs(ctvData || []);
    setCommissions(comData || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = ctvs;
    if (filterStatus !== "all") list = list.filter(c => c.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.display_name.toLowerCase().includes(q) || c.phone.includes(q) || c.ref_code.toLowerCase().includes(q));
    }
    return list;
  }, [ctvs, filterStatus, search]);

  // Stats
  const totalPending = ctvs.filter(c => c.status === "pending").length;
  const totalActive = ctvs.filter(c => c.status === "active").length;
  const totalCommission = commissions.reduce((s, c) => s + c.commission_amount, 0);
  const unpaidCommission = commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0);

  const handleUpdateStatus = async (id: string, status: CTVProfile["status"]) => {
    const { error } = await supabase.from("ctv_profiles").update({ status }).eq("id", id);
    if (error) { showToast("Lỗi: " + error.message); return; }
    setCtvs(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    showToast("Đã cập nhật trạng thái");
  };

  const handleUpdateRate = async (id: string, rate: number) => {
    const { error } = await supabase.from("ctv_profiles").update({ commission_rate: rate }).eq("id", id);
    if (error) { showToast("Lỗi: " + error.message); return; }
    setCtvs(prev => prev.map(c => c.id === id ? { ...c, commission_rate: rate } : c));
    showToast("Đã cập nhật tỉ lệ hoa hồng");
  };

  const handleMarkPaid = async (ctvId: string) => {
    const { error } = await supabase
      .from("ctv_commissions")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("ctv_id", ctvId)
      .eq("status", "pending");
    if (error) { showToast("Lỗi: " + error.message); return; }
    const paid = commissions.filter(c => c.ctv_id === ctvId && c.status === "pending").reduce((s, c) => s + c.commission_amount, 0);
    await supabase.from("ctv_profiles").update({
      paid_commission: (ctvs.find(c => c.id === ctvId)?.paid_commission || 0) + paid
    }).eq("id", ctvId);
    await load();
    showToast("Đã đánh dấu thanh toán");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
              <i className="ri-team-line text-rose-400"></i>Quản lý CTV
            </h1>
            <p className="text-sm text-app-text-secondary mt-1">Duyệt đơn, quản lý hoa hồng cộng tác viên</p>
          </div>
          <button onClick={load} className="px-3 py-2 rounded-xl text-xs bg-white/8 border border-app-border text-white/50 hover:bg-white/12 cursor-pointer">
            <i className="ri-refresh-line mr-1.5"></i>Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Chờ duyệt", value: totalPending, color: "text-amber-400", icon: "ri-time-line" },
            { label: "Đang hoạt động", value: totalActive, color: "text-app-accent-success", icon: "ri-user-star-line" },
            { label: "Tổng hoa hồng", value: fmt(totalCommission), color: "text-app-accent-primary", icon: "ri-coins-line" },
            { label: "Cần thanh toán", value: fmt(unpaidCommission), color: "text-rose-400", icon: "ri-wallet-3-line" },
          ].map((s, i) => (
            <div key={i} className="bg-app-card/50 border border-app-border rounded-2xl p-4">
              <i className={`${s.icon} text-xl ${s.color} mb-2 block`}></i>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-app-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên, SĐT, mã CTV..."
              className="w-full pl-9 pr-3 py-2 bg-app-card/50 border border-app-border rounded-xl text-sm text-white/70 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "pending", "active", "suspended"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${filterStatus === s ? "bg-rose-500 text-white" : "bg-white/8 border border-app-border text-white/50 hover:bg-white/12"}`}
              >
                {s === "all" ? `Tất cả (${ctvs.length})` : `${STATUS_CONFIG[s].label} (${ctvs.filter(c => c.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-app-text-muted">
            <i className="ri-loader-4-line animate-spin text-2xl mr-2"></i>Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-app-text-muted">
            <i className="ri-team-line text-4xl mb-2 block opacity-30"></i>
            <p className="text-sm">Không có CTV nào</p>
          </div>
        ) : (
          <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_100px_120px_120px_90px_80px] bg-app-card/70 px-4 py-2.5 text-[10px] font-semibold text-app-text-secondary border-b border-app-border">
              <span>CTV</span><span>Mã ref</span><span>Tỉ lệ</span><span>Đã GT</span><span>Hoa hồng</span><span>Trạng thái</span><span></span>
            </div>
            <div className="divide-y divide-white/5">
              {filtered.map(ctv => {
                const ctvComs = commissions.filter(c => c.ctv_id === ctv.id);
                const unpaid = ctvComs.filter(c => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0);
                const cfg = STATUS_CONFIG[ctv.status];
                return (
                  <div
                    key={ctv.id}
                    onClick={() => setSelected(ctv)}
                    className="grid grid-cols-[1fr_120px_100px_120px_120px_90px_80px] px-4 py-3 hover:bg-app-card/50 transition-colors cursor-pointer items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-white/90">{ctv.display_name}</p>
                      <p className="text-xs text-app-text-muted">{ctv.phone}</p>
                    </div>
                    <span className="text-xs font-mono text-rose-400">{ctv.ref_code}</span>
                    <span className="text-sm font-bold text-amber-400">{ctv.commission_rate}%</span>
                    <span className="text-sm text-white/60">{ctv.total_referred} người</span>
                    <div>
                      <p className="text-sm font-bold text-app-accent-success">{fmt(ctv.total_commission)}</p>
                      {unpaid > 0 && <p className="text-[10px] text-rose-400">Cần trả: {fmt(unpaid)}</p>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border w-fit ${cfg.cls}`}>{cfg.label}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(ctv); }}
                      className="text-xs text-app-text-muted hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <i className="ri-edit-line mr-1"></i>Sửa
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <CTVDetailModal
          ctv={selected}
          commissions={commissions.filter(c => c.ctv_id === selected.id)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRate={handleUpdateRate}
          onMarkPaid={handleMarkPaid}
          onClose={() => setSelected(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <i className="ri-checkbox-circle-fill"></i>{toast}
        </div>
      )}
    </AdminLayout>
  );
}
