import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isVipActive } from "@/lib/supabase";
import { useIsAdmin, markAdminVerified } from "@/hooks/useIsAdmin";
import AuthModal from "./AuthModal";

// ─── Bottom bar (5 mục cốt lõi) ──────────────────────────────────────────────
const BOTTOM_NAV = [
  { path: "/", icon: "ri-home-4-line", label: "Trang chủ", exact: true },
  { path: "/learning-hub", icon: "ri-book-open-line", label: "Học" },
  { path: "/exam-hub", icon: "ri-survey-line", label: "Thi" },
  { path: "/community", icon: "ri-group-line", label: "Cộng đồng" },
];

// ─── Slide-up menu — mirror desktop Sidebar (đã tối ưu gọn) ─────────────────
const MENU_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      { path: "/learning-hub", icon: "ri-dashboard-line", label: "Learning Hub" },
      { path: "/exam-hub", icon: "ri-file-list-3-line", label: "Exam Hub" },
      { path: "/flashcard-hub", icon: "ri-stack-line", label: "Flashcard Hub" },
      { path: "/leaderboard", icon: "ri-trophy-line", label: "Bảng xếp hạng" },
    ],
  },
  {
    label: "Học tập",
    items: [
      { path: "/eps-lessons", icon: "ri-file-list-3-line", label: "EPS (Lao động)" },
      { path: "/seoul-textbook", icon: "ri-book-3-line", label: "Seoul (Du học)" },
      { path: "/topik-test", icon: "ri-survey-line", label: "TOPIK (Chứng chỉ)" },
      { path: "/grammar-by-level", icon: "ri-book-2-line", label: "Ngữ pháp TOPIK" },
      { path: "/topik-vocab-level", icon: "ri-translate-2", label: "Từ vựng TOPIK" },
      { path: "/hanja-detail", icon: "ri-character-recognition-line", label: "Hán Hàn" },
      { path: "/hanja-pro", icon: "ri-character-recognition-line", label: "Hán Hàn Chuyên Sâu" },
    ],
  },
  {
    label: "Hán Hàn VIP",
    items: [
      { path: "/hanja-tree", icon: "ri-git-merge-line", label: "Hình cây từ vựng" },
      { path: "/hanja-dashboard", icon: "ri-bar-chart-2-line", label: "Tiến độ & Streak" },
      { path: "/advanced-dictionary", icon: "ri-search-2-line", label: "Tra cứu Hán Hàn" },
    ],
  },
  {
    label: "AI & Kỹ năng",
    items: [
      { path: "/ai-chatbot", icon: "ri-robot-2-line", label: "Gia sư AI" },
      { path: "/ai-pronunciation", icon: "ri-mic-line", label: "Luyện phát âm" },
      { path: "/shadowing-practice", icon: "ri-volume-up-line", label: "Shadowing" },
      { path: "/listening-dictation", icon: "ri-headphone-line", label: "Nghe chép" },
      { path: "/handwriting-practice", icon: "ri-edit-line", label: "Luyện viết" },
      { path: "/cultural-content", icon: "ri-landscape-line", label: "Văn hóa" },
      { path: "/ai-writing", icon: "ri-quill-pen-line", label: "Viết & Dịch" },
      { path: "/kdrama-learn", icon: "ri-film-line", label: "Học qua phim & K-pop" },
      { path: "/kpop-flashcard", icon: "ri-music-2-line", label: "Flashcard K-pop cá nhân" },
    ],
  },
  {
    label: "Cộng đồng",
    items: [
      { path: "/community", icon: "ri-group-line", label: "Hỏi đáp" },
      { path: "/profile", icon: "ri-user-3-line", label: "Hồ sơ cá nhân" },
    ],
  },
  {
    label: "Cá nhân",
    items: [
      { path: "/study-stats", icon: "ri-bar-chart-2-line", label: "Thống kê học tập" },
      { path: "/daily-words", icon: "ri-sun-line", label: "Từ mới hôm nay" },
      { path: "/learning-roadmap", icon: "ri-route-line", label: "Lộ trình học" },
      { path: "/share-progress", icon: "ri-share-line", label: "Chia sẻ tiến độ" },
      { path: "/rewards", icon: "ri-gift-line", label: "Phần thưởng & XP" },
    ],
  },
  {
    label: "Khác",
    items: [
      { path: "/pricing", icon: "ri-vip-crown-line", label: "Gói VIP" },
      { path: "/feedback", icon: "ri-chat-smile-2-line", label: "Góp ý" },
      { path: "/report-bug", icon: "ri-bug-line", label: "Báo lỗi" },
    ],
  },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, profile, signOut } = useAuth();
  const isAdminDetected = useIsAdmin();
  const navigate = useNavigate();

  // Filter Hán Hàn VIP group nếu chưa VIP
  const groups = MENU_GROUPS.filter(g =>
    g.label !== "Hán Hàn VIP" || (user && isVipActive(profile))
  );

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
                  src="https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png"
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
