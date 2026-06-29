import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface SkillPerformance {
  listening: number; // 0-100
  reading: number;
  grammar: number;
  vocabulary: number;
}

interface LearningPath {
  currentLevel: number; // 1-60 (bài học)
  recommendedLessons: number[];
  weakSkills: string[];
  strongSkills: string[];
  lastUpdated: number;
}

interface QuizResult {
  skill: "listening" | "reading" | "grammar" | "vocabulary";
  score: number;
  total: number;
  lessonId?: number;
}

export function useLearningPath() {
  const [performance, setPerformance] = useLocalStorage<SkillPerformance>("kts_skill_performance", {
    listening: 50,
    reading: 50,
    grammar: 50,
    vocabulary: 50,
  });
  const [path, setPath] = useLocalStorage<LearningPath>("kts_learning_path", {
    currentLevel: 1,
    recommendedLessons: [1, 2, 3],
    weakSkills: [],
    strongSkills: [],
    lastUpdated: Date.now(),
  });

  const updatePerformance = (result: QuizResult) => {
    const percentage = (result.score / result.total) * 100;
    setPerformance(prev => ({
      ...prev,
      [result.skill]: Math.round((prev[result.skill] * 0.7 + percentage * 0.3)), // Weighted average
    }));
  };

  const analyzeWeaknesses = () => {
    const skills = ["listening", "reading", "grammar", "vocabulary"] as const;
    const weakSkills: string[] = [];
    const strongSkills: string[] = [];

    skills.forEach(skill => {
      if (performance[skill] < 60) {
        weakSkills.push(skill);
      } else if (performance[skill] >= 80) {
        strongSkills.push(skill);
      }
    });

    return { weakSkills, strongSkills };
  };

  const generateRecommendations = () => {
    const { weakSkills } = analyzeWeaknesses();
    const recommendations: number[] = [];

    // Recommend lessons based on weak skills
    if (weakSkills.includes("listening")) {
      recommendations.push(1, 2, 3); // Listening-focused lessons
    }
    if (weakSkills.includes("reading")) {
      recommendations.push(4, 5, 6); // Reading-focused lessons
    }
    if (weakSkills.includes("grammar")) {
      recommendations.push(7, 8, 9); // Grammar-focused lessons
    }
    if (weakSkills.includes("vocabulary")) {
      recommendations.push(10, 11, 12); // Vocabulary-focused lessons
    }

    // Add next lessons in sequence
    const nextLesson = path.currentLevel + 1;
    if (nextLesson <= 60 && !recommendations.includes(nextLesson)) {
      recommendations.push(nextLesson);
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  };

  const updatePath = () => {
    const { weakSkills, strongSkills } = analyzeWeaknesses();
    const recommendedLessons = generateRecommendations();

    setPath({
      currentLevel: path.currentLevel,
      recommendedLessons,
      weakSkills,
      strongSkills,
      lastUpdated: Date.now(),
    });
  };

  const completeLesson = (lessonId: number) => {
    if (lessonId === path.currentLevel) {
      setPath(prev => ({
        ...prev,
        currentLevel: Math.min(prev.currentLevel + 1, 60),
      }));
    }
  };

  const resetPath = () => {
    setPerformance({
      listening: 50,
      reading: 50,
      grammar: 50,
      vocabulary: 50,
    });
    setPath({
      currentLevel: 1,
      recommendedLessons: [1, 2, 3],
      weakSkills: [],
      strongSkills: [],
      lastUpdated: Date.now(),
    });
  };

  // Auto-update path when performance changes
  useEffect(() => {
    updatePath();
  }, [performance]);

  return {
    performance,
    path,
    updatePerformance,
    completeLesson,
    resetPath,
    analyzeWeaknesses,
  };
}
