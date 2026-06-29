import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isVipActive } from "@/lib/supabase";
import { useIsAdmin, markAdminVerified } from "@/hooks/useIsAdmin";
import AuthModal from "./AuthModal";

// ─── Bottom bar (4 mục cốt lõi — focus EPS-XKLĐ 2026-05-25) ─────────────────
const BOTTOM_NAV = [
  { path: "/", icon: "ri-home-4-line", label: "Trang chủ", exact: true },
  { path: "/eps-lessons", icon: "ri-book-open-line", label: "Học EPS" },
  { path: "/topik-test", icon: "ri-survey-line", label: "Test TOPIK" },
  { path: "/vocab-review", icon: "ri-refresh-line", label: "Ôn tập" },
];

// ─── Slide-up menu — mirror desktop Sidebar (EPS + TOPIK) ───────────────────
const MENU_GROUPS = [
  {
    label: "Luyện thi EPS (XKLĐ)",
    items: [
      { path: "/eps", icon: "ri-dashboard-line", label: "Luyện tập theo chủ đề" },
      { path: "/eps-lessons", icon: "ri-file-list-3-line", label: "60 bài học EPS" },
      { path: "/eps-exams", icon: "ri-file-text-line", label: "Đề thi thực tế" },
      { path: "/eps-mock-exam", icon: "ri-clipboard-line", label: "Đề thi thử" },
      { path: "/exam-schedule", icon: "ri-calendar-line", label: "Lịch thi" },
      { path: "/downloads", icon: "ri-download-line", label: "Tài liệu" },
    ],
  },
  {
    label: "Luyện thi TOPIK (du học)",
    items: [
      { path: "/topik-test", icon: "ri-survey-line", label: "Test TOPIK I" },
      { path: "/topik-flashcard", icon: "ri-stack-line", label: "Flashcard TOPIK" },
      { path: "/topik-dictionary", icon: "ri-book-open-line", label: "Từ điển TOPIK" },
      { path: "/topik-stats", icon: "ri-pie-chart-line", label: "Thống kê TOPIK" },
    ],
  },
  {
    label: "Công cụ học tập",
    items: [
      { path: "/skill-tree", icon: "ri-node-tree", label: "Cây kỹ năng" },
      { path: "/contextual-learning", icon: "ri-book-read-line", label: "Học theo ngữ cảnh" },
      { path: "/real-world-scenarios", icon: "ri-play-circle-line", label: "Tình huống thực tế" },
      { path: "/smart-review", icon: "ri-brain-line", label: "Smart Review" },
      { path: "/content-interlinking", icon: "ri-links-line", label: "Liên kết nội dung" },
      { path: "/micro-learning", icon: "ri-time-line", label: "Học nhanh 5 phút" },
      { path: "/vocab-review", icon: "ri-refresh-line", label: "Ôn tập từ vựng (SRS)" },
      { path: "/learning-path", icon: "ri-route-line", label: "Lộ trình cá nhân" },
      { path: "/question-bank", icon: "ri-database-2-line", label: "Ngân hàng câu hỏi" },
      { path: "/dictionary", icon: "ri-search-2-line", label: "Từ điển" },
      // HIDDEN 2026-06-30 (simplify menu): listening-practice, writing-practice, gamification, offline-downloads, hangul, vocabulary, grammar
    ],
  },
  {
    label: "Cộng đồng",
    items: [
      { path: "/study-groups", icon: "ri-group-line", label: "Nhóm học tập" },
      { path: "/qa-forum", icon: "ri-question-answer-line", label: "Diễn đàn hỏi đáp" },
      { path: "/success-stories", icon: "ri-trophy-line", label: "Câu chuyện thành công" },
    ],
  },
  {
    label: "Cá nhân",
    items: [
      { path: "/profile", icon: "ri-user-3-line", label: "Hồ sơ cá nhân" },
      { path: "/study-stats", icon: "ri-bar-chart-2-line", label: "Thống kê học tập" },
      { path: "/notification-settings", icon: "ri-notification-3-line", label: "Cài đặt thông báo" },
      // HIDDEN 2026-06-30 (simplify menu): daily-words, progress-sharing, feedback, report-bug
    ],
  },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, profile, signOut } = useAuth();
  const isAdminDetected = useIsAdmin();
  const navigate = useNavigate();

  // No special group filtering needed after 2026-05-25 cleanup (Hán Hàn VIP removed)
  const groups = MENU_GROUPS;

  return (
    <>
      {/* Bottom Navigation Bar — 5 mục cốt lõi + nút Thêm */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-app-bg border-t border-app-border flex md:hidden">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                isActive ? "text-app-accent-primary" : "text-white/35 hover:text-white/60"
              }`
            }
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${item.icon} text-lg`}></i>
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-white/35 hover:text-white/60 cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-menu-line text-lg"></i>
          </div>
          <span className="text-[10px] font-medium">Thêm</span>
        </button>
      </nav>

      {/* Full-screen slide-up menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-app-bg rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/15"></div>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-app-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src="/images/brand/logo.svg"
                  alt="Logo"
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-white font-semibold text-sm">Hàn Quốc Ơi!</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/50 cursor-pointer"
              >
                <i className="ri-close-line text-base"></i>
              </button>
            </div>

            <div className="px-5 py-3 border-b border-app-border flex-shrink-0">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-app-accent-primary/20 flex items-center justify-center">
                      <i className="ri-user-line text-app-accent-primary text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{profile?.display_name || "Học viên"}</p>
                      <p className="text-app-text-muted text-xs">
                        {isVipActive(profile) ? "VIP" : "Đã đăng nhập"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="text-app-text-muted text-xs px-3 py-1.5 rounded-lg bg-app-card/50 cursor-pointer whitespace-nowrap"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl px-4 py-3 cursor-pointer"
                >
                  <i className="ri-cloud-line text-app-accent-primary text-base"></i>
                  <div className="text-left">
                    <p className="text-app-accent-primary text-sm font-semibold">Đăng nhập</p>
                    <p className="text-app-accent-primary/50 text-xs">Đồng bộ dữ liệu cloud</p>
                  </div>
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-3 pb-6 space-y-4">
              {/* Admin shortcut */}
              {user && isAdminDetected && (
                <button
                  onClick={() => { markAdminVerified(); navigate("/admin"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.20)" }}
                >
                  <i className="ri-shield-keyhole-line text-rose-400 text-base"></i>
                  <span className="text-xs font-semibold text-rose-400 flex-1 text-left">Trang quản lý admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                </button>
              )}

              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-app-text-muted text-[10px] tracking-normal px-2 mb-2 uppercase">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                            isActive
                              ? "bg-app-accent-primary/10 text-app-accent-primary font-medium"
                              : "text-white/50 hover:text-white/80 hover:bg-app-card/50"
                          }`
                        }
                      >
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <i className={`${item.icon} text-sm`}></i>
                        </div>
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
