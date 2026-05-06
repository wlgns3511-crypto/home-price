import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getInsightTopic, getAllInsightSlugs, readChangeLog, type InsightCity } from '@/lib/insights-data';
import { breadcrumbSchema } from '@/lib/schema';
import { formatCurrency, formatPercent } from '@/lib/format';
import { AuthorBox } from '@/components/AuthorBox';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { MethodologyInline } from '@/components/MethodologyInline';

const c = siteConfig;
interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllInsightSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getInsightTopic(slug);
  if (!topic) return {};
  const log = readChangeLog(slug);
  const rows = topic.query();
  const leader = rows[0];
  const n = rows.length;

  let desc = topic.description;
  if (leader && slug === 'most-affordable-first-home-markets') {
    desc = `${leader.name} leads at ${leader.price_to_income_ratio?.toFixed(1)}× price-to-income (${formatCurrency(leader.avg_home_price_usd)}). ${n} cities ranked. Updated ${log?.lastUpdated ?? 'monthly'}.`;
  } else if (leader && slug === 'biggest-price-drops-this-year') {
    desc = `${leader.name} dropped ${leader.price_change_1yr_pct?.toFixed(1)}% YoY — biggest decline of ${n} cities. Updated ${log?.lastUpdated ?? 'monthly'}.`;
  } else if (leader && slug === 'rent-vs-buy-renting-wins') {
    desc = `${leader.name} at ${leader.price_to_rent_ratio?.toFixed(0)}× price-to-rent — top of ${n} cities where renting wins. Updated ${log?.lastUpdated ?? 'monthly'}.`;
  } else if (leader && slug === 'luxury-markets-under-pressure') {
    desc = `${leader.name} (${formatCurrency(leader.avg_home_price_usd)}) softened ${leader.price_change_1yr_pct?.toFixed(1)}% — ${n} luxury markets tracked. Updated ${log?.lastUpdated ?? 'monthly'}.`;
  } else if (leader && slug === 'emerging-affordable-cities-to-watch') {
    desc = `${leader.name} up ${leader.price_change_1yr_pct?.toFixed(1)}% at ${formatCurrency(leader.avg_home_price_usd)} — ${n} emerging cities tracked. Updated ${log?.lastUpdated ?? 'monthly'}.`;
  }

  return {
    title: `${topic.title} (${new Date().getFullYear()})`,
    description: desc,
    alternates: { canonical: `/insights/${slug}/` },
    openGraph: { title: topic.title, description: desc, url: `/insights/${slug}/`, type: 'article', modifiedTime: log?.lastUpdated },
  };
}

function formatChangeLogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function nextMonthIso(iso: string): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function row(city: InsightCity, slug: string, rank: number) {
  const baseCells = (
    <>
      <td className="py-2 pr-4 text-slate-500 tabular-nums">{rank}</td>
      <td className="py-2 pr-4">
        <a href={`/city/${city.slug}/`} className="font-medium text-slate-900 hover:text-blue-600">{city.name}</a>
        <span className="text-slate-500 ml-2 text-xs">{city.country}</span>
      </td>
    </>
  );
  if (slug === 'most-affordable-first-home-markets') {
    return (
      <tr className="border-t border-slate-100" key={city.slug}>
        {baseCells}
        <td className="py-2 pr-4 tabular-nums font-semibold">{city.price_to_income_ratio?.toFixed(1)}×</td>
        <td className="py-2 pr-4 tabular-nums">{formatCurrency(city.avg_home_price_usd)}</td>
        <td className="py-2 pr-4 tabular-nums text-slate-600">{city.median_income_usd ? formatCurrency(city.median_income_usd) : '—'}</td>
      </tr>
    );
  }
  if (slug === 'biggest-price-drops-this-year') {
    const pct = city.price_change_1yr_pct ?? 0;
    return (
      <tr className="border-t border-slate-100" key={city.slug}>
        {baseCells}
        <td className={`py-2 pr-4 tabular-nums font-semibold ${pct < 0 ? 'text-red-600' : 'text-slate-700'}`}>{pct.toFixed(1)}%</td>
        <td className="py-2 pr-4 tabular-nums">{formatCurrency(city.avg_home_price_usd)}</td>
        <td className="py-2 pr-4 tabular-nums text-slate-600">{city.price_per_sqm_usd ? formatCurrency(city.price_per_sqm_usd) + '/m²' : '—'}</td>
      </tr>
    );
  }
  if (slug === 'rent-vs-buy-renting-wins') {
    return (
      <tr className="border-t border-slate-100" key={city.slug}>
        {baseCells}
        <td className="py-2 pr-4 tabular-nums font-semibold">{city.price_to_rent_ratio?.toFixed(0)}×</td>
        <td className="py-2 pr-4 tabular-nums">{formatCurrency(city.avg_home_price_usd)}</td>
        <td className="py-2 pr-4 tabular-nums text-slate-600">{city.avg_rent_1br_usd ? formatCurrency(city.avg_rent_1br_usd) + '/mo' : '—'}</td>
      </tr>
    );
  }
  if (slug === 'luxury-markets-under-pressure') {
    const pct = city.price_change_1yr_pct ?? 0;
    return (
      <tr className="border-t border-slate-100" key={city.slug}>
        {baseCells}
        <td className="py-2 pr-4 tabular-nums font-semibold">{formatCurrency(city.avg_home_price_usd)}</td>
        <td className={`py-2 pr-4 tabular-nums ${pct < 0 ? 'text-red-600' : 'text-slate-700'}`}>{pct.toFixed(1)}%</td>
        <td className="py-2 pr-4 tabular-nums text-slate-600">{city.price_to_income_ratio?.toFixed(1) ?? '—'}×</td>
      </tr>
    );
  }
  // emerging
  const pct = city.price_change_1yr_pct ?? 0;
  return (
    <tr className="border-t border-slate-100" key={city.slug}>
      {baseCells}
      <td className="py-2 pr-4 tabular-nums font-semibold text-green-700">+{pct.toFixed(1)}%</td>
      <td className="py-2 pr-4 tabular-nums">{formatCurrency(city.avg_home_price_usd)}</td>
      <td className="py-2 pr-4 tabular-nums text-slate-600">{city.population ? (city.population / 1_000_000).toFixed(1) + 'M' : '—'}</td>
    </tr>
  );
}

