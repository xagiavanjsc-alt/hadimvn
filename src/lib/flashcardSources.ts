// Aggregator: turns every vocab source the site has into a flat FlashcardItem[]
// list with source metadata. Used by /flashcard so users can study from any
// textbook / EPS lesson / admin-managed Supabase content via one filter dropdown.

import { seoulBooks } from "@/mocks/data/seoul-books-data";
import { epsLessons } from "@/mocks/data/eps-lessons-data";
import type { EpsVocabItem, EpsVocabTopic } from "@/mocks/epsVocabulary";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

export type CardSource =
  | { kind: "seoul";        bookId: string;  bookName: string;  lessonId: string;  lessonTitle: string }
  | { kind: "eps-lesson";   lessonId: number; lessonTitle: string }
  | { kind: "eps-supabase"; topicId: string;  topicLabel: string }
  | { kind: "kpop";         rank: number;     songTitle: string; artist: string };

export interface FlashcardItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example?: string;
  exampleVi?: string;
  lessonTitle: string;   // displayed on card back
  subtitle: string;      // displayed under lessonTitle (book name / artist / topic-ko)
  mastered: boolean;
  reviewCount: number;
  source: CardSource;
  addedAt?: string;      // ISO timestamp — only set for admin-uploaded EPS items
                         // so the page can surface freshness signals.
}

interface BuildArgs {
  epsVocabulary: EpsVocabItem[];
  epsTopics: EpsVocabTopic[];
  approvedKpopLessons: ApprovedLesson[];
  masteredIds: string[];
  sessionsCardIds: string[]; // flat list of cardId for review-count lookup
}

/**
 * Build the full deck of FlashcardItem from every source. ID prefixes guarantee
 * uniqueness across sources so localStorage `masteredIds`/`sessions` keep working.
 */
export function buildAllFlashcards({
  epsVocabulary,
  epsTopics,
  approvedKpopLessons,
  masteredIds,
  sessionsCardIds,
}: BuildArgs): FlashcardItem[] {
  const masteredSet = new Set(masteredIds);
  // Pre-count session reviews per cardId once instead of .filter() per card.
  const reviewCounts = new Map<string, number>();
  for (const cid of sessionsCardIds) {
    reviewCounts.set(cid, (reviewCounts.get(cid) ?? 0) + 1);
  }
  const reviews = (id: string) => reviewCounts.get(id) ?? 0;

  const cards: FlashcardItem[] = [];

  // ─── Seoul textbooks (1A → 4B, ~4070 entries) ──────────────────────────────
  for (const book of seoulBooks) {
    for (const lesson of book.lessons) {
      for (let i = 0; i < lesson.vocabulary.length; i++) {
        const v = lesson.vocabulary[i];
        const id = `seoul-${book.id}-${lesson.id}-${i}`;
        cards.push({
          id,
          word: v.korean,
          reading: v.pronunciation,
          meaning: v.vietnamese,
          example: v.example,
          exampleVi: v.exampleVi,
          lessonTitle: lesson.titleVi || lesson.title,
          subtitle: book.name,
          mastered: masteredSet.has(id),
          reviewCount: reviews(id),
          source: {
            kind: "seoul",
            bookId: book.id,
            bookName: book.name,
            lessonId: lesson.id,
            lessonTitle: lesson.titleVi || lesson.title,
          },
        });
      }
    }
  }

  // ─── EPS official 60 lessons (~2277 entries) ───────────────────────────────
  for (const lesson of epsLessons) {
    for (let i = 0; i < lesson.vocabulary.length; i++) {
      const v = lesson.vocabulary[i];
      const id = `eps-l${lesson.id}-${i}`;
      cards.push({
        id,
        word: v.korean,
        reading: v.pronunciation ?? "",
        meaning: v.vietnamese,
        example: v.example,
        exampleVi: v.exampleVi,
        lessonTitle: lesson.titleVi || lesson.title,
        subtitle: `EPS Bài ${lesson.id}`,
        mastered: masteredSet.has(id),
        reviewCount: reviews(id),
        source: { kind: "eps-lesson", lessonId: lesson.id, lessonTitle: lesson.titleVi || lesson.title },
      });
    }
  }

  // ─── Admin-managed EPS (Supabase eps_vocab_entries) ────────────────────────
  for (const v of epsVocabulary) {
    const id = `eps-${v.id}`;
    const topic = epsTopics.find(t => t.id === v.topicId);
    cards.push({
      id,
      word: v.korean,
      reading: v.reading,
      meaning: v.vietnamese,
      example: v.example,
      exampleVi: v.exampleVi,
      lessonTitle: topic?.label ?? "EPS-TOPIK",
      subtitle: topic?.labelKo ?? "한국어",
      mastered: masteredSet.has(id),
      reviewCount: reviews(id),
      source: { kind: "eps-supabase", topicId: v.topicId, topicLabel: topic?.label ?? "EPS-TOPIK" },
      addedAt: v.addedAt,
    });
  }

  // ─── User's own K-pop melon lessons (localStorage) ─────────────────────────
  for (const lesson of approvedKpopLessons) {
    const vocab = lesson.vocab ?? [];
    for (let i = 0; i < vocab.length; i++) {
      const v = vocab[i];
      const id = `${lesson.song.rank}-vocab-${i}`;
      cards.push({
        id,
        word: v.word,
        reading: v.reading ?? "",
        meaning: v.meaning,
        example: v.example,
        lessonTitle: lesson.song.title,
        subtitle: lesson.song.artist,
        mastered: masteredSet.has(id),
        reviewCount: reviews(id),
        source: { kind: "kpop", rank: lesson.song.rank, songTitle: lesson.song.title, artist: lesson.song.artist },
      });
    }
  }

  return cards;
}

