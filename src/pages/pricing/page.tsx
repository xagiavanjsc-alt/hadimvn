import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase, isVipActive } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface PlanFeature {
  label: string;
  free: boolean | string;
  vip: boolean | string;
  highlight?: boolean;
}

const features: PlanFeature[] = [
  { label: "B?ng ch? Hangul tuong tác", free: true, vip: true },
  { label: "Flashcard t? v?ng co b?n", free: "20 th?/ngày", vip: "Không gi?i h?n", highlight: true },
  { label: "Luy?n thi EPS-TOPIK", free: "3 câu/ngày", vip: "50+ câu, t?t c? ch? d?", highlight: true },
  { label: "Quiz ki?m tra ki?n th?c", free: "5 câu/l?n", vip: "Không gi?i h?n", highlight: true },
  { label: "H?c qua tin t?c Naver", free: false, vip: true, highlight: true },
  { label: "Ghi âm & so sánh phát âm", free: false, vip: true, highlight: true },
  { label: "L? trình h?c TOPIK 1?6", free: "Xem thôi", vip: "Cá nhân hóa theo trình d?" },
  { label: "K-pop Lesson (bài hát Hàn)", free: "2 bài/tu?n", vip: "Toàn b? kho bài" },
  { label: "T? di?n K-pop chuyên sâu", free: true, vip: true },
  { label: "Xu?t ebook PDF", free: false, vip: true },
  { label: "Streak & Gamification", free: true, vip: true },
  { label: "H? tr? uu tiên", free: false, vip: true },
  { label: "Không qu?ng cáo", free: false, vip: true },
  { label: "C?p nh?t tính nang s?m nh?t", free: false, vip: true },
];

const testimonials = [
  {
    name: "Nguy?n Th? Lan",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20woman%20smiling%20portrait%20professional%20photo%20warm%20lighting%20simple%20background&width=80&height=80&seq=t1&orientation=squarish",
    role: "Ðang chu?n b? thi EPS-TOPIK",
    text: "Nh? gói VIP mình luy?n du?c 50+ câu EPS m?i ngày, ch? sau 2 tháng dã t? tin hon h?n. Tính nang ghi âm giúp phát âm chu?n hon nhi?u!",
    rating: 5,
  },
  {
    name: "Tr?n Van Minh",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20smiling%20portrait%20casual%20photo%20warm%20lighting%20simple%20background&width=80&height=80&seq=t2&orientation=squarish",
    role: "K-pop fan, h?c ti?ng Hàn 6 tháng",
    text: "H?c qua bài hát K-pop th?t s? thú v?, không nhàm chán nhu sách v?. VIP m? khóa toàn b? kho bài — x?ng dáng t?ng d?ng!",
    rating: 5,
  },
  {
    name: "Ph?m Thu Huong",
    avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20student%20smiling%20portrait%20photo%20natural%20lighting%20simple%20background&width=80&height=80&seq=t3&orientation=squarish",
    role: "Sinh viên, h?c TOPIK 2",
    text: "L? trình h?c cá nhân hóa theo c?p d? TOPIK r?t hay. Mình bi?t chính xác c?n h?c gì ti?p theo, không b? l?c hu?ng n?a.",
    rating: 5,
  },
  {
    name: "Lê Qu?c B?o",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20student%20glasses%20smiling%20portrait%20photo%20clean%20background&width=80&height=80&seq=t4&orientation=squarish",
    role: "Lao d?ng, dã qua EPS-TOPIK",
    text: "Thi th? EPS trên web r?t gi?ng d? thi th?t. Mình luy?n 1 tháng tru?c khi di thi, k?t qu? d?t 85/100. C?m on Hàn Qu?c Oi!",
    rating: 5,
  },
  {
    name: "Hoàng Th? Mai",
    avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20young%20professional%20smiling%20portrait%20photo%20modern%20background&width=80&height=80&seq=t5&orientation=squarish",
    role: "Nhân viên van phòng",
    text: "Flashcard v?i Spaced Repetition giúp mình nh? t? v?ng lâu hon. Tru?c dây h?c 100 t? quên 80, gi? nh? 90%",
    rating: 5,
  },
  {
    name: "Ð? Minh Tu?n",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20casual%20smiling%20portrait%20photo%20friendly%20background&width=80&height=80&seq=t6&orientation=squarish",
    role: "Sinh viên d?i h?c",
    text: "Tính nang h?c qua tin t?c Naver giúp mình v?a h?c ti?ng Hàn v?a c?p nh?t tin t?c Hàn. R?t th?c t? và h?u ích!",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Gói VIP có th? h?y b?t c? lúc nào không?",
    a: "Có! B?n có th? h?y gói VIP b?t c? lúc nào. Sau khi h?y, b?n v?n dùng du?c d?n h?t chu k? thanh toán hi?n t?i.",
  },
  {
    q: "Có dùng th? VIP mi?n phí không?",
    a: "Có! B?n du?c dùng th? VIP 7 ngày mi?n phí khi dang ký l?n d?u. Không c?n th? tín d?ng.",
  },
  {
    q: "Thanh toán b?ng phuong th?c nào?",
    a: "H? tr? chuy?n kho?n ngân hàng, MoMo, ZaloPay, và th? Visa/Mastercard.",
  },
  {
    q: "N?i dung có c?p nh?t thu?ng xuyên không?",
    a: "Có! Tin t?c Hàn c?p nh?t hàng tu?n, câu h?i EPS và bài K-pop du?c b? sung liên t?c. VIP luôn du?c truy c?p n?i dung m?i nh?t.",
  },
  {
    q: "H?c sinh/sinh viên có du?c gi?m giá không?",
    a: "Có! Liên h? qua Zalo d? du?c h? tr? giá h?c sinh v?i m?c gi?m 30% khi xu?t trình th? sinh viên.",
  },
];

