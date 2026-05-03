// ─── Shared type for K-pop lessons approved for ebook export ─────────────────
export interface ApprovedLesson {
  song: {
    rank: number;
    title: string;
    artist: string;
    genre?: string;
    albumArt?: string;
  };
  story: string;
  vocabulary: { korean: string; pronunciation: string; meaning: string }[];
  vocab?: { korean: string; pronunciation: string; meaning: string }[]; // Alias for backward compatibility
  grammar?: string; // Optional grammar notes
  explanation?: string;
  stars?: number;
  publishedAt?: string; // Optional publish date
}
