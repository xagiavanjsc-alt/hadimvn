import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";
import DashboardLayout from "./DashboardLayout";

interface RequireAuthProps {
  children: ReactNode;
  title?: string;
  message?: string;
}

/**
 * Bảo vệ route yêu cầu đăng nhập.
 * Guest sẽ thấy placeholder + nút đăng nhập, không render children.
 * Có AuthModal tích hợp sẵn.
 */
export default function RequireAuth({
  children,
  title = "Cần đăng nhập",
  message = "Tính năng này chỉ dành cho thành viên đã đăng nhập.",
}: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <DashboardLayout title="Đang tải...">
        <div className="p-8 flex items-center justify-center min-h-64">
          <div className="w-10 h-10 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title={title}>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-[#141720] border border-white/8 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#e8c84a]/15 mx-auto mb-5">
              <i className="ri-lock-2-line text-[#e8c84a] text-3xl" />
            </div>
            <h2 className="text-white text-lg font-bold mb-2">{title}</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">{message}</p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full py-3 rounded-xl bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
            >
              Đăng nhập / Đăng ký
            </button>
          </div>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
