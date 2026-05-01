import { RefObject } from "react";
import type { EbookMeta } from "@/pages/ebook/page";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookTemplate } from "./EbookTemplates";

interface Props {
  meta: EbookMeta;
  lessons: ApprovedLesson[];
  printRef: RefObject<HTMLDivElement | null>;
  template?: EbookTemplate;
}

function removeRomanization(text: string): string {
  return text
    .replace(/([가-힣]+)\s*\(([a-zA-Z\s\-']+)\)/g, "$1")
    .replace(/\*([a-zA-Z\s\-']+)\*/g, "")
    .replace(/\[([a-zA-Z\s\-']+)\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function wrapKorean(text: string): string {
  return text.replace(
    /([\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+)/g,
    '<span style="font-family:\'Noto Sans KR\',sans-serif;font-weight:600;">$1</span>'
  );
}

/** Parse vocab word: tách tiếng Hàn, phiên âm, nghĩa */
interface VocabParsed {
  korean: string;
  romanization: string | null;
  meaning: string;
  example?: string;
}

function parseVocab(v: { word: string; meaning: string; example?: string }): VocabParsed {
  // Case 1: "안녕 (annyeong)" — Korean + romanization in parens
  const matchKorRom = v.word.match(/^([가-힣\s]+)\s*\(([^)]+)\)$/);
  if (matchKorRom) {
    return { korean: matchKorRom[1].trim(), romanization: matchKorRom[2].trim(), meaning: v.meaning, example: v.example };
  }
  // Case 2: "(annyeong) 안녕" — romanization first
  const matchRomKor = v.word.match(/^\(([^)]+)\)\s*([가-힣\s]+)$/);
  if (matchRomKor) {
    return { korean: matchRomKor[2].trim(), romanization: matchRomKor[1].trim(), meaning: v.meaning, example: v.example };
  }
  // Case 3: pure Korean
  return { korean: v.word, romanization: null, meaning: v.meaning, example: v.example };
}

/** Parse grammar into structured points */
interface GrammarPoint { pattern: string; explain: string }

function parseGrammar(raw: string): GrammarPoint[] {
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  const points: GrammarPoint[] = [];
  let current: GrammarPoint | null = null;

  for (const line of lines) {
    const isHeader = /^(\d+[\.\)]\s|[•\-\*]\s|[가-힣].{0,20}[:\-–])/.test(line);
    if (isHeader) {
      if (current) points.push(current);
      const splitMatch = line.match(/^(?:\d+[\.\)]\s*|[•\-\*]\s*)?(.*?)\s*[:\-–]\s*(.+)$/);
      if (splitMatch) {
        current = { pattern: splitMatch[1].trim(), explain: splitMatch[2].trim() };
      } else {
        current = { pattern: line.replace(/^[\d\.\)\-\*•]+\s*/, ""), explain: "" };
      }
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

/** Tính số trang thực của mỗi bài (1 hoặc 2 trang) */
function calcLessonPageCount(lesson: ApprovedLesson): number {
  const storyLen = lesson.story?.length ?? 0;
  const vocabCount = lesson.vocabulary?.length ?? 0;
  const hasGrammar = !!(lesson.explanation?.trim());
  // Heuristic: nếu story dài > 400 ký tự hoặc vocab > 6 từ hoặc có grammar → 2 trang
  if (storyLen > 400 || vocabCount > 6 || hasGrammar) return 2;
  return 1;
}

/** Tính page offset cho từng bài */
function calcPageOffsets(lessons: ApprovedLesson[], hasForeword: boolean): number[] {
  // Cover=1, Foreword=2(if exists), TOC=next, lessons start after TOC
  let page = 2 + (hasForeword ? 1 : 0) + 1; // first lesson page
  return lessons.map(lesson => {
    const start = page;
    page += calcLessonPageCount(lesson);
    return start;
  });
}

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: "'Noto Sans KR', 'Noto Sans', 'Malgun Gothic', Arial, sans-serif",
  serif: "'Noto Serif KR', 'Batang', Georgia, serif",
};

function getPageStyle(fontFamily: string): React.CSSProperties {
  return {
    width: "210mm",
    minHeight: "297mm",
    padding: "20mm 18mm",
    backgroundColor: "#ffffff",
    fontFamily,
    fontSize: "11pt",
    lineHeight: "1.7",
    color: "#1a1a1a",
    position: "relative",
    pageBreakAfter: "always",
    boxSizing: "border-box",
  };
}

export default function EbookCanvas({ meta, lessons, printRef, template = "classic" }: Props) {
  const accent = meta.coverAccent || "#e8c84a";
  const hasForeword = !!meta.foreword?.trim();
  const pageOffsets = calcPageOffsets(lessons, hasForeword);
  const fontFamily = FONT_FAMILY_MAP[meta.fontFamily ?? "sans"];
  const PAGE_STYLE = getPageStyle(fontFamily);

  return (
    <>
      {/* Sidebar preview */}
      <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ backgroundColor: meta.coverColor, padding: "24px", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: accent }} />
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "", letterSpacing: "0.1em", marginBottom: "12px", opacity: 0.7, color: accent }}>{meta.author}</div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.3, marginBottom: "4px", color: accent }}>{meta.title || "Tiêu đề ebook"}</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", lineHeight: 1.5 }}>{meta.subtitle}</p>
          </div>
          <div style={{ marginTop: "16px" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", lineHeight: 1.5 }}>{meta.description}</p>
            <div style={{ marginTop: "12px", fontSize: "9px", fontWeight: 600, color: accent }}>{lessons.length} bài học</div>
          </div>
        </div>
        {lessons.length > 0 && (
          <div style={{ padding: "12px", maxHeight: "256px", overflowY: "auto" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", textTransform: "", letterSpacing: "0.1em", marginBottom: "8px" }}>Mục lục</p>
            {lessons.map((lesson, idx) => (
              <div key={lesson.song.rank} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, width: "16px", textAlign: "right", flexShrink: 0, color: accent }}>{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.song.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "8px" }}>{lesson.song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {lessons.length === 0 && (
          <div style={{ padding: "16px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>Chọn bài học để xem mục lục</div>
        )}
      </div>

      {/* Hidden print area */}
      <div id="ebook-print-area" ref={printRef} style={{ display: "none" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@400;600;700&display=swap');
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          .ebook-page { page-break-after: always; }
          .ebook-page:last-child { page-break-after: avoid; }
          .vocab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .vocab-card { background: #fff8f8; border: 1.5px solid #f5c6c6; border-radius: 10px; padding: 12px 14px; }
          .vocab-korean { font-size: 14pt; font-weight: 900; color: #1a1a1a; margin-bottom: 2px; font-family: 'Noto Sans KR', sans-serif; }
          .vocab-romanization { font-size: 9pt; color: #999; font-style: italic; margin-bottom: 4px; }
          .vocab-meaning { font-size: 10.5pt; color: #c0392b; font-weight: 700; margin-bottom: 4px; }
          .vocab-example { font-size: 9pt; color: #888; font-style: italic; line-height: 1.5; }
          .grammar-box { background: #fffbf0; border: 1.5px solid #f0d060; border-radius: 10px; padding: 16px 18px; }
          .grammar-point { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0e8c0; }
          .grammar-point:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
          .grammar-pattern { font-size: 12pt; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; font-family: 'Noto Sans KR', sans-serif; }
          .grammar-explain { font-size: 10pt; color: #555; line-height: 1.9; white-space: pre-wrap; }
          .story-text { font-size: 11.5pt; line-height: 2.1; color: #2c2c2c; white-space: pre-wrap; }
          .section-label { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
          .section-bar { width: 4px; height: 20px; border-radius: 3px; flex-shrink: 0; }
          .section-title { font-size: 12pt; font-weight: 700; color: #1a1a1a; letter-spacing: 0.02em; }
          .page-footer { position: absolute; bottom: 14mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 7px; }
        `}</style>

        {/* COVER */}
        <div className="ebook-page" style={{ ...PAGE_STYLE, backgroundColor: meta.coverColor, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ width: "48px", height: "4px", backgroundColor: accent, marginBottom: "32px" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "10pt", fontWeight: 700, textTransform: "", letterSpacing: "0.15em", marginBottom: "24px", opacity: 0.65, color: accent }}>{meta.author}</p>
            <h1 style={{ fontSize: "32pt", fontWeight: 700, lineHeight: 1.2, marginBottom: "12px", color: accent }}>{meta.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14pt", marginBottom: "24px" }}>{meta.subtitle}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10pt", lineHeight: 1.8, maxWidth: "380px" }}>{meta.description}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "9pt" }}>{lessons.length} bài học</p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "9pt" }}>{new Date().getFullYear()}</p>
          </div>
        </div>

        {/* FOREWORD */}
        {hasForeword && (
          <div className="ebook-page" style={{ ...PAGE_STYLE, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ maxWidth: "420px", margin: "0 auto", width: "100%" }}>
              <div style={{ width: "32px", height: "3px", backgroundColor: accent, marginBottom: "28px" }} />
              <h2 style={{ fontSize: "20pt", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Lời mở đầu</h2>
              <p style={{ color: "#444", fontSize: "11pt", lineHeight: 2, whiteSpace: "pre-wrap" }}>{meta.foreword}</p>
              <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
                <p style={{ color: "#999", fontSize: "10pt", fontStyle: "italic" }}>— {meta.author}</p>
              </div>
            </div>
          </div>
        )}

        {/* TABLE OF CONTENTS — tính sau khi biết page offsets */}
        <div className="ebook-page" style={{ ...PAGE_STYLE }}>
          <h2 style={{ fontSize: "22pt", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Mục lục</h2>
          <div style={{ width: "40px", height: "3px", backgroundColor: accent, marginBottom: "28px" }} />
          {lessons.map((lesson, idx) => (
            <div key={lesson.song.rank} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "9px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: "12pt", fontWeight: 700, width: "28px", textAlign: "right", flexShrink: 0, color: accent }}>{idx + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#222", fontWeight: 600, fontSize: "11pt" }}>{lesson.song.title}</p>
                <p style={{ color: "#999", fontSize: "9pt" }}>{lesson.song.artist}</p>
              </div>
              <p style={{ color: "#ccc", fontSize: "9pt", flexShrink: 0 }}>Trang {pageOffsets[idx]}</p>
            </div>
          ))}
        </div>

        {/* LESSON PAGES — mỗi bài có thể 1 hoặc 2 trang */}
        {lessons.map((lesson, idx) => {
          const cleanStory = removeRomanization(lesson.story);
          const storyHtml = wrapKorean(cleanStory);
          const grammarPoints = lesson.explanation ? parseGrammar(lesson.explanation) : [];
          const pageNum = pageOffsets[idx];
          const lessonPages = calcLessonPageCount(lesson);

          // Trang 1: Header + Story + Vocab (tối đa 6 từ nếu 2 trang, tất cả nếu 1 trang)
          const vocabPage1 = lessonPages === 2 ? lesson.vocabulary.slice(0, 6) : lesson.vocabulary;
          const vocabPage2 = lessonPages === 2 ? lesson.vocabulary.slice(6) : [];

          return (
            <>
              {/* TRANG 1 */}
              <div key={`${lesson.song.rank}-p1`} className="ebook-page" style={{ ...PAGE_STYLE }}>
                {/* Lesson header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "8pt", fontWeight: 700, textTransform: "", letterSpacing: "0.14em", marginBottom: "5px", color: accent }}>Bài {idx + 1}</p>
                    <h2 style={{ fontSize: "19pt", fontWeight: 700, color: "#111", marginBottom: "3px", lineHeight: 1.2 }}>{lesson.song.title}</h2>
                    <p style={{ color: "#888", fontSize: "10.5pt" }}>{lesson.song.artist}</p>
                  </div>
                  {lesson.song.genre && (
                    <span style={{ fontSize: "8pt", color: "#999", backgroundColor: "#f5f5f5", padding: "4px 12px", borderRadius: "20px", flexShrink: 0, marginLeft: "12px", marginTop: "4px" }}>{lesson.song.genre}</span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "2px", backgroundColor: accent }} />
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#f0f0f0" }} />
                </div>

                {/* STORY */}
                <div style={{ marginBottom: "20px" }}>
                  <div className="section-label">
                    <div className="section-bar" style={{ backgroundColor: accent }} />
                    <span className="section-title">Truyện Chêm</span>
                  </div>
                  <div
                    className="story-text"
                    dangerouslySetInnerHTML={{ __html: storyHtml }}
                  />
                </div>

                {/* VOCAB trang 1 */}
                {vocabPage1.length > 0 && (
                  <div style={{ marginBottom: lessonPages === 1 ? "20px" : "0" }}>
                    <div className="section-label">
                      <div className="section-bar" style={{ backgroundColor: "#2c7a4b" }} />
                      <span className="section-title">Từ vựng cốt lõi</span>
                    </div>
                    <div className="vocab-grid">
                      {vocabPage1.map((v, i) => {
                        const parsed = parseVocab(v);
                        return (
                          <div key={i} className="vocab-card">
                            <div className="vocab-korean">{parsed.korean}</div>
                            {parsed.romanization && <div className="vocab-romanization">{parsed.romanization}</div>}
                            <div className="vocab-meaning">{parsed.meaning}</div>
                            {parsed.example && (
                              <div className="vocab-example" dangerouslySetInnerHTML={{ __html: wrapKorean(parsed.example) }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nếu 1 trang: grammar cũng ở đây */}
                {lessonPages === 1 && grammarPoints.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <div className="section-label">
                      <div className="section-bar" style={{ backgroundColor: "#d4a017" }} />
                      <span className="section-title">Điểm ngữ pháp</span>
                    </div>
                    <div className="grammar-box">
                      {grammarPoints.map((gp, gi) => (
                        <div key={gi} className="grammar-point">
                          {gp.pattern && (
                            <div className="grammar-pattern" dangerouslySetInnerHTML={{ __html: wrapKorean(gp.pattern) }} />
                          )}
                          {gp.explain && (
                            <div className="grammar-explain" dangerouslySetInnerHTML={{ __html: wrapKorean(gp.explain) }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="page-footer">
                  <p style={{ color: "#ccc", fontSize: "8pt" }}>{meta.author}</p>
                  <p style={{ color: "#ccc", fontSize: "8pt" }}>{pageNum}</p>
                </div>
              </div>

              {/* TRANG 2 (nếu cần) */}
              {lessonPages === 2 && (
                <div key={`${lesson.song.rank}-p2`} className="ebook-page" style={{ ...PAGE_STYLE }}>
                  {/* Continuation header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <p style={{ fontSize: "8pt", fontWeight: 700, textTransform: "", letterSpacing: "0.14em", color: accent }}>Bài {idx + 1} — tiếp theo</p>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#f0f0f0" }} />
                    <p style={{ fontSize: "8pt", color: "#ccc" }}>{lesson.song.title}</p>
                  </div>

                  {/* Vocab trang 2 (nếu còn) */}
                  {vocabPage2.length > 0 && (
                    <div style={{ marginBottom: "22px" }}>
                      <div className="section-label">
                        <div className="section-bar" style={{ backgroundColor: "#2c7a4b" }} />
                        <span className="section-title">Từ vựng cốt lõi (tiếp)</span>
                      </div>
                      <div className="vocab-grid">
                        {vocabPage2.map((v, i) => {
                          const parsed = parseVocab(v);
                          return (
                            <div key={i} className="vocab-card">
                              <div className="vocab-korean">{parsed.korean}</div>
                              {parsed.romanization && <div className="vocab-romanization">{parsed.romanization}</div>}
                              <div className="vocab-meaning">{parsed.meaning}</div>
                              {parsed.example && (
                                <div className="vocab-example" dangerouslySetInnerHTML={{ __html: wrapKorean(parsed.example) }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grammar trang 2 */}
                  {grammarPoints.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div className="section-label">
                        <div className="section-bar" style={{ backgroundColor: "#d4a017" }} />
                        <span className="section-title">Điểm ngữ pháp</span>
                      </div>
                      <div className="grammar-box">
                        {grammarPoints.map((gp, gi) => (
                          <div key={gi} className="grammar-point">
                            {gp.pattern && (
                              <div className="grammar-pattern" dangerouslySetInnerHTML={{ __html: wrapKorean(gp.pattern) }} />
                            )}
                            {gp.explain && (
                              <div className="grammar-explain" dangerouslySetInnerHTML={{ __html: wrapKorean(gp.explain) }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="page-footer">
                    <p style={{ color: "#ccc", fontSize: "8pt" }}>{meta.author}</p>
                    <p style={{ color: "#ccc", fontSize: "8pt" }}>{pageNum + 1}</p>
                  </div>
                </div>
              )}
            </>
          );
        })}

        {/* CLOSING PAGE */}
        <div className="ebook-page" style={{ ...PAGE_STYLE, backgroundColor: meta.coverColor, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "48px", height: "3px", backgroundColor: accent, marginBottom: "32px" }} />
          <h2 style={{ fontSize: "24pt", fontWeight: 700, color: accent, marginBottom: "12px" }}>Cảm ơn bạn đã đọc!</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12pt", marginBottom: "40px", maxWidth: "320px", lineHeight: 1.8 }}>
            Hy vọng ebook này giúp bạn tiến bộ tiếng Hàn mỗi ngày. Hẹn gặp lại ở tập tiếp theo!
          </p>
          {(meta.contactInfo || meta.website) && (
            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px 32px", border: "1px solid rgba(255,255,255,0.08)", maxWidth: "360px", width: "100%" }}>
              <p style={{ color: accent, fontSize: "9pt", fontWeight: 700, textTransform: "", letterSpacing: "0.12em", marginBottom: "14px" }}>Liên hệ & Theo dõi</p>
              {meta.contactInfo && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10pt", lineHeight: 2, whiteSpace: "pre-wrap", marginBottom: "12px" }}>{meta.contactInfo}</p>}
              {meta.website && <p style={{ color: accent, fontSize: "11pt", fontWeight: 600 }}>{meta.website}</p>}
            </div>
          )}
          <div style={{ position: "absolute", bottom: "20mm", left: "18mm", right: "18mm", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "8pt" }}>{meta.author} · {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </>
  );
}
