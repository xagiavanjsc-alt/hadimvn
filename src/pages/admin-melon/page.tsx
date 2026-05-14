import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useToast } from "@/components/base/Toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useMelonSongs, saveMelonSongsToSupabase, upsertMelonSongsToSupabase, clearMelonSongsFromSupabase } from "@/hooks/useMelonSongs";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface MelonSong {
  rank: number;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  albumArt: string;
  processed: boolean;
  releaseDate: string;
  album: string;
  translation?: {
    full?: string;
    lineByLine?: Array<{ korean: string; vietnamese: string }>;
    culturalNotes?: string[];
  };
  vocabulary?: Array<{
    korean: string;
    vietnamese: string;
    romaji: string;
    topikLevel?: "1" | "2";
    epsCategory?: string;
    frequency?: number;
    position?: number[];
    exampleSentence?: string;
  }>;
  grammar?: Array<{
    pattern: string;
    meaning: string;
    level: "1" | "2" | "3";
    examples: Array<{ sentence: string; translation: string; line: number }>;
    relatedGrammar?: string[];
  }>;
  difficulty?: {
    overall: "easy" | "medium" | "hard";
    vocabulary: number;
    grammar: number;
    speed: number;
    recommendedFor: string[];
  };
  audioUrl?: string;
}

const AdminMelonPage = () => {
  const isAdmin = useIsAdmin();
  const toast = useToast();
  const { songs: loadedSongs, loading: songsLoading, source: dataSource } = useMelonSongs();
  const [songs, setSongs] = useState<MelonSong[]>([]);
  const [selectedSong, setSelectedSong] = useState<MelonSong | null>(null);
  const [editingSong, setEditingSong] = useState<MelonSong | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadMode, setUploadMode] = useState<"replace" | "upsert">("upsert");
  const [diagMsg, setDiagMsg] = useState("");
  const [diagLoading, setDiagLoading] = useState(false);

  const handleTestConnection = async () => {
    setDiagLoading(true);
    setDiagMsg("");
    try {
      const { data, error, count } = await supabase
        .from("melon_songs")
        .select("rank, title", { count: "exact" })
        .order("rank", { ascending: true })
        .limit(3);
      if (error) {
        setDiagMsg(`❌ Lỗi read: ${error.message} (code: ${error.code})`);
      } else {
        setDiagMsg(`✅ Đọc được Supabase. Tổng số bài trong DB: ${count ?? "?"}. 3 bài đầu: ${(data ?? []).map((r: any) => `#${r.rank} ${r.title}`).join(", ") || "(trống)"}`);
      }
    } catch (e) {
      setDiagMsg(`❌ Exception: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDiagLoading(false);
    }
  };

  // Load songs from Supabase → localStorage → mock (via useMelonSongs hook)
  useEffect(() => {
    if (!songsLoading && loadedSongs.length > 0) {
      setSongs(loadedSongs as MelonSong[]);
    }
  }, [loadedSongs, songsLoading]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv"))) {
      setUploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv"))) {
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadStatus("processing");
    setUploadMsg("Đang xử lý file...");

    try {
      const text = await uploadFile.text();
      let data: MelonSong[];

      if (uploadFile.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        data = Array.isArray(parsed) ? parsed : parsed.songs ?? [];
      } else if (uploadFile.name.endsWith(".csv")) {
        // Parse CSV
        const lines = text.split("\n").filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        data = lines.slice(1).map((line, idx) => {
          const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
          const obj: any = {};
          headers.forEach((h, i) => {
            const val = (cols[i] || "").replace(/^"|"$/g, "").trim();
            obj[h] = h === "rank" || h === "processed" ? (val === "true" || parseInt(val)) : val;
          });
          return obj as MelonSong;
        });
      } else {
        throw new Error("Unsupported file format");
      }

      setUploadMsg("Đang lưu lên Supabase...");
      if (uploadMode === "upsert") {
        const result = await upsertMelonSongsToSupabase(data);
        if (result.ok) {
          setSongs(prev => {
            const map = new Map(prev.map(s => [s.rank, s]));
            data.forEach(s => map.set(s.rank, s));
            return Array.from(map.values()).sort((a, b) => a.rank - b.rank);
          });
          setUploadStatus("success");
          setUploadMsg(`✅ Upsert ${result.upserted} bài (bài cũ không bị xóa, trùng rank thì ghi đè)`);
        } else {
          setUploadStatus("error");
          setUploadMsg(`Lỗi: ${result.error}`);
        }
      } else {
        const result = await saveMelonSongsToSupabase(data);
        setSongs(data);
        setUploadStatus("success");
        setUploadMsg(`✅ Thay thế toàn bộ: ${data.length} bài hát. ${result.ok ? "(Đã sync Supabase)" : "(Chỉ lưu cục bộ)"}`);
      }
      setUploadFile(null);
    } catch (err) {
      setUploadStatus("error");
      setUploadMsg(`Lỗi: ${err instanceof Error ? err.message : "Không thể đọc file"}`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSong) return;
    const updated = songs.map(s => s.rank === editingSong.rank ? editingSong : s);
    setSongs(updated);
    await saveMelonSongsToSupabase(updated);
    setEditingSong(null);
    toast.showToast("Đã lưu thay đổi", "success");
  };

  const handleDelete = async (rank: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài hát này?")) return;
    const updated = songs.filter(s => s.rank !== rank);
    setSongs(updated);
    await saveMelonSongsToSupabase(updated);
    toast.showToast("Đã xóa bài hát", "success");
  };

  const handleFetchFromAPI = async () => {
    setIsFetching(true);
    setFetchMsg("Đang fetch dữ liệu từ Melon API...");

    try {
      const response = await fetch("https://api.apify.com/v2/acts/oxygenated_quagmire~melon-chart-scraper/run-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_APIFY_API_KEY || ""}`
        },
        body: JSON.stringify({
          mode: "top100",
          maxResults: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const items = result.data?.items || [];

      if (items.length === 0) {
        throw new Error("Không có dữ liệu trả về");
      }

      // Transform data
      const transformed = items.map((item: any) => ({
        rank: item.rank,
        title: item.title,
        artist: item.artist,
        genre: item.genre || "K-pop",
        lyrics: item.lyrics || "",
        albumArt: item.albumArt || "/images/melon/album-placeholder.svg",
        processed: false,
        releaseDate: item.releaseDate || "",
        album: item.album || ""
      }));

      // Deduplicate based on title+artist
      const existingKeys = new Set(songs.map(s => `${s.title}|${s.artist}`));
      const newItems = transformed.filter((item: any) => !existingKeys.has(`${item.title}|${item.artist}`));

      // Merge and limit to 100
      const merged = [...songs, ...newItems].slice(0, 100);

      // Reassign ranks
      merged.forEach((item, idx) => { item.rank = idx + 1; });

      localStorage.setItem("kts_melon_songs", JSON.stringify(merged));
      setSongs(merged);
      setFetchMsg(`✅ Đã fetch thành công ${newItems.length} bài hát mới! Tổng: ${merged.length} bài.`);
      toast.showToast(`Đã fetch ${newItems.length} bài hát mới`, "success");
    } catch (err) {
      setFetchMsg(`❌ Lỗi: ${err instanceof Error ? err.message : "Không thể fetch dữ liệu"}`);
      toast.showToast("Fetch thất bại", "error");
    } finally {
      setIsFetching(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-white/60">
          <i className="ri-lock-line text-4xl mb-3"></i>
          <p>Bạn không có quyền truy cập trang này</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Supabase connection status */}
        {!isSupabaseConfigured && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <i className="ri-error-warning-line text-red-400 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Supabase chưa được kết nối</p>
              <p className="text-red-400/70 text-xs mt-1">Biến môi trường <code className="bg-red-500/20 px-1 rounded">VITE_PUBLIC_SUPABASE_URL</code> và <code className="bg-red-500/20 px-1 rounded">VITE_PUBLIC_SUPABASE_ANON_KEY</code> chưa được set trên server. Dữ liệu chỉ lưu cục bộ (localStorage), sẽ mất khi dùng trình duyệt/máy khác.</p>
            </div>
          </div>
        )}
        {isSupabaseConfigured && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={diagLoading}
              className="px-3 py-1.5 rounded-lg text-xs bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
            >
              <i className={`mr-1.5 ${diagLoading ? "ri-loader-4-line animate-spin" : "ri-wifi-line"}`} />
              Test kết nối Supabase
            </button>
            {diagMsg && (
              <span className={`text-xs ${diagMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{diagMsg}</span>
            )}
          </div>
        )}
        {isSupabaseConfigured && dataSource && (
          <div className={`flex items-center gap-3 flex-wrap px-3 py-2 rounded-xl text-xs ${
            dataSource === "supabase" ? "bg-green-500/10 border border-green-500/20 text-green-400" :
            dataSource === "localstorage" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" :
            "bg-white/5 border border-white/10 text-white/40"
          }`}>
            <i className={dataSource === "supabase" ? "ri-cloud-line" : dataSource === "localstorage" ? "ri-save-line" : "ri-database-2-line"} />
            {dataSource === "supabase" && <span>Dữ liệu từ <b>Supabase</b> — đồng bộ mọi thiết bị ✅</span>}
            {dataSource === "localstorage" && <span>Dữ liệu từ <b>localStorage</b> ({songs.length} bài) — chỉ máy này ⚠️</span>}
            {dataSource === "mock" && <span>Dữ liệu <b>mock</b> — chưa có dữ liệu thật</span>}
            {dataSource === "localstorage" && songs.length > 0 && (
              <button
                onClick={async () => {
                  if (!confirm(`Đẩy ${songs.length} bài từ localStorage lên Supabase?`)) return;
                  setUploadMsg("Đang đồng bộ...");
                  setUploadStatus("processing");
                  const result = await upsertMelonSongsToSupabase(songs as any);
                  if (result.ok) {
                    setUploadStatus("success");
                    setUploadMsg(`✅ Đã đồng bộ ${result.upserted} bài lên Supabase!`);
                    toast.showToast(`Đồng bộ thành công ${result.upserted} bài`, "success");
                  } else {
                    setUploadStatus("error");
                    setUploadMsg(`❌ Lỗi: ${result.error}`);
                  }
                }}
                className="ml-auto px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 transition-colors font-semibold"
              >
                <i className="ri-upload-cloud-line mr-1" />
                Đẩy lên Supabase ngay
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Quản lý Melon Chart</h1>
            <p className="text-white/60 text-sm">Upload và quản lý dữ liệu bài hát K-pop</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFetchFromAPI}
              disabled={isFetching}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className={`mr-2 ${isFetching ? "ri-loader-4-line animate-spin" : "ri-download-cloud-line"}`}></i>
              {isFetching ? "Đang fetch..." : "Fetch từ API"}
            </button>
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="px-4 py-2 bg-app-accent-primary/20 border border-app-accent-primary/40 rounded-lg text-app-accent-primary text-sm hover:bg-app-accent-primary/30 transition-colors"
            >
              <i className="ri-upload-line mr-2"></i>
              Upload file
            </button>
            <button
              onClick={async () => {
                if (confirm("Xóa toàn bộ dữ liệu Melon? Dữ liệu sẽ bị xóa cả trên Supabase.")) {
                  await clearMelonSongsFromSupabase();
                  setSongs([]);
                  toast.showToast("Đã xóa toàn bộ dữ liệu", "success");
                }
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-colors"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* API Fetch Status */}
        {fetchMsg && (
          <div className={`p-4 rounded-xl text-sm ${fetchMsg.includes("✅") ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {fetchMsg}
          </div>
        )}

        {/* Upload Panel */}
        {showUploadPanel && (
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
              <h3 className="text-white font-semibold mb-1">Upload dữ liệu Melon</h3>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setUploadMode("upsert")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    uploadMode === "upsert"
                      ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "bg-white/5 border-app-border text-white/40 hover:text-white/60"
                  }`}
                >
                  <i className="ri-add-circle-line mr-1" />
                  Thêm / Cập nhật (giữ bài cũ)
                </button>
                <button
                  onClick={() => setUploadMode("replace")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    uploadMode === "replace"
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/5 border-app-border text-white/40 hover:text-white/60"
                  }`}
                >
                  <i className="ri-refresh-line mr-1" />
                  Thay thế tất cả
                </button>
              </div>
              {uploadMode === "upsert" && <p className="text-white/30 text-xs mt-1">Trùng rank → ghi đè. Rank mới → thêm vào. Bài cũ không liên quan giữ nguyên.</p>}
              {uploadMode === "replace" && <p className="text-red-400/60 text-xs mt-1">⚠️ Sẽ xóa TOÀN BỘ bài cũ trước khi insert. Dùng khi reset hoàn toàn.</p>}
            </div>
              <button
                onClick={() => { setShowUploadPanel(false); setUploadFile(null); }}
                className="text-white/40 hover:text-white"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-app-border rounded-xl p-8 text-center cursor-pointer"
              style={{
                borderColor: dragOver ? "#10b981" : undefined,
                backgroundColor: dragOver ? "rgba(16, 185, 129, 0.05)" : undefined
              }}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <i className="ri-file-upload-line text-4xl text-white/30 mb-3"></i>
              <p className="text-white/60 mb-2">{uploadFile ? uploadFile.name : "Kéo thả file vào đây hoặc click để chọn"}</p>
              <p className="text-white/40 text-xs mb-4">Hỗ trợ .json và .csv</p>
              <input
                id="fileInput"
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {uploadFile && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === "processing"}
                  className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === "processing" ? "Đang upload..." : "Upload"}
                </button>
                <button
                  onClick={() => setUploadFile(null)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}

            {uploadStatus === "processing" && (
              <div className="mt-4 text-center text-white/60">
                <i className="ri-loader-4-line animate-spin text-xl"></i>
                <p className="text-sm mt-2">{uploadMsg}</p>
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                <i className="ri-checkbox-circle-line mr-2"></i>
                {uploadMsg}
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {uploadMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {uploadStatus === "idle" && (
                <button
                  onClick={handleUpload}
                  className="flex-1 py-2.5 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors"
                >
                  Upload & Cập nhật
                </button>
              )}
              <button
                onClick={() => setUploadFile(null)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Songs List */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <h3 className="text-white font-semibold">Danh sách bài hát ({songs.length})</h3>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(songs, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "melon_songs.json";
                a.click();
              }}
              className="text-white/60 text-sm hover:text-white transition-colors"
            >
              <i className="ri-download-line mr-1"></i>
              Export JSON
            </button>
          </div>

          <div className="divide-y divide-app-border max-h-[600px] overflow-y-auto">
            {songs.map((song) => (
              <div
                key={song.rank}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedSong(song)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-app-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-app-accent-primary font-bold">#{song.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{song.title}</h4>
                    <p className="text-white/60 text-sm">{song.artist}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-white/40">{song.genre}</span>
                      <span className="text-xs text-white/40">{song.releaseDate}</span>
                      {song.processed && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Đã dịch
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingSong(song); }}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(song.rank); }}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {songs.length === 0 && (
              <div className="p-12 text-center text-white/40">
                <i className="ri-music-line text-4xl mb-3"></i>
                <p>Chưa có dữ liệu bài hát</p>
                <p className="text-sm mt-1">Upload file JSON hoặc CSV để bắt đầu</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chỉnh sửa bài hát</h3>
                  <button
                    onClick={() => setEditingSong(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Album Art */}
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Album Art (URL hoặc /images/melon/...)</label>
                    <div className="flex gap-3 items-start">
                      <img
                        src={editingSong.albumArt || "/images/melon/album-placeholder.svg"}
                        alt="album art"
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-app-surface"
                        onError={e => { (e.target as HTMLImageElement).src = "/images/melon/album-placeholder.svg"; }}
                      />
                      <input
                        type="text"
                        value={editingSong.albumArt}
                        onChange={e => setEditingSong({ ...editingSong, albumArt: e.target.value })}
                        placeholder="/images/melon/album-placeholder.svg"
                        className="flex-1 bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Audio */}
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Audio URL (Supabase Storage hoặc URL mp3)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingSong.audioUrl ?? ""}
                        onChange={e => setEditingSong({ ...editingSong, audioUrl: e.target.value })}
                        placeholder="https://... hoặc /audio/melon/song.mp3"
                        className="flex-1 bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white text-sm"
                      />
                      {editingSong.audioUrl && (
                        <button
                          onClick={() => setEditingSong({ ...editingSong, audioUrl: "" })}
                          className="p-3 text-white/40 hover:text-red-400 bg-app-surface border border-app-border rounded-xl"
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      )}
                    </div>
                    {editingSong.audioUrl && (
                      <audio controls src={editingSong.audioUrl} className="w-full mt-2 h-8" />
                    )}
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Title</label>
                    <input
                      type="text"
                      value={editingSong.title}
                      onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Artist</label>
                    <input
                      type="text"
                      value={editingSong.artist}
                      onChange={e => setEditingSong({ ...editingSong, artist: e.target.value })}
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Lyrics (Tiếng Hàn)</label>
                    <textarea
                      value={editingSong.lyrics}
                      onChange={e => setEditingSong({ ...editingSong, lyrics: e.target.value })}
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white min-h-[150px]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Dịch sang tiếng Việt</label>
                    <textarea
                      placeholder="Nhập bản dịch tiếng Việt..."
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white min-h-[100px]"
                    />
                    <p className="text-white/40 text-xs mt-1">Tính năng dịch tự động sẽ được thêm sau</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white/60 text-sm">
                      <input
                        type="checkbox"
                        checked={editingSong.processed}
                        onChange={e => setEditingSong({ ...editingSong, processed: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Đã dịch tiếng Việt
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setEditingSong(null)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedSong && !editingSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chi tiết bài hát</h3>
                  <button
                    onClick={() => setSelectedSong(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-app-accent-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-app-accent-primary text-2xl font-bold">#{selectedSong.rank}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{selectedSong.title}</h4>
                      <p className="text-white/60">{selectedSong.artist}</p>
                      {selectedSong.difficulty && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-app-accent-primary/20 text-app-accent-primary">
                          {selectedSong.difficulty.overall === "easy" ? "Dễ" : selectedSong.difficulty.overall === "medium" ? "Trung bình" : "Khó"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">Genre</p>
                      <p className="text-white font-medium">{selectedSong.genre}</p>
                    </div>
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">Release Date</p>
                      <p className="text-white font-medium">{selectedSong.releaseDate}</p>
                    </div>
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">Album</p>
                      <p className="text-white font-medium">{selectedSong.album || "N/A"}</p>
                    </div>
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">Status</p>
                      <p className={selectedSong.processed ? "text-green-400" : "text-white/60"}>
                        {selectedSong.processed ? "Đã dịch" : "Chưa dịch"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Lyrics</h5>
                    <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto">
                      <pre className="text-white/80 text-sm whitespace-pre-wrap">{selectedSong.lyrics}</pre>
                    </div>
                  </div>

                  {selectedSong.translation && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Bản dịch tiếng Việt</h5>
                      <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto">
                        <p className="text-white/80 text-sm">{selectedSong.translation.full}</p>
                      </div>
                    </div>
                  )}

                  {selectedSong.vocabulary && selectedSong.vocabulary.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Từ vựng ({selectedSong.vocabulary.length})</h5>
                      <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                        {selectedSong.vocabulary.map((vocab, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className="text-white font-medium">{vocab.korean}</span>
                            <span className="text-app-accent-primary">{vocab.romaji}</span>
                            <span className="text-white/60">{vocab.vietnamese}</span>
                            {vocab.topikLevel && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">TOPIK {vocab.topikLevel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSong.grammar && selectedSong.grammar.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Ngữ pháp ({selectedSong.grammar.length})</h5>
                      <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                        {selectedSong.grammar.map((gram, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-white font-medium">{gram.pattern}</span>
                            <span className="text-white/60 ml-2">{gram.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setSelectedSong(null); setEditingSong(selectedSong); }}
                    className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setSelectedSong(null)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminMelonPage;
