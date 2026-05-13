import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface OfflineContent {
  id: string;
  title: string;
  category: string;
  size: string;
  downloaded: boolean;
  lastUpdated?: string;
}

const OFFLINE_CONTENT: OfflineContent[] = [
  {
    id: "vocab",
    title: "Từ vựng",
    category: "Tài liệu",
    size: "~2MB",
    downloaded: false
  },
  {
    id: "flashcard",
    title: "Flashcard",
    category: "Tài liệu",
    size: "~1MB",
    downloaded: false
  },
  {
    id: "grammar",
    title: "Ngữ pháp",
    category: "Tài liệu",
    size: "~1.5MB",
    downloaded: false
  },
  {
    id: "eps-vocab",
    title: "EPS-TOPIK Từ vựng",
    category: "EPS-TOPIK",
    size: "~3MB",
    downloaded: false
  },
  {
    id: "eps-quiz",
    title: "EPS-TOPIK Quiz",
    category: "EPS-TOPIK",
    size: "~2MB",
    downloaded: false
  },
  {
    id: "hanja",
    title: "Hán tự",
    category: "Tài liệu",
    size: "~4MB",
    downloaded: false
  },
  {
    id: "shadowing",
    title: "Shadowing Practice",
    category: "Luyện tập",
    size: "~5MB",
    downloaded: false
  },
  {
    id: "dictation",
    title: "Listening Dictation",
    category: "Luyện tập",
    size: "~3MB",
    downloaded: false
  },
  {
    id: "handwriting",
    title: "Handwriting Practice",
    category: "Luyện tập",
    size: "~2MB",
    downloaded: false
  },
  {
    id: "cultural",
    title: "Cultural Content",
    category: "Văn hóa",
    size: "~2MB",
    downloaded: false
  }
];

export default function OfflineManagerPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [cachedContent, setCachedContent] = useState<Set<string>>(new Set());
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    // Check cached content from service worker
    checkCachedContent();
    checkStorage();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkCachedContent = useCallback(async () => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      const cached = new Set<string>();
      
      // Check which content is cached based on cache names
      cacheNames.forEach(name => {
        if (name.includes("vocab")) cached.add("vocab");
        if (name.includes("flashcard")) cached.add("flashcard");
        if (name.includes("grammar")) cached.add("grammar");
        if (name.includes("eps")) cached.add("eps-vocab");
        if (name.includes("hanja")) cached.add("hanja");
      });
      
      setCachedContent(cached);
    }
  }, []);

  const checkStorage = useCallback(async () => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      setStorageUsed(estimate.usage || 0);
      setStorageQuota(estimate.quota || 0);
    }
  }, []);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }, []);

  const downloadContent = useCallback(async (contentId: string) => {
    if (!isOnline) {
      alert("Bạn cần kết nối internet để tải nội dung");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(prev => ({ ...prev, [contentId]: 0 }));

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Cache the content via service worker
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "CACHE_VOCAB",
            key: contentId,
            data: { id: contentId, cached: true }
          });
        }

        setCachedContent(prev => new Set([...prev, contentId]));
        setIsDownloading(false);
      }
      setDownloadProgress(prev => ({ ...prev, [contentId]: progress }));
    }, 200);
  }, [isOnline]);

  const deleteContent = useCallback(async (contentId: string) => {
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          if (name.includes(contentId)) {
            await caches.delete(name);
          }
        }
        setCachedContent(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
        checkStorage();
      } catch (error) {
        console.error("Error deleting cache:", error);
      }
    }
  }, [checkStorage]);

  const clearAllCache = useCallback(async () => {
    if (!confirm("Bạn có chắc muốn xóa tất cả nội dung offline?")) return;

    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setCachedContent(new Set());
        checkStorage();
      } catch (error) {
        console.error("Error clearing cache:", error);
      }
    }
  }, [checkStorage]);

  const categoryColors = {
    "Tài liệu": "#34d399",
    "EPS-TOPIK": "#f59e0b",
    "Luyện tập": "#8b5cf6",
    "Văn hóa": "#ec4899"
  };

  return (
    <DashboardLayout title="Offline Manager" subtitle="Quản lý nội dung offline">
      {/* Online Status */}
      <div className={`mb-6 p-4 rounded-xl ${isOnline ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
        <div className="flex items-center gap-3">
          <i className={`ri-${isOnline ? "wifi-line" : "wifi-off-line"} text-2xl ${isOnline ? "text-emerald-400" : "text-rose-400"}`} />
          <div>
            <p className="text-white font-bold">
              {isOnline ? "Đang online" : "Đang offline"}
            </p>
            <p className="text-app-text-faint text-sm">
              {isOnline ? "Bạn có thể tải và cập nhật nội dung" : "Chỉ có thể sử dụng nội dung đã tải"}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-app-card border border-app-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">Dung lượng lưu trữ</h3>
          <span className="text-app-text-secondary text-sm">
            {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
          </span>
        </div>
        <div className="w-full bg-app-card2 rounded-full h-2">
          <div 
            className="bg-app-accent-primary h-2 rounded-full transition-all"
            style={{ width: `${storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0}%` }}
          />
        </div>
        <button
          onClick={clearAllCache}
          className="mt-3 text-rose-400 text-sm hover:text-rose-300 cursor-pointer"
        >
          Xóa tất cả cache
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {OFFLINE_CONTENT.map((content) => {
          const isDownloaded = cachedContent.has(content.id);
          const progress = downloadProgress[content.id] || 0;

          return (
            <div
              key={content.id}
              className="bg-app-card border border-app-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${categoryColors[content.category as keyof typeof categoryColors]}20` }}
                  >
                    <i className="ri-download-2-line text-lg" style={{ color: categoryColors[content.category as keyof typeof categoryColors] }} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{content.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-app-text-faint">
                      <span>{content.category}</span>
                      <span>•</span>
                      <span>{content.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloaded ? (
                    <button
                      onClick={() => deleteContent(content.id)}
                      disabled={isDownloading}
                      className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-medium cursor-pointer hover:bg-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xóa
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadContent(content.id)}
                      disabled={!isOnline || isDownloading}
                      className="px-4 py-2 rounded-lg bg-app-accent-primary text-white text-sm font-medium cursor-pointer hover:bg-app-accent-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {progress > 0 && progress < 100 ? `${Math.round(progress)}%` : "Tải"}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {progress > 0 && progress < 100 && (
                <div className="mt-3">
                  <div className="w-full bg-app-card2 rounded-full h-2">
                    <div 
                      className="bg-app-accent-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Downloaded Status */}
              {isDownloaded && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs">
                  <i className="ri-check-line" />
                  <span>Đã tải offline</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-app-card2 rounded-xl p-4">
        <h3 className="text-white font-bold mb-2">Tips:</h3>
        <ul className="space-y-1 text-app-text-secondary text-sm">
          <li>• Tải nội dung khi có wifi để tiết kiệm data</li>
          <li>• Nội dung offline sẽ tự động cập nhật khi online</li>
          <li>• Xóa cache khi cần giải phóng dung lượng</li>
          <li>• PWA có thể cài trên điện thoại để học mọi lúc mọi nơi</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
