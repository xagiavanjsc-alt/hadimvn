import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, markAdminVerified } from "@/hooks/useIsAdmin";
import AuthModal from "./AuthModal";
import NotificationBell from "./NotificationBell";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function MobileHeader({ title, showBack }: MobileHeaderProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#0f1117]/95 backdrop-blur-md border-b border-white/8 h-14 flex items-center px-4 gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 cursor-pointer flex-shrink-0"
          >
            <i className="ri-arrow-left-line text-base"></i>
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <img
              src="https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png"
              alt="Logo"
              className="w-7 h-7 rounded-lg object-cover"
            />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {title ? (
            <p className="text-white font-semibold text-sm truncate">{title}</p>
          ) : (
            <p className="text-white font-bold text-sm">Hàn Quốc Ơi!</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <NotificationBell />
          {/* Admin button trên mobile */}
          {user && isAdmin && (
            <button
              onClick={() => { markAdminVerified(); navigate("/admin"); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ backgroundColor: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.25)" }}
              title="Trang quản lý admin"
            >
              <i className="ri-shield-keyhole-line text-rose-400 text-sm"></i>
            </button>
          )}
          {/* Chỉ hiện khi không loading và chưa đăng nhập */}
          {!loading && !user && (
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs font-semibold text-[#e8c84a] bg-[#e8c84a]/10 border border-[#e8c84a]/20 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Đăng nhập
            </button>
          )}
          {!loading && user && (
            <button
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-[#e8c84a]/20 flex items-center justify-center cursor-pointer"
            >
              <i className="ri-user-line text-[#e8c84a] text-sm"></i>
            </button>
          )}
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
