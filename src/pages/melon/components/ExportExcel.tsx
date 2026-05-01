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
  explanation?: string;
  stars?: number;
}
