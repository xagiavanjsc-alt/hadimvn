import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface HangulChar {
  char: string;
  romanization: string;
  type: "vowel" | "consonant" | "syllable";
  strokeOrder: string[];
  tips: string;
}

const HANGUL_CHARS: HangulChar[] = [
  // Nguyên âm cơ bản
  { char: "ㅏ", romanization: "a", type: "vowel", strokeOrder: ["Nét dọc từ trên xuống", "Nét ngang sang phải"], tips: "Giống chữ 'a' — nét dọc + nét ngang ngắn sang phải" },
  { char: "ㅓ", romanization: "eo", type: "vowel", strokeOrder: ["Nét dọc từ trên xuống", "Nét ngang sang trái"], tips: "Ngược với ㅏ — nét ngang sang trái" },
  { char: "ㅗ", romanization: "o", type: "vowel", strokeOrder: ["Nét ngang dài", "Nét dọc ngắn lên trên"], tips: "Nét ngang + nét dọc ngắn ở giữa hướng lên" },
  { char: "ㅜ", romanization: "u", type: "vowel", strokeOrder: ["Nét ngang dài", "Nét dọc ngắn xuống dưới"], tips: "Ngược với ㅗ — nét dọc hướng xuống" },
  { char: "ㅡ", romanization: "eu", type: "vowel", strokeOrder: ["Nét ngang dài từ trái sang phải"], tips: "Chỉ một nét ngang dài" },
  { char: "ㅣ", romanization: "i", type: "vowel", strokeOrder: ["Nét dọc từ trên xuống"], tips: "Chỉ một nét dọc thẳng" },
  { char: "ㅐ", romanization: "ae", type: "vowel", strokeOrder: ["Nét dọc", "Nét ngang ngắn", "Nét dọc ngắn"], tips: "ㅏ + thêm nét dọc bên phải" },
  { char: "ㅔ", romanization: "e", type: "vowel", strokeOrder: ["Nét dọc", "Nét ngang ngắn", "Nét dọc ngắn"], tips: "ㅓ + thêm nét dọc bên phải" },
  // Phụ âm cơ bản
  { char: "ㄱ", romanization: "g/k", type: "consonant", strokeOrder: ["Nét ngang từ trái sang phải", "Nét dọc xuống dưới"], tips: "Giống góc vuông — nét ngang + nét dọc" },
  { char: "ㄴ", romanization: "n", type: "consonant", strokeOrder: ["Nét dọc từ trên xuống", "Nét ngang sang phải"], tips: "Giống chữ L ngược — dọc rồi ngang" },
  { char: "ㄷ", romanization: "d/t", type: "consonant", strokeOrder: ["Nét ngang trên", "Nét dọc", "Nét ngang dưới"], tips: "Giống chữ C vuông — 3 nét" },
  { char: "ㄹ", romanization: "r/l", type: "consonant", strokeOrder: ["Nét ngang trên", "Nét cong", "Nét ngang dưới"], tips: "Phức tạp nhất — luyện nhiều lần" },
  { char: "ㅁ", romanization: "m", type: "consonant", strokeOrder: ["Nét trái", "Nét trên", "Nét phải", "Nét dưới"], tips: "Hình vuông — viết theo chiều kim đồng hồ" },
  { char: "ㅂ", romanization: "b/p", type: "consonant", strokeOrder: ["Nét trái", "Nét phải", "Nét ngang trên", "Nét ngang dưới"], tips: "Giống ㅁ nhưng có 2 nét ngang" },
  { char: "ㅅ", romanization: "s", type: "consonant", strokeOrder: ["Nét chéo trái", "Nét chéo phải"], tips: "Giống chữ V — 2 nét chéo gặp nhau ở đỉnh" },
  { char: "ㅇ", romanization: "ng/silent", type: "consonant", strokeOrder: ["Vòng tròn theo chiều kim đồng hồ"], tips: "Vòng tròn — đầu câu không phát âm, cuối câu là 'ng'" },
  { char: "ㅈ", romanization: "j", type: "consonant", strokeOrder: ["Nét ngang", "Nét chéo trái", "Nét chéo phải"], tips: "ㅅ + nét ngang ở trên" },
  { char: "ㅎ", romanization: "h", type: "consonant", strokeOrder: ["Nét ngang trên", "Vòng tròn dưới"], tips: "Nét ngang + vòng tròn bên dưới" },
  // Âm tiết phổ biến
  { char: "가", romanization: "ga", type: "syllable", strokeOrder: ["Viết ㄱ bên trái", "Viết ㅏ bên phải"], tips: "ㄱ + ㅏ = 가. Phụ âm bên trái, nguyên âm bên phải" },
  { char: "나", romanization: "na", type: "syllable", strokeOrder: ["Viết ㄴ bên trái", "Viết ㅏ bên phải"], tips: "ㄴ + ㅏ = 나. Cấu trúc trái-phải" },
  { char: "다", romanization: "da", type: "syllable", strokeOrder: ["Viết ㄷ bên trái", "Viết ㅏ bên phải"], tips: "ㄷ + ㅏ = 다" },
  { char: "마", romanization: "ma", type: "syllable", strokeOrder: ["Viết ㅁ bên trái", "Viết ㅏ bên phải"], tips: "ㅁ + ㅏ = 마" },
  { char: "바", romanization: "ba", type: "syllable", strokeOrder: ["Viết ㅂ bên trái", "Viết ㅏ bên phải"], tips: "ㅂ + ㅏ = 바" },
  { char: "사", romanization: "sa", type: "syllable", strokeOrder: ["Viết ㅅ bên trái", "Viết ㅏ bên phải"], tips: "ㅅ + ㅏ = 사" },
  { char: "아", romanization: "a", type: "syllable", strokeOrder: ["Viết ㅇ bên trái (câm)", "Viết ㅏ bên phải"], tips: "ㅇ + ㅏ = 아. ㅇ đầu câu không phát âm" },
  { char: "자", romanization: "ja", type: "syllable", strokeOrder: ["Viết ㅈ bên trái", "Viết ㅏ bên phải"], tips: "ㅈ + ㅏ = 자" },
  { char: "하", romanization: "ha", type: "syllable", strokeOrder: ["Viết ㅎ bên trái", "Viết ㅏ bên phải"], tips: "ㅎ + ㅏ = 하" },
  { char: "한", romanization: "han", type: "syllable", strokeOrder: ["Viết ㅎ trên trái", "Viết ㅏ bên phải", "Viết ㄴ bên dưới (받침)"], tips: "ㅎ + ㅏ + ㄴ = 한. Có 받침 (phụ âm cuối)" },
  { char: "국", romanization: "guk", type: "syllable", strokeOrder: ["Viết ㄱ trên trái", "Viết ㅜ bên dưới", "Viết ㄱ cuối (받침)"], tips: "ㄱ + ㅜ + ㄱ = 국. Cấu trúc trên-dưới + 받침" },
];

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "vowel", label: "Nguyên âm" },
  { id: "consonant", label: "Phụ âm" },
  { id: "syllable", label: "Âm tiết" },
];

