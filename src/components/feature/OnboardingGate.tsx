import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Redirects users with no completed onboarding to /onboarding on every
 * authenticated render. Source of truth is `user_profiles.onboarded_at`:
 *   NULL → never finished the quiz → force redirect.
 *   NOT NULL → completed at that timestamp → stay out of the way.
 *
 * Why DB instead of localStorage:
 *   The original localStorage flag broke whenever the email-confirm magic
 *   link landed in a different storage partition than where signup happened
 *   (incognito↔regular, mobile↔desktop). A column on the user row works
 *   across browsers, devices, sessions.
 *
 * Skips redirecting when already on /onboarding (avoids an infinite loop
 * while the page itself runs).
 */
export default function OnboardingGate() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    if (!profile) return; // wait for profile fetch
    if (profile.onboarded_at) return; // already onboarded
    if (location.pathname === "/onboarding") return; // don't loop
    navigate("/onboarding", { replace: true });
  }, [user, profile, location.pathname, navigate]);

  return null;
}
