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
    subtitle: "Hán t? & T? g?c Hán",
    icon: "ri-character-recognition-line",
    color: "app-accent-primary",
    bgColor: "rgba(232,200,74,0.08)",
    path: "/flashcard",
    totalCards: 3501,
    learnedCards: 0,
    badge: "VIP",
    description: "3.501 t? Hán Hàn v?i Hán t?, phát âm, nghia ti?ng Vi?t. H?c theo cây t? v?ng.",
  },
  {
    id: "eps",
    title: "EPS-TOPIK",
    subtitle: "Ti?ng Hàn lao d?ng",
    icon: "ri-file-list-3-line",
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.08)",
    path: "/eps-flashcard",
    totalCards: 1200,
    learnedCards: 0,
    description: "T? v?ng và ng? pháp theo 60 bài h?c EPS. Luy?n thi ch?ng ch? lao d?ng Hàn Qu?c.",
  },
  {
    id: "seoul",
    title: "Seoul",
    subtitle: "Giáo trình du h?c",
    icon: "ri-book-3-line",
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.08)",
    path: "/seoul-flashcard",
    totalCards: 3500,
    learnedCards: 0,
    description: "T? v?ng giáo trình Seoul 1A d?n 4B. Phù h?p cho h?c sinh, sinh viên du h?c.",
  },
  {
    id: "topik",
    title: "TOPIK",
    subtitle: "Ch?ng ch? ti?ng Hàn",
    icon: "ri-survey-line",
    color: "#f472b6",
    bgColor: "rgba(244,114,182,0.08)",
    path: "/topik-flashcard",
    totalCards: 2000,
    learnedCards: 0,
    description: "T? v?ng t?n su?t cao trong d? thi TOPIK I và II. Phân lo?i theo c?p d?.",
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
    description: "H? th?ng ôn t?p thông minh t? d?ng ch?n t? c?n ôn d?a trên l?ch s? h?c c?a b?n.",
  },
  {
    id: "melon",
    title: "K-pop",
    subtitle: "H?c qua âm nh?c",
    icon: "ri-music-2-line",
    color: "#fb923c",
    bgColor: "rgba(251,146,60,0.08)",
    path: "/melon-flashcard",
    totalCards: 800,
    learnedCards: 0,
    description: "T? v?ng t? l?i bài hát K-pop. H?c ti?ng Hàn qua âm nh?c thú v? và d? nh?.",
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
            <p className="text-app-text-secondary text-xs mt-0.5">{deck.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">{deck.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/35 text-xs">{deck.totalCards.toLocaleString()} th?</span>
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
            B?t d?u h?c
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

  const handleNavigate = (deck: DeckOption) => {
    setRecentDeck(deck.id);
    navigate(deck.path);
  };

  const recentDeckData = DECK_OPTIONS.find(d => d.id === recentDeck);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Flashcard Hub</h1>
          <p className="text-white/60 text-sm">H? th?ng th? ghi nh? th?ng nh?t v?i Spaced Repetition</p>
        </div>

        {recentDeckData && (
          <div className="mb-6">
            <p className="text-app-text-secondary text-xs mb-3">G?n dây</p>
            <DeckCard deck={recentDeckData} onSelect={() => handleNavigate(recentDeckData)} />
          </div>
        )}

        <p className="text-app-text-secondary text-xs mb-3">T?t c? decks</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DECK_OPTIONS.map(deck => (
            <DeckCard key={deck.id} deck={deck} onSelect={() => handleNavigate(deck)} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
