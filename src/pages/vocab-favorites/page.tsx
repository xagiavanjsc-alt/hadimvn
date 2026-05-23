import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { vocabularyData, type VocabItem } from "@/mocks/vocabularyData";
import { useNavigate } from "react-router-dom";

type CardMode = "korean_to_vi" | "vi_to_korean";
type SessionState = "idle" | "studying" | "result";

interface CardResult { id: string; correct: boolean; attempts: number }

// ─── Flashcard ────────────────────────────────────────────────────────────
function Flashcard({
  item,
  mode,
  onCorrect,
  onWrong,
  cardIndex,
  total,
}: {
  item: VocabItem;
  mode: CardMode;
  onCorrect: () => void;
  onWrong: () => void;
  cardIndex: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setFlipped(false); setRevealed(false); }, [item.id]);

  const front = mode === "korean_to_vi" ? item.korean : item.vietnamese;
  const frontSub = mode === "korean_to_vi" ? `[${item.reading}]` : "";
  const back = mode === "korean_to_vi" ? item.vietnamese : item.korean;
  const backSub = mode === "korean_to_vi" ? item.exampleVi : `[${item.reading}]`;

  const speakKorean = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(item.korean);
    utter.lang = "ko-KR"; utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  };

  const handleReveal = () => {
    setFlipped(true);
    setRevealed(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${((cardIndex) / total) * 100}%` }} />
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{cardIndex + 1}/{total}</span>
      </div>

      {/* Card */}
      <div className="w-full cursor-pointer select-none" style={{ perspective: "1200px" }} onClick={() => !revealed && handleReveal()}>
        <div
          className="relative w-full transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", height: "260px" }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl border border-app-border bg-app-bg flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: "hidden" }}>
            <p className="text-4xl font-bold text-white mb-3">{front}</p>
            {frontSub && <p className="text-app-text-muted text-base font-mono">{frontSub}</p>}
            <button onClick={speakKorean} className="mt-4 flex items-center gap-1.5 text-xs text-app-text-muted hover:text-white/50 bg-app-card/50 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-volume-up-line"></i>Nghe phát âm
            </button>
            {!revealed && (
              <p className="mt-6 text-white/15 text-xs">Nhấn để xem nghĩa</p>
            )}
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-2xl border border-app-accent-primary/25 bg-gradient-to-br from-app-surface to-[#0f1117] flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-3xl font-bold text-app-accent-primary mb-3">{back}</p>
            {backSub && <p className="text-app-text-secondary text-sm leading-relaxed">{backSub}</p>}
          </div>
        </div>
      </div>

      {/* Action buttons — only show after reveal */}
      {revealed ? (
        <div className="flex gap-4 w-full">
          <button
            onClick={onWrong}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-400/30 bg-red-400/8 text-red-400 font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-red-400/15 transition-colors"
          >
            <i className="ri-close-line text-lg"></i>Chưa nhớ
          </button>
          <button
            onClick={onCorrect}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-emerald-400/30 bg-emerald-400/8 text-app-accent-success font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-emerald-400/15 transition-colors"
          >
            <i className="ri-check-line text-lg"></i>Đã nhớ
          </button>
        </div>
      ) : (
        <button
          onClick={handleReveal}
          className="w-full py-3.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-eye-line mr-2"></i>Xem nghĩa
        </button>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────
function ResultScreen({
  results,
  items,
  onRestart,
  onRestartWrong,
}: {
  results: CardResult[];
  items: VocabItem[];
  onRestart: () => void;
  onRestartWrong: (wrongItems: VocabItem[]) => void;
}) {
  const correct = results.filter(r => r.correct).length;
  const pct = Math.round((correct / results.length) * 100);
  const wrongItems = results.filter(r => !r.correct).map(r => items.find(i => i.id === r.id)!).filter(Boolean);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="bg-gradient-to-br from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">{pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "💪"}</div>
        <h2 className="text-white font-bold text-2xl mb-1">{correct}/{results.length} từ đã nhớ</h2>
        <p className="text-app-text-secondary text-sm mb-4">Đạt {pct}%</p>
        <div className="w-full h-3 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171" }} />
        </div>
      </div>

      {wrongItems.length > 0 && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3">
            <i className="ri-refresh-line text-app-accent-primary mr-2"></i>
            Cần ôn lại ({wrongItems.length} từ)
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {wrongItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 bg-red-400/5 border border-red-400/10 rounded-xl">
                <span className="text-white font-bold text-base">{item.korean}</span>
                <span className="text-app-text-muted text-xs">[{item.reading}]</span>
                <span className="text-app-accent-primary text-sm ml-auto">{item.vietnamese}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {wrongItems.length > 0 && (
          <button onClick={() => onRestartWrong(wrongItems)} className="flex-1 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-red-400/15 transition-colors">
            <i className="ri-refresh-line mr-2"></i>Ôn từ chưa nhớ ({wrongItems.length})
          </button>
        )}
        <button onClick={onRestart} className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-play-line mr-2"></i>Học lại tất cả
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function VocabFavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>("kts_vocab_favorites", []);
  const [mode, setMode] = useState<CardMode>("korean_to_vi");
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [sessionItems, setSessionItems] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<CardResult[]>([]);

  // Load favorites from Supabase on login
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase.from("study_progress").select("vocab_favorites").eq("user_id", user.id).maybeSingle()
      .then(
        ({ data, error }) => {
          if (cancelled || error) return;
          if (data?.vocab_favorites && Array.isArray(data.vocab_favorites) && data.vocab_favorites.length > 0) {
            setFavoriteIds(data.vocab_favorites as string[]);
          }
        },
        () => { /* network error — keep local state */ }
      );
    return () => { cancelled = true; };
  }, [user?.id]);

  const favoriteItems = vocabularyData.filter(v => favoriteIds.includes(v.id));

  const startSession = useCallback((items: VocabItem[]) => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setSessionItems(shuffled);
    setCurrentIndex(0);
    setResults([]);
    setSessionState("studying");
  }, []);

  const handleCorrect = useCallback(() => {
    const item = sessionItems[currentIndex];
    setResults(prev => [...prev, { id: item.id, correct: true, attempts: 1 }]);
    if (currentIndex + 1 >= sessionItems.length) {
      setSessionState("result");
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [sessionItems, currentIndex]);

  const handleWrong = useCallback(() => {
    const item = sessionItems[currentIndex];
    setResults(prev => [...prev, { id: item.id, correct: false, attempts: 1 }]);
    if (currentIndex + 1 >= sessionItems.length) {
      setSessionState("result");
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [sessionItems, currentIndex]);

  const handleRemoveFavorite = (id: string) => {
    const next = favoriteIds.filter(x => x !== id);
    setFavoriteIds(next);
    if (user) {
      supabase.from("study_progress").upsert({ user_id: user.id, vocab_favorites: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    }
  };

  return (
    <DashboardLayout
      title="Ôn tập từ yêu thích"
      subtitle="Flashcard riêng cho các từ đã bookmark — luyện đến khi thuộc hết"
      actions={
        <button onClick={() => navigate("/vocabulary")} className="flex items-center gap-2 bg-app-card/50 border border-app-border hover:bg-white/8 text-white/60 text-sm px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-bookmark-line"></i>Quản lý từ yêu thích
        </button>
      }
    >
      {favoriteItems.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mb-5">
            <i className="ri-bookmark-line text-app-accent-primary text-4xl"></i>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Chưa có từ yêu thích</h2>
          <p className="text-app-text-secondary text-sm mb-6 max-w-sm leading-relaxed">
            Nhấn nút bookmark <i className="ri-bookmark-line text-app-accent-primary"></i> trên trang Từ vựng để lưu các từ khó vào đây
          </p>
          <button onClick={() => navigate("/vocabulary")} className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-translate-2"></i>Đến trang Từ vựng
          </button>
        </div>
      ) : sessionState === "idle" ? (
        /* Setup screen */
        <div className="max-w-lg mx-auto space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Từ yêu thích", value: favoriteItems.length, icon: "ri-bookmark-fill", color: "app-accent-primary" },
              { label: "A1/A2", value: favoriteItems.filter(v => ["A1","A2"].includes(v.topikLevel)).length, icon: "ri-seedling-line", color: "#34d399" },
              { label: "B1/B2", value: favoriteItems.filter(v => ["B1","B2"].includes(v.topikLevel)).length, icon: "ri-fire-line", color: "#fb923c" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                </div>
                <p className="text-white font-bold text-2xl">{s.value}</p>
                <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mode selector */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-app-text-secondary text-xs font-medium mb-3">Chế độ học</p>
            <div className="grid grid-cols-2 gap-3">
              {([["korean_to_vi", "ri-translate-2", "Hàn → Việt", "Xem tiếng Hàn, đoán nghĩa"], ["vi_to_korean", "ri-font-size", "Việt → Hàn", "Xem tiếng Việt, đoán tiếng Hàn"]] as [CardMode, string, string, string][]).map(([m, icon, label, desc]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === m ? "border-app-accent-primary/40 bg-app-accent-primary/8" : "border-app-border bg-app-surface/50 hover:border-white/15"}`}
                >
                  <div className="flex items-center gap-2">
                    <i className={`${icon} ${mode === m ? "text-app-accent-primary" : "text-app-text-secondary"} text-base`}></i>
                    <span className={`text-sm font-bold ${mode === m ? "text-app-accent-primary" : "text-white/60"}`}>{label}</span>
                  </div>
                  <p className="text-app-text-muted text-xs">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={() => startSession(favoriteItems)}
            className="w-full py-4 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-play-fill mr-2"></i>Bắt đầu ôn tập ({favoriteItems.length} từ)
          </button>

          {/* Word list */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Danh sách từ yêu thích</h3>
              <span className="text-app-text-muted text-xs">{favoriteItems.length} từ</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {favoriteItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-app-surface/50 rounded-xl">
                  <span className="text-white font-bold text-base w-24 flex-shrink-0">{item.korean}</span>
                  <span className="text-app-text-muted text-xs flex-shrink-0">[{item.reading}]</span>
                  <span className="text-app-accent-primary text-sm flex-1">{item.vietnamese}</span>
                  <button onClick={() => handleRemoveFavorite(item.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-400/15 cursor-pointer transition-colors flex-shrink-0">
                    <i className="ri-close-line text-app-text-muted hover:text-red-400 text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : sessionState === "studying" ? (
        /* Study screen */
        <div className="py-4">
          <Flashcard
            item={sessionItems[currentIndex]}
            mode={mode}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            cardIndex={currentIndex}
            total={sessionItems.length}
          />
        </div>
      ) : (
        /* Result screen */
        <ResultScreen
          results={results}
          items={sessionItems}
          onRestart={() => startSession(favoriteItems)}
          onRestartWrong={(wrongItems) => startSession(wrongItems)}
        />
      )}
    </DashboardLayout>
  );
}