// ─── Filter helpers ─────────────────────────────────────────────────────────

export type SourceFilterValue =
  | "all"
  | "newest"                    // EPS Supabase items, newest first (last 30 days)
  | `seoul:${string}`           // seoul:1A, seoul:4B, ...
  | `eps-lesson:${number}`      // eps-lesson:1, eps-lesson:60
  | "eps-supabase"
  | "kpop";

// 30 days in ms — window for the "Mới cập nhật" filter.
const NEWEST_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function filterBySource(cards: FlashcardItem[], filter: SourceFilterValue): FlashcardItem[] {
  if (filter === "all") return cards;
  if (filter === "newest") {
    const cutoff = Date.now() - NEWEST_WINDOW_MS;
    return cards
      .filter(c => c.source.kind === "eps-supabase" && c.addedAt && Date.parse(c.addedAt) >= cutoff)
      .sort((a, b) => Date.parse(b.addedAt!) - Date.parse(a.addedAt!));
  }
  if (filter === "eps-supabase") return cards.filter(c => c.source.kind === "eps-supabase");
  if (filter === "kpop")         return cards.filter(c => c.source.kind === "kpop");
  if (filter.startsWith("seoul:")) {
    const bookId = filter.slice("seoul:".length);
    return cards.filter(c => c.source.kind === "seoul" && c.source.bookId === bookId);
  }
  if (filter.startsWith("eps-lesson:")) {
    const lessonId = Number(filter.slice("eps-lesson:".length));
    return cards.filter(c => c.source.kind === "eps-lesson" && c.source.lessonId === lessonId);
  }
  return cards;
}

/** Count EPS Supabase items added within the last N days. */
export function countAddedWithinDays(cards: FlashcardItem[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  let n = 0;
  for (const c of cards) {
    if (c.source.kind === "eps-supabase" && c.addedAt && Date.parse(c.addedAt) >= cutoff) n++;
  }
  return n;
}

/**
 * Build a `(korean+vietnamese) → [where it appears]` map, used by the admin
 * upload page to warn about duplicates against ANY existing source — not just
 * the Supabase table.
 */
export function buildCrossSourceIndex(): Map<string, { source: string; detail: string }[]> {
  const idx = new Map<string, { source: string; detail: string }[]>();
  const add = (korean: string, vietnamese: string, source: string, detail: string) => {
    const key = `${korean}|${vietnamese}`;
    const list = idx.get(key) ?? [];
    list.push({ source, detail });
    idx.set(key, list);
  };
  for (const book of seoulBooks) {
    for (const lesson of book.lessons) {
      for (const v of lesson.vocabulary) {
        add(v.korean, v.vietnamese, "Seoul", `${book.name} — ${lesson.titleVi || lesson.title}`);
      }
    }
  }
  for (const lesson of epsLessons) {
    for (const v of lesson.vocabulary) {
      add(v.korean, v.vietnamese, "EPS chính thức", `Bài ${lesson.id}: ${lesson.titleVi || lesson.title}`);
    }
  }
  return idx;
}
