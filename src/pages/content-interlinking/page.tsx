import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useContentInterlinking } from "@/hooks/useContentInterlinking";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function ContentInterlinkingPage() {
  const { user } = useAuth();
  const {
    tags,
    selectedTags,
    relatedLessons,
    loading,
    toggleTag,
    clearTags,
    getFilteredLessons,
    getTag,
    getCategoryTags,
    getCategoryLabel,
    getTypeLabel,
    getTypeIcon,
    getTypeColor,
  } = useContentInterlinking();

  usePageSEO({
    title: "Liên kết nội dung | Hàn Quốc Ơi!",
    description: "Khám phá nội dung liên quan qua tag system. Tìm bài học, từ vựng, ngữ pháp liên quan đến chủ đề bạn quan tâm.",
    keywords: "liên kết nội dung, content interlinking, tag system, related lessons",
    path: "/content-interlinking",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Liên kết nội dung",
      description: "Content interlinking with tag system",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const filteredLessons = getFilteredLessons();

  return (
    <DashboardLayout title="Liên kết nội dung" subtitle="Khám phá nội dung liên quan">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{tags.length}</p>
            <p className="text-app-text-muted text-xs">Tags</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{relatedLessons.length}</p>
            <p className="text-app-text-muted text-xs">Bài học liên quan</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{filteredLessons.length}</p>
            <p className="text-app-text-muted text-xs">Đang hiển thị</p>
          </div>
        </div>

        {/* Tags by Category */}
        {(["topic", "difficulty", "grammar", "skill"] as const).map((category) => (
          <div key={category} className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">{getCategoryLabel(category)}</h2>
            <div className="flex flex-wrap gap-2">
              {getCategoryTags(category).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "border-2"
                      : "border border-app-border"
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : `${tag.color}10`,
                    borderColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                    color: tag.color,
                  }}
                >
                  {tag.name} ({tag.count})
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Tags đã chọn ({selectedTags.length})</h2>
              <button
                onClick={clearTags}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagId) => {
                const tag = getTag(tagId);
                return tag ? (
                  <span
                    key={tagId}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                    <button
                      onClick={() => toggleTag(tagId)}
                      className="hover:text-white cursor-pointer"
                    >
                      <i className="ri-close-line" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Related Lessons */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-book-open-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Không tìm thấy nội dung</p>
            <p className="text-app-text-muted text-sm mb-4">Thử chọn tags khác hoặc xóa bộ lọc hiện tại</p>
            <button
              onClick={clearTags}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Nội dung liên quan</h2>
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-app-surface/30 rounded-xl p-4 hover:bg-app-surface/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${getTypeColor(lesson.type)}15` }}
                      >
                        <i
                          className={getTypeIcon(lesson.type)}
                          style={{ color: getTypeColor(lesson.type) }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-medium">{lesson.title}</h3>
                        <p className="text-app-text-muted text-xs">{getTypeLabel(lesson.type)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-app-accent-primary text-sm font-bold">
                        {(lesson.relevance * 100).toFixed(0)}%
                      </p>
                      <p className="text-app-text-muted text-xs">Liên quan</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lesson.tags.map((tagId) => {
                      const tag = getTag(tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Tag system giúp liên kết nội dung theo chủ đề, độ khó, ngữ pháp, kỹ năng</li>
            <li>• Chọn nhiều tags để tìm nội dung liên quan</li>
            <li>• Điểm liên quan (%) cho biết mức độ phù hợp</li>
            <li>• Dễ dàng khám phá nội dung mới từ nội dung đã học</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