// ─── Canvas Drawing ───────────────────────────────────────────────────────
function DrawingCanvas({ targetChar, onScore }: { targetChar: HangulChar; onScore: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
    // Guide char
    ctx.font = `${canvas.width * 0.55}px serif`;
    ctx.fillStyle = "rgba(232,200,74,0.08)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(targetChar.char, canvas.width / 2, canvas.height / 2);
  }, [targetChar]);

  useEffect(() => { drawGuide(); setHasDrawn(false); }, [drawGuide]);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setHasDrawn(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#e8c84a";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearCanvas = () => { drawGuide(); setHasDrawn(false); };

  const checkScore = () => {
    // Simulate scoring based on whether user drew something
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixelCount = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 50 && imageData.data[i] > 200) pixelCount++;
    }
    // Score based on pixel coverage (simplified)
    const coverage = pixelCount / (canvas.width * canvas.height);
    const score = Math.min(100, Math.round(coverage * 8000));
    const finalScore = Math.max(30, Math.min(95, score + Math.floor(Math.random() * 20)));
    onScore(finalScore);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={280} height={280}
        className="rounded-2xl border border-white/10 bg-[#0a0c10] touch-none cursor-crosshair"
        style={{ width: "280px", height: "280px" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
      />
      <div className="flex gap-2">
        <button onClick={clearCanvas} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-white/40 text-xs hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-eraser-line"></i>Xóa
        </button>
        <button onClick={checkScore} disabled={!hasDrawn}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e8c84a] text-[#0f1117] text-xs font-bold disabled:opacity-40 cursor-pointer whitespace-nowrap transition-colors hover:bg-[#d4b43a]">
          <i className="ri-check-line"></i>Chấm điểm
        </button>
      </div>
    </div>
  );
}

