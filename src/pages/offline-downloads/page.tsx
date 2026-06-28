import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineDownloads } from "@/hooks/useOfflineDownloads";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";
import { epsLessons } from "@/mocks/epsLessons";

export default function OfflineDownloadsPage() {
  const { user } = useAuth();
  const {
    lessons,
    totalSize,
    isDownloading,
    isOnline,
    downloadLesson,
    removeLesson,
    isLessonDownloaded,
    clearAll,
  } = useOfflineDownloads();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  usePageSEO({
    title: "Tải xuống Offline | Hàn Quốc Ơi!",
    description: "Tải xuống bài học EPS để học khi không có internet. Học offline mọi lúc mọi nơi.",
    keywords: "tải offline, học offline, download bài học EPS",
    path: "/offline-downloads",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Tải xuống Offline",
      description: "Download lessons for offline study",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const handleDownload = async (lessonId: number, lessonTitle: string) => {
    if (!user) return;
    await downloadLesson(lessonId, lessonTitle);
  };

  const formatSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const availableLessons = epsLessons.slice(0, 60); // First 60 lessons

  return (
    <DashboardLayout title="Tải xuống Offline" subtitle="Học mọi lúc mọi nơi">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Connection Status */}
        <div className={`rounded-2xl p-4 border ${
          isOnline
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-rose-500/10 border-rose-500/20"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-400"}`} />
            <p className={`text-sm font-semibold ${isOnline ? "text-emerald-400" : "text-rose-400"}`}>
              {isOnline ? "Đang online - Có thể tải xuống" : "Đang offline - Chỉ học bài đã tải"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-bold">Kho lưu trữ</h2>
            {lessons.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-app-surface/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{lessons.length}</p>
              <p className="text-app-text-muted text-xs">Bài đã tải</p>
            </div>
            <div className="bg-app-surface/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-app-accent-primary">{formatSize(totalSize)}</p>
              <p className="text-app-text-muted text-xs">Dung lượng</p>
            </div>
            <div className="bg-app-surface/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{availableLessons.length}</p>
              <p className="text-app-text-muted text-xs">Tổng bài học</p>
            </div>
          </div>
        </div>

        {/* Downloaded Lessons */}
        {lessons.length > 0 && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3">Bài đã tải xuống</h3>
            <div className="space-y-2">
              {lessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between bg-app-surface/30 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{lesson.title}</p>
                    <p className="text-app-text-muted text-xs">
                      {formatSize(lesson.size)} • {new Date(lesson.downloadedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeLesson(lesson.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Lessons */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">
            Bài học có sẵn ({availableLessons.length})
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableLessons.map(lesson => {
              const isDownloaded = isLessonDownloaded(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between bg-app-surface/30 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      Bài {lesson.id}: {lesson.title}
                    </p>
                    <p className="text-app-text-muted text-xs">
                      {isDownloaded ? "Đã tải" : "Chưa tải"}
                    </p>
                  </div>
                  {isDownloaded ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <i className="ri-check-line" />
                      <span>Đã tải</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(lesson.id, `Bài ${lesson.id}: ${lesson.title}`)}
                      disabled={!isOnline || isDownloading}
                      className="px-3 py-1.5 rounded-lg bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? "Đang tải..." : "Tải xuống"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Bài học tải xuống sẽ được lưu trên thiết bị của bạn</li>
            <li>• Bạn có thể học offline ngay cả khi không có internet</li>
            <li>• Dung lượng ước tính: 1-5 MB cho mỗi bài học</li>
            <li>• Xóa bài học để giải phóng dung lượng khi cần</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
