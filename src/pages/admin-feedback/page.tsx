import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface Feedback {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  category: string;
  title: string;
  content: string;
  page_url: string | null;
  status: "new" | "reviewed" | "resolved" | "dismissed";
  admin_note: string | null;
  is_vip: boolean;
  created_at: string;
}

const STATUS_CONFIG = {
  new: { label: "Mới", color: "#e8c84a", bg: "rgba(232,200,74,0.12)", icon: "ri-mail-unread-line" },
  reviewed: { label: "Đã xem", color: "#38bdf8", bg: "rgba(56,189,248,0.12)", icon: "ri-eye-line" },
  resolved: { label: "Đã xử lý", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: "ri-checkbox-circle-line" },
  dismissed: { label: "Bỏ qua", color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: "ri-close-circle-line" },
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Tổng quan", feature: "Tính năng", content: "Nội dung học",
  ui: "Giao diện", performance: "Hiệu suất", suggestion: "Đề xuất",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <i key={s} className={`text-xs ${s <= rating ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`} />
      ))}
    </div>
  );
}

function FeedbackDetailModal({ feedback, onClose, onUpdate, onDelete }: {
  feedback: Feedback;
  onClose: () => void;
  onUpdate: (id: string, status: Feedback["status"], note: string) => void;
  onDelete: (id: string) => void;
}) {
  const [status, setStatus] = useState<Feedback["status"]>(feedback.status);
  const [note, setNote] = useState(feedback.admin_note || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(feedback.id, status, note);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(feedback.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>Chi tiết góp ý</p>
            <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>
              {feedback.user_name || "Ẩn danh"} · {new Date(feedback.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: "var(--admin-text-muted)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Rating + category */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarDisplay rating={feedback.rating} />
            <span className="text-xs px-2 py-0.5 rounded-full bg-app-card/50 text-white/50">
              {CATEGORY_LABELS[feedback.category] || feedback.category}
            </span>
            {feedback.is_vip && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-accent-primary/10 text-app-accent-primary font-bold">VIP</span>
            )}
          </div>

          {/* Title + content */}
          <div>
            <p className="font-semibold text-sm mb-2" style={{ color: "var(--admin-text)" }}>{feedback.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>{feedback.content}</p>
          </div>

          {/* User info */}
          <div className="px-3 py-2.5 rounded-xl text-xs space-y-1" style={{ backgroundColor: "var(--admin-card2)" }}>
            <p style={{ color: "var(--admin-text-muted)" }}>
              <span style={{ color: "var(--admin-text-faint)" }}>Người dùng: </span>
              {feedback.user_name || "Ẩn danh"}
            </p>
            {feedback.user_email && (
              <p style={{ color: "var(--admin-text-muted)" }}>
                <span style={{ color: "var(--admin-text-faint)" }}>Email: </span>
                {feedback.user_email}
              </p>
            )}
            {feedback.page_url && (
              <p style={{ color: "var(--admin-text-muted)" }}>
                <span style={{ color: "var(--admin-text-faint)" }}>Trang: </span>
                {feedback.page_url}
              </p>
            )}
          </div>

          {/* Status update */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--admin-text-muted)" }}>Cập nhật trạng thái</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STATUS_CONFIG) as [Feedback["status"], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([s, cfg]) => (
                <button key={s} onClick={() => setStatus(s)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-left"
                  style={{
                    backgroundColor: status === s ? cfg.bg : "var(--admin-card2)",
                    borderColor: status === s ? `${cfg.color}40` : "var(--admin-border)",
                  }}>
                  <i className={`${cfg.icon} text-xs`} style={{ color: cfg.color }}></i>
                  <span className="text-xs font-medium" style={{ color: status === s ? cfg.color : "var(--admin-text-muted)" }}>
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Ghi chú admin</label>
            <textarea value={note} onChange={e => setNote(e.target.value.slice(0, 300))} rows={3} maxLength={300}
              placeholder="Ghi chú nội bộ về góp ý này..."
              className="w-full rounded-xl px-4 py-2.5 text-xs outline-none border resize-none"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
            Hủy
          </button>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
            style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <i className="ri-delete-bin-line mr-1"></i>Xóa
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "#ef444415" }}>
                <i className="ri-delete-bin-line text-xl" style={{ color: "#ef4444" }}></i>
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Xóa góp ý này?</p>
              <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>
                Hành động này không thể hoàn tác. Góp ý sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl border text-xs cursor-pointer"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
                  Hủy
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer">
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Feedback["status"]>("all");
  const [filterRating, setFilterRating] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("app_feedback")
      .select("*")
      .order("created_at", { ascending: false });
    setFeedbacks((data ?? []) as Feedback[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleUpdate = async (id: string, status: Feedback["status"], note: string) => {
    const { error } = await supabase
      .from("app_feedback")
      .update({ status, admin_note: note, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status, admin_note: note } : f));
      showToast("Đã cập nhật góp ý!");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("app_feedback")
      .delete()
      .eq("id", id);
    if (!error) {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      showToast("Đã xóa góp ý!");
    }
  };

  const filtered = useMemo(() => {
    let list = [...feedbacks];
    if (filterStatus !== "all") list = list.filter(f => f.status === filterStatus);
    if (filterRating > 0) list = list.filter(f => f.rating === filterRating);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.title.toLowerCase().includes(q) ||
        (f.user_name || "").toLowerCase().includes(q) ||
        f.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [feedbacks, filterStatus, filterRating, search]);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: feedbacks.filter(f => f.rating === r).length,
    pct: feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.rating === r).length / feedbacks.length) * 100) : 0,
  }));

  return (
    <AdminLayout
      title="Góp ý & Đánh giá"
      subtitle="Quản lý phản hồi từ thành viên"
      actions={
        <button onClick={fetchFeedbacks}
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap bg-app-card/50 text-white/50 border border-app-border hover:bg-app-card/70">
          <i className="ri-refresh-line" />Làm mới
        </button>
      }
    >
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white">
          <i className="ri-checkbox-circle-line"></i>{toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Tổng góp ý", value: feedbacks.length, color: "#e8c84a", icon: "ri-chat-smile-2-line" },
          { label: "Mới chưa xem", value: feedbacks.filter(f => f.status === "new").length, color: "#f87171", icon: "ri-mail-unread-line" },
          { label: "Đã xử lý", value: feedbacks.filter(f => f.status === "resolved").length, color: "#34d399", icon: "ri-checkbox-circle-line" },
          { label: "Đánh giá TB", value: avgRating, color: "#fb923c", icon: "ri-star-line" },
          { label: "Từ VIP", value: feedbacks.filter(f => f.is_vip).length, color: "#a78bfa", icon: "ri-vip-crown-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3 border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-bold text-xl leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        {/* Rating distribution */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--admin-text)" }}>Phân bố đánh giá</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold" style={{ color: "#e8c84a" }}>{avgRating}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <i key={s} className={`text-xs ${parseFloat(avgRating) >= s ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`} />
                ))}
              </div>
              <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>{feedbacks.length} đánh giá</p>
            </div>
          </div>
          <div className="space-y-2">
            {ratingDist.map(r => (
              <div key={r.rating} className="flex items-center gap-2">
                <span className="text-[10px] w-3 text-right" style={{ color: "var(--admin-text-faint)" }}>{r.rating}</span>
                <i className="ri-star-fill text-app-accent-primary text-[10px]"></i>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                  <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-[10px] w-6 text-right" style={{ color: "var(--admin-text-faint)" }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback list */}
        <div className="lg:col-span-3 rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
          {/* Filters */}
          <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: "var(--admin-border)" }}>
            <div className="relative flex-1 min-w-40">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm góp ý..."
                className="w-full rounded-lg pl-8 pr-4 py-1.5 text-xs outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="rounded-lg px-3 py-1.5 text-xs outline-none border cursor-pointer"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}>
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <option key={s} value={s}>{cfg.label}</option>
              ))}
            </select>
            <select value={filterRating} onChange={e => setFilterRating(parseInt(e.target.value))}
              className="rounded-lg px-3 py-1.5 text-xs outline-none border cursor-pointer"
              style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}>
              <option value={0}>Tất cả sao</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} sao</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ri-chat-smile-2-line text-3xl mb-2" style={{ color: "var(--admin-text-faint)" }}></i>
              <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Chưa có góp ý nào</p>
            </div>
          ) : (
            <div className="divide-y max-h-[480px] overflow-y-auto" style={{ borderColor: "var(--admin-border)" }}>
              {filtered.map(fb => {
                const cfg = STATUS_CONFIG[fb.status];
                return (
                  <div key={fb.id}
                    className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-white/2 transition-colors"
                    onClick={() => setSelected(fb)}>
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ backgroundColor: cfg.bg }}>
                      <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{fb.title}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        {fb.is_vip && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-app-accent-primary/10 text-app-accent-primary font-bold">VIP</span>}
                      </div>
                      <p className="text-[10px] truncate mb-1" style={{ color: "var(--admin-text-muted)" }}>{fb.content}</p>
                      <div className="flex items-center gap-3">
                        <StarDisplay rating={fb.rating} />
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                          {fb.user_name || "Ẩn danh"} · {new Date(fb.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-sm flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}></i>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <FeedbackDetailModal
          feedback={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
}

