import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface SRSItem {
  id: string;
  nextReviewDate: string; // ISO timestamp
  interval: number; // days
  easeFactor: number; // 1.3 - 2.5
  reviews: number;
  lastReviewDate?: string;
}

interface SRSReviewResult {
  quality: number; // 0-5 (0=blackout, 5=perfect)
  nextInterval: number;
  nextEaseFactor: number;
  nextReviewDate: string;
}

// SM-2 Algorithm (simplified from SuperMemo 2)
function calculateNextReview(
  currentInterval: number,
  currentEaseFactor: number,
  quality: number
): SRSReviewResult {
  // Quality: 0-5
  // 0 = blackout (complete failure)
  // 1 = incorrect but familiar
  // 2 = incorrect but easy to recall
  // 3 = correct but difficult
  // 4 = correct with hesitation
  // 5 = perfect recall

  let nextInterval: number;
  let nextEaseFactor: number;

  if (quality < 3) {
    // Failed - reset to 1 day
    nextInterval = 1;
    nextEaseFactor = currentEaseFactor;
  } else {
    // Passed - calculate new interval
    if (currentInterval === 0) {
      nextInterval = 1;
    } else if (currentInterval === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(currentInterval * currentEaseFactor);
    }

    // Update ease factor
    nextEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    nextEaseFactor = Math.max(1.3, Math.min(2.5, nextEaseFactor));
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    quality,
    nextInterval,
    nextEaseFactor,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

export function useSRS<T extends { id: string }>(items: T[], storageKey: string) {
  const [srsData, setSrsData] = useLocalStorage<Record<string, SRSItem>>(storageKey, {});
  const [dueItems, setDueItems] = useState<T[]>([]);

  // Calculate due items
  useEffect(() => {
    const now = new Date();
    const due = items.filter(item => {
      const srs = srsData[item.id];
      if (!srs) return true; // New item - due immediately
      return new Date(srs.nextReviewDate) <= now;
    });
    setDueItems(due);
  }, [items, srsData]);

  const reviewItem = useCallback(
    (itemId: string, quality: number): void => {
      const current = srsData[itemId] || {
        id: itemId,
        nextReviewDate: new Date().toISOString(),
        interval: 0,
        easeFactor: 2.5,
        reviews: 0,
      };

      const result = calculateNextReview(current.interval, current.easeFactor, quality);

      setSrsData(prev => ({
        ...prev,
        [itemId]: {
          id: itemId,
          nextReviewDate: result.nextReviewDate,
          interval: result.nextInterval,
          easeFactor: result.nextEaseFactor,
          reviews: current.reviews + 1,
          lastReviewDate: new Date().toISOString(),
        },
      }));
    },
    [srsData, setSrsData]
  );

  const resetItem = useCallback((itemId: string): void => {
    setSrsData(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, [setSrsData]);

  const getItemStats = useCallback(
    (itemId: string) => {
      return srsData[itemId] || null;
    },
    [srsData]
  );

  const getOverallStats = useCallback(() => {
    const total = items.length;
    const reviewed = Object.keys(srsData).length;
    const due = dueItems.length;
    const mastered = Object.values(srsData).filter(s => s.interval >= 21).length; // 21+ days = mastered

    return { total, reviewed, due, mastered };
  }, [items, srsData, dueItems]);

  return {
    dueItems,
    reviewItem,
    resetItem,
    getItemStats,
    getOverallStats,
  };
}
