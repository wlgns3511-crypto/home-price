import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { parseCountryComparisonSlug, getTopCountryComparisons, getCitiesByCountry } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
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
export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getTopCountryComparisons(100).map(c => ({ slugs: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const comp = parseCountryComparisonSlug(slugs);
  if (!comp) return {};
  return {
    title: `${comp.a.name} vs ${comp.b.name} — Housing Market Comparison`,
    description: `Compare housing markets: ${comp.a.name} (avg ${formatCurrency(comp.a.avg_home_price_usd as number)}) vs ${comp.b.name} (avg ${formatCurrency(comp.b.avg_home_price_usd as number)}).`,
    alternates: { canonical: `/compare/country/${slugs}` },
  };
}

export default async function CountryComparePage({ params }: Props) {
  const { slugs } = await params;
  const comp = parseCountryComparisonSlug(slugs);
  if (!comp) notFound();

  const canonicalSlug = [String(comp.a.slug), String(comp.b.slug)].sort().join('-vs-');
  if (canonicalSlug !== slugs) redirect(`/compare/country/${canonicalSlug}/`);

  const { a, b } = comp;
  const nameA = String(a.name), nameB = String(b.name);
  const priceA = a.avg_home_price_usd as number, priceB = b.avg_home_price_usd as number;
  const cheaper = priceA < priceB ? nameA : nameB;
  const diffPct = ((Math.abs(priceA - priceB) / Math.max(priceA, priceB)) * 100).toFixed(0);
  const citiesA = getCitiesByCountry(nameA, 5);
  const citiesB = getCitiesByCountry(nameB, 5);

  const metrics = [
    { label: 'Avg Home Price', key: 'avg_home_price_usd', fmt: formatCurrency },
    { label: 'Price / sqm', key: 'avg_price_per_sqm_usd', fmt: formatCurrency },
    { label: 'Avg Rent (1BR)', key: 'avg_rent_1br_usd', fmt: (v: number) => `${formatCurrency(v)}/mo` },
    { label: 'Mortgage Rate', key: 'mortgage_rate_pct', fmt: formatPercent },
    { label: 'Homeownership', key: 'homeownership_rate_pct', fmt: formatPercent },
    { label: '1yr Change', key: 'price_change_1yr_pct', fmt: (v: number) => `${v >= 0 ? '+' : ''}${formatPercent(v)}` },
  ];

  const faqs = [
    { question: `Is ${nameA} or ${nameB} cheaper for housing?`, answer: `${cheaper} has more affordable housing, with prices ${diffPct}% lower.` },
    { question: `Which has lower mortgage rates?`, answer: `${(a.mortgage_rate_pct as number) < (b.mortgage_rate_pct as number) ? nameA : nameB} has lower mortgage rates at ${formatPercent(Math.min(a.mortgage_rate_pct as number, b.mortgage_rate_pct as number))}.` },
  ];
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Compare Countries', url: '/compare/' }, { name: `${nameA} vs ${nameB}`, url: `/compare/country/${slugs}` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <h1 className="text-3xl font-bold mb-2">{nameA} vs {nameB}</h1>
      <p className="text-slate-500 mb-2">Housing Market Comparison</p>
      <FreshnessTag source={siteConfig.dataSource.name} />
      <InsightBox title={`${nameA} vs ${nameB}`} insight={`${cheaper} is ${diffPct}% more affordable. Mortgage rates: ${nameA} ${formatPercent(a.mortgage_rate_pct as number)} vs ${nameB} ${formatPercent(b.mortgage_rate_pct as number)}.`} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50"><th className="p-3 text-left">Metric</th><th className="p-3 text-right text-emerald-700">{nameA}</th><th className="p-3 text-right text-blue-700">{nameB}</th></tr></thead>
          <tbody>{metrics.map(m => (<tr key={m.key} className="border-t"><td className="p-3 text-slate-600">{m.label}</td><td className="p-3 text-right font-semibold">{m.fmt(a[m.key] as number)}</td><td className="p-3 text-right font-semibold">{m.fmt(b[m.key] as number)}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <section><h2 className="text-lg font-bold mb-2">Top Cities in {nameA}</h2><div className="space-y-1">{citiesA.map(c => (<a key={String(c.slug)} href={`/city/${c.slug}/`} className="flex justify-between p-2 border rounded hover:bg-emerald-50 text-sm"><span>{String(c.name)}</span><span className="text-emerald-700 font-medium">{formatCurrency(c.avg_home_price_usd as number)}</span></a>))}</div></section>
        <section><h2 className="text-lg font-bold mb-2">Top Cities in {nameB}</h2><div className="space-y-1">{citiesB.map(c => (<a key={String(c.slug)} href={`/city/${c.slug}/`} className="flex justify-between p-2 border rounded hover:bg-blue-50 text-sm"><span>{String(c.name)}</span><span className="text-blue-700 font-medium">{formatCurrency(c.avg_home_price_usd as number)}</span></a>))}</div></section>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href={`/country/${a.slug}/`} className="p-4 border rounded-lg hover:bg-emerald-50 text-center font-bold text-emerald-700">{nameA} details &rarr;</a>
        <a href={`/country/${b.slug}/`} className="p-4 border rounded-lg hover:bg-blue-50 text-center font-bold text-blue-700">{nameB} details &rarr;</a>
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
