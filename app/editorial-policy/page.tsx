import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: `${c.name} editorial standards: source transparency, scope split, conflicts of interest, what we don't do.`,
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
        standards that govern what we publish and what we deliberately exclude. The
        network-wide framework lives at{" "}
        <a href="https://datapeekfacts.com/editorial-policy/" rel="noopener">
          datapeekfacts.com/editorial-policy
        </a>
        ; this page is the {c.name}-specific layer.
      </p>

      <h2>Source transparency</h2>
      <p>
        Every page on {c.name} that displays a numeric value labels its source on page. The
        primary anchored sources are OECD price-to-income series (international cities),
        Zillow ZHVI and FHFA HPI (US state-level prices and appreciation), Census ACS
        (median income, cost-burdened share), FRED MORTGAGE30US (US 30-year fixed rate),
        and named national statistics offices (Statistics Canada, ONS UK, INE Spain,
        Eurostat, etc.). Where a metric is derived (price-to-income ratio, Demographia
        bucket cluster rank, mortgage cost delta, buy-vs-rent crossover, PITI breakdown),
        the underlying anchored input is named on page and the verbatim algorithm lives on{" "}
        <a href="/methodology/">/methodology/</a>.
      </p>
      <p>
        We do not relabel a corpus year. If the OECD release we ingested is anchored to
        2024Q4 data, the entity vintage is anchored to 2024Q4 and not the ingestion date.
        Each section of the site (entity / methodology / about / legal) anchors to its own
        review date.
      </p>

      <h2>Scope split &mdash; honest about what we cover</h2>
      <p>
        {c.name} runs a hybrid scope. The depth of coverage differs between the United
        States and the rest of the world, and we do not pretend otherwise:
      </p>
      <ul>
        <li>
          <strong>US:</strong> 51 states (50 + DC) at 18 anchored fields per state, plus 35
          US cities at lower depth. The state-level surface is the deepest part of the site.
        </li>
        <li>
          <strong>International:</strong> 159 cities across 97 countries with a smaller
          per-city field set. International depth is intentionally shallower because the
          underlying data is shallower.
        </li>
      </ul>
      <p>
        Per-page labels make the depth difference explicit. We do not present a US-state
        page and a Bangkok page as equivalent products.
      </p>

      <h2>Selection criteria</h2>
      <p>
        {c.name} does not generate a page for every possible city or state slug. Coverage is
        driven by:
      </p>
      <ul>
        <li>
          <strong>Source availability.</strong> A city or state must have at least one
          named anchored source publishing the relevant metric within the last two years.
          Cities below the per-source observation floor are excluded.
        </li>
        <li>
          <strong>User demand.</strong> Pages with measurable demand (Google Search Console
          impressions or click-through over a 25-day window) are prioritised for review and
          for additional derived-metric coverage.
        </li>
        <li>
          <strong>Network coherence.</strong> Cities or states already covered by sister
          DataPeek sites (cost-of-living, salary, ownership cost) get cross-link priority.
        </li>
      </ul>

      <h2>Drafting and review</h2>
      <p>
        New surfaces and material revisions go through:
      </p>
      <ol>
        <li>
          <strong>Source verification.</strong> Each field is cross-checked against the
          published source URL before deployment. Fields without a source-of-truth are
          labelled as derived and the derivation is documented.
        </li>
        <li>
          <strong>Build-time validation.</strong> Numeric ranges, missing-value handling,
          and bucket assignments are validated during the static build. Pages that fail
          validation do not deploy.
        </li>
        <li>
          <strong>Review.</strong> The editor reads the rendered page before deployment for
          tone, accuracy, and consistency with neighbouring pages.
        </li>
        <li>
          <strong>Publish.</strong> The full site rebuilds and deploys; the section review
          date moves.
        </li>
      </ol>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>
          <strong>We don&apos;t auto-generate per-page commentary with an LLM.</strong> The
          per-city &ldquo;insight&rdquo; sentences are template-fills against numeric
          thresholds; the templates are auditable in <code>lib/insights.ts</code>.
        </li>
        <li>
          <strong>We don&apos;t pretend to be a multiple-listing service.</strong> The
          prices are statistical aggregates, not active listings.
        </li>
        <li>
          <strong>We don&apos;t claim certification backing.</strong> No CFP, MLO, NMLS,
          appraiser, or realtor credential underwrites the team. We are an editorial team
          that reads public sources.
        </li>
        <li>
          <strong>We don&apos;t relabel stale data with a fresher year.</strong> Each
          section anchors to its honest vintage; we do not collapse them into a single
          &ldquo;today&rdquo; cluster.
        </li>
        <li>
          <strong>We don&apos;t ship a public bulk dataset.</strong> The published surface
          (per-city, per-state, rankings, insights) is the published product. There is no
          downloadable dump of the database.
        </li>
      </ul>

      <h2>Tone and language</h2>
      <p>
        {c.name} publishes in English. Editorial tone is neutral, unhedged, and concrete.
        We avoid promotional language, motivational filler, and adjective spam
        (&ldquo;amazing&rdquo;, &ldquo;essential&rdquo;, &ldquo;discover&rdquo;). When
        sources disagree on a metric, we say so. Where an algorithmic estimate diverges
        from an authoritative figure, we keep the algorithmic value with a clear label
        rather than overwriting it.
      </p>

      <h2>Conflicts of interest</h2>
      <p>
        {c.name} does not accept paid placement of city entries, mortgage products, lender
        names, or outbound links. The site is funded by display advertising (Google
        AdSense) only; ad inventory is auctioned by Google&apos;s network, and an
        ad&apos;s appearance on a page does not imply editorial endorsement. The operator
        does not hold equity in any real-estate brokerage, mortgage lender, title insurance
        company, or PropTech startup, and there is no investment relationship between{" "}
        {c.name} and any company whose product appears in an advertising slot.
      </p>

      <h2>Updates</h2>
      <p>
        Material changes to this editorial policy are reviewed and dated on this page.
        Changes that affect what gets published (new selection rule, new cross-check
        requirement, new disclosure) are reflected in the methodology page as well, with
        the same review date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about editorial standards or a specific page:{" "}
        <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
