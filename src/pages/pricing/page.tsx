import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase, isVipActive } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/base/Toast";
import { usePageSEO } from "@/hooks/usePageSEO";

interface PlanFeature {
  label: string;
  free: boolean | string;
  vip: boolean | string;
  highlight?: boolean;
}

const features: PlanFeature[] = [
  { label: "Bảng chữ Hangul tương tác", free: true, vip: true },
  { label: "Flashcard từ vựng cơ bản", free: "20 thẻ/ngày", vip: "Không giới hạn", highlight: true },
  { label: "Luyện thi EPS-TOPIK", free: "3 câu/ngày", vip: "50+ câu, tất cả chủ đề", highlight: true },
  { label: "Quiz kiểm tra kiến thức", free: "5 câu/lần", vip: "Không giới hạn", highlight: true },
  { label: "Học qua tin tức Naver", free: false, vip: true, highlight: true },
  { label: "Ghi âm & so sánh phát âm", free: false, vip: true, highlight: true },
  { label: "Lộ trình học TOPIK 1→6", free: "Xem thôi", vip: "Cá nhân hóa theo trình độ" },
  { label: "K-pop Lesson (bài hát Hàn)", free: "2 bài/tuần", vip: "Toàn bộ kho bài" },
  { label: "Từ điển K-pop chuyên sâu", free: true, vip: true },
  { label: "Xuất ebook PDF", free: false, vip: true },
  { label: "Streak & Gamification", free: true, vip: true },
  { label: "Hỗ trợ ưu tiên", free: false, vip: true },
  { label: "Không quảng cáo", free: false, vip: true },
  { label: "Cập nhật tính năng sớm nhất", free: false, vip: true },
];

const testimonials = [
  {
    name: "Nguyễn Thị Lan",
    avatar: "/images/brand/logo.svg",
    role: "Đang chuẩn bị thi EPS-TOPIK",
    text: "Nhờ gói VIP mình luyện được 50+ câu EPS mỗi ngày, chỉ sau 2 tháng đã tự tin hơn hẳn. Tính năng ghi âm giúp phát âm chuẩn hơn nhiều!",
    rating: 5,
  },
  {
    name: "Trần Văn Minh",
    avatar: "/images/brand/logo.svg",
    role: "K-pop fan, học tiếng Hàn 6 tháng",
    text: "Học qua bài hát K-pop thật sự thú vị, không nhàm chán như sách vở. VIP mở khóa toàn bộ kho bài — xứng đáng từng đồng!",
    rating: 5,
  },
  {
    name: "Phạm Thu Hương",
    avatar: "/images/brand/logo.svg",
    role: "Sinh viên, học TOPIK 2",
    text: "Lộ trình học cá nhân hóa theo cấp độ TOPIK rất hay. Mình biết chính xác cần học gì tiếp theo, không bị lạc hướng nữa.",
    rating: 5,
  },
  {
    name: "Lê Quốc Bảo",
    avatar: "/images/brand/logo.svg",
    role: "Lao động, đã qua EPS-TOPIK",
    text: "Thi thử EPS trên web rất giống đề thi thật. Mình luyện 1 tháng trước khi đi thi, kết quả đạt 85/100. Cảm ơn Hàn Quốc Ơi!",
    rating: 5,
  },
  {
    name: "Hoàng Thị Mai",
    avatar: "/images/brand/logo.svg",
    role: "Nhân viên văn phòng",
    text: "Flashcard với Spaced Repetition giúp mình nhớ từ vựng lâu hơn. Trước đây học 100 từ quên 80, giờ nhớ 90%",
    rating: 5,
  },
  {
    name: "Đỗ Minh Tuấn",
    avatar: "/images/brand/logo.svg",
    role: "Sinh viên đại học",
    text: "Tính năng học qua tin tức Naver giúp mình vừa học tiếng Hàn vừa cập nhật tin tức Hàn. Rất thực tế và hữu ích!",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Gói VIP có thể hủy bất cứ lúc nào không?",
    a: "Có! Bạn có thể hủy gói VIP bất cứ lúc nào. Sau khi hủy, bạn vẫn dùng được đến hết chu kỳ thanh toán hiện tại.",
  },
  {
    q: "Có dùng thử VIP miễn phí không?",
    a: "Có! Bạn được dùng thử VIP 7 ngày miễn phí khi đăng ký lần đầu. Không cần thẻ tín dụng.",
  },
  {
    q: "Thanh toán bằng phương thức nào?",
    a: "Hỗ trợ chuyển khoản ngân hàng, MoMo, ZaloPay, và thẻ Visa/Mastercard.",
  },
  {
    q: "Nội dung có cập nhật thường xuyên không?",
    a: "Có! Tin tức Hàn cập nhật hàng tuần, câu hỏi EPS và bài K-pop được bổ sung liên tục. VIP luôn được truy cập nội dung mới nhất.",
  },
  {
    q: "Học sinh/sinh viên có được giảm giá không?",
    a: "Có! Liên hệ qua Zalo để được hỗ trợ giá học sinh với mức giảm 30% khi xuất trình thẻ sinh viên.",
  },
];

