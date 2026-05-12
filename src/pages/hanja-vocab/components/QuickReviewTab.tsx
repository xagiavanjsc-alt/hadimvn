import { useState, useMemo, useCallback, useRef } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const ALPHABET_GROUPS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getInitial(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0];
  const idx = Math.floor(code / 588);
  const initials = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  return initials[idx] || char[0];
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

interface SessionResult {
  known: number;
  unknown: number;
  total: number;
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
function SwipeCard({
  entry,
  onKnow,
  onDontKnow,
}: {
  entry: HanjaEntry;
  onKnow: () => void;
  onDontKnow: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setDragging(true);
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (dragX > 80) {
      triggerExit("right");
    } else if (dragX < -80) {
      triggerExit("left");
    } else {
      setDragX(0);
    }
  };

  const triggerExit = (dir: "left" | "right") => {
    setExiting(dir);
    setTimeout(() => {
      if (dir === "right") onKnow();
      else onDontKnow();
    }, 300);
  };

  const rotation = dragX * 0.08;
  const opacity = exiting ? 0 : Math.max(0.3, 1 - Math.abs(dragX) / 300);

  const knowOpacity = Math.min(1, Math.max(0, dragX / 80));
  const dontKnowOpacity = Math.min(1, Math.max(0, -dragX / 80));

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Hint labels */}
      <div className="flex justify-between w-full max-w-sm mb-3 px-2">
        <div className="flex items-center gap-1 text-sm font-semibold text-red-400" style={{ opacity: dontKnowOpacity }}>
          <i className="ri-close-circle-line text-lg"></i>Chưa biết
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-green-500" style={{ opacity: knowOpacity }}>
          Đã biết<i className="ri-checkbox-circle-line text-lg"></i>
        </div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full max-w-sm cursor-grab active:cursor-grabbing"
        style={{
          transform: exiting === "right"
            ? "translateX(120%) rotate(20deg)"
            : exiting === "left"
            ? "translateX(-120%) rotate(-20deg)"
            : `translateX(${dragX}px) rotate(${rotation}deg)`,
          opacity,
          transition: dragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        }}
      >
        <div
          className="bg-white border-2 rounded-2xl p-8 text-center"
          style={{
            borderColor: dragX > 40 ? "#22c55e" : dragX < -40 ? "#ef4444" : "#f3f4f6",
          }}
        >
          <p className="text-xs text-gray-400 tracking-normal mb-3">Tiếng Hàn</p>
          <p className="text-5xl font-bold text-gray-900 mb-2">{entry.korean}</p>
          <p className="text-2xl text-rose-400 font-bold mb-4">{entry.hanja}</p>

          {!revealed ? (
            <button
              onClick={() => { setRevealed(true); speakKorean(entry.korean); }}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
            >
              Hiện nghĩa
            </button>
          ) : (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xl font-semibold text-gray-700">{entry.vietnamese}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {revealed && (
        <div className="flex gap-4 mt-5">
          <button
            onClick={() => triggerExit("left")}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-semibold cursor-pointer hover:bg-red-100 transition-all"
          >
            <i className="ri-close-line text-lg"></i>Chưa biết
          </button>
          <button
            onClick={() => triggerExit("right")}
            className="flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-200 text-green-600 rounded-xl font-semibold cursor-pointer hover:bg-green-100 transition-all"
          >
            Đã biết<i className="ri-check-line text-lg"></i>
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">Kéo sang phải = Đã biết · Kéo sang trái = Chưa biết</p>
    </div>
  );
}

// ─── Main QuickReviewTab ──────────────────────────────────────────────────────
export default function QuickReviewTab({ favs }: { favs: Set<string> }) {
  const HANJA_DATA = useHanjaData();
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState<HanjaEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());
  const [unknownSet, setUnknownSet] = useState<Set<string>>(new Set());

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const pool = useMemo(() => {
    let data = HANJA_DATA;
    if (selectedInitial) data = data.filter(d => getInitial(d.korean[0]) === selectedInitial);
    if (onlyFavs) data = data.filter(d => favs.has(d.korean));
    if (onlyNew) data = data.filter(d => !srData[d.korean]);
    return data;
  }, [selectedInitial, onlyFavs, onlyNew, favs, srData]);

