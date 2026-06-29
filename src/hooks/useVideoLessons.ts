import { useState, useEffect } from "react";

interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: "grammar" | "vocabulary" | "listening" | "speaking" | "culture";
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  views: number;
  thumbnail: string;
  createdAt: string;
}

export function useVideoLessons() {
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"grammar" | "vocabulary" | "listening" | "speaking" | "culture" | null>(null);
  const [loading, setLoading] = useState(true);

  const mockVideos: VideoLesson[] = [
    {
      id: "1",
      title: "Ngữ pháp cơ bản: -습니다/습니다",
      description: "Hình thức động từ lịch sự trong tiếng Hàn",
      youtubeId: "dQw4w9WgXcQ",
      category: "grammar",
      level: "beginner",
      duration: "12:30",
      views: 1234,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      createdAt: "2026-06-15",
    },
    {
      id: "2",
      title: "Từ vựng EPS: Công việc nhà máy",
      description: "Các từ vựng quan trọng cho công việc tại nhà máy",
      youtubeId: "dQw4w9WgXcQ",
      category: "vocabulary",
      level: "beginner",
      duration: "15:45",
      views: 892,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      createdAt: "2026-06-18",
    },
    {
      id: "3",
      title: "Luyện nghe: Chỉ dẫn công việc",
      description: "Nghe và hiểu chỉ dẫn công việc tiếng Hàn",
      youtubeId: "dQw4w9WgXcQ",
      category: "listening",
      level: "intermediate",
      duration: "10:20",
      views: 567,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      createdAt: "2026-06-20",
    },
    {
      id: "4",
      title: "Luyện phát âm: Nguyên âm cơ bản",
      description: "Cách phát âm 10 nguyên âm cơ bản tiếng Hàn",
      youtubeId: "dQw4w9WgXcQ",
      category: "speaking",
      level: "beginner",
      duration: "18:00",
      views: 2341,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      createdAt: "2026-06-10",
    },
    {
      id: "5",
      title: "Văn hóa Hàn: Lễ tết Chuseok",
      description: "Tìm hiểu về lễ tết thu của Hàn Quốc",
      youtubeId: "dQw4w9WgXcQ",
      category: "culture",
      level: "beginner",
      duration: "20:15",
      views: 1876,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      createdAt: "2026-06-12",
    },
    {
      id: "6",
      title: "Ngữ pháp nâng cao: -아/어 보다",
      description: "Cấu trúc dùng để thử làm gì đó",
      youtubeId: "dQw4w9WgXcQ",
      category: "grammar",
      level: "intermediate",
      duration: "14:30",
      views: 432,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      createdAt: "2026-06-22",
    },
  ];

  useEffect(() => {
    setVideos(mockVideos);
    setLoading(false);
  }, []);

  const filterByCategory = (category: "grammar" | "vocabulary" | "listening" | "speaking" | "culture") => {
    setSelectedCategory(category);
  };

  const clearFilter = () => {
    setSelectedCategory(null);
  };

  const getFilteredVideos = () => {
    if (!selectedCategory) return videos;
    return videos.filter(v => v.category === selectedCategory);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "grammar": return "Ngữ pháp";
      case "vocabulary": return "Từ vựng";
      case "listening": return "Nghe";
      case "speaking": return "Nói";
      case "culture": return "Văn hóa";
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "grammar": return "ri-book-2-line";
      case "vocabulary": return "ri-translate-2";
      case "listening": return "ri-headphone-line";
      case "speaking": return "ri-mic-line";
      case "culture": return "ri-earth-line";
      default: return "ri-video-line";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "grammar": return "#a78bfa";
      case "vocabulary": return "#fbbf24";
      case "listening": return "#60a5fa";
      case "speaking": return "#f97316";
      case "culture": return "#4ade80";
      default: return "#94a3b8";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner": return "Cơ bản";
      case "intermediate": return "Trung bình";
      case "advanced": return "Nâng cao";
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "#4ade80";
      case "intermediate": return "#fbbf24";
      case "advanced": return "#ef4444";
      default: return "#94a3b8";
    }
  };

  return {
    videos,
    selectedCategory,
    loading,
    filterByCategory,
    clearFilter,
    getFilteredVideos,
    getCategoryLabel,
    getCategoryIcon,
    getCategoryColor,
    getLevelLabel,
    getLevelColor,
  };
}
