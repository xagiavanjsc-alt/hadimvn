import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

const SESSION_SKIP_KEY = "kts_display_name_skip";

/**
 * Detects whether the user's display_name looks like (or leaks) their email.
 * Common patterns this catches:
 *   - Contains "@"  (e.g. "abc@gmail.com")
 *   - Matches the email local-part exactly (e.g. email "abc@gmail.com",
 *     display_name "abc" — the legacy fallback from AuthContext)
 */
export function isEmailLikeName(displayName: string | null | undefined, email: string | null | undefined): boolean {
  if (!displayName) return false;
  const name = displayName.trim();
  if (!name) return false;
  if (name.includes("@")) return true;
  if (email) {
    const local = email.split("@")[0]?.toLowerCase();
    if (local && name.toLowerCase() === local) return true;
  }
  return false;
}

export interface DisplayNameStatus {
  /** True if the current display_name leaks the user's email. */
  isEmailLike: boolean;
  /** True if the prompt is suppressed for this browser session. */
  hasSkipped: boolean;
  /** Soft-skip the prompt for this session only (re-prompts on next login / new tab). */
  skipForSession: () => void;
  /**
   * Returns true when the user should be hard-blocked from a feature
   * (community post, comment, etc.) because their name is still email-like.
   * "skipForSession" does NOT bypass this — privacy in shared spaces is
   * non-negotiable.
   */
  mustChangeForPublicAction: boolean;
}

export function useDisplayNameStatus(): DisplayNameStatus {
  const { user, profile } = useAuthContext();
  const [skipTick, setSkipTick] = useState(0);

  // Read session-skip flag fresh on each render of the component using this
  // hook — sessionStorage is cheap and the value matters for gating UI.
  const hasSkipped = useMemo(() => {
    try {
      return sessionStorage.getItem(SESSION_SKIP_KEY) === "1";
    } catch {
      return false;
    }
  }, [skipTick]);

  // Reset skip flag whenever user changes (sign-in / sign-out).
  useEffect(() => {
    try {
      sessionStorage.removeItem(SESSION_SKIP_KEY);
      setSkipTick(t => t + 1);
    } catch { /* private mode */ }
  }, [user?.id]);

  const isEmailLike = useMemo(
    () => isEmailLikeName(profile?.display_name, user?.email),
    [profile?.display_name, user?.email]
  );

  const skipForSession = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_SKIP_KEY, "1");
      setSkipTick(t => t + 1);
    } catch { /* private mode */ }
  }, []);

  return {
    isEmailLike,
    hasSkipped,
    skipForSession,
    mustChangeForPublicAction: isEmailLike,
  };
}
