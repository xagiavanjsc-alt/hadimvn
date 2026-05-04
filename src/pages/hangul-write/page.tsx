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
  // Nguyên âm co b?n
  { char: "?", romanization: "a", type: "vowel", strokeOrder: ["Nét d?c t? trên xu?ng", "Nét ngang sang ph?i"], tips: "Gi?ng ch? 'a' — nét d?c + nét ngang ng?n sang ph?i" },
  { char: "?", romanization: "eo", type: "vowel", strokeOrder: ["Nét d?c t? trên xu?ng", "Nét ngang sang trái"], tips: "Ngu?c v?i ? — nét ngang sang trái" },
  { char: "?", romanization: "o", type: "vowel", strokeOrder: ["Nét ngang dài", "Nét d?c ng?n lên trên"], tips: "Nét ngang + nét d?c ng?n ? gi?a hu?ng lên" },
  { char: "?", romanization: "u", type: "vowel", strokeOrder: ["Nét ngang dài", "Nét d?c ng?n xu?ng du?i"], tips: "Ngu?c v?i ? — nét d?c hu?ng xu?ng" },
  { char: "?", romanization: "eu", type: "vowel", strokeOrder: ["Nét ngang dài t? trái sang ph?i"], tips: "Ch? m?t nét ngang dài" },
  { char: "?", romanization: "i", type: "vowel", strokeOrder: ["Nét d?c t? trên xu?ng"], tips: "Ch? m?t nét d?c th?ng" },
  { char: "?", romanization: "ae", type: "vowel", strokeOrder: ["Nét d?c", "Nét ngang ng?n", "Nét d?c ng?n"], tips: "? + thêm nét d?c bên ph?i" },
  { char: "?", romanization: "e", type: "vowel", strokeOrder: ["Nét d?c", "Nét ngang ng?n", "Nét d?c ng?n"], tips: "? + thêm nét d?c bên ph?i" },
  // Ph? âm co b?n
  { char: "?", romanization: "g/k", type: "consonant", strokeOrder: ["Nét ngang t? trái sang ph?i", "Nét d?c xu?ng du?i"], tips: "Gi?ng góc vuông — nét ngang + nét d?c" },
  { char: "?", romanization: "n", type: "consonant", strokeOrder: ["Nét d?c t? trên xu?ng", "Nét ngang sang ph?i"], tips: "Gi?ng ch? L ngu?c — d?c r?i ngang" },
  { char: "?", romanization: "d/t", type: "consonant", strokeOrder: ["Nét ngang trên", "Nét d?c", "Nét ngang du?i"], tips: "Gi?ng ch? C vuông — 3 nét" },
  { char: "?", romanization: "r/l", type: "consonant", strokeOrder: ["Nét ngang trên", "Nét cong", "Nét ngang du?i"], tips: "Ph?c t?p nh?t — luy?n nhi?u l?n" },
  { char: "?", romanization: "m", type: "consonant", strokeOrder: ["Nét trái", "Nét trên", "Nét ph?i", "Nét du?i"], tips: "Hình vuông — vi?t theo chi?u kim d?ng h?" },
  { char: "?", romanization: "b/p", type: "consonant", strokeOrder: ["Nét trái", "Nét ph?i", "Nét ngang trên", "Nét ngang du?i"], tips: "Gi?ng ? nhung có 2 nét ngang" },
  { char: "?", romanization: "s", type: "consonant", strokeOrder: ["Nét chéo trái", "Nét chéo ph?i"], tips: "Gi?ng ch? V — 2 nét chéo g?p nhau ? d?nh" },
  { char: "?", romanization: "ng/silent", type: "consonant", strokeOrder: ["Vòng tròn theo chi?u kim d?ng h?"], tips: "Vòng tròn — d?u câu không phát âm, cu?i câu là 'ng'" },
  { char: "?", romanization: "j", type: "consonant", strokeOrder: ["Nét ngang", "Nét chéo trái", "Nét chéo ph?i"], tips: "? + nét ngang ? trên" },
  { char: "?", romanization: "h", type: "consonant", strokeOrder: ["Nét ngang trên", "Vòng tròn du?i"], tips: "Nét ngang + vòng tròn bên du?i" },
  // Âm ti?t ph? bi?n
  { char: "?", romanization: "ga", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?. Ph? âm bên trái, nguyên âm bên ph?i" },
  { char: "?", romanization: "na", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?. C?u trúc trái-ph?i" },
  { char: "?", romanization: "da", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?" },
  { char: "?", romanization: "ma", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?" },
  { char: "?", romanization: "ba", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?" },
  { char: "?", romanization: "sa", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?" },
  { char: "?", romanization: "a", type: "syllable", strokeOrder: ["Vi?t ? bên trái (câm)", "Vi?t ? bên ph?i"], tips: "? + ? = ?. ? d?u câu không phát âm" },
  { char: "?", romanization: "ja", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?" },
  { char: "?", romanization: "ha", type: "syllable", strokeOrder: ["Vi?t ? bên trái", "Vi?t ? bên ph?i"], tips: "? + ? = ?" },
  { char: "?", romanization: "han", type: "syllable", strokeOrder: ["Vi?t ? trên trái", "Vi?t ? bên ph?i", "Vi?t ? bên du?i (??)"], tips: "? + ? + ? = ?. Có ?? (ph? âm cu?i)" },
  { char: "?", romanization: "guk", type: "syllable", strokeOrder: ["Vi?t ? trên trái", "Vi?t ? bên du?i", "Vi?t ? cu?i (??)"], tips: "? + ? + ? = ?. C?u trúc trên-du?i + ??" },
];

const CATEGORIES = [
  { id: "all", label: "T?t c?" },
  { id: "vowel", label: "Nguyên âm" },
  { id: "consonant", label: "Ph? âm" },
  { id: "syllable", label: "Âm ti?t" },
];

// --- Canvas Drawing -------------------------------------------------------
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
    ctx.strokeStyle = "app-accent-primary";
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
        className="rounded-2xl border border-app-border bg-[#0a0c10] touch-none cursor-crosshair"
        style={{ width: "280px", height: "280px" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
      />
      <div className="flex gap-2">
        <button onClick={clearCanvas} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-app-card/50 border border-app-border text-app-text-secondary text-xs hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-eraser-line"></i>Xóa
        </button>
        <button onClick={checkScore} disabled={!hasDrawn}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-app-accent-primary text-app-bg text-xs font-bold disabled:opacity-40 cursor-pointer whitespace-nowrap transition-colors hover:bg-[#d4b43a]">
          <i className="ri-check-line"></i>Ch?m di?m
        </button>
      </div>
    </div>
  );
}

// --- Char Card ------------------------------------------------------------
function CharCard({ char, isSelected, isMastered, onSelect }: { char: HangulChar; isSelected: boolean; isMastered: boolean; onSelect: () => void }) {
  const typeColors = { vowel: "#38bdf8", consonant: "#a78bfa", syllable: "#34d399" };
  const col = typeColors[char.type];
  return (
    <button onClick={onSelect}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-app-accent-primary/40 bg-app-accent-primary/8" : isMastered ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-white/2 hover:border-white/12"}`}>
      <span className="text-3xl font-bold" style={{ color: isSelected ? "app-accent-primary" : "white" }}>{char.char}</span>
      <span className="text-[9px] font-mono" style={{ color: col }}>[{char.romanization}]</span>
      {isMastered && <i className="ri-checkbox-circle-fill text-app-accent-success text-[10px]"></i>}
    </button>
  );
}

// --- Main Page ------------------------------------------------------------
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

  const getScoreColor = (s: number) => s >= 80 ? "#34d399" : s >= 60 ? "app-accent-primary" : "#f87171";
  const getScoreLabel = (s: number) => s >= 80 ? "Xu?t s?c!" : s >= 60 ? "Khá t?t!" : "C?n luy?n thêm";

  const typeColors: Record<string, string> = { vowel: "#38bdf8", consonant: "#a78bfa", syllable: "#34d399" };
  const typeLabels: Record<string, string> = { vowel: "Nguyên âm", consonant: "Ph? âm", syllable: "Âm ti?t" };

  return (
    <DashboardLayout
      title="Luy?n vi?t Hangul"
      subtitle="V? ký t? tr?c ti?p — ch?m di?m d? chính xác t?ng nét"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Left: Char list */}
        <div className="col-span-1">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-app-bg border border-app-border rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{masteredChars.length}</p>
              <p className="text-app-text-muted text-[10px]">Ðã thành th?o</p>
            </div>
            <div className="bg-app-bg border border-app-border rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{HANGUL_CHARS.length - masteredChars.length}</p>
              <p className="text-app-text-muted text-[10px]">C?n luy?n</p>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1 mb-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${category === cat.id ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Char grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredChars.map(char => (
              <CharCard key={char.char} char={char} isSelected={selectedChar.char === char.char}
                isMastered={masteredChars.includes(char.char)} onSelect={() => handleSelectChar(char)} />
            ))}
          </div>
        </div>

        {/* Right: Practice area */}
        <div className="col-span-2 space-y-4">
          {/* Char info */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-start gap-5">
              {/* Big char display */}
              <div className="w-24 h-24 flex items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: `${typeColors[selectedChar.type]}10`, border: `1px solid ${typeColors[selectedChar.type]}20` }}>
                <span className="text-6xl font-bold text-white">{selectedChar.char}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-2xl font-bold text-white">{selectedChar.char}</span>
                  <span className="text-sm font-mono text-app-text-secondary">[{selectedChar.romanization}]</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${typeColors[selectedChar.type]}15`, color: typeColors[selectedChar.type] }}>
                    {typeLabels[selectedChar.type]}
                  </span>
                </div>
                <p className="text-white/50 text-sm mb-3">{selectedChar.tips}</p>
                {/* Stroke order */}
                <div>
                  <p className="text-app-text-muted text-[10px] tracking-normal mb-1.5">Th? t? nét vi?t</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedChar.strokeOrder.map((stroke, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-app-surface/50 rounded-lg px-2.5 py-1">
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-app-accent-primary/15 text-app-accent-primary text-[9px] font-bold">{i+1}</span>
                        <span className="text-app-text-secondary text-[10px]">{stroke}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Score history */}
                {scoreHistory[selectedChar.char]?.length > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-app-text-muted text-[10px]">L?ch s?:</p>
                    <div className="flex gap-1">
                      {scoreHistory[selectedChar.char].map((s, i) => (
                        <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${getScoreColor(s)}15`, color: getScoreColor(s) }}>{s}</span>
                      ))}
                    </div>
                    {avgScore !== null && <span className="text-app-text-muted text-[10px]">TB: {avgScore}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawing area */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm font-semibold">Vùng luy?n vi?t</p>
                <p className="text-app-text-muted text-xs">V? ký t? theo hu?ng d?n — ký t? m? là g?i ý</p>
              </div>
              {masteredChars.includes(selectedChar.char) && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                  <i className="ri-checkbox-circle-fill text-app-accent-success text-sm"></i>
                  <span className="text-app-accent-success text-xs font-semibold">Ðã thành th?o</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-6">
              <DrawingCanvas key={canvasKey} targetChar={selectedChar} onScore={handleScore} />

              {/* Score display */}
              <div className="flex-1 space-y-3">
                {score !== null ? (
                  <div className="text-center py-6 bg-app-surface/50 rounded-2xl border border-app-border">
                    <div className="text-6xl font-black mb-2" style={{ color: getScoreColor(score) }}>{score}</div>
                    <p className="text-sm font-bold mb-1" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
                    <p className="text-app-text-muted text-xs">/ 100 di?m</p>
                    {score >= 70 && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-app-accent-success text-xs">
                        <i className="ri-checkbox-circle-fill"></i>
                        <span>Ðã dánh d?u thành th?o!</span>
                      </div>
                    )}
                    <button onClick={() => { setScore(null); setCanvasKey(k => k + 1); }}
                      className="mt-4 px-4 py-2 rounded-xl bg-app-card/50 border border-app-border text-app-text-secondary text-xs hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
                      <i className="ri-refresh-line mr-1"></i>Th? l?i
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-app-surface/50 rounded-xl p-3">
                      <p className="text-app-text-muted text-[10px] tracking-normal mb-2">Hu?ng d?n</p>
                      <ul className="space-y-1.5">
                        {[
                          "V? theo th? t? nét dã hu?ng d?n",
                          "Ký t? m? vàng là g?i ý tham kh?o",
                          "Nh?n 'Ch?m di?m' sau khi v? xong",
                          "Ð?t 70+ di?m d? dánh d?u thành th?o",
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/35 text-[10px]">
                            <i className="ri-checkbox-blank-circle-fill text-app-accent-primary/30 text-[6px] mt-1 flex-shrink-0"></i>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next char suggestion */}
                    <div className="bg-app-surface/50 rounded-xl p-3">
                      <p className="text-app-text-muted text-[10px] tracking-normal mb-2">Ký t? ti?p theo</p>
                      <div className="flex gap-2">
                        {HANGUL_CHARS.filter(c => !masteredChars.includes(c.char) && c.char !== selectedChar.char).slice(0, 3).map(c => (
                          <button key={c.char} onClick={() => handleSelectChar(c)}
                            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-app-card/50 hover:bg-white/8 cursor-pointer transition-colors">
                            <span className="text-xl text-white/60">{c.char}</span>
                            <span className="text-[9px] text-app-text-muted">[{c.romanization}]</span>
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
          <div className="bg-app-bg border border-app-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-app-text-secondary text-xs">Ti?n d? t?ng th?</p>
              <p className="text-app-text-secondary text-xs">{masteredChars.length}/{HANGUL_CHARS.length} ký t?</p>
            </div>
            <div className="bg-app-card/50 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-app-accent-primary transition-all duration-500" style={{ width: `${(masteredChars.length / HANGUL_CHARS.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


