import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: `${c.name} editorial standards anchored to US Census Bureau ACS, FHFA HPI, FRED MORTGAGE30US, HUD Fair Market Rent, and OECD Housing Prices.`,
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
        ; this page is the {c.name}-specific layer, anchored to the named public sources
        — the US Census Bureau, HUD, and federal economic data providers domestically;
        OECD Housing Prices and national statistics offices internationally.
      </p>

      <h2>Source transparency</h2>
      <p>
        Every page on {c.name} that displays a numeric value labels its source on page.
        The named anchored sources are:
      </p>
      <ul>
        <li>
          <strong>US Census Bureau American Community Survey (ACS) 5-year tables.</strong>{" "}
          Median household income (Census ACS B19013), median home value (Census ACS
          B25077), cost-burdened owner share (Census ACS B25091), cost-burdened renter
          share (Census ACS B25070), gross rent (Census ACS B25064). The US Census Bureau
          releases ACS 5-year tables annually with a built-in 12&ndash;18 month lag, and
          the Census Bureau&apos;s data.census.gov is the canonical access point.
        </li>
        <li>
          <strong>Federal Housing Finance Agency (FHFA) House Price Index.</strong>{" "}
          Quarterly purchase-only repeat-sales index used for 1-year, 5-year, and 10-year
          appreciation derivations. FHFA HPI is a backward-looking index by FHFA&apos;s
          own definition.
        </li>
        <li>
          <strong>FRED MORTGAGE30US weekly observation.</strong> Federal Reserve Economic
          Data&apos;s national 30-year fixed mortgage rate series; the Freddie Mac Primary
          Mortgage Market Survey replumbed onto the St Louis Fed&apos;s FRED endpoint.
        </li>
        <li>
          <strong>HUD Fair Market Rent (FMR) tables.</strong> Department of Housing and
          Urban Development&apos;s county-level FMR baseline, used in cross-references
          where the Census ACS B25064 gross rent is sparse. HUD&apos;s 30%-of-income
          threshold defines the cost-burden classification we apply to Census ACS
          B25091/B25070.
        </li>
        <li>
          <strong>OECD Housing Prices dataset.</strong> The Organisation for Economic
          Co-operation and Development&apos;s cross-country price-to-income, rent-to-income,
          and real house price indices. Anchored quarterly per country; serves as the
          international counterpart to Census ACS + FHFA HPI domestically.
        </li>
        <li>
          <strong>Named national statistics offices outside the OECD.</strong>{" "}
          Statistics Canada, ONS UK, INE Spain, Eurostat, INSEE France, ABS Australia,
          Statistics Korea (KOSTAT), and others fill in where OECD Housing Prices does
          not publish.
        </li>
      </ul>
      <p>
        Where a metric is derived (price-to-income ratio, Demographia 5-band bucket,
        mortgage burden tier against the Consumer Financial Protection Bureau 28/36/43
        cutoffs, buy-vs-rent crossover, PITI breakdown), the underlying anchored input is
        named on page and the verbatim algorithm lives on{" "}
        <a href="/methodology/">/methodology/</a>. We do not relabel a Census ACS, FHFA,
        FRED, HUD, or OECD release year with a fresher one.
      </p>

      <h2>Scope split &mdash; honest about what we cover</h2>
      <p>
        {c.name} runs a hybrid (&ldquo;Path C&rdquo;) scope because the underlying source
        landscape is uneven. The US Census Bureau ACS, FHFA HPI, FRED MORTGAGE30US, and
        HUD Fair Market Rent publish at higher depth and frequency than any equivalent
        international series. OECD Housing Prices covers OECD member economies with
        comparable but shallower depth. Beyond OECD, national statistics offices vary
        widely in coverage. We do not pretend these are the same product:
      </p>
      <ul>
        <li>
          <strong>US:</strong> 51 jurisdictions (50 states + DC) at 18 anchored fields
          per state, drawn from Census ACS, FHFA HPI, FRED, and HUD. The state-level
          surface is the deepest part of the site.
        </li>
        <li>
          <strong>International:</strong> ~159 cities across ~97 countries at a smaller
          field set anchored to OECD Housing Prices and named national statistics
          offices.
        </li>
      </ul>
      <p>
        Per-page labels make the depth difference explicit. We do not present a Census
        ACS-backed US state page and an OECD-backed Bangkok page as equivalent products.
      </p>

      <h2>Selection criteria</h2>
      <p>
        {c.name} does not generate a page for every possible city or state slug. Coverage
        is driven by:
      </p>
      <ul>
        <li>
          <strong>Source availability.</strong> A US row must have a Census ACS 5-year
          observation within the last two years; an international row must have an OECD
          Housing Prices observation or a named national statistics office citation
          within the last two years. Rows below this floor are excluded.
        </li>
        <li>
          <strong>User demand.</strong> Pages with measurable demand (Google Search
          Console impressions or click-through over a 25-day window) are prioritised for
          review and for additional Census ACS / FHFA HPI / FRED / HUD / OECD derived-
          metric coverage.
        </li>
        <li>
          <strong>Network coherence.</strong> Cities or states already covered by sister
          DataPeek sites (cost-of-living, salary, energy cost) get cross-link priority,
          provided their Census ACS, BLS, BEA, and HUD anchors are independently
          verified on this surface as well.
        </li>
      </ul>

      <h2>Drafting and review</h2>
      <p>
        New surfaces and material revisions go through:
      </p>
      <ol>
        <li>
          <strong>Source verification.</strong> Each field is cross-checked against the
          published Census ACS, FHFA HPI, FRED, HUD, or OECD source URL before
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
          The per-city and per-state &ldquo;insight&rdquo; sentences are deterministic
          template-fills against numeric thresholds anchored to Census ACS, FHFA HPI,
          FRED MORTGAGE30US, HUD Fair Market Rent, and OECD Housing Prices inputs; the
          templates are auditable in <code>lib/insights.ts</code>.
        </li>
        <li>
          <strong>We don&apos;t pretend to be a multiple-listing service.</strong> The
          prices are Census ACS / FHFA HPI / OECD aggregates, not active listings.
        </li>
        <li>
          <strong>We don&apos;t claim certification backing.</strong> No CFP, MLO, NMLS,
          appraiser, or realtor credential underwrites the team. We are an editorial team
          that reads US Census Bureau, FHFA, FRED, HUD, and OECD public sources.
        </li>
        <li>
          <strong>We don&apos;t relabel stale data with a fresher year.</strong> Each
          Census ACS / FHFA / FRED / HUD / OECD section anchors to its honest vintage; we
          do not collapse them into a single &ldquo;today&rdquo; cluster.
        </li>
        <li>
          <strong>We don&apos;t ship a public bulk dataset.</strong> The published
          surface (per-city, per-state, rankings, insights) is the published product.
          There is no downloadable dump of the Census ACS / FHFA HPI / FRED / HUD / OECD
          joined database.
        </li>
      </ul>

      <h2>Tone and language</h2>
      <p>
        {c.name} publishes in English. Editorial tone is neutral, unhedged, and concrete.
        We avoid promotional language, motivational filler, and adjective spam. When
        Census ACS and OECD Housing Prices disagree on a derived value (cross-walk
        differences), we say so. Where an algorithmic estimate diverges from a Census
        Bureau or OECD published authoritative figure, we keep the algorithmic value with
        a clear label rather than overwriting it.
      </p>

      <h2>Conflicts of interest</h2>
      <p>
        {c.name} does not accept paid placement of city entries, mortgage products,
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
        Changes that affect what gets published (new Census ACS table joined, new OECD
        Housing Prices series ingested, new HUD FMR cross-reference, new selection rule,
        new disclosure) are reflected in the methodology page as well, with the same
        review date.
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
        Questions about editorial standards, a specific Census, FHFA, FRED, HUD, or OECD
        anchored value, or a specific page: <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
