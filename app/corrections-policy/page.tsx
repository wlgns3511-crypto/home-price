import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: `${c.name} corrections process: what to send, how it is processed, how applied corrections are reflected on page.`,
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
        Corrections are how a small editorial team stays honest about its mistakes. {c.name}
        publishes housing-affordability data from public sources; if a published value disagrees
        with the source we cited, we want to know, and we want to fix it on a known cadence rather
        than leave the disagreement standing.
      </p>

      <h2>What counts as a correction</h2>
      <ul>
        <li>
          <strong>A factual data error.</strong> The value on a {c.name} page disagrees with the
          named public source we credited (e.g. a Zillow ZHVI figure, an OECD price-to-income
          ratio, a Census ACS median income).
        </li>
        <li>
          <strong>A source mislabel.</strong> The page credits the wrong source organization or
          the wrong release of a series.
        </li>
        <li>
          <strong>A methodology bug.</strong> A derived metric (price-to-income, Demographia
          bucket, cluster rank, mortgage cost delta, buy-vs-rent crossover, PITI) is computed in a
          way that diverges from what{" "}
          <a href="/methodology/">/methodology/</a> documents.
        </li>
        <li>
          <strong>A broken or wrong cross-link.</strong> A link points at a city / state slug that
          no longer exists, or at a sister site that has retired the page.
        </li>
        <li>
          <strong>A factual statement in editorial copy.</strong> A claim in the About,
          Methodology, or insight commentary that is not supported by the cited source.
        </li>
      </ul>

      <h2>What does not count as a correction</h2>
      <ul>
        <li>
          <strong>A vintage objection.</strong> &ldquo;The OECD has released a newer cut&rdquo; is
          a rebuild trigger, not a correction; we ingest on the source&apos;s native cadence and
          re-publish on the next build, with the entity vintage updated.
        </li>
        <li>
          <strong>Disagreement with a derived metric.</strong> If the price-to-income ratio on a
          page disagrees with a third-party calculator, both numbers can be internally consistent
          if they use different denominators (gross household income vs. disposable income, ACS
          vs. national statistics-office series). We document our denominator choice on{" "}
          <a href="/methodology/">/methodology/</a>; a methodology preference is not a correction.
        </li>
        <li>
          <strong>Coverage requests.</strong> &ldquo;You should add my city&rdquo; goes through
          the editorial-policy selection rule, not the corrections process.
        </li>
        <li>
          <strong>Editorial tone.</strong> Disagreement with how a page describes affordability or
          how the cluster-rank result is summarized is feedback, not a correction; we read it but
          we do not log it as a correction.
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
          <strong>The field.</strong> Which value on the page is wrong (median home price,
          price-to-income, 5-year FHFA appreciation, etc.).
        </li>
        <li>
          <strong>The value you read on our page.</strong>
        </li>
        <li>
          <strong>The value you believe is correct.</strong>
        </li>
        <li>
          <strong>The source you used to verify it.</strong> URL of the OECD release, FHFA HPI cut,
          ACS table, FRED series, or named national statistics-office page. The source must be
          publicly accessible &mdash; we cannot verify against a paywalled MLS extract or a
          subscription-only consultancy report.
        </li>
        <li>
          <strong>Optional:</strong> a screenshot of the source page, time-stamped, if the source
          changes frequently.
        </li>
      </ol>

      <h2>How corrections are processed</h2>
      <ol>
        <li>
          <strong>Receipt.</strong> The editor acknowledges within five business days. If the
          message is missing one of the items above, the acknowledgement asks for it.
        </li>
        <li>
          <strong>Verification.</strong> The editor opens the source URL you sent and the
          underlying database record on {c.name}, compares the two, and decides whether the
          published value is wrong, derived correctly from a different vintage, or correctly
          aligned with the source.
        </li>
        <li>
          <strong>Action.</strong> If wrong: queue for the next weekly batch. If a vintage gap:
          add to the next ingestion cycle and reply explaining the cadence. If correctly aligned:
          reply with a written explanation citing the source we used.
        </li>
        <li>
          <strong>Deployment.</strong> Approved corrections ship in the next site rebuild
          (typically within seven days). The affected section&apos;s review date moves; the entity
          vintage moves only if the underlying data was re-ingested.
        </li>
        <li>
          <strong>Reply.</strong> The editor confirms the correction was applied with a link to
          the updated page, or returns a written reason for declining.
        </li>
      </ol>

      <h2>What changes on the page when a correction lands</h2>
      <ul>
        <li>
          The published numeric value changes to the corrected figure.
        </li>
        <li>
          The section review date in the page&apos;s vintage block moves to the deployment date.
        </li>
        <li>
          If the correction reveals a methodology bug, the methodology page is updated and its
          review date moves with the same deployment.
        </li>
        <li>
          If the correction is large enough to materially shift a ranking page, the affected
          ranking is re-rendered and its insight summary is regenerated against the corrected
          inputs.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>
          <strong>We do not silently overwrite.</strong> A corrected value carries an updated
          section review date. Readers can tell when a page has moved.
        </li>
        <li>
          <strong>We do not retroactively rewrite editorial copy</strong> to make a past insight
          appear consistent with the corrected number. If the previous insight read &ldquo;PIR
          above 7 indicates severe stress&rdquo; under an old PIR of 7.4, and the corrected PIR is
          6.8, the insight is regenerated against 6.8; we do not pretend the old insight was always
          right.
        </li>
        <li>
          <strong>We do not run a public correction log.</strong> The deployed page shows the
          current value and its review date. If you need a deeper audit trail (which value was
          published when), email and we will pull the build-history record.
        </li>
      </ul>

      <h2>Network-level corrections</h2>
      <p>
        Corrections that span more than {c.name} (e.g. a methodology choice shared across DataPeek
        sites) are routed to the network editorial pipeline at{" "}
        <a href="https://datapeekfacts.com/corrections/" rel="noopener">
          datapeekfacts.com/corrections
        </a>
        . The network applies the correction across affected sister sites in a coordinated
        deployment.
      </p>

      <h2>Contact</h2>
      <p>
        Corrections: <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a>, or via{" "}
        <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
