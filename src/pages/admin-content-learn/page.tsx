import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

// --- Types --------------------------------------------------------------------
interface TopikVocab {
  id: string; korean: string; reading: string; vietnamese: string;
  example: string; example_vi: string; category: string;
  topik_level: string; part_of_speech: string; created_at: string;
}

interface SeoulVocab {
  id: number; lesson_id: string; book_id: string; korean: string;
  pronunciation: string; vietnamese: string; part_of_speech: string;
  example: string; example_vi: string; hanja: string; hanja_meaning: string;
}

interface HanjaEntry {
  id: string; korean: string; hanja: string; vietnamese: string;
  pronunciation: string; category: string; difficulty: number; memory_tip: string;
}

interface GrammarEntry {
  id: number; lesson_id: string; book_id: string; pattern: string;
  level: string; explanation: string; notes: string;
}

type Tab = "topik" | "seoul" | "hanja" | "grammar";

// --- Shared helpers -----------------------------------------------------------
const inputCls = "w-full rounded-xl px-3 py-2 text-sm outline-none border";
const inputStyle = { backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" };
const PAGE_SIZE = 50;

// --- Toast --------------------------------------------------------------------
function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white ${type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}>
      <i className={`${type === "ok" ? "ri-checkbox-circle-line" : "ri-error-warning-line"} mr-2`}></i>{msg}
    </div>
  );
}

