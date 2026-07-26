import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Corrections Policy",
  // 2026-07-26 — HUD FMR · OECD Housing Prices 제거(인제스천 0건, data/sources.json 15필드에 없음).
  // 이 페이지는 "Census/FHFA/FRED/HUD/OECD" 를 15번 반복하고 있었다 — 매 반복이 같은 거짓의
  // 재발행. 실배선된 5개를 상단에서 한 번 정의하고, 이후엔 "the cited source" 로 참조한다.
  description: `${c.name} corrections process anchored to Zillow ZHVI, US Census Bureau ACS, FHFA HPI, FRED MORTGAGE30US, and Tax Foundation source-of-truth verification.`,
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
        {c.name} publishes housing-affordability data for 51 US jurisdictions, drawn from
        five ingested sources: the Zillow Home Value Index, the US Census Bureau American
        Community Survey (ACS) 5-year tables, the Federal Housing Finance Agency (FHFA)
        House Price Index, the Federal Reserve Economic Data (FRED) MORTGAGE30US series,
        and Tax Foundation property-tax rates (plus NAIC premiums for the carrying-cost
        line). Those five are the whole list &mdash; there is no city surface and no
        international surface behind them. If a published value disagrees with the source
        we credited for it, we want to know, and we want to fix it on a known cadence
        rather than leave the disagreement standing.
      </p>

      <h2>What counts as a correction</h2>
      <ul>
        <li>
          <strong>A factual data error.</strong> The value on a {c.name} page disagrees
          with the source we credited for it &mdash; a Zillow ZHVI typical home value, a
          Census ACS B19013 median household income, a B25091/B25070 cost-burdened share,
          an FHFA HPI appreciation figure, a FRED MORTGAGE30US rate, a Tax Foundation
          effective property-tax rate, or a NAIC average premium.
        </li>
        <li>
          <strong>A source mislabel.</strong> The page credits the wrong organization, the
          wrong release vintage, or &mdash; the failure mode that produced the July 2026
          withdrawals &mdash; an authority whose data we never ingested at all.
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
          Methodology, or insight commentary that is not supported by the source it cites
          &mdash; including a claim about our own coverage or source list.
        </li>
      </ul>

      <h2>What does not count as a correction</h2>
      <ul>
        <li>
          <strong>A vintage objection.</strong> &ldquo;Zillow has posted a newer monthly
          ZHVI&rdquo; or &ldquo;Census ACS 2024 5-year tables are out&rdquo; is a rebuild
          trigger, not a correction; we ingest on each source&apos;s native cadence (ZHVI
          monthly, Census ACS annually, FHFA HPI quarterly, FRED MORTGAGE30US weekly,
          Tax Foundation and NAIC annually) and re-publish on the next build, with the
          entity vintage updated.
        </li>
        <li>
          <strong>Disagreement with a derived metric.</strong> If the price-to-income
          ratio on a page disagrees with a third-party calculator, both numbers can be
          internally consistent if they use different denominators (Census ACS B19013
          gross household income vs. BEA disposable personal income vs. a
          post-tax-and-transfer series). We document our denominator choice on{" "}
          <a href="/methodology/">/methodology/</a>; a methodology preference is not a
          correction.
        </li>
        <li>
          <strong>Coverage requests.</strong> &ldquo;You should add my city&rdquo; or
          &ldquo;add my country&rdquo; is a scope question, not a correction. We publish
          one axis &mdash; 51 US jurisdictions &mdash; and a new axis would need an
          ingested series behind it first; see{" "}
          <a href="/editorial-policy/">/editorial-policy/</a>.
        </li>
        <li>
          <strong>Editorial tone.</strong> Disagreement with how a page describes
          affordability, or with how the peer-cluster comparison is summarized, is
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
          <strong>The field.</strong> Which value on the page is wrong (ZHVI typical home
          value, ACS median household income, FHFA HPI 5-year appreciation, FRED
          MORTGAGE30US rate, property-tax rate, etc.).
        </li>
        <li>
          <strong>The value you read on our page.</strong>
        </li>
        <li>
          <strong>The value you believe is correct.</strong>
        </li>
        <li>
          <strong>The source you used to verify it.</strong> URL of the Zillow Research
          data page, the Census ACS table (data.census.gov), the FHFA HPI release, the FRED
          series page, or the Tax Foundation / NAIC publication. The source must be
          publicly accessible &mdash; we cannot verify against a paywalled MLS extract or a
          subscription-only consultancy report.
        </li>
        <li>
          <strong>Optional:</strong> a time-stamped screenshot of the source page, if that
          source changes frequently (FRED MORTGAGE30US moves weekly).
        </li>
      </ol>

      <h2>How corrections are processed</h2>
      <ol>
        <li>
          <strong>Receipt.</strong> The editor acknowledges within five business days.
          If the message is missing the source URL, the acknowledgement asks for it.
        </li>
        <li>
          <strong>Verification.</strong> The editor opens the source URL you sent and the
          underlying record on {c.name}, compares the two, and decides whether the
          published value is wrong, derived correctly from a different vintage, or
          correctly aligned with the source.
        </li>
        <li>
          <strong>Action.</strong> If wrong: queue for the next weekly batch. If a
          vintage gap (e.g. Census ACS released a newer 5-year table after our ingest):
          add to the next ingestion cycle and reply explaining the cadence. If correctly
          aligned: reply with a written explanation citing the source we used.
        </li>
        <li>
          <strong>Deployment.</strong> Approved corrections ship in the next site
          rebuild (typically within seven days). The affected section&apos;s review date
          moves; the entity vintage moves only if the underlying source data was
          re-ingested.
        </li>
        <li>
          <strong>Reply.</strong> The editor confirms the correction was applied with a
          link to the updated page, or returns a written reason for declining.
        </li>
      </ol>

      <h2>What changes on the page when a correction lands</h2>
      <ul>
        <li>
          The published numeric value changes to the corrected source-anchored figure.
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
          If the correction is large enough to move a state&apos;s position in its peer
          cluster or in the <a href="/state/">state index</a>, those orderings are
          re-rendered and the affected insight summaries are regenerated against the
          corrected inputs.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>
          <strong>We do not silently overwrite.</strong> A corrected value carries an
          updated section review date. Readers can tell when a page has moved.
        </li>
        <li>
          <strong>We do not retroactively rewrite editorial copy</strong> to make a past
          insight appear consistent with the corrected number. If the previous insight
          read &ldquo;PIR above 7 indicates severe stress&rdquo; under an old Census
          ACS-derived PIR of 7.4, and the corrected PIR is 6.8, the insight is
          regenerated against 6.8; we do not pretend the old insight was always right.
        </li>
        <li>
          <strong>We do not run a public correction log.</strong> The deployed page shows
          the current source-anchored value and its review date. If you need a deeper
          audit trail (which value was published when), email and we will pull the
          build-history record.
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
