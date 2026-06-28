import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${c.name} disclaimer: not financial, legal, or real-estate advice; not a brokerage; not a lender; data limits anchored to Census ACS, FHFA HPI, FRED MORTGAGE30US, and OECD Housing Prices.`,
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
        {c.name} is a free public-data reference that re-publishes housing-affordability
        metrics drawn from named public series: the US Census Bureau American Community
        Survey (ACS) 5-year tables, the Federal Housing Finance Agency (FHFA) House Price
        Index, the Federal Reserve Economic Data (FRED) MORTGAGE30US weekly observation,
        the Department of Housing and Urban Development (HUD) Fair Market Rent tables, the
        Organisation for Economic Co-operation and Development (OECD) Housing Prices
        dataset, and named national statistics offices outside the OECD. This page makes
        plain what the site is and is not, so there is no ambiguity about what readers can
        rely on.
      </p>

      <h2>Not financial advice</h2>
      <p>
        Nothing on {c.name} is investment, tax, mortgage, or financial-planning advice.
        Pages compare housing-affordability metrics drawn from Census ACS B19013 (median
        household income), Census ACS B25077 (median home value), FHFA HPI (price
        trajectory), FRED MORTGAGE30US (national 30-year fixed mortgage rate), HUD Fair
        Market Rent (rent baseline), and OECD Housing Prices (international price-to-income
        and rent-to-income series). They do not assess your individual financial situation,
        your risk tolerance, your tax position, or your eligibility for a specific mortgage
        product. The team behind {c.name} does not hold CFP, MLO, NMLS, or appraiser
        certification, and we do not claim to. For a real purchase, refinance, or
        relocation decision, consult a qualified professional licensed in your
        jurisdiction.
      </p>

      <h2>Not legal advice</h2>
      <p>
        Discussions of property tax, transfer tax, mortgage-interest deduction (with
        reference to the IRS State and Local Tax cap), foreign-buyer rules, or
        rent-control regimes on {c.name} are factual summaries of publicly stated rules,
        anchored where possible to Census ACS source tables, HUD program documentation,
        and federal statutes. They are not legal advice for a specific transaction. Tax
        rules and rental laws differ by jurisdiction and change without notice. Verify
        with a local lawyer or tax professional before relying on a tax-treatment
        statement on this site.
      </p>

      <h2>Not a brokerage, lender, appraiser, or MLS</h2>
      <p>
        We do not list properties for sale, do not represent buyers or sellers, do not
        originate or broker mortgages, do not produce appraisals, and do not host an MLS
        feed. Prices on this site are statistical aggregates from public series — Census
        ACS, FHFA HPI, HUD Fair Market Rent, OECD Housing Prices, and named national
        statistics offices — and are not quotes for a specific property. The FRED
        MORTGAGE30US rate displayed on US state pages is a national average for
        prime-credit borrowers, not your individual rate quote.
      </p>

      <h2>Data accuracy and limits</h2>
      <p>
        {c.name} aims for accuracy and validates inputs at build time, but cannot warrant
        that every value is current or correct. Specifically:
      </p>
      <ul>
        <li>
          <strong>Vintage.</strong> Each section anchors to its honest review date. The
          OECD Housing Prices release we ingested is anchored to its own observation date,
          not the ingestion date or the date you happen to read the page. Census ACS
          5-year tables carry a built-in 12&ndash;18 month lag and are released annually
          by the Census Bureau. FHFA HPI updates quarterly; FRED MORTGAGE30US updates
          weekly.
        </li>
        <li>
          <strong>Resolution.</strong> International data via OECD Housing Prices is
          country- or metro-level. US data via Census ACS is state-level (51 jurisdictions)
          with a smaller set of metros. Within a large metro, prices can vary
          3&ndash;5&times; between neighborhoods, which our data cannot capture.
        </li>
        <li>
          <strong>Currency.</strong> Cross-country comparisons use exchange rates as of
          the OECD release window. A 5&ndash;10% FX move after publication is not
          reflected on the page until the next rebuild.
        </li>
        <li>
          <strong>Derived metrics.</strong> Price-to-income ratios (Demographia 5-band),
          mortgage burden tiers (Consumer Financial Protection Bureau 28/36/43 cutoffs
          applied to Census ACS B19013 income), buy-vs-rent crossover years, and PITI
          breakdowns are computed deterministically from the inputs documented on{" "}
          <a href="/methodology/">/methodology/</a>. They are estimates, not authoritative
          figures, and we label them as such on page.
        </li>
        <li>
          <strong>Cost-burdened share (US states).</strong> The percentage of households
          spending ≥30% of gross income on housing is taken directly from Census ACS
          B25091 (owners) and B25070 (renters). HUD&apos;s 30%-of-income threshold defines
          the burden classification.
        </li>
      </ul>

      <h2>Forward-looking statements</h2>
      <p>
        {c.name} does not forecast prices, rents, or rates beyond the most recent observed
        value published by Census, FHFA, FRED, HUD, or OECD. Where a page discusses recent
        appreciation or current cost burden, those statements describe the past and the
        present, not the future. The FHFA HPI is, by FHFA&apos;s own definition, a
        backward-looking purchase-only repeat-sales index.
      </p>

      <h2>Advertising</h2>
      <p>
        {c.name} carries Google AdSense display advertising. Ad inventory is auctioned by
        Google&apos;s network. Ads on this site are not editorial endorsements; we cannot
        vouch for the products or services advertised, and we do not have a financial
        relationship with the advertisers beyond the standard AdSense revenue share with
        Google. We do not partner with mortgage lenders and do not earn referral fees on
        FRED MORTGAGE30US-driven rate quotes.
      </p>

      <h2>External links</h2>
      <p>
        Source links on {c.name} go to OECD Housing Prices, the US Census Bureau
        (data.census.gov), FHFA House Price Index pages, FRED (fred.stlouisfed.org),
        HUD User (huduser.gov), and named national statistics offices. We do not control
        those sites. Their data may change between our ingest and your visit, and Census
        Bureau, FHFA, FRED, HUD, and OECD release schedules occasionally shift.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, the editorial team is not
        liable for any loss arising from reliance on a published value, a derived metric,
        or a comparison across cities. The Census ACS, FHFA HPI, FRED MORTGAGE30US, HUD
        Fair Market Rent, and OECD Housing Prices series are republished here under their
        respective open-data licences; the site is provided &ldquo;as is&rdquo;.
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
        Concerns about a specific Census, FHFA, FRED, HUD, or OECD anchored value, or
        any other page on the site:{" "}
        <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a>, or via{" "}
        <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
