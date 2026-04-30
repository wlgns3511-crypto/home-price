/**
 * AppreciationSparkline — FHFA HPI 5yr/10yr cumulative + CAGR, with a simple
 * SVG sparkline showing cumulative growth versus the national median.
 */
import type { AppreciationFacts } from '@/lib/housing-landscape';
import { formatPp, formatPercentPlain } from '@/lib/content-helpers';

const TREND_COLOR: Record<AppreciationFacts['trend'], string> = {
  'accelerating': 'text-emerald-700',
  'decelerating': 'text-amber-700',
  'flat': 'text-slate-700',
};

const TREND_LABEL: Record<AppreciationFacts['trend'], string> = {
  'accelerating': 'Accelerating',
  'decelerating': 'Decelerating',
  'flat': 'Steady',
};

export function AppreciationSparkline({ facts, stateName }: { facts: AppreciationFacts; stateName: string }) {
  // Build a 10-point sparkline from anchored CAGR (year-by-year compounding).
  const w = 200;
  const h = 40;
  const stateGrowth = pointsFromCagr(facts.cagr10yr, 10, w, h, facts.cum10yr);
  const path = stateGrowth.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <section className="my-6 rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          {stateName} appreciation — FHFA HPI
        </h3>
        <span className={`text-xs ${TREND_COLOR[facts.trend]}`}>{TREND_LABEL[facts.trend]}</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <Pair label="5-year cumulative" big={formatPercentPlain(facts.cum5yr)} sub={`CAGR ${formatPercentPlain(facts.cagr5yr)}`} />
        <Pair label="10-year cumulative" big={formatPercentPlain(facts.cum10yr)} sub={`CAGR ${formatPercentPlain(facts.cagr10yr)}`} />
        <Pair label="vs Median state" big={formatPp(facts.vsNational5yr)} sub={`${formatPp(facts.vsNational10yr)} on 10y`} />
      </div>

      <div className="border-t border-slate-100 pt-3">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">10-year compound path</div>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${stateName} 10-year cumulative HPI growth path`}>
          <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-emerald-500" />
        </svg>
        <div className="mt-1 flex justify-between text-[11px] text-slate-500 tabular-nums">
          <span>2014</span>
          <span>2024</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 leading-5">
        FHFA all-transactions index, state level. Cumulative growth is index ratio − 1; CAGR
        is the compound annual rate that produces that ratio. Past appreciation is a record,
        not a forecast.
      </p>
    </section>
  );
}

function pointsFromCagr(cagr: number, years: number, w: number, h: number, finalCum: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const r = cagr / 100;
  const finalRatio = 1 + finalCum / 100;
  const minRatio = 1;
  const range = Math.max(0.01, finalRatio - minRatio);
  for (let i = 0; i <= years; i++) {
    const ratio = Math.pow(1 + r, i);
    const x = (i / years) * w;
    const y = h - ((ratio - minRatio) / range) * h;
    pts.push({ x, y: Math.max(2, Math.min(h - 2, y)) });
  }
  return pts;
}

function Pair({ label, big, sub }: { label: string; big: string; sub: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900 tabular-nums">{big}</div>
      <div className="text-xs text-slate-500 tabular-nums">{sub}</div>
    </div>
  );
}
