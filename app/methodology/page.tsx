import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { webPageSchema } from "@/lib/schema";

const c = siteConfig;
const desc =
  "How HomePricePeek sources its global home price and rent data — combining OECD housing price indices, national statistics offices, Numbeo crowdsourced data, and Federal Reserve mortgage rate series.";

export const metadata: Metadata = {
  title: "Our Methodology — How HomePricePeek Builds Its Housing Data",
  description: desc,
  alternates: { canonical: "/methodology/" },
  openGraph: { title: "Our Methodology", description: desc, url: "/methodology/" },
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
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Buying or renting a home is the biggest financial decision most
        households ever make. You deserve to know exactly where our prices,
        rents, and affordability ratios come from, and what they cannot tell
        you about your specific situation.
      </p>

      <div className="not-prose border-l-4 border-amber-400 bg-amber-50 p-4 my-4 rounded-r">
        <p className="text-sm text-amber-900">
          <strong>Important disclosure.</strong> HomePricePeek combines
          authoritative official sources (OECD, Federal Reserve, Census)
          with crowdsourced platforms (Numbeo) for global metro coverage.
          Our city-level figures are best treated as comparison
          <em> baselines</em>, not as live MLS or appraiser quotes. For an
          actual purchase decision, work with a licensed local realtor or
          appraiser.
        </p>
      </div>

      <h2>Primary sources</h2>
      <p>
        Our home price and rent data combines several sources, each
        appropriate for a different geographic scope:
      </p>
      <ul>
        <li>
          <a
            href="https://data.oecd.org/price/housing-prices.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            OECD Housing Prices
          </a>{" "}
          &mdash; standardized price-to-income and price-to-rent ratios
          for OECD member countries, used as the international benchmark
          dataset.
        </li>
        <li>
          <a
            href="https://www.census.gov/topics/housing.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            US Census Bureau Housing
          </a>{" "}
          &mdash; the American Community Survey (ACS) publishes median home
          values, median rents, and homeowner cost burden by city, county,
          ZIP code, and metropolitan area.
        </li>
        <li>
          <a
            href="https://www.federalreserve.gov/releases/h15/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Federal Reserve H.15 Release
          </a>{" "}
          &mdash; the official source for US interest rates including
          conventional mortgage benchmarks.
        </li>
        <li>
          <a
            href="https://www.freddiemac.com/pmms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Freddie Mac Primary Mortgage Market Survey (PMMS)
          </a>{" "}
          &mdash; the most-cited source for weekly US 30-year fixed
          mortgage rates.
        </li>
        <li>
          <a
            href="https://www.numbeo.com/property-investment/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Numbeo Property Prices
          </a>{" "}
          &mdash; a crowdsourced cost-of-living and property database used
          for cities not covered by OECD or national statistics offices.
          We surface Numbeo data with explicit attribution and treat it
          as community-contributed rather than authoritative.
        </li>
        <li>
          National statistics offices for non-US cities &mdash; Statistics
          Canada, ONS UK, Eurostat, etc., where available.
        </li>
      </ul>

      <h2>Affordability metrics we publish</h2>
      <p>For each city we publish:</p>
      <ul>
        <li>
          <strong>Average home price (USD)</strong> &mdash; midpoint of
          single-family home transactions in the metro.
        </li>
        <li>
          <strong>Price per square meter (USD)</strong> &mdash; useful for
          comparing across countries with very different unit conventions.
        </li>
        <li>
          <strong>Average rent (1BR and 3BR, USD)</strong> &mdash; monthly
          asking rent for a representative apartment.
        </li>
        <li>
          <strong>Price-to-income ratio</strong> &mdash; average home price
          divided by median household annual income. The OECD considers
          ratios above 6 as &ldquo;expensive&rdquo; and above 12 as
          &ldquo;severely unaffordable.&rdquo;
        </li>
        <li>
          <strong>Mortgage rate</strong> &mdash; the prevailing 30-year
          fixed rate for the country, sourced from the central bank or
          federal mortgage agency where available.
        </li>
        <li>
          <strong>1-year price change</strong> &mdash; year-over-year
          appreciation or depreciation.
        </li>
      </ul>

      <h2>Currency and inflation handling</h2>
      <p>
        All prices are normalized to USD using market exchange rates as of
        the data reference period. This makes cross-country comparisons
        possible but introduces some volatility for countries with weaker
        or stronger currencies relative to the dollar. For local
        purchasing decisions in your home country, prefer the local
        statistics office&apos;s native-currency figures.
      </p>

      <h2>Update frequency</h2>
      <p>
        OECD housing price indices update quarterly. Census ACS updates
        annually with a 12-18 month lag. Mortgage rate series update
        weekly. Numbeo data updates continuously as contributors submit
        new data points. We refresh our combined dataset monthly,
        prioritizing the most recent authoritative source for each
        metric.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>Metro-level resolution.</strong> Our data is at the
          metropolitan area level, not the neighborhood. Within a large
          metro, prices can vary by 3-5x between neighborhoods.
        </li>
        <li>
          <strong>Average vs. median.</strong> When sources publish only
          averages, we use them; averages can be skewed upward by a few
          high-end transactions. The median is generally a more honest
          number for &ldquo;what would I actually pay?&rdquo;
        </li>
        <li>
          <strong>Crowdsourced data caveats.</strong> Numbeo entries can
          be sparse, biased toward expat-frequented cities, and may not
          reflect what locals actually pay. We label sources clearly so
          you know what you&apos;re looking at.
        </li>
        <li>
          <strong>Mortgage rate ≠ your rate.</strong> The published 30-year
          rate is the average for borrowers with strong credit and a
          standard down payment. Your individual rate depends on credit
          score, debt-to-income ratio, loan size, and lender margin.
        </li>
        <li>
          <strong>Closing costs and ongoing costs not included.</strong>
          The headline home price excludes 2-5% in closing costs and the
          annual carrying costs (property tax, insurance, HOA,
          maintenance) that determine your real monthly outlay.
        </li>
        <li>
          <strong>Not financial advice.</strong> Nothing on HomePricePeek
          constitutes professional real estate, mortgage, or financial
          advice. For decisions with real money on the line, work with a
          licensed professional in your jurisdiction.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published official figure disagrees with what you see here,
        please <a href="/contact/">contact us</a> with the city and the
        source URL. Corrections from the community help us catch
        ingestion bugs quickly.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
