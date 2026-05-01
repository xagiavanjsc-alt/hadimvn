import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useApiCostTracker } from "@/hooks/useApiCostTracker";
import type { AIProvider } from "@/services/aiService";

type TestStatus = "idle" | "testing" | "ok" | "fail";
interface TestResult {
  apify: TestStatus;
  apifyMsg: string;
  ai: TestStatus;
  aiMsg: string;
}

export interface StoryPromptSettings {
  context: string;
  characters: string;
  storyLength: "short" | "medium" | "long";
  style: string;
  customInstruction: string;
  pureKorean?: boolean; // Truyện chêm thuần tiếng Hàn, không phiên âm
}

export interface AppSettings {
  apifyToken: string;
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string;
  storyPrompt?: StoryPromptSettings;
}

const DEFAULT_STORY_PROMPT: StoryPromptSettings = {
  context: "Một lớp học tiếng Hàn tại Việt Nam, học viên là người Việt yêu thích K-pop",
  characters: "Giáo viên Minh (người Việt), học viên Linh và Tuấn, thỉnh thoảng có idol K-pop xuất hiện",
  storyLength: "medium",
  style: "Hài hước, nhẹ nhàng, dễ hiểu, phù hợp học sinh cấp 2-3",
  customInstruction: "",
};

const DEFAULT_SETTINGS: AppSettings = {
  apifyToken: "",
  aiProvider: "gemini",
  aiApiKey: "",
  aiModel: "",
  storyPrompt: DEFAULT_STORY_PROMPT,
};

const OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"];
const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
const OPENROUTER_MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "google/gemini-flash-1.5",
  "google/gemini-pro-1.5",
  "anthropic/claude-3-haiku",
  "anthropic/claude-3.5-sonnet",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
};

const PROVIDER_ICONS: Record<AIProvider, string> = {
  openai: "ri-openai-line",
  gemini: "ri-google-line",
  openrouter: "ri-route-line",
};

