import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getComparisonBySlug, getTopComparisons } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { LOCALES, getDictionarySync, LOCALE_NAMES, type Locale } from '@/lib/i18n';
import { faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { FAQ } from '@/components/FAQ';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ lang: string; slugs: string }> }
export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  const topComps = getTopComparisons(20);
  const topLangs = ['es', 'fr', 'de', 'ko', 'ja'];
  return topLangs.flatMap(lang => topComps.map(c => ({ lang, slugs: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slugs } = await params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const comp = getComparisonBySlug(slugs);
  if (!comp) return {};
  const t = getDictionarySync(lang as Locale);
  return {
    title: `${comp.a.name} ${t.vs} ${comp.b.name} — ${t.home_prices}`,
    description: `${t.compare}: ${comp.a.name} (${formatCurrency(comp.a.avg_home_price_usd as number)}) ${t.vs} ${comp.b.name} (${formatCurrency(comp.b.avg_home_price_usd as number)}).`,
    alternates: { canonical: `/${lang}/compare/${slugs}` },
  };
}

export default async function LangComparePage({ params }: Props) {
  const { lang, slugs } = await params;
  if (!LOCALES.includes(lang as Locale) || lang === 'en') notFound();
  const comp = getComparisonBySlug(slugs);
  if (!comp) notFound();
  const t = getDictionarySync(lang as Locale);
  const { a, b } = comp;
  const nameA = String(a.name), nameB = String(b.name);
  const priceA = a.avg_home_price_usd as number, priceB = b.avg_home_price_usd as number;
  const cheaper = priceA < priceB ? nameA : nameB;
  const diffPct = ((Math.abs(priceA - priceB) / Math.max(priceA, priceB)) * 100).toFixed(0);

  const metrics = [
    { label: t.avg_home_price, key: 'avg_home_price_usd', fmt: formatCurrency },
    { label: t.price_per_sqm, key: 'price_per_sqm_usd', fmt: formatCurrency },
    { label: t.rent_1br, key: 'avg_rent_1br_usd', fmt: (v: number) => `${formatCurrency(v)}${t.per_month}` },
    { label: t.mortgage_rate, key: 'mortgage_rate_pct', fmt: formatPercent },
    { label: t.price_change, key: 'price_change_1yr_pct', fmt: (v: number) => `${v >= 0 ? '+' : ''}${formatPercent(v)}` },
    { label: t.median_income, key: 'median_income_usd', fmt: (v: number) => `${formatCurrency(v)}${t.per_year}` },
    { label: t.population, key: 'population', fmt: formatNumber },
  ];

  const faqs = [{ question: `${nameA} ${t.vs} ${nameB}?`, answer: `${cheaper} ${diffPct}%` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <div className="flex flex-wrap gap-1 mb-4 text-xs">
        {LOCALES.map(l => (<a key={l} href={l === 'en' ? `/compare/${slugs}/` : `/${l}/compare/${slugs}/`} className={`px-2 py-1 rounded ${l === lang ? 'bg-emerald-600 text-white' : 'border hover:bg-slate-50'}`}>{LOCALE_NAMES[l]}</a>))}
      </div>
      <h1 className="text-3xl font-bold mb-2">{nameA} {t.vs} {nameB}</h1>
      <p className="text-slate-500 mb-2">{t.home_prices} {t.compare}</p>
      <FreshnessTag source={siteConfig.dataSource.name} />
      <InsightBox title={`${nameA} ${t.vs} ${nameB}`} insight={`${cheaper} ${diffPct}% ${t.cheapest}.`} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50"><th className="p-3 text-left"></th><th className="p-3 text-right text-emerald-700">{nameA}</th><th className="p-3 text-right text-blue-700">{nameB}</th></tr></thead>
          <tbody>{metrics.map(m => (<tr key={m.key} className="border-t"><td className="p-3 text-slate-600">{m.label}</td><td className="p-3 text-right font-semibold">{m.fmt(a[m.key] as number)}</td><td className="p-3 text-right font-semibold">{m.fmt(b[m.key] as number)}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href={`/${lang}/city/${a.slug}/`} className="p-4 border rounded-lg hover:bg-emerald-50 text-center font-bold text-emerald-700">{nameA} {t.view_details} &rarr;</a>
        <a href={`/${lang}/city/${b.slug}/`} className="p-4 border rounded-lg hover:bg-blue-50 text-center font-bold text-blue-700">{nameB} {t.view_details} &rarr;</a>
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
