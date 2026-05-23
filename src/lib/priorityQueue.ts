// Priority Queue for Spaced Repetition
// Sorts cards by: urgency (overdue), weakness (topic accuracy), importance (word frequency)

interface PriorityCard {
  id: string;
  urgency: number; // days overdue (negative = not due yet)
  weakness: number; // topic accuracy (0-100, lower = weaker)
  importance: number; // word frequency in EPS-TOPIK (0-1)
  priorityScore: number; // composite score
}

interface SRCard {
  id: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReview: string;
  lastReview?: string;
  totalReviews: number;
  correctStreak: number;
}

interface TopicAccuracy {
  [topic: string]: number; // accuracy percentage
}

interface WordFrequency {
  [word: string]: number; // frequency 0-1
}

// Default word frequency for EPS-TOPIK (simplified)
const DEFAULT_WORD_FREQUENCY: Record<string, number> = {
  // Work-related (high frequency)
  "일": 0.9,
  "회사": 0.85,
  "사무": 0.8,
  "직업": 0.85,
  "사업": 0.75,
  
  // Family-related
  "가족": 0.8,
  "부모": 0.75,
  "자녀": 0.7,
  "형제": 0.7,
  
  // Time-related
  "시간": 0.85,
  "오늘": 0.9,
  "내일": 0.85,
  "어제": 0.8,
  
  // Location-related
  "장소": 0.75,
  "학교": 0.8,
  "집": 0.85,
  "식당": 0.75,
};

function calculatePriorityScore(
  urgency: number,
  weakness: number,
  importance: number
): number {
  // Weighted sum:
  // Urgency: 40% (most important - overdue cards first)
  // Weakness: 35% (second - weak topics need more review)
  // Importance: 25% (third - high-frequency words are more valuable)
  
  const urgencyScore = urgency > 0 ? urgency * 0.4 : 0; // Only positive urgency matters
  const weaknessScore = (100 - weakness) * 0.35; // Lower accuracy = higher score
  const importanceScore = importance * 25; // Higher importance = higher score
  
  return urgencyScore + weaknessScore + importanceScore;
}

export function prioritizeCards(
  cards: SRCard[],
  topicAccuracy: TopicAccuracy = {},
  wordFrequency: WordFrequency = DEFAULT_WORD_FREQUENCY,
  cardTopics: Record<string, string> = {} // cardId -> topic mapping
): PriorityCard[] {
  const today = new Date().toISOString().split("T")[0];
  
  return cards.map(card => {
    // Calculate urgency (days overdue)
    const nextReviewDate = new Date(card.nextReview);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24));
    const urgency = daysDiff; // positive = overdue, negative = not due yet
    
    // Get topic accuracy for this card's topic
    const topic = cardTopics[card.id] || "general";
    const weakness = topicAccuracy[topic] || 50; // Default to 50% if unknown
    
    // Get word frequency (default to 0.5 if unknown)
    const importance = wordFrequency[card.id] || 0.5;
    
    // Calculate composite priority score
    const priorityScore = calculatePriorityScore(urgency, weakness, importance);
    
    return {
      id: card.id,
      urgency,
      weakness,
      importance,
      priorityScore,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore); // Sort descending (highest priority first)
}

export function getDueCards(
  cards: SRCard[],
  topicAccuracy: TopicAccuracy = {},
  wordFrequency: WordFrequency = DEFAULT_WORD_FREQUENCY,
  cardTopics: Record<string, string> = {},
  limit: number = 20
): SRCard[] {
  const today = new Date().toISOString().split("T")[0];
  
  // Filter cards that are due today or overdue
  const dueCards = cards.filter(card => card.nextReview <= today);
  
  // Prioritize the due cards
  const prioritized = prioritizeCards(dueCards, topicAccuracy, wordFrequency, cardTopics);
  
  // Get the card IDs in priority order
  const prioritizedIds = prioritized.map(pc => pc.id);
  
  // Return the original cards in priority order, limited by limit
  return prioritizedIds
    .slice(0, limit)
    .map(id => cards.find(c => c.id === id))
    .filter((c): c is SRCard => Boolean(c));
}

export function getStudyRecommendation(
  cards: SRCard[],
  topicAccuracy: TopicAccuracy = {}
): {
  recommendedCount: number;
  focusTopics: string[];
  reason: string;
} {
  const today = new Date().toISOString().split("T")[0];
  const dueCards = cards.filter(card => card.nextReview <= today);
  
  // Find weak topics (accuracy < 60%)
  const weakTopics = Object.entries(topicAccuracy)
    .filter(([_, accuracy]) => accuracy < 60)
    .map(([topic, _]) => topic);
  
  if (dueCards.length === 0) {
    return {
      recommendedCount: 0,
      focusTopics: [],
      reason: "Không có bài nào cần ôn tập hôm nay. Bạn đang làm rất tốt!",
    };
  }
  
  if (weakTopics.length > 0) {
    return {
      recommendedCount: Math.min(dueCards.length, 30),
      focusTopics: weakTopics.slice(0, 3),
      reason: `Có ${dueCards.length} bài cần ôn. Tập trung vào các chủ đề yếu: ${weakTopics.slice(0, 3).join(", ")}.`,
    };
  }
  
  return {
    recommendedCount: Math.min(dueCards.length, 20),
    focusTopics: [],
    reason: `Có ${dueCards.length} bài cần ôn tập. Ôn theo thứ tự ưu tiên để hiệu quả nhất.`,
  };
}
