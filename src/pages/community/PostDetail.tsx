import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useToast } from "@/components/base/Toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase, resolveStoragePaths } from "@/lib/supabase";
import { sanitizeHtml } from "@/lib/sanitize";
import { usePageSEO } from "@/hooks/usePageSEO";
import DisplayNamePromptModal from "@/components/feature/DisplayNamePromptModal";
import { isEmailLikeName } from "@/hooks/useDisplayNameStatus";

// ─── SEO Component (uses usePageSEO) ──────────────────────────────────────────
function PostSEO({ post, slug }: { post: Post; slug: string }) {
  const plainText = post.content.replace(/<[^>]*>/g, '').slice(0, 300);
  const imageMatch = post.content.match(/<img loading="lazy" decoding="async"[^>]+src=["']([^"']+)["']/);
  const firstImage = imageMatch?.[1];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": plainText.slice(0, 160),
    "author": { "@type": "Person", "name": post.author_name },
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "image": firstImage || undefined,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://hanquocoi.vn/community/${slug}`,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hàn Quốc Ơi!",
      "logo": {
        "@type": "ImageObject",
        "url": "/images/brand/logo.svg",
      },
    },
  };

  if (post.rating_count && post.rating_count > 0 && post.rating_average) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": post.rating_average.toFixed(1),
      "ratingCount": post.rating_count,
      "bestRating": "5",
      "worstRating": "1",
    };
  }

  usePageSEO({
    title: `${post.title} - Cộng đồng Hàn Quốc Ơi!`,
    description: plainText.slice(0, 160),
    path: `/community/${slug}`,
    image: firstImage,
    ogType: "article",
    keywords: post.tags?.join(", "),
    jsonLd: schema,
  });

  return null;
}

interface Post {
  id: string;
  user_id: string | null;
  author_name: string;
  author_level: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments_count: number;
  is_pinned: boolean;
  exam_score: number | null;
  streak_days: number | null;
  created_at: string;
  rating_average?: number;
  rating_count?: number;
  status?: "pending" | "approved" | "rejected" | null;
  quiz?: {
    question: string;
    image_url?: string;
    options: { id: number; text: string; is_correct: boolean }[];
    explanation?: string;
  } | null;
  quiz_total_answers?: number;
  quiz_correct_answers?: number;
}

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  author_name: string;
  author_level: string;
  content: string;
  likes: number;
  created_at: string;
  status?: "pending" | "approved" | "rejected" | null;
  replies?: Comment[];
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  question: { label: "Hỏi đáp", icon: "ri-question-answer-line", color: "#60a5fa" },
  share: { label: "Chia sẻ", icon: "ri-share-line", color: "#34d399" },
  result: { label: "Kết quả thi", icon: "ri-trophy-line", color: "#FFD700" },
  tip: { label: "Mẹo học", icon: "ri-lightbulb-line", color: "#fb923c" },
};

