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
  /** Nghĩa gốc Hán tự */
  root_meaning?: string;
  /** Ví dụ câu dùng từ */
  examples?: string;
  /** Mẹo ghi nhớ */
  memory_tip?: string;
  /** URL file âm thanh MP3 */
  audio_url?: string;
  /** Chữ Hán gốc */
  root_char?: string;
  /** Từ liên quan */
  related_words?: string;
}

// Data moved to data/hanja-data.ts for code splitting
export { HANJA_DATA } from "./data/hanja-data";

