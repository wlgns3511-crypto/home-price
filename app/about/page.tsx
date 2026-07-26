import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { webPageSchema } from "@/lib/schema";
import { AuthorBox } from "@/components/AuthorBox";
import {
  ABOUT_REVIEWED,
  ENTITY_VINTAGE,
  METHODOLOGY_REVIEWED,
  LEGAL_REVIEWED,
} from "@/lib/authorship";

const c = siteConfig;
const desc = `${c.name} is a free housing-data reference built by a small editorial team. This page documents who runs it, what the scope actually is, what we deliberately don't cover, and how the operation is funded.`;

export const metadata: Metadata = {
  title: `About ${c.name}`,
  description: desc,
  alternates: { canonical: "/about/" },
  openGraph: { title: `About ${c.name}`, description: desc, url: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema(`About ${c.name}`, desc, "/about/")),
        }}
      />
      <h1>About {c.name}</h1>
      <p className="text-sm text-slate-500 mb-2">
        Section reviewed: <time dateTime={ABOUT_REVIEWED}>{ABOUT_REVIEWED}</time>
      </p>

      {/* 2026-07-26 — 국제/도시 서피스 주장을 전부 지웠다. 그 서피스를 받치던 194개 도시 ·
          50개 국가 행은 미출처 합성 시드로 판정돼 같은 날 전량 410 이고, OECD Housing Prices
          인제스천은 레포에 존재한 적이 없다(data/sources.json 15필드에 없음). 남은 발행 축은
          주 51개 하나다. */}
      <p className="lead text-lg text-slate-600">
        {c.name} is a free housing-data reference with one surface: deep per-state coverage
        of the United States housing market, 51 jurisdictions (50 states + DC). It is built
        by a small editorial team operating under the DataPeek Research Network, and runs on
        public, named, and traceable data sources.
      </p>

      <h2>Who runs this</h2>
      <p>
        {c.name} is operated by a Korea-based editor working under the DataPeek Research
        Network &mdash; a small group of free public-data tools across housing, salary, cost
        of living, healthcare, education, and energy. The active editor is James Park, whose
        byline appears on every surface as part of the editorial team designation. Every data
        page passes through the same editorial workflow: an editor audits the underlying
        sources, runs the build, and reviews the rendered output before deployment.
      </p>
      <p>
        The operation is intentionally small. We are not a venture-backed startup, we do not
        run a sales team, and we do not offer paid placement of any kind. The site exists
        because the editor wanted a single place to compare housing affordability across US
        states without subscribing to MLS or paying for a market-data seat &mdash; and
        decided to publish it.
      </p>

      <h2>Scope &mdash; what this site actually covers</h2>
      <p>
        One surface, one resolution: the 51 US state-level jurisdictions (50 states + DC).
        Each carries the same anchored field set &mdash; median home price (Zillow ZHVI), 5-
        and 10-year FHFA HPI appreciation, ACS B19013 median household income, ACS
        B25091/B25070 cost-burdened shares for owners and renters, Tax Foundation effective
        property-tax rate, NAIC homeowners premium, FRED MORTGAGE30US current 30-year fixed
        rate &mdash; plus derived metrics computed from those inputs: price-to-income ratio,
        Demographia bucket, mortgage cost delta, buy-vs-rent crossover year, and a PITI
        breakdown.
      </p>
      <p>
        There is no city surface and no international surface. We do not ingest a
        metro-level price series or a cross-country housing series, so we do not publish
        per-city or per-country pages. Every field on every page traces to one of the named
        US series above; the full field-by-field source table is on{" "}
        <a href="/methodology/">/methodology/</a>.
      </p>

      <h2>What we don&apos;t cover</h2>
      <p>
        It is at least as important to be clear about what we deliberately exclude:
      </p>
      <ul>
        <li>
          <strong>Live MLS or appraiser quotes.</strong> Our prices are statistical
          aggregates anchored to public series. They are not active listings, recent sales,
          or appraisal estimates. For a real purchase decision, work with a licensed local
          professional.
        </li>
        <li>
          <strong>Forecasts.</strong> No model on this site predicts prices, rents, or rates
          forward beyond the most recent observed value. We do not publish &ldquo;where
          prices will go next year&rdquo; pages.
        </li>
        <li>
          <strong>Per-page commentary is template-driven.</strong> The per-state insight
          paragraphs you see on entity pages are deterministic template-fills against
          numeric thresholds (e.g. &ldquo;PIR &gt; 10 → unaffordable language&rdquo;), with
          the Zillow ZHVI / Census ACS / FHFA HPI inputs as the source-of-truth. The
          templates are auditable in <code>lib/insights.ts</code>.
        </li>
        <li>
          <strong>Sub-state resolution.</strong> Every figure is a state-level aggregate.
          Within a single state, prices vary several-fold between metros and again between
          neighborhoods; a state median cannot capture that, and we do not publish
          metro- or neighborhood-level numbers.
        </li>
        <li>
          <strong>Mortgage broker referrals.</strong> We do not partner with lenders, do not
          earn referral fees on rate quotes, and do not display lender-sponsored content. The
          mortgage rate you see on US pages is the FRED MORTGAGE30US national benchmark.
        </li>
        <li>
          <strong>Certification claims we cannot back.</strong> The team behind {c.name}{" "}
          does not hold CFP, MLO, NMLS, or appraiser certification. We do not claim financial
          advice authority. The site is a data reference, not a service provider.
        </li>
      </ul>

      <h2>How the data flows</h2>
      <p>
        Each rebuild follows a fixed pipeline:
      </p>
      <ol>
        <li>
          Re-ingest the underlying sources on each source&apos;s native cadence (Zillow ZHVI
          monthly, ACS annually, FHFA quarterly, FRED weekly).
        </li>
        <li>
          Reconcile values against the prior ingest; large deltas trigger a manual review
          before they reach the build.
        </li>
        <li>
          Compute derived metrics (price-to-income, Demographia bucket, cluster rank,
          mortgage cost delta, buy-vs-rent crossover) deterministically in TypeScript at
          build time. The verbatim cluster-rank algorithm is documented on{" "}
          <a href="/methodology/">/methodology/</a>.
        </li>
        <li>
          Rebuild the site as static HTML; deploy to the CDN; bump the entity vintage.
        </li>
      </ol>
      <p>
        We do not relabel a corpus year. The Zillow ZHVI values on this site are the April
        2025 release, so the entity vintage reflects 2025-04 &mdash; not the ingestion date
        and not the current year.
      </p>

      <h2>Section vintages &mdash; honest freshness</h2>
      <p>
        Different parts of the site evolve on different cadences, and we anchor each to its
        own honest review date rather than re-stamping everything with a single &ldquo;site
        updated today&rdquo; cluster:
      </p>
      <ul>
        <li>
          <strong>Entity vintage</strong> ({ENTITY_VINTAGE}) &mdash; when the state rows
          were last refreshed.
        </li>
        <li>
          <strong>Methodology</strong> ({METHODOLOGY_REVIEWED}) &mdash; when the math and
          the source documentation were last reviewed.
        </li>
        <li>
          <strong>About</strong> ({ABOUT_REVIEWED}) &mdash; when this page was last
          reviewed.
        </li>
        <li>
          <strong>Legal</strong> ({LEGAL_REVIEWED}) &mdash; when the privacy policy, terms,
          and disclaimers were last reviewed.
        </li>
      </ul>
      <p>
        These dates intentionally diverge. A methodology revision does not require an entity
        rebuild; an entity rebuild does not constitute a methodology change. Each section
        carries its own anchor.
      </p>

      <h2>Funding &mdash; who pays for this</h2>
      <p>
        {c.name} is funded by display advertising (Google AdSense) only. There is no
        subscription, no premium tier, no affiliate program for mortgage products, and no
        sponsored content. AdSense inventory is auctioned by Google&apos;s network; the ads
        you see on a page are not editorial endorsements. We do not accept paid placement
        of state entries, paid promotion of mortgage products, or paid removal of
        unfavourable state rankings.
      </p>
      <p>
        The operator does not hold equity in any real-estate brokerage, mortgage lender,
        title insurance company, or PropTech startup. There is no investment relationship
        between {c.name} and any company whose product appears in an advertising slot.
      </p>

      <h2>The DataPeek Research Network</h2>
      <p>
        {c.name} is part of the{" "}
        <a href="https://datapeekfacts.com" rel="noopener">
          DataPeek Research Network
        </a>
        , a small group of free public-data references that share an editorial workflow,
        a publishing house, and a network-wide policy framework. Sister sites cover salaries,
        cost of living, healthcare costs, energy bills, and several other civic data domains.
        Each site is published as its own brand with its own editorial focus, but the
        underlying network policy &mdash; on corrections, on attribution, on what we will and
        will not do &mdash; is shared.
      </p>
      <p>
        The network-wide editorial policy lives at{" "}
        <a href="https://datapeekfacts.com/editorial-policy/" rel="noopener">
          datapeekfacts.com/editorial-policy
        </a>
        ; the {c.name}-specific layer is on{" "}
        <a href="/editorial-policy/">/editorial-policy/</a>.
      </p>

      <h2>Why US-only</h2>
      <p>
        Housing data has a sharply uneven publishing landscape. The United States Census
        Bureau publishes the American Community Survey 5-year tables annually with thousands
        of cross-tabulated fields per state and county; the Federal Housing Finance Agency
        publishes a quarterly House Price Index back to 1975; FRED publishes the
        MORTGAGE30US weekly observation back to 1971; Zillow publishes ZHVI monthly. That
        depth is what makes a per-state page worth reading.
      </p>
      <p>
        No comparable free series exists for the cities and countries a housing site is
        tempted to cover, and we do not run an ingestion pipeline for one. So the honest
        answer is a narrower site: 51 state pages, five state-pair comparisons, and nothing
        that would require a number we cannot trace. Pages that once claimed a per-city or
        per-country surface were withdrawn in July 2026 and now return HTTP 410 &mdash; the
        figures behind them were editorial estimates, not an ingested series, which is not a
        standard we are willing to publish under.
      </p>

      <h2>Interpretation layer &mdash; PSU 1 lever stack</h2>
      <p>
        Numbers alone do not answer the question the visitor came with: <em>is this place
        affordable for someone like me?</em> {c.name} maintains a deterministic
        interpretation layer that composes three named, source-anchored levers into a single
        plain-English verdict on every entity page:
      </p>
      <ul>
        <li>
          <strong>Price-to-Income Band.</strong> The Demographia 5-band tier
          (Highly Affordable / Affordable / Moderately / Seriously / Severely Unaffordable),
          with the verbatim cutoffs ≥ 9.0 / ≥ 5.1 / ≥ 4.1 / ≥ 3.1 / 0 that Demographia has
          used continuously since the early 2000s. Inputs: home value and median household
          income. Anchored externally to the Demographia annual report and to Census ACS
          B19013.
        </li>
        <li>
          <strong>Mortgage Burden Decoder.</strong> Computes the implied monthly principal
          and interest payment under a standard 30-year fixed amortisation at the current
          FRED MORTGAGE30US weekly rate, assuming a 20% downpayment. Compares the resulting share of
          income against the CFPB Owning a Home 28% / 36% / 43% cutoffs documented in the
          Qualified Mortgage rule at 12 CFR §1026.43(c).
        </li>
        <li>
          <strong>Housing Affordability Verdict.</strong> A 5-bucket synthesis
          (Severely &amp; High Burden / Seriously &amp; Stretched / Moderately Balanced /
          Affordable &amp; Comfortable / Highly Affordable &amp; Undervalued) computed by a
          fixed priority chain over the PIR band and the CFPB burden tier, plus a 4-paragraph
          branching strip that names the Demographia anchor, the CFPB citation, the peer
          cluster rank (from the Demographia bucket cluster lever), and the FHFA HPI 5-year
          trajectory.
        </li>
      </ul>
      <p>
        The interpretation layer is purely deterministic. Every paragraph is a
        template-fill against the named Demographia / CFPB cutoffs and the named Zillow
        ZHVI / Census ACS / FHFA HPI / FRED MORTGAGE30US source citations; the verbatim
        source for all three levers is reproduced on{" "}
        <a href="/methodology/">/methodology/</a>.
      </p>

      <h2>Tone</h2>
      <p>
        Editorial tone is neutral and concrete. We avoid promotional language, motivational
        filler, and adjective spam (&ldquo;amazing&rdquo;, &ldquo;essential&rdquo;,
        &ldquo;discover&rdquo;). When sources disagree on a metric, we say so. When a value
        is derived rather than measured, we label it as such. When an algorithmic estimate
        diverges from a published authoritative figure, we keep the algorithmic value with
        a clear label and link the authoritative source.
      </p>

      <h2>Corrections</h2>
      <p>
        Corrections are how a small editorial team stays honest about its mistakes. If you
        find a published figure that disagrees with the official source we cited, send the
        URL, the field, the value you believe is correct, and the source you used to verify
        it to the editor via the{" "}
        <a href="/contact/">/contact</a> page. Corrections are processed in weekly batches.
        Applied corrections show up in the next deployment; the affected section&apos;s
        review date moves to reflect the change. Declined corrections come back with a
        written reason.
      </p>

      <h2>Privacy and analytics</h2>
      <p>
        {c.name} uses Google Analytics 4 to count page-views and Google AdSense to serve
        display ads. Both load Google cookies; the full disclosure of what is collected and
        how to opt out lives in{" "}
        <a href="/privacy/">/privacy/</a>. We do not run an email list, do not track users
        across devices using fingerprinting, and do not sell or share any user data with
        third parties beyond Google&apos;s own ad-network behaviour.
      </p>

      <h2>Contact</h2>
      <p>
        The single channel into the editorial team is email. The address and the expected
        reply window live on the{" "}
        <a href="/contact/">/contact</a> page. There is no comments system, no forum, and
        no live-chat support; we read incoming mail in batches and respond within five
        business days.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        Material changes to this page (scope shift, ownership change, monetisation change)
        are reviewed and dated above. Smaller wording revisions are reflected in the section
        review date without a separate changelog.
      </p>

      <AuthorBox layer="about" />
    </article>
  );
}
