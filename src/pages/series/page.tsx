import { useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookMeta } from "@/pages/ebook/page";
import type { EbookTemplate } from "@/pages/ebook/components/EbookTemplates";

// --- Build Landing Page HTML ----------------------------------------------
function buildLandingPageHTML(series: EbookSeries, lessons: ApprovedLesson[]): string {
  const accent = series.coverAccent;
  const bg = series.coverColor;
  const lessonRows = lessons.map((l, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f9f9f9;border-radius:12px;border:1px solid #eee;">
      <span style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:11px;font-weight:700;flex-shrink:0;background:${accent}20;color:${accent};">${i + 1}</span>
      <div>
        <div style="font-size:13px;font-weight:600;color:#1a1a1a;">${l.song.title}</div>
        <div style="font-size:11px;color:#999;">${l.song.artist}</div>
      </div>
    </div>`).join("");

  const tagsHtml = (series.tags ?? []).map(t =>
    `<span style="font-size:12px;padding:4px 12px;border-radius:20px;background:${accent}15;color:${accent};">${t}</span>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${series.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Be Vietnam Pro',sans-serif;background:#f5f5f5;color:#1a1a1a;}
  .container{max-width:680px;margin:0 auto;padding:0 20px 60px;}
  .hero{background:${bg};padding:60px 40px;text-align:center;position:relative;overflow:hidden;}
  .hero::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:${accent};}
  .hero-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:20px;background:${accent}20;color:${accent};}
  .hero h1{font-size:32px;font-weight:800;color:${accent};line-height:1.2;margin-bottom:12px;}
  .hero p{color:rgba(255,255,255,0.55);font-size:15px;line-height:1.7;max-width:480px;margin:0 auto 20px;}
  .tags{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:24px;}
  .price{font-size:28px;font-weight:800;color:${accent};margin-bottom:24px;}
  .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;background:${accent};color:${bg};}
  .btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;border:2px solid ${accent}40;color:${accent};}
  .section{background:#fff;border-radius:20px;padding:36px;margin-top:20px;}
  .section h2{font-size:20px;font-weight:700;margin-bottom:6px;}
  .section .sub{color:#999;font-size:13px;margin-bottom:24px;}
  .lessons-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
  .features{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;}
  .feature{text-align:center;padding:20px 16px;background:#f9f9f9;border-radius:14px;}
  .feature-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;background:${accent}15;}
  .feature h3{font-size:13px;font-weight:700;margin-bottom:4px;}
  .feature p{font-size:11px;color:#999;line-height:1.5;}
  .cta-box{background:${bg};border-radius:16px;padding:32px;text-align:center;}
  .cta-box h3{font-size:20px;font-weight:700;color:${accent};margin-bottom:8px;}
  .cta-box p{color:rgba(255,255,255,0.45);font-size:13px;margin-bottom:20px;}
  .footer{text-align:center;padding:32px 0 0;color:#ccc;font-size:12px;}
  @media(max-width:600px){
    .hero{padding:40px 24px;}
    .hero h1{font-size:24px;}
    .lessons-grid{grid-template-columns:1fr;}
    .features{grid-template-columns:1fr;}
    .section{padding:24px;}
  }
</style>
</head>
<body>
<div class="hero">
  <div class="hero-badge">?? ${lessons.length} bài h?c ti?ng Hàn</div>
  <h1>${series.name}</h1>
  ${series.description ? `<p>${series.description}</p>` : ""}
  ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ""}
  ${series.price ? `<div class="price">${series.price}</div>` : ""}
  <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
    <a href="#" class="btn-primary">?? Mua ngay</a>
    <a href="#lessons" class="btn-secondary">?? Xem n?i dung</a>
  </div>
</div>

<div class="container">
  <div class="section" id="lessons">
    <h2>N?i dung ebook</h2>
    <p class="sub">${lessons.length} bài h?c du?c biên so?n k? lu?ng</p>
    <div class="lessons-grid">${lessonRows}</div>
  </div>

  <div class="section">
    <h2>M?i bài h?c bao g?m</h2>
    <p class="sub">Ð?y d? 3 ph?n giúp b?n h?c hi?u qu?</p>
    <div class="features">
      <div class="feature">
        <div class="feature-icon" style="color:${accent};">??</div>
        <h3>Truy?n chêm</h3>
        <p>Câu chuy?n thú v? l?ng ghép t? v?ng ti?ng Hàn t? nhiên</p>
      </div>
      <div class="feature">
        <div class="feature-icon" style="color:${accent};">??</div>
        <h3>T? v?ng c?t lõi</h3>
        <p>6-8 t? quan tr?ng v?i phiên âm và ví d? th?c t?</p>
      </div>
      <div class="feature">
        <div class="feature-icon" style="color:${accent};">??</div>
        <h3>Ng? pháp</h3>
        <p>Gi?i thích d? hi?u kèm ví d? minh h?a th?c t?</p>
      </div>
    </div>
    <div class="cta-box">
      <h3>S?n sàng h?c ti?ng Hàn?</h3>
      <p>Nh?n ebook ngay hôm nay và b?t d?u hành trình c?a b?n</p>
      <a href="#" class="btn-primary">${series.price ? `Mua ngay — ${series.price}` : "Liên h? d? nh?n ebook"}</a>
    </div>
  </div>
</div>

<div class="footer">
  <p>© ${new Date().getFullYear()} · T?o b?i KTS Ebook Builder</p>
</div>
</body>
</html>`;
}

// --- Email Delivery Modal -------------------------------------------------
function EmailDeliveryModal({ series, lessons, onClose }: {
  series: EbookSeries;
  lessons: ApprovedLesson[];
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [method, setMethod] = useState<"mailto" | "copy">("mailto");
  const [sent, setSent] = useState(false);

  const seriesLessons = series.lessonRanks
    .map((r) => lessons.find((l) => l.song.rank === r))
    .filter(Boolean) as ApprovedLesson[];

  const buildEmailBody = () => {
    const greeting = buyerName ? `Chào ${buyerName},\n\n` : "Chào b?n,\n\n";
    return `${greeting}C?m on b?n dã mua ebook "${series.name}"!\n\nEbook c?a b?n dã s?n sàng. Vui lòng t?i file dính kèm ho?c m? link bên du?i d? d?c.\n\nN?i dung ebook:\n${seriesLessons.map((l, i) => `${i + 1}. ${l.song.title} — ${l.song.artist}`).join("\n")}\n\nN?u có b?t k? câu h?i nào, hãy liên h? l?i v?i mình nhé!\n\nChúc b?n h?c ti?ng Hàn vui v?,\nHàn Vi?t KTS`;
  };

  const handleSendMailto = () => {
    if (!email.trim()) return;
    const subject = encodeURIComponent(`[Ebook] ${series.name} — Hàn Vi?t KTS`);
    const body = encodeURIComponent(buildEmailBody());
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  };

  const handleCopyContent = () => {
    const content = `G?i t?i: ${email || "(nh?p email ngu?i mua)"}\nCh? d?: [Ebook] ${series.name} — Hàn Vi?t KTS\n\n${buildEmailBody()}`;
    navigator.clipboard.writeText(content);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div className="flex items-center gap-2">
            <i className="ri-mail-send-line text-app-accent-primary text-sm"></i>
            <p className="text-white font-semibold text-sm">G?i ebook qua email</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-500/10 rounded-2xl mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-app-accent-success text-3xl"></i>
            </div>
            <p className="text-white font-bold text-base mb-2">Ðã x? lý!</p>
            <p className="text-app-text-secondary text-sm leading-relaxed mb-5">
              {method === "mailto"
                ? "?ng d?ng email dã m?. Ðính kèm file HTML ebook vào email r?i g?i nhé!"
                : "Ðã copy n?i dung email. Dán vào Gmail/Zalo d? g?i cho ngu?i mua!"}
            </p>
            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-3 text-left mb-5">
              <p className="text-app-accent-primary/80 text-xs font-semibold mb-1">Nh? dính kèm file ebook!</p>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Xu?t file HTML t? nút "Watermark" ho?c "Xu?t HTML" trong Landing Page, r?i dính kèm vào email.
              </p>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap">
              Xong
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              {/* Info */}
              <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 flex items-start gap-2">
                <i className="ri-information-line text-app-text-muted text-sm mt-0.5 flex-shrink-0"></i>
                <p className="text-app-text-secondary text-xs leading-relaxed">
                  Tool này t?o n?i dung email s?n sàng g?i. B?n c?n dính kèm file HTML ebook th? công vào email tru?c khi g?i.
                </p>
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Email ngu?i mua *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nguyen@gmail.com"
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên ngu?i mua</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Nguy?n Van A"
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
                  />
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="text-app-text-secondary text-xs font-medium block mb-2">Phuong th?c g?i</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethod("mailto")}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      method === "mailto" ? "border-app-accent-primary/40 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:border-white/15"
                    }`}
                  >
                    <i className={`ri-mail-open-line text-sm ${method === "mailto" ? "text-app-accent-primary" : "text-app-text-muted"}`}></i>
                    <div>
                      <p className={`text-xs font-semibold ${method === "mailto" ? "text-app-accent-primary" : "text-white/50"}`}>M? ?ng d?ng email</p>
                      <p className="text-app-text-muted text-[10px]">Gmail, Outlook...</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMethod("copy")}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      method === "copy" ? "border-app-accent-primary/40 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:border-white/15"
                    }`}
                  >
                    <i className={`ri-clipboard-line text-sm ${method === "copy" ? "text-app-accent-primary" : "text-app-text-muted"}`}></i>
                    <div>
                      <p className={`text-xs font-semibold ${method === "copy" ? "text-app-accent-primary" : "text-white/50"}`}>Copy n?i dung</p>
                      <p className="text-app-text-muted text-[10px]">Dán vào Zalo/Gmail</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Xem tru?c n?i dung email</label>
                <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 max-h-32 overflow-y-auto">
                  <p className="text-app-text-secondary text-[10px] leading-relaxed whitespace-pre-wrap">{buildEmailBody()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-app-border">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">H?y</button>
              <button
                onClick={method === "mailto" ? handleSendMailto : handleCopyContent}
                disabled={!email.trim()}
                className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className={method === "mailto" ? "ri-mail-send-line" : "ri-clipboard-line"}></i>
                {method === "mailto" ? "M? email" : "Copy n?i dung"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Watermark Modal ------------------------------------------------------
interface WatermarkModalProps {
  onClose: () => void;
  onApply: (name: string, note: string) => void;
}

function WatermarkModal({ onClose, onApply }: WatermarkModalProps) {
  const [buyerName, setBuyerName] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <div className="flex items-center gap-2">
            <i className="ri-shield-keyhole-line text-app-accent-primary text-sm"></i>
            <p className="text-white font-semibold text-sm">Chèn watermark ngu?i mua</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-3 flex items-start gap-2">
            <i className="ri-information-line text-app-accent-primary text-sm mt-0.5 flex-shrink-0"></i>
            <p className="text-white/50 text-xs leading-relaxed">
              Tên ngu?i mua s? du?c chèn vào footer m?i trang ebook HTML. Giúp truy v?t n?u ebook b? chia s? trái phép.
            </p>
          </div>
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên ngu?i mua *</label>
            <input
              type="text"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              placeholder="Ví d?: Nguy?n Van A"
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Ghi chú thêm (tùy ch?n)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ví d?: Mua ngày 14/04/2026 · Zalo: 0901..."
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-app-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">H?y</button>
          <button
            onClick={() => { if (buyerName.trim()) onApply(buyerName.trim(), note.trim()); }}
            disabled={!buyerName.trim()}
            className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Xu?t ebook có watermark
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Landing Page Preview Modal -------------------------------------------
function LandingPageModal({ series, lessons, onClose }: {
  series: EbookSeries;
  lessons: ApprovedLesson[];
  onClose: () => void;
}) {
  const seriesLessons = series.lessonRanks
    .map((r) => lessons.find((l) => l.song.rank === r))
    .filter(Boolean) as ApprovedLesson[];

  const accent = series.coverAccent;
  const bg = series.coverColor;

  const handleCopyLink = () => {
    const text = `?? ${series.name}\n${series.description}\n?? Giá: ${series.price || "Liên h?"}\n?? ${seriesLessons.length} bài h?c ti?ng Hàn\n\nLiên h? d? nh?n ebook!`;
    navigator.clipboard.writeText(text);
  };

  const handleExportLandingHTML = () => {
    const html = buildLandingPageHTML(series, seriesLessons);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${series.name.replace(/\s+/g, "_")}_landing.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <i className="ri-store-2-line text-app-accent-primary text-sm"></i>
            <p className="text-white font-semibold text-sm">Landing Page Preview</p>
            <span className="text-app-text-muted text-xs">— {series.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 text-white/50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-clipboard-line text-xs"></i>
              Copy text
            </button>
            <button
              onClick={handleExportLandingHTML}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-app-accent-success text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-html5-line text-xs"></i>
              Xu?t HTML
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer transition-colors">
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>

        {/* Landing page preview */}
        <div className="overflow-hidden rounded-b-2xl">
          {/* Hero */}
          <div className="relative px-10 py-14 text-center overflow-hidden" style={{ backgroundColor: bg }}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent }} />
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: accent }} />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full opacity-5" style={{ backgroundColor: accent }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${accent}20`, color: accent }}>
                <i className="ri-book-2-line text-xs"></i>
                {seriesLessons.length} bài h?c ti?ng Hàn
              </div>
              <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: accent }}>{series.name}</h1>
              {series.description && (
                <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto mb-6">{series.description}</p>
              )}
              {series.tags && series.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {series.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {series.price && (
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="text-2xl font-bold" style={{ color: accent }}>{series.price}</span>
                  <span className="text-app-text-muted text-sm line-through">Giá g?c</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap" style={{ backgroundColor: accent, color: bg }}>
                  <i className="ri-shopping-cart-line"></i>
                  Mua ngay
                </button>
                <button className="flex items-center gap-2 font-medium text-sm px-6 py-3 rounded-xl border transition-colors cursor-pointer whitespace-nowrap" style={{ borderColor: `${accent}40`, color: accent }}>
                  <i className="ri-eye-line"></i>
                  Xem th?
                </button>
              </div>
            </div>
          </div>

          {/* What's inside */}
          <div className="bg-white px-10 py-10">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">N?i dung ebook</h2>
            <p className="text-gray-400 text-sm text-center mb-8">{seriesLessons.length} bài h?c du?c biên so?n k? lu?ng</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {seriesLessons.map((l, i) => (
                <div key={l.song.rank} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold flex-shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-800 text-xs font-semibold truncate">{l.song.title}</p>
                    <p className="text-gray-400 text-[10px]">{l.song.artist}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: "ri-book-read-line", title: "Truy?n chêm", desc: "Câu chuy?n thú v? l?ng ghép t? v?ng ti?ng Hàn t? nhiên" },
                { icon: "ri-translate-2", title: "T? v?ng c?t lõi", desc: "6-8 t? v?ng quan tr?ng v?i phiên âm và ví d? th?c t?" },
                { icon: "ri-graduation-cap-line", title: "Ng? pháp", desc: "Gi?i thích ng? pháp d? hi?u kèm ví d? minh h?a" },
              ].map((f) => (
                <div key={f.title} className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-3" style={{ backgroundColor: `${accent}15` }}>
                    <i className={`${f.icon} text-lg`} style={{ color: accent }}></i>
                  </div>
                  <p className="text-gray-800 text-xs font-bold mb-1">{f.title}</p>
                  <p className="text-gray-400 text-[10px] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA bottom */}
            <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: bg }}>
              <p className="font-bold text-lg mb-1" style={{ color: accent }}>S?n sàng h?c ti?ng Hàn?</p>
              <p className="text-app-text-secondary text-sm mb-4">Nh?n ebook ngay hôm nay và b?t d?u hành trình c?a b?n</p>
              <button className="font-bold text-sm px-8 py-3 rounded-xl cursor-pointer whitespace-nowrap" style={{ backgroundColor: accent, color: bg }}>
                {series.price ? `Mua ngay — ${series.price}` : "Liên h? d? nh?n ebook"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface EbookSeries {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  coverAccent: string;
  lessonRanks: number[];
  template: EbookTemplate;
  createdAt: string;
  price?: string;
  tags?: string[];
}

const ACCENT_COLORS = [
  "app-accent-primary", "#34d399", "#fb923c", "#f472b6", "#a78bfa", "#38bdf8", "#f87171",
];
const COVER_COLORS = [
  "#0f1117", "#0d1b2a", "#1a1208", "#13111c", "#0a1628", "#1a0a0a",
];

function SeriesCard({
  series,
  lessons,
  onEdit,
  onDelete,
  onExport,
  onLanding,
  onWatermark,
  onEmail,
  onPreview,
}: {
  series: EbookSeries;
  lessons: ApprovedLesson[];
  onEdit: (s: EbookSeries) => void;
  onDelete: (id: string) => void;
  onExport: (s: EbookSeries) => void;
  onLanding: (s: EbookSeries) => void;
  onWatermark: (s: EbookSeries) => void;
  onEmail: (s: EbookSeries) => void;
  onPreview: (s: EbookSeries) => void;
}) {
  const seriesLessons = series.lessonRanks
    .map((r) => lessons.find((l) => l.song.rank === r))
    .filter(Boolean) as ApprovedLesson[];

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden hover:border-app-border transition-all group">
      {/* Cover preview */}
      <div
        className="h-28 relative flex flex-col justify-between p-4"
        style={{ backgroundColor: series.coverColor }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: series.coverAccent }}
        />
        <div className="flex items-start justify-between">
          <div
            className="text-[9px] font-bold tracking-normal px-2 py-1 rounded-full"
            style={{ backgroundColor: `${series.coverAccent}20`, color: series.coverAccent }}
          >
            {seriesLessons.length} bài
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(series)}
              className="w-6 h-6 flex items-center justify-center bg-app-card/70 hover:bg-app-border/200 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-edit-line text-white/60 text-[10px]"></i>
            </button>
            <button
              onClick={() => onDelete(series.id)}
              className="w-6 h-6 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-delete-bin-line text-red-400 text-[10px]"></i>
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold leading-tight" style={{ color: series.coverAccent }}>
            {series.name}
          </h3>
          {series.price && (
            <p className="text-app-text-secondary text-[10px] mt-0.5">{series.price}</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {series.description && (
          <p className="text-app-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">{series.description}</p>
        )}

        {/* Tags */}
        {series.tags && series.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {series.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${series.coverAccent}15`, color: series.coverAccent }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Lesson list preview */}
        <div className="space-y-1 mb-3">
          {seriesLessons.slice(0, 3).map((l, i) => (
            <div key={l.song.rank} className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-4 text-right" style={{ color: series.coverAccent }}>
                {i + 1}
              </span>
              <p className="text-white/50 text-[10px] truncate">{l.song.title}</p>
            </div>
          ))}
          {seriesLessons.length > 3 && (
            <p className="text-app-text-muted text-[9px] pl-6">+{seriesLessons.length - 3} bài n?a</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-3 border-t border-app-border">
          <button onClick={() => onPreview(series)} className="flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs px-2 py-2 rounded-lg transition-colors cursor-pointer" title="Xem th? công khai">
            <i className="ri-eye-line text-xs"></i>
          </button>
          <button onClick={() => onLanding(series)} className="flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs px-2 py-2 rounded-lg transition-colors cursor-pointer" title="Landing Page">
            <i className="ri-store-2-line text-xs"></i>
          </button>
          <button onClick={() => onEmail(series)} className="flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs px-2 py-2 rounded-lg transition-colors cursor-pointer" title="G?i qua email">
            <i className="ri-mail-send-line text-xs"></i>
          </button>
          <button onClick={() => onWatermark(series)} className="flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs px-2 py-2 rounded-lg transition-colors cursor-pointer" title="Xu?t có watermark">
            <i className="ri-shield-keyhole-line text-xs"></i>
          </button>
          <button onClick={() => onExport(series)} className="flex-1 flex items-center justify-center gap-1.5 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-xs font-medium py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-file-pdf-2-line text-xs"></i>
            Xu?t PDF
          </button>
        </div>
      </div>
    </div>
  );
}

interface SeriesFormProps {
  initial?: EbookSeries | null;
  lessons: ApprovedLesson[];
  onSave: (s: EbookSeries) => void;
  onCancel: () => void;
}

function SeriesForm({ initial, lessons, onSave, onCancel }: SeriesFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
  const [coverColor, setCoverColor] = useState(initial?.coverColor ?? "#0f1117");
  const [coverAccent, setCoverAccent] = useState(initial?.coverAccent ?? "app-accent-primary");
  const [template, setTemplate] = useState<EbookTemplate>(initial?.template ?? "classic");
  const [selectedRanks, setSelectedRanks] = useState<number[]>(initial?.lessonRanks ?? []);

  const toggleLesson = (rank: number) => {
    setSelectedRanks((prev) =>
      prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const series: EbookSeries = {
      id: initial?.id ?? `series-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverColor,
      coverAccent,
      template,
      lessonRanks: selectedRanks,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(series);
  };

  const templateOptions: { id: EbookTemplate; label: string; icon: string }[] = [
    { id: "classic", label: "Classic", icon: "ri-file-text-line" },
    { id: "two-col", label: "2 C?t", icon: "ri-layout-column-line" },
    { id: "dark", label: "Dark", icon: "ri-moon-line" },
    { id: "album", label: "Album", icon: "ri-image-2-line" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-app-border">
          <h2 className="text-white font-bold text-base">
            {initial ? "Ch?nh s?a series" : "T?o series m?i"}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center text-app-text-secondary hover:text-white/70 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên series *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví d?: K-pop Beginner Vol.1"
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Mô t?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô t? ng?n v? series này..."
              rows={2}
              maxLength={300}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors resize-none"
            />
          </div>

          {/* Price + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Giá bán (tùy ch?n)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ví d?: 49.000d"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tags (cách nhau b?i d?u ph?y)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="K-pop, So c?p, BTS"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
              />
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="text-app-text-secondary text-xs font-medium block mb-2">Template layout</label>
            <div className="flex gap-2">
              {templateOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    template === t.id
                      ? "border-app-accent-primary/50 bg-app-accent-primary/8 text-app-accent-primary"
                      : "border-app-border bg-app-surface/50 text-app-text-secondary hover:border-white/15"
                  }`}
                >
                  <i className={`${t.icon} text-sm`}></i>
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-2">Màu n?n bìa</label>
              <div className="flex gap-2 flex-wrap">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCoverColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                      coverColor === c ? "border-white/60 scale-110" : "border-app-border hover:border-white/30"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-app-text-secondary text-xs font-medium block mb-2">Màu nh?n</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCoverAccent(c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                      coverAccent === c ? "border-white/60 scale-110" : "border-app-border hover:border-white/30"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lesson picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-app-text-secondary text-xs font-medium">
                Ch?n bài h?c ({selectedRanks.length} dã ch?n)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRanks(lessons.map((l) => l.song.rank))}
                  className="text-[10px] text-app-accent-primary/70 hover:text-app-accent-primary cursor-pointer transition-colors whitespace-nowrap"
                >
                  Ch?n t?t c?
                </button>
                <button
                  onClick={() => setSelectedRanks([])}
                  className="text-[10px] text-app-text-muted hover:text-white/60 cursor-pointer transition-colors whitespace-nowrap"
                >
                  B? ch?n
                </button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-app-surface/50 rounded-xl p-2 border border-app-border">
              {lessons.length === 0 ? (
                <p className="text-app-text-muted text-xs text-center py-4">Chua có bài h?c nào du?c duy?t</p>
              ) : (
                lessons.map((lesson) => {
                  const isSelected = selectedRanks.includes(lesson.song.rank);
                  return (
                    <button
                      key={lesson.song.rank}
                      onClick={() => toggleLesson(lesson.song.rank)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-app-accent-primary/8 border-app-accent-primary/20"
                          : "bg-transparent border-transparent hover:bg-app-card/50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 flex items-center justify-center rounded border flex-shrink-0 transition-all ${
                          isSelected ? "bg-app-accent-primary border-app-accent-primary" : "border-white/20"
                        }`}
                      >
                        {isSelected && <i className="ri-check-line text-app-bg text-[10px]"></i>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs truncate">{lesson.song.title}</p>
                        <p className="text-app-text-muted text-[10px]">{lesson.song.artist}</p>
                      </div>
                      {(lesson.stars ?? 0) >= 4 && (
                        <i className="ri-star-fill text-app-accent-primary text-[10px] flex-shrink-0"></i>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 border-t border-app-border">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
          >
            H?y
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            {initial ? "Luu thay d?i" : "T?o series"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeriesPage() {
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [ebookMeta] = useLocalStorage<EbookMeta>("kts_ebook_meta", {
    title: "H?c Ti?ng Hàn Qua K-pop",
    subtitle: "Truy?n Chêm & T? V?ng Th?c T?",
    author: "Hà Dím",
    coverColor: "#0f1117",
    coverAccent: "app-accent-primary",
    description: "",
    fontFamily: "sans",
  });
  const [seriesList, setSeriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<EbookSeries | null>(null);
  const [landingSeries, setLandingSeries] = useState<EbookSeries | null>(null);
  const [watermarkSeries, setWatermarkSeries] = useState<EbookSeries | null>(null);
  const [emailSeries, setEmailSeries] = useState<EbookSeries | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSave = (series: EbookSeries) => {
    setSeriesList((prev) => {
      const exists = prev.find((s) => s.id === series.id);
      if (exists) return prev.map((s) => (s.id === series.id ? series : s));
      return [...prev, series];
    });
    setShowForm(false);
    setEditingSeries(null);
    showToast(editingSeries ? "Ðã c?p nh?t series!" : "Ðã t?o series m?i!");
  };

  const handleDelete = (id: string) => {
    setSeriesList((prev) => prev.filter((s) => s.id !== id));
    showToast("Ðã xóa series", "error");
  };

  const handleEdit = (series: EbookSeries) => {
    setEditingSeries(series);
    setShowForm(true);
  };

  const handleExport = (series: EbookSeries) => {
    const seriesLessons = series.lessonRanks
      .map((r) => approvedLessons.find((l) => l.song.rank === r))
      .filter(Boolean) as ApprovedLesson[];

    if (seriesLessons.length === 0) {
      showToast("Series này chua có bài h?c nào!", "error");
      return;
    }

    const meta: EbookMeta = {
      ...ebookMeta,
      title: series.name,
      subtitle: series.description || ebookMeta.subtitle,
      coverColor: series.coverColor,
      coverAccent: series.coverAccent,
    };

    const event = new CustomEvent("kts-batch-export", {
      detail: { meta, lessons: seriesLessons, template: series.template, groupName: series.name },
    });
    window.dispatchEvent(event);
    showToast(`Ðang xu?t: ${series.name}`);
  };

  const totalLessons = seriesList.reduce((sum, s) => sum + s.lessonRanks.length, 0);

  return (
    <DashboardLayout
      title="Qu?n lý Series"
      subtitle="Gom bài h?c thành series ebook d? bán theo gói"
      actions={
        <button
          onClick={() => { setEditingSeries(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          T?o series m?i
        </button>
      }
    >
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <i className={toast.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "T?ng series", value: seriesList.length, icon: "ri-stack-line", color: "app-accent-primary" },
          { label: "T?ng bài h?c", value: totalLessons, icon: "ri-book-open-line", color: "#34d399" },
          { label: "Bài dã duy?t", value: approvedLessons.length, icon: "ri-checkbox-circle-line", color: "#fb923c" },
        ].map((stat) => (
          <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Series grid */}
      {seriesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-5">
            <i className="ri-stack-line text-app-text-muted text-3xl"></i>
          </div>
          <p className="text-app-text-secondary text-sm font-medium mb-1">Chua có series nào</p>
          <p className="text-app-text-muted text-xs mb-6">T?o series d? gom bài h?c thành gói ebook có th? bán</p>
          <button
            onClick={() => { setEditingSeries(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            T?o series d?u tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {seriesList.map((series) => (
            <SeriesCard
              key={series.id}
              series={series}
              lessons={approvedLessons}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onExport={handleExport}
              onLanding={setLandingSeries}
              onWatermark={setWatermarkSeries}
              onEmail={setEmailSeries}
              onPreview={(s) => window.open(`/preview/${s.id}`, "_blank")}
            />
          ))}
          {/* Add new card */}
          <button
            onClick={() => { setEditingSeries(null); setShowForm(true); }}
            className="bg-white/2 border border-dashed border-app-border rounded-2xl flex flex-col items-center justify-center gap-3 p-8 hover:border-white/20 hover:bg-white/4 transition-all cursor-pointer min-h-[200px]"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-app-card/50 rounded-xl">
              <i className="ri-add-line text-app-text-muted text-xl"></i>
            </div>
            <p className="text-app-text-muted text-sm font-medium">T?o series m?i</p>
          </button>
        </div>
      )}

      {/* Tips */}
      {seriesList.length > 0 && (
        <div className="mt-6 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
            <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
          </div>
          <div>
            <p className="text-app-accent-primary/80 text-xs font-semibold mb-1">M?o bán ebook</p>
            <p className="text-app-text-secondary text-xs leading-relaxed">
              T?o nhi?u series theo ch? d? (So c?p, Trung c?p, Theo ngh? si...) d? d? bán theo gói.
              Xu?t PDF t?ng series r?i bán qua Zalo, Facebook ho?c Gumroad.
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <SeriesForm
          initial={editingSeries}
          lessons={approvedLessons}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingSeries(null); }}
        />
      )}

      {emailSeries && (
        <EmailDeliveryModal
          series={emailSeries}
          lessons={approvedLessons}
          onClose={() => setEmailSeries(null)}
        />
      )}

      {landingSeries && (
        <LandingPageModal
          series={landingSeries}
          lessons={approvedLessons}
          onClose={() => setLandingSeries(null)}
        />
      )}

      {watermarkSeries && (
        <WatermarkModal
          onClose={() => setWatermarkSeries(null)}
          onApply={(buyerName, note) => {
            const seriesLessons = watermarkSeries.lessonRanks
              .map(r => approvedLessons.find(l => l.song.rank === r))
              .filter(Boolean) as ApprovedLesson[];
            const html = buildLandingPageHTML(watermarkSeries, seriesLessons)
              .replace(
                /<\/body>/,
                `<script>
                  document.querySelectorAll('.page, .ebook-page').forEach(p => {
                    const wm = document.createElement('div');
                    wm.style.cssText = 'position:fixed;bottom:8px;right:12px;font-size:9px;color:rgba(0,0,0,0.12);pointer-events:none;z-index:9999;font-family:sans-serif;';
                    wm.textContent = 'B?n quy?n: ${buyerName}${note ? " · " + note : ""}';
                    document.body.appendChild(wm);
                  });
                <\/script></body>`
              );
            const blob = new Blob([html], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${watermarkSeries.name.replace(/\s+/g, "_")}_${buyerName.replace(/\s+/g, "_")}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setWatermarkSeries(null);
            showToast(`Ðã xu?t ebook cho ${buyerName}!`);
          }}
        />
      )}
    </DashboardLayout>
  );
}

