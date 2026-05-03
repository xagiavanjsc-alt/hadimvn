import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global application state management using Zustand
 * Persists to localStorage for state retention across sessions
 */

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  
  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Theme
      theme: 'auto',
      setTheme: (theme) => set({ theme }),
      
      // Notifications
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    {
      name: 'kts-app-storage',
    }
  )
);
