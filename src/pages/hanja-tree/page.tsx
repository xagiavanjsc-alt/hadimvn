import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

// ─── Tree Quiz Modal ──────────────────────────────────────────────────────────
function TreeQuizModal({ nodes, learnedSet, rootChar, rootMeaning, onClose }: {
  nodes: HanjaTreeNode[];
  learnedSet: Set<string>;
  rootChar: string;
  rootMeaning: string;
  onClose: () => void;
}) {
  const [quizMode, setQuizMode] = useState<"kr-to-vi" | "vi-to-kr">("kr-to-vi");
  const [quizType, setQuizType] = useState<"all" | "learned" | "unlearned">("all");

  const pool = useMemo(() => {
    if (quizType === "learned") return nodes.filter(n => learnedSet.has(n.korean));
    if (quizType === "unlearned") return nodes.filter(n => !learnedSet.has(n.korean));
    return nodes;
  }, [nodes, learnedSet, quizType]);

  const [cards, setCards] = useState<(HanjaTreeNode & { showAnswer: boolean })[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const startQuiz = useCallback(() => {
    if (pool.length === 0) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(20, pool.length));
    setCards(shuffled.map(n => ({ ...n, showAnswer: false })));
    setCurrentIdx(0);
    setScore({ correct: 0, wrong: 0 });
    setFinished(false);
    setSelectedOption(null);
    setStarted(true);
  }, [pool]);

  const generateOptions = useCallback((card: HanjaTreeNode, allNodes: HanjaTreeNode[], mode: "kr-to-vi" | "vi-to-kr") => {
    const correct = mode === "kr-to-vi" ? card.vietnamese : card.korean;
    const pool2 = allNodes.filter(n => n.korean !== card.korean).map(n => mode === "kr-to-vi" ? n.vietnamese : n.korean).filter((v, i, arr) => arr.indexOf(v) === i);
    const wrong = pool2.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (started && cards[currentIdx] && nodes.length >= 4) {
      setOptions(generateOptions(cards[currentIdx], nodes, quizMode));
      setSelectedOption(null);
    }
  }, [currentIdx, quizMode, started, cards, nodes, generateOptions]);

  const currentCard = cards[currentIdx];
  const correctAnswer = currentCard ? (quizMode === "kr-to-vi" ? currentCard.vietnamese : currentCard.korean) : "";

  const handleAnswer = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const isCorrect = option === correctAnswer;
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), wrong: s.wrong + (isCorrect ? 0 : 1) }));
    setTimeout(() => {
      if (currentIdx + 1 >= cards.length) setFinished(true);
      else setCurrentIdx(i => i + 1);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-rose-500/20 rounded-xl text-base font-bold text-rose-400">{rootChar}</div>
            <div>
              <p className="text-sm font-bold text-white/80">Ôn tập cây &ldquo;{rootMeaning}&rdquo;</p>
              <p className="text-xs text-white/40">{nodes.length} từ trong cây này</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/12 text-white/40 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        {!started ? (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-white/50 mb-2">Chế độ quiz:</p>
              <div className="grid grid-cols-2 gap-2">
                {(["kr-to-vi", "vi-to-kr"] as const).map(m => (
                  <button key={m} onClick={() => setQuizMode(m)}
                    className={`py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap border-2 transition-all ${
                      quizMode === m ? "border-rose-500/60 bg-rose-500/15 text-rose-400" : "border-white/10 text-white/50 hover:border-white/20"
                    }`}>
                    {m === "kr-to-vi" ? "Hàn → Việt" : "Việt → Hàn"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/50 mb-2">Từ cần ôn:</p>
              <div className="grid grid-cols-3 gap-2">
                {(["all", "learned", "unlearned"] as const).map(t => {
                  const count = t === "all" ? nodes.length : t === "learned" ? nodes.filter(n => learnedSet.has(n.korean)).length : nodes.filter(n => !learnedSet.has(n.korean)).length;
                  return (
                    <button key={t} onClick={() => setQuizType(t)}
                      className={`py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap border-2 transition-all ${
                        quizType === t ? "border-rose-500/60 bg-rose-500/15 text-rose-400" : "border-white/10 text-white/50 hover:border-white/20"
                      }`}>
                      {t === "all" ? "Tất cả" : t === "learned" ? "Đã học" : "Chưa học"}
                      <span className="block text-[10px] font-normal mt-0.5">{count} từ</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={startQuiz} disabled={pool.length === 0}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {pool.length === 0 ? "Không có từ để ôn" : `Bắt đầu ôn ${Math.min(20, pool.length)} từ`}
            </button>
          </div>
        ) : finished ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: score.correct / (score.correct + score.wrong) >= 0.7 ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)" }}>
              <i className={`text-3xl ${score.correct / (score.correct + score.wrong) >= 0.7 ? "ri-trophy-line text-emerald-400" : "ri-emotion-sad-line text-rose-400"}`}></i>
            </div>
            <h3 className="text-2xl font-black text-white/90 mb-1">{Math.round((score.correct / (score.correct + score.wrong)) * 100)}%</h3>
            <p className="text-sm text-white/50 mb-4">{score.correct}/{score.correct + score.wrong} câu đúng</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"><p className="text-2xl font-bold text-emerald-400">{score.correct}</p><p className="text-xs text-emerald-500/70">Đúng</p></div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-2xl font-bold text-red-400">{score.wrong}</p><p className="text-xs text-red-500/70">Sai</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={startQuiz} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap text-sm">Ôn lại</button>
              <button onClick={onClose} className="flex-1 py-2.5 bg-white/8 hover:bg-white/12 text-white/70 font-bold rounded-xl cursor-pointer whitespace-nowrap text-sm">Đóng</button>
            </div>
          </div>
        ) : currentCard ? (
          <div className="p-5">
            <div className="flex items-center justify-between text-xs text-white/40 mb-3">
              <span>{currentIdx + 1}/{cards.length}</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-medium">{score.correct} đúng</span>
                <button onClick={() => setQuizMode(m => m === "kr-to-vi" ? "vi-to-kr" : "kr-to-vi")}
                  className="px-2 py-0.5 rounded-full bg-white/8 hover:bg-white/12 text-white/50 cursor-pointer">
                  {quizMode === "kr-to-vi" ? "HK→VN" : "VN→HK"}
                </button>
              </div>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${(currentIdx / cards.length) * 100}%` }} />
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center mb-4">
              {quizMode === "kr-to-vi" ? (
                <>
                  <p className="text-4xl font-black text-white/90 mb-1">{currentCard.korean}</p>
                  <p className="text-lg text-rose-400 font-bold">{currentCard.hanja}</p>
                  {currentCard.pronunciation && <p className="text-sm text-white/40 mt-1">[{currentCard.pronunciation}]</p>}
                  <p className="text-xs text-white/30 mt-2">Nghĩa tiếng Việt là gì?</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white/80 mb-1">{currentCard.vietnamese}</p>
                  <p className="text-xs text-white/30 mt-2">Từ tiếng Hàn tương ứng là gì?</p>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {options.map(opt => {
                const isCorrect = opt === correctAnswer;
                const isSelected = opt === selectedOption;
                let cls = "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/8";
                if (selectedOption) {
                  if (isCorrect) cls = "border-emerald-500/50 bg-emerald-500/15 text-emerald-400";
                  else if (isSelected) cls = "border-red-500/50 bg-red-500/15 text-red-400";
                  else cls = "border-white/5 bg-white/3 text-white/30";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selectedOption}
                    className={`border-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${cls}`}>
                    {opt}
                    {selectedOption && isCorrect && <i className="ri-check-line ml-1 text-emerald-400"></i>}
                    {selectedOption && isSelected && !isCorrect && <i className="ri-close-line ml-1 text-red-400"></i>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface HanjaTreeNode {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  meaning_detail: string;
  examples: { korean: string; vietnamese: string; pronunciation?: string }[];
  related_words: { word: string; meaning: string }[];
  memory_tip: string;
  hanja_chars: string[];
  root_char: string;
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

const ROOT_MEANINGS: Record<string, string> = {
  "人": "Người",
  "大": "Lớn",
  "國": "Quốc gia",
  "學": "Học",
  "心": "Tâm/Lòng",
};

const DIFF_CONFIG = {
  1: { label: "Dễ", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  2: { label: "TB", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  3: { label: "Khó", cls: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
};

const LEARNED_KEY = "hanja_tree_learned";

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function loadLearned(): Set<string> {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveLearned(set: Set<string>) {
  localStorage.setItem(LEARNED_KEY, JSON.stringify(Array.from(set)));
}

// ─── Node Detail Panel (bottom horizontal) ───────────────────────────────────
function NodeDetailPanel({
  node,
  isLearned,
  onToggleLearned,
  onClose,
}: {
  node: HanjaTreeNode;
  isLearned: boolean;
  onToggleLearned: () => void;
  onClose: () => void;
}) {
  const diff = DIFF_CONFIG[node.difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG[1];
  return (
    <div className="border-t border-white/8 bg-[#1a1d27] flex-shrink-0" style={{ maxHeight: "340px" }}>
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white/90">{node.korean}</span>
            <span className="text-lg text-rose-400 font-bold">{node.hanja}</span>
            <button onClick={() => speakKorean(node.korean)} className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer transition-all">
              <i className="ri-volume-up-line text-xs"></i>
            </button>
          </div>
          <span className="text-sm text-white/40">{node.pronunciation}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${diff.cls}`}>{diff.label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/40">{node.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLearned}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
              isLearned
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-white/8 text-white/50 border border-white/10 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
          >
            <i className={`${isLearned ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"} text-sm`}></i>
            {isLearned ? "Đã học" : "Đánh dấu đã học"}
          </button>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 cursor-pointer transition-all">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto h-full" style={{ maxHeight: "290px" }}>
        <div className="flex-shrink-0 w-56 p-4 border-r border-white/8 overflow-y-auto">
          <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Nghĩa</p>
          <p className="text-sm font-semibold text-white/80 mb-2">{node.vietnamese}</p>
          {node.meaning_detail && <p className="text-xs text-white/40 leading-relaxed">{node.meaning_detail}</p>}
          {node.hanja_chars?.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1.5">Phân tích Hán tự</p>
              <div className="flex flex-wrap gap-1.5">
                {node.hanja_chars.map((char, i) => (
                  <div key={i} className="flex items-center gap-1 bg-rose-500/15 rounded-lg px-2 py-1 border border-rose-500/20">
                    <span className="text-sm font-bold text-rose-400">{char}</span>
                    <span className="text-[10px] text-white/40">{ROOT_MEANINGS[char] || "..."}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {node.memory_tip && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
              <p className="text-[10px] text-amber-400 font-semibold mb-1"><i className="ri-lightbulb-line mr-1"></i>Mẹo nhớ</p>
              <p className="text-xs text-amber-400/70 leading-relaxed">{node.memory_tip}</p>
            </div>
          )}
        </div>

        {node.examples?.length > 0 && (
          <div className="flex-shrink-0 w-72 p-4 border-r border-white/8 overflow-y-auto">
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Ví dụ ({node.examples.length})</p>
            <div className="space-y-2">
              {node.examples.map((ex, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-2.5">
                  <div className="flex items-start gap-1.5">
                    <span className="text-[10px] text-white/20 font-bold mt-0.5 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1">
                        <p className="text-xs text-white/80 font-medium flex-1">{ex.korean}</p>
                        <button onClick={() => speakKorean(ex.korean)} className="text-white/20 hover:text-rose-400 cursor-pointer flex-shrink-0">
                          <i className="ri-volume-up-line text-xs"></i>
                        </button>
                      </div>
                      {ex.pronunciation && <p className="text-[10px] text-white/30">[{ex.pronunciation}]</p>}
                      <p className="text-[10px] text-white/40 italic mt-0.5">{ex.vietnamese}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {node.related_words?.length > 0 && (
          <div className="flex-shrink-0 w-52 p-4 overflow-y-auto">
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Từ liên quan</p>
            <div className="space-y-1.5">
              {node.related_words.map((rw, i) => (
                <div key={i} className="flex items-center justify-between bg-rose-500/10 rounded-lg px-2.5 py-2 border border-rose-500/20">
                  <button onClick={() => speakKorean(rw.word)} className="text-sm font-semibold text-rose-400 cursor-pointer hover:text-rose-300 flex items-center gap-1">
                    {rw.word}
                    <i className="ri-volume-up-line text-[10px] text-rose-500/60"></i>
                  </button>
                  <span className="text-xs text-rose-400/70">{rw.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tree Node Card ───────────────────────────────────────────────────────────
function TreeNodeCard({
  node,
  isSelected,
  isLearned,
  onSelect,
}: {
  node: HanjaTreeNode;
  isSelected: boolean;
  isLearned: boolean;
  onSelect: () => void;
}) {
  const diff = DIFF_CONFIG[node.difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG[1];
  return (
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-4 bg-rose-500/30 flex-shrink-0"></div>

      <div
        onClick={onSelect}
        className={`w-full border-2 rounded-xl p-3 cursor-pointer transition-all relative ${
          isSelected ? "border-rose-500/60 bg-rose-500/10" : isLearned ? "border-emerald-500/30 bg-emerald-500/8" : "border-white/10 bg-white/5 hover:border-rose-500/30 hover:bg-rose-500/8"
        }`}
      >
        {isLearned && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20">
            <i className="ri-check-line text-emerald-400 text-[10px]"></i>
          </div>
        )}
        <div className="flex items-start gap-1 mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white/90 leading-tight">{node.korean}</p>
            <p className="text-sm text-rose-400 font-semibold">{node.hanja}</p>
          </div>
        </div>
        <p className="text-[10px] text-white/30 mb-1">{node.pronunciation}</p>
        <p className="text-xs text-white/50 line-clamp-2 mb-2">{node.vietnamese}</p>

        <div className="flex items-center gap-1 flex-wrap">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${diff.cls}`}>{diff.label}</span>
          <button
            onClick={e => { e.stopPropagation(); speakKorean(node.korean); }}
            className="ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-white/8 text-white/30 hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer flex-shrink-0"
          >
            <i className="ri-volume-up-line text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Import Guide ─────────────────────────────────────────────────────────────
function ImportGuidePanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/8">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer">
        <div className="w-6 h-6 flex items-center justify-center bg-amber-500/20 rounded-md flex-shrink-0">
          <i className="ri-file-excel-2-line text-amber-400 text-xs"></i>
        </div>
        <span className="text-xs font-semibold text-white/50 flex-1">Hướng dẫn import Excel</span>
        <i className={`${open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-white/30 text-sm`}></i>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-amber-400 mb-1.5">Cột bắt buộc:</p>
            {[
              ["korean", "Từ tiếng Hàn (VD: 인간)"],
              ["hanja", "Chữ Hán (VD: 人間)"],
              ["vietnamese", "Nghĩa tiếng Việt"],
              ["root_char", "Chữ Hán gốc (VD: 人)"],
              ["pronunciation", "Phiên âm"],
            ].map(([col, desc]) => (
              <div key={col} className="flex items-start gap-1.5 mb-1">
                <code className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-mono flex-shrink-0">{col}</code>
                <span className="text-[10px] text-amber-400/70">{desc}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/8 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-white/40 mb-1.5">Cột tùy chọn:</p>
            {[
              ["meaning_detail", "Giải nghĩa chi tiết"],
              ["examples", "JSON: [{korean, vietnamese}]"],
              ["related_words", "JSON: [{word, meaning}]"],
              ["memory_tip", "Mẹo nhớ"],
              ["difficulty", "1=Dễ, 2=TB, 3=Khó"],
              ["category", "Danh mục (VD: Danh từ)"],
            ].map(([col, desc]) => (
              <div key={col} className="flex items-start gap-1.5 mb-1">
                <code className="text-[9px] bg-white/10 text-white/50 px-1 py-0.5 rounded font-mono flex-shrink-0">{col}</code>
                <span className="text-[10px] text-white/30">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HanjaTreePage() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<HanjaTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState<string>("人");
  const [selectedNode, setSelectedNode] = useState<HanjaTreeNode | null>(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [learnedSet, setLearnedSet] = useState<Set<string>>(loadLearned);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAdvFilter, setShowAdvFilter] = useState(false);

  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("hanja_tree_nodes")
        .select("*")
        .order("root_char", { ascending: true })
        .order("korean", { ascending: true });
      if (data) {
        const parsed = data.map((n: Record<string, unknown>) => ({
          ...n,
          examples: (n.examples as { korean: string; vietnamese: string }[]) || [],
          related_words: (n.related_words as { word: string; meaning: string }[]) || [],
          hanja_chars: (n.hanja_chars as string[]) || [],
        })) as HanjaTreeNode[];
        setNodes(parsed);
      }
      setLoading(false);
    };
    fetchNodes();
  }, []);

  const treeGroups = useMemo((): TreeGroup[] => {
    const groups: Record<string, HanjaTreeNode[]> = {};
    nodes.forEach(n => {
      if (!groups[n.root_char]) groups[n.root_char] = [];
      groups[n.root_char].push(n);
    });
    return Object.entries(groups).map(([rootChar, grpNodes]) => ({
      rootChar,
      rootMeaning: ROOT_MEANINGS[rootChar] || rootChar,
      nodes: grpNodes,
      count: grpNodes.length,
    }));
  }, [nodes]);

  const currentGroup = useMemo(
    () => treeGroups.find(g => g.rootChar === selectedRoot),
    [treeGroups, selectedRoot]
  );

  // Collect unique categories and levels from current group
  const availableCategories = useMemo(() => {
    const cats = new Set((currentGroup?.nodes || []).map(n => n.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [currentGroup]);

  const availableLevels = useMemo(() => {
    const lvls = new Set((currentGroup?.nodes || []).map(n => n.level).filter(l => l > 0));
    return Array.from(lvls).sort((a, b) => a - b);
  }, [currentGroup]);

  const filteredNodes = useMemo(() => {
    let list = currentGroup?.nodes || [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(n =>
        n.korean.includes(q) || n.hanja.includes(q) ||
        n.vietnamese.toLowerCase().includes(q) ||
        n.pronunciation?.toLowerCase().includes(q)
      );
    }
    if (diffFilter !== null) list = list.filter(n => n.difficulty === diffFilter);
    if (categoryFilter !== null) list = list.filter(n => n.category === categoryFilter);
    if (levelFilter !== null) list = list.filter(n => n.level === levelFilter);
    return list;
  }, [currentGroup, search, diffFilter, categoryFilter, levelFilter]);

  const activeFilterCount = [diffFilter, categoryFilter, levelFilter].filter(f => f !== null).length;

  const toggleLearned = useCallback((korean: string) => {
    setLearnedSet(prev => {
      const next = new Set(prev);
      next.has(korean) ? next.delete(korean) : next.add(korean);
      saveLearned(next);
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((node: HanjaTreeNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  // Stats for current group
  const groupLearnedCount = useMemo(() =>
    (currentGroup?.nodes || []).filter(n => learnedSet.has(n.korean)).length,
    [currentGroup, learnedSet]
  );
  const totalLearned = useMemo(() =>
    nodes.filter(n => learnedSet.has(n.korean)).length,
    [nodes, learnedSet]
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left sidebar */}
        <div className="w-60 bg-[#1a1d27] border-r border-white/8 flex flex-col flex-shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-white/8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 flex items-center justify-center bg-rose-500/20 rounded-lg">
                <i className="ri-git-merge-line text-rose-400 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-white/80">Hán Hàn Hình Cây</h1>
                <p className="text-[10px] text-white/40">{nodes.length} từ · {treeGroups.length} cây</p>
              </div>
              <button
                onClick={() => navigate("/hanja-dashboard")}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer transition-all flex-shrink-0"
                title="Tổng quan tiến độ"
              >
                <i className="ri-bar-chart-2-line text-xs"></i>
              </button>
            </div>
            {/* Overall progress */}
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40">Tổng tiến độ</span>
                <span className="text-[10px] font-bold text-emerald-400">{totalLearned}/{nodes.length}</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${nodes.length > 0 ? (totalLearned / nodes.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-white/8">
            <div className="relative">
              <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
              <input
                type="text"
                placeholder="Tìm từ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/70 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
              />
            </div>
          </div>

          {/* Tree list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <i className="ri-loader-4-line animate-spin text-white/30"></i>
              </div>
            ) : treeGroups.length === 0 ? (
              <div className="text-center py-8 text-white/30">
                <i className="ri-tree-line text-2xl mb-2 block"></i>
                <p className="text-xs">Chưa có dữ liệu</p>
              </div>
            ) : (
              treeGroups.map(group => {
                const gLearned = group.nodes.filter(n => learnedSet.has(n.korean)).length;
                const gPct = group.count > 0 ? Math.round((gLearned / group.count) * 100) : 0;
                return (
                  <button
                    key={group.rootChar}
                    onClick={() => { setSelectedRoot(group.rootChar); setSelectedNode(null); setSearch(""); setDiffFilter(null); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      selectedRoot === group.rootChar ? "bg-rose-500/15 border border-rose-500/30" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 flex items-center justify-center rounded-lg text-base font-bold flex-shrink-0 ${
                      selectedRoot === group.rootChar ? "bg-rose-500 text-white" : "bg-white/8 text-white/60"
                    }`}>
                      {group.rootChar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold ${selectedRoot === group.rootChar ? "text-rose-400" : "text-white/60"}`}>
                          {group.rootMeaning}
                        </p>
                        <span className="text-[10px] text-white/30">{gLearned}/{group.count}</span>
                      </div>
                      <div className="h-1 bg-white/8 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${gPct}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <ImportGuidePanel />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tree header */}
          <div className="border-b border-white/8 bg-[#141720] flex-shrink-0">
            <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 flex items-center justify-center bg-rose-500 text-white rounded-xl text-lg font-bold flex-shrink-0">
                {selectedRoot}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white/80">
                  Cây &ldquo;{ROOT_MEANINGS[selectedRoot] || selectedRoot}&rdquo;
                </h2>
                <p className="text-xs text-white/40">
                  {filteredNodes.length}/{currentGroup?.count || 0} từ · {groupLearnedCount} đã học
                  {activeFilterCount > 0 && <span className="ml-1 text-rose-400 font-medium">({activeFilterCount} bộ lọc)</span>}
                </p>
              </div>

              <button
                onClick={() => setShowAdvFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all border ${
                  showAdvFilter || activeFilterCount > 0
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/8"
                }`}
              >
                <i className="ri-filter-3-line text-sm"></i>
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-rose-500 text-white rounded-full text-[9px] font-bold">{activeFilterCount}</span>
                )}
              </button>

              <div className="flex gap-1 bg-white/8 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`px-2.5 py-1 rounded-md text-xs cursor-pointer whitespace-nowrap transition-all ${viewMode === "tree" ? "bg-white/15 text-rose-400 font-medium" : "text-white/40"}`}
                >
                  <i className="ri-git-merge-line mr-1"></i>Cây
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1 rounded-md text-xs cursor-pointer whitespace-nowrap transition-all ${viewMode === "list" ? "bg-white/15 text-rose-400 font-medium" : "text-white/40"}`}
                >
                  <i className="ri-list-check mr-1"></i>Danh sách
                </button>
              </div>

              <button
                onClick={() => setShowQuiz(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 text-rose-400 text-xs font-medium cursor-pointer hover:bg-rose-500/25 transition-all whitespace-nowrap"
              >
                <i className="ri-brain-line text-sm"></i>
                Ôn tập cây này
              </button>

              <button
                onClick={() => {
                  const allKoreans = filteredNodes.map(n => n.korean);
                  const allLearned = allKoreans.every(k => learnedSet.has(k));
                  setLearnedSet(prev => {
                    const next = new Set(prev);
                    if (allLearned) allKoreans.forEach(k => next.delete(k));
                    else allKoreans.forEach(k => next.add(k));
                    saveLearned(next);
                    return next;
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 text-xs font-medium cursor-pointer hover:bg-emerald-500/25 transition-all whitespace-nowrap"
              >
                <i className="ri-checkbox-multiple-line text-sm"></i>
                {filteredNodes.every(n => learnedSet.has(n.korean)) ? "Bỏ đánh dấu tất cả" : "Đánh dấu tất cả"}
              </button>
            </div>

            {showAdvFilter && (
              <div className="px-5 py-3 border-t border-white/8 bg-white/3 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/40 whitespace-nowrap">Mức độ:</span>
                  <div className="flex items-center gap-1">
                    {[null, 1, 2, 3].map(d => (
                      <button
                        key={d ?? "all"}
                        onClick={() => setDiffFilter(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                          diffFilter === d ? "bg-rose-500 text-white" : "bg-white/8 border border-white/10 text-white/50 hover:bg-white/12"
                        }`}
                      >
                        {d === null ? "Tất cả" : DIFF_CONFIG[d as keyof typeof DIFF_CONFIG].label}
                      </button>
                    ))}
                  </div>
                </div>

                {availableCategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/40 whitespace-nowrap">Loại từ:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => setCategoryFilter(null)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                          categoryFilter === null ? "bg-rose-500 text-white" : "bg-white/8 border border-white/10 text-white/50 hover:bg-white/12"
                        }`}
                      >
                        Tất cả
                      </button>
                      {availableCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                            categoryFilter === cat ? "bg-rose-500 text-white" : "bg-white/8 border border-white/10 text-white/50 hover:bg-white/12"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableLevels.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/40 whitespace-nowrap">Cấp độ:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setLevelFilter(null)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                          levelFilter === null ? "bg-rose-500 text-white" : "bg-white/8 border border-white/10 text-white/50 hover:bg-white/12"
                        }`}
                      >
                        Tất cả
                      </button>
                      {availableLevels.map(lv => (
                        <button
                          key={lv}
                          onClick={() => setLevelFilter(lv === levelFilter ? null : lv)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                            levelFilter === lv ? "bg-rose-500 text-white" : "bg-white/8 border border-white/10 text-white/50 hover:bg-white/12"
                          }`}
                        >
                          Cấp {lv}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setDiffFilter(null); setCategoryFilter(null); setLevelFilter(null); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap text-red-400 hover:bg-red-500/10 transition-all ml-auto"
                  >
                    <i className="ri-close-circle-line"></i>Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tree content */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-white/30">
                  <i className="ri-loader-4-line animate-spin text-lg"></i>
                  <span className="text-sm">Đang tải...</span>
                </div>
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/30">
                <div className="text-center">
                  <i className="ri-search-line text-4xl mb-2"></i>
                  <p className="text-sm">Không tìm thấy từ nào</p>
                  {search && <button onClick={() => setSearch("")} className="mt-2 text-xs text-rose-400 hover:text-rose-300 cursor-pointer">Xóa tìm kiếm</button>}
                </div>
              </div>
            ) : viewMode === "tree" ? (
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 flex items-center justify-center bg-rose-500 text-white rounded-2xl text-2xl font-bold">
                      {selectedRoot}
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/40 whitespace-nowrap font-medium">
                      {ROOT_MEANINGS[selectedRoot] || selectedRoot}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-5 bg-rose-500/30 mt-1"></div>
                  </div>
                </div>

                <div className="flex justify-center mt-2 mb-0">
                  <div className="w-full max-w-4xl h-0.5 bg-rose-500/20 relative">
                    {filteredNodes.map((_, i) => {
                      const total = filteredNodes.length;
                      const left = total > 1 ? (i / (total - 1)) * 100 : 50;
                      return (
                        <div key={i} className="absolute top-0 w-0.5 h-3 bg-rose-500/20" style={{ left: `${left}%`, transform: "translateX(-50%)" }} />
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-0">
                  {filteredNodes.map(node => (
                    <TreeNodeCard
                      key={node.id}
                      node={node}
                      isSelected={selectedNode?.id === node.id}
                      isLearned={learnedSet.has(node.korean)}
                      onSelect={() => handleSelectNode(node)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_70px_1fr_70px_80px_36px] bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/40 border-b border-white/8">
                    <span>Tiếng Hàn</span><span>Hán tự</span><span>Nghĩa</span><span>Mức độ</span><span>Trạng thái</span><span></span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {filteredNodes.map((node, i) => {
                      const diff = DIFF_CONFIG[node.difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG[1];
                      const isLearned = learnedSet.has(node.korean);
                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectNode(node)}
                          className={`grid grid-cols-[1fr_70px_1fr_70px_80px_36px] px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer items-center ${selectedNode?.id === node.id ? "bg-rose-500/8" : ""}`}
                        >
                          <div>
                            <span className="text-sm font-bold text-white/90">{node.korean}</span>
                            <span className="text-xs text-white/30 ml-1.5">{node.pronunciation}</span>
                          </div>
                          <span className="text-sm font-bold text-rose-400">{node.hanja}</span>
                          <span className="text-xs text-white/50 truncate">{node.vietnamese}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border w-fit ${diff.cls}`}>{diff.label}</span>
                          <button
                            onClick={e => { e.stopPropagation(); toggleLearned(node.korean); }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer whitespace-nowrap transition-all w-fit ${
                              isLearned ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/40 hover:bg-emerald-500/15 hover:text-emerald-400"
                            }`}
                          >
                            <i className={`${isLearned ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"} text-xs`}></i>
                            {isLearned ? "Đã học" : "Chưa học"}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); speakKorean(node.korean); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/8 text-white/30 hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
                          >
                            <i className="ri-volume-up-line text-xs"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              isLearned={learnedSet.has(selectedNode.korean)}
              onToggleLearned={() => toggleLearned(selectedNode.korean)}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>

      {/* Tree Quiz Modal */}
      {showQuiz && currentGroup && (
        <TreeQuizModal
          nodes={currentGroup.nodes}
          learnedSet={learnedSet}
          rootChar={selectedRoot}
          rootMeaning={ROOT_MEANINGS[selectedRoot] || selectedRoot}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </DashboardLayout>
  );
}
