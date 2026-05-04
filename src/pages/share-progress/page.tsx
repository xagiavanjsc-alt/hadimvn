import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type CardTheme = "dark" | "gold" | "green" | "pink";
type CardLayout = "square" | "story" | "wide";

interface ProgressData {
  streak: number;
  xp: number;
  wordsLearned: number;
  quizScore: number;
  level: string;
  daysStudied: number;
}

const THEMES: { id: CardTheme; label: string; bg: string; accent: string; text: string; sub: string }[] = [
  { id: "dark", label: "T?i sang tr?ng", bg: "linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)", accent: "app-accent-primary", text: "#ffffff", sub: "rgba(255,255,255,0.5)" },
  { id: "gold", label: "Vàng r?c r?", bg: "linear-gradient(135deg, #1a1200 0%, #2d2000 50%, #1a1200 100%)", accent: "#fbbf24", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
  { id: "green", label: "Xanh tuoi mát", bg: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)", accent: "#34d399", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
  { id: "pink", label: "H?ng nang d?ng", bg: "linear-gradient(135deg, #1a0010 0%, #2d0020 50%, #1a0010 100%)", accent: "#f472b6", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
];

const LAYOUTS: { id: CardLayout; label: string; icon: string; w: number; h: number }[] = [
  { id: "square", label: "Vuông (1:1)", icon: "ri-layout-grid-line", w: 400, h: 400 },
  { id: "story", label: "Story (9:16)", icon: "ri-smartphone-line", w: 360, h: 640 },
  { id: "wide", label: "Ngang (16:9)", icon: "ri-computer-line", w: 640, h: 360 },
];

function ProgressCard({
  theme,
  layout,
  data,
  name,
  cardRef,
}: {
  theme: CardTheme;
  layout: CardLayout;
  data: ProgressData;
  name: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = THEMES.find(t => t.id === theme) || THEMES[0];
  const l = LAYOUTS.find(l => l.id === layout) || LAYOUTS[0];

  const scale = Math.min(480 / l.w, 480 / l.h);
  const displayW = l.w * scale;
  const displayH = l.h * scale;

  const stats = [
    { label: "Streak", value: `${data.streak}`, unit: "ngày", icon: "??" },
    { label: "XP tích luy", value: data.xp.toLocaleString(), unit: "XP", icon: "?" },
    { label: "T? dã h?c", value: data.wordsLearned.toLocaleString(), unit: "t?", icon: "??" },
    { label: "Ngày h?c", value: String(data.daysStudied), unit: "ngày", icon: "??" },
  ];

  const isStory = layout === "story";
  const isWide = layout === "wide";

  return (
    <div style={{ width: displayW, height: displayH, flexShrink: 0 }}>
      <div
        ref={cardRef}
        style={{
          width: l.w,
          height: l.h,
          background: t.bg,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Segoe UI', sans-serif",
          borderRadius: 24,
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle at 80% 20%, ${t.accent}20 0%, transparent 50%), radial-gradient(circle at 20% 80%, ${t.accent}10 0%, transparent 50%)`,
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "40px 32px" : "32px", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isStory ? 32 : 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${t.accent}20`, border: `1.5px solid ${t.accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>????</div>
            <div>
              <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>Hàn Qu?c Oi!</div>
              <div style={{ color: t.sub, fontSize: 11 }}>hanquocoi.vn</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div style={{
                background: `${t.accent}20`, border: `1px solid ${t.accent}40`,
                color: t.accent, fontSize: 10, fontWeight: 700,
                padding: "4px 10px", borderRadius: 20,
              }}>
                {data.level}
              </div>
            </div>
          </div>

          {/* Name + title */}
          <div style={{ marginBottom: isStory ? 28 : 16 }}>
            <div style={{ color: t.sub, fontSize: 12, marginBottom: 4 }}>Ti?n d? h?c t?p c?a</div>
            <div style={{ color: t.text, fontWeight: 800, fontSize: isStory ? 28 : isWide ? 22 : 24, lineHeight: 1.2 }}>
              {name}
            </div>
          </div>

          {/* Big streak highlight */}
          <div style={{
            background: `${t.accent}12`, border: `1px solid ${t.accent}25`,
            borderRadius: 16, padding: isStory ? "20px 24px" : "16px 20px",
            marginBottom: isStory ? 24 : 16,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ fontSize: isStory ? 48 : 40 }}>??</div>
            <div>
              <div style={{ color: t.accent, fontWeight: 900, fontSize: isStory ? 52 : 44, lineHeight: 1 }}>
                {data.streak}
              </div>
              <div style={{ color: t.sub, fontSize: 13, marginTop: 2 }}>ngày h?c liên ti?p</div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isWide ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: 10,
            flex: 1,
          }}>
            {stats.slice(isWide ? 0 : 1).map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "12px 14px",
                display: "flex", flexDirection: "column", justifyContent: "center",
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ color: t.text, fontWeight: 700, fontSize: isStory ? 22 : 18 }}>{s.value}</div>
                <div style={{ color: t.sub, fontSize: 10, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: isStory ? 24 : 16,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ color: t.sub, fontSize: 10 }}>
              {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
            <div style={{
              color: t.accent, fontSize: 11, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span>H?c cùng t?i hanquocoi.vn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShareProgressPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [theme, setTheme] = useState<CardTheme>("dark");
  const [layout, setLayout] = useState<CardLayout>("square");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData>({
    streak: 0,
    xp: 0,
    wordsLearned: 0,
    quizScore: 0,
    level: "A1",
    daysStudied: 0,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoadingData(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Leaderboard: xp, streak, words_learned, best_score, level
        const { data: lb } = await supabase
          .from("leaderboard")
          .select("xp, streak, words_learned, best_score, level")
          .eq("user_id", user.id)
          .maybeSingle();

        // S? ngày dã h?c th?c t?
        const { count: daysStudied } = await supabase
          .from("study_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (cancelled) return;
        setProgressData({
          streak: lb?.streak || 0,
          xp: lb?.xp || 0,
          wordsLearned: lb?.words_learned || 0,
          quizScore: lb?.best_score || 0,
          level: lb?.level || "A1",
          daysStudied: daysStudied || 0,
        });
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "H?c viên";

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Use html2canvas-like approach via canvas
      const { default: html2canvas } = await import("html2canvas");
      const l = LAYOUTS.find(l => l.id === layout) || LAYOUTS[0];
      const canvas = await html2canvas(cardRef.current, {
        width: l.w,
        height: l.h,
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `hanquocoi-progress-${Date.now()}.png`;
      a.click();
    } catch {
      // Fallback: show message
      alert("Trình duy?t không h? tr? t?i ?nh tr?c ti?p. Hãy ch?p màn hình th? này!");
    } finally {
      setDownloading(false);
    }
  }, [layout]);

  const handleCopyLink = useCallback(() => {
    const url = `https://hanquocoi.vn/public-profile/${user?.id || ""}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [user?.id]);

  const shareTexts = [
    `???? Mình dang h?c ti?ng Hàn du?c ${progressData.streak} ngày liên ti?p r?i! Cùng h?c v?i mình t?i hanquocoi.vn nhé! #HànQu?cOi #H?cTi?ngHàn`,
    `? ${progressData.xp.toLocaleString()} XP và ${progressData.wordsLearned} t? v?ng ti?ng Hàn — hành trình chinh ph?c EPS-TOPIK c?a mình t?i hanquocoi.vn`,
    `?? ${progressData.streak} ngày streak h?c ti?ng Hàn! Ai mu?n h?c cùng thì vào hanquocoi.vn nhé, mi?n phí luôn!`,
  ];
  const [shareTextIdx, setShareTextIdx] = useState(0);

  return (
    <DashboardLayout
      title="Chia s? ti?n d? h?c t?p"
      subtitle="T?o th? d?p d? chia s? lên Facebook, Zalo, Instagram"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Card preview */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-app-bg border border-app-border rounded-2xl p-4 sm:p-5">
              <p className="text-white/50 text-xs font-semibold tracking-normal mb-3 sm:mb-4">Xem tru?c th?</p>
              <div className="flex items-center justify-center overflow-hidden rounded-xl bg-app-surface/50 p-2 sm:p-4" style={{ minHeight: 280, maxHeight: 400 }}>
                <ProgressCard
                  theme={theme}
                  layout={layout}
                  data={progressData}
                  name={displayName}
                  cardRef={cardRef}
                />
              </div>
            </div>

            {/* Download & Share buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-50 text-app-bg font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap transition-colors"
              >
                {downloading ? (
                  <><i className="ri-loader-4-line animate-spin" />Ðang t?i...</>
                ) : (
                  <><i className="ri-download-line" />T?i ?nh</>
                )}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-app-card/50 hover:bg-app-card/70 border border-app-border text-white/70 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className={copied ? "ri-check-line text-app-accent-success" : "ri-link"} />
                {copied ? "Ðã copy!" : "Copy link"}
              </button>
            </div>

            {/* Share text */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-white/50 text-[10px] sm:text-xs font-semibold tracking-normal">Caption chia s?</p>
                <button
                  onClick={() => setShareTextIdx(i => (i + 1) % shareTexts.length)}
                  className="text-[9px] sm:text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-refresh-line mr-1" />Ð?i
                </button>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-2.5 sm:p-3 mb-2 sm:mb-3">
                <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-none">{shareTexts[shareTextIdx]}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(shareTexts[shareTextIdx]); }}
                className="flex items-center gap-1.5 text-[10px] sm:text-xs text-app-accent-primary hover:text-[#d4b43a] cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-clipboard-line" />Copy caption
              </button>
            </div>

            {/* Social share buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { label: "Facebook", icon: "ri-facebook-fill", color: "#1877f2", bg: "rgba(24,119,242,0.12)", url: `https://www.facebook.com/sharer/sharer.php?u=https://hanquocoi.vn` },
                { label: "Zalo", icon: "ri-chat-1-line", color: "#0068ff", bg: "rgba(0,104,255,0.12)", url: `https://zalo.me/share?url=https://hanquocoi.vn` },
                { label: "Twitter", icon: "ri-twitter-x-line", color: "#ffffff", bg: "rgba(255,255,255,0.08)", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts[shareTextIdx])}` },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 py-2 sm:py-3 rounded-xl border border-app-border cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: s.bg }}
                >
                  <i className={`${s.icon} text-sm sm:text-lg`} style={{ color: s.color }} />
                  <span className="text-[9px] sm:text-[10px] font-medium" style={{ color: s.color }}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: Customization */}
          <div className="space-y-3 sm:space-y-4">
            {/* Theme selector */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-3 sm:p-5">
              <p className="text-white/50 text-[10px] sm:text-xs font-semibold tracking-normal mb-2 sm:mb-3">Ch? d? màu s?c</p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      background: t.bg,
                      borderColor: theme === t.id ? t.accent : "rgba(255,255,255,0.08)",
                      boxShadow: theme === t.id ? `0 0 0 1px ${t.accent}40` : "none",
                    }}
                  >
                    <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: t.accent }} />
                    <span className="text-[10px] sm:text-xs font-medium" style={{ color: t.text }}>{t.label}</span>
                    {theme === t.id && <i className="ri-check-line ml-auto text-[10px] sm:text-xs" style={{ color: t.accent }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout selector */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-3 sm:p-5">
              <p className="text-white/50 text-[10px] sm:text-xs font-semibold tracking-normal mb-2 sm:mb-3">Kích thu?c th?</p>
              <div className="space-y-1.5 sm:space-y-2">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      backgroundColor: layout === l.id ? "rgba(232,200,74,0.08)" : "rgba(255,255,255,0.03)",
                      borderColor: layout === l.id ? "rgba(232,200,74,0.25)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: layout === l.id ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.05)" }}>
                      <i className={`${l.icon} text-xs sm:text-sm`} style={{ color: layout === l.id ? "app-accent-primary" : "rgba(255,255,255,0.3)" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] sm:text-sm font-medium" style={{ color: layout === l.id ? "app-accent-primary" : "rgba(255,255,255,0.6)" }}>{l.label}</p>
                      <p className="text-[9px] sm:text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{l.w} × {l.h}px</p>
                    </div>
                    {layout === l.id && <i className="ri-check-line text-app-accent-primary text-[10px] sm:text-sm" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats summary */}
            <div className="bg-app-bg border border-app-border rounded-2xl p-3 sm:p-5">
              <p className="text-white/50 text-[10px] sm:text-xs font-semibold tracking-normal mb-2 sm:mb-3">Th?ng kê c?a b?n</p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {[
                  { label: "Streak", value: `${progressData.streak} ngày`, icon: "ri-fire-line", color: "#fb923c" },
                  { label: "XP t?ng", value: progressData.xp.toLocaleString(), icon: "ri-flashlight-line", color: "app-accent-primary" },
                  { label: "T? dã h?c", value: progressData.wordsLearned.toLocaleString(), icon: "ri-book-open-line", color: "#34d399" },
                  { label: "C?p d?", value: progressData.level, icon: "ri-medal-line", color: "#a78bfa" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-app-surface/50">
                    <div className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-xs sm:text-sm`} style={{ color: s.color }} />
                    </div>
                    <div>
                      <p className="text-white/70 text-[10px] sm:text-xs font-semibold">{s.value}</p>
                      <p className="text-app-text-muted text-[9px] sm:text-[10px]">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/personal-stats")}
                className="w-full mt-2 sm:mt-3 flex items-center justify-center gap-2 py-1.5 sm:py-2 rounded-xl border border-app-border text-app-text-secondary text-[10px] sm:text-xs hover:bg-app-card/50 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-bar-chart-line" />
                Xem th?ng kê chi ti?t
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

