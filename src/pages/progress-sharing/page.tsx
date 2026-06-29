import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProgressSharing } from "@/hooks/useProgressSharing";
import { useGamification } from "@/hooks/useGamification";
import { getStreakData } from "@/utils/streak";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function ProgressSharingPage() {
  const { user } = useAuth();
  const { xp, level, achievements } = useGamification();
  const streak = getStreakData();
  const { isGenerating, canvasRef, generateShareCard, shareToSocial, downloadCard } = useProgressSharing();
  const [selectedTemplate, setSelectedTemplate] = useState<"streak" | "achievement" | "level">("streak");

  usePageSEO({
    title: "Chia sẻ tiến độ | Hàn Quốc Ơi!",
    description: "Chia sẻ tiến độ học tập của bạn lên mạng xã hội. Tạo card đẹp để chia sẻ streak, huy hiệu và level.",
    keywords: "chia sẻ tiến độ, streak card, achievement badge, social sharing",
    path: "/progress-sharing",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Chia sẻ tiến độ",
      description: "Share learning progress on social media",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const handleShare = async (platform: "facebook" | "twitter" | "zalo") => {
    await shareToSocial(platform);
  };

  const handleDownload = async () => {
    await downloadCard();
  };

  const handleGenerate = async () => {
    await generateShareCard();
  };

  return (
    <DashboardLayout title="Chia sẻ tiến độ" subtitle="Tạo card đẹp để chia sẻ">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Preview */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Tiến độ của bạn</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-app-surface/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-app-accent-primary">Level {level}</p>
              <p className="text-app-text-muted text-xs">Cấp độ</p>
            </div>
            <div className="bg-app-surface/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{xp.toLocaleString()}</p>
              <p className="text-app-text-muted text-xs">XP</p>
            </div>
            <div className="bg-app-surface/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-400">{streak.currentStreak}</p>
              <p className="text-app-text-muted text-xs">Ngày streak</p>
            </div>
            <div className="bg-app-surface/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{achievements.length}</p>
              <p className="text-app-text-muted text-xs">Huy hiệu</p>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Chọn mẫu card</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedTemplate("streak")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedTemplate === "streak"
                  ? "border-app-accent-primary bg-app-accent-primary/10"
                  : "border-app-border hover:border-app-border/50"
              }`}
            >
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-white text-sm font-medium">Streak</p>
              <p className="text-app-text-muted text-xs">Nhấn mạnh chuỗi ngày học</p>
            </button>
            <button
              onClick={() => setSelectedTemplate("achievement")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedTemplate === "achievement"
                  ? "border-app-accent-primary bg-app-accent-primary/10"
                  : "border-app-border hover:border-app-border/50"
              }`}
            >
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-white text-sm font-medium">Huy hiệu</p>
              <p className="text-app-text-muted text-xs">Khoe thành tích</p>
            </button>
            <button
              onClick={() => setSelectedTemplate("level")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedTemplate === "level"
                  ? "border-app-accent-primary bg-app-accent-primary/10"
                  : "border-app-border hover:border-app-border/50"
              }`}
            >
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-white text-sm font-medium">Level</p>
              <p className="text-app-text-muted text-xs">Hiển thị cấp độ</p>
            </button>
          </div>
        </div>

        {/* Card Preview */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Xem trước</h2>
          <div className="bg-app-surface/30 rounded-xl p-4 flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-lg max-w-full"
              style={{ maxWidth: "400px" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Chia sẻ</h2>
          <div className="space-y-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              {isGenerating ? "Đang tạo..." : "Tạo card"}
            </button>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleShare("facebook")}
                className="py-3 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-sm cursor-pointer transition-colors"
              >
                <i className="ri-facebook-fill mr-1"></i>Facebook
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="py-3 rounded-xl bg-[#1da1f2] hover:bg-[#1a91da] text-white font-bold text-sm cursor-pointer transition-colors"
              >
                <i className="ri-twitter-x-line mr-1"></i>Twitter
              </button>
              <button
                onClick={() => handleShare("zalo")}
                className="py-3 rounded-xl bg-[#0068ff] hover:bg-[#005ce6] text-white font-bold text-sm cursor-pointer transition-colors"
              >
                <i className="ri-share-line mr-1"></i>Zalo
              </button>
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl border border-app-border text-white font-bold text-sm cursor-pointer transition-colors hover:bg-app-surface/50"
            >
              <i className="ri-download-line mr-1"></i>Tải xuống ảnh
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Chia sẻ tiến độ lên mạng xã hội để truyền cảm hứng</li>
            <li>• Card được tạo tự động với thông tin học tập của bạn</li>
            <li>• Hỗ trợ Facebook, Twitter, Zalo</li>
            <li>• Tải xuống ảnh để lưu hoặc chia sẻ thủ công</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
