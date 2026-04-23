import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;

export const metadata: Metadata = {
  title: 'Corrections Policy',
  description: `Correction process for ${c.name}.`,
  alternates: { canonical: '/corrections-policy/' },
  openGraph: { url: '/corrections-policy/' },
};

export default function CorrectionsPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl">
      <h1>Corrections Policy</h1>
      <p>
        {c.name} aims to make data errors easy to report and easy to verify. We review correction
        requests against the underlying public source before updating a page.
      </p>
      <h2>What to send</h2>
      <p>
        Include the page URL, the field you believe is incorrect, and the source link or document
        you used to verify the discrepancy.
      </p>
      <h2>How corrections appear</h2>
      <p>
        When a correction changes the substance of a page, we update the reviewed date and keep the
        revised source labeling visible.
      </p>
      <h2>Scope</h2>
      <p>
        We correct factual data issues, broken links, and methodology mistakes. We do not rewrite
        pages to imply fresher data than the source provides.
      </p>
    </article>
  );
}
