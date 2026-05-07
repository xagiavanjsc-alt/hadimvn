export interface SeoulVocabItem {
  korean: string;
  pronunciation: string;
  vietnamese: string;
  partOfSpeech: string;
  example: string;
  exampleVi: string;
}

export interface SeoulGrammarPoint {
  pattern: string;
  level: string;
  explanation: string;
  examples: { korean: string; vietnamese: string }[];
  notes?: string;
  topikPatternId?: string;
}

export interface SeoulLesson {
  id: string;
  lessonNumber: number;
  title: string;
  titleVi: string;
  objectives: string[];
  vocabulary: SeoulVocabItem[];
  grammarPoints: SeoulGrammarPoint[];
  dialogueTitle: string;
  dialogue: { speaker: string; text: string; translation: string }[];
  culturalTip?: string;
}

export interface SeoulBook {
  id: string;
  name: string;
  level: "1A" | "1B" | "2A" | "2B" | "3A" | "3B" | "4A" | "4B";
  levelGroup: 1 | 2 | 3 | 4;
  color: string;
  bgGradient: string;
  description: string;
  totalLessons: number;
  totalVocab: number;
  totalGrammar: number;
  cefrLevel: string;
  targetAudience: string;
  lessons: SeoulLesson[];
}

// Helper: filter out placeholder/removed lessons
export function getFilteredBooks(books: SeoulBook[]): SeoulBook[] {
  return books.map(book => ({
    ...book,
    lessons: book.lessons.filter(l => !l.id.includes("-REMOVED")),
  }));
}

// Data moved to data/seoul-books-data.ts for code splitting
export { seoulBooks } from "./data/seoul-books-data";

