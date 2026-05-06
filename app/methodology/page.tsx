import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { webPageSchema, datasetSchema } from "@/lib/schema";
import { AuthorBox } from "@/components/AuthorBox";
import {
  METHODOLOGY_REVIEWED,
  SOURCE_AUTHORITIES,
  ENTITY_VINTAGE,
} from "@/lib/authorship";

const c = siteConfig;
const desc =
  "How HomePricePeek sources, reconciles, and ranks global housing data. Documents every algorithmic step (Demographia bucket cluster rank, mortgage-rate sensitivity, buy-vs-rent crossover) verbatim, with named public sources and no relabelled freshness.";

export const metadata: Metadata = {
  title: "Methodology — How HomePricePeek Builds Its Housing Data",
  description: desc,
  alternates: { canonical: "/methodology/" },
  openGraph: { title: "Methodology", description: desc, url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema("Methodology", desc, "/methodology/")),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datasetSchema(
              `${c.name} — Housing data index`,
              "City- and state-level housing affordability metrics derived from OECD price-to-income series, Census ACS housing tables, FHFA HPI, FRED MORTGAGE30US, and named national statistics offices.",
              "/methodology/",
            ),
          ),
        }}
      />
      <h1>Methodology</h1>
      <p className="text-sm text-slate-500 mb-2">
        Section reviewed: <time dateTime={METHODOLOGY_REVIEWED}>{METHODOLOGY_REVIEWED}</time>
      </p>
      <p className="lead text-lg text-slate-600">
        Buying or renting is the largest financial decision most households make. This page
        documents exactly where every published number on {c.name} comes from, what we
        compute on top of it, and what it cannot tell you about your specific situation.
      </p>

      <div className="not-prose border-l-4 border-amber-400 bg-amber-50 p-4 my-6 rounded-r">
        <p className="text-sm text-amber-900 m-0">
          <strong>Scope split.</strong> {c.name} runs a hybrid scope. For the United States we
          carry deep state-level coverage (51 states + DC, 18 anchored fields per state) and a
          smaller curated set of major metros. Internationally we carry broad city coverage (159
          cities, 97 countries) at lower per-city depth. Each surface labels its source on page
          rather than presenting a single global dataset.
        </p>
      </div>

      <h2>1. Primary sources</h2>
      <p>
        Every published metric is anchored to one of the following organisations. Where a metric
        is derived (price-to-income ratio, buy-vs-rent crossover year, cluster rank, mortgage-rate
        sensitivity), the underlying anchored input is named on page.
      </p>
      <ul>
        {SOURCE_AUTHORITIES.map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>{" "}
            — {s.role}.
          </li>
        ))}
      </ul>
      <p>
        We do not relabel data with a fresher year than the underlying source publishes. The
        OECD price-to-income series, for example, is anchored to its own release vintage; the
        page surface anchors to the most recent ingestion of that vintage. Each section of the
        site carries its own vintage — entity (DB rebuild), methodology (this page), about,
        legal — rather than a single site-wide &ldquo;today&rdquo; cluster.
      </p>

      <h2>2. The metrics we publish (and what they mean)</h2>
      <p>For each city or state we publish a subset of these fields:</p>
      <ul>
        <li>
          <strong>Average home price (USD).</strong> Midpoint of single-family transactions in
          the metro/state. For US states this is anchored to Zillow ZHVI and FHFA HPI; for
          international cities to OECD national price indices and named national statistics
          offices.
        </li>
        <li>
          <strong>Price per square metre (USD).</strong> Useful when comparing across countries
          with very different unit conventions and home sizes.
        </li>
        <li>
          <strong>Average rent (1BR and 3BR, USD).</strong> Asking rent for a representative
          apartment, drawn from OECD rent-to-income series and ACS B25064 where applicable.
        </li>
        <li>
          <strong>Price-to-income ratio (PIR).</strong> Average home price divided by median
          household annual income. The Demographia annual report buckets PIR as Affordable
          (&lt;3), Moderately (3–4), Seriously (4–5), and Severely (≥5) Unaffordable. We use
          the same bucket boundaries.
        </li>
        <li>
          <strong>Mortgage rate (US).</strong> The current FRED MORTGAGE30US benchmark. This
          is a national average for prime-credit borrowers, not your individual rate.
        </li>
        <li>
          <strong>1-year price change.</strong> Year-over-year appreciation or depreciation
          measured in local currency where the underlying source publishes a national index,
          to reduce FX noise.
        </li>
        <li>
          <strong>Cost-burdened share (US states only).</strong> ACS B25091 (owners) and
          B25070 (renters) — the share of households spending ≥30% of gross income on housing.
        </li>
      </ul>

      <h2>3. Demographia bucket cluster rank — our unique lever</h2>
      <p>
        A flat &ldquo;PIR is 8.4&rdquo; number is hard to interpret on its own. The same number
        means very different things in Hong Kong (typical of the cluster) versus a US Sun-Belt
        metro (a severe outlier). On every city page we publish a <em>rank within the
        Demographia bucket</em>: where this city sits among its peer cluster, and how it
        compares to the bucket median. This is computed deterministically in TypeScript at build
        time over the entire {c.name} city DB; the verbatim source is reproduced below so you
        can audit the calculation yourself.
      </p>
      <p>
        The function takes the full DB as input, computes an effective PIR for each row (using
        the explicit ratio when available, otherwise <code>price ÷ income</code>), buckets
        cities by Demographia thresholds, and ranks each bucket internally by ascending PIR. It
        also produces a global rank across the full DB. The same code path produces the rank
        you see on every city page.
      </p>
      <pre className="not-prose overflow-x-auto bg-slate-900 text-slate-100 text-xs leading-relaxed p-4 rounded-lg my-6"><code>{`export type DemographiaBucket =
  | 'affordable'
  | 'moderately-unaffordable'
  | 'seriously-unaffordable'
  | 'severely-unaffordable';

export function bucketFor(pir: number): DemographiaBucket {
  if (pir < 3.0) return 'affordable';
  if (pir < 4.0) return 'moderately-unaffordable';
  if (pir < 5.0) return 'seriously-unaffordable';
  return 'severely-unaffordable';
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
}`}</code></pre>
      <p>
        This is the entire algorithm. There are no magic constants beyond the published
        Demographia bucket boundaries. There are no LLM-generated weights, no hidden trend
        factors, no time-decay smoothing. The output is a function of the DB at build time and
        nothing else.
      </p>

      <h2>4. Other derived metrics</h2>
      <p>
        For US-state pages we additionally compute:
      </p>
      <ul>
        <li>
          <strong>Mortgage cost delta.</strong> What a 1.0pp / 0.25pp move in MORTGAGE30US
          costs the median home loan in this state, expressed as $/month and as 30-year
          interest. The principal is taken as 80% of the state median home price.
        </li>
        <li>
          <strong>Buy-vs-rent crossover year.</strong> The year in which cumulative ownership
          cost (P&amp;I + property tax + insurance + 1% maintenance reserve) and cumulative rent
          paid converge. Excludes appreciation, tax deductions, and opportunity cost of the
          down payment — a deliberately simple model whose limitations are stated on page.
        </li>
        <li>
          <strong>Cost-burden compass.</strong> HUD&apos;s 30%-of-income threshold applied to
          ACS B25091 (owners) and B25070 (renters) for the state, with national rank and
          severity classification.
        </li>
        <li>
          <strong>Appreciation sparkline.</strong> 5-year and 10-year cumulative price growth
          and CAGR derived from FHFA HPI, with a small SVG showing the year-by-year compounding
          path.
        </li>
        <li>
          <strong>PITI breakdown.</strong> Principal, interest, property tax, insurance, and a
          1% maintenance reserve, rendered as a stacked bar so the relative weight of carrying
          costs is visible at a glance.
        </li>
      </ul>

      <h2>5. Currency and inflation</h2>
      <p>
        All international prices are normalised to USD using market exchange rates as of the
        underlying release date. Cross-country comparison is the dominant use case, so USD
        normalisation is the natural choice. The trade-off is that countries with rapidly
        depreciating currencies will show suppressed USD prices that do not reflect domestic
        affordability; for purchasing decisions in your home country, prefer the local
        statistics office&apos;s native-currency series.
      </p>

      <h2>6. What we don&apos;t do</h2>
      <ul>
        <li>
          <strong>We don&apos;t forecast.</strong> No model on this site predicts prices forward
          beyond the most recent observed value. Headlines like &ldquo;Where prices will go in
          2027&rdquo; are not part of the surface.
        </li>
        <li>
          <strong>We don&apos;t auto-generate per-page commentary with an LLM.</strong> The
          per-city &ldquo;insight&rdquo; sentences are template-fills against numeric
          thresholds (e.g. &ldquo;ratio &gt; 10 → unaffordable language&rdquo;) — the
          source-of-truth is the data, and the templates are auditable in
          <code>lib/insights.ts</code>.
        </li>
        <li>
          <strong>We don&apos;t pretend to be a multiple-listing service.</strong> Our prices
          are statistical aggregates, not listings. For an actual purchase decision, work with a
          licensed local realtor or appraiser.
        </li>
        <li>
          <strong>We don&apos;t claim certification backing.</strong> No CFP, MLO, or appraisal
          credential underwrites these pages. The team behind {c.name} is an editorial team that
          curates public housing data.
        </li>
        <li>
          <strong>We don&apos;t relabel a corpus year with a fresher one.</strong> If the
          underlying source is OECD 2024Q4, we do not re-stamp it as 2026.
        </li>
      </ul>

      <h2>7. Update cadence</h2>
      <p>
        OECD housing price indices update quarterly. US Census ACS publishes 5-year tables
        annually with a 12-18 month lag. FHFA HPI updates quarterly. FRED MORTGAGE30US updates
        weekly. We re-ingest each source on its own publication cadence, then rebuild and
        re-deploy the site.
      </p>
      <p>
        The current entity vintage on this site is{" "}
        <code>{ENTITY_VINTAGE}</code> (DB rebuild). The methodology page itself was last
        reviewed{" "}
        <code>{METHODOLOGY_REVIEWED}</code>. These two anchors evolve independently — the
        DB can be rebuilt without changing how the math works, and the math can be revised
        without changing the underlying data.
      </p>

      <h2>8. Limitations you should know about</h2>
      <ul>
        <li>
          <strong>Metro-level resolution.</strong> Prices are at metropolitan or state level,
          not neighbourhood. Within a large metro, prices can vary by 3–5× between
          neighbourhoods.
        </li>
        <li>
          <strong>Average vs. median.</strong> When sources publish only averages, we use them.
          Averages skew upward with a few high-end transactions; the median is generally a
          more honest &ldquo;what would I actually pay?&rdquo; number, and we prefer it where
          available.
        </li>
        <li>
          <strong>Mortgage rate ≠ your rate.</strong> The published 30-year benchmark assumes
          strong credit and a standard down payment. Your individual rate depends on credit
          score, debt-to-income ratio, loan size, and lender margin.
        </li>
        <li>
          <strong>Carrying costs not in the headline.</strong> The headline price excludes
          closing costs (2–5%), property tax, insurance, HOA, and maintenance. The PITI
          breakdown card on US-state pages exposes these separately.
        </li>
        <li>
          <strong>This is not financial advice.</strong> Nothing on {c.name} constitutes
          professional real estate, mortgage, or financial advice. For decisions with real
          money on the line, work with a licensed professional in your jurisdiction.
        </li>
      </ul>

      <h2>9. Corrections and feedback</h2>
      <p>
        If a published official figure disagrees with what you see here, please{" "}
        <a href="/contact/">contact us</a> with the city/state slug and the source URL.
        Corrections are processed weekly. The relevant section&apos;s review date moves when a
        correction is applied; the data&apos;s underlying vintage stays anchored to its source
        release.
      </p>

      <AuthorBox layer="methodology" />
    </article>
  );
}
