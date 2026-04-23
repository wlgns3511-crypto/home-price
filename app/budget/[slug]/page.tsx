import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBudgetBySlug, getAllBudgets, getCitiesInBudget } from '@/lib/db';
import { formatCurrency } from '@/lib/format';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllBudgets().map(b => ({ slug: String(b.slug) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const budget = getBudgetBySlug(slug);
  if (!budget) return {};
  return { title: String(budget.title), description: `Find cities where you can ${slug.includes('rent') ? 'rent' : 'buy a home'} within your budget.`, alternates: { canonical: `/budget/${slug}/` }, openGraph: { url: `/budget/${slug}/` } };
}

export default async function BudgetPage({ params }: Props) {
  const { slug } = await params;
  const budget = getBudgetBySlug(slug);
  if (!budget) notFound();
  const isRent = slug.includes('rent');
  const cities = getCitiesInBudget(budget.min_price as number, budget.max_price as number, isRent);
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Budget' }, { name: String(budget.title), url: `/budget/${slug}/` }];

  return (
    <>
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <h1 className="text-3xl font-bold mb-2">{String(budget.title)}</h1>
      <p className="text-slate-600 mb-4">{cities.length} cities found</p>
      <FreshnessTag source={siteConfig.dataSource.name} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden">
        {cities.map((c, i) => (
          <a key={String(c.slug)} href={`/city/${c.slug}/`} className="flex justify-between items-center p-3 hover:bg-emerald-50 border-b border-slate-100 text-sm">
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(c.name)} <span className="text-slate-400">({String(c.country)})</span></span>
            <span className="font-semibold text-emerald-700">{isRent ? `${formatCurrency(c.avg_rent_1br_usd as number)}/mo` : formatCurrency(c.avg_home_price_usd as number)}</span>
          </a>
        ))}
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
