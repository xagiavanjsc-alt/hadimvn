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

/** Trọng số XP — mặc định, có thể override từ xp_settings (xem useXPSettings). */
export interface XPWeights {
  streak_weight: number;
  best_score_weight: number;
  average_score_weight: number;
  correct_answer_weight: number;
  flashcard_weight: number;
  exam_completed_bonus: number;
  flashcard_xp_cap: number;
}

export const DEFAULT_WEIGHTS: XPWeights = {
  streak_weight: 15,          // giảm từ 30→15: login ko nên thắng học thật
  best_score_weight: 12,       // tăng từ 8→12: thưởng điểm cao hơn
  average_score_weight: 8,     // tăng từ 5→8: học đều quan trọng
  correct_answer_weight: 3,
  flashcard_weight: 4,
  exam_completed_bonus: 15,    // tăng từ 10→15: khuyến khích thi nhiều
  flashcard_xp_cap: 500,
};

/**
 * Công thức XP — KHỚP với SQL function `compute_user_xp()` (003_xp_formula.sql + 004_xp_settings.sql).
 * Server tính lại từ data thật, client chỉ hiển thị tạm thời.
 *
 * XP = streak × W.streak
 *    + bestScore × W.best
 *    + averageScore × W.avg
 *    + totalCorrectAnswers × W.correct
 *    + min(wordsLearned, W.cap) × W.flashcard
 *    + validExamsCount × W.exam_bonus
 */
export function computeXP(s: UserStudyStats, w: XPWeights = DEFAULT_WEIGHTS): number {
  const avg = s.averageScorePct ?? s.bestScorePct;
  const correct = s.totalCorrectAnswers ?? 0;
  const exams = s.validExamsCount ?? 0;
  const wordsCapped = Math.min(s.wordsLearned, w.flashcard_xp_cap);

  return (
    s.streakDays * w.streak_weight +
    s.bestScorePct * w.best_score_weight +
    avg * w.average_score_weight +
    correct * w.correct_answer_weight +
    wordsCapped * w.flashcard_weight +
    exams * w.exam_completed_bonus
  );
}

/**
 * Phân cấp dựa trên điểm thi thử EPS-TOPIK (0–100).
 * EPS-TOPIK thực tế: đậu ~40% (80/200 điểm). Phân cấp sau phản ánh
 * mức độ thành thạo theo chuẩn học tiếng Hàn EPS, không nhầm với TOPIK.
 */
export function deriveLevel(bestScorePct: number): string {
  if (bestScorePct >= 90) return "Xuất sắc";    // 90-100%
  if (bestScorePct >= 75) return "Giỏi";         // 75-89%
  if (bestScorePct >= 55) return "Khá";           // 55-74%
  if (bestScorePct >= 40) return "Trung bình";   // 40-54% (ngưỡng đậu EPS thật)
  return "Cơ bản";                                // <40%
}

/** Label tiếng Hàn cho level EPS. */
export const LEVEL_LABELS_KO: Record<string, string> = {
  "Xuất sắc": "우수",
  "Giỏi": "잘함",
  "Khá": "보통",
  "Trung bình": "기초",
  "Cơ bản": "입문",
};

// ─── Anti-cheat thresholds ────────────────────────────────────────────────

/** EPS full exam: 40 câu × tối thiểu 8 giây = 320s mới hợp lệ.
 *  (Thực tế EPS-TOPIK: 70 phút / 50 câu = 84s/câu, minimum hợp lý là 8s)
 */
export const MIN_EPS_EXAM_TIME_SEC = 320;

/** EPS topic exam: 20 câu × tối thiểu 8 giây = 160s. */
export const MIN_EPS_TOPIC_EXAM_TIME_SEC = 160;

/** Tối thiểu thời gian giữa 2 lần submit exam (chống spam). */
export const EXAM_COOLDOWN_SEC = 30;

/** Tối đa số exam hợp lệ / ngày / user. */
export const MAX_EXAMS_PER_DAY = 20;

/** Detect nếu user submit exam quá nhanh (gian lận).
 *  Default 8s/câu — đủ thời gian đọc câu hỏi + 4 đáp án tiếng Hàn.
 */
export function isExamTooFast(
  timeUsedSec: number,
  numQuestions: number,
  minPerQuestionSec = 8
): boolean {
  return timeUsedSec < numQuestions * minPerQuestionSec;
}

/** Cap XP cho mỗi lần gọi addXP (chống farm thủ công).
 *  Mỗi hoạt động không nên vượt 200 XP một lần, trừ streak bonus đặc biệt.
 */
export const MAX_SINGLE_ADD_XP = 200;

/** Cap XP hàng ngày từ addXP (tổng cộng qua raw addXP calls). */
export const DAILY_RAW_XP_CAP = 500;

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
