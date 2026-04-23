import type { Metadata } from 'next';
import Link from 'next/link';
import { getStatesSortedByPrice } from '@/lib/states-data';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: 'Home Prices by State — All 50 States + DC',
  description: 'Compare median home prices, year-over-year changes, and affordability across all 50 US states and Washington D.C. Sorted by price with key housing market metrics.',
  alternates: { canonical: '/state/' },
  openGraph: { title: 'Home Prices by State', description: 'Median home prices across all 50 US states and DC.', url: '/state/' },
};

export default function StatesIndex() {
  const states = getStatesSortedByPrice('desc');
  const listItems = states.map(s => ({ name: s.name, url: `/state/${s.slug}/` }));
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'By State', url: '/state/' }];

  const avgPrice = Math.round(states.reduce((sum, s) => sum + s.medianHomePrice, 0) / states.length);
  const mostExpensive = states[0];
  const cheapest = states[states.length - 1];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema('US Home Prices by State', '/state/', listItems)) }}
      />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Home Prices by State</h1>
        <p className="text-slate-600 max-w-3xl">
          Median home prices, year-over-year price changes, and affordability indexes for all 50 US states
          and Washington D.C. The national average median home price is{' '}
          <strong>{formatCurrency(avgPrice)}</strong>. {mostExpensive.name} leads at{' '}
          {formatCurrency(mostExpensive.medianHomePrice)} while {cheapest.name} is the most affordable at{' '}
          {formatCurrency(cheapest.medianHomePrice)}.
        </p>
      </header>

      <AdSlot id="top" />

      <div className="border rounded-lg overflow-hidden mt-4">
        <div className="hidden sm:grid sm:grid-cols-4 gap-2 p-3 bg-slate-50 text-sm font-semibold">
          <span>State</span>
          <span className="text-right">Median Price</span>
          <span className="text-right">YoY Change</span>
          <span className="text-right">Affordability</span>
        </div>
        {states.map((s, i) => (
          <Link
            key={s.slug}
            href={`/state/${s.slug}/`}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center p-3 hover:bg-emerald-50 border-b border-slate-100 text-sm"
          >
            <span>
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {s.name} <span className="text-slate-400">({s.code})</span>
            </span>
            <span className="font-semibold text-emerald-700 text-right">{formatCurrency(s.medianHomePrice)}</span>
            <span className={`text-right ${s.yoyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {s.yoyChange >= 0 ? '+' : ''}{formatPercent(s.yoyChange)}
            </span>
            <span className="text-right text-slate-600">{s.affordabilityIndex}/100</span>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Understanding the data</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li><strong>Median Home Price</strong> — The midpoint sale price for homes sold in the state, based on Zillow and NAR data.</li>
          <li><strong>YoY Change</strong> — Year-over-year percentage change in median home price.</li>
          <li><strong>Affordability Index</strong> — Score from 0 to 100 where higher means more affordable relative to local incomes. Below 30 indicates severe affordability pressure.</li>
        </ul>
      </section>

      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </div>
  );
}
