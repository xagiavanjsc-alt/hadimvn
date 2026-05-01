import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useAdminToast } from "@/contexts/AdminToastContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentTab = "community" | "lessons" | "reports";
type PostStatus = "pending" | "approved" | "rejected";
type ReportStatus = "pending" | "resolved" | "dismissed";
type ReportReason = "spam" | "offensive" | "misinformation" | "harassment" | "other";

interface Report {
  id: string;
  postId: string;
  postTitle: string;
  postAuthor: string;
  reportedBy: string;
  reason: ReportReason;
  detail: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  action?: string;
}

// ─── Mock reports ─────────────────────────────────────────────────────────────────
const mockReports: Report[] = [
  { id: "r-001", postId: "p-001", postTitle: "Chia sẻ kinh nghiệm thi EPS lần 3", postAuthor: "Nguyễn Văn A", reportedBy: "Trần Thị B", reason: "misinformation", detail: "Thông tin về điểm thi không chính xác, gây hiểu lầm cho người mới", status: "pending", createdAt: "2026-04-23T08:30:00Z" },
  { id: "r-002", postId: "p-002", postTitle: "Hỏi về visa lao động Hàn Quốc", postAuthor: "Lê Văn C", reportedBy: "Phạm Thị D", reason: "spam", detail: "Bài viết chứa link quảng cáo dịch vụ visa không rõ nguồn gốc", status: "pending", createdAt: "2026-04-22T15:20:00Z" },
  { id: "r-003", postId: "p-003", postTitle: "Kết quả thi EPS tháng 4/2026", postAuthor: "Hoàng Văn E", reportedBy: "Vũ Thị F", reason: "offensive", detail: "Bình luận trong bài viết có ngôn ngữ xúc phạm", status: "resolved", createdAt: "2026-04-21T10:00:00Z", resolvedAt: "2026-04-21T14:30:00Z", resolvedBy: "Admin", action: "Xóa bình luận vi phạm" },
  { id: "r-004", postId: "p-004", postTitle: "Mẹo học từ vựng EPS nhanh", postAuthor: "Bùi Thị H", reportedBy: "Đặng Văn G", reason: "other", detail: "Nội dung sao chép từ trang khác không ghi nguồn", status: "dismissed", createdAt: "2026-04-20T09:00:00Z", resolvedAt: "2026-04-20T11:00:00Z", resolvedBy: "Moderator", action: "Không vi phạm, đã bỏ qua" },
  { id: "r-005", postId: "p-005", postTitle: "Hỏi về chế độ bảo hiểm lao động", postAuthor: "Nguyễn Văn A", reportedBy: "Trần Thị B", reason: "harassment", detail: "Tác giả gửi tin nhắn quấy rối người bình luận", status: "pending", createdAt: "2026-04-23T11:45:00Z" },
  { id: "r-006", postId: "p-006", postTitle: "Chia sẻ kết quả thi TOPIK II", postAuthor: "Lê Văn C", reportedBy: "Hoàng Văn E", reason: "misinformation", detail: "Thông tin về cấu trúc đề thi không đúng", status: "pending", createdAt: "2026-04-22T07:30:00Z" },
];

const REASON_CONFIG: Record<ReportReason, { label: string; color: string; icon: string }> = {
  spam: { label: "Spam", color: "#fb923c", icon: "ri-spam-line" },
  offensive: { label: "Nội dung xấu", color: "#f87171", icon: "ri-emotion-unhappy-line" },
  misinformation: { label: "Sai thông tin", color: "#e8c84a", icon: "ri-error-warning-line" },
  harassment: { label: "Quấy rối", color: "#f87171", icon: "ri-user-forbid-line" },
  other: { label: "Khác", color: "#6b7280", icon: "ri-flag-line" },
};

const REPORT_STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: "Chờ xử lý", color: "#e8c84a", bg: "rgba(232,200,74,0.12)", icon: "ri-time-line" },
  resolved: { label: "Đã xử lý", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: "ri-checkbox-circle-line" },
  dismissed: { label: "Bỏ qua", color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: "ri-close-circle-line" },
};

interface CommunityPost {
  id: string;
  author_name: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  status?: PostStatus;
  user_id?: string;
}

interface LessonItem {
  id: string;
  title: string;
  artist?: string;
  submittedBy: string;
  submittedAt: string;
  status: PostStatus;
  type: "melon" | "eps" | "grammar";
  preview?: string;
}

