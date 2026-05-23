import { describe, it, expect, vi, afterEach } from "vitest";
import {
  scorePct,
  computeXP,
  deriveLevel,
  isExamTooFast,
  isInCooldown,
  DEFAULT_WEIGHTS,
  EXAM_COOLDOWN_SEC,
} from "@/lib/xp";

describe("scorePct (division-by-zero guard)", () => {
  it("returns the rounded percent for valid inputs", () => {
    expect(scorePct(80, 100)).toBe(80);
    expect(scorePct(7, 10)).toBe(70);
    expect(scorePct(1, 3)).toBe(33);
    expect(scorePct(2, 3)).toBe(67);
  });

  it("returns 0 when total is 0 (no Infinity leak)", () => {
    expect(scorePct(0, 0)).toBe(0);
    expect(scorePct(5, 0)).toBe(0);
  });

  it("returns 0 when total is negative", () => {
    expect(scorePct(5, -1)).toBe(0);
  });

  it("returns 0 when total is NaN or undefined", () => {
    expect(scorePct(5, NaN)).toBe(0);
    expect(scorePct(5, undefined as unknown as number)).toBe(0);
  });

  it("returns 0 when total is non-finite", () => {
    expect(scorePct(5, Infinity)).toBe(0);
  });

  it("treats nullish score as 0", () => {
    expect(scorePct(null as unknown as number, 10)).toBe(0);
    expect(scorePct(undefined as unknown as number, 10)).toBe(0);
  });

  it("never returns NaN or Infinity", () => {
    const cases: [number, number][] = [
      [NaN, 10], [10, NaN], [Infinity, 10], [10, 0], [0, 0],
    ];
    for (const [s, t] of cases) {
      const r = scorePct(s, t);
      expect(Number.isFinite(r)).toBe(true);
    }
  });
});

describe("deriveLevel (EPS-TOPIK)", () => {
  it("maps each band correctly", () => {
    expect(deriveLevel(95)).toBe("Xuất sắc");
    expect(deriveLevel(80)).toBe("Giỏi");
    expect(deriveLevel(60)).toBe("Khá");
    expect(deriveLevel(45)).toBe("Trung bình");
    expect(deriveLevel(20)).toBe("Cơ bản");
    expect(deriveLevel(0)).toBe("Cơ bản");
  });

  it("respects band boundaries", () => {
    expect(deriveLevel(90)).toBe("Xuất sắc"); // exact boundary
    expect(deriveLevel(89.9)).toBe("Giỏi");
    expect(deriveLevel(40)).toBe("Trung bình"); // EPS pass threshold
    expect(deriveLevel(39.9)).toBe("Cơ bản");
  });
});

describe("computeXP", () => {
  it("returns 0 when all stats are 0", () => {
    expect(
      computeXP({
        streakDays: 0,
        bestScorePct: 0,
        averageScorePct: 0,
        wordsLearned: 0,
        totalCorrectAnswers: 0,
        validExamsCount: 0,
      })
    ).toBe(0);
  });

  it("rewards streak by configured weight", () => {
    const xp = computeXP({
      streakDays: 10,
      bestScorePct: 0,
      averageScorePct: 0,
      wordsLearned: 0,
    });
    expect(xp).toBe(10 * DEFAULT_WEIGHTS.streak_weight);
  });

  it("falls back averageScore → bestScore when not provided", () => {
    const xp = computeXP({
      streakDays: 0,
      bestScorePct: 80,
      wordsLearned: 0,
    });
    // best × best_weight + best × avg_weight (since avg defaulted to best)
    expect(xp).toBe(
      80 * DEFAULT_WEIGHTS.best_score_weight + 80 * DEFAULT_WEIGHTS.average_score_weight
    );
  });

  it("caps flashcard contribution at flashcard_xp_cap", () => {
    const huge = computeXP({
      streakDays: 0,
      bestScorePct: 0,
      averageScorePct: 0,
      wordsLearned: 99_999,
    });
    const capped = computeXP({
      streakDays: 0,
      bestScorePct: 0,
      averageScorePct: 0,
      wordsLearned: DEFAULT_WEIGHTS.flashcard_xp_cap,
    });
    expect(huge).toBe(capped);
  });

  it("is monotonic in bestScore (higher score → more XP, all else equal)", () => {
    const lo = computeXP({ streakDays: 1, bestScorePct: 50, wordsLearned: 0 });
    const hi = computeXP({ streakDays: 1, bestScorePct: 80, wordsLearned: 0 });
    expect(hi).toBeGreaterThan(lo);
  });
});

describe("isExamTooFast (anti-cheat)", () => {
  it("flags suspiciously fast submissions", () => {
    // 40 questions × 8s default = 320s minimum
    expect(isExamTooFast(100, 40)).toBe(true);
    expect(isExamTooFast(319, 40)).toBe(true);
  });

  it("accepts normal speed", () => {
    expect(isExamTooFast(320, 40)).toBe(false);
    expect(isExamTooFast(600, 40)).toBe(false);
  });

  it("respects custom min-per-question parameter", () => {
    expect(isExamTooFast(50, 10, 10)).toBe(true);   // 50 < 10×10
    expect(isExamTooFast(150, 10, 10)).toBe(false); // 150 > 10×10
  });
});

describe("isInCooldown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when there's no previous exam", () => {
    expect(isInCooldown(null)).toEqual({ inCooldown: false, remainingSec: 0 });
  });

  it("returns inCooldown when last exam was recent", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T08:00:30Z"));
    const lastExam = new Date("2026-05-23T08:00:10Z").getTime(); // 20s ago
    const result = isInCooldown(lastExam);
    expect(result.inCooldown).toBe(true);
    expect(result.remainingSec).toBeGreaterThan(0);
    expect(result.remainingSec).toBeLessThanOrEqual(EXAM_COOLDOWN_SEC);
  });

  it("returns out-of-cooldown when enough time has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T08:05:00Z"));
    const lastExam = new Date("2026-05-23T08:00:00Z").getTime(); // 5min ago
    expect(isInCooldown(lastExam)).toEqual({ inCooldown: false, remainingSec: 0 });
  });

  it("respects custom cooldown duration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T08:01:00Z"));
    const lastExam = new Date("2026-05-23T08:00:30Z").getTime(); // 30s ago
    // With a 60s cooldown we're still in it; with a 10s cooldown we're not.
    expect(isInCooldown(lastExam, 60).inCooldown).toBe(true);
    expect(isInCooldown(lastExam, 10).inCooldown).toBe(false);
  });
});
