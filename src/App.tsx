import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminToastProvider } from "@/contexts/AdminToastContext";
import ErrorBoundary from "@/components/base/ErrorBoundary";
import { PreloadCommonRoutes } from "./router/config";
import PageTransition from "@/components/base/PageTransition";
import XPNotificationToast from "@/components/feature/XPNotificationToast";
import OnboardingGate from "@/components/feature/OnboardingGate";
import { DailyLoginBonusGate } from "@/hooks/useDailyLoginBonus";
import { useRefTracking } from "@/hooks/useRefTracking";

function RefTracker() {
  useRefTracking();
  return null;
}

function App() {
  return (
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
  );
}

export default App;