function headersFor(slug: string) {
  const rankCol = <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">#</th>;
  const cityCol = <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">City</th>;
  if (slug === 'most-affordable-first-home-markets') {
    return <tr>{rankCol}{cityCol}
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Price/Income</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Avg Home</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Median Income</th>
    </tr>;
  }
  if (slug === 'biggest-price-drops-this-year') {
    return <tr>{rankCol}{cityCol}
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">1Y Change</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Avg Home</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Per m²</th>
    </tr>;
  }
  if (slug === 'rent-vs-buy-renting-wins') {
    return <tr>{rankCol}{cityCol}
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Price/Rent</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Avg Home</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">1BR Rent</th>
    </tr>;
  }
  if (slug === 'luxury-markets-under-pressure') {
    return <tr>{rankCol}{cityCol}
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Avg Home</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">1Y Change</th>
      <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Price/Income</th>
    </tr>;
  }
  return <tr>{rankCol}{cityCol}
    <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">1Y Change</th>
    <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Avg Home</th>
    <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Population</th>
  </tr>;
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const topic = getInsightTopic(slug);
  if (!topic) notFound();

  const rows = topic.query();
  const log = readChangeLog(slug);
  const lastUpdated = log?.lastUpdated ?? new Date().toISOString().slice(0, 10);
  const nextUpdate = nextMonthIso(lastUpdated);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Insights', url: '/insights/' },
    { name: topic.title, url: `/insights/${slug}/` },
  ];

  return (
    <article className="max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{topic.h1}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>
            Last updated: <time dateTime={lastUpdated} className="font-medium text-slate-700">{formatChangeLogDate(lastUpdated)}</time>
          </span>
          <span aria-hidden="true">·</span>
          <span>Next refresh: <time dateTime={nextUpdate}>{formatChangeLogDate(nextUpdate)}</time></span>
          <span aria-hidden="true">·</span>
          <span>{rows.length} cities tracked</span>
        </div>
      </header>

      {log && log.changes.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
          <h2 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-2">What changed this month</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
            {log.changes.slice(0, 6).map((line, i) => <li key={i}>{line}</li>)}
          </ul>
          {log.priorRun && log.priorRun !== log.lastUpdated && (
            <p className="text-xs text-amber-700 mt-2">Compared to snapshot from {formatChangeLogDate(log.priorRun)}.</p>
          )}
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">TL;DR</h2>
        <p className="text-slate-700 leading-relaxed">{topic.thesis}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Ranked list ({rows.length})</h2>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              {headersFor(slug)}
            </thead>
            <tbody>
              {rows.map((r, i) => row(r, slug, i + 1))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">Click any city for the full breakdown: prices, rent, mortgage estimate, and peer comparisons.</p>
      </section>

      <MethodologyInline
        source={{ name: 'OECD Housing Prices', url: 'https://data.oecd.org/price/housing-prices.htm' }}
        release={`${siteConfig.dataVintage}`}
        dataYear={siteConfig.dataSource.year}
        cadence="Rebuilt against the most recent ingestion of OECD + named national statistics offices"
        dbUpdated={lastUpdated}
        pageLimits={[topic.methodNote]}
        limits={[
          'Cross-country data has uneven sample sizes; cities below the per-source observation floor are excluded from rankings.',
          'Price changes are reported in local currency where the underlying source publishes a national index, to reduce FX noise.',
        ]}
        fullHref="/methodology/"
      />

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">How this page is updated</h2>
        <p className="text-slate-700 leading-relaxed">
          This is an evergreen ranking — the URL stays stable, the ranking is regenerated against the most recent ingestion of OECD price-to-income series, US Census ACS housing tables, and named national statistics offices. The underlying methodology does not change between rebuilds — only the data does. The section vintage at the top of the page reflects the latest rebuild date for this surface.
        </p>
      </section>

      <AuthorBox />
      <CrossSiteLinks current={c.name} />
    </article>
  );
}
