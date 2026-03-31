import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { webPageSchema } from '@/lib/schema';
import { EditorNote } from '@/components/EditorNote';
import { DataSourceBadge } from '@/components/DataSourceBadge';

const c = siteConfig;
const desc = `How ${c.name} collects, processes, and presents housing data from official sources.`;
export const metadata: Metadata = { title: 'Methodology', description: desc, alternates: { canonical: '/methodology' }, openGraph: { title: 'Methodology', description: desc, url: '/methodology' } };

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema('Methodology', desc, '/methodology')) }} />
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>Our Methodology</h1>

      <EditorNote note={`${c.name} processes housing data from OECD, Numbeo, and national statistics offices. Every data point traces back to an official source.`} />

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>All data on {c.name} is sourced from <a href={c.dataSource.url} className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">{c.dataSource.name}</a>, a trusted public data source. Our most recent dataset covers {c.dataSource.year}.</p>
      <p>We combine data from three primary categories of official sources:</p>
      <ul>
        <li><strong>OECD Housing Prices Index</strong> — standardized price-to-income and price-to-rent ratios for member countries</li>
        <li><strong>National Statistics Offices</strong> — country-level housing surveys, census data, and property registries</li>
        <li><strong>Numbeo</strong> — crowdsourced cost-of-living data cross-referenced with official statistics for validation</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Processing</h2>
      <p>Raw data is cleaned, normalized, and enriched through automated pipelines. We remove outliers, fill gaps using statistical methods, and cross-reference multiple sources where available. All prices are converted to USD using current exchange rates for international comparability.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Update Frequency</h2>
      <p>Data is updated whenever new releases are available from our primary sources. Each page displays a &ldquo;Last updated&rdquo; timestamp to indicate data freshness.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy & Limitations</h2>
      <p>While we strive for accuracy, all data comes with inherent limitations. Government datasets may have reporting delays, sampling errors, or geographic gaps. Users should treat our data as informational rather than definitive.</p>

      <DataSourceBadge sources={[
        { name: 'OECD', url: 'https://data.oecd.org/price/housing-prices.htm' },
        { name: 'Numbeo', url: 'https://www.numbeo.com/property-investment/' },
      ]} />

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Found an error? Visit our <a href="/contact" className={`text-${c.colors.primary}-600 hover:underline`}>Contact page</a>.</p>
    
      <h2>Official Data Sources</h2>
      <ul>
        <li><a href="https://www.numbeo.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Numbeo Cost of Living</a></li>
        <li><a href="https://data.oecd.org/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">OECD Data</a></li>
      </ul>
    </article>
  );
}
