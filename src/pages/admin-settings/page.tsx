import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useApiCostTracker } from "@/hooks/useApiCostTracker";
import { supabase } from "@/lib/supabase";
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
  pureKorean?: boolean;
}

export interface AppSettings {
  apifyToken: string;
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string;
  storyPrompt?: StoryPromptSettings;
  bankAccount?: BankAccountConfig;
}

export interface BankAccountConfig {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  qrCodeUrl?: string;
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
  "openai/gpt-4o-mini", "openai/gpt-4o", "google/gemini-flash-1.5",
  "google/gemini-pro-1.5", "anthropic/claude-3-haiku", "anthropic/claude-3.5-sonnet",
  "meta-llama/llama-3.1-8b-instruct:free", "mistralai/mistral-7b-instruct:free",
];

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI", gemini: "Google Gemini", openrouter: "OpenRouter",
};
const PROVIDER_ICONS: Record<AIProvider, string> = {
  openai: "ri-openai-line", gemini: "ri-google-line", openrouter: "ri-route-line",
};

// --- Hook to load/save settings from Supabase ---------------------------------
function useAdminSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("admin-grant-vip", {
        body: { action: "get_settings" },
      });
      if (res.data?.data) {
        const row = res.data.data;
        const loaded: AppSettings = {
          apifyToken: row.apify_token || "",
          aiProvider: (row.ai_provider as AIProvider) || "gemini",
          aiApiKey: row.ai_api_key || "",
          aiModel: row.ai_model || "",
          storyPrompt: {
            ...DEFAULT_STORY_PROMPT,
            ...(row.story_prompt || {}),
          },
        };
        setSettings(loaded);
        // Also sync to localStorage for aiService compatibility
        localStorage.setItem("kts_settings", JSON.stringify(loaded));
      } else {
        // Fallback to localStorage
        const raw = localStorage.getItem("kts_settings");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed, storyPrompt: { ...DEFAULT_STORY_PROMPT, ...(parsed.storyPrompt ?? {}) } });
          } catch { /* ignore */ }
        }
      }
    } catch {
      // Fallback to localStorage
      const raw = localStorage.getItem("kts_settings");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed, storyPrompt: { ...DEFAULT_STORY_PROMPT, ...(parsed.storyPrompt ?? {}) } });
        } catch { /* ignore */ }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    setSaving(true);
    try {
      const res = await supabase.functions.invoke("admin-grant-vip", {
        body: { action: "save_settings", settings: newSettings },
      });
      if (res.error || res.data?.error) {
        throw new Error(res.error?.message || res.data?.error || "L?i luu");
      }
      setSettings(newSettings);
      // Also sync to localStorage for aiService compatibility
      localStorage.setItem("kts_settings", JSON.stringify(newSettings));
      return true;
    } catch (err) {
      // Fallback: save to localStorage only
      localStorage.setItem("kts_settings", JSON.stringify(newSettings));
      setSettings(newSettings);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  return { settings, loading, saving, saveSettings, reload: loadSettings };
}

