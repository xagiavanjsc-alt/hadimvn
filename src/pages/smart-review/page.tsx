import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSmartReview } from "@/hooks/useSmartReview";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function SmartReviewPage() {
  const { user } = useAuth();
  const {
    reviewItems,
    selectedSkill,
    loading,
    getDueItems,
    getWeaknessAreas,
    reviewItem,
    filterBySkill,
    clearFilter,
    getFilteredItems,
    getSkillLabel,
    getSkillIcon,
    getSkillColor,
  } = useSmartReview();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  usePageSEO({
    title: "Smart Review | Hàn Quốc Ơi!",
    description: "Ôn tập thông minh với thuật toán spaced repetition. Tập trung vào kỹ năng yếu và ôn lại đúng thời điểm.",
    keywords: "smart review, spaced repetition, ôn tập thông minh, weakness targeting",
    path: "/smart-review",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Smart Review",
      description: "Smart review system with spaced repetition",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const dueItems = getFilteredItems();
  const weaknessAreas = getWeaknessAreas();
  const currentItem = dueItems[currentIndex];

  const handleAnswer = (success: boolean) => {
    if (currentItem) {
      reviewItem(currentItem.id, success);
    }
    setShowAnswer(false);
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setShowAnswer(false);
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  return (
    <DashboardLayout title="Smart Review" subtitle="Ôn tập thông minh">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{dueItems.length}</p>
            <p className="text-app-text-muted text-xs">Cần ôn tập</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{reviewItems.length}</p>
            <p className="text-app-text-muted text-xs">Tổng số</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {weaknessAreas.filter(w => w.score >= 70).length}
            </p>
            <p className="text-app-text-muted text-xs">Kỹ năng tốt</p>
          </div>
        </div>

        {/* Weakness Areas */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Kỹ năng yếu nhất</h2>
          <div className="space-y-3">
            {weaknessAreas.slice(0, 3).map((area) => (
              <div key={area.skill} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${getSkillColor(area.skill)}15` }}
                >
                  <i className={getSkillIcon(area.skill)} style={{ color: getSkillColor(area.skill) }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium">{getSkillLabel(area.skill)}</p>
                    <p className="text-app-text-muted text-xs">{area.score.toFixed(0)}%</p>
                  </div>
                  <div className="h-2 bg-app-surface/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${area.score}%`,
                        backgroundColor: area.score >= 70 ? "#4ade80" : area.score >= 50 ? "#fbbf24" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Filter */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Lọc theo kỹ năng</h2>
            {selectedSkill && (
              <button
                onClick={clearFilter}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(["vocabulary", "grammar", "listening", "reading"] as const).map((skill) => (
              <button
                key={skill}
                onClick={() => filterBySkill(skill)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedSkill === skill
                    ? "border-app-accent-primary bg-app-accent-primary/10"
                    : "border-app-border hover:border-app-border/50 bg-app-surface/30"
                }`}
              >
                <div className="text-2xl mb-1">
                  <i className={getSkillIcon(skill)} style={{ color: getSkillColor(skill) }} />
                </div>
                <p className="text-white text-xs font-medium">{getSkillLabel(skill)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Review Card */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : dueItems.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-checkbox-circle-line text-4xl text-emerald-400 mb-3" />
            <p className="text-white font-semibold mb-2">Không có bài ôn tập</p>
            <p className="text-app-text-muted text-sm mb-4">Bạn đã hoàn tất tất cả bài ôn tập hiện tại</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Làm lại
            </button>
          </div>
        ) : currentItem ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${getSkillColor(currentItem.type)}15` }}
                >
                  <i
                    className={getSkillIcon(currentItem.type)}
                    style={{ color: getSkillColor(currentItem.type) }}
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{getSkillLabel(currentItem.type)}</p>
                  <p className="text-app-text-muted text-xs">
                    {currentIndex + 1}/{dueItems.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-app-text-muted hover:text-white cursor-pointer"
              >
                <i className="ri-refresh-line" />
              </button>
            </div>

            <div className="bg-app-surface/30 rounded-xl p-6 mb-4">
              <p className="text-white text-2xl font-bold mb-4">{currentItem.content}</p>
              {showAnswer && (
                <div className="border-t border-app-border pt-4">
                  <p className="text-app-text-muted text-sm mb-2">Nghĩa:</p>
                  <p className="text-white text-lg">{currentItem.meaning}</p>
                  <div className="mt-4 flex gap-4 text-xs text-app-text-muted">
                    <span>Đã ôn: {currentItem.reviewCount} lần</span>
                    <span>Tỷ lệ đúng: {(currentItem.successRate * 100).toFixed(0)}%</span>
                    <span>Độ yếu: {(currentItem.weakness * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold cursor-pointer transition-colors"
              >
                Xem đáp án
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-3 rounded-xl bg-rose-500/20 text-rose-400 font-bold cursor-pointer hover:bg-rose-500/30 transition-colors"
                >
                  Sai
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold cursor-pointer hover:bg-emerald-500/30 transition-colors"
                >
                  Đúng
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-3 rounded-xl border border-app-border text-app-text-muted font-bold cursor-pointer hover:bg-app-surface/50 transition-colors"
                >
                  Bỏ qua
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Thuật toán spaced repetition tự động lên lịch ôn tập</li>
            <li>• Tập trung vào kỹ năng yếu nhất để cải thiện nhanh</li>
            <li>• Tăng khoảng cách ôn tập khi trả lời đúng</li>
            <li>• Giảm khoảng cách khi trả lời sai</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