export default function SettingsPage() {
  const [saved, setSaved] = useLocalStorage<AppSettings>("kts_settings", DEFAULT_SETTINGS);
  const [form, setForm] = useState<AppSettings>({ ...DEFAULT_SETTINGS, ...saved, storyPrompt: { ...DEFAULT_STORY_PROMPT, ...(saved.storyPrompt ?? {}) } });
  const [showApify, setShowApify] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [showAIKey, setShowAIKey] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [testResult, setTestResult] = useState<TestResult>({
    apify: "idle", apifyMsg: "",
    ai: "idle", aiMsg: "",
  });
  const [showTestPanel, setShowTestPanel] = useState(false);
  const { getSummary, clearRecords } = useApiCostTracker();
  const costSummary = getSummary();

  const showToastMsg = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setSaved(form);
    showToastMsg("Đã lưu cài đặt thành công!");
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    setSaved(DEFAULT_SETTINGS);
    showToastMsg("Đã xóa toàn bộ cài đặt");
  };

  const handleResetPrompt = () => {
    setForm((prev) => ({ ...prev, storyPrompt: DEFAULT_STORY_PROMPT }));
    showToastMsg("Đã khôi phục prompt mặc định");
  };

  const updateStoryPrompt = (updates: Partial<StoryPromptSettings>) => {
    setForm((prev) => ({
      ...prev,
      storyPrompt: { ...(prev.storyPrompt ?? DEFAULT_STORY_PROMPT), ...updates },
    }));
  };

  const handleTestConnections = async () => {
    setShowTestPanel(true);
    setTestResult({ apify: "idle", apifyMsg: "", ai: "idle", aiMsg: "" });

    if (form.apifyToken.trim()) {
      setTestResult((prev) => ({ ...prev, apify: "testing", apifyMsg: "Đang kiểm tra..." }));
      try {
        const res = await fetch(`https://api.apify.com/v2/users/me?token=${form.apifyToken.trim()}`);
        if (res.ok) {
          const data = await res.json();
          const username = data?.data?.username ?? "Unknown";
          setTestResult((prev) => ({ ...prev, apify: "ok", apifyMsg: `Hợp lệ — Tài khoản: ${username}` }));
        } else if (res.status === 401) {
          setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: "Token không hợp lệ hoặc đã hết hạn" }));
        } else {
          setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: `Lỗi ${res.status} — Thử lại sau` }));
        }
      } catch {
        setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: "Không kết nối được — Kiểm tra mạng" }));
      }
    } else {
      setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: "Chưa nhập Apify Token" }));
    }

    if (form.aiApiKey.trim()) {
      setTestResult((prev) => ({ ...prev, ai: "testing", aiMsg: "Đang kiểm tra..." }));
      try {
        const provider = form.aiProvider;
        let ok = false;
        let msg = "";
        if (provider === "openai") {
          const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${form.aiApiKey.trim()}` } });
          if (res.ok) { ok = true; msg = "Hợp lệ — OpenAI kết nối thành công"; }
          else if (res.status === 401) { msg = "API Key không hợp lệ hoặc hết hạn"; }
          else if (res.status === 429) { msg = "Đã vượt rate limit — thử lại sau"; }
          else { msg = `Lỗi ${res.status}`; }
        } else if (provider === "gemini") {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, { headers: { "x-goog-api-key": form.aiApiKey.trim() } });
          if (res.ok) { ok = true; msg = "Hợp lệ — Gemini kết nối thành công"; }
          else if (res.status === 400 || res.status === 403) { msg = "API Key không hợp lệ"; }
          else { msg = `Lỗi ${res.status}`; }
        } else if (provider === "openrouter") {
          const res = await fetch("https://openrouter.ai/api/v1/models", { headers: { Authorization: `Bearer ${form.aiApiKey.trim()}` } });
          if (res.ok) { ok = true; msg = "Hợp lệ — OpenRouter kết nối thành công"; }
          else if (res.status === 401) { msg = "API Key không hợp lệ"; }
          else { msg = `Lỗi ${res.status}`; }
        }
        setTestResult((prev) => ({ ...prev, ai: ok ? "ok" : "fail", aiMsg: msg }));
      } catch {
        setTestResult((prev) => ({ ...prev, ai: "fail", aiMsg: "Không kết nối được — Kiểm tra mạng" }));
      }
    } else {
      setTestResult((prev) => ({ ...prev, ai: "fail", aiMsg: "Chưa nhập AI API Key" }));
    }
  };

  const getModelOptions = (provider: AIProvider) => {
    if (provider === "openai") return OPENAI_MODELS;
    if (provider === "openrouter") return OPENROUTER_MODELS;
    return GEMINI_MODELS;
  };

  const getDefaultModel = (provider: AIProvider) => {
    if (provider === "openai") return "gpt-4o-mini";
    if (provider === "openrouter") return "openai/gpt-4o-mini";
    return "gemini-1.5-flash";
  };

  const modelOptions = getModelOptions(form.aiProvider);
  const defaultModel = getDefaultModel(form.aiProvider);

  const isApifyConfigured = !!form.apifyToken.trim();
  const isAIConfigured = !!form.aiApiKey.trim();
  const isFullyConfigured = isApifyConfigured && isAIConfigured;
  const hasUnsavedChanges =
    form.apifyToken !== saved.apifyToken ||
    form.aiApiKey !== saved.aiApiKey ||
    form.aiProvider !== saved.aiProvider ||
    form.aiModel !== saved.aiModel ||
    JSON.stringify(form.storyPrompt) !== JSON.stringify(saved.storyPrompt ?? DEFAULT_STORY_PROMPT);

  const sp = form.storyPrompt ?? DEFAULT_STORY_PROMPT;

  return (
    <DashboardLayout
      title="Cài đặt API"
      subtitle="Quản lý kết nối Apify & AI"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnections}
            className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-wifi-line"></i>
            Test kết nối
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-delete-bin-line"></i>
            Xóa tất cả
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f1117] font-bold text-xs px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-save-line"></i>
            {hasUnsavedChanges ? "Lưu cài đặt *" : "Đã lưu"}
          </button>
        </div>
      }
    >
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          <i className={toast.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
          {toast.msg}
        </div>
      )}

      {/* Status banner */}
      <div className={`flex items-center justify-between px-5 py-4 rounded-xl mb-6 border ${isFullyConfigured ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isFullyConfigured ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
            <i className={`text-base ${isFullyConfigured ? "ri-checkbox-circle-line text-emerald-400" : "ri-error-warning-line text-amber-400"}`}></i>
          </div>
          <div>
            <p className={`text-sm font-medium ${isFullyConfigured ? "text-emerald-400" : "text-amber-400"}`}>
              {isFullyConfigured ? "Đã cấu hình đầy đủ — Sẵn sàng dùng API thật" : "Chưa cấu hình đầy đủ — Đang dùng dữ liệu mẫu"}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`flex items-center gap-1 text-xs ${isApifyConfigured ? "text-emerald-400" : "text-white/25"}`}>
                <i className={isApifyConfigured ? "ri-checkbox-circle-fill" : "ri-circle-line"}></i>
                Apify
              </span>
              <span className={`flex items-center gap-1 text-xs ${isAIConfigured ? "text-emerald-400" : "text-white/25"}`}>
                <i className={isAIConfigured ? "ri-checkbox-circle-fill" : "ri-circle-line"}></i>
                {PROVIDER_LABELS[form.aiProvider]}
              </span>
            </div>
          </div>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-amber-400/70 text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg">
            <i className="ri-save-line"></i>
            Chưa lưu — nhấn &quot;Lưu cài đặt&quot;
          </div>
        )}
      </div>

      {/* Test Connection Panel */}
      {showTestPanel && (
        <div className="bg-[#0f1117] border border-white/8 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center bg-sky-500/10 rounded-lg">
                <i className="ri-wifi-line text-sky-400 text-sm"></i>
              </div>
              <p className="text-white font-semibold text-sm">Kết quả kiểm tra kết nối</p>
            </div>
            <button onClick={() => setShowTestPanel(false)} className="text-white/20 hover:text-white/50 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
          <div className="space-y-3">
            {[
              { key: "apify" as const, label: "Apify Token", icon: "ri-robot-line" },
              { key: "ai" as const, label: `${PROVIDER_LABELS[form.aiProvider]} API Key`, icon: "ri-sparkling-2-line" },
            ].map(({ key, label, icon }) => (
              <div key={key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                testResult[key] === "ok" ? "bg-emerald-500/5 border-emerald-500/20" :
                testResult[key] === "fail" ? "bg-red-500/5 border-red-500/20" :
                testResult[key] === "testing" ? "bg-sky-500/5 border-sky-500/15" :
                "bg-white/3 border-white/8"
              }`}>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {testResult[key] === "testing" && <i className="ri-loader-4-line animate-spin text-sky-400 text-sm"></i>}
                  {testResult[key] === "ok" && <i className="ri-checkbox-circle-fill text-emerald-400 text-sm"></i>}
                  {testResult[key] === "fail" && <i className="ri-close-circle-fill text-red-400 text-sm"></i>}
                  {testResult[key] === "idle" && <i className={`${icon} text-white/20 text-sm`}></i>}
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs font-medium">{label}</p>
                  <p className={`text-xs mt-0.5 ${
                    testResult[key] === "ok" ? "text-emerald-400" :
                    testResult[key] === "fail" ? "text-red-400/80" :
                    testResult[key] === "testing" ? "text-sky-400/70" : "text-white/25"
                  }`}>
                    {testResult[key] === "idle" ? "Chưa kiểm tra" : (key === "apify" ? testResult.apifyMsg : testResult.aiMsg)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Apify Section */}
        <section className="bg-[#0f1117] border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowApify(!showApify)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-orange-500/10 rounded-xl">
                <i className="ri-robot-line text-orange-400 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Apify API Token</p>
                <p className="text-white/40 text-xs">Dùng cho Melon Scraper &amp; Naver KiN Scraper</p>
              </div>
              {isApifyConfigured ? (
                <span className="ml-2 flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>
                  Đã nhập
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>
                  Chưa nhập
                </span>
              )}
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <i className={`text-sm transition-transform ${showApify ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showApify && (
            <div className="px-6 pb-6 border-t border-white/5 pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Apify API Token</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-key-2-line text-white/30 text-sm"></i>
                  </div>
                  <input
                    type={showApifyToken ? "text" : "password"}
                    value={form.apifyToken}
                    onChange={(e) => setForm({ ...form, apifyToken: e.target.value })}
                    placeholder="apify_api_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-12 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-400/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApifyToken(!showApifyToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    <i className={showApifyToken ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
                {form.apifyToken && (
                  <p className="text-emerald-400/70 text-xs mt-1.5 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i>
                    Token đã nhập ({form.apifyToken.length} ký tự)
                    {hasUnsavedChanges && form.apifyToken !== saved.apifyToken && (
                      <span className="text-amber-400/70 ml-1">— chưa lưu</span>
                    )}
                  </p>
                )}
              </div>
              <div className="bg-white/3 rounded-lg px-4 py-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-information-line text-white/30 text-sm"></i>
                </div>
                <div className="text-white/30 text-xs leading-relaxed">
                  Lấy token tại{" "}
                  <a href="https://console.apify.com/account/integrations" target="_blank" rel="nofollow noreferrer" className="text-orange-400/70 hover:text-orange-400 underline">
                    console.apify.com → Account → Integrations
                  </a>
                  . Token được lưu cục bộ trên máy bạn, không gửi đi đâu khác.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* AI Section */}
        <section className="bg-[#0f1117] border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAI(!showAI)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-[#e8c84a]/10 rounded-xl">
                <i className="ri-sparkling-2-line text-[#e8c84a] text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">AI API Key</p>
                <p className="text-white/40 text-xs">OpenAI · Google Gemini · OpenRouter</p>
              </div>
              {isAIConfigured ? (
                <span className="ml-2 flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>
                  Đã nhập
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>
                  Chưa nhập
                </span>
              )}
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <i className={`text-sm transition-transform ${showAI ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showAI && (
            <div className="px-6 pb-6 border-t border-white/5 pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Nhà cung cấp AI</label>
                <div className="flex gap-2 flex-wrap">
                  {(["gemini", "openai", "openrouter"] as AIProvider[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, aiProvider: p, aiModel: "" })}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        form.aiProvider === p
                          ? "bg-[#e8c84a] text-[#0f1117]"
                          : "bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8"
                      }`}
                    >
                      <i className={PROVIDER_ICONS[p]}></i>
                      {PROVIDER_LABELS[p]}
                    </button>
                  ))}
                </div>
                {form.aiProvider === "openrouter" && (
                  <div className="mt-2 flex items-start gap-2 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-lg px-3 py-2.5">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-star-line text-[#e8c84a] text-xs"></i>
                    </div>
                    <p className="text-[#e8c84a]/70 text-xs leading-relaxed">
                      <strong className="text-[#e8c84a]">OpenRouter</strong> cho phép dùng nhiều model AI khác nhau với 1 API key duy nhất — bao gồm cả model miễn phí (Llama, Mistral). Lấy key tại{" "}
                      <a href="https://openrouter.ai/keys" target="_blank" rel="nofollow noreferrer" className="underline hover:text-[#e8c84a]">openrouter.ai/keys</a>.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">
                  {form.aiProvider === "openai" ? "OpenAI API Key" : form.aiProvider === "openrouter" ? "OpenRouter API Key" : "Gemini API Key"}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-key-2-line text-white/30 text-sm"></i>
                  </div>
                  <input
                    type={showAIKey ? "text" : "password"}
                    value={form.aiApiKey}
                    onChange={(e) => setForm({ ...form, aiApiKey: e.target.value })}
                    placeholder={
                      form.aiProvider === "openai" ? "sk-proj-xxxxxxxxxxxx" :
                      form.aiProvider === "openrouter" ? "sk-or-v1-xxxxxxxxxxxx" : "AIzaSyxxxxxxxxxxxxxxxxx"
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-12 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAIKey(!showAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    <i className={showAIKey ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Model</label>
                <select
                  value={form.aiModel || defaultModel}
                  onChange={(e) => setForm({ ...form, aiModel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e8c84a]/50 transition-colors cursor-pointer"
                >
                  {modelOptions.map((m) => (
                    <option key={m} value={m} className="bg-[#0f1117]">
                      {m}{m.includes(":free") ? " (Miễn phí)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-white/3 rounded-lg px-4 py-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-information-line text-white/30 text-sm"></i>
                </div>
                <div className="text-white/30 text-xs leading-relaxed">
                  {form.aiProvider === "openai" && (<>Lấy key tại <a href="https://platform.openai.com/api-keys" target="_blank" rel="nofollow noreferrer" className="text-[#e8c84a]/70 hover:text-[#e8c84a] underline">platform.openai.com/api-keys</a>. Khuyến nghị <strong className="text-white/50">gpt-4o-mini</strong> để tiết kiệm chi phí.</>)}
                  {form.aiProvider === "gemini" && (<>Lấy key tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="nofollow noreferrer" className="text-[#e8c84a]/70 hover:text-[#e8c84a] underline">aistudio.google.com</a>. <strong className="text-white/50">gemini-1.5-flash</strong> miễn phí và rất nhanh.</>)}
                  {form.aiProvider === "openrouter" && (<>Lấy key tại <a href="https://openrouter.ai/keys" target="_blank" rel="nofollow noreferrer" className="text-[#e8c84a]/70 hover:text-[#e8c84a] underline">openrouter.ai/keys</a>. Hỗ trợ 200+ model, có model miễn phí.</>)}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Story Prompt Customization */}
        <section className="bg-[#0f1117] border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-violet-500/10 rounded-xl">
                <i className="ri-quill-pen-line text-violet-400 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Tùy chỉnh Prompt Truyện Chêm</p>
                <p className="text-white/40 text-xs">Thay đổi bối cảnh, nhân vật, độ dài, phong cách — không cần sửa code</p>
              </div>
              <span className="ml-2 flex items-center gap-1 text-violet-400/70 text-xs bg-violet-400/10 px-2.5 py-1 rounded-full">
                <i className="ri-magic-line text-[10px]"></i>
                Tùy chỉnh
              </span>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <i className={`text-sm transition-transform ${showPrompt ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showPrompt && (
            <div className="px-6 pb-6 border-t border-white/5 pt-5 space-y-5">
              {/* Info banner */}
              <div className="flex items-start gap-2 bg-violet-500/5 border border-violet-500/15 rounded-lg px-4 py-3">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-lightbulb-line text-violet-400 text-sm"></i>
                </div>
                <p className="text-violet-400/70 text-xs leading-relaxed">
                  Các cài đặt này sẽ được đưa vào prompt AI khi tạo Truyện Chêm. Thay đổi bối cảnh và nhân vật để tạo ra những câu chuyện phù hợp hơn với thương hiệu của bạn.
                </p>
              </div>

              {/* Context */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-map-pin-line mr-1.5 text-violet-400/70"></i>
                  Bối cảnh câu chuyện
                </label>
                <textarea
                  value={sp.context}
                  onChange={(e) => updateStoryPrompt({ context: e.target.value })}
                  placeholder="Ví dụ: Một lớp học tiếng Hàn tại Hà Nội, học viên là sinh viên đại học..."
                  rows={2}
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none"
                />
                <p className="text-white/20 text-[10px] mt-1">{sp.context.length}/300 ký tự</p>
              </div>

              {/* Characters */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-user-3-line mr-1.5 text-violet-400/70"></i>
                  Nhân vật trong truyện
                </label>
                <textarea
                  value={sp.characters}
                  onChange={(e) => updateStoryPrompt({ characters: e.target.value })}
                  placeholder="Ví dụ: Giáo viên Minh, học viên Linh và Tuấn, thỉnh thoảng có idol K-pop xuất hiện..."
                  rows={2}
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none"
                />
                <p className="text-white/20 text-[10px] mt-1">{sp.characters.length}/300 ký tự</p>
              </div>

              {/* Story length */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">
                  <i className="ri-text-wrap mr-1.5 text-violet-400/70"></i>
                  Độ dài truyện
                </label>
                <div className="flex gap-2">
                  {([
                    { value: "short", label: "Ngắn", desc: "~150 từ" },
                    { value: "medium", label: "Vừa", desc: "~300 từ" },
                    { value: "long", label: "Dài", desc: "~500 từ" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateStoryPrompt({ storyLength: opt.value })}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-all cursor-pointer ${
                        sp.storyLength === opt.value
                          ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                          : "bg-white/3 border-white/8 text-white/40 hover:border-white/20 hover:text-white/60"
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-[10px] opacity-60 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-palette-line mr-1.5 text-violet-400/70"></i>
                  Phong cách viết
                </label>
                <input
                  type="text"
                  value={sp.style}
                  onChange={(e) => updateStoryPrompt({ style: e.target.value })}
                  placeholder="Ví dụ: Hài hước, nhẹ nhàng, dễ hiểu, phù hợp học sinh cấp 2-3..."
                  maxLength={200}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors"
                />
              </div>

              {/* Pure Korean toggle */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">
                  <i className="ri-translate-2 mr-1.5 text-violet-400/70"></i>
                  Chế độ tiếng Hàn
                </label>
                <button
                  type="button"
                  onClick={() => updateStoryPrompt({ pureKorean: !sp.pureKorean })}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
                    sp.pureKorean
                      ? "bg-[#e8c84a]/10 border-[#e8c84a]/40"
                      : "bg-white/3 border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${sp.pureKorean ? "bg-[#e8c84a]/15" : "bg-white/5"}`}>
                      <i className={`ri-font-size text-base ${sp.pureKorean ? "text-[#e8c84a]" : "text-white/30"}`}></i>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${sp.pureKorean ? "text-[#e8c84a]" : "text-white/50"}`}>
                        Truyện chêm thuần tiếng Hàn
                      </p>
                      <p className={`text-xs mt-0.5 ${sp.pureKorean ? "text-[#e8c84a]/60" : "text-white/25"}`}>
                        {sp.pureKorean
                          ? "AI sẽ KHÔNG thêm phiên âm vào truyện chêm ngay từ đầu"
                          : "Mặc định: AI có thể thêm phiên âm (annyeong) sau từ Hàn"}
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all flex-shrink-0 relative ${sp.pureKorean ? "bg-[#e8c84a]" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${sp.pureKorean ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
                {sp.pureKorean && (
                  <div className="mt-2 flex items-start gap-2 bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-lg px-3 py-2.5">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-star-line text-[#e8c84a] text-xs"></i>
                    </div>
                    <p className="text-[#e8c84a]/70 text-xs leading-relaxed">
                      AI sẽ viết truyện chêm với từ tiếng Hàn <strong className="text-[#e8c84a]">không kèm phiên âm</strong> — ví dụ: &quot;안녕&quot; thay vì &quot;안녕 (annyeong)&quot;. Phù hợp cho học viên đã biết đọc Hangul.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom instruction */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-terminal-line mr-1.5 text-violet-400/70"></i>
                  Hướng dẫn thêm (tùy chọn)
                </label>
                <textarea
                  value={sp.customInstruction}
                  onChange={(e) => updateStoryPrompt({ customInstruction: e.target.value })}
                  placeholder="Ví dụ: Luôn kết thúc bằng một câu hỏi cho học viên, tránh dùng từ ngữ phức tạp, thêm emoji vào cuối mỗi đoạn..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none"
                />
                <p className="text-white/20 text-[10px] mt-1">{sp.customInstruction.length}/500 ký tự</p>
              </div>

              {/* Preview */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                <p className="text-white/30 text-[10px] tracking-normal mb-2 flex items-center gap-1.5">
                  <i className="ri-eye-line"></i>
                  Xem trước prompt sẽ gửi cho AI
                </p>
                <p className="text-white/40 text-xs leading-relaxed font-mono">
                  Viết một câu chuyện ngắn ({sp.storyLength === "short" ? "~150 từ" : sp.storyLength === "medium" ? "~300 từ" : "~500 từ"}) bằng tiếng Việt có chèn từ vựng tiếng Hàn từ bài hát.
                  {" "}Bối cảnh: <span className="text-violet-400/70">{sp.context || "(chưa nhập)"}</span>.
                  {" "}Nhân vật: <span className="text-violet-400/70">{sp.characters || "(chưa nhập)"}</span>.
                  {" "}Phong cách: <span className="text-violet-400/70">{sp.style || "(chưa nhập)"}</span>.
                  {sp.customInstruction && <>{" "}<span className="text-amber-400/60">{sp.customInstruction}</span></>}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleResetPrompt}
                  className="flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors cursor-pointer"
                >
                  <i className="ri-refresh-line"></i>
                  Khôi phục mặc định
                </button>
                <p className="text-white/20 text-xs">Nhớ nhấn &quot;Lưu cài đặt&quot; để áp dụng</p>
              </div>
            </div>
          )}
        </section>

        {/* API Cost Statistics */}
        <section className="bg-[#0f1117] border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowCost(!showCost)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/10 rounded-xl">
                <i className="ri-money-dollar-circle-line text-emerald-400 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Thống kê chi phí API</p>
                <p className="text-white/40 text-xs">Ước tính chi phí AI đã dùng theo model</p>
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-bar-chart-line text-[10px]"></i>
                  {costSummary.totalCalls} lần gọi
                </span>
                <span className="flex items-center gap-1 text-[#e8c84a] text-xs bg-[#e8c84a]/10 px-2.5 py-1 rounded-full">
                  ~${costSummary.totalCostUsd.toFixed(4)}
                </span>
              </div>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <i className={`text-sm transition-transform ${showCost ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showCost && (
            <div className="px-6 pb-6 border-t border-white/5 pt-5 space-y-5">
              {costSummary.totalCalls === 0 ? (
                <div className="text-center py-8 text-white/25 text-sm">
                  <i className="ri-bar-chart-line text-2xl block mb-2 opacity-30"></i>
                  Chưa có lần gọi AI nào được ghi nhận
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                      <p className="text-white/30 text-[10px] tracking-normal mb-1">Tổng lần gọi</p>
                      <p className="text-white text-2xl font-bold">{costSummary.totalCalls}</p>
                      <p className="text-white/25 text-[10px] mt-1">Tất cả thời gian</p>
                    </div>
                    <div className="bg-[#e8c84a]/5 rounded-xl p-4 border border-[#e8c84a]/15">
                      <p className="text-[#e8c84a]/60 text-[10px] tracking-normal mb-1">Chi phí ước tính</p>
                      <p className="text-[#e8c84a] text-2xl font-bold">${costSummary.totalCostUsd.toFixed(4)}</p>
                      <p className="text-[#e8c84a]/30 text-[10px] mt-1">USD tổng cộng</p>
                    </div>
                    <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/15">
                      <p className="text-emerald-400/60 text-[10px] tracking-normal mb-1">30 ngày qua</p>
                      <p className="text-emerald-400 text-2xl font-bold">{costSummary.last30Days}</p>
                      <p className="text-emerald-400/30 text-[10px] mt-1">${costSummary.last30DaysCost.toFixed(4)}</p>
                    </div>
                  </div>

                  {/* By model breakdown */}
                  {Object.keys(costSummary.byModel).length > 0 && (
                    <div>
                      <p className="text-white/40 text-xs font-medium tracking-normal mb-3">Theo model</p>
                      <div className="space-y-2">
                        {Object.entries(costSummary.byModel)
                          .sort((a, b) => b[1].calls - a[1].calls)
                          .map(([model, stats]) => (
                            <div key={model} className="flex items-center gap-3 bg-white/3 rounded-lg px-4 py-3 border border-white/5">
                              <div className="w-7 h-7 flex items-center justify-center bg-white/5 rounded-lg flex-shrink-0">
                                <i className="ri-cpu-line text-white/40 text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-xs font-medium truncate">{model}</p>
                                <p className="text-white/25 text-[10px]">{stats.calls} lần gọi</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-[#e8c84a] text-xs font-semibold">${stats.costUsd.toFixed(4)}</p>
                                <p className="text-white/20 text-[10px]">
                                  {stats.costUsd === 0 ? "Miễn phí" : `~$${(stats.costUsd / stats.calls).toFixed(5)}/lần`}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* By type */}
                  {Object.keys(costSummary.byType).length > 0 && (
                    <div>
                      <p className="text-white/40 text-xs font-medium tracking-normal mb-3">Theo tính năng</p>
                      <div className="flex gap-3">
                        {Object.entries(costSummary.byType).map(([type, stats]) => (
                          <div key={type} className="flex-1 bg-white/3 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <i className={`text-sm ${type === "melon" ? "ri-music-2-line text-[#e8c84a]" : "ri-question-answer-line text-sky-400"}`}></i>
                              <p className="text-white/60 text-xs font-medium capitalize">{type === "melon" ? "K-pop Lesson" : "Naver KiN"}</p>
                            </div>
                            <p className="text-white text-xl font-bold">{stats.calls}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">${stats.costUsd.toFixed(4)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info note */}
                  <div className="flex items-start gap-2 bg-white/3 rounded-lg px-4 py-3">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-white/25 text-sm"></i>
                    </div>
                    <p className="text-white/25 text-xs leading-relaxed">
                      Chi phí là <strong className="text-white/40">ước tính</strong> dựa trên giá niêm yết của từng model. Giá thực tế có thể khác tùy theo số token. Gemini 1.5 Flash và các model :free trên OpenRouter hoàn toàn miễn phí.
                    </p>
                  </div>

                  <button
                    onClick={() => { clearRecords(); showToastMsg("Đã xóa lịch sử thống kê"); }}
                    className="flex items-center gap-2 text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                    Xóa lịch sử thống kê
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* Data Management */}
        <section className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl">
              <i className="ri-database-2-line text-white/40 text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Quản lý dữ liệu cục bộ</p>
              <p className="text-white/40 text-xs">Dữ liệu đã duyệt lưu trong localStorage của trình duyệt</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "kts_melon_lessons", label: "Bài học K-pop", icon: "ri-music-2-line", color: "text-[#e8c84a]" },
              { key: "kts_naver_qas", label: "Q&A Naver KiN", icon: "ri-question-answer-line", color: "text-sky-400" },
              { key: "kts_settings", label: "Cài đặt API", icon: "ri-settings-3-line", color: "text-white/40" },
            ].map((item) => {
              const raw = localStorage.getItem(item.key);
              let count = 0;
              try {
                const parsed = raw ? JSON.parse(raw) : null;
                count = Array.isArray(parsed) ? parsed.length : raw ? 1 : 0;
              } catch { count = 0; }
              return (
                <div key={item.key} className="bg-white/3 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg">
                    <i className={`${item.icon} ${item.color} text-base`}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">{item.label}</p>
                    <p className="text-white/30 text-[10px]">{count > 0 ? `${count} mục` : "Trống"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                ["kts_melon_lessons", "kts_naver_qas"].forEach((k) => localStorage.removeItem(k));
                showToastMsg("Đã xóa dữ liệu đã duyệt (giữ lại cài đặt API)");
              }}
              className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs transition-colors cursor-pointer"
            >
              <i className="ri-delete-bin-line"></i>
              Xóa dữ liệu đã duyệt (giữ lại API keys)
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("kts_melon_seen_songs");
                localStorage.removeItem("kts_melon_cached_songs");
                localStorage.removeItem("kts_melon_fetch_meta");
                showToastMsg("Đã reset lịch sử bài hát Melon — lần quét tiếp sẽ coi tất cả là bài mới");
              }}
              className="flex items-center gap-2 text-amber-400/50 hover:text-amber-400 text-xs transition-colors cursor-pointer"
            >
              <i className="ri-refresh-line"></i>
              Reset lịch sử bài hát Melon (seen songs + cache)
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("kts_naver_cache");
                showToastMsg("Đã xóa cache tìm kiếm Naver KiN");
              }}
              className="flex items-center gap-2 text-sky-400/50 hover:text-sky-400 text-xs transition-colors cursor-pointer"
            >
              <i className="ri-history-line"></i>
              Xóa cache tìm kiếm Naver KiN
            </button>
          </div>

          {/* Info box */}
          <div className="mt-4 bg-white/3 rounded-lg px-4 py-3 flex items-start gap-2">
            <div className="w-4 h-4 flex items-center justify-center mt-0.5">
              <i className="ri-lightbulb-line text-white/25 text-sm"></i>
            </div>
            <p className="text-white/25 text-xs leading-relaxed">
              <strong className="text-white/40">Gợi ý tần suất quét:</strong> Melon Top 100 cập nhật 1 lần/ngày — nên quét <strong className="text-white/40">1 lần/tuần</strong> để tiết kiệm chi phí. Naver KiN ít thay đổi hơn, có thể dùng cache 7 ngày.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

