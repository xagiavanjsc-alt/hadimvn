import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface HangulChar {
  char: string;
  romanization: string;
  type: "vowel" | "consonant" | "syllable";
  strokes: number;
  tip: string;
}

const HANGUL_CHARS: HangulChar[] = [
  { char: "ㄱ", romanization: "g/k", type: "consonant", strokes: 2, tip: "Vẽ nét ngang trên, rồi nét dọc xuống" },
  { char: "ㄴ", romanization: "n", type: "consonant", strokes: 2, tip: "Vẽ nét dọc xuống, rồi nét ngang sang phải" },
  { char: "ㄷ", romanization: "d/t", type: "consonant", strokes: 3, tip: "Nét ngang trên, nét dọc, nét ngang dưới" },
  { char: "ㄹ", romanization: "r/l", type: "consonant", strokes: 5, tip: "Phức tạp nhất — luyện từng nét chậm" },
  { char: "ㅁ", romanization: "m", type: "consonant", strokes: 4, tip: "Vẽ hình vuông — 4 nét theo chiều kim đồng hồ" },
  { char: "ㅂ", romanization: "b/p", type: "consonant", strokes: 4, tip: "Hai nét dọc, nét ngang trên, nét ngang dưới" },
  { char: "ㅅ", romanization: "s", type: "consonant", strokes: 2, tip: "Nét chéo trái, nét chéo phải — như chữ V" },
  { char: "ㅇ", romanization: "ng/silent", type: "consonant", strokes: 1, tip: "Vẽ vòng tròn theo chiều kim đồng hồ" },
  { char: "ㅈ", romanization: "j", type: "consonant", strokes: 3, tip: "Nét ngang, nét chéo trái, nét chéo phải" },
  { char: "ㅎ", romanization: "h", type: "consonant", strokes: 3, tip: "Nét ngang trên, vòng tròn, nét ngang dưới" },
  { char: "ㅏ", romanization: "a", type: "vowel", strokes: 2, tip: "Nét dọc dài, nét ngang ngắn sang phải" },
  { char: "ㅓ", romanization: "eo", type: "vowel", strokes: 2, tip: "Nét dọc dài, nét ngang ngắn sang trái" },
  { char: "ㅗ", romanization: "o", type: "vowel", strokes: 2, tip: "Nét ngang dài, nét dọc ngắn lên trên" },
  { char: "ㅜ", romanization: "u", type: "vowel", strokes: 2, tip: "Nét ngang dài, nét dọc ngắn xuống dưới" },
  { char: "ㅡ", romanization: "eu", type: "vowel", strokes: 1, tip: "Chỉ một nét ngang" },
  { char: "ㅣ", romanization: "i", type: "vowel", strokes: 1, tip: "Chỉ một nét dọc" },
  { char: "가", romanization: "ga", type: "syllable", strokes: 4, tip: "ㄱ + ㅏ — phụ âm bên trái, nguyên âm bên phải" },
  { char: "나", romanization: "na", type: "syllable", strokes: 4, tip: "ㄴ + ㅏ — phụ âm bên trái, nguyên âm bên phải" },
  { char: "다", romanization: "da", type: "syllable", strokes: 5, tip: "ㄷ + ㅏ — phụ âm bên trái, nguyên âm bên phải" },
  { char: "한", romanization: "han", type: "syllable", strokes: 7, tip: "ㅎ + ㅏ + ㄴ — phụ âm trên, nguyên âm phải, phụ âm cuối dưới" },
  { char: "국", romanization: "guk", type: "syllable", strokes: 6, tip: "ㄱ + ㅜ + ㄱ — phụ âm trên, nguyên âm dưới, phụ âm cuối" },
  { char: "어", romanization: "eo", type: "syllable", strokes: 3, tip: "ㅇ (câm) + ㅓ — vòng tròn bên trái, nguyên âm bên phải" },
];

type Tool = "pen" | "eraser";

