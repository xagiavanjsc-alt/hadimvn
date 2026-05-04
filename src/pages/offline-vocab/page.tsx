import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface VocabPack {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  wordCount: number;
  size: string;
  icon: string;
  color: string;
  tags: string[];
}

const VOCAB_PACKS: VocabPack[] = [
  { id: "pack-a1", name: "Gói A1 - Cơ bản", description: "101 từ vựng TOPIK I cơ bản nhất, thiết yếu cho người mới bắt đầu", category: "TOPIK I - Cơ bản", level: "A1", wordCount: 101, size: "~45 KB", icon: "ri-seedling-line", color: "emerald", tags: ["TOPIK", "cơ bản", "A1"] },
  { id: "pack-family", name: "Gia đình & Sinh hoạt", description: "91 từ về phòng ốc, đồ dùng, sinh hoạt hàng ngày và việc nhà", category: "Gia đình & Sinh hoạt", level: "A2", wordCount: 91, size: "~40 KB", icon: "ri-home-heart-line", color: "teal", tags: ["gia đình", "sinh hoạt", "nhà cửa"] },
  { id: "pack-emotion", name: "Tính cách & Cảm xúc", description: "47 từ mô tả tính cách, cảm xúc và trạng thái tâm lý", category: "Tính cách & Cảm xúc", level: "A2", wordCount: 47, size: "~22 KB", icon: "ri-emotion-line", color: "pink", tags: ["cảm xúc", "tính cách"] },
  { id: "pack-time", name: "Thời gian & Màu sắc", description: "45 từ về thời gian, ngày tháng, tuần, màu sắc", category: "Thời gian & Màu sắc", level: "A1", wordCount: 45, size: "~20 KB", icon: "ri-time-line", color: "amber", tags: ["thời gian", "màu sắc"] },
  { id: "pack-weather", name: "Thời tiết", description: "41 từ về thời tiết, hiện tượng tự nhiên, thiên tai", category: "Thời tiết", level: "A2", wordCount: 41, size: "~18 KB", icon: "ri-cloud-line", color: "sky", tags: ["thời tiết", "thiên nhiên"] },
  { id: "pack-food", name: "Mua sắm & Ẩm thực", description: "40 từ về mua sắm, đồ uống, vị giác và ăn uống", category: "Mua sắm & Ẩm thực", level: "A2", wordCount: 40, size: "~18 KB", icon: "ri-restaurant-line", color: "orange", tags: ["ẩm thực", "mua sắm"] },
  { id: "pack-jobs", name: "Nghề nghiệp", description: "39 từ về các nghề nghiệp phổ biến trong xã hội Hàn Quốc", category: "직업", level: "B1", wordCount: 39, size: "~17 KB", icon: "ri-briefcase-line", color: "violet", tags: ["nghề nghiệp", "công việc"] },
  { id: "pack-health", name: "Sức khỏe & Y tế", description: "35 từ về bệnh tật, triệu chứng, bệnh viện và điều trị", category: "Sức khỏe", level: "B1", wordCount: 35, size: "~16 KB", icon: "ri-heart-pulse-line", color: "rose", tags: ["sức khỏe", "y tế"] },
  { id: "pack-transport", name: "Giao thông", description: "31 từ về phương tiện, đường sá, biển báo giao thông", category: "Giao thông", level: "A2", wordCount: 31, size: "~14 KB", icon: "ri-bus-line", color: "blue", tags: ["giao thông", "phương tiện"] },
  { id: "pack-verbs", name: "Động từ cơ bản", description: "Các động từ thiết yếu nhất trong tiếng Hàn hàng ngày", category: "Động từ", level: "A1", wordCount: 36, size: "~16 KB", icon: "ri-run-line", color: "green", tags: ["động từ", "cơ bản"] },
  { id: "pack-adj", name: "Tính từ & Trạng từ", description: "Tính từ mô tả và trạng từ thường dùng trong giao tiếp", category: "Tính từ", level: "A2", wordCount: 65, size: "~28 KB", icon: "ri-palette-line", color: "purple", tags: ["tính từ", "trạng từ"] },
  { id: "pack-all", name: "Toàn bộ từ vựng", description: "Tải toàn bộ 811 từ vựng để học offline hoàn toàn", category: "all", level: "A1-C1", wordCount: 811, size: "~360 KB", icon: "ri-database-2-line", color: "yellow", tags: ["tất cả", "đầy đủ"] },
];

interface DownloadState {
  status: "idle" | "downloading" | "done" | "error";
  progress: number;
  wordCount: number;
}

const colorMap: Record<string, { bg: string; text: string; border: string; progress: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-app-accent-success", border: "border-emerald-500/20", progress: "bg-emerald-500" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20", progress: "bg-teal-500" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", progress: "bg-pink-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", progress: "bg-amber-500" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20", progress: "bg-sky-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", progress: "bg-orange-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", progress: "bg-violet-500" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", progress: "bg-rose-500" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", progress: "bg-blue-500" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", progress: "bg-green-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", progress: "bg-purple-500" },
  yellow: { bg: "bg-app-accent-primary/10", text: "text-app-accent-primary", border: "border-app-accent-primary/20", progress: "bg-app-accent-primary" },
};

