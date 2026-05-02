import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { sanitizeHtmlAdmin } from "@/lib/sanitize";

export interface AdConfig {
  id: string;
  position: "top" | "sidebar" | "between-content" | "bottom";
  enabled: boolean;
  type: "image" | "html" | "text";
  content: string; // HTML string or image URL or text
  linkUrl?: string;
  title?: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdBannerProps {
  position: AdConfig["position"];
  className?: string;
}

const DEFAULT_ADS: AdConfig[] = [
  {
    id: "ad-default-1",
    position: "between-content",
    enabled: true,
    type: "html",
    content: `<div style="background:linear-gradient(135deg,#1a1600,#0f1117);border:1px solid rgba(232,200,74,0.2);border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px;">
  <div style="width:40px;height:40px;background:rgba(232,200,74,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    <span style="font-size:20px;">👑</span>
  </div>
  <div style="flex:1;">
    <p style="color:#e8c84a;font-weight:700;font-size:13px;margin:0 0 2px;">Nâng cấp VIP — Học không giới hạn</p>
    <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0;">Mở khóa 2.691 từ Hán Hàn, AI Gia sư, Spaced Repetition và nhiều hơn nữa</p>
  </div>
  <a href="/pricing" style="background:#e8c84a;color:#0f1117;font-weight:700;font-size:11px;padding:8px 16px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;">Xem gói VIP</a>
</div>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AdBanner({ position, className = "" }: AdBannerProps) {
  const [adConfigs] = useLocalStorage<AdConfig[]>("kts_ad_configs", DEFAULT_ADS);
  const [globalEnabled] = useLocalStorage<boolean>("kts_ads_global_enabled", true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const ads = adConfigs.filter(
    (ad) => ad.position === position && ad.enabled && globalEnabled && !dismissed.includes(ad.id)
  );

  if (ads.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {ads.map((ad) => (
        <AdItem key={ad.id} ad={ad} onDismiss={() => setDismissed((p) => [...p, ad.id])} />
      ))}
    </div>
  );
}

function AdItem({ ad, onDismiss }: { ad: AdConfig; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (ad.type === "html") {
    return (
      <div
        className={`relative transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <div
          dangerouslySetInnerHTML={{ __html: sanitizeHtmlAdmin(ad.content) }}
          className="ad-banner-html"
        />
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-black/30 text-white/40 hover:text-white/70 cursor-pointer transition-colors z-10"
          title="Đóng quảng cáo"
        >
          <i className="ri-close-line text-[10px]"></i>
        </button>
        <span className="absolute bottom-2 right-2 text-[8px] text-white/20 pointer-events-none">Quảng cáo</span>
      </div>
    );
  }

  if (ad.type === "image" && ad.content) {
    return (
      <div className={`relative transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
        <a href={ad.linkUrl || "#"} target="_blank" rel="nofollow noreferrer">
          <img src={ad.content} alt={ad.title || "Quảng cáo"} className="w-full rounded-xl object-cover" />
        </a>
        <button onClick={handleDismiss} className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white/60 hover:text-white cursor-pointer">
          <i className="ri-close-line text-[10px]"></i>
        </button>
        <span className="absolute bottom-2 right-2 text-[8px] text-white/30 bg-black/40 px-1.5 py-0.5 rounded">Quảng cáo</span>
      </div>
    );
  }

  // text type
  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ backgroundColor: ad.bgColor || "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.15)" }}
    >
      <button onClick={handleDismiss} className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/5 text-white/30 hover:text-white/60 cursor-pointer">
        <i className="ri-close-line text-[10px]"></i>
      </button>
      <p className="text-sm font-semibold mb-1 pr-6" style={{ color: ad.textColor || "#e8c84a" }}>{ad.title}</p>
      {ad.description && <p className="text-xs text-white/40">{ad.description}</p>}
      {ad.linkUrl && (
        <a href={ad.linkUrl} className="mt-2 inline-block text-xs font-semibold underline" style={{ color: ad.textColor || "#e8c84a" }}>
          Xem thêm →
        </a>
      )}
      <span className="absolute bottom-2 right-2 text-[8px] text-white/20">Quảng cáo</span>
    </div>
  );
}
