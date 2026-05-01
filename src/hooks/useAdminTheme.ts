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

/** CSS variable map for each theme */
export const adminThemeVars: Record<AdminTheme, Record<string, string>> = {
  dark: {
    "--admin-bg": "#0a0c0f",
    "--admin-sidebar": "#080a0d",
    "--admin-card": "#111318",
    "--admin-card2": "#0f1117",
    "--admin-border": "rgba(255,255,255,0.05)",
    "--admin-border2": "rgba(255,255,255,0.08)",
    "--admin-text": "rgba(255,255,255,0.80)",
    "--admin-text-muted": "rgba(255,255,255,0.40)",
    "--admin-text-faint": "rgba(255,255,255,0.20)",
    "--admin-hover": "rgba(255,255,255,0.04)",
    "--admin-header": "rgba(8,10,13,0.85)",
  },
  light: {
    "--admin-bg": "#f4f5f7",
    "--admin-sidebar": "#ffffff",
    "--admin-card": "#ffffff",
    "--admin-card2": "#f9fafb",
    "--admin-border": "rgba(0,0,0,0.07)",
    "--admin-border2": "rgba(0,0,0,0.10)",
    "--admin-text": "rgba(0,0,0,0.85)",
    "--admin-text-muted": "rgba(0,0,0,0.45)",
    "--admin-text-faint": "rgba(0,0,0,0.25)",
    "--admin-hover": "rgba(0,0,0,0.03)",
    "--admin-header": "rgba(255,255,255,0.92)",
  },
};
