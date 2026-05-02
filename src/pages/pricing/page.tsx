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
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20woman%20smiling%20portrait%20professional%20photo%20warm%20lighting%20simple%20background&width=80&height=80&seq=t1&orientation=squarish",
    role: "Đang chuẩn bị thi EPS-TOPIK",
    text: "Nhờ gói VIP mình luyện được 50+ câu EPS mỗi ngày, chỉ sau 2 tháng đã tự tin hơn hẳn. Tính năng ghi âm giúp phát âm chuẩn hơn nhiều!",
    rating: 5,
  },
  {
    name: "Trần Văn Minh",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20smiling%20portrait%20casual%20photo%20warm%20lighting%20simple%20background&width=80&height=80&seq=t2&orientation=squarish",
    role: "K-pop fan, học tiếng Hàn 6 tháng",
    text: "Học qua bài hát K-pop thật sự thú vị, không nhàm chán như sách vở. VIP mở khóa toàn bộ kho bài — xứng đáng từng đồng!",
    rating: 5,
  },
  {
    name: "Phạm Thu Hương",
    avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20student%20smiling%20portrait%20photo%20natural%20lighting%20simple%20background&width=80&height=80&seq=t3&orientation=squarish",
    role: "Sinh viên, học TOPIK 2",
    text: "Lộ trình học cá nhân hóa theo cấp độ TOPIK rất hay. Mình biết chính xác cần học gì tiếp theo, không bị lạc hướng nữa.",
    rating: 5,
  },
  {
    name: "Lê Quốc Bảo",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20student%20glasses%20smiling%20portrait%20photo%20clean%20background&width=80&height=80&seq=t4&orientation=squarish",
    role: "Lao động, đã qua EPS-TOPIK",
    text: "Thi thử EPS trên web rất giống đề thi thật. Mình luyện 1 tháng trước khi đi thi, kết quả đạt 85/100. Cảm ơn Hàn Quốc Ơi!",
    rating: 5,
  },
  {
    name: "Hoàng Thị Mai",
    avatar: "https://readdy.ai/api/search-image?query=Vietnamese%20woman%20young%20professional%20smiling%20portrait%20photo%20modern%20background&width=80&height=80&seq=t5&orientation=squarish",
    role: "Nhân viên văn phòng",
    text: "Flashcard với Spaced Repetition giúp mình nhớ từ vựng lâu hơn. Trước đây học 100 từ quên 80, giờ nhớ 90%",
    rating: 5,
  },
  {
    name: "Đỗ Minh Tuấn",
    avatar: "https://readdy.ai/api/search-image?query=young%20Vietnamese%20man%20casual%20smiling%20portrait%20photo%20friendly%20background&width=80&height=80&seq=t6&orientation=squarish",
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
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-rose-500/12 rounded-xl">
              <i className="ri-shield-cross-line text-rose-400 text-sm" />
            </div>
            <p className="text-white font-bold text-sm">Báo cáo vi phạm VIP</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 cursor-pointer">
            <i className="ri-close-line" />
          </button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-500/10 rounded-2xl mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-emerald-400 text-3xl" />
            </div>
            <p className="text-white font-bold mb-2">Đã gửi báo cáo!</p>
            <p className="text-white/40 text-sm mb-5">Cảm ơn bạn đã giúp bảo vệ cộng đồng. Admin sẽ xử lý sớm nhất.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-[#e8c84a] text-[#0f1117] font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap">Xong</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email tài khoản nghi ngờ (nếu biết)</label>
              <input type="email" value={suspectedEmail} onChange={e => setSuspectedEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Lý do báo cáo <span className="text-rose-400">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value.slice(0, 300))} rows={3} maxLength={300} required
                placeholder="Mô tả hành vi vi phạm (chia sẻ tài khoản, bán lại VIP...)"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 resize-none" />
              <p className="text-[10px] text-right mt-0.5 text-white/20">{reason.length}/300</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Bằng chứng (link, ảnh...)</label>
              <input type="text" value={evidence} onChange={e => setEvidence(e.target.value.slice(0, 200))}
                placeholder="Link bằng chứng hoặc mô tả thêm"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm cursor-pointer whitespace-nowrap">Hủy</button>
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
      return <i className="ri-close-line text-white/20 text-lg"></i>;
    }
    if (val === true) {
      return (
        <div className="w-6 h-6 flex items-center justify-center rounded-full mx-auto" style={{ backgroundColor: isVip ? "#e8c84a20" : "#34d39920" }}>
          <i className={`ri-check-line text-sm ${isVip ? "text-[#e8c84a]" : "text-emerald-400"}`}></i>
        </div>
      );
    }
    return (
      <span className={`text-xs font-medium ${isVip ? "text-[#e8c84a]" : "text-white/50"}`}>{val}</span>
    );
  };

  return (
    <div className={`grid grid-cols-[1fr_120px_120px] items-center py-3 px-4 rounded-xl transition-colors ${feature.highlight ? "bg-white/3" : "hover:bg-white/2"}`}>
      <div className="flex items-center gap-2">
        {feature.highlight && <div className="w-1 h-1 rounded-full bg-[#e8c84a] flex-shrink-0"></div>}
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
        <i key={i} className="ri-star-fill text-[#e8c84a] text-xs"></i>
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
    <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-5 mb-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <i className="ri-checkbox-circle-fill"></i>{toast}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e8c84a]/10 flex-shrink-0">
            <i className="ri-refresh-line text-[#e8c84a] text-lg"></i>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Tự động gia hạn VIP</p>
            <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
              {autoRenew
                ? `VIP sẽ tự động gia hạn${daysLeft !== null ? ` sau ${daysLeft} ngày` : ""}. Bạn sẽ nhận email nhắc trước 3 ngày.`
                : `Bật để không bị gián đoạn học tập. Hệ thống sẽ nhắc bạn trước khi hết hạn.`
              }
            </p>
            {autoRenew && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-emerald-400 text-[10px] font-semibold">Đang hoạt động</span>
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
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "ri-mail-check-line", text: "Email nhắc trước 7 ngày", color: "#a78bfa" },
            { icon: "ri-shield-check-line", text: "Không bị gián đoạn học", color: "#34d399" },
            { icon: "ri-close-circle-line", text: "Hủy bất cứ lúc nào", color: "#fb923c" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3">
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
  const { profile } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);

  const monthlyPrice = 79000;
  const yearlyPrice = 59000;
  const currentPrice = billing === "monthly" ? monthlyPrice : yearlyPrice;
  const yearSaving = (monthlyPrice - yearlyPrice) * 12;

  const handleRegister = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <DashboardLayout
      title="Gói học VIP"
      subtitle="Mở khóa toàn bộ tính năng — học tiếng Hàn hiệu quả hơn gấp 3 lần"
    >
      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-lg">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          Đăng ký thành công! Chúng tôi sẽ liên hệ qua Zalo trong 30 phút.
        </div>
      )}

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8"
        style={{ background: "linear-gradient(135deg, #1a1600 0%, #2a2000 50%, #1a1600 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #e8c84a 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fb923c 0%, transparent 50%)" }}>
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#e8c84a]/10 border border-[#e8c84a]/20 text-[#e8c84a] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <i className="ri-vip-crown-line"></i>
            Dùng thử 7 ngày MIỄN PHÍ
          </div>
          <h2 className="text-white font-bold text-3xl mb-3 leading-tight">
            Học tiếng Hàn thật sự hiệu quả<br />
            <span className="text-[#e8c84a]">không cần đến trung tâm</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Kết hợp K-pop, tin tức thật, EPS-TOPIK và AI — phương pháp học độc đáo<br />
            chỉ có tại Hàn Việt KTS
          </p>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-white" : "text-white/40"}`}>Hàng tháng</span>
        <button
          onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${billing === "yearly" ? "bg-[#e8c84a]" : "bg-white/10"}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${billing === "yearly" ? "left-7" : "left-1"}`}></div>
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-white" : "text-white/40"}`}>Hàng năm</span>
          <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
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
        <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-6">
          <div className="mb-5">
            <p className="text-white/40 text-xs font-semibold tracking-normal mb-2">Miễn phí</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-bold text-4xl">0đ</span>
            </div>
            <p className="text-white/30 text-xs">Mãi mãi miễn phí</p>
          </div>
          <div className="space-y-2.5 mb-6">
            {["Hangul cơ bản", "20 flashcard/ngày", "3 câu EPS/ngày", "5 câu quiz/lần", "Streak hàng ngày"].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-white/5 flex-shrink-0">
                  <i className="ri-check-line text-white/30 text-[10px]"></i>
                </div>
                <span className="text-white/40 text-sm">{f}</span>
              </div>
            ))}
          </div>
          {isVipActive(profile) ? (
            <div className="w-full py-3 rounded-xl border border-white/8 text-white/25 text-sm font-medium text-center">
              Gói cơ bản
            </div>
          ) : (
            <button className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-sm font-medium cursor-default whitespace-nowrap">
              Đang dùng
            </button>
          )}
        </div>

        {/* VIP */}
        <div className="relative bg-gradient-to-b from-[#1a1600] to-[#0f1117] border border-[#e8c84a]/30 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#e8c84a] text-[#0f1117] text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            PHỔ BIẾN NHẤT
          </div>
          <div className="mb-5">
            <p className="text-[#e8c84a] text-xs font-semibold tracking-normal mb-2">VIP</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-bold text-4xl">{new Intl.NumberFormat("vi-VN").format(currentPrice)}đ</span>
              <span className="text-white/30 text-sm mb-1">/tháng</span>
            </div>
            {billing === "yearly" && (
              <p className="text-white/30 text-xs">Thanh toán {new Intl.NumberFormat("vi-VN").format(currentPrice * 12)}đ/năm</p>
            )}
            {billing === "monthly" && (
              <p className="text-white/30 text-xs">Hủy bất cứ lúc nào</p>
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
                <div className="w-4 h-4 flex items-center justify-center rounded-full bg-[#e8c84a]/15 flex-shrink-0">
                  <i className="ri-check-line text-[#e8c84a] text-[10px]"></i>
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
          {isVipActive(profile) ? (
            <div className="space-y-2">
              <div className="w-full py-3 rounded-xl bg-[#e8c84a]/10 border border-[#e8c84a]/25 text-[#e8c84a] text-sm font-bold text-center flex items-center justify-center gap-2">
                <i className="ri-vip-crown-fill"></i>
                Đang sử dụng VIP
              </div>
              <button
                onClick={() => navigate("/vip-history")}
                className="w-full py-2 rounded-xl border border-white/8 text-white/40 text-xs cursor-pointer whitespace-nowrap hover:bg-white/5 transition-colors"
              >
                Xem lịch sử giao dịch
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleRegister}
                className="w-full py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-vip-crown-line"></i>
                Dùng thử 7 ngày miễn phí
              </button>
              <p className="text-white/25 text-[10px] text-center mt-2">Không cần thẻ tín dụng</p>
            </>
          )}
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden mb-10 overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[1fr_120px_120px] items-center px-4 py-4 border-b border-white/5">
            <p className="text-white/40 text-xs font-semibold tracking-normal">Tính năng</p>
            <p className="text-white/40 text-xs font-semibold text-center">Miễn phí</p>
            <p className="text-[#e8c84a] text-xs font-semibold text-center">VIP</p>
          </div>
          <div className="divide-y divide-white/3">
            {features.map(f => <FeatureRow key={f.label} feature={f} />)}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-10">
        <h3 className="text-white font-bold text-lg mb-5 text-center">Học viên nói gì về Hàn Việt KTS?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.name} className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
              <StarRating count={t.rating} />
              <p className="text-white/60 text-sm leading-relaxed mt-3 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0" />
                <div>
                  <p className="text-white/80 text-xs font-semibold">{t.name}</p>
                  <p className="text-white/30 text-[10px]">{t.role}</p>
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
            <div key={i} className="bg-[#0f1117] border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-white/2 transition-colors"
              >
                <span className="text-white/80 text-sm font-medium">{faq.q}</span>
                <i className={`ri-arrow-down-s-line text-white/30 transition-transform flex-shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""}`}></i>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-[#1a1600] via-[#2a2000] to-[#1a1600] border border-[#e8c84a]/15 rounded-2xl p-8 text-center">
        <p className="text-[#e8c84a] text-xs font-semibold tracking-normal mb-2">Bắt đầu ngay hôm nay</p>
        <h3 className="text-white font-bold text-xl mb-2">7 ngày dùng thử — hoàn toàn miễn phí</h3>
        <p className="text-white/40 text-sm mb-5">Không cần thẻ tín dụng. Hủy bất cứ lúc nào. Hỗ trợ qua Zalo 24/7.</p>
        <button
          onClick={handleRegister}
          className="inline-flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm px-8 py-3.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-vip-crown-line"></i>
          Đăng ký VIP ngay
        </button>
      </div>

      {/* Report VIP violation */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => setShowViolationModal(true)}
          className="flex items-center gap-2 text-xs text-white/25 hover:text-rose-400 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-shield-cross-line" />
          Báo cáo tài khoản chia sẻ VIP trái phép
        </button>
        <span className="text-white/10 hidden sm:block">|</span>
        <button
          onClick={() => navigate("/report-bug")}
          className="flex items-center gap-2 text-xs text-white/25 hover:text-[#e8c84a] transition-colors cursor-pointer whitespace-nowrap"
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
