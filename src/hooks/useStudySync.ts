import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { computeXP, deriveLevel } from "@/lib/xp";
import { getStreakData } from "@/utils/streak";

export function useStudySync() {
  const syncToCloud = useCallback(async (userId: string) => {
    try {
      const streak = getStreakData();
      const flashcardKnown = JSON.parse(localStorage.getItem("flashcard_known") || "{}");
      const hangulKnown = JSON.parse(localStorage.getItem("kts_hangul_known") || "{}");
      const examResults = JSON.parse(localStorage.getItem("kts_eps_exam_results") || "[]");

      // Sync to user_progress (unified XP/streak)
      const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length + Object.values(hangulKnown).filter(Boolean).length;
      const validExams = examResults as { score: number; total: number; correctIds?: string[] }[];
      const bestScore = validExams.length > 0
        ? Math.max(...validExams.map(r => Math.round((r.score / r.total) * 100)))
        : 0;
      const avgScore = validExams.length > 0
        ? Math.round(validExams.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / validExams.length)
        : 0;
      const totalCorrect = validExams.reduce((sum, r) => sum + (r.correctIds?.length ?? r.score ?? 0), 0);

      const xp = computeXP({
        streakDays: streak.currentStreak,
        bestScorePct: bestScore,
        averageScorePct: avgScore,
        wordsLearned,
        totalCorrectAnswers: totalCorrect,
        validExamsCount: validExams.length,
      });
      const level = deriveLevel(bestScore);

      await supabase.from("user_progress").upsert({
        user_id: userId,
        xp,
        level,
        streak_count: streak.currentStreak,
        streak_last_date: streak.lastStudyDate || null,
        best_score: bestScore,
        words_learned: wordsLearned,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Sync EPS progress to module_progress
      const epsAnswers = JSON.parse(localStorage.getItem("kts_eps_answers") || "{}");
      const epsLessonsCompleted = Object.keys(epsAnswers).length;
      if (epsLessonsCompleted > 0) {
        await supabase.from("module_progress").upsert({
          user_id: userId,
          module_id: "eps",
          lessons_completed: epsLessonsCompleted,
          total_lessons: 60, // EPS has 60 lessons
          progress_percent: Math.min(100, (epsLessonsCompleted / 60) * 100),
          last_studied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,module_id" });
      }

      // Sync flashcard data to flashcard_data
      for (const [cardId, known] of Object.entries(flashcardKnown)) {
        await supabase.from("flashcard_data").upsert({
          user_id: userId,
          card_id: cardId,
          module_id: "hanja", // default for now, will be refined
          status: known ? "mastered" : "new",
          success_count: known ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,card_id" });
      }

      // Sync exam results to exam_results
      if (examResults.length > 0) {
        const { data: existing } = await supabase
          .from("exam_results")
          .select("id")
          .eq("user_id", userId);
        if (!existing || existing.length === 0) {
          const rows = examResults.map((r: { id?: string; date?: string; score: number; total: number; timeUsed?: number; correctIds?: string[] }) => ({
            user_id: userId,
            exam_type: "eps", // default for now
            score: r.score,
            total: r.total,
            time_used: r.timeUsed || 0,
            correct_ids: r.correctIds || [],
            taken_at: r.date || new Date().toISOString(),
          }));
          await supabase.from("exam_results").insert(rows);
        }
      }
    } catch {
      // silent fail
    }
  }, []);

  const loadFromCloud = useCallback(async (userId: string) => {
    try {
      // Load user_progress
      const { data: userProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (userProgress) {
        if (userProgress.streak_count > 0) {
          localStorage.setItem("hanja_streak", JSON.stringify({
            currentStreak: userProgress.streak_count,
            longestStreak: userProgress.streak_count,
            lastStudyDate: userProgress.streak_last_date || "",
            history: {}
          }));
        }
        localStorage.setItem("xp_total", JSON.stringify({ total: userProgress.xp }));
        // Store best_score and words_learned for leaderboard sync
        if (userProgress.best_score !== undefined) {
          localStorage.setItem("kts_best_score", JSON.stringify(userProgress.best_score));
        }
        if (userProgress.words_learned !== undefined) {
          localStorage.setItem("kts_sr_cards_learned", JSON.stringify(userProgress.words_learned));
        }
      }

      // Load module_progress
      const { data: moduleProgress } = await supabase
        .from("module_progress")
        .select("*")
        .eq("user_id", userId);

      if (moduleProgress) {
        const epsModule = moduleProgress.find(m => m.module_id === "eps");
        if (epsModule && epsModule.lessons_completed > 0) {
          // Reconstruct eps_answers from module progress (simplified)
          const epsAnswers: Record<string, any> = {};
          for (let i = 1; i <= epsModule.lessons_completed; i++) {
            epsAnswers[`lesson_${i}`] = { completed: true, score: 100 };
          }
          localStorage.setItem("kts_eps_answers", JSON.stringify(epsAnswers));
        }
      }

      // Load flashcard_data
      const { data: flashcardData } = await supabase
        .from("flashcard_data")
        .select("*")
        .eq("user_id", userId);

      if (flashcardData) {
        const flashcardKnown: Record<string, boolean> = {};
        flashcardData.forEach(card => {
          flashcardKnown[card.card_id] = card.status === "mastered";
        });
        localStorage.setItem("flashcard_known", JSON.stringify(flashcardKnown));
      }

      // Load exam_results
      const { data: exams } = await supabase
        .from("exam_results")
        .select("*")
        .eq("user_id", userId)
        .order("taken_at", { ascending: false });

      if (exams && exams.length > 0) {
        const mapped = exams.map(e => ({
          id: e.id,
          date: e.taken_at,
          score: e.score,
          total: e.total,
          timeUsed: e.time_used,
          correctIds: e.correct_ids,
        }));
        localStorage.setItem("kts_eps_exam_results", JSON.stringify(mapped));
      }
    } catch {
      // silent fail
    }
  }, []);

  const updateLeaderboard = useCallback(async (userId: string, _displayName: string) => {
    try {
      const streak = getStreakData();
      const flashcardKnown = JSON.parse(localStorage.getItem("flashcard_known") || "{}");
      const examResults = JSON.parse(localStorage.getItem("kts_eps_exam_results") || "[]");
      // Local granular XP total (from every awardXP/addXP call) — source of truth
      // for bonuses that the formula can't see (lesson completions, manual rewards).
      const xpTotalState = JSON.parse(localStorage.getItem("xp_total") || '{"total":0}');
      const localTotalXP = Number(xpTotalState?.total) || 0;

      const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length;
      const validExams = examResults as { score: number; total: number; correctIds?: string[] }[];
      const bestScore = validExams.length > 0
        ? Math.max(...validExams.map(r => Math.round((r.score / r.total) * 100)))
        : 0;
      const avgScore = validExams.length > 0
        ? Math.round(validExams.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / validExams.length)
        : 0;
      const totalCorrect = validExams.reduce((sum, r) => sum + (r.correctIds?.length ?? r.score ?? 0), 0);

      const computedXP = computeXP({
        streakDays: streak.currentStreak,
        bestScorePct: bestScore,
        averageScorePct: avgScore,
        wordsLearned,
        totalCorrectAnswers: totalCorrect,
        validExamsCount: validExams.length,
      });
      const level = deriveLevel(bestScore);

      // XP RULE (site-wide): server_xp = max(formula_xp, local_total_xp).
      // Never decrease server XP — matches useXPSystem.scheduleServerSync.
      const finalXP = Math.max(computedXP, localTotalXP);

      // Update user_progress (will trigger leaderboard sync via trigger)
      await supabase.from("user_progress").upsert({
        user_id: userId,
        xp: finalXP,
        level,
        streak_count: streak.currentStreak,
        streak_last_date: streak.lastStudyDate || null,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    } catch {
      // silent fail
    }
  }, []);

  return { syncToCloud, loadFromCloud, updateLeaderboard };
}
