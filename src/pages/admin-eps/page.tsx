import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions, EPS_TOPICS, type EpsQuestion } from "@/mocks/epsQuestions";
import { epsVocabulary, EPS_VOCAB_TOPICS, type EpsVocabItem } from "@/mocks/epsVocabulary";
import ImageWithFallback from "@/components/base/ImageWithFallback";

// --- Dedup helper ---------------------------------------------------------
function deduplicateVocab(items: EpsVocabItem[]): EpsVocabItem[] {
  const seen = new Set<string>();
  const dupes: string[] = [];
  const result = items.filter(item => {
    const key = item.korean.trim().toLowerCase();
    if (seen.has(key)) { dupes.push(item.korean); return false; }
    seen.add(key);
    return true;
  });
  return result;
}

type AdminTab = "questions" | "vocabulary" | "import" | "vps-guide";

// --- Question Editor ------------------------------------------------------
function QuestionEditor({
  question,
  onSave,
  onCancel,
}: {
  question: EpsQuestion;
  onSave: (updated: Partial<EpsQuestion>) => void;
  onCancel: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(question.imageUrl || "");
  const [imageAlt, setImageAlt] = useState(question.imageAlt || "");
  const [imageCaption, setImageCaption] = useState(question.imageCaption || "");
  const [previewError, setPreviewError] = useState(false);

  return (
    <div className="bg-app-bg border border-app-accent-primary/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <i className="ri-image-edit-line text-app-accent-primary"></i>
        <h3 className="text-white font-semibold text-sm">Ch?nh s?a ?nh — Câu {question.id}</h3>
      </div>

      <div className="bg-app-surface/50 rounded-xl p-3 mb-3">
        <p className="text-white/60 text-xs font-medium mb-1">{question.question}</p>
        <p className="text-app-text-muted text-[10px] italic">{question.questionVi}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-app-text-secondary text-xs mb-1 block">URL ?nh minh h?a</label>
          <input
            type="text"
            value={imageUrl}
            onChange={e => { setImageUrl(e.target.value); setPreviewError(false); }}
            placeholder="https://img.hanquocoi.vn/eps/safety/helmet-01.jpg"
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-sm outline-none focus:border-app-accent-primary/40 placeholder-white/20"
          />
          <p className="text-app-text-muted text-[10px] mt-1">H? tr?: img.hanquocoi.vn, readdy.ai, ho?c b?t k? URL ?nh nào</p>
        </div>
        <div>
          <label className="text-app-text-secondary text-xs mb-1 block">Alt text (mô t? ?nh)</label>
          <input
            type="text"
            value={imageAlt}
            onChange={e => setImageAlt(e.target.value)}
            placeholder="Mô t? ng?n v? ?nh..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-sm outline-none focus:border-app-accent-primary/40 placeholder-white/20"
          />
        </div>
        <div>
          <label className="text-app-text-secondary text-xs mb-1 block">Chú thích ?nh (hi?n th? du?i ?nh)</label>
          <input
            type="text"
            value={imageCaption}
            onChange={e => setImageCaption(e.target.value)}
            placeholder="Hình ?nh: Thi?t b? b?o h? t?i công tru?ng..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-sm outline-none focus:border-app-accent-primary/40 placeholder-white/20"
          />
        </div>
      </div>

      {/* Preview */}
      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-app-border">
          <p className="text-app-text-muted text-[10px] px-3 py-1.5 bg-app-surface/50 border-b border-app-border">Xem tru?c ?nh</p>
          <ImageWithFallback
            src={imageUrl}
            alt={imageAlt || "Preview"}
            className="w-full object-cover object-top"
            style={{ maxHeight: "180px" }}
            caption={imageCaption}
            placeholderText="URL ?nh không h?p l? ho?c chua upload lên VPS"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors">H?y</button>
        <button
          onClick={() => onSave({ imageUrl: imageUrl || undefined, imageAlt: imageAlt || undefined, imageCaption: imageCaption || undefined })}
          className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-save-line mr-2"></i>Luu thay d?i
        </button>
      </div>
    </div>
  );
}

// --- Import Panel ---------------------------------------------------------
function ImportPanel() {
  const [importText, setImportText] = useState("");
  const [parseResult, setParseResult] = useState<{ valid: EpsVocabItem[]; dupes: string[]; errors: string[] } | null>(null);

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    const existingKorean = new Set(epsVocabulary.map(v => v.korean.trim().toLowerCase()));
    const seenInImport = new Set<string>();
    const valid: EpsVocabItem[] = [];
    const dupes: string[] = [];
    const errors: string[] = [];

    lines.forEach((line, i) => {
      if (i === 0 && line.toLowerCase().includes("korean")) return; // skip header
      const parts = line.split("\t").map(p => p.trim());
      if (parts.length < 4) {
        errors.push(`Dòng ${i + 1}: Thi?u c?t (c?n ít nh?t 4: korean, reading, vietnamese, topicId)`);
        return;
      }
      const [korean, reading, vietnamese, topicId, level, example, exampleVi] = parts;
      const key = korean.toLowerCase();

      if (existingKorean.has(key) || seenInImport.has(key)) {
        dupes.push(korean);
        return;
      }
      seenInImport.add(key);

      const validTopics = EPS_VOCAB_TOPICS.map(t => t.id);
      if (!validTopics.includes(topicId)) {
        errors.push(`Dòng ${i + 1}: topicId "${topicId}" không h?p l?`);
        return;
      }

      valid.push({
        id: `import_${Date.now()}_${i}`,
        korean,
        reading: reading || "",
        vietnamese,
        topicId,
        level: (["basic", "intermediate", "advanced"].includes(level) ? level : "basic") as EpsVocabItem["level"],
        example: example || `${korean}?/? ????.`,
        exampleVi: exampleVi || `S? d?ng ${korean}.`,
      });
    });

    setParseResult({ valid, dupes, errors });
  }, []);

  const sampleCSV = `korean\treading\tvietnamese\ttopicId\tlevel\texample\texampleVi
???\tjageopjang\tNoi làm vi?c\tworkplace\tbasic\t????? ??? ???.\tGi? an toàn t?i noi làm vi?c.
???\tbohokbok\tQu?n áo b?o h?\tsafety\tbasic\t???? ?? ???.\tM?c qu?n áo b?o h? khi làm vi?c.
??\timgeum\tTi?n luong\tlaw\tintermediate\t??? ?? ??? ??.\tPh?i nh?n luong dúng h?n.`;

  return (
    <div className="space-y-5">
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-upload-line text-app-accent-primary mr-2"></i>Import t? v?ng (TSV/CSV)</h3>
        <p className="text-app-text-secondary text-xs mb-3 leading-relaxed">
          Dán d? li?u t? Excel/Google Sheets (Tab-separated). H? th?ng t? d?ng b? qua t? trùng l?p.
        </p>

        <div className="bg-app-surface/50 rounded-xl p-3 mb-4 border border-app-border">
          <p className="text-app-text-muted text-[10px] mb-2 font-medium">Format chu?n (copy t? Excel):</p>
          <pre className="text-app-accent-primary/70 text-[10px] font-mono leading-relaxed overflow-x-auto">{sampleCSV}</pre>
          <button
            onClick={() => { setImportText(sampleCSV); setParseResult(null); }}
            className="mt-2 text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-file-copy-line mr-1"></i>Dùng d? li?u m?u
          </button>
        </div>

        <textarea
          value={importText}
          onChange={e => { setImportText(e.target.value); setParseResult(null); }}
          placeholder="Dán d? li?u TSV vào dây..."
          rows={8}
          maxLength={50000}
          className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-xs font-mono outline-none focus:border-app-accent-primary/40 placeholder-white/20 resize-none"
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => parseCSV(importText)}
            disabled={!importText.trim()}
            className="flex-1 py-2.5 rounded-xl bg-white/8 border border-app-border text-white/60 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-white/12 disabled:opacity-40 transition-colors"
          >
            <i className="ri-eye-line mr-2"></i>Ki?m tra d? li?u
          </button>
          {parseResult && parseResult.valid.length > 0 && (
            <button
              onClick={() => alert(`Tính nang import s? c?n k?t n?i Supabase d? luu ${parseResult.valid.length} t? m?i. Hi?n t?i hãy thêm vào file epsVocabulary.ts.`)}
              className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className="ri-add-line mr-2"></i>Import {parseResult.valid.length} t?
            </button>
          )}
        </div>
      </div>

      {/* Parse result */}
      {parseResult && (
        <div className="space-y-3">
          {parseResult.valid.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-app-accent-success text-sm font-semibold mb-2"><i className="ri-checkbox-circle-line mr-2"></i>{parseResult.valid.length} t? h?p l?</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {parseResult.valid.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-white font-bold w-20 flex-shrink-0">{v.korean}</span>
                    <span className="text-app-text-secondary">[{v.reading}]</span>
                    <span className="text-app-accent-primary">{v.vietnamese}</span>
                    <span className="text-app-text-muted ml-auto">{v.topicId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {parseResult.dupes.length > 0 && (
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4">
              <p className="text-app-accent-primary text-sm font-semibold mb-2"><i className="ri-skip-forward-line mr-2"></i>{parseResult.dupes.length} t? trùng l?p (dã b? qua)</p>
              <p className="text-app-text-secondary text-xs">{parseResult.dupes.join(", ")}</p>
            </div>
          )}
          {parseResult.errors.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm font-semibold mb-2"><i className="ri-error-warning-line mr-2"></i>{parseResult.errors.length} l?i</p>
              <div className="space-y-1">
                {parseResult.errors.map((e, i) => <p key={i} className="text-red-400/70 text-xs">{e}</p>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- VPS Guide ------------------------------------------------------------
function VpsGuide() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const nginxConfig = `# /etc/nginx/sites-available/img.hanquocoi.vn
server {
    listen 80;
    server_name img.hanquocoi.vn;
    
    # ?nh EPS câu h?i
    location /eps/ {
        root /var/www/hanquocoi/media;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # ?nh t? v?ng
    location /vocab/ {
        root /var/www/hanquocoi/media;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}

# /etc/nginx/sites-available/audio.hanquocoi.vn
server {
    listen 80;
    server_name audio.hanquocoi.vn;
    
    # File âm thanh TTS (cache vinh vi?n)
    location /tts/ {
        root /var/www/hanquocoi/media;
        expires max;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        types { audio/mpeg mp3; }
    }
}`;

  const folderStructure = `/var/www/hanquocoi/media/
+-- eps/
¦   +-- safety/
¦   ¦   +-- helmet-01.jpg          # Mu b?o h?
¦   ¦   +-- fire-extinguisher.jpg  # Bình ch?a cháy
¦   ¦   +-- emergency-exit.jpg     # L?i thoát hi?m
¦   ¦   +-- ppe-equipment.jpg      # Thi?t b? b?o h?
¦   +-- workplace/
¦   ¦   +-- bow-greeting.jpg       # Cúi chào
¦   ¦   +-- office-meeting.jpg     # H?p van phòng
¦   ¦   +-- factory-work.jpg       # Làm vi?c nhà máy
¦   +-- daily/
¦   ¦   +-- recycling-bins.jpg     # Phân lo?i rác
¦   ¦   +-- transport-card.jpg     # Th? giao thông
¦   +-- emergency/
¦       +-- cpr-training.jpg       # So c?u CPR
¦       +-- fire-escape.jpg        # Thoát hi?m
+-- vocab/
¦   +-- workplace/
¦   +-- safety/
¦   +-- culture/
+-- tts/
    +-- ?????.mp3              # TTS cache (tên = t? ti?ng Hàn)
    +-- ?????.mp3
    +-- ???.mp3
    +-- ...                        # T? d?ng cache khi user nghe l?n d?u`;

  const uploadScript = `#!/bin/bash
# upload-media.sh — Script upload ?nh/âm thanh lên VPS
# S? d?ng: ./upload-media.sh safety helmet-01.jpg /path/to/local/file.jpg

CATEGORY=$1  # eps/safety, eps/workplace, vocab/safety...
FILENAME=$2  # helmet-01.jpg
LOCAL_FILE=$3

VPS_USER="root"
VPS_HOST="your-vps-ip"
VPS_PATH="/var/www/hanquocoi/media"

scp "$LOCAL_FILE" "$VPS_USER@$VPS_HOST:$VPS_PATH/$CATEGORY/$FILENAME"
echo "? Uploaded: https://img.hanquocoi.vn/$CATEGORY/$FILENAME"`;

  return (
    <div className="space-y-5">
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1"><i className="ri-server-line text-app-accent-primary mr-2"></i>C?u trúc thu m?c VPS</h3>
        <p className="text-app-text-secondary text-xs mb-3">C?u trúc chu?n cho ?nh và âm thanh trên server riêng</p>
        <div className="relative">
          <pre className="bg-black/40 rounded-xl p-4 text-[#34d399] text-[10px] font-mono leading-relaxed overflow-x-auto">{folderStructure}</pre>
          <button onClick={() => copy(folderStructure, "folder")} className="absolute top-2 right-2 text-[10px] text-app-text-muted hover:text-white/60 bg-app-card/50 px-2 py-1 rounded cursor-pointer whitespace-nowrap">
            {copied === "folder" ? "? Ðã copy" : <><i className="ri-file-copy-line mr-1"></i>Copy</>}
          </button>
        </div>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1"><i className="ri-settings-3-line text-app-accent-primary mr-2"></i>Nginx config</h3>
        <p className="text-app-text-secondary text-xs mb-3">C?u hình Nginx cho img.hanquocoi.vn và audio.hanquocoi.vn</p>
        <div className="relative">
          <pre className="bg-black/40 rounded-xl p-4 text-[#38bdf8] text-[10px] font-mono leading-relaxed overflow-x-auto">{nginxConfig}</pre>
          <button onClick={() => copy(nginxConfig, "nginx")} className="absolute top-2 right-2 text-[10px] text-app-text-muted hover:text-white/60 bg-app-card/50 px-2 py-1 rounded cursor-pointer whitespace-nowrap">
            {copied === "nginx" ? "? Ðã copy" : <><i className="ri-file-copy-line mr-1"></i>Copy</>}
          </button>
        </div>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1"><i className="ri-upload-cloud-line text-app-accent-primary mr-2"></i>Script upload ?nh</h3>
        <p className="text-app-text-secondary text-xs mb-3">Script bash d? upload ?nh t? máy local lên VPS</p>
        <div className="relative">
          <pre className="bg-black/40 rounded-xl p-4 text-[#a78bfa] text-[10px] font-mono leading-relaxed overflow-x-auto">{uploadScript}</pre>
          <button onClick={() => copy(uploadScript, "upload")} className="absolute top-2 right-2 text-[10px] text-app-text-muted hover:text-white/60 bg-app-card/50 px-2 py-1 rounded cursor-pointer whitespace-nowrap">
            {copied === "upload" ? "? Ðã copy" : <><i className="ri-file-copy-line mr-1"></i>Copy</>}
          </button>
        </div>
      </div>

      <div className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4">
        <p className="text-app-accent-primary text-sm font-semibold mb-2"><i className="ri-lightbulb-line mr-2"></i>Chi?n lu?c cache âm thanh TTS</p>
        <div className="space-y-2 text-white/50 text-xs leading-relaxed">
          <p>1. <strong className="text-white/70">L?n d?u nghe:</strong> App g?i API TTS ? nh?n file MP3 ? luu vào <code className="text-app-accent-primary/70">audio.hanquocoi.vn/tts/[t?].mp3</code></p>
          <p>2. <strong className="text-white/70">L?n sau:</strong> App ki?m tra Cache Storage ? n?u có thì phát ngay, không t?n API</p>
          <p>3. <strong className="text-white/70">Vinh vi?n:</strong> File MP3 luu trên VPS không bao gi? xóa ? không c?n t?o l?i</p>
          <p>4. <strong className="text-white/70">SEO:</strong> URL <code className="text-app-accent-primary/70">audio.hanquocoi.vn</code> giúp Google index âm thanh g?n v?i domain c?a b?n</p>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ------------------------------------------------------------
export default function AdminEpsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("questions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [overrides, setOverrides] = useLocalStorage<Record<string, Partial<EpsQuestion>>>("kts_eps_overrides", {});
  const [searchQ, setSearchQ] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [filterImage, setFilterImage] = useState<"all" | "has" | "none">("all");
  const [sortBy, setSortBy] = useState<"id" | "topic" | "difficulty">("id");

  // Merge overrides vào questions
  const mergedQuestions = useMemo(() => {
    return epsQuestions.map(q => ({ ...q, ...(overrides[q.id] || {}) }));
  }, [overrides]);

  const filteredQuestions = useMemo(() => {
    let list = mergedQuestions.filter(q => {
      const matchTopic = filterTopic === "all" || q.topic === filterTopic;
      const matchSearch = !searchQ || q.question.includes(searchQ) || q.questionVi.toLowerCase().includes(searchQ.toLowerCase()) || q.id.toLowerCase().includes(searchQ.toLowerCase());
      const matchDiff = filterDifficulty === "all" || q.difficulty === filterDifficulty;
      const matchImg = filterImage === "all" || (filterImage === "has" ? !!q.imageUrl : !q.imageUrl);
      return matchTopic && matchSearch && matchDiff && matchImg;
    });
    if (sortBy === "topic") list = [...list].sort((a, b) => a.topic.localeCompare(b.topic));
    else if (sortBy === "difficulty") {
      const order = { easy: 0, medium: 1, hard: 2 };
      list = [...list].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }
    return list;
  }, [mergedQuestions, filterTopic, searchQ, filterDifficulty, filterImage, sortBy]);

  const handleSaveQuestion = useCallback((id: string, updates: Partial<EpsQuestion>) => {
    setOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...updates } }));
    setEditingId(null);
  }, [setOverrides]);

  const questionsWithImage = mergedQuestions.filter(q => q.imageUrl).length;

  // Dedup vocab stats
  const dedupedVocab = useMemo(() => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    const result = epsVocabulary.filter(item => {
      const key = item.korean.trim().toLowerCase();
      if (seen.has(key)) { dupes.push(item.korean); return false; }
      seen.add(key);
      return true;
    });
    return { result, dupes };
  }, []);

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "questions", label: "Câu h?i EPS", icon: "ri-survey-line" },
    { id: "vocabulary", label: "T? v?ng", icon: "ri-translate-2" },
    { id: "import", label: "Import d? li?u", icon: "ri-upload-line" },
    { id: "vps-guide", label: "Hu?ng d?n VPS", icon: "ri-server-line" },
  ];

  return (
    <DashboardLayout
      title="Admin — Qu?n lý EPS"
      subtitle="Ch?nh s?a ?nh câu h?i, import t? v?ng, c?u hình VPS"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-app-card/50 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={`${tab.icon} text-sm`}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* Questions tab */}
      {activeTab === "questions" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {[
              { label: "T?ng câu h?i", value: epsQuestions.length, color: "app-accent-primary" },
              { label: "Có ?nh", value: questionsWithImage, color: "#34d399" },
              { label: "Chua có ?nh", value: epsQuestions.length - questionsWithImage, color: "#f87171" },
              { label: "D?", value: epsQuestions.filter(q => q.difficulty === "easy").length, color: "#34d399" },
              { label: "Trung bình", value: epsQuestions.filter(q => q.difficulty === "medium").length, color: "#f59e0b" },
              { label: "Khó", value: epsQuestions.filter(q => q.difficulty === "hard").length, color: "#f87171" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-3 mb-5">
            {/* Search */}
            <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5">
              <i className="ri-search-line text-app-text-muted text-sm"></i>
              <input type="text" placeholder="Tìm theo t? khóa, ID câu h?i, n?i dung ti?ng Hàn/Vi?t..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
              {searchQ && (
                <button onClick={() => setSearchQ("")} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>
            {/* Filter row */}
            <div className="flex items-center gap-2 flex-wrap">
              <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="all">T?t c? ch? d?</option>
                {EPS_TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value as typeof filterDifficulty)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="all">M?i d? khó</option>
                <option value="easy">D?</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
              <select value={filterImage} onChange={e => setFilterImage(e.target.value as typeof filterImage)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="all">T?t c? ?nh</option>
                <option value="has">Có ?nh</option>
                <option value="none">Chua có ?nh</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="id">S?p x?p: ID</option>
                <option value="topic">S?p x?p: Ch? d?</option>
                <option value="difficulty">S?p x?p: Ð? khó</option>
              </select>
              <span className="text-app-text-muted text-xs ml-auto">
                {filteredQuestions.length}/{epsQuestions.length} câu
              </span>
              {(searchQ || filterTopic !== "all" || filterDifficulty !== "all" || filterImage !== "all") && (
                <button
                  onClick={() => { setSearchQ(""); setFilterTopic("all"); setFilterDifficulty("all"); setFilterImage("all"); }}
                  className="text-[10px] text-app-accent-primary/60 hover:text-app-accent-primary cursor-pointer whitespace-nowrap border border-app-accent-primary/20 px-2 py-1 rounded-lg"
                >
                  <i className="ri-filter-off-line mr-1"></i>Xóa filter
                </button>
              )}
            </div>
          </div>

          {/* Question list */}
          <div className="space-y-3">
            {filteredQuestions.map(q => {
              const topic = EPS_TOPICS.find(t => t.id === q.topic);
              const isEditing = editingId === q.id;
              return (
                <div key={q.id} className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
                  <div className="flex items-start gap-4 p-4">
                    {/* Image preview */}
                    <div className="w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-app-border">
                      {q.imageUrl ? (
                        <ImageWithFallback
                          src={q.imageUrl}
                          alt={q.imageAlt || q.questionVi}
                          className="w-full h-full object-cover object-top"
                          showPlaceholder
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-app-surface/50">
                          <i className="ri-image-add-line text-app-text-muted text-xl"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-app-text-muted text-[10px] font-mono">#{q.id}</span>
                        {topic && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>{topic.label}</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${q.difficulty === "easy" ? "bg-emerald-500/10 text-app-accent-success" : q.difficulty === "medium" ? "bg-[#f59e0b]/10 text-[#f59e0b]" : "bg-red-500/10 text-red-400"}`}>
                          {q.difficulty === "easy" ? "D?" : q.difficulty === "medium" ? "TB" : "Khó"}
                        </span>
                        {q.imageUrl && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8]"><i className="ri-image-line mr-0.5"></i>Có ?nh</span>}
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{q.question}</p>
                      <p className="text-app-text-muted text-xs italic mt-0.5 line-clamp-1">{q.questionVi}</p>
                    </div>

                    <button
                      onClick={() => setEditingId(isEditing ? null : q.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-colors flex-shrink-0 ${isEditing ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/25" : "bg-app-card/50 text-app-text-secondary hover:text-white/60 border border-app-border"}`}
                    >
                      <i className={`${isEditing ? "ri-close-line" : "ri-image-edit-line"} text-sm`}></i>
                      {isEditing ? "Ðóng" : "S?a ?nh"}
                    </button>
                  </div>

                  {isEditing && (
                    <div className="px-4 pb-4 border-t border-app-border pt-4">
                      <QuestionEditor
                        question={q}
                        onSave={(updates) => handleSaveQuestion(q.id, updates)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vocabulary tab */}
      {activeTab === "vocabulary" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "T?ng t? g?c", value: epsVocabulary.length, color: "app-accent-primary" },
              { label: "Sau khi dedup", value: dedupedVocab.result.length, color: "#34d399" },
              { label: "T? trùng l?p", value: dedupedVocab.dupes.length, color: "#f87171" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {dedupedVocab.dupes.length > 0 && (
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4 mb-5">
              <p className="text-app-accent-primary text-sm font-semibold mb-2"><i className="ri-skip-forward-line mr-2"></i>T? trùng l?p dã t? d?ng b? qua</p>
              <p className="text-app-text-secondary text-xs">{dedupedVocab.dupes.join(", ")}</p>
            </div>
          )}

          <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
              <p className="text-white/60 text-sm font-medium">Danh sách t? v?ng ({dedupedVocab.result.length})</p>
              <p className="text-app-text-muted text-xs">Phân theo ch? d?</p>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {EPS_VOCAB_TOPICS.map(topic => {
                const topicItems = dedupedVocab.result.filter(v => v.topicId === topic.id);
                if (topicItems.length === 0) return null;
                return (
                  <div key={topic.id} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <i className={`${topic.icon} text-sm`} style={{ color: topic.color }}></i>
                      <span className="text-xs font-bold" style={{ color: topic.color }}>{topic.label}</span>
                      <span className="text-app-text-muted text-[10px]">({topicItems.length} t?)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topicItems.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5 bg-app-surface/50 border border-app-border rounded-lg px-2.5 py-1.5">
                          <span className="text-white/70 text-xs font-bold">{v.korean}</span>
                          <span className="text-app-text-muted text-[10px]">{v.vietnamese}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "import" && <ImportPanel />}
      {activeTab === "vps-guide" && <VpsGuide />}
    </DashboardLayout>
  );
}

