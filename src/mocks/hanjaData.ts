export interface HanjaEntry {
  korean: string;
  hanja: string;
  vietnamese: string;
  /** Romanization (Revised Romanization of Korean) — auto-generated */
  pronunciation?: string;
  /** Chủ đề: Kinh tế, Y học, Chính trị, Đời sống... */
  category?: string;
  /** Độ khó 1 (dễ) / 2 (trung bình) / 3 (khó) — auto-inferred từ length + frequency */
  difficulty?: 1 | 2 | 3;
  /** Cấp độ TOPIK 1-6 (1-2: sơ cấp, 3-4: trung cấp, 5-6: cao cấp) */
  topikLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

// Data moved to data/hanja-data.ts for code splitting
export { HANJA_DATA } from "./data/hanja-data";

