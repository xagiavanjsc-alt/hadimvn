import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS: string[] = [
  "phudutrang18290@gmail.com",
];

type GuardState = "checking" | "allowed" | "denied";

/**
 * AdminGuard — server-side admin check.
 * Verifies BOTH:
 *   1. User is authenticated (Supabase session)
 *   2. user_profiles.is_admin = true OR email in ADMIN_EMAILS
 * Does NOT rely on localStorage at all.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        // 1. Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) setState("denied");
          return;
        }

        const email = session.user.email || "";

        // 2. Check email whitelist (fast path)
        if (ADMIN_EMAILS.includes(email)) {
          if (mounted) setState("allowed");
          return;
        }

        // 3. Check is_admin from DB (authoritative)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profile?.is_admin === true) {
          setState("allowed");
        } else {
          setState("denied");
        }
      } catch {
        if (mounted) setState("denied");
      }
    };

    check();
    return () => { mounted = false; };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-app-text-secondary text-sm">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto mb-6">
            <i className="ri-shield-keyhole-line text-rose-400 text-4xl" />
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Truy cập bị từ chối</h1>
          <p className="text-app-text-secondary text-sm mb-6 leading-relaxed">
            Bạn không có quyền truy cập trang quản trị. Chỉ tài khoản Admin mới được phép vào khu vực này.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-home-line" />
              Về trang chủ
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/50 text-sm py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-arrow-left-line" />
              Quay lại
            </button>
          </div>
          <p className="text-app-text-muted text-xs mt-6">
            Nếu bạn là admin, hãy đăng nhập bằng tài khoản admin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
