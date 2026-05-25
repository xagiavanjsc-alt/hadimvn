import { BrowserRouter, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { AdminToastProvider } from "@/contexts/AdminToastContext";
import ErrorBoundary from "@/components/base/ErrorBoundary";
import { PreloadCommonRoutes } from "./router/config";
import PageTransition from "@/components/base/PageTransition";
import XPNotificationToast from "@/components/feature/XPNotificationToast";
import { DailyLoginBonusGate } from "@/hooks/useDailyLoginBonus";
import { useRefTracking } from "@/hooks/useRefTracking";
import { STORAGE_KEYS } from "@/lib/storageKeys";

function RefTracker() {
  useRefTracking();
  return null;
}

// Redirects new signups to /onboarding on first authenticated render after
// signup. Flag is set in AuthModal.handleSubmit (signup branch) and lives in
// localStorage so it survives email-confirm opening a different tab/window.
// One-shot: cleared after the redirect so the user can leave /onboarding freely.
function OnboardingGate() {
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

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AdminToastProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <ErrorBoundary>
              <PreloadCommonRoutes />
              <RefTracker />
              <OnboardingGate />
              <DailyLoginBonusGate />
              <PageTransition>
                <AppRoutes />
              </PageTransition>
              <XPNotificationToast />
            </ErrorBoundary>
          </BrowserRouter>
        </AdminToastProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
