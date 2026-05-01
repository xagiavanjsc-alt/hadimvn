/**
 * XP & Leaderboard — single source of truth.
 *
 * Anti-cheat notes:
 *  - `computeXP` ở client chỉ dùng để HIỂN THỊ tạm thời (progress bar, ước lượng).
 *  - Leaderboard THỰC TẾ phải được tính server-side từ bảng `exam_results`
 *    qua SQL trigger/RPC — KHÔNG trust giá trị client gửi lên.
 *  - Xem `supabase/migrations/002_anticheat.sql` cho RLS + trigger.
 */

export interface UserStudyStats {
  streakDays: number;
  bestScorePct: number;       // 0–100, max điểm bài exam
  averageScorePct?: number;   // 0–100, trung bình các bài exam
  wordsLearned: number;       // từ vựng đã master
  totalCorrectAnswers?: number; // tổng câu đúng qua các exam hợp lệ
  validExamsCount?: number;   // số exam hợp lệ đã hoàn thành
  /** @deprecated dùng totalCorrectAnswers thay thế (chống spam click) */
  epsQuestionsDone?: number;
}

/** Cap số từ vựng "đã thuộc" để chống cheat localStorage. */
export const FLASHCARD_XP_CAP = 500;

/**
 * Công thức XP — KHỚP với SQL function `compute_user_xp()` ở 003_xp_formula.sql.
 * Server tính lại từ data thật, client chỉ hiển thị tạm thời.
 *
 * XP = streak × 30
 *    + bestScore × 8
 *    + averageScore × 5
 *    + totalCorrectAnswers × 3
 *    + min(wordsLearned, 500) × 4
 *    + validExamsCount × 10
 */
export function computeXP(s: UserStudyStats): number {
  // Backward-compat: nếu thiếu field mới, fallback an toàn (không over-grant XP)
  const avg = s.averageScorePct ?? s.bestScorePct;
  const correct = s.totalCorrectAnswers ?? 0;
  const exams = s.validExamsCount ?? 0;
  const wordsCapped = Math.min(s.wordsLearned, FLASHCARD_XP_CAP);

  return (
    s.streakDays * 30 +
    s.bestScorePct * 8 +
    avg * 5 +
    correct * 3 +
    wordsCapped * 4 +
    exams * 10
  );
}

/** Phân cấp TOPIK từ best_score (0–100). */
export function deriveLevel(bestScorePct: number): string {
  if (bestScorePct >= 80) return "TOPIK II";
  if (bestScorePct >= 60) return "TOPIK I";
  return "Cơ bản";
}

// ─── Anti-cheat thresholds ────────────────────────────────────────────────

/** EPS full exam: 40 câu × tối thiểu 3 giây = 120s mới hợp lệ. */
export const MIN_EPS_EXAM_TIME_SEC = 120;

/** EPS topic exam: 20 câu × tối thiểu 3 giây = 60s. */
export const MIN_EPS_TOPIC_EXAM_TIME_SEC = 60;

/** Tối thiểu thời gian giữa 2 lần submit exam (chống spam). */
export const EXAM_COOLDOWN_SEC = 30;

/** Tối đa số exam hợp lệ / ngày / user. */
export const MAX_EXAMS_PER_DAY = 20;

/** Detect nếu user submit exam quá nhanh (gian lận). */
export function isExamTooFast(
  timeUsedSec: number,
  numQuestions: number,
  minPerQuestionSec = 3
): boolean {
  return timeUsedSec < numQuestions * minPerQuestionSec;
}

/** Kiểm tra cooldown dựa trên last exam timestamp (ms). */
export function isInCooldown(
  lastExamAtMs: number | null,
  cooldownSec = EXAM_COOLDOWN_SEC
): { inCooldown: boolean; remainingSec: number } {
  if (!lastExamAtMs) return { inCooldown: false, remainingSec: 0 };
  const elapsed = (Date.now() - lastExamAtMs) / 1000;
  if (elapsed >= cooldownSec) return { inCooldown: false, remainingSec: 0 };
  return { inCooldown: true, remainingSec: Math.ceil(cooldownSec - elapsed) };
}
