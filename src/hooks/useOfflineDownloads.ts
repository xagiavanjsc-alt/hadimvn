import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface OfflineLesson {
  id: number;
  title: string;
  downloadedAt: number;
  size: number;
}

interface OfflineDownloadsState {
  lessons: OfflineLesson[];
  totalSize: number;
  isDownloading: boolean;
}

export function useOfflineDownloads() {
  const [state, setState] = useLocalStorage<OfflineDownloadsState>("kts_offline_downloads", {
    lessons: [],
    totalSize: 0,
    isDownloading: false,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const downloadLesson = async (lessonId: number, lessonTitle: string) => {
    if (!isOnline) return false;

    setState(prev => ({ ...prev, isDownloading: true }));

    try {
      // Simulate download - in real implementation, this would fetch lesson data
      // and store it in IndexedDB
      await new Promise(resolve => setTimeout(resolve, 1000));

      const size = Math.floor(Math.random() * 5) + 1; // Simulate 1-5 MB

      setState(prev => ({
        ...prev,
        lessons: [...prev.lessons, { id: lessonId, title: lessonTitle, downloadedAt: Date.now(), size }],
        totalSize: prev.totalSize + size,
        isDownloading: false,
      }));

      return true;
    } catch (error) {
      console.error("Download failed:", error);
      setState(prev => ({ ...prev, isDownloading: false }));
      return false;
    }
  };

  const removeLesson = (lessonId: number) => {
    setState(prev => {
      const lesson = prev.lessons.find(l => l.id === lessonId);
      return {
        ...prev,
        lessons: prev.lessons.filter(l => l.id !== lessonId),
        totalSize: lesson ? prev.totalSize - lesson.size : prev.totalSize,
      };
    });
  };

  const isLessonDownloaded = (lessonId: number) => {
    return state.lessons.some(l => l.id === lessonId);
  };

  const clearAll = () => {
    setState({ lessons: [], totalSize: 0, isDownloading: false });
  };

  return {
    lessons: state.lessons,
    totalSize: state.totalSize,
    isDownloading: state.isDownloading,
    isOnline,
    downloadLesson,
    removeLesson,
    isLessonDownloaded,
    clearAll,
  };
}
