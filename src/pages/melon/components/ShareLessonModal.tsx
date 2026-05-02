import { useEffect, useRef, useState } from "react";
import { MelonSong } from "@/mocks/melonSongs";
import { MelonLessonResult } from "@/services/aiService";

interface ShareLessonModalProps {
  song: MelonSong;
  result: MelonLessonResult;
  onClose: () => void;
}

const THEMES = [
  { id: "dark", label: "Tối", bg: "#0f1117", accent: "app-accent-primary", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
  { id: "green", label: "K-pop", bg: "#0a1a10", accent: "#00C73C", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
  { id: "rose", label: "Hồng", bg: "#1a0a10", accent: "#f472b6", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
  { id: "slate", label: "Xanh", bg: "#0d1523", accent: "#60a5fa", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
];

export default function ShareLessonModal({ song, result, onClose }: ShareLessonModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeId, setThemeId] = useState("dark");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const topVocab = result.vocabulary.slice(0, 4);

  useEffect(() => {
    drawCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, result]);

  function drawCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 540;
    const H = 720;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Top accent bar
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 0, W, 5);

    // Brand badge
    ctx.fillStyle = theme.accent + "22";
    roundRect(ctx, 30, 24, 160, 28, 14);
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 12px system-ui";
    ctx.fillText("🎵 Hàn Quốc Ơi!", 44, 42);

    // Song title
    ctx.fillStyle = theme.text;
    ctx.font = "bold 30px system-ui";
    wrapText(ctx, song.title, 30, 88, W - 60, 36);

    // Artist + rank
    ctx.fillStyle = theme.sub;
    ctx.font = "16px system-ui";
    ctx.fillText(`${song.artist}  ·  #${song.rank} Melon`, 30, 134);

    // Divider
    ctx.strokeStyle = theme.accent + "33";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, 152); ctx.lineTo(W - 30, 152); ctx.stroke();

    // Section: Từ vựng nổi bật
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 13px system-ui";
    ctx.fillText("TỪ VỰNG NỔI BẬT", 30, 178);

    // Vocab cards
    topVocab.forEach((v, i) => {
      const x = 30;
      const y = 192 + i * 100;
      const cardH = 88;

      // Card bg
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      roundRect(ctx, x, y, W - 60, cardH, 12);
      ctx.fill();
      ctx.strokeStyle = theme.accent + "20";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, W - 60, cardH, 12);
      ctx.stroke();

      // Left accent strip
      ctx.fillStyle = theme.accent;
      roundRect(ctx, x, y, 4, cardH, 2);
      ctx.fill();

      // Word
      ctx.fillStyle = theme.accent;
      ctx.font = "bold 20px system-ui";
      ctx.fillText(v.word, x + 18, y + 30);

      // Meaning
      ctx.fillStyle = theme.text;
      ctx.font = "15px system-ui";
      ctx.fillText(v.meaning, x + 18, y + 53);

      // Example (clipped)
      ctx.fillStyle = theme.sub;
      ctx.font = "italic 12px system-ui";
      const exClip = v.example.length > 60 ? v.example.slice(0, 60) + "…" : v.example;
      ctx.fillText(exClip, x + 18, y + 73);
    });

    // Bottom app promo
    const bottomY = H - 60;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    roundRect(ctx, 30, bottomY, W - 60, 40, 10);
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 13px system-ui";
    ctx.fillText("Học tiếng Hàn qua K-pop · hanquocoi.app", 48, bottomY + 25);
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string, x: number, y: number, maxWidth: number, lineH: number
  ) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = word;
        curY += lineH;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, x, curY);
  }

  const getDataUrl = () => canvasRef.current?.toDataURL("image/png") ?? "";

  const handleDownload = async () => {
    setDownloading(true);
    const url = getDataUrl();
    const a = document.createElement("a");
    a.href = url;
    a.download = `hqo-${song.title.replace(/\s+/g, "-")}.png`;
    a.click();
    setTimeout(() => setDownloading(false), 800);
  };

  const handleCopyText = async () => {
    const text = [
      `🎵 Học tiếng Hàn qua K-pop — "${song.title}" (${song.artist})`,
      "",
      "📚 Từ vựng nổi bật:",
      ...topVocab.map((v) => `• ${v.word} = ${v.meaning}`),
      "",
      "Học thêm tại Hàn Quốc Ơi! 🇰🇷",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `🎵 Học tiếng Hàn qua "${song.title}" — ${song.artist}\n\n` +
      topVocab.map((v) => `• ${v.word} = ${v.meaning}`).join("\n") +
      "\n\n#HànQuốcƠi #KoreanLearning #Kpop";

    if (navigator.share) {
      try {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], "lesson.png", { type: "image/png" });
            await navigator.share({ title: `Học từ "${song.title}"`, text, files: [file] });
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
          });
        } else {
          await navigator.share({ title: `Học từ "${song.title}"`, text });
        }
      } catch { /* user cancelled */ }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-app-bg sm:rounded-2xl rounded-t-2xl border border-app-border flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-app-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
              <i className="ri-share-line text-app-accent-primary text-sm" />
            </div>
            <p className="text-white font-semibold text-sm">Chia sẻ bài học</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white cursor-pointer">
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Canvas preview */}
          <div className="flex justify-center mb-5">
            <canvas
              ref={canvasRef}
              className="rounded-xl border border-app-border w-full max-w-xs"
              style={{ imageRendering: "auto" }}
            />
          </div>

          {/* Theme selector */}
          <div className="mb-5">
            <p className="text-app-text-secondary text-xs tracking-normal mb-2">Chủ đề màu sắc</p>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`flex-1 py-2 text-xs rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    themeId === t.id
                      ? "border-app-accent-primary bg-app-accent-primary/10 text-app-accent-primary"
                      : "border-app-border text-app-text-secondary hover:border-white/20"
                  }`}
                  style={{ borderColor: themeId === t.id ? t.accent : undefined }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-app-card/50 hover:bg-app-card/70 border border-app-border text-white/70 text-sm font-medium py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className={downloading ? "ri-loader-4-line animate-spin" : "ri-download-2-line"} />
              Tải ảnh
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 bg-app-card/50 hover:bg-app-card/70 border border-app-border text-white/70 text-sm font-medium py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className={copied ? "ri-checkbox-circle-line text-green-400" : "ri-clipboard-line"} />
              {copied ? "Đã sao chép!" : "Sao chép văn bản"}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg text-sm font-bold py-3.5 rounded-xl cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className={shareSuccess ? "ri-checkbox-circle-line" : "ri-share-forward-line"} />
            {shareSuccess ? "Đã chia sẻ!" : "Chia sẻ ngay"}
          </button>

          {/* Social hints */}
          <div className="mt-4 flex items-center justify-center gap-4 text-app-text-muted text-xs">
            <span className="flex items-center gap-1"><i className="ri-facebook-circle-line text-base" />Facebook</span>
            <span className="flex items-center gap-1"><i className="ri-instagram-line text-base" />Instagram</span>
            <span className="flex items-center gap-1"><i className="ri-tiktok-line text-base" />TikTok</span>
            <span className="flex items-center gap-1"><i className="ri-twitter-x-line text-base" />X</span>
          </div>
        </div>
      </div>
    </div>
  );
}
