import { useMemo } from "react";
import { predictExamScore, generateStudyPlan, type PredictionInput } from "@/lib/examScorePrediction";

interface ExamScorePredictionProps {
  currentAccuracy: number;
  weakAreas: string[];
  daysUntilExam: number;
  studyHoursAvailable: number;
  targetScore?: number;
}

export default function ExamScorePrediction({
  currentAccuracy,
  weakAreas,
  daysUntilExam,
  studyHoursAvailable,
  targetScore = 80,
}: ExamScorePredictionProps) {
  const prediction = useMemo(() => {
    return predictExamScore({
      currentAccuracy,
      weakAreas,
      daysUntilExam,
      studyHoursAvailable,
    });
  }, [currentAccuracy, weakAreas, daysUntilExam, studyHoursAvailable]);

  const studyPlan = useMemo(() => {
    return generateStudyPlan(currentAccuracy, weakAreas, daysUntilExam, targetScore);
  }, [currentAccuracy, weakAreas, daysUntilExam, targetScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "app-accent-primary";
    if (score >= 40) return "#fb923c";
    return "#f87171";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "#34d399";
      case "medium": return "app-accent-primary";
      case "low": return "#fb923c";
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case "high": return "Cao";
      case "medium": return "Trung bình";
      case "low": return "Thấp";
    }
  };

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/15">
          <i className="ri-line-chart-line text-purple-400 text-xl"></i>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Dự báo điểm EPS-TOPIK</h3>
          <p className="text-app-text-secondary text-xs">Dựa trên hiệu suất hiện tại của bạn</p>
        </div>
      </div>

      {/* Main Prediction */}
      <div className="bg-app-surface/50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Điểm dự báo:</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold" style={{ color: getScoreColor(prediction.predictedScore) }}>
              {prediction.predictedScore}
            </span>
            <span className="text-white/50 text-sm">/100</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs">Độ tin cậy:</span>
          <span
            className="text-xs font-semibold"
            style={{ color: getConfidenceColor(prediction.confidence) }}
          >
            {getConfidenceLabel(prediction.confidence)}
          </span>
        </div>
      </div>

      {/* Scenarios */}
      <div className="space-y-2 mb-4">
        <p className="text-white/70 text-xs font-semibold mb-2">Kịch bản khác nhau:</p>
        {[
          { label: "Nếu học 2h/ngày", score: prediction.scenarios.ifStudy2h },
          { label: "Nếu học 1h/ngày", score: prediction.scenarios.ifStudy1h },
          { label: "Nếu học 0.5h/ngày", score: prediction.scenarios.ifStudy05h },
        ].map((scenario) => (
          <div key={scenario.label} className="flex items-center justify-between p-2 rounded-lg bg-app-card/30">
            <span className="text-white/60 text-xs">{scenario.label}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: getScoreColor(scenario.score) }}
            >
              {scenario.score}/100
            </span>
          </div>
        ))}
      </div>

      {/* Analysis */}
      <div className="bg-app-card/30 rounded-xl p-4 mb-4">
        <p className="text-white/70 text-xs font-semibold mb-2">Phân tích:</p>
        {prediction.analysis.weakAreas.length > 0 && (
          <div className="mb-2">
            <p className="text-orange-400 text-xs mb-1">Điểm yếu cần cải thiện:</p>
            <div className="flex flex-wrap gap-2">
              {prediction.analysis.weakAreas.map((area, idx) => (
                <span key={idx} className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mb-2">
          <p className="text-app-text-secondary text-xs mb-1">Khuyến nghị:</p>
          <p className="text-white/70 text-xs">{prediction.analysis.focusRecommendation}</p>
        </div>
        {prediction.analysis.timeNeeded > 0 && (
          <div>
            <p className="text-white/60 text-xs">
              Thời gian cần để đạt {targetScore} điểm: <span className="text-white font-semibold">{prediction.analysis.timeNeeded} giờ</span>
            </p>
          </div>
        )}
      </div>

      {/* Study Plan */}
      {studyPlan.dailyHours > 0 && (
        <div className="bg-app-accent-primary/10 border border-app-accent-primary/25 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-calendar-check-line text-app-accent-primary text-sm"></i>
            <p className="text-app-accent-primary text-xs font-semibold">Kế hoạch học tập:</p>
          </div>
          <p className="text-white/70 text-xs mb-2">
            Cần học <span className="text-white font-semibold">{studyPlan.dailyHours} giờ/ngày</span> để đạt {targetScore} điểm
          </p>
          {studyPlan.focusAreas.length > 0 && (
            <p className="text-white/60 text-xs mb-3">
              Tập trung: {studyPlan.focusAreas.join(", ")}
            </p>
          )}
          <div className="space-y-1">
            <p className="text-white/50 text-xs mb-1">Mốc tiến độ:</p>
            {studyPlan.milestones.map((milestone) => (
              <div key={milestone.day} className="flex items-center justify-between text-xs">
                <span className="text-white/60">Ngày {milestone.day}</span>
                <span className="text-white font-semibold">{milestone.score} điểm</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