// ─── Mock lesson submissions ──────────────────────────────────────────────────
const mockLessons: LessonItem[] = [
  { id: "l-001", title: "BTS - Dynamite (Bài học từ vựng)", artist: "BTS", submittedBy: "Nguyễn Văn A", submittedAt: "2026-04-22T10:00:00Z", status: "pending", type: "melon", preview: "Bài học từ vựng từ ca khúc Dynamite của BTS, bao gồm 25 từ vựng thông dụng..." },
  { id: "l-002", title: "Ngữ pháp -아/어서 (Vì... nên...)", submittedBy: "Trần Thị B", submittedAt: "2026-04-21T14:30:00Z", status: "pending", type: "grammar", preview: "Giải thích cấu trúc ngữ pháp -아/어서 với 10 ví dụ thực tế..." },
  { id: "l-003", title: "EPS Chủ đề: An toàn lao động (Bổ sung)", submittedBy: "Lê Văn C", submittedAt: "2026-04-20T09:15:00Z", status: "approved", type: "eps", preview: "Bổ sung 15 câu hỏi mới về an toàn lao động trong nhà máy..." },
  { id: "l-004", title: "IU - Celebrity (Phân tích lời bài hát)", artist: "IU", submittedBy: "Phạm Thị D", submittedAt: "2026-04-19T16:45:00Z", status: "rejected", type: "melon", preview: "Phân tích chi tiết lời bài hát Celebrity của IU..." },
  { id: "l-005", title: "Ngữ pháp -(으)면 (Nếu... thì...)", submittedBy: "Hoàng Văn E", submittedAt: "2026-04-18T11:20:00Z", status: "pending", type: "grammar", preview: "Cấu trúc điều kiện -(으)면 với 12 ví dụ từ đơn giản đến nâng cao..." },
  { id: "l-006", title: "NewJeans - Hype Boy (Từ vựng K-pop)", artist: "NewJeans", submittedBy: "Vũ Thị F", submittedAt: "2026-04-17T08:00:00Z", status: "approved", type: "melon", preview: "Học từ vựng qua bài Hype Boy, 20 từ vựng về tình cảm và cuộc sống..." },
];

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  question: { label: "Hỏi đáp", color: "#60a5fa", icon: "ri-question-answer-line" },
  share: { label: "Chia sẻ", color: "#34d399", icon: "ri-share-line" },
  result: { label: "Kết quả thi", color: "#FFD700", icon: "ri-trophy-line" },
  tip: { label: "Mẹo học", color: "#fb923c", icon: "ri-lightbulb-line" },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: "Chờ duyệt", color: "#e8c84a", bg: "rgba(232,200,74,0.12)", icon: "ri-time-line" },
  approved: { label: "Đã duyệt", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: "ri-checkbox-circle-line" },
  rejected: { label: "Từ chối", color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: "ri-close-circle-line" },
};

