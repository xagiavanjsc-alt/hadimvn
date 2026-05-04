import { useState } from "react";
import type { EbookMeta } from "@/pages/ebook/page";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import type { EbookTemplate } from "./EbookTemplates";

function removeRomanization(text: string): string {
  return text
    .replace(/([가-힣]+)\s*\(([a-zA-Z\s\-']+)\)/g, "$1")
    .replace(/\*([a-zA-Z\s\-']+)\*/g, "")
    .replace(/\[([a-zA-Z\s\-']+)\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface VocabParsed { korean: string; romanization: string | null; meaning: string; example?: string; }

function parseVocab(v: { word: string; meaning: string; example?: string }): VocabParsed {
  const m1 = v.word.match(/^([가-힣\s]+)\s*\(([^)]+)\)$/);
  if (m1) return { korean: m1[1].trim(), romanization: m1[2].trim(), meaning: v.meaning, example: v.example };
  const m2 = v.word.match(/^\(([^)]+)\)\s*([가-힣\s]+)$/);
  if (m2) return { korean: m2[2].trim(), romanization: m2[1].trim(), meaning: v.meaning, example: v.example };
  return { korean: v.word, romanization: null, meaning: v.meaning, example: v.example };
}

function calcLessonPageCount(lesson: ApprovedLesson): number {
  const storyLen = lesson.story?.length ?? 0;
  const vocabCount = lesson.vocabulary?.length ?? 0;
  const hasGrammar = !!(lesson.explanation?.trim());
  if (storyLen > 400 || vocabCount > 6 || hasGrammar) return 2;
  return 1;
}

function calcPageOffsets(lessons: ApprovedLesson[], hasForeword: boolean): number[] {
  let page = 2 + (hasForeword ? 1 : 0) + 1;
  return lessons.map(lesson => { const s = page; page += calcLessonPageCount(lesson); return s; });
}

const GENRE_VI: Record<string, string> = {
  "발라드": "Ballad", "댄스": "Nhạc Dance", "힙합": "Hip-hop", "R&B": "R&B",
  "인디": "Indie", "록": "Rock", "팝": "Pop", "트로트": "Trot", "OST": "OST",
  "재즈": "Jazz", "일렉트로닉": "Electronic", "포크": "Folk", "어쿠스틱": "Acoustic",
  "랩": "Rap", "소울": "Soul", "클래식": "Cổ điển", "국악": "Nhạc truyền thống",
  "CCM": "Nhạc Thiên Chúa", "뉴에이지": "New Age",
};
function toViGenre(genre?: string): string { if (!genre) return ""; return GENRE_VI[genre] ?? genre; }

interface Props { meta: EbookMeta; lessons: ApprovedLesson[]; template?: EbookTemplate; }
interface PageDef { type: "cover" | "foreword" | "toc" | "lesson" | "closing"; lessonIdx?: number; }

function CoverPage({ meta, totalLessons }: { meta: EbookMeta; totalLessons: number }) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-10 relative overflow-hidden" style={{ backgroundColor: meta.coverColor }}>
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: meta.coverAccent }} />
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-5" style={{ backgroundColor: meta.coverAccent }} />
      <div className="mt-4">
        <p className="text-[10px] font-bold tracking-normal opacity-60 mb-6" style={{ color: meta.coverAccent }}>{meta.author}</p>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: meta.coverAccent }}>{meta.title || "Tiêu đề ebook"}</h1>
        <p className="text-white/50 text-sm mb-5">{meta.subtitle}</p>
        <p className="text-app-text-muted text-xs leading-relaxed max-w-xs">{meta.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${meta.coverAccent}20`, color: meta.coverAccent }}>{totalLessons} bài học</div>
        <p className="text-app-text-muted text-[10px]">{new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

function ForewordPage({ meta }: { meta: EbookMeta }) {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-10 overflow-hidden">
      <div className="w-full max-w-xs">
        <div className="w-6 h-0.5 mb-5" style={{ backgroundColor: meta.coverAccent }} />
        <h2 className="text-base font-bold text-gray-900 mb-4">Lời mở đầu</h2>
        <p className="text-gray-500 text-[10px] leading-5 whitespace-pre-wrap line-clamp-[18]">{meta.foreword}</p>
        <div className="mt-5 pt-3 border-t border-gray-100">
          <p className="text-gray-400 text-[9px] italic">— {meta.author}</p>
        </div>
      </div>
    </div>
  );
}

function TocPage({ meta, lessons, onJumpToLesson }: { meta: EbookMeta; lessons: ApprovedLesson[]; onJumpToLesson?: (idx: number) => void }) {
  const hasForeword = !!meta.foreword?.trim();
  const pageOffsets = calcPageOffsets(lessons, hasForeword);
  return (
    <div className="w-full h-full bg-white flex flex-col p-8 overflow-hidden">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Mục lục</h2>
      <div className="w-8 h-0.5 mb-5" style={{ backgroundColor: meta.coverAccent }} />
      <div className="flex-1 overflow-hidden space-y-1">
        {lessons.slice(0, 18).map((lesson, idx) => (
          <button
            key={lesson.song.rank}
            onClick={() => onJumpToLesson?.(idx)}
            className="w-full flex items-center gap-3 py-1.5 border-b border-gray-50 hover:bg-gray-50 rounded transition-colors cursor-pointer group text-left px-1"
          >
            <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: meta.coverAccent }}>{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-xs font-medium truncate group-hover:text-gray-900 transition-colors">{lesson.song.title}</p>
              <p className="text-gray-400 text-[10px]">{lesson.song.artist}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <p className="text-gray-300 text-[10px]">tr.{pageOffsets[idx]}</p>
              <i className="ri-arrow-right-s-line text-gray-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </button>
        ))}
        {lessons.length > 18 && <p className="text-gray-300 text-[10px] text-center pt-1">... và {lessons.length - 18} bài nữa</p>}
      </div>
      {onJumpToLesson && (
        <p className="text-gray-300 text-[8px] text-center mt-2 flex items-center justify-center gap-1">
          <i className="ri-cursor-line"></i>
          Click vào bài để xem trước
        </p>
      )}
    </div>
  );
}

function ClosingPage({ meta }: { meta: EbookMeta }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden relative" style={{ backgroundColor: meta.coverColor }}>
      <div className="w-8 h-0.5 mb-5" style={{ backgroundColor: meta.coverAccent }} />
      <h2 className="text-lg font-bold mb-2" style={{ color: meta.coverAccent }}>Cảm ơn bạn đã đọc!</h2>
      <p className="text-app-text-secondary text-[10px] text-center leading-5 mb-6 max-w-[200px]">Hy vọng ebook này giúp bạn tiến bộ tiếng Hàn mỗi ngày.</p>
      {(meta.contactInfo || meta.website) && (
        <div className="rounded-xl p-4 text-center w-full max-w-[220px]" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[8px] font-bold tracking-normal mb-2" style={{ color: meta.coverAccent }}>Liên hệ</p>
          {meta.contactInfo && <p className="text-app-text-secondary text-[8px] leading-4 whitespace-pre-wrap mb-2">{meta.contactInfo}</p>}
          {meta.website && <p className="text-[9px] font-semibold" style={{ color: meta.coverAccent }}>{meta.website}</p>}
        </div>
      )}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/15 text-[8px]">{meta.author} · {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

function VocabCard({ v, dark = false }: { v: { word: string; meaning: string; example?: string }; dark?: boolean }) {
  const parsed = parseVocab(v);
  if (dark) return (
    <div className="rounded p-1.5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="font-black text-[10px]" style={{ color: "#e8e8e8", fontFamily: "'Noto Sans KR', sans-serif" }}>{parsed.korean}</p>
      {parsed.romanization && <p className="text-[7px] italic" style={{ color: "rgba(255,255,255,0.3)" }}>{parsed.romanization}</p>}
      <p className="text-[9px] font-bold mt-0.5" style={{ color: "app-accent-primary" }}>{parsed.meaning}</p>
    </div>
  );
  return (
    <div className="bg-[#fff8f8] rounded-lg p-2 border border-[#f5c6c6]">
      <p className="font-black text-gray-900 text-[11px] leading-tight" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{parsed.korean}</p>
      {parsed.romanization && <p className="text-gray-400 text-[8px] italic mt-0.5">{parsed.romanization}</p>}
      <p className="text-[#c0392b] text-[9px] font-bold mt-1">{parsed.meaning}</p>
    </div>
  );
}

function LessonPage({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  return (
    <div className="w-full h-full bg-white flex flex-col p-8 overflow-hidden relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[9px] font-bold tracking-normal mb-1" style={{ color: meta.coverAccent }}>Bài {idx + 1}</p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{lesson.song.title}</h2>
          <p className="text-gray-400 text-xs mt-0.5">{lesson.song.artist}</p>
        </div>
        {lesson.song.genre && <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">{toViGenre(lesson.song.genre)}</span>}
      </div>
      <div className="w-full h-px bg-gray-100 mb-4" />
      <div className="mb-4 flex-1 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: meta.coverAccent }} />
          <p className="text-xs font-bold text-gray-700">Truyện Chêm</p>
        </div>
        <p className="text-gray-600 text-[10px] leading-5 line-clamp-8 whitespace-pre-wrap">{removeRomanization(lesson.story)}</p>
      </div>
      {lesson.vocabulary.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-0.5 h-3 rounded-full bg-[#2c7a4b]" />
            <p className="text-xs font-bold text-gray-700">Từ vựng cốt lõi</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {lesson.vocabulary.slice(0, 6).map((v, i) => <VocabCard key={i} v={v} />)}
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-gray-300 text-[9px]">{meta.author}</p>
        <p className="text-gray-300 text-[9px]">{pageNum}</p>
      </div>
    </div>
  );
}

function LessonPageTwoCol({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  return (
    <div className="w-full h-full bg-[#fafafa] flex flex-col p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] font-bold tracking-normal mb-0.5" style={{ color: meta.coverAccent }}>Bài {idx + 1}</p>
          <h2 className="text-base font-bold text-gray-900 leading-tight">{lesson.song.title}</h2>
          <p className="text-gray-400 text-[10px]">{lesson.song.artist}</p>
        </div>
        {lesson.song.genre && <span className="text-[9px] px-2 py-1 rounded-full" style={{ color: meta.coverAccent, backgroundColor: `${meta.coverAccent}15` }}>{toViGenre(lesson.song.genre)}</span>}
      </div>
      <div className="w-full h-px mb-3" style={{ backgroundColor: `${meta.coverAccent}30` }} />
      <div className="flex gap-4 flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] font-bold text-gray-500 tracking-normal mb-1.5">Truyện Chêm</p>
          <p className="text-gray-600 text-[9px] leading-4 line-clamp-[20] whitespace-pre-wrap">{removeRomanization(lesson.story)}</p>
        </div>
        <div className="w-px bg-gray-200 flex-shrink-0" />
        <div className="w-2/5 flex-shrink-0 overflow-hidden">
          <p className="text-[9px] font-bold text-gray-500 tracking-normal mb-1.5">Từ vựng</p>
          <div className="space-y-1.5">
            {lesson.vocabulary.slice(0, 10).map((v, i) => {
              const p = parseVocab(v);
              return (
                <div key={i} className="bg-[#fff8f8] rounded p-1.5 border border-[#f5c6c6]/50">
                  <p className="font-black text-gray-900 text-[9px]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{p.korean}</p>
                  {p.romanization && <p className="text-gray-400 text-[7px] italic">{p.romanization}</p>}
                  <p className="text-[#c0392b] text-[8px] font-bold">{p.meaning}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-gray-300 text-[8px]">{meta.author}</p>
        <p className="text-gray-300 text-[8px]">{pageNum}</p>
      </div>
    </div>
  );
}

function LessonPageDark({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  return (
    <div className="w-full h-full flex flex-col p-8 overflow-hidden relative" style={{ backgroundColor: "#0f1117" }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[9px] font-bold tracking-normal mb-1" style={{ color: meta.coverAccent }}>Bài {idx + 1}</p>
          <h2 className="text-lg font-bold leading-tight" style={{ color: "#e8e8e8" }}>{lesson.song.title}</h2>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{lesson.song.artist}</p>
        </div>
        {lesson.song.genre && <span className="text-[9px] px-2 py-1 rounded-full" style={{ backgroundColor: `${meta.coverAccent}20`, color: meta.coverAccent }}>{toViGenre(lesson.song.genre)}</span>}
      </div>
      <div className="w-full h-px mb-4" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
      <div className="mb-4 flex-1 overflow-hidden">
        <p className="text-[9px] font-bold tracking-normal mb-2" style={{ color: meta.coverAccent }}>Truyện Chêm</p>
        <p className="text-[10px] leading-5 line-clamp-8 whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.65)" }}>{removeRomanization(lesson.story)}</p>
      </div>
      {lesson.vocabulary.length > 0 && (
        <div>
          <p className="text-[9px] font-bold tracking-normal mb-2" style={{ color: meta.coverAccent }}>Từ vựng</p>
          <div className="grid grid-cols-2 gap-1.5">
            {lesson.vocabulary.slice(0, 6).map((v, i) => <VocabCard key={i} v={v} dark />)}
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{meta.author}</p>
        <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{pageNum}</p>
      </div>
    </div>
  );
}

function LessonPageAlbum({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  const albumImg = `https://readdy.ai/api/search-image?query=K-pop%20album%20art%20cover%20minimalist%20colorful%20music%20$%7Blesson.song.artist%7D%20aesthetic%20gradient&width=200&height=200&seq=album-${lesson.song.rank}&orientation=squarish`;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
      <div className="flex items-stretch" style={{ height: "28%" }}>
        <div className="w-28 flex-shrink-0 overflow-hidden">
          <img src={albumImg} alt="album" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center" style={{ backgroundColor: "#dc2626", backgroundImage: "linear-gradient(135deg, #dc2626, #991b1b)" }}>
          <p className="text-[9px] font-bold tracking-normal text-white/60 mb-1">Bài {idx + 1}</p>
          <h2 className="text-base font-bold text-white leading-tight">{lesson.song.title}</h2>
          <p className="text-white/60 text-[10px] mt-0.5">{lesson.song.artist}</p>
          {lesson.song.genre && <span className="mt-2 self-start text-[8px] bg-app-border/200 text-white px-2 py-0.5 rounded-full">{toViGenre(lesson.song.genre)}</span>}
        </div>
      </div>
      <div className="flex-1 p-5 overflow-hidden flex flex-col">
        <div className="mb-3 flex-1 overflow-hidden">
          <p className="text-[9px] font-bold tracking-normal text-gray-400 mb-1.5">Truyện Chêm</p>
          <p className="text-gray-600 text-[9px] leading-4 line-clamp-10 whitespace-pre-wrap">{removeRomanization(lesson.story)}</p>
        </div>
        {lesson.vocabulary.length > 0 && (
          <div>
            <p className="text-[9px] font-bold tracking-normal text-gray-400 mb-1.5">Từ vựng</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {lesson.vocabulary.slice(0, 6).map((v, i) => {
                const p = parseVocab(v);
                return (
                  <div key={i} className="bg-[#fef2f2] rounded p-1.5 border border-[#dc2626]/10">
                    <p className="font-black text-gray-900 text-[9px]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{p.korean}</p>
                    {p.romanization && <p className="text-gray-400 text-[7px] italic">{p.romanization}</p>}
                    <p className="text-[#dc2626] text-[8px] font-bold">{p.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-gray-300 text-[8px]">{meta.author}</p>
        <p className="text-gray-300 text-[8px]">{pageNum}</p>
      </div>
    </div>
  );
}

// ─── Gradient Template ────────────────────────────────────────────────────
function LessonPageGradient({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  const gradient = `linear-gradient(135deg, ${meta.coverAccent}dd, ${meta.coverColor}cc)`;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
      {/* Gradient header */}
      <div className="flex-shrink-0 px-6 py-4 relative" style={{ background: gradient, minHeight: "22%" }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <p className="text-[8px] font-bold tracking-normal text-white/60 mb-1">Bài {idx + 1}</p>
          <h2 className="text-base font-bold text-white leading-tight">{lesson.song.title}</h2>
          <p className="text-white/60 text-[10px] mt-0.5">{lesson.song.artist}</p>
        </div>
        {lesson.song.genre && (
          <span className="absolute top-3 right-4 text-[8px] bg-app-border/200 text-white px-2 py-0.5 rounded-full">{toViGenre(lesson.song.genre)}</span>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 p-5 overflow-hidden flex flex-col gap-3">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: meta.coverAccent }} />
            <p className="text-[9px] font-bold text-gray-500 tracking-normal">Truyện Chêm</p>
          </div>
          <p className="text-gray-600 text-[9px] leading-4 line-clamp-10 whitespace-pre-wrap">{removeRomanization(lesson.story)}</p>
        </div>
        {lesson.vocabulary.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-0.5 h-3 rounded-full bg-emerald-500" />
              <p className="text-[9px] font-bold text-gray-500 tracking-normal">Từ vựng</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {lesson.vocabulary.slice(0, 6).map((v, i) => {
                const p = parseVocab(v);
                return (
                  <div key={i} className="rounded-lg p-1.5 border" style={{ backgroundColor: `${meta.coverAccent}10`, borderColor: `${meta.coverAccent}25` }}>
                    <p className="font-black text-[9px]" style={{ fontFamily: "'Noto Sans KR', sans-serif", color: meta.coverColor }}>{p.korean}</p>
                    {p.romanization && <p className="text-gray-400 text-[7px] italic">{p.romanization}</p>}
                    <p className="text-[8px] font-bold mt-0.5" style={{ color: meta.coverAccent }}>{p.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-gray-300 text-[8px]">{meta.author}</p>
        <p className="text-gray-300 text-[8px]">{pageNum}</p>
      </div>
    </div>
  );
}

// ─── Magazine Template ────────────────────────────────────────────────────
function LessonPageMagazine({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  const bgImg = `https://readdy.ai/api/search-image?query=K-pop%20aesthetic%20background%20abstract%20colorful%20gradient%20music%20$%7Blesson.song.artist%7D%20moody%20cinematic&width=400&height=120&seq=mag-${lesson.song.rank}&orientation=landscape`;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
      {/* Magazine header with image */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "26%" }}>
        <img src={bgImg} alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] font-bold tracking-normal mb-1" style={{ color: meta.coverAccent }}>Bài {idx + 1}</p>
              <h2 className="text-base font-bold text-white leading-tight">{lesson.song.title}</h2>
              <p className="text-white/60 text-[9px]">{lesson.song.artist}</p>
            </div>
            {lesson.song.genre && (
              <span className="text-[8px] px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: meta.coverAccent }}>{toViGenre(lesson.song.genre)}</span>
            )}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col gap-2.5">
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] font-bold tracking-normal text-gray-400 mb-1.5">Truyện Chêm</p>
          <p className="text-gray-600 text-[9px] leading-4 line-clamp-9 whitespace-pre-wrap">{removeRomanization(lesson.story)}</p>
        </div>
        {lesson.vocabulary.length > 0 && (
          <div>
            <p className="text-[9px] font-bold tracking-normal text-gray-400 mb-1.5">Từ vựng</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {lesson.vocabulary.slice(0, 6).map((v, i) => {
                const p = parseVocab(v);
                return (
                  <div key={i} className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                    <p className="font-black text-gray-900 text-[9px]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{p.korean}</p>
                    {p.romanization && <p className="text-gray-400 text-[7px] italic">{p.romanization}</p>}
                    <p className="text-[8px] font-bold mt-0.5" style={{ color: meta.coverAccent }}>{p.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-gray-300 text-[8px]">{meta.author}</p>
        <p className="text-gray-300 text-[8px]">{pageNum}</p>
      </div>
    </div>
  );
}

// ─── Minimal Template ─────────────────────────────────────────────────────
function LessonPageMinimal({ meta, lesson, idx, pageNum }: { meta: EbookMeta; lesson: ApprovedLesson; idx: number; pageNum: number }) {
  return (
    <div className="w-full h-full flex flex-col p-8 overflow-hidden relative" style={{ backgroundColor: "#fafaf9" }}>
      {/* Minimal header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-0.5" style={{ backgroundColor: meta.coverAccent }} />
          <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400">Bài {idx + 1}</p>
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{lesson.song.title}</h2>
        <p className="text-gray-400 text-[10px]">{lesson.song.artist}{lesson.song.genre ? ` · ${toViGenre(lesson.song.genre)}` : ""}</p>
      </div>
      <div className="w-full h-px bg-gray-200 mb-4" />
      {/* Story */}
      <div className="flex-1 overflow-hidden mb-3">
        <p className="text-gray-600 text-[10px] leading-5 line-clamp-9 whitespace-pre-wrap">{removeRomanization(lesson.story)}</p>
      </div>
      {/* Vocab — minimal style */}
      {lesson.vocabulary.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[8px] font-bold tracking-[0.15em] text-gray-400">Từ vựng</p>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {lesson.vocabulary.slice(0, 4).map((v, i) => {
              const p = parseVocab(v);
              return (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100">
                  <p className="font-black text-gray-900 text-[10px] flex-shrink-0" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{p.korean}</p>
                  <p className="text-[9px] font-medium truncate" style={{ color: meta.coverAccent }}>{p.meaning}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
        <p className="text-gray-300 text-[8px]">{meta.author}</p>
        <p className="text-gray-300 text-[8px]">{pageNum}</p>
      </div>
    </div>
  );
}

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: "'Noto Sans KR', 'Malgun Gothic', Arial, sans-serif",
  serif: "'Noto Serif KR', 'Batang', Georgia, serif",
};

export default function EbookPageCarousel({ meta, lessons, template = "classic" }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const hasForeword = !!meta.foreword?.trim();
  const pageOffsets = calcPageOffsets(lessons, hasForeword);
  const fontFamily = FONT_FAMILY_MAP[meta.fontFamily ?? "sans"];

  const pages: PageDef[] = [
    { type: "cover" },
    ...(hasForeword ? [{ type: "foreword" as const }] : []),
    { type: "toc" },
    ...lessons.map((_, idx) => ({ type: "lesson" as const, lessonIdx: idx })),
    { type: "closing" },
  ];

  // Jump to lesson page from TOC
  const handleJumpToLesson = (lessonIdx: number) => {
    const tocOffset = 1 + (hasForeword ? 1 : 0) + 1; // cover + foreword? + toc
    setCurrentPage(tocOffset + lessonIdx);
  };

  const totalPages = pages.length;
  const page = pages[currentPage];

  if (lessons.length === 0) {
    return (
      <div className="bg-app-bg border border-app-border rounded-xl p-8 text-center">
        <i className="ri-book-2-line text-white/15 text-3xl block mb-3"></i>
        <p className="text-app-text-muted text-sm">Chọn bài học để xem trước layout</p>
      </div>
    );
  }

  const renderLessonPage = (lesson: ApprovedLesson, idx: number) => {
    const pn = pageOffsets[idx] ?? (idx + 4);
    if (template === "two-col") return <LessonPageTwoCol meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
    if (template === "dark") return <LessonPageDark meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
    if (template === "album") return <LessonPageAlbum meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
    if (template === "gradient") return <LessonPageGradient meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
    if (template === "magazine") return <LessonPageMagazine meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
    if (template === "minimal") return <LessonPageMinimal meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
    return <LessonPage meta={meta} lesson={lesson} idx={idx} pageNum={pn} />;
  };

  const templateLabels: Record<EbookTemplate, string> = {
    classic: "Classic", "two-col": "2 Cột", dark: "Dark Mode", album: "Album Art",
    gradient: "Gradient", magazine: "Magazine", minimal: "Minimal",
  };

  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
            <i className="ri-eye-line text-app-accent-primary text-sm"></i>
          </div>
          <p className="text-white font-semibold text-sm">Xem trước từng trang</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-app-accent-primary/60 text-[10px] bg-app-accent-primary/8 px-2 py-0.5 rounded-full border border-app-accent-primary/15">{templateLabels[template]}</span>
          <span className="text-app-text-muted text-xs">{currentPage + 1} / {totalPages}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
          page.type === "cover" ? "bg-app-accent-primary/15 text-app-accent-primary" :
          page.type === "foreword" ? "bg-violet-500/15 text-violet-400" :
          page.type === "toc" ? "bg-sky-500/15 text-sky-400" :
          page.type === "closing" ? "bg-app-accent-success/15 text-app-accent-success" :
          "bg-white/8 text-white/50"
        }`}>
          {page.type === "cover" ? "Trang bìa" :
           page.type === "foreword" ? "Lời mở đầu" :
           page.type === "toc" ? "Mục lục" :
           page.type === "closing" ? "Trang kết" :
           `Bài ${(page.lessonIdx ?? 0) + 1}: ${lessons[page.lessonIdx ?? 0]?.song.title}`}
        </span>
      </div>

      <div
        className="relative mx-auto overflow-hidden rounded-lg border border-app-border"
        style={{ width: "100%", aspectRatio: "210/297", fontFamily }}
      >
        {page.type === "cover" && <CoverPage meta={meta} totalLessons={lessons.length} />}
        {page.type === "foreword" && <ForewordPage meta={meta} />}
        {page.type === "toc" && <TocPage meta={meta} lessons={lessons} onJumpToLesson={handleJumpToLesson} />}
        {page.type === "lesson" && page.lessonIdx !== undefined && renderLessonPage(lessons[page.lessonIdx], page.lessonIdx)}
        {page.type === "closing" && <ClosingPage meta={meta} />}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
          className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 disabled:opacity-30 disabled:cursor-not-allowed text-white/60 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-arrow-left-s-line"></i>Trang trước
        </button>
        <div className="flex items-center gap-1">
          {totalPages <= 7 ? pages.map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)}
              className={`rounded-full transition-all cursor-pointer ${i === currentPage ? "w-4 h-1.5 bg-app-accent-primary" : "w-1.5 h-1.5 bg-white/15 hover:bg-app-surface/500"}`} />
          )) : <span className="text-app-text-muted text-xs">{currentPage + 1}/{totalPages}</span>}
        </div>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
          className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 disabled:opacity-30 disabled:cursor-not-allowed text-white/60 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          Trang sau<i className="ri-arrow-right-s-line"></i>
        </button>
      </div>

      {lessons.length > 3 && (
        <div className="mt-3 pt-3 border-t border-app-border">
          <select value={currentPage} onChange={e => setCurrentPage(Number(e.target.value))}
            className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer">
            {pages.map((p, i) => (
              <option key={i} value={i} className="bg-app-bg">
                {p.type === "cover" ? "Trang bìa" : p.type === "foreword" ? "Lời mở đầu" :
                 p.type === "toc" ? "Mục lục" : p.type === "closing" ? "Trang kết" :
                 `Bài ${(p.lessonIdx ?? 0) + 1}: ${lessons[p.lessonIdx ?? 0]?.song.title}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

