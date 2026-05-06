/**
 * affordability-cluster.ts — Demographia bucket rank within peer cluster.
 *
 * Unique HomePricePeek lever: applies the Demographia annual-report
 * affordability buckets to the full 194-city DB (not just the 92 metros
 * Demographia themselves track) and computes the rank of each city WITHIN
 * its bucket. This converts a flat "X.X price-to-income" number into
 * "rank N of M among Severely Unaffordable cities", which is the only
 * comparison most readers actually use.
 *
 * Pure TypeScript — deterministic, reads from DB columns only, no fetch,
 * no synthetic noise, no LLM prose. The verbatim source of this file is
 * embedded on /methodology/ as a transparency lever.
 */

export type DemographiaBucket =
  | 'affordable'
  | 'moderately-unaffordable'
  | 'seriously-unaffordable'
  | 'severely-unaffordable';

export interface ClusterInputCity {
  slug: string;
  name: string;
  country: string;
  avg_home_price_usd: number | null;
  median_income_usd: number | null;
  price_to_income_ratio: number | null;
}

export interface ClusterRankResult {
  slug: string;
  pir: number;
  bucket: DemographiaBucket;
  bucketLabel: string;
  rankInBucket: number;          // 1 = least painful inside the bucket
  bucketSize: number;
  pirVsBucketMedian: number;     // (pir / bucketMedian) - 1, rounded to 3 d.p.
  globalRank: number;            // 1 = least painful overall (lowest PIR)
  globalSize: number;
}

const BUCKET_LABEL: Record<DemographiaBucket, string> = {
  'affordable': 'Affordable (PIR < 3)',
  'moderately-unaffordable': 'Moderately Unaffordable (3 ≤ PIR < 4)',
  'seriously-unaffordable': 'Seriously Unaffordable (4 ≤ PIR < 5)',
  'severely-unaffordable': 'Severely Unaffordable (PIR ≥ 5)',
};

export function bucketFor(pir: number): DemographiaBucket {
  if (pir < 3.0) return 'affordable';
  if (pir < 4.0) return 'moderately-unaffordable';
  if (pir < 5.0) return 'seriously-unaffordable';
  return 'severely-unaffordable';
}

export function bucketLabelFor(b: DemographiaBucket): string {
  return BUCKET_LABEL[b];
}

function effectivePir(c: ClusterInputCity): number | null {
  if (c.price_to_income_ratio !== null && c.price_to_income_ratio > 0) {
    return c.price_to_income_ratio;
  }
  if (c.avg_home_price_usd && c.median_income_usd && c.median_income_usd > 0) {
    return c.avg_home_price_usd / c.median_income_usd;
  }
  return null;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

/**
 * Compute rank-within-bucket for every city that has a usable PIR.
 * Cities without a PIR (no income, no price) are excluded from the result map.
 */
export function rankCluster(cities: ClusterInputCity[]): Map<string, ClusterRankResult> {
  const usable = cities
    .map((c) => ({ city: c, pir: effectivePir(c) }))
    .filter((x): x is { city: ClusterInputCity; pir: number } => x.pir !== null);

  // Global rank: least painful PIR first.
  const globalSorted = [...usable].sort((a, b) => a.pir - b.pir);
  const globalRankBySlug = new Map<string, number>();
  globalSorted.forEach(({ city }, i) => globalRankBySlug.set(city.slug, i + 1));

  // Bucket grouping.
  const byBucket = new Map<DemographiaBucket, { city: ClusterInputCity; pir: number }[]>();
  for (const x of usable) {
    const b = bucketFor(x.pir);
    if (!byBucket.has(b)) byBucket.set(b, []);
    byBucket.get(b)!.push(x);
  }

  const result = new Map<string, ClusterRankResult>();
  for (const [bucket, members] of byBucket.entries()) {
    const sortedAsc = [...members].sort((a, b) => a.pir - b.pir);
    const med = median(sortedAsc.map((x) => x.pir));
    sortedAsc.forEach(({ city, pir }, i) => {
      result.set(city.slug, {
        slug: city.slug,
        pir: Number(pir.toFixed(2)),
        bucket,
        bucketLabel: BUCKET_LABEL[bucket],
        rankInBucket: i + 1,
        bucketSize: sortedAsc.length,
        pirVsBucketMedian: Number(((pir / med) - 1).toFixed(3)),
        globalRank: globalRankBySlug.get(city.slug) ?? 0,
        globalSize: usable.length,
      });
    });
  }

  return result;
}

/**
 * Format a single cluster rank result for surfaces. Returns null if the
 * city has no usable PIR (i.e. excluded from the rank map).
 */
export function formatClusterLine(r: ClusterRankResult, cityName: string): string {
  const direction = r.pirVsBucketMedian >= 0 ? 'above' : 'below';
  const pct = Math.abs(r.pirVsBucketMedian * 100).toFixed(1);
  return (
    `${cityName} sits at PIR ${r.pir.toFixed(2)} — rank ${r.rankInBucket} of ${r.bucketSize} ` +
    `inside the ${r.bucketLabel} cluster, ${pct}% ${direction} the bucket median. ` +
    `Globally: rank ${r.globalRank} of ${r.globalSize} for least-painful price-to-income.`
  );
}
