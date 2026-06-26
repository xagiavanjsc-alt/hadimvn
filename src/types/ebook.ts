// Shared types for Ebook/Series features
// Previously defined in pages/series/page (removed 2026-06-27)

export interface EbookSeries {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverColor: string;
  coverAccent: string;
  lessonRanks: number[];
  price: number;
  createdAt: string;
}
