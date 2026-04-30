/**
 * PIRGauge — Demographia-style affordability gauge.
 * Pure SSR; no client state, no animation. Reads facts from getAffordabilityIndex.
 */
import type { AffordabilityFacts } from '@/lib/housing-landscape';

const BUCKET_COLOR: Record<AffordabilityFacts['bucket'], string> = {
  'affordable': 'bg-emerald-500',
  'moderately-unaffordable': 'bg-amber-500',
  'seriously-unaffordable': 'bg-orange-500',
  'severely-unaffordable': 'bg-rose-500',
};

const BUCKET_RANGE: Record<AffordabilityFacts['bucket'], string> = {
  'affordable': 'PIR < 3.0',
  'moderately-unaffordable': '3.0 ≤ PIR < 4.0',
  'seriously-unaffordable': '4.0 ≤ PIR < 5.0',
  'severely-unaffordable': 'PIR ≥ 5.0',
};

export function PIRGauge({ facts, stateName }: { facts: AffordabilityFacts; stateName: string }) {
  // Display range capped at 8 for visual; mark continues to render at 100% for >8.
  const maxPir = 8;
  const fillPct = Math.min(100, (facts.pir / maxPir) * 100);
  const ticks = [3.0, 4.0, 5.0];

  return (
    <section className="my-6 rounded-xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          {stateName} price-to-income ratio
        </h3>
        <span className="text-xs text-slate-500">
          Demographia 2024 framework — {BUCKET_RANGE[facts.bucket]}
        </span>
      </div>

      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${BUCKET_COLOR[facts.bucket]} rounded-full transition-all`}
          style={{ width: `${fillPct}%` }}
        />
        {ticks.map(tick => {
          const left = (tick / maxPir) * 100;
          return (
            <span
              key={tick}
              className="absolute top-0 h-full w-px bg-slate-400"
              style={{ left: `${left}%` }}
              aria-hidden
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-500 tabular-nums">
        <span>0</span>
        <span>3.0</span>
        <span>4.0</span>
        <span>5.0</span>
        <span>{maxPir.toFixed(1)}+</span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">PIR</div>
          <div className="font-semibold text-slate-900 tabular-nums">{facts.pir.toFixed(2)}×</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Bucket</div>
          <div className="font-semibold text-slate-900">{facts.bucketLabel}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Stretch rank</div>
          <div className="font-semibold text-slate-900 tabular-nums">
            #{facts.rankAmongStates} of {facts.totalStates}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">vs Median state</div>
          <div className="font-semibold text-slate-900 tabular-nums">
            {(facts.pirVsNational * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 leading-5">
        Median multiple = home price ÷ household income. The Demographia survey defines
        ≥5.0 as "Severely Unaffordable" and &lt;3.0 as "Affordable". This is a structural
        snapshot, not advice on whether to buy.
      </p>
    </section>
  );
}
