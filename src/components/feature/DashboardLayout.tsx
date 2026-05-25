import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";
import { useDashboardTheme } from "@/hooks/useDashboardTheme";
import GlobalSearch from "./GlobalSearch";
import AuthModal from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDisplayNameStatus } from "@/hooks/useDisplayNameStatus";
import DisplayNamePromptModal from "./DisplayNamePromptModal";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const { toggle, isDark } = useDashboardTheme();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const { isEmailLike, hasSkipped, skipForSession } = useDisplayNameStatus();
  const showNamePrompt = !!user && isEmailLike && !hasSkipped;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--dash-bg, #13151c)" }}>
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        {title && (
          <header className="hidden md:flex border-b px-6 py-3 items-center justify-between sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: "var(--dash-header, rgba(15,17,23,0.92))", borderColor: "var(--dash-border, rgba(255,255,255,0.06))" }}>
            <div>
              <h1 className="font-semibold text-base leading-tight" style={{ color: "var(--dash-text, rgba(255,255,255,0.85))" }}>{title === "Dashboard" ? "Trang chủ" : title}</h1>
              {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "var(--dash-text-muted, rgba(255,255,255,0.45))" }}>{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <GlobalSearch />
              <NotificationBell />
              <button
                onClick={toggle}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: "var(--dash-hover)", border: "1px solid var(--dash-border)" }}
                title={isDark ? "Chế độ sáng" : "Chế độ tối"}
              >
                <i className={`${isDark ? "ri-sun-line" : "ri-moon-line"} text-sm`} style={{ color: "var(--dash-text-muted)" }}></i>
              </button>

              {!loading && !user && (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                  style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "#e8c84a", border: "1px solid rgba(232,200,74,0.25)" }}
                >
                  <i className="ri-user-line text-xs"></i>
                  Đăng nhập
                </button>
              )}
              {!loading && user && (
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-all hover:bg-app-card/50"
                  style={{ border: "1px solid var(--dash-border)" }}
                >
                  <div className="w-5 h-5 rounded-full bg-app-accent-primary/20 flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-line text-app-accent-primary text-[10px]"></i>
                  </div>
                  <span className="text-xs max-w-[80px] truncate" style={{ color: "var(--dash-text-muted)" }}>{profile?.display_name || "Tôi"}</span>
                </button>
              )}
              {actions}
            </div>
          </header>
        )}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

        {/* Mobile Header */}
        <MobileHeader title={title} />

        {/* Content */}
        <main className="flex-1 overflow-auto dashboard-fade-in">
          {/* Mobile spacer for fixed header */}
          <div className="h-14 md:hidden" />
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
            {children}
          </div>
          {/* Mobile spacer for bottom nav */}
          <div className="h-20 md:hidden" />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {showNamePrompt && (
        <DisplayNamePromptModal onClose={skipForSession} />
      )}
    </div>
  );
}