// ─── VIP Violation Modal ─────────────────────────────────────────────────────
function VipViolationModal({ onClose }: { onClose: () => void }) {
  const [suspectedEmail, setSuspectedEmail] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("vip_violation_reports").insert({
        reporter_name: "Thành viên ẩn danh",
        suspected_email: suspectedEmail.trim(),
        reason: reason.trim(),
        evidence: evidence.trim(),
        status: "pending",
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-app-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-rose-500/12 rounded-xl">
              <i className="ri-shield-cross-line text-rose-400 text-sm" />
            </div>
            <p className="text-white font-bold text-sm">Báo cáo vi phạm VIP</p>
          </div>
          <button onClick={onClose} className="text-app-text-muted hover:text-white/60 cursor-pointer">
            <i className="ri-close-line" />
          </button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-500/10 rounded-2xl mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-app-accent-success text-3xl" />
            </div>
            <p className="text-white font-bold mb-2">Đã gửi báo cáo!</p>
            <p className="text-app-text-secondary text-sm mb-5">Cảm ơn bạn đã giúp bảo vệ cộng đồng. Admin sẽ xử lý sớm nhất.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap">Xong</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email tài khoản nghi ngờ (nếu biết)</label>
              <input type="email" value={suspectedEmail} onChange={e => setSuspectedEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Lý do báo cáo <span className="text-rose-400">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value.slice(0, 300))} rows={3} maxLength={300} required
                placeholder="Mô tả hành vi vi phạm (chia sẻ tài khoản, bán lại VIP...)"
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 resize-none" />
              <p className="text-[10px] text-right mt-0.5 text-app-text-muted">{reason.length}/300</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Bằng chứng (link, ảnh...)</label>
              <input type="text" value={evidence} onChange={e => setEvidence(e.target.value.slice(0, 200))}
                placeholder="Link bằng chứng hoặc mô tả thêm"
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm cursor-pointer whitespace-nowrap">Hủy</button>
              <button type="submit" disabled={submitting || !reason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FeatureRow({ feature }: { feature: PlanFeature }) {
  const renderValue = (val: boolean | string, isVip: boolean) => {
    if (val === false) {
      return <i className="ri-close-line text-app-text-muted text-lg"></i>;
    }
    if (val === true) {
      return (
        <div className="w-6 h-6 flex items-center justify-center rounded-full mx-auto" style={{ backgroundColor: isVip ? "rgba(232,200,74,0.20)" : "#34d39920" }}>
          <i className={`ri-check-line text-sm ${isVip ? "text-app-accent-primary" : "text-app-accent-success"}`}></i>
        </div>
      );
    }
    return (
      <span className={`text-xs font-medium ${isVip ? "text-app-accent-primary" : "text-white/50"}`}>{val}</span>
    );
  };

  return (
    <div className={`grid grid-cols-[1fr_120px_120px] items-center py-3 px-4 rounded-xl transition-colors ${feature.highlight ? "bg-app-surface/50" : "hover:bg-white/2"}`}>
      <div className="flex items-center gap-2">
        {feature.highlight && <div className="w-1 h-1 rounded-full bg-app-accent-primary flex-shrink-0"></div>}
        <span className={`text-xs sm:text-sm ${feature.highlight ? "text-white/80 font-medium" : "text-white/50"}`}>{feature.label}</span>
      </div>
      <div className="text-center">{renderValue(feature.free, false)}</div>
      <div className="text-center">{renderValue(feature.vip, true)}</div>
    </div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className="ri-star-fill text-app-accent-primary text-xs"></i>
      ))}
    </div>
  );
}

