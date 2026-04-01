import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs, getSimilarPriceCities } from '@/lib/db';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { LOCALES, getDictionarySync, LOCALE_NAMES, type Locale } from '@/lib/i18n';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';

const c = siteConfig;

interface Props { params: Promise<{ lang: string; slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  // Only pre-render top 10 cities × top 5 languages for sitemap
  const topSlugs = getAllSlugs().slice(0, 10);
  const topLangs = ['es', 'fr', 'de', 'ko', 'ja'];
  return topLangs.flatMap(lang => topSlugs.map(s => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const city = getBySlug(slug);
  if (!city) return {};
  const t = getDictionarySync(lang as Locale);
  const name = String(city.name);
  const hreflangs: Record<string, string> = { 'x-default': `https://${c.domain}/city/${slug}` };
  for (const l of LOCALES) {
    if (l === 'en') hreflangs[l] = `https://${c.domain}/city/${slug}`;
    else hreflangs[l] = `https://${c.domain}/${l}/city/${slug}`;
  }
  return {
    title: `${name} ${t.home_prices} (${new Date().getFullYear()})`,
    description: `${name}: ${t.avg_home_price} ${formatCurrency(city.avg_home_price_usd as number)}, ${t.rent_1br} ${formatCurrency(city.avg_rent_1br_usd as number)}${t.per_month}.`,
    alternates: { canonical: `/${lang}/city/${slug}`, languages: hreflangs },
    openGraph: { url: `/${lang}/city/${slug}` },
  };
}

const REGION_THEMES: Record<string, { bg: string; text: string }> = {
  'North America': { bg: 'bg-blue-600', text: 'text-blue-100' },
  'Europe': { bg: 'bg-indigo-600', text: 'text-indigo-100' },
  'Asia': { bg: 'bg-rose-600', text: 'text-rose-100' },
  'Middle East': { bg: 'bg-amber-600', text: 'text-amber-100' },
  'Oceania': { bg: 'bg-teal-600', text: 'text-teal-100' },
  'South America': { bg: 'bg-emerald-600', text: 'text-emerald-100' },
  'Africa': { bg: 'bg-orange-600', text: 'text-orange-100' },
};

export default async function LangCityPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!LOCALES.includes(lang as Locale) || lang === 'en') notFound();
  const city = getBySlug(slug);
  if (!city) notFound();
  const t = getDictionarySync(lang as Locale);

  const name = String(city.name);
  const country = String(city.country);
  const region = String(city.region || 'North America');
  const theme = REGION_THEMES[region] || REGION_THEMES['North America'];
  const price = city.avg_home_price_usd as number;
  const rent = city.avg_rent_1br_usd as number;
  const ratio = city.price_to_income_ratio as number;
  const change = city.price_change_1yr_pct as number;
  const related = getRelated(country, slug, 6);
  const similarPrice = getSimilarPriceCities(price, slug, 5);

  const crumbs = [{ name: t.back_home, url: `/${lang}/` }, { name: country, url: `/${lang}/city/${slug}` }, { name, url: `/${lang}/city/${slug}` }];
  const faqs = [
    { question: `${t.faq_what_price} ${name}?`, answer: `${t.avg_home_price}: ${formatCurrency(price)}, ${t.price_per_sqm}: ${formatCurrency(city.price_per_sqm_usd as number)}.` },
    { question: `${t.faq_how_much_rent} ${name}?`, answer: `${t.rent_1br}: ${formatCurrency(rent)}${t.per_month}, ${t.rent_3br}: ${formatCurrency(city.avg_rent_3br_usd as number)}${t.per_month}.` },
  ];

