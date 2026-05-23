import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { isVipActive } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useStudySync } from "@/hooks/useStudySync";
import { useIsAdmin, markAdminVerified } from "@/hooks/useIsAdmin";
import { useEffect, useState, useMemo, memo } from "react";
import AuthModal from "./AuthModal";
import { RANKS } from "@/data/ranks";
import { getStreakData } from "@/utils/streak";

function getRankForXP(xp: number) {
  return [...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0];
}

function StreakBadge() {
  const { user, profile } = useAuth();
  const streak = getStreakData();
  const [xpFromDB, setXpFromDB] = useState(0);

  // Fetch XP from user_progress (unified source of truth)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase.from("user_progress").select("xp").eq("user_id", user.id).maybeSingle()
      .then(
        ({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.warn("[Sidebar] XP fetch failed:", error.message);
            return;
          }
          if (data) setXpFromDB(data.xp);
        },
        (err) => { if (!cancelled) console.warn("[Sidebar] XP fetch threw:", err); }
      );
    return () => { cancelled = true; };
  }, [user]);

  const totalXP = xpFromDB || 0;
  const rank = getRankForXP(totalXP);
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const progress = nextRank
    ? Math.min(100, ((totalXP - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100)
    : 100;

  return (
    <div className="px-3 py-2.5 bg-app-accent-primary/5 border border-app-accent-primary/10 rounded-xl mb-2 space-y-2">
      <div className="flex items-center gap-1.5">
        <i className="ri-fire-line text-app-accent-primary text-sm"></i>
        <div className="flex-1">
          <p className="text-app-accent-primary text-xs font-bold">{streak.currentStreak} ngày liên tiếp</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <i className={`${rank.icon} text-xs`} style={{ color: rank.color }}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold" style={{ color: rank.color }}>{rank.name}</span>
            <span className="text-app-text-muted text-[9px]">{totalXP.toLocaleString()} XP</span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: rank.color }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Nav groups — Tối ưu gọn nhất ───────────────────────────────────────────
const navGroups = [
  {
    label: "Tổng quan",
    icon: "ri-dashboard-line",
    color: "app-accent-primary",
    items: [
      { path: "/learning-hub", icon: "ri-dashboard-line", label: "Learning Hub" },
      { path: "/exam-hub", icon: "ri-file-list-3-line", label: "Exam Hub" },
      { path: "/flashcard-hub", icon: "ri-stack-line", label: "Flashcard Hub" },
      { path: "/leaderboard", icon: "ri-trophy-line", label: "Bảng xếp hạng" },
    ],
  },
  {
    label: "Học tập",
    icon: "ri-book-open-line",
    color: "#4ade80",
    items: [
      { path: "/eps-lessons", icon: "ri-file-list-3-line", label: "EPS (Lao động)" },
      { path: "/seoul-textbook", icon: "ri-book-3-line", label: "Seoul (Du học)" },
      { path: "/topik-test", icon: "ri-survey-line", label: "TOPIK (Chứng chỉ)" },
      { path: "/grammar-by-level", icon: "ri-book-2-line", label: "Ngữ pháp TOPIK" },
      { path: "/topik-exam-writing", icon: "ri-draft-line", label: "Luyện Viết TOPIK II" },
      { path: "/topik-vocab-level", icon: "ri-translate-2", label: "Từ vựng TOPIK" },
    ],
  },
  {
    label: "Hán Hàn",
    icon: "ri-character-recognition-line",
    badge: "VIP",
    color: "app-accent-primary",
    items: [
      { path: "/hanja-detail", icon: "ri-character-recognition-line", label: "Hán Hàn Cơ Bản" },
      { path: "/hanja-flashcard", icon: "ri-stack-line", label: "Flashcard Hán Hàn" },
      { path: "/hanja-pro", icon: "ri-character-recognition-line", label: "Hán Hàn Chuyên Sâu" },
      { path: "/hanja-dashboard", icon: "ri-bar-chart-2-line", label: "Tiến độ & Streak" },
      { path: "/hanja-stories", icon: "ri-book-read-line", label: "Truyện Chêm" },
      { path: "/advanced-dictionary", icon: "ri-search-2-line", label: "Tra cứu Hán Hàn" },
    ],
  },
  {
    label: "Ai & Kỹ năng",
    icon: "ri-robot-2-line",
    color: "#a78bfa",
    items: [
      { path: "/ai-chatbot", icon: "ri-robot-2-line", label: "Gia sư AI" },
      { path: "/ai-pronunciation", icon: "ri-mic-line", label: "Luyện phát âm" },
      { path: "/shadowing-practice", icon: "ri-volume-up-line", label: "Shadowing" },
      { path: "/listening-dictation", icon: "ri-headphone-line", label: "Nghe chép" },
      { path: "/handwriting-practice", icon: "ri-edit-line", label: "Luyện viết" },
      { path: "/cultural-content", icon: "ri-landscape-line", label: "Văn hóa" },
      { path: "/offline-manager", icon: "ri-download-cloud-line", label: "Offline" },
      { path: "/ai-writing", icon: "ri-quill-pen-line", label: "Viết & Dịch" },
      { path: "/kdrama-learn", icon: "ri-film-line", label: "Học qua phim & K-pop" },
      { path: "/kpop-flashcard", icon: "ri-music-2-line", label: "Flashcard K-pop cá nhân" },
    ],
  },
  {
    label: "Cộng đồng",
    icon: "ri-question-answer-line",
    color: "#fb923c",
    items: [
      { path: "/naver", icon: "ri-question-answer-line", label: "Naver KiN Q&A" },
      { path: "/profile", icon: "ri-user-3-line", label: "Hồ sơ cá nhân" },
    ],
  },
];

// Admin group removed from user sidebar — admin has its own dedicated panel at /admin

const DEFAULT_OPEN: Record<string, boolean> = {
  "Tổng quan": true,
  "Học tập": true,
  "Hán Hàn Vip": false,
  "Ai & Kỹ năng": false,
  "Cộng đồng": false,
};

// All nav items flattened for pin search
const ALL_NAV_ITEMS = navGroups.flatMap(g => g.items.map(item => ({ ...item, group: g.label })));

function PinnedSection({ pinnedPaths, onUnpin, onNavigate, currentPath }: {
  pinnedPaths: string[];
  onUnpin: (path: string) => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}) {
  if (pinnedPaths.length === 0) return null;
  const items = pinnedPaths.map(p => ALL_NAV_ITEMS.find(i => i.path === p)).filter(Boolean) as typeof ALL_NAV_ITEMS;
  return (
    <div className="mb-2">
      <p className="text-[9px] tracking-normal font-semibold text-app-accent-primary/40 px-3 py-1">Đã ghim</p>
      <div className="space-y-0.5">
        {items.map(item => {
          const isActive = currentPath === item.path;
          return (
            <div key={item.path} className="flex items-center group/pin">
              <button
                onClick={() => onNavigate(item.path)}
                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
                  isActive ? "bg-app-accent-primary/10 text-app-accent-primary font-medium" : "text-white/55 hover:text-white/85 hover:bg-white/6"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-sm`}></i>
                </div>
                <span className="flex-1 truncate">{item.label}</span>
              </button>
              <button
                onClick={() => onUnpin(item.path)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer opacity-0 group-hover/pin:opacity-100 mr-1 flex-shrink-0"
                title="Bỏ ghim"
              >
                <i className="ri-pushpin-fill text-xs"></i>
              </button>
            </div>
          );
        })}
      </div>
      <div className="mx-3 mt-1 mb-1 h-px bg-app-card/50"></div>
    </div>
  );
}

function SidebarInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, loading } = useAuth();
  const { syncToCloud, updateLeaderboard } = useStudySync();
  const isAdminDetected = useIsAdmin();
  const [showAuth, setShowAuth] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useLocalStorage<Record<string, boolean>>(
    "kts_sidebar_groups_v2",
    DEFAULT_OPEN
  );
  const [pinnedPaths, setPinnedPaths] = useLocalStorage<string[]>("kts_sidebar_pinned", []);
  const [showPinSearch, setShowPinSearch] = useState(false);
  const [pinSearchQuery, setPinSearchQuery] = useState("");

  // Clear pending when route actually changes
  useEffect(() => {
    setPendingPath(null);
  }, [location.pathname]);

  // Auto-expand group when clicking a nav item
  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-expand group when navigating to a page inside it
  useEffect(() => {
    const currentPath = location.pathname;
    navGroups.forEach(group => {
      const hasActive = group.items.some(item => item.path === currentPath);
      if (hasActive) {
        setOpenGroups(prev => {
          if (prev[group.label]) return prev;
          return { ...prev, [group.label]: true };
        });
      }
    });
  }, [location.pathname]);

  // Auto-sync every 5 minutes when logged in
  useEffect(() => {
    if (!user || !profile) return;
    const doSync = async () => {
      setSyncing(true);
      await syncToCloud(user.id);
      await updateLeaderboard(user.id, profile.display_name);
      setSyncing(false);
    };
    doSync();
    const interval = setInterval(doSync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id, profile?.display_name]);

  const allGroups = useMemo(() => navGroups, []);

  const handleNavClick = (path: string) => {
    if (location.pathname !== path) {
      setPendingPath(path);
    }
    navigate(path);
    setShowPinSearch(false);
  };

  const togglePin = (path: string) => {
    setPinnedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const filteredPinItems = useMemo(() => {
    if (!pinSearchQuery.trim()) return ALL_NAV_ITEMS;
    const q = pinSearchQuery.toLowerCase();
    return ALL_NAV_ITEMS.filter(i =>
      i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q)
    );
  }, [pinSearchQuery]);

  // Hover preload — fire import() when hovering a link
  const handleNavHover = (path: string) => {
    if (location.pathname === path) return;
    const importMap: Record<string, () => Promise<unknown>> = {
      "/eps-vocabulary": () => import("@/pages/eps-vocabulary/page"),
      "/eps": () => import("@/pages/eps/page"),
      "/eps-exam": () => import("@/pages/eps-exam/page"),
      "/eps-flashcard": () => import("@/pages/eps-flashcard/page"),
      "/eps-lessons": () => import("@/pages/eps-lessons/page"),
      "/eps-topic-dictionary": () => import("@/pages/eps-topic-dictionary/page"),
      "/eps-topics": () => import("@/pages/eps-topics/page"),
      "/melon": () => import("@/pages/melon/page"),
      "/community": () => import("@/pages/community/page"),
      "/profile": () => import("@/pages/profile/page"),
      "/leaderboard": () => import("@/pages/leaderboard/page"),
      "/vocabulary": () => import("@/pages/vocabulary/page"),
      "/grammar": () => import("@/pages/grammar/page"),
      "/grammar-by-level": () => import("@/pages/grammar-by-level/page"),
      "/flashcard": () => import("@/pages/flashcard/page"),
      "/hangul": () => import("@/pages/hangul/page"),
      "/hanja-vocab": () => import("@/pages/hanja-vocab/page"),
      "/topik-test": () => import("@/pages/topik-test/page"),
      "/topik2-test": () => import("@/pages/topik2-test/page"),
      "/seoul-textbook": () => import("@/pages/seoul-textbook/page"),
      "/naver": () => import("@/pages/naver/page"),
      "/news": () => import("@/pages/news/page"),
      "/ebook": () => import("@/pages/ebook/page"),
      "/admin": () => import("@/pages/admin-dashboard/page"),
      "/admin/users": () => import("@/pages/admin-users/page"),
      "/admin/coupon": () => import("@/pages/admin-coupon/page"),
      "/admin/pricing": () => import("@/pages/admin-pricing/page"),
    };
    const factory = importMap[path];
    if (factory) factory().catch(() => { /* ignore */ });
  };

  return (
    <aside className="w-60 min-h-screen bg-[#141720] flex flex-col border-r border-app-border overflow-y-auto">
      {/* Logo */}
      <button
        onClick={() => handleNavClick("/")}
        className="flex items-center gap-3 px-5 py-5 border-b border-app-border flex-shrink-0 cursor-pointer text-left hover:bg-app-surface/50 transition-colors"
      >
        <img
          src="/images/brand/logo.svg"
          alt="Hàn Quốc Ơi! Logo"
          className="w-9 h-9 rounded-lg object-cover"
        />
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Hàn Quốc Ơi!</p>
          <p className="text-app-text-secondary text-xs">Học tiếng Hàn</p>
        </div>
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <StreakBadge />

        {/* Pinned section */}
        <PinnedSection
          pinnedPaths={pinnedPaths}
          onUnpin={togglePin}
          onNavigate={handleNavClick}
          currentPath={location.pathname}
        />

        {/* Home */}
        <button
          onClick={() => handleNavClick("/")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
            location.pathname === "/" || location.pathname === "/dashboard"
              ? "bg-app-accent-primary/10 text-app-accent-primary font-medium"
              : "text-white/55 hover:text-white/85 hover:bg-white/6"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-home-4-line text-sm"></i>
          </div>
          <span className="flex-1">Trang chủ</span>
        </button>

        {/* Daily words shortcut */}
        <button
          onClick={() => handleNavClick("/daily-words")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
            location.pathname === "/daily-words"
              ? "bg-[#4ade80]/10 text-[#4ade80] font-medium"
              : "text-white/50 hover:text-white/80 hover:bg-white/6"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-sun-line text-sm"></i>
          </div>
          <span className="flex-1">Học từ mới hôm nay</span>
        </button>

        {/* Stats shortcut */}
        <button
          onClick={() => handleNavClick("/study-stats")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
            location.pathname === "/study-stats"
              ? "bg-[#38bdf8]/10 text-[#38bdf8] font-medium"
              : "text-white/50 hover:text-white/80 hover:bg-white/6"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-bar-chart-2-line text-sm"></i>
          </div>
          <span className="flex-1">Thống kê học tập</span>
        </button>

        {/* VIP History shortcut — chỉ hiện khi là VIP */}
        {user && isVipActive(profile) && (
          <button
            onClick={() => handleNavClick("/vip-history")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
              location.pathname === "/vip-history"
                ? "bg-app-accent-primary/10 text-app-accent-primary font-medium"
                : "text-white/50 hover:text-white/80 hover:bg-white/6"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-vip-crown-line text-sm"></i>
            </div>
            <span className="flex-1">Lịch sử VIP</span>
          </button>
        )}

        {/* Share progress shortcut */}
        <button
          onClick={() => handleNavClick("/share-progress")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
            location.pathname === "/share-progress"
              ? "bg-[#fb923c]/10 text-[#fb923c] font-medium"
              : "text-white/50 hover:text-white/80 hover:bg-white/6"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-share-line text-sm"></i>
          </div>
          <span className="flex-1">Chia sẻ tiến độ</span>
        </button>

        {/* Feedback shortcut */}
        <button
          onClick={() => handleNavClick("/feedback")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
            location.pathname === "/feedback"
              ? "bg-[#34d399]/10 text-[#34d399] font-medium"
              : "text-white/50 hover:text-white/80 hover:bg-white/6"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-chat-smile-2-line text-sm"></i>
          </div>
          <span className="flex-1">Góp ý &amp; Đánh giá</span>
        </button>

        {/* Roadmap shortcut */}
        <button
          onClick={() => handleNavClick("/learning-roadmap")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
            location.pathname === "/learning-roadmap"
              ? "bg-app-accent-primary/10 text-app-accent-primary font-medium"
              : "text-white/50 hover:text-white/80 hover:bg-white/6"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-route-line text-sm"></i>
          </div>
          <span className="flex-1">Lộ trình học</span>
        </button>

        {/* Nav groups */}
        {allGroups.map(group => {
          const isOpen = openGroups[group.label] ?? DEFAULT_OPEN[group.label] ?? false;
          const hasActive = group.items.some(item => location.pathname === item.path);
          const grpWithBadge = group as typeof group & { badge?: string; color?: string };
          const grpColor = grpWithBadge.color || "app-accent-primary";

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer group ${
                  hasActive ? "bg-app-surface/50" : "hover:bg-app-surface/50"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className={`${group.icon} text-sm`} style={{ color: hasActive ? grpColor : "rgba(255,255,255,0.3)" }}></i>
                </div>
                <p className="flex-1 text-left text-xs font-semibold transition-colors"
                  style={{ color: hasActive ? grpColor + "99" : "rgba(255,255,255,0.35)" }}>
                  {group.label}
                </p>
                {grpWithBadge.badge && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold mr-1" style={{ backgroundColor: grpColor + "22", color: grpColor }}>{grpWithBadge.badge}</span>
                )}
                <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                  <i className={`text-[10px] transition-transform duration-200 ${
                    isOpen ? "ri-arrow-down-s-line text-app-text-muted" : "ri-arrow-right-s-line text-white/15"
                  }`}></i>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-0.5 pb-1 pl-1">
                  {group.items.map(item => {
                    const isActive = location.pathname === item.path;
                    const isPinned = pinnedPaths.includes(item.path);
                    return (
                      <div key={item.path} className="flex items-center group/item">
                        <button
                          onClick={() => handleNavClick(item.path)}
                          onMouseEnter={() => handleNavHover(item.path)}
                          className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap text-left ${
                            isActive
                              ? "bg-app-accent-primary/10 text-app-accent-primary font-medium"
                              : "text-white/50 hover:text-white/80 hover:bg-white/6"
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <i className={`${item.icon} text-sm`}></i>
                          </div>
                          <span className="flex-1 truncate">{item.label}</span>
                        </button>
                        <button
                          onClick={() => togglePin(item.path)}
                          className={`w-6 h-6 flex items-center justify-center rounded-md transition-all cursor-pointer mr-1 flex-shrink-0 ${
                            isPinned
                              ? "text-app-accent-primary/60 hover:text-red-400 hover:bg-red-500/10"
                              : "text-white/10 hover:text-app-accent-primary/50 hover:bg-app-accent-primary/10 opacity-0 group-hover/item:opacity-100"
                          }`}
                          title={isPinned ? "Bỏ ghim" : "Ghim vào đầu"}
                        >
                          <i className={`${isPinned ? "ri-pushpin-fill" : "ri-pushpin-line"} text-xs`}></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Admin Panel shortcut — chỉ hiện khi là admin */}
        {user && isAdminDetected && (
          <button
            onClick={() => { markAdminVerified(); navigate("/admin"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer mt-1"
            style={{ backgroundColor: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.20)" }}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-shield-keyhole-line text-rose-400 text-sm"></i>
            </div>
            <span className="text-xs font-semibold text-rose-400 flex-1 text-left">Trang quản lý admin</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0"></span>
          </button>
        )}
      </nav>

      {/* Footer — Auth */}
      <div className="px-4 py-3 border-t border-app-border flex-shrink-0 space-y-2">
        {user ? (
          <div>
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-2 hover:bg-app-card/50 rounded-lg px-2 py-2 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-app-accent-primary/20 flex items-center justify-center flex-shrink-0">
                <i className="ri-user-line text-app-accent-primary text-xs"></i>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-white/70 text-xs font-medium truncate">{profile?.display_name || "Học viên"}</p>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${syncing ? "bg-app-accent-primary animate-pulse" : "bg-emerald-400"}`}></div>
                  <p className="text-app-text-muted text-[10px]">{syncing ? "Đang sync..." : "Đã đồng bộ"}</p>
                </div>
              </div>
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-app-text-muted hover:text-white/50 text-xs cursor-pointer whitespace-nowrap"
            >
              <i className="ri-logout-box-line text-xs"></i>
              Đăng xuất
            </button>
          </div>
        ) : null}
      </div>

      {/* Pin search modal */}
      {showPinSearch && (
        <div className="fixed inset-0 z-[200] flex items-start justify-start" onClick={() => setShowPinSearch(false)}>
          <div
            className="w-60 ml-0 mt-0 bg-[#1a1d27] border border-app-border rounded-r-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: "100vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-app-border flex items-center gap-2">
              <i className="ri-pushpin-line text-app-accent-primary text-sm"></i>
              <p className="text-white/70 text-xs font-semibold flex-1">Ghim menu yêu thích</p>
              <button onClick={() => setShowPinSearch(false)} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
            <div className="p-2 border-b border-app-border">
              <div className="relative">
                <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-app-text-muted text-xs"></i>
                <input
                  type="text"
                  placeholder="Tìm menu..."
                  value={pinSearchQuery}
                  onChange={e => setPinSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-7 pr-3 py-1.5 bg-app-card/50 border border-app-border rounded-lg text-white text-xs placeholder-white/25 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredPinItems.map(item => {
                const isPinned = pinnedPaths.includes(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => togglePin(item.path)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                      isPinned
                        ? "bg-app-accent-primary/10 text-app-accent-primary"
                        : "text-white/50 hover:text-white/80 hover:bg-white/6"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-sm`}></i>
                    </div>
                    <span className="flex-1 truncate">{item.label}</span>
                    <i className={`${isPinned ? "ri-pushpin-fill text-app-accent-primary" : "ri-pushpin-line text-app-text-muted"} text-xs flex-shrink-0`}></i>
                  </button>
                );
              })}
            </div>
            {pinnedPaths.length > 0 && (
              <div className="p-2 border-t border-app-border">
                <button
                  onClick={() => setPinnedPaths([])}
                  className="w-full py-1.5 text-xs text-app-accent-error/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                >
                  Xóa tất cả ghim ({pinnedPaths.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </aside>
  );
}

const Sidebar = memo(SidebarInner);
export default Sidebar;
