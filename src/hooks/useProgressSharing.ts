import { useState, useRef } from "react";
import { getStreakData } from "@/utils/streak";
import { useGamification } from "./useGamification";

export function useProgressSharing() {
  const { xp, level, achievements } = useGamification();
  const streak = getStreakData();
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateShareCard = async () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 400;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 800, 400);
      gradient.addColorStop(0, "#1e1e2e");
      gradient.addColorStop(1, "#2d2d44");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 400);

      // App name
      ctx.fillStyle = "#e8c84a";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("Hàn Quốc Ơi!", 40, 50);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("Tiến độ học tập của tôi", 40, 100);

      // Stats
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px sans-serif";
      ctx.fillText(`Level ${level}`, 40, 160);
      ctx.fillText(`${xp.toLocaleString()} XP`, 150, 160);
      ctx.fillText(`${streak.currentStreak} ngày streak`, 300, 160);

      // Streak fire icon (simplified)
      ctx.fillStyle = "#f97316";
      ctx.font = "24px sans-serif";
      ctx.fillText("🔥", 450, 160);

      // Achievements count
      ctx.fillStyle = "#4ade80";
      ctx.fillText(`${achievements.length} huy hiệu`, 500, 160);

      // Progress bar
      ctx.fillStyle = "#3d3d5c";
      ctx.fillRect(40, 200, 720, 20);
      ctx.fillStyle = "#e8c84a";
      const progress = (xp % 1000) / 1000;
      ctx.fillRect(40, 200, 720 * progress, 20);

      // Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "14px sans-serif";
      ctx.fillText("hanquocoi.vn - Học tiếng Hàn để đi EPS/TOPIK", 40, 380);

      // Convert to image
      const dataUrl = canvas.toDataURL("image/png");
      return dataUrl;
    } catch (error) {
      console.error("Error generating share card:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToSocial = async (platform: "facebook" | "twitter" | "zalo") => {
    const card = await generateShareCard();
    if (!card) return;

    const text = `Tôi đang học tiếng Hàn trên Hàn Quốc Ơi! Đã đạt Level ${level}, ${streak.currentStreak} ngày streak và ${xp.toLocaleString()} XP. 🎯`;
    const url = window.location.href;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "zalo":
        shareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const downloadCard = async () => {
    const card = await generateShareCard();
    if (!card) return;

    const link = document.createElement("a");
    link.href = card;
    link.download = `hanquocoi-progress-${Date.now()}.png`;
    link.click();
  };

  return {
    isGenerating,
    canvasRef,
    generateShareCard,
    shareToSocial,
    downloadCard,
  };
}
