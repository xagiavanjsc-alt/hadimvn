import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/base/ErrorBoundary";
import { PreloadCommonRoutes } from "./router/config";
import PageTransition from "@/components/base/PageTransition";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <ErrorBoundary>
            <PreloadCommonRoutes />
            <PageTransition>
              <AppRoutes />
            </PageTransition>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