const LESSON_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  melon: { label: "Melon", color: "#a78bfa", icon: "ri-music-line" },
  eps: { label: "EPS", color: "#e8c84a", icon: "ri-file-list-3-line" },
  grammar: { label: "Ngữ pháp", color: "#34d399", icon: "ri-book-open-line" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Vừa xong";
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ action, title, onConfirm, onCancel }: {
  action: "approve" | "reject" | "pin" | "delete";
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const config = {
    approve: { label: "Duyệt", color: "#34d399", icon: "ri-checkbox-circle-line", desc: "Nội dung sẽ được hiển thị công khai." },
    reject: { label: "Từ chối", color: "#f87171", icon: "ri-close-circle-line", desc: "Nội dung sẽ bị ẩn và tác giả sẽ được thông báo." },
    pin: { label: "Ghim", color: "#e8c84a", icon: "ri-pushpin-line", desc: "Bài viết sẽ được ghim lên đầu trang cộng đồng." },
    delete: { label: "Xóa", color: "#f87171", icon: "ri-delete-bin-line", desc: "Hành động này không thể hoàn tác." },
  }[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-4"
            style={{ backgroundColor: `${config.color}15` }}>
            <i className={`${config.icon} text-xl`} style={{ color: config.color }}></i>
          </div>
          <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>
            {config.label}: &ldquo;{title.slice(0, 40)}{title.length > 40 ? "..." : ""}&rdquo;
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>{config.desc}</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
              Hủy
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: config.color }}>
              {config.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Drawer ───────────────────────────────────────────────────────
function PostDetailDrawer({ post, onClose, onApprove, onReject, onPin, onDelete }: {
  post: CommunityPost;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cat = CAT_CONFIG[post.category] || CAT_CONFIG.share;
  const status = (post.status || "approved") as PostStatus;
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-lg h-full border-l flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
              <i className={`${statusCfg.icon} mr-1`}></i>{statusCfg.label}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
              <i className={`${cat.icon} mr-1`}></i>{cat.label}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <h2 className="font-bold text-base leading-snug mb-2" style={{ color: "var(--admin-text)" }}>{post.title}</h2>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--admin-text-muted)" }}>
              <span><i className="ri-user-line mr-1"></i>{post.author_name}</span>
              <span><i className="ri-time-line mr-1"></i>{timeAgo(post.created_at)}</span>
              <span><i className="ri-heart-line mr-1"></i>{post.likes}</span>
              <span><i className="ri-chat-3-line mr-1"></i>{post.comments_count}</span>
            </div>
          </div>

          <div className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
            {post.content}
          </div>

          {post.is_pinned && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(232,200,74,0.08)", border: "1px solid rgba(232,200,74,0.2)" }}>
              <i className="ri-pushpin-fill text-[#e8c84a] text-xs"></i>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Bài viết đang được ghim</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t space-y-2 flex-shrink-0"
          style={{ borderColor: "var(--admin-border)" }}>
          <div className="grid grid-cols-2 gap-2">
            {status !== "approved" && (
              <button onClick={() => onApprove(post.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">
                <i className="ri-checkbox-circle-line"></i>Duyệt
              </button>
            )}
            {status !== "rejected" && (
              <button onClick={() => onReject(post.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap bg-rose-500 hover:bg-rose-400 text-white transition-colors">
                <i className="ri-close-circle-line"></i>Từ chối
              </button>
            )}
            <button onClick={() => onPin(post.id)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
              <i className={post.is_pinned ? "ri-unpin-line" : "ri-pushpin-line"}></i>
              {post.is_pinned ? "Bỏ ghim" : "Ghim"}
            </button>
            <button onClick={() => onDelete(post.id)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
              <i className="ri-delete-bin-line"></i>Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────
function BulkActionBar({ count, onApprove, onReject, onDelete, onClear }: {
  count: number;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 border"
      style={{ backgroundColor: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.25)" }}>
      <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(167,139,250,0.15)" }}>
        <i className="ri-checkbox-multiple-line text-xs" style={{ color: "#a78bfa" }}></i>
      </div>
      <span className="text-xs font-semibold flex-1" style={{ color: "#a78bfa" }}>
        Đã chọn {count} mục
      </span>
      <div className="flex items-center gap-2">
        {onApprove && (
          <button onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">
            <i className="ri-checkbox-circle-line"></i>Duyệt tất cả
          </button>
        )}
        {onReject && (
          <button onClick={onReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
            <i className="ri-close-circle-line"></i>Từ chối tất cả
          </button>
        )}
        <button onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
          style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
          <i className="ri-delete-bin-line"></i>Xóa tất cả
        </button>
        <button onClick={onClear}
          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
          style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
          <i className="ri-close-line text-sm"></i>
        </button>
      </div>
    </div>
  );
}

// ─── Community Posts Tab ──────────────────────────────────────────────────────
function CommunityPostsTab() {
  const { showToast } = useAdminToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "reject" | "pin" | "delete"; post: CommunityPost } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<"approve" | "reject" | "delete" | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setPosts((data as CommunityPost[]).map(p => ({ ...p, status: p.is_pinned ? "approved" : "approved" })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (filterStatus !== "all") list = list.filter(p => (p.status || "approved") === filterStatus);
    if (filterCat !== "all") list = list.filter(p => p.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q));
    }
    return list;
  }, [posts, filterStatus, filterCat, search]);

  const handleApprove = async (id: string) => {
    const post = posts.find(p => p.id === id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: "approved" as PostStatus } : p));
    setSelectedPost(null);
    setConfirmAction(null);
    showToast({ type: "approve", title: "Đã duyệt bài viết", message: post?.title?.slice(0, 50) });
  };

  const handleReject = async (id: string) => {
    const post = posts.find(p => p.id === id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" as PostStatus } : p));
    setSelectedPost(null);
    setConfirmAction(null);
    showToast({ type: "reject", title: "Đã từ chối bài viết", message: post?.title?.slice(0, 50) });
  };

  const handlePin = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    await supabase.from("community_posts").update({ is_pinned: !post.is_pinned }).eq("id", id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_pinned: !p.is_pinned } : p));
    if (selectedPost?.id === id) setSelectedPost(prev => prev ? { ...prev, is_pinned: !prev.is_pinned } : null);
    setConfirmAction(null);
    showToast({ type: "info", title: post.is_pinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết", message: post.title?.slice(0, 50) });
  };

  const handleDelete = async (id: string) => {
    const post = posts.find(p => p.id === id);
    await supabase.from("community_posts").delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelectedPost(null);
    setConfirmAction(null);
    showToast({ type: "delete", title: "Đã xóa bài viết", message: post?.title?.slice(0, 50) });
  };

  // Bulk handlers
  const handleBulkApprove = () => {
    const count = selectedIds.size;
    setPosts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status: "approved" as PostStatus } : p));
    setSelectedIds(new Set());
    setBulkConfirm(null);
    showToast({ type: "approve", title: `Đã duyệt ${count} bài viết`, message: "Tất cả bài viết đã chọn được duyệt" });
  };
  const handleBulkReject = () => {
    const count = selectedIds.size;
    setPosts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status: "rejected" as PostStatus } : p));
    setSelectedIds(new Set());
    setBulkConfirm(null);
    showToast({ type: "reject", title: `Đã từ chối ${count} bài viết`, message: "Tất cả bài viết đã chọn bị từ chối" });
  };
  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    for (const id of selectedIds) {
      await supabase.from("community_posts").delete().eq("id", id);
    }
    setPosts(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setBulkConfirm(null);
    showToast({ type: "delete", title: `Đã xóa ${count} bài viết`, message: "Các bài viết đã chọn đã bị xóa vĩnh viễn" });
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const stats = useMemo(() => ({
    total: posts.length,
    pending: posts.filter(p => p.status === "pending").length,
    approved: posts.filter(p => !p.status || p.status === "approved").length,
    pinned: posts.filter(p => p.is_pinned).length,
  }), [posts]);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Tổng bài", value: stats.total, color: "#a78bfa", icon: "ri-article-line" },
          { label: "Chờ duyệt", value: stats.pending, color: "#e8c84a", icon: "ri-time-line" },
          { label: "Đã duyệt", value: stats.approved, color: "#34d399", icon: "ri-checkbox-circle-line" },
          { label: "Đang ghim", value: stats.pinned, color: "#fb923c", icon: "ri-pushpin-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm bài viết, tác giả..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: filterStatus === s ? "var(--admin-hover)" : "transparent", color: filterStatus === s ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "question", "share", "result", "tip"] as const).map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className="px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: filterCat === c ? "var(--admin-hover)" : "transparent", color: filterCat === c ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {c === "all" ? "Tất cả" : CAT_CONFIG[c]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onApprove={() => setBulkConfirm("approve")}
          onReject={() => setBulkConfirm("reject")}
          onDelete={() => setBulkConfirm("delete")}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: "var(--admin-card2)", borderBottom: "1px solid var(--admin-border)" }}>
                <th className="px-4 py-3 w-10">
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                    style={{
                      backgroundColor: allSelected ? "#a78bfa" : someSelected ? "rgba(167,139,250,0.3)" : "transparent",
                      borderColor: allSelected || someSelected ? "#a78bfa" : "var(--admin-border2)",
                    }}
                    onClick={toggleSelectAll}>
                    {(allSelected || someSelected) && <i className="ri-check-line text-white text-[9px]"></i>}
                  </div>
                </th>
                {["Bài viết", "Tác giả", "Loại", "Trạng thái", "Tương tác", "Thời gian", "Hành động"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12" style={{ color: "var(--admin-text-faint)" }}>
                    Không có bài viết nào
                  </td>
                </tr>
              ) : filtered.map(post => {
                const cat = CAT_CONFIG[post.category] || CAT_CONFIG.share;
                const status = (post.status || "approved") as PostStatus;
                const statusCfg = STATUS_CONFIG[status];
                const isSelected = selectedIds.has(post.id);
                return (
                  <tr key={post.id} className="border-t transition-colors cursor-pointer"
                    style={{ borderColor: "var(--admin-border)", backgroundColor: isSelected ? "rgba(167,139,250,0.04)" : "transparent" }}
                    onClick={() => setSelectedPost(post)}>
                    <td className="px-4 py-3" onClick={e => toggleSelect(post.id, e)}>
                      <div className="w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
                        style={{ backgroundColor: isSelected ? "#a78bfa" : "transparent", borderColor: isSelected ? "#a78bfa" : "var(--admin-border2)" }}>
                        {isSelected && <i className="ri-check-line text-white text-[9px]"></i>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.is_pinned && <i className="ri-pushpin-fill text-[#e8c84a] text-xs flex-shrink-0"></i>}
                        <p className="font-medium truncate max-w-[200px]" style={{ color: "var(--admin-text)" }}>{post.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--admin-text-muted)" }}>{post.author_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: "var(--admin-text-muted)" }}>
                        <i className="ri-heart-line mr-1"></i>{post.likes}
                        <i className="ri-chat-3-line ml-2 mr-1"></i>{post.comments_count}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--admin-text-faint)" }}>{timeAgo(post.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {status !== "approved" && (
                          <button onClick={() => setConfirmAction({ type: "approve", post })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                            style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399" }} title="Duyệt">
                            <i className="ri-checkbox-circle-line text-xs"></i>
                          </button>
                        )}
                        {status !== "rejected" && (
                          <button onClick={() => setConfirmAction({ type: "reject", post })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                            style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171" }} title="Từ chối">
                            <i className="ri-close-circle-line text-xs"></i>
                          </button>
                        )}
                        <button onClick={() => setConfirmAction({ type: "pin", post })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                          style={{ backgroundColor: "rgba(232,200,74,0.1)", color: "#e8c84a" }}
                          title={post.is_pinned ? "Bỏ ghim" : "Ghim"}>
                          <i className={`${post.is_pinned ? "ri-unpin-line" : "ri-pushpin-line"} text-xs`}></i>
                        </button>
                        <button onClick={() => setConfirmAction({ type: "delete", post })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                          style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171" }} title="Xóa">
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedPost && (
        <PostDetailDrawer
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onApprove={id => setConfirmAction({ type: "approve", post: selectedPost })}
          onReject={id => setConfirmAction({ type: "reject", post: selectedPost })}
          onPin={id => setConfirmAction({ type: "pin", post: selectedPost })}
          onDelete={id => setConfirmAction({ type: "delete", post: selectedPost })}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          action={confirmAction.type}
          title={confirmAction.post.title}
          onConfirm={() => {
            if (confirmAction.type === "approve") handleApprove(confirmAction.post.id);
            else if (confirmAction.type === "reject") handleReject(confirmAction.post.id);
            else if (confirmAction.type === "pin") handlePin(confirmAction.post.id);
            else if (confirmAction.type === "delete") handleDelete(confirmAction.post.id);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Bulk confirm modal */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden p-6 text-center"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-4"
              style={{ backgroundColor: bulkConfirm === "approve" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)" }}>
              <i className={`${bulkConfirm === "approve" ? "ri-checkbox-circle-line text-emerald-400" : bulkConfirm === "reject" ? "ri-close-circle-line text-rose-400" : "ri-delete-bin-line text-rose-400"} text-xl`}></i>
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>
              {bulkConfirm === "approve" ? "Duyệt" : bulkConfirm === "reject" ? "Từ chối" : "Xóa"} {selectedIds.size} bài viết?
            </p>
            <p className="text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>
              {bulkConfirm === "delete" ? "Hành động này không thể hoàn tác." : "Trạng thái của tất cả bài viết đã chọn sẽ được cập nhật."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setBulkConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
              <button
                onClick={bulkConfirm === "approve" ? handleBulkApprove : bulkConfirm === "reject" ? handleBulkReject : handleBulkDelete}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: bulkConfirm === "approve" ? "#34d399" : "#f87171" }}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lessons Tab ──────────────────────────────────────────────────────────────
function LessonsTab() {
  const { showToast } = useAdminToast();
  const [lessons, setLessons] = useState<LessonItem[]>(mockLessons);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "reject" | "delete"; lesson: LessonItem } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<"approve" | "reject" | "delete" | null>(null);

  const filtered = useMemo(() => {
    let list = [...lessons];
    if (filterStatus !== "all") list = list.filter(l => l.status === filterStatus);
    if (filterType !== "all") list = list.filter(l => l.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l => l.title.toLowerCase().includes(q) || l.submittedBy.toLowerCase().includes(q));
    }
    return list;
  }, [lessons, filterStatus, filterType, search]);

  const handleApprove = (id: string) => {
    const lesson = lessons.find(l => l.id === id);
    setLessons(prev => prev.map(l => l.id === id ? { ...l, status: "approved" } : l));
    setSelectedLesson(null);
    setConfirmAction(null);
    showToast({ type: "approve", title: "Đã duyệt bài học", message: lesson?.title?.slice(0, 50) });
  };

  const handleReject = (id: string) => {
    const lesson = lessons.find(l => l.id === id);
    setLessons(prev => prev.map(l => l.id === id ? { ...l, status: "rejected" } : l));
    setSelectedLesson(null);
    setConfirmAction(null);
    showToast({ type: "reject", title: "Đã từ chối bài học", message: lesson?.title?.slice(0, 50) });
  };

  const handleDelete = (id: string) => {
    const lesson = lessons.find(l => l.id === id);
    setLessons(prev => prev.filter(l => l.id !== id));
    setSelectedLesson(null);
    setConfirmAction(null);
    showToast({ type: "delete", title: "Đã xóa bài học", message: lesson?.title?.slice(0, 50) });
  };

  const handleBulkApprove = () => {
    const count = selectedIds.size;
    setLessons(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, status: "approved" as PostStatus } : l));
    setSelectedIds(new Set());
    setBulkConfirm(null);
    showToast({ type: "approve", title: `Đã duyệt ${count} bài học`, message: "Tất cả bài học đã chọn được duyệt" });
  };
  const handleBulkReject = () => {
    const count = selectedIds.size;
    setLessons(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, status: "rejected" as PostStatus } : l));
    setSelectedIds(new Set());
    setBulkConfirm(null);
    showToast({ type: "reject", title: `Đã từ chối ${count} bài học`, message: "Tất cả bài học đã chọn bị từ chối" });
  };
  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setLessons(prev => prev.filter(l => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
    setBulkConfirm(null);
    showToast({ type: "delete", title: `Đã xóa ${count} bài học`, message: "Các bài học đã chọn đã bị xóa" });
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const stats = useMemo(() => ({
    total: lessons.length,
    pending: lessons.filter(l => l.status === "pending").length,
    approved: lessons.filter(l => l.status === "approved").length,
    rejected: lessons.filter(l => l.status === "rejected").length,
  }), [lessons]);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Tổng bài học", value: stats.total, color: "#a78bfa", icon: "ri-book-open-line" },
          { label: "Chờ duyệt", value: stats.pending, color: "#e8c84a", icon: "ri-time-line" },
          { label: "Đã duyệt", value: stats.approved, color: "#34d399", icon: "ri-checkbox-circle-line" },
          { label: "Từ chối", value: stats.rejected, color: "#f87171", icon: "ri-close-circle-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm bài học, người gửi..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: filterStatus === s ? "var(--admin-hover)" : "transparent", color: filterStatus === s ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "melon", "eps", "grammar"] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: filterType === t ? "var(--admin-hover)" : "transparent", color: filterType === t ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {t === "all" ? "Tất cả" : LESSON_TYPE_CONFIG[t]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onApprove={() => setBulkConfirm("approve")}
          onReject={() => setBulkConfirm("reject")}
          onDelete={() => setBulkConfirm("delete")}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
            Không có bài học nào
          </div>
        ) : filtered.map(lesson => {
          const typeCfg = LESSON_TYPE_CONFIG[lesson.type];
          const statusCfg = STATUS_CONFIG[lesson.status];
          const isSelected = selectedIds.has(lesson.id);
          return (
            <div key={lesson.id}
              className="rounded-xl border p-4 cursor-pointer transition-all"
              style={{ backgroundColor: "var(--admin-card)", borderColor: isSelected ? "rgba(167,139,250,0.4)" : "var(--admin-border)" }}
              onClick={() => setSelectedLesson(lesson)}>
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-3 cursor-pointer transition-all"
                  style={{ backgroundColor: isSelected ? "#a78bfa" : "transparent", borderColor: isSelected ? "#a78bfa" : "var(--admin-border2)" }}
                  onClick={e => toggleSelect(lesson.id, e)}>
                  {isSelected && <i className="ri-check-line text-white text-[9px]"></i>}
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${typeCfg.color}15` }}>
                  <i className={`${typeCfg.icon} text-base`} style={{ color: typeCfg.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--admin-text)" }}>{lesson.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ backgroundColor: `${typeCfg.color}15`, color: typeCfg.color }}>{typeCfg.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                      <i className={`${statusCfg.icon} mr-1`}></i>{statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs truncate mb-2" style={{ color: "var(--admin-text-muted)" }}>{lesson.preview}</p>
                  <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                    <span><i className="ri-user-line mr-1"></i>{lesson.submittedBy}</span>
                    <span><i className="ri-time-line mr-1"></i>{timeAgo(lesson.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {lesson.status !== "approved" && (
                    <button onClick={() => setConfirmAction({ type: "approve", lesson })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
                      style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399" }}>
                      <i className="ri-checkbox-circle-line text-sm"></i>
                    </button>
                  )}
                  {lesson.status !== "rejected" && (
                    <button onClick={() => setConfirmAction({ type: "reject", lesson })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
                      style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                      <i className="ri-close-circle-line text-sm"></i>
                    </button>
                  )}
                  <button onClick={() => setConfirmAction({ type: "delete", lesson })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
                    style={{ backgroundColor: "rgba(248,113,113,0.06)", color: "#f87171" }}>
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson detail drawer */}
      {selectedLesson && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelectedLesson(null)}>
          <div className="w-full max-w-lg h-full border-l flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
              style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết bài học</p>
              <button onClick={() => setSelectedLesson(null)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                style={{ color: "var(--admin-text-muted)" }}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: `${LESSON_TYPE_CONFIG[selectedLesson.type].color}15`, color: LESSON_TYPE_CONFIG[selectedLesson.type].color }}>
                  {LESSON_TYPE_CONFIG[selectedLesson.type].label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: STATUS_CONFIG[selectedLesson.status].bg, color: STATUS_CONFIG[selectedLesson.status].color }}>
                  {STATUS_CONFIG[selectedLesson.status].label}
                </span>
              </div>
              <h2 className="font-bold text-base" style={{ color: "var(--admin-text)" }}>{selectedLesson.title}</h2>
              {selectedLesson.artist && (
                <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
                  <i className="ri-music-line mr-1"></i>Nghệ sĩ: {selectedLesson.artist}
                </p>
              )}
              <div className="rounded-xl p-4 text-sm leading-relaxed"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
                {selectedLesson.preview}
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--admin-text-faint)" }}>
                <span><i className="ri-user-line mr-1"></i>{selectedLesson.submittedBy}</span>
                <span><i className="ri-time-line mr-1"></i>{timeAgo(selectedLesson.submittedAt)}</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-2 flex-shrink-0" style={{ borderColor: "var(--admin-border)" }}>
              {selectedLesson.status !== "approved" && (
                <button onClick={() => setConfirmAction({ type: "approve", lesson: selectedLesson })}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                  <i className="ri-checkbox-circle-line mr-2"></i>Duyệt
                </button>
              )}
              {selectedLesson.status !== "rejected" && (
                <button onClick={() => setConfirmAction({ type: "reject", lesson: selectedLesson })}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                  <i className="ri-close-circle-line mr-2"></i>Từ chối
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          action={confirmAction.type}
          title={confirmAction.lesson.title}
          onConfirm={() => {
            if (confirmAction.type === "approve") handleApprove(confirmAction.lesson.id);
            else if (confirmAction.type === "reject") handleReject(confirmAction.lesson.id);
            else if (confirmAction.type === "delete") handleDelete(confirmAction.lesson.id);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {bulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden p-6 text-center"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>
              {bulkConfirm === "approve" ? "Duyệt" : bulkConfirm === "reject" ? "Từ chối" : "Xóa"} {selectedIds.size} bài học?
            </p>
            <p className="text-xs mb-5" style={{ color: "var(--admin-text-muted)" }}>
              {bulkConfirm === "delete" ? "Hành động này không thể hoàn tác." : "Trạng thái sẽ được cập nhật cho tất cả bài học đã chọn."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setBulkConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>Hủy</button>
              <button
                onClick={bulkConfirm === "approve" ? handleBulkApprove : bulkConfirm === "reject" ? handleBulkReject : handleBulkDelete}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: bulkConfirm === "approve" ? "#34d399" : "#f87171" }}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────
function ResolveModal({ report, onClose, onResolve, onDismiss }: {
  report: Report;
  onClose: () => void;
  onResolve: (id: string, action: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [action, setAction] = useState("");
  const reasonCfg = REASON_CONFIG[report.reason];
  const quickActions = ["Xóa bài viết vi phạm", "Xóa bình luận vi phạm", "Cảnh cáo tác giả", "Khóa tài khoản tạm thời", "Gửi email nhắc nhở"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${reasonCfg.color}15` }}>
              <i className={`${reasonCfg.icon} text-sm`} style={{ color: reasonCfg.color }}></i>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Xử lý báo cáo</p>
              <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>{reasonCfg.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--admin-text)" }}>{report.postTitle}</p>
            <p className="text-[10px] mb-2" style={{ color: "var(--admin-text-muted)" }}>
              <i className="ri-user-line mr-1"></i>Tác giả: {report.postAuthor}
              <span className="mx-2">·</span>
              <i className="ri-flag-line mr-1"></i>Báo cáo bởi: {report.reportedBy}
            </p>
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: `${reasonCfg.color}08`, border: `1px solid ${reasonCfg.color}20` }}>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{report.detail}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--admin-text-muted)" }}>Hành động xử lý</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickActions.map(qa => (
                <button key={qa} onClick={() => setAction(qa)}
                  className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: action === qa ? "rgba(248,113,113,0.15)" : "var(--admin-hover)",
                    color: action === qa ? "#f87171" : "var(--admin-text-muted)",
                    border: `1px solid ${action === qa ? "rgba(248,113,113,0.3)" : "var(--admin-border)"}`,
                  }}>{qa}</button>
              ))}
            </div>
            <input value={action} onChange={e => setAction(e.target.value)}
              placeholder="Hoặc nhập hành động tùy chỉnh..."
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => onDismiss(report.id)}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer whitespace-nowrap"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
              <i className="ri-close-circle-line mr-2"></i>Bỏ qua
            </button>
            <button onClick={() => onResolve(report.id, action || "Xử lý vi phạm")}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
              <i className="ri-shield-check-line mr-2"></i>Xử lý xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  const { showToast } = useAdminToast();
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("pending");
  const [filterReason, setFilterReason] = useState<ReportReason | "all">("all");
  const [search, setSearch] = useState("");
  const [resolveModal, setResolveModal] = useState<Report | null>(null);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (filterStatus !== "all") list = list.filter(r => r.status === filterStatus);
    if (filterReason !== "all") list = list.filter(r => r.reason === filterReason);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.postTitle.toLowerCase().includes(q) ||
        r.reportedBy.toLowerCase().includes(q) ||
        r.postAuthor.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, filterStatus, filterReason, search]);

  const handleResolve = (id: string, action: string) => {
    const report = reports.find(r => r.id === id);
    setReports(prev => prev.map(r => r.id === id ? {
      ...r, status: "resolved" as ReportStatus, resolvedAt: new Date().toISOString(), resolvedBy: "Admin", action,
    } : r));
    setResolveModal(null);
    showToast({ type: "success", title: "Đã xử lý báo cáo", message: report?.postTitle?.slice(0, 50) });
  };

  const handleDismiss = (id: string) => {
    const report = reports.find(r => r.id === id);
    setReports(prev => prev.map(r => r.id === id ? {
      ...r, status: "dismissed" as ReportStatus, resolvedAt: new Date().toISOString(), resolvedBy: "Admin", action: "Không vi phạm",
    } : r));
    setResolveModal(null);
    showToast({ type: "info", title: "Đã bỏ qua báo cáo", message: report?.postTitle?.slice(0, 50) });
  };

  const stats = useMemo(() => ({
    pending: reports.filter(r => r.status === "pending").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
    total: reports.length,
  }), [reports]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Tổng báo cáo", value: stats.total, color: "#a78bfa", icon: "ri-flag-line" },
          { label: "Chờ xử lý", value: stats.pending, color: "#e8c84a", icon: "ri-time-line" },
          { label: "Đã xử lý", value: stats.resolved, color: "#34d399", icon: "ri-shield-check-line" },
          { label: "Bỏ qua", value: stats.dismissed, color: "#6b7280", icon: "ri-close-circle-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài viết, tác giả, người báo cáo..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "pending", "resolved", "dismissed"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: filterStatus === s ? "var(--admin-hover)" : "transparent", color: filterStatus === s ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {s === "all" ? "Tất cả" : REPORT_STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "spam", "offensive", "misinformation", "harassment", "other"] as const).map(r => (
            <button key={r} onClick={() => setFilterReason(r)}
              className="px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: filterReason === r ? "var(--admin-hover)" : "transparent", color: filterReason === r ? "var(--admin-text)" : "var(--admin-text-faint)" }}>
              {r === "all" ? "Tất cả" : REASON_CONFIG[r].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
            <i className="ri-flag-line text-3xl mb-2 block"></i>Không có báo cáo nào
          </div>
        ) : filtered.map(report => {
          const reasonCfg = REASON_CONFIG[report.reason];
          const statusCfg = REPORT_STATUS_CONFIG[report.status];
          return (
            <div key={report.id} className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: "var(--admin-card)", borderColor: report.status === "pending" ? `${reasonCfg.color}25` : "var(--admin-border)" }}>
              <div className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${reasonCfg.color}15` }}>
                  <i className={`${reasonCfg.icon} text-base`} style={{ color: reasonCfg.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${reasonCfg.color}15`, color: reasonCfg.color }}>{reasonCfg.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                      <i className={`${statusCfg.icon} mr-1`}></i>{statusCfg.label}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{timeAgo(report.createdAt)}</span>
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>{report.postTitle}</p>
                  <div className="flex items-center gap-3 text-[10px] mb-2" style={{ color: "var(--admin-text-muted)" }}>
                    <span><i className="ri-user-line mr-1"></i>Tác giả: <strong>{report.postAuthor}</strong></span>
                    <span><i className="ri-flag-line mr-1"></i>Báo cáo bởi: <strong>{report.reportedBy}</strong></span>
                  </div>
                  <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)" }}>{report.detail}</div>
                  {report.status !== "pending" && report.action && (
                    <div className="mt-2 flex items-center gap-2 text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                      <i className="ri-shield-check-line" style={{ color: statusCfg.color }}></i>
                      <span>Hành động: <strong style={{ color: statusCfg.color }}>{report.action}</strong></span>
                      {report.resolvedBy && <span>· bởi {report.resolvedBy}</span>}
                    </div>
                  )}
                </div>
                {report.status === "pending" && (
                  <button onClick={() => setResolveModal(report)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <i className="ri-shield-check-line"></i>Xử lý
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {resolveModal && (
        <ResolveModal report={resolveModal} onClose={() => setResolveModal(null)} onResolve={handleResolve} onDismiss={handleDismiss} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("community");
  const pendingReports = mockReports.filter(r => r.status === "pending").length;

  return (
    <AdminLayout
      title="Quản lý nội dung"
      subtitle="Duyệt bài viết cộng đồng, bài học và xử lý báo cáo vi phạm"
    >
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit mb-6"
        style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
        {([
          { id: "community", label: "Bài viết cộng đồng", icon: "ri-community-line" },
          { id: "lessons", label: "Bài học gửi lên", icon: "ri-book-open-line" },
          { id: "reports", label: `Báo cáo vi phạm${pendingReports > 0 ? ` (${pendingReports})` : ""}`, icon: "ri-flag-line" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.id ? "var(--admin-card)" : "transparent",
              color: activeTab === tab.id
                ? (tab.id === "reports" && pendingReports > 0 ? "#f87171" : "var(--admin-text)")
                : "var(--admin-text-faint)",
              border: activeTab === tab.id ? "1px solid var(--admin-border)" : "1px solid transparent",
            }}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "community" && <CommunityPostsTab />}
      {activeTab === "lessons" && <LessonsTab />}
      {activeTab === "reports" && <ReportsTab />}
    </AdminLayout>
  );
}
