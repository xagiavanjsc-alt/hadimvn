import { useState, useMemo, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useAudioCache } from "@/hooks/useAudioCache";
import { type EpsVocabItem, type EpsVocabTopic } from "@/mocks/epsVocabulary";
import { EpsVocabProvider, useEpsVocab, useEpsVocabLoading } from "@/contexts/EpsVocabContext";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA, SITE_HOST } from "@/lib/siteConfig";

// ─── PDF Export ───────────────────────────────────────────────────────────
function exportToPDF(items: EpsVocabItem[], topicId: string, topics: EpsVocabTopic[]) {
  const topicLabel = topics.find(t => t.id === topicId)?.label || "Tất cả chủ đề";
  const date = new Date().toLocaleDateString("vi-VN");

  const rows = items.map((item, i) => {
    const topic = topics.find(t => t.id === item.topicId);
    return `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:12px">${i + 1}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:18px;font-weight:700;color:#111">${item.korean}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:12px;color:#374151">${item.pronunciation}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#1f2937">${item.vietnamese}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:11px;color:#6b7280">${item.example || ""}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:11px;color:#9ca3af">${topic?.label || ""}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Từ vựng EPS-TOPIK — ${topicLabel}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Noto Sans KR', Arial, sans-serif; padding: 24px; color: #111; }
  h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #1f2937; color: #fff; padding: 10px; text-align: left; font-size: 12px; border: 1px solid #374151; }
  tr:hover { background: #fffbeb !important; }
  .footer { margin-top: 16px; text-align: center; color: #9ca3af; font-size: 11px; }
  @media print {
    body { padding: 12px; }
    button { display: none; }
  }
</style>
</head>
<body>
<h1>Từ vựng EPS-TOPIK</h1>
<p class="meta">Chủ đề: ${topicLabel} &nbsp;·&nbsp; ${items.length} từ &nbsp;·&nbsp; Xuất ngày ${date} &nbsp;·&nbsp; ${SITE_HOST}</p>
<table>
  <thead>
    <tr>
      <th style="width:40px">#</th>
      <th style="width:120px">Tiếng Hàn</th>
      <th style="width:110px">Phiên âm</th>
      <th style="width:140px">Tiếng Việt</th>
      <th>Ví dụ</th>
      <th style="width:110px">Chủ đề</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<p class="footer">Hàn Quốc Ơi! — Học tiếng Hàn cùng cộng đồng · ${SITE_HOST}</p>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ─── Dedup helper ─────────────────────────────────────────────────────────
function deduplicateVocab(items: EpsVocabItem[]): EpsVocabItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.korean.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const LEVEL_COLORS = { basic: "#34d399", intermediate: "#e8c84a", advanced: "#f87171" };
const LEVEL_LABELS = { basic: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };

// ─── Flashcard Modal ──────────────────────────────────────────────────────
function FlashcardModal({
  items, startIdx, onClose, masteredIds, onMaster,
}: {
  items: EpsVocabItem[]; startIdx: number; onClose: () => void;
  masteredIds: string[]; onMaster: (id: string) => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [flipped, setFlipped] = useState(false);
  const { playKorean } = useAudioCache();
  const { topics } = useEpsVocab();
  const card = items[idx];

  useEffect(() => { setFlipped(false); }, [idx]);

  if (!card) return null;

  const topic = topics.find(t => t.id === card.topicId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {topic && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>{topic.label}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[card.level]}15`, color: LEVEL_COLORS[card.level] }}>{LEVEL_LABELS[card.level]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-app-text-muted text-xs">{idx + 1}/{items.length}</span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-app-card/50 cursor-pointer"><i className="ri-close-line text-app-text-secondary"></i></button>
          </div>
        </div>

        {/* Card flip */}
        <div className="cursor-pointer select-none mb-4" style={{ perspective: "1000px" }} onClick={() => setFlipped(f => !f)}>
          <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", height: "200px" }}>
            <div className="absolute inset-0 rounded-xl border border-app-border bg-[#13161e] flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: "hidden" }}>
              <p className="text-4xl font-bold text-white mb-2">{card.korean}</p>
              <p className="text-app-text-muted text-sm font-mono">[{card.reading}]</p>
              <button
                onClick={e => { e.stopPropagation(); playKorean(card.korean); }}
                className="mt-3 text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer bg-app-card/50 px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                <i className="ri-volume-up-line mr-1"></i>Nghe
              </button>
              <p className="mt-4 text-white/15 text-[10px]">Nhấn để xem nghĩa</p>
            </div>
            <div className="absolute inset-0 rounded-xl border border-app-accent-primary/20 bg-[#13161e] flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <p className="text-2xl font-bold text-app-accent-primary mb-2">{card.vietnamese}</p>
              <p className="text-app-text-secondary text-xs leading-relaxed">{card.exampleVi}</p>
              <p className="text-app-text-muted text-[10px] mt-2 italic">{card.example}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { if (idx > 0) setIdx(i => i - 1); }} disabled={idx === 0} className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm disabled:opacity-30 hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"><i className="ri-arrow-left-line"></i></button>
          <button onClick={() => onMaster(card.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${masteredIds.includes(card.id) ? "bg-app-accent-success/15 text-app-accent-success border border-emerald-500/25" : "bg-app-card/50 text-white/50 border border-app-border hover:bg-white/8"}`}>
            {masteredIds.includes(card.id) ? "✓ Đã thuộc" : "Đánh dấu thuộc"}
          </button>
          <button onClick={() => { if (idx < items.length - 1) setIdx(i => i + 1); }} disabled={idx === items.length - 1} className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm disabled:opacity-30 hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"><i className="ri-arrow-right-line"></i></button>
        </div>
      </div>
    </div>
  );
}

// ─── Vocab Card ───────────────────────────────────────────────────────────
function EpsVocabCard({
  item, isMastered, onMaster, onFlashcard,
}: {
  item: EpsVocabItem; isMastered: boolean;
  onMaster: (id: string) => void; onFlashcard: () => void;
}) {
  const [showExample, setShowExample] = useState(false);
  const { playKorean } = useAudioCache();
  const { topics } = useEpsVocab();
  const topic = topics.find(t => t.id === item.topicId);

  return (
    <div className={`bg-app-bg border rounded-xl p-4 transition-all ${isMastered ? "border-emerald-500/20" : "border-app-border hover:border-app-border"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white font-bold text-xl">{item.korean}</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[item.level]}15`, color: LEVEL_COLORS[item.level] }}>{LEVEL_LABELS[item.level]}</span>
          </div>
          <p className="text-app-text-muted text-xs font-mono">[{item.reading}]</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => playKorean(item.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors">
            <i className="ri-volume-up-line text-app-text-secondary text-xs"></i>
          </button>
          <button onClick={onFlashcard} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors">
            <i className="ri-stack-line text-app-text-secondary text-xs"></i>
          </button>
          <button onClick={() => onMaster(item.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${isMastered ? "bg-app-accent-success/15" : "bg-app-card/50 hover:bg-app-card/70"}`}>
            <i className={`${isMastered ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-checkbox-blank-circle-line text-app-text-muted"} text-xs`}></i>
          </button>
        </div>
      </div>
      <p className="text-app-accent-primary text-sm font-semibold mb-2">{item.vietnamese}</p>
      {topic && (
        <div className="flex items-center gap-1 mb-2">
          <i className={`${topic.icon} text-[10px]`} style={{ color: topic.color }}></i>
          <span className="text-[10px]" style={{ color: topic.color }}>{topic.label}</span>
        </div>
      )}
      <button onClick={() => setShowExample(s => !s)} className="text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer transition-colors whitespace-nowrap">
        {showExample ? "Ẩn ví dụ" : "Xem ví dụ"}
        <i className={`${showExample ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} ml-1`}></i>
      </button>
      {showExample && (
        <div className="mt-2 bg-app-surface/50 rounded-lg p-2.5">
          <p className="text-white/50 text-xs">{item.example}</p>
          <p className="text-app-text-muted text-[10px] italic mt-0.5">{item.exampleVi}</p>
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 32;

// ─── Main Page ────────────────────────────────────────────────────────────
function EpsVocabularyPageInner() {
  const { user } = useAuth();
  const { items: epsVocabulary, topics: EPS_VOCAB_TOPICS } = useEpsVocab();
  const epsLoading = useEpsVocabLoading();
  const DEDUPED_VOCAB = useMemo(() => deduplicateVocab(epsVocabulary), [epsVocabulary]);
  const [masteredIds, setMasteredIds] = useLocalStorage<string[]>("kts_eps_vocab_mastered", []);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  usePageSEO({
    title: "Từ vựng EPS-TOPIK theo chủ đề [Có Audio + Pinyin] | Hàn Quốc Ơi!",
    description: "Học từ vựng EPS-TOPIK chia theo chủ đề. Mỗi từ có nghĩa Việt, ví dụ, audio phát âm chuẩn. Đầy đủ từ vựng cho kỳ thi EPS đi XKLĐ Hàn Quốc.",
    keywords: "từ vựng EPS, từ vựng EPS-TOPIK, từ vựng tiếng Hàn theo chủ đề, từ vựng XKLĐ Hàn Quốc, audio tiếng Hàn",
    path: "/eps-vocabulary",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Từ vựng EPS-TOPIK",
      description: "Bộ từ vựng EPS-TOPIK chia theo chủ đề với audio phát âm.",
      learningResourceType: "Vocabulary",
      educationalLevel: "EPS-TOPIK",
      inLanguage: ["vi", "ko"],
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });
  const [filterMode, setFilterMode] = useState<"all" | "unmastered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [flashcardItem, setFlashcardItem] = useState<{ items: EpsVocabItem[]; startIdx: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [selectedTopic, selectedLevel, filterMode, searchQuery]);

  // Load mastered from Supabase
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase.from("study_progress").select("eps_vocab_mastered").eq("user_id", user.id).maybeSingle()
      .then(
        ({ data, error }) => {
          if (cancelled || error) return;
          if (data?.eps_vocab_mastered && Array.isArray(data.eps_vocab_mastered) && (data.eps_vocab_mastered as string[]).length > 0) {
            setMasteredIds(data.eps_vocab_mastered as string[]);
          }
        },
        () => { /* network error — keep local state */ }
      );
    return () => { cancelled = true; };
  }, [user?.id]);

  const syncToCloud = useCallback(async (ids: string[]) => {
    if (!user) return;
    setSyncStatus("saving");
    await supabase.from("study_progress").upsert(
      { user_id: user.id, eps_vocab_mastered: ids, updated_at: new Date().toISOString() } as Record<string, unknown>,
      { onConflict: "user_id" }
    );
    setSyncStatus("saved");
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [user]);

  const handleMaster = useCallback((id: string) => {
    setMasteredIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      syncToCloud(next);
      return next;
    });
  }, [syncToCloud]);

  const filteredItems = useMemo(() => {
    return DEDUPED_VOCAB.filter(v => {
      const matchTopic = selectedTopic === "all" || v.topicId === selectedTopic;
      const matchLevel = selectedLevel === "all" || v.level === selectedLevel;
      const matchFilter = filterMode === "all" || !masteredIds.includes(v.id);
      const matchSearch = !searchQuery || v.korean.includes(searchQuery) || v.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) || v.reading.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTopic && matchLevel && matchFilter && matchSearch;
    });
  }, [selectedTopic, selectedLevel, filterMode, masteredIds, searchQuery, DEDUPED_VOCAB]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  // Clamp page when total shrinks (e.g. filter narrowed; Supabase swapped in).
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pagedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFlashcard = (item: EpsVocabItem) => {
    const idx = filteredItems.findIndex(v => v.id === item.id);
    setFlashcardItem({ items: filteredItems, startIdx: Math.max(0, idx) });
  };

  const totalMastered = masteredIds.filter(id => DEDUPED_VOCAB.some(v => v.id === id)).length;
  const overallPct = DEDUPED_VOCAB.length > 0 ? Math.round((totalMastered / DEDUPED_VOCAB.length) * 100) : 0;

  // Topic stats
  const topicStats = useMemo(() => {
    const stats: Record<string, { total: number; mastered: number }> = {};
    EPS_VOCAB_TOPICS.forEach(t => {
      const items = DEDUPED_VOCAB.filter(v => v.topicId === t.id);
      stats[t.id] = { total: items.length, mastered: items.filter(v => masteredIds.includes(v.id)).length };
    });
    return stats;
  }, [masteredIds, EPS_VOCAB_TOPICS, DEDUPED_VOCAB]);

  return (
    <DashboardLayout
      title="Từ vựng EPS-TOPIK"
      subtitle={epsLoading ? "Đang đồng bộ từ vựng mới…" : `${DEDUPED_VOCAB.length} từ chuẩn theo chủ đề thực tế — không trùng lặp, có phát âm`}
      actions={
        <div className="flex items-center gap-3">
          {user && syncStatus !== "idle" && (
            <span className={`text-xs flex items-center gap-1 ${syncStatus === "saving" ? "text-app-text-secondary" : "text-app-accent-success"}`}>
              <i className={`${syncStatus === "saving" ? "ri-loader-4-line animate-spin" : "ri-cloud-line"} text-sm`}></i>
              {syncStatus === "saving" ? "Đang lưu..." : "Đã lưu cloud"}
            </span>
          )}
          <button
            onClick={() => exportToPDF(filteredItems, selectedTopic, EPS_VOCAB_TOPICS)}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-app-card/70 disabled:opacity-40 border border-app-border text-white/70 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-file-pdf-line"></i>Xuất PDF
          </button>
          <button
            onClick={() => setFlashcardItem({ items: filteredItems, startIdx: 0 })}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-line"></i>Học Flashcard ({filteredItems.length})
          </button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng từ EPS", value: DEDUPED_VOCAB.length, icon: "ri-file-list-3-line", color: "#fb923c" },
          { label: "Đã thuộc", value: totalMastered, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Chưa thuộc", value: DEDUPED_VOCAB.length - totalMastered, icon: "ri-time-line", color: "#e8c84a" },
          { label: "Tiến độ", value: `${overallPct}%`, icon: "ri-pie-chart-line", color: "#a78bfa" },
        ].map(stat => (
          <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Topic grid */}
      <div className="mb-5">
        <p className="text-app-text-muted text-[10px] tracking-normal mb-3">Chủ đề</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === "all" ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}
          >
            <i className="ri-apps-line text-xs"></i>Tất cả ({DEDUPED_VOCAB.length})
          </button>
          {EPS_VOCAB_TOPICS.map(topic => {
            const stats = topicStats[topic.id] || { total: 0, mastered: 0 };
            const pct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedTopic === topic.id ? "text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}
                style={selectedTopic === topic.id ? { backgroundColor: topic.color } : {}}
              >
                <i className={`${topic.icon} text-xs`}></i>
                {topic.label} ({stats.total})
                {pct > 0 && <span className="text-[9px] opacity-70">{pct}%</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          {(["all", "basic", "intermediate", "advanced"] as const).map(lv => (
            <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === lv ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>
              {lv === "all" ? "Tất cả" : LEVEL_LABELS[lv]}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          {([["all", "Tất cả"], ["unmastered", "Chưa thuộc"]] as [string, string][]).map(([f, label]) => (
            <button key={f} onClick={() => setFilterMode(f as "all" | "unmastered")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterMode === f ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>{label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2 flex-1 min-w-[180px]">
          <i className="ri-search-line text-app-text-muted text-sm"></i>
          <input type="text" placeholder="Tìm từ vựng EPS..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
        </div>
        <p className="text-app-text-muted text-xs whitespace-nowrap">{filteredItems.length} từ · trang {currentPage}/{totalPages || 1}</p>
      </div>

      {/* Grid */}
      {pagedItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ contentVisibility: "auto", containIntrinsicSize: "0 2000px" }}>
            {pagedItems.map(item => (
              <EpsVocabCard
                key={item.id}
                item={item}
                isMastered={masteredIds.includes(item.id)}
                onMaster={handleMaster}
                onFlashcard={() => handleFlashcard(item)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-app-card/40 hover:bg-app-card/60 disabled:opacity-30 text-white rounded-xl text-sm cursor-pointer"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5
                  ? i + 1
                  : currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                      currentPage === p ? "bg-app-accent-primary text-app-bg" : "bg-app-card/40 hover:bg-app-card/60 text-white/70"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-app-card/40 hover:bg-app-card/60 disabled:opacity-30 text-white rounded-xl text-sm cursor-pointer"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <span className="text-app-text-muted text-sm ml-2">Trang {currentPage}/{totalPages}</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
          <i className="ri-search-line text-app-text-muted text-3xl mb-3 block"></i>
          <p className="text-app-text-muted text-sm">Không tìm thấy từ vựng nào</p>
        </div>
      )}

      {flashcardItem && (
        <FlashcardModal items={flashcardItem.items} startIdx={flashcardItem.startIdx} onClose={() => setFlashcardItem(null)} masteredIds={masteredIds} onMaster={handleMaster} />
      )}
    </DashboardLayout>
  );
}

// ─── Provider wrapper ─────────────────────────────────────────────────────
// Mirrors /flashcard so /eps-vocabulary also reads admin-uploaded entries
// (and their examples) from Supabase instead of the bundled mock.
export default function EpsVocabularyPage() {
  return (
    <EpsVocabProvider>
      <EpsVocabularyPageInner />
    </EpsVocabProvider>
  );
}


