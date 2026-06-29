import { useState, useEffect } from "react";

interface Tag {
  id: string;
  name: string;
  category: "topic" | "difficulty" | "grammar" | "skill";
  color: string;
  count: number;
}

interface RelatedLesson {
  id: string;
  title: string;
  type: "lesson" | "vocab" | "grammar" | "practice";
  tags: string[];
  relevance: number; // 0-1
}

export function useContentInterlinking() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [relatedLessons, setRelatedLessons] = useState<RelatedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const mockTags: Tag[] = [
    { id: "factory", name: "Nhà máy", category: "topic", color: "#f97316", count: 15 },
    { id: "farm", name: "Nông trại", category: "topic", color: "#4ade80", count: 12 },
    { id: "construction", name: "Xây dựng", category: "topic", color: "#60a5fa", count: 10 },
    { id: "safety", name: "An toàn", category: "topic", color: "#ef4444", count: 8 },
    { id: "easy", name: "Dễ", category: "difficulty", color: "#4ade80", count: 25 },
    { id: "medium", name: "Trung bình", category: "difficulty", color: "#fbbf24", count: 30 },
    { id: "hard", name: "Khó", category: "difficulty", color: "#ef4444", count: 15 },
    { id: "verb", name: "Động từ", category: "grammar", color: "#a78bfa", count: 20 },
    { id: "noun", name: "Danh từ", category: "grammar", color: "#60a5fa", count: 25 },
    { id: "listening", name: "Nghe", category: "skill", color: "#f97316", count: 18 },
    { id: "reading", name: "Đọc", category: "skill", color: "#4ade80", count: 22 },
    { id: "speaking", name: "Nói", category: "skill", color: "#60a5fa", count: 15 },
  ];

  const mockRelatedLessons: RelatedLesson[] = [
    {
      id: "1",
      title: "Bài 1: Giới thiệu bản thân",
      type: "lesson",
      tags: ["easy", "speaking", "listening"],
      relevance: 0.95,
    },
    {
      id: "2",
      title: "Từ vựng: Công việc nhà máy",
      type: "vocab",
      tags: ["factory", "medium", "reading"],
      relevance: 0.88,
    },
    {
      id: "3",
      title: "Ngữ pháp: Động từ cơ bản",
      type: "grammar",
      tags: ["verb", "easy", "speaking"],
      relevance: 0.82,
    },
    {
      id: "4",
      title: "Bài 5: An toàn lao động",
      type: "lesson",
      tags: ["safety", "medium", "listening"],
      relevance: 0.79,
    },
    {
      id: "5",
      title: "Luyện nghe: Chỉ dẫn công việc",
      type: "practice",
      tags: ["listening", "medium", "factory"],
      relevance: 0.75,
    },
    {
      id: "6",
      title: "Từ vựng: Nông trại",
      type: "vocab",
      tags: ["farm", "easy", "reading"],
      relevance: 0.72,
    },
  ];

  useEffect(() => {
    setTags(mockTags);
    setRelatedLessons(mockRelatedLessons);
    setLoading(false);
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  const getFilteredLessons = () => {
    if (selectedTags.length === 0) return relatedLessons;
    return relatedLessons.filter(lesson => {
      return selectedTags.some(tagId => lesson.tags.includes(tagId));
    });
  };

  const getTag = (tagId: string) => {
    return tags.find(t => t.id === tagId);
  };

  const getCategoryTags = (category: "topic" | "difficulty" | "grammar" | "skill") => {
    return tags.filter(t => t.category === category);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "topic": return "Chủ đề";
      case "difficulty": return "Độ khó";
      case "grammar": return "Ngữ pháp";
      case "skill": return "Kỹ năng";
      default: return category;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "lesson": return "Bài học";
      case "vocab": return "Từ vựng";
      case "grammar": return "Ngữ pháp";
      case "practice": return "Luyện tập";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lesson": return "ri-book-open-line";
      case "vocab": return "ri-translate-2";
      case "grammar": return "ri-book-2-line";
      case "practice": return "ri-pencil-line";
      default: return "ri-question-line";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lesson": return "#60a5fa";
      case "vocab": return "#fbbf24";
      case "grammar": return "#a78bfa";
      case "practice": return "#4ade80";
      default: return "#94a3b8";
    }
  };

  return {
    tags,
    selectedTags,
    relatedLessons,
    loading,
    toggleTag,
    clearTags,
    getFilteredLessons,
    getTag,
    getCategoryTags,
    getCategoryLabel,
    getTypeLabel,
    getTypeIcon,
    getTypeColor,
  };
}
