import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { playKoreanAudio, clearAudioSessionCache } from "@/lib/audioService";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CacheRow {
  id: string;
  text: string;
  text_hash: string;
  latin_slug: string;
  audio_url: string;
  voice_provider: string;
  voice_id: string | null;
  voice_speed: number | null;
  manual_override: boolean;
  status: "ready" | "error";
  hit_count: number;
  last_played_at: string | null;
  created_at: string;
}

interface MissRow {
  id: string;
  text: string;
  text_hash: string;
  miss_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

interface ProviderConfig {
  provider: "openai" | "elevenlabs" | "google";
  voice_id: string;
  model?: string;
  speed?: number;
}

const PAGE_SIZE = 25;
const DEFAULT_CFG: ProviderConfig = {
  provider: "openai",
  voice_id: "alloy",
  model: "tts-1",
  speed: 0.9,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showToast(setToast: (t: Toast | null) => void, msg: string, type: "ok" | "err" = "ok") {
  setToast({ msg, type });
  setTimeout(() => setToast(null), 3000);
}
interface Toast { msg: string; type: "ok" | "err" }

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminAudioPage() {
  const [tab, setTab] = useState<"cache" | "queue" | "config">("cache");

  const [rows, setRows] = useState<CacheRow[]>([]);
  const [misses, setMisses] = useState<MissRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "manual" | "auto" | "error">("all");

  const [cfg, setCfg] = useState<ProviderConfig>(DEFAULT_CFG);
  const [cfgLoaded, setCfgLoaded] = useState(false);
  const [cfgSaving, setCfgSaving] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, manual: 0, auto: 0, totalHits: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadId = useRef<string | null>(null);

  // ── Fetch cache list ────────────────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("tts_audio_cache")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search.trim()) {
      q = q.or(`text.ilike.%${search}%,latin_slug.ilike.%${search}%`);
    }
    if (filter === "manual") q = q.eq("manual_override", true);
    if (filter === "auto") q = q.eq("manual_override", false);
    if (filter === "error") q = q.eq("status", "error");

    const { data, count, error } = await q;
    if (error) {
      showToast(setToast, `Lỗi tải: ${error.message}`, "err");
    } else {
      setRows((data || []) as CacheRow[]);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [page, search, filter]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { count: total } = await supabase
      .from("tts_audio_cache").select("*", { count: "exact", head: true });
    const { count: manual } = await supabase
      .from("tts_audio_cache").select("*", { count: "exact", head: true })
      .eq("manual_override", true);
    const { data: hits } = await supabase
      .from("tts_audio_cache").select("hit_count");
    const totalHits = (hits || []).reduce((s, r) => s + (r.hit_count || 0), 0);
    setStats({
      total: total || 0,
      manual: manual || 0,
      auto: (total || 0) - (manual || 0),
      totalHits,
    });
  }, []);

  // ── Fetch misses queue ──────────────────────────────────────────────────────
  const fetchMisses = useCallback(async () => {
    const { data, error } = await supabase
      .from("tts_audio_misses")
      .select("*")
      .order("miss_count", { ascending: false })
      .limit(100);
    if (!error) setMisses((data || []) as MissRow[]);
  }, []);

