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
  pureKorean?: boolean; // Truy?n chêm thu?n ti?ng Hàn, không phiên âm
}

export interface AppSettings {
  apifyToken: string;
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string;
  storyPrompt?: StoryPromptSettings;
}

const DEFAULT_STORY_PROMPT: StoryPromptSettings = {
  context: "M?t l?p h?c ti?ng Hàn t?i Vi?t Nam, h?c viên là ngu?i Vi?t yêu thích K-pop",
  characters: "Giáo viên Minh (ngu?i Vi?t), h?c viên Linh và Tu?n, th?nh tho?ng có idol K-pop xu?t hi?n",
  storyLength: "medium",
  style: "Hài hu?c, nh? nhàng, d? hi?u, phù h?p h?c sinh c?p 2-3",
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
    showToastMsg("Ðã luu cài d?t thành công!");
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    setSaved(DEFAULT_SETTINGS);
    showToastMsg("Ðã xóa toàn b? cài d?t");
  };

  const handleResetPrompt = () => {
    setForm((prev) => ({ ...prev, storyPrompt: DEFAULT_STORY_PROMPT }));
    showToastMsg("Ðã khôi ph?c prompt m?c d?nh");
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
      setTestResult((prev) => ({ ...prev, apify: "testing", apifyMsg: "Ðang ki?m tra..." }));
      try {
        const res = await fetch(`https://api.apify.com/v2/users/me?token=${form.apifyToken.trim()}`);
        if (res.ok) {
          const data = await res.json();
          const username = data?.data?.username ?? "Unknown";
          setTestResult((prev) => ({ ...prev, apify: "ok", apifyMsg: `H?p l? — Tài kho?n: ${username}` }));
        } else if (res.status === 401) {
          setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: "Token không h?p l? ho?c dã h?t h?n" }));
        } else {
          setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: `L?i ${res.status} — Th? l?i sau` }));
        }
      } catch {
        setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: "Không k?t n?i du?c — Ki?m tra m?ng" }));
      }
    } else {
      setTestResult((prev) => ({ ...prev, apify: "fail", apifyMsg: "Chua nh?p Apify Token" }));
    }

    if (form.aiApiKey.trim()) {
      setTestResult((prev) => ({ ...prev, ai: "testing", aiMsg: "Ðang ki?m tra..." }));
      try {
        const provider = form.aiProvider;
        let ok = false;
        let msg = "";
        if (provider === "openai") {
          const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${form.aiApiKey.trim()}` } });
          if (res.ok) { ok = true; msg = "H?p l? — OpenAI k?t n?i thành công"; }
          else if (res.status === 401) { msg = "API Key không h?p l? ho?c h?t h?n"; }
          else if (res.status === 429) { msg = "Ðã vu?t rate limit — th? l?i sau"; }
          else { msg = `L?i ${res.status}`; }
        } else if (provider === "gemini") {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, { headers: { "x-goog-api-key": form.aiApiKey.trim() } });
          if (res.ok) { ok = true; msg = "H?p l? — Gemini k?t n?i thành công"; }
          else if (res.status === 400 || res.status === 403) { msg = "API Key không h?p l?"; }
          else { msg = `L?i ${res.status}`; }
        } else if (provider === "openrouter") {
          const res = await fetch("https://openrouter.ai/api/v1/models", { headers: { Authorization: `Bearer ${form.aiApiKey.trim()}` } });
          if (res.ok) { ok = true; msg = "H?p l? — OpenRouter k?t n?i thành công"; }
          else if (res.status === 401) { msg = "API Key không h?p l?"; }
          else { msg = `L?i ${res.status}`; }
        }
        setTestResult((prev) => ({ ...prev, ai: ok ? "ok" : "fail", aiMsg: msg }));
      } catch {
        setTestResult((prev) => ({ ...prev, ai: "fail", aiMsg: "Không k?t n?i du?c — Ki?m tra m?ng" }));
      }
    } else {
      setTestResult((prev) => ({ ...prev, ai: "fail", aiMsg: "Chua nh?p AI API Key" }));
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
      title="Cài d?t API"
      subtitle="Qu?n lý k?t n?i Apify & AI"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnections}
            className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-wifi-line"></i>
            Test k?t n?i
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white/80 text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-delete-bin-line"></i>
            Xóa t?t c?
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-xs px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-save-line"></i>
            {hasUnsavedChanges ? "Luu cài d?t *" : "Ðã luu"}
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
            <i className={`text-base ${isFullyConfigured ? "ri-checkbox-circle-line text-app-accent-success" : "ri-error-warning-line text-amber-400"}`}></i>
          </div>
          <div>
            <p className={`text-sm font-medium ${isFullyConfigured ? "text-app-accent-success" : "text-amber-400"}`}>
              {isFullyConfigured ? "Ðã c?u hình d?y d? — S?n sàng dùng API th?t" : "Chua c?u hình d?y d? — Ðang dùng d? li?u m?u"}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`flex items-center gap-1 text-xs ${isApifyConfigured ? "text-app-accent-success" : "text-app-text-muted"}`}>
                <i className={isApifyConfigured ? "ri-checkbox-circle-fill" : "ri-circle-line"}></i>
                Apify
              </span>
              <span className={`flex items-center gap-1 text-xs ${isAIConfigured ? "text-app-accent-success" : "text-app-text-muted"}`}>
                <i className={isAIConfigured ? "ri-checkbox-circle-fill" : "ri-circle-line"}></i>
                {PROVIDER_LABELS[form.aiProvider]}
              </span>
            </div>
          </div>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-amber-400/70 text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg">
            <i className="ri-save-line"></i>
            Chua luu — nh?n &quot;Luu cài d?t&quot;
          </div>
        )}
      </div>

      {/* Test Connection Panel */}
      {showTestPanel && (
        <div className="bg-app-bg border border-app-border rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center bg-sky-500/10 rounded-lg">
                <i className="ri-wifi-line text-sky-400 text-sm"></i>
              </div>
              <p className="text-white font-semibold text-sm">K?t qu? ki?m tra k?t n?i</p>
            </div>
            <button onClick={() => setShowTestPanel(false)} className="text-app-text-muted hover:text-white/50 cursor-pointer">
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
                "bg-app-surface/50 border-app-border"
              }`}>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {testResult[key] === "testing" && <i className="ri-loader-4-line animate-spin text-sky-400 text-sm"></i>}
                  {testResult[key] === "ok" && <i className="ri-checkbox-circle-fill text-app-accent-success text-sm"></i>}
                  {testResult[key] === "fail" && <i className="ri-close-circle-fill text-red-400 text-sm"></i>}
                  {testResult[key] === "idle" && <i className={`${icon} text-app-text-muted text-sm`}></i>}
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs font-medium">{label}</p>
                  <p className={`text-xs mt-0.5 ${
                    testResult[key] === "ok" ? "text-app-accent-success" :
                    testResult[key] === "fail" ? "text-red-400/80" :
                    testResult[key] === "testing" ? "text-sky-400/70" : "text-app-text-muted"
                  }`}>
                    {testResult[key] === "idle" ? "Chua ki?m tra" : (key === "apify" ? testResult.apifyMsg : testResult.aiMsg)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Apify Section */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
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
                <p className="text-app-text-secondary text-xs">Dùng cho Melon Scraper &amp; Naver KiN Scraper</p>
              </div>
              {isApifyConfigured ? (
                <span className="ml-2 flex items-center gap-1 text-app-accent-success text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>
                  Ðã nh?p
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>
                  Chua nh?p
                </span>
              )}
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-app-text-muted">
              <i className={`text-sm transition-transform ${showApify ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showApify && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Apify API Token</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-key-2-line text-app-text-muted text-sm"></i>
                  </div>
                  <input
                    type={showApifyToken ? "text" : "password"}
                    value={form.apifyToken}
                    onChange={(e) => setForm({ ...form, apifyToken: e.target.value })}
                    placeholder="apify_api_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-12 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-400/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApifyToken(!showApifyToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-app-text-muted hover:text-white/60 transition-colors cursor-pointer"
                  >
                    <i className={showApifyToken ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
                {form.apifyToken && (
                  <p className="text-app-accent-success/70 text-xs mt-1.5 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i>
                    Token dã nh?p ({form.apifyToken.length} ký t?)
                    {hasUnsavedChanges && form.apifyToken !== saved.apifyToken && (
                      <span className="text-amber-400/70 ml-1">— chua luu</span>
                    )}
                  </p>
                )}
              </div>
              <div className="bg-app-surface/50 rounded-lg px-4 py-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-information-line text-app-text-muted text-sm"></i>
                </div>
                <div className="text-app-text-muted text-xs leading-relaxed">
                  L?y token t?i{" "}
                  <a href="https://console.apify.com/account/integrations" target="_blank" rel="nofollow noreferrer" className="text-orange-400/70 hover:text-orange-400 underline">
                    console.apify.com ? Account ? Integrations
                  </a>
                  . Token du?c luu c?c b? trên máy b?n, không g?i di dâu khác.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* AI Section */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAI(!showAI)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-app-accent-primary/10 rounded-xl">
                <i className="ri-sparkling-2-line text-app-accent-primary text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">AI API Key</p>
                <p className="text-app-text-secondary text-xs">OpenAI · Google Gemini · OpenRouter</p>
              </div>
              {isAIConfigured ? (
                <span className="ml-2 flex items-center gap-1 text-app-accent-success text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>
                  Ðã nh?p
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>
                  Chua nh?p
                </span>
              )}
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-app-text-muted">
              <i className={`text-sm transition-transform ${showAI ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showAI && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Nhà cung c?p AI</label>
                <div className="flex gap-2 flex-wrap">
                  {(["gemini", "openai", "openrouter"] as AIProvider[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, aiProvider: p, aiModel: "" })}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        form.aiProvider === p
                          ? "bg-app-accent-primary text-app-bg"
                          : "bg-app-card/50 text-white/50 hover:text-white/80 hover:bg-white/8"
                      }`}
                    >
                      <i className={PROVIDER_ICONS[p]}></i>
                      {PROVIDER_LABELS[p]}
                    </button>
                  ))}
                </div>
                {form.aiProvider === "openrouter" && (
                  <div className="mt-2 flex items-start gap-2 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-lg px-3 py-2.5">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-star-line text-app-accent-primary text-xs"></i>
                    </div>
                    <p className="text-app-accent-primary/70 text-xs leading-relaxed">
                      <strong className="text-app-accent-primary">OpenRouter</strong> cho phép dùng nhi?u model AI khác nhau v?i 1 API key duy nh?t — bao g?m c? model mi?n phí (Llama, Mistral). L?y key t?i{" "}
                      <a href="https://openrouter.ai/keys" target="_blank" rel="nofollow noreferrer" className="underline hover:text-app-accent-primary">openrouter.ai/keys</a>.
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
                    <i className="ri-key-2-line text-app-text-muted text-sm"></i>
                  </div>
                  <input
                    type={showAIKey ? "text" : "password"}
                    value={form.aiApiKey}
                    onChange={(e) => setForm({ ...form, aiApiKey: e.target.value })}
                    placeholder={
                      form.aiProvider === "openai" ? "sk-proj-xxxxxxxxxxxx" :
                      form.aiProvider === "openrouter" ? "sk-or-v1-xxxxxxxxxxxx" : "AIzaSyxxxxxxxxxxxxxxxxx"
                    }
                    className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-12 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAIKey(!showAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-app-text-muted hover:text-white/60 transition-colors cursor-pointer"
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
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/50 transition-colors cursor-pointer"
                >
                  {modelOptions.map((m) => (
                    <option key={m} value={m} className="bg-app-bg">
                      {m}{m.includes(":free") ? " (Mi?n phí)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-app-surface/50 rounded-lg px-4 py-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-information-line text-app-text-muted text-sm"></i>
                </div>
                <div className="text-app-text-muted text-xs leading-relaxed">
                  {form.aiProvider === "openai" && (<>L?y key t?i <a href="https://platform.openai.com/api-keys" target="_blank" rel="nofollow noreferrer" className="text-app-accent-primary/70 hover:text-app-accent-primary underline">platform.openai.com/api-keys</a>. Khuy?n ngh? <strong className="text-white/50">gpt-4o-mini</strong> d? ti?t ki?m chi phí.</>)}
                  {form.aiProvider === "gemini" && (<>L?y key t?i <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="nofollow noreferrer" className="text-app-accent-primary/70 hover:text-app-accent-primary underline">aistudio.google.com</a>. <strong className="text-white/50">gemini-1.5-flash</strong> mi?n phí và r?t nhanh.</>)}
                  {form.aiProvider === "openrouter" && (<>L?y key t?i <a href="https://openrouter.ai/keys" target="_blank" rel="nofollow noreferrer" className="text-app-accent-primary/70 hover:text-app-accent-primary underline">openrouter.ai/keys</a>. H? tr? 200+ model, có model mi?n phí.</>)}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Story Prompt Customization */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-violet-500/10 rounded-xl">
                <i className="ri-quill-pen-line text-violet-400 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Tùy ch?nh Prompt Truy?n Chêm</p>
                <p className="text-app-text-secondary text-xs">Thay d?i b?i c?nh, nhân v?t, d? dài, phong cách — không c?n s?a code</p>
              </div>
              <span className="ml-2 flex items-center gap-1 text-violet-400/70 text-xs bg-violet-400/10 px-2.5 py-1 rounded-full">
                <i className="ri-magic-line text-[10px]"></i>
                Tùy ch?nh
              </span>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-app-text-muted">
              <i className={`text-sm transition-transform ${showPrompt ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showPrompt && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-5">
              {/* Info banner */}
              <div className="flex items-start gap-2 bg-violet-500/5 border border-violet-500/15 rounded-lg px-4 py-3">
                <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                  <i className="ri-lightbulb-line text-violet-400 text-sm"></i>
                </div>
                <p className="text-violet-400/70 text-xs leading-relaxed">
                  Các cài d?t này s? du?c dua vào prompt AI khi t?o Truy?n Chêm. Thay d?i b?i c?nh và nhân v?t d? t?o ra nh?ng câu chuy?n phù h?p hon v?i thuong hi?u c?a b?n.
                </p>
              </div>

              {/* Context */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-map-pin-line mr-1.5 text-violet-400/70"></i>
                  B?i c?nh câu chuy?n
                </label>
                <textarea
                  value={sp.context}
                  onChange={(e) => updateStoryPrompt({ context: e.target.value })}
                  placeholder="Ví d?: M?t l?p h?c ti?ng Hàn t?i Hà N?i, h?c viên là sinh viên d?i h?c..."
                  rows={2}
                  maxLength={300}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none"
                />
                <p className="text-app-text-muted text-[10px] mt-1">{sp.context.length}/300 ký t?</p>
              </div>

              {/* Characters */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-user-3-line mr-1.5 text-violet-400/70"></i>
                  Nhân v?t trong truy?n
                </label>
                <textarea
                  value={sp.characters}
                  onChange={(e) => updateStoryPrompt({ characters: e.target.value })}
                  placeholder="Ví d?: Giáo viên Minh, h?c viên Linh và Tu?n, th?nh tho?ng có idol K-pop xu?t hi?n..."
                  rows={2}
                  maxLength={300}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none"
                />
                <p className="text-app-text-muted text-[10px] mt-1">{sp.characters.length}/300 ký t?</p>
              </div>

              {/* Story length */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">
                  <i className="ri-text-wrap mr-1.5 text-violet-400/70"></i>
                  Ð? dài truy?n
                </label>
                <div className="flex gap-2">
                  {([
                    { value: "short", label: "Ng?n", desc: "~150 t?" },
                    { value: "medium", label: "V?a", desc: "~300 t?" },
                    { value: "long", label: "Dài", desc: "~500 t?" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateStoryPrompt({ storyLength: opt.value })}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-all cursor-pointer ${
                        sp.storyLength === opt.value
                          ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                          : "bg-app-surface/50 border-app-border text-app-text-secondary hover:border-white/20 hover:text-white/60"
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
                  Phong cách vi?t
                </label>
                <input
                  type="text"
                  value={sp.style}
                  onChange={(e) => updateStoryPrompt({ style: e.target.value })}
                  placeholder="Ví d?: Hài hu?c, nh? nhàng, d? hi?u, phù h?p h?c sinh c?p 2-3..."
                  maxLength={200}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors"
                />
              </div>

              {/* Pure Korean toggle */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">
                  <i className="ri-translate-2 mr-1.5 text-violet-400/70"></i>
                  Ch? d? ti?ng Hàn
                </label>
                <button
                  type="button"
                  onClick={() => updateStoryPrompt({ pureKorean: !sp.pureKorean })}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
                    sp.pureKorean
                      ? "bg-app-accent-primary/10 border-app-accent-primary/40"
                      : "bg-app-surface/50 border-app-border hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${sp.pureKorean ? "bg-app-accent-primary/15" : "bg-app-card/50"}`}>
                      <i className={`ri-font-size text-base ${sp.pureKorean ? "text-app-accent-primary" : "text-app-text-muted"}`}></i>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${sp.pureKorean ? "text-app-accent-primary" : "text-white/50"}`}>
                        Truy?n chêm thu?n ti?ng Hàn
                      </p>
                      <p className={`text-xs mt-0.5 ${sp.pureKorean ? "text-app-accent-primary/60" : "text-app-text-muted"}`}>
                        {sp.pureKorean
                          ? "AI s? KHÔNG thêm phiên âm vào truy?n chêm ngay t? d?u"
                          : "M?c d?nh: AI có th? thêm phiên âm (annyeong) sau t? Hàn"}
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all flex-shrink-0 relative ${sp.pureKorean ? "bg-app-accent-primary" : "bg-app-card/70"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${sp.pureKorean ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
                {sp.pureKorean && (
                  <div className="mt-2 flex items-start gap-2 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-lg px-3 py-2.5">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-star-line text-app-accent-primary text-xs"></i>
                    </div>
                    <p className="text-app-accent-primary/70 text-xs leading-relaxed">
                      AI s? vi?t truy?n chêm v?i t? ti?ng Hàn <strong className="text-app-accent-primary">không kèm phiên âm</strong> — ví d?: &quot;??&quot; thay vì &quot;?? (annyeong)&quot;. Phù h?p cho h?c viên dã bi?t d?c Hangul.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom instruction */}
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">
                  <i className="ri-terminal-line mr-1.5 text-violet-400/70"></i>
                  Hu?ng d?n thêm (tùy ch?n)
                </label>
                <textarea
                  value={sp.customInstruction}
                  onChange={(e) => updateStoryPrompt({ customInstruction: e.target.value })}
                  placeholder="Ví d?: Luôn k?t thúc b?ng m?t câu h?i cho h?c viên, tránh dùng t? ng? ph?c t?p, thêm emoji vào cu?i m?i do?n..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none"
                />
                <p className="text-app-text-muted text-[10px] mt-1">{sp.customInstruction.length}/500 ký t?</p>
              </div>

              {/* Preview */}
              <div className="bg-app-surface/50 rounded-xl p-4 border border-app-border">
                <p className="text-app-text-muted text-[10px] tracking-normal mb-2 flex items-center gap-1.5">
                  <i className="ri-eye-line"></i>
                  Xem tru?c prompt s? g?i cho AI
                </p>
                <p className="text-app-text-secondary text-xs leading-relaxed font-mono">
                  Vi?t m?t câu chuy?n ng?n ({sp.storyLength === "short" ? "~150 t?" : sp.storyLength === "medium" ? "~300 t?" : "~500 t?"}) b?ng ti?ng Vi?t có chèn t? v?ng ti?ng Hàn t? bài hát.
                  {" "}B?i c?nh: <span className="text-violet-400/70">{sp.context || "(chua nh?p)"}</span>.
                  {" "}Nhân v?t: <span className="text-violet-400/70">{sp.characters || "(chua nh?p)"}</span>.
                  {" "}Phong cách: <span className="text-violet-400/70">{sp.style || "(chua nh?p)"}</span>.
                  {sp.customInstruction && <>{" "}<span className="text-amber-400/60">{sp.customInstruction}</span></>}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleResetPrompt}
                  className="flex items-center gap-1.5 text-app-text-muted hover:text-white/50 text-xs transition-colors cursor-pointer"
                >
                  <i className="ri-refresh-line"></i>
                  Khôi ph?c m?c d?nh
                </button>
                <p className="text-app-text-muted text-xs">Nh? nh?n &quot;Luu cài d?t&quot; d? áp d?ng</p>
              </div>
            </div>
          )}
        </section>

        {/* API Cost Statistics */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowCost(!showCost)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/10 rounded-xl">
                <i className="ri-money-dollar-circle-line text-app-accent-success text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Th?ng kê chi phí API</p>
                <p className="text-app-text-secondary text-xs">U?c tính chi phí AI dã dùng theo model</p>
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="flex items-center gap-1 text-app-accent-success text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-bar-chart-line text-[10px]"></i>
                  {costSummary.totalCalls} l?n g?i
                </span>
                <span className="flex items-center gap-1 text-app-accent-primary text-xs bg-app-accent-primary/10 px-2.5 py-1 rounded-full">
                  ~${costSummary.totalCostUsd.toFixed(4)}
                </span>
              </div>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-app-text-muted">
              <i className={`text-sm transition-transform ${showCost ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
            </div>
          </button>

          {showCost && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-5">
              {costSummary.totalCalls === 0 ? (
                <div className="text-center py-8 text-app-text-muted text-sm">
                  <i className="ri-bar-chart-line text-2xl block mb-2 opacity-30"></i>
                  Chua có l?n g?i AI nào du?c ghi nh?n
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-app-surface/50 rounded-xl p-4 border border-app-border">
                      <p className="text-app-text-muted text-[10px] tracking-normal mb-1">T?ng l?n g?i</p>
                      <p className="text-white text-2xl font-bold">{costSummary.totalCalls}</p>
                      <p className="text-app-text-muted text-[10px] mt-1">T?t c? th?i gian</p>
                    </div>
                    <div className="bg-app-accent-primary/5 rounded-xl p-4 border border-app-accent-primary/15">
                      <p className="text-app-accent-primary/60 text-[10px] tracking-normal mb-1">Chi phí u?c tính</p>
                      <p className="text-app-accent-primary text-2xl font-bold">${costSummary.totalCostUsd.toFixed(4)}</p>
                      <p className="text-app-accent-primary/30 text-[10px] mt-1">USD t?ng c?ng</p>
                    </div>
                    <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/15">
                      <p className="text-app-accent-success/60 text-[10px] tracking-normal mb-1">30 ngày qua</p>
                      <p className="text-app-accent-success text-2xl font-bold">{costSummary.last30Days}</p>
                      <p className="text-app-accent-success/30 text-[10px] mt-1">${costSummary.last30DaysCost.toFixed(4)}</p>
                    </div>
                  </div>

                  {/* By model breakdown */}
                  {Object.keys(costSummary.byModel).length > 0 && (
                    <div>
                      <p className="text-app-text-secondary text-xs font-medium tracking-normal mb-3">Theo model</p>
                      <div className="space-y-2">
                        {Object.entries(costSummary.byModel)
                          .sort((a, b) => b[1].calls - a[1].calls)
                          .map(([model, stats]) => (
                            <div key={model} className="flex items-center gap-3 bg-app-surface/50 rounded-lg px-4 py-3 border border-app-border">
                              <div className="w-7 h-7 flex items-center justify-center bg-app-card/50 rounded-lg flex-shrink-0">
                                <i className="ri-cpu-line text-app-text-secondary text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-xs font-medium truncate">{model}</p>
                                <p className="text-app-text-muted text-[10px]">{stats.calls} l?n g?i</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-app-accent-primary text-xs font-semibold">${stats.costUsd.toFixed(4)}</p>
                                <p className="text-app-text-muted text-[10px]">
                                  {stats.costUsd === 0 ? "Mi?n phí" : `~$${(stats.costUsd / stats.calls).toFixed(5)}/l?n`}
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
                      <p className="text-app-text-secondary text-xs font-medium tracking-normal mb-3">Theo tính nang</p>
                      <div className="flex gap-3">
                        {Object.entries(costSummary.byType).map(([type, stats]) => (
                          <div key={type} className="flex-1 bg-app-surface/50 rounded-xl p-4 border border-app-border">
                            <div className="flex items-center gap-2 mb-2">
                              <i className={`text-sm ${type === "melon" ? "ri-music-2-line text-app-accent-primary" : "ri-question-answer-line text-sky-400"}`}></i>
                              <p className="text-white/60 text-xs font-medium capitalize">{type === "melon" ? "K-pop Lesson" : "Naver KiN"}</p>
                            </div>
                            <p className="text-white text-xl font-bold">{stats.calls}</p>
                            <p className="text-app-text-muted text-[10px] mt-0.5">${stats.costUsd.toFixed(4)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info note */}
                  <div className="flex items-start gap-2 bg-app-surface/50 rounded-lg px-4 py-3">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-app-text-muted text-sm"></i>
                    </div>
                    <p className="text-app-text-muted text-xs leading-relaxed">
                      Chi phí là <strong className="text-app-text-secondary">u?c tính</strong> d?a trên giá niêm y?t c?a t?ng model. Giá th?c t? có th? khác tùy theo s? token. Gemini 1.5 Flash và các model :free trên OpenRouter hoàn toàn mi?n phí.
                    </p>
                  </div>

                  <button
                    onClick={() => { clearRecords(); showToastMsg("Ðã xóa l?ch s? th?ng kê"); }}
                    className="flex items-center gap-2 text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                    Xóa l?ch s? th?ng kê
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* Data Management */}
        <section className="bg-app-bg border border-app-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center bg-app-card/50 rounded-xl">
              <i className="ri-database-2-line text-app-text-secondary text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Qu?n lý d? li?u c?c b?</p>
              <p className="text-app-text-secondary text-xs">D? li?u dã duy?t luu trong localStorage c?a trình duy?t</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "kts_melon_lessons", label: "Bài h?c K-pop", icon: "ri-music-2-line", color: "text-app-accent-primary" },
              { key: "kts_naver_qas", label: "Q&A Naver KiN", icon: "ri-question-answer-line", color: "text-sky-400" },
              { key: "kts_settings", label: "Cài d?t API", icon: "ri-settings-3-line", color: "text-app-text-secondary" },
            ].map((item) => {
              const raw = localStorage.getItem(item.key);
              let count = 0;
              try {
                const parsed = raw ? JSON.parse(raw) : null;
                count = Array.isArray(parsed) ? parsed.length : raw ? 1 : 0;
              } catch { count = 0; }
              return (
                <div key={item.key} className="bg-app-surface/50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-app-card/50 rounded-lg">
                    <i className={`${item.icon} ${item.color} text-base`}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">{item.label}</p>
                    <p className="text-app-text-muted text-[10px]">{count > 0 ? `${count} m?c` : "Tr?ng"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-4 space-y-2 border-t border-app-border pt-4">
            <button
              onClick={() => {
                ["kts_melon_lessons", "kts_naver_qas"].forEach((k) => localStorage.removeItem(k));
                showToastMsg("Ðã xóa d? li?u dã duy?t (gi? l?i cài d?t API)");
              }}
              className="flex items-center gap-2 text-app-accent-error/60 hover:text-red-400 text-xs transition-colors cursor-pointer"
            >
              <i className="ri-delete-bin-line"></i>
              Xóa d? li?u dã duy?t (gi? l?i API keys)
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("kts_melon_seen_songs");
                localStorage.removeItem("kts_melon_cached_songs");
                localStorage.removeItem("kts_melon_fetch_meta");
                showToastMsg("Ðã reset l?ch s? bài hát Melon — l?n quét ti?p s? coi t?t c? là bài m?i");
              }}
              className="flex items-center gap-2 text-amber-400/50 hover:text-amber-400 text-xs transition-colors cursor-pointer"
            >
              <i className="ri-refresh-line"></i>
              Reset l?ch s? bài hát Melon (seen songs + cache)
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("kts_naver_cache");
                showToastMsg("Ðã xóa cache tìm ki?m Naver KiN");
              }}
              className="flex items-center gap-2 text-sky-400/50 hover:text-sky-400 text-xs transition-colors cursor-pointer"
            >
              <i className="ri-history-line"></i>
              Xóa cache tìm ki?m Naver KiN
            </button>
          </div>

          {/* Info box */}
          <div className="mt-4 bg-app-surface/50 rounded-lg px-4 py-3 flex items-start gap-2">
            <div className="w-4 h-4 flex items-center justify-center mt-0.5">
              <i className="ri-lightbulb-line text-app-text-muted text-sm"></i>
            </div>
            <p className="text-app-text-muted text-xs leading-relaxed">
              <strong className="text-app-text-secondary">G?i ý t?n su?t quét:</strong> Melon Top 100 c?p nh?t 1 l?n/ngày — nên quét <strong className="text-app-text-secondary">1 l?n/tu?n</strong> d? ti?t ki?m chi phí. Naver KiN ít thay d?i hon, có th? dùng cache 7 ngày.
            </p>
          </div>
        </section>

        {/* Cache Management */}
        <section className="bg-app-bg border border-app-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center bg-rose-500/10 rounded-xl">
              <i className="ri-delete-bin-2-line text-rose-400 text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Xóa cache & Làm m?i</p>
              <p className="text-app-text-secondary text-xs">Fix l?i khi trang không t?i du?c ho?c icon hi?n th? sai</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                if (!confirm("Xóa cache và làm m?i trang?\n\nÐi?u này s?:\n- Xóa Service Worker cache\n- Xóa browser cache\n- T?i l?i trang\n\nTi?p t?c?")) return;

                try {
                  // Unregister service worker
                  if ("serviceWorker" in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                      await registration.unregister();
                    }
                  }

                  // Clear all caches
                  if ("caches" in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                  }

                  // Reload page
                  window.location.reload();
                } catch (err) {
                  alert("L?i khi xóa cache: " + (err instanceof Error ? err.message : String(err)));
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ri-refresh-line"></i>
              Xóa cache & Làm m?i trang
            </button>

            <div className="flex items-start gap-2 bg-app-surface/50 rounded-lg px-4 py-3">
              <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                <i className="ri-information-line text-app-text-muted text-sm"></i>
              </div>
              <p className="text-app-text-muted text-xs leading-relaxed">
                <strong className="text-app-text-secondary">Khi nào c?n dùng:</strong> Trang không t?i du?c, icon hi?n th? ô vuông, ho?c m?t s? máy vào du?c m?t s? máy không. Nút này thay th? phím F5 trên máy tính.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

