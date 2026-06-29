import { useState, useEffect } from "react";

interface ContextTag {
  id: string;
  name: string;
  category: "workplace" | "safety" | "daily" | "interview";
  icon: string;
  color: string;
}

interface ContextualVocabulary {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  context: string;
  example: string;
  translation: string;
  tags: string[];
  difficulty: number; // 1-5
}

export function useContextualLearning() {
  const [vocabularies, setVocabularies] = useState<ContextualVocabulary[]>([]);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const contextTags: ContextTag[] = [
    { id: "factory", name: "Nhà máy", category: "workplace", icon: "ri-factory-line", color: "#f97316" },
    { id: "farm", name: "Nông trại", category: "workplace", icon: "ri-plant-line", color: "#4ade80" },
    { id: "construction", name: "Xây dựng", category: "workplace", icon: "ri-hammer-line", color: "#60a5fa" },
    { id: "safety", name: "An toàn lao động", category: "safety", icon: "ri-shield-check-line", color: "#ef4444" },
    { id: "interview", name: "Phỏng vấn", category: "interview", icon: "ri-user-search-line", color: "#a78bfa" },
    { id: "daily", name: "Đời sống", category: "daily", icon: "ri-home-line", color: "#fbbf24" },
  ];

  const mockVocabularies: ContextualVocabulary[] = [
    {
      id: "1",
      word: "기계",
      meaning: "máy móc",
      pronunciation: "gi-gye",
      context: "factory",
      example: "기계를 조심하세요.",
      translation: "Cẩn thận máy móc.",
      tags: ["factory", "safety"],
      difficulty: 2,
    },
    {
      id: "2",
      word: "농장",
      meaning: "nông trại",
      pronunciation: "nong-jang",
      context: "farm",
      example: "농장에서 일합니다.",
      translation: "Tôi làm việc ở nông trại.",
      tags: ["farm"],
      difficulty: 1,
    },
    {
      id: "3",
      word: "안전",
      meaning: "an toàn",
      pronunciation: "an-jeon",
      context: "safety",
      example: "안전 모자를 쓰세요.",
      translation: "Đội mũ bảo hộ.",
      tags: ["safety"],
      difficulty: 1,
    },
    {
      id: "4",
      word: "면접",
      meaning: "phỏng vấn",
      pronunciation: "myeon-jeop",
      context: "interview",
      example: "면접 준비를 해야 합니다.",
      translation: "Phải chuẩn bị phỏng vấn.",
      tags: ["interview"],
      difficulty: 2,
    },
    {
      id: "5",
      word: "건설",
      meaning: "xây dựng",
      pronunciation: "geon-seol",
      context: "construction",
      example: "건설 현장에서 일합니다.",
      translation: "Tôi làm việc tại công trường xây dựng.",
      tags: ["construction"],
      difficulty: 2,
    },
  ];

  useEffect(() => {
    setVocabularies(mockVocabularies);
    setLoading(false);
  }, []);

  const filterByContext = (contextId: string) => {
    setSelectedContext(contextId);
  };

  const clearFilter = () => {
    setSelectedContext(null);
  };

  const getFilteredVocabularies = () => {
    if (!selectedContext) return vocabularies;
    return vocabularies.filter(v => v.tags.includes(selectedContext));
  };

  const getContextTag = (contextId: string) => {
    return contextTags.find(t => t.id === contextId);
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Dễ";
      case 2: return "Khá dễ";
      case 3: return "Trung bình";
      case 4: return "Khá khó";
      case 5: return "Khó";
      default: return `${level}`;
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "#4ade80";
      case 2: return "#60a5fa";
      case 3: return "#fbbf24";
      case 4: return "#f97316";
      case 5: return "#ef4444";
      default: return "#94a3b8";
    }
  };

  return {
    vocabularies,
    contextTags,
    selectedContext,
    loading,
    filterByContext,
    clearFilter,
    getFilteredVocabularies,
    getContextTag,
    getDifficultyLabel,
    getDifficultyColor,
  };
}
