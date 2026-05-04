import type { EbookMeta } from "@/pages/ebook/page";

interface Props {
  meta: EbookMeta;
  onChange: (meta: EbookMeta) => void;
}

const FONT_OPTIONS: { label: string; value: "sans" | "serif"; desc: string; preview: string }[] = [
  { label: "Noto Sans KR", value: "sans", desc: "Hi?n d?i, d? d?c", preview: "????? — Xin chào" },
  { label: "Noto Serif KR", value: "serif", desc: "C? di?n, sang tr?ng", preview: "????? — Xin chào" },
];

const ACCENT_COLORS = [
  { label: "Vàng KTS", value: "app-accent-primary" },
  { label: "Xanh lá", value: "#34d399" },
  { label: "Cam", value: "#fb923c" },
  { label: "H?ng", value: "#f472b6" },
  { label: "Tr?ng", value: "#f8fafc" },
];

const COVER_COLORS = [
  { label: "Ðen d?m", value: "#0f1117" },
  { label: "Xanh dêm", value: "#0d1b2a" },
  { label: "Nâu t?i", value: "#1a1208" },
  { label: "Tím dêm", value: "#13111c" },
];

export default function EbookCoverEditor({ meta, onChange }: Props) {
  const update = (key: keyof EbookMeta, value: string) => {
    onChange({ ...meta, [key]: value });
  };

  const updateFont = (value: "sans" | "serif") => {
    onChange({ ...meta, fontFamily: value });
  };

  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
          <i className="ri-book-2-line text-app-accent-primary text-sm"></i>
        </div>
        <p className="text-white font-semibold text-sm">Thông tin bìa ebook</p>
      </div>

      {/* Title */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tiêu d? chính</label>
        <input
          type="text"
          value={meta.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="H?c Ti?ng Hàn Qua K-pop"
          maxLength={80}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tiêu d? ph?</label>
        <input
          type="text"
          value={meta.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
          placeholder="Truy?n Chêm & T? V?ng Th?c T?"
          maxLength={100}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
        />
      </div>

      {/* Author */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tác gi? / Thuong hi?u</label>
        <input
          type="text"
          value={meta.author}
          onChange={(e) => update("author", e.target.value)}
          placeholder="Hàn Vi?t KTS"
          maxLength={60}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Mô t? ng?n (xu?t hi?n ? trang bìa)</label>
        <textarea
          value={meta.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Tuy?n t?p bài h?c ti?ng Hàn..."
          rows={3}
          maxLength={300}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors resize-none"
        />
        <p className="text-app-text-muted text-[10px] mt-1">{meta.description.length}/300</p>
      </div>

      {/* Divider */}
      <div className="border-t border-app-border pt-1">
        <p className="text-app-text-muted text-[10px] tracking-normal mb-4 flex items-center gap-1.5">
          <i className="ri-pages-line"></i>
          Trang b? sung
        </p>
      </div>

      {/* Foreword */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">
          <i className="ri-quill-pen-line mr-1 text-violet-400/60"></i>
          L?i m? d?u (trang 3)
        </label>
        <textarea
          value={meta.foreword ?? ""}
          onChange={(e) => update("foreword", e.target.value)}
          placeholder="Chào b?n d?c thân m?n! Vi?t l?i m? d?u cho ebook c?a b?n..."
          rows={5}
          maxLength={800}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/30 transition-colors resize-none"
        />
        <p className="text-app-text-muted text-[10px] mt-1">{(meta.foreword ?? "").length}/800 — Ð? tr?ng n?u không c?n trang l?i m? d?u</p>
      </div>

      {/* Contact info */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">
          <i className="ri-contacts-line mr-1 text-app-accent-success/60"></i>
          Thông tin liên h? (trang k?t)
        </label>
        <textarea
          value={meta.contactInfo ?? ""}
          onChange={(e) => update("contactInfo", e.target.value)}
          placeholder="Email: contact@example.com&#10;Facebook: fb.com/yourpage&#10;Zalo: 0901 234 567"
          rows={3}
          maxLength={400}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/30 transition-colors resize-none"
        />
      </div>

      {/* Website */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-1.5">
          <i className="ri-global-line mr-1 text-app-accent-success/60"></i>
          Website (trang k?t)
        </label>
        <input
          type="text"
          value={meta.website ?? ""}
          onChange={(e) => update("website", e.target.value)}
          placeholder="www.hanvietkts.com"
          maxLength={100}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/30 transition-colors"
        />
      </div>

      {/* Font selector */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-2">
          <i className="ri-font-size mr-1 text-sky-400/60"></i>
          Font ch? ebook
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => updateFont(f.value)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                (meta.fontFamily ?? "sans") === f.value
                  ? "border-app-accent-primary/60 bg-app-accent-primary/5"
                  : "border-app-border bg-app-surface/50 hover:border-white/20"
              }`}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: (meta.fontFamily ?? "sans") === f.value ? "app-accent-primary" : "rgba(255,255,255,0.6)",
                  fontFamily: f.value === "serif" ? "'Noto Serif KR', serif" : "'Noto Sans KR', sans-serif",
                }}
              >
                {f.label}
              </span>
              <span className="text-app-text-muted text-[9px]">{f.desc}</span>
              <span
                className="text-white/50 text-[10px] mt-0.5"
                style={{ fontFamily: f.value === "serif" ? "'Noto Serif KR', serif" : "'Noto Sans KR', sans-serif" }}
              >
                {f.preview}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cover background color */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-2">Màu n?n bìa</label>
        <div className="flex gap-2 flex-wrap">
          {COVER_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => update("coverColor", c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                meta.coverColor === c.value ? "border-white/60 scale-110" : "border-app-border hover:border-white/30"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="text-app-text-secondary text-xs font-medium block mb-2">Màu nh?n</label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => update("coverAccent", c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                meta.coverAccent === c.value ? "border-white/60 scale-110" : "border-app-border hover:border-white/30"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 bg-app-surface/50 rounded-lg px-3 py-2.5">
        <div className="w-4 h-4 flex items-center justify-center mt-0.5">
          <i className="ri-lightbulb-line text-app-text-muted text-sm"></i>
        </div>
        <p className="text-app-text-muted text-xs leading-relaxed">
          Thay d?i s? hi?n th? ngay trong preview bên ph?i. Khi xu?t PDF, bìa s? là trang d?u tiên.
        </p>
      </div>
    </div>
  );
}
