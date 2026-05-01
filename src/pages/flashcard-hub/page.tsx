import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
  const navigate = useNavigate();
  const [recentDeck, setRecentDeck] = useLocalStorage<string>("kts_recent_flashcard_deck", "");

  const handleSelect = (deck: DeckOption) => {
    setRecentDeck(deck.id);
    navigate(deck.path);
  };

  const recentDeckData = DECK_OPTIONS.find(d => d.id === recentDeck);

  return (
    <DashboardLayout title="Thẻ ghi nhớ" subtitle="Chọn bộ thẻ để bắt đầu học">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Recent deck shortcut */}
        {recentDeckData && (
          <div className="mb-8">
            <p className="text-white/30 text-xs tracking-wider font-semibold mb-3">Tiếp tục học</p>
            <button
              onClick={() => handleSelect(recentDeckData)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:scale-[1.01] transition-all"
              style={{ backgroundColor: recentDeckData.bgColor, borderColor: recentDeckData.color + "30" }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: recentDeckData.color + "20" }}
              >
                <i className={`${recentDeckData.icon} text-2xl`} style={{ color: recentDeckData.color }}></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-bold">{recentDeckData.title}</p>
                <p className="text-white/40 text-xs">{recentDeckData.subtitle} · {recentDeckData.totalCards.toLocaleString()} thẻ</p>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                style={{ backgroundColor: recentDeckData.color, color: "#0f1117" }}
              >
                <i className="ri-play-fill text-sm"></i>
                Tiếp tục
              </div>
            </button>
          </div>
        )}

        {/* All decks */}
        <div>
          <p className="text-white/30 text-xs tracking-wider font-semibold mb-4">Tất cả bộ thẻ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DECK_OPTIONS.map(deck => (
              <DeckCard key={deck.id} deck={deck} onSelect={() => handleSelect(deck)} />
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-10 p-5 rounded-2xl border border-white/6 bg-white/2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#e8c84a]/10 flex-shrink-0">
              <i className="ri-lightbulb-line text-[#e8c84a] text-sm"></i>
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold mb-1">Mẹo học hiệu quả</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Học đều đặn mỗi ngày 15-20 phút hiệu quả hơn học dồn 2 tiếng một lần. Bộ thẻ <strong className="text-white/60">AI Thông minh</strong> sẽ tự động nhắc bạn ôn lại đúng lúc trước khi quên.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
