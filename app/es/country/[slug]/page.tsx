import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCountryBySlug, getCitiesByCountry, getAllCountries } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { breadcrumbSchema } from '@/lib/schema';
import { getDictionarySync } from '@/lib/i18n';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { Breadcrumb } from '@/components/Breadcrumb';
import { siteConfig } from '@/site.config';

const t = getDictionarySync('es');

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
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
    title: `${name} — ${t.home_prices} y Mercado Inmobiliario (${new Date().getFullYear()})`,
    description: `Mercado inmobiliario de ${name}: precio promedio ${formatCurrency(country.avg_home_price_usd as number)}, precio por m² ${formatCurrency(country.avg_price_per_sqm_usd as number)}, tasa hipotecaria ${formatPercent(country.mortgage_rate_pct as number)}.`,
    alternates: {
      canonical: `/es/country/${slug}/`,
      languages: { en: `/country/${slug}/`, es: `/es/country/${slug}/` },
    },
    openGraph: { url: `/es/country/${slug}/` },
  };
}

export default async function EsCountryPage({ params }: Props) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const name = String(country.name);
  const cities = getCitiesByCountry(name, 50);

  const crumbs = [
    { name: 'Inicio', url: '/es/' },
    { name: 'Países', url: '/es/' },
    { name, url: `/es/country/${slug}/` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <div className="bg-indigo-600 rounded-xl p-6 mb-6 -mx-1">
        <h1 className="text-3xl font-bold text-white mb-1">Mercado Inmobiliario de {name}</h1>
        <p className="text-indigo-200 text-sm">{String(country.region)} · Moneda: {String(country.currency)}</p>
      </div>

      <FreshnessTag source={siteConfig.dataSource.name} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-emerald-700">{formatCurrency(country.avg_home_price_usd as number)}</div>
          <div className="text-xs text-slate-500">{t.avg_home_price}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-blue-700">{formatCurrency(country.avg_price_per_sqm_usd as number)}</div>
          <div className="text-xs text-slate-500">{t.price_per_sqm}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-amber-700">{formatPercent(country.mortgage_rate_pct as number)}</div>
          <div className="text-xs text-slate-500">{t.mortgage_rate}</div>
        </div>
        <div className={`${(country.price_change_1yr_pct as number) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
          <div className={`text-xl font-bold ${(country.price_change_1yr_pct as number) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {(country.price_change_1yr_pct as number) >= 0 ? '+' : ''}{formatPercent(country.price_change_1yr_pct as number)}
          </div>
          <div className="text-xs text-slate-500">{t.price_change}</div>
        </div>
      </div>

      <InsightBox title={name}
        insight={`${name} tiene una tasa de propiedad de vivienda del ${formatPercent(country.homeownership_rate_pct as number)} y un alquiler promedio de ${formatCurrency(country.avg_rent_1br_usd as number)}${t.per_month} para un apartamento de 1 habitación. Las tasas hipotecarias están al ${formatPercent(country.mortgage_rate_pct as number)}.`}
      />

      <AdSlot id="top" />

      {cities.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Ciudades en {name}</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between p-3 bg-slate-50 text-sm font-semibold">
              <span>{t.city}</span><span>{t.avg_home_price}</span>
            </div>
            {cities.map((city, i) => (
              <a key={String(city.slug)} href={`/es/${city.slug}/`}
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
