import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { SITE_HOST } from "@/lib/siteConfig";

interface SEOSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  customHead: string;
}

const DEFAULT_SEO: SEOSettings = {
  siteName: "Hàn Việt KTS - Học tiếng Hàn hiệu quả",
  siteDescription: "Học tiếng Hàn với phương pháp khoa học, từ vựng, ngữ pháp, nghe nói, TOPIC",
  siteKeywords: "học tiếng Hàn, tiếng Hàn, TOPIC, từ vựng Hàn, ngữ pháp Hàn",
  ogImage: "",
  twitterHandle: "",
  googleAnalyticsId: "",
  facebookPixelId: "",
  customHead: "",
};

export default function AdminSEOPage() {
  const [settings, setSettings] = useState<SEOSettings>(DEFAULT_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("key", "seo_settings")
        .single();
      
      if (error) throw error;
      if (data?.value) {
        setSettings(JSON.parse(data.value));
      }
    } catch (err) {
      console.error("Error loading SEO settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key: "seo_settings",
          value: JSON.stringify(settings),
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" });
      
      if (error) throw error;
      showToast("Đã lưu cài đặt SEO!");
    } catch (err) {
      console.error("Error saving SEO settings:", err);
      showToast("Lỗi lưu cài đặt SEO");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SEOSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Cài đặt SEO</h1>
          <p className="text-app-text-secondary text-sm">Cấu hình SEO toàn trang cho website</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-app-text-secondary">
            <i className="ri-loader-4-line animate-spin text-2xl mb-2"></i>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Site Name */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Tên website
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                placeholder="Hàn Việt KTS"
              />
            </div>

            {/* Site Description */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Mô tả website (Meta Description)
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange("siteDescription", e.target.value)}
                rows={3}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary resize-none"
                placeholder="Mô tả ngắn về website..."
              />
              <p className="text-app-text-muted text-xs mt-2">{settings.siteDescription.length}/160 ký tự</p>
            </div>

            {/* Site Keywords */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Từ khóa (Keywords)
              </label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => handleChange("siteKeywords", e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                placeholder="học tiếng Hàn, TOPIC, từ vựng Hàn (ngăn cách bằng dấu phẩy)"
              />
            </div>

            {/* OG Image */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                URL ảnh Open Graph (og:image)
              </label>
              <input
                type="text"
                value={settings.ogImage}
                onChange={(e) => handleChange("ogImage", e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                placeholder={`https://${SITE_HOST}/og-image.png`}
              />
              {settings.ogImage && (
                <img loading="lazy" decoding="async" src={settings.ogImage} alt="OG Preview" className="mt-3 max-w-xs rounded-lg border border-app-border" />
              )}
            </div>

            {/* Twitter Handle */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Twitter Handle (@username)
              </label>
              <input
                type="text"
                value={settings.twitterHandle}
                onChange={(e) => handleChange("twitterHandle", e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                placeholder="@hadimvn"
              />
            </div>

            {/* Google Analytics */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId}
                onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            {/* Facebook Pixel */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                value={settings.facebookPixelId}
                onChange={(e) => handleChange("facebookPixelId", e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                placeholder="XXXXXXXXXX"
              />
            </div>

            {/* Custom Head */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
              <label className="text-white text-sm font-medium block mb-2">
                Custom HTML Head
              </label>
              <textarea
                value={settings.customHead}
                onChange={(e) => handleChange("customHead", e.target.value)}
                rows={5}
                className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary resize-none font-mono text-xs"
                placeholder="<script>...</script>, <meta>..."
              />
              <p className="text-app-text-muted text-xs mt-2">HTML tùy chỉnh thêm vào &lt;head&gt; (meta, script, style...)</p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {saving ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-app-accent-success/10 border border-app-accent-success/30 rounded-xl px-5 py-3 text-app-accent-success text-sm font-medium flex items-center gap-2">
            <i className="ri-checkbox-circle-line"></i>
            {toast}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
