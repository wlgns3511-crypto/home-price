import {
  priceToIncomeBand,
  priceToIncomeToneClasses,
} from '@/lib/price-to-income-band';
import {
  mortgageBurdenDecoder,
  mortgageBurdenToneClasses,
} from '@/lib/mortgage-burden-decoder';
import {
  buildInterpretation,
  verdictToneClasses,
} from '@/lib/homepricepeek-interpretation';
import Link from 'next/link';

interface Props {
  entityName: string;
  homeValueUsd: number | null | undefined;
  mortgage30Pct: number | null | undefined;
  medianIncomeUsd: number | null | undefined;
  bucketLabel?: string | null;
  bucketRank?: number | null;
  bucketSize?: number | null;
  hpi5yPct?: number | null;
  scope?: 'us' | 'intl';
}

export function HousingVerdictStrip({
  entityName,
  homeValueUsd,
  mortgage30Pct,
  medianIncomeUsd,
  bucketLabel,
  bucketRank,
  bucketSize,
  hpi5yPct,
  scope = 'us',
}: Props) {
  const pti = priceToIncomeBand(homeValueUsd, medianIncomeUsd);
  const burden = mortgageBurdenDecoder(homeValueUsd, mortgage30Pct, medianIncomeUsd);
  const interp = buildInterpretation({
    pti,
    burden,
    bucketLabel,
    bucketRank,
    bucketSize,
    hpi5yPct,
    scope,
  });

  if (!interp) return null;

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
        Housing Affordability Verdict
      </div>
      <h2 className={`text-2xl font-bold mb-2 rounded-lg inline-block px-3 py-1 border ${verdictToneClasses(interp.verdict)}`}>
        {entityName}: {interp.headlineLabel}
      </h2>
      <p className="text-sm leading-6 text-slate-700 mb-4 max-w-3xl">{interp.shortLine}</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {pti && (
          <span className={`text-xs px-3 py-1 rounded-full border ${priceToIncomeToneClasses(pti.tier)}`}>
            Price-to-Income · {pti.shortLabel} ({pti.ratio.toFixed(2)})
          </span>
        )}
        {burden && (
          <span className={`text-xs px-3 py-1 rounded-full border ${mortgageBurdenToneClasses(burden.cfpbTier)}`}>
            Mortgage Burden · {burden.shortLabel} ({(burden.burdenRatio * 100).toFixed(1)}%)
          </span>
        )}
        {bucketLabel && bucketRank && bucketSize && (
          <span className="text-xs px-3 py-1 rounded-full border bg-slate-50 border-slate-300 text-slate-800">
            {bucketLabel} cluster · rank {bucketRank}/{bucketSize}
          </span>
        )}
      </div>

      <div className="space-y-3 max-w-3xl">
        {interp.paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-6 text-slate-700">{p}</p>
        ))}
      </div>

      <div className="mt-5 text-xs text-slate-500 leading-5">
        Methodology:{' '}
        Price-to-Income Band
        {' · '}
        Mortgage Burden Decoder
        {' · '}
        5-bucket synthesis
        {' · '}
        Path C hybrid coverage
      </div>
    </section>
  );
}
