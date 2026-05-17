import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { useAuthContext } from "@/contexts/AuthContext";
import { isVipActive } from "@/utils/vip";
import DashboardLayout from "@/components/DashboardLayout";
import VipUpgradeModal from "@/components/VipUpgradeModal";
import { speakKorean } from "@/utils/tts";

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface HanjaTreeNode {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  meaning_detail: string;
  examples: { korean: string; vietnamese: string; pronunciation?: string }[];
  related_words: (string | { word: string; meaning: string })[];
  memory_tip: string;
  hanja_chars: string[];
  root_char: string;
  root_meaning?: string;
  level: number;
  category: string;
  difficulty: number;
}

interface TreeGroup {
  rootChar: string;
  rootMeaning: string;
  nodes: HanjaTreeNode[];
  count: number;
}

const DIFF_CONFIG: Record<number, { label: string; cls: string }> = {
  1: { label: "Dễ", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  2: { label: "TB", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  3: { label: "Khó", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

const LEARNED_KEY = "hanja_tree_learned";

function loadLearned(): Set<string> {
  try {
    const stored = localStorage.getItem(LEARNED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLearned(set: Set<string>) {
  localStorage.setItem(LEARNED_KEY, JSON.stringify(Array.from(set)));
}

export default function HanjaFlashcardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuthContext();
  const isVip = isVipActive(profile);
  
  const [nodes, setNodes] = useState<HanjaTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState<string>(searchParams.get("root") || "");
  const [learnedSet, setLearnedSet] = useState<Set<string>>(loadLearned);
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [vipModal, setVipModal] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Fetch nodes
  useEffect(() => {
    async function fetchNodes() {
      const { data, error } = await supabase
        .from("hanja_tree_nodes")
        .select("*")
        .order("korean");
      if (error) {
        console.error("Error fetching hanja nodes:", error);
      } else {
        setNodes(data || []);
      }
      setLoading(false);
    }
    fetchNodes();
  }, []);

  // Set root from URL
  useEffect(() => {
    const root = searchParams.get("root");
    if (root) {
      setSelectedRoot(root);
      setShowStartScreen(false);
    }
  }, [searchParams]);

  const treeGroups = useMemo((): TreeGroup[] => {
    const groups: Record<string, HanjaTreeNode[]> = {};
    nodes.forEach(n => {
      if (!groups[n.root_char]) groups[n.root_char] = [];
      groups[n.root_char].push(n);
    });
    return Object.entries(groups).map(([rootChar, grpNodes]) => ({
      rootChar,
      rootMeaning: grpNodes[0]?.root_meaning || grpNodes[0]?.vietnamese?.split(",")[0]?.trim() || rootChar,
      nodes: grpNodes,
      count: grpNodes.length,
    }));
  }, [nodes]);

  const currentGroup = useMemo(
    () => treeGroups.find(g => g.rootChar === selectedRoot),
    [treeGroups, selectedRoot]
  );

  const currentNodes = useMemo(() => {
    return currentGroup?.nodes || [];
  }, [currentGroup]);

  const toggleLearned = useCallback((korean: string) => {
    setLearnedSet(prev => {
      const next = new Set(prev);
      next.has(korean) ? next.delete(korean) : next.add(korean);
      saveLearned(next);
      return next;
    });
  }, []);

  const startFlashcard = (root: string) => {
    if (!isVip) {
      setVipModal(true);
      return;
    }
    setSelectedRoot(root);
    setFlashIdx(0);
    setFlashFlipped(false);
    setShowStartScreen(false);
    // Update URL
    navigate(`/hanja-flashcard?root=${root}`, { replace: true });
  };

  const goBack = () => {
    setShowStartScreen(true);
    setSelectedRoot("");
    navigate("/hanja-flashcard", { replace: true });
  };

  const card = currentNodes[flashIdx];
  const isLearned = card ? learnedSet.has(card.korean) : false;
  const diff = card ? (DIFF_CONFIG[card.difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG[1]) : DIFF_CONFIG[1];

  // Keyboard controls
  useEffect(() => {
    if (showStartScreen || !card) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlashFlipped(f => !f); }
      if (e.key === "ArrowRight" || e.key === "d") { setFlashFlipped(false); setFlashIdx(i => Math.min(i + 1, currentNodes.length - 1)); }
      if (e.key === "ArrowLeft" || e.key === "a") { setFlashFlipped(false); setFlashIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "l" && card) { toggleLearned(card.korean); }
      if (e.key === "Escape") { goBack(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showStartScreen, card, currentNodes.length, setFlashFlipped, setFlashIdx, toggleLearned]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f111a]">
        {showStartScreen ? (
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6">
              <button onClick={() => navigate("/hanja-tree")} className="flex items-center gap-1.5 text-app-text-muted hover:text-white/70 cursor-pointer text-sm mb-4">
                <i className="ri-arrow-left-line"></i>Quay lại Hán Hàn
              </button>
              <h1 className="text-2xl font-bold text-white/90 mb-2">Flashcard Hán Hàn</h1>
              <p className="text-sm text-app-text-secondary">Chọn cây Hán tự để bắt đầu ôn tập</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <i className="ri-loader-4-line animate-spin text-app-text-muted text-2xl"></i>
              </div>
            ) : treeGroups.length === 0 ? (
              <div className="text-center py-12 text-app-text-muted">
                <p className="text-sm">Chưa có dữ liệu</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {treeGroups.map(group => {
                  const gLearned = group.nodes.filter(n => learnedSet.has(n.korean)).length;
                  const gPct = group.count > 0 ? Math.round((gLearned / group.count) * 100) : 0;
                  return (
                    <button
                      key={group.rootChar}
                      onClick={() => startFlashcard(group.rootChar)}
                      className="bg-app-card/50 border border-app-border rounded-xl p-4 hover:border-rose-500/30 hover:bg-rose-500/8 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 flex items-center justify-center bg-rose-500/15 rounded-lg text-2xl font-bold text-rose-400 group-hover:bg-rose-500/25 transition-all">
                          {group.rootChar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/70 truncate">{group.rootMeaning}</p>
                          <p className="text-[10px] text-app-text-muted">{group.count} từ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${gPct}%` }} />
                        </div>
                        <span className="text-[10px] text-app-text-muted whitespace-nowrap">{gLearned}/{group.count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : card ? (
          <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
            {/* Header */}
            <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
              <button onClick={goBack} className="flex items-center gap-1.5 text-app-text-muted hover:text-white/70 cursor-pointer text-sm">
                <i className="ri-arrow-left-line"></i>Quay lại
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-rose-400">{currentGroup?.rootChar}</span>
                <span className="text-sm text-white/60">· {currentGroup?.rootMeaning}</span>
              </div>
              <div className="w-20"></div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-app-text-muted">{flashIdx + 1} / {currentNodes.length}</span>
              <div className="w-64 h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${((flashIdx + 1) / currentNodes.length) * 100}%` }} />
              </div>
              <span className="text-xs text-app-text-muted">{currentNodes.filter(n => learnedSet.has(n.korean)).length} đã học</span>
            </div>

            {/* Card */}
            <div
              onClick={() => setFlashFlipped(f => !f)}
              className="w-full max-w-lg aspect-[3/4] cursor-pointer select-none"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{ transformStyle: "preserve-3d", transform: flashFlipped ? "rotateY(180deg)" : "rotateY(0)" }}
              >
                {/* Front */}
                <div className="absolute inset-0 rounded-3xl border-2 border-rose-500/30 bg-gradient-to-br from-[#1e2030] to-[#1a1d27] p-8 flex flex-col items-center justify-center shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
                  <span className={`text-xs px-3 py-1 rounded-full border mb-6 ${diff.cls}`}>{diff.label}</span>
                  <p className="text-6xl font-black text-white/90 mb-4">{card.korean}</p>
                  <p className="text-3xl font-bold text-rose-400 mb-3">{card.hanja}</p>
                  {card.pronunciation ? (
                    <p className="text-base text-app-text-secondary mb-6">[{card.pronunciation}]</p>
                  ) : (
                    <p className="text-sm text-amber-400/60 mb-6 italic">(Đang cập nhật phát âm...)</p>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); speakKorean(card.korean); }}
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer transition-all"
                  >
                    <i className="ri-volume-up-line text-2xl"></i>
                  </button>
                  <p className="text-sm text-app-text-muted mt-8"><i className="ri-arrow-left-right-line mr-2"></i>Nhấn hoặc Space để lật</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-[#1a2420] to-[#1a1d27] p-6 flex flex-col overflow-y-auto shadow-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <p className="text-xl font-bold text-app-accent-success mb-2">{card.vietnamese}</p>
                  {card.meaning_detail && <p className="text-sm text-app-text-secondary leading-relaxed mb-4">{card.meaning_detail}</p>}

                  {card.hanja_chars?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.hanja_chars.map((ch, i) => (
                        <span key={i} className="px-3 py-1.5 bg-rose-500/15 rounded-lg text-base font-bold text-rose-400 border border-rose-500/20">{ch}</span>
                      ))}
                      <span className="flex items-center text-xs text-app-text-muted">=</span>
                      <span className="px-3 py-1.5 bg-white/8 rounded-lg text-base font-bold text-white/70 border border-app-border">{card.hanja}</span>
                    </div>
                  )}

                  {card.examples?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-app-text-muted font-semibold mb-2">Ví dụ</p>
                      {card.examples.slice(0, 3).map((ex, i) => (
                        <div key={i} className="mb-2">
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-white/70 flex-1">{ex.korean}</p>
                            <button onClick={e => { e.stopPropagation(); speakKorean(ex.korean); }} className="text-app-text-muted hover:text-rose-400 cursor-pointer flex-shrink-0">
                              <i className="ri-volume-up-line text-sm"></i>
                            </button>
                          </div>
                          <p className="text-xs text-app-text-secondary italic">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {card.memory_tip && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-auto">
                      <p className="text-xs text-amber-400 font-semibold mb-1"><i className="ri-lightbulb-line mr-1"></i>Mẹo nhớ</p>
                      <p className="text-xs text-amber-400/70 leading-relaxed">{card.memory_tip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => { setFlashFlipped(false); setFlashIdx(i => Math.max(i - 1, 0)); }}
                disabled={flashIdx === 0}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:bg-white/15 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </button>

              <button
                onClick={() => toggleLearned(card.korean)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  isLearned
                    ? "bg-emerald-500/20 text-app-accent-success border border-emerald-500/30"
                    : "bg-white/8 text-white/50 border border-app-border hover:bg-emerald-500/15 hover:text-app-accent-success"
                }`}
              >
                <i className={`${isLearned ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"} text-lg`}></i>
                {isLearned ? "Đã học" : "Đánh dấu đã học"}
              </button>

              <button
                onClick={() => { setFlashFlipped(false); setFlashIdx(i => Math.min(i + 1, currentNodes.length - 1)); }}
                disabled={flashIdx >= currentNodes.length - 1}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:bg-white/15 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </button>
            </div>

            <p className="text-xs text-app-text-muted mt-6">
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">Space</kbd> lật · 
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">←→</kbd> qua lại · 
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">L</kbd> đánh dấu · 
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">Esc</kbd> thoát
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen text-app-text-muted">
            <p>Không có từ nào</p>
          </div>
        )}
      </div>

      <VipUpgradeModal
        open={vipModal}
        onClose={() => setVipModal(false)}
        reason={user ? "not_vip" : "not_logged_in"}
        featureName="Flashcard Hán Hàn"
      />
    </DashboardLayout>
  );
}
