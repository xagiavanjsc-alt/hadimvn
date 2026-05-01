import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";

const BOTTOM_NAV = [
  { path: "/", icon: "ri-dashboard-line", label: "Tổng quan", exact: true },
  { path: "/topik-topic-quiz", icon: "ri-survey-line", label: "Quiz" },
  { path: "/topik-flashcard", icon: "ri-stack-line", label: "Flashcard" },
  { path: "/eps-exam", icon: "ri-timer-line", label: "EPS" },
  { path: "/profile", icon: "ri-user-3-line", label: "Hồ sơ" },
];

const MENU_GROUPS = [
  {
    label: "TOPIK",
    items: [
      { path: "/topik-dictionary", icon: "ri-search-2-line", label: "Từ điển TOPIK" },
      { path: "/topik-topic-quiz", icon: "ri-survey-line", label: "Quiz theo chủ đề" },
      { path: "/topik-flashcard", icon: "ri-stack-line", label: "Flashcard TOPIK" },
      { path: "/topik-listening", icon: "ri-headphone-line", label: "Luyện nghe" },
      { path: "/topik-reading", icon: "ri-book-read-line", label: "Luyện đọc" },
      { path: "/topik-stats", icon: "ri-bar-chart-grouped-line", label: "Thống kê TOPIK" },
      { path: "/topik-test", icon: "ri-file-list-2-line", label: "Thi thử TOPIK I" },
      { path: "/topik2-test", icon: "ri-file-list-3-line", label: "Thi thử TOPIK II" },
    ],
  },
  {
    label: "EPS",
    items: [
      { path: "/eps", icon: "ri-file-list-3-line", label: "Luyện thi EPS" },
      { path: "/eps-exam", icon: "ri-timer-line", label: "Thi thử EPS (40 câu)" },
      { path: "/eps-lessons", icon: "ri-book-open-line", label: "60 Bài Học EPS" },
      { path: "/eps-listening", icon: "ri-headphone-line", label: "Luyện nghe EPS" },
      { path: "/eps-vocabulary", icon: "ri-translate-2", label: "Từ vựng EPS" },
      { path: "/eps-flashcard", icon: "ri-stack-line", label: "Flashcard EPS" },
      { path: "/eps-stats", icon: "ri-bar-chart-grouped-line", label: "Thống kê EPS" },
    ],
  },
  {
    label: "Học tiếng Hàn",
    items: [
      { path: "/hangul", icon: "ri-font-size", label: "Bảng chữ Hangul" },
      { path: "/hangul-write", icon: "ri-edit-2-line", label: "Luyện viết Hangul" },
      { path: "/vocabulary", icon: "ri-translate-2", label: "Từ vựng tổng hợp" },
      { path: "/grammar", icon: "ri-book-2-line", label: "Ngữ pháp" },
      { path: "/flashcard", icon: "ri-stack-line", label: "Flashcard" },
      { path: "/daily-review", icon: "ri-sun-line", label: "Ôn tập hàng ngày" },
      { path: "/placement-test", icon: "ri-brain-line", label: "Kiểm tra đầu vào" },
      { path: "/smart-review", icon: "ri-brain-line", label: "Ôn tập thông minh" },
    ],
  },
  {
    label: "Seoul",
    items: [
      { path: "/seoul-textbook", icon: "ri-book-3-line", label: "Giáo Trình Seoul" },
      { path: "/seoul-flashcard", icon: "ri-stack-line", label: "Flashcard Seoul" },
      { path: "/seoul-exam", icon: "ri-file-list-2-line", label: "Bài thi thử Seoul" },
      { path: "/seoul-dictionary", icon: "ri-search-2-line", label: "Từ điển Seoul" },
    ],
  },
  {
    label: "Cộng đồng",
    items: [
      { path: "/community", icon: "ri-group-line", label: "Cộng đồng" },
      { path: "/leaderboard", icon: "ri-trophy-line", label: "Bảng xếp hạng" },
      { path: "/friend-streak", icon: "ri-fire-line", label: "Streak bạn bè" },
      { path: "/weekly-challenge", icon: "ri-trophy-line", label: "Thử thách tuần" },
      { path: "/achievements", icon: "ri-medal-line", label: "Huy hiệu" },
      { path: "/rewards", icon: "ri-gift-line", label: "Phần thưởng & XP" },
    ],
  },
  {
    label: "Công cụ học tập",
    items: [
      { path: "/phrase-dictionary", icon: "ri-chat-3-line", label: "Từ điển giao tiếp" },
      { path: "/eps-topic-dictionary", icon: "ri-book-open-line", label: "Từ điển EPS chủ đề" },
      { path: "/eps-wrong-topic", icon: "ri-error-warning-line", label: "Ôn tập sai EPS" },
      { path: "/study-journal", icon: "ri-draft-line", label: "Nhật ký học tập" },
      { path: "/study-history", icon: "ri-bar-chart-line", label: "Lịch sử học tập" },
      { path: "/conversation", icon: "ri-message-3-line", label: "Tiếng Hàn giao tiếp" },
    ],
  },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f1117] border-t border-white/8 flex md:hidden">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                isActive ? "text-[#e8c84a]" : "text-white/35 hover:text-white/60"
              }`
            }
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${item.icon} text-lg`}></i>
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        {/* More button */}
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0f1117] rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/15"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 flex-shrink-0">
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
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 cursor-pointer"
              >
                <i className="ri-close-line text-base"></i>
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-3 border-b border-white/5 flex-shrink-0">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#e8c84a]/20 flex items-center justify-center">
                      <i className="ri-user-line text-[#e8c84a] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{profile?.display_name || "Học viên"}</p>
                      <p className="text-white/30 text-xs">Đã đăng nhập</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="text-white/30 text-xs px-3 py-1.5 rounded-lg bg-white/5 cursor-pointer whitespace-nowrap"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl px-4 py-3 cursor-pointer"
                >
                  <i className="ri-cloud-line text-[#e8c84a] text-base"></i>
                  <div className="text-left">
                    <p className="text-[#e8c84a] text-sm font-semibold">Đăng nhập</p>
                    <p className="text-[#e8c84a]/50 text-xs">Đồng bộ dữ liệu cloud</p>
                  </div>
                </button>
              )}
            </div>

            {/* Scrollable nav list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 pb-6 space-y-4">
              {MENU_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-white/20 text-[10px] tracking-wider px-2 mb-2">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                            isActive
                              ? "bg-[#e8c84a]/10 text-[#e8c84a] font-medium"
                              : "text-white/50 hover:text-white/80 hover:bg-white/5"
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

              {/* Landing page link */}
              <div>
                <p className="text-white/20 text-[10px] tracking-wider px-2 mb-2">Khác</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <NavLink
                    to="/landing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/5"
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-global-line text-sm"></i>
                    </div>
                    <span>Landing Page</span>
                  </NavLink>
                  <NavLink
                    to="/pricing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/5"
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-vip-crown-line text-sm"></i>
                    </div>
                    <span>Gói VIP</span>
                  </NavLink>
                  <NavLink
                    to="/feedback"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/5"
                  >
                    <i className="ri-chat-smile-2-line text-sm"></i>
                    Góp ý &amp; Đánh giá
                  </NavLink>
                  <NavLink
                    to="/report-bug"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/5"
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-bug-line text-sm"></i>
                    </div>
                    <span>Báo cáo lỗi</span>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
