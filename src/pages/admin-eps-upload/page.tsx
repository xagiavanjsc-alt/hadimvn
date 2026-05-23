import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsQuestions, type EpsQuestion } from "@/mocks/epsQuestions";
import { koreanToRomanization } from "@/hooks/useAudioCache";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  questionId: string;
  status: "pending" | "uploading" | "done" | "error";
  errorMsg?: string;
  targetUrl?: string;
}

const VPS_IMAGE_BASE = "https://img.hanquocoi.vn/eps";
const VPS_AUDIO_BASE = "https://audio.hanquocoi.vn/tts";

// ─── Drag & Drop Zone ─────────────────────────────────────────────────────────
function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  }, [onFiles]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? "border-app-accent-primary/60 bg-app-accent-primary/5" : "border-app-border hover:border-white/20 hover:bg-white/2"}`}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { const files = Array.from(e.target.files || []); if (files.length) onFiles(files); e.target.value = ""; }} />
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-card/50 mx-auto mb-4">
        <i className={`ri-upload-cloud-2-line text-3xl ${dragging ? "text-app-accent-primary" : "text-app-text-muted"}`}></i>
      </div>
      <p className="text-white/60 font-semibold text-sm mb-1">{dragging ? "Thả ảnh vào đây!" : "Kéo thả ảnh hoặc click để chọn"}</p>
      <p className="text-app-text-muted text-xs">Hỗ trợ JPG, PNG, WebP · Nhiều file cùng lúc</p>
    </div>
  );
}

// ─── Upload Item Card ─────────────────────────────────────────────────────────
function UploadCard({ item, questions, onAssign, onRemove, onUpload }: {
  item: UploadItem; questions: EpsQuestion[];
  onAssign: (itemId: string, questionId: string) => void;
  onRemove: (itemId: string) => void;
  onUpload: (itemId: string) => void;
}) {
  const assignedQ = questions.find(q => q.id === item.questionId);
  return (
    <div className={`bg-app-bg border rounded-xl p-4 transition-all ${item.status === "done" ? "border-emerald-500/20" : item.status === "error" ? "border-red-500/20" : "border-app-border"}`}>
      <div className="w-full h-36 rounded-lg overflow-hidden bg-app-surface/50 mb-3 relative">
        <img loading="lazy" decoding="async" src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
        {item.status === "done" && <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"><i className="ri-checkbox-circle-fill text-app-accent-success text-3xl"></i></div>}
        {item.status === "uploading" && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div></div>}
        <button onClick={() => onRemove(item.id)} className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white/60 hover:text-white cursor-pointer transition-colors"><i className="ri-close-line text-xs"></i></button>
      </div>
      <p className="text-app-text-secondary text-[10px] truncate mb-2">{item.file.name}</p>
      <div className="mb-3">
        <label className="text-app-text-muted text-[10px] block mb-1">Gán vào câu hỏi EPS</label>
        <select value={item.questionId} onChange={e => onAssign(item.id, e.target.value)}
          className="w-full bg-app-card/50 border border-app-border rounded-lg px-2.5 py-1.5 text-white/70 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer">
          <option value="">-- Chọn câu hỏi --</option>
          {questions.map(q => <option key={q.id} value={q.id}>[{q.id}] {q.questionVi.slice(0, 40)}...</option>)}
        </select>
      </div>
      {assignedQ && (
        <div className="bg-app-surface/50 rounded-lg px-2.5 py-2 mb-3">
          <p className="text-app-text-muted text-[9px] mb-0.5">URL đích trên VPS:</p>
          <p className="text-app-accent-primary/60 text-[9px] font-mono break-all">{VPS_IMAGE_BASE}/{assignedQ.topic}/{item.file.name}</p>
        </div>
      )}
      {item.status === "error" && <p className="text-red-400 text-[10px] mb-2">{item.errorMsg}</p>}
      {item.status === "done" && <p className="text-app-accent-success text-[10px] mb-2">Upload thành công!</p>}
      <button onClick={() => onUpload(item.id)} disabled={!item.questionId || item.status === "uploading" || item.status === "done"}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${item.status === "done" ? "bg-emerald-500/10 text-app-accent-success border border-emerald-500/20" : !item.questionId ? "bg-app-surface/50 text-app-text-muted cursor-not-allowed" : "bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/20"}`}>
        {item.status === "uploading" ? "Đang upload..." : item.status === "done" ? "Đã upload" : !item.questionId ? "Chọn câu hỏi trước" : "Upload lên VPS"}
      </button>
    </div>
  );
}