  // ── Load provider config ────────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "tts_provider")
      .maybeSingle();
    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value as string) as ProviderConfig;
        setCfg({ ...DEFAULT_CFG, ...parsed });
      } catch {
        // keep defaults
      }
    }
    setCfgLoaded(true);
  }, []);

  useEffect(() => { fetchRows(); fetchStats(); }, [fetchRows, fetchStats]);
  useEffect(() => { setPage(1); }, [search, filter]);
  useEffect(() => { if (tab === "queue") fetchMisses(); }, [tab, fetchMisses]);
  useEffect(() => { if (tab === "config" && !cfgLoaded) fetchConfig(); }, [tab, cfgLoaded, fetchConfig]);

  // ── Play (uses unified audio service so cached URL is honored) ──────────────
  const handlePlay = async (row: CacheRow) => {
    try {
      const audio = new Audio(row.audio_url);
      audio.crossOrigin = "anonymous";
      await audio.play();
    } catch (err) {
      showToast(setToast, `Phát thất bại: ${err instanceof Error ? err.message : err}`, "err");
    }
  };

  // ── Regenerate (force the edge function to re-call provider) ────────────────
  const handleRegenerate = async (row: CacheRow) => {
    if (row.manual_override) {
      if (!confirm("Bản ghi này là manual override. Regenerate sẽ ghi đè bằng giọng auto. Tiếp tục?")) return;
    }
    setBusyId(row.id);
    try {
      const { data, error } = await supabase.functions.invoke("tts-cache", {
        body: { text: row.text, force: true },
      });
      if (error) {
        showToast(setToast, `Lỗi: ${error.message}`, "err");
      } else if (data?.url) {
        showToast(setToast, "Đã tạo lại audio", "ok");
        clearAudioSessionCache();
        await fetchRows();
      }
    } finally {
      setBusyId(null);
    }
  };

  // ── Manual upload ───────────────────────────────────────────────────────────
  const handleManualUpload = async (row: CacheRow, file: File) => {
    if (!file.type.startsWith("audio/")) {
      showToast(setToast, "Chỉ chấp nhận file audio", "err");
      return;
    }
    setBusyId(row.id);
    try {
      const filename = `${row.latin_slug}-${row.text_hash.slice(0, 8)}.mp3`;
      const { error: upErr } = await supabase.storage
        .from("tts-audio")
        .upload(filename, file, { upsert: true, contentType: file.type });
      if (upErr) { showToast(setToast, `Upload lỗi: ${upErr.message}`, "err"); return; }
      const { data: { publicUrl } } = supabase.storage.from("tts-audio").getPublicUrl(filename);
      const { error: dbErr } = await supabase
        .from("tts_audio_cache")
        .update({ audio_url: publicUrl, manual_override: true, voice_provider: "manual", status: "ready" })
        .eq("id", row.id);
      if (dbErr) { showToast(setToast, `DB lỗi: ${dbErr.message}`, "err"); return; }
      showToast(setToast, "Đã thay audio (manual)", "ok");
      clearAudioSessionCache();
      await fetchRows();
    } finally {
      setBusyId(null);
    }
  };

  // ── Delete (db row + storage object) ────────────────────────────────────────
  const handleDelete = async (row: CacheRow) => {
    if (!confirm(`Xoá audio "${row.text}"? Lần sau nhấn từ này sẽ phải tạo lại (tốn token).`)) return;
    setBusyId(row.id);
    try {
      const filename = `${row.latin_slug}-${row.text_hash.slice(0, 8)}.mp3`;
      await supabase.storage.from("tts-audio").remove([filename]);
      const { error } = await supabase.from("tts_audio_cache").delete().eq("id", row.id);
      if (error) { showToast(setToast, `Lỗi xoá: ${error.message}`, "err"); return; }
      showToast(setToast, "Đã xoá audio", "ok");
      clearAudioSessionCache();
      await fetchRows();
      await fetchStats();
    } finally {
      setBusyId(null);
    }
  };

  // ── Generate from miss queue ────────────────────────────────────────────────
  const handleGenerateMiss = async (m: MissRow) => {
    setBusyId(m.id);
    try {
      const { data, error } = await supabase.functions.invoke("tts-cache", {
        body: { text: m.text },
      });
      if (error) {
        showToast(setToast, `Lỗi: ${error.message}`, "err");
      } else if (data?.url) {
        showToast(setToast, "Đã tạo audio cho từ này", "ok");
        await fetchMisses();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleClearMiss = async (m: MissRow) => {
    await supabase.from("tts_audio_misses").delete().eq("id", m.id);
    setMisses(prev => prev.filter(x => x.id !== m.id));
  };

  // ── Bulk regenerate visible page ────────────────────────────────────────────
  const handleBulkRegenerate = async () => {
    if (!confirm(`Tạo lại audio cho ${rows.length} dòng đang hiển thị? Sẽ gọi provider TTS ${rows.length} lần.`)) return;
    let ok = 0, fail = 0;
    for (const row of rows) {
      if (row.manual_override) continue;
      setBusyId(row.id);
      const { data, error } = await supabase.functions.invoke("tts-cache", {
        body: { text: row.text, force: true },
      });
      if (error || !data?.url) fail++; else ok++;
    }
    setBusyId(null);
    showToast(setToast, `Hoàn tất: ${ok} thành công, ${fail} lỗi`, fail > 0 ? "err" : "ok");
    clearAudioSessionCache();
    await fetchRows();
  };

  // ── Bulk generate from miss queue ───────────────────────────────────────────
  const handleBulkGenerateMisses = async () => {
    const top = misses.slice(0, 20);
    if (top.length === 0) return;
    if (!confirm(`Tạo audio cho ${top.length} từ phổ biến nhất trong queue?`)) return;
    let ok = 0, fail = 0;
    for (const m of top) {
      const { data, error } = await supabase.functions.invoke("tts-cache", { body: { text: m.text } });
      if (error || !data?.url) fail++; else ok++;
    }
    showToast(setToast, `Hoàn tất: ${ok} thành công, ${fail} lỗi`, fail > 0 ? "err" : "ok");
    await fetchMisses();
    await fetchStats();
  };

  // ── Save config ─────────────────────────────────────────────────────────────
  const handleSaveConfig = async () => {
    setCfgSaving(true);
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key: "tts_provider", value: JSON.stringify(cfg) }, { onConflict: "key" });
    setCfgSaving(false);
    if (error) showToast(setToast, `Lỗi lưu: ${error.message}`, "err");
    else showToast(setToast, "Đã lưu cấu hình provider", "ok");
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const voiceOptions = useMemo(() => {
    if (cfg.provider === "openai") {
      return ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    }
    if (cfg.provider === "google") {
      return ["ko-KR-Neural2-A", "ko-KR-Neural2-B", "ko-KR-Neural2-C", "ko-KR-Wavenet-A", "ko-KR-Wavenet-B"];
    }
    return ["(nhập voice_id từ ElevenLabs)"];
  }, [cfg.provider]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      title="Audio TTS Cache"
      subtitle="Quản lý audio tiếng Hàn được cache site-wide (tránh gọi lại provider tốn token)"
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white ${toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <i className={`${toast.type === "ok" ? "ri-checkbox-circle-line" : "ri-error-warning-line"} mr-2`}></i>{toast.msg}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          const id = pendingUploadId.current;
          if (!file || !id) return;
          const row = rows.find(r => r.id === id);
          if (row) await handleManualUpload(row, file);
          e.target.value = "";
          pendingUploadId.current = null;
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng audio cache", value: stats.total.toLocaleString(), icon: "ri-database-2-line", color: "#34d399" },
          { label: "Auto-generated", value: stats.auto.toLocaleString(), icon: "ri-cpu-line", color: "#06b6d4" },
          { label: "Manual override", value: stats.manual.toLocaleString(), icon: "ri-mic-line", color: "#a78bfa" },
          { label: "Tổng lượt phát", value: stats.totalHits.toLocaleString(), icon: "ri-play-circle-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
               style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-bold text-xl leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--admin-hover)" }}>
        {[
          { id: "cache", label: "Cache", icon: "ri-database-2-line" },
          { id: "queue", label: `Queue cần audio (${misses.length})`, icon: "ri-time-line" },
          { id: "config", label: "Cấu hình provider", icon: "ri-settings-3-line" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${tab === t.id ? "text-white" : ""}`}
            style={{
              backgroundColor: tab === t.id ? "var(--admin-accent)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--admin-text-muted)",
            }}
          >
            <i className={t.icon}></i>{t.label}
          </button>
        ))}
      </div>

      {/* TAB: cache */}
      {tab === "cache" && (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-muted)" }}></i>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo text tiếng Hàn hoặc slug latin..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none border focus:border-app-accent-primary"
                style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              />
            </div>
            <select
              value={filter} onChange={e => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 rounded-lg text-sm border outline-none cursor-pointer"
              style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
            >
              <option value="all">Tất cả</option>
              <option value="auto">Auto-generated</option>
              <option value="manual">Manual override</option>
              <option value="error">Lỗi</option>
            </select>
            <button
              onClick={handleBulkRegenerate}
              className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-90"
              style={{ backgroundColor: "var(--admin-accent)", color: "#fff" }}
            >
              <i className="ri-refresh-line mr-1.5"></i>Bulk regenerate trang này
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                  <th className="text-left px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Korean</th>
                  <th className="text-left px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Slug latin</th>
                  <th className="text-left px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Provider</th>
                  <th className="text-right px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Lượt phát</th>
                  <th className="text-right px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Tạo lúc</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--admin-text-muted)" }}>Đang tải...</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--admin-text-muted)" }}>Chưa có audio nào trong cache</td></tr>
                )}
                {!loading && rows.map(row => (
                  <tr key={row.id} className="border-b last:border-b-0 hover:bg-black/5" style={{ borderColor: "var(--admin-border)" }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: "var(--admin-text)" }}>{row.text}</td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--admin-text-muted)" }}>{row.latin_slug}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs ${row.manual_override ? "bg-purple-500/15 text-purple-400" : "bg-cyan-500/15 text-cyan-400"}`}>
                        {row.manual_override ? "manual" : row.voice_provider}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right" style={{ color: "var(--admin-text)" }}>{row.hit_count}</td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: "var(--admin-text-muted)" }}>{new Date(row.created_at).toLocaleDateString("vi-VN")}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handlePlay(row)} title="Nghe" className="p-1.5 rounded hover:bg-emerald-500/20 cursor-pointer" style={{ color: "#34d399" }}>
                          <i className="ri-play-fill text-base"></i>
                        </button>
                        <button onClick={() => handleRegenerate(row)} disabled={busyId === row.id} title="Tạo lại" className="p-1.5 rounded hover:bg-cyan-500/20 cursor-pointer disabled:opacity-50" style={{ color: "#06b6d4" }}>
                          <i className={busyId === row.id ? "ri-loader-4-line animate-spin text-base" : "ri-refresh-line text-base"}></i>
                        </button>
                        <button
                          onClick={() => { pendingUploadId.current = row.id; fileInputRef.current?.click(); }}
                          disabled={busyId === row.id}
                          title="Upload mp3 thay thế"
                          className="p-1.5 rounded hover:bg-purple-500/20 cursor-pointer disabled:opacity-50"
                          style={{ color: "#a78bfa" }}
                        >
                          <i className="ri-upload-line text-base"></i>
                        </button>
                        <button onClick={() => handleDelete(row)} disabled={busyId === row.id} title="Xoá" className="p-1.5 rounded hover:bg-rose-500/20 cursor-pointer disabled:opacity-50" style={{ color: "#fb7185" }}>
                          <i className="ri-delete-bin-line text-base"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span style={{ color: "var(--admin-text-muted)" }}>Trang {page} / {totalPages} · {total} bản ghi</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded border disabled:opacity-40 cursor-pointer" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}>‹</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded border disabled:opacity-40 cursor-pointer" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}>›</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB: queue */}
      {tab === "queue" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
              Các từ user đã nhấn nhưng không có audio (vì provider chưa cấu hình hoặc lỗi). Sắp xếp theo độ phổ biến.
            </p>
            <button
              onClick={handleBulkGenerateMisses}
              disabled={misses.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: "var(--admin-accent)", color: "#fff" }}
            >
              <i className="ri-magic-line mr-1.5"></i>Tạo audio cho 20 từ hot nhất
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                  <th className="text-left px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Korean text</th>
                  <th className="text-right px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Số lần miss</th>
                  <th className="text-right px-3 py-2.5 font-medium" style={{ color: "var(--admin-text-muted)" }}>Lần cuối</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {misses.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8" style={{ color: "var(--admin-text-muted)" }}>Queue rỗng — tất cả audio đã có cache</td></tr>
                )}
                {misses.map(m => (
                  <tr key={m.id} className="border-b last:border-b-0" style={{ borderColor: "var(--admin-border)" }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: "var(--admin-text)" }}>{m.text}</td>
                    <td className="px-3 py-2.5 text-right" style={{ color: "var(--admin-text)" }}>{m.miss_count}</td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: "var(--admin-text-muted)" }}>
                      {new Date(m.last_seen_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => handleGenerateMiss(m)} disabled={busyId === m.id} className="p-1.5 rounded hover:bg-emerald-500/20 mr-1 cursor-pointer disabled:opacity-50" title="Tạo audio" style={{ color: "#34d399" }}>
                        <i className={busyId === m.id ? "ri-loader-4-line animate-spin text-base" : "ri-magic-line text-base"}></i>
                      </button>
                      <button onClick={() => handleClearMiss(m)} className="p-1.5 rounded hover:bg-rose-500/20 cursor-pointer" title="Bỏ qua" style={{ color: "#fb7185" }}>
                        <i className="ri-close-line text-base"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB: config */}
      {tab === "config" && (
        <div className="max-w-2xl rounded-xl border p-6" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <h3 className="font-semibold text-base mb-1" style={{ color: "var(--admin-text)" }}>TTS Provider</h3>
          <p className="text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>
            API key được đặt qua biến môi trường của edge function (OPENAI_API_KEY / ELEVENLABS_API_KEY / GOOGLE_TTS_API_KEY) — không lưu vào DB.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--admin-text-muted)" }}>Provider</label>
              <select
                value={cfg.provider}
                onChange={e => setCfg(c => ({ ...c, provider: e.target.value as ProviderConfig["provider"] }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none cursor-pointer"
                style={{ backgroundColor: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              >
                <option value="openai">OpenAI (tts-1 / tts-1-hd)</option>
                <option value="elevenlabs">ElevenLabs (multilingual)</option>
                <option value="google">Google Cloud TTS (Neural2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--admin-text-muted)" }}>Voice ID</label>
              {cfg.provider === "elevenlabs" ? (
                <input
                  type="text"
                  value={cfg.voice_id}
                  onChange={e => setCfg(c => ({ ...c, voice_id: e.target.value }))}
                  placeholder="21m00Tcm4TlvDq8ikWAM"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                />
              ) : (
                <select
                  value={cfg.voice_id}
                  onChange={e => setCfg(c => ({ ...c, voice_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
                >
                  {voiceOptions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--admin-text-muted)" }}>Model</label>
              <input
                type="text"
                value={cfg.model || ""}
                onChange={e => setCfg(c => ({ ...c, model: e.target.value }))}
                placeholder={cfg.provider === "openai" ? "tts-1" : cfg.provider === "elevenlabs" ? "eleven_multilingual_v2" : "(không cần với Google)"}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ backgroundColor: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--admin-text-muted)" }}>Speed (0.5–1.5)</label>
              <input
                type="number" min="0.5" max="1.5" step="0.05"
                value={cfg.speed ?? 0.9}
                onChange={e => setCfg(c => ({ ...c, speed: parseFloat(e.target.value) || 0.9 }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ backgroundColor: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
              />
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={cfgSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--admin-accent)", color: "#fff" }}
          >
            {cfgSaving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>

          <div className="mt-5 p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
            <p className="font-semibold mb-1" style={{ color: "var(--admin-text)" }}>Kiểm thử nhanh</p>
            <TestPlayer />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── Inline test player (sub-component) ──────────────────────────────────────
function TestPlayer() {
  const [text, setText] = useState("안녕하세요");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const handleTest = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setMsg("Đang gọi tts-cache...");
    try {
      await playKoreanAudio(text);
      setMsg("Phát xong");
    } catch (err) {
      setMsg(`Lỗi: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="text" value={text} onChange={e => setText(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded text-sm border outline-none"
        style={{ backgroundColor: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
      />
      <button
        onClick={handleTest} disabled={busy}
        className="px-3 py-1.5 rounded text-sm cursor-pointer disabled:opacity-50"
        style={{ backgroundColor: "var(--admin-accent)", color: "#fff" }}
      >
        {busy ? <i className="ri-loader-4-line animate-spin"></i> : <><i className="ri-play-fill mr-1"></i>Test</>}
      </button>
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  );
}
