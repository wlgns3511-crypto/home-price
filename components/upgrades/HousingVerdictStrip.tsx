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
  /** getPeerStates().clusterLabel — 지리 클러스터. Demographia 버킷이 아니다. */
  peerClusterLabel?: string | null;
  hpi5yPct?: number | null;
}

export function HousingVerdictStrip({
  entityName,
  homeValueUsd,
  mortgage30Pct,
  medianIncomeUsd,
  peerClusterLabel,
  hpi5yPct,
}: Props) {
  const pti = priceToIncomeBand(homeValueUsd, medianIncomeUsd);
  const burden = mortgageBurdenDecoder(homeValueUsd, mortgage30Pct, medianIncomeUsd);
  const interp = buildInterpretation({
    pti,
    burden,
    peerClusterLabel,
    hpi5yPct,
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
        {/* 2026-07-26 — "· rank N/M" 삭제. rank 는 항상 null 이었고(getPeerStates 가 자기
            주를 peer 에서 제외), 이 배지의 라벨은 Demographia 버킷이 아니라 지리 클러스터다. */}
        {peerClusterLabel && (
          <span className="text-xs px-3 py-1 rounded-full border bg-slate-50 border-slate-300 text-slate-800">
            Peer cluster · {peerClusterLabel}
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
        {/* 2026-07-26 — "Path C hybrid coverage" 삭제: 그 하이브리드(도시·국가) 서피스는
            같은 날 전량 410 됐다. 남은 커버리지는 주 51개다. */}
        51 US jurisdictions
      </div>
    </section>
  );
}