  const startSession = useCallback(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 30);
    setQueue(shuffled);
    setIdx(0);
    setResult(null);
    setKnownSet(new Set());
    setUnknownSet(new Set());
    setStarted(true);
  }, [pool]);

  const handleKnow = useCallback(() => {
    const current = queue[idx];
    if (!current) return;
    setKnownSet(prev => new Set([...prev, current.korean]));
    // Mark as mastered in SR
    const existing = srData[current.korean];
    const now = Date.now();
    const updated = {
      ...srData,
      [current.korean]: {
        korean: current.korean,
        interval: 21,
        easeFactor: existing?.easeFactor ?? 2.5,
        dueDate: now + 21 * 86400000,
        totalReviews: (existing?.totalReviews ?? 0) + 1,
        correctStreak: (existing?.correctStreak ?? 0) + 1,
      },
    };
    localStorage.setItem(SR_KEY, JSON.stringify(updated));
    advance();
  }, [idx, queue, srData]);

  const handleDontKnow = useCallback(() => {
    const current = queue[idx];
    if (!current) return;
    setUnknownSet(prev => new Set([...prev, current.korean]));
    advance();
  }, [idx, queue]);

  const advance = useCallback(() => {
    setIdx(prev => {
      const next = prev + 1;
      if (next >= queue.length) {
        setResult({
          known: knownSet.size + 1,
          unknown: unknownSet.size,
          total: queue.length,
        });
        setStarted(false);
        return prev;
      }
      return next;
    });
  }, [queue.length, knownSet.size, unknownSet.size]);

  const currentCard = queue[idx];

  if (!started && !result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 flex items-center justify-center bg-rose-100 rounded-2xl mx-auto mb-3">
              <i className="ri-flashlight-line text-rose-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Quick Review</h2>
            <p className="text-sm text-gray-500">Ôn nhanh — kéo phải nếu biết, kéo trái nếu chưa biết</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => setOnlyFavs(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${onlyFavs ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600"}`}>
              <i className="ri-heart-line"></i>Yêu thích ({favs.size})
            </button>
            <button onClick={() => setOnlyNew(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${onlyNew ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}>
              <i className="ri-seedling-line"></i>Chỉ từ mới
            </button>
          </div>

          {/* Group filter */}
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2">Lọc theo nhóm chữ cái</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSelectedInitial(null)}
                className={`px-2.5 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap transition-all ${!selectedInitial ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                Tất cả ({HANJA_DATA.length})
              </button>
              {ALPHABET_GROUPS.map(g => {
                const cnt = HANJA_DATA.filter(d => getInitial(d.korean[0]) === g).length;
                if (cnt === 0) return null;
                return (
                  <button key={g} onClick={() => setSelectedInitial(selectedInitial === g ? null : g)}
                    className={`px-2.5 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap transition-all ${selectedInitial === g ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {g} ({cnt})
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={startSession} disabled={pool.length === 0}
            className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Bắt đầu ({Math.min(30, pool.length)} từ)
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const pct = Math.round((result.known / result.total) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-100" : pct >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
            <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-600" : pct >= 50 ? "ri-emotion-normal-line text-amber-600" : "ri-emotion-sad-line text-red-500"}`}></i>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{pct}%</p>
          <p className="text-gray-500 mb-1">Đã biết {result.known} / {result.total} từ</p>
          <p className="text-sm text-gray-400 mb-2">
            {pct >= 80 ? "Xuất sắc! Bạn nhớ rất tốt!" : pct >= 50 ? "Khá tốt! Tiếp tục ôn nhé!" : "Cần ôn thêm! Đừng nản lòng!"}
          </p>
          <p className="text-xs text-green-600 mb-6">Các từ bạn biết đã được đánh dấu &ldquo;Đã thuộc&rdquo; tự động</p>
          <div className="flex gap-3">
            <button onClick={startSession}
              className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
              Ôn lại
            </button>
            <button onClick={() => { setResult(null); setStarted(false); }}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
              Đổi bộ lọc
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { setStarted(false); setResult(null); }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="ri-arrow-left-line"></i>Dừng
        </button>
        <span className="text-sm text-gray-500">{idx + 1} / {queue.length}</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-600 font-semibold">✓ {knownSet.size}</span>
          <span className="text-red-400 font-semibold">✗ {unknownSet.size}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${(idx / queue.length) * 100}%` }}></div>
      </div>

      {currentCard && (
        <SwipeCard
          key={currentCard.korean}
          entry={currentCard}
          onKnow={handleKnow}
          onDontKnow={handleDontKnow}
        />
      )}
    </div>
  );
}
