export interface VocabItem {
  id: string;
  korean: string;
  reading: string;
  vietnamese: string;
  example: string;
  exampleVi: string;
  category: string;
  topikLevel: "A1" | "A2" | "B1" | "B2";
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "expression";
}

export const VOCAB_CATEGORIES = [
  { id: "daily", label: "Hàng ngày", icon: "ri-home-smile-line", color: "#34d399" },
  { id: "food", label: "Ẩm thực", icon: "ri-restaurant-line", color: "#fb923c" },
  { id: "transport", label: "Giao thông", icon: "ri-bus-line", color: "#38bdf8" },
  { id: "work", label: "Công việc", icon: "ri-briefcase-line", color: "#e8c84a" },
  { id: "body", label: "Cơ thể & Sức khỏe", icon: "ri-heart-pulse-line", color: "#f87171" },
  { id: "nature", label: "Thiên nhiên", icon: "ri-leaf-line", color: "#4ade80" },
  { id: "emotion", label: "Cảm xúc", icon: "ri-emotion-line", color: "#f472b6" },
  { id: "time", label: "Thời gian", icon: "ri-time-line", color: "#a78bfa" },
  { id: "number", label: "Số đếm", icon: "ri-list-ordered", color: "#06b6d4" },
  { id: "place", label: "Địa điểm", icon: "ri-map-pin-line", color: "#fbbf24" },
  { id: "family", label: "Gia đình", icon: "ri-group-line", color: "#c084fc" },
  { id: "school", label: "Học tập", icon: "ri-book-open-line", color: "#67e8f9" },
  { id: "shopping", label: "Mua sắm", icon: "ri-shopping-bag-line", color: "#fda4af" },
  { id: "weather", label: "Thời tiết", icon: "ri-sun-line", color: "#fcd34d" },
  { id: "society", label: "Xã hội", icon: "ri-community-line", color: "#86efac" },
];

// Data moved to data/vocabulary-data-data.ts for code splitting
export { vocabularyData } from "./data/vocabulary-data-data";

