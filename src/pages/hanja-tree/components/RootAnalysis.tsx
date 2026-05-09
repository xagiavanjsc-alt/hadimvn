interface RootChar {
  hanja: string;
  sinoViet: string;
  meaning: string;
}

interface RootAnalysisProps {
  korean: string;
  char1: RootChar;
  char2: RootChar;
  explanation: string;
}

export default function RootAnalysis({ korean, char1, char2, explanation }: RootAnalysisProps) {
  return (
    <div className="bg-app-surface border border-app-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
          <i className="ri-microscope-line text-app-accent-primary text-base"></i>
        </div>
        <h2 className="text-base font-bold text-app-text-primary">Phân tích Gốc (Root Analysis)</h2>
      </div>

      {/* Breakdown */}
      <div className="flex items-stretch gap-3 mb-6">
        {/* Korean */}
        <div className="flex-1 bg-app-card/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-app-text-primary mb-1">
            {korean}
          </div>
          <div className="text-xs text-app-text-muted font-medium">Hàn ngữ</div>
        </div>

        <div className="flex items-center text-app-text-muted text-lg font-bold">=</div>

        {/* Char 1 */}
        <div className="flex-1 bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-app-accent-primary mb-1">
            {char1.hanja}
          </div>
          <div className="text-xs font-bold text-app-accent-primary mb-0.5">{char1.sinoViet}</div>
          <div className="text-xs text-app-text-muted">{char1.meaning}</div>
        </div>

        <div className="flex items-center text-app-text-muted text-lg font-bold">+</div>

        {/* Char 2 */}
        <div className="flex-1 bg-app-accent-secondary/5 border border-app-accent-secondary/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-app-accent-secondary mb-1">
            {char2.hanja}
          </div>
          <div className="text-xs font-bold text-app-accent-secondary/80 mb-0.5">{char2.sinoViet}</div>
          <div className="text-xs text-app-text-muted">{char2.meaning}</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-app-card/50 rounded-xl p-4" style={{ borderLeftWidth: "3px", borderLeftColor: "var(--tw-colors-app-accent-primary)", borderLeftStyle: "solid" }}>
        <p className="text-sm text-app-text-secondary leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
}
