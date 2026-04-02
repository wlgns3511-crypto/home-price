import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRegionBySlug, getAllRegions, getCitiesByRegion } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllRegions().map(r => ({ slug: String(r.slug) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return {};
  return { title: `${region.name} Home Prices — Housing Market Overview`, description: `Compare home prices across ${region.name}: ${region.description}`, alternates: { canonical: `/region/${slug}` }, openGraph: { url: `/region/${slug}` } };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();
  const name = String(region.name);
  // Map region slug to DB region values
  const regionMap: Record<string, string> = { 'western-europe': 'Europe', 'southern-europe': 'Europe', 'eastern-europe': 'Europe', 'northern-europe': 'Europe', 'southeast-asia': 'Asia', 'east-asia': 'Asia', 'south-asia': 'Asia', 'middle-east': 'Middle East', 'north-america': 'North America', 'south-america': 'South America', 'central-america': 'South America', 'oceania': 'Oceania', 'east-africa': 'Africa', 'southern-africa': 'Africa', 'north-africa': 'Africa' };
  const dbRegion = regionMap[slug] || name;
  const cities = getCitiesByRegion(dbRegion);
  const avgPrice = cities.length > 0 ? Math.round(cities.reduce((s, c) => s + (c.avg_home_price_usd as number), 0) / cities.length) : 0;
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Regions', url: '/' }, { name, url: `/region/${slug}` }];

  return (
    <>
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <div className="bg-violet-600 rounded-xl p-6 mb-6 -mx-1">
        <h1 className="text-3xl font-bold text-white mb-1">{name} Housing Market</h1>
        <p className="text-violet-200 text-sm">{String(region.description)}</p>
      </div>
      <FreshnessTag source={siteConfig.dataSource.name} />
      <InsightBox title={name} insight={`The average home price across ${cities.length} cities in ${name} is ${formatCurrency(avgPrice)}. Prices vary significantly within the region.`} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden mt-4">
        <div className="flex justify-between p-3 bg-slate-50 text-sm font-semibold"><span>City</span><span>Home Price</span></div>
        {cities.map((c, i) => (
          <a key={String(c.slug)} href={`/city/${c.slug}/`} className="flex justify-between items-center p-3 hover:bg-violet-50 border-b border-slate-100 text-sm">
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(c.name)} <span className="text-slate-400">({String(c.country)})</span></span>
            <span className="font-semibold text-violet-700">{formatCurrency(c.avg_home_price_usd as number)}</span>
          </a>
        ))}
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
