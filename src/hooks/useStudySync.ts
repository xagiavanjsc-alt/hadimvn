import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useStudySync() {
  const syncToCloud = useCallback(async (userId: string) => {
    try {
      const epsAnswers = JSON.parse(localStorage.getItem("kts_eps_answers") || "{}");
      const flashcardKnown = JSON.parse(localStorage.getItem("kts_flashcard_known") || "{}");
      const hangulKnown = JSON.parse(localStorage.getItem("kts_hangul_known") || "{}");
      const quizHistory = JSON.parse(localStorage.getItem("kts_quiz_history") || "[]");
      const newsLessons = JSON.parse(localStorage.getItem("kts_news_lessons") || "[]");
      const streak = JSON.parse(localStorage.getItem("kts_streak") || '{"count":0,"lastDate":""}');
      const pdfCount = parseInt(localStorage.getItem("kts_pdf_exports_count") || "0");
      const pdfMonth = localStorage.getItem("kts_pdf_exports_month") || null;
      const vocabFavorites = JSON.parse(localStorage.getItem("kts_vocab_favorites") || "[]");
      const vocabKnown = JSON.parse(localStorage.getItem("kts_vocab_mastered") || "[]");
      const grammarProgress = JSON.parse(localStorage.getItem("kts_grammar_progress") || "{}");
      const dailyReviewHistory = JSON.parse(localStorage.getItem("kts_review_history") || "[]");

      await supabase.from("study_progress").upsert({
        user_id: userId,
        streak_count: streak.count || 0,
        streak_last_date: streak.lastDate || null,
        eps_answers: epsAnswers,
        flashcard_known: flashcardKnown,
        hangul_known: hangulKnown,
        quiz_history: quizHistory,
        news_lessons: newsLessons,
        pdf_exports_count: pdfCount,
        pdf_exports_month: pdfMonth,
        vocab_favorites: vocabFavorites,
        vocab_known: vocabKnown,
        grammar_progress: grammarProgress,
        daily_review_history: dailyReviewHistory,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Sync exam results
      const examResults = JSON.parse(localStorage.getItem("kts_eps_exam_results") || "[]");
      if (examResults.length > 0) {
        const { data: existing } = await supabase
          .from("exam_results")
          .select("id")
          .eq("user_id", userId);
        if (!existing || existing.length === 0) {
          const rows = examResults.map((r: { id?: string; date?: string; score: number; total: number; timeUsed?: number; correctIds?: string[] }) => ({
            user_id: userId,
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
      const { data: progress } = await supabase
        .from("study_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (progress) {
        if (progress.streak_count > 0) {
          localStorage.setItem("kts_streak", JSON.stringify({ count: progress.streak_count, lastDate: progress.streak_last_date || "" }));
        }
        if (Object.keys(progress.eps_answers || {}).length > 0) {
          localStorage.setItem("kts_eps_answers", JSON.stringify(progress.eps_answers));
        }
        if (Object.keys(progress.flashcard_known || {}).length > 0) {
          localStorage.setItem("kts_flashcard_known", JSON.stringify(progress.flashcard_known));
        }
        if (Object.keys(progress.hangul_known || {}).length > 0) {
          localStorage.setItem("kts_hangul_known", JSON.stringify(progress.hangul_known));
        }
        if ((progress.quiz_history || []).length > 0) {
          localStorage.setItem("kts_quiz_history", JSON.stringify(progress.quiz_history));
        }
        if ((progress.news_lessons || []).length > 0) {
          localStorage.setItem("kts_news_lessons", JSON.stringify(progress.news_lessons));
        }
        localStorage.setItem("kts_pdf_exports_count", String(progress.pdf_exports_count || 0));
        if (progress.pdf_exports_month) {
          localStorage.setItem("kts_pdf_exports_month", progress.pdf_exports_month);
        }
        if ((progress.vocab_favorites || []).length > 0) {
          localStorage.setItem("kts_vocab_favorites", JSON.stringify(progress.vocab_favorites));
        }
        if ((progress.vocab_known || []).length > 0) {
          localStorage.setItem("kts_vocab_mastered", JSON.stringify(progress.vocab_known));
        }
        if (Object.keys(progress.grammar_progress || {}).length > 0) {
          localStorage.setItem("kts_grammar_progress", JSON.stringify(progress.grammar_progress));
        }
        if ((progress.daily_review_history || []).length > 0) {
          localStorage.setItem("kts_review_history", JSON.stringify(progress.daily_review_history));
        }
      }

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

  const updateLeaderboard = useCallback(async (userId: string, displayName: string) => {
    try {
      const streak = JSON.parse(localStorage.getItem("kts_streak") || '{"count":0}');
      const flashcardKnown = JSON.parse(localStorage.getItem("kts_flashcard_known") || "{}");
      const answeredMap = JSON.parse(localStorage.getItem("kts_eps_answers") || "{}");
      const examResults = JSON.parse(localStorage.getItem("kts_eps_exam_results") || "[]");

      const wordsLearned = Object.values(flashcardKnown).filter(Boolean).length as number;
      const epsDone = Object.keys(answeredMap).length;
      const bestScore = examResults.length > 0
        ? Math.max(...examResults.map((r: { score: number; total: number }) => Math.round((r.score / r.total) * 100)))
        : 0;
      const xp = (streak.count || 0) * 50 + bestScore * 10 + (wordsLearned as number) * 5 + epsDone * 2;
      const level = bestScore >= 80 ? "TOPIK II" : bestScore >= 60 ? "TOPIK I" : "Cơ bản";

      await supabase.from("leaderboard_snapshots").upsert({
        user_id: userId,
        display_name: displayName,
        xp,
        streak: streak.count || 0,
        best_score: bestScore,
        words_learned: wordsLearned as number,
        level,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    } catch {
      // silent fail
    }
  }, []);

  return { syncToCloud, loadFromCloud, updateLeaderboard };
}
