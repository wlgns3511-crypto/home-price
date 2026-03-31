import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs, getSimilarPriceCities } from '@/lib/db';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';

const c = siteConfig;

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllSlugs().slice(0, 58).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) return {};
  const name = String(city.name);
  const country = String(city.country);
  return {
    title: `${name} Home Prices & Rent (${new Date().getFullYear()}) — Buy vs Rent`,
    description: `${name}, ${country}: Average home price ${formatCurrency(city.avg_home_price_usd as number)}, rent $${city.avg_rent_1br_usd}/mo. Price per sqm, affordability, mortgage rates, and comparison with other cities.`,
    alternates: { canonical: `/city/${slug}` },
  };
}

// ── Hero color by region (Anti-Spam: visual uniqueness) ─────
const REGION_THEMES: Record<string, { bg: string; text: string; accent: string }> = {
  'North America': { bg: 'bg-blue-600', text: 'text-blue-100', accent: 'text-blue-200' },
  'Europe': { bg: 'bg-indigo-600', text: 'text-indigo-100', accent: 'text-indigo-200' },
  'Asia': { bg: 'bg-rose-600', text: 'text-rose-100', accent: 'text-rose-200' },
  'Middle East': { bg: 'bg-amber-600', text: 'text-amber-100', accent: 'text-amber-200' },
  'Oceania': { bg: 'bg-teal-600', text: 'text-teal-100', accent: 'text-teal-200' },
  'South America': { bg: 'bg-emerald-600', text: 'text-emerald-100', accent: 'text-emerald-200' },
  'Africa': { bg: 'bg-orange-600', text: 'text-orange-100', accent: 'text-orange-200' },
};