// --- TOPIK Vocab Tab ----------------------------------------------------------
function TopikVocabTab() {
  const [vocab, setVocab] = useState<TopikVocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [editEntry, setEditEntry] = useState<TopikVocab | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [page, setPage] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ korean: "", reading: "", vietnamese: "", example: "", example_vi: "", category: "", topik_level: "I", part_of_speech: "Danh t?" });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVocab = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("topik_vocabulary").select("*").order("created_at", { ascending: false });
      if (levelFilter !== "all") query = query.eq("topik_level", levelFilter);
      if (search.trim()) query = query.or(`korean.ilike.%${search}%,vietnamese.ilike.%${search}%`);
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      const { data, error } = await query;
      if (error) throw error;
      setVocab(data ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [levelFilter, search, page]);

  useEffect(() => { fetchVocab(); }, [fetchVocab]);

  const handleSaveEdit = async () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("topik_vocabulary").update({
        korean: editEntry.korean, reading: editEntry.reading, vietnamese: editEntry.vietnamese,
        example: editEntry.example, example_vi: editEntry.example_vi,
        category: editEntry.category, topik_level: editEntry.topik_level, part_of_speech: editEntry.part_of_speech,
      }).eq("id", editEntry.id);
      if (error) throw error;
      setVocab(prev => prev.map(v => v.id === editEntry.id ? editEntry : v));
      setEditEntry(null);
      showToast("Ðã c?p nh?t t? v?ng TOPIK");
    } catch { showToast("L?i c?p nh?t", "err"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa t? v?ng này?")) return;
    try {
      const { error } = await supabase.from("topik_vocabulary").delete().eq("id", id);
      if (error) throw error;
      setVocab(prev => prev.filter(v => v.id !== id));
      showToast("Ðã xóa t? v?ng");
    } catch { showToast("L?i xóa", "err"); }
  };

  const handleAdd = async () => {
    if (!form.korean.trim() || !form.vietnamese.trim()) { showToast("Nh?p ti?ng Hàn và nghia", "err"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("topik_vocabulary").insert({ id: `tv-${Date.now()}`, ...form });
      if (error) throw error;
      showToast("Ðã thêm t? v?ng TOPIK m?i");
      setForm({ korean: "", reading: "", vietnamese: "", example: "", example_vi: "", category: "", topik_level: "I", part_of_speech: "Danh t?" });
      setShowAdd(false);
      fetchVocab();
    } catch { showToast("L?i thêm t?", "err"); }
    finally { setSaving(false); }
  };

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Tìm t? ti?ng Hàn ho?c nghia..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {["all", "I", "II"].map(l => (
            <button key={l} onClick={() => { setLevelFilter(l); setPage(0); }}
              className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: levelFilter === l ? "var(--admin-hover)" : "transparent", color: levelFilter === l ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {l === "all" ? "T?t c?" : `TOPIK ${l}`}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "rgba(52,211,153,0.10)", color: "#34d399", border: "1px solid rgba(52,211,153,0.20)" }}>
          <i className="ri-add-line"></i>Thêm t? m?i
        </button>
        <button onClick={fetchVocab} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          <i className="ri-refresh-line"></i>
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border p-5 mb-4" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
          <p className="font-bold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Thêm t? v?ng TOPIK m?i</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ti?ng Hàn *</label><input value={form.korean} onChange={e => setForm(f => ({ ...f, korean: e.target.value }))} placeholder="??" className={inputCls} style={inputStyle} /></div>
            <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Phiên âm</label><input value={form.reading} onChange={e => setForm(f => ({ ...f, reading: e.target.value }))} placeholder="hak-gyo" className={inputCls} style={inputStyle} /></div>
            <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Nghia *</label><input value={form.vietnamese} onChange={e => setForm(f => ({ ...f, vietnamese: e.target.value }))} placeholder="tru?ng h?c" className={inputCls} style={inputStyle} /></div>
            <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ví d? HQ</label><input value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))} className={inputCls} style={inputStyle} /></div>
            <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ví d? VN</label><input value={form.example_vi} onChange={e => setForm(f => ({ ...f, example_vi: e.target.value }))} className={inputCls} style={inputStyle} /></div>
            <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ch? d?</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls} style={inputStyle} /></div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>C?p d?</label>
              <select value={form.topik_level} onChange={e => setForm(f => ({ ...f, topik_level: e.target.value }))} className={inputCls + " cursor-pointer"} style={inputStyle}>
                <option value="I">TOPIK I</option><option value="II">TOPIK II</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Lo?i t?</label>
              <select value={form.part_of_speech} onChange={e => setForm(f => ({ ...f, part_of_speech: e.target.value }))} className={inputCls + " cursor-pointer"} style={inputStyle}>
                {["Danh t?", "Ð?ng t?", "Tính t?", "Tr?ng t?", "Tr? t?", "Liên t?"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
            <button onClick={handleAdd} disabled={saving} className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
              {saving ? "Ðang thêm..." : "Thêm vào Supabase"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "var(--admin-border)" }}>
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] px-4 py-2.5 text-[10px] font-bold tracking-normal"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-faint)", borderBottom: "1px solid var(--admin-border)" }}>
              <span>Ti?ng Hàn</span><span>Phiên âm</span><span>Nghia</span><span>C?p d?</span><span>Lo?i t?</span><span></span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {vocab.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--admin-text-faint)" }}>
                  <i className="ri-book-open-line text-3xl mb-2 block"></i>Không tìm th?y t? v?ng
                </div>
              ) : vocab.map(v => (
                <div key={v.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] px-4 py-3 items-center group"
                  style={{ backgroundColor: "var(--admin-card)" }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{v.korean}</p>
                    {v.example && <p className="text-[10px] truncate" style={{ color: "var(--admin-text-faint)" }}>{v.example}</p>}
                  </div>
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{v.reading}</p>
                  <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{v.vietnamese}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit ${v.topik_level === "I" ? "bg-app-accent-success/15 text-app-accent-success" : "bg-rose-500/15 text-rose-400"}`}>
                    TOPIK {v.topik_level}
                  </span>
                  <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{v.part_of_speech}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditEntry({ ...v })} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>Trang {page + 1} · {vocab.length} t?</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Tru?c</button>
              <button onClick={() => setPage(p => p + 1)} disabled={vocab.length < PAGE_SIZE} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Ti?p</button>
            </div>
          </div>
        </>
      )}

      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>S?a t? TOPIK: {editEntry.korean}</p>
              <button onClick={() => setEditEntry(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}><i className="ri-close-line"></i></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { key: "korean", label: "Ti?ng Hàn" }, { key: "reading", label: "Phiên âm" },
                { key: "vietnamese", label: "Nghia" }, { key: "category", label: "Ch? d?" },
                { key: "example", label: "Ví d? HQ" }, { key: "example_vi", label: "Ví d? VN" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>{f.label}</label>
                  <input value={(editEntry as unknown as Record<string, string>)[f.key] || ""} onChange={e => setEditEntry(prev => prev ? { ...prev, [f.key]: e.target.value } : null)} className={inputCls} style={inputStyle} />
                </div>
              ))}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>C?p d?</label>
                <select value={editEntry.topik_level} onChange={e => setEditEntry(prev => prev ? { ...prev, topik_level: e.target.value } : null)} className={inputCls + " cursor-pointer"} style={inputStyle}>
                  <option value="I">TOPIK I</option><option value="II">TOPIK II</option>
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Lo?i t?</label>
                <select value={editEntry.part_of_speech} onChange={e => setEditEntry(prev => prev ? { ...prev, part_of_speech: e.target.value } : null)} className={inputCls + " cursor-pointer"} style={inputStyle}>
                  {["Danh t?", "Ð?ng t?", "Tính t?", "Tr?ng t?", "Tr? t?", "Liên t?"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--admin-border)" }}>
              <button onClick={() => setEditEntry(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {saving ? "Ðang luu..." : "Luu thay d?i"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Seoul Vocab Tab ----------------------------------------------------------
function SeoulVocabTab() {
  const [vocab, setVocab] = useState<SeoulVocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("all");
  const [editEntry, setEditEntry] = useState<SeoulVocab | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVocab = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("seoul_vocabulary").select("*").order("id", { ascending: false });
      if (bookFilter !== "all") query = query.eq("book_id", bookFilter);
      if (search.trim()) query = query.or(`korean.ilike.%${search}%,vietnamese.ilike.%${search}%`);
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      const { data, error } = await query;
      if (error) throw error;
      setVocab(data ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [bookFilter, search, page]);

  useEffect(() => { fetchVocab(); }, [fetchVocab]);

  const handleSaveEdit = async () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("seoul_vocabulary").update({
        korean: editEntry.korean, pronunciation: editEntry.pronunciation,
        vietnamese: editEntry.vietnamese, part_of_speech: editEntry.part_of_speech,
        example: editEntry.example, example_vi: editEntry.example_vi,
      }).eq("id", editEntry.id);
      if (error) throw error;
      setVocab(prev => prev.map(v => v.id === editEntry.id ? editEntry : v));
      setEditEntry(null);
      showToast("Ðã c?p nh?t t? v?ng Seoul");
    } catch { showToast("L?i c?p nh?t", "err"); }
    finally { setSaving(false); }
  };

  const books = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Tìm t? ti?ng Hàn ho?c nghia..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <select value={bookFilter} onChange={e => { setBookFilter(e.target.value); setPage(0); }}
          className="rounded-lg px-3 py-2 text-xs outline-none cursor-pointer border"
          style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>
          <option value="all">T?t c? giáo trình</option>
          {books.map(b => <option key={b} value={b}>Giáo trình {b}</option>)}
        </select>
        <button onClick={fetchVocab} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          <i className="ri-refresh-line"></i>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "var(--admin-border)" }}>
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] px-4 py-2.5 text-[10px] font-bold tracking-normal"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-faint)", borderBottom: "1px solid var(--admin-border)" }}>
              <span>Ti?ng Hàn</span><span>Phiên âm</span><span>Nghia</span><span>Giáo trình</span><span>Bài</span><span></span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {vocab.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--admin-text-faint)" }}>
                  <i className="ri-book-3-line text-3xl mb-2 block"></i>Không tìm th?y t? v?ng Seoul
                </div>
              ) : vocab.map(v => (
                <div key={v.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] px-4 py-3 items-center group"
                  style={{ backgroundColor: "var(--admin-card)" }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{v.korean}</p>
                    {v.hanja && <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{v.hanja}</p>}
                  </div>
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{v.pronunciation}</p>
                  <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{v.vietnamese}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold w-fit bg-[#a78bfa]/15 text-[#a78bfa]">{v.book_id}</span>
                  <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{v.lesson_id}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditEntry({ ...v })} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>Trang {page + 1} · {vocab.length} t?</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Tru?c</button>
              <button onClick={() => setPage(p => p + 1)} disabled={vocab.length < PAGE_SIZE} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Ti?p</button>
            </div>
          </div>
        </>
      )}

      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>S?a t? Seoul: {editEntry.korean}</p>
              <button onClick={() => setEditEntry(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}><i className="ri-close-line"></i></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { key: "korean", label: "Ti?ng Hàn" }, { key: "pronunciation", label: "Phiên âm" },
                { key: "vietnamese", label: "Nghia" }, { key: "part_of_speech", label: "Lo?i t?" },
                { key: "example", label: "Ví d? HQ" }, { key: "example_vi", label: "Ví d? VN" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>{f.label}</label>
                  <input value={(editEntry as unknown as Record<string, string>)[f.key] || ""} onChange={e => setEditEntry(prev => prev ? { ...prev, [f.key]: e.target.value } : null)} className={inputCls} style={inputStyle} />
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--admin-border)" }}>
              <button onClick={() => setEditEntry(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {saving ? "Ðang luu..." : "Luu thay d?i"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Hanja Tab ----------------------------------------------------------------
function HanjaTab() {
  const [entries, setEntries] = useState<HanjaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editEntry, setEditEntry] = useState<HanjaEntry | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("hanja_vocab_entries").select("id, korean, hanja, vietnamese, pronunciation, category, difficulty, memory_tip").order("created_at", { ascending: false });
      if (search.trim()) query = query.or(`korean.ilike.%${search}%,vietnamese.ilike.%${search}%,hanja.ilike.%${search}%`);
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      const { data, error } = await query;
      if (error) throw error;
      setEntries(data ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSaveEdit = async () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("hanja_vocab_entries").update({
        korean: editEntry.korean, hanja: editEntry.hanja, vietnamese: editEntry.vietnamese,
        pronunciation: editEntry.pronunciation, category: editEntry.category,
        difficulty: editEntry.difficulty, memory_tip: editEntry.memory_tip,
      }).eq("id", editEntry.id);
      if (error) throw error;
      setEntries(prev => prev.map(e => e.id === editEntry.id ? editEntry : e));
      setEditEntry(null);
      showToast("Ðã c?p nh?t t? Hán Hàn");
    } catch { showToast("L?i c?p nh?t", "err"); }
    finally { setSaving(false); }
  };

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-52">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Tìm t? Hán Hàn..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <button onClick={fetchEntries} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          <i className="ri-refresh-line"></i>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "var(--admin-border)" }}>
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] px-4 py-2.5 text-[10px] font-bold tracking-normal"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-faint)", borderBottom: "1px solid var(--admin-border)" }}>
              <span>Ti?ng Hàn</span><span>Hán t?</span><span>Nghia</span><span>Ch? d?</span><span>Ð? khó</span><span></span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {entries.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--admin-text-faint)" }}>
                  <i className="ri-character-recognition-line text-3xl mb-2 block"></i>Không tìm th?y t? Hán Hàn
                </div>
              ) : entries.map(e => (
                <div key={e.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_auto] px-4 py-3 items-center group"
                  style={{ backgroundColor: "var(--admin-card)" }}>
                  <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>{e.korean}</p>
                  <p className="text-sm font-bold" style={{ color: "app-accent-primary" }}>{e.hanja}</p>
                  <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{e.vietnamese}</p>
                  <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{e.category}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < (e.difficulty || 1) ? "app-accent-primary" : "var(--admin-hover)" }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditEntry({ ...e })} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>Trang {page + 1} · {entries.length} t?</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Tru?c</button>
              <button onClick={() => setPage(p => p + 1)} disabled={entries.length < PAGE_SIZE} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Ti?p</button>
            </div>
          </div>
        </>
      )}

      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>S?a t? Hán Hàn: {editEntry.korean}</p>
              <button onClick={() => setEditEntry(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}><i className="ri-close-line"></i></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { key: "korean", label: "Ti?ng Hàn" }, { key: "hanja", label: "Hán t?" },
                { key: "vietnamese", label: "Nghia" }, { key: "pronunciation", label: "Phiên âm" },
                { key: "category", label: "Ch? d?" }, { key: "memory_tip", label: "M?o nh?" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>{f.label}</label>
                  <input value={(editEntry as unknown as Record<string, string>)[f.key] || ""} onChange={e => setEditEntry(prev => prev ? { ...prev, [f.key]: e.target.value } : null)} className={inputCls} style={inputStyle} />
                </div>
              ))}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ð? khó (1-5)</label>
                <input type="number" min={1} max={5} value={editEntry.difficulty || 1} onChange={e => setEditEntry(prev => prev ? { ...prev, difficulty: parseInt(e.target.value) } : null)} className={inputCls} style={inputStyle} />
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--admin-border)" }}>
              <button onClick={() => setEditEntry(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {saving ? "Ðang luu..." : "Luu thay d?i"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Grammar Tab --------------------------------------------------------------
function GrammarTab() {
  const [entries, setEntries] = useState<GrammarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editEntry, setEditEntry] = useState<GrammarEntry | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("seoul_grammar").select("*").order("id", { ascending: false });
      if (search.trim()) query = query.or(`pattern.ilike.%${search}%,explanation.ilike.%${search}%`);
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      const { data, error } = await query;
      if (error) throw error;
      setEntries(data ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSaveEdit = async () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("seoul_grammar").update({
        pattern: editEntry.pattern, level: editEntry.level,
        explanation: editEntry.explanation, notes: editEntry.notes,
      }).eq("id", editEntry.id);
      if (error) throw error;
      setEntries(prev => prev.map(e => e.id === editEntry.id ? editEntry : e));
      setEditEntry(null);
      showToast("Ðã c?p nh?t ng? pháp");
    } catch { showToast("L?i c?p nh?t", "err"); }
    finally { setSaving(false); }
  };

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-52">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Tìm c?u trúc ng? pháp..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <button onClick={fetchEntries} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          <i className="ri-refresh-line"></i>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "var(--admin-border)" }}>
            <div className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] px-4 py-2.5 text-[10px] font-bold tracking-normal"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-faint)", borderBottom: "1px solid var(--admin-border)" }}>
              <span>C?u trúc</span><span>Gi?i thích</span><span>C?p d?</span><span>Giáo trình</span><span></span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
              {entries.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--admin-text-faint)" }}>
                  <i className="ri-book-2-line text-3xl mb-2 block"></i>Không tìm th?y ng? pháp
                </div>
              ) : entries.map(e => (
                <div key={e.id} className="grid grid-cols-[2fr_3fr_1fr_1fr_auto] px-4 py-3 items-start group"
                  style={{ backgroundColor: "var(--admin-card)" }}>
                  <p className="font-bold text-sm" style={{ color: "#a78bfa" }}>{e.pattern}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>{e.explanation}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold w-fit bg-[#a78bfa]/15 text-[#a78bfa]">{e.level}</span>
                  <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{e.book_id}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditEntry({ ...e })} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>Trang {page + 1} · {entries.length} m?c</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Tru?c</button>
              <button onClick={() => setPage(p => p + 1)} disabled={entries.length < PAGE_SIZE} className="px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-30 whitespace-nowrap" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>Ti?p</button>
            </div>
          </div>
        </>
      )}

      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>S?a ng? pháp: {editEntry.pattern}</p>
              <button onClick={() => setEditEntry(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}><i className="ri-close-line"></i></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>C?u trúc</label><input value={editEntry.pattern} onChange={e => setEditEntry(prev => prev ? { ...prev, pattern: e.target.value } : null)} className={inputCls} style={inputStyle} /></div>
              <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>C?p d?</label><input value={editEntry.level} onChange={e => setEditEntry(prev => prev ? { ...prev, level: e.target.value } : null)} className={inputCls} style={inputStyle} /></div>
              <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Gi?i thích</label><textarea value={editEntry.explanation} onChange={e => setEditEntry(prev => prev ? { ...prev, explanation: e.target.value } : null)} rows={3} className={inputCls + " resize-none"} style={inputStyle} /></div>
              <div><label className="text-xs mb-1 block" style={{ color: "var(--admin-text-muted)" }}>Ghi chú</label><textarea value={editEntry.notes || ""} onChange={e => setEditEntry(prev => prev ? { ...prev, notes: e.target.value } : null)} rows={2} className={inputCls + " resize-none"} style={inputStyle} /></div>
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--admin-border)" }}>
              <button onClick={() => setEditEntry(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                {saving ? "Ðang luu..." : "Luu thay d?i"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function AdminContentLearnPage() {
  const [tab, setTab] = useState<Tab>("topik");

  const tabs = [
    { id: "topik" as Tab, label: "T? v?ng TOPIK", icon: "ri-book-open-line", color: "#34d399" },
    { id: "seoul" as Tab, label: "T? v?ng Seoul", icon: "ri-book-3-line", color: "#a78bfa" },
    { id: "hanja" as Tab, label: "Hán Hàn", icon: "ri-character-recognition-line", color: "app-accent-primary" },
    { id: "grammar" as Tab, label: "Ng? pháp Seoul", icon: "ri-book-2-line", color: "#fb923c" },
  ];

  return (
    <AdminLayout
      title="Qu?n lý N?i dung H?c t?p"
      subtitle="CRUD tr?c ti?p t? Supabase — TOPIK vocab, Seoul vocab, Hán Hàn, Ng? pháp"
    >
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: "var(--admin-card2)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all"
            style={{
              backgroundColor: tab === t.id ? "var(--admin-hover)" : "transparent",
              color: tab === t.id ? t.color : "var(--admin-text-faint)",
              border: tab === t.id ? `1px solid ${t.color}25` : "1px solid transparent",
            }}>
            <i className={t.icon}></i>{t.label}
          </button>
        ))}
      </div>

      {tab === "topik" && <TopikVocabTab />}
      {tab === "seoul" && <SeoulVocabTab />}
      {tab === "hanja" && <HanjaTab />}
      {tab === "grammar" && <GrammarTab />}
    </AdminLayout>
  );
}