// ─── Audio Generator ──────────────────────────────────────────────────────────
function AudioGenerator() {
  const [word, setWord] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [romanized, setRomanized] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const handleGenerate = async () => {
    if (!word.trim()) return;
    const roman = koreanToRomanization(word.trim());
    setRomanized(roman);
    setStatus("generating");
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word.trim())}&tl=ko&client=tw-ob`;
      const res = await fetch(ttsUrl);
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-volume-up-line text-app-accent-primary mr-2"></i>Tạo âm thanh TTS</h3>
      <div className="flex gap-2 mb-3">
        <input value={word} onChange={e => setWord(e.target.value)} placeholder="Nhập từ tiếng Hàn..."
          className="flex-1 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20" />
        <button onClick={handleGenerate} disabled={!word.trim() || status === "generating"}
          className="px-4 py-2.5 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors">
          {status === "generating" ? <i className="ri-loader-4-line animate-spin"></i> : "Tạo TTS"}
        </button>
      </div>
      {romanized && (
        <div className="bg-app-surface/50 rounded-lg px-3 py-2 mb-3">
          <p className="text-app-text-muted text-[10px] mb-0.5">Tên file trên VPS:</p>
          <p className="text-app-accent-primary/70 text-xs font-mono">{VPS_AUDIO_BASE}/{romanized}.mp3</p>
        </div>
      )}
      {status === "done" && audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full h-8" />
          <a href={audioUrl} download={`${romanized}.mp3`}
            className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-app-accent-success text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-download-line"></i>Tải về {romanized}.mp3
          </a>
        </div>
      )}
      {status === "error" && <p className="text-red-400 text-xs">Lỗi tạo TTS. Thử lại hoặc dùng Web Speech API.</p>}
    </div>
  );
}

// ─── VPS Structure Guide ──────────────────────────────────────────────────────
function VPSGuide() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  };
  const configs = [
    { label: "Cấu trúc thư mục ảnh", key: "dir", code: `/var/www/img.hanquocoi.vn/\n├── eps/\n│   ├── safety/\n│   ├── greeting/\n│   ├── workplace/\n│   ├── daily/\n│   ├── emergency/\n│   ├── culture/\n│   ├── law/\n│   ├── listening/\n│   └── reading/` },
    { label: "Nginx config (CORS)", key: "nginx", code: `server {\n    listen 80;\n    server_name img.hanquocoi.vn;\n    root /var/www/img.hanquocoi.vn;\n    add_header Access-Control-Allow-Origin *;\n    add_header Cache-Control "public, max-age=31536000";\n    location / { try_files $uri $uri/ =404; }\n}` },
  ];
  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-server-line text-[#fb923c] mr-2"></i>Hướng dẫn cấu trúc VPS</h3>
      <div className="space-y-3">
        {configs.map(cfg => (
          <div key={cfg.key} className="bg-app-surface/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-app-border">
              <span className="text-white/50 text-xs font-medium">{cfg.label}</span>
              <button onClick={() => copy(cfg.code, cfg.key)} className="flex items-center gap-1 text-[10px] text-app-text-muted hover:text-app-accent-primary/70 cursor-pointer whitespace-nowrap transition-colors">
                <i className={copied === cfg.key ? "ri-check-line text-app-accent-success" : "ri-clipboard-line"}></i>
                {copied === cfg.key ? "Đã copy" : "Copy"}
              </button>
            </div>
            <pre className="px-3 py-2.5 text-[10px] text-app-text-secondary font-mono overflow-x-auto leading-relaxed">{cfg.code}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Phonetic Generator (OpenRouter) ─────────────────────────────────────────
interface VocabItem {
  id: string;
  korean: string;
  meaning: string;
  phonetic: string;
  status: "pending" | "generating" | "done" | "error";
  error?: string;
}

const OPENROUTER_MODELS = [
  { id: "google/gemma-3-12b-it:free", label: "Gemma 3 12B (Miễn phí)" },
  { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku (Nhanh)" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (Miễn phí)" },
];

async function generatePhonetic(korean: string, meaning: string, apiKey: string, model: string): Promise<string> {
  const prompt = `Bạn là chuyên gia tiếng Hàn. Hãy tạo phiên âm tiếng Việt (cách đọc) cho từ tiếng Hàn sau theo chuẩn phiên âm tiếng Việt dễ đọc (không dùng IPA, không dùng Romanization Latin).\n\nTừ tiếng Hàn: ${korean}\nNghĩa tiếng Việt: ${meaning}\n\nChỉ trả về phiên âm tiếng Việt, không giải thích thêm. Ví dụ: 안녕하세요 → "an-nhơng-ha-xê-yo"`;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://hanquocoi.vn", "X-Title": "Hàn Quốc Ơi! Admin" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 100, temperature: 0.3 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content?.trim() || "";
}

function PhoneticGenerator() {
  const [apiKey, setApiKey] = useLocalStorage<string>("kts_openrouter_key", "");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(OPENROUTER_MODELS[0].id);
  const [items, setItems] = useState<VocabItem[]>([]);
  const [bulkInput, setBulkInput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(false);

  const parseBulkInput = () => {
    const lines = bulkInput.trim().split("\n").filter(l => l.trim());
    const parsed: VocabItem[] = lines.map((line, i) => {
      const parts = line.split(/\t|,/).map(p => p.trim());
      return { id: `item-${i}-${Date.now()}`, korean: parts[0] || "", meaning: parts[1] || "", phonetic: "", status: "pending" as const };
    }).filter(v => v.korean);
    setItems(parsed);
  };

  const runGeneration = async () => {
    if (!apiKey.trim()) return;
    abortRef.current = false;
    setRunning(true);
    for (let i = 0; i < items.length; i++) {
      if (abortRef.current) break;
      const item = items[i];
      if (item.status === "done") continue;
      setItems(prev => prev.map((v, idx) => idx === i ? { ...v, status: "generating" } : v));
      try {
        const phonetic = await generatePhonetic(item.korean, item.meaning, apiKey, model);
        setItems(prev => prev.map((v, idx) => idx === i ? { ...v, phonetic, status: "done" } : v));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi không xác định";
        setItems(prev => prev.map((v, idx) => idx === i ? { ...v, status: "error", error: msg } : v));
      }
      await new Promise(r => setTimeout(r, 300));
    }
    setRunning(false);
  };

  const exportResult = () => {
    const lines = items.filter(v => v.status === "done").map(v => `${v.korean}\t${v.meaning}\t${v.phonetic}`).join("\n");
    navigator.clipboard.writeText(`Tiếng Hàn\tNghĩa tiếng Việt\tPhiên âm\n${lines}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const doneCount = items.filter(v => v.status === "done").length;
  const errorCount = items.filter(v => v.status === "error").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      <div className="space-y-4">
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-list-unordered text-app-accent-primary mr-2"></i>Nhập danh sách từ vựng</h3>
          <p className="text-app-text-muted text-xs mb-3">Mỗi dòng một từ. Định dạng: <code className="bg-app-card/50 px-1 rounded text-app-accent-primary">tiếng_hàn,nghĩa_việt</code></p>
          <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)}
            placeholder={"안전모,mũ bảo hộ\n비상구,lối thoát hiểm\n작업복,đồng phục lao động\n소화기,bình chữa cháy"}
            rows={8} className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20 resize-none font-mono" />
          <div className="flex gap-2 mt-3">
            <button onClick={parseBulkInput} disabled={!bulkInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-app-card/50 hover:bg-white/8 border border-app-border text-white/60 text-sm rounded-xl cursor-pointer whitespace-nowrap disabled:opacity-40 transition-colors">
              <i className="ri-list-check-2"></i>Phân tích ({bulkInput.trim().split("\n").filter(l => l.trim()).length} dòng)
            </button>
            {items.length > 0 && (
              <button onClick={runGeneration} disabled={running || !apiKey.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                <i className={running ? "ri-loader-4-line animate-spin" : "ri-magic-line"}></i>
                {running ? `Đang tạo... (${doneCount}/${items.length})` : `Tạo phiên âm (${items.length} từ)`}
              </button>
            )}
            {running && (
              <button onClick={() => { abortRef.current = true; setRunning(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl cursor-pointer whitespace-nowrap">
                <i className="ri-stop-line"></i>Dừng
              </button>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-app-border">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold text-sm">Kết quả</span>
                <span className="text-app-accent-success text-xs">{doneCount} xong</span>
                {errorCount > 0 && <span className="text-red-400 text-xs">{errorCount} lỗi</span>}
              </div>
              {doneCount > 0 && (
                <button onClick={exportResult}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors ${copied ? "bg-emerald-500/10 text-app-accent-success border border-emerald-500/20" : "bg-app-card/50 text-white/50 border border-app-border hover:text-white/70"}`}>
                  <i className={copied ? "ri-check-line" : "ri-clipboard-line"}></i>{copied ? "Đã copy!" : "Copy kết quả"}
                </button>
              )}
            </div>
            <div className="divide-y divide-white/3 max-h-96 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-3 px-5 py-3 items-center">
                  <span className="text-white font-medium text-sm">{item.korean}</span>
                  <span className="text-white/50 text-xs">{item.meaning}</span>
                  <div>
                    {item.status === "done" && <span className="text-app-accent-primary text-sm font-medium">{item.phonetic}</span>}
                    {item.status === "generating" && <span className="flex items-center gap-1.5 text-app-text-muted text-xs"><i className="ri-loader-4-line animate-spin text-app-accent-primary"></i>Đang tạo...</span>}
                    {item.status === "pending" && <span className="text-app-text-muted text-xs">Chờ xử lý</span>}
                    {item.status === "error" && <span className="text-red-400 text-xs" title={item.error}>Lỗi</span>}
                  </div>
                  <div className="flex items-center justify-center">
                    {item.status === "done" && <i className="ri-checkbox-circle-fill text-app-accent-success text-sm"></i>}
                    {item.status === "error" && <i className="ri-error-warning-fill text-red-400 text-sm"></i>}
                    {item.status === "generating" && <div className="w-3 h-3 border border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1"><i className="ri-key-2-line text-app-accent-primary mr-2"></i>OpenRouter API Key</h3>
          <p className="text-app-text-muted text-[10px] mb-3 leading-relaxed">
            Key lưu trong localStorage — không gửi lên server. Lấy key miễn phí tại{" "}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-app-accent-primary/70 hover:underline">openrouter.ai/keys</a>
          </p>
          <div className="relative mb-3">
            <input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-or-v1-..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20 pr-10 font-mono" />
            <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-white/60 cursor-pointer">
              <i className={showKey ? "ri-eye-off-line" : "ri-eye-line"}></i>
            </button>
          </div>
          {apiKey ? (
            <div className="flex items-center gap-1.5 text-app-accent-success text-[10px]"><i className="ri-shield-check-line"></i>API key đã lưu (chỉ trong trình duyệt này)</div>
          ) : (
            <div className="flex items-center gap-1.5 text-app-text-muted text-[10px]"><i className="ri-information-line"></i>Nhập API key để bắt đầu tạo phiên âm</div>
          )}
        </div>
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-robot-line text-[#a78bfa] mr-2"></i>Chọn model AI</h3>
          <div className="space-y-2">
            {OPENROUTER_MODELS.map(m => (
              <button key={m.id} onClick={() => setModel(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${model === m.id ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border hover:border-app-border hover:bg-app-surface/50"}`}>
                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${model === m.id ? "border-app-accent-primary bg-app-accent-primary" : "border-white/20"}`}></div>
                <div>
                  <p className={`text-xs font-medium ${model === m.id ? "text-app-accent-primary" : "text-white/60"}`}>{m.label}</p>
                  <p className="text-app-text-muted text-[9px] font-mono">{m.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-lightbulb-line text-[#fb923c] mr-2"></i>Hướng dẫn sử dụng</h3>
          <div className="space-y-2.5">
            {[
              { icon: "ri-file-text-line", color: "app-accent-primary", text: "Nhập từ vựng: tiếng_hàn,nghĩa_việt (mỗi dòng 1 từ)" },
              { icon: "ri-magic-line", color: "#a78bfa", text: "AI tạo phiên âm tiếng Việt dễ đọc, không phải Romanization Latin" },
              { icon: "ri-clipboard-line", color: "#34d399", text: "Copy kết quả và paste vào file epsVocabulary.ts để cập nhật" },
              { icon: "ri-shield-line", color: "#fb923c", text: "API key chỉ lưu trong trình duyệt, không gửi lên server của app" },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: `${tip.color}15` }}>
                  <i className={`${tip.icon} text-xs`} style={{ color: tip.color }}></i>
                </div>
                <p className="text-app-text-secondary text-[10px] leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminEpsUploadPage() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "phonetic" | "audio" | "guide">("upload");
  const [uploadAll, setUploadAll] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file, preview: URL.createObjectURL(file), questionId: "", status: "pending",
    }));
    setUploads(prev => [...prev, ...newItems]);
  }, []);

  const handleAssign = (itemId: string, questionId: string) => {
    setUploads(prev => prev.map(u => u.id === itemId ? { ...u, questionId } : u));
  };

  const handleRemove = (itemId: string) => {
    setUploads(prev => {
      const item = prev.find(u => u.id === itemId);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(u => u.id !== itemId);
    });
  };

  const simulateUpload = async (itemId: string) => {
    setUploads(prev => prev.map(u => u.id === itemId ? { ...u, status: "uploading" } : u));
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const item = uploads.find(u => u.id === itemId);
    const q = epsQuestions.find(q => q.id === item?.questionId);
    const targetUrl = q ? `${VPS_IMAGE_BASE}/${q.topic}/${item?.file.name}` : "";
    setUploads(prev => prev.map(u => u.id === itemId ? { ...u, status: "done", targetUrl } : u));
  };

  const handleUploadAll = async () => {
    setUploadAll(true);
    const pending = uploads.filter(u => u.questionId && u.status === "pending");
    for (const item of pending) await simulateUpload(item.id);
    setUploadAll(false);
  };

  const pendingCount = uploads.filter(u => u.questionId && u.status === "pending").length;
  const doneCount = uploads.filter(u => u.status === "done").length;

  const tabs = [
    { id: "upload", label: "Upload ảnh", icon: "ri-image-add-line" },
    { id: "phonetic", label: "Phiên âm AI", icon: "ri-translate-2" },
    { id: "audio", label: "Tạo âm thanh", icon: "ri-volume-up-line" },
    { id: "guide", label: "Hướng dẫn VPS", icon: "ri-server-line" },
  ] as const;

  return (
    <DashboardLayout
      title="Admin Upload EPS"
      subtitle="Upload ảnh, tạo phiên âm AI và âm thanh TTS cho câu hỏi EPS"
      actions={
        activeTab === "upload" && uploads.length > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-app-text-secondary text-xs">{doneCount}/{uploads.length} đã upload</span>
            <button onClick={handleUploadAll} disabled={pendingCount === 0 || uploadAll}
              className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              <i className={uploadAll ? "ri-loader-4-line animate-spin" : "ri-upload-cloud-2-line"}></i>
              {uploadAll ? "Đang upload..." : `Upload tất cả (${pendingCount})`}
            </button>
          </div>
        ) : null
      }
    >
      <div className="flex items-center gap-1 bg-app-surface/50 border border-app-border rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/70"}`}>
            <i className={tab.icon}></i>{tab.label}
            {tab.id === "phonetic" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] font-bold">AI</span>}
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <div className="space-y-5">
          <DropZone onFiles={handleFiles} />
          {uploads.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-3 bg-app-bg border border-app-border rounded-xl">
              {[
                { label: "Tổng file", value: uploads.length, color: "app-accent-primary" },
                { label: "Chờ upload", value: pendingCount, color: "#fb923c" },
                { label: "Đã upload", value: doneCount, color: "#34d399" },
                { label: "Lỗi", value: uploads.filter(u => u.status === "error").length, color: "#f87171" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-app-text-secondary text-xs">{s.label}:</span>
                  <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
              <button onClick={() => setUploads([])} className="ml-auto text-app-text-muted hover:text-white/50 text-xs cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-delete-bin-line mr-1"></i>Xóa tất cả
              </button>
            </div>
          )}
          {uploads.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {uploads.map(item => <UploadCard key={item.id} item={item} questions={epsQuestions} onAssign={handleAssign} onRemove={handleRemove} onUpload={simulateUpload} />)}
            </div>
          ) : (
            <div className="bg-app-bg border border-app-border rounded-2xl p-8">
              <h3 className="text-white font-semibold text-sm mb-4">Hướng dẫn upload ảnh EPS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: "1", icon: "ri-drag-drop-line", title: "Kéo thả ảnh", desc: "Kéo nhiều ảnh cùng lúc vào vùng upload phía trên" },
                  { step: "2", icon: "ri-link-m", title: "Gán câu hỏi", desc: "Chọn câu hỏi EPS tương ứng cho từng ảnh" },
                  { step: "3", icon: "ri-upload-cloud-2-line", title: "Upload VPS", desc: "Click Upload hoặc Upload tất cả để đẩy lên server" },
                ].map(s => (
                  <div key={s.step} className="bg-app-surface/50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/10 mx-auto mb-3">
                      <i className={`${s.icon} text-app-accent-primary text-lg`}></i>
                    </div>
                    <p className="text-white/70 text-xs font-semibold mb-1">Bước {s.step}: {s.title}</p>
                    <p className="text-app-text-muted text-[10px] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "phonetic" && <PhoneticGenerator />}

      {activeTab === "audio" && (
        <div className="grid grid-cols-2 gap-5">
          <AudioGenerator />
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4"><i className="ri-information-line text-app-accent-primary mr-2"></i>Quy trình âm thanh TTS</h3>
            <div className="space-y-3">
              {[
                { icon: "ri-translate-2", color: "app-accent-primary", title: "Phiên âm latinh", desc: "안전모 → anjeonmo.mp3 (tên file an toàn cho mọi VPS)" },
                { icon: "ri-google-line", color: "#34d399", title: "Google TTS miễn phí", desc: "Tạo MP3 chất lượng tốt, không cần API key" },
                { icon: "ri-save-line", color: "#fb923c", title: "Cache vĩnh viễn", desc: "Lần đầu nghe → cache browser. Lần sau phát từ cache" },
                { icon: "ri-server-line", color: "#a78bfa", title: "Upload VPS", desc: "Tải file MP3 về → upload lên audio.hanquocoi.vn/tts/" },
              ].map(s => (
                <div key={s.title} className="flex items-start gap-3 p-3 bg-app-surface/50 rounded-xl">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-semibold mb-0.5">{s.title}</p>
                    <p className="text-white/35 text-[10px] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "guide" && <VPSGuide />}
    </DashboardLayout>
  );
}



