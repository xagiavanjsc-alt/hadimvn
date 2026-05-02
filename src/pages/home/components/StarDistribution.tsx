interface Lesson {
  stars?: number;
}

interface StarDistributionProps {
  lessons: Lesson[];
}

export default function StarDistribution({ lessons }: StarDistributionProps) {
  const total = lessons.length;
  const dist = [1, 2, 3, 4, 5].map((s) => ({
    stars: s,
    count: lessons.filter((l) => l.stars === s).length,
  }));
  const highQuality = lessons.filter((l) => (l.stars ?? 0) >= 4).length;
  const pct = total > 0 ? Math.round((highQuality / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="text-center py-4 text-app-text-muted text-xs">
        Chưa có bài nào được đánh sao
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dist.map((d) => {
        const barPct = total > 0 ? (d.count / total) * 100 : 0;
        return (
          <div key={d.stars} className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <i
                  key={s}
                  className={`text-[9px] ${
                    s <= d.stars ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/10"
                  }`}
                />
              ))}
            </div>
            <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${barPct}%`,
                  backgroundColor:
                    d.stars >= 4 ? "app-accent-primary" : d.stars >= 3 ? "#fb923c" : "rgba(255,255,255,0.2)",
                }}
              />
            </div>
            <span className="text-app-text-secondary text-[10px] w-6 text-right flex-shrink-0">
              {d.count}
            </span>
          </div>
        );
      })}
      <div className="pt-2 border-t border-app-border flex items-center justify-between">
        <span className="text-app-text-muted text-[10px]">Bài 4-5 sao (ebook-ready)</span>
        <span className="text-app-accent-primary text-xs font-bold">{pct}%</span>
      </div>
    </div>
  );
}
