import { useState, useEffect, useCallback } from "react";

export type AdminTheme = "dark" | "light";

const STORAGE_KEY = "kts_admin_theme";

export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as AdminTheme) || "dark";
    } catch {
      return "dark";
    }
  });

  const setTheme = useCallback((t: AdminTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}

/** CSS variable map for each theme - Đồng bộ với design system */
export const adminThemeVars: Record<AdminTheme, Record<string, string>> = {
  dark: {
    "--admin-bg": "#0f1117",              // = app-bg
    "--admin-sidebar": "#0a0c10",         // Darker than bg
    "--admin-card": "#1a1d24",            // = app-surface
    "--admin-card2": "#22262d",           // = app-card
    "--admin-border": "rgba(255,255,255,0.10)",  // = app-border
    "--admin-border2": "rgba(255,255,255,0.15)",
    "--admin-text": "#ffffff",            // = app-text-primary
    "--admin-text-muted": "rgba(255,255,255,0.70)", // = app-text-secondary
    "--admin-text-faint": "rgba(255,255,255,0.50)", // = app-text-muted
    "--admin-hover": "rgba(255,255,255,0.05)",
    "--admin-header": "rgba(15,17,23,0.95)",
    // Sidebar width variables - Đồng bộ chiều rộng menu
    "--sidebar-width": "14rem",           // w-56 = 224px
    "--sidebar-width-collapsed": "3.5rem", // w-14 = 56px
  },
  light: {
    "--admin-bg": "#f8f9fa",
    "--admin-sidebar": "#ffffff",
    "--admin-card": "#ffffff",
    "--admin-card2": "#f1f3f5",
    "--admin-border": "rgba(0,0,0,0.08)",
    "--admin-border2": "rgba(0,0,0,0.12)",
    "--admin-text": "#1a1d23",
    "--admin-text-muted": "rgba(0,0,0,0.60)",
    "--admin-text-faint": "rgba(0,0,0,0.40)",
    "--admin-hover": "rgba(0,0,0,0.04)",
    "--admin-header": "rgba(255,255,255,0.95)",
    // Sidebar width variables - Đồng bộ chiều rộng menu
    "--sidebar-width": "14rem",
    "--sidebar-width-collapsed": "3.5rem",
  },
};
