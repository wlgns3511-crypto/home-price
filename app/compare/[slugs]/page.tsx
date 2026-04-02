import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { parseCityComparisonSlug, getTopComparisons } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ slugs: string }> }

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getTopComparisons(500).map(c => ({ slugs: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const comp = parseCityComparisonSlug(slugs);
  if (!comp) return {};
  const nameA = String(comp.a.name);
  const nameB = String(comp.b.name);
  const title = `${nameA} vs ${nameB} — Home Prices & Rent Comparison (${new Date().getFullYear()})`;
  const description = `Compare home prices in ${nameA} (${formatCurrency(comp.a.avg_home_price_usd as number)}) vs ${nameB} (${formatCurrency(comp.b.avg_home_price_usd as number)}). Rent, affordability, mortgage rates side by side.`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${slugs}` },
    openGraph: { title, description, url: `/compare/${slugs}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const comp = parseCityComparisonSlug(slugs);
  if (!comp) notFound();

  // Canonical: alphabetically sorted slug
  const canonicalSlug = [String(comp.a.slug), String(comp.b.slug)].sort().join('-vs-');
  if (canonicalSlug !== slugs) redirect(`/compare/${canonicalSlug}/`);

  const { a, b } = comp;
  const nameA = String(a.name);
  const nameB = String(b.name);
  const priceA = a.avg_home_price_usd as number;
  const priceB = b.avg_home_price_usd as number;
  const cheaper = priceA < priceB ? nameA : nameB;
  const diff = Math.abs(priceA - priceB);
  const diffPct = ((diff / Math.max(priceA, priceB)) * 100).toFixed(0);

  const metrics = [
    { label: 'Avg Home Price', key: 'avg_home_price_usd', fmt: formatCurrency },
    { label: 'Price / sqm', key: 'price_per_sqm_usd', fmt: formatCurrency },
    { label: 'Rent (1BR)', key: 'avg_rent_1br_usd', fmt: (v: number) => `${formatCurrency(v)}/mo` },
    { label: 'Rent (3BR)', key: 'avg_rent_3br_usd', fmt: (v: number) => `${formatCurrency(v)}/mo` },
    { label: 'Price-to-Income', key: 'price_to_income_ratio', fmt: (v: number) => `${v.toFixed(1)}x` },
    { label: 'Mortgage Rate', key: 'mortgage_rate_pct', fmt: formatPercent },
    { label: '1yr Change', key: 'price_change_1yr_pct', fmt: (v: number) => `${v >= 0 ? '+' : ''}${formatPercent(v)}` },
    { label: 'Median Income', key: 'median_income_usd', fmt: (v: number) => `${formatCurrency(v)}/yr` },
    { label: 'Population', key: 'population', fmt: formatNumber },
  ];

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare/' },
    { name: `${nameA} vs ${nameB}`, url: `/compare/${slugs}` },
  ];

  const faqs = [
    { question: `Is ${nameA} or ${nameB} more expensive?`, answer: `${cheaper} is more affordable. Home prices differ by ${formatCurrency(diff)} (${diffPct}%).` },
    { question: `Which city has cheaper rent, ${nameA} or ${nameB}?`, answer: `Rent for a 1BR in ${nameA} is ${formatCurrency(a.avg_rent_1br_usd as number)}/mo vs ${formatCurrency(b.avg_rent_1br_usd as number)}/mo in ${nameB}.` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <h1 className="text-3xl font-bold mb-2">{nameA} vs {nameB}</h1>
      <p className="text-slate-500 mb-2">Home Price & Cost of Living Comparison</p>
      <FreshnessTag source={siteConfig.dataSource.name} />

      <InsightBox title={`${nameA} vs ${nameB}`}
        insight={`${cheaper} is ${diffPct}% more affordable for homebuyers. ${nameA} has a price-to-income ratio of ${(a.price_to_income_ratio as number).toFixed(1)}x compared to ${(b.price_to_income_ratio as number).toFixed(1)}x in ${nameB}.`}
      />

      <AdSlot id="top" />

      <div className="border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-left font-semibold">Metric</th>
              <th className="p-3 text-right font-semibold text-emerald-700">{nameA}</th>
              <th className="p-3 text-right font-semibold text-blue-700">{nameB}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const valA = a[m.key] as number;
              const valB = b[m.key] as number;
              return (
                <tr key={m.key} className="border-t">
                  <td className="p-3 text-slate-600">{m.label}</td>
                  <td className={`p-3 text-right font-semibold ${m.key !== 'population' && valA <= valB ? 'text-green-600' : ''}`}>{m.fmt(valA)}</td>
                  <td className={`p-3 text-right font-semibold ${m.key !== 'population' && valB <= valA ? 'text-green-600' : ''}`}>{m.fmt(valB)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href={`/city/${a.slug}/`} className="block p-4 border rounded-lg hover:bg-emerald-50 text-center">
          <span className="font-bold text-emerald-700">{nameA}</span>
          <span className="block text-sm text-slate-500 mt-1">View full details &rarr;</span>
        </a>
        <a href={`/city/${b.slug}/`} className="block p-4 border rounded-lg hover:bg-blue-50 text-center">
          <span className="font-bold text-blue-700">{nameB}</span>
          <span className="block text-sm text-slate-500 mt-1">View full details &rarr;</span>
        </a>
      </div>

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
