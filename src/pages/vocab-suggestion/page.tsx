import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Difficulty label ─────────────────────────────────────────────────────────
const diffLabel = (d: number) => d === 1 ? "Cơ bản" : d === 2 ? "Trung cấp" : "Nâng cao";
const diffColor = (d: number) => d === 1 ? "#34d399" : d === 2 ? "#e8c84a" : "#f87171";

// ─── Vocab Card ───────────────────────────────────────────────────────────────
function VocabCard({ word, isFlipped, onFlip, onMastered, isMastered }: {
  word: VocabEntry;
  isFlipped: boolean;
  onFlip: () => void;
  onMastered: () => void;
  isMastered: boolean;
}) {
  return (
    <div
      className={`relative bg-[#0f1117] border rounded-2xl p-5 cursor-pointer transition-all hover:border-white/15 ${
        isMastered ? "opacity-50 border-white/5" : "border-white/8"
      }`}
      onClick={onFlip}
    >
      {isMastered && (
        <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/20">
          <i className="ri-check-line text-emerald-400 text-xs"></i>
        </div>
      )}

      {!isFlipped ? (
        /* Front */
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-white font-bold text-2xl">{word.korean}</p>
              {word.hanja && word.hanja !== word.korean && (
                <p className="text-white/25 text-xs mt-0.5">{word.hanja}</p>
              )}
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 flex-shrink-0">{word.category}</span>
          </div>
          <p className="text-white/30 text-xs">[{word.pronunciation}]</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diffColor(word.difficulty)}15`, color: diffColor(word.difficulty) }}>
              {diffLabel(word.difficulty)}
            </span>
            <span className="text-white/20 text-[10px]">Nhấn để xem nghĩa</span>
          </div>
        </div>
      ) : (
        /* Back */
        <div>
          <p className="text-white font-bold text-lg mb-1">{word.vietnamese}</p>
          <p className="text-white/40 text-xs mb-3">[{word.pronunciation}]</p>
          {word.examples?.[0] && (
            <div className="bg-white/3 rounded-xl p-3 mb-3">
              <p className="text-white/70 text-xs">{word.examples[0].korean}</p>
              <p className="text-white/35 text-xs mt-1">{word.examples[0].vietnamese}</p>
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); onMastered(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              isMastered
                ? "bg-white/5 text-white/30"
                : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
            }`}
          >
            <i className={isMastered ? "ri-close-line" : "ri-check-line"}></i>
            {isMastered ? "Bỏ đánh dấu" : "Đã thuộc"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
      : allVocab.filter(v => v.category === "Tính cách & Cảm xúc" && !masteredSet.has(v.korean)).slice(0, 8);

    // 4. New words (recently added, not mastered)
    const newWords = allVocab
      .filter(v => !masteredSet.has(v.korean))
      .slice(0, 8);

    // 5. Random mix for variety
    const shuffled = [...allVocab].filter(v => !masteredSet.has(v.korean)).sort(() => Math.random() - 0.5).slice(0, 8);

    const groups: SuggestionGroup[] = [];

    if (wrongWords.length > 0) {
      groups.push({
        reason: "Từ bạn hay sai trong quiz",
        icon: "ri-error-warning-line",
        color: "#f87171",
        words: wrongWords.slice(0, 8),
      });
    }

    if (hardWords.length > 0) {
      groups.push({
        reason: "Từ nâng cao cần chú ý",
        icon: "ri-fire-line",
        color: "#fb923c",
        words: hardWords,
      });
    }

    groups.push({
      reason: topCat ? `Chủ đề hay sai: ${topCat}` : "Tính cách & Cảm xúc",
      icon: "ri-apps-line",
      color: "#e8c84a",
      words: catWords,
    });

    groups.push({
      reason: "Từ mới nhất trong kho",
      icon: "ri-star-line",
      color: "#34d399",
      words: newWords,
    });

    groups.push({
      reason: "Gợi ý ngẫu nhiên hôm nay",
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
      title="Gợi ý từ vựng AI"
      subtitle="AI phân tích lịch sử quiz để đề xuất từ bạn cần học nhất"
    >
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng từ vựng", value: totalCount, icon: "ri-book-open-line", color: "#e8c84a" },
          { label: "Đã thuộc", value: masteredCount, icon: "ri-check-double-line", color: "#34d399" },
          { label: "Cần ôn tập", value: totalCount - masteredCount, icon: "ri-refresh-line", color: "#fb923c" },
          { label: "Từ hay sai", value: wrongHistory.length, icon: "ri-error-warning-line", color: "#f87171" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Left: suggestion groups */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/50 text-xs uppercase tracking-widest font-semibold">Gợi ý AI</h3>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/30 cursor-pointer transition-colors"
                title="Làm mới gợi ý"
              >
                <i className="ri-refresh-line text-xs"></i>
              </button>
            </div>
            {suggestionGroups.map((group, i) => (
              <button
                key={i}
                onClick={() => { setActiveGroup(i); setFlippedCards(new Set()); }}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  activeGroup === i ? "bg-white/8 border border-white/10" : "hover:bg-white/4 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${group.color}15` }}>
                    <i className={`${group.icon} text-xs`} style={{ color: group.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium leading-tight">{group.reason}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{group.words.length} từ</p>
                  </div>
                </div>
              </button>
            ))}

            {/* Progress */}
            <div className="mt-4 p-3 bg-[#0f1117] border border-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-xs">Tiến độ thuộc từ</p>
                <p className="text-white/60 text-xs font-bold">{totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0}%</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-white/20 text-[10px] mt-1.5">{masteredCount}/{totalCount} từ đã thuộc</p>
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
                      <p className="text-white/30 text-xs">{currentGroup.words.length} từ được gợi ý · Nhấn thẻ để lật</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFlippedCards(new Set())}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-xs cursor-pointer transition-colors"
                  >
                    <i className="ri-refresh-line text-xs"></i>
                    Lật lại tất cả
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
                <div className="mt-4 p-4 bg-[#0f1117] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-robot-line text-[#e8c84a] text-sm"></i>
                    <p className="text-white/50 text-xs font-semibold">Tại sao AI gợi ý nhóm này?</p>
                  </div>
                  <p className="text-white/30 text-xs leading-relaxed">
                    {activeGroup === 0 && wrongHistory.length > 0
                      ? `Bạn đã trả lời sai ${wrongHistory.length} từ trong các bài quiz gần đây. Ôn lại những từ này sẽ giúp tăng điểm nhanh nhất.`
                      : activeGroup === 1
                      ? "Những từ nâng cao (độ khó 3) thường xuất hiện trong đề thi TOPIK II và EPS. Nắm vững chúng sẽ giúp bạn đạt điểm cao hơn."
                      : activeGroup === 2
                      ? "AI phát hiện bạn hay nhầm lẫn trong chủ đề này. Tập trung ôn luyện sẽ giúp cải thiện đáng kể."
                      : activeGroup === 3
                      ? "Những từ mới nhất được thêm vào kho từ vựng. Học sớm để tích lũy vốn từ phong phú hơn."
                      : "Học đa dạng từ vựng từ nhiều chủ đề khác nhau giúp não bộ ghi nhớ tốt hơn qua liên kết ngữ nghĩa."}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <i className="ri-robot-line text-white/10 text-5xl mb-4"></i>
                <p className="text-white/30 text-sm">Chưa có dữ liệu quiz để phân tích</p>
                <p className="text-white/20 text-xs mt-1">Hãy làm một vài bài quiz để AI gợi ý từ phù hợp</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
