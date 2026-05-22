import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface CTVProfile {
  id: string;
  display_name: string;
  phone: string;
  bank_info: { bank?: string; account_number?: string; account_name?: string };
  ref_code: string;
  commission_rate: number;
  status: "pending" | "active" | "suspended";
  total_referred: number;
  total_sales: number;
  total_commission: number;
  paid_commission: number;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  note: string;
  admin_note: string;
  created_at: string;
  processed_at: string | null;
}

const WD_STATUS = {
  pending:  { label: "Đang xử lý", cls: "text-amber-400",  icon: "ri-time-line" },
  approved: { label: "Đã duyệt",   cls: "text-blue-400",   icon: "ri-checkbox-circle-line" },
  rejected: { label: "Từ chối",    cls: "text-rose-400",   icon: "ri-close-circle-line" },
  paid:     { label: "Đã thanh toán", cls: "text-app-accent-success", icon: "ri-bank-card-line" },
};

interface Commission {
  id: string;
  referred_user_name: string;
  vip_type: string;
  sale_amount: number;
  commission_amount: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  paid_at: string | null;
}

const VIP_LABELS: Record<string, string> = { month: "VIP Tháng", year: "VIP Năm" };
const STATUS_CONFIG = {
  pending: { label: "Chờ duyệt", cls: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
  active:  { label: "Đang hoạt động", cls: "bg-emerald-500/15 border-emerald-500/30 text-app-accent-success" },
  suspended: { label: "Tạm dừng", cls: "bg-rose-500/15 border-rose-500/30 text-rose-400" },
};
const COM_STATUS = {
  pending:   { label: "Chờ thanh toán", cls: "text-amber-400" },
  paid:      { label: "Đã thanh toán", cls: "text-app-accent-success" },
  cancelled: { label: "Đã huỷ", cls: "text-app-text-muted" },
};

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSubmit }: { onSubmit: (data: { display_name: string; phone: string }) => Promise<void> }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    await onSubmit({ display_name: name.trim(), phone: phone.trim() });
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-rose-500/15 mb-4">
          <i className="ri-team-line text-rose-400 text-3xl"></i>
        </div>
        <h1 className="text-xl font-bold text-white/90 mb-2">Trở thành Cộng Tác Viên</h1>
        <p className="text-sm text-app-text-secondary">
          Chia sẻ link mời bạn bè học tiếng Hàn — nhận <span className="text-rose-400 font-bold">20% hoa hồng</span> mỗi khi họ mua VIP
        </p>
      </div>

      <div className="bg-app-card/50 border border-app-border rounded-2xl p-6 mb-6 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: "ri-links-line", label: "Nhận link riêng", desc: "Duy nhất của bạn" },
          { icon: "ri-share-forward-line", label: "Chia sẻ bạn bè", desc: "Facebook, Zalo..." },
          { icon: "ri-money-dollar-circle-line", label: "Nhận hoa hồng", desc: "20% mỗi đơn VIP" },
        ].map((item, i) => (
          <div key={i}>
            <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-rose-500/15 mb-2">
              <i className={`${item.icon} text-rose-400 text-lg`}></i>
            </div>
            <p className="text-xs font-semibold text-white/80">{item.label}</p>
            <p className="text-[10px] text-app-text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-app-card/50 border border-app-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">Họ tên CTV *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            required
            className="w-full px-3 py-2.5 bg-app-surface border border-app-border rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">Số điện thoại *</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="0912 345 678"
            required
            className="w-full px-3 py-2.5 bg-app-surface border border-app-border rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
          />
        </div>
        <p className="text-[10px] text-app-text-muted">Admin sẽ duyệt đơn trong vòng 24h. Sau khi được duyệt bạn sẽ nhận link riêng.</p>
        <button
          type="submit"
          disabled={loading || !name || !phone}
          className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold cursor-pointer disabled:opacity-50 transition-all"
        >
          {loading ? <i className="ri-loader-4-line animate-spin mr-2"></i> : <i className="ri-send-plane-line mr-2"></i>}
          Gửi đơn đăng ký
        </button>
      </form>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CTVPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CTVProfile | null | undefined>(undefined);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "commissions" | "withdraw" | "settings">("overview");
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Settings state
  const [editRefCode, setEditRefCode] = useState("");
  const [editBank, setEditBank] = useState<{ bank: string; account_number: string; account_name: string }>({ bank: "", account_number: "", account_name: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  // Withdrawal state
  const [wdAmount, setWdAmount] = useState("");
  const [wdNote, setWdNote] = useState("");
  const [submittingWd, setSubmittingWd] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase.from("ctv_profiles").select("*").eq("user_id", user.id).maybeSingle();
    setProfile(data || null);
    if (data) {
      setEditRefCode(data.ref_code);
      setEditBank({ bank: data.bank_info?.bank || "", account_number: data.bank_info?.account_number || "", account_name: data.bank_info?.account_name || "" });
      const [{ data: coms }, { data: wds }] = await Promise.all([
        supabase.from("ctv_commissions").select("*").eq("ctv_id", data.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("ctv_withdrawals").select("*").eq("ctv_id", data.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setCommissions(coms || []);
      setWithdrawals(wds || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleRegister = async ({ display_name, phone }: { display_name: string; phone: string }) => {
    if (!user?.id) return;
    const ref_code = `HQO-${user.id.slice(-6).toUpperCase()}`;
    const { error } = await supabase.from("ctv_profiles").insert({ user_id: user.id, display_name, phone, ref_code, status: "pending" });
    if (error) { showToast("Lỗi: " + error.message, "err"); return; }
    showToast("Đã gửi đơn! Admin sẽ duyệt trong 24h.");
    load();
  };

  const handleSaveSettings = async () => {
    if (!profile) return;
    const code = editRefCode.trim().toUpperCase();
    if (!code || code.length < 4) { showToast("Mã CTV tối thiểu 4 ký tự", "err"); return; }
    if (!/^[A-Z0-9-]+$/.test(code)) { showToast("Mã CTV chỉ được dùng A-Z, 0-9, dấu -", "err"); return; }
    setSavingSettings(true);
    const { error } = await supabase.from("ctv_profiles").update({
      ref_code: code,
      bank_info: editBank,
    }).eq("id", profile.id);
    setSavingSettings(false);
    if (error) { showToast(error.message.includes("unique") ? "Mã CTV đã có người dùng, hãy chọn mã khác" : "Lỗi: " + error.message, "err"); return; }
    showToast("Đã lưu thông tin");
    load();
  };

  const handleWithdraw = async () => {
    if (!profile) return;
    if (submittingWd) return; // belt-and-braces against rapid clicks
    const amount = parseInt(wdAmount.replace(/\D/g, ""));
    if (!amount || amount < 50000) { showToast("Số tiền rút tối thiểu 50.000đ", "err"); return; }
    if (amount > canWithdraw) { showToast("Số tiền vượt quá số dư có thể rút", "err"); return; }
    if (!profile.bank_info?.account_number) { showToast("Vui lòng cập nhật thông tin ngân hàng trước", "err"); return; }
    setSubmittingWd(true);
    try {
      const { error } = await supabase.from("ctv_withdrawals").insert({
        ctv_id: profile.id,
        amount,
        bank_info: profile.bank_info,
        note: wdNote.trim(),
      });
      if (error) {
        // 23505 = unique_violation on the partial-unique-pending index → user already has 1 pending
        const msg = error.code === "23505"
          ? "Bạn đã có một yêu cầu rút tiền đang chờ duyệt"
          : "Lỗi: " + error.message;
        showToast(msg, "err");
        return;
      }
      setWdAmount("");
      setWdNote("");
      // Refresh state BEFORE re-enabling the button so the next click sees the
      // updated balance, not the stale one.
      await load();
      showToast("Đã gửi yêu cầu rút tiền. Admin sẽ xử lý trong 1-3 ngày.");
    } finally {
      setSubmittingWd(false);
    }
  };

  const referralLink = profile ? `https://hanquocoi.vn?ref=${profile.ref_code}` : "";
  const handleCopy = (type: "link" | "code") => {
    navigator.clipboard.writeText(type === "link" ? referralLink : (profile?.ref_code || ""));
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  };

  const pendingCommission = useMemo(() => commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0), [commissions]);
  const pendingWithdrawal = useMemo(() => withdrawals.filter(w => w.status === "pending" || w.status === "approved").reduce((s, w) => s + w.amount, 0), [withdrawals]);
  const canWithdraw = Math.max(0, pendingCommission - pendingWithdrawal);

  if (loading || profile === undefined) {
    return (
      <DashboardLayout title="Cộng Tác Viên">
        <div className="flex items-center justify-center py-20">
          <i className="ri-loader-4-line animate-spin text-2xl text-app-text-muted"></i>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cộng Tác Viên" subtitle="Dashboard CTV · Hàn Quốc Ơi!">
      {profile === null ? (
        <RegisterForm onSubmit={handleRegister} />
      ) : (
        <div className="max-w-4xl mx-auto py-4 px-2">

          {/* Header card */}
          <div className="relative bg-gradient-to-br from-rose-500/15 via-transparent to-transparent border border-rose-500/20 rounded-2xl p-5 mb-5 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(244,63,94,0.12)_0%,_transparent_65%)] pointer-events-none"></div>
            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-star-line text-rose-400 text-xl"></i>
                </div>
                <div>
                  <p className="font-black text-white/90 text-base">{profile.display_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">{profile.ref_code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      profile.status === "active" ? "bg-emerald-500/15 border-emerald-500/30 text-app-accent-success" :
                      profile.status === "pending" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" :
                      "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    }`}>
                      {profile.status === "active" ? "● Đang hoạt động" : profile.status === "pending" ? "◌ Chờ duyệt" : "✕ Tạm dừng"}
                    </span>
                    <span className="text-[10px] text-app-text-muted">Hoa hồng: <span className="font-bold text-amber-400">{profile.commission_rate}%</span></span>
                  </div>
                </div>
              </div>
              <Link to="/ctv-info" className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors">
                <i className="ri-information-line"></i>Quyền lợi CTV
              </Link>
            </div>
          </div>

          {profile.status === "pending" && (
            <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400">
              <i className="ri-time-line text-lg flex-shrink-0"></i>
              Đơn đăng ký đang chờ admin duyệt. Sau khi duyệt bạn sẽ có link CTV riêng.
            </div>
          )}
          {profile.status === "suspended" && (
            <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400">
              <i className="ri-error-warning-line text-lg flex-shrink-0"></i>
              Tài khoản CTV đang bị tạm dừng. Vui lòng liên hệ admin.
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-app-card/30 border border-app-border rounded-xl p-1">
            {([
              { key: "overview",     icon: "ri-dashboard-line",       label: "Tổng quan" },
              { key: "commissions",  icon: "ri-coins-line",            label: "Hoa hồng" },
              { key: "withdraw",     icon: "ri-bank-card-line",        label: "Rút tiền" },
              { key: "settings",     icon: "ri-settings-3-line",       label: "Cài đặt" },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${tab === t.key ? "bg-rose-500 text-white shadow-sm" : "text-app-text-muted hover:text-white/70"}`}
              >
                <i className={`${t.icon} text-sm`}></i>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ─── TAB: OVERVIEW ─── */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: "ri-user-add-line",             label: "Đã giới thiệu",    value: profile.total_referred + " người", color: "text-blue-400",              bg: "bg-blue-500/10" },
                  { icon: "ri-shopping-cart-2-line",       label: "Doanh thu tạo ra", value: fmt(profile.total_sales),          color: "text-app-accent-primary",    bg: "bg-yellow-500/10" },
                  { icon: "ri-coins-line",                 label: "Tổng hoa hồng",   value: fmt(profile.total_commission),     color: "text-amber-400",             bg: "bg-amber-500/10" },
                  { icon: "ri-wallet-3-line",              label: "Chờ thanh toán",   value: fmt(canWithdraw),                  color: "text-rose-400",              bg: "bg-rose-500/10" },
                ].map((s, i) => (
                  <div key={i} className="bg-app-card/50 border border-app-border rounded-2xl p-4">
                    <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <i className={`${s.icon} ${s.color} text-base`}></i>
                    </div>
                    <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-app-text-muted mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {profile.status === "active" && (
                <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-4">
                  <p className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <i className="ri-links-line text-rose-400"></i>Link chia sẻ của bạn
                  </p>
                  <div className="flex gap-2">
                    <input readOnly value={referralLink}
                      className="flex-1 px-3 py-2.5 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white/60 font-mono focus:outline-none truncate"
                    />
                    <button onClick={() => handleCopy("link")}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all ${copied === "link" ? "bg-emerald-500 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}>
                      {copied === "link" ? <><i className="ri-check-line mr-1"></i>Copied</> : <><i className="ri-file-copy-line mr-1"></i>Copy</>}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => handleCopy("code")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-all">
                      {copied === "code" ? <><i className="ri-check-line"></i>Đã copy mã</> : <><i className="ri-key-line"></i>Copy mã: {profile.ref_code}</>}
                    </button>
                    {[
                      { label: "Facebook", icon: "ri-facebook-fill", color: "#1877f2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                      { label: "Zalo",     icon: "ri-message-2-line", color: "#0068ff", url: `https://zalo.me/share?url=${encodeURIComponent(referralLink)}` },
                    ].map(s => (
                      <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                        style={{ backgroundColor: s.color + "18", border: `1px solid ${s.color}35`, color: s.color }}>
                        <i className={s.icon}></i>{s.label}
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-app-text-muted border-t border-white/5 pt-3">
                    VIP Tháng → bạn nhận <span className="font-bold text-white/60">{fmt(Math.round(79000 * profile.commission_rate / 100))}</span>
                    <span className="mx-2">·</span>
                    VIP Năm → bạn nhận <span className="font-bold text-white/60">{fmt(Math.round(708000 * profile.commission_rate / 100))}</span>
                  </p>
                </div>
              )}

              {/* Recent commissions */}
              <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-app-border flex items-center justify-between">
                  <p className="text-sm font-bold text-white/80">Hoa hồng gần đây</p>
                  {commissions.length > 3 && (
                    <button onClick={() => setTab("commissions")} className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer">Xem tất cả →</button>
                  )}
                </div>
                {commissions.slice(0, 3).length === 0 ? (
                  <div className="py-10 text-center text-app-text-muted">
                    <i className="ri-coins-line text-2xl mb-2 block opacity-30"></i>
                    <p className="text-sm">Chưa có hoa hồng nào</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {commissions.slice(0, 3).map(c => (
                      <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                          <i className="ri-vip-crown-line text-rose-400 text-sm"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/80 truncate">{c.referred_user_name || "Thành viên"}</p>
                          <p className="text-xs text-app-text-muted">{VIP_LABELS[c.vip_type] || c.vip_type} · {new Date(c.created_at).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <p className="text-sm font-black text-app-accent-success flex-shrink-0">+{fmt(c.commission_amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: COMMISSIONS ─── */}
          {tab === "commissions" && (
            <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-app-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/80">Lịch sử hoa hồng</h3>
                <span className="text-xs text-app-text-muted">{commissions.length} giao dịch</span>
              </div>
              {commissions.length === 0 ? (
                <div className="py-14 text-center text-app-text-muted">
                  <i className="ri-coins-line text-3xl mb-2 block opacity-30"></i>
                  <p className="text-sm">Chưa có hoa hồng nào</p>
                  <p className="text-xs mt-1 opacity-60">Chia sẻ link để bắt đầu kiếm tiền</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {commissions.map(c => (
                    <div key={c.id} className="px-5 py-3.5 flex items-center gap-4">
                      <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/15 flex-shrink-0">
                        <i className="ri-vip-crown-line text-rose-400"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/80 truncate">{c.referred_user_name || "Thành viên"}</p>
                        <p className="text-xs text-app-text-muted">{VIP_LABELS[c.vip_type] || c.vip_type} · {new Date(c.created_at).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-app-accent-success">+{fmt(c.commission_amount)}</p>
                        <p className={`text-[10px] ${COM_STATUS[c.status]?.cls}`}>{COM_STATUS[c.status]?.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: WITHDRAW ─── */}
          {tab === "withdraw" && (
            <div className="space-y-5">
              {/* Balance summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Hoa hồng tích lũy",  value: fmt(pendingCommission), color: "text-amber-400" },
                  { label: "Đang yêu cầu rút",    value: fmt(pendingWithdrawal), color: "text-blue-400" },
                  { label: "Có thể rút",           value: fmt(canWithdraw),       color: "text-app-accent-success" },
                ].map((s, i) => (
                  <div key={i} className="bg-app-card/50 border border-app-border rounded-2xl p-4 text-center">
                    <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-app-text-muted mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Request form */}
              <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <i className="ri-bank-card-line text-app-accent-success"></i>Tạo yêu cầu rút tiền
                </h3>
                {!profile.bank_info?.account_number && (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-400">
                    <i className="ri-error-warning-line flex-shrink-0"></i>
                    Bạn chưa có thông tin ngân hàng. Vào tab <button onClick={() => setTab("settings")} className="underline cursor-pointer">Cài đặt</button> để cập nhật.
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">
                    Số tiền muốn rút <span className="text-app-text-muted">(tối thiểu 50.000đ, tối đa {fmt(canWithdraw)})</span>
                  </label>
                  <input
                    value={wdAmount}
                    onChange={e => setWdAmount(e.target.value)}
                    placeholder="100000"
                    className="w-full px-3 py-2.5 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">Ghi chú (tùy chọn)</label>
                  <input
                    value={wdNote}
                    onChange={e => setWdNote(e.target.value)}
                    placeholder="Ghi chú cho admin..."
                    className="w-full px-3 py-2.5 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                  />
                </div>
                {profile.bank_info?.account_number && (
                  <div className="p-3 bg-app-surface/30 border border-app-border rounded-xl text-xs text-app-text-muted space-y-0.5">
                    <p>Chuyển tới: <span className="text-white/70 font-medium">{profile.bank_info.bank}</span></p>
                    <p>Số TK: <span className="text-white/70 font-mono">{profile.bank_info.account_number}</span></p>
                    <p>Chủ TK: <span className="text-white/70">{profile.bank_info.account_name}</span></p>
                  </div>
                )}
                <button
                  onClick={handleWithdraw}
                  disabled={submittingWd || !wdAmount || canWithdraw < 50000 || !profile.bank_info?.account_number || profile.status !== "active"}
                  className="w-full py-2.5 rounded-xl bg-app-accent-success hover:opacity-90 disabled:opacity-40 text-black font-bold text-sm cursor-pointer transition-all"
                >
                  {submittingWd ? <><i className="ri-loader-4-line animate-spin mr-2"></i>Đang gửi...</> : <><i className="ri-send-plane-line mr-2"></i>Gửi yêu cầu rút tiền</>}
                </button>
              </div>

              {/* Withdrawal history */}
              <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-app-border">
                  <h3 className="text-sm font-bold text-white/80">Lịch sử rút tiền</h3>
                </div>
                {withdrawals.length === 0 ? (
                  <div className="py-10 text-center text-app-text-muted">
                    <i className="ri-bank-card-line text-2xl mb-2 block opacity-30"></i>
                    <p className="text-sm">Chưa có yêu cầu rút tiền nào</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {withdrawals.map(w => {
                      const s = WD_STATUS[w.status];
                      return (
                        <div key={w.id} className="px-5 py-3.5 flex items-center gap-4">
                          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card flex-shrink-0">
                            <i className={`${s.icon} ${s.cls} text-base`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white/80">{fmt(w.amount)}</p>
                            <p className="text-xs text-app-text-muted">{new Date(w.created_at).toLocaleDateString("vi-VN")}</p>
                            {w.admin_note && <p className="text-xs text-rose-400 mt-0.5">{w.admin_note}</p>}
                          </div>
                          <span className={`text-xs font-semibold flex-shrink-0 ${s.cls}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: SETTINGS ─── */}
          {tab === "settings" && (
            <div className="space-y-5">
              {/* Custom ref code */}
              <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <i className="ri-key-line text-rose-400"></i>Mã CTV cá nhân
                </h3>
                <p className="text-xs text-app-text-muted">Tùy chỉnh mã nhận diện của bạn. Ví dụ: <span className="font-mono text-rose-400">HANGUOCOI-ANH</span>, <span className="font-mono text-rose-400">HQO-THANHVIEN01</span></p>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-app-text-muted font-mono flex-shrink-0">hanquocoi.vn?ref=</span>
                  <input
                    value={editRefCode}
                    onChange={e => setEditRefCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                    maxLength={30}
                    className="flex-1 px-3 py-2 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white/80 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                  />
                </div>
                {editRefCode.length > 0 && editRefCode.length < 4 && (
                  <p className="text-xs text-rose-400">Mã tối thiểu 4 ký tự</p>
                )}
              </div>

              {/* Bank info */}
              <div className="bg-app-card/50 border border-app-border rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <i className="ri-bank-line text-blue-400"></i>Tài khoản nhận tiền
                </h3>
                {[
                  { key: "bank" as const,           label: "Tên ngân hàng",  placeholder: "Vietcombank, MB Bank, Techcombank..." },
                  { key: "account_number" as const,  label: "Số tài khoản",   placeholder: "0123456789" },
                  { key: "account_name" as const,    label: "Tên chủ tài khoản", placeholder: "NGUYEN VAN A" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">{f.label}</label>
                    <input
                      value={editBank[f.key]}
                      onChange={e => setEditBank(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white/80 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-sm cursor-pointer transition-all"
              >
                {savingSettings ? <><i className="ri-loader-4-line animate-spin mr-2"></i>Đang lưu...</> : <><i className="ri-save-line mr-2"></i>Lưu thay đổi</>}
              </button>

              <div className="text-xs text-app-text-muted text-center pb-2">
                Tham gia từ {new Date(profile.created_at).toLocaleDateString("vi-VN")}
                <span className="mx-2">·</span>SĐT: {profile.phone}
              </div>
            </div>
          )}

        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 ${toast.type === "err" ? "bg-rose-600" : "bg-emerald-600"}`}>
          <i className={toast.type === "err" ? "ri-error-warning-line" : "ri-checkbox-circle-fill"}></i>
          {toast.msg}
        </div>
      )}
    </DashboardLayout>
  );
}
