// Shared types for Melon/K-pop lesson features
// Previously defined in pages/melon/components/ExportExcel (removed 2026-05-25)

export interface SongInfo {
  rank: number;
  title: string;
  artist: string;
  genre?: string;
  lyrics?: string;
}

export interface VocabItem {
  word: string;
  meaning: string;
  example?: string;
  reading?: string;
}

export interface GrammarItem {
  pattern: string;
  explanation: string;
  examples?: string[];
  example?: string;
}

export interface ApprovedLesson {
  id: string;
  song: SongInfo;
  vocab: VocabItem[];
  vocabulary?: VocabItem[];
  grammar: GrammarItem[];
  explanation?: string;
  stars?: number;
  story?: string;
  storyTranslation?: string;
  createdAt?: string;
  publishedAt?: string;
}
