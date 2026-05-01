import { useState, useRef, useCallback, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

interface HanjaEntry {
  id?: string;
  korean: string;
  hanja?: string;
  vietnamese: string;
  pronunciation?: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  example?: string;
  example_meaning?: string;
  root_char?: string;
  tree_node_id?: string;
}

const DIFF_COLORS = {
  easy: { bg: "rgba(74,222,128,0.12)", text: "#4ade80", label: "Dễ" },
  medium: { bg: "rgba(232,200,74,0.12)", text: "#e8c84a", label: "TB" },
  hard: { bg: "rgba(248,113,113,0.12)", text: "#f87171", label: "Khó" },
};

function parseCSV(text: string): HanjaEntry[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return {
      korean: obj.korean || obj.word || obj["từ"] || "",
      hanja: obj.hanja || obj["hán tự"] || "",
      vietnamese: obj.vietnamese || obj.meaning || obj["nghĩa"] || "",
      pronunciation: obj.pronunciation || obj["phát âm"] || "",
      difficulty: (obj.difficulty || obj["độ khó"] || "medium") as HanjaEntry["difficulty"],
      category: obj.category || obj["loại từ"] || "",
      example: obj.example || obj["ví dụ"] || "",
      example_meaning: obj.example_meaning || obj["nghĩa ví dụ"] || "",
      root_char: obj.root_char || obj["gốc"] || "",
    };
  }).filter(e => e.korean && e.vietnamese);
}

