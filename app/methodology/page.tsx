import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;
export const metadata: Metadata = { title: 'Methodology', description: `How ${c.name} collects and processes data.` };

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>Our Methodology</h1>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>All data on {c.name} is sourced from <a href={c.dataSource.url} className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">{c.dataSource.name}</a>, a trusted public data source. Our most recent dataset covers {c.dataSource.year}.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Processing</h2>
      <p>Raw data is cleaned, normalized, and enriched through automated pipelines. We remove outliers, fill gaps using statistical methods, and cross-reference multiple sources where available.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Update Frequency</h2>
      <p>Data is updated whenever new releases are available from our primary sources. Each page displays a &ldquo;Last updated&rdquo; timestamp to indicate data freshness.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy & Limitations</h2>
      <p>While we strive for accuracy, all data comes with inherent limitations. Government datasets may have reporting delays, sampling errors, or geographic gaps. Users should treat our data as informational rather than definitive.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Found an error? Visit our <a href="/contact" className={`text-${c.colors.primary}-600 hover:underline`}>Contact page</a>.</p>
    </article>
  );
}
