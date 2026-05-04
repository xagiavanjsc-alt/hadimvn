/**
 * Admin EPS page — dùng AdminLayout (rose theme)
 * Re-export từ admin-eps/page.tsx nhưng thay DashboardLayout → AdminLayout
 */
import { useState, useMemo, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions, EPS_TOPICS, type EpsQuestion } from "@/mocks/epsQuestions";
import { epsVocabulary, EPS_VOCAB_TOPICS, type EpsVocabItem } from "@/mocks/epsVocabulary";
import ImageWithFallback from "@/components/base/ImageWithFallback";
import VirtualList from "@/components/base/VirtualList";

type AdminTab = "questions" | "vocabulary" | "import" | "vps-guide";

function QuestionEditor({ question, onSave, onCancel }: {
  question: EpsQuestion;
  onSave: (updated: Partial<EpsQuestion>) => void;
  onCancel: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(question.imageUrl || "");
  const [imageAlt, setImageAlt] = useState(question.imageAlt || "");
  const [imageCaption, setImageCaption] = useState(question.imageCaption || "");

  return (
    <div className="bg-app-bg border border-rose-500/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <i className="ri-image-edit-line text-rose-400"></i>
        <h3 className="text-white font-semibold text-sm">Chỉnh sửa ảnh — Câu {question.id}</h3>
      </div>
      <div className="bg-app-surface/50 rounded-xl p-3 mb-3">
        <p className="text-white/60 text-xs font-medium mb-1">{question.question}</p>
        <p className="text-app-text-muted text-[10px] italic">{question.questionVi}</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-app-text-secondary text-xs mb-1 block">URL ảnh minh họa</label>
          <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="https://img.hadim.vn/eps/safety/helmet-01.jpg"
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-sm outline-none focus:border-rose-400/40 placeholder-white/20" />
        </div>
        <div>
          <label className="text-app-text-secondary text-xs mb-1 block">Alt text</label>
          <input type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)}
            placeholder="Mô tả ngắn về ảnh..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-sm outline-none focus:border-rose-400/40 placeholder-white/20" />
        </div>
        <div>
          <label className="text-app-text-secondary text-xs mb-1 block">Chú thích ảnh</label>
          <input type="text" value={imageCaption} onChange={e => setImageCaption(e.target.value)}
            placeholder="Hình ảnh: Thiết bị bảo hộ..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-sm outline-none focus:border-rose-400/40 placeholder-white/20" />
        </div>
      </div>
      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-app-border">
          <p className="text-app-text-muted text-[10px] px-3 py-1.5 bg-app-surface/50 border-b border-app-border">Xem trước ảnh</p>
          <ImageWithFallback src={imageUrl} alt={imageAlt || "Preview"} className="w-full object-cover object-top" style={{ maxHeight: "180px" }} caption={imageCaption} placeholderText="URL ảnh không hợp lệ" />
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors">Hủy</button>
        <button onClick={() => onSave({ imageUrl: imageUrl || undefined, imageAlt: imageAlt || undefined, imageCaption: imageCaption || undefined })}
          className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-save-line mr-2"></i>Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

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
      if (i === 0 && line.toLowerCase().includes("korean")) return;
      const parts = line.split("\t").map(p => p.trim());
      if (parts.length < 4) { errors.push(`Dòng ${i + 1}: Thiếu cột`); return; }
      const [korean, reading, vietnamese, topicId, level, example, exampleVi] = parts;
      const key = korean.toLowerCase();
      if (existingKorean.has(key) || seenInImport.has(key)) { dupes.push(korean); return; }
      seenInImport.add(key);
      const validTopics = EPS_VOCAB_TOPICS.map(t => t.id);
      if (!validTopics.includes(topicId)) { errors.push(`Dòng ${i + 1}: topicId "${topicId}" không hợp lệ`); return; }
      valid.push({ id: `import_${Date.now()}_${i}`, korean, reading: reading || "", vietnamese, topicId, level: (["basic", "intermediate", "advanced"].includes(level) ? level : "basic") as EpsVocabItem["level"], example: example || `${korean}을/를 사용해요.`, exampleVi: exampleVi || `Sử dụng ${korean}.` });
    });
    setParseResult({ valid, dupes, errors });
  }, []);

  const sampleCSV = `korean\treading\tvietnamese\ttopicId\tlevel\texample\texampleVi\n작업장\tjageopjang\tNơi làm việc\tworkplace\tbasic\t작업장에서 안전을 지켜요.\tGiữ an toàn tại nơi làm việc.`;

  return (
    <div className="space-y-5">
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3"><i className="ri-upload-line text-rose-400 mr-2"></i>Import từ vựng (TSV/CSV)</h3>
        <div className="bg-app-surface/50 rounded-xl p-3 mb-4 border border-app-border">
          <p className="text-app-text-muted text-[10px] mb-2 font-medium">Format chuẩn:</p>
          <pre className="text-rose-400/70 text-[10px] font-mono leading-relaxed overflow-x-auto">{sampleCSV}</pre>
          <button onClick={() => { setImportText(sampleCSV); setParseResult(null); }} className="mt-2 text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer whitespace-nowrap">
            <i className="ri-file-copy-line mr-1"></i>Dùng dữ liệu mẫu
          </button>
        </div>
        <textarea value={importText} onChange={e => { setImportText(e.target.value); setParseResult(null); }}
          placeholder="Dán dữ liệu TSV vào đây..." rows={8} maxLength={50000}
          className="w-full bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5 text-white/70 text-xs font-mono outline-none focus:border-rose-400/40 placeholder-white/20 resize-none" />
        <div className="flex gap-3 mt-3">
          <button onClick={() => parseCSV(importText)} disabled={!importText.trim()}
            className="flex-1 py-2.5 rounded-xl bg-white/8 border border-app-border text-white/60 text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-white/12 disabled:opacity-40 transition-colors">
            <i className="ri-eye-line mr-2"></i>Kiểm tra dữ liệu
          </button>
          {parseResult && parseResult.valid.length > 0 && (
            <button onClick={() => alert(`Cần kết nối Supabase để import ${parseResult.valid.length} từ mới.`)}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-add-line mr-2"></i>Import {parseResult.valid.length} từ
            </button>
          )}
        </div>
      </div>
      {parseResult && (
        <div className="space-y-3">
          {parseResult.valid.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-app-accent-success text-sm font-semibold mb-2"><i className="ri-checkbox-circle-line mr-2"></i>{parseResult.valid.length} từ hợp lệ</p>
            </div>
          )}
          {parseResult.dupes.length > 0 && (
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/20 rounded-xl p-4">
              <p className="text-app-accent-primary text-sm font-semibold mb-2"><i className="ri-skip-forward-line mr-2"></i>{parseResult.dupes.length} từ trùng lặp</p>
              <p className="text-app-text-secondary text-xs">{parseResult.dupes.join(", ")}</p>
            </div>
          )}
          {parseResult.errors.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm font-semibold mb-2"><i className="ri-error-warning-line mr-2"></i>{parseResult.errors.length} lỗi</p>
              {parseResult.errors.map((e, i) => <p key={i} className="text-red-400/70 text-xs">{e}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VpsGuide() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const nginxConfig = `server {\n    listen 80;\n    server_name img.hadim.vn;\n    root /var/www/img.hadim.vn;\n    add_header Access-Control-Allow-Origin *;\n    add_header Cache-Control "public, max-age=31536000";\n    location / { try_files $uri $uri/ =404; }\n}`;
  const folderStructure = `/var/www/img.hadim.vn/\n├── eps/\n│   ├── safety/\n│   ├── greeting/\n│   ├── workplace/\n│   ├── daily/\n│   ├── emergency/\n│   ├── culture/\n│   ├── law/\n│   ├── listening/\n│   └── reading/`;
  return (
    <div className="space-y-5">
      {[
        { label: "Cấu trúc thư mục", key: "folder", code: folderStructure, color: "text-app-accent-success" },
        { label: "Nginx config (CORS)", key: "nginx", code: nginxConfig, color: "text-sky-400" },
      ].map(cfg => (
        <div key={cfg.key} className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">{cfg.label}</h3>
            <button onClick={() => copy(cfg.code, cfg.key)} className="flex items-center gap-1 text-[10px] text-app-text-muted hover:text-rose-400/70 cursor-pointer whitespace-nowrap transition-colors">
              <i className={copied === cfg.key ? "ri-check-line text-app-accent-success" : "ri-clipboard-line"}></i>
              {copied === cfg.key ? "Đã copy" : "Copy"}
            </button>
          </div>
          <pre className={`bg-black/40 rounded-xl p-4 ${cfg.color} text-[10px] font-mono leading-relaxed overflow-x-auto`}>{cfg.code}</pre>
        </div>
      ))}
    </div>
  );
}

export default function AdminEpsNewPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("questions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [overrides, setOverrides] = useLocalStorage<Record<string, Partial<EpsQuestion>>>("kts_eps_overrides", {});
  const [searchQ, setSearchQ] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [filterImage, setFilterImage] = useState<"all" | "has" | "none">("all");
  const [sortBy, setSortBy] = useState<"id" | "topic" | "difficulty">("id");

  const mergedQuestions = useMemo(() => epsQuestions.map(q => ({ ...q, ...(overrides[q.id] || {}) })), [overrides]);

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
    { id: "questions", label: "Câu hỏi EPS", icon: "ri-survey-line" },
    { id: "vocabulary", label: "Từ vựng", icon: "ri-translate-2" },
    { id: "import", label: "Import dữ liệu", icon: "ri-upload-line" },
    { id: "vps-guide", label: "Hướng dẫn VPS", icon: "ri-server-line" },
  ];

  return (
    <AdminLayout title="Quản lý EPS" subtitle="Chỉnh sửa ảnh câu hỏi, import từ vựng, cấu hình VPS">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-app-card/50 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-rose-500 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
            <i className={`${tab.icon} text-sm`}></i>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "questions" && (
        <div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {[
              { label: "Tổng câu hỏi", value: epsQuestions.length, color: "app-accent-primary" },
              { label: "Có ảnh", value: questionsWithImage, color: "#34d399" },
              { label: "Chưa có ảnh", value: epsQuestions.length - questionsWithImage, color: "#f87171" },
              { label: "Dễ", value: epsQuestions.filter(q => q.difficulty === "easy").length, color: "#34d399" },
              { label: "Trung bình", value: epsQuestions.filter(q => q.difficulty === "medium").length, color: "#f59e0b" },
              { label: "Khó", value: epsQuestions.filter(q => q.difficulty === "hard").length, color: "#f87171" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5">
              <i className="ri-search-line text-app-text-muted text-sm"></i>
              <input type="text" placeholder="Tìm theo từ khóa, ID câu hỏi..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
              {searchQ && <button onClick={() => setSearchQ("")} className="text-app-text-muted hover:text-white/60 cursor-pointer"><i className="ri-close-line text-sm"></i></button>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="all">Tất cả chủ đề</option>
                {EPS_TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value as typeof filterDifficulty)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="all">Mọi độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
              <select value={filterImage} onChange={e => setFilterImage(e.target.value as typeof filterImage)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="all">Tất cả ảnh</option>
                <option value="has">Có ảnh</option>
                <option value="none">Chưa có ảnh</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-app-card/50 border border-app-border rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none cursor-pointer">
                <option value="id">Sắp xếp: ID</option>
                <option value="topic">Sắp xếp: Chủ đề</option>
                <option value="difficulty">Sắp xếp: Độ khó</option>
              </select>
              <span className="text-app-text-muted text-xs ml-auto">{filteredQuestions.length}/{epsQuestions.length} câu</span>
            </div>
          </div>

          {/* Virtual scroll question list */}
          <VirtualList
            items={filteredQuestions}
            itemHeight={120}
            containerHeight={520}
            overscan={6}
            className="rounded-2xl"
            renderItem={(q: unknown) => {
              const question = q as EpsQuestion;
              const topic = EPS_TOPICS.find(t => t.id === question.topic);
              const isEditing = editingId === question.id;
              return (
                <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden h-full">
                  <div className="flex items-start gap-4 p-4 h-full">
                    <div className="w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-app-border">
                      {question.imageUrl ? (
                        <ImageWithFallback src={question.imageUrl} alt={question.imageAlt || question.questionVi} className="w-full h-full object-cover object-top" showPlaceholder />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-app-surface/50">
                          <i className="ri-image-add-line text-app-text-muted text-xl"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-app-text-muted text-[10px] font-mono">#{question.id}</span>
                        {topic && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>{topic.label}</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${question.difficulty === "easy" ? "bg-emerald-500/10 text-app-accent-success" : question.difficulty === "medium" ? "bg-[#f59e0b]/10 text-[#f59e0b]" : "bg-red-500/10 text-red-400"}`}>
                          {question.difficulty === "easy" ? "Dễ" : question.difficulty === "medium" ? "TB" : "Khó"}
                        </span>
                        {question.imageUrl && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8]"><i className="ri-image-line mr-0.5"></i>Có ảnh</span>}
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{question.question}</p>
                      <p className="text-app-text-muted text-xs italic mt-0.5 line-clamp-1">{question.questionVi}</p>
                    </div>
                    <button onClick={() => setEditingId(isEditing ? null : question.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-colors flex-shrink-0 ${isEditing ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "bg-app-card/50 text-app-text-secondary hover:text-white/60 border border-app-border"}`}>
                      <i className={`${isEditing ? "ri-close-line" : "ri-image-edit-line"} text-sm`}></i>
                      {isEditing ? "Đóng" : "Sửa ảnh"}
                    </button>
                  </div>
                  {isEditing && (
                    <div className="px-4 pb-4 border-t border-app-border pt-4">
                      <QuestionEditor question={question} onSave={updates => handleSaveQuestion(question.id, updates)} onCancel={() => setEditingId(null)} />
                    </div>
                  )}
                </div>
              );
            }}
            emptyState={
              <div className="text-center py-16 text-app-text-muted">
                <i className="ri-search-line text-3xl mb-3 block"></i>
                <p className="text-sm">Không tìm thấy câu hỏi nào</p>
              </div>
            }
          />
        </div>
      )}

      {activeTab === "vocabulary" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Tổng từ gốc", value: epsVocabulary.length, color: "app-accent-primary" },
              { label: "Sau khi dedup", value: dedupedVocab.result.length, color: "#34d399" },
              { label: "Từ trùng lặp", value: dedupedVocab.dupes.length, color: "#f87171" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-app-border">
              <p className="text-white/60 text-sm font-medium">Danh sách từ vựng ({dedupedVocab.result.length})</p>
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
                      <span className="text-app-text-muted text-[10px]">({topicItems.length} từ)</span>
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
    </AdminLayout>
  );
}

