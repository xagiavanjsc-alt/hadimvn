import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

interface SuccessStory {
  id: string;
  user_name: string;
  exam_type: "EPS" | "TOPIK_I" | "TOPIK_II";
  score: number;
  story: string;
  tips: string;
  study_duration: string;
  created_at: string;
  likes: number;
  is_liked?: boolean;
}

const EXAM_TYPES = ["EPS", "TOPIK_I", "TOPIK_II"];

export default function SuccessStoriesPage() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [newStory, setNewStory] = useState({
    exam_type: "EPS" as const,
    score: "",
    story: "",
    tips: "",
    study_duration: "",
  });

  usePageSEO({
    title: "Câu chuyện thành công EPS/TOPIK | Hàn Quốc Ơi!",
    description: "Chia sẻ và đọc câu chuyện thành công của những người đã đỗ EPS/TOPIK. Lấy cảm hứng và kinh nghiệm từ cộng đồng.",
    keywords: "câu chuyện thành công, kinh nghiệm thi EPS, kinh nghiệm thi TOPIK, success stories",
    path: "/success-stories",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Câu chuyện thành công EPS/TOPIK",
      description: "Success stories from EPS/TOPIK exam takers",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data: storiesData, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check user likes
      const { data: likes } = await supabase
        .from("story_likes")
        .select("story_id")
        .eq("user_id", user?.id);

      const likedStoryIds = new Set(likes?.map(l => l.story_id) || []);

      const storiesWithLikes = (storiesData || []).map((s: SuccessStory) => ({
        ...s,
        is_liked: likedStoryIds.has(s.id),
      }));

      setStories(storiesWithLikes);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  const handleCreateStory = async () => {
    if (!user || !newStory.story || !newStory.score) return;

    try {
      const { error } = await supabase.from("success_stories").insert({
        user_id: user.id,
        user_name: profile?.display_name || "Người dùng",
        exam_type: newStory.exam_type,
        score: parseInt(newStory.score),
        story: newStory.story,
        tips: newStory.tips,
        study_duration: newStory.study_duration,
      });

      if (error) throw error;

      setShowCreateModal(false);
      setNewStory({ exam_type: "EPS", score: "", story: "", tips: "", study_duration: "" });
      fetchStories();
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  const handleLike = async (storyId: string) => {
    if (!user) return;

    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      if (story.is_liked) {
        await supabase
          .from("story_likes")
          .delete()
          .eq("story_id", storyId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("story_likes").insert({
          story_id: storyId,
          user_id: user.id,
        });
      }

      fetchStories();
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  const filteredStories = stories.filter(s =>
    selectedExam === "all" || s.exam_type === selectedExam
  );

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "EPS": return "#4ade80";
      case "TOPIK_I": return "#60a5fa";
      case "TOPIK_II": return "#f87171";
      default: return "#94a3b8";
    }
  };

  const getExamTypeLabel = (type: string) => {
    switch (type) {
      case "EPS": return "EPS-TOPIK";
      case "TOPIK_I": return "TOPIK I";
      case "TOPIK_II": return "TOPIK II";
      default: return type;
    }
  };

  return (
    <DashboardLayout title="Câu chuyện thành công" subtitle="Cảm hứng từ cộng đồng">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-lg font-bold">Kể chuyện thành công của bạn</h2>
              <p className="text-app-text-muted text-sm">Chia sẻ kinh nghiệm để truyền cảm hứng cho người khác</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              <i className="ri-add-line mr-1"></i>Chia sẻ câu chuyện
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedExam("all")}
              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedExam === "all"
                  ? "bg-app-accent-primary text-app-bg font-semibold"
                  : "bg-app-surface/30 text-app-text-muted"
              }`}
            >
              Tất cả
            </button>
            {EXAM_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedExam(type)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  selectedExam === type
                    ? "text-white font-semibold"
                    : "bg-app-surface/30 text-app-text-muted"
                }`}
                style={selectedExam === type ? { backgroundColor: getExamTypeColor(type) } : {}}
              >
                {getExamTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{stories.length}</p>
            <p className="text-app-text-muted text-xs">Câu chuyện</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">
              {stories.reduce((sum, s) => sum + s.likes, 0)}
            </p>
            <p className="text-app-text-muted text-xs">Lượt thích</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {stories.length > 0 ? Math.round(stories.reduce((sum, s) => sum + s.score, 0) / stories.length) : 0}
            </p>
            <p className="text-app-text-muted text-xs">Điểm TB</p>
          </div>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-trophy-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Chưa có câu chuyện nào</p>
            <p className="text-app-text-muted text-sm mb-4">Hãy là người đầu tiên chia sẻ câu chuyện thành công của bạn</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Chia sẻ câu chuyện
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStories.map(story => (
              <div
                key={story.id}
                className="bg-app-bg border border-app-border rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getExamTypeColor(story.exam_type)}15`,
                          color: getExamTypeColor(story.exam_type),
                        }}
                      >
                        {getExamTypeLabel(story.exam_type)}
                      </span>
                      <span className="text-app-text-muted text-xs">
                        {story.score} điểm
                      </span>
                      {story.study_duration && (
                        <span className="text-app-text-muted text-xs">
                          • {story.study_duration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">{story.user_name}</h3>
                    <p className="text-app-text-faint text-xs">
                      {new Date(story.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(story.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      story.is_liked
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-app-surface/30 text-app-text-muted hover:text-white"
                    }`}
                  >
                    <i className="ri-heart-line" />
                    <span>{story.likes}</span>
                  </button>
                </div>

                <p className="text-white text-sm mb-3 leading-relaxed">{story.story}</p>

                {story.tips && (
                  <div className="bg-app-surface/30 rounded-lg p-3">
                    <p className="text-app-accent-primary text-xs font-semibold mb-1">
                      <i className="ri-lightbulb-line mr-1"></i>Mẹo:
                    </p>
                    <p className="text-app-text-muted text-xs">{story.tips}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="p-5 border-b border-app-border">
              <h3 className="text-white font-bold text-lg">Chia sẻ câu chuyện thành công</h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Loại thi</label>
                <select
                  value={newStory.exam_type}
                  onChange={e => setNewStory({ ...newStory, exam_type: e.target.value as "EPS" | "TOPIK_I" | "TOPIK_II" })}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                >
                  <option value="EPS">EPS-TOPIK</option>
                  <option value="TOPIK_I">TOPIK I</option>
                  <option value="TOPIK_II">TOPIK II</option>
                </select>
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Điểm số</label>
                <input
                  type="number"
                  value={newStory.score}
                  onChange={e => setNewStory({ ...newStory, score: e.target.value })}
                  placeholder="VD: 85"
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                />
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Thời gian học</label>
                <input
                  type="text"
                  value={newStory.study_duration}
                  onChange={e => setNewStory({ ...newStory, study_duration: e.target.value })}
                  placeholder="VD: 3 tháng, 6 tháng..."
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                />
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Câu chuyện của bạn</label>
                <textarea
                  value={newStory.story}
                  onChange={e => setNewStory({ ...newStory, story: e.target.value })}
                  placeholder="Chia sẻ hành trình học tập và thi đỗ của bạn..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-app-muted text-xs mb-1 block">Mẹo cho người khác</label>
                <textarea
                  value={newStory.tips}
                  onChange={e => setNewStory({ ...newStory, tips: e.target.value })}
                  placeholder="Mẹo và kinh nghiệm để thi đỗ..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50 resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-app-border flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateStory}
                disabled={!newStory.story || !newStory.score}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Đăng câu chuyện
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
