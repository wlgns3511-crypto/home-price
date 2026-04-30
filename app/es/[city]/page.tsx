import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs, getSimilarPriceCities } from '@/lib/db';
import { breadcrumbSchema, faqSchema, placeSchema } from '@/lib/schema';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { getDictionarySync } from '@/lib/i18n';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';
import { InsightCards } from '@/components/InsightCards';
import { AffordabilityBar } from '@/components/AffordabilityBar';

const c = siteConfig;
const t = getDictionarySync('es');

interface Props { params: Promise<{ city: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllSlugs().map(s => ({ city: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getBySlug(slug);
  if (!city) return {};
  const name = String(city.name);
  const country = String(city.country);
  const title = `${name} — ${t.home_prices} (${new Date().getFullYear()}) | Comprar vs Alquilar`;
  const description = `${name}, ${country}: ${t.avg_home_price} ${formatCurrency(city.avg_home_price_usd as number)}, alquiler $${city.avg_rent_1br_usd}/mes. ${t.price_per_sqm}, accesibilidad, ${t.mortgage_rate.toLowerCase()} y comparaciones.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/es/${slug}/`,
      languages: { en: `/city/${slug}/`, es: `/es/${slug}/` },
    },
    openGraph: { title, description, url: `/es/${slug}/`, type: 'article' },
  };
}

const REGION_THEMES: Record<string, { bg: string; text: string; accent: string }> = {
  'North America': { bg: 'bg-blue-600', text: 'text-blue-100', accent: 'text-blue-200' },
  'Europe': { bg: 'bg-indigo-600', text: 'text-indigo-100', accent: 'text-indigo-200' },
  'Asia': { bg: 'bg-rose-600', text: 'text-rose-100', accent: 'text-rose-200' },
  'Middle East': { bg: 'bg-amber-600', text: 'text-amber-100', accent: 'text-amber-200' },
  'Oceania': { bg: 'bg-teal-600', text: 'text-teal-100', accent: 'text-teal-200' },
  'South America': { bg: 'bg-emerald-600', text: 'text-emerald-100', accent: 'text-emerald-200' },
  'Africa': { bg: 'bg-orange-600', text: 'text-orange-100', accent: 'text-orange-200' },
};

function getCityInsightEs(name: string, price: number, rent: number, ratio: number, change: number, country: string): string {
  const affordability = ratio > 15 ? 'uno de los mercados inmobiliarios menos accesibles del mundo'
    : ratio > 10 ? 'un mercado complicado para compradores primerizos'
    : ratio > 7 ? 'moderadamente accesible en comparación con grandes ciudades'
    : 'relativamente accesible para compradores';

  const trend = change > 5 ? 'precios en rápido ascenso impulsados por fuerte demanda'
    : change > 0 ? 'crecimiento estable en el valor de las propiedades'
    : change > -3 ? 'un leve enfriamiento del mercado inmobiliario'
    : 'correcciones significativas de precios en curso';

  const rentBurden = rent > 2500 ? 'uno de los mercados de alquiler más caros'
    : rent > 1500 ? 'costos de alquiler superiores al promedio'
    : rent > 800 ? 'precios de alquiler moderados'
    : 'alquileres accesibles en comparación con estándares globales';

  return `${name} es ${affordability}, con ${trend}. La ciudad tiene ${rentBurden}. Con un precio promedio de vivienda de ${formatCurrency(price)} en ${country}, los compradores deben considerar el ratio precio/ingreso de ${ratio.toFixed(1)}x al planificar una compra.`;
}

export default async function EsCityPage({ params }: Props) {
  const { city: slug } = await params;
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
    { name: 'Inicio', url: '/es/' },
    { name: country, url: `/es/country/${encodeURIComponent(country.toLowerCase().replace(/\s+/g, '-'))}/` },
    { name, url: `/es/${slug}/` },
  ];

  const priceChangeDir = change > 0 ? 'aumentado' : 'disminuido';
  const priceChangeAbs = Math.abs(change);

