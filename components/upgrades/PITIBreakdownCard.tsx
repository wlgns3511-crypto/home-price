/**
 * PITIBreakdownCard — full Principal/Interest/Tax/Insurance + maintenance
 * decomposition of monthly cost on the state-median home, plus housing-to-income.
 */
import type { OwnershipBurdenFacts } from '@/lib/housing-landscape';
import { formatUsd, formatPercentPlain } from '@/lib/content-helpers';

export function PITIBreakdownCard({ facts, stateName }: { facts: OwnershipBurdenFacts; stateName: string }) {
  const total = facts.monthlyPITI;
  const slices = [
    { name: 'Principal & interest', val: facts.monthlyPI, color: 'bg-emerald-500' },
    { name: 'Property tax',         val: facts.monthlyTax, color: 'bg-indigo-500' },
    { name: 'Insurance',            val: facts.monthlyInsurance, color: 'bg-amber-500' },
    { name: 'Maintenance reserve',  val: facts.monthlyMaintenance, color: 'bg-slate-400' },
  ];

  return (
    <section className="my-6 rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          {stateName} monthly carrying cost — PITI + 1% maintenance
        </h3>
        <span className="text-xs text-slate-500">
          on {formatUsd(facts.loanPrincipal / 0.8)} median home, 20% down
        </span>
      </div>

      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-slate-500">Monthly total</div>
        <div className="text-3xl font-bold text-slate-900 tabular-nums">
          {formatUsd(total)}
          <span className="text-sm font-normal text-slate-500 ml-2">/ month</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Annualised: {formatUsd(facts.annualPITI)} — {formatPercentPlain(facts.pitiToIncomePct)} of state median income
        </div>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-slate-100">
        {slices.map(s => (
          <div
            key={s.name}
            className={s.color}
            style={{ width: `${(s.val / total) * 100}%` }}
            title={`${s.name}: ${formatUsd(s.val)}`}
          />
        ))}
      </div>

      <ul className="space-y-1.5 text-sm text-slate-700">
        {slices.map(s => (
          <li key={s.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-sm ${s.color}`} aria-hidden />
              {s.name}
            </span>
            <span className="tabular-nums font-medium">
              {formatUsd(s.val)} <span className="text-slate-400 text-xs">({((s.val / total) * 100).toFixed(0)}%)</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-500 leading-5">
        Down payment of 20% on the state median (${facts.downPayment20.toLocaleString('en-US')}).
        Property tax uses the Tax Foundation effective rate; insurance uses the NAIC HO-3
        average. Maintenance is a 1%-of-value rule of thumb; HOA, utilities, and PMI not included.
      </p>
    </section>
  );
}