// --- VIP Violation Modal -----------------------------------------------------
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
        reporter_name: "Thành viên ?n danh",
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
            <p className="text-white font-bold text-sm">Báo cáo vi ph?m VIP</p>
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
            <p className="text-white font-bold mb-2">Ðã g?i báo cáo!</p>
            <p className="text-app-text-secondary text-sm mb-5">C?m on b?n dã giúp b?o v? c?ng d?ng. Admin s? x? lý s?m nh?t.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap">Xong</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email tài kho?n nghi ng? (n?u bi?t)</label>
              <input type="email" value={suspectedEmail} onChange={e => setSuspectedEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Lý do báo cáo <span className="text-rose-400">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value.slice(0, 300))} rows={3} maxLength={300} required
                placeholder="Mô t? hành vi vi ph?m (chia s? tài kho?n, bán l?i VIP...)"
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 resize-none" />
              <p className="text-[10px] text-right mt-0.5 text-app-text-muted">{reason.length}/300</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">B?ng ch?ng (link, ?nh...)</label>
              <input type="text" value={evidence} onChange={e => setEvidence(e.target.value.slice(0, 200))}
                placeholder="Link b?ng ch?ng ho?c mô t? thêm"
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm cursor-pointer whitespace-nowrap">H?y</button>
              <button type="submit" disabled={submitting || !reason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {submitting ? "Ðang g?i..." : "G?i báo cáo"}
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
        <div className="w-6 h-6 flex items-center justify-center rounded-full mx-auto" style={{ backgroundColor: isVip ? "app-accent-primary20" : "#34d39920" }}>
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

// --- Auto-Renew Toggle -------------------------------------------------------
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
    setToast(newVal ? "Ðã b?t t? d?ng gia h?n VIP!" : "Ðã t?t t? d?ng gia h?n VIP.");
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
            <p className="text-white font-semibold text-sm">T? d?ng gia h?n VIP</p>
            <p className="text-app-text-secondary text-xs mt-0.5 leading-relaxed">
              {autoRenew
                ? `VIP s? t? d?ng gia h?n${daysLeft !== null ? ` sau ${daysLeft} ngày` : ""}. B?n s? nh?n email nh?c tru?c 3 ngày.`
                : `B?t d? không b? gián do?n h?c t?p. H? th?ng s? nh?c b?n tru?c khi h?t h?n.`
              }
            </p>
            {autoRenew && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-app-accent-success text-[10px] font-semibold">Ðang ho?t d?ng</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className="relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors disabled:opacity-50"
          style={{ backgroundColor: autoRenew ? "app-accent-primary" : "rgba(255,255,255,0.1)" }}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoRenew ? "left-7" : "left-1"}`} />
        </button>
      </div>
      {autoRenew && (
        <div className="mt-4 pt-4 border-t border-app-border grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "ri-mail-check-line", text: "Email nh?c tru?c 7 ngày", color: "#a78bfa" },
            { icon: "ri-shield-check-line", text: "Không b? gián do?n h?c", color: "#34d399" },
            { icon: "ri-close-circle-line", text: "H?y b?t c? lúc nào", color: "#fb923c" },
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
  const { profile, user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [loadingBankInfo, setLoadingBankInfo] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const monthlyPrice = 79000;
  const yearlyPrice = 59000;
  const currentPrice = billing === "monthly" ? monthlyPrice : yearlyPrice;
  const yearSaving = (monthlyPrice - yearlyPrice) * 12;

  const handleRegister = () => {
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!profile || !paymentProof) return;
    
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
      alert("Có l?i x?y ra. Vui lòng th? l?i.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Load bank account settings from admin settings
  useEffect(() => {
    const loadBankSettings = async () => {
      try {
        const res = await supabase.functions.invoke("admin-grant-vip", {
          body: { action: "get_settings" },
        });
        if (res.data?.data?.bank_account) {
          setBankAccount(res.data.data.bank_account);
        }
      } catch {
        // Fallback to localStorage
        const localSettings = localStorage.getItem("kts_settings");
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          if (parsed.bankAccount) {
            setBankAccount(parsed.bankAccount);
          }
        }
      } finally {
        setLoadingBankInfo(false);
      }
    };
    loadBankSettings();
  }, []);

  return (
    <DashboardLayout
      title="Gói h?c VIP"
      subtitle="M? khóa toàn b? tính nang — h?c ti?ng Hàn hi?u qu? hon g?p 3 l?n"
    >
      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-app-accent-success px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-lg">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          Ðã g?i yêu c?u thanh toán! Chúng tôi s? xác nh?n và kích ho?t VIP trong vòng 30 phút.
        </div>
      )}

      {/* Payment Submission Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-xl">
                  <i className="ri-bank-line text-app-accent-success text-lg"></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">G?i minh ch?ng thanh toán</p>
                  <p className="text-app-text-secondary text-xs">Ch?p màn hình giao d?ch chuy?n kho?n</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">?nh minh ch?ng</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setPaymentProof(e.target.files?.[0] || null)}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label
                    htmlFor="payment-proof"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-app-border rounded-xl cursor-pointer hover:border-white/20 transition-colors bg-app-surface/50"
                  >
                    {paymentProof ? (
                      <div className="text-center">
                        <i className="ri-image-line text-2xl text-app-accent-success"></i>
                        <p className="text-white/60 text-xs mt-2">{paymentProof.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <i className="ri-upload-cloud-line text-2xl text-app-text-muted"></i>
                        <p className="text-app-text-secondary text-xs mt-2">Click d? ch?n ?nh</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Ghi chú (tùy ch?n)</label>
                <textarea
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  placeholder="VD: Ðã chuy?n 790.000d cho gói VIP tháng"
                  rows={3}
                  className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors resize-none"
                />
              </div>
              
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <i className="ri-information-line text-app-accent-success text-xs mt-0.5 flex-shrink-0"></i>
                  <p className="text-app-accent-success/70 text-xs leading-relaxed">
                    S? ti?n c?n chuy?n: <span className="text-app-accent-success font-semibold">{new Intl.NumberFormat("vi-VN").format(billing === "monthly" ? monthlyPrice : yearlyPrice * 12)}d</span>
                    <br />
                    N?i dung chuy?n kho?n: <span className="text-app-accent-success font-semibold">VIP_{user?.email?.split("@")[0] || "EMAIL"}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer"
                >
                  H?y
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={!paymentProof || submittingPayment}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingPayment ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Ðang g?i...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-line"></i>
                      G?i yêu c?u
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8"
        style={{ background: "linear-gradient(135deg, #1a1600 0%, #2a2000 50%, #1a1600 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, app-accent-primary 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fb923c 0%, transparent 50%)" }}>
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <i className="ri-vip-crown-line"></i>
            Dùng th? 7 ngày MI?N PHÍ
          </div>
          <h2 className="text-white font-bold text-3xl mb-3 leading-tight">
            H?c ti?ng Hàn th?t s? hi?u qu?<br />
            <span className="text-app-accent-primary">không c?n d?n trung tâm</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            K?t h?p K-pop, tin t?c th?t, EPS-TOPIK và AI — phuong pháp h?c d?c dáo<br />
            ch? có t?i Hàn Vi?t KTS
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
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-white" : "text-app-text-secondary"}`}>Hàng nam</span>
          <span className="text-[10px] font-bold bg-app-accent-success/15 text-app-accent-success px-2 py-0.5 rounded-full">
            Ti?t ki?m {new Intl.NumberFormat("vi-VN").format(yearSaving)}d
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
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-2">Mi?n phí</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-bold text-4xl">0d</span>
            </div>
            <p className="text-app-text-muted text-xs">Mãi mãi mi?n phí</p>
          </div>
          <div className="space-y-2.5 mb-6">
            {["Hangul co b?n", "20 flashcard/ngày", "3 câu EPS/ngày", "5 câu quiz/l?n", "Streak hàng ngày"].map(f => (
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
              Gói co b?n
            </div>
          ) : (
            <button className="w-full py-3 rounded-xl border border-app-border text-app-text-secondary text-sm font-medium cursor-default whitespace-nowrap">
              Ðang dùng
            </button>
          )}
        </div>

        {/* VIP */}
        <div className="relative bg-gradient-to-b from-app-surface to-[#0f1117] border border-app-accent-primary/30 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 bg-app-accent-primary text-app-bg text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            PH? BI?N NH?T
          </div>
          <div className="mb-5">
            <p className="text-app-accent-primary text-xs font-semibold tracking-normal mb-2">VIP</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-bold text-4xl">{new Intl.NumberFormat("vi-VN").format(currentPrice)}d</span>
              <span className="text-app-text-muted text-sm mb-1">/tháng</span>
            </div>
            {billing === "yearly" && (
              <p className="text-app-text-muted text-xs">Thanh toán {new Intl.NumberFormat("vi-VN").format(currentPrice * 12)}d/nam</p>
            )}
            {billing === "monthly" && (
              <p className="text-app-text-muted text-xs">H?y b?t c? lúc nào</p>
            )}
          </div>
          <div className="space-y-2.5 mb-6">
            {[
              "T?t c? tính nang Free",
              "50+ câu EPS không gi?i h?n",
              "H?c qua tin t?c Naver th?t",
              "Ghi âm & so sánh phát âm",
              "L? trình TOPIK cá nhân hóa",
              "Toàn b? kho K-pop Lesson",
              "Xu?t ebook PDF",
              "Không qu?ng cáo",
              "H? tr? uu tiên qua Zalo",
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
                Ðang s? d?ng VIP
              </div>
              <button
                onClick={() => navigate("/vip-history")}
                className="w-full py-2 rounded-xl border border-app-border text-app-text-secondary text-xs cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors"
              >
                Xem l?ch s? giao d?ch
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleRegister}
                className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-vip-crown-line"></i>
                Dùng th? 7 ngày mi?n phí
              </button>
              <p className="text-app-text-muted text-[10px] text-center mt-2">Không c?n th? tín d?ng</p>
            </>
          )}
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden mb-10 overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[1fr_120px_120px] items-center px-4 py-4 border-b border-app-border">
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal">Tính nang</p>
            <p className="text-app-text-secondary text-xs font-semibold text-center">Mi?n phí</p>
            <p className="text-app-accent-primary text-xs font-semibold text-center">VIP</p>
          </div>
          <div className="divide-y divide-white/3">
            {features.map(f => <FeatureRow key={f.label} feature={f} />)}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {bankAccount && bankAccount.bankName && bankAccount.accountNumber && (
        <div className="bg-app-bg border border-emerald-500/20 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-xl">
              <i className="ri-bank-line text-app-accent-success text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Thông tin thanh toán</p>
              <p className="text-app-text-secondary text-xs">Chuy?n kho?n ngân hàng ho?c quét QR Code</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Account Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Ngân hàng</span>
                <span className="text-white text-sm font-medium">{bankAccount.bankName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">S? tài kho?n</span>
                <span className="text-white text-sm font-medium font-mono">{bankAccount.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Ch? tài kho?n</span>
                <span className="text-white text-sm font-medium">{bankAccount.accountName}</span>
              </div>
              {bankAccount.branch && (
                <div className="flex items-center justify-between py-2 border-b border-app-border">
                  <span className="text-app-text-secondary text-xs">Chi nhánh</span>
                  <span className="text-white text-sm font-medium">{bankAccount.branch}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-app-text-secondary text-xs">N?i dung chuy?n kho?n</span>
                <span className="text-app-accent-success text-sm font-medium">VIP_[EMAIL_CUA_BAN]</span>
              </div>
            </div>
            
            {/* QR Code */}
            {bankAccount.qrCodeUrl && (
              <div className="flex flex-col items-center justify-center p-4 bg-app-card/50 rounded-xl">
                <p className="text-app-text-secondary text-xs mb-3">Quét mã QR d? chuy?n kho?n</p>
                <img src={bankAccount.qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
                <p className="text-app-text-muted text-[10px] mt-3 text-center">S? d?ng app ngân hàng d? quét mã</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-app-border">
            <div className="flex items-start gap-2 text-app-accent-success/60 text-xs bg-emerald-400/5 px-3 py-2 rounded-lg">
              <i className="ri-information-line mt-0.5 flex-shrink-0"></i>
              <p>Sau khi chuy?n kho?n, vui lòng ch?p màn hình giao d?ch và g?i qua Zalo d? admin kích ho?t VIP trong vòng 30 phút.</p>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <div className="mb-10">
        <h3 className="text-white font-bold text-lg mb-5 text-center">H?c viên nói gì v? Hàn Vi?t KTS?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.name} className="bg-app-bg border border-app-border rounded-2xl p-5">
              <StarRating count={t.rating} />
              <p className="text-white/60 text-sm leading-relaxed mt-3 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0" />
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
        <h3 className="text-white font-bold text-lg mb-5 text-center">Câu h?i thu?ng g?p</h3>
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
        <p className="text-app-accent-primary text-xs font-semibold tracking-normal mb-2">B?t d?u ngay hôm nay</p>
        <h3 className="text-white font-bold text-xl mb-2">7 ngày dùng th? — hoàn toàn mi?n phí</h3>
        <p className="text-app-text-secondary text-sm mb-5">Không c?n th? tín d?ng. H?y b?t c? lúc nào. H? tr? qua Zalo 24/7.</p>
        <button
          onClick={handleRegister}
          className="inline-flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-8 py-3.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-vip-crown-line"></i>
          Ðang ký VIP ngay
        </button>
      </div>

      {/* Report VIP violation */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => setShowViolationModal(true)}
          className="flex items-center gap-2 text-xs text-app-text-muted hover:text-rose-400 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-shield-cross-line" />
          Báo cáo tài kho?n chia s? VIP trái phép
        </button>
        <span className="text-white/10 hidden sm:block">|</span>
        <button
          onClick={() => navigate("/report-bug")}
          className="flex items-center gap-2 text-xs text-app-text-muted hover:text-app-accent-primary transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-bug-line" />
          Báo cáo l?i k? thu?t
        </button>
      </div>

      {/* VIP Violation Modal */}
      {showViolationModal && (
        <VipViolationModal onClose={() => setShowViolationModal(false)} />
      )}
    </DashboardLayout>
  );
}
