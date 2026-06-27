import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useEpsVocab } from "@/contexts/EpsVocabContext";
import { useSRS } from "@/hooks/useSRS";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

const DAILY_LIMIT = 20;

export default function VocabReviewPage() {
  const { items } = useEpsVocab();
  const { dueItems, reviewItem, resetItem, getItemStats, getOverallStats } = useSRS(items, "eps_vocab_srs");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const stats = getOverallStats();
  const currentItem = dueItems[currentIndex];
  const currentItemStats = currentItem ? getItemStats(currentItem.id) : null;

  usePageSEO({
    title: "Ôn tập từ vựng EPS-TOPIK với Spaced Repetition | Hàn Quốc Ơi!",
    description: "Ôn tập từ vựng EPS-TOPIK hiệu quả với thuật toán Spaced Repetition (SRS). Tự động lên lịch review dựa trên khả năng ghi nhớ của bạn.",
    keywords: "ôn tập từ vựng, spaced repetition, SRS, EPS-TOPIK vocabulary, flashcard",
    path: "/vocab-review",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Ôn tập từ vựng EPS-TOPIK với Spaced Repetition",
      description: "Hệ thống ôn tập từ vựng thông minh dựa trên thuật toán SM-2",
      educationalLevel: "EPS-TOPIK",
      learningResourceType: "Flashcard",
      inLanguage: ["vi", "ko"],
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const handleRate = useCallback((quality: number) => {
    if (!currentItem) return;
    
    reviewItem(currentItem.id, quality);
    setFlipped(false);
    
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowStats(true);
    }
  }, [currentItem, currentIndex, dueItems.length, reviewItem]);

  const handleReset = useCallback(() => {
    if (!currentItem) return;
    resetItem(currentItem.id);
  }, [currentItem, resetItem]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setShowStats(false);
  }, []);

  if (showStats) {
    return (
      <DashboardLayout title="Hoàn thành ôn tập" subtitle={`Đã review ${dueItems.length} từ`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-app-accent-primary/10 mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-app-accent-primary text-4xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Hoàn thành!</h2>
            <p className="text-app-text-muted text-sm mb-6">Bạn đã hoàn thành phiên ôn tập hôm nay</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-app-surface/50 rounded-xl p-4">
                <p className="text-app-text-muted text-xs mb-1">Tổng từ vựng</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-4">
                <p className="text-app-text-muted text-xs mb-1">Đã review</p>
                <p className="text-white text-2xl font-bold">{stats.reviewed}</p>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-4">
                <p className="text-app-text-muted text-xs mb-1">Cần ôn tập</p>
                <p className="text-white text-2xl font-bold">{stats.due}</p>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-4">
                <p className="text-app-text-muted text-xs mb-1">Đã thuộc</p>
                <p className="text-white text-2xl font-bold">{stats.mastered}</p>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer"
            >
              <i className="ri-refresh-line mr-2"></i>Ôn tập tiếp
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (dueItems.length === 0) {
    return (
      <DashboardLayout title="Ôn tập từ vựng" subtitle="Không có từ cần ôn tập">
        <div className="max-w-2xl mx-auto">
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-app-accent-primary/10 mx-auto mb-4">
              <i className="ri-check-double-line text-app-accent-primary text-4xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Tuyệt vời!</h2>
            <p className="text-app-text-muted text-sm mb-6">Bạn không có từ vựng nào cần ôn tập ngay bây giờ</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-app-surface/50 rounded-xl p-4">
                <p className="text-app-text-muted text-xs mb-1">Tổng từ vựng</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-4">
                <p className="text-app-text-muted text-xs mb-1">Đã thuộc</p>
                <p className="text-white text-2xl font-bold">{stats.mastered}</p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = "/eps-lessons"}
              className="w-full py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer"
            >
              <i className="ri-book-open-line mr-2"></i>Học từ vựng mới
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = ((currentIndex + 1) / dueItems.length) * 100;

  return (
    <DashboardLayout
      title="Ôn tập từ vựng"
      subtitle={`${currentIndex + 1}/${dueItems.length} · ${dueItems.length - currentIndex - 1} còn lại`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress bar */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-app-text-muted text-xs">Tiến độ</span>
            <span className="text-app-text-muted text-xs">{Math.round(progress)}%</span>
          </div>
          <div className="bg-app-card/50 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "#e8c84a" }}></div>
          </div>
        </div>

        {/* Flashcard */}
        <div
          className="bg-app-bg border border-app-border rounded-2xl p-8 min-h-[300px] cursor-pointer transition-all"
          onClick={() => setFlipped(!flipped)}
        >
          {flipped ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-app-accent-primary text-3xl font-bold mb-2">{currentItem.korean}</p>
                <p className="text-white/60 text-lg mb-4">{currentItem.reading}</p>
                <p className="text-white text-xl font-semibold mb-2">{currentItem.vietnamese}</p>
                {currentItem.example && (
                  <p className="text-app-text-muted text-sm italic mt-4">{currentItem.example}</p>
                )}
                {currentItem.exampleVi && (
                  <p className="text-app-text-muted text-xs italic mt-1">{currentItem.exampleVi}</p>
                )}
              </div>
              
              {currentItemStats && (
                <div className="mt-6 pt-6 border-t border-app-border">
                  <p className="text-app-text-muted text-xs mb-2">Thống kê ôn tập</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-white/60">Đã review: {currentItemStats.reviews} lần</span>
                    <span className="text-white/60">Interval: {currentItemStats.interval} ngày</span>
                    <span className="text-white/60">Ease: {currentItemStats.easeFactor.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <p className="text-app-text-muted text-sm mb-2">Click để lật thẻ</p>
                <i className="ri-refresh-line text-4xl text-app-text-muted/30" />
              </div>
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-4">
            <p className="text-app-text-muted text-xs mb-3 text-center">Đánh giá khả năng ghi nhớ của bạn</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRate(0)}
                className="py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                Quên hoàn toàn
              </button>
              <button
                onClick={() => handleRate(2)}
                className="py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold cursor-pointer hover:bg-orange-500/20 transition-colors"
              >
                Nhớ khó
              </button>
              <button
                onClick={() => handleRate(4)}
                className="py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-colors"
              >
                Nhớ tốt
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleRate(1)}
                className="flex-1 py-2 rounded-xl bg-app-surface/50 border border-app-border text-app-text-muted text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
              >
                Nhớ chút
              </button>
              <button
                onClick={() => handleRate(3)}
                className="flex-1 py-2 rounded-xl bg-app-surface/50 border border-app-border text-app-text-muted text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
              >
                Nhớ khá
              </button>
              <button
                onClick={() => handleRate(5)}
                className="flex-1 py-2 rounded-xl bg-app-surface/50 border border-app-border text-app-text-muted text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
              >
                Hoàn hảo
              </button>
            </div>
          </div>
        )}

        {/* Reset button */}
        {currentItemStats && (
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-app-surface/50 border border-app-border text-app-text-muted text-xs cursor-pointer hover:bg-app-card/70 transition-colors"
          >
            <i className="ri-refresh-line mr-1"></i>Reset từ này
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}