// ─── Quiz Card (trong trang chi tiết) ────────────────────────────────────────────
function QuizCard({ post, currentUser, profile }: { post: Post; currentUser: { id: string } | null; profile: { display_name?: string } | null }) {
  const quiz = post.quiz;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAnswers, setTotalAnswers] = useState(post.quiz_total_answers || 0);
  const [correctAnswers, setCorrectAnswers] = useState(post.quiz_correct_answers || 0);
  const [showAnswer, setShowAnswer] = useState(false);

  const isAuthor = currentUser && post.user_id === currentUser.id;
  const correctOption = quiz?.options?.find(o => o.is_correct);

  // Fetch existing answer
  useEffect(() => {
    if (!currentUser || !quiz) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("community_quiz_answers")
        .select("selected_option, is_correct")
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (data) {
        setSelected(data.selected_option);
        setSubmitted(true);
      }
      setLoading(false);
    })();
  }, [post.id, currentUser?.id, quiz]);

  if (!quiz) return null;

  const handleSelect = async (optionId: number) => {
    if (!currentUser) {
      setError("Vui lòng đăng nhập để trả lời");
      return;
    }
    if (isAuthor) {
      setError("Bạn không thể trả lời câu hỏi của chính mình");
      return;
    }
    if (submitted || submitting) return;

    setSubmitting(true);
    setError(null);

    const option = quiz.options.find(o => o.id === optionId);
    const isCorrect = option?.is_correct || false;

    const { error: insertError } = await supabase
      .from("community_quiz_answers")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        selected_option: optionId,
        is_correct: isCorrect,
      });

    if (insertError) {
      setError("Lỗi: " + insertError.message);
      setSubmitting(false);
      return;
    }

    setSelected(optionId);
    setSubmitted(true);
    setTotalAnswers(v => v + 1);
    if (isCorrect) setCorrectAnswers(v => v + 1);

    // Auto-post comment: tăng engagement + SEO cho bài viết
    const letter = String.fromCharCode(65 + (quiz.options.findIndex(o => o.id === optionId)));
    const correct = quiz.options.find(o => o.is_correct);
    const commentText = isCorrect
      ? `✅ Mình chọn <strong>${letter}. ${option?.text}</strong> và đã trả lời đúng! 🎉`
      : `❌ Mình chọn <strong>${letter}. ${option?.text}</strong>, đáp án đúng là <strong>${correct?.text}</strong>.`;

    await supabase.from("community_comments").insert({
      post_id: post.id,
      parent_id: null,
      user_id: currentUser.id,
      author_name: profile?.display_name || "Học viên",
      author_level: "Học viên",
      content: commentText,
      status: "approved", // auto-approve quiz answer comments
    });

    setSubmitting(false);
  };

  const correctPct = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const selectedOption = quiz.options.find(o => o.id === selected);
  const isSelectedCorrect = selectedOption?.is_correct || false;

  return (
    <div className="mt-4 bg-gradient-to-br from-app-accent-primary/5 to-[#60a5fa]/5 border border-app-accent-primary/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-question-line text-app-accent-primary"></i>
        <span className="text-app-accent-primary text-xs font-bold uppercase tracking-wide">Câu hỏi trắc nghiệm</span>
        {totalAnswers > 0 && (
          <span className="ml-auto text-app-text-muted text-[10px]">
            <i className="ri-group-line mr-0.5"></i>
            {correctAnswers}/{totalAnswers} đúng ({correctPct}%)
          </span>
        )}
      </div>

      {quiz.image_url && (
        <img loading="lazy" decoding="async" src={quiz.image_url} alt="" className="w-full max-h-64 object-contain rounded-lg mb-3 border border-app-border" />
      )}

      {loading ? (
        <p className="text-app-text-muted text-xs">Đang tải...</p>
      ) : (
        <div className="space-y-2">
          {quiz.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selected === opt.id;
            const showCorrect = (submitted && showAnswer) && opt.is_correct;
            const showWrong = (submitted && showAnswer) && isSelected && !opt.is_correct;

            return (
              <button
                key={opt.id}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt.id); }}
                disabled={submitted || submitting || isAuthor || !currentUser}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                  showCorrect
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : showWrong
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : isSelected
                    ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-white"
                    : "bg-app-card/30 border-app-border text-white/70 hover:border-white/20 cursor-pointer"
                } ${submitted || submitting || isAuthor || !currentUser ? "cursor-not-allowed" : ""}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  showCorrect ? "bg-emerald-500/30 text-emerald-200" :
                  showWrong ? "bg-red-500/30 text-red-200" :
                  "bg-app-card/50 text-app-text-secondary"
                }`}>
                  {showCorrect ? <i className="ri-check-line"></i> : showWrong ? <i className="ri-close-line"></i> : letter}
                </span>
                <span className="text-sm flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-2"><i className="ri-error-warning-line mr-1"></i>{error}</p>
      )}

      {submitted && !showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="mt-3 text-xs text-app-accent-primary hover:underline cursor-pointer"
        >
          <i className="ri-eye-line mr-1"></i>Xem đáp án
        </button>
      )}

      {submitted && showAnswer && (
        <>
          <div className={`mt-3 p-3 rounded-lg border ${
            isSelectedCorrect
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            {isSelectedCorrect ? (
              <p className="text-emerald-400 text-sm font-semibold">
                <i className="ri-trophy-line mr-1"></i>Chính xác! Bạn được +1 XP 🎉
              </p>
            ) : (
              <p className="text-red-400 text-sm font-semibold mb-1">
                <i className="ri-close-circle-line mr-1"></i>Sai rồi. Đáp án đúng: <strong>{correctOption?.text}</strong>
              </p>
            )}
            {quiz.explanation && (
              <div className="text-white/70 text-xs mt-2 leading-relaxed post-content-preview">
                <div className="flex items-center gap-1 mb-1 text-[#FFD700]">
                  <i className="ri-lightbulb-line"></i>
                  <span className="font-semibold">Giải thích:</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(resolveStoragePaths(quiz.explanation ?? "")) }} />
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAnswer(false)}
            className="mt-2 text-xs text-app-text-muted hover:text-white cursor-pointer"
          >
            <i className="ri-arrow-up-line mr-1"></i>Thu gọn
          </button>
        </>
      )}

      {!currentUser && (
        <p className="text-app-text-muted text-[11px] mt-2 text-center">
          <i className="ri-lock-line mr-1"></i>Đăng nhập để tham gia trả lời
        </p>
      )}
      {isAuthor && (
        <p className="text-app-text-muted text-[11px] mt-2 text-center">
          <i className="ri-information-line mr-1"></i>Bạn là tác giả — không thể tự trả lời
        </p>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Vừa xong";
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function CommentThread({
  comment,
  depth,
  onReply,
  currentUser,
  profile,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: string, author: string) => void;
  currentUser: { id: string } | null;
  profile: { display_name: string } | null;
}) {
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className={`${depth > 0 ? "ml-10 border-l-2 border-app-border pl-4" : ""}`}>
      <div className="flex gap-3 py-4">
        <div className="w-8 h-8 rounded-full bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-user-line text-app-accent-primary text-xs"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-white/90 text-sm font-semibold">{comment.author_name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{comment.author_level}</span>
            <span className="text-[10px] text-app-text-muted">{timeAgo(comment.created_at)}</span>
            {comment.status === "pending" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <i className="ri-time-line mr-0.5"></i>Đang chờ duyệt
              </span>
            )}
            {comment.status === "rejected" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
                <i className="ri-close-circle-line mr-0.5"></i>Bị từ chối
              </span>
            )}
          </div>
          <div
            className="text-white/65 text-sm leading-relaxed comment-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(resolveStoragePaths(comment.content ?? "")) }}
          />
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => toggleLike(comment.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer whitespace-nowrap ${likedComments.has(comment.id) ? "text-app-accent-primary" : "text-app-text-muted hover:text-white/50"}`}
            >
              <i className={likedComments.has(comment.id) ? "ri-heart-fill" : "ri-heart-line"}></i>
              {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
            </button>
            {currentUser && depth < 2 && (
              <button
                onClick={() => onReply(comment.id, comment.author_name)}
                className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-reply-line"></i>Trả lời
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentThread key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} currentUser={currentUser} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage({ postId, titleSlug }: { postId: string; titleSlug?: string }) {
  const [nameBlockerOpen, setNameBlockerOpen] = useState(false);
  // The previous line keeps the blocker state at top-of-component scope so it
  // can be referenced inside the comment-submit handler below.
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolvedPostId, setResolvedPostId] = useState(postId);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingToast, setRatingToast] = useState<{ stars: number } | null>(null);

  const fetchData = useCallback(async () => {
    let actualId = resolvedPostId;

    // Nếu là slug title mới (không phải UUID), tra cứu theo slug
    if (titleSlug && !/^[0-9a-f]{8}-[0-9a-f]{4}/.test(resolvedPostId)) {
      // Lấy tất cả posts và tìm theo title slug
      const { data: allPosts } = await supabase
        .from("community_posts")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (allPosts) {
        const { slugify } = await import("@/lib/slugify");
        const matched = allPosts.find((p: { id: string; title: string }) => slugify(p.title, 80) === titleSlug);
        if (matched) {
          actualId = matched.id;
          setResolvedPostId(matched.id);
        }
      }
    }

    const [postRes, commentsRes] = await Promise.all([
      supabase.from("community_posts").select("*").eq("id", actualId).maybeSingle(),
      supabase.from("community_comments").select("*").eq("post_id", actualId).order("created_at", { ascending: true }).limit(500),
    ]);

    if (postRes.data) setPost(postRes.data as Post);

    // Fetch existing rating của user
    if (user && actualId) {
      const { data: ratingRow } = await supabase
        .from("community_ratings")
        .select("rating")
        .eq("post_id", actualId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (ratingRow) setUserRating(ratingRow.rating);
    }

    if (commentsRes.data) {
      const map: Record<string, Comment> = {};
      const roots: Comment[] = [];
      commentsRes.data.forEach((c: Comment) => { map[c.id] = { ...c, replies: [] }; });
      commentsRes.data.forEach((c: Comment) => {
        if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies!.push(map[c.id]);
        else roots.push(map[c.id]);
      });
      setComments(roots);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetchData(); }, [fetchData, titleSlug]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || submitting) return;
    if (isEmailLikeName(profile?.display_name, user.email)) {
      setNameBlockerOpen(true);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("community_comments").insert({
      post_id: resolvedPostId,
      parent_id: replyTo?.id || null,
      user_id: user.id,
      author_name: profile?.display_name || "Học viên",
      author_level: "Học viên",
      content: commentText.trim(),
      status: "pending",
    });
    if (error) {
      showToast(`Lỗi gửi bình luận: ${error.message}`, "error", 4000);
    } else {
      setCommentText("");
      setReplyTo(null);
      await fetchData();
      showToast("Bình luận đã gửi — đang chờ quản trị viên duyệt", "success", 3000);
    }
    setSubmitting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRating = async (rating: number) => {
    if (!user || !post || ratingSubmitting) return;

    // Chỉ cho phép đánh giá 4-5 sao, nếu đánh giá thấp hơn thì random 4-5
    let finalRating = rating;
    if (rating < 4) {
      // Random 4 hoặc 5 sao nếu user cố đánh giá thấp
      finalRating = Math.random() > 0.5 ? 5 : 4;
    }

    setRatingSubmitting(true);

    // Upsert để handle cả trường hợp user đã đánh giá trước đó
    const { error } = await supabase.from("community_ratings").upsert({
      user_id: user.id,
      post_id: resolvedPostId,
      rating: finalRating,
      status: "pending", // Đợi admin duyệt
    }, { onConflict: "user_id,post_id" });

    setRatingSubmitting(false);

    if (error) {
      showToast(`Lỗi đánh giá: ${error.message}`, "error", 4000);
    } else {
      setUserRating(finalRating);
      setRatingToast({ stars: finalRating });
      // Auto hide sau 2.8s
      setTimeout(() => setRatingToast(null), 2800);
    }
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
  const cat = post ? (CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.share) : null;

  return (
    <>
      {post && <PostSEO post={post} slug={titleSlug || resolvedPostId} />}
      <DashboardLayout
        title="Chi tiết bài đăng"
        subtitle="Cộng đồng Hàn Quốc Ơi!"
        actions={
          <button onClick={() => navigate("/community")} className="flex items-center gap-2 text-white/50 hover:text-white text-sm cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
        }
      >
        <ToastComponent />
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
        </div>
      ) : !post ? (
        <div className="text-center py-24">
          <i className="ri-file-unknow-line text-white/10 text-5xl mb-4"></i>
          <p className="text-app-text-muted">Bài đăng không tồn tại</p>
          <button onClick={() => navigate("/community")} className="mt-4 text-app-accent-primary text-sm cursor-pointer whitespace-nowrap">← Quay lại cộng đồng</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-5xl">
          {/* Main content */}
          <div>
            {/* Post */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-7 mb-6">
              {/* Category + meta */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {cat && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    <i className={`${cat.icon} mr-1`}></i>{cat.label}
                  </span>
                )}
                {post.exam_score && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-app-accent-success">
                    <i className="ri-trophy-line mr-1"></i>{post.exam_score}%
                  </span>
                )}
                {post.streak_days && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#fb923c]/10 text-[#fb923c]">
                    <i className="ri-fire-line mr-1"></i>{post.streak_days} ngày streak
                  </span>
                )}
                <span className="text-app-text-muted text-xs ml-auto">{timeAgo(post.created_at)}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-line text-app-accent-primary text-sm"></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{post.author_name}</p>
                  <p className="text-white/35 text-xs">{post.author_level}</p>
                </div>
              </div>

              {/* Title + content */}
              <h1 className="text-white font-bold text-xl mb-4 leading-snug">{post.title}</h1>
              <div
                className="post-content text-white/75 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(resolveStoragePaths(post.content ?? "")) }}
              />
              <style>{`
                .post-content h1 { font-size: 1.5rem; font-weight: 700; margin: 0.8em 0 0.4em; color: #fff; }
                .post-content h2 { font-size: 1.25rem; font-weight: 700; margin: 0.8em 0 0.4em; color: #fff; }
                .post-content h3 { font-size: 1.1rem; font-weight: 600; margin: 0.6em 0 0.3em; color: #fff; }
                .post-content p { margin: 0.5em 0; }
                .post-content ul, .post-content ol { padding-left: 24px; margin: 8px 0; }
                .post-content li { margin: 4px 0; }
                .post-content a { color: #d4b43a; text-decoration: underline; }
                .post-content blockquote { border-left: 3px solid #d4b43a; padding-left: 12px; margin: 8px 0; color: rgba(255,255,255,0.6); font-style: italic; }
                .post-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 8px 0; display: block; }
                .post-content strong, .post-content b { font-weight: 700; color: #fff; }
                .post-content em, .post-content i { font-style: italic; }
                /* Override inline styles from pasted content (Word/Google Docs) */
                .post-content h1 span, .post-content h2 span, .post-content h3 span {
                  font-size: inherit !important;
                  font-weight: inherit !important;
                  color: inherit !important;
                }
              `}</style>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-app-surface/50 text-app-text-muted border border-app-border">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Quiz (nếu post là câu hỏi trắc nghiệm) */}
              {post.quiz && <QuizCard post={post} currentUser={user} profile={profile} />}

              {/* Actions */}
              <div className="flex items-center gap-5 mt-6 pt-5 border-t border-app-border">
                <div className="flex items-center gap-1.5 text-sm text-app-text-secondary">
                  <i className="ri-heart-line"></i>
                  <span>{post.likes} lượt thích</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-app-text-secondary">
                  <i className="ri-chat-3-line"></i>
                  <span>{totalComments} bình luận</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-app-text-secondary">
                  <i className="ri-star-fill text-[#FFD700]"></i>
                  <span className="font-semibold">{post.rating_average?.toFixed(1) || "0.0"}</span>
                  <span className="text-xs">({post.rating_count || 0} đánh giá)</span>
                </div>
                {user && !userRating && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-app-text-muted mr-2">Đánh giá:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        disabled={ratingSubmitting}
                        className="text-lg cursor-pointer hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: star <= 3 ? "#666" : "#FFD700" }}
                        title={star <= 3 ? "Chỉ được đánh giá 4-5 sao" : `${star} sao`}
                      >
                        <i className={star <= 3 ? "ri-star-line" : "ri-star-fill"}></i>
                      </button>
                    ))}
                  </div>
                )}
                {userRating && (
                  <div className="flex items-center gap-1 ml-auto text-sm text-app-accent-primary">
                    <i className="ri-star-fill"></i>
                    <span>Đã đánh giá {userRating} sao</span>
                  </div>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm text-app-text-secondary hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className={copied ? "ri-check-line" : "ri-share-line"}></i>
                  {copied ? "Đã sao chép!" : "Chia sẻ link"}
                </button>
              </div>
            </div>

            {/* Comments section */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-6">
              <h2 className="text-white font-bold text-base mb-5">
                Bình luận <span className="text-app-text-muted font-normal text-sm">({totalComments})</span>
              </h2>

              {/* Comment input */}
              {user ? (
                <div className="mb-6">
                  {replyTo && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-lg">
                      <i className="ri-reply-line text-app-accent-primary text-xs"></i>
                      <span className="text-app-accent-primary/70 text-xs">Đang trả lời <strong>{replyTo.author}</strong></span>
                      <button onClick={() => setReplyTo(null)} className="ml-auto text-app-text-muted hover:text-white/60 cursor-pointer">
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-user-line text-app-accent-primary text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value.slice(0, 500))}
                        placeholder={replyTo ? `Trả lời ${replyTo.author}...` : "Viết bình luận của bạn..."}
                        rows={3}
                        className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20 resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-app-text-muted text-[10px]">{commentText.length}/500</span>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!commentText.trim() || submitting}
                          className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                        >
                          {submitting ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-fill"></i>}
                          Gửi bình luận
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-app-surface/50 border border-app-border rounded-xl text-center">
                  <p className="text-app-text-secondary text-sm">Đăng nhập để tham gia bình luận</p>
                </div>
              )}

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <i className="ri-chat-3-line text-white/10 text-4xl mb-3"></i>
                  <p className="text-app-text-muted text-sm">Chưa có bình luận nào</p>
                  <p className="text-app-text-muted text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/3">
                  {comments.map(c => (
                    <CommentThread
                      key={c.id}
                      comment={c}
                      depth={0}
                      onReply={(id, author) => setReplyTo({ id, author })}
                      currentUser={user ? { id: user.id } : null}
                      profile={profile}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Về bài đăng này</h3>
              <div className="space-y-3">
                {[
                  { icon: "ri-user-line", label: "Tác giả", value: post.author_name },
                  { icon: "ri-time-line", label: "Đăng lúc", value: new Date(post.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) },
                  { icon: "ri-heart-line", label: "Lượt thích", value: post.likes.toString() },
                  { icon: "ri-chat-3-line", label: "Bình luận", value: totalComments.toString() },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <i className={`${s.icon} text-app-text-muted text-sm w-4`}></i>
                    <span className="text-white/35 text-xs">{s.label}:</span>
                    <span className="text-white/70 text-xs font-medium ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Chia sẻ bài đăng</h3>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-xl text-white/60 text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className={copied ? "ri-check-line text-app-accent-success" : "ri-link-m"}></i>
                {copied ? "Đã sao chép link!" : "Sao chép link bài"}
              </button>
            </div>

            <button
              onClick={() => navigate("/community")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 rounded-xl text-app-accent-primary text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-group-line"></i>
              Xem tất cả bài đăng
            </button>
          </div>
        </div>
      )}
      {nameBlockerOpen && (
        <DisplayNamePromptModal
          blocking
          onClose={() => setNameBlockerOpen(false)}
          onSaved={() => setNameBlockerOpen(false)}
        />
      )}
    </DashboardLayout>

    {/* Rating success toast - centered popup */}
    {ratingToast && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={() => setRatingToast(null)}
      >
        <div
          className="bg-gradient-to-br from-app-bg to-app-card border border-app-accent-primary/30 rounded-2xl px-8 py-6 shadow-2xl max-w-xs mx-4 animate-[scaleIn_0.25s_ease-out] text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <i
                key={s}
                className={`ri-star-fill text-2xl ${s <= ratingToast.stars ? "text-[#FFD700]" : "text-white/15"}`}
                style={s <= ratingToast.stars ? { animation: `starPop 0.4s ease-out ${s * 0.08}s both` } : {}}
              />
            ))}
          </div>
          <p className="text-white font-bold text-base mb-1">
            Cảm ơn bạn đã đánh giá {ratingToast.stars} sao!
          </p>
          <p className="text-white/55 text-xs leading-relaxed">
            Đánh giá của bạn đang chờ quản trị viên duyệt trước khi hiển thị công khai.
          </p>
          <button
            onClick={() => setRatingToast(null)}
            className="mt-4 px-5 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-xs font-bold cursor-pointer transition-colors"
          >
            Đã hiểu
          </button>
        </div>
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes scaleIn { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          @keyframes starPop { 0% { transform: scale(0); opacity: 0 } 60% { transform: scale(1.3) } 100% { transform: scale(1); opacity: 1 } }
        `}</style>
      </div>
    )}
    </>
  );
}

