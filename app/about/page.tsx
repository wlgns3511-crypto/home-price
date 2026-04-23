import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { webPageSchema } from '@/lib/schema';
import { EditorNote } from '@/components/EditorNote';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const c = siteConfig;
const desc = `Learn about ${c.name}, our mission, and the official data sources behind our global housing price comparison tool.`;
export const metadata: Metadata = { title: `About ${c.name}`, description: desc, alternates: { canonical: '/about/' }, openGraph: { title: `About ${c.name}`, description: desc, url: '/about/' } };

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(`About ${c.name}`, desc, '/about/')) }} />
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>About {c.name}</h1>

      <EditorNote note={`${c.name} is part of the DataPeek Facts network — a collection of 29 free data tools powered by official government and institutional sources.`} />

      <p>{c.name} is a free data tool: {c.description}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>We make public housing data accessible and easy to understand for everyone. Whether you&apos;re relocating, investing, or simply curious about property markets around the world, {c.name} provides transparent, comparable data across 500+ cities.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">The DataPeek Network</h2>
      <p>{c.name} is part of <a href="https://datapeekfacts.com" className={`text-${c.colors.primary}-600 hover:underline`}>DataPeek Facts</a>, a network of specialized data platforms covering salaries, cost of living, healthcare, education, energy, and more — all built on official data sources.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>Data sourced from <a href={c.dataSource.url} className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">{c.dataSource.name}</a> ({c.dataSource.year}). See our <a href="/methodology/" className={`text-${c.colors.primary}-600 hover:underline`}>Methodology</a> for full details on data processing.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Visit our <a href="/contact/" className={`text-${c.colors.primary}-600 hover:underline`}>Contact page</a>.</p>

      <CrossSiteLinks current={c.name} />
    </article>
  );
}
