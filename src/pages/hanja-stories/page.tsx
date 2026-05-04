import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface HanjaStory {
  id: string;
  title: string;
  content: string;
  hanja_words: { korean: string; hanja: string; vietnamese: string }[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  created_at: string;
}

export default function HanjaStoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<HanjaStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const topics = [
    { value: "all", label: "Tất cả" },
    { value: "education", label: "Giáo dục" },
    { value: "family", label: "Gia đình" },
    { value: "work", label: "Công việc" },
    { value: "time", label: "Thời gian" },
    { value: "location", label: "Địa điểm" },
    { value: "daily_life", label: "Đời sống hàng ngày" },
    { value: "eps_topik", label: "EPS-TOPIK" },
  ];

  const difficulties = [
    { value: "all", label: "Tất cả" },
    { value: "easy", label: "Dễ" },
    { value: "medium", label: "Trung bình" },
    { value: "hard", label: "Khó" },
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      let query = supabase.from("hanja_stories").select("*").order("created_at", { ascending: false });

      if (selectedTopic !== "all") {
        query = query.eq("topic", selectedTopic);
      }

      if (selectedDifficulty !== "all") {
        query = query.eq("difficulty", selectedDifficulty);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [selectedTopic, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTopicLabel = (topic: string) => {
    const found = topics.find((t) => t.value === topic);
    return found?.label || topic;
  };

  const highlightHanjaWords = (content: string, hanjaWords: any[]) => {
    let highlightedContent = content;
    hanjaWords.forEach((word) => {
      const regex = new RegExp(word.korean, "g");
      highlightedContent = highlightedContent.replace(
        regex,
        `<span class="bg-app-accent-primary/20 text-app-accent-primary px-1 rounded font-semibold cursor-pointer hover:bg-app-accent-primary/30" title="${word.hanja} - ${word.vietnamese}">${word.korean}</span>`
      );
    });
    return highlightedContent;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Truyện Chêm - Học Hanja qua Truyện</h1>
          <p className="text-app-text-muted">Học từ vựng Hanja thông qua những câu chuyện thú vị</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div>
            <label className="block text-sm text-app-text-muted mb-1">Chủ đề</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-app-card border border-app-border rounded-lg px-3 py-2 text-white text-sm"
            >
              {topics.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-app-text-muted mb-1">Độ khó</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-app-card border border-app-border rounded-lg px-3 py-2 text-white text-sm"
            >
              {difficulties.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-app-border bg-app-card/30 animate-pulse">
                <div className="h-6 bg-app-card/50 rounded w-3/4 mb-3" />
                <div className="h-4 bg-app-card/50 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-app-card/50 rounded" />
                  <div className="h-3 bg-app-card/50 rounded w-5/6" />
                  <div className="h-3 bg-app-card/50 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-book-open-line text-6xl text-app-text-muted mb-4" />
            <p className="text-app-text-muted">Chưa có truyện nào</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-6 rounded-2xl border border-app-border bg-app-card/30 hover:border-app-accent-primary/30 transition-colors"
              >
                {/* Story Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(story.difficulty)}`}
                      >
                        {story.difficulty === "easy" && "Dễ"}
                        {story.difficulty === "medium" && "Trung bình"}
                        {story.difficulty === "hard" && "Khó"}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-app-card/50 text-app-text-muted border border-app-border">
                        {getTopicLabel(story.topic)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-app-card/50 text-app-text-muted border border-app-border">
                        {story.hanja_words.length} từ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div
                  className="text-white/80 mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightHanjaWords(story.content, story.hanja_words) }}
                />

                {/* Hanja Words List */}
                <div className="mb-4 p-4 rounded-xl bg-app-surface/50 border border-app-border">
                  <p className="text-sm font-semibold text-white mb-2">Từ vựng Hanja:</p>
                  <div className="flex flex-wrap gap-2">
                    {story.hanja_words.map((word, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-app-card/50 border border-app-border text-sm"
                      >
                        <span className="text-white">{word.korean}</span>
                        <span className="text-app-text-muted mx-1">|</span>
                        <span className="text-app-accent-primary">{word.hanja}</span>
                        <span className="text-app-text-muted mx-1">|</span>
                        <span className="text-white/60">{word.vietnamese}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/hanja-stories/${story.id}`)}
                    className="px-4 py-2 bg-app-accent-primary text-black font-semibold rounded-lg hover:bg-[#d4b43a] transition-colors"
                  >
                    Đọc & Làm Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
