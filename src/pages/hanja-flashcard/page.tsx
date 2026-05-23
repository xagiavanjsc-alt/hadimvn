import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { isVipActive, supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";
import { useHanjaProgress } from "@/hooks/useHanjaProgress";
import { useToast } from "@/components/base/Toast";

interface HanjaProEntry {
  id: number;
  hangul: string;
  hanja: string;
  meaning_vn: string | null;
  slug: string;
  hanja_breakdown?: { char: string; reading: string; meaning: string }[] | null;
  examples?: { ko: string; vi: string; boi?: string }[] | null;
  mnemonic?: string | null;
}

interface CharGroup {
  char: string;
  meaning: string;
  entries: HanjaProEntry[];
  count: number;
}

const FAV_KEY = "kts_hanja_pro_fav";

function loadRecord(key: string): Record<number, boolean> {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveRecord(key: string, value: Record<number, boolean>) {
  localStorage.setItem(key, JSON.stringify(value));
}

function playTTS(text: string) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function getEntryChars(entry: HanjaProEntry): string[] {
  if (entry.hanja_breakdown?.length) {
    return entry.hanja_breakdown.map(item => item.char).filter(Boolean);
  }
  return entry.hanja.split("").filter(char => /[\u4e00-\u9fff]/.test(char));
}

function getCharMeaning(entry: HanjaProEntry, char: string): string {
  const found = entry.hanja_breakdown?.find(item => item.char === char);
  return found?.meaning || found?.reading || char;
}

export default function HanjaFlashcardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuthContext();
  const isVip = isVipActive(profile);

  const [entries, setEntries] = useState<HanjaProEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState<string>(searchParams.get("char") || "");
  const { learnedSet, toggle: toggleKnown, isLearned, lastError, clearError } = useHanjaProgress();
  const { showToast, ToastComponent } = useToast();
  const [favorites, setFavorites] = useState<Record<number, boolean>>(() => loadRecord(FAV_KEY));
  const [filter, setFilter] = useState<"all" | "unknown" | "known" | "favorites">("all");
  const [groupPage, setGroupPage] = useState(1);
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [vipModal, setVipModal] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);

  useEffect(() => {
    if (!lastError) return;
    showToast(lastError, "error", 3500);
    clearError();
  }, [lastError, showToast, clearError]);

  useEffect(() => {
    async function fetchEntries() {
      const all: HanjaProEntry[] = [];
      const pageSize = 1000;
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("hanja_pro")
          .select("id,hangul,hanja,meaning_vn,slug,hanja_breakdown,examples,mnemonic")
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) {
          console.error("[hanja-flashcard] fetch error:", error);
          break;
        }
        if (!data || data.length === 0) break;

        all.push(...(data as HanjaProEntry[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }

      setEntries(all);
      setLoading(false);
    }

    fetchEntries();
  }, []);

  useEffect(() => {
    const char = searchParams.get("char");
    if (char) {
      setSelectedChar(char);
      setShowStartScreen(false);
    }
  }, [searchParams]);

  const charGroups = useMemo((): CharGroup[] => {
    const groups = new Map<string, HanjaProEntry[]>();

    entries.forEach(entry => {
      getEntryChars(entry).forEach(char => {
        const current = groups.get(char) || [];
        current.push(entry);
        groups.set(char, current);
      });
    });

    return Array.from(groups.entries())
      .map(([char, groupEntries]) => ({
        char,
        meaning: getCharMeaning(groupEntries[0], char),
        entries: groupEntries,
        count: groupEntries.length,
      }))
      .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char));
  }, [entries]);

  const currentGroup = useMemo(
    () => charGroups.find(group => group.char === selectedChar),
    [charGroups, selectedChar]
  );

  const filteredCharGroups = useMemo(() => charGroups.filter(group => {
    return group.entries.some(entry => {
      if (filter === "known") return isLearned(entry.id);
      if (filter === "unknown") return !isLearned(entry.id);
      if (filter === "favorites") return favorites[entry.id];
      return true;
    });
  }), [charGroups, filter, learnedSet, favorites, isLearned]);

  const GROUP_PAGE_SIZE = 20;
  const groupTotalPages = Math.ceil(filteredCharGroups.length / GROUP_PAGE_SIZE);
  const paginatedCharGroups = useMemo(
    () => filteredCharGroups.slice((groupPage - 1) * GROUP_PAGE_SIZE, groupPage * GROUP_PAGE_SIZE),
    [filteredCharGroups, groupPage]
  );

  const currentEntries = useMemo(() => {
    const base = currentGroup?.entries || [];
    if (filter === "known") return base.filter(entry => isLearned(entry.id));
    if (filter === "unknown") return base.filter(entry => !isLearned(entry.id));
    if (filter === "favorites") return base.filter(entry => favorites[entry.id]);
    return base;
  }, [currentGroup, filter, learnedSet, favorites, isLearned]);

  useEffect(() => {
    setGroupPage(1);
  }, [filter]);

  useEffect(() => {
    if (groupPage > groupTotalPages) setGroupPage(Math.max(groupTotalPages, 1));
  }, [groupPage, groupTotalPages]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) delete next[id];
      saveRecord(FAV_KEY, next);
      return next;
    });
  }, []);

  const startFlashcard = (char: string) => {
    if (!isVip) {
      setVipModal(true);
      return;
    }
    setSelectedChar(char);
    setFlashIdx(0);
    setFlashFlipped(false);
    setShowStartScreen(false);
    navigate(`/hanja-flashcard?char=${encodeURIComponent(char)}`, { replace: true });
  };

  const goBack = useCallback(() => {
    setShowStartScreen(true);
    setSelectedChar("");
    setFlashIdx(0);
    setFlashFlipped(false);
    navigate("/hanja-flashcard", { replace: true });
  }, [navigate]);

  const card = currentEntries[flashIdx];
  const isKnown = card ? isLearned(card.id) : false;
  const isFavorite = card ? !!favorites[card.id] : false;

  useEffect(() => {
    if (flashIdx >= currentEntries.length) {
      setFlashIdx(Math.max(currentEntries.length - 1, 0));
      setFlashFlipped(false);
    }
  }, [currentEntries.length, flashIdx]);

  useEffect(() => {
    if (showStartScreen || !card) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlashFlipped(prev => !prev);
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setFlashFlipped(false);
        setFlashIdx(prev => Math.min(prev + 1, currentEntries.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setFlashFlipped(false);
        setFlashIdx(prev => Math.max(prev - 1, 0));
      }
      if (e.key === "l") toggleKnown(card.id);
      if (e.key === "f") toggleFavorite(card.id);
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showStartScreen, card, currentEntries.length, toggleKnown, toggleFavorite, goBack]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f111a]">
        {showStartScreen ? (
          <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-6">
              <button onClick={() => navigate("/hanja-pro")} className="flex items-center gap-1.5 text-app-text-muted hover:text-white/70 cursor-pointer text-sm mb-4">
                <i className="ri-arrow-left-line"></i>Quay lại Hán Hàn Chuyên Sâu
              </button>
              <h1 className="text-2xl font-bold text-white/90 mb-2">Flashcard Hán Hàn</h1>
              <p className="text-sm text-app-text-secondary">Dữ liệu lấy từ Hán Hàn Chuyên Sâu. Chọn chữ Hán hoặc trạng thái để ôn tập.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <i className="ri-loader-4-line animate-spin text-app-text-muted text-2xl"></i>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { value: "all" as const, label: "Tất cả", count: entries.length },
                    { value: "unknown" as const, label: "Chưa học", count: entries.filter(entry => !isLearned(entry.id)).length },
                    { value: "known" as const, label: "Đã học", count: entries.filter(entry => isLearned(entry.id)).length },
                    { value: "favorites" as const, label: "Yêu thích", count: entries.filter(entry => favorites[entry.id]).length },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setFilter(item.value)}
                      className={`rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                        filter === item.value
                          ? "bg-rose-500/15 border-rose-500/35 text-rose-300"
                          : "bg-app-card/50 border-app-border text-white/60 hover:bg-white/6"
                      }`}
                    >
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-xl font-bold">{item.count}</p>
                    </button>
                  ))}
                </div>

                {filteredCharGroups.length === 0 ? (
                  <div className="text-center py-12 text-app-text-muted">
                    <p className="text-sm">Chưa có dữ liệu</p>
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {paginatedCharGroups.map(group => {
                      const filteredCount = group.entries.filter(entry => {
                        if (filter === "known") return isLearned(entry.id);
                        if (filter === "unknown") return !isLearned(entry.id);
                        if (filter === "favorites") return favorites[entry.id];
                        return true;
                      }).length;
                      const learnedCount = group.entries.filter(entry => isLearned(entry.id)).length;
                      const pct = group.count > 0 ? Math.round((learnedCount / group.count) * 100) : 0;

                      return (
                        <button
                          key={group.char}
                          onClick={() => startFlashcard(group.char)}
                          disabled={filteredCount === 0}
                          className="bg-app-card/50 border border-app-border rounded-xl p-4 hover:border-rose-500/30 hover:bg-rose-500/8 transition-all cursor-pointer text-left group disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 flex items-center justify-center bg-rose-500/15 rounded-lg text-2xl font-bold text-rose-400 group-hover:bg-rose-500/25 transition-all">
                              {group.char}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white/70 truncate">{group.meaning}</p>
                              <p className="text-[10px] text-app-text-muted">{filteredCount}/{group.count} từ</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-app-text-muted whitespace-nowrap">{learnedCount}/{group.count}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {groupTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setGroupPage(prev => Math.max(1, prev - 1))}
                        disabled={groupPage === 1}
                        className="px-3 py-2 bg-app-card/40 hover:bg-app-card/60 disabled:opacity-30 text-white rounded-xl text-sm cursor-pointer"
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      {Array.from({ length: Math.min(groupTotalPages, 5) }, (_, i) => {
                        const p = groupTotalPages <= 5 ? i + 1 : groupPage <= 3 ? i + 1 : groupPage >= groupTotalPages - 2 ? groupTotalPages - 4 + i : groupPage - 2 + i;
                        return (
                          <button
                            key={p}
                            onClick={() => setGroupPage(p)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                              groupPage === p ? "bg-rose-400 text-app-bg" : "bg-app-card/40 hover:bg-app-card/60 text-white/70"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setGroupPage(prev => Math.min(groupTotalPages, prev + 1))}
                        disabled={groupPage === groupTotalPages}
                        className="px-3 py-2 bg-app-card/40 hover:bg-app-card/60 disabled:opacity-30 text-white rounded-xl text-sm cursor-pointer"
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                      <span className="text-app-text-muted text-sm ml-2">Trang {groupPage}/{groupTotalPages}</span>
                    </div>
                  )}
                  </>
                )}
              </>
            )}
          </div>
        ) : card ? (
          <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
            <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
              <button onClick={goBack} className="flex items-center gap-1.5 text-app-text-muted hover:text-white/70 cursor-pointer text-sm">
                <i className="ri-arrow-left-line"></i>Quay lại
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-rose-400">{currentGroup?.char}</span>
                <span className="text-sm text-white/60">· {currentGroup?.meaning}</span>
              </div>
              <button onClick={() => navigate(`/hanja-pro/${card.slug}`)} className="text-xs text-app-text-muted hover:text-rose-300 cursor-pointer">
                Chi tiết
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-app-text-muted">{flashIdx + 1} / {currentEntries.length}</span>
              <div className="w-64 h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${((flashIdx + 1) / currentEntries.length) * 100}%` }} />
              </div>
              <span className="text-xs text-app-text-muted">{currentEntries.filter(entry => isLearned(entry.id)).length} đã học</span>
            </div>

            <div
              onClick={() => setFlashFlipped(prev => !prev)}
              className="w-full max-w-lg aspect-[3/4] cursor-pointer select-none"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{ transformStyle: "preserve-3d", transform: flashFlipped ? "rotateY(180deg)" : "rotateY(0)" }}
              >
                <div className="absolute inset-0 rounded-3xl border-2 border-rose-500/30 bg-gradient-to-br from-[#1e2030] to-[#1a1d27] p-8 flex flex-col items-center justify-center shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
                  <p className="text-6xl font-black text-white/90 mb-4">{card.hangul}</p>
                  <p className="text-4xl font-bold text-rose-400 mb-6">{card.hanja}</p>
                  <button
                    onClick={e => { e.stopPropagation(); playTTS(card.hangul); }}
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer transition-all"
                  >
                    <i className="ri-volume-up-line text-2xl"></i>
                  </button>
                  <p className="text-sm text-app-text-muted mt-8"><i className="ri-arrow-left-right-line mr-2"></i>Nhấn hoặc Space để lật</p>
                </div>

                <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-[#1a2420] to-[#1a1d27] p-6 flex flex-col overflow-y-auto shadow-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <p className="text-xl font-bold text-app-accent-success mb-4">{card.meaning_vn || "Đang cập nhật nghĩa"}</p>

                  {card.hanja_breakdown?.length ? (
                    <div className="mb-4">
                      <p className="text-xs text-app-text-muted font-semibold mb-2">Phân tích chữ Hán</p>
                      <div className="space-y-2">
                        {card.hanja_breakdown.map((item, index) => (
                          <div key={`${item.char}-${index}`} className="flex items-start gap-2 rounded-xl bg-white/6 border border-app-border p-2">
                            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 font-bold">{item.char}</span>
                            <div>
                              <p className="text-sm text-white/75">{item.meaning}</p>
                              {item.reading && <p className="text-xs text-app-text-muted">{item.reading}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {card.examples?.length ? (
                    <div className="mb-4">
                      <p className="text-xs text-app-text-muted font-semibold mb-2">Ví dụ</p>
                      {card.examples.slice(0, 6).map((example, index) => (
                        <div key={`${example.ko}-${index}`} className="mb-2">
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-white/70 flex-1">{example.ko}</p>
                            <button onClick={e => { e.stopPropagation(); playTTS(example.ko); }} className="text-app-text-muted hover:text-rose-400 cursor-pointer flex-shrink-0">
                              <i className="ri-volume-up-line text-sm"></i>
                            </button>
                          </div>
                          <p className="text-xs text-app-text-secondary italic">{example.vi}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {card.mnemonic && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-auto">
                      <p className="text-xs text-amber-400 font-semibold mb-1"><i className="ri-lightbulb-line mr-1"></i>Mẹo nhớ</p>
                      <p className="text-xs text-amber-400/70 leading-relaxed">{card.mnemonic}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => { setFlashFlipped(false); setFlashIdx(prev => Math.max(prev - 1, 0)); }}
                disabled={flashIdx === 0}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:bg-white/15 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </button>

              <button
                onClick={() => toggleKnown(card.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  isKnown
                    ? "bg-emerald-500/20 text-app-accent-success border border-emerald-500/30"
                    : "bg-white/8 text-white/50 border border-app-border hover:bg-emerald-500/15 hover:text-app-accent-success"
                }`}
              >
                <i className={`${isKnown ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"} text-lg`}></i>
                {isKnown ? "Đã học" : "Đã học"}
              </button>

              <button
                onClick={() => toggleFavorite(card.id)}
                className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-all ${
                  isFavorite ? "bg-amber-500/20 text-amber-400" : "bg-white/8 text-white/50 hover:bg-amber-500/15 hover:text-amber-400"
                }`}
              >
                <i className={`${isFavorite ? "ri-star-fill" : "ri-star-line"} text-xl`}></i>
              </button>

              <button
                onClick={() => { setFlashFlipped(false); setFlashIdx(prev => Math.min(prev + 1, currentEntries.length - 1)); }}
                disabled={flashIdx >= currentEntries.length - 1}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:bg-white/15 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </button>
            </div>

            <p className="text-xs text-app-text-muted mt-6">
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">Space</kbd> lật ·{" "}
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">←→</kbd> qua lại ·{" "}
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">L</kbd> đã học ·{" "}
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">F</kbd> yêu thích ·{" "}
              <kbd className="px-2 py-1 bg-white/8 rounded text-xs">Esc</kbd> thoát
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen text-app-text-muted">
            <p>Không có từ nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      <VipUpgradeModal
        open={vipModal}
        onClose={() => setVipModal(false)}
        reason={user ? "not_vip" : "not_logged_in"}
        featureName="Flashcard Hán Hàn"
      />
      <ToastComponent />
    </DashboardLayout>
  );
}
