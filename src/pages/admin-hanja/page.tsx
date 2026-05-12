import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface HanjaEntry {
  id?: string;
  korean: string;
  hanja?: string;
  vietnamese: string;
  pronunciation?: string;
  difficulty: 1 | 2 | 3;
  category?: string;
  example?: string;
  example_meaning?: string;
  root_char?: string;
  audio_url?: string;
}

const DIFF_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "rgba(74,222,128,0.12)",  text: "#4ade80",  label: "Dễ" },
  2: { bg: "rgba(232,200,74,0.12)",  text: "#e8c84a",  label: "TB" },
  3: { bg: "rgba(248,113,113,0.12)", text: "#f87171",  label: "Khó" },
};

function EntryEditor({ entry, onSave, onCancel }: {
  entry: Partial<HanjaEntry>;
  onSave: (e: HanjaEntry) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<HanjaEntry>>({ difficulty: 2, ...entry });

  const handleSave = () => {
    if (!form.korean?.trim() || !form.vietnamese?.trim()) return;
    onSave({
      korean: form.korean || "",
      hanja: form.hanja || "",
      vietnamese: form.vietnamese || "",
      pronunciation: form.pronunciation || "",
      difficulty: (form.difficulty || 2) as 1|2|3,
      category: form.category || "",
      example: form.example || "",
      example_meaning: form.example_meaning || "",
      root_char: form.root_char || "",
      id: form.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
            {form.id ? "Chỉnh sửa từ" : "Thêm từ mới"}
          </p>
          <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Tiếng Hàn *</label>
              <input value={form.korean || ""} onChange={e => setForm(f => ({ ...f, korean: e.target.value }))}
                placeholder="예: 학교" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Hán tự</label>
              <input value={form.hanja || ""} onChange={e => setForm(f => ({ ...f, hanja: e.target.value }))}
                placeholder="예: 學校" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Nghĩa tiếng Việt *</label>
              <input value={form.vietnamese || ""} onChange={e => setForm(f => ({ ...f, vietnamese: e.target.value }))}
                placeholder="Trường học" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Phát âm</label>
              <input value={form.pronunciation || ""} onChange={e => setForm(f => ({ ...f, pronunciation: e.target.value }))}
                placeholder="hak-gyo" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Độ khó</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: Number(e.target.value) as 1|2|3 }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}>
                <option value={1}>Dễ</option>
                <option value={2}>Trung bình</option>
                <option value={3}>Khó</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Loại từ</label>
              <input value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Danh từ, Động từ..." className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ví dụ</label>
            <input value={form.example || ""} onChange={e => setForm(f => ({ ...f, example: e.target.value }))}
              placeholder="학교에 가요." className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Nghĩa ví dụ</label>
            <input value={form.example_meaning || ""} onChange={e => setForm(f => ({ ...f, example_meaning: e.target.value }))}
              placeholder="Tôi đi học." className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Gốc Hán (root_char)</label>
            <input value={form.root_char || ""} onChange={e => setForm(f => ({ ...f, root_char: e.target.value }))}
              placeholder="學" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
          <button onClick={handleSave} disabled={!form.korean?.trim() || !form.vietnamese?.trim()}
            className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
            Lưu từ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHanjaPage() {
  const [entries, setEntries] = useState<HanjaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState<0 | 1 | 2 | 3>(0);
  const [editingEntry, setEditingEntry] = useState<Partial<HanjaEntry> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HanjaEntry | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async (p = page, q = search, diff = filterDiff) => {
    setLoading(true);
    let query = supabase.from("hanja_vocab_entries").select("*", { count: "exact" });
    if (q.trim()) {
      query = query.or(`korean.ilike.%${q}%,vietnamese.ilike.%${q}%,hanja.ilike.%${q}%`);
    }
    if (diff > 0) query = query.eq("difficulty", diff);
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
    if (!error) {
      setEntries((data || []) as HanjaEntry[]);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [page, search, filterDiff]);

  useEffect(() => { load(0, search, filterDiff); setPage(0); }, [search, filterDiff]);
  useEffect(() => { load(page, search, filterDiff); }, [page]);

  const handleSaveEntry = useCallback(async (entry: HanjaEntry) => {
    const row = {
      korean: entry.korean,
      hanja: entry.hanja || null,
      vietnamese: entry.vietnamese,
      pronunciation: entry.pronunciation || null,
      difficulty: entry.difficulty,
      category: entry.category || null,
      updated_at: new Date().toISOString(),
    };
    if (entry.id) {
      const { error } = await supabase.from("hanja_vocab_entries").update(row).eq("id", entry.id);
      if (error) { showToast("Lỗi: " + error.message, false); return; }
      showToast("Đã cập nhật từ " + entry.korean);
    } else {
      const { error } = await supabase.from("hanja_vocab_entries").insert(row);
      if (error) { showToast("Lỗi: " + error.message, false); return; }
      showToast("Đã thêm từ " + entry.korean);
    }
    setEditingEntry(null);
    load(page, search, filterDiff);
  }, [page, search, filterDiff, load]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget?.id) return;
    const { error } = await supabase.from("hanja_vocab_entries").delete().eq("id", deleteTarget.id);
    if (error) { showToast("Lỗi xóa: " + error.message, false); return; }
    showToast(`Đã xóa "${deleteTarget.korean}"`);
    setDeleteTarget(null);
    load(page, search, filterDiff);
  }, [deleteTarget, page, search, filterDiff, load]);

  const handleGenerateAudio = useCallback(async (entry: HanjaEntry) => {
    if (!entry.id) return;
    setAudioLoading(entry.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-audio", {
        body: { entryId: entry.id, text: entry.korean },
      });
      if (error || data?.error) {
        showToast("Lỗi tạo âm thanh: " + (data?.error || error?.message), false);
        return;
      }
      showToast(`✓ Đã tạo âm thanh cho "${entry.korean}"`);
      // Cập nhật local state ngay không cần reload
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, audio_url: data.url } : e));
    } finally {
      setAudioLoading(null);
    }
  }, []);

  const stats = useMemo(() => ({
    total,
    d1: entries.filter(e => e.difficulty === 1).length,
    d2: entries.filter(e => e.difficulty === 2).length,
    d3: entries.filter(e => e.difficulty === 3).length,
    audio: entries.filter(e => e.audio_url).length,
  }), [entries, total]);

  return (
    <AdminLayout
      title="Quản lý Hán Hàn"
      subtitle="CRUD trực tiếp từ Supabase · Auto âm thanh via OpenAI TTS"
      actions={
        <button onClick={() => setEditingEntry({})}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-add-line"></i>Thêm từ
        </button>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg ${
          toast.ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          <i className={toast.ok ? "ri-checkbox-circle-fill" : "ri-error-warning-line"}></i>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Tổng từ",    value: total,        color: "#e8c84a", icon: "ri-character-recognition-line" },
          { label: "Dễ (1)",     value: stats.d1,     color: "#4ade80", icon: "ri-seedling-line" },
          { label: "Trung (2)",  value: stats.d2,     color: "#e8c84a", icon: "ri-star-line" },
          { label: "Khó (3)",    value: stats.d3,     color: "#f87171", icon: "ri-fire-line" },
          { label: "Có âm thanh",value: stats.audio,  color: "#60a5fa", icon: "ri-volume-up-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <i className={`${s.icon} text-lg mb-2 block`} style={{ color: s.color }}></i>
            <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tiếng Hàn, nghĩa Việt, Hán tự..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--admin-card)" }}>
          {([0, 1, 2, 3] as const).map(d => (
            <button key={d} onClick={() => setFilterDiff(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
              style={{
                backgroundColor: filterDiff === d ? (DIFF_COLORS[d]?.bg || "rgba(232,200,74,0.15)") : "transparent",
                color: filterDiff === d ? (DIFF_COLORS[d]?.text || "#e8c84a") : "var(--admin-text-muted)",
              }}>
              {d === 0 ? "Tất cả" : DIFF_COLORS[d]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
            {loading ? "Đang tải..." : `${total} từ${search || filterDiff > 0 ? " (đang lọc)" : ""}`}
          </p>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--admin-text-muted)" }}>
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p-1))}
              className="px-2 py-1 rounded cursor-pointer disabled:opacity-30">◀</button>
            <span>Trang {page + 1} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
            <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p+1)}
              className="px-2 py-1 rounded cursor-pointer disabled:opacity-30">▶</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <i className="ri-loader-4-line animate-spin text-2xl" style={{ color: "var(--admin-text-faint)" }}></i>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <i className="ri-character-recognition-line text-4xl mb-3" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{search ? "Không tìm thấy kết quả" : "Chưa có từ nào"}</p>
            {!search && (
              <button onClick={() => setEditingEntry({})}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer bg-app-accent-primary text-app-bg font-bold">
                <i className="ri-add-line"></i>Thêm từ đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {entries.map((entry) => {
              const diff = DIFF_COLORS[entry.difficulty] || DIFF_COLORS[2];
              const isGenAudio = audioLoading === entry.id;
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                  <div className="w-28 flex-shrink-0">
                    <p className="text-base font-bold" style={{ color: "var(--admin-text)" }}>{entry.korean}</p>
                    {entry.hanja && <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{entry.hanja}</p>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--admin-text)" }}>{entry.vietnamese}</p>
                    {entry.pronunciation && <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>[{entry.pronunciation}]</p>}
                  </div>
                  <div className="w-16 flex-shrink-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: diff.bg, color: diff.text }}>{diff.label}</span>
                  </div>
                  {/* Audio status + generate button */}
                  <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
                    {entry.audio_url ? (
                      <>
                        <audio src={entry.audio_url} className="hidden" id={`aud-${entry.id}`} />
                        <button onClick={() => (document.getElementById(`aud-${entry.id}`) as HTMLAudioElement)?.play()}
                          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                          style={{ backgroundColor: "rgba(96,165,250,0.15)", color: "#60a5fa" }}
                          title="Nghe thử">
                          <i className="ri-play-fill text-xs"></i>
                        </button>
                        <button onClick={() => handleGenerateAudio(entry)} disabled={isGenAudio}
                          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                          style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa" }}
                          title="Tạo lại">
                          <i className={`text-xs ${isGenAudio ? "ri-loader-4-line animate-spin" : "ri-refresh-line"}`}></i>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleGenerateAudio(entry)} disabled={isGenAudio}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all"
                        style={{ backgroundColor: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}
                        title="Tự động tạo âm thanh qua OpenAI TTS">
                        <i className={`${isGenAudio ? "ri-loader-4-line animate-spin" : "ri-volume-up-line"}`}></i>
                        {isGenAudio ? "Đang tạo..." : "Tạo audio"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setEditingEntry(entry)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                    <button onClick={() => setDeleteTarget(entry)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingEntry !== null && (
        <EntryEditor entry={editingEntry} onSave={handleSaveEntry} onCancel={() => setEditingEntry(null)} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-sm" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/12 mx-auto mb-4">
              <i className="ri-delete-bin-line text-rose-400 text-xl"></i>
            </div>
            <p className="text-center font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>
              Xóa từ &quot;{deleteTarget.korean}&quot;?
            </p>
            <p className="text-center text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>Hành động này không thể hoàn tác</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
