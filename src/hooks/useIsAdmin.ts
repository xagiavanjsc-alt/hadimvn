import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/lib/storageKeys";

// ─── Admin email list (client-side hint only, RLS is the real guard) ──────────
const ADMIN_EMAILS: string[] = [
  "phudutrang18290@gmail.com",
];

/**
 * useIsAdmin — check if the current user has admin privileges.
 * Priority: 1) Supabase DB is_admin (authoritative)
 *           2) user email in ADMIN_EMAILS list
 *           3) localStorage cache (1 hour TTL, UI hint only)
 * RLS is the real guard — this hook only controls UI visibility.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Fast sync check from localStorage (cache only, short TTL)
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_VERIFIED);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed?.verified === true) {
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_VERIFIED);
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
      if (!user) {
        // No session → clear cache
        localStorage.removeItem(STORAGE_KEYS.ADMIN_VERIFIED);
        setIsAdmin(false);
        return;
      }
      const email = user.email || "";

      // 1. Check is_admin from DB (authoritative)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (profile?.is_admin === true) {
        markAdminVerified();
        setIsAdmin(true);
        return;
      }

      // 2. Check email whitelist (fallback)
      if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email)) {
        markAdminVerified();
        setIsAdmin(true);
        return;
      }

      // 3. Not admin → clear cache
      localStorage.removeItem(STORAGE_KEYS.ADMIN_VERIFIED);
      setIsAdmin(false);
    });
    return () => { mounted = false; };
  }, []);

  return isAdmin;
}

/**
 * Mark the current session as admin-verified.
 * Short TTL (1 hour) to force re-verification frequently.
 */
export function markAdminVerified(): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_VERIFIED,
    JSON.stringify({
      verified: true,
      // Expires after 1 hour (was 48h — too long for admin cache)
      expiresAt: Date.now() + 60 * 60 * 1000,
    })
  );
}

/**
 * Clear admin session (logout)
 */
export function clearAdminVerified(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_VERIFIED);
}