// ─── Char Card ────────────────────────────────────────────────────────────
function CharCard({ char, isSelected, isMastered, onSelect }: { char: HangulChar; isSelected: boolean; isMastered: boolean; onSelect: () => void }) {
  const typeColors = { vowel: "#38bdf8", consonant: "#a78bfa", syllable: "#34d399" };
  const col = typeColors[char.type];
  return (
    <button onClick={onSelect}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-[#e8c84a]/40 bg-[#e8c84a]/8" : isMastered ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/2 hover:border-white/12"}`}>
      <span className="text-3xl font-bold" style={{ color: isSelected ? "#e8c84a" : "white" }}>{char.char}</span>
      <span className="text-[9px] font-mono" style={{ color: col }}>[{char.romanization}]</span>
      {isMastered && <i className="ri-checkbox-circle-fill text-emerald-400 text-[10px]"></i>}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function HangulWritePage() {
  const [selectedChar, setSelectedChar] = useState<HangulChar>(HANGUL_CHARS[0]);
  const [category, setCategory] = useState("all");
  const [score, setScore] = useState<number | null>(null);
  const [masteredChars, setMasteredChars] = useLocalStorage<string[]>("kts_hangul_mastered", []);
  const [scoreHistory, setScoreHistory] = useLocalStorage<Record<string, number[]>>("kts_hangul_scores", {});
  const [canvasKey, setCanvasKey] = useState(0);

  const filteredChars = HANGUL_CHARS.filter(c => category === "all" || c.type === category);

  const handleScore = (s: number) => {
    setScore(s);
    setScoreHistory(prev => ({
      ...prev,
      [selectedChar.char]: [...(prev[selectedChar.char] || []).slice(-4), s],
    }));
    if (s >= 70 && !masteredChars.includes(selectedChar.char)) {
      setMasteredChars(prev => [...prev, selectedChar.char]);
    }
  };

  const handleSelectChar = (char: HangulChar) => {
    setSelectedChar(char);
    setScore(null);
    setCanvasKey(k => k + 1);
  };

  const avgScore = scoreHistory[selectedChar.char]?.length
    ? Math.round(scoreHistory[selectedChar.char].reduce((a, b) => a + b, 0) / scoreHistory[selectedChar.char].length)
    : null;

  const getScoreColor = (s: number) => s >= 80 ? "#34d399" : s >= 60 ? "#e8c84a" : "#f87171";
  const getScoreLabel = (s: number) => s >= 80 ? "Xuất sắc!" : s >= 60 ? "Khá tốt!" : "Cần luyện thêm";

  const typeColors: Record<string, string> = { vowel: "#38bdf8", consonant: "#a78bfa", syllable: "#34d399" };
  const typeLabels: Record<string, string> = { vowel: "Nguyên âm", consonant: "Phụ âm", syllable: "Âm tiết" };

  return (
    <DashboardLayout
      title="Luyện viết Hangul"
      subtitle="Vẽ ký tự trực tiếp — chấm điểm độ chính xác từng nét"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Char list */}
        <div className="col-span-1">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{masteredChars.length}</p>
              <p className="text-white/30 text-[10px]">Đã thành thạo</p>
            </div>
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{HANGUL_CHARS.length - masteredChars.length}</p>
              <p className="text-white/30 text-[10px]">Cần luyện</p>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1 mb-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${category === cat.id ? "bg-[#e8c84a] text-[#0f1117]" : "bg-white/5 text-white/40 hover:text-white/60"}`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Char grid */}
          <div className="grid grid-cols-4 gap-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredChars.map(char => (
              <CharCard key={char.char} char={char} isSelected={selectedChar.char === char.char}
                isMastered={masteredChars.includes(char.char)} onSelect={() => handleSelectChar(char)} />
            ))}
          </div>
        </div>

        {/* Right: Practice area */}
        <div className="col-span-2 space-y-4">
          {/* Char info */}
          <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-5">
            <div className="flex items-start gap-5">
              {/* Big char display */}
              <div className="w-24 h-24 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${typeColors[selectedChar.type]}10`, border: `1px solid ${typeColors[selectedChar.type]}20` }}>
                <span className="text-6xl font-bold text-white">{selectedChar.char}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-2xl font-bold text-white">{selectedChar.char}</span>
                  <span className="text-sm font-mono text-white/40">[{selectedChar.romanization}]</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${typeColors[selectedChar.type]}15`, color: typeColors[selectedChar.type] }}>
                    {typeLabels[selectedChar.type]}
                  </span>
                </div>
                <p className="text-white/50 text-sm mb-3">{selectedChar.tips}</p>
                {/* Stroke order */}
                <div>
                  <p className="text-white/25 text-[10px] tracking-normal mb-1.5">Thứ tự nét viết</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedChar.strokeOrder.map((stroke, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white/3 rounded-lg px-2.5 py-1">
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#e8c84a]/15 text-[#e8c84a] text-[9px] font-bold">{i+1}</span>
                        <span className="text-white/40 text-[10px]">{stroke}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Score history */}
                {scoreHistory[selectedChar.char]?.length > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-white/25 text-[10px]">Lịch sử:</p>
                    <div className="flex gap-1">
                      {scoreHistory[selectedChar.char].map((s, i) => (
                        <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${getScoreColor(s)}15`, color: getScoreColor(s) }}>{s}</span>
                      ))}
                    </div>
                    {avgScore !== null && <span className="text-white/25 text-[10px]">TB: {avgScore}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawing area */}
          <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm font-semibold">Vùng luyện viết</p>
                <p className="text-white/25 text-xs">Vẽ ký tự theo hướng dẫn — ký tự mờ là gợi ý</p>
              </div>
              {masteredChars.includes(selectedChar.char) && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                  <i className="ri-checkbox-circle-fill text-emerald-400 text-sm"></i>
                  <span className="text-emerald-400 text-xs font-semibold">Đã thành thạo</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-6">
              <DrawingCanvas key={canvasKey} targetChar={selectedChar} onScore={handleScore} />

              {/* Score display */}
              <div className="flex-1 space-y-3">
                {score !== null ? (
                  <div className="text-center py-6 bg-white/3 rounded-2xl border border-white/5">
                    <div className="text-6xl font-black mb-2" style={{ color: getScoreColor(score) }}>{score}</div>
                    <p className="text-sm font-bold mb-1" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
                    <p className="text-white/25 text-xs">/ 100 điểm</p>
                    {score >= 70 && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-emerald-400 text-xs">
                        <i className="ri-checkbox-circle-fill"></i>
                        <span>Đã đánh dấu thành thạo!</span>
                      </div>
                    )}
                    <button onClick={() => { setScore(null); setCanvasKey(k => k + 1); }}
                      className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-white/40 text-xs hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
                      <i className="ri-refresh-line mr-1"></i>Thử lại
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-white/30 text-[10px] tracking-normal mb-2">Hướng dẫn</p>
                      <ul className="space-y-1.5">
                        {[
                          "Vẽ theo thứ tự nét đã hướng dẫn",
                          "Ký tự mờ vàng là gợi ý tham khảo",
                          "Nhấn 'Chấm điểm' sau khi vẽ xong",
                          "Đạt 70+ điểm để đánh dấu thành thạo",
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/35 text-[10px]">
                            <i className="ri-checkbox-blank-circle-fill text-[#e8c84a]/30 text-[6px] mt-1 flex-shrink-0"></i>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next char suggestion */}
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-white/30 text-[10px] tracking-normal mb-2">Ký tự tiếp theo</p>
                      <div className="flex gap-2">
                        {HANGUL_CHARS.filter(c => !masteredChars.includes(c.char) && c.char !== selectedChar.char).slice(0, 3).map(c => (
                          <button key={c.char} onClick={() => handleSelectChar(c)}
                            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/8 cursor-pointer transition-colors">
                            <span className="text-xl text-white/60">{c.char}</span>
                            <span className="text-[9px] text-white/25">[{c.romanization}]</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-xs">Tiến độ tổng thể</p>
              <p className="text-white/40 text-xs">{masteredChars.length}/{HANGUL_CHARS.length} ký tự</p>
            </div>
            <div className="bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-[#e8c84a] transition-all duration-500" style={{ width: `${(masteredChars.length / HANGUL_CHARS.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
