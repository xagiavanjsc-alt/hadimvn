import { useState, useCallback, useMemo, useEffect } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const SR_KEY = "hanja_sr_data";

function getInitial(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0];
  const idx = Math.floor(code / 588);
  const initials = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  return initials[idx] || char[0];
}

const ALPHABET_GROUPS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

interface MatchCard {
  id: string;
  type: "korean" | "vietnamese";
  text: string;
  hanja?: string;
  pairId: string;
  matched: boolean;
  selected: boolean;
  wrong: boolean;
}

interface GameResult {
  pairs: number;
  time: number;
  mistakes: number;
  date: string;
}

const RESULTS_KEY = "hanja_match_results";

function loadResults(): GameResult[] {
  try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]"); }
  catch { return []; }
}

function saveResult(r: GameResult) {
  const prev = loadResults();
  const updated = [r, ...prev].slice(0, 20);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function WordMatchTab() {
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const [pairCount, setPairCount] = useState(6);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [gameState, setGameState] = useState<"setup" | "playing" | "done">("setup");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<GameResult[]>(loadResults);
  const [showResults, setShowResults] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  const HANJA_DATA = useHanjaData();
  const pool = useMemo(() => {
    let data = HANJA_DATA;
    if (selectedInitial) data = data.filter(d => getInitial(d.korean[0]) === selectedInitial);
    return data;
  }, [selectedInitial]);

  const startGame = useCallback(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const newCards: MatchCard[] = [];
    shuffled.forEach((entry, i) => {
      const pairId = `pair-${i}`;
      newCards.push({
        id: `ko-${i}`, type: "korean", text: entry.korean, hanja: entry.hanja,
        pairId, matched: false, selected: false, wrong: false,
      });
      newCards.push({
        id: `vi-${i}`, type: "vietnamese", text: entry.vietnamese,
        pairId, matched: false, selected: false, wrong: false,
      });
    });
    // Shuffle all cards
    const shuffledCards = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setGameState("playing");
    setSelectedId(null);
    setMistakes(0);
    setMatchedCount(0);
    setStartTime(Date.now());
    setElapsed(0);
  }, [pool, pairCount]);

  const handleCardClick = useCallback((card: MatchCard) => {
    if (card.matched || card.wrong) return;
    if (card.selected) {
      // Deselect
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, selected: false } : c));
      setSelectedId(null);
      return;
    }

    if (!selectedId) {
      // First selection
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, selected: true } : c));
      setSelectedId(card.id);
      if (card.type === "korean") speakKorean(card.text);
      return;
    }

    // Second selection — check match
    const firstCard = cards.find(c => c.id === selectedId);
    if (!firstCard) return;

    // Can't select same type
    if (firstCard.type === card.type) {
      // Switch selection
      setCards(prev => prev.map(c => {
        if (c.id === selectedId) return { ...c, selected: false };
        if (c.id === card.id) return { ...c, selected: true };
        return c;
      }));
      setSelectedId(card.id);
      if (card.type === "korean") speakKorean(card.text);
      return;
    }

    if (card.type === "korean") speakKorean(card.text);

    if (firstCard.pairId === card.pairId) {
      // Match!
      setCards(prev => prev.map(c =>
        c.id === selectedId || c.id === card.id
          ? { ...c, matched: true, selected: false }
          : c
      ));
      setSelectedId(null);
      setMatchedCount(m => {
        const newCount = m + 1;
        if (newCount >= pairCount) {
          const time = Math.floor((Date.now() - startTime) / 1000);
          const result: GameResult = { pairs: pairCount, time, mistakes, date: new Date().toISOString() };
          saveResult(result);
          setResults(loadResults());
          setTimeout(() => setGameState("done"), 400);
        }
        return newCount;
      });
    } else {
      // Wrong!
      setMistakes(m => m + 1);
      setCards(prev => prev.map(c =>
        c.id === selectedId || c.id === card.id
          ? { ...c, wrong: true, selected: false }
          : c
      ));
      setSelectedId(null);
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === selectedId || c.id === card.id
            ? { ...c, wrong: false }
            : c
        ));
      }, 700);
    }
  }, [selectedId, cards, pairCount, startTime, mistakes]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 flex items-center justify-center bg-rose-100 rounded-2xl mx-auto mb-3">
              <i className="ri-drag-drop-line text-rose-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Học theo cặp</h2>
            <p className="text-sm text-gray-500">Ghép từ Hàn với nghĩa Việt — nhanh tay nhanh mắt!</p>
          </div>

          {/* Pair count */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Số cặp từ</p>
            <div className="flex gap-2">
              {[4, 6, 8, 10, 12].map(n => (
                <button
                  key={n}
                  onClick={() => setPairCount(n)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${pairCount === n ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Lọc theo chữ cái đầu</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedInitial(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${!selectedInitial ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                Tất cả ({HANJA_DATA.length})
              </button>
              {ALPHABET_GROUPS.map(g => {
                const cnt = HANJA_DATA.filter(d => getInitial(d.korean[0]) === g).length;
                if (cnt === 0) return null;
                return (
                  <button key={g} onClick={() => setSelectedInitial(selectedInitial === g ? null : g)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedInitial === g ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    {g} ({cnt})
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={pool.length < pairCount}
            className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-lg cursor-pointer hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            Bắt đầu chơi ({pairCount} cặp)
          </button>

          {/* Best results */}
          {results.length > 0 && (
            <div>
              <button
                onClick={() => setShowResults(r => !r)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer mb-3"
              >
                <i className="ri-trophy-line text-amber-500"></i>
                Kết quả tốt nhất
                <i className={showResults ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
              </button>
              {showResults && (
                <div className="space-y-2">
                  {results.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg text-xs">
                      <span className="text-amber-500 font-bold w-4">#{i + 1}</span>
                      <span className="text-gray-600">{r.pairs} cặp</span>
                      <span className="text-rose-600 font-semibold">{formatTime(r.time)}</span>
                      <span className="text-gray-400">{r.mistakes} sai</span>
                      <span className="text-gray-400 ml-auto">{new Date(r.date).toLocaleDateString("vi-VN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Done screen
  if (gameState === "done") {
    const time = elapsed;
    const score = Math.max(0, 100 - mistakes * 5);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${score >= 90 ? "bg-green-100" : score >= 70 ? "bg-amber-100" : "bg-rose-100"}`}>
            <i className={`text-3xl ${score >= 90 ? "ri-trophy-fill text-green-600" : score >= 70 ? "ri-medal-line text-amber-600" : "ri-gamepad-line text-rose-500"}`}></i>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{score} điểm</p>
          <p className="text-gray-500 mb-2">{pairCount} cặp · {formatTime(time)} · {mistakes} lần sai</p>
          <p className="text-sm text-gray-400 mb-8">
            {score >= 90 ? "Xuất sắc! Bạn ghép cặp rất nhanh!" : score >= 70 ? "Tốt lắm! Luyện thêm để cải thiện!" : "Cần luyện thêm! Đừng nản lòng!"}
          </p>
          <div className="flex gap-3">
            <button onClick={startGame} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">Chơi lại</button>
            <button onClick={() => setGameState("setup")} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors">Đổi cài đặt</button>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  const progress = matchedCount / pairCount;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Game header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setGameState("setup")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="ri-arrow-left-line"></i> Dừng
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-full">
            <i className="ri-time-line text-rose-500 text-xs"></i>
            <span className="text-sm font-bold text-rose-600">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full">
            <i className="ri-close-circle-line text-red-500 text-xs"></i>
            <span className="text-sm font-bold text-red-600">{mistakes} sai</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
            <i className="ri-check-double-line text-green-500 text-xs"></i>
            <span className="text-sm font-bold text-green-600">{matchedCount}/{pairCount}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
        <div className="bg-rose-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
      </div>

      {/* Instructions */}
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
        <i className="ri-information-line"></i>
        <span>Nhấn chọn 1 từ Hàn + 1 nghĩa Việt để ghép cặp. Từ Hàn sẽ được đọc khi chọn.</span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map(card => {
          let cardClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-rose-300 cursor-pointer";
          if (card.matched) cardClass = "bg-green-50 border-2 border-green-300 text-green-700 cursor-default";
          else if (card.selected) cardClass = "bg-rose-50 border-2 border-rose-400 text-rose-700 cursor-pointer";
          else if (card.wrong) cardClass = "bg-red-50 border-2 border-red-400 text-red-700 cursor-pointer animate-pulse";

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.matched}
              className={`${cardClass} rounded-xl p-3 text-center transition-all min-h-[72px] flex flex-col items-center justify-center gap-1 disabled:cursor-default`}
            >
              {card.matched && <i className="ri-check-line text-green-500 text-xs"></i>}
              <span className={`font-semibold leading-tight ${card.type === "korean" ? "text-base" : "text-xs"}`}>
                {card.text}
              </span>
              {card.type === "korean" && card.hanja && (
                <span className="text-[10px] text-rose-400 font-bold">{card.hanja}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Nhấn vào thẻ để chọn · Ghép đúng cặp Hàn-Việt để ghi điểm
      </p>
    </div>
  );
}
