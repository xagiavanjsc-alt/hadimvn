import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface GrammarPattern {
  id: string;
  pattern: string;
  romanization?: string;
  meaning: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  explanation: string;
  usage?: string;
  examples: { korean: string; vietnamese: string }[];
  related_patterns?: string[];
  tags?: string[];
}

export interface GrammarProgress {
  id: string;
  user_id: string;
  pattern_id: string;
  status: "not_started" | "in_progress" | "mastered";
  last_reviewed_at?: string;
  review_count: number;
  mastery_score: number;
}

export function useGrammar() {
  const [patterns, setPatterns] = useState<GrammarPattern[]>([]);
  const [progress, setProgress] = useState<GrammarProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrammar();
  }, []);

  const fetchGrammar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all patterns
      const { data: patternsData, error: patternsError } = await supabase
        .from("grammar_patterns")
        .select("*")
        .order("level");

      if (patternsError) throw patternsError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("grammar_progress")
        .select("*");

      if (progressError) throw progressError;

      setPatterns(patternsData || []);
      setProgress(progressData || []);
    } catch (err: any) {
      console.error("Error fetching grammar:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPatternsByLevel = (level: "beginner" | "intermediate" | "advanced") => {
    return patterns.filter((p) => p.level === level);
  };

  const getPatternsByCategory = (category: string) => {
    return patterns.filter((p) => p.category === category);
  };

  const getPatternProgress = (patternId: string) => {
    return progress.find((p) => p.pattern_id === patternId);
  };

  const updateProgress = async (patternId: string, status: "not_started" | "in_progress" | "mastered") => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { error } = await supabase
        .from("grammar_progress")
        .upsert({
          user_id: user.id,
          pattern_id: patternId,
          status,
          last_reviewed_at: new Date().toISOString(),
          review_count: (getPatternProgress(patternId)?.review_count || 0) + 1,
        });

      if (error) throw error;

      // Refetch progress
      await fetchGrammar();
    } catch (err: any) {
      console.error("Error updating grammar progress:", err);
    }
  };

  const getMasteredCount = () => progress.filter((p) => p.status === "mastered").length;
  const getInProgressCount = () => progress.filter((p) => p.status === "in_progress").length;
  const getTotalCount = () => patterns.length;

  return {
    patterns,
    progress,
    loading,
    error,
    fetchGrammar,
    getPatternsByLevel,
    getPatternsByCategory,
    getPatternProgress,
    updateProgress,
    getMasteredCount,
    getInProgressCount,
    getTotalCount,
  };
}
