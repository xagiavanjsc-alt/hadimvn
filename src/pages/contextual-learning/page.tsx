import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useContextualLearning } from "@/hooks/useContextualLearning";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function ContextualLearningPage() {
  const { user } = useAuth();
  const {
    vocabularies,
    contextTags,
    selectedContext,
    loading,
    filterByContext,
    clearFilter,
    getFilteredVocabularies,
    getContextTag,
    getDifficultyLabel,
    getDifficultyColor,
  } = useContextualLearning();
  const [selectedVocab, setSelectedVocab] = useState<string | null>(null);

  usePageSEO({
    title: "Học theo ngữ cảnh | Hàn Quốc Ơi!",
    description: "Học từ vựng tiếng Hàn theo ngữ cảnh thực tế EPS: nhà máy, nông trại, xây dựng, an toàn lao động, phỏng vấn.",
    keywords: "học theo ngữ cảnh, contextual learning, từ vựng EPS, tình huống thực tế",
    path: "/contextual-learning",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Học theo ngữ cảnh",
      description: "Contextual vocabulary learning for EPS workers",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const filteredVocabularies = getFilteredVocabularies();

  const handleVocabClick = (vocabId: string) => {
    setSelectedVocab(vocabId);
  };

  return (
    <DashboardLayout title="Học theo ngữ cảnh" subtitle="Từ vựng theo tình huống thực tế EPS">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{vocabularies.length}</p>
            <p className="text-app-text-muted text-xs">Từ vựng</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{contextTags.length}</p>
            <p className="text-app-text-muted text-xs">Ngữ cảnh</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{filteredVocabularies.length}</p>
            <p className="text-app-text-muted text-xs">Đang hiển thị</p>
          </div>
        </div>

        {/* Context Filter */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Lọc theo ngữ cảnh</h2>
            {selectedContext && (
              <button
                onClick={clearFilter}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {contextTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => filterByContext(tag.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedContext === tag.id
                    ? "border-app-accent-primary bg-app-accent-primary/10"
                    : "border-app-border hover:border-app-border/50 bg-app-surface/30"
                }`}
              >
                <div className="text-3xl mb-2">
                  <i className={tag.icon} style={{ color: tag.color }} />
                </div>
                <p className="text-white text-sm font-medium">{tag.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Vocabulary List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredVocabularies.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-book-open-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Không tìm thấy từ vựng</p>
            <p className="text-app-text-muted text-sm mb-4">Thử thay đổi bộ lọc hoặc xóa bộ lọc hiện tại</p>
            <button
              onClick={clearFilter}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Từ vựng</h2>
            <div className="space-y-3">
              {filteredVocabularies.map((vocab) => {
                const contextTag = getContextTag(vocab.context);
                return (
                  <div
                    key={vocab.id}
                    onClick={() => handleVocabClick(vocab.id)}
                    className="bg-app-surface/30 rounded-xl p-4 cursor-pointer hover:bg-app-surface/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white text-lg font-bold">{vocab.word}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${getDifficultyColor(vocab.difficulty)}15`,
                            color: getDifficultyColor(vocab.difficulty),
                          }}
                        >
                          {getDifficultyLabel(vocab.difficulty)}
                        </span>
                      </div>
                      {contextTag && (
                        <div className="flex items-center gap-1">
                          <i className={contextTag.icon} style={{ color: contextTag.color }} />
                          <span className="text-xs text-app-text-muted">{contextTag.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-app-text-muted text-sm mb-1">{vocab.meaning}</p>
                    <p className="text-app-text-faint text-xs mb-2">{vocab.pronunciation}</p>
                    <div className="bg-app-surface/50 rounded-lg p-3">
                      <p className="text-white text-sm mb-1">{vocab.example}</p>
                      <p className="text-app-text-muted text-xs">{vocab.translation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vocabulary Detail Modal */}
        {selectedVocab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
              className="w-full max-w-md rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
            >
              <div className="p-5 border-b border-app-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">
                    {vocabularies.find(v => v.id === selectedVocab)?.word}
                  </h3>
                  <button
                    onClick={() => setSelectedVocab(null)}
                    className="text-app-text-muted hover:text-white cursor-pointer"
                  >
                    <i className="ri-close-line text-xl" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {vocabularies.find(v => v.id === selectedVocab) && (
                  <>
                    <div>
                      <p className="text-app-text-muted text-xs mb-1">Nghĩa</p>
                      <p className="text-white text-lg font-medium">
                        {vocabularies.find(v => v.id === selectedVocab)?.meaning}
                      </p>
                    </div>

                    <div>
                      <p className="text-app-text-muted text-xs mb-1">Phát âm</p>
                      <p className="text-white text-sm">
                        {vocabularies.find(v => v.id === selectedVocab)?.pronunciation}
                      </p>
                    </div>

                    <div>
                      <p className="text-app-text-muted text-xs mb-1">Ví dụ</p>
                      <div className="bg-app-surface/50 rounded-lg p-3">
                        <p className="text-white text-sm mb-1">
                          {vocabularies.find(v => v.id === selectedVocab)?.example}
                        </p>
                        <p className="text-app-text-muted text-xs">
                          {vocabularies.find(v => v.id === selectedVocab)?.translation}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-app-text-muted text-xs mb-1">Ngữ cảnh</p>
                      <div className="flex flex-wrap gap-2">
                        {vocabularies.find(v => v.id === selectedVocab)?.tags.map((tagId) => {
                          const tag = getContextTag(tagId);
                          return tag ? (
                            <span
                              key={tagId}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: `${tag.color}15`,
                                color: tag.color,
                              }}
                            >
                              <i className={`${tag.icon} mr-1`} />
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
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
            <li>• Học từ vựng theo ngữ cảnh thực tế công việc EPS</li>
            <li>• Các tình huống: nhà máy, nông trại, xây dựng, an toàn lao động, phỏng vấn</li>
            <li>• Ví dụ câu thực tế để dễ nhớ và áp dụng</li>
            <li>• Lọc theo ngữ cảnh để tập trung vào lĩnh vực cần thiết</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
