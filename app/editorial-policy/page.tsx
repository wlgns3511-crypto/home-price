import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: `Editorial standards for ${c.name}.`,
  alternates: { canonical: '/editorial-policy/' },
  openGraph: { url: '/editorial-policy/' },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl">
      <h1>Editorial Policy</h1>
      <p>
        {c.name} publishes data pages and guides sourced from official public datasets. We favor
        source transparency over recency theater: pages show the actual data vintage, not just the
        year a page was refreshed.
      </p>
      <h2>How we publish</h2>
      <p>
        We label the underlying dataset, the data vintage, and the last review date on page. When a
        calculation or comparison is derived, we explain the method on our methodology page.
      </p>
      <h2>What we avoid</h2>
      <p>
        We do not relabel stale data with a newer year, invent expert credentials, or hide source
        limitations. Where the source is incomplete, we say so directly.
      </p>
      <h2>Corrections</h2>
      <p>
        If you find an error, use the contact page or the correction link on the site. Material
        corrections are reviewed and reflected on-page after verification.
      </p>
    </article>
  );
}
