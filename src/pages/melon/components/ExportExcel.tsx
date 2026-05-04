// ─── Shared type for K-pop lessons approved for ebook export ─────────────────
export interface ApprovedLesson {
  song: {
    rank: number;
    title: string;
    artist: string;
    genre?: string;
    albumArt?: string;
    lyrics?: string; // Optional lyrics field
  };
  story: string;
  vocabulary: VocabularyItem[];
  vocab?: VocabularyItem[]; // Alias for backward compatibility
  grammar?: GrammarItem[]; // Optional grammar notes as array
  explanation?: string;
  stars?: number;
  publishedAt?: string; // Optional publish date
}

// Grammar item type
export interface GrammarItem {
  pattern: string;
  explanation: string;
  example?: string;
}

// Vocabulary item with backward compatibility aliases
export interface VocabularyItem {
  korean: string;
  word: string; // Alias for korean (required for backward compatibility)
  pronunciation: string;
  reading?: string; // Alias for pronunciation
  meaning: string;
  example: string; // Required for VocabItem compatibility
}