  const faqs = [
    {
      question: `${t.faq_what_price} ${name}?`,
      answer: `El precio promedio de vivienda en ${name} es ${formatCurrency(price)}, con un precio por metro cuadrado de ${formatCurrency(city.price_per_sqm_usd as number)}/m² en ${new Date().getFullYear()}.`,
    },
    {
      question: `${t.faq_how_much_rent} ${name}?`,
      answer: `El alquiler promedio de un apartamento de 1 habitación en ${name} es ${formatCurrency(rent)}${t.per_month}. Un apartamento de 3 habitaciones cuesta en promedio ${formatCurrency(city.avg_rent_3br_usd as number)}${t.per_month}.`,
    },
    {
      question: `${t.faq_affordable} ${name}?`,
      answer: `${name} tiene un ratio precio/ingreso de ${ratio.toFixed(1)}, lo que significa que se necesitan aproximadamente ${ratio.toFixed(0)} ${t.years} de ingreso medio para comprar una vivienda promedio. ${ratio > 10 ? 'Esto se considera caro según estándares globales.' : 'Esto es relativamente accesible comparado con muchas grandes ciudades.'}`,
    },
    {
      question: `${t.faq_trend} ${name}?`,
      answer: `Los precios de vivienda en ${name} han ${priceChangeDir} un ${priceChangeAbs.toFixed(1)}% en el último año. La tasa hipotecaria actual es ${formatPercent(city.mortgage_rate_pct as number)}.`,
    },
    {
      question: `¿Debería comprar o alquilar en ${name}?`,
      answer: `Con un ratio precio/ingreso de ${ratio.toFixed(1)}x y un alquiler mensual de ${formatCurrency(rent)}, ${ratio > 12 ? 'alquilar puede ser más práctico a corto plazo' : 'comprar podría ser una buena inversión a largo plazo'}. Considera la duración de tu estancia y las tasas hipotecarias al ${formatPercent(city.mortgage_rate_pct as number)}.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema({ name, country, slug, population: city.population as number, avg_home_price_usd: price })) }} />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <div className={`${theme.bg} rounded-xl p-6 mb-6 -mx-1`}>
        <h1 className="text-3xl font-bold text-white mb-1">{t.home_prices} en {name}</h1>
        <p className={`${theme.accent} text-sm`}>{country} · {region} · {t.population}: {formatNumber(city.population as number)}</p>
        <p className={`${theme.text} text-sm mt-3 leading-relaxed`}>
          {getCityInsightEs(name, price, rent, ratio, change, country)}
        </p>
      </div>

      <FreshnessTag source={c.dataSource.name} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(price)}</div>
          <div className="text-xs text-slate-500 mt-1">{t.avg_home_price}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(city.price_per_sqm_usd as number)}</div>
          <div className="text-xs text-slate-500 mt-1">{t.price_per_sqm}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(rent)}{t.per_month}</div>
          <div className="text-xs text-slate-500 mt-1">{t.rent_1br}</div>
        </div>
        <div className={`${change >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
          <div className={`text-2xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {change >= 0 ? '+' : ''}{formatPercent(change)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{t.price_change}</div>
        </div>
      </div>

      <AdSlot id="top" />

      <InsightCards price={price} change={change} medianIncome={city.median_income_usd as number} cityName={name} />

      <AffordabilityBar price={price} income={city.median_income_usd as number} />

      {/* Compra */}
      <section className="mt-8 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">{t.buying}</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.avg_home_price}</td><td className="p-3 text-right font-semibold">{formatCurrency(price)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.price_per_sqm}</td><td className="p-3 text-right font-semibold">{formatCurrency(city.price_per_sqm_usd as number)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.price_to_income}</td><td className="p-3 text-right font-semibold">{ratio.toFixed(1)}x</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.mortgage_rate}</td><td className="p-3 text-right font-semibold">{formatPercent(city.mortgage_rate_pct as number)}</td></tr>
            <tr><td className="p-3 text-slate-600">{t.price_change}</td><td className={`p-3 text-right font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{formatPercent(change)}</td></tr>
          </tbody>
        </table>
      </section>

      {/* Alquiler */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">{t.renting}</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.rent_1br}</td><td className="p-3 text-right font-semibold">{formatCurrency(rent)}{t.per_month}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.rent_3br}</td><td className="p-3 text-right font-semibold">{formatCurrency(city.avg_rent_3br_usd as number)}{t.per_month}</td></tr>
            <tr><td className="p-3 text-slate-600">{t.rent_to_income}</td><td className="p-3 text-right font-semibold">{((city.rent_to_income_ratio as number) * 100).toFixed(0)}%</td></tr>
          </tbody>
        </table>
      </section>

      {/* Ingresos y Accesibilidad */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">{t.affordability}</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">{t.median_income}</td><td className="p-3 text-right font-semibold">{formatCurrency(city.median_income_usd as number)}{t.per_year}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Años para Comprar</td><td className="p-3 text-right font-semibold">{ratio.toFixed(1)} {t.years}</td></tr>
            <tr><td className="p-3 text-slate-600">Moneda Local</td><td className="p-3 text-right font-semibold">{String(city.currency)}</td></tr>
          </tbody>
        </table>
      </section>

      <InsightBox
        title={name}
        insight={`Con un ratio precio/ingreso de ${ratio.toFixed(1)}x, ${name} ${ratio > 12 ? 'es una de las ciudades más caras para compradores. Considera alquilar o explorar ciudades cercanas para mejor valor.' : ratio > 8 ? 'requiere ahorros significativos para comprar propiedad. Con una tasa hipotecaria de ' + formatPercent(city.mortgage_rate_pct as number) + ', los pagos mensuales podrían consumir gran parte del ingreso.' : 'ofrece oportunidades razonables para compradores comparado con promedios globales.'} Los precios han ${priceChangeDir} un ${priceChangeAbs.toFixed(1)}% en el último año.`}
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-sm">
        <p className="text-slate-600">
          <strong>Relacionado:</strong> Consulta también el <a href="https://costbycity.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">costo de vida</a> y los <a href="https://fairrentwize.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">precios de alquiler</a> de esta zona.
        </p>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">{t.related_cities} {country}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {related.map(r => (
              <a key={String(r.slug)} href={`/es/${r.slug}/`}
                className="block p-3 border rounded-lg hover:bg-emerald-50 text-sm">
                <span className="font-medium text-emerald-700">{String(r.name)}</span>
                <span className="block text-slate-500 mt-1">{formatCurrency(r.avg_home_price_usd as number)} prom.</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">{t.similar_prices}</h2>
        <p className="text-sm text-slate-500 mb-3">Ciudades con precios de vivienda similares a {name}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {similarPrice.map(r => (
            <a key={String(r.slug)} href={`/es/${r.slug}/`}
              className="block p-3 border rounded-lg hover:bg-blue-50 text-sm text-center">
              <span className="font-medium text-blue-700">{String(r.name)}</span>
              <span className="block text-xs text-slate-400">{String(r.country)}</span>
              <span className="block text-slate-600 mt-1 font-semibold">{formatCurrency(r.avg_home_price_usd as number)}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 2026-04-28 — Spanish 'Compare with' /compare/ 위젯 제거 (AdSense scaled-content remediation) */}

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