// ── City-specific one-liner (Anti-Spam: unique content) ─────
function getCityInsight(name: string, price: number, rent: number, ratio: number, change: number, country: string): string {
  const affordability = ratio > 15 ? 'one of the most unaffordable housing markets globally'
    : ratio > 10 ? 'a challenging market for first-time buyers'
    : ratio > 7 ? 'moderately affordable compared to major global cities'
    : 'relatively affordable for homebuyers';

  const trend = change > 5 ? 'rapidly rising prices driven by strong demand'
    : change > 0 ? 'steady growth in property values'
    : change > -3 ? 'a slight cooling in the housing market'
    : 'significant price corrections underway';

  const rentBurden = rent > 2500 ? 'one of the most expensive rental markets'
    : rent > 1500 ? 'above-average rental costs'
    : rent > 800 ? 'moderate rental prices'
    : 'affordable rents compared to global standards';

  return `${name} is ${affordability}, with ${trend}. The city has ${rentBurden}. At ${formatCurrency(price)} average home price in ${country}, buyers should consider the ${(ratio).toFixed(1)}x price-to-income ratio when planning a purchase.`;
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) notFound();

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

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: country, url: `/search?q=${encodeURIComponent(country)}` },
    { name, url: `/city/${slug}` },
  ];

  const priceChangeDir = change > 0 ? 'increased' : 'decreased';
  const priceChangeAbs = Math.abs(change);

  const faqs = [
    {
      question: `What is the average home price in ${name}?`,
      answer: `The average home price in ${name} is ${formatCurrency(price)}, with a price per square meter of ${formatCurrency(city.price_per_sqm_usd as number)}/sqm as of ${new Date().getFullYear()}.`,
    },
    {
      question: `How much is rent in ${name}?`,
      answer: `Average rent for a 1-bedroom apartment in ${name} is ${formatCurrency(rent)}/month. A 3-bedroom apartment averages ${formatCurrency(city.avg_rent_3br_usd as number)}/month.`,
    },
    {
      question: `Is ${name} affordable for homebuyers?`,
      answer: `${name} has a price-to-income ratio of ${ratio.toFixed(1)}, meaning it takes about ${ratio.toFixed(0)} years of median income to buy an average home. ${ratio > 10 ? 'This is considered expensive by global standards.' : 'This is relatively affordable compared to many major cities.'}`,
    },
    {
      question: `Are home prices in ${name} going up or down?`,
      answer: `Home prices in ${name} have ${priceChangeDir} by ${priceChangeAbs.toFixed(1)}% over the past year. The current mortgage rate is ${formatPercent(city.mortgage_rate_pct as number)}.`,
    },
    {
      question: `Should I buy or rent in ${name}?`,
      answer: `With a price-to-income ratio of ${ratio.toFixed(1)}x and monthly rent at ${formatCurrency(rent)}, ${ratio > 12 ? 'renting may be more practical in the short term' : 'buying could be a good long-term investment'}. Consider your planned duration of stay and mortgage rates at ${formatPercent(city.mortgage_rate_pct as number)}.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      {/* ── Hero (color varies by region = anti-spam) ──────── */}
      <div className={`${theme.bg} rounded-xl p-6 mb-6 -mx-1`}>
        <h1 className="text-3xl font-bold text-white mb-1">{name} Home Prices & Rent</h1>
        <p className={`${theme.accent} text-sm`}>{country} · {region} · Population: {formatNumber(city.population as number)}</p>
        {/* ── One-liner (unique per city = anti-spam) ──────── */}
        <p className={`${theme.text} text-sm mt-3 leading-relaxed`}>
          {getCityInsight(name, price, rent, ratio, change, country)}
        </p>
      </div>

      <FreshnessTag source={c.dataSource.name} />

      {/* ── Key Metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(price)}</div>
          <div className="text-xs text-slate-500 mt-1">Avg Home Price</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(city.price_per_sqm_usd as number)}</div>
          <div className="text-xs text-slate-500 mt-1">Price / sqm</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(rent)}/mo</div>
          <div className="text-xs text-slate-500 mt-1">Rent (1BR)</div>
        </div>
        <div className={`${change >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
          <div className={`text-2xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {change >= 0 ? '+' : ''}{formatPercent(change)}
          </div>
          <div className="text-xs text-slate-500 mt-1">1-Year Change</div>
        </div>
      </div>

      <AdSlot id="top" />

      {/* ── Buying ─────────────────────────────────────────── */}
      <section className="mt-8 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">Buying</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">Average Home Price</td><td className="p-3 text-right font-semibold">{formatCurrency(price)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Price per sqm</td><td className="p-3 text-right font-semibold">{formatCurrency(city.price_per_sqm_usd as number)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Price-to-Income Ratio</td><td className="p-3 text-right font-semibold">{ratio.toFixed(1)}x</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Mortgage Rate</td><td className="p-3 text-right font-semibold">{formatPercent(city.mortgage_rate_pct as number)}</td></tr>
            <tr><td className="p-3 text-slate-600">1-Year Price Change</td><td className={`p-3 text-right font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{formatPercent(change)}</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── Renting ────────────────────────────────────────── */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">Renting</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">1-Bedroom Apartment</td><td className="p-3 text-right font-semibold">{formatCurrency(rent)}/mo</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">3-Bedroom Apartment</td><td className="p-3 text-right font-semibold">{formatCurrency(city.avg_rent_3br_usd as number)}/mo</td></tr>
            <tr><td className="p-3 text-slate-600">Rent-to-Income Ratio</td><td className="p-3 text-right font-semibold">{((city.rent_to_income_ratio as number) * 100).toFixed(0)}%</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── Affordability ──────────────────────────────────── */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">Income & Affordability</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">Median Household Income</td><td className="p-3 text-right font-semibold">{formatCurrency(city.median_income_usd as number)}/year</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Years to Buy (at median income)</td><td className="p-3 text-right font-semibold">{ratio.toFixed(1)} years</td></tr>
            <tr><td className="p-3 text-slate-600">Local Currency</td><td className="p-3 text-right font-semibold">{String(city.currency)}</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── Why It Matters (E-E-A-T) ─────────────────────── */}
      <InsightBox
        title={name}
        insight={`With a price-to-income ratio of ${ratio.toFixed(1)}x, ${name} ${ratio > 12 ? 'is one of the most expensive cities for homebuyers. Consider renting or exploring nearby cities for better value.' : ratio > 8 ? 'requires significant savings to purchase property. At a mortgage rate of ' + formatPercent(city.mortgage_rate_pct as number) + ', monthly payments could consume a large share of income.' : 'offers reasonable opportunities for homebuyers compared to global averages.'} Home prices have ${priceChangeDir} ${priceChangeAbs.toFixed(1)}% in the past year.`}
      />

      {/* ── Internal Mesh: Same Country ───────────────────── */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Other Cities in {country}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {related.map(r => (
              <a key={String(r.slug)} href={`/city/${r.slug}/`}
                className="block p-3 border rounded-lg hover:bg-emerald-50 text-sm">
                <span className="font-medium text-emerald-700">{String(r.name)}</span>
                <span className="block text-slate-500 mt-1">{formatCurrency(r.avg_home_price_usd as number)} avg</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Internal Mesh: Similar Price (cross-country!) ─── */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Cities with Similar Home Prices</h2>
        <p className="text-sm text-slate-500 mb-3">Cities worldwide with home prices closest to {name}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {similarPrice.map(r => (
            <a key={String(r.slug)} href={`/city/${r.slug}/`}
              className="block p-3 border rounded-lg hover:bg-blue-50 text-sm text-center">
              <span className="font-medium text-blue-700">{String(r.name)}</span>
              <span className="block text-xs text-slate-400">{String(r.country)}</span>
              <span className="block text-slate-600 mt-1 font-semibold">{formatCurrency(r.avg_home_price_usd as number)}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Popular Comparisons ───────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Compare {name} With</h2>
        <div className="flex flex-wrap gap-2">
          {similarPrice.slice(0, 3).map(r => (
            <a key={String(r.slug)} href={`/compare/${slug}-vs-${r.slug}/`}
              className="px-4 py-2 border rounded-full text-sm hover:bg-emerald-50 text-emerald-700 font-medium">
              {name} vs {String(r.name)}
            </a>
          ))}
          {related.slice(0, 2).map(r => (
            <a key={String(r.slug)} href={`/compare/${slug}-vs-${r.slug}/`}
              className="px-4 py-2 border rounded-full text-sm hover:bg-emerald-50 text-emerald-700 font-medium">
              {name} vs {String(r.name)}
            </a>
          ))}
        </div>
      </section>

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