function EntryEditor({ entry, onSave, onCancel }: {
  entry: Partial<HanjaEntry>;
  onSave: (e: HanjaEntry) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<HanjaEntry>>({ difficulty: "medium", ...entry });

  const handleSave = () => {
    if (!form.korean?.trim() || !form.vietnamese?.trim()) return;
    onSave({
      korean: form.korean || "",
      hanja: form.hanja || "",
      vietnamese: form.vietnamese || "",
      pronunciation: form.pronunciation || "",
      difficulty: form.difficulty || "medium",
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
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as HanjaEntry["difficulty"] }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
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
            className="flex-1 py-2.5 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
            Lưu từ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHanjaPage() {
  const [entries, setEntries] = useLocalStorage<HanjaEntry[]>("kts_admin_hanja_entries", []);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [editingEntry, setEditingEntry] = useState<Partial<HanjaEntry> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = !search || e.korean.includes(search) || e.vietnamese.toLowerCase().includes(search.toLowerCase()) || (e.hanja || "").includes(search);
      const matchDiff = filterDiff === "all" || e.difficulty === filterDiff;
      return matchSearch && matchDiff;
    });
  }, [entries, search, filterDiff]);

  const handleSaveEntry = useCallback((entry: HanjaEntry) => {
    setEntries(prev => {
      if (entry.id) {
        return prev.map((e, i) => String(i) === entry.id ? entry : e);
      }
      return [...prev, entry];
    });
    setEditingEntry(null);
  }, [setEntries]);

  const handleDelete = useCallback((idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
    setDeleteConfirm(null);
  }, [setEntries]);

  const handleImportCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      const existing = new Set(entries.map(e => e.korean));
      const newEntries = parsed.filter(e => !existing.has(e.korean));
      setEntries(prev => [...prev, ...newEntries]);
      setImportResult({ added: newEntries.length, skipped: parsed.length - newEntries.length });
      setImporting(false);
      setTimeout(() => setImportResult(null), 5000);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  }, [entries, setEntries]);

  const handleSyncToSupabase = useCallback(async () => {
    if (entries.length === 0) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const rows = entries.map(e => ({
        korean: e.korean,
        hanja: e.hanja || null,
        vietnamese: e.vietnamese,
        pronunciation: e.pronunciation || null,
        difficulty: e.difficulty,
        category: e.category || null,
        example: e.example || null,
        example_meaning: e.example_meaning || null,
        root_char: e.root_char || null,
      }));
      const { error } = await supabase.from("hanja_vocab_entries").upsert(rows, { onConflict: "korean" });
      if (error) throw error;
      setSyncResult(`✓ Đã đồng bộ ${rows.length} từ lên Supabase`);
    } catch (err) {
      setSyncResult(`✗ Lỗi: ${err instanceof Error ? err.message : "Không thể kết nối"}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  }, [entries]);

  const handleExportCSV = useCallback(() => {
    const headers = ["korean", "hanja", "vietnamese", "pronunciation", "difficulty", "category", "example", "example_meaning", "root_char"];
    const rows = entries.map(e => headers.map(h => `"${(e[h as keyof HanjaEntry] || "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hanja_vocab_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const stats = useMemo(() => ({
    total: entries.length,
    easy: entries.filter(e => e.difficulty === "easy").length,
    medium: entries.filter(e => e.difficulty === "medium").length,
    hard: entries.filter(e => e.difficulty === "hard").length,
  }), [entries]);

  return (
    <AdminLayout
      title="Quản lý Hán Hàn"
      subtitle="Thêm, sửa, xóa và import từ vựng Hán Hàn"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}>
            <i className="ri-upload-cloud-2-line"></i>
            {importing ? "Đang import..." : "Import CSV"}
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleImportCSV} />
          <button onClick={handleExportCSV} disabled={entries.length === 0}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
            <i className="ri-download-line"></i>
            Xuất CSV
          </button>
          <button onClick={handleSyncToSupabase} disabled={syncing || entries.length === 0}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
            <i className={`${syncing ? "ri-loader-4-line animate-spin" : "ri-cloud-line"}`}></i>
            {syncing ? "Đang sync..." : "Sync Supabase"}
          </button>
          <button onClick={() => setEditingEntry({})}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-add-line"></i>
            Thêm từ
          </button>
        </div>
      }
    >
      {/* Notifications */}
      {importResult && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <i className="ri-checkbox-circle-line text-emerald-400"></i>
          <p className="text-emerald-400 text-sm">Import thành công: +{importResult.added} từ mới, bỏ qua {importResult.skipped} từ trùng</p>
        </div>
      )}
      {syncResult && (
        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${syncResult.startsWith("✓") ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
          <p className={`text-sm ${syncResult.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>{syncResult}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng từ", value: stats.total, color: "#e8c84a", icon: "ri-character-recognition-line" },
          { label: "Dễ", value: stats.easy, color: "#4ade80", icon: "ri-seedling-line" },
          { label: "Trung bình", value: stats.medium, color: "#e8c84a", icon: "ri-star-line" },
          { label: "Khó", value: stats.hard, color: "#f87171", icon: "ri-fire-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* CSV format guide */}
      <div className="mb-5 p-4 rounded-xl border" style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-information-line text-[#e8c84a] text-sm"></i>
          <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>Định dạng CSV import</p>
        </div>
        <p className="text-[10px] font-mono" style={{ color: "var(--admin-text-muted)" }}>
          korean,hanja,vietnamese,pronunciation,difficulty,category,example,example_meaning,root_char
        </p>
        <p className="text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>
          Cột bắt buộc: korean, vietnamese. Các cột khác tùy chọn. Encoding: UTF-8.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm từ tiếng Hàn, nghĩa, Hán tự..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--admin-card)" }}>
          {(["all", "easy", "medium", "hard"] as const).map(d => (
            <button key={d} onClick={() => setFilterDiff(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
              style={{
                backgroundColor: filterDiff === d ? (d === "all" ? "rgba(232,200,74,0.15)" : DIFF_COLORS[d as keyof typeof DIFF_COLORS]?.bg || "rgba(232,200,74,0.15)") : "transparent",
                color: filterDiff === d ? (d === "all" ? "#e8c84a" : DIFF_COLORS[d as keyof typeof DIFF_COLORS]?.text || "#e8c84a") : "var(--admin-text-muted)",
              }}>
              {d === "all" ? "Tất cả" : DIFF_COLORS[d as keyof typeof DIFF_COLORS]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
            {filtered.length} từ {search || filterDiff !== "all" ? `(lọc từ ${entries.length})` : ""}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <i className="ri-character-recognition-line text-4xl mb-3" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm mb-1" style={{ color: "var(--admin-text-muted)" }}>
              {entries.length === 0 ? "Chưa có từ nào" : "Không tìm thấy kết quả"}
            </p>
            {entries.length === 0 && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                  <i className="ri-upload-cloud-2-line"></i>Import CSV
                </button>
                <button onClick={() => setEditingEntry({})}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer whitespace-nowrap bg-[#e8c84a] text-[#0f1117] font-bold">
                  <i className="ri-add-line"></i>Thêm từ đầu tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {filtered.slice(0, 100).map((entry, idx) => {
              const realIdx = entries.indexOf(entry);
              const diff = DIFF_COLORS[entry.difficulty];
              return (
                <div key={idx} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{realIdx + 1}</span>
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <p className="text-base font-bold" style={{ color: "var(--admin-text)" }}>{entry.korean}</p>
                    {entry.hanja && <p className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{entry.hanja}</p>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--admin-text)" }}>{entry.vietnamese}</p>
                    {entry.pronunciation && <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>[{entry.pronunciation}]</p>}
                  </div>
                  <div className="w-20 flex-shrink-0">
                    {entry.category && <p className="text-[10px] truncate" style={{ color: "var(--admin-text-muted)" }}>{entry.category}</p>}
                  </div>
                  <div className="w-14 flex-shrink-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: diff.bg, color: diff.text }}>{diff.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setEditingEntry({ ...entry, id: String(realIdx) })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                    <button onClick={() => setDeleteConfirm(realIdx)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length > 100 && (
              <div className="px-5 py-3 text-center text-xs" style={{ color: "var(--admin-text-faint)" }}>
                Hiển thị 100/{filtered.length} từ. Dùng tìm kiếm để lọc.
              </div>
            )}
          </div>
        )}
      </div>

      {editingEntry !== null && (
        <EntryEditor entry={editingEntry} onSave={handleSaveEntry} onCancel={() => setEditingEntry(null)} />
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-sm" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/12 mx-auto mb-4">
              <i className="ri-delete-bin-line text-rose-400 text-xl"></i>
            </div>
            <p className="text-center font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>
              Xóa từ &quot;{entries[deleteConfirm]?.korean}&quot;?
            </p>
            <p className="text-center text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>Hành động này không thể hoàn tác</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

