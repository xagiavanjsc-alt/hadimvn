import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author_name: string;
  author_id: string;
  upvotes: number;
  downvotes: number;
  answer_count: number;
  views: number;
  created_at: string;
  is_voted?: "up" | "down";
}

const TAGS = ["EPS", "TOPIK", "Ngữ pháp", "Từ vựng", "Nghe", "Đọc", "Viết", "Khác"];

export default function QAForumPage() {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });

  usePageSEO({
    title: "Diễn đàn hỏi đáp EPS/TOPIK | Hàn Quốc Ơi!",
    description: "Đặt câu hỏi và chia sẻ kiến thức về EPS/TOPIK. Hỏi đáp về ngữ pháp, từ vựng, kỹ năng thi với cộng đồng người học tiếng Hàn.",
    keywords: "diễn đàn tiếng Hàn, hỏi đáp EPS, hỏi đáp TOPIK, Q&A forum",
    path: "/qa-forum",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "QAPage",
      name: "Diễn đàn hỏi đáp EPS/TOPIK",
      description: "Q&A forum for EPS/TOPIK exam preparation",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data: questionsData, error } = await supabase
        .from("forum_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check user votes
      const { data: votes } = await supabase
        .from("forum_votes")
        .select("question_id, vote_type")
        .eq("user_id", user?.id);

      const voteMap = new Map(votes?.map(v => [v.question_id, v.vote_type]));

      const questionsWithVotes = (questionsData || []).map((q: ForumQuestion) => ({
        ...q,
        is_voted: voteMap.get(q.id) as "up" | "down" | undefined,
      }));

      setQuestions(questionsWithVotes);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  const handleCreateQuestion = async () => {
    if (!user || !newQuestion.title || !newQuestion.content) return;

    try {
      const { error } = await supabase.from("forum_questions").insert({
        title: newQuestion.title,
        content: newQuestion.content,
        tags: newQuestion.tags,
        author_id: user.id,
        author_name: profile?.display_name || "Người dùng",
      });

      if (error) throw error;

      setShowCreateModal(false);
      setNewQuestion({ title: "", content: "", tags: [] });
      fetchQuestions();
    } catch (error) {
      console.error("Error creating question:", error);
    }
  };

  const handleVote = async (questionId: string, voteType: "up" | "down") => {
    if (!user) return;

    try {
      const existingVote = questions.find(q => q.id === questionId)?.is_voted;

      if (existingVote === voteType) {
        // Remove vote
        await supabase
          .from("forum_votes")
          .delete()
          .eq("question_id", questionId)
          .eq("user_id", user.id);
      } else {
        // Add or update vote
        await supabase.from("forum_votes").upsert({
          question_id: questionId,
          user_id: user.id,
          vote_type: voteType,
        });
      }

      fetchQuestions();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const toggleTag = (tag: string) => {
    setNewQuestion(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const filteredQuestions = questions.filter(q => {
    const matchesTag = selectedTag === "all" || q.tags.includes(selectedTag);
    const matchesSearch = searchQuery === "" ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      "EPS": "#4ade80",
      "TOPIK": "#60a5fa",
      "Ngữ pháp": "#e8c84a",
      "Từ vựng": "#f87171",
      "Nghe": "#a78bfa",
      "Đọc": "#34d399",
      "Viết": "#fb923c",
      "Khác": "#94a3b8",
    };
    return colors[tag] || "#94a3b8";
  };

  return (
    <DashboardLayout title="Diễn đàn hỏi đáp" subtitle="Chia sẻ kiến thức và kinh nghiệm">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-lg font-bold">Câu hỏi mới nhất</h2>
              <p className="text-app-text-muted text-sm">Hỏi đáp về EPS, TOPIK, ngữ pháp, từ vựng</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              <i className="ri-add-line mr-1"></i>Đặt câu hỏi
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm" />
              <input
                type="text"
                placeholder="Tìm câu hỏi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
              />
            </div>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
            >
              <option value="all">Tất cả tag</option>
              {TAGS.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-app-surface/50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-white">{questions.length}</p>
              <p className="text-app-text-muted text-[10px]">Câu hỏi</p>
            </div>
            <div className="bg-app-surface/50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-app-accent-primary">
                {questions.reduce((sum, q) => sum + q.answer_count, 0)}
              </p>
              <p className="text-app-text-muted text-[10px]">Trả lời</p>
            </div>
            <div className="bg-app-surface/50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-white">
                {questions.reduce((sum, q) => sum + q.upvotes - q.downvotes, 0)}
              </p>
              <p className="text-app-text-muted text-[10px]">Lượt vote</p>
            </div>
            <div className="bg-app-surface/50 rounded-lg p-2 text-center">
              <p className="text-xl font-bold text-white">
                {questions.reduce((sum, q) => sum + q.views, 0)}
              </p>
              <p className="text-app-text-muted text-[10px]">Lượt xem</p>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-question-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Chưa có câu hỏi nào</p>
            <p className="text-app-text-muted text-sm mb-4">Đặt câu hỏi đầu tiên để bắt đầu thảo luận</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Đặt câu hỏi
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                className="bg-app-bg border border-app-border rounded-2xl p-5"
              >
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-1 min-w-[50px]">
                    <button
                      onClick={() => handleVote(question.id, "up")}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                        question.is_voted === "up"
                          ? "bg-app-accent-primary/20 text-app-accent-primary"
                          : "bg-app-surface/30 text-app-text-muted hover:text-white"
                      }`}
                    >
                      <i className="ri-arrow-up-line text-lg" />
                    </button>
                    <span className="text-white font-bold text-sm">
                      {question.upvotes - question.downvotes}
                    </span>
                    <button
                      onClick={() => handleVote(question.id, "down")}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                        question.is_voted === "down"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-app-surface/30 text-app-text-muted hover:text-white"
                      }`}
                    >
                      <i className="ri-arrow-down-line text-lg" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-base mb-2 hover:text-app-accent-primary cursor-pointer">
                      {question.title}
                    </h3>
                    <p className="text-app-text-muted text-sm mb-3 line-clamp-2">
                      {question.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {question.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${getTagColor(tag)}15`,
                            color: getTagColor(tag),
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-app-text-muted">
                      <span>{question.author_name}</span>
                      <span>•</span>
                      <span>{new Date(question.created_at).toLocaleDateString("vi-VN")}</span>
                      <span>•</span>
                      <span>{question.answer_count} trả lời</span>
                      <span>•</span>
                      <span>{question.views} lượt xem</span>
                    </div>
                  </div>
                </div>
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
              <h3 className="text-white font-bold text-lg">Đặt câu hỏi mới</h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Tiêu đề</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="VD: Cách dùng ngữ pháp ~(으)려고 하다?"
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                />
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Nội dung</label>
                <textarea
                  value={newQuestion.content}
                  onChange={e => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  placeholder="Mô tả chi tiết câu hỏi của bạn..."
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        newQuestion.tags.includes(tag)
                          ? "text-white"
                          : "text-app-text-muted bg-app-surface/50"
                      }`}
                      style={
                        newQuestion.tags.includes(tag)
                          ? { backgroundColor: getTagColor(tag) }
                          : {}
                      }
                    >
                      {tag}
                    </button>
                  ))}
                </div>
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
                onClick={handleCreateQuestion}
                disabled={!newQuestion.title || !newQuestion.content}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Đăng câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
