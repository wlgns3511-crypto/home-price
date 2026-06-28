import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: `${c.name} corrections process anchored to US Census Bureau ACS, FHFA HPI, FRED MORTGAGE30US, HUD Fair Market Rent, and OECD Housing Prices source-of-truth verification.`,
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { url: "/corrections-policy/" },
};

export default function CorrectionsPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        Corrections are how a small editorial team stays honest about its mistakes.
        {c.name} publishes housing-affordability data drawn from the US Census Bureau
        American Community Survey (ACS), the Federal Housing Finance Agency (FHFA) House
        Price Index, the Federal Reserve Economic Data (FRED) MORTGAGE30US series, the
        Department of Housing and Urban Development (HUD) Fair Market Rent tables, the
        OECD Housing Prices dataset, and named national statistics offices. If a published
        value on {c.name} disagrees with one of these sources, we want to know, and we
        want to fix it on a known cadence rather than leave the disagreement standing.
      </p>

      <h2>What counts as a correction</h2>
      <ul>
        <li>
          <strong>A factual data error.</strong> The value on a {c.name} page disagrees
          with the named public source we credited (a Census ACS B19013 median household
          income figure, a Census ACS B25077 median home value, an FHFA HPI quarterly
          observation, a FRED MORTGAGE30US rate, an OECD Housing Prices price-to-income
          ratio, or a HUD Fair Market Rent value).
        </li>
        <li>
          <strong>A source mislabel.</strong> The page credits the wrong organization
          (Census ACS vs HUD vs FHFA vs FRED vs OECD) or the wrong release vintage of a
          series.
        </li>
        <li>
          <strong>A methodology bug.</strong> A derived metric (price-to-income ratio,
          Demographia 5-band bucket, Consumer Financial Protection Bureau-tiered
          mortgage burden, cluster rank, mortgage cost delta, buy-vs-rent crossover,
          PITI breakdown) is computed in a way that diverges from what{" "}
          <a href="/methodology/">/methodology/</a> documents.
        </li>
        <li>
          <strong>A broken or wrong cross-link.</strong> A link points at a state slug
          that no longer exists, at a Census ACS table that has been deprecated, at an
          FHFA HPI cut that has been revised, or at a sister site that has retired the
          page.
        </li>
        <li>
          <strong>A factual statement in editorial copy.</strong> A claim in the About,
          Methodology, or insight commentary that is not supported by the cited Census,
          FHFA, FRED, HUD, or OECD source.
        </li>
      </ul>

      <h2>What does not count as a correction</h2>
      <ul>
        <li>
          <strong>A vintage objection.</strong> &ldquo;The OECD Housing Prices dataset
          has released a newer quarterly cut&rdquo; or &ldquo;Census ACS 2024 5-year
          tables are out&rdquo; is a rebuild trigger, not a correction; we ingest on the
          source&apos;s native cadence (Census ACS annually, FHFA HPI quarterly, FRED
          MORTGAGE30US weekly, HUD FMR annually, OECD Housing Prices quarterly) and
          re-publish on the next build, with the entity vintage updated.
        </li>
        <li>
          <strong>Disagreement with a derived metric.</strong> If the price-to-income
          ratio on a page disagrees with a third-party calculator, both numbers can be
          internally consistent if they use different denominators (Census ACS B19013
          gross household income vs. BEA disposable personal income vs. OECD national
          statistics-office series). We document our denominator choice on{" "}
          <a href="/methodology/">/methodology/</a>; a methodology preference is not a
          correction.
        </li>
        <li>
          <strong>Coverage requests.</strong> &ldquo;You should add my city&rdquo; goes
          through the editorial-policy selection rule (which requires a Census ACS or
          OECD Housing Prices observation), not the corrections process.
        </li>
        <li>
          <strong>Editorial tone.</strong> Disagreement with how a page describes
          affordability or how the Demographia cluster-rank result is summarized is
          feedback, not a correction; we read it but we do not log it as a correction.
        </li>
      </ul>

      <h2>What to send</h2>
      <p>
        Email <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a> with:
      </p>
      <ol>
        <li>
          <strong>The page URL.</strong> Full URL on {c.domain}.
        </li>
        <li>
          <strong>The field.</strong> Which value on the page is wrong (Census
          ACS-anchored median home price, FHFA HPI 5-year appreciation, FRED MORTGAGE30US
          rate, HUD Fair Market Rent, OECD price-to-income ratio, etc.).
        </li>
        <li>
          <strong>The value you read on our page.</strong>
        </li>
        <li>
          <strong>The value you believe is correct.</strong>
        </li>
        <li>
          <strong>The source you used to verify it.</strong> URL of the Census ACS
          table (data.census.gov), FHFA HPI release page, FRED series page, HUD User FMR
          page, OECD Housing Prices release, or named national statistics-office page.
          The source must be publicly accessible &mdash; we cannot verify against a
          paywalled MLS extract or a subscription-only consultancy report.
        </li>
        <li>
          <strong>Optional:</strong> a screenshot of the Census, FHFA, FRED, HUD, or
          OECD source page, time-stamped, if the source changes frequently.
        </li>
      </ol>

      <h2>How corrections are processed</h2>
      <ol>
        <li>
          <strong>Receipt.</strong> The editor acknowledges within five business days.
          If the message is missing the Census, FHFA, FRED, HUD, or OECD source URL, the
          acknowledgement asks for it.
        </li>
        <li>
          <strong>Verification.</strong> The editor opens the source URL you sent — the
          Census ACS table, FHFA HPI cut, FRED MORTGAGE30US weekly observation, HUD FMR
          row, or OECD Housing Prices release — and the underlying database record on
          {c.name}, compares the two, and decides whether the published value is wrong,
          derived correctly from a different vintage, or correctly aligned with the
          source.
        </li>
        <li>
          <strong>Action.</strong> If wrong: queue for the next weekly batch. If a
          vintage gap (e.g. Census ACS released a newer 5-year table after our ingest):
          add to the next ingestion cycle and reply explaining the cadence. If correctly
          aligned: reply with a written explanation citing the Census, FHFA, FRED, HUD,
          or OECD source we used.
        </li>
        <li>
          <strong>Deployment.</strong> Approved corrections ship in the next site
          rebuild (typically within seven days). The affected section&apos;s review date
          moves; the entity vintage moves only if the underlying Census, FHFA, FRED,
          HUD, or OECD data was re-ingested.
        </li>
        <li>
          <strong>Reply.</strong> The editor confirms the correction was applied with a
          link to the updated page, or returns a written reason for declining.
        </li>
      </ol>

      <h2>What changes on the page when a correction lands</h2>
      <ul>
        <li>
          The published numeric value changes to the corrected Census ACS / FHFA HPI /
          FRED / HUD / OECD-anchored figure.
        </li>
        <li>
          The section review date in the page&apos;s vintage block moves to the
          deployment date.
        </li>
        <li>
          If the correction reveals a methodology bug, the methodology page is updated
          and its review date moves with the same deployment.
        </li>
        <li>
          If the correction is large enough to materially shift a Census ACS-anchored
          ranking or an OECD Housing Prices cross-country ranking, the affected ranking
          is re-rendered and its insight summary is regenerated against the corrected
          inputs.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>
          <strong>We do not silently overwrite.</strong> A corrected Census, FHFA, FRED,
          HUD, or OECD value carries an updated section review date. Readers can tell
          when a page has moved.
        </li>
        <li>
          <strong>We do not retroactively rewrite editorial copy</strong> to make a past
          insight appear consistent with the corrected number. If the previous insight
          read &ldquo;PIR above 7 indicates severe stress&rdquo; under an old Census
          ACS-derived PIR of 7.4, and the corrected PIR is 6.8, the insight is
          regenerated against 6.8; we do not pretend the old insight was always right.
        </li>
        <li>
          <strong>We do not run a public correction log.</strong> The deployed page
          shows the current Census / FHFA / FRED / HUD / OECD-anchored value and its
          review date. If you need a deeper audit trail (which value was published
          when), email and we will pull the build-history record.
        </li>
      </ul>

      <h2>Network-level corrections</h2>
      <p>
        Corrections that span more than {c.name} (e.g. a methodology choice shared
        across DataPeek sites that touches Census ACS or BEA inputs differently) are
        routed to the network editorial pipeline at{" "}
        <a href="https://datapeekfacts.com/corrections/" rel="noopener">
          datapeekfacts.com/corrections
        </a>
        . The network applies the correction across affected sister sites in a
        coordinated deployment.
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
        Corrections: <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a>, or
        via <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
