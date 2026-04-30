import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { itemListSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Housing Market Guides — Data-Driven Buying, Renting & Comparison',
  description: 'In-depth guides on how to read housing data, compare prices across countries, decide whether to rent or buy, and avoid the traps that fool most buyers. Research-backed, city-agnostic, updated regularly.',
  alternates: { canonical: '/guide/' },
  openGraph: { title: 'Housing Market Guides', description: 'In-depth guides on housing data, price comparison, and the rent vs buy decision.', url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();
  const listItems = guides.map((g) => ({ name: g.title, url: `/guide/${g.slug}/` }));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema('HomePricePeek Guides', '/guide/', listItems)) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Housing Market Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, evidence-based guides on the housing market. How to read prices honestly,
          compare cities and countries without getting fooled, decide whether to rent or buy, and
          avoid the statistical traps that mislead most buyers. Every guide links back to our city
          and country data so you can apply what you read immediately.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Put these guides to work</h2>
        <p className="text-sm text-slate-600 mb-4">
          Read a guide, then apply it to real markets with our data tools.
        </p>
        <ul className="space-y-2 text-sm">
          {/* 2026-04-28 — 'Compare any two cities' bullet 제거 (AdSense scaled-content remediation) */}
          <li>
            <Link href="/rankings/" className="text-emerald-700 hover:underline font-medium">Affordability rankings →</Link>
            <span className="text-slate-500"> cities sorted by price-to-income ratio</span>
          </li>
          <li>
            <Link href="/city/" className="text-emerald-700 hover:underline font-medium">Browse all cities →</Link>
            <span className="text-slate-500"> 500+ cities with current data</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
