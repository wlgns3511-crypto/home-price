import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;
export const metadata: Metadata = { title: `About ${c.name}`, description: `Learn about ${c.name} and our data sources.` };

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>About {c.name}</h1>
      <p>{c.name} is a free data tool: {c.description}</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>We make public data accessible and easy to understand for everyone.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>Data sourced from <a href={c.dataSource.url} className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">{c.dataSource.name}</a> ({c.dataSource.year}).</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Visit our <a href="/contact" className={`text-${c.colors.primary}-600 hover:underline`}>Contact page</a>.</p>
    </article>
  );
}
