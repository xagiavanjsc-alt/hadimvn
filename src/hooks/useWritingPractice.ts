import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface WritingExercise {
  id: string;
  title: string;
  prompt: string;
  type: "email" | "essay" | "conversation" | "self_introduction";
  difficulty: number; // 1-5
  word_limit?: number;
}

interface WritingSubmission {
  id: string;
  exercise_id: string;
  user_id: string;
  content: string;
  submitted_at: string;
  status: "pending" | "reviewed";
  corrections?: Correction[];
}

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  type: "grammar" | "vocabulary" | "spelling" | "style";
}

export function useWritingPractice() {
  const [exercises, setExercises] = useState<WritingExercise[]>([]);
  const [submissions, setSubmissions] = useState<WritingSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase.from("writing_exercises").select("*");
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const fetchSubmissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("writing_submissions")
        .select("*")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const submitWriting = async (exerciseId: string, content: string, userId: string) => {
    try {
      const { error } = await supabase.from("writing_submissions").insert({
        exercise_id: exerciseId,
        user_id: userId,
        content,
        status: "pending",
      });

      if (error) throw error;

      // Simulate AI correction (in real implementation, this would call an AI API)
      await simulateAICorrection(exerciseId, content, userId);

      return true;
    } catch (error) {
      console.error("Error submitting writing:", error);
      return false;
    }
  };

  const simulateAICorrection = async (exerciseId: string, content: string, userId: string) => {
    // Simulate AI correction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock corrections (in real implementation, this would use AI)
    const mockCorrections: Correction[] = [
      {
        original: "안녕하세요",
        corrected: "안녕하세요",
        explanation: "Correct greeting",
        type: "grammar",
      },
    ];

    const { error } = await supabase
      .from("writing_submissions")
      .update({
        status: "reviewed",
        corrections: mockCorrections,
      })
      .eq("exercise_id", exerciseId)
      .eq("user_id", userId);

    if (error) throw error;
  };

  const getExerciseTypeLabel = (type: WritingExercise["type"]) => {
    switch (type) {
      case "email": return "Email";
      case "essay": return "Bài viết";
      case "conversation": return "Hội thoại";
      case "self_introduction": return "Giới thiệu bản thân";
      default: return type;
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Dễ";
      case 2: return "Khá dễ";
      case 3: return "Trung bình";
      case 4: return "Khá khó";
      case 5: return "Khó";
      default: return `${level}`;
    }
  };

  return {
    exercises,
    submissions,
    loading,
    fetchExercises,
    fetchSubmissions,
    submitWriting,
    getExerciseTypeLabel,
    getDifficultyLabel,
  };
}
