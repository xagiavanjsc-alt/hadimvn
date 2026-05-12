import { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface TreeNode {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  root_char: string;
  audio_url: string | null;
}

const PAGE_SIZE = 50;

export default function AdminHanjaAudioPage() {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAudio, setFilterAudio] = useState<"all" | "has" | "missing">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingId = useRef<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("hanja_tree_nodes")
      .select("id,korean,hanja,vietnamese,pronunciation,root_char,audio_url", { count: "exact" })
      .order("root_char", { ascending: true })
      .order("korean", { ascending: true })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(`korean.ilike.%${search}%,vietnamese.ilike.%${search}%,hanja.ilike.%${search}%`);
    }
    if (filterAudio === "has") query = query.not("audio_url", "is", null);
    if (filterAudio === "missing") query = query.or("audio_url.is.null,audio_url.eq.");

    const { data, count } = await query;
    setNodes((data as TreeNode[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, search, filterAudio]);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);
  useEffect(() => { setPage(1); }, [search, filterAudio]);

  const handleUpload = async (nodeId: string, file: File) => {
    if (!file.type.startsWith("audio/")) {
      showToast("Chỉ chấp nhận file audio (mp3, wav, ogg)", "err");
      return;
    }
    setUploading(nodeId);
    const ext = file.name.split(".").pop() || "mp3";
    const path = `hanja-tree/${nodeId}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("hanja-audio")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) { showToast(`Upload lỗi: ${upErr.message}`, "err"); setUploading(null); return; }

    const { data: urlData } = supabase.storage.from("hanja-audio").getPublicUrl(path);
    const audioUrl = urlData.publicUrl;

    const { error: dbErr } = await supabase
      .from("hanja_tree_nodes")
      .update({ audio_url: audioUrl })
      .eq("id", nodeId);

    if (dbErr) { showToast(`Lưu URL lỗi: ${dbErr.message}`, "err"); }
    else {
      showToast("Upload thành công!");
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, audio_url: audioUrl } : n));
    }
    setUploading(null);
  };

  const handleDelete = async (node: TreeNode) => {
    if (!node.audio_url) return;
    setDeleting(node.id);
    const path = node.audio_url.split("/hanja-audio/")[1];
    if (path) await supabase.storage.from("hanja-audio").remove([path]);
    await supabase.from("hanja_tree_nodes").update({ audio_url: null }).eq("id", node.id);
    showToast("Đã xóa audio");
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, audio_url: null } : n));
    setDeleting(null);
    if (playing === node.id) { audioRef.current?.pause(); setPlaying(null); }
  };

  const handlePlay = (node: TreeNode) => {
    if (!node.audio_url) return;
    if (playing === node.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = node.audio_url; audioRef.current.play(); }
      setPlaying(node.id);
    }
  };

  const triggerUpload = (nodeId: string) => {
    uploadingId.current = nodeId;
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const nodeId = uploadingId.current;
    if (file && nodeId) handleUpload(nodeId, file);
    e.target.value = "";
  };

  const hasAudio = nodes.filter(n => n.audio_url).length;
  const missing = nodes.filter(n => !n.audio_url).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} className="hidden" />
      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onFileChange} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === "ok" ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" : "bg-rose-500/20 border border-rose-500/40 text-rose-300"
        }`}>
          {toast.type === "ok" ? <i className="ri-check-line mr-2"></i> : <i className="ri-error-warning-line mr-2"></i>}
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center bg-rose-500/20 rounded-xl">
            <i className="ri-volume-up-line text-rose-400 text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Quản lý Audio Hán Hàn</h1>
            <p className="text-xs text-app-text-muted">Upload MP3 cho từng từ trong bảng hanja_tree_nodes</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Tổng từ (trang này)", val: nodes.length, icon: "ri-list-check", color: "text-white/70" },
            { label: "Có audio", val: hasAudio, icon: "ri-volume-up-line", color: "text-emerald-400" },
            { label: "Chưa có", val: missing, icon: "ri-volume-mute-line", color: "text-rose-400" },
          ].map(s => (
            <div key={s.label} className="bg-app-card border border-app-border rounded-xl p-3 flex items-center gap-3">
              <i className={`${s.icon} text-xl ${s.color}`}></i>
              <div>
                <p className="text-lg font-bold text-white">{s.val}</p>
                <p className="text-[10px] text-app-text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-app-card border border-app-border rounded-xl p-4 mb-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo từ Hàn, Hán, nghĩa..."
              className="w-full pl-9 pr-3 py-2 bg-app-surface border border-app-border rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "has", "missing"] as const).map(f => (
              <button key={f} onClick={() => setFilterAudio(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                  filterAudio === f ? "bg-rose-500/20 border border-rose-500/40 text-rose-300" : "bg-app-surface border border-app-border text-white/50 hover:text-white/70"
                }`}>
                {f === "all" ? "Tất cả" : f === "has" ? "✅ Có audio" : "❌ Chưa có"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-app-card border border-app-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_auto] text-[10px] font-semibold text-app-text-muted px-4 py-2.5 border-b border-app-border bg-app-surface/50">
            <span>TỪ HÀN</span><span>HÁN TỰ</span><span>NGHĨA</span><span>PHIÊN ÂM</span><span className="text-right">AUDIO</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <i className="ri-loader-4-line animate-spin text-app-text-muted text-2xl"></i>
            </div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-12 text-app-text-muted">
              <i className="ri-inbox-line text-3xl mb-2 block"></i>
              <p className="text-sm">Không tìm thấy từ nào</p>
            </div>
          ) : (
            nodes.map(node => (
              <div key={node.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_auto] items-center px-4 py-3 border-b border-app-border/50 hover:bg-white/2 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white" lang="ko">{node.korean}</p>
                  <p className="text-[10px] text-app-text-muted">{node.root_char}</p>
                </div>
                <p className="text-sm text-app-accent-primary font-medium">{node.hanja}</p>
                <p className="text-xs text-app-text-secondary line-clamp-1">{node.vietnamese}</p>
                <p className="text-xs text-app-text-muted">{node.pronunciation || "—"}</p>
                <div className="flex items-center gap-1.5 justify-end">
                  {node.audio_url ? (
                    <>
                      <button onClick={() => handlePlay(node)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
                          playing === node.id ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/60 hover:text-emerald-400"
                        }`}>
                        <i className={playing === node.id ? "ri-pause-line text-xs" : "ri-play-line text-xs"}></i>
                      </button>
                      <button onClick={() => triggerUpload(node.id)} disabled={!!uploading}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 cursor-pointer transition-all disabled:opacity-40"
                        title="Thay thế audio">
                        {uploading === node.id ? <i className="ri-loader-4-line animate-spin text-xs"></i> : <i className="ri-refresh-line text-xs"></i>}
                      </button>
                      <button onClick={() => handleDelete(node)} disabled={!!deleting}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 cursor-pointer transition-all disabled:opacity-40"
                        title="Xóa audio">
                        {deleting === node.id ? <i className="ri-loader-4-line animate-spin text-xs"></i> : <i className="ri-delete-bin-line text-xs"></i>}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => triggerUpload(node.id)} disabled={!!uploading}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 cursor-pointer text-xs font-medium transition-all disabled:opacity-40 whitespace-nowrap">
                      {uploading === node.id ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-upload-2-line"></i>}
                      Upload MP3
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 bg-app-card border border-app-border rounded-lg text-sm text-white/60 disabled:opacity-30 cursor-pointer hover:text-white transition-colors">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-sm text-app-text-muted">Trang {page}/{totalPages} · {total} từ</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 bg-app-card border border-app-border rounded-lg text-sm text-white/60 disabled:opacity-30 cursor-pointer hover:text-white transition-colors">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
