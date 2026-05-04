import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileNav from "@/components/feature/MobileNav";
import MobileHeader from "@/components/feature/MobileHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { id: "bug", label: "L?i k? thu?t", icon: "ri-bug-line", color: "#f87171" },
  { id: "ui", label: "Giao di?n l?i", icon: "ri-layout-line", color: "#fb923c" },
  { id: "content", label: "N?i dung sai", icon: "ri-file-warning-line", color: "app-accent-primary" },
  { id: "feature", label: "Tính nang không ho?t d?ng", icon: "ri-settings-line", color: "#a78bfa" },
  { id: "payment", label: "V?n d? thanh toán/VIP", icon: "ri-vip-crown-line", color: "#34d399" },
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
        user_email: (profile as any)?.email || user?.email || "",
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
      setError(err instanceof Error ? err.message : "G?i báo cáo th?t b?i");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center px-4 pb-24 md:pb-8">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-emerald-500/10 rounded-3xl mx-auto mb-5">
            <i className="ri-checkbox-circle-line text-app-accent-success text-4xl" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Ðã g?i báo cáo!</h2>
          <p className="text-app-text-secondary text-sm mb-2">C?m on b?n dã ph?n h?i. Ð?i ngu k? thu?t s? xem xét và x? lý s?m nh?t có th?.</p>
          <p className="text-app-text-muted text-xs mb-8">Thu?ng trong vòng 24–48 gi? làm vi?c</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors">
              Quay l?i
            </button>
            <button onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); }}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">
              Báo cáo thêm
            </button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg pb-24 md:pb-8">
      <MobileHeader title="Báo cáo l?i" showBack />

      {/* Desktop header */}
      <header className="hidden md:flex sticky top-0 z-30 bg-app-bg/95 backdrop-blur-md border-b border-app-border h-14 items-center px-6 gap-4">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer">
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center bg-rose-500/20 rounded-md">
            <i className="ri-bug-line text-rose-400 text-sm" />
          </div>
          <span className="text-white font-bold text-sm">Báo cáo l?i</span>
        </div>
        <p className="text-white/35 text-xs">Giúp chúng tôi c?i thi?n ?ng d?ng</p>
      </header>

      <div className="max-w-lg mx-auto pt-16 md:pt-6 px-4 py-5">
        {/* Hero */}
        <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/8 to-transparent border border-rose-500/15 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-rose-500/15 rounded-2xl flex-shrink-0">
              <i className="ri-bug-line text-rose-400 text-xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base mb-1">Phát hi?n l?i? Hãy cho chúng tôi bi?t!</h1>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                M?i báo cáo c?a b?n giúp chúng tôi c?i thi?n ?ng d?ng t?t hon. Ð?i ngu k? thu?t s? xem xét và ph?n h?i s?m nh?t.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-3 block tracking-normal">Lo?i v?n d?</label>
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
              Tiêu d? ng?n g?n <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 100))}
              placeholder="VD: Không th? phát âm bài hát, trang b? tr?ng..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
              required
            />
            <p className="text-[10px] text-right mt-1 text-app-text-muted">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">
              Mô t? chi ti?t <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder="Mô t? l?i x?y ra nhu th? nào, các bu?c d? tái hi?n l?i, k?t qu? mong d?i vs th?c t?..."
              rows={5}
              maxLength={500}
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors resize-none"
              required
            />
            <p className="text-[10px] text-right mt-1 text-app-text-muted">{description.length}/500</p>
          </div>

          {/* Page URL */}
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Trang x?y ra l?i</label>
            <input
              type="text"
              value={pageUrl}
              onChange={e => setPageUrl(e.target.value)}
              placeholder="VD: /melon, /eps-exam..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>

          {/* User info */}
          {!user && (
            <div className="flex items-start gap-3 px-4 py-3 bg-app-accent-primary/5 border border-app-accent-primary/10 rounded-xl">
              <i className="ri-information-line text-app-accent-primary/60 text-sm flex-shrink-0 mt-0.5" />
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Ðang nh?p d? chúng tôi có th? liên h? ph?n h?i k?t qu? x? lý l?i cho b?n.
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
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Ðang g?i...</>
            ) : (
              <><i className="ri-send-plane-line" />G?i báo cáo</>
            )}
          </button>
        </form>

        {/* Recent reports by user */}
        <div className="mt-8 pt-6 border-t border-app-border">
          <p className="text-app-text-muted text-xs text-center">
            C?n h? tr? kh?n c?p? Liên h? qua{" "}
            <a href="https://zalo.me" target="_blank" rel="nofollow noopener noreferrer"
              className="text-app-accent-primary/60 hover:text-app-accent-primary underline">Zalo</a>
            {" "}ho?c email h? tr?.
          </p>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
