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
  bestScorePct: number; // 0–100
  wordsLearned: number;
  epsQuestionsDone: number;
}

/** Công thức XP thống nhất. Thay đổi ở 1 chỗ duy nhất. */
export function computeXP(s: UserStudyStats): number {
  return (
    s.streakDays * 50 +
    s.bestScorePct * 10 +
    s.wordsLearned * 5 +
    s.epsQuestionsDone * 2
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
