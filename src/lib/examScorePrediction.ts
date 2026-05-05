// Exam Score Prediction
// Predicts EPS-TOPIK score based on current performance and study time

export interface PredictionInput {
  currentAccuracy: number; // 0-100
  weakAreas: string[]; // list of weak topics
  daysUntilExam: number;
  studyHoursAvailable: number;
  learningVelocity?: number; // points gained per hour (default: 2)
  difficultyOfRemaining?: number; // 0-1, higher = harder (default: 0.5)
}

interface PredictedScore {
  predictedScore: number;
  confidence: "high" | "medium" | "low";
  scenarios: {
    ifStudy2h: number;
    ifStudy05h: number;
    ifStudy1h: number;
  };
  analysis: {
    strongAreas: string[];
    weakAreas: string[];
    focusRecommendation: string;
    timeNeeded: number; // hours needed to reach target
  };
}

// Default learning velocity: 2 points per hour of study
const DEFAULT_LEARNING_VELOCITY = 2;

// Difficulty multiplier for remaining topics
const DIFFICULTY_MULTIPLIER = 1.2;

function calculateLearningVelocity(
  currentAccuracy: number,
  studyHoursAvailable: number
): number {
  // Learning velocity decreases as accuracy increases (diminishing returns)
  // At 50% accuracy: 2.5 points/hour
  // At 70% accuracy: 2 points/hour
  // At 90% accuracy: 1.5 points/hour
  
  const baseVelocity = DEFAULT_LEARNING_VELOCITY;
  const accuracyFactor = 1 - (currentAccuracy / 100) * 0.5; // 0.5 to 1.0
  return baseVelocity * accuracyFactor;
}

function calculateWeaknessPenalty(weakAreas: string[]): number {
  // Each weak area reduces predicted score by 5-10 points
  // More weak areas = higher penalty
  const penaltyPerArea = 8;
  return Math.min(weakAreas.length * penaltyPerArea, 30); // Max 30 point penalty
}

function calculateDifficultyBonus(
  currentAccuracy: number,
  difficultyOfRemaining: number
): number {
  // If remaining topics are harder, reduce predicted score
  // If current accuracy is high, user might handle difficulty better
  const difficultyPenalty = difficultyOfRemaining * 20; // Up to 20 point penalty
  const accuracyBonus = (currentAccuracy / 100) * 10; // Up to 10 point bonus
  return Math.max(0, difficultyPenalty - accuracyBonus);
}

export function predictExamScore(input: PredictionInput): PredictedScore {
  const {
    currentAccuracy,
    weakAreas,
    daysUntilExam,
    studyHoursAvailable,
    learningVelocity: customVelocity,
    difficultyOfRemaining = 0.5,
  } = input;

  // Calculate learning velocity
  const learningVelocity = customVelocity || calculateLearningVelocity(currentAccuracy, studyHoursAvailable);

  // Calculate base improvement
  const totalStudyHours = studyHoursAvailable * daysUntilExam;
  const baseImprovement = totalStudyHours * learningVelocity;

  // Apply weakness penalty
  const weaknessPenalty = calculateWeaknessPenalty(weakAreas);

  // Apply difficulty adjustment
  const difficultyAdjustment = calculateDifficultyBonus(currentAccuracy, difficultyOfRemaining);

  // Calculate predicted score
  let predictedScore = currentAccuracy + baseImprovement - weaknessPenalty - difficultyAdjustment;
  predictedScore = Math.max(0, Math.min(100, predictedScore)); // Clamp to 0-100

  // Calculate scenarios
  const scenarios = {
    ifStudy2h: Math.min(100, currentAccuracy + (2 * daysUntilExam * learningVelocity) - weaknessPenalty - difficultyAdjustment),
    ifStudy05h: Math.min(100, currentAccuracy + (0.5 * daysUntilExam * learningVelocity) - weaknessPenalty - difficultyAdjustment),
    ifStudy1h: Math.min(100, currentAccuracy + (1 * daysUntilExam * learningVelocity) - weaknessPenalty - difficultyAdjustment),
  };

  // Calculate confidence based on data quality
  let confidence: "high" | "medium" | "low" = "medium";
  if (studyHoursAvailable < 0.5) confidence = "low";
  else if (studyHoursAvailable > 1.5 && weakAreas.length < 2) confidence = "high";

  // Analyze strong and weak areas
  const strongAreas = ["Đọc", "Viết", "Nghe"]; // Simplified - would come from actual data
  const analysis = {
    strongAreas,
    weakAreas,
    focusRecommendation: generateFocusRecommendation(weakAreas, currentAccuracy),
    timeNeeded: calculateTimeNeeded(currentAccuracy, 80, learningVelocity, weaknessPenalty),
  };

  return {
    predictedScore: Math.round(predictedScore),
    confidence,
    scenarios: {
      ifStudy2h: Math.round(scenarios.ifStudy2h),
      ifStudy05h: Math.round(scenarios.ifStudy05h),
      ifStudy1h: Math.round(scenarios.ifStudy1h),
    },
    analysis,
  };
}

function generateFocusRecommendation(weakAreas: string[], currentAccuracy: number): string {
  if (weakAreas.length === 0) {
    return "Bạn đang làm rất tốt! Tiếp tục ôn tập để巩固 kiến thức.";
  }

  if (currentAccuracy < 50) {
    return `Cần tập trung toàn diện vào: ${weakAreas.join(", ")}. Học lại từ cơ bản.`;
  }

  if (currentAccuracy < 70) {
    return `Tập trung vào: ${weakAreas.slice(0, 2).join(", ")}. Ôn tập thêm các pattern ngữ pháp.`;
  }

  return `Cải thiện: ${weakAreas.slice(0, 2).join(", ")}. Làm thêm bài tập để tăng tốc độ.`;
}

function calculateTimeNeeded(
  currentAccuracy: number,
  targetAccuracy: number,
  learningVelocity: number,
  weaknessPenalty: number
): number {
  const pointsNeeded = targetAccuracy - currentAccuracy + weaknessPenalty;
  if (pointsNeeded <= 0) return 0;
  return Math.ceil(pointsNeeded / learningVelocity);
}

export function generateStudyPlan(
  currentAccuracy: number,
  weakAreas: string[],
  daysUntilExam: number,
  targetScore: number = 80
): {
  dailyHours: number;
  focusAreas: string[];
  milestones: { day: number; target: string; score: number }[];
} {
  const prediction = predictExamScore({
    currentAccuracy,
    weakAreas,
    daysUntilExam,
    studyHoursAvailable: 1, // Start with 1 hour/day
  });

  // Calculate required daily hours to reach target
  const pointsNeeded = targetScore - prediction.predictedScore;
  const learningVelocity = calculateLearningVelocity(currentAccuracy, 1);
  const totalHoursNeeded = Math.ceil(pointsNeeded / learningVelocity);
  const dailyHours = Math.ceil(totalHoursNeeded / daysUntilExam);

  // Generate milestones
  const milestones: { day: number; target: string; score: number }[] = [];
  const scoreIncrement = (targetScore - currentAccuracy) / 4; // 4 milestones
  
  for (let i = 1; i <= 4; i++) {
    const day = Math.floor((daysUntilExam / 4) * i);
    const targetScoreAtMilestone = Math.round(currentAccuracy + scoreIncrement * i);
    milestones.push({
      day,
      target: `Milestone ${i}`,
      score: targetScoreAtMilestone,
    });
  }

  return {
    dailyHours,
    focusAreas: weakAreas.slice(0, 3),
    milestones,
  };
}
