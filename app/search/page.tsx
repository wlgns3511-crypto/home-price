import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { search } from '@/lib/db';

const c = siteConfig;

export const metadata: Metadata = {
  title: `Search ${c.entity.label}`,
  description: `Search across all ${c.entity.label.toLowerCase()} in ${c.name}.`,
  alternates: { canonical: '/search/' },
  openGraph: { url: "/search/" },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const results = q ? search(q, 50) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Search {c.entity.label}</h1>
      <form action="/search" method="GET" className="mb-6">
        <input type="text" name="q" defaultValue={q || ''} placeholder={`Search ${c.entity.label.toLowerCase()}...`}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </form>

      {q && (
        <p className="text-slate-500 mb-4">{results.length} results for &quot;{q}&quot;</p>
      )}

      <div className="border rounded-lg overflow-hidden">
        {results.map((item, i) => (
          <a key={String(item[c.entity.slugColumn])} href={`/${c.entity.slug}/${item[c.entity.slugColumn]}/`}
            className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(item[c.entity.nameColumn])}</span>
          </a>
        ))}
        {q && results.length === 0 && (
          <p className="p-6 text-center text-slate-500">No results found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
}
