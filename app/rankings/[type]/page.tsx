import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRankingBySlug, getAllRankings, getCitiesForRanking } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { itemListSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ type: string }> }
export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllRankings().map(r => ({ type: String(r.slug) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const ranking = getRankingBySlug(type);
  if (!ranking) return {};
  return { title: String(ranking.title), description: String(ranking.description), alternates: { canonical: `/rankings/${type}` } };
}

function fmtValue(col: string, val: number): string {
  if (col.includes('pct') || col.includes('ratio')) return formatPercent(val);
  if (col.includes('population')) return formatNumber(val);
  return formatCurrency(val);
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const ranking = getRankingBySlug(type);
  if (!ranking) notFound();
  const title = String(ranking.title);
  const col = String(ranking.value_column);
  const dir = String(ranking.order_dir);
  const label = String(ranking.value_label);
  const region = type.includes('-in-') ? type.split('-in-')[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : undefined;
  const cities = getCitiesForRanking(col, dir, region, 50);
  const listItems = cities.map(c => ({ name: String(c.name), url: `/city/${c.slug}/` }));
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Rankings', url: '/rankings/' }, { name: title, url: `/rankings/${type}` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(title, `/rankings/${type}`, listItems)) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-slate-600 mb-4">{String(ranking.description)}</p>
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
