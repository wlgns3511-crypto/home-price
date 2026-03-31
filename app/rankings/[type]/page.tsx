import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRankingBySlug, getAllRankings, getCitiesForRanking, getCitiesForFilteredRanking } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { itemListSchema } from '@/lib/schema';
import { FILTER_RANKINGS, getFilterRankingBySlug } from '@/lib/filter-rankings';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ type: string }> }
export const dynamicParams = true;
export const revalidate = false;

function resolveRanking(type: string) {
  // 1. Direct DB match
  const dbRanking = getRankingBySlug(type);
  if (dbRanking) {
    const region = type.includes('-in-') ? type.split('-in-')[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : undefined;
    return {
      title: String(dbRanking.title),
      description: String(dbRanking.description),
      col: String(dbRanking.value_column),
      dir: String(dbRanking.order_dir),
      label: String(dbRanking.value_label),
      region,
      filters: undefined as undefined,
    };
  }

  // 2. Filter ranking match
  const fr = getFilterRankingBySlug(type);
  if (fr) {
    return {
      title: fr.title,
      description: fr.description,
      col: fr.valueColumn,
      dir: fr.orderDir,
      label: fr.valueLabel,
      region: fr.filters.region,
      filters: fr.filters,
    };
  }

  return null;
}

export async function generateStaticParams() {
  const dbRankings = getAllRankings().map(r => ({ type: String(r.slug) }));
  const filterRankings = FILTER_RANKINGS.map(fr => ({ type: fr.slug }));
  return [...dbRankings, ...filterRankings];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const resolved = resolveRanking(type);
  if (!resolved) return {};
  return {
    title: resolved.title,
    description: resolved.description,
    alternates: { canonical: `/rankings/${type}` },
    openGraph: { title: resolved.title, description: resolved.description, url: `/rankings/${type}` },
  };
}

function fmtValue(col: string, val: number): string {
  if (col.includes('pct') || col.includes('ratio')) return formatPercent(val);
  if (col.includes('population')) return formatNumber(val);
  return formatCurrency(val);
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const resolved = resolveRanking(type);
  if (!resolved) notFound();
  const { title, col, dir, label, region, filters } = resolved;
  const cities = filters
    ? getCitiesForFilteredRanking(col, dir, filters, 50)
    : getCitiesForRanking(col, dir, region, 50);
  if (cities.length === 0) notFound();
  const listItems = cities.map(c => ({ name: String(c.name), url: `/city/${c.slug}/` }));
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Rankings', url: '/rankings/' }, { name: title, url: `/rankings/${type}` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(title, `/rankings/${type}`, listItems)) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-slate-600 mb-4">{resolved.description}</p>
      <FreshnessTag source={siteConfig.dataSource.name} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden mt-4">
        <div className="flex justify-between p-3 bg-slate-50 text-sm font-semibold"><span>City</span><span>{label}</span></div>
        {cities.map((c, i) => (
          <a key={String(c.slug)} href={`/city/${c.slug}/`} className="flex justify-between items-center p-3 hover:bg-emerald-50 border-b border-slate-100 text-sm">
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(c.name)} <span className="text-slate-400">({String(c.country)})</span></span>
            <span className="font-semibold text-emerald-700">{fmtValue(col, c[col] as number)}</span>
          </a>
        ))}
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
