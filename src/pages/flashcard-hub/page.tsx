import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedFlashcard } from "@/components/feature/UnifiedFlashcard";

interface DeckOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  path: string;
  totalCards: number;
  learnedCards: number;
  badge?: string;
  description: string;
}

const DECK_OPTIONS: DeckOption[] = [
  {
    id: "hanja",
    title: "Hán Hàn",
    subtitle: "Hán tự & Từ gốc Hán",
    icon: "ri-character-recognition-line",
    color: "#e8c84a",
    bgColor: "rgba(232,200,74,0.08)",
    path: "/flashcard",
    totalCards: 2691,
    learnedCards: 0,
    badge: "VIP",
    description: "2.691 từ Hán Hàn với Hán tự, phát âm, nghĩa tiếng Việt. Học theo cây từ vựng.",
  },
  {
    id: "eps",
    title: "EPS-TOPIK",
    subtitle: "Tiếng Hàn lao động",
    icon: "ri-file-list-3-line",
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.08)",
    path: "/eps-flashcard",
    totalCards: 1200,
    learnedCards: 0,
    description: "Từ vựng và ngữ pháp theo 60 bài học EPS. Luyện thi chứng chỉ lao động Hàn Quốc.",
  },
  {
    id: "seoul",
    title: "Seoul",
    subtitle: "Giáo trình du học",
    icon: "ri-book-3-line",
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.08)",
    path: "/seoul-flashcard",
    totalCards: 3500,
    learnedCards: 0,
    description: "Từ vựng giáo trình Seoul 1A đến 4B. Phù hợp cho học sinh, sinh viên du học.",
  },
  {
    id: "topik",
    title: "TOPIK",
    subtitle: "Chứng chỉ tiếng Hàn",
    icon: "ri-survey-line",
    color: "#f472b6",
    bgColor: "rgba(244,114,182,0.08)",
    path: "/topik-flashcard",
    totalCards: 2000,
    learnedCards: 0,
    description: "Từ vựng tần suất cao trong đề thi TOPIK I và II. Phân loại theo cấp độ.",
  },
  {
    id: "ai-smart",
    title: "AI Thông minh",
    subtitle: "Spaced Repetition",
    icon: "ri-robot-2-line",
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.08)",
    path: "/ai-smart-flashcard",
    totalCards: 500,
    learnedCards: 0,
    badge: "AI",
    description: "Hệ thống ôn tập thông minh tự động chọn từ cần ôn dựa trên lịch sử học của bạn.",
  },
  {
    id: "melon",
    title: "K-pop",
    subtitle: "Học qua âm nhạc",
    icon: "ri-music-2-line",
    color: "#fb923c",
    bgColor: "rgba(251,146,60,0.08)",
    path: "/melon-flashcard",
    totalCards: 800,
    learnedCards: 0,
    description: "Từ vựng từ lời bài hát K-pop. Học tiếng Hàn qua âm nhạc thú vị và dễ nhớ.",
  },
];

