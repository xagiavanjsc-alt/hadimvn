import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface VocabEntry {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  examples: { korean: string; vietnamese: string }[];
  category: string;
  difficulty: number;
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Cơ bản", color: "#34d399" },
  2: { label: "Trung cấp", color: "app-accent-primary" },
  3: { label: "Nâng cao", color: "#f87171" },
};

const CATEGORY_ICONS: Record<string, string> = {
  "Thể thao": "ri-football-line",
  "Vị trí & Địa điểm": "ri-map-pin-line",
  "Địa điểm": "ri-building-line",
  "Đời sống & Cá nhân": "ri-heart-line",
  "Ngoại hình & Cơ thể": "ri-user-smile-line",
  "Học thuật & Xin việc": "ri-briefcase-line",
  "TOPIK I - Cơ bản": "ri-book-open-line",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Thể thao": "#fb923c",
  "Vị trí & Địa điểm": "#34d399",
  "Địa điểm": "#60a5fa",
  "Đời sống & Cá nhân": "#f472b6",
  "Ngoại hình & Cơ thể": "#a78bfa",
  "Học thuật & Xin việc": "app-accent-primary",
  "TOPIK I - Cơ bản": "#38bdf8",
};

interface VocabCardProps {
  entry: VocabEntry;
  onFlip?: () => void;
}

