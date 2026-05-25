import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { STORAGE_KEYS } from "@/lib/storageKeys";

/**
 * Redirects new signups to /onboarding on first authenticated render after
 * signup. The flag is set in AuthModal.handleSubmit (signup branch) and lives
 * in localStorage so it survives email-confirm opening a different tab/window.
 * One-shot: cleared after the redirect so the user can leave /onboarding
 * freely without being yanked back.
 *
 * Why this lives outside AuthModal:
 *   The email-confirm magic link can open in a new tab where AuthModal isn't
 *   mounted. Putting the redirect at the App level means any tab that becomes
 *   authenticated with the flag set will trigger the redirect.
 */
export default function OnboardingGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(STORAGE_KEYS.JUST_SIGNED_UP) !== "1") return;
    localStorage.removeItem(STORAGE_KEYS.JUST_SIGNED_UP);
    navigate("/onboarding", { replace: true });
  }, [user, navigate]);
  return null;
}
