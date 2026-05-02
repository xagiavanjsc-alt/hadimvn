interface BarData {
  label: string;
  value: number;
}

interface MiniBarChartProps {
  data: BarData[];
  color: string;
  height?: number;
}

export default function MiniBarChart({ data, color, height = 40 }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full rounded-sm transition-all"
            style={{
              height: `${Math.max((d.value / max) * height, d.value > 0 ? 3 : 1)}px`,
              backgroundColor: d.value > 0 ? color : "rgba(255,255,255,0.05)",
            }}
          />
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-app-border text-white/70 text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {d.label}: {d.value}
          </div>
        </div>
      ))}
    </div>
  );
}
