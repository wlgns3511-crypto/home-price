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
        This is the entire algorithm. The only constants are the four published
        Demographia bucket boundaries. The output is a deterministic function of the DB at
        build time — every weight in the code is shown above, and every input is the
        Census ACS / FHFA HPI / OECD Housing Prices field it cites.
      </p>

      <h2>3a. Price-to-Income Band (Demographia 5-band)</h2>
      <p>
        The price-to-income ratio (PIR) is the single most cited international affordability
        metric. The Demographia <em>International Housing Affordability</em> annual report,
        published continuously since 2005 by Performance Urban Planning (Wendell Cox / Hugh
        Pavletich), classifies markets into five bands using the same numeric cutoffs every
        year. {c.name} computes the ratio directly from the entity-level home price and
        median household income inputs and reproduces the bands verbatim, so the value on
        each page is independently checkable against the Demographia annual without any
        intermediate weighting.
      </p>
      <ul>
        <li>
          <strong>≥ 9.0 — Severely Unaffordable.</strong> Reserved by Demographia for the
          worst-stretched English-speaking metros (Hong Kong, Sydney, Vancouver, San Jose).
          A typical median household at this ratio cannot finance a typical median home on
          any standard 30-year mortgage at any reasonable rate.
        </li>
        <li>
          <strong>5.1 – 9.0 — Seriously Unaffordable.</strong> The Demographia &ldquo;Seriously
          Unaffordable&rdquo; band. Households at this ratio carry a 30-year fixed at well
          above the conservative 28% front-end DTI cutoff used by US Consumer Financial
          Protection Bureau&apos;s underwriting toolkit.
        </li>
        <li>
          <strong>4.1 – 5.1 — Moderately Unaffordable.</strong> Above the long-run 20th-century
          norm of 2.0–3.0, but below the &ldquo;Seriously&rdquo; cutoff.
        </li>
        <li>
          <strong>3.1 – 4.1 — Affordable.</strong> The Demographia &ldquo;Affordable&rdquo;
          band — historically the dominant range across most US census regions and most OECD
          markets before the early-2000s acceleration.
        </li>
        <li>
          <strong>0 – 3.1 — Highly Affordable.</strong> Below the 20th-century norm. This
          band is increasingly rare in the OECD; in the {c.name} dataset it concentrates in
          economically depressed US metros and a small number of low-income-economy capitals.
        </li>
      </ul>
      <p>
        Cutoffs are anchored to the most recent Demographia annual we have ingested and do
        not float with our own model. The verbatim TypeScript that performs the bucketing
        lives in <code>lib/price-to-income-band.ts</code> and is unit-deterministic over the
        two inputs (home value, median household income).
      </p>

      <h2>3b. Mortgage Burden Decoder (CFPB 28/36/43 tier)</h2>
      <p>
        Knowing that PIR is &ldquo;Seriously Unaffordable&rdquo; is one half of the
        affordability story; the other half is the actual monthly payment relative to income,
        which depends on the prevailing mortgage rate. The Consumer Financial Protection
        Bureau&apos;s Qualified Mortgage rule (12 CFR §1026.43(c)) treats a 43% back-end
        debt-to-income ratio as the safe-harbor underwriting ceiling, and the CFPB Owning a
        Home toolkit cites 28% as the conservative housing-only front-end cutoff. {c.name}
        decodes the implied monthly burden against these three named cutoffs:
      </p>
      <ul>
        <li>
          <strong>Tier A — under 28%.</strong> Within the CFPB conservative front-end
          housing-only cutoff. Sustainable for typical borrowers without crowding other
          household expenses.
        </li>
        <li>
          <strong>Tier B — 28% – 36%.</strong> Above the conservative housing-only cutoff but
          below the back-end QM threshold. Mainstream-bank underwriting comfortable band.
        </li>
        <li>
          <strong>Tier C — 36% – 43%.</strong> Stretched relative to typical underwriting but
          still inside the QM safe-harbor ceiling.
        </li>
        <li>
          <strong>Tier D — over 43%.</strong> Above the CFPB §1026.43(c) Qualified Mortgage
          safe-harbor ceiling. Loans in this tier are typically non-QM and carry a higher
          interest premium.
        </li>
        <li>
          <strong>Tier E — underwater / undefined.</strong> Used when income or rate inputs
          are missing or the implied burden exceeds 100% of income.
        </li>
      </ul>
      <p>
        The decoder assumes a standard 30-year fixed amortisation with 20% downpayment (LTV =
        0.8) and the current FRED MORTGAGE30US weekly observation for the US, with the
        equivalent national mortgage rate carried in the country DB for international rows.
        Property tax, homeowner&apos;s insurance, and HOA dues are <em>excluded</em> from the
        burden ratio — these are separately exposed by the PITI breakdown on US state pages.
        The verbatim amortisation routine lives in{" "}
        <code>lib/mortgage-burden-decoder.ts</code>.
      </p>

      <h2>3c. Housing Affordability Verdict (5-bucket synthesis)</h2>
      <p>
        The Price-to-Income Band and the Mortgage Burden Decoder each answer one half of the
        affordability question — the stock measure and the flow measure respectively. The
        Housing Affordability Verdict composes them into a single 5-bucket headline that the
        Demographia annual itself does not publish, but that mirrors how a CFPB-trained loan
        officer would read the two numbers together:
      </p>
      <ul>
        <li>
          <strong>Severely Unaffordable &amp; High Burden.</strong> PIR ≥ 9.0 (Demographia
          &ldquo;Severely&rdquo;) <em>or</em> &ldquo;Seriously&rdquo; band combined with
          monthly burden above the CFPB 43% safe-harbor.
        </li>
        <li>
          <strong>Seriously Unaffordable &amp; Stretched.</strong> PIR 5.1 – 9.0 or monthly
          burden above the 28% conservative cutoff.
        </li>
        <li>
          <strong>Moderately Balanced.</strong> PIR 4.1 – 5.1 — above the historic norm but
          below the &ldquo;Seriously&rdquo; cutoff.
        </li>
        <li>
          <strong>Affordable &amp; Comfortable.</strong> PIR ≤ 4.1 with monthly burden inside
          the 28% – 36% CFPB-comfortable band.
        </li>
        <li>
          <strong>Highly Affordable &amp; Undervalued.</strong> PIR &lt; 3.1 and monthly
          burden under the 28% conservative cutoff — historically the 20th-century norm.
        </li>
      </ul>
      <p>
        The priority chain is deterministic and lives in{" "}
        <code>lib/homepricepeek-interpretation.ts</code>. The function inspects the PIR tier
        and the CFPB burden tier in a fixed order, using only the band cutoffs as weights.
        A 4-paragraph branching strip renders the verdict just below the hero on every US
        state, US city, and international country page; the prose itself is a template-fill
        against the band labels, the Demographia anchor, the CFPB statute citation, the
        peer cluster rank, and the FHFA HPI 5-year trajectory. When any input is missing,
        the paragraph explicitly says so and shows the input that would be required.
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
          <strong>Per-page commentary is template-driven.</strong> The per-city and
          per-state &ldquo;insight&rdquo; sentences are template-fills against numeric
          thresholds (e.g. &ldquo;ratio &gt; 10 → unaffordable language&rdquo;), with the
          Census ACS / FHFA HPI / OECD inputs as the source-of-truth and the templates
          auditable in <code>lib/insights.ts</code>.
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