function DeckCard({ deck, onSelect }: { deck: DeckOption; onSelect: () => void }) {
  const progress = deck.totalCards > 0 ? Math.round((deck.learnedCards / deck.totalCards) * 100) : 0;

  return (
    <button
      onClick={onSelect}
      className="group relative w-full text-left rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg"
      style={{
        backgroundColor: deck.bgColor,
        borderColor: deck.color + "22",
      }}
    >
      {deck.badge && (
        <span
          className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold"
          style={{ backgroundColor: deck.color + "22", color: deck.color }}
        >
          {deck.badge}
        </span>
      )}

      <div className="p-5">
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: deck.color + "18" }}
          >
            <i className={`${deck.icon} text-xl`} style={{ color: deck.color }}></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight">{deck.title}</h3>
            <p className="text-white/40 text-xs mt-0.5">{deck.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">{deck.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/35 text-xs">{deck.totalCards.toLocaleString()} thẻ</span>
          <span className="text-xs font-semibold" style={{ color: deck.color }}>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: deck.color }}
          />
        </div>

        {/* CTA */}
        <div
          className="mt-4 flex items-center justify-between py-2 px-3 rounded-xl transition-all"
          style={{ backgroundColor: deck.color + "10" }}
        >
          <span className="text-xs font-semibold" style={{ color: deck.color }}>
            Bắt đầu học
          </span>
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-arrow-right-line text-sm" style={{ color: deck.color }}></i>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function FlashcardHubPage() {
  const { user } = useAuth();
  const [activeDeck, setActiveDeck] = useState<DeckOption | null>(null);
  const [sessionStats, setSessionStats] = useState<{ correct: number; total: number } | null>(null);

  const handleDeckSelect = (deck: DeckOption) => {
    setActiveDeck(deck);
    setSessionStats(null);
  };

  const handleComplete = (stats: { correct: number; total: number }) => {
    setSessionStats(stats);
  };

  const handleBack = () => {
    setActiveDeck(null);
    setSessionStats(null);
  };

  const navigate = useNavigate();
  const [recentDeck, setRecentDeck] = useLocalStorage<string>("kts_recent_flashcard_deck", "");

  const handleNavigate = (deck: DeckOption) => {
    setRecentDeck(deck.id);
    navigate(deck.path);
  };

  const recentDeckData = DECK_OPTIONS.find(d => d.id === recentDeck);

  // Mock card data for demo - will be replaced with real data fetch
  const getMockCards = (moduleId: string) => {
    const cards: Array<{ id: string; front: string; back: string; extra?: string }> = [];
    for (let i = 1; i <= 10; i++) {
      cards.push({
        id: `${moduleId}_card_${i}`,
        front: `Card ${i} Front`,
        back: `Card ${i} Back`,
        extra: `Extra info for card ${i}`,
      });
    }
    return cards;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {activeDeck ? (
          <>
            <div className="mb-6">
              <button onClick={handleBack} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
                <i className="ri-arrow-left-line"></i>
                Quay lại
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: activeDeck.bgColor }}>
                    <i className={`${activeDeck.icon} text-lg`} style={{ color: activeDeck.color }}></i>
                  </div>
                  <div>
                    <h1 className="text-white font-semibold">{activeDeck.title}</h1>
                    <p className="text-white/60 text-sm">{activeDeck.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/learning-hub")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/3 text-white/40 border border-white/8 hover:text-white/60 transition-all"
                >
                  <i className="ri-dashboard-line"></i>
                  Learning Hub
                </button>
              </div>
            </div>

            {sessionStats ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-green-500/10 rounded-full mb-4">
                  <i className="ri-check-line text-green-400 text-3xl"></i>
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Hoàn thành!</h2>
                <p className="text-white/60 text-sm mb-4">
                  Bạn đã học 10 thẻ flashcard
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="text-green-400">{sessionStats.correct} đúng</div>
                  <div className="text-white/30">{sessionStats.total - sessionStats.correct} sai</div>
                </div>
                <button onClick={handleBack} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors">
                  Quay lại hub
                </button>
              </div>
            ) : (
              <UnifiedFlashcard
                moduleId={activeDeck.id}
                userId={user?.id || ""}
                cards={getMockCards(activeDeck.id)}
                onComplete={handleComplete}
              />
            )}
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Flashcard Hub</h1>
              <p className="text-white/60 text-sm">Hệ thống thẻ ghi nhớ thống nhất với Spaced Repetition</p>
            </div>

            {recentDeckData && (
              <div className="mb-6">
                <p className="text-white/40 text-xs mb-3">Gần đây</p>
                <DeckCard deck={recentDeckData} onSelect={() => handleNavigate(recentDeckData)} />
              </div>
            )}

            <p className="text-white/40 text-xs mb-3">Tất cả decks</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DECK_OPTIONS.map(deck => (
                <DeckCard key={deck.id} deck={deck} onSelect={() => handleDeckSelect(deck)} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
