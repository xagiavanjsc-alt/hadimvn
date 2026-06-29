import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface ReviewItem {
  id: string;
  type: "vocabulary" | "grammar" | "listening" | "reading";
  content: string;
  meaning: string;
  lastReviewed: number;
  nextReview: number;
  interval: number; // days
  easeFactor: number;
  reviewCount: number;
  successRate: number;
  weakness: number; // 0-1, higher = weaker
}

interface WeaknessArea {
  skill: "vocabulary" | "grammar" | "listening" | "reading";
  score: number; // 0-100
  items: ReviewItem[];
}

export function useSmartReview() {
  const [reviewItems, setReviewItems] = useLocalStorage<ReviewItem[]>("kts_smart_review", []);
  const [selectedSkill, setSelectedSkill] = useState<"vocabulary" | "grammar" | "listening" | "reading" | null>(null);
  const [loading, setLoading] = useState(true);

  const mockReviewItems: ReviewItem[] = [
    {
      id: "1",
      type: "vocabulary",
      content: "기계",
      meaning: "máy móc",
      lastReviewed: Date.now() - 86400000 * 2,
      nextReview: Date.now(),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 3,
      successRate: 0.6,
      weakness: 0.8,
    },
    {
      id: "2",
      type: "grammar",
      content: "-습니다/습니다",
      meaning: "động từ dạng lịch sự",
      lastReviewed: Date.now() - 86400000 * 5,
      nextReview: Date.now(),
      interval: 2,
      easeFactor: 2.3,
      reviewCount: 5,
      successRate: 0.4,
      weakness: 0.9,
    },
    {
      id: "3",
      type: "listening",
      content: "안전 모자를 쓰세요",
      meaning: "Đội mũ bảo hộ",
      lastReviewed: Date.now() - 86400000 * 1,
      nextReview: Date.now(),
      interval: 1,
      easeFactor: 2.6,
      reviewCount: 2,
      successRate: 0.7,
      weakness: 0.5,
    },
    {
      id: "4",
      type: "reading",
      content: "농장에서 일합니다",
      meaning: "Tôi làm việc ở nông trại",
      lastReviewed: Date.now() - 86400000 * 3,
      nextReview: Date.now(),
      interval: 1,
      easeFactor: 2.4,
      reviewCount: 4,
      successRate: 0.5,
      weakness: 0.7,
    },
  ];

  useEffect(() => {
    setReviewItems(mockReviewItems);
    setLoading(false);
  }, []);

  const getDueItems = () => {
    const now = Date.now();
    return reviewItems.filter(item => item.nextReview <= now);
  };

  const getWeaknessAreas = (): WeaknessArea[] => {
    const skills = ["vocabulary", "grammar", "listening", "reading"] as const;
    return skills.map(skill => {
      const skillItems = reviewItems.filter(item => item.type === skill);
      const avgWeakness = skillItems.length > 0
        ? skillItems.reduce((sum, item) => sum + item.weakness, 0) / skillItems.length
        : 0;
      const score = Math.max(0, 100 - avgWeakness * 100);
      return { skill, score, items: skillItems };
    }).sort((a, b) => a.score - b.score); // Sort by weakest first
  };

  const reviewItem = (itemId: string, success: boolean) => {
    setReviewItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      // SM-2 algorithm simplified
      const newReviewCount = item.reviewCount + 1;
      const newSuccessRate = (item.successRate * item.reviewCount + (success ? 1 : 0)) / newReviewCount;
      const newWeakness = 1 - newSuccessRate;

      let newInterval, newEaseFactor;
      if (success) {
        newEaseFactor = item.easeFactor + 0.1;
        newInterval = item.interval === 0 ? 1 : Math.round(item.interval * newEaseFactor);
      } else {
        newEaseFactor = Math.max(1.3, item.easeFactor - 0.2);
        newInterval = 1;
      }

      const nextReview = Date.now() + newInterval * 86400000;

      return {
        ...item,
        lastReviewed: Date.now(),
        nextReview,
        interval: newInterval,
        easeFactor: newEaseFactor,
        reviewCount: newReviewCount,
        successRate: newSuccessRate,
        weakness: newWeakness,
      };
    }));
  };

  const filterBySkill = (skill: "vocabulary" | "grammar" | "listening" | "reading") => {
    setSelectedSkill(skill);
  };

  const clearFilter = () => {
    setSelectedSkill(null);
  };

  const getFilteredItems = () => {
    const dueItems = getDueItems();
    if (!selectedSkill) return dueItems;
    return dueItems.filter(item => item.type === selectedSkill);
  };

  const getSkillLabel = (skill: string) => {
    switch (skill) {
      case "vocabulary": return "Từ vựng";
      case "grammar": return "Ngữ pháp";
      case "listening": return "Nghe";
      case "reading": return "Đọc";
      default: return skill;
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "vocabulary": return "ri-translate-2";
      case "grammar": return "ri-book-2-line";
      case "listening": return "ri-headphone-line";
      case "reading": return "ri-book-open-line";
      default: return "ri-question-line";
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case "vocabulary": return "#fbbf24";
      case "grammar": return "#f87171";
      case "listening": return "#60a5fa";
      case "reading": return "#4ade80";
      default: return "#94a3b8";
    }
  };

  return {
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
  };
}
