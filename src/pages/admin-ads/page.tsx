import { useState } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AdConfig } from "@/components/feature/AdBanner";
import { sanitizeHtmlAdmin } from "@/lib/sanitize";

const POSITION_LABELS: Record<AdConfig["position"], string> = {
  top: "Đầu trang",
  sidebar: "Thanh bên",
  "between-content": "Giữa nội dung",
  bottom: "Cuối trang",
};

const POSITION_ICONS: Record<AdConfig["position"], string> = {
  top: "ri-layout-top-line",
  sidebar: "ri-layout-right-line",
  "between-content": "ri-layout-column-line",
  bottom: "ri-layout-bottom-line",
};

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

function AdEditor({
  ad,
  onSave,
  onCancel,
}: {
  ad: Partial<AdConfig>;
  onSave: (ad: AdConfig) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<AdConfig>>({
    position: "between-content",
    type: "html",
    enabled: true,
    content: "",
    title: "",
    description: "",
    linkUrl: "",
    bgColor: "",
    textColor: "",
    ...ad,
  });
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    if (!form.content?.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: form.id || `ad-${Date.now()}`,
      position: form.position || "between-content",
      enabled: form.enabled ?? true,
      type: form.type || "html",
      content: form.content || "",
      linkUrl: form.linkUrl,
      title: form.title,
      description: form.description,
      bgColor: form.bgColor,
      textColor: form.textColor,
      createdAt: form.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl rounded-2xl border overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-500/12">
              <i className="ri-advertisement-line text-orange-400 text-sm"></i>
            </div>
            <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
              {form.id ? "Chỉnh sửa quảng cáo" : "Thêm quảng cáo mới"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ backgroundColor: previewMode ? "rgba(232,200,74,0.15)" : "var(--admin-hover)", color: previewMode ? "#e8c84a" : "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
            >
              <i className={`${previewMode ? "ri-edit-line" : "ri-eye-line"} mr-1`}></i>
              {previewMode ? "Chỉnh sửa" : "Xem trước"}
            </button>
            <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {previewMode ? (
            <div>
              <p className="text-xs mb-3 font-semibold" style={{ color: "var(--admin-text-muted)" }}>Xem trước quảng cáo:</p>
              {form.type === "html" ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlAdmin(form.content || "") }} />
              ) : form.type === "image" ? (
                <img src={form.content} alt="preview" className="w-full rounded-xl" />
              ) : (
                <div className="rounded-xl p-4" style={{ backgroundColor: form.bgColor || "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.15)" }}>
                  <p className="font-semibold text-sm" style={{ color: form.textColor || "#e8c84a" }}>{form.title}</p>
                  <p className="text-xs text-white/40 mt-1">{form.description}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Position + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Vị trí hiển thị</label>
                  <select
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value as AdConfig["position"] }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}
                  >
                    {(["top", "sidebar", "between-content", "bottom"] as const).map(p => (
                      <option key={p} value={p}>{POSITION_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Loại quảng cáo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as AdConfig["type"] }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}
                  >
                    <option value="html">HTML tùy chỉnh</option>
                    <option value="image">Hình ảnh</option>
                    <option value="text">Văn bản</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>
                  {form.type === "html" ? "Mã HTML" : form.type === "image" ? "URL hình ảnh" : "Nội dung văn bản"}
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                {form.type === "html" ? (
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={8}
                    placeholder="Nhập mã HTML quảng cáo..."
                    className="w-full rounded-xl px-4 py-3 text-xs outline-none border resize-none font-mono"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder={form.type === "image" ? "https://example.com/banner.jpg" : "Nội dung quảng cáo..."}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}
                  />
                )}
              </div>

              {/* Text type extras */}
              {form.type === "text" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Tiêu đề</label>
                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                      style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Mô tả</label>
                    <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                      style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                  </div>
                </div>
              )}

              {/* Link URL */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>URL liên kết (tùy chọn)</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="https://... hoặc /pricing"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                  style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}
                />
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--admin-text)" }}>Hiển thị quảng cáo</p>
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Bật/tắt quảng cáo này</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
                  className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${form.enabled ? "bg-emerald-500" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.enabled ? "left-5" : "left-0.5"}`}></div>
                </button>
              </div>

              {/* HTML templates */}
              {form.type === "html" && (
                <div>
                  <p className="text-xs mb-2 font-semibold" style={{ color: "var(--admin-text-muted)" }}>Mẫu HTML nhanh:</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      {
                        label: "Banner VIP",
                        html: `<div style="background:linear-gradient(135deg,#1a1600,#0f1117);border:1px solid rgba(232,200,74,0.2);border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px;"><div style="width:40px;height:40px;background:rgba(232,200,74,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:20px;">👑</span></div><div style="flex:1;"><p style="color:#e8c84a;font-weight:700;font-size:13px;margin:0 0 2px;">Nâng cấp VIP</p><p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0;">Học không giới hạn với VIP</p></div><a href="/pricing" style="background:#e8c84a;color:#0f1117;font-weight:700;font-size:11px;padding:8px 16px;border-radius:8px;text-decoration:none;white-space:nowrap;">Xem ngay</a></div>`,
                      },
                      {
                        label: "Banner Google Ads",
                        html: `<!-- Google AdSense -->\n<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"\n  data-ad-slot="XXXXXXXXXX"\n  data-ad-format="auto"\n  data-full-width-responsive="true"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
                      },
                      {
                        label: "Banner khuyến mãi",
                        html: `<div style="background:linear-gradient(135deg,#0a1a0a,#0f1117);border:1px solid rgba(74,222,128,0.2);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;"><span style="font-size:24px;flex-shrink:0;">🎉</span><div style="flex:1;"><p style="color:#4ade80;font-weight:700;font-size:13px;margin:0 0 2px;">Khuyến mãi đặc biệt!</p><p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0;">Giảm 50% gói VIP năm — chỉ hôm nay</p></div><a href="/pricing" style="background:#4ade80;color:#0f1117;font-weight:700;font-size:11px;padding:8px 14px;border-radius:8px;text-decoration:none;white-space:nowrap;">Mua ngay</a></div>`,
                      },
                    ].map(tpl => (
                      <button
                        key={tpl.label}
                        onClick={() => setForm(f => ({ ...f, content: tpl.html }))}
                        className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition-colors"
                        style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--admin-border)" }}>
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer whitespace-nowrap"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!form.content?.trim()}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-save-line mr-2"></i>Lưu quảng cáo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAdsPage() {
  const [adConfigs, setAdConfigs] = useLocalStorage<AdConfig[]>("kts_ad_configs", DEFAULT_ADS);
  const [globalEnabled, setGlobalEnabled] = useLocalStorage<boolean>("kts_ads_global_enabled", true);
  const [melonDraftMode, setMelonDraftMode] = useLocalStorage<boolean>("kts_melon_draft_mode", false);
  const [naverDraftMode, setNaverDraftMode] = useLocalStorage<boolean>("kts_naver_draft_mode", false);
  const [editingAd, setEditingAd] = useState<Partial<AdConfig> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = (ad: AdConfig) => {
    setAdConfigs(prev => {
      const idx = prev.findIndex(a => a.id === ad.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = ad;
        return next;
      }
      return [...prev, ad];
    });
    setEditingAd(null);
  };

  const handleToggle = (id: string) => {
    setAdConfigs(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled, updatedAt: new Date().toISOString() } : a));
  };

  const handleDelete = (id: string) => {
    setAdConfigs(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const adsByPosition = (["top", "between-content", "sidebar", "bottom"] as const).map(pos => ({
    position: pos,
    label: POSITION_LABELS[pos],
    icon: POSITION_ICONS[pos],
    ads: adConfigs.filter(a => a.position === pos),
  }));

  const totalEnabled = adConfigs.filter(a => a.enabled).length;

  return (
    <AdminLayout
      title="Quảng cáo & Chế độ nháp"
      subtitle="Quản lý quảng cáo và chế độ nháp cho tính năng API"
      actions={
        <button
          onClick={() => setEditingAd({})}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-add-line"></i>
          Thêm quảng cáo
        </button>
      }
    >
      {/* Draft mode section */}
      <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-500/12">
            <i className="ri-draft-line text-amber-400 text-sm"></i>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Chế độ nháp — Tính năng API</p>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Bật chế độ nháp khi đang hoàn thiện, tắt khi sẵn sàng cho người dùng</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { key: "melon", icon: "ri-music-2-line", color: "#e8c84a", title: "K-pop Lesson", desc: "Melon Top 100 → AI → Excel", value: melonDraftMode, toggle: () => setMelonDraftMode(!melonDraftMode) },
            { key: "naver", icon: "ri-question-answer-line", color: "#38bdf8", title: "Naver KiN", desc: "Câu hỏi thực tế → AI → Excel", value: naverDraftMode, toggle: () => setNaverDraftMode(!naverDraftMode) },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>{item.title}</p>
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.value ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {item.value ? "NHÁP" : "CÔNG KHAI"}
                </span>
                <button onClick={item.toggle} className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${item.value ? "bg-amber-500" : "bg-emerald-500"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${item.value ? "left-5" : "left-0.5"}`}></div>
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-3" style={{ color: "var(--admin-text-faint)" }}>Khi bật chế độ nháp, trang chủ sẽ hiển thị badge &quot;Chế độ nháp&quot; bên cạnh tên tính năng.</p>
      </div>

      {/* Global toggle */}
      <div className="rounded-2xl border p-5 mb-6 flex items-center justify-between" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${globalEnabled ? "bg-emerald-500/12" : "bg-white/5"}`}>
            <i className={`ri-advertisement-line text-lg ${globalEnabled ? "text-emerald-400" : "text-white/30"}`}></i>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Hệ thống quảng cáo toàn cục</p>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              {globalEnabled ? `Đang hiển thị · ${totalEnabled}/${adConfigs.length} quảng cáo bật` : "Tất cả quảng cáo đang tắt"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold" style={{ color: globalEnabled ? "#4ade80" : "var(--admin-text-muted)" }}>
            {globalEnabled ? "BẬT" : "TẮT"}
          </span>
          <button
            onClick={() => setGlobalEnabled(!globalEnabled)}
            className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${globalEnabled ? "bg-emerald-500" : "bg-white/10"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${globalEnabled ? "left-6" : "left-0.5"}`}></div>
          </button>
        </div>
      </div>

      {/* Ads by position */}
      <div className="space-y-6">
        {adsByPosition.map(group => (
          <div key={group.position} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-500/12">
                  <i className={`${group.icon} text-orange-400 text-sm`}></i>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>{group.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>{group.ads.length} quảng cáo</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAd({ position: group.position })}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
              >
                <i className="ri-add-line"></i>
                Thêm vào đây
              </button>
            </div>

            {group.ads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="ri-advertisement-line text-3xl mb-2" style={{ color: "var(--admin-text-faint)" }}></i>
                <p className="text-sm" style={{ color: "var(--admin-text-faint)" }}>Chưa có quảng cáo nào ở vị trí này</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
                {group.ads.map(ad => (
                  <div key={ad.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Type badge */}
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ backgroundColor: ad.type === "html" ? "rgba(251,146,60,0.12)" : ad.type === "image" ? "rgba(96,165,250,0.12)" : "rgba(167,139,250,0.12)" }}>
                      <i className={`${ad.type === "html" ? "ri-code-line text-orange-400" : ad.type === "image" ? "ri-image-line text-blue-400" : "ri-text text-purple-400"} text-sm`}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--admin-text)" }}>
                          {ad.title || (ad.type === "html" ? "HTML Banner" : ad.type === "image" ? "Image Banner" : "Text Banner")}
                        </p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${ad.enabled && globalEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          {ad.enabled && globalEnabled ? "HIỂN THỊ" : "ẨN"}
                        </span>
                      </div>
                      <p className="text-[10px] truncate" style={{ color: "var(--admin-text-faint)" }}>
                        {ad.type === "html" ? ad.content.slice(0, 80) + "..." : ad.content.slice(0, 60)}
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>
                        Cập nhật: {new Date(ad.updatedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(ad.id)}
                        className={`w-9 h-5 rounded-full transition-all cursor-pointer relative ${ad.enabled ? "bg-emerald-500" : "bg-white/10"}`}
                        title={ad.enabled ? "Tắt" : "Bật"}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${ad.enabled ? "left-4" : "left-0.5"}`}></div>
                      </button>
                      <button
                        onClick={() => setEditingAd(ad)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                        style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}
                        title="Chỉnh sửa"
                      >
                        <i className="ri-edit-line text-xs"></i>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(ad.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                        style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}
                        title="Xóa"
                      >
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Usage guide */}
      <div className="mt-6 rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-information-line text-[#e8c84a]"></i>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Hướng dẫn sử dụng</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{ color: "var(--admin-text-muted)" }}>
          <div className="space-y-2">
            <p><strong style={{ color: "var(--admin-text)" }}>HTML tùy chỉnh:</strong> Dán bất kỳ mã HTML nào — Google AdSense, banner tự thiết kế, iframe...</p>
            <p><strong style={{ color: "var(--admin-text)" }}>Hình ảnh:</strong> Nhập URL ảnh banner, click sẽ mở URL liên kết</p>
            <p><strong style={{ color: "var(--admin-text)" }}>Văn bản:</strong> Banner đơn giản với tiêu đề, mô tả và link</p>
          </div>
          <div className="space-y-2">
            <p><strong style={{ color: "var(--admin-text)" }}>Vị trí:</strong> Đầu trang, giữa nội dung, thanh bên, cuối trang</p>
            <p><strong style={{ color: "var(--admin-text)" }}>Bật/tắt toàn cục:</strong> Tắt tất cả quảng cáo cùng lúc mà không cần xóa</p>
            <p><strong style={{ color: "var(--admin-text)" }}>Google AdSense:</strong> Dán mã &lt;ins class=&quot;adsbygoogle&quot;&gt; vào ô HTML</p>
          </div>
        </div>
      </div>

      {/* Editor modal */}
      {editingAd !== null && (
        <AdEditor
          ad={editingAd}
          onSave={handleSave}
          onCancel={() => setEditingAd(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-sm" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/12 mx-auto mb-4">
              <i className="ri-delete-bin-line text-rose-400 text-xl"></i>
            </div>
            <p className="text-center font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Xóa quảng cáo?</p>
            <p className="text-center text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>Hành động này không thể hoàn tác</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
