/**
 * MortgageDeltaCard — translates rate changes into $/month deltas for the
 * state-median home loan. Anchored to FRED MORTGAGE30US.
 */
import type { MortgageDeltaFacts } from '@/lib/housing-landscape';
import { formatUsd, formatUsdCompact } from '@/lib/content-helpers';

export function MortgageDeltaCard({ facts, stateName }: { facts: MortgageDeltaFacts; stateName: string }) {
  return (
    <section className="my-6 rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          What a 1% rate move costs in {stateName}
        </h3>
        <span className="text-xs text-slate-500">FRED MORTGAGE30US benchmark</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Fact label="Loan principal" value={formatUsd(facts.loanPrincipal)} />
        <Fact label="Current rate" value={`${facts.ratePct.toFixed(2)}%`} />
        <Fact label="Monthly P&I" value={`${formatUsd(facts.monthlyPI)}/mo`} />
        <Fact label="30-yr interest" value={formatUsdCompact(facts.totalInterest30yr)} />
      </div>

      <div className="border-t border-slate-100 pt-4 mt-2">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Sensitivity</div>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li className="flex justify-between">
            <span>Rate climbs 1.00 pp</span>
            <span className="font-semibold text-rose-700 tabular-nums">+{formatUsd(facts.per1PctRise)}/mo</span>
          </li>
          <li className="flex justify-between">
            <span>Rate climbs 0.25 pp</span>
            <span className="font-semibold text-amber-700 tabular-nums">+{formatUsd(facts.per25BpRise)}/mo</span>
          </li>
          <li className="flex justify-between">
            <span>Rate falls 1.00 pp</span>
            <span className="font-semibold text-emerald-700 tabular-nums">−{formatUsd(facts.per1PctFall)}/mo</span>
          </li>
        </ul>
      </div>

      <p className="mt-3 text-xs text-slate-500 leading-5">
        Based on a 30-year fixed-rate loan with 20% down on the state median price. Lender
        quotes vary; this is a translation of headline rate moves, not a refinance recommendation.
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