  // Language switcher
  const langLinks = LOCALES.map(l => ({
    code: l, name: LOCALE_NAMES[l],
    url: l === 'en' ? `/city/${slug}/` : `/${l}/city/${slug}/`,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      {/* Language switcher */}
      <div className="flex flex-wrap gap-1 mb-4 text-xs">
        {langLinks.map(l => (
          <a key={l.code} href={l.url} className={`px-2 py-1 rounded ${l.code === lang ? 'bg-emerald-600 text-white' : 'border hover:bg-slate-50'}`}>{l.name}</a>
        ))}
      </div>

      <div className={`${theme.bg} rounded-xl p-6 mb-6 -mx-1`}>
        <h1 className="text-3xl font-bold text-white mb-1">{name} {t.home_prices}</h1>
        <p className={`${theme.text} text-sm`}>{country} · {t.population}: {formatNumber(city.population as number)}</p>
      </div>

      <FreshnessTag source={c.dataSource.name} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-emerald-700">{formatCurrency(price)}</div><div className="text-xs text-slate-500">{t.avg_home_price}</div></div>
        <div className="bg-blue-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-blue-700">{formatCurrency(city.price_per_sqm_usd as number)}</div><div className="text-xs text-slate-500">{t.price_per_sqm}</div></div>
        <div className="bg-amber-50 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-amber-700">{formatCurrency(rent)}{t.per_month}</div><div className="text-xs text-slate-500">{t.rent_1br}</div></div>
        <div className={`${change >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}><div className={`text-2xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>{change >= 0 ? '+' : ''}{formatPercent(change)}</div><div className="text-xs text-slate-500">{t.price_change}</div></div>
      </div>

      <AdSlot id="top" />

      <section className="mt-8 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">{t.buying}</h2>
        <table className="w-full text-sm"><tbody>
          <tr className="border-b"><td className="p-3 text-slate-600">{t.avg_home_price}</td><td className="p-3 text-right font-semibold">{formatCurrency(price)}</td></tr>
          <tr className="border-b"><td className="p-3 text-slate-600">{t.price_per_sqm}</td><td className="p-3 text-right font-semibold">{formatCurrency(city.price_per_sqm_usd as number)}</td></tr>
          <tr className="border-b"><td className="p-3 text-slate-600">{t.price_to_income}</td><td className="p-3 text-right font-semibold">{ratio.toFixed(1)}x</td></tr>
          <tr className="border-b"><td className="p-3 text-slate-600">{t.mortgage_rate}</td><td className="p-3 text-right font-semibold">{formatPercent(city.mortgage_rate_pct as number)}</td></tr>
          <tr><td className="p-3 text-slate-600">{t.price_change}</td><td className={`p-3 text-right font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{formatPercent(change)}</td></tr>
        </tbody></table>
      </section>

      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">{t.renting}</h2>
        <table className="w-full text-sm"><tbody>
          <tr className="border-b"><td className="p-3 text-slate-600">{t.rent_1br}</td><td className="p-3 text-right font-semibold">{formatCurrency(rent)}{t.per_month}</td></tr>
          <tr className="border-b"><td className="p-3 text-slate-600">{t.rent_3br}</td><td className="p-3 text-right font-semibold">{formatCurrency(city.avg_rent_3br_usd as number)}{t.per_month}</td></tr>
          <tr><td className="p-3 text-slate-600">{t.rent_to_income}</td><td className="p-3 text-right font-semibold">{((city.rent_to_income_ratio as number) * 100).toFixed(0)}%</td></tr>
        </tbody></table>
      </section>

      <InsightBox title={name} insight={`${t.why_it_matters}: ${t.price_to_income} ${ratio.toFixed(1)}x, ${t.mortgage_rate} ${formatPercent(city.mortgage_rate_pct as number)}.`} />

      {related.length > 0 && (
        <section className="mt-8"><h2 className="text-xl font-bold mb-3">{t.related_cities} {country}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{related.map(r => (
            <a key={String(r.slug)} href={`/${lang}/city/${r.slug}/`} className="block p-3 border rounded-lg hover:bg-emerald-50 text-sm"><span className="font-medium text-emerald-700">{String(r.name)}</span><span className="block text-slate-500 mt-1">{formatCurrency(r.avg_home_price_usd as number)}</span></a>
          ))}</div>
        </section>
      )}

      <section className="mt-8"><h2 className="text-xl font-bold mb-3">{t.similar_prices}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">{similarPrice.map(r => (
          <a key={String(r.slug)} href={`/${lang}/city/${r.slug}/`} className="block p-3 border rounded-lg hover:bg-blue-50 text-sm text-center"><span className="font-medium text-blue-700">{String(r.name)}</span><span className="block text-xs text-slate-400">{String(r.country)}</span><span className="block text-slate-600 mt-1 font-semibold">{formatCurrency(r.avg_home_price_usd as number)}</span></a>
        ))}</div>
      </section>

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
