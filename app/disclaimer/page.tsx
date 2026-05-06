import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${c.name} disclaimer: not financial, legal, or real-estate advice; not a brokerage; not a lender; data limits.`,
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        {c.name} is a free public-data reference. This page makes plain what the site is and is
        not, so there is no ambiguity about what readers can rely on.
      </p>

      <h2>Not financial advice</h2>
      <p>
        Nothing on {c.name} is investment, tax, mortgage, or financial-planning advice. Pages
        compare housing-affordability metrics drawn from public sources; they do not assess your
        individual financial situation, your risk tolerance, your tax position, or your eligibility
        for a specific mortgage product. The team behind {c.name} does not hold CFP, MLO, NMLS, or
        appraiser certification, and we do not claim to. For a real purchase, refinance, or
        relocation decision, consult a qualified professional licensed in your jurisdiction.
      </p>

      <h2>Not legal advice</h2>
      <p>
        Discussions of property tax, transfer tax, foreign-buyer rules, or rent-control regimes on{" "}
        {c.name} are factual summaries of publicly stated rules and are not legal advice for a
        specific transaction. Tax rules and rental laws differ by jurisdiction and change without
        notice. Verify with a local lawyer or tax professional before relying on a tax-treatment
        statement on this site.
      </p>

      <h2>Not a brokerage, lender, appraiser, or MLS</h2>
      <p>
        We do not list properties for sale, do not represent buyers or sellers, do not originate or
        broker mortgages, do not produce appraisals, and do not host an MLS feed. Prices on this
        site are statistical aggregates from public series (Zillow ZHVI, FHFA HPI, OECD price-to-
        income, named national statistics offices) and are not quotes for a specific property.
      </p>

      <h2>Data accuracy and limits</h2>
      <p>
        {c.name} aims for accuracy and validates inputs at build time, but cannot warrant that
        every value is current or correct. Specifically:
      </p>
      <ul>
        <li>
          <strong>Vintage.</strong> Each section anchors to its honest review date. The OECD
          release we ingested is anchored to its own observation date, not the ingestion date or
          the date you happen to read the page.
        </li>
        <li>
          <strong>Resolution.</strong> International data is metro-level; US data is state- and
          metro-level. Within a large metro, prices can vary 3&ndash;5&times; between
          neighborhoods, which our data cannot capture.
        </li>
        <li>
          <strong>Currency.</strong> Cross-country comparisons use exchange rates as of the
          ingestion window. A 5&ndash;10% FX move after publication is not reflected on the page
          until the next rebuild.
        </li>
        <li>
          <strong>Derived metrics.</strong> Price-to-income ratios, Demographia buckets,
          buy-vs-rent crossover years, and PITI breakdowns are computed deterministically from the
          inputs documented on <a href="/methodology/">/methodology/</a>. They are estimates, not
          authoritative figures, and we label them as such on page.
        </li>
      </ul>

      <h2>Forward-looking statements</h2>
      <p>
        {c.name} does not forecast prices, rents, or rates beyond the most recent observed value.
        Where a page discusses recent appreciation or current cost burden, those statements describe
        the past and the present, not the future.
      </p>

      <h2>Advertising</h2>
      <p>
        {c.name} carries Google AdSense display advertising. Ad inventory is auctioned by
        Google&apos;s network. Ads on this site are not editorial endorsements; we cannot vouch for
        the products or services advertised, and we do not have a financial relationship with the
        advertisers beyond the standard AdSense revenue share with Google.
      </p>

      <h2>External links</h2>
      <p>
        Source links on {c.name} go to OECD, Census Bureau, FHFA, FRED, Zillow research, and named
        national statistics offices. We do not control those sites. Their data may change between
        our ingest and your visit.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, the editorial team is not liable for
        any loss arising from reliance on a published value, a derived metric, or a comparison
        across cities. The site is provided &ldquo;as is&rdquo;.
      </p>

      <h2>Contact</h2>
      <p>
        Concerns about a specific page or value:{" "}
        <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a>, or via{" "}
        <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
