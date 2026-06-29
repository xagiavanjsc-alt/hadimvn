import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface QuestionTag {
  id: string;
  name: string;
  category: "topic" | "difficulty" | "grammar" | "skill";
  color: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  tags: string[];
  difficulty: number; // 1-5
  skill: "listening" | "reading" | "grammar" | "vocabulary";
}

interface FilterState {
  topics: string[];
  difficulties: number[];
  skills: string[];
  grammarPoints: string[];
}

export function useQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<QuestionTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    topics: [],
    difficulties: [],
    skills: [],
    grammarPoints: [],
  });

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase.from("question_tags").select("*");
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase.from("eps_questions").select("*");

      // Apply filters
      if (filters.topics.length > 0) {
        query = query.contains("tags", filters.topics);
      }
      if (filters.difficulties.length > 0) {
        query = query.in("difficulty", filters.difficulties);
      }
      if (filters.skills.length > 0) {
        query = query.in("skill", filters.skills);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const toggleFilter = (category: keyof FilterState, value: string | number) => {
    setFilters(prev => {
      const current = prev[category];
      const exists = current.includes(value as never);
      return {
        ...prev,
        [category]: exists
          ? current.filter((v) => v !== value)
          : [...current, value as never],
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      topics: [],
      difficulties: [],
      skills: [],
      grammarPoints: [],
    });
  };

  const getTagsByCategory = (category: QuestionTag["category"]) => {
    return tags.filter((t) => t.category === category);
  };

  const getFilteredCount = () => {
    return (
      filters.topics.length +
      filters.difficulties.length +
      filters.skills.length +
      filters.grammarPoints.length
    );
  };

  return {
    questions,
    tags,
    loading,
    filters,
    toggleFilter,
    clearFilters,
    getTagsByCategory,
    getFilteredCount,
    fetchQuestions,
  };
}
