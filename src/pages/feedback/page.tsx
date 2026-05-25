import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase, isVipActive } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { id: "general", label: "Tổng quan", icon: "ri-chat-smile-2-line", color: "#34d399" },
  { id: "feature", label: "Tính năng", icon: "ri-settings-line", color: "#a78bfa" },
  { id: "content", label: "Nội dung học", icon: "ri-book-open-line", color: "#fb923c" },
  { id: "ui", label: "Giao diện", icon: "ri-layout-line", color: "#38bdf8" },
  { id: "performance", label: "Hiệu suất", icon: "ri-speed-line", color: "#e8c84a" },
  { id: "suggestion", label: "Đề xuất tính năng", icon: "ri-lightbulb-line", color: "#f472b6" },
];

const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời!"];
const RATING_EMOJIS = ["", "😞", "😕", "😐", "😊", "🤩"];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <i
              className={`text-3xl ${(hover || value) >= star ? "ri-star-fill" : "ri-star-line"}`}
              style={{ color: (hover || value) >= star ? "#e8c84a" : "rgba(255,255,255,0.15)" }}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{RATING_EMOJIS[hover || value]}</span>
          <span className="text-white/60 text-sm font-medium">{RATING_LABELS[hover || value]}</span>
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Vui lòng chọn đánh giá sao"); return; }
    if (!title.trim() || !content.trim()) { setError("Vui lòng điền đầy đủ thông tin"); return; }

    setSubmitting(true);
    setError(null);
    try {
      const { error: err } = await supabase.from("app_feedback").insert({
        user_id: user?.id || null,
        user_name: profile?.display_name || "Khách",
        user_email: user?.email || "",
        rating,
        category,
        title: title.trim(),
        content: content.trim(),
        page_url: window.location.pathname,
        is_vip: isVipActive(profile),
        status: "new",
      });
      if (err) throw err;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gửi góp ý thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout title="Góp ý & Đánh giá" subtitle="Cảm ơn bạn đã góp ý!">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-white font-bold text-xl mb-2">Cảm ơn bạn rất nhiều!</h2>
          <p className="text-app-text-secondary text-sm mb-2 leading-relaxed">
            Góp ý của bạn rất có giá trị với chúng tôi. Đội ngũ phát triển sẽ xem xét và cải thiện ứng dụng dựa trên phản hồi của bạn.
          </p>
          <p className="text-app-text-muted text-xs mb-8">Thường phản hồi trong vòng 24–48 giờ</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors">
              Quay lại
            </button>
            <button onClick={() => { setSubmitted(false); setRating(0); setTitle(""); setContent(""); }}
              className="px-6 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">
              Góp ý thêm
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Góp ý & Đánh giá"
      subtitle="Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện ứng dụng"
    >
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl mb-6 p-6"
          style={{ background: "linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, app-accent-primary 0%, transparent 50%), radial-gradient(circle at 80% 50%, #34d399 0%, transparent 50%)" }} />
          <div className="relative z-10 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h2 className="text-white font-bold text-lg mb-1">Ý kiến của bạn quan trọng với chúng tôi!</h2>
            <p className="text-app-text-secondary text-sm">Mỗi góp ý giúp Hàn Quốc Ơi! trở nên tốt hơn mỗi ngày</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star rating */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <p className="text-white/50 text-xs font-semibold tracking-normal mb-4 text-center">
              Bạn đánh giá ứng dụng như thế nào?
            </p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-3 block tracking-normal">Chủ đề góp ý</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left"
                  style={{
                    backgroundColor: category === cat.id ? `${cat.color}12` : "rgba(255,255,255,0.03)",
                    borderColor: category === cat.id ? `${cat.color}35` : "rgba(255,255,255,0.06)",
                  }}>
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}15` }}>
                    <i className={`${cat.icon} text-xs`} style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs font-medium leading-tight"
                    style={{ color: category === cat.id ? cat.color : "rgba(255,255,255,0.5)" }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">
              Tiêu đề <span className="text-rose-400">*</span>
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 100))}
              placeholder="VD: Tính năng flashcard rất hay, muốn thêm chế độ..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
              required />
            <p className="text-[10px] text-right mt-1 text-app-text-muted">{title.length}/100</p>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">
              Nội dung chi tiết <span className="text-rose-400">*</span>
            </label>
            <textarea value={content} onChange={e => setContent(e.target.value.slice(0, 500))}
              placeholder="Mô tả chi tiết góp ý, đề xuất hoặc trải nghiệm của bạn..."
              rows={5} maxLength={500}
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors resize-none"
              required />
            <p className="text-[10px] text-right mt-1 text-app-text-muted">{content.length}/500</p>
          </div>

          {/* User info display */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 bg-app-surface/50 border border-app-border rounded-xl">
              <div className="w-8 h-8 rounded-full bg-app-accent-primary/15 flex items-center justify-center flex-shrink-0">
                <i className="ri-user-line text-app-accent-primary text-sm" />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">{profile?.display_name || "Học viên"}</p>
                <p className="text-app-text-muted text-[10px]">Góp ý sẽ được gửi kèm tên tài khoản</p>
              </div>
              {isVipActive(profile) && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-app-accent-primary/10 text-app-accent-primary font-bold">VIP</span>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/8 border border-rose-500/20 rounded-xl">
              <i className="ri-error-warning-line text-rose-400 text-sm flex-shrink-0" />
              <p className="text-rose-400 text-xs">{error}</p>
            </div>
          )}

          <button type="submit" disabled={submitting || rating === 0 || !title.trim() || !content.trim()}
            className="w-full py-3.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-[#0f1117]/30 border-t-[#0f1117] rounded-full animate-spin" />Đang gửi...</>
            ) : (
              <><i className="ri-send-plane-line" />Gửi góp ý</>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-app-border text-center">
          <p className="text-app-text-muted text-xs">
            Có lỗi kỹ thuật?{" "}
            <button onClick={() => navigate("/report-bug")}
              className="text-rose-400/60 hover:text-rose-400 cursor-pointer transition-colors">
              Báo cáo lỗi tại đây
            </button>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
