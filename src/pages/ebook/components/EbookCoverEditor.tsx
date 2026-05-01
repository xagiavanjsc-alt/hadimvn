import type { EbookMeta } from "@/pages/ebook/page";

interface Props {
  meta: EbookMeta;
  onChange: (meta: EbookMeta) => void;
}

const FONT_OPTIONS: { label: string; value: "sans" | "serif"; desc: string; preview: string }[] = [
  { label: "Noto Sans KR", value: "sans", desc: "Hiện đại, dễ đọc", preview: "안녕하세요 — Xin chào" },
  { label: "Noto Serif KR", value: "serif", desc: "Cổ điển, sang trọng", preview: "안녕하세요 — Xin chào" },
];

const ACCENT_COLORS = [
  { label: "Vàng KTS", value: "#e8c84a" },
  { label: "Xanh lá", value: "#34d399" },
  { label: "Cam", value: "#fb923c" },
  { label: "Hồng", value: "#f472b6" },
  { label: "Trắng", value: "#f8fafc" },
];

const COVER_COLORS = [
  { label: "Đen đậm", value: "#0f1117" },
  { label: "Xanh đêm", value: "#0d1b2a" },
  { label: "Nâu tối", value: "#1a1208" },
  { label: "Tím đêm", value: "#13111c" },
];

export default function EbookCoverEditor({ meta, onChange }: Props) {
  const update = (key: keyof EbookMeta, value: string) => {
    onChange({ ...meta, [key]: value });
  };

  const updateFont = (value: "sans" | "serif") => {
    onChange({ ...meta, fontFamily: value });
  };

  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg">
          <i className="ri-book-2-line text-[#e8c84a] text-sm"></i>
        </div>
        <p className="text-white font-semibold text-sm">Thông tin bìa ebook</p>
      </div>

      {/* Title */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">Tiêu đề chính</label>
        <input
          type="text"
          value={meta.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Học Tiếng Hàn Qua K-pop"
          maxLength={80}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">Tiêu đề phụ</label>
        <input
          type="text"
          value={meta.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
          placeholder="Truyện Chêm & Từ Vựng Thực Tế"
          maxLength={100}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
        />
      </div>

      {/* Author */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">Tác giả / Thương hiệu</label>
        <input
          type="text"
          value={meta.author}
          onChange={(e) => update("author", e.target.value)}
          placeholder="Hàn Việt KTS"
          maxLength={60}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">Mô tả ngắn (xuất hiện ở trang bìa)</label>
        <textarea
          value={meta.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Tuyển tập bài học tiếng Hàn..."
          rows={3}
          maxLength={300}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40 transition-colors resize-none"
        />
        <p className="text-white/20 text-[10px] mt-1">{meta.description.length}/300</p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 pt-1">
        <p className="text-white/25 text-[10px] tracking-normal mb-4 flex items-center gap-1.5">
          <i className="ri-pages-line"></i>
          Trang bổ sung
        </p>
      </div>

      {/* Foreword */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">
          <i className="ri-quill-pen-line mr-1 text-violet-400/60"></i>
          Lời mở đầu (trang 3)
        </label>
        <textarea
          value={meta.foreword ?? ""}
          onChange={(e) => update("foreword", e.target.value)}
          placeholder="Chào bạn đọc thân mến! Viết lời mở đầu cho ebook của bạn..."
          rows={5}
          maxLength={800}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/30 transition-colors resize-none"
        />
        <p className="text-white/20 text-[10px] mt-1">{(meta.foreword ?? "").length}/800 — Để trống nếu không cần trang lời mở đầu</p>
      </div>

      {/* Contact info */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">
          <i className="ri-contacts-line mr-1 text-emerald-400/60"></i>
          Thông tin liên hệ (trang kết)
        </label>
        <textarea
          value={meta.contactInfo ?? ""}
          onChange={(e) => update("contactInfo", e.target.value)}
          placeholder="Email: contact@example.com&#10;Facebook: fb.com/yourpage&#10;Zalo: 0901 234 567"
          rows={3}
          maxLength={400}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/30 transition-colors resize-none"
        />
      </div>

      {/* Website */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-1.5">
          <i className="ri-global-line mr-1 text-emerald-400/60"></i>
          Website (trang kết)
        </label>
        <input
          type="text"
          value={meta.website ?? ""}
          onChange={(e) => update("website", e.target.value)}
          placeholder="www.hanvietkts.com"
          maxLength={100}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/30 transition-colors"
        />
      </div>

      {/* Font selector */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-2">
          <i className="ri-font-size mr-1 text-sky-400/60"></i>
          Font chữ ebook
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => updateFont(f.value)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                (meta.fontFamily ?? "sans") === f.value
                  ? "border-[#e8c84a]/60 bg-[#e8c84a]/5"
                  : "border-white/8 bg-white/3 hover:border-white/20"
              }`}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: (meta.fontFamily ?? "sans") === f.value ? "#e8c84a" : "rgba(255,255,255,0.6)",
                  fontFamily: f.value === "serif" ? "'Noto Serif KR', serif" : "'Noto Sans KR', sans-serif",
                }}
              >
                {f.label}
              </span>
              <span className="text-white/25 text-[9px]">{f.desc}</span>
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
        <label className="text-white/40 text-xs font-medium block mb-2">Màu nền bìa</label>
        <div className="flex gap-2 flex-wrap">
          {COVER_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => update("coverColor", c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                meta.coverColor === c.value ? "border-white/60 scale-110" : "border-white/10 hover:border-white/30"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="text-white/40 text-xs font-medium block mb-2">Màu nhấn</label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => update("coverAccent", c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                meta.coverAccent === c.value ? "border-white/60 scale-110" : "border-white/10 hover:border-white/30"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 bg-white/3 rounded-lg px-3 py-2.5">
        <div className="w-4 h-4 flex items-center justify-center mt-0.5">
          <i className="ri-lightbulb-line text-white/25 text-sm"></i>
        </div>
        <p className="text-white/25 text-xs leading-relaxed">
          Thay đổi sẽ hiển thị ngay trong preview bên phải. Khi xuất PDF, bìa sẽ là trang đầu tiên.
        </p>
      </div>
    </div>
  );
}
