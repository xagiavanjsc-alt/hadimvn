import { useState, useCallback } from "react";
import type { EbookMeta } from "@/pages/ebook/page";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookTemplate } from "./EbookTemplates";

interface Props {
  meta: EbookMeta;
  lessons: ApprovedLesson[];
  template?: EbookTemplate;
  disabled?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function removeRomanization(text: string): string {
  return text
    .replace(/([가-힣]+)\s*\(([a-zA-Z\s\-']+)\)/g, "$1")
    .replace(/\*([a-zA-Z\s\-']+)\*/g, "")
    .replace(/\[([a-zA-Z\s\-']+)\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function highlightKorean(text: string): string {
  return text.replace(
    /([\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+)/g,
    '<span class="kor">$1</span>'
  );
}

interface VocabParsed {
  korean: string;
  romanization: string | null;
  meaning: string;
  example?: string;
}

function parseVocab(v: { word: string; meaning: string; example?: string }): VocabParsed {
  const matchKorRom = v.word.match(/^([가-힣\s]+)\s*\(([^)]+)\)$/);
  if (matchKorRom) return { korean: matchKorRom[1].trim(), romanization: matchKorRom[2].trim(), meaning: v.meaning, example: v.example };
  const matchRomKor = v.word.match(/^\(([^)]+)\)\s*([가-힣\s]+)$/);
  if (matchRomKor) return { korean: matchRomKor[2].trim(), romanization: matchRomKor[1].trim(), meaning: v.meaning, example: v.example };
  return { korean: v.word, romanization: null, meaning: v.meaning, example: v.example };
}

interface GrammarPoint { pattern: string; explain: string; example?: string }

function parseGrammar(raw: string): GrammarPoint[] {
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  const points: GrammarPoint[] = [];
  let current: GrammarPoint | null = null;

  for (const line of lines) {
    // Detect example lines: starts with "예:" / "예시:" / "VD:" / "Ví dụ:" / "Ex:"
    const isExample = /^(예\s*[:：]|예시\s*[:：]|VD\s*[:：]|Ví dụ\s*[:：]|Ex\s*[:：])/i.test(line);
    const isHeader = !isExample && /^(\d+[\.\)]\s|[•\-\*]\s|[가-힣].{0,20}[:\-–])/.test(line);

    if (isHeader) {
      if (current) points.push(current);
      const splitMatch = line.match(/^(?:\d+[\.\)]\s*|[•\-\*]\s*)?(.*?)\s*[:\-–]\s*(.+)$/);
      if (splitMatch) {
        current = { pattern: splitMatch[1].trim(), explain: splitMatch[2].trim() };
      } else {
        current = { pattern: line.replace(/^[\d\.\)\-\*•]+\s*/, ""), explain: "" };
      }
    } else if (isExample && current) {
      current.example = line.replace(/^(예\s*[:：]|예시\s*[:：]|VD\s*[:：]|Ví dụ\s*[:：]|Ex\s*[:：])\s*/i, "").trim();
    } else {
      if (current) {
        current.explain += (current.explain ? "\n" : "") + line;
      } else {
        current = { pattern: "", explain: line };
      }
    }
  }
  if (current) points.push(current);
  return points;
}

/** Tính số trang thực của mỗi bài */
function calcLessonPageCount(lesson: ApprovedLesson): number {
  const storyLen = lesson.story?.length ?? 0;
  const vocabCount = lesson.vocabulary?.length ?? 0;
  const hasGrammar = !!(lesson.explanation?.trim());
  if (storyLen > 400 || vocabCount > 6 || hasGrammar) return 2;
  return 1;
}

/** Tính page offset cho từng bài — khớp với EbookCanvas */
function calcPageOffsets(lessons: ApprovedLesson[], hasForeword: boolean): number[] {
  // Cover=1, Foreword=2(nếu có), TOC=tiếp theo, bài học bắt đầu sau TOC
  let page = 2 + (hasForeword ? 1 : 0) + 1;
  return lessons.map(lesson => {
    const start = page;
    page += calcLessonPageCount(lesson);
    return start;
  });
}

// ─── HTML Builder ────────────────────────────────────────────────────────────

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: "'Noto Sans KR', 'Malgun Gothic', Arial, sans-serif",
  serif: "'Noto Serif KR', 'Batang', Georgia, serif",
};

function buildHtmlContent(meta: EbookMeta, lessons: ApprovedLesson[], template: EbookTemplate): string {
  const accent = meta.coverAccent || "#e8c84a";
  const isDark = template === "dark";
  const hasForeword = !!meta.foreword?.trim();
  const pageOffsets = calcPageOffsets(lessons, hasForeword);
  const fontFamily = FONT_FAMILY_MAP[meta.fontFamily ?? "sans"];

  // ── Vocab card HTML ──
  function vocabCardHtml(v: { word: string; meaning: string; example?: string }, darkMode = false): string {
    const p = parseVocab(v);
    if (darkMode) {
      return `
        <div style="background:rgba(192,57,43,0.08);border:1.5px solid rgba(192,57,43,0.25);border-radius:10px;padding:12px 14px;">
          <div style="font-weight:900;color:#e05555;font-size:13pt;margin-bottom:2px;font-family:'Noto Sans KR',sans-serif;">${p.korean}</div>
          ${p.romanization ? `<div style="font-size:9pt;color:rgba(255,255,255,0.35);font-style:italic;margin-bottom:4px;">${p.romanization}</div>` : ""}
          <div style="color:rgba(255,255,255,0.75);font-size:10pt;font-weight:600;margin-bottom:4px;">${p.meaning}</div>
          ${p.example ? `<div style="color:rgba(255,255,255,0.35);font-size:8.5pt;font-style:italic;line-height:1.5;">${highlightKorean(p.example)}</div>` : ""}
        </div>`;
    }
    return `
      <div style="background:#fff8f8;border:1.5px solid #f5c6c6;border-radius:10px;padding:12px 14px;">
        <div style="font-weight:900;color:#1a1a1a;font-size:13pt;margin-bottom:2px;font-family:'Noto Sans KR',sans-serif;">${p.korean}</div>
        ${p.romanization ? `<div style="font-size:9pt;color:#999;font-style:italic;margin-bottom:4px;">${p.romanization}</div>` : ""}
        <div style="color:#c0392b;font-size:10.5pt;font-weight:700;margin-bottom:4px;">${p.meaning}</div>
        ${p.example ? `<div style="color:#888;font-size:8.5pt;font-style:italic;line-height:1.5;">${highlightKorean(p.example)}</div>` : ""}
      </div>`;
  }

  // ── Grammar HTML ──
  function grammarHtml(points: GrammarPoint[], darkMode = false): string {
    if (points.length === 0) return "";
    const textColor = darkMode ? "rgba(255,255,255,0.85)" : "#333";
    const subColor = darkMode ? "rgba(255,255,255,0.5)" : "#666";
    const exColor = darkMode ? "rgba(255,255,255,0.35)" : "#888";
    const borderColor = darkMode ? "rgba(255,255,255,0.06)" : "#f0e8c0";
    const patternColor = darkMode ? "#e8c84a" : "#1a1a1a";

    return points.map((gp, gi) => `
      <div style="margin-bottom:${gi < points.length - 1 ? "18px" : "0"};padding-bottom:${gi < points.length - 1 ? "18px" : "0"};border-bottom:${gi < points.length - 1 ? `1px solid ${borderColor}` : "none"};">
        ${gp.pattern ? `
          <div style="font-size:12.5pt;font-weight:700;color:${patternColor};margin-bottom:6px;font-family:'Noto Sans KR',sans-serif;line-height:1.4;">
            ${highlightKorean(gp.pattern)}
          </div>` : ""}
        ${gp.explain ? `
          <div style="font-size:10pt;color:${textColor};line-height:1.9;white-space:pre-wrap;margin-bottom:${gp.example ? "8px" : "0"};">
            ${highlightKorean(gp.explain)}
          </div>` : ""}
        ${gp.example ? `
          <div style="background:${darkMode ? "rgba(255,255,255,0.04)" : "#f9f6ee"};border-left:3px solid ${accent};border-radius:0 6px 6px 0;padding:8px 12px;margin-top:6px;">
            <div style="font-size:8pt;font-weight:700;text-transform:;letter-spacing:0.08em;color:${subColor};margin-bottom:4px;">Ví dụ</div>
            <div style="font-size:10pt;color:${exColor};font-style:italic;line-height:1.7;">${highlightKorean(gp.example)}</div>
          </div>` : ""}
      </div>`).join("");
  }

  // ── Section label HTML ──
  function sectionLabel(title: string, barColor: string, darkMode = false): string {
    const titleColor = darkMode ? "#e8e8e8" : "#1a1a1a";
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <div style="width:4px;height:20px;border-radius:3px;background:${barColor};flex-shrink:0;"></div>
        <span style="font-size:12pt;font-weight:700;color:${titleColor};letter-spacing:0.02em;">${title}</span>
      </div>`;
  }

  // ── Footer HTML ──
  function footerHtml(pageNum: number, darkMode = false): string {
    const color = darkMode ? "rgba(255,255,255,0.2)" : "#ccc";
    const border = darkMode ? "rgba(255,255,255,0.06)" : "#eee";
    return `
      <div style="position:absolute;bottom:14mm;left:18mm;right:18mm;display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${border};padding-top:7px;">
        <span style="color:${color};font-size:8pt;">${meta.author}</span>
        <span style="color:${color};font-size:8pt;">${pageNum}</span>
      </div>`;
  }

  // ── Lesson pages HTML ──
  const lessonPagesHtml = lessons.map((lesson, idx) => {
    const cleanStory = removeRomanization(lesson.story);
    const storyHtml = highlightKorean(cleanStory);
    const grammarPoints = lesson.explanation ? parseGrammar(lesson.explanation) : [];
    const pageNum = pageOffsets[idx];
    const lessonPageCount = calcLessonPageCount(lesson);
    const vocabPage1 = lessonPageCount === 2 ? lesson.vocabulary.slice(0, 6) : lesson.vocabulary;
    const vocabPage2 = lessonPageCount === 2 ? lesson.vocabulary.slice(6) : [];

    if (isDark) {
      const page1 = `
      <div class="page" style="background:#0f1117;color:#e8e8e8;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <div>
            <div style="font-size:8pt;font-weight:700;text-transform:;letter-spacing:0.12em;margin-bottom:5px;color:${accent};">Bài ${idx + 1}</div>
            <h2 style="font-size:19pt;font-weight:700;color:#e8e8e8;margin-bottom:3px;line-height:1.2;">${lesson.song.title}</h2>
            <div style="color:rgba(255,255,255,0.4);font-size:10.5pt;">${lesson.song.artist}</div>
          </div>
          ${lesson.song.genre ? `<span style="font-size:8pt;color:${accent};background:${accent}20;padding:4px 10px;border-radius:20px;flex-shrink:0;margin-left:12px;margin-top:4px;">${lesson.song.genre}</span>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <div style="width:32px;height:2px;background:${accent};"></div>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div>
        </div>
        <div style="margin-bottom:20px;">
          ${sectionLabel("Truyện Chêm", accent, true)}
          <div style="color:rgba(255,255,255,0.75);font-size:11.5pt;line-height:2.1;white-space:pre-wrap;">${storyHtml}</div>
        </div>
        ${vocabPage1.length > 0 ? `
        <div style="margin-bottom:${lessonPageCount === 1 ? "20px" : "0"};">
          ${sectionLabel("Từ vựng cốt lõi", "#e05555", true)}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${vocabPage1.map(v => vocabCardHtml(v, true)).join("")}
          </div>
        </div>` : ""}
        ${lessonPageCount === 1 && grammarPoints.length > 0 ? `
        <div style="margin-bottom:20px;">
          ${sectionLabel("Điểm ngữ pháp", "#d4a017", true)}
          <div style="background:rgba(212,160,23,0.08);border:1.5px solid rgba(212,160,23,0.2);border-radius:10px;padding:16px 18px;">
            ${grammarHtml(grammarPoints, true)}
          </div>
        </div>` : ""}
        ${footerHtml(pageNum, true)}
      </div>`;

      const page2 = lessonPageCount === 2 ? `
      <div class="page" style="background:#0f1117;color:#e8e8e8;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
          <span style="font-size:8pt;font-weight:700;text-transform:;letter-spacing:0.12em;color:${accent};">Bài ${idx + 1} — tiếp theo</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div>
          <span style="font-size:8pt;color:rgba(255,255,255,0.2);">${lesson.song.title}</span>
        </div>
        ${vocabPage2.length > 0 ? `
        <div style="margin-bottom:22px;">
          ${sectionLabel("Từ vựng cốt lõi (tiếp)", "#e05555", true)}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${vocabPage2.map(v => vocabCardHtml(v, true)).join("")}
          </div>
        </div>` : ""}
        ${grammarPoints.length > 0 ? `
        <div style="margin-bottom:20px;">
          ${sectionLabel("Điểm ngữ pháp", "#d4a017", true)}
          <div style="background:rgba(212,160,23,0.08);border:1.5px solid rgba(212,160,23,0.2);border-radius:10px;padding:16px 18px;">
            ${grammarHtml(grammarPoints, true)}
          </div>
        </div>` : ""}
        ${footerHtml(pageNum + 1, true)}
      </div>` : "";

      return page1 + page2;
    }

    // Light template
    const page1 = `
    <div class="page">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div>
          <div style="font-size:8pt;font-weight:700;text-transform:;letter-spacing:0.14em;margin-bottom:5px;color:${accent};">Bài ${idx + 1}</div>
          <h2 style="font-size:19pt;font-weight:700;color:#111;margin-bottom:3px;line-height:1.2;">${lesson.song.title}</h2>
          <div style="color:#888;font-size:10.5pt;">${lesson.song.artist}</div>
        </div>
        ${lesson.song.genre ? `<span style="font-size:8pt;color:#999;background:#f5f5f5;padding:4px 12px;border-radius:20px;flex-shrink:0;margin-left:12px;margin-top:4px;">${lesson.song.genre}</span>` : ""}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        <div style="width:32px;height:2px;background:${accent};"></div>
        <div style="flex:1;height:1px;background:#f0f0f0;"></div>
      </div>
      <div style="margin-bottom:20px;">
        ${sectionLabel("Truyện Chêm", accent)}
        <div style="font-size:11.5pt;line-height:2.1;color:#2c2c2c;white-space:pre-wrap;">${storyHtml}</div>
      </div>
      ${vocabPage1.length > 0 ? `
      <div style="margin-bottom:${lessonPageCount === 1 ? "20px" : "0"};">
        ${sectionLabel("Từ vựng cốt lõi", "#2c7a4b")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${vocabPage1.map(v => vocabCardHtml(v)).join("")}
        </div>
      </div>` : ""}
      ${lessonPageCount === 1 && grammarPoints.length > 0 ? `
      <div style="margin-bottom:20px;">
        ${sectionLabel("Điểm ngữ pháp", "#d4a017")}
        <div style="background:#fffbf0;border:1.5px solid #f0d060;border-radius:10px;padding:16px 18px;">
          ${grammarHtml(grammarPoints)}
        </div>
      </div>` : ""}
      ${footerHtml(pageNum)}
    </div>`;

    const page2 = lessonPageCount === 2 ? `
    <div class="page">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
        <span style="font-size:8pt;font-weight:700;text-transform:;letter-spacing:0.14em;color:${accent};">Bài ${idx + 1} — tiếp theo</span>
        <div style="flex:1;height:1px;background:#f0f0f0;"></div>
        <span style="font-size:8pt;color:#ccc;">${lesson.song.title}</span>
      </div>
      ${vocabPage2.length > 0 ? `
      <div style="margin-bottom:22px;">
        ${sectionLabel("Từ vựng cốt lõi (tiếp)", "#2c7a4b")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${vocabPage2.map(v => vocabCardHtml(v)).join("")}
        </div>
      </div>` : ""}
      ${grammarPoints.length > 0 ? `
      <div style="margin-bottom:20px;">
        ${sectionLabel("Điểm ngữ pháp", "#d4a017")}
        <div style="background:#fffbf0;border:1.5px solid #f0d060;border-radius:10px;padding:16px 18px;">
          ${grammarHtml(grammarPoints)}
        </div>
      </div>` : ""}
      ${footerHtml(pageNum + 1)}
    </div>` : "";

    return page1 + page2;
  }).join("\n");

  // ── Foreword page ──
  const forewordPageHtml = hasForeword ? `
  <div class="page" style="display:flex;flex-direction:column;justify-content:center;align-items:center;">
    <div style="max-width:420px;width:100%;">
      <div style="width:32px;height:3px;background:${accent};margin-bottom:28px;"></div>
      <h2 style="font-size:20pt;font-weight:700;color:#111;margin-bottom:20px;">Lời mở đầu</h2>
      <div style="color:#444;font-size:11pt;line-height:2;white-space:pre-wrap;">${meta.foreword}</div>
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;">
        <div style="color:#999;font-size:10pt;font-style:italic;">— ${meta.author}</div>
      </div>
    </div>
  </div>` : "";

  // ── TOC page ──
  const tocPageHtml = `
  <div class="page">
    <h2 style="font-size:22pt;font-weight:700;color:#111;margin-bottom:8px;">Mục lục</h2>
    <div style="width:40px;height:3px;background:${accent};margin-bottom:28px;"></div>
    ${lessons.map((l, i) => `
    <div style="display:flex;align-items:center;gap:16px;padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:12pt;font-weight:700;width:28px;text-align:right;flex-shrink:0;color:${accent};">${i + 1}</span>
      <div style="flex:1;">
        <div style="color:#222;font-weight:600;font-size:11pt;">${l.song.title}</div>
        <div style="color:#999;font-size:9pt;">${l.song.artist}${l.song.genre ? ` · ${l.song.genre}` : ""}</div>
      </div>
      <span style="color:#ccc;font-size:9pt;flex-shrink:0;">Trang ${pageOffsets[i]}</span>
    </div>`).join("")}
  </div>`;

  // ── Closing page ──
  const closingPageHtml = `
  <div class="page" style="background:${meta.coverColor};display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
    <div style="width:48px;height:3px;background:${accent};margin-bottom:32px;"></div>
    <h2 style="font-size:24pt;font-weight:700;color:${accent};margin-bottom:12px;">Cảm ơn bạn đã đọc!</h2>
    <p style="color:rgba(255,255,255,0.5);font-size:12pt;margin-bottom:40px;max-width:320px;line-height:1.8;">Hy vọng ebook này giúp bạn tiến bộ tiếng Hàn mỗi ngày.</p>
    ${(meta.contactInfo || meta.website) ? `
    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px 32px;border:1px solid rgba(255,255,255,0.08);max-width:360px;width:100%;">
      <div style="color:${accent};font-size:9pt;font-weight:700;text-transform:;letter-spacing:0.12em;margin-bottom:14px;">Liên hệ & Theo dõi</div>
      ${meta.contactInfo ? `<div style="color:rgba(255,255,255,0.5);font-size:10pt;line-height:2;white-space:pre-wrap;margin-bottom:12px;">${meta.contactInfo}</div>` : ""}
      ${meta.website ? `<div style="color:${accent};font-size:11pt;font-weight:600;">${meta.website}</div>` : ""}
    </div>` : ""}
    <div style="position:absolute;bottom:20mm;left:18mm;right:18mm;text-align:center;">
      <span style="color:rgba(255,255,255,0.15);font-size:8pt;">${meta.author} · ${new Date().getFullYear()}</span>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title} — ${meta.author}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${fontFamily}; background: #e8e8e8; }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 18mm;
    background: #ffffff;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
    position: relative;
    margin: 0 auto 24px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.12);
  }
  .kor { font-family: 'Noto Sans KR', sans-serif; font-weight: 600; }
  @media print {
    body { background: white; }
    .page { margin: 0; box-shadow: none; page-break-after: always; min-height: 297mm; }
    .page:last-child { page-break-after: avoid; }
    .no-print { display: none !important; }
    @page { size: A4; margin: 0; }
  }
  .toolbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: #0f1117; border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
  }
  .toolbar-title { color: ${accent}; font-weight: 700; font-size: 14px; }
  .toolbar-sub { color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 2px; }
  .btn-print {
    background: ${accent}; color: #0f1117; font-weight: 700; font-size: 13px;
    padding: 8px 20px; border-radius: 8px; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-print:hover { opacity: 0.9; }
  .content { padding-top: 72px; padding-bottom: 40px; }
</style>
</head>
<body>
<div class="toolbar no-print">
  <div>
    <div class="toolbar-title">${meta.title}</div>
    <div class="toolbar-sub">${meta.author} · ${lessons.length} bài học</div>
  </div>
  <button class="btn-print" onclick="window.print()">🖨️ In / Lưu PDF</button>
</div>
<div class="content">
  <!-- COVER -->
  <div class="page" style="background:${meta.coverColor};display:flex;flex-direction:column;justify-content:space-between;">
    <div style="width:48px;height:4px;background:${accent};margin-bottom:32px;"></div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:10pt;font-weight:700;text-transform:;letter-spacing:0.15em;margin-bottom:24px;opacity:0.65;color:${accent};">${meta.author}</div>
      <h1 style="font-size:32pt;font-weight:700;line-height:1.2;margin-bottom:12px;color:${accent};">${meta.title}</h1>
      <div style="color:rgba(255,255,255,0.55);font-size:14pt;margin-bottom:24px;">${meta.subtitle}</div>
      <div style="color:rgba(255,255,255,0.35);font-size:10pt;line-height:1.8;max-width:380px;">${meta.description}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="color:rgba(255,255,255,0.2);font-size:9pt;">${lessons.length} bài học</span>
      <span style="color:rgba(255,255,255,0.2);font-size:9pt;">${new Date().getFullYear()}</span>
    </div>
  </div>

  ${forewordPageHtml}
  ${tocPageHtml}
  ${lessonPagesHtml}
  ${closingPageHtml}
</div>
</body>
</html>`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EbookPDFPreview({ meta, lessons, template = "classic", disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const handleOpen = useCallback(() => {
    const html = buildHtmlContent(meta, lessons, template);
    setHtmlContent(html);
    setOpen(true);
  }, [meta, lessons, template]);

  const handleExportHTML = useCallback(() => {
    const html = buildHtmlContent(meta, lessons, template);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.title.replace(/\s+/g, "_")}_ebook.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [meta, lessons, template]);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleOpen}
          disabled={disabled}
          className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-sky-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer border border-sky-500/20"
        >
          <i className="ri-eye-line"></i>
          Xem trước
        </button>
        <button
          onClick={handleExportHTML}
          disabled={disabled}
          className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-violet-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer border border-violet-500/20"
        >
          <i className="ri-html5-line"></i>
          Xuất HTML
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-app-bg border-b border-app-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-sky-500/10 rounded-lg">
                <i className="ri-file-pdf-2-line text-sky-400 text-base"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{meta.title}</p>
                <p className="text-app-text-secondary text-xs">{lessons.length} bài học · Xem trước trước khi in</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportHTML}
                className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-violet-500/20"
              >
                <i className="ri-html5-line"></i>
                Tải file HTML
              </button>
              <button
                onClick={() => {
                  const iframe = document.getElementById("ebook-preview-iframe") as HTMLIFrameElement;
                  iframe?.contentWindow?.print();
                }}
                className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-xs font-bold px-5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-printer-line"></i>
                In / Lưu PDF
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-app-text-muted hover:text-white/70 hover:bg-app-card/50 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-3 px-6 py-2.5 bg-sky-500/5 border-b border-sky-500/10 flex-shrink-0">
            <i className="ri-information-line text-sky-400 text-sm"></i>
            <p className="text-sky-400/70 text-xs">
              Đây là bản xem trước đầy đủ. Nhấn <strong className="text-sky-400">In / Lưu PDF</strong> để in hoặc lưu thành file PDF. Nhấn <strong className="text-sky-400">Tải file HTML</strong> để chia sẻ online.
            </p>
          </div>

          {/* iframe */}
          <div className="flex-1 overflow-hidden bg-[#1a1a1a]">
            <iframe
              id="ebook-preview-iframe"
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title="Ebook Preview"
              sandbox="allow-same-origin allow-scripts allow-modals"
            />
          </div>
        </div>
      )}
    </>
  );
}
