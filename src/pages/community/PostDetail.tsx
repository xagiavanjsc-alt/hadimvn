import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase, resolveStoragePaths } from "@/lib/supabase";

// ─── SEO Component ─────────────────────────────────────────────────────────────
function PostSEO({ post }: { post: Post }) {
  useEffect(() => {
    // Update document title
    document.title = `${post.title} - Cộng đồng Hàn Quốc Ơi!`;

    // Update meta description
    const plainText = post.content.replace(/<[^>]*>/g, '').slice(0, 160);
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', plainText);
    }

    // Add Open Graph tags
    updateMetaTag('og:title', post.title);
    updateMetaTag('og:description', plainText);
    updateMetaTag('og:type', 'article');
    updateMetaTag('og:url', window.location.href);

    // Add Twitter Card tags
    updateMetaTag('twitter:title', post.title);
    updateMetaTag('twitter:description', plainText);
    updateMetaTag('twitter:card', 'summary_large_image');

    // Add structured data (Article)
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": plainText,
      "author": {
        "@type": "Person",
        "name": post.author_name
      },
      "datePublished": post.created_at,
      "dateModified": post.created_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };

    const existingSchema = document.getElementById('post-schema');
    if (existingSchema) existingSchema.remove();

    const script = document.createElement('script');
    script.id = 'post-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      if (existingSchema) existingSchema.remove();
    };
  }, [post]);

  return null;
}

function updateMetaTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(property.startsWith('twitter:') ? 'name' : 'property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
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
          <p className="text-white/65 text-sm leading-relaxed">{comment.content}</p>
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
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolvedPostId, setResolvedPostId] = useState(postId);

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
      supabase.from("community_comments").select("*").eq("post_id", actualId).order("created_at", { ascending: true }),
    ]);

    if (postRes.data) setPost(postRes.data as Post);

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
      alert(`Lỗi gửi bình luận: ${error.message}`);
    } else {
      setCommentText("");
      setReplyTo(null);
      await fetchData();
      alert("Bình luận đã gửi — đang chờ quản trị viên duyệt.");
    }
    setSubmitting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
  const cat = post ? (CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.share) : null;

  return (
    <>
      {post && <PostSEO post={post} />}
      <DashboardLayout
        title="Chi tiết bài đăng"
        subtitle="Cộng đồng Hàn Quốc Ơi!"
        actions={
          <button onClick={() => navigate("/community")} className="flex items-center gap-2 text-white/50 hover:text-white text-sm cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
        }
      >
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
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{resolveStoragePaths(post.content)}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-app-surface/50 text-app-text-muted border border-app-border">#{tag}</span>
                  ))}
                </div>
              )}

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
                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-1.5 text-sm text-app-text-secondary hover:text-app-accent-primary/70 transition-colors cursor-pointer whitespace-nowrap"
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
    </DashboardLayout>
    </>
  );
}

