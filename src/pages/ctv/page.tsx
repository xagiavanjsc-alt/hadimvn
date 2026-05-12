import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("ctv_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data || null);

    if (data) {
      const { data: coms } = await supabase
        .from("ctv_commissions")
        .select("*")
        .eq("ctv_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setCommissions(coms || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleRegister = async ({ display_name, phone }: { display_name: string; phone: string }) => {
    if (!user?.id) return;
    const ref_code = `HQO-${user.id.slice(-6).toUpperCase()}`;
    const { error } = await supabase
      .from("ctv_profiles")
      .insert({ user_id: user.id, display_name, phone, ref_code, status: "pending" });
    if (error) { showToast("Lỗi: " + error.message); return; }
    showToast("Đã gửi đơn! Admin sẽ duyệt sớm.");
    load();
  };

  const referralLink = profile ? `https://hanquocoi.vn?ref=${profile.ref_code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || profile === undefined) {
    return (
      <DashboardLayout title="CTV">
        <div className="flex items-center justify-center py-20">
          <i className="ri-loader-4-line animate-spin text-2xl text-app-text-muted"></i>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCommission = commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0);

  return (
    <DashboardLayout title="Cộng Tác Viên" subtitle="Chia sẻ link — nhận hoa hồng mỗi đơn VIP">
      {profile === null ? (
        <RegisterForm onSubmit={handleRegister} />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 py-4 px-2">

          {/* Status banner */}
          {profile.status === "pending" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400">
              <i className="ri-time-line text-lg flex-shrink-0"></i>
              <span>Đơn đăng ký CTV đang chờ admin duyệt. Bạn sẽ nhận thông báo khi được duyệt.</span>
            </div>
          )}
          {profile.status === "suspended" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400">
              <i className="ri-error-warning-line text-lg flex-shrink-0"></i>
              <span>Tài khoản CTV đang bị tạm dừng. Vui lòng liên hệ admin.</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "ri-user-add-line", label: "Đã giới thiệu", value: profile.total_referred + " người", color: "text-blue-400" },
              { icon: "ri-money-dollar-circle-line", label: "Tổng doanh thu", value: fmt(profile.total_sales), color: "text-app-accent-primary" },
              { icon: "ri-coins-line", label: "Hoa hồng phát sinh", value: fmt(profile.total_commission), color: "text-amber-400" },
              { icon: "ri-wallet-3-line", label: "Chờ thanh toán", value: fmt(pendingCommission), color: "text-rose-400" },
            ].map((s, i) => (
              <div key={i} className="bg-app-card/50 border border-app-border rounded-2xl p-4">
                <i className={`${s.icon} text-xl ${s.color} mb-2 block`}></i>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-app-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          {profile.status === "active" && (
            <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/25 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-links-line text-rose-400"></i>
                <p className="text-sm font-bold text-white/80">Link CTV của bạn</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">{profile.ref_code}</span>
              </div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3 py-2.5 bg-app-surface/50 border border-app-border rounded-xl text-sm text-white/60 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all ${copied ? "bg-emerald-500 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
                >
                  {copied ? <><i className="ri-check-line mr-1.5"></i>Đã copy</> : <><i className="ri-file-copy-line mr-1.5"></i>Copy</>}
                </button>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {[
                  { label: "Facebook", icon: "ri-facebook-fill", color: "#1877f2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                  { label: "Zalo", icon: "ri-message-2-line", color: "#0068ff", url: `https://zalo.me/share?url=${encodeURIComponent(referralLink)}` },
                ].map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
                    style={{ backgroundColor: s.color + "22", border: `1px solid ${s.color}44`, color: s.color }}
                  >
                    <i className={`${s.icon}`}></i>{s.label}
                  </a>
                ))}
              </div>
              <p className="text-xs text-app-text-muted mt-3">
                Hoa hồng: <span className="text-rose-400 font-bold">{profile.commission_rate}%</span> mỗi đơn VIP · VIP Tháng: ~<span className="text-white/60">{Math.round(79000 * profile.commission_rate / 100).toLocaleString()}đ</span> · VIP Năm: ~<span className="text-white/60">{Math.round(708000 * profile.commission_rate / 100).toLocaleString()}đ</span>
              </p>
            </div>
          )}

          {/* Commission history */}
          <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-app-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/80">Lịch sử hoa hồng</h3>
              <span className="text-xs text-app-text-muted">{commissions.length} giao dịch</span>
            </div>
            {commissions.length === 0 ? (
              <div className="py-12 text-center text-app-text-muted">
                <i className="ri-coins-line text-3xl mb-2 block opacity-40"></i>
                <p className="text-sm">Chưa có hoa hồng nào</p>
                <p className="text-xs mt-1">Chia sẻ link để bắt đầu kiếm tiền</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {commissions.map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/15 flex-shrink-0">
                      <i className="ri-vip-crown-line text-rose-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/80 truncate">{c.referred_user_name || "Người dùng ẩn danh"}</p>
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

          {/* Bank info card */}
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
              <i className="ri-bank-line text-app-text-secondary"></i>
              Thông tin nhận thanh toán
            </h3>
            {profile.bank_info?.account_number ? (
              <div className="text-sm text-white/60 space-y-1">
                <p>Ngân hàng: <span className="text-white/80 font-medium">{profile.bank_info.bank}</span></p>
                <p>Số TK: <span className="text-white/80 font-medium font-mono">{profile.bank_info.account_number}</span></p>
                <p>Chủ TK: <span className="text-white/80 font-medium">{profile.bank_info.account_name}</span></p>
              </div>
            ) : (
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <i className="ri-error-warning-line"></i>
                Chưa có thông tin tài khoản. Liên hệ admin để cập nhật.
              </p>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-app-text-muted text-center pb-4">
            Mã CTV: <span className="font-mono font-bold text-white/50">{profile.ref_code}</span>
            <span className="mx-2">·</span>
            Tỉ lệ hoa hồng: <span className="font-bold text-rose-400">{profile.commission_rate}%</span>
            <span className="mx-2">·</span>
            Trạng thái: <span className={`font-bold ${STATUS_CONFIG[profile.status].cls.split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>{STATUS_CONFIG[profile.status].label}</span>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-app-card border border-app-border text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
