/**
 * Hook quản lý flashcard từ vựng K-pop cá nhân
 * Lưu vào localStorage key: kts_kpop_flashcards
 */

import { useState, useCallback } from "react";

export interface KpopFlashcard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  songTitle: string;
  artist: string;
  addedAt: string;
}

const STORAGE_KEY = "kts_kpop_flashcards";

function loadCards(): KpopFlashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KpopFlashcard[]) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: KpopFlashcard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function useKpopFlashcard() {
  const [cards, setCards] = useState<KpopFlashcard[]>(() => loadCards());

  const addCard = useCallback((card: Omit<KpopFlashcard, "id" | "addedAt">) => {
    setCards(prev => {
      // Avoid duplicates by word + songTitle
      if (prev.some(c => c.word === card.word && c.songTitle === card.songTitle)) {
        return prev;
      }
      const next: KpopFlashcard[] = [
        ...prev,
        {
          ...card,
          id: `kpop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          addedAt: new Date().toISOString(),
        },
      ];
      saveCards(next);
      return next;
    });
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards(prev => {
      const next = prev.filter(c => c.id !== id);
      saveCards(next);
      return next;
    });
  }, []);

  const hasCard = useCallback(
    (word: string, songTitle: string) =>
      cards.some(c => c.word === word && c.songTitle === songTitle),
    [cards]
  );

  const clearAll = useCallback(() => {
    setCards([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { cards, addCard, removeCard, hasCard, clearAll };
}
