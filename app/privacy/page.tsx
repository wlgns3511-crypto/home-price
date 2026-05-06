import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${c.name} privacy policy: what we collect, what we don't, AdSense / GA4 / Cloudflare disclosure, and how to opt out.`,
  alternates: { canonical: "/privacy/" },
  openGraph: { url: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        {c.name} is a free, account-less housing-data reference. We do not run an email list, do
        not require login, and do not host user-generated content. The site is funded by display
        advertising only. This page documents the limited data the site does collect, who it goes
        to, and how to opt out.
      </p>

      <h2>What we collect</h2>
      <p>
        We do not ask you for personal data. The only data collected during a normal page visit is:
      </p>
      <ul>
        <li>
          <strong>Server access logs</strong> &mdash; the IP address that requested a page, the
          requested URL, the HTTP referer if any, and the user-agent string. Standard web-server
          telemetry, retained for up to 30 days for security review and rotated thereafter.
        </li>
        <li>
          <strong>Google Analytics 4 events</strong> &mdash; pageview, scroll depth, outbound link
          click, and a Google-issued client ID stored in a first-party cookie. We use GA4 only to
          count traffic and identify which pages are read; no remarketing audiences are configured.
        </li>
        <li>
          <strong>Google AdSense</strong> &mdash; cookies set by Google&apos;s ad network to serve
          ads and to limit how often the same ad is shown. Google may use the IP address and
          interaction signals for personalized advertising unless you opt out (see below).
        </li>
        <li>
          <strong>Cloudflare</strong> &mdash; we use Cloudflare as a CDN and bot-mitigation layer.
          Cloudflare sees request metadata (IP, user-agent, requested path) on every page load.
        </li>
      </ul>

      <h2>What we do not collect</h2>
      <ul>
        <li>No account, no password, no email address.</li>
        <li>
          No browser fingerprinting beyond the cookies described above. We do not run cross-device
          stitching or probabilistic identity matching.
        </li>
        <li>
          No location precision beyond the country / city level inferred by GA4 from IP. No GPS, no
          device-sensor access.
        </li>
        <li>
          No financial data &mdash; we are an editorial reference, not a transaction site. We do
          not handle payment information.
        </li>
        <li>
          No commenting system, no forum, no contact form storing PII. The single contact channel
          is plain email (see below).
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        The cookies set on a {c.name} page are set by Google Analytics 4 and Google AdSense, not by
        the site itself. Cloudflare may set a security cookie to identify abusive traffic. None of
        these cookies are used to build a personal profile by {c.name}.
      </p>
      <p>
        You can clear cookies in your browser at any time. Clearing the GA4 client-ID cookie resets
        your visit history as far as we can see it. Clearing AdSense cookies resets ad
        personalization for that browser.
      </p>

      <h2>Opting out</h2>
      <ul>
        <li>
          <strong>AdSense personalization:</strong>{" "}
          <a href="https://www.google.com/settings/ads" rel="noopener" target="_blank">
            Google Ads Settings
          </a>{" "}
          lets you turn off personalized ads for your Google account.
        </li>
        <li>
          <strong>Third-party ad cookies:</strong>{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">
            aboutads.info/choices
          </a>{" "}
          (US) and{" "}
          <a href="https://www.youronlinechoices.eu/" rel="noopener" target="_blank">
            youronlinechoices.eu
          </a>{" "}
          (EU) provide opt-out controls across most ad networks.
        </li>
        <li>
          <strong>Google Analytics:</strong> install the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="noopener"
            target="_blank"
          >
            GA Opt-out Browser Add-on
          </a>{" "}
          to stop GA4 from collecting data from your browser.
        </li>
        <li>
          <strong>Browser-level controls:</strong> all major browsers offer a Do Not Track signal
          and a third-party-cookie block; we honor whatever your browser sends to AdSense.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        {c.name} is not directed at children under 13. We do not knowingly collect data from
        children. If you believe a child has provided data through the contact email, write to us
        and we will delete it.
      </p>

      <h2>Your rights (EU / UK / California)</h2>
      <p>
        If you are in the European Economic Area, the United Kingdom, or California, you have a
        right to know what data is held about you, to request deletion of that data, and to opt out
        of personalized advertising. The data we hold about an individual visitor is essentially
        the GA4 client-ID record and any AdSense cookies on your browser; clearing cookies removes
        the local share, and the GA4 controls above stop further collection. For a deletion request
        beyond that, contact the editor at{" "}
        <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a> with the date and approximate
        time of the visit; we will pass the request to Google&apos;s GA4 user-deletion API.
      </p>

      <h2>International transfers</h2>
      <p>
        Server logs and GA4 / AdSense data are processed by Google&apos;s and Cloudflare&apos;s
        global infrastructure, which means data may be transferred outside the EEA / UK to the
        United States or other Google / Cloudflare regions. Both providers operate under their own
        published privacy frameworks; this site does not add a separate cross-border processing
        layer.
      </p>

      <h2>Governing law</h2>
      <p>
        {c.name} is operated by an editor based in the Republic of Korea. Korean law applies to
        this privacy policy. Local consumer-protection rights in your jurisdiction (GDPR, UK GDPR,
        CCPA, PIPEDA) are honored as described above and are not displaced by the choice of
        Korean law.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes to this policy are reviewed and dated on this page. The review date moves
        when a change actually ships; we do not move the review date as a freshness signal alone.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions: <a href={`mailto:contact@${c.domain}`}>contact@{c.domain}</a>, or via{" "}
        <a href="/contact/">/contact</a>.
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
