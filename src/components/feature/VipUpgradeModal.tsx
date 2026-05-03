import { useNavigate } from "react-router-dom";
import { memo } from "react";

interface VipUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: "not_logged_in" | "not_vip" | "not_vip_year";
  featureName?: string;
}

const REASONS = {
  not_logged_in: {
    icon: "ri-user-line",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    title: "Vui lòng đăng nhập",
    desc: "Bạn cần đăng nhập để sử dụng tính năng này.",
    cta: "Đăng nhập ngay",
    ctaHref: "/login",
    ctaStyle: "bg-amber-400 hover:bg-amber-500 text-black",
  },
  not_vip: {
    icon: "ri-vip-crown-line",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
    title: "Tính năng dành cho VIP",
    desc: "Nâng cấp tài khoản VIP để mở khóa tính năng xuất file và nhiều tính năng cao cấp khác.",
    cta: "Nâng cấp VIP",
    ctaHref: "/pricing",
    ctaStyle: "bg-app-accent-primary hover:bg-[#d4b43a] text-black",
  },
  not_vip_year: {
    icon: "ri-vip-diamond-line",
    iconBg: "bg-app-accent-primary/10",
    iconColor: "text-app-accent-primary",
    title: "Chỉ dành cho VIP Năm",
    desc: "Tính năng xuất file đầy đủ chỉ dành cho gói VIP Năm. Gói VIP Tháng được xuất tối đa 50 từ có watermark.",
    cta: "Xem gói VIP Năm",
    ctaHref: "/pricing",
    ctaStyle: "bg-app-accent-primary hover:bg-[#d4b43a] text-black",
  },
};

const PLAN_COMPARE = [
  { label: "Xuất CSV / TXT / JSON", free: false, month: "50 từ", year: true },
  { label: "Xuất Anki Deck", free: false, month: false, year: true },
  { label: "Xuất PDF flashcard", free: false, month: false, year: true },
  { label: "Không watermark", free: false, month: false, year: true },
  { label: "Học không giới hạn", free: false, month: true, year: true },
  { label: "AI Chatbot", free: false, month: true, year: true },
];

function PlanCell({ value }: { value: boolean | string }) {
  if (value === true) return <i className="ri-checkbox-circle-fill text-app-accent-success text-base"></i>;
  if (value === false) return <i className="ri-close-circle-line text-app-text-muted text-base"></i>;
  return <span className="text-app-accent-primary text-xs font-semibold">{value}</span>;
}

function VipUpgradeModal({ open, onClose, reason, featureName }: VipUpgradeModalProps) {
  const navigate = useNavigate();
  if (!open) return null;

  const info = REASONS[reason];

  const handleCta = () => {
    onClose();
    navigate(info.ctaHref);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#1a1d27] to-[#0f1117] px-6 pt-7 pb-5 text-center relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-app-text-muted hover:text-white/70 hover:bg-app-card/70 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-sm"></i>
          </button>

          {/* Icon */}
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${info.iconBg} mx-auto mb-4`}>
            <i className={`${info.icon} text-2xl ${info.iconColor}`}></i>
          </div>

          <h3 className="text-white font-bold text-lg mb-1.5">{info.title}</h3>
          {featureName && (
            <p className="text-app-text-secondary text-xs mb-2">
              Tính năng: <span className="text-white/60 font-medium">{featureName}</span>
            </p>
          )}
          <p className="text-white/50 text-sm leading-relaxed">{info.desc}</p>
        </div>

        {/* Plan comparison — only for vip-related reasons */}
        {reason !== "not_logged_in" && (
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 tracking-normal mb-3">So sánh gói</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-gray-400 font-medium pb-2 pr-3">Tính năng</th>
                    <th className="text-center text-gray-400 font-medium pb-2 px-2">Free</th>
                    <th className="text-center text-gray-400 font-medium pb-2 px-2">VIP Tháng</th>
                    <th className="text-center text-app-accent-primary font-bold pb-2 px-2">VIP Năm ⭐</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PLAN_COMPARE.map((row) => (
                    <tr key={row.label}>
                      <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">{row.label}</td>
                      <td className="py-2 px-2 text-center"><PlanCell value={row.free} /></td>
                      <td className="py-2 px-2 text-center"><PlanCell value={row.month} /></td>
                      <td className="py-2 px-2 text-center bg-app-accent-primary/5 rounded"><PlanCell value={row.year} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-5 py-4 space-y-2.5">
          <button
            onClick={handleCta}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${info.ctaStyle}`}
          >
            <i className={info.icon}></i>
            {info.cta}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}

const MemoizedVipUpgradeModal = memo(VipUpgradeModal);
export default MemoizedVipUpgradeModal;
