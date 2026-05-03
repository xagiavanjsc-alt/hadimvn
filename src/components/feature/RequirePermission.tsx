import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRole, hasPermission, type Permission } from "@/lib/permissions";

interface Props {
  permission: Permission;
  children: ReactNode;
  /** Where to redirect if denied. Defaults to /admin */
  redirectTo?: string;
}

export default function RequirePermission({ permission, children, redirectTo = "/admin" }: Props) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="w-10 h-10 border-3 border-app-accent-primary/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const role = getRole(profile);
  if (!hasPermission(role, permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <i className="ri-lock-line text-rose-400 text-3xl"></i>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Không có quyền truy cập</h2>
          <p className="text-app-text-secondary text-sm mb-6">
            Vai trò <span className="text-app-accent-primary font-semibold">{role}</span> không có quyền <code className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{permission}</code>.
            Vui lòng liên hệ Super Admin nếu cần cấp quyền.
          </p>
          <Navigate to={redirectTo} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