// ─── Auto-Renew Toggle ───────────────────────────────────────────────────────
function AutoRenewSection({ isVip, vipExpiresAt }: { isVip: boolean; vipExpiresAt: string | null }) {
  const { user } = useAuth();
  const [autoRenew, setAutoRenew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`auto_renew_${user.id}`);
    setAutoRenew(stored === "true");
  }, [user]);

  const handleToggle = async () => {
    if (!user) return;
    setSaving(true);
    const newVal = !autoRenew;
    setAutoRenew(newVal);
    localStorage.setItem(`auto_renew_${user.id}`, String(newVal));
    // Save to Supabase user_profiles metadata
    await supabase.from("user_profiles").update({ updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false);
    setToast(newVal ? "Đã bật tự động gia hạn VIP!" : "Đã tắt tự động gia hạn VIP.");
    setTimeout(() => setToast(null), 3000);
  };

  if (!isVip) return null;

  const daysLeft = vipExpiresAt
    ? Math.floor((new Date(vipExpiresAt).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-app-accent-success px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <i className="ri-checkbox-circle-fill"></i>{toast}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/10 flex-shrink-0">
            <i className="ri-refresh-line text-app-accent-primary text-lg"></i>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Tự động gia hạn VIP</p>
            <p className="text-app-text-secondary text-xs mt-0.5 leading-relaxed">
              {autoRenew
                ? `VIP sẽ tự động gia hạn${daysLeft !== null ? ` sau ${daysLeft} ngày` : ""}. Bạn sẽ nhận email nhắc trước 3 ngày.`
                : `Bật để không bị gián đoạn học tập. Hệ thống sẽ nhắc bạn trước khi hết hạn.`
              }
            </p>
            {autoRenew && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-app-accent-success text-[10px] font-semibold">Đang hoạt động</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className="relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors disabled:opacity-50"
          style={{ backgroundColor: autoRenew ? "#e8c84a" : "rgba(255,255,255,0.1)" }}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoRenew ? "left-7" : "left-1"}`} />
        </button>
      </div>
      {autoRenew && (
        <div className="mt-4 pt-4 border-t border-app-border grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "ri-mail-check-line", text: "Email nhắc trước 7 ngày", color: "#a78bfa" },
            { icon: "ri-shield-check-line", text: "Không bị gián đoạn học", color: "#34d399" },
            { icon: "ri-close-circle-line", text: "Hủy bất cứ lúc nào", color: "#fb923c" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-app-surface/50">
              <i className={`${item.icon} text-sm flex-shrink-0`} style={{ color: item.color }}></i>
              <span className="text-xs text-white/50">{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const { user, profile } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [paySettings, setPaySettings] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  usePageSEO({
    title: "Gói VIP — Mở khóa toàn bộ tính năng | Hàn Quốc Ơi!",
    description: "Nâng cấp VIP để mở khóa AI lộ trình cá nhân, không quảng cáo, đề thi không giới hạn, ưu tiên hỗ trợ. Hỗ trợ thanh toán chuyển khoản — kích hoạt trong ngày.",
    keywords: "VIP Hàn Quốc Ơi, giá VIP học tiếng Hàn, nâng cấp VIP EPS-TOPIK, gói trả phí XKLĐ Hàn",
    path: "/pricing",
    ogType: "website",
    robots: "index, follow",
  });
  const [payTab, setPayTab] = useState<"bank" | "momo">("bank");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const submittingRef = useRef(false);
  const [copied, setCopied] = useState<string | null>(null);

  const monthlyPrice = 79000;
  const yearlyPrice = 59000;
  const currentPrice = billing === "monthly" ? monthlyPrice : yearlyPrice;
  const yearSaving = (monthlyPrice - yearlyPrice) * 12;

  const handleRegister = () => {
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!profile || !paymentProof) return;
    if (submittingRef.current) return;
    submittingRef.current = true;

    setSubmittingPayment(true);
    try {
      // Upload payment proof to Supabase storage
      const fileName = `payment_${profile.id}_${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, paymentProof);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);
      
      // Submit payment request
      const { error: insertError } = await supabase.from("vip_payment_requests").insert({
        user_id: profile.id,
        email: user?.email || "",
        amount: billing === "monthly" ? monthlyPrice : yearlyPrice * 12,
        billing_cycle: billing,
        proof_url: publicUrl,
        note: paymentNote,
        status: "pending",
      });
      
      if (insertError) throw insertError;
      
      setShowPaymentModal(false);
      setPaymentProof(null);
      setPaymentNote("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error("Payment submission error:", err);
      showToast("Có lỗi xảy ra. Vui lòng thử lại", "error", 4000);
    } finally {
      setSubmittingPayment(false);
      submittingRef.current = false;
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    supabase.from("admin_settings").select("value").eq("key", "payment_settings").single()
      .then(({ data }) => {
        if (data?.value) {
          try { setPaySettings(JSON.parse(data.value)); } catch {}
        }
      });
  }, []);

  return (
    <DashboardLayout
      title="Gói học VIP"
      subtitle="Mở khóa toàn bộ tính năng — học tiếng Hàn hiệu quả hơn gấp 3 lần"
    >
      <ToastComponent />
      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-app-accent-success px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-lg">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          Đã gửi yêu cầu thanh toán! Chúng tôi sẽ xác nhận và kích hoạt VIP trong vòng 30 phút.
        </div>
      )}

      {/* Payment Modal — redesigned with VietQR */}
      {showPaymentModal && (() => {
        const amount = billing === "monthly" ? monthlyPrice : yearlyPrice * 12;
        const fmtAmt = new Intl.NumberFormat("vi-VN").format(amount);
        const content = `VIP_${user?.email?.split("@")[0] || "EMAIL"}`;
        const bank = paySettings?.bankAccount;
        const momo = paySettings?.momo;
        const hasMomo = momo?.enabled && momo?.phoneNumber;
        const vietQrUrl = bank?.bankCode && bank?.accountNumber
          ? (bank.qrCodeUrl || `https://img.vietqr.io/image/${bank.bankCode}-${bank.accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bank.accountName || "")}`)
          : null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#111] border border-app-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
                <div>
                  <p className="text-white font-bold text-sm">Nâng cấp VIP {billing === "monthly" ? "Tháng" : "Năm"}</p>
                  <p className="text-app-text-secondary text-xs mt-0.5">Chuyển khoản → gửi minh chứng → kích hoạt trong 30 phút</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-app-text-muted hover:text-white/70 hover:bg-white/8 cursor-pointer transition-all">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>

              {/* Tabs */}
              {hasMomo && (
                <div className="flex border-b border-app-border">
                  {(["bank", "momo"] as const).map(t => (
                    <button key={t} onClick={() => setPayTab(t)}
                      className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-all ${payTab === t ? "text-white border-b-2 border-app-accent-primary" : "text-app-text-muted"}`}>
                      {t === "bank" ? <><i className="ri-bank-line mr-1.5"></i>Chuyển khoản</> : <><i className="ri-smartphone-line mr-1.5"></i>MoMo</>}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Bank tab */}
                {payTab === "bank" && (
                  <>
                    {bank ? (
                      <div className="flex gap-4">
                        {/* QR */}
                        {vietQrUrl && (
                          <div className="flex-shrink-0">
                            <img loading="lazy" decoding="async" src={vietQrUrl} alt="QR chuyển khoản" className="w-32 h-32 rounded-xl bg-white" />
                            <p className="text-[10px] text-app-text-muted text-center mt-1">Quét để chuyển khoản</p>
                          </div>
                        )}
                        {/* Info */}
                        <div className="flex-1 space-y-2.5">
                          <div>
                            <p className="text-[10px] text-app-text-muted mb-0.5">Ngân hàng</p>
                            <p className="text-sm font-bold text-white/90">{bank.bankName || bank.bankCode}</p>
                          </div>
                          {[{ label: "Số tài khoản", value: bank.accountNumber, key: "acc" },
                            { label: "Chủ tài khoản", value: bank.accountName, key: "name" },
                            { label: "Số tiền",       value: `${fmtAmt}đ`,    key: "amt" },
                            { label: "Nội dung CK",   value: content,         key: "msg" },
                          ].map(r => r.value && (
                            <div key={r.key} className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[10px] text-app-text-muted">{r.label}</p>
                                <p className={`text-sm font-semibold text-white/80 truncate ${r.key === "acc" || r.key === "msg" ? "font-mono" : ""}`}>{r.value}</p>
                              </div>
                              <button onClick={() => copyToClipboard(r.value!, r.key)}
                                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 cursor-pointer transition-all">
                                <i className={`text-xs ${copied === r.key ? "ri-check-line text-app-accent-success" : "ri-file-copy-line text-app-text-muted"}`}></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-app-text-muted">
                        <i className="ri-bank-line text-2xl mb-2 block opacity-40"></i>
                        <p className="text-xs">Thông tin ngân hàng chưa được cấu hình</p>
                      </div>
                    )}
                  </>
                )}

                {/* MoMo tab */}
                {payTab === "momo" && hasMomo && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-pink-500/8 border border-pink-500/20 rounded-xl">
                      <div className="w-14 h-14 flex items-center justify-center bg-pink-500/15 rounded-xl flex-shrink-0">
                        <i className="ri-smartphone-line text-pink-400 text-2xl"></i>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[{ label: "Số MoMo",      value: momo.phoneNumber,  key: "momo_phone" },
                          { label: "Tên hiển thị", value: momo.displayName, key: "momo_name" },
                          { label: "Số tiền",      value: `${fmtAmt}đ`,     key: "momo_amt" },
                          { label: "Nội dung",     value: content,          key: "momo_msg" },
                        ].map(r => r.value && (
                          <div key={r.key} className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[10px] text-app-text-muted">{r.label}</p>
                              <p className="text-sm font-semibold text-white/80 font-mono">{r.value}</p>
                            </div>
                            <button onClick={() => copyToClipboard(r.value!, r.key)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-pink-500/20 cursor-pointer transition-all">
                              <i className={`text-xs ${copied === r.key ? "ri-check-line text-app-accent-success" : "ri-file-copy-line text-app-text-muted"}`}></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload proof */}
                <div className="border-t border-app-border pt-4">
                  <label className="text-white/60 text-xs font-semibold block mb-2">Ảnh minh chứng chuyển khoản <span className="text-rose-400">*</span></label>
                  <input type="file" accept="image/*" onChange={e => setPaymentProof(e.target.files?.[0] || null)} className="hidden" id="payment-proof" />
                  <label htmlFor="payment-proof"
                    className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-app-border rounded-xl cursor-pointer hover:border-white/20 transition-colors bg-app-surface/30">
                    {paymentProof ? (
                      <><i className="ri-image-line text-xl text-app-accent-success"></i>
                        <span className="text-white/70 text-sm truncate">{paymentProof.name}</span>
                        <span className="text-[10px] text-app-accent-success ml-auto">Đã chọn</span></>
                    ) : (
                      <><i className="ri-upload-cloud-line text-xl text-app-text-muted"></i>
                        <span className="text-app-text-secondary text-sm">Chọn ảnh chụp giao dịch</span></>
                    )}
                  </label>
                  <textarea value={paymentNote} onChange={e => setPaymentNote(e.target.value)} rows={2}
                    placeholder="Ghi chú thêm (không bắt buộc)"
                    className="w-full mt-2 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer">
                    Hủy
                  </button>
                  <button onClick={handleSubmitPayment} disabled={!paymentProof || submittingPayment}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2">
                    {submittingPayment ? <><i className="ri-loader-4-line animate-spin"></i>Đang gửi...</> : <><i className="ri-send-plane-line"></i>Gửi xác nhận</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8"
        style={{ background: "linear-gradient(135deg, #1a1600 0%, #2a2000 50%, #1a1600 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, app-accent-primary 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fb923c 0%, transparent 50%)" }}>
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <i className="ri-vip-crown-line"></i>
            Dùng thử 7 ngày MIỄN PHÍ
          </div>
          <h2 className="text-white font-bold text-3xl mb-3 leading-tight">
            Học tiếng Hàn thật sự hiệu quả<br />
            <span className="text-app-accent-primary">không cần đến trung tâm</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Kết hợp K-pop, tin tức thật, EPS-TOPIK và AI — phương pháp học độc đáo<br />
            chỉ có tại Hàn Việt KTS
          </p>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-white" : "text-app-text-secondary"}`}>Hàng tháng</span>
        <button
          onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${billing === "yearly" ? "bg-app-accent-primary" : "bg-app-card/70"}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${billing === "yearly" ? "left-7" : "left-1"}`}></div>
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-white" : "text-app-text-secondary"}`}>Hàng năm</span>
          <span className="text-[10px] font-bold bg-app-accent-success/15 text-app-accent-success px-2 py-0.5 rounded-full">
            Tiết kiệm {new Intl.NumberFormat("vi-VN").format(yearSaving)}đ
          </span>
        </div>
      </div>

      {/* Auto-renew section for VIP users */}
      {isVipActive(profile) && (
        <AutoRenewSection isVip={isVipActive(profile)} vipExpiresAt={profile?.vip_expires_at || null} />
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-6">
          <div className="mb-5">
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-2">Miễn phí</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-bold text-4xl">0đ</span>
            </div>
            <p className="text-app-text-muted text-xs">Mãi mãi miễn phí</p>
          </div>
          <div className="space-y-2.5 mb-6">
            {["Hangul cơ bản", "20 flashcard/ngày", "3 câu EPS/ngày", "5 câu quiz/lần", "Streak hàng ngày"].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-app-card/50 flex-shrink-0">
                  <i className="ri-check-line text-app-text-muted text-[10px]"></i>
                </div>
                <span className="text-app-text-secondary text-sm">{f}</span>
              </div>
            ))}
          </div>
          {isVipActive(profile) ? (
            <div className="w-full py-3 rounded-xl border border-app-border text-app-text-muted text-sm font-medium text-center">
              Gói cơ bản
            </div>
          ) : (
            <button className="w-full py-3 rounded-xl border border-app-border text-app-text-secondary text-sm font-medium cursor-default whitespace-nowrap">
              Đang dùng
            </button>
          )}
        </div>

        {/* VIP */}
        <div className="relative bg-gradient-to-b from-app-surface to-[#0f1117] border border-app-accent-primary/30 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 bg-app-accent-primary text-app-bg text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            PHỔ BIẾN NHẤT
          </div>
          <div className="mb-5">
            <p className="text-app-accent-primary text-xs font-semibold tracking-normal mb-2">VIP</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-bold text-4xl">{new Intl.NumberFormat("vi-VN").format(currentPrice)}đ</span>
              <span className="text-app-text-muted text-sm mb-1">/tháng</span>
            </div>
            {billing === "yearly" && (
              <p className="text-app-text-muted text-xs">Thanh toán {new Intl.NumberFormat("vi-VN").format(currentPrice * 12)}đ/năm</p>
            )}
            {billing === "monthly" && (
              <p className="text-app-text-muted text-xs">Hủy bất cứ lúc nào</p>
            )}
          </div>
          <div className="space-y-2.5 mb-6">
            {[
              "Tất cả tính năng Free",
              "50+ câu EPS không giới hạn",
              "Học qua tin tức Naver thật",
              "Ghi âm & so sánh phát âm",
              "Lộ trình TOPIK cá nhân hóa",
              "Toàn bộ kho K-pop Lesson",
              "Xuất ebook PDF",
              "Không quảng cáo",
              "Hỗ trợ ưu tiên qua Zalo",
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-app-accent-primary/15 flex-shrink-0">
                  <i className="ri-check-line text-app-accent-primary text-[10px]"></i>
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
          {isVipActive(profile) ? (
            <div className="space-y-2">
              <div className="w-full py-3 rounded-xl bg-app-accent-primary/10 border border-app-accent-primary/25 text-app-accent-primary text-sm font-bold text-center flex items-center justify-center gap-2">
                <i className="ri-vip-crown-fill"></i>
                Đang sử dụng VIP
              </div>
              <button
                onClick={() => navigate("/vip-history")}
                className="w-full py-2 rounded-xl border border-app-border text-app-text-secondary text-xs cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors"
              >
                Xem lịch sử giao dịch
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleRegister}
                className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-vip-crown-line"></i>
                Dùng thử 7 ngày miễn phí
              </button>
              <p className="text-app-text-muted text-[10px] text-center mt-2">Không cần thẻ tín dụng</p>
            </>
          )}
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden mb-10 overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[1fr_120px_120px] items-center px-4 py-4 border-b border-app-border">
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal">Tính năng</p>
            <p className="text-app-text-secondary text-xs font-semibold text-center">Miễn phí</p>
            <p className="text-app-accent-primary text-xs font-semibold text-center">VIP</p>
          </div>
          <div className="divide-y divide-white/3">
            {features.map(f => <FeatureRow key={f.label} feature={f} />)}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {paySettings?.bankAccount?.bankName && paySettings?.bankAccount?.accountNumber && (
        <div className="bg-app-bg border border-emerald-500/20 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-xl">
              <i className="ri-bank-line text-app-accent-success text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Thông tin thanh toán</p>
              <p className="text-app-text-secondary text-xs">Chuyển khoản ngân hàng hoặc quét QR Code</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Account Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Ngân hàng</span>
                <span className="text-white text-sm font-medium">{paySettings.bankAccount.bankName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Số tài khoản</span>
                <span className="text-white text-sm font-medium font-mono">{paySettings.bankAccount.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Chủ tài khoản</span>
                <span className="text-white text-sm font-medium">{paySettings.bankAccount.accountName}</span>
              </div>
              {paySettings.bankAccount.branch && (
                <div className="flex items-center justify-between py-2 border-b border-app-border">
                  <span className="text-app-text-secondary text-xs">Chi nhánh</span>
                  <span className="text-white text-sm font-medium">{paySettings.bankAccount.branch}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-app-text-secondary text-xs">Nội dung chuyển khoản</span>
                <span className="text-app-accent-success text-sm font-medium">VIP_[EMAIL_CUA_BAN]</span>
              </div>
            </div>
            
            {/* QR Code */}
            {(() => {
              const b = paySettings.bankAccount;
              const qr = b.qrCodeUrl || (b.bankCode && b.accountNumber
                ? `https://img.vietqr.io/image/${b.bankCode}-${b.accountNumber}-compact2.jpg?accountName=${encodeURIComponent(b.accountName || "")}`
                : null);
              return qr ? (
                <div className="flex flex-col items-center justify-center p-4 bg-app-card/50 rounded-xl">
                  <p className="text-app-text-secondary text-xs mb-3">Quét mã QR để chuyển khoản</p>
                  <img loading="lazy" decoding="async" src={qr} alt="QR Code" className="w-48 h-48 rounded-lg bg-white" />
                  <p className="text-app-text-muted text-[10px] mt-3 text-center">Sử dụng app ngân hàng để quét mã</p>
                </div>
              ) : null;
            })()}
          </div>
          
          <div className="mt-4 pt-4 border-t border-app-border">
            <div className="flex items-start gap-2 text-app-accent-success/60 text-xs bg-emerald-400/5 px-3 py-2 rounded-lg">
              <i className="ri-information-line mt-0.5 flex-shrink-0"></i>
              <p>Sau khi chuyển khoản, vui lòng chụp màn hình giao dịch và gửi qua Zalo để admin kích hoạt VIP trong vòng 30 phút.</p>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <div className="mb-10">
        <h3 className="text-white font-bold text-lg mb-5 text-center">Học viên nói gì về Hàn Việt KTS?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.name} className="bg-app-bg border border-app-border rounded-2xl p-5">
              <StarRating count={t.rating} />
              <p className="text-white/60 text-sm leading-relaxed mt-3 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <img loading="lazy" decoding="async" src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0" />
                <div>
                  <p className="text-white/80 text-xs font-semibold">{t.name}</p>
                  <p className="text-app-text-muted text-[10px]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mb-8">
        <h3 className="text-white font-bold text-lg mb-5 text-center">Câu hỏi thường gặp</h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-white/2 transition-colors"
              >
                <span className="text-white/80 text-sm font-medium">{faq.q}</span>
                <i className={`ri-arrow-down-s-line text-app-text-muted transition-transform flex-shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""}`}></i>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-app-text-secondary text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-app-surface via-[#2a2000] to-[#1a1600] border border-app-accent-primary/15 rounded-2xl p-8 text-center">
        <p className="text-app-accent-primary text-xs font-semibold tracking-normal mb-2">Bắt đầu ngay hôm nay</p>
        <h3 className="text-white font-bold text-xl mb-2">7 ngày dùng thử — hoàn toàn miễn phí</h3>
        <p className="text-app-text-secondary text-sm mb-5">Không cần thẻ tín dụng. Hủy bất cứ lúc nào. Hỗ trợ qua Zalo 24/7.</p>
        <button
          onClick={handleRegister}
          className="inline-flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-8 py-3.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-vip-crown-line"></i>
          Đăng ký VIP ngay
        </button>
      </div>

      {/* Report VIP violation */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => setShowViolationModal(true)}
          className="flex items-center gap-2 text-xs text-app-text-muted hover:text-rose-400 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-shield-cross-line" />
          Báo cáo tài khoản chia sẻ VIP trái phép
        </button>
        <span className="text-white/10 hidden sm:block">|</span>
        <button
          onClick={() => navigate("/report-bug")}
          className="flex items-center gap-2 text-xs text-app-text-muted hover:text-app-accent-primary transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-bug-line" />
          Báo cáo lỗi kỹ thuật
        </button>
      </div>

      {/* VIP Violation Modal */}
      {showViolationModal && (
        <VipViolationModal onClose={() => setShowViolationModal(false)} />
      )}
    </DashboardLayout>
  );
}
