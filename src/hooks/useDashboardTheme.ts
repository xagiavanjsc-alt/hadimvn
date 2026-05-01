import { useState, useEffect, useCallback } from "react";

export type DashboardTheme = "dark" | "light";

const STORAGE_KEY = "kts_dashboard_theme";

export function useDashboardTheme() {
  const [theme, setThemeState] = useState<DashboardTheme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as DashboardTheme) || "dark";
    } catch {
      return "dark";
    }
  });

  const setTheme = useCallback((t: DashboardTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--dash-bg", "#f1f5f9");
      root.style.setProperty("--dash-sidebar", "#ffffff");
      root.style.setProperty("--dash-card", "#ffffff");
      root.style.setProperty("--dash-card2", "#f8fafc");
      root.style.setProperty("--dash-header", "rgba(255,255,255,0.92)");
      root.style.setProperty("--dash-border", "rgba(0,0,0,0.07)");
      root.style.setProperty("--dash-text", "rgba(0,0,0,0.85)");
      root.style.setProperty("--dash-text-muted", "rgba(0,0,0,0.50)");
      root.style.setProperty("--dash-text-faint", "rgba(0,0,0,0.28)");
      root.style.setProperty("--dash-hover", "rgba(0,0,0,0.04)");
      root.setAttribute("data-dash-theme", "light");
    } else {
      root.style.setProperty("--dash-bg", "#13151c");
      root.style.setProperty("--dash-sidebar", "#0f1117");
      root.style.setProperty("--dash-card", "#1a1d27");
      root.style.setProperty("--dash-card2", "#0f1117");
      root.style.setProperty("--dash-header", "rgba(15,17,23,0.92)");
      root.style.setProperty("--dash-border", "rgba(255,255,255,0.06)");
      root.style.setProperty("--dash-text", "rgba(255,255,255,0.85)");
      root.style.setProperty("--dash-text-muted", "rgba(255,255,255,0.45)");
      root.style.setProperty("--dash-text-faint", "rgba(255,255,255,0.22)");
      root.style.setProperty("--dash-hover", "rgba(255,255,255,0.04)");
      root.setAttribute("data-dash-theme", "dark");
    }
    return () => {
      root.removeAttribute("data-dash-theme");
    };
  }, [theme]);

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}