export default function AdminSettingsPage() {
  const { settings: saved, loading: loadingSettings, saving: savingToDb, saveSettings } = useAdminSettings();
  const [form, setForm] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [formReady, setFormReady] = useState(false);
  const [showApify, setShowApify] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [showAIKey, setShowAIKey] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [testResult, setTestResult] = useState<TestResult>({ apify: "idle", apifyMsg: "", ai: "idle", aiMsg: "" });
  const [showTestPanel, setShowTestPanel] = useState(false);
  const { getSummary, clearRecords } = useApiCostTracker();
  const costSummary = getSummary();

  // Sync form when settings loaded
  useEffect(() => {
    if (!loadingSettings) {
      setForm({
        ...DEFAULT_SETTINGS,
        ...saved,
        storyPrompt: { ...DEFAULT_STORY_PROMPT, ...(saved.storyPrompt ?? {}) },
      });
      setFormReady(true);
    }
  }, [loadingSettings, saved]);

  const showToastMsg = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    try {
      await saveSettings(form);
      showToastMsg("Ðã luu cài d?t vào Supabase thành công!");
    } catch {
      showToastMsg("Luu Supabase th?t b?i — dã luu vào localStorage d? phòng", "error");
    }
  };

  const handleReset = async () => {
    try {
      await saveSettings(DEFAULT_SETTINGS);
      setForm(DEFAULT_SETTINGS);
      showToastMsg("Ðã xóa toàn b? cài d?t");
    } catch {
      setForm(DEFAULT_SETTINGS);
      localStorage.setItem("kts_settings", JSON.stringify(DEFAULT_SETTINGS));
      showToastMsg("Ðã xóa (localStorage)");
    }
  };

  const handleResetPrompt = () => {
    setForm(prev => ({ ...prev, storyPrompt: DEFAULT_STORY_PROMPT }));
    showToastMsg("Ðã khôi ph?c prompt m?c d?nh");
  };

  const updateStoryPrompt = (updates: Partial<StoryPromptSettings>) => {
    setForm(prev => ({ ...prev, storyPrompt: { ...(prev.storyPrompt ?? DEFAULT_STORY_PROMPT), ...updates } }));
  };

  const handleTestConnections = async () => {
    setShowTestPanel(true);
    setTestResult({ apify: "idle", apifyMsg: "", ai: "idle", aiMsg: "" });

    if (form.apifyToken.trim()) {
      setTestResult(prev => ({ ...prev, apify: "testing", apifyMsg: "Ðang ki?m tra..." }));
      try {
        const res = await fetch(`https://api.apify.com/v2/users/me?token=${form.apifyToken.trim()}`);
        if (res.ok) {
          const data = await res.json();
          setTestResult(prev => ({ ...prev, apify: "ok", apifyMsg: `H?p l? — Tài kho?n: ${data?.data?.username ?? "Unknown"}` }));
        } else {
          setTestResult(prev => ({ ...prev, apify: "fail", apifyMsg: res.status === 401 ? "Token không h?p l?" : `L?i ${res.status}` }));
        }
      } catch {
        setTestResult(prev => ({ ...prev, apify: "fail", apifyMsg: "Không k?t n?i du?c" }));
      }
    } else {
      setTestResult(prev => ({ ...prev, apify: "fail", apifyMsg: "Chua nh?p Apify Token" }));
    }

    if (form.aiApiKey.trim()) {
      setTestResult(prev => ({ ...prev, ai: "testing", aiMsg: "Ðang ki?m tra..." }));
      try {
        const provider = form.aiProvider;
        let ok = false; let msg = "";
        if (provider === "openai") {
          const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${form.aiApiKey.trim()}` } });
          ok = res.ok; msg = res.ok ? "H?p l? — OpenAI k?t n?i thành công" : `L?i ${res.status}`;
        } else if (provider === "gemini") {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, { headers: { "x-goog-api-key": form.aiApiKey.trim() } });
          ok = res.ok; msg = res.ok ? "H?p l? — Gemini k?t n?i thành công" : `L?i ${res.status}`;
        } else {
          const res = await fetch("https://openrouter.ai/api/v1/models", { headers: { Authorization: `Bearer ${form.aiApiKey.trim()}` } });
          ok = res.ok; msg = res.ok ? "H?p l? — OpenRouter k?t n?i thành công" : `L?i ${res.status}`;
        }
        setTestResult(prev => ({ ...prev, ai: ok ? "ok" : "fail", aiMsg: msg }));
      } catch {
        setTestResult(prev => ({ ...prev, ai: "fail", aiMsg: "Không k?t n?i du?c" }));
      }
    } else {
      setTestResult(prev => ({ ...prev, ai: "fail", aiMsg: "Chua nh?p AI API Key" }));
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
  const modelOptions = getModelOptions(form.aiProvider);
  const defaultModel = getDefaultModel(form.aiProvider);

  if (loadingSettings || !formReady) {
    return (
      <AdminLayout title="Cài d?t API" subtitle="Ðang t?i...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Cài d?t API"
      subtitle="Cài d?t du?c luu vào Supabase — không m?t khi reload"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnections}
            className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-sky-500/20"
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
            disabled={!hasUnsavedChanges || savingToDb}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className={savingToDb ? "ri-loader-4-line animate-spin" : "ri-save-line"}></i>
            {savingToDb ? "Ðang luu..." : hasUnsavedChanges ? "Luu cài d?t *" : "Ðã luu"}
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

      {/* Storage info banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border bg-emerald-500/5 border-emerald-500/20">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
          <i className="ri-database-2-line text-app-accent-success text-sm"></i>
        </div>
        <div>
          <p className="text-app-accent-success text-sm font-medium">Luu tr? an toàn trên Supabase</p>
          <p className="text-app-accent-success/60 text-xs">API keys du?c luu vào database — không m?t khi xóa cache hay d?i trình duy?t</p>
        </div>
      </div>

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
                testResult[key] === "testing" ? "bg-sky-500/5 border-sky-500/15" : "bg-app-surface/50 border-app-border"
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
          <button onClick={() => setShowApify(!showApify)} className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors">
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
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>Ðã nh?p
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>Chua nh?p
                </span>
              )}
            </div>
            <i className={`text-app-text-muted text-sm transition-transform ${showApify ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
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
                    onChange={e => setForm({ ...form, apifyToken: e.target.value })}
                    placeholder="apify_api_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-12 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-400/50 transition-colors font-mono"
                  />
                  <button type="button" onClick={() => setShowApifyToken(!showApifyToken)} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-app-text-muted hover:text-white/60 transition-colors cursor-pointer">
                    <i className={showApifyToken ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>
              <div className="bg-app-surface/50 rounded-lg px-4 py-3 flex items-start gap-2">
                <i className="ri-information-line text-app-text-muted text-sm mt-0.5"></i>
                <p className="text-app-text-muted text-xs leading-relaxed">
                  L?y token t?i{" "}
                  <a href="https://console.apify.com/account/integrations" target="_blank" rel="nofollow noreferrer" className="text-orange-400/70 hover:text-orange-400 underline">
                    console.apify.com ? Account ? Integrations
                  </a>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* AI Section */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button onClick={() => setShowAI(!showAI)} className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors">
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
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>Ðã nh?p
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>Chua nh?p
                </span>
              )}
            </div>
            <i className={`text-app-text-muted text-sm transition-transform ${showAI ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
          </button>
          {showAI && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Nhà cung c?p AI</label>
                <div className="flex gap-2 flex-wrap">
                  {(["gemini", "openai", "openrouter"] as AIProvider[]).map(p => (
                    <button key={p} onClick={() => setForm({ ...form, aiProvider: p, aiModel: "" })}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${form.aiProvider === p ? "bg-rose-500 text-white" : "bg-app-card/50 text-white/50 hover:text-white/80 hover:bg-white/8"}`}>
                      <i className={PROVIDER_ICONS[p]}></i>
                      {PROVIDER_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">API Key</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-key-2-line text-app-text-muted text-sm"></i>
                  </div>
                  <input
                    type={showAIKey ? "text" : "password"}
                    value={form.aiApiKey}
                    onChange={e => setForm({ ...form, aiApiKey: e.target.value })}
                    placeholder={form.aiProvider === "openai" ? "sk-proj-..." : form.aiProvider === "openrouter" ? "sk-or-v1-..." : "AIzaSy..."}
                    className="w-full bg-app-card/50 border border-app-border rounded-lg pl-9 pr-12 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-rose-400/50 transition-colors font-mono"
                  />
                  <button type="button" onClick={() => setShowAIKey(!showAIKey)} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-app-text-muted hover:text-white/60 transition-colors cursor-pointer">
                    <i className={showAIKey ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Model</label>
                <select value={form.aiModel || defaultModel} onChange={e => setForm({ ...form, aiModel: e.target.value })}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-400/50 transition-colors cursor-pointer">
                  {modelOptions.map(m => (
                    <option key={m} value={m} className="bg-app-bg">{m}{m.includes(":free") ? " (Mi?n phí)" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Story Prompt */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button onClick={() => setShowPrompt(!showPrompt)} className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-violet-500/10 rounded-xl">
                <i className="ri-quill-pen-line text-violet-400 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Tùy ch?nh Prompt Truy?n Chêm</p>
                <p className="text-app-text-secondary text-xs">B?i c?nh, nhân v?t, d? dài, phong cách</p>
              </div>
            </div>
            <i className={`text-app-text-muted text-sm transition-transform ${showPrompt ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
          </button>
          {showPrompt && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">B?i c?nh câu chuy?n</label>
                <textarea value={sp.context} onChange={e => updateStoryPrompt({ context: e.target.value })}
                  rows={2} maxLength={300}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">Nhân v?t trong truy?n</label>
                <textarea value={sp.characters} onChange={e => updateStoryPrompt({ characters: e.target.value })}
                  rows={2} maxLength={300}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Ð? dài truy?n</label>
                <div className="flex gap-2">
                  {([{ value: "short", label: "Ng?n", desc: "~150 t?" }, { value: "medium", label: "V?a", desc: "~300 t?" }, { value: "long", label: "Dài", desc: "~500 t?" }] as const).map(opt => (
                    <button key={opt.value} onClick={() => updateStoryPrompt({ storyLength: opt.value })}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-all cursor-pointer ${sp.storyLength === opt.value ? "bg-violet-500/15 border-violet-500/40 text-violet-300" : "bg-app-surface/50 border-app-border text-app-text-secondary hover:border-white/20"}`}>
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-[10px] opacity-60 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">Phong cách vi?t</label>
                <input type="text" value={sp.style} onChange={e => updateStoryPrompt({ style: e.target.value })} maxLength={200}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-400/40 transition-colors" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={handleResetPrompt} className="flex items-center gap-1.5 text-app-text-muted hover:text-white/50 text-xs transition-colors cursor-pointer">
                  <i className="ri-refresh-line"></i>Khôi ph?c m?c d?nh
                </button>
              </div>
            </div>
          )}
        </section>

        {/* API Cost */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button onClick={() => setShowCost(!showCost)} className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors">
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
            <i className={`text-app-text-muted text-sm transition-transform ${showCost ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
          </button>
          {showCost && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-4">
              {costSummary.totalCalls === 0 ? (
                <div className="text-center py-8 text-app-text-muted text-sm">
                  <i className="ri-bar-chart-line text-2xl block mb-2 opacity-30"></i>
                  Chua có l?n g?i AI nào du?c ghi nh?n
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-app-surface/50 rounded-xl p-4 border border-app-border">
                      <p className="text-app-text-muted text-[10px] tracking-normal mb-1">T?ng l?n g?i</p>
                      <p className="text-white text-2xl font-bold">{costSummary.totalCalls}</p>
                    </div>
                    <div className="bg-app-accent-primary/5 rounded-xl p-4 border border-app-accent-primary/15">
                      <p className="text-app-accent-primary/60 text-[10px] tracking-normal mb-1">Chi phí u?c tính</p>
                      <p className="text-app-accent-primary text-2xl font-bold">${costSummary.totalCostUsd.toFixed(4)}</p>
                    </div>
                    <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/15">
                      <p className="text-app-accent-success/60 text-[10px] tracking-normal mb-1">30 ngày qua</p>
                      <p className="text-app-accent-success text-2xl font-bold">{costSummary.last30Days}</p>
                    </div>
                  </div>
                  <button onClick={() => { clearRecords(); showToastMsg("Ðã xóa l?ch s? th?ng kê"); }}
                    className="flex items-center gap-2 text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer">
                    <i className="ri-delete-bin-line"></i>Xóa l?ch s? th?ng kê
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* Bank Account Configuration */}
        <section className="bg-app-bg border border-app-border rounded-xl overflow-hidden">
          <button onClick={() => setShowBank(!showBank)} className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/10 rounded-xl">
                <i className="ri-bank-line text-app-accent-success text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">C?u hình tài kho?n ngân hàng</p>
                <p className="text-app-text-secondary text-xs">Thanh toán VIP qua chuy?n kho?n ATM</p>
              </div>
              {form.bankAccount?.accountNumber ? (
                <span className="ml-2 flex items-center gap-1 text-app-accent-success text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-checkbox-circle-fill text-[10px]"></i>Ðã c?u hình
                </span>
              ) : (
                <span className="ml-2 flex items-center gap-1 text-amber-400/70 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full">
                  <i className="ri-error-warning-line text-[10px]"></i>Chua c?u hình
                </span>
              )}
            </div>
            <i className={`text-app-text-muted text-sm transition-transform ${showBank ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`}></i>
          </button>
          {showBank && (
            <div className="px-6 pb-6 border-t border-app-border pt-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Tên ngân hàng</label>
                <select
                  value={form.bankAccount?.bankName || ""}
                  onChange={e => setForm(prev => ({ ...prev, bankAccount: { ...(prev.bankAccount || { accountNumber: "", accountName: "", branch: "" }), bankName: e.target.value } }))}
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/40 transition-colors"
                >
                  <option value="">Ch?n ngân hàng</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="MB Bank">MB Bank</option>
                  <option value="ACB">ACB</option>
                  <option value="Sacombank">Sacombank</option>
                  <option value="VPBank">VPBank</option>
                  <option value="TPBank">TPBank</option>
                  <option value="VIB">VIB</option>
                  <option value="OCB">OCB</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">S? tài kho?n</label>
                <input
                  type="text"
                  value={form.bankAccount?.accountNumber || ""}
                  onChange={e => setForm(prev => ({ ...prev, bankAccount: { ...(prev.bankAccount || { bankName: "", accountName: "", branch: "" }), accountNumber: e.target.value } }))}
                  placeholder="VD: 123456789"
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Tên ch? tài kho?n</label>
                <input
                  type="text"
                  value={form.bankAccount?.accountName || ""}
                  onChange={e => setForm(prev => ({ ...prev, bankAccount: { ...(prev.bankAccount || { bankName: "", accountNumber: "", branch: "" }), accountName: e.target.value } }))}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium block mb-2">Chi nhánh (tùy ch?n)</label>
                <input
                  type="text"
                  value={form.bankAccount?.branch || ""}
                  onChange={e => setForm(prev => ({ ...prev, bankAccount: { ...(prev.bankAccount || { bankName: "", accountNumber: "", accountName: "" }), branch: e.target.value } }))}
                  placeholder="VD: Chi nhánh Hà N?i"
                  className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 text-app-accent-success/60 text-xs bg-emerald-400/5 px-3 py-2 rounded-lg">
                <i className="ri-information-line"></i>
                Thông tin này s? hi?n th? trên trang pricing d? ngu?i dùng chuy?n kho?n
              </div>
              
              {/* QR Code Preview */}
              {form.bankAccount?.bankName && form.bankAccount?.accountNumber && (
                <div className="mt-4 pt-4 border-t border-app-border">
                  <label className="text-white/50 text-xs font-medium block mb-3">QR Code chuy?n kho?n</label>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                      {form.bankAccount.qrCodeUrl ? (
                        <img src={form.bankAccount.qrCodeUrl} alt="QR Code" className="w-28 h-28" />
                      ) : (
                        <div className="text-center">
                          <i className="ri-qr-code-line text-4xl text-gray-300"></i>
                          <p className="text-gray-400 text-xs mt-1">Chua t?o</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <button
                        onClick={() => {
                          // Generate VietQR code URL
                          const bankBinMap: Record<string, string> = {
                            "Vietcombank": "970436",
                            "BIDV": "970418",
                            "Techcombank": "970436",
                            "MB Bank": "970422",
                            "ACB": "970419",
                            "Sacombank": "970403",
                            "VPBank": "970432",
                            "TPBank": "970423",
                            "VIB": "970441",
                            "OCB": "970448",
                          };
                          const bin = bankBinMap[form.bankAccount?.bankName || ""] || "";
                          const account = form.bankAccount?.accountNumber || "";
                          const amount = ""; // Leave empty for flexible amount
                          const qrData = `00020101021238${bin}${account}520458025303VN5405${amount}5802VN6304`;
                          const qrUrl = `https://img.vietqr.io/image/${bin}-${account}-2qrcode.png?amount=${amount}&addInfo=THANH_TOAN_VIP&accountName=${encodeURIComponent(form.bankAccount?.accountName || "")}`;
                          setForm(prev => ({ 
                            ...prev, 
                            bankAccount: { 
                              bankName: prev.bankAccount?.bankName || "",
                              accountNumber: prev.bankAccount?.accountNumber || "",
                              accountName: prev.bankAccount?.accountName || "",
                              branch: prev.bankAccount?.branch || "",
                              qrCodeUrl: qrUrl 
                            } 
                          }));
                          showToastMsg("Ðã t?o QR Code!");
                        }}
                        className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-app-accent-success text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer border border-emerald-500/20"
                      >
                        <i className="ri-qr-code-line"></i>T?o QR Code
                      </button>
                      <button
                        onClick={() => setForm(prev => ({ 
                          ...prev, 
                          bankAccount: { 
                            bankName: prev.bankAccount?.bankName || "",
                            accountNumber: prev.bankAccount?.accountNumber || "",
                            accountName: prev.bankAccount?.accountName || "",
                            branch: prev.bankAccount?.branch || "",
                            qrCodeUrl: undefined 
                          } 
                        }))}
                        className="flex items-center gap-2 text-app-accent-error/60 hover:text-red-400 text-xs transition-colors cursor-pointer"
                      >
                        <i className="ri-delete-bin-line"></i>Xóa QR Code
                      </button>
                    </div>
                  </div>
                </div>
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
              <p className="text-app-text-secondary text-xs">D? li?u cache trong localStorage c?a trình duy?t</p>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => { ["kts_melon_lessons", "kts_naver_qas"].forEach(k => localStorage.removeItem(k)); showToastMsg("Ðã xóa d? li?u dã duy?t"); }}
              className="flex items-center gap-2 text-app-accent-error/60 hover:text-red-400 text-xs transition-colors cursor-pointer">
              <i className="ri-delete-bin-line"></i>Xóa d? li?u dã duy?t (gi? l?i API keys)
            </button>
            <button onClick={() => { ["kts_melon_seen_songs", "kts_melon_cached_songs", "kts_melon_fetch_meta"].forEach(k => localStorage.removeItem(k)); showToastMsg("Ðã reset l?ch s? bài hát Melon"); }}
              className="flex items-center gap-2 text-amber-400/50 hover:text-amber-400 text-xs transition-colors cursor-pointer">
              <i className="ri-refresh-line"></i>Reset l?ch s? bài hát Melon
            </button>
            <button onClick={() => { localStorage.removeItem("kts_naver_cache"); showToastMsg("Ðã xóa cache Naver KiN"); }}
              className="flex items-center gap-2 text-sky-400/50 hover:text-sky-400 text-xs transition-colors cursor-pointer">
              <i className="ri-history-line"></i>Xóa cache tìm ki?m Naver KiN
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

