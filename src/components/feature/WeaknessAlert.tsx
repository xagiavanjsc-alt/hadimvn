import { useState, useEffect } from "react";

interface WeaknessAlertProps {
  topicAccuracy: Record<string, number>; // topic -> accuracy percentage
  onDismiss?: (topic: string) => void;
  onAction?: (topic: string) => void;
}

interface WeakArea {
  topic: string;
  accuracy: number;
  severity: "critical" | "warning" | "info";
}

export default function WeaknessAlert({
  topicAccuracy,
  onDismiss,
  onAction,
}: WeaknessAlertProps) {
  const [alerts, setAlerts] = useState<WeakArea[]>([]);
  const [dismissedTopics, setDismissedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      if (!topicAccuracy || typeof topicAccuracy !== 'object') {
        setAlerts([]);
        return;
      }

      const weakAreas: WeakArea[] = [];

      for (const [topic, accuracy] of Object.entries(topicAccuracy)) {
        if (dismissedTopics.has(topic)) continue;

        // Validate accuracy is a number
        if (typeof accuracy !== 'number' || isNaN(accuracy)) continue;

        let severity: WeakArea["severity"] = "info";
        if (accuracy < 40) severity = "critical";
        else if (accuracy < 60) severity = "warning";
        else continue; // Not weak enough to alert

        weakAreas.push({ topic, accuracy, severity });
      }

      // Sort by severity (critical first)
      weakAreas.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      setAlerts(weakAreas);
    } catch (error) {
      console.error('Error in WeaknessAlert useEffect:', error);
      setAlerts([]);
    }
  }, [topicAccuracy, dismissedTopics]);

  const handleDismiss = (topic: string) => {
    setDismissedTopics((prev) => new Set(prev).add(topic));
    onDismiss?.(topic);
  };

  const handleAction = (topic: string) => {
    onAction?.(topic);
    handleDismiss(topic);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {alerts.map((alert) => (
        <div
          key={alert.topic}
          className={`rounded-xl border p-4 ${
            alert.severity === "critical"
              ? "bg-red-500/10 border-red-500/30"
              : alert.severity === "warning"
              ? "bg-orange-500/10 border-orange-500/30"
              : "bg-blue-500/10 border-blue-500/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${
                alert.severity === "critical"
                  ? "bg-red-500/20"
                  : alert.severity === "warning"
                  ? "bg-orange-500/20"
                  : "bg-blue-500/20"
              }`}
            >
              <i
                className={`${
                  alert.severity === "critical"
                    ? "ri-alarm-warning-line text-red-400"
                    : alert.severity === "warning"
                    ? "ri-error-warning-line text-orange-400"
                    : "ri-information-line text-blue-400"
                } text-lg`}
              ></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p
                  className={`font-semibold text-sm ${
                    alert.severity === "critical"
                      ? "text-red-400"
                      : alert.severity === "warning"
                      ? "text-orange-400"
                      : "text-blue-400"
                  }`}
                >
                  {alert.severity === "critical"
                    ? "Cần tập trung ngay!"
                    : alert.severity === "warning"
                    ? "Cần cải thiện"
                    : "Lưu ý"}
                </p>
                <span className="text-white/50 text-xs">• {alert.topic}</span>
              </div>
              <p className="text-white/70 text-xs mb-2">
                Độ chính xác: <span className="font-semibold">{alert.accuracy}%</span>
              </p>
              <p className="text-white/60 text-xs mb-3">
                {alert.severity === "critical"
                  ? "Chủ đề này rất yếu. Cần học lại từ đầu và tập trung ôn tập."
                  : alert.severity === "warning"
                  ? "Chủ đề này cần cải thiện. Học thêm 20-30 từ vựng và làm thêm quiz."
                  : "Chủ đề này có thể tốt hơn. Ôn tập thêm để巩固 kiến thức."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(alert.topic)}
                  className="px-3 py-1.5 rounded-lg bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-xs font-semibold transition-colors"
                >
                  Học ngay
                </button>
                <button
                  onClick={() => handleDismiss(alert.topic)}
                  className="px-3 py-1.5 rounded-lg bg-app-surface/50 border border-app-border hover:border-white/18 text-white/70 hover:text-white text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook to track topic accuracy
export function useTopicAccuracy() {
  const [topicAccuracy, setTopicAccuracy] = useState<Record<string, number>>({});

  const updateAccuracy = (topic: string, correct: number, total: number) => {
    if (total === 0) return;
    const accuracy = Math.round((correct / total) * 100);
    setTopicAccuracy((prev) => ({
      ...prev,
      [topic]: accuracy,
    }));
  };

  return { topicAccuracy, updateAccuracy };
}
