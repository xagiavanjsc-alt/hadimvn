export type EbookTemplate = "classic" | "two-col" | "dark" | "album" | "gradient" | "magazine" | "minimal";

export interface TemplateConfig {
  id: EbookTemplate;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  preview: {
    bg: string;
    text: string;
    accent: string;
    secondary: string;
    gradient?: string;
  };
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    name: "Classic",
    description: "1 cột, nền trắng, chữ đen — dễ đọc nhất",
    icon: "ri-file-text-line",
    preview: { bg: "#ffffff", text: "#1a1a1a", accent: "#e8c84a", secondary: "#f5f5f5" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Tối giản, nhiều khoảng trắng — sang trọng",
    icon: "ri-subtract-line",
    badge: "Mới",
    preview: { bg: "#fafaf9", text: "#1a1a1a", accent: "#1a1a1a", secondary: "#f0ede8" },
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Header gradient màu sắc — nổi bật, hiện đại",
    icon: "ri-contrast-2-line",
    badge: "Mới",
    preview: { bg: "#ffffff", text: "#1a1a1a", accent: "#7c3aed", secondary: "#f5f3ff", gradient: "linear-gradient(135deg,#7c3aed,#db2777)" },
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Layout tạp chí — tiêu đề lớn, ảnh nền header",
    icon: "ri-newspaper-line",
    badge: "Mới",
    preview: { bg: "#ffffff", text: "#1a1a1a", accent: "#dc2626", secondary: "#fef2f2" },
  },
  {
    id: "two-col",
    name: "2 Cột",
    description: "Truyện chêm + từ vựng song song — tiết kiệm trang",
    icon: "ri-layout-column-line",
    preview: { bg: "#fafafa", text: "#1a1a1a", accent: "#059669", secondary: "#ecfdf5" },
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Nền tối, chữ sáng — phong cách hiện đại",
    icon: "ri-moon-line",
    preview: { bg: "#0f1117", text: "#e8e8e8", accent: "#e8c84a", secondary: "#1a1d27" },
  },
  {
    id: "album",
    name: "Album Art",
    description: "Có ảnh album art, layout magazine — đẹp nhất",
    icon: "ri-image-2-line",
    preview: { bg: "#ffffff", text: "#1a1a1a", accent: "#dc2626", secondary: "#fef2f2" },
  },
];

interface Props {
  selected: EbookTemplate;
  onChange: (t: EbookTemplate) => void;
}

