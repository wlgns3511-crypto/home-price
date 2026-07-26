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
// 2026-07-26 — "global housing data" → US 주 단위. 도시 194 · 국가 50 행은 미출처
// 편집 추정치로 판정돼 같은 날 전량 410, OECD Housing Prices 인제스천은 이 레포에
// 존재한 적이 없다(data/sources.json 15필드에 없음). 이 페이지가 사이트의 출처
// 계약서라서 여기 남은 문장이 가장 비싼 거짓말이었다.
const desc =
  "How HomePricePeek sources, reconciles, and ranks US state-level housing data. Documents every algorithmic step (peer-cluster rank, mortgage-rate sensitivity, buy-vs-rent crossover) verbatim, with named public sources and no relabelled freshness.";

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
              "US state-level housing affordability metrics derived from Zillow ZHVI, Census ACS housing tables, FHFA HPI, FRED MORTGAGE30US, Tax Foundation property-tax rates, and NAIC homeowners premiums.",
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
          <strong>Scope.</strong> One surface: the 51 US state-level jurisdictions (50 states
          + DC), each with the same anchored field set. There is no city surface and no
          international surface &mdash; we do not ingest a metro-level or cross-country
          housing series, so we do not publish pages that would need one. Pages that
          previously claimed those surfaces were withdrawn in July 2026 and return HTTP 410.
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
        Zillow ZHVI values here are the April 2025 release and are labelled 2025-04, not with
        the ingestion date or the current year. Each section of the
        site carries its own vintage — entity (DB rebuild), methodology (this page), about,
        legal — rather than a single site-wide &ldquo;today&rdquo; cluster.
      </p>

      <h2>2. The metrics we publish (and what they mean)</h2>
      <p>Every state page publishes these fields:</p>
      <ul>
        <li>
          <strong>Median home price (USD).</strong> Zillow ZHVI typical home value for the
          state &mdash; smoothed, seasonally adjusted, single-family + condo, mid-tier
          (35th&ndash;65th percentile), April 2025 release.
        </li>
        <li>
          <strong>Price-to-income ratio (PIR).</strong> Median home price divided by median
          household annual income. The Demographia annual report buckets PIR as Affordable
          (&lt;3), Moderately (3–4), Seriously (4–5), and Severely (≥5) Unaffordable. We use
          the same bucket boundaries.
        </li>
        <li>
          <strong>Mortgage rate.</strong> The current FRED MORTGAGE30US benchmark. This
          is a national average for prime-credit borrowers, not your individual rate.
        </li>
        <li>
          <strong>1-year price change.</strong> Zillow ZHVI year-over-year change, April 2024
          → April 2025.
        </li>
        <li>
          <strong>5- and 10-year appreciation.</strong> FHFA House Price Index
          (all-transactions, state-level) cumulative growth, 2019Q4 → 2024Q4 and 2014Q4 →
          2024Q4.
        </li>
        <li>
          <strong>Cost-burdened share.</strong> ACS B25091 (owners) and
          B25070 (renters) — the share of households spending ≥30% of gross income on housing.
        </li>
        <li>
          <strong>Carrying costs.</strong> Tax Foundation effective property-tax rate as a
          share of owner-occupied home value (2023) and the NAIC average HO-3 homeowners
          premium (2023).
        </li>
      </ul>

      {/* 2026-07-26 — 이 섹션은 lib/affordability-cluster.ts 의 rankCluster(cities) 를
          "모든 도시 페이지가 쓰는 코드 경로"라며 verbatim 으로 싣고 있었다. 그 함수의
          입력(194개 도시 DB)과 소비 페이지가 같은 날 전부 사라졌으므로, 살아있는 주
          페이지가 실제로 호출하는 getPeerStates(lib/housing-landscape.ts)로 교체한다.
          투명성 레버는 유지하되 "돌지 않는 코드"를 싣지 않는다. */}
      <h2>3. Peer-cluster rank — our unique lever</h2>
      <p>
        A flat &ldquo;PIR is 8.4&rdquo; number is hard to interpret on its own. The same ratio
        means very different things in a coastal high-cost state (typical of its cluster) than
        in a Plains state (a severe outlier). So every state page publishes a{" "}
        <em>peer cluster</em>: the states this one is actually comparable to, and where it
        sits among them. The clusters are geographic-economic groupings assigned by hand
        &mdash; coastal high-cost, Sun-Belt boom, Rust-Belt affordable, mountain migration,
        Plains stable, Mid-Atlantic / New England &mdash; not Demographia bands. Two states in
        the same Demographia band with different labour markets are not peers in any useful
        sense.
      </p>
      <p>
        Given a state and the full 51-row table, the function picks that state&apos;s cluster,
        keeps the other members, and sorts them by how close their price-to-income ratio is to
        this state&apos;s &mdash; nearest four win. It separately returns the states directly
        above and below this one in the national price ranking. Deterministic, computed at
        build time, no fetch and no weighting beyond what you see:
      </p>
      <pre className="not-prose overflow-x-auto bg-slate-900 text-slate-100 text-xs leading-relaxed p-4 rounded-lg my-6"><code>{`export type PeerCluster =
  | 'coastal-highcost'
  | 'sun-belt-boom'
  | 'rust-belt-affordable'
  | 'mountain-migration'
  | 'plains-stable'
  | 'mid-atlantic';

// Hand-assigned. 51 slugs → 6 clusters; the full map is in
// lib/housing-landscape.ts and is the only editorial input here.
const PEER_CLUSTERS: Record<string, PeerCluster> = {
  california: 'coastal-highcost', hawaii: 'coastal-highcost',
  massachusetts: 'coastal-highcost', washington: 'coastal-highcost',
  /* … 47 more … */
};

export function getPeerStates(state: StateData, all: StateData[]): PeerFacts {
  const cluster = PEER_CLUSTERS[state.slug] ?? 'plains-stable';

  // Nearest four cluster-mates by price-to-income distance.
  const peers = all
    .filter(s => s.slug !== state.slug && PEER_CLUSTERS[s.slug] === cluster)
    .sort((a, b) =>
      Math.abs(a.priceToIncomeRatio - state.priceToIncomeRatio) -
      Math.abs(b.priceToIncomeRatio - state.priceToIncomeRatio))
    .slice(0, 4)
    .map(s => ({
      slug: s.slug,
      name: s.name,
      medianHomePrice: s.medianHomePrice,
      pir: s.priceToIncomeRatio,
    }));

  // Neighbours in the national price ranking, cluster-agnostic.
  const sortedByPrice = [...all].sort((a, b) => b.medianHomePrice - a.medianHomePrice);
  const idx = sortedByPrice.findIndex(s => s.slug === state.slug);
  const closest = sortedByPrice
    .filter((_, i) => i !== idx && Math.abs(i - idx) <= 2)
    .slice(0, 3)
    .map(s => ({ slug: s.slug, name: s.name, medianHomePrice: s.medianHomePrice }));

  return { cluster, clusterLabel: CLUSTER_LABEL[cluster], peers, closestByPrice: closest };
}`}</code></pre>
      <p>
        This is the entire algorithm. The only editorial input is the cluster assignment
        table; everything else is a sort over the same Zillow ZHVI / Census ACS B19013 fields
        published on the page. Because the cluster is geographic rather than a Demographia
        band, we do <em>not</em> publish a &ldquo;rank N of M within your Demographia
        bucket&rdquo; line on state pages &mdash; that number would imply a peer set we
        don&apos;t compute.
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
          <strong>0 – 3.1 — Highly Affordable.</strong> Below the 20th-century norm. In the{" "}
          {c.name} table it appears only in the cheapest Plains and Rust-Belt states, and
          even there it has been thinning since 2020.
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
        0.8) and the current FRED MORTGAGE30US weekly observation.
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
        A 4-paragraph branching strip renders the verdict just below the hero on every state
        page; the prose itself is a template-fill against the band labels, the Demographia
        anchor, the CFPB statute citation, and the FHFA HPI 5-year trajectory. When any input
        is missing, the paragraph explicitly says so and shows the input that would be
        required.
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

      {/* 2026-07-26 — "5. Currency and inflation" 섹션 삭제. USD 정규화·FX 노이즈·해외
          통화 이야기는 국제 서피스가 있을 때만 성립했다. 뒤 섹션 번호는 그대로 둔다
          h2 에 id 가 없어 앵커가 없으므로 뒤 섹션은 5~8 로 당겼다. */}

      <h2>5. What we don&apos;t do</h2>
      <ul>
        <li>
          <strong>We don&apos;t forecast.</strong> No model on this site predicts prices forward
          beyond the most recent observed value. Headlines like &ldquo;Where prices will go in
          2027&rdquo; are not part of the surface.
        </li>
        <li>
          <strong>Per-page commentary is template-driven.</strong> The per-state
          &ldquo;insight&rdquo; sentences are template-fills against numeric
          thresholds (e.g. &ldquo;ratio &gt; 10 → unaffordable language&rdquo;), with the
          Zillow ZHVI / Census ACS / FHFA HPI inputs as the source-of-truth and the templates
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
          <strong>We don&apos;t relabel a corpus year with a fresher one.</strong> The FHFA
          HPI cut here ends 2024Q4 and the ZHVI release is 2025-04; neither is re-stamped as
          2026.
        </li>
      </ul>

      <h2>6. Update cadence</h2>
      <p>
        Zillow publishes ZHVI monthly. US Census ACS publishes 5-year tables
        annually with a 12-18 month lag. FHFA HPI updates quarterly. FRED MORTGAGE30US updates
        weekly. Tax Foundation and NAIC publish annually. We re-ingest each source on its own
        publication cadence, then rebuild and re-deploy the site.
      </p>
      <p>
        The current entity vintage on this site is{" "}
        <code>{ENTITY_VINTAGE}</code> (DB rebuild). The methodology page itself was last
        reviewed{" "}
        <code>{METHODOLOGY_REVIEWED}</code>. These two anchors evolve independently — the
        DB can be rebuilt without changing how the math works, and the math can be revised
        without changing the underlying data.
      </p>

      <h2>7. Limitations you should know about</h2>
      <ul>
        <li>
          <strong>State-level resolution.</strong> Every figure is a statewide aggregate.
          Within one state, prices vary several-fold between metros and again between
          neighbourhoods; a state median cannot see any of that.
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
          breakdown card on each state page exposes these separately.
        </li>
        <li>
          <strong>This is not financial advice.</strong> Nothing on {c.name} constitutes
          professional real estate, mortgage, or financial advice. For decisions with real
          money on the line, work with a licensed professional in your jurisdiction.
        </li>
      </ul>

      <h2>8. Corrections and feedback</h2>
      <p>
        If a published official figure disagrees with what you see here, please{" "}
        <a href="/contact/">contact us</a> with the state slug and the source URL.
        Corrections are processed weekly. The relevant section&apos;s review date moves when a
        correction is applied; the data&apos;s underlying vintage stays anchored to its source
        release.
      </p>

      <AuthorBox layer="methodology" />
    </article>
  );
}
