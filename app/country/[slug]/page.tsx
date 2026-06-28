import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCountryBySlug, getCitiesByCountry, getAllCountries } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { breadcrumbSchema, datasetSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { Breadcrumb } from '@/components/Breadcrumb';
import { HousingVerdictStrip } from '@/components/upgrades/HousingVerdictStrip';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllCountries().map(c => ({ slug: String(c.slug) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return {};
  const name = String(country.name);
  return {
    title: `${name} Home Prices & Housing Market (${new Date().getFullYear()})`,
    description: `${name} housing market: average home price ${formatCurrency(country.avg_home_price_usd as number)}, price per sqm ${formatCurrency(country.avg_price_per_sqm_usd as number)}, mortgage rate ${formatPercent(country.mortgage_rate_pct as number)}.`,
    alternates: { canonical: `/country/${slug}/` },
    openGraph: { url: `/country/${slug}/` },
  };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const name = String(country.name);
  const cities = getCitiesByCountry(name, 50);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Countries', url: '/search/?q=' },
    { name, url: `/country/${slug}/` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datasetSchema(
              `${name} — international housing affordability dataset`,
              `Average home price, price per square metre, mortgage rate, OECD price-to-income tier, and homeownership rate for ${name}, anchored to OECD Housing Prices and named national statistics offices.`,
              `/country/${slug}/`,
              'intl',
            ),
          ),
        }}
      />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <div className="bg-indigo-600 rounded-xl p-6 mb-6 -mx-1">
        <h1 className="text-3xl font-bold text-white mb-1">{name} Housing Market</h1>
        <p className="text-indigo-200 text-sm">{String(country.region)} · Currency: {String(country.currency)}</p>
      </div>

      <FreshnessTag source={siteConfig.dataSource.name} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-emerald-700">{formatCurrency(country.avg_home_price_usd as number)}</div>
          <div className="text-xs text-slate-500">Avg Home Price</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-blue-700">{formatCurrency(country.avg_price_per_sqm_usd as number)}</div>
          <div className="text-xs text-slate-500">Price / sqm</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-amber-700">{formatPercent(country.mortgage_rate_pct as number)}</div>
          <div className="text-xs text-slate-500">Mortgage Rate</div>
        </div>
        <div className={`${(country.price_change_1yr_pct as number) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
          <div className={`text-xl font-bold ${(country.price_change_1yr_pct as number) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {(country.price_change_1yr_pct as number) >= 0 ? '+' : ''}{formatPercent(country.price_change_1yr_pct as number)}
          </div>
          <div className="text-xs text-slate-500">1yr Change</div>
        </div>
      </div>

      <InsightBox title={name}
        insight={`${name} has a homeownership rate of ${formatPercent(country.homeownership_rate_pct as number)} and average rent of ${formatCurrency(country.avg_rent_1br_usd as number)}/month for a 1BR apartment. Mortgage rates are at ${formatPercent(country.mortgage_rate_pct as number)}.`}
      />

      <HousingVerdictStrip
        entityName={name}
        homeValueUsd={country.avg_home_price_usd as number | null}
        mortgage30Pct={country.mortgage_rate_pct as number | null}
        medianIncomeUsd={country.median_income_usd as number | null}
        scope="intl"
      />

      <AdSlot id="top" />

      {cities.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Cities in {name}</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between p-3 bg-slate-50 text-sm font-semibold">
              <span>City</span><span>Avg Home Price</span>
            </div>
            {cities.map((city, i) => (
              <a key={String(city.slug)} href={`/city/${city.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-emerald-50 border-b border-slate-100 text-sm">
                <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(city.name)}</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(city.avg_home_price_usd as number)}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
