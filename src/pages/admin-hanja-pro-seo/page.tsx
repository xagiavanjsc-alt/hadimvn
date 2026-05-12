import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface HanjaProEntry {
  id: number;
  hangul: string;
  hanja: string;
  slug: string;
  meaning_vn: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
}

const SITE_URL = "https://hanquocoi.vn";
const PAGE_SIZE = 30;
const TITLE_MAX = 60;
const DESC_MAX = 140;

function autoTitle(e: HanjaProEntry): string {
  const base = `${e.hangul} (${e.hanja}) — ${e.meaning_vn || "Hán Hàn"} | Hàn Quốc Ơi!`;
  return base.slice(0, TITLE_MAX);
}
function autoDesc(e: HanjaProEntry): string {
  const base = `Học từ Hán Hàn ${e.hangul} (${e.hanja})${e.meaning_vn ? ` — ${e.meaning_vn}` : ""}. Phân tích gốc Hán, ví dụ thực chiến và mẹo nhớ.`;
  return base.slice(0, DESC_MAX);
}

// ─── SEO Edit Modal ───────────────────────────────────────────────────────────
function SEOModal({
  entry,
  onSave,
  onClose,
}: {
  entry: HanjaProEntry;
  onSave: (updated: Partial<HanjaProEntry>) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(entry.seo_title || "");
  const [desc, setDesc] = useState(entry.seo_description || "");
  const [img, setImg] = useState(entry.og_image || "");
  const [saving, setSaving] = useState(false);

  const previewTitle = title || autoTitle(entry);
  const previewDesc = desc || autoDesc(entry);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      seo_title: title.trim() || null,
      seo_description: desc.trim() || null,
      og_image: img.trim() || null,
    });
    setSaving(false);
  };

  const handleReset = () => {
    setTitle("");
    setDesc("");
    setImg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d27] border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <div>
            <h2 className="text-base font-bold text-white/90">Tối ưu SEO</h2>
            <p className="text-xs text-app-text-secondary mt-0.5">
              <span className="text-rose-400 font-bold">{entry.hangul}</span>
              <span className="text-white/40 mx-1">·</span>
              <span className="text-white/50">{entry.hanja}</span>
              <span className="text-white/40 mx-1">·</span>
              <span className="text-white/40">/hanja-pro/{entry.slug}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/12 text-app-text-secondary cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-app-text-secondary mb-1.5 flex items-center justify-between">
              <span>Tiêu đề SEO (title)</span>
              <span className={`text-[10px] font-semibold ${previewTitle.length > TITLE_MAX ? "text-rose-400" : previewTitle.length > 50 ? "text-amber-400" : "text-app-text-muted"}`}>
                {previewTitle.length}/{TITLE_MAX} ký tự
              </span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder={autoTitle(entry)}
              maxLength={TITLE_MAX}
              className={`w-full px-3 py-2.5 bg-app-card/50 border rounded-xl text-sm text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-rose-500/40 ${
                previewTitle.length > TITLE_MAX ? "border-rose-500/60" : "border-app-border"
              }`}
            />
            <p className="text-[10px] text-app-text-muted mt-1">Để trống → tự sinh: <span className="text-white/40">{autoTitle(entry)}</span></p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-app-text-secondary mb-1.5 flex items-center justify-between">
              <span>Mô tả SEO (description)</span>
              <span className={`text-[10px] font-semibold ${previewDesc.length > DESC_MAX ? "text-rose-400" : previewDesc.length > 120 ? "text-amber-400" : "text-app-text-muted"}`}>
                {previewDesc.length}/{DESC_MAX} ký tự
              </span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value.slice(0, DESC_MAX))}
              placeholder={autoDesc(entry)}
              rows={3}
              maxLength={DESC_MAX}
              className={`w-full px-3 py-2.5 bg-app-card/50 border rounded-xl text-sm text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-rose-500/40 resize-none ${
                previewDesc.length > DESC_MAX ? "border-rose-500/60" : "border-app-border"
              }`}
            />
            <p className="text-[10px] text-app-text-muted mt-1">Để trống → tự sinh (tối đa {DESC_MAX} ký tự)</p>
          </div>

          {/* OG Image */}
          <div>
            <label className="text-xs font-semibold text-app-text-secondary mb-1.5 block">Ảnh OG (og:image)</label>
            <input
              value={img}
              onChange={e => setImg(e.target.value)}
              placeholder="https://... (để trống dùng ảnh mặc định site)"
              className="w-full px-3 py-2.5 bg-app-card/50 border border-app-border rounded-xl text-sm text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
            />
          </div>

          {/* Google Preview */}
          <div>
            <p className="text-xs font-semibold text-app-text-secondary mb-2">Xem trước Google:</p>
            <div className="bg-white rounded-xl p-4">
              <p className="text-[10px] text-green-700 mb-0.5">{SITE_URL}/hanja-pro/{entry.slug}</p>
              <p className="text-base text-blue-700 font-medium leading-tight mb-1 line-clamp-1">{previewTitle.slice(0, TITLE_MAX)}{previewTitle.length > TITLE_MAX ? "..." : ""}</p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{previewDesc.slice(0, DESC_MAX)}{previewDesc.length > DESC_MAX ? "..." : ""}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/8 hover:bg-white/12 text-white/50 cursor-pointer transition-all"
            >
              <i className="ri-refresh-line mr-1.5"></i>Reset về tự động
            </button>
            <div className="flex-1"></div>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium bg-white/8 hover:bg-white/12 text-white/50 cursor-pointer transition-all">
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? <i className="ri-loader-4-line animate-spin mr-1.5"></i> : <i className="ri-save-line mr-1.5"></i>}
              Lưu SEO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminHanjaProSEOPage() {
  const [entries, setEntries] = useState<HanjaProEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSEO, setFilterSEO] = useState<"all" | "custom" | "auto">("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<HanjaProEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const all: HanjaProEntry[] = [];
    const batchSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("hanja_pro")
        .select("id,hangul,hanja,slug,meaning_vn,seo_title,seo_description,og_image")
        .order("id", { ascending: true })
        .range(from, from + batchSize - 1);
      if (error || !data || data.length === 0) break;
      all.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }
    setEntries(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterSEO === "custom") list = list.filter(e => e.seo_title || e.seo_description);
    if (filterSEO === "auto") list = list.filter(e => !e.seo_title && !e.seo_description);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.hangul.includes(q) || e.hanja.includes(q) ||
        (e.meaning_vn?.toLowerCase().includes(q) ?? false) ||
        e.slug.includes(q)
      );
    }
    return list;
  }, [entries, filterSEO, search]);

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const customCount = entries.filter(e => e.seo_title || e.seo_description).length;

  const handleSave = async (entry: HanjaProEntry, updated: Partial<HanjaProEntry>) => {
    const { error } = await supabase
      .from("hanja_pro")
      .update(updated)
      .eq("id", entry.id);

    if (error) {
      showToast("Lỗi lưu SEO: " + error.message);
      return;
    }

    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...updated } : e));
    setEditing(null);
    showToast(`Đã lưu SEO cho ${entry.hangul}`);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
              <i className="ri-search-eye-line text-rose-400"></i>
              SEO Hán Hàn Pro
            </h1>
            <p className="text-sm text-app-text-secondary mt-1">
              Tối ưu title, description, og:image cho từng từ trong /hanja-pro
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white/90">{customCount}<span className="text-sm font-normal text-app-text-muted">/{entries.length}</span></p>
            <p className="text-xs text-app-text-secondary">từ đã tối ưu SEO</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-app-card/50 border border-app-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-app-text-secondary">Tiến độ tối ưu SEO</span>
            <span className="text-xs font-bold text-rose-400">{entries.length > 0 ? Math.round((customCount / entries.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${entries.length > 0 ? (customCount / entries.length) * 100 : 0}%` }} />
          </div>
          <p className="text-[10px] text-app-text-muted mt-2">
            {entries.length - customCount} từ chưa tối ưu (đang dùng SEO tự động)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm từ, hán tự, nghĩa..."
              className="w-full pl-9 pr-3 py-2 bg-app-card/50 border border-app-border rounded-xl text-sm text-white/70 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "custom", "auto"] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilterSEO(f); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${filterSEO === f ? "bg-rose-500 text-white" : "bg-white/8 border border-app-border text-white/50 hover:bg-white/12"}`}
              >
                {f === "all" ? `Tất cả (${entries.length})` : f === "custom" ? `Đã tối ưu (${customCount})` : `Tự động (${entries.length - customCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-app-text-muted">
            <i className="ri-loader-4-line animate-spin text-2xl mr-2"></i>
            <span>Đang tải {entries.length} từ...</span>
          </div>
        ) : (
          <>
            <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[50px_120px_80px_1fr_1fr_100px] bg-app-card/70 px-4 py-2.5 text-[10px] font-semibold text-app-text-secondary border-b border-app-border">
                <span>#</span>
                <span>Từ Hàn</span>
                <span>Hán tự</span>
                <span>Title SEO</span>
                <span>Description SEO</span>
                <span>Trạng thái</span>
              </div>

              <div className="divide-y divide-white/5">
                {paginated.map(entry => {
                  const hasCustom = !!(entry.seo_title || entry.seo_description);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setEditing(entry)}
                      className="grid grid-cols-[50px_120px_80px_1fr_1fr_100px] px-4 py-3 hover:bg-app-card/50 transition-colors cursor-pointer items-center group"
                    >
                      <span className="text-xs text-app-text-muted">{entry.id}</span>
                      <div>
                        <p className="text-sm font-bold text-white/90">{entry.hangul}</p>
                        <p className="text-[10px] text-app-text-muted">{entry.meaning_vn || "—"}</p>
                      </div>
                      <span className="text-sm font-bold text-rose-400">{entry.hanja}</span>
                      <div className="pr-3">
                        {entry.seo_title
                          ? <p className="text-xs text-app-text-primary truncate">{entry.seo_title}</p>
                          : <p className="text-xs text-app-text-muted italic truncate">{autoTitle(entry)}</p>
                        }
                      </div>
                      <div className="pr-3">
                        {entry.seo_description
                          ? <p className="text-xs text-app-text-primary truncate">{entry.seo_description}</p>
                          : <p className="text-xs text-app-text-muted italic truncate">{autoDesc(entry)}</p>
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${hasCustom ? "bg-emerald-500/15 border-emerald-500/30 text-app-accent-success" : "bg-white/8 border-app-border text-app-text-muted"}`}>
                          {hasCustom ? "Tùy chỉnh" : "Tự động"}
                        </span>
                        <i className="ri-edit-line text-app-text-muted group-hover:text-rose-400 transition-colors text-sm"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-app-text-muted">
                  {filtered.length} từ · Trang {page}/{totalPages}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/8 border border-app-border text-white/50 hover:bg-white/12 disabled:opacity-30 cursor-pointer">
                    <i className="ri-skip-back-line"></i>
                  </button>
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/8 border border-app-border text-white/50 hover:bg-white/12 disabled:opacity-30 cursor-pointer">
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${page === p ? "bg-rose-500 text-white font-bold" : "bg-white/8 border border-app-border text-white/50 hover:bg-white/12"}`}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/8 border border-app-border text-white/50 hover:bg-white/12 disabled:opacity-30 cursor-pointer">
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/8 border border-app-border text-white/50 hover:bg-white/12 disabled:opacity-30 cursor-pointer">
                    <i className="ri-skip-forward-line"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <SEOModal
          entry={editing}
          onSave={(updated) => handleSave(editing, updated)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <i className="ri-checkbox-circle-fill"></i>
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
