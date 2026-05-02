import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { indexedDB, FlashcardData } from "@/lib/indexedDB";

interface UnifiedFlashcardProps {
  moduleId: string; // 'eps', 'seoul', 'hanja', 'melon', 'topik'
  userId: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    extra?: string;
  }>;
  onComplete?: (stats: { correct: number; total: number }) => void;
}

const MODULE_CONFIG = {
  eps: { name: "EPS-TOPIK", color: "#4ade80", icon: "ri-file-list-3-line" },
  seoul: { name: "Seoul", color: "#60a5fa", icon: "ri-book-3-line" },
  hanja: { name: "Hán Hàn", color: "app-accent-primary", icon: "ri-character-recognition-line" },
  melon: { name: "K-pop", color: "#fb923c", icon: "ri-music-2-line" },
  topik: { name: "TOPIK", color: "#f472b6", icon: "ri-survey-line" },
};

export function UnifiedFlashcard({ moduleId, userId, cards, onComplete }: UnifiedFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [flashcardStates, setFlashcardStates] = useState<Record<string, FlashcardData>>({});
  const [loading, setLoading] = useState(true);

  const config = MODULE_CONFIG[moduleId as keyof typeof MODULE_CONFIG] || MODULE_CONFIG.hanja;

  // Load flashcard states from IndexedDB
  useEffect(() => {
    const loadStates = async () => {
      setLoading(true);
      try {
        const dbCards = await indexedDB.getFlashcardsByModule(moduleId);
        const statesMap: Record<string, FlashcardData> = {};
        dbCards.forEach(card => {
          statesMap[card.card_id] = card;
        });
        setFlashcardStates(statesMap);
      } catch (err) {
        console.error("Failed to load flashcard states:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStates();
  }, [moduleId]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  };

  const handleRate = async (rating: number) => {
    // rating: 0=again, 1=hard, 2=good, 3=easy
    const currentCard = cards[currentIndex];
    const cardId = currentCard.id;

    // Update stats
    const newTotal = total + 1;
    const newCorrect = correct + (rating >= 2 ? 1 : 0);
    setTotal(newTotal);
    setCorrect(newCorrect);

    // Calculate next review time using Leitner system
    const currentState = flashcardStates[cardId] || {
      card_id: cardId,
      module_id: moduleId,
      status: "new" as const,
      box: 0,
      next_review: new Date().toISOString(),
      review_count: 0,
      success_count: 0,
      last_reviewed_at: new Date().toISOString(),
    };

    let newBox = currentState.box;
    if (rating === 0) {
      newBox = 0; // Reset to box 0
    } else if (rating === 1) {
      newBox = Math.max(0, currentState.box - 1); // Move back one box
    } else if (rating === 2) {
      newBox = currentState.box; // Stay in same box
    } else if (rating === 3) {
      newBox = Math.min(5, currentState.box + 1); // Move forward one box
    }

    const intervals = [1, 3, 7, 14, 30, 90]; // Days for each box
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervals[newBox]);

    const newState: FlashcardData = {
      ...currentState,
      box: newBox,
      status: rating === 0 ? "learning" : rating >= 2 ? "review" : "learning",
      next_review: nextReview.toISOString(),
      review_count: currentState.review_count + 1,
      success_count: currentState.success_count + (rating >= 2 ? 1 : 0),
      last_reviewed_at: new Date().toISOString(),
    };

    // Update IndexedDB
    await indexedDB.putFlashcard(newState);

    // Update state
    setFlashcardStates(prev => ({ ...prev, [cardId]: newState }));

    // Sync to Supabase
    try {
      await supabase.from("flashcard_data").upsert({
        user_id: userId,
        card_id: cardId,
        module_id: moduleId,
        status: newState.status,
        box: newState.box,
        next_review: newState.next_review,
        review_count: newState.review_count,
        success_count: newState.success_count,
        last_reviewed_at: newState.last_reviewed_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,card_id" });
    } catch (err) {
      console.error("Failed to sync flashcard to Supabase:", err);
    }

    // Move to next card
    setIsFlipped(false);
    setShowAnswer(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed
      onComplete?.({ correct: newCorrect, total: newTotal });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 flex items-center justify-center bg-green-500/10 rounded-full mb-4">
          <i className="ri-check-line text-green-400 text-3xl"></i>
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Hoàn thành!</h2>
        <p className="text-white/60 text-sm mb-4">
          Bạn đã học {cards.length} thẻ flashcard
        </p>
        <div className="flex gap-4 text-sm">
          <div className="text-green-400">{correct} đúng</div>
          <div className="text-app-text-muted">{total - correct} sai</div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const currentState = flashcardStates[currentCard.id];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
            <i className={`${config.icon} text-sm`} style={{ color: config.color }}></i>
          </div>
          <span className="text-white/60 text-sm">{config.name}</span>
        </div>
        <div className="text-app-text-secondary text-xs">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative w-full h-80 bg-app-bg border border-app-border rounded-2xl cursor-pointer transition-all duration-300 hover:border-app-border"
        onClick={handleFlip}
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center p-8 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <p className="text-white text-2xl font-medium mb-2">{currentCard.front}</p>
            {currentState && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                  Box {currentState.box}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center p-8 backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="text-white text-xl font-medium mb-2">{currentCard.back}</p>
            {currentCard.extra && (
              <p className="text-white/60 text-sm">{currentCard.extra}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {showAnswer && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          <button
            onClick={() => handleRate(0)}
            className="py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors"
          >
            Lại
          </button>
          <button
            onClick={() => handleRate(1)}
            className="py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-medium transition-colors"
          >
            Khó
          </button>
          <button
            onClick={() => handleRate(2)}
            className="py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium transition-colors"
          >
            Được
          </button>
          <button
            onClick={() => handleRate(3)}
            className="py-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-sm font-medium transition-colors"
          >
            Dễ
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-6 h-2 bg-app-card/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%`, backgroundColor: config.color }}
        ></div>
      </div>
    </div>
  );
}
