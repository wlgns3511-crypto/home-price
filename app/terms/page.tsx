import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `${c.name} terms of service: what the site is, what it is not, acceptable use, governing law.`,
  alternates: { canonical: "/terms/" },
  openGraph: { url: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        These Terms govern access to {c.domain}. By using the site, you agree to the conditions
        below. If you do not agree, do not use the site.
      </p>

      <h2>What the site is</h2>
      <p>
        {c.name} is a free editorial reference that compiles housing-affordability data from named
        public sources (OECD, Zillow ZHVI, FHFA HPI, Census ACS, FRED MORTGAGE30US, and named
        national statistics offices) and publishes per-state, per-city, and ranking pages with
        derived metrics computed deterministically at build time. The site is not a brokerage,
        listing service, lender, appraiser, or financial-advice provider.
      </p>

      <h2>What the site is not</h2>
      <ul>
        <li>
          <strong>Not personalized advice.</strong> Nothing on {c.name} is a recommendation that
          you buy, sell, rent, or refinance a specific property, take a specific mortgage, or move
          to a specific city. Use a licensed local professional for those decisions.
        </li>
        <li>
          <strong>Not real-time.</strong> Data is refreshed on each source&apos;s native cadence
          (OECD quarterly, ACS annually, FHFA quarterly, FRED weekly). The vintage of every page is
          labeled on page; we do not relabel a corpus year.
        </li>
        <li>
          <strong>Not an MLS.</strong> Prices are statistical aggregates anchored to public series,
          not active listings.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Scrape the site at a rate that degrades service for other readers, or attempt to extract
          the underlying database. There is no public bulk-data download; respect that.
        </li>
        <li>
          Re-publish substantial portions of {c.name} content as if it were original. Short
          quotation with attribution and a link to the source page is fine; full-page mirrors are
          not.
        </li>
        <li>
          Use {c.name} content to train a generative model intended for commercial redistribution.
          Reading the site, taking notes, and citing it in research is fine.
        </li>
        <li>
          Probe the site for vulnerabilities, attempt to bypass rate limits, or interfere with
          Cloudflare&apos;s bot mitigation.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Editorial text, page layout, derived-metric algorithms, and the cluster-rank presentation
        on {c.name} are copyright the editorial team. The underlying numeric data is the property
        of the named source organizations and is reproduced under fair-use / data-reference norms;
        attribution is on every page that uses a value. You may quote a single value with a link
        back without a separate licence.
      </p>

      <h2>Accuracy and warranty disclaimer</h2>
      <p>
        We aim for accuracy and run build-time validation against the source data, but we do not
        warrant that every published value is correct, current, or fit for any specific purpose.
        Sources publish corrections after the fact; build-time validation cannot catch every
        upstream revision. {c.name} is provided &ldquo;as is&rdquo; without warranty of
        merchantability, fitness for a particular purpose, or non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, the editorial team is not liable for
        indirect, incidental, consequential, or punitive damages arising out of access to or use
        of the site, or out of reliance on a published value. If you make a financial decision
        based on a {c.name} page without independent verification, that decision is yours.
      </p>

      <h2>Advertising</h2>
      <p>
        {c.name} carries Google AdSense display advertising. Ad inventory is auctioned by
        Google&apos;s network, not by the editorial team; an ad&apos;s appearance on a page does
        not imply editorial endorsement of the advertiser. We do not accept paid placement of city
        entries, mortgage products, or lender names in editorial content.
      </p>

      <h2>External links</h2>
      <p>
        Pages on {c.name} link to source organizations (OECD, Census, FRED, named national
        statistics offices) and to sister DataPeek sites. We do not control external sites and are
        not responsible for their content or privacy practices.
      </p>

      <h2>Termination</h2>
      <p>
        We may restrict or suspend access for users who violate the acceptable-use rules above,
        without notice. Routine readers will never see this happen.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the law of the Republic of Korea, without regard to conflict-
        of-laws principles. The Seoul Central District Court is the forum for any dispute that
        cannot be resolved by email. Local consumer-protection rights in your jurisdiction are not
        displaced by this clause.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes are reviewed and dated on this page. Continued use of the site after a
        change constitutes acceptance. The review date moves when a change actually ships.
      </p>

      <h2>Contact</h2>
      <p>
        Terms questions: <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a>, or via{" "}
        <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
