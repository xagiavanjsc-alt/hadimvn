import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

// --- Types --------------------------------------------------------------------
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

interface WrongRecord {
  korean: string;
  count: number;
  lastSeen: string;
  category?: string;
}

interface SuggestionGroup {
  reason: string;
  icon: string;
  color: string;
  words: VocabEntry[];
}

// --- Difficulty label ---------------------------------------------------------
const diffLabel = (d: number) => d === 1 ? "Co b?n" : d === 2 ? "Trung c?p" : "Nâng cao";
const diffColor = (d: number) => d === 1 ? "#34d399" : d === 2 ? "app-accent-primary" : "#f87171";

// --- Vocab Card ---------------------------------------------------------------
function VocabCard({ word, isFlipped, onFlip, onMastered, isMastered }: {
  word: VocabEntry;
  isFlipped: boolean;
  onFlip: () => void;
  onMastered: () => void;
  isMastered: boolean;
}) {
  return (
    <div
      className={`relative bg-app-bg border rounded-2xl p-5 cursor-pointer transition-all hover:border-white/15 ${
        isMastered ? "opacity-50 border-app-border" : "border-app-border"
      }`}
      onClick={onFlip}
    >
      {isMastered && (
        <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/20">
          <i className="ri-check-line text-app-accent-success text-xs"></i>
        </div>
      )}

      {!isFlipped ? (
        /* Front */
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-white font-bold text-2xl">{word.korean}</p>
              {word.hanja && word.hanja !== word.korean && (
                <p className="text-app-text-muted text-xs mt-0.5">{word.hanja}</p>
              )}
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted flex-shrink-0">{word.category}</span>
          </div>
          <p className="text-app-text-muted text-xs">[{word.pronunciation}]</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diffColor(word.difficulty)}15`, color: diffColor(word.difficulty) }}>
              {diffLabel(word.difficulty)}
            </span>
            <span className="text-app-text-muted text-[10px]">Nh?n d? xem nghia</span>
          </div>
        </div>
      ) : (
        /* Back */
        <div>
          <p className="text-white font-bold text-lg mb-1">{word.vietnamese}</p>
          <p className="text-app-text-secondary text-xs mb-3">[{word.pronunciation}]</p>
          {word.examples?.[0] && (
            <div className="bg-app-surface/50 rounded-xl p-3 mb-3">
              <p className="text-white/70 text-xs">{word.examples[0].korean}</p>
              <p className="text-white/35 text-xs mt-1">{word.examples[0].vietnamese}</p>
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); onMastered(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              isMastered
                ? "bg-app-card/50 text-app-text-muted"
                : "bg-app-accent-success/15 text-app-accent-success hover:bg-emerald-500/25"
            }`}
          >
            <i className={isMastered ? "ri-close-line" : "ri-check-line"}></i>
            {isMastered ? "B? dánh d?u" : "Ðã thu?c"}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function VocabSuggestionPage() {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [masteredWords, setMasteredWords] = useLocalStorage<string[]>("kts_mastered_vocab", []);
  const [wrongHistory] = useLocalStorage<WrongRecord[]>("kts_wrong_vocab_history", []);
  const [quizHistory] = useLocalStorage<{ wrongIds: string[] }[]>("kts_quiz_history_v2", []);
  const [activeGroup, setActiveGroup] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load vocab from Supabase
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hanja_vocab_entries")
        .select("id, korean, hanja, vietnamese, pronunciation, examples, category, difficulty")
        .order("created_at", { ascending: false });
      if (data) setAllVocab(data as VocabEntry[]);
      setLoading(false);
    };
    load();
  }, [refreshKey]);

  // Build suggestion groups based on quiz history + wrong records
  const suggestionGroups = useMemo((): SuggestionGroup[] => {
    if (allVocab.length === 0) return [];

    const masteredSet = new Set(masteredWords);

    // 1. Words from wrong quiz history
    const wrongKorean = new Set<string>();
    quizHistory.forEach(h => h.wrongIds?.forEach(id => wrongKorean.add(id)));
    wrongHistory.forEach(r => wrongKorean.add(r.korean));

    const wrongWords = allVocab.filter(v => wrongKorean.has(v.korean) && !masteredSet.has(v.korean));

    // 2. Hard words (difficulty 3) not mastered
    const hardWords = allVocab
      .filter(v => v.difficulty === 3 && !masteredSet.has(v.korean))
      .slice(0, 8);

    // 3. Category-based: find most common wrong category
    const catCount: Record<string, number> = {};
    wrongHistory.forEach(r => {
      if (r.category) catCount[r.category] = (catCount[r.category] || 0) + r.count;
    });
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const catWords = topCat
      ? allVocab.filter(v => v.category === topCat && !masteredSet.has(v.korean)).slice(0, 8)
      : allVocab.filter(v => v.category === "Tính cách & C?m xúc" && !masteredSet.has(v.korean)).slice(0, 8);

    // 4. New words (recently added, not mastered)
    const newWords = allVocab
      .filter(v => !masteredSet.has(v.korean))
      .slice(0, 8);

    // 5. Random mix for variety
    const shuffled = [...allVocab].filter(v => !masteredSet.has(v.korean)).sort(() => Math.random() - 0.5).slice(0, 8);

    const groups: SuggestionGroup[] = [];

    if (wrongWords.length > 0) {
      groups.push({
        reason: "T? b?n hay sai trong quiz",
        icon: "ri-error-warning-line",
        color: "#f87171",
        words: wrongWords.slice(0, 8),
      });
    }

    if (hardWords.length > 0) {
      groups.push({
        reason: "T? nâng cao c?n chú ý",
        icon: "ri-fire-line",
        color: "#fb923c",
        words: hardWords,
      });
    }

    groups.push({
      reason: topCat ? `Ch? d? hay sai: ${topCat}` : "Tính cách & C?m xúc",
      icon: "ri-apps-line",
      color: "app-accent-primary",
      words: catWords,
    });

    groups.push({
      reason: "T? m?i nh?t trong kho",
      icon: "ri-star-line",
      color: "#34d399",
      words: newWords,
    });

    groups.push({
      reason: "G?i ý ng?u nhiên hôm nay",
      icon: "ri-shuffle-line",
      color: "#a78bfa",
      words: shuffled,
    });

    return groups.filter(g => g.words.length > 0);
  }, [allVocab, masteredWords, wrongHistory, quizHistory, refreshKey]);

  const currentGroup = suggestionGroups[activeGroup] || null;

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMastered = (korean: string) => {
    setMasteredWords(prev =>
      prev.includes(korean) ? prev.filter(k => k !== korean) : [...prev, korean]
    );
  };

  const masteredCount = masteredWords.length;
  const totalCount = allVocab.length;

  return (
    <DashboardLayout
      title="G?i ý t? v?ng AI"
      subtitle="AI phân tích l?ch s? quiz d? d? xu?t t? b?n c?n h?c nh?t"
    >
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "T?ng t? v?ng", value: totalCount, icon: "ri-book-open-line", color: "app-accent-primary" },
          { label: "Ðã thu?c", value: masteredCount, icon: "ri-check-double-line", color: "#34d399" },
          { label: "C?n ôn t?p", value: totalCount - masteredCount, icon: "ri-refresh-line", color: "#fb923c" },
          { label: "T? hay sai", value: wrongHistory.length, icon: "ri-error-warning-line", color: "#f87171" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Left: suggestion groups */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/50 text-xs tracking-normal font-semibold">G?i ý AI</h3>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-muted cursor-pointer transition-colors"
                title="Làm m?i g?i ý"
              >
                <i className="ri-refresh-line text-xs"></i>
              </button>
            </div>
            {suggestionGroups.map((group, i) => (
              <button
                key={i}
                onClick={() => { setActiveGroup(i); setFlippedCards(new Set()); }}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  activeGroup === i ? "bg-white/8 border border-app-border" : "hover:bg-white/4 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${group.color}15` }}>
                    <i className={`${group.icon} text-xs`} style={{ color: group.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium leading-tight">{group.reason}</p>
                    <p className="text-app-text-muted text-[10px] mt-0.5">{group.words.length} t?</p>
                  </div>
                </div>
              </button>
            ))}

            {/* Progress */}
            <div className="mt-4 p-3 bg-app-bg border border-app-border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-app-text-secondary text-xs">Ti?n d? thu?c t?</p>
                <p className="text-white/60 text-xs font-bold">{totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0}%</p>
              </div>
              <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-app-text-muted text-[10px] mt-1.5">{masteredCount}/{totalCount} t? dã thu?c</p>
            </div>
          </div>

          {/* Right: word cards */}
          <div>
            {currentGroup ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${currentGroup.color}15` }}>
                      <i className={`${currentGroup.icon} text-sm`} style={{ color: currentGroup.color }}></i>
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-sm">{currentGroup.reason}</h2>
                      <p className="text-app-text-muted text-xs">{currentGroup.words.length} t? du?c g?i ý · Nh?n th? d? l?t</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFlippedCards(new Set())}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs cursor-pointer transition-colors"
                  >
                    <i className="ri-refresh-line text-xs"></i>
                    L?t l?i t?t c?
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentGroup.words.map(word => (
                    <VocabCard
                      key={word.id}
                      word={word}
                      isFlipped={flippedCards.has(word.id)}
                      onFlip={() => toggleFlip(word.id)}
                      onMastered={() => toggleMastered(word.korean)}
                      isMastered={masteredWords.includes(word.korean)}
                    />
                  ))}
                </div>

                {/* AI explanation */}
                <div className="mt-4 p-4 bg-app-bg border border-app-border rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-robot-line text-app-accent-primary text-sm"></i>
                    <p className="text-white/50 text-xs font-semibold">T?i sao AI g?i ý nhóm này?</p>
                  </div>
                  <p className="text-app-text-muted text-xs leading-relaxed">
                    {activeGroup === 0 && wrongHistory.length > 0
                      ? `B?n dã tr? l?i sai ${wrongHistory.length} t? trong các bài quiz g?n dây. Ôn l?i nh?ng t? này s? giúp tang di?m nhanh nh?t.`
                      : activeGroup === 1
                      ? "Nh?ng t? nâng cao (d? khó 3) thu?ng xu?t hi?n trong d? thi TOPIK II và EPS. N?m v?ng chúng s? giúp b?n d?t di?m cao hon."
                      : activeGroup === 2
                      ? "AI phát hi?n b?n hay nh?m l?n trong ch? d? này. T?p trung ôn luy?n s? giúp c?i thi?n dáng k?."
                      : activeGroup === 3
                      ? "Nh?ng t? m?i nh?t du?c thêm vào kho t? v?ng. H?c s?m d? tích luy v?n t? phong phú hon."
                      : "H?c da d?ng t? v?ng t? nhi?u ch? d? khác nhau giúp não b? ghi nh? t?t hon qua liên k?t ng? nghia."}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <i className="ri-robot-line text-white/10 text-5xl mb-4"></i>
                <p className="text-app-text-muted text-sm">Chua có d? li?u quiz d? phân tích</p>
                <p className="text-app-text-muted text-xs mt-1">Hãy làm m?t vài bài quiz d? AI g?i ý t? phù h?p</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

