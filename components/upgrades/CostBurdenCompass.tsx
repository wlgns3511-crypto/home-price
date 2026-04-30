/**
 * CostBurdenCompass — HUD 30%-of-income threshold view, owners + renters,
 * with national rank and severity classification.
 */
import type { CostBurdenFacts } from '@/lib/housing-landscape';

const SEVERITY_COLOR: Record<CostBurdenFacts['burdenSeverity'], string> = {
  'low': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'moderate': 'text-amber-700 bg-amber-50 border-amber-200',
  'high': 'text-orange-700 bg-orange-50 border-orange-200',
  'severe': 'text-rose-700 bg-rose-50 border-rose-200',
};

const SEVERITY_LABEL: Record<CostBurdenFacts['burdenSeverity'], string> = {
  'low': 'Low cost burden',
  'moderate': 'Moderate cost burden',
  'high': 'High cost burden',
  'severe': 'Severe cost burden',
};

export function CostBurdenCompass({ facts, stateName, totalStates }: { facts: CostBurdenFacts; stateName: string; totalStates: number }) {
  return (
    <section className="my-6 rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          {stateName} cost burden — HUD 30% threshold
        </h3>
        <span className={`text-xs px-2 py-1 rounded border ${SEVERITY_COLOR[facts.burdenSeverity]}`}>
          {SEVERITY_LABEL[facts.burdenSeverity]}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <BurdenColumn
          title="Mortgaged owners"
          pct={facts.ownerPct}
          rank={facts.ownerNationalRank}
          totalStates={totalStates}
          color="emerald"
          source="Census ACS B25091"
        />
        <BurdenColumn
          title="Renters"
          pct={facts.renterPct}
          rank={facts.renterNationalRank}
          totalStates={totalStates}
          color="indigo"
          source="Census ACS B25070"
        />
      </div>

      <p className="mt-4 text-xs text-slate-500 leading-5">
        HUD defines a household as "cost-burdened" when housing costs exceed 30% of gross
        income, "severely burdened" when they exceed 50%. Both metrics here use ACS 2023
        5-Year estimates. Renter share is consistently higher than owner share nationwide
        (gap: {Math.abs(facts.ownerVsRenterDelta).toFixed(1)} pp here).
      </p>
    </section>
  );
}

function BurdenColumn({
  title, pct, rank, totalStates, color, source,
}: {
  title: string;
  pct: number;
  rank: number;
  totalStates: number;
  color: 'emerald' | 'indigo';
  source: string;
}) {
  const fillCls = color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500';
  return (
    <div className="rounded-lg border border-slate-100 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        <span className="text-xs text-slate-500 tabular-nums">#{rank} of {totalStates}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums text-slate-900 mb-2">
        {pct.toFixed(1)}%
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${fillCls}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className="mt-2 text-[11px] text-slate-500">{source}</div>
    </div>
  );
}
