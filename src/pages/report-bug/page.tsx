import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileNav from "@/components/feature/MobileNav";
import MobileHeader from "@/components/feature/MobileHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { id: "bug", label: "Lỗi kỹ thuật", icon: "ri-bug-line", color: "#f87171" },
  { id: "ui", label: "Giao diện lỗi", icon: "ri-layout-line", color: "#fb923c" },
  { id: "content", label: "Nội dung sai", icon: "ri-file-warning-line", color: "#e8c84a" },
  { id: "feature", label: "Tính năng không hoạt động", icon: "ri-settings-line", color: "#a78bfa" },
  { id: "payment", label: "Vấn đề thanh toán/VIP", icon: "ri-vip-crown-line", color: "#34d399" },
  { id: "other", label: "Khác", icon: "ri-question-line", color: "#94a3b8" },
];

export default function ReportBugPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [category, setCategory] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pageUrl, setPageUrl] = useState(window.location.origin);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const deviceInfo = `${navigator.userAgent.slice(0, 150)} | ${window.innerWidth}x${window.innerHeight}`;
      const { error: err } = await supabase.from("bug_reports").insert({
        user_id: user?.id || null,
        user_name: profile?.display_name || "Khách",
        user_email: profile?.email || user?.email || "",
        page_url: pageUrl,
        category,
        title: title.trim(),
        description: description.trim(),
        device_info: deviceInfo,
        status: "open",
      });
      if (err) throw err;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gửi báo cáo thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4 pb-24 md:pb-8">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-emerald-500/10 rounded-3xl mx-auto mb-5">
            <i className="ri-checkbox-circle-line text-emerald-400 text-4xl" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Đã gửi báo cáo!</h2>
          <p className="text-white/40 text-sm mb-2">Cảm ơn bạn đã phản hồi. Đội ngũ kỹ thuật sẽ xem xét và xử lý sớm nhất có thể.</p>
          <p className="text-white/25 text-xs mb-8">Thường trong vòng 24–48 giờ làm việc</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-white/5 transition-colors">
              Quay lại
            </button>
            <button onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); }}
              className="flex-1 py-3 rounded-xl bg-[#e8c84a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap">
              Báo cáo thêm
            </button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] pb-24 md:pb-8">
      <MobileHeader title="Báo cáo lỗi" showBack />

      {/* Desktop header */}
      <header className="hidden md:flex sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-md border-b border-white/8 h-14 items-center px-6 gap-4">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white cursor-pointer">
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center bg-rose-500/20 rounded-md">
            <i className="ri-bug-line text-rose-400 text-sm" />
          </div>
          <span className="text-white font-bold text-sm">Báo cáo lỗi</span>
        </div>
        <p className="text-white/35 text-xs">Giúp chúng tôi cải thiện ứng dụng</p>
      </header>

      <div className="max-w-lg mx-auto pt-16 md:pt-6 px-4 py-5">
        {/* Hero */}
        <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/8 to-transparent border border-rose-500/15 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-rose-500/15 rounded-2xl flex-shrink-0">
              <i className="ri-bug-line text-rose-400 text-xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base mb-1">Phát hiện lỗi? Hãy cho chúng tôi biết!</h1>
              <p className="text-white/40 text-xs leading-relaxed">
                Mỗi báo cáo của bạn giúp chúng tôi cải thiện ứng dụng tốt hơn. Đội ngũ kỹ thuật sẽ xem xét và phản hồi sớm nhất.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-3 block tracking-wider">Loại vấn đề</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left"
                  style={{
                    backgroundColor: category === cat.id ? `${cat.color}12` : "rgba(255,255,255,0.03)",
                    borderColor: category === cat.id ? `${cat.color}35` : "rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}15` }}>
                    <i className={`${cat.icon} text-xs`} style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs font-medium leading-tight" style={{ color: category === cat.id ? cat.color : "rgba(255,255,255,0.5)" }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">
              Tiêu đề ngắn gọn <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 100))}
              placeholder="VD: Không thể phát âm bài hát, trang bị trắng..."
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
              required
            />
            <p className="text-[10px] text-right mt-1 text-white/20">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">
              Mô tả chi tiết <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder="Mô tả lỗi xảy ra như thế nào, các bước để tái hiện lỗi, kết quả mong đợi vs thực tế..."
              rows={5}
              maxLength={500}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors resize-none"
              required
            />
            <p className="text-[10px] text-right mt-1 text-white/20">{description.length}/500</p>
          </div>

          {/* Page URL */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Trang xảy ra lỗi</label>
            <input
              type="text"
              value={pageUrl}
              onChange={e => setPageUrl(e.target.value)}
              placeholder="VD: /melon, /eps-exam..."
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>

          {/* User info */}
          {!user && (
            <div className="flex items-start gap-3 px-4 py-3 bg-[#e8c84a]/5 border border-[#e8c84a]/10 rounded-xl">
              <i className="ri-information-line text-[#e8c84a]/60 text-sm flex-shrink-0 mt-0.5" />
              <p className="text-white/40 text-xs leading-relaxed">
                Đăng nhập để chúng tôi có thể liên hệ phản hồi kết quả xử lý lỗi cho bạn.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/8 border border-rose-500/20 rounded-xl">
              <i className="ri-error-warning-line text-rose-400 text-sm flex-shrink-0" />
              <p className="text-rose-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !title.trim() || !description.trim()}
            className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang gửi...</>
            ) : (
              <><i className="ri-send-plane-line" />Gửi báo cáo</>
            )}
          </button>
        </form>

        {/* Recent reports by user */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-white/25 text-xs text-center">
            Cần hỗ trợ khẩn cấp? Liên hệ qua{" "}
            <a href="https://zalo.me" target="_blank" rel="nofollow noopener noreferrer"
              className="text-[#e8c84a]/60 hover:text-[#e8c84a] underline">Zalo</a>
            {" "}hoặc email hỗ trợ.
          </p>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
