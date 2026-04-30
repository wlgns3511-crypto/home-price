/**
 * BuyVsRentCrossover — visual breakeven year display + assumptions list.
 * Cumulative-cost model only; excludes appreciation, deductions, opportunity cost.
 */
import type { CrossoverFacts } from '@/lib/housing-landscape';
import { formatUsd } from '@/lib/content-helpers';

export function BuyVsRentCrossover({ facts, stateName }: { facts: CrossoverFacts; stateName: string }) {
  const yr = facts.cappedAt30 ? 30 : facts.crossoverYr;
  const fillPct = (yr / 30) * 100;

  return (
    <section className="my-6 rounded-xl border border-slate-200 p-5 bg-gradient-to-br from-blue-50/40 to-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          Buy-vs-rent cumulative-cost crossover
        </h3>
        <span className="text-xs text-slate-500">{stateName} median, simple model</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Fact label="Crossover year" value={facts.cappedAt30 ? '> 30 yrs' : `Year ${facts.crossoverYr}`} />
        <Fact label="Month 1 PITI" value={`${formatUsd(facts.monthlyPITI)}/mo`} />
        <Fact label="Month 1 rent" value={`${formatUsd(facts.estimatedMonthlyRent)}/mo`} />
      </div>

      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full ${facts.cappedAt30 ? 'bg-slate-300' : 'bg-blue-500'}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
        <span>Year 0</span>
        <span>Year 15</span>
        <span>Year 30 (loan term)</span>
      </div>

      <details className="mt-4 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700">Model assumptions</summary>
        <ul className="mt-2 space-y-1 pl-4 list-disc leading-5">
          <li>20% down, 30-year fixed at the FRED weekly average rate</li>
          <li>Annual rent = 6% of home price (US price-to-rent ≈ 16.7)</li>
          <li>Rent inflates 3.0%/yr; ownership ancillary cost escalates 2.5%/yr</li>
          <li>1% of home value as annual maintenance reserve</li>
          <li>Excludes capital appreciation, mortgage-interest deduction, transaction cost, opportunity cost</li>
        </ul>
      </details>

      <p className="mt-3 text-xs text-slate-500 leading-5">
        The crossover answers "after how many years does cumulative ownership outflow drop
        below cumulative rent?" — not "should I buy?". Add appreciation back in and the
        crossover usually moves earlier; subtract a major repair year and it moves later.
      </p>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-semibold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}
