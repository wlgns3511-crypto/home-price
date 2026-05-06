/**
 * ClusterRankCard — Demographia bucket cluster rank for one city.
 *
 * Reads from rankCluster() output (lib/affordability-cluster.ts). Pure SSR.
 * Surfaces "rank N of M inside the bucket" — the unique HomePricePeek lever
 * documented verbatim on /methodology/.
 */
import type { ClusterRankResult } from '@/lib/affordability-cluster';

const BUCKET_TONE: Record<ClusterRankResult['bucket'], { bg: string; border: string; text: string; pill: string }> = {
  'affordable': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', pill: 'bg-emerald-500' },
  'moderately-unaffordable': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', pill: 'bg-amber-500' },
  'seriously-unaffordable': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', pill: 'bg-orange-500' },
  'severely-unaffordable': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', pill: 'bg-rose-500' },
};

export function ClusterRankCard({ rank, cityName }: { rank: ClusterRankResult; cityName: string }) {
  const tone = BUCKET_TONE[rank.bucket];
  const direction = rank.pirVsBucketMedian >= 0 ? 'above' : 'below';
  const pct = Math.abs(rank.pirVsBucketMedian * 100);
  const fillPct = Math.min(100, Math.max(2, ((rank.bucketSize - rank.rankInBucket + 1) / rank.bucketSize) * 100));

  return (
    <section className={`my-6 rounded-xl border ${tone.border} ${tone.bg} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className={`text-base font-semibold ${tone.text}`}>
          {cityName} inside the {rank.bucketLabel} cluster
        </h3>
        <span className="text-xs text-slate-500">Demographia bucket rank · DB-wide cluster</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Fact label="Price-to-income" value={rank.pir.toFixed(2)} />
        <Fact label="Rank in bucket" value={`${rank.rankInBucket} of ${rank.bucketSize}`} />
        <Fact label="Bucket median" value={`${pct.toFixed(1)}% ${direction}`} />
        <Fact label="Global rank" value={`${rank.globalRank} of ${rank.globalSize}`} />
      </div>

      <div className="relative h-2 bg-white/70 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${tone.pill}`} style={{ width: `${fillPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Highest in bucket</span>
        <span>Lowest in bucket</span>
      </div>

      <p className="mt-4 text-sm text-slate-700">
        Among the {rank.bucketSize} cities in the &ldquo;{rank.bucketLabel}&rdquo; cluster, {cityName}{' '}
        ranks {rank.rankInBucket}. PIR is {pct.toFixed(1)}% {direction} the cluster median. The full
        cluster-rank algorithm is documented verbatim on{' '}
        <a href="/methodology/" className="underline hover:text-slate-900">
          /methodology/
        </a>
        .
      </p>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-lg p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-base font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}
