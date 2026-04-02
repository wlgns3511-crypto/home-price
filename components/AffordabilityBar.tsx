interface AffordabilityBarProps {
  price: number;
  income: number;
  nationalAvgRatio?: number;
}

export function AffordabilityBar({ price, income, nationalAvgRatio = 5.5 }: AffordabilityBarProps) {
  if (!income || income <= 0) return null;

  const ratio = price / income;
  const maxRatio = 20;
  const pct = Math.min((ratio / maxRatio) * 100, 100);
  const avgPct = Math.min((nationalAvgRatio / maxRatio) * 100, 100);

  const color =
    ratio <= 3 ? "#22c55e" : ratio <= 4 ? "#84cc16" : ratio <= 5 ? "#f59e0b" : ratio <= 7 ? "#f97316" : "#ef4444";

  const label =
    ratio <= 3 ? "Affordable" : ratio <= 5 ? "Moderate" : ratio <= 7 ? "Stretched" : "Unaffordable";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6">
      <h3 className="text-lg font-bold mb-1">Affordability Index</h3>
      <p className="text-xs text-slate-400 mb-4">Price-to-income ratio (lower is better)</p>

      <div className="relative">
        {/* Bar */}
        <div className="bg-slate-100 rounded-full h-7 overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2"
            style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: color }}
          >
            <span className="text-white text-xs font-bold">{ratio.toFixed(1)}x</span>
          </div>
        </div>

        {/* National avg marker */}
        <div
          className="absolute top-0 h-7 flex items-center"
          style={{ left: `${avgPct}%` }}
        >
          <div className="w-0.5 h-full bg-slate-800" />
        </div>
        <div
          className="absolute -bottom-5 text-xs text-slate-500 whitespace-nowrap"
          style={{ left: `${avgPct}%`, transform: "translateX(-50%)" }}
        >
          National avg {nationalAvgRatio.toFixed(1)}x
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <span className="text-xs text-slate-400">0x</span>
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
        <span className="text-xs text-slate-400">{maxRatio}x</span>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span>Home: ${(price / 1000).toFixed(0)}K</span>
        <span>Income: ${(income / 1000).toFixed(0)}K/yr</span>
        <span>Years to buy: {ratio.toFixed(1)}</span>
      </div>
    </div>
  );
}
