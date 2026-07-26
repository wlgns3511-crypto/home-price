import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Editorial Policy",
  // 2026-07-26 — HUD FMR · OECD Housing Prices 제거. 둘 다 레포에 인제스천이 없고
  // data/sources.json 15필드에도 없다(HUD 는 '30% 코스트버든 기준선'이라는 정의로만
  // 실재 — 데이터셋이 아니다). 실배선된 것만 남긴다.
  description: `${c.name} editorial standards anchored to Zillow ZHVI, US Census Bureau ACS, FHFA HPI, FRED MORTGAGE30US, and Tax Foundation property-tax data.`,
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { url: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        {c.name} is a small public-data reference. This page describes the editorial
        standards that govern what we publish, how we source it, and what we deliberately
        exclude. The network-wide framework lives at{" "}
        <a href="https://datapeekfacts.com/editorial-policy/" rel="noopener">
          datapeekfacts.com/editorial-policy
        </a>
        ; this page is the {c.name}-specific layer, anchored to named US public sources
        — Zillow Research, the US Census Bureau, FHFA, FRED, the Tax Foundation, and NAIC.
      </p>

      <h2>Source transparency</h2>
      <p>
        Every page on {c.name} that displays a numeric value labels its source on page.
        The named anchored sources are:
      </p>
      <ul>
        <li>
          <strong>Zillow Home Value Index (ZHVI).</strong> Typical home value per state and
          its 1-year change &mdash; smoothed, seasonally adjusted, single-family + condo,
          mid-tier (35th&ndash;65th percentile). The April 2025 release is what the site
          currently publishes, and it is labelled as such.
        </li>
        <li>
          <strong>US Census Bureau American Community Survey (ACS) 5-year tables.</strong>{" "}
          Median household income (B19013), cost-burdened owner share (B25091), and
          cost-burdened renter share (B25070), 2019&ndash;2023 5-Year. The Census Bureau
          releases ACS 5-year tables annually with a built-in 12&ndash;18 month lag, and
          data.census.gov is the canonical access point.
        </li>
        <li>
          <strong>Federal Housing Finance Agency (FHFA) House Price Index.</strong>{" "}
          All-transactions state-level index used for the 5-year and 10-year cumulative
          appreciation figures. FHFA HPI is a backward-looking index by FHFA&apos;s
          own definition.
        </li>
        <li>
          <strong>FRED MORTGAGE30US weekly observation.</strong> Federal Reserve Economic
          Data&apos;s national 30-year fixed mortgage rate series; the Freddie Mac Primary
          Mortgage Market Survey replumbed onto the St Louis Fed&apos;s FRED endpoint.
        </li>
        <li>
          <strong>Tax Foundation and NAIC.</strong> Effective property tax paid as a share
          of owner-occupied home value (Tax Foundation, 2023) and the average HO-3
          homeowners premium (NAIC, 2023) &mdash; the two carrying costs in the PITI
          breakdown.
        </li>
        <li>
          <strong>Definitions, not datasets.</strong> Two authorities appear on the site as
          published <em>thresholds</em> rather than as ingested series, and we say which is
          which: HUD&apos;s 30%-of-income cost-burden line (applied to the ACS B25091/B25070
          shares) and the CFPB Qualified Mortgage 28/36/43 cutoffs (applied to our own
          amortisation). We ingest no HUD or CFPB data file.
        </li>
      </ul>
      <p>
        Where a metric is derived (price-to-income ratio, Demographia 5-band bucket,
        mortgage burden tier against the Consumer Financial Protection Bureau 28/36/43
        cutoffs, buy-vs-rent crossover, PITI breakdown), the underlying anchored input is
        named on page and the verbatim algorithm lives on{" "}
        <a href="/methodology/">/methodology/</a>. We do not relabel a Zillow, Census ACS,
        FHFA, or FRED release year with a fresher one.
      </p>

      <h2>Scope &mdash; honest about what we cover</h2>
      <p>
        One surface: 51 US jurisdictions (50 states + DC), every one carrying the same
        anchored field set from the sources above. There is no city surface and no
        international surface, because we run no ingestion for a metro-level or
        cross-country housing series.
      </p>
      <p>
        This is narrower than the site claimed until July 2026. Per-city and per-country
        pages published before then were built on editorial estimates rather than an
        ingested series; when an audit established that, the pages were withdrawn (HTTP 410)
        and the claims describing them were removed from this policy rather than left
        standing. A source list that includes an authority we never ingested is the same
        failure as a wrong number.
      </p>

      <h2>Selection criteria</h2>
      <p>
        {c.name} does not generate a page for every slug someone might type. Coverage
        is driven by:
      </p>
      <ul>
        <li>
          <strong>Source availability.</strong> A row must carry a Zillow ZHVI value and a
          Census ACS 5-year observation from the current release cycle. Rows below this
          floor are excluded rather than estimated.
        </li>
        <li>
          <strong>User demand.</strong> Pages with measurable demand (Google Search
          Console impressions or click-through over a 25-day window) are prioritised for
          review and for additional derived-metric coverage.
        </li>
        <li>
          <strong>Network coherence.</strong> States already covered by sister
          DataPeek sites (cost-of-living, salary, energy cost) get cross-link priority,
          provided their anchors are independently verified on this surface as well.
        </li>
      </ul>

      <h2>Drafting and review</h2>
      <p>
        New surfaces and material revisions go through:
      </p>
      <ol>
        <li>
          <strong>Source verification.</strong> Each field is cross-checked against the
          published Zillow, Census ACS, FHFA, FRED, or Tax Foundation source URL before
          deployment. Fields without a source-of-truth are labelled as derived and the
          derivation is documented.
        </li>
        <li>
          <strong>Build-time validation.</strong> Numeric ranges, missing-value handling,
          and bucket assignments are validated during the static build. Pages that fail
          validation do not deploy.
        </li>
        <li>
          <strong>Review.</strong> The editor reads the rendered page before deployment
          for tone, accuracy, and consistency with neighbouring pages.
        </li>
        <li>
          <strong>Publish.</strong> The full site rebuilds and deploys; the section
          review date moves.
        </li>
      </ol>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>
          <strong>Per-page commentary is template-driven.</strong>{" "}
          The per-state &ldquo;insight&rdquo; sentences are deterministic
          template-fills against numeric thresholds anchored to the Zillow ZHVI, Census ACS,
          FHFA HPI, and FRED MORTGAGE30US inputs; the
          templates are auditable in <code>lib/insights.ts</code>.
        </li>
        <li>
          <strong>We don&apos;t pretend to be a multiple-listing service.</strong> The
          prices are Zillow ZHVI / FHFA HPI aggregates, not active listings.
        </li>
        <li>
          <strong>We don&apos;t claim certification backing.</strong> No CFP, MLO, NMLS,
          appraiser, or realtor credential underwrites the team. We are an editorial team
          that reads Zillow Research, US Census Bureau, FHFA, and FRED public sources.
        </li>
        <li>
          <strong>We don&apos;t relabel stale data with a fresher year.</strong> Each
          Zillow / Census ACS / FHFA / FRED section anchors to its honest vintage; we
          do not collapse them into a single &ldquo;today&rdquo; cluster.
        </li>
        <li>
          <strong>We don&apos;t ship a public bulk dataset.</strong> The published state
          pages are the published product. There is no downloadable dump of the joined
          table.
        </li>
      </ul>

      <h2>Tone and language</h2>
      <p>
        {c.name} publishes in English. Editorial tone is neutral, unhedged, and concrete.
        We avoid promotional language, motivational filler, and adjective spam. Our
        price-to-income ratio divides a Zillow value by a Census income &mdash; two agencies,
        two vintages, two methodologies &mdash; and where that cross-source derivation
        disagrees with a figure published by either agency directly, we keep ours with a
        clear label rather than overwriting it, and say which inputs produced it.
      </p>

      <h2>Conflicts of interest</h2>
      <p>
        {c.name} does not accept paid placement of state entries, mortgage products,
        lender names, or outbound links. The site is funded by display advertising
        (Google AdSense) only; ad inventory is auctioned by Google&apos;s network, and an
        ad&apos;s appearance on a page does not imply editorial endorsement. The operator
        does not hold equity in any real-estate brokerage, mortgage lender, title
        insurance company, or PropTech startup, and there is no investment relationship
        between {c.name} and any company whose product appears in an advertising slot.
        We do not earn referral fees on FRED MORTGAGE30US-driven rate quotes and do not
        partner with originators or HUD-approved counselling agencies.
      </p>

      <h2>Updates</h2>
      <p>
        Material changes to this editorial policy are reviewed and dated on this page.
        Changes that affect what gets published (a new Census ACS table joined, a new
        series ingested, a withdrawn surface, a new selection rule, a new disclosure) are
        reflected in the methodology page as well, with the same review date.
      </p>

      <h2>Source attributions</h2>
      <ul>
        {SOURCE_AUTHORITIES.map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>{" "}
            &mdash; {s.role}.
          </li>
        ))}
      </ul>

      <h2>Contact</h2>
      <p>
        Questions about editorial standards, a specific anchored value, or a specific
        page: <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
