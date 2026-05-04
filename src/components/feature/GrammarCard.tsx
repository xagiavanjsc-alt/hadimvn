import { GrammarPattern, GrammarProgress } from "@/hooks/useGrammar";

interface GrammarCardProps {
  pattern: GrammarPattern;
  progress?: GrammarProgress;
  onStart?: () => void;
}

export function GrammarCard({ pattern, progress, onStart }: GrammarCardProps) {
  const levelColors = {
    beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusColors = {
    not_started: "text-app-text-muted",
    in_progress: "text-app-accent-primary",
    mastered: "text-green-400",
  };

  return (
    <div className="p-4 rounded-2xl border border-app-border bg-app-card/30 hover:border-app-accent-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{pattern.pattern}</h3>
          {pattern.romanization && (
            <p className="text-sm text-app-text-muted italic">{pattern.romanization}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${levelColors[pattern.level]}`}>
          {pattern.level}
        </span>
      </div>

      {/* Meaning */}
      <p className="text-white/80 mb-3">{pattern.meaning}</p>

      {/* Explanation */}
      <p className="text-sm text-app-text-muted mb-3 line-clamp-2">{pattern.explanation}</p>

      {/* Examples */}
      {pattern.examples && pattern.examples.length > 0 && (
        <div className="mb-3 space-y-2">
          {pattern.examples.slice(0, 2).map((example, idx) => (
            <div key={idx} className="text-sm">
              <p className="text-white">{example.korean}</p>
              <p className="text-app-text-muted">{example.vietnamese}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-app-border">
        <div className="flex items-center gap-2">
          {progress && (
            <span className={`text-xs font-medium ${statusColors[progress.status]}`}>
              {progress.status === "mastered" && "✓ Đã thành thạo"}
              {progress.status === "in_progress" && "◐ Đang học"}
              {progress.status === "not_started" && "○ Chưa bắt đầu"}
            </span>
          )}
          {pattern.tags && pattern.tags.length > 0 && (
            <div className="flex gap-1">
              {pattern.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs text-app-text-muted bg-app-card/50 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onStart}
          className="text-app-accent-primary text-sm font-medium hover:text-[#d4b43a] transition-colors"
        >
          Học ngay →
        </button>
      </div>
    </div>
  );
}
