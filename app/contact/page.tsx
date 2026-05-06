import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_REVIEWED } from "@/lib/authorship";

const c = siteConfig;

export const metadata: Metadata = {
  title: "Contact",
  description: `${c.name} contact: how to reach the editor, what to send, expected reply window.`,
  alternates: { canonical: "/contact/" },
  openGraph: { url: "/contact/" },
};

export default function ContactPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Contact</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        {c.name} runs no comments system, no forum, and no live-chat. The single channel into the
        editorial team is plain email. The editor reads incoming mail in batches and replies within
        five business days; complex questions that need source verification can take longer.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 my-6 not-prose">
        <h2 className="text-lg font-semibold mb-3">Email</h2>
        <p className="text-base">
          <strong>Editor:</strong>{" "}
          <a
            href={`mailto:contact@${c.domain}`}
            className="text-blue-700 hover:underline"
          >
            contact@{c.domain}
          </a>
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Reply window: within five business days. Korea-based editor, KST hours.
        </p>
      </div>

      <h2>What to send</h2>
      <ul>
        <li>
          <strong>Corrections.</strong> Page URL, the field you believe is wrong, the value you
          read, the value you believe is correct, and the source URL or document you used to
          verify the discrepancy. Corrections are processed in weekly batches and applied in the
          next deployment; the affected section&apos;s review date moves to reflect the change.
          See <a href="/corrections-policy/">/corrections-policy/</a> for the full process.
        </li>
        <li>
          <strong>Coverage requests.</strong> Tell us which city or state should be added, and
          which named public source covers it. We add coverage where there is at least one
          anchored source publishing the relevant metric within the last two years; we cannot add a
          city for which no public source publishes a price-to-income or rent series.
        </li>
        <li>
          <strong>Methodology questions.</strong> The verbatim algorithm for cluster rank,
          price-to-income, and bucket assignment lives on{" "}
          <a href="/methodology/">/methodology/</a>. If something there is unclear, write and we
          will sharpen the page.
        </li>
        <li>
          <strong>Press inquiries.</strong> Same address. Identify the publication and the
          deadline; we route press inquiries through the same editorial pipeline as corrections.
        </li>
        <li>
          <strong>Privacy / data requests.</strong> See <a href="/privacy/">/privacy/</a>. For a
          GA4 user-deletion request, include the approximate date, time, and city of the visit so
          the request can be passed to Google&apos;s deletion API.
        </li>
      </ul>

      <h2>What we do not handle by email</h2>
      <ul>
        <li>
          <strong>Real-estate transactions.</strong> We are not a brokerage, not a lender, and not
          an MLS. For an actual purchase, refinance, or relocation question, a licensed local
          professional is the right contact, not us.
        </li>
        <li>
          <strong>Paid placement requests.</strong> {c.name} does not accept paid city entries,
          paid mortgage-product placements, or paid removal of unfavourable city rankings. Emails
          asking for these are not answered.
        </li>
        <li>
          <strong>Generic SEO outreach.</strong> Link-exchange, guest-post, and &ldquo;sponsored
          insert&rdquo; pitches are not answered.
        </li>
        <li>
          <strong>Customer support for advertisers.</strong> Ads on the site are served by Google
          AdSense; questions about a specific ad belong with Google, not us.
        </li>
      </ul>

      <h2>Reply window</h2>
      <p>
        Korea Standard Time business hours. Mail received Saturday or Sunday is read on Monday. We
        do not run a 24-hour rotation; if you have not heard back inside five business days, the
        message is most likely caught in spam &mdash; resend with a short subject line and no
        attachments.
      </p>

      <h2>The DataPeek network</h2>
      <p>
        For network-level inquiries (cross-site partnerships, data licensing across the network,
        editorial-policy questions that span more than {c.name}), the network address is on{" "}
        <a href="https://datapeekfacts.com/contact/" rel="noopener">
          datapeekfacts.com/contact
        </a>
        .
      </p>

      <AuthorBox layer="legal" />
    </article>
  );
}