function MiniPreview({ tpl }: { tpl: TemplateConfig }) {
  const { bg, text, accent, secondary, gradient } = tpl.preview;

  if (tpl.id === "classic") return (
    <div className="flex-1 p-2 space-y-1">
      <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: accent, opacity: 0.8 }}></div>
      <div className="h-1 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.12 }}></div>
      <div className="h-1 rounded-full w-5/6" style={{ backgroundColor: text, opacity: 0.08 }}></div>
      <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: text, opacity: 0.08 }}></div>
      <div className="mt-1.5 flex gap-1">
        <div className="h-4 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
        <div className="h-4 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
      </div>
    </div>
  );

  if (tpl.id === "minimal") return (
    <div className="flex-1 p-3 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: accent }}></div>
        <div className="h-2.5 rounded w-2/3" style={{ backgroundColor: text, opacity: 0.8 }}></div>
        <div className="h-1 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.08 }}></div>
        <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: text, opacity: 0.06 }}></div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: secondary }}></div>
        <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: secondary }}></div>
        <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: secondary }}></div>
      </div>
    </div>
  );

  if (tpl.id === "gradient") return (
    <div className="flex-1 flex flex-col">
      <div className="h-7 rounded-t-lg" style={{ background: gradient }}></div>
      <div className="flex-1 p-2 space-y-1">
        <div className="h-1 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.1 }}></div>
        <div className="h-1 rounded-full w-5/6" style={{ backgroundColor: text, opacity: 0.08 }}></div>
        <div className="flex gap-1 mt-1">
          <div className="h-3 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
          <div className="h-3 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
        </div>
      </div>
    </div>
  );

  if (tpl.id === "magazine") return (
    <div className="flex-1 flex flex-col">
      <div className="h-8 relative overflow-hidden rounded-t-lg" style={{ backgroundColor: "#1a1a1a" }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "linear-gradient(135deg,#dc2626,#991b1b)" }}></div>
        <div className="absolute bottom-1 left-2">
          <div className="h-1.5 w-12 rounded-full bg-white opacity-80"></div>
        </div>
        <div className="absolute top-1 right-1.5">
          <div className="h-1 w-6 rounded-full" style={{ backgroundColor: accent }}></div>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-1">
        <div className="h-1 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.1 }}></div>
        <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: text, opacity: 0.08 }}></div>
        <div className="flex gap-1 mt-1">
          <div className="h-3 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
          <div className="h-3 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
        </div>
      </div>
    </div>
  );

  if (tpl.id === "two-col") return (
    <div className="flex-1 p-2 flex gap-1.5">
      <div className="flex-1 space-y-1">
        <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.2 }}></div>
        <div className="h-1 rounded-full w-5/6" style={{ backgroundColor: text, opacity: 0.1 }}></div>
        <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: text, opacity: 0.1 }}></div>
        <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: text, opacity: 0.08 }}></div>
      </div>
      <div className="w-px" style={{ backgroundColor: accent, opacity: 0.4 }}></div>
      <div className="flex-1 space-y-1">
        <div className="h-3 rounded" style={{ backgroundColor: secondary }}></div>
        <div className="h-3 rounded" style={{ backgroundColor: secondary }}></div>
        <div className="h-3 rounded" style={{ backgroundColor: secondary }}></div>
      </div>
    </div>
  );

  if (tpl.id === "dark") return (
    <div className="flex-1 p-2 space-y-1">
      <div className="h-2 rounded-full w-2/3" style={{ backgroundColor: accent, opacity: 0.9 }}></div>
      <div className="h-1 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.2 }}></div>
      <div className="h-1 rounded-full w-5/6" style={{ backgroundColor: text, opacity: 0.15 }}></div>
      <div className="mt-1.5 flex gap-1">
        <div className="h-4 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
        <div className="h-4 flex-1 rounded" style={{ backgroundColor: secondary }}></div>
      </div>
    </div>
  );

  if (tpl.id === "album") return (
    <div className="flex-1 flex">
      <div className="w-12 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: accent, opacity: 0.15 }}>
        <i className="ri-music-2-line text-[8px]" style={{ color: accent }}></i>
      </div>
      <div className="flex-1 p-2 space-y-1">
        <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: accent, opacity: 0.8 }}></div>
        <div className="h-1 rounded-full w-full" style={{ backgroundColor: text, opacity: 0.15 }}></div>
        <div className="h-1 rounded-full w-5/6" style={{ backgroundColor: text, opacity: 0.1 }}></div>
      </div>
    </div>
  );

  return null;
}

export default function EbookTemplates({ selected, onChange }: Props) {
  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
          <i className="ri-layout-2-line text-app-accent-primary text-base"></i>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Template layout</h3>
          <p className="text-app-text-secondary text-xs">7 mẫu — chọn kiểu trình bày trước khi xuất PDF</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onChange(tpl.id)}
            className={`relative flex flex-col gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
              selected === tpl.id
                ? "border-app-accent-primary/40 bg-app-accent-primary/5"
                : "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50"
            }`}
          >
            {selected === tpl.id && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center bg-app-accent-primary rounded-full">
                <i className="ri-check-line text-app-bg text-[10px]"></i>
              </div>
            )}
            {tpl.badge && selected !== tpl.id && (
              <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-emerald-500/20 text-app-accent-success text-[8px] font-bold rounded-full">
                {tpl.badge}
              </div>
            )}

            {/* Mini preview */}
            <div
              className="w-full h-16 rounded-lg overflow-hidden flex flex-col"
              style={{ backgroundColor: tpl.preview.bg }}
            >
              <MiniPreview tpl={tpl} />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <i className={`${tpl.icon} text-[11px] ${selected === tpl.id ? "text-app-accent-primary" : "text-app-text-secondary"}`}></i>
                <p className={`text-xs font-semibold ${selected === tpl.id ? "text-app-accent-primary" : "text-white/70"}`}>{tpl.name}</p>
              </div>
              <p className="text-app-text-muted text-[10px] leading-relaxed">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 bg-app-surface/50 rounded-lg px-3 py-2.5">
        <i className="ri-palette-line text-app-text-muted text-sm mt-0.5 flex-shrink-0"></i>
        <p className="text-app-text-muted text-[10px] leading-relaxed">
          Màu nhấn trong tab <strong className="text-app-text-secondary">Bìa ebook</strong> sẽ áp dụng cho tất cả template. Thử kết hợp template + màu nhấn để tạo phong cách riêng.
        </p>
      </div>
    </div>
  );
}
