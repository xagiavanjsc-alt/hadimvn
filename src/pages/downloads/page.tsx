import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useDownloads } from "@/hooks/useDownloads";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function DownloadsPage() {
  const { user } = useAuth();
  const {
    downloads,
    selectedCategory,
    loading,
    filterByCategory,
    clearFilter,
    getFilteredDownloads,
    getCategoryLabel,
    getCategoryIcon,
    getCategoryColor,
    getFileTypeIcon,
    getFileTypeColor,
  } = useDownloads();

  usePageSEO({
    title: "Tài liệu tải về | Hàn Quốc Ơi!",
    description: "Tải xuống biểu mẫu hồ sơ EPS-TOPIK, tài liệu hướng dẫn, từ vựng quan trọng. Miễn phí và cập nhật liên tục.",
    keywords: "tải tài liệu EPS, biểu mẫu hồ sơ, hướng dẫn XKLĐ, tài liệu học tiếng Hàn",
    path: "/downloads",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Tài liệu tải về",
      description: "Downloadable resources for EPS-TOPIK",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const filteredDownloads = getFilteredDownloads();

  const handleDownload = (item: any) => {
    // In production, this would trigger actual download
    console.log("Downloading:", item.title);
  };

  return (
    <DashboardLayout title="Tài liệu" subtitle="Tải xuống tài liệu học tập">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{downloads.length}</p>
            <p className="text-app-text-muted text-xs">Tài liệu</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {downloads.reduce((sum, d) => sum + d.downloadCount, 0).toLocaleString()}
            </p>
            <p className="text-app-text-muted text-xs">Lượt tải</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">
              {new Set(downloads.map(d => d.category)).size}
            </p>
            <p className="text-app-text-muted text-xs">Danh mục</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Lọc theo danh mục</h2>
            {selectedCategory && (
              <button
                onClick={clearFilter}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(["form", "guide", "material", "template"] as const).map((category) => (
              <button
                key={category}
                onClick={() => filterByCategory(category)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedCategory === category
                    ? "border-app-accent-primary bg-app-accent-primary/10"
                    : "border-app-border hover:border-app-border/50 bg-app-surface/30"
                }`}
              >
                <div className="text-2xl mb-1">
                  <i
                    className={getCategoryIcon(category)}
                    style={{ color: getCategoryColor(category) }}
                  />
                </div>
                <p className="text-white text-xs font-medium">{getCategoryLabel(category)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Downloads List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredDownloads.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-folder-open-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Không có tài liệu</p>
            <p className="text-app-text-muted text-sm mb-4">Chưa có tài liệu cho danh mục này</p>
            <button
              onClick={clearFilter}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDownloads.map((item) => (
              <div
                key={item.id}
                className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${getFileTypeColor(item.fileType)}15` }}
                    >
                      <i
                        className={getFileTypeIcon(item.fileType)}
                        style={{ color: getFileTypeColor(item.fileType) }}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <p className="text-app-text-muted text-sm">{item.description}</p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getCategoryColor(item.category)}20`,
                      color: getCategoryColor(item.category),
                    }}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-app-text-muted">
                    <span className="flex items-center gap-1">
                      <i className="ri-file-line" />
                      {item.fileSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-download-line" />
                      {item.downloadCount.toLocaleString()} lượt
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line" />
                      {item.updatedAt}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload(item)}
                    className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <i className="ri-download-line" />
                    Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Tất cả tài liệu đều miễn phí</li>
            <li>• Cập nhật định kỳ theo quy định mới</li>
            <li>• Tài liệu được kiểm duyệt bởi đội ngũ chuyên môn</li>
            <li>• Nếu tài liệu lỗi, vui lòng liên hệ hỗ trợ</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
