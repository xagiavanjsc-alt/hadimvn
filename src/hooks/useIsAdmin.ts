import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ─── Admin email list (client-side hint only, RLS is the real guard) ──────────
const ADMIN_EMAILS: string[] = [
  "phudutrang18290@gmail.com",
];

/**
 * useIsAdmin — check if the current user has admin privileges.
 * Priority: 1) Supabase user email in ADMIN_EMAILS list
 *           2) user_profiles.is_vip = true AND localStorage verified
 *           3) localStorage kts_admin_verified (manual toggle fallback)
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Fast sync check from localStorage
    try {
      const raw = localStorage.getItem("kts_admin_verified");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed?.verified === true) {
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem("kts_admin_verified");
          return false;
        }
        return true;
      }
    } catch { /* ignore */ }
    return false;
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const user = data?.user;
      if (!user) return;
      const email = user.email || "";
      // Check email list
      if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email)) {
        markAdminVerified();
        setIsAdmin(true);
        return;
      }
      // Check is_admin from profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (profile?.is_admin === true) {
        markAdminVerified();
        setIsAdmin(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  return isAdmin;
}

/**
 * Mark the current session as admin-verified.
 * Call this when the user successfully loads the admin panel.
 */
export function markAdminVerified(): void {
  localStorage.setItem(
    "kts_admin_verified",
    JSON.stringify({
      verified: true,
      // Expires after 48 hours
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    })
  );
}

/**
 * Clear admin session (logout)
 */
export function clearAdminVerified(): void {
  localStorage.removeItem("kts_admin_verified");
}