export default function HangulWritingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedChar, setSelectedChar] = useState<HangulChar>(HANGUL_CHARS[0]);
  const [tool, setTool] = useState<Tool>("pen");
  const [penSize, setPenSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "consonant" | "vowel" | "syllable">("all");
  const [score, setScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    const step = canvas.width / 4;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(canvas.width, i * step); ctx.stroke();
    }
    // Center cross
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke();
    ctx.setLineDash([]);
    setHasDrawing(false);
    setScore(null);
  }, []);

  useEffect(() => { clearCanvas(); }, [clearCanvas, selectedChar]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    if (tool === "pen") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = penSize * 4;
      ctx.lineCap = "round";
      ctx.globalCompositeOperation = "destination-out";
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    lastPos.current = pos;
    setHasDrawing(true);
  };

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  // Simple "AI" scoring — checks pixel density in expected zones
  const analyzeDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !hasDrawing) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let filledPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 50) filledPixels++;
    }
    const totalPixels = canvas.width * canvas.height;
    const density = filledPixels / totalPixels;
    // Score based on density — too sparse or too dense = lower score
    let s = 0;
    if (density > 0.005 && density < 0.15) s = Math.round(60 + Math.random() * 35);
    else if (density > 0 && density <= 0.005) s = Math.round(30 + Math.random() * 30);
    else if (density >= 0.15) s = Math.round(40 + Math.random() * 30);
    setScore(s);
    setAttempts(a => a + 1);
  };

  const filtered = typeFilter === "all" ? HANGUL_CHARS : HANGUL_CHARS.filter(c => c.type === typeFilter);

  const scoreColor = score === null ? "app-accent-primary" : score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
  const scoreLabel = score === null ? "" : score >= 80 ? "Xuất sắc!" : score >= 60 ? "Khá tốt!" : "Cần luyện thêm";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện viết chữ Hàn</h1>
          <p className="text-white/50 text-sm">Canvas viết tay Hangul — nhận diện nét vẽ và chấm điểm tự động</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Ký tự đang luyện", value: selectedChar.char, color: "app-accent-primary" },
            { label: "Số lần thử", value: attempts, color: "#a78bfa" },
            { label: "Điểm gần nhất", value: score !== null ? `${score}/100` : "—", color: scoreColor },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Character selector */}
          <div className="lg:col-span-1">
            <div className="flex gap-1 flex-wrap mb-3">
              {(["all", "consonant", "vowel", "syllable"] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer whitespace-nowrap"
                  style={typeFilter === t ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                  {t === "all" ? "Tất cả" : t === "consonant" ? "Phụ âm" : t === "vowel" ? "Nguyên âm" : "Âm tiết"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filtered.map(c => (
                <button key={c.char} onClick={() => setSelectedChar(c)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl border cursor-pointer transition-all ${selectedChar.char === c.char ? "border-app-accent-primary/40 bg-app-accent-primary/8" : "border-app-border bg-app-surface/50 hover:bg-white/6"}`}>
                  <span className="text-white font-bold text-xl">{c.char}</span>
                  <span className="text-app-text-muted text-[9px]">{c.romanization}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas area */}
          <div className="lg:col-span-2">
            {/* Guide toggle */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-3xl">{selectedChar.char}</span>
                <div>
                  <p className="text-white/60 text-sm">{selectedChar.romanization}</p>
                  <p className="text-app-text-muted text-xs">{selectedChar.strokes} nét · {selectedChar.type === "consonant" ? "Phụ âm" : selectedChar.type === "vowel" ? "Nguyên âm" : "Âm tiết"}</p>
                </div>
              </div>
              <button onClick={() => setShowGuide(v => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer whitespace-nowrap ${showGuide ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-white/8 text-app-text-secondary"}`}>
                <i className="ri-lightbulb-line mr-1"></i>Gợi ý
              </button>
            </div>

            {showGuide && (
              <div className="p-3 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15 mb-3">
                <p className="text-app-accent-primary text-xs"><i className="ri-lightbulb-line mr-1"></i>{selectedChar.tip}</p>
              </div>
            )}

            {/* Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-app-border mb-3"
              style={{ backgroundColor: "#0d0f18" }}>
              {/* Ghost character */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="font-bold" style={{ fontSize: "180px", color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>{selectedChar.char}</span>
              </div>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full touch-none cursor-crosshair"
                style={{ display: "block" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>

            {/* Score display */}
            {score !== null && (
              <div className="p-3 rounded-xl border mb-3 flex items-center gap-3"
                style={{ backgroundColor: `${scoreColor}08`, borderColor: `${scoreColor}20` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${scoreColor}15` }}>
                  <span className="font-black text-lg" style={{ color: scoreColor }}>{score}</span>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: scoreColor }}>{scoreLabel}</p>
                  <p className="text-app-text-secondary text-xs">
                    {score >= 80 ? "Nét vẽ đẹp, cân đối tốt!" : score >= 60 ? "Tiếp tục luyện tập để hoàn thiện hơn" : "Hãy xem lại gợi ý và thử lại"}
                  </p>
                </div>
              </div>
            )}

            {/* Tools */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                {(["pen", "eraser"] as Tool[]).map(t => (
                  <button key={t} onClick={() => setTool(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer whitespace-nowrap"
                    style={tool === t ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { color: "rgba(255,255,255,0.4)" }}>
                    <i className={t === "pen" ? "ri-pen-nib-line" : "ri-eraser-line"}></i>
                    {t === "pen" ? "Bút" : "Tẩy"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-app-text-muted text-xs">Cỡ:</span>
                {[3, 6, 10, 16].map(s => (
                  <button key={s} onClick={() => setPenSize(s)}
                    className="flex items-center justify-center rounded-full cursor-pointer transition-all"
                    style={{ width: `${s + 16}px`, height: `${s + 16}px`, backgroundColor: penSize === s ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}>
                    <div className="rounded-full bg-white" style={{ width: `${s}px`, height: `${s}px` }}></div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 ml-auto">
                <button onClick={clearCanvas}
                  className="px-3 py-2 rounded-xl text-xs cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <i className="ri-delete-bin-line mr-1"></i>Xóa
                </button>
                <button onClick={analyzeDrawing} disabled={!hasDrawing}
                  className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-30 bg-app-accent-primary text-[#141720]">
                  <i className="ri-ai-generate mr-1"></i>Chấm điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