export default function OfflineVocabPage() {
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});
  const [cachedPacks, setCachedPacks] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalCached, setTotalCached] = useState(0);
  const [storageUsed, setStorageUsed] = useState("0 KB");
  const [previewPack, setPreviewPack] = useState<VocabPack | null>(null);
  const [previewWords, setPreviewWords] = useState<{ korean: string; vietnamese: string; category: string }[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    checkCachedPacks();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkCachedPacks = async () => {
    try {
      const cached = new Set<string>();
      let totalWords = 0;
      for (const pack of VOCAB_PACKS) {
        const key = `offline-vocab-${pack.id}`;
        const data = localStorage.getItem(key);
        if (data) {
          cached.add(pack.id);
          try {
            const parsed = JSON.parse(data);
            totalWords += parsed.length || 0;
          } catch { /* ignore */ }
        }
      }
      setCachedPacks(cached);
      setTotalCached(totalWords);
      const bytes = new Blob([JSON.stringify(localStorage)]).size;
      setStorageUsed(bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);
    } catch { /* ignore */ }
  };

  const downloadPack = useCallback(async (pack: VocabPack) => {
    if (!isOnline) return;
    setDownloads(prev => ({ ...prev, [pack.id]: { status: "downloading", progress: 0, wordCount: 0 } }));

    try {
      let query = supabase.from("hanja_vocab_entries").select("korean,hanja,vietnamese,pronunciation,category,difficulty,examples");
      if (pack.category !== "all") {
        query = query.eq("category", pack.category);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloads(prev => {
          const current = prev[pack.id];
          if (!current || current.progress >= 90) { clearInterval(progressInterval); return prev; }
          return { ...prev, [pack.id]: { ...current, progress: current.progress + 15 } };
        });
      }, 200);

      const { data, error } = await query;
      clearInterval(progressInterval);

      if (error) throw error;

      const words = data || [];
      localStorage.setItem(`offline-vocab-${pack.id}`, JSON.stringify(words));
      localStorage.setItem(`offline-vocab-${pack.id}-meta`, JSON.stringify({ downloadedAt: new Date().toISOString(), count: words.length }));

      // Also cache via Service Worker if available
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CACHE_VOCAB",
          key: pack.id,
          data: words,
        });
      }

      setDownloads(prev => ({ ...prev, [pack.id]: { status: "done", progress: 100, wordCount: words.length } }));
      setCachedPacks(prev => new Set([...prev, pack.id]));
      setTotalCached(prev => prev + words.length);
      checkCachedPacks();
    } catch {
      setDownloads(prev => ({ ...prev, [pack.id]: { status: "error", progress: 0, wordCount: 0 } }));
    }
  }, [isOnline]);

  const deletePack = (pack: VocabPack) => {
    localStorage.removeItem(`offline-vocab-${pack.id}`);
    localStorage.removeItem(`offline-vocab-${pack.id}-meta`);
    setCachedPacks(prev => { const next = new Set(prev); next.delete(pack.id); return next; });
    setDownloads(prev => { const next = { ...prev }; delete next[pack.id]; return next; });
    checkCachedPacks();
  };

  const previewPackWords = async (pack: VocabPack) => {
    setPreviewPack(pack);
    const cached = localStorage.getItem(`offline-vocab-${pack.id}`);
    if (cached) {
      try {
        const words = JSON.parse(cached).slice(0, 10);
        setPreviewWords(words);
        return;
      } catch { /* ignore */ }
    }
    if (isOnline) {
      let query = supabase.from("hanja_vocab_entries").select("korean,vietnamese,category").limit(10);
      if (pack.category !== "all") query = query.eq("category", pack.category);
      const { data } = await query;
      setPreviewWords(data || []);
    }
  };

  const levelColor: Record<string, string> = {
    "A1": "text-app-accent-success",
    "A2": "text-teal-400",
    "B1": "text-amber-400",
    "B2": "text-orange-400",
    "A1-C1": "text-app-accent-primary",
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gói Từ Vựng Offline</h1>
            <p className="text-white/50 text-sm mt-1">Tải từ vựng để học không cần kết nối internet</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isOnline ? "bg-app-accent-success/15 text-app-accent-success" : "bg-rose-500/15 text-rose-400"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`}></div>
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{cachedPacks.size}</p>
            <p className="text-app-text-secondary text-xs mt-0.5">Gói đã tải</p>
          </div>
          <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border text-center">
            <p className="text-2xl font-bold text-app-accent-success">{totalCached}</p>
            <p className="text-app-text-secondary text-xs mt-0.5">Từ offline</p>
          </div>
          <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border text-center">
            <p className="text-2xl font-bold text-white/70">{storageUsed}</p>
            <p className="text-app-text-secondary text-xs mt-0.5">Dung lượng</p>
          </div>
        </div>

        {!isOnline && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <i className="ri-wifi-off-line text-amber-400 text-lg mt-0.5"></i>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Đang offline</p>
              <p className="text-white/50 text-xs mt-0.5">Bạn chỉ có thể học các gói đã tải. Kết nối internet để tải thêm gói mới.</p>
            </div>
          </div>
        )}

        {/* Pack grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOCAB_PACKS.map(pack => {
            const dl = downloads[pack.id];
            const isCached = cachedPacks.has(pack.id);
            const colors = colorMap[pack.color] || colorMap.yellow;
            const meta = (() => {
              try { return JSON.parse(localStorage.getItem(`offline-vocab-${pack.id}-meta`) || "null"); } catch { return null; }
            })();

            return (
              <div key={pack.id} className={`bg-[#1a1f2e] rounded-xl p-5 border transition-all ${isCached ? `${colors.border} border` : "border-app-border"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${pack.icon} ${colors.text} text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold text-sm">{pack.name}</h3>
                      {isCached && <i className="ri-checkbox-circle-line text-app-accent-success text-sm"></i>}
                    </div>
                    <p className="text-app-text-secondary text-xs mb-2 line-clamp-2">{pack.description}</p>
                    <div className="flex items-center gap-3 text-xs text-app-text-muted">
                      <span className={`font-semibold ${levelColor[pack.level] || "text-white/50"}`}>{pack.level}</span>
                      <span><i className="ri-translate-2 mr-0.5"></i>{pack.wordCount} từ</span>
                      <span><i className="ri-hard-drive-2-line mr-0.5"></i>{pack.size}</span>
                    </div>
                    {meta && (
                      <p className="text-app-text-muted text-[10px] mt-1">
                        Đã tải: {new Date(meta.downloadedAt).toLocaleDateString("vi-VN")} · {meta.count} từ
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {dl?.status === "downloading" && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.progress} rounded-full transition-all duration-300`} style={{ width: `${dl.progress}%` }}></div>
                    </div>
                    <p className="text-app-text-muted text-xs mt-1">Đang tải... {dl.progress}%</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => previewPackWords(pack)}
                    className="px-3 py-1.5 rounded-lg bg-app-card/50 text-app-text-secondary text-xs hover:bg-app-card/70 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-eye-line mr-1"></i>
                    Xem trước
                  </button>
                  {isCached ? (
                    <>
                      <button
                        onClick={() => downloadPack(pack)}
                        disabled={!isOnline || dl?.status === "downloading"}
                        className="flex-1 py-1.5 rounded-lg bg-app-card/50 text-app-text-secondary text-xs hover:bg-app-card/70 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
                      >
                        <i className="ri-refresh-line mr-1"></i>
                        Cập nhật
                      </button>
                      <button
                        onClick={() => deletePack(pack)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs hover:bg-rose-500/20 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        Xóa
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => downloadPack(pack)}
                      disabled={!isOnline || dl?.status === "downloading"}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 ${colors.bg} ${colors.text} hover:opacity-80`}
                    >
                      {dl?.status === "downloading" ? (
                        <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block mr-1"></div>Đang tải...</>
                      ) : (
                        <><i className="ri-download-line mr-1"></i>Tải xuống</>
                      )}
                    </button>
                  )}
                </div>

                {dl?.status === "error" && (
                  <p className="text-rose-400 text-xs mt-2"><i className="ri-error-warning-line mr-1"></i>Lỗi tải. Thử lại.</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Preview modal */}
        {previewPack && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewPack(null)}>
            <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-app-border w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">{previewPack.name}</h3>
                <button onClick={() => setPreviewPack(null)} className="text-app-text-secondary hover:text-white/70 cursor-pointer"><i className="ri-close-line text-lg"></i></button>
              </div>
              <p className="text-app-text-secondary text-xs mb-4">10 từ đầu tiên trong gói:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {previewWords.map((w, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-app-border">
                    <span className="text-white font-medium text-sm">{w.korean}</span>
                    <span className="text-white/50 text-xs">{w.vietnamese}</span>
                  </div>
                ))}
                {previewWords.length === 0 && <p className="text-app-text-muted text-sm text-center py-4">Đang tải...</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setPreviewPack(null)} className="flex-1 py-2 rounded-lg bg-white/8 text-white/50 text-sm cursor-pointer whitespace-nowrap">Đóng</button>
                {!cachedPacks.has(previewPack.id) && (
                  <button
                    onClick={() => { downloadPack(previewPack); setPreviewPack(null); }}
                    disabled={!isOnline}
                    className="flex-1 py-2 rounded-lg bg-app-accent-primary text-black text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-40"
                  >
                    <i className="ri-download-line mr-1.5"></i>Tải xuống
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-[#1a1f2e] rounded-xl p-5 border border-app-border">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary"></i>
            Cách hoạt động
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "ri-download-cloud-line", title: "1. Tải gói", desc: "Chọn gói từ vựng và tải về thiết bị khi có mạng" },
              { icon: "ri-wifi-off-line", title: "2. Học offline", desc: "Mở app không cần mạng, từ vựng đã lưu sẵn trong thiết bị" },
              { icon: "ri-refresh-line", title: "3. Đồng bộ", desc: "Khi có mạng trở lại, tiến độ học tự động đồng bộ lên cloud" },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-app-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-app-accent-primary text-sm`}></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-semibold">{item.title}</p>
                  <p className="text-app-text-secondary text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

