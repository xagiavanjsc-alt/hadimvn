import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminToastProvider } from "@/contexts/AdminToastContext";
import ErrorBoundary from "@/components/base/ErrorBoundary";
import { PreloadCommonRoutes } from "./router/config";
import PageTransition from "@/components/base/PageTransition";
import XPNotificationToast from "@/components/feature/XPNotificationToast";
import { DailyLoginBonusGate } from "@/hooks/useDailyLoginBonus";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AdminToastProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <ErrorBoundary>
              <PreloadCommonRoutes />
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