function VocabCard({ entry, onFlip }: VocabCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState(false);
  const diff = DIFFICULTY_LABELS[entry.difficulty] || DIFFICULTY_LABELS[1];
  const color = CATEGORY_COLORS[entry.category] || "app-accent-primary";

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(entry.korean);
      u.lang = "ko-KR";
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      className={`relative rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden group ${
        learned ? "opacity-60" : "hover:scale-[1.02]"
      }`}
      style={{
        backgroundColor: flipped ? `${color}10` : "rgba(255,255,255,0.03)",
        borderColor: flipped ? `${color}30` : "rgba(255,255,255,0.07)",
      }}
      onClick={() => setFlipped(v => !v)}
    >
      {/* Learned badge */}
      {learned && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20">
          <i className="ri-check-line text-app-accent-success text-[10px]"></i>
        </div>
      )}

      <div className="p-4">
        {!flipped ? (
          <>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-bold text-xl leading-tight">{entry.korean}</p>
                {entry.hanja && <p className="text-app-text-muted text-xs mt-0.5">{entry.hanja}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={speak}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <i className="ri-volume-up-line text-xs" style={{ color }}></i>
                </button>
              </div>
            </div>
            <p className="text-app-text-secondary text-xs font-mono">{entry.pronunciation}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${diff.color}15`, color: diff.color }}>
                {diff.label}
              </span>
              <span className="text-app-text-muted text-[10px]">Nhấn để xem nghĩa</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-white/50 text-xs mb-1">{entry.korean} · {entry.pronunciation}</p>
            <p className="font-bold text-lg mb-2" style={{ color }}>{entry.vietnamese}</p>
            {entry.examples?.[0] && (
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: `${color}08`, border: `1px solid ${color}15` }}>
                <p className="text-white/70 text-xs mb-1">{entry.examples[0].korean}</p>
                <p className="text-app-text-secondary text-[11px]">{entry.examples[0].vietnamese}</p>
              </div>
            )}
            <button
              onClick={e => { e.stopPropagation(); setLearned(v => !v); }}
              className="w-full py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: learned ? "rgba(52,211,153,0.15)" : `${color}15`,
                color: learned ? "#34d399" : color,
                border: `1px solid ${learned ? "rgba(52,211,153,0.25)" : `${color}25`}`,
              }}
            >
              {learned ? "✓ Đã thuộc" : "Đánh dấu đã thuộc"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VocabByTopicPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"default" | "difficulty" | "alpha">("default");
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Load categories + counts
  useEffect(() => {
    supabase
      .from("hanja_vocab_entries")
      .select("category")
      .then(({ data }) => {
        if (!data) return;
        const catMap: Record<string, number> = {};
        data.forEach(r => {
          catMap[r.category] = (catMap[r.category] || 0) + 1;
        });
        setCategories(Object.keys(catMap).sort());
        setCounts(catMap);
      });
  }, []);

  // Load vocab
  const loadVocab = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("hanja_vocab_entries").select("*");
    if (selectedCategory !== "all") query = query.eq("category", selectedCategory);
    if (selectedDifficulty > 0) query = query.eq("difficulty", selectedDifficulty);
    const { data } = await query.order("created_at", { ascending: false });
    setVocab(data || []);
    setLoading(false);
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => { loadVocab(); }, [loadVocab]);

  const filtered = vocab.filter(v =>
    !search ||
    v.korean.includes(search) ||
    v.vietnamese.toLowerCase().includes(search.toLowerCase()) ||
    v.pronunciation.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "difficulty") return a.difficulty - b.difficulty;
    if (sortBy === "alpha") return a.korean.localeCompare(b.korean);
    return 0;
  });

  const totalCount = Object.values(counts).reduce((s, c) => s + c, 0);

  return (
    <DashboardLayout
      title="Từ vựng theo chủ đề"
      subtitle="Khám phá từ vựng được phân loại theo chủ đề từ Supabase"
    >
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-app-accent-primary text-app-bg"
              : "bg-app-card/50 text-white/50 hover:text-white/80 hover:bg-white/8"
          }`}
        >
          <i className="ri-apps-line text-sm"></i>
          Tất cả
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${selectedCategory === "all" ? "bg-app-bg/20 text-app-bg" : "bg-app-card/70 text-app-text-secondary"}`}>
            {totalCount}
          </span>
        </button>
        {categories.map(cat => {
          const color = CATEGORY_COLORS[cat] || "app-accent-primary";
          const icon = CATEGORY_ICONS[cat] || "ri-book-line";
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: isActive ? `${color}20` : "rgba(255,255,255,0.04)",
                color: isActive ? color : "rgba(255,255,255,0.5)",
                border: `1px solid ${isActive ? `${color}40` : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <i className={`${icon} text-sm`}></i>
              {cat}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${color}15`, color }}>
                {counts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white/4 border border-app-border rounded-xl px-4 py-2.5">
          <i className="ri-search-line text-app-text-muted text-sm"></i>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm từ vựng..."
            className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="cursor-pointer">
              <i className="ri-close-line text-app-text-muted text-sm"></i>
            </button>
          )}
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-1 bg-white/4 border border-app-border rounded-xl p-1">
          {[
            { val: 0, label: "Tất cả" },
            { val: 1, label: "Cơ bản" },
            { val: 2, label: "Trung cấp" },
            { val: 3, label: "Nâng cao" },
          ].map(d => (
            <button
              key={d.val}
              onClick={() => setSelectedDifficulty(d.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedDifficulty === d.val ? "bg-app-card/70 text-white/80" : "text-white/35 hover:text-white/60"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as "default" | "difficulty" | "alpha")}
          className="bg-white/4 border border-app-border rounded-xl px-3 py-2.5 text-white/60 text-sm outline-none cursor-pointer"
        >
          <option value="default">Mặc định</option>
          <option value="difficulty">Theo độ khó</option>
          <option value="alpha">A-Z</option>
        </select>

        {/* View mode */}
        <div className="flex items-center gap-1 bg-white/4 border border-app-border rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === "grid" ? "bg-app-card/70 text-white/80" : "text-app-text-muted"}`}
          >
            <i className="ri-grid-line text-sm"></i>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === "list" ? "bg-app-card/70 text-white/80" : "text-app-text-muted"}`}
          >
            <i className="ri-list-check text-sm"></i>
          </button>
        </div>

        <span className="text-app-text-muted text-sm whitespace-nowrap">{sorted.length} từ</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
            <p className="text-app-text-muted text-sm">Đang tải từ vựng...</p>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/4">
            <i className="ri-search-line text-2xl text-app-text-muted"></i>
          </div>
          <p className="text-app-text-secondary text-sm">Không tìm thấy từ vựng nào</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sorted.map(entry => (
            <VocabCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => {
            const color = CATEGORY_COLORS[entry.category] || "app-accent-primary";
            const diff = DIFFICULTY_LABELS[entry.difficulty] || DIFFICULTY_LABELS[1];
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-app-border"
                style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <i className={`${CATEGORY_ICONS[entry.category] || "ri-book-line"} text-base`} style={{ color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-bold text-base">{entry.korean}</span>
                    {entry.hanja && <span className="text-app-text-muted text-xs">{entry.hanja}</span>}
                    <span className="text-white/35 text-xs font-mono">{entry.pronunciation}</span>
                  </div>
                  <p className="text-white/60 text-sm">{entry.vietnamese}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diff.color}15`, color: diff.color }}>{diff.label}</span>
                  <button
                    onClick={() => {
                      if ("speechSynthesis" in window) {
                        const u = new SpeechSynthesisUtterance(entry.korean);
                        u.lang = "ko-KR";
                        window.speechSynthesis.speak(u);
                      }
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-white/8"
                  >
                    <i className="ri-volume-up-line text-app-text-muted text-sm"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
