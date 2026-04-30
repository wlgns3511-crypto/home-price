import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs, getSimilarPriceCities, getNationalMedianPrice } from '@/lib/db';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDbPageGate } from '@/lib/db-page';
import { breadcrumbSchema, faqSchema, placeSchema } from '@/lib/schema';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { buildLocaleAlternates, getDataVintageLabel, getMethodologyUrl, getReviewedAt, getReviewedBy } from '@/lib/seo';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { FAQ } from '@/components/FAQ';
import { MethodologyInline } from '@/components/MethodologyInline';
import { Breadcrumb } from '@/components/Breadcrumb';
import { InsightCards } from '@/components/InsightCards';
import { AffordabilityBar } from '@/components/AffordabilityBar';
import { AnswerHero } from '@/components/upgrades/AnswerHero';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { InsightBlock } from '@/components/upgrades/InsightBlock';
import { DecisionNext } from '@/components/upgrades/DecisionNext';
import { generateInsights } from '@/lib/insights';
import { generateCityFaqs } from '@/lib/auto-faqs';
import { TableOfContents } from '@/components/upgrades/TableOfContents';
import { HomeAffordabilityCalc } from '@/components/tools/HomeAffordabilityCalc';

const c = siteConfig;

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllSlugs().slice(0, 500).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) return {};
  const name = String(city.name);
  const country = String(city.country);
  const price = city.avg_home_price_usd as number;
  const sqm = city.price_per_sqm_usd as number;
  const rent = city.avg_rent_1br_usd as number;
  const ratio = city.price_to_income_ratio as number;
  const change = city.price_change_1yr_pct as number;
  const topAnswer = buildCityTopAnswer(name, price, rent, ratio, change, country);
  // Prefer same-country peer; fall back to globally similar-priced
  const sameCountry = getRelated(country, slug, 20);
  const pickPeer = (cands: Record<string, unknown>[]) => cands.find((r) => {
    const cp = r.avg_home_price_usd as number;
    const diff = Math.abs((cp - price) / price);
    return diff > 0.05 && diff < 0.8 && String(r.name) !== name;
  });
  const compare = pickPeer(sameCountry) || pickPeer(getSimilarPriceCities(price, slug, 10));
  let title: string;
  let description: string;
  if (compare) {
    const cmpPrice = compare.avg_home_price_usd as number;
    const cmpSqm = compare.price_per_sqm_usd as number;
    const pct = Math.round(((cmpPrice - price) / cmpPrice) * 100);
    const absPct = Math.abs(pct);
    const dir = pct > 0 ? 'cheaper' : 'pricier';
    title = `${name} Home Prices: $${sqm.toLocaleString()}/sqm vs ${String(compare.name)} $${cmpSqm.toLocaleString()}`;
    description = topAnswer;
  } else {
    title = `${name} Home Prices: ${formatCurrency(price)} Avg, $${sqm.toLocaleString()}/sqm`;
    description = topAnswer;
  }
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer: description,
  });
  return {
    title,
    description,
    alternates: buildLocaleAlternates(`/city/${slug}/`),
    openGraph: { title, description, url: `/city/${slug}/`, type: 'article' },
    robots: buildDbPageRobots(gate.pass),
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

function buildCityTopAnswer(name: string, price: number, rent: number, ratio: number, change: number, country: string): string {
  return `${getCityInsight(name, price, rent, ratio, change, country)} A typical 1-bedroom rents for ${formatCurrency(rent)} per month, which helps show whether buying pressure is matched by a rental market that is also tight.`;
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
  const topAnswer = buildCityTopAnswer(name, price, rent, ratio, change, country);

  const related = getRelated(country, slug, 6);
  const similarPrice = getSimilarPriceCities(price, slug, 5);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: country, url: `/search/?q=${encodeURIComponent(country)}/` },
    { name, url: `/city/${slug}/` },
  ];

  const priceChangeDir = change > 0 ? 'increased' : 'decreased';
  const priceChangeAbs = Math.abs(change);

  const faqs = generateCityFaqs({
    name,
    country,
    region: String(city.region || 'North America'),
    avg_home_price_usd: price,
    price_per_sqm_usd: city.price_per_sqm_usd as number,
    price_change_1yr_pct: change,
    avg_rent_1br_usd: rent,
    avg_rent_3br_usd: city.avg_rent_3br_usd as number,
    median_income_usd: city.median_income_usd as number,
    price_to_income_ratio: ratio,
    mortgage_rate_pct: city.mortgage_rate_pct as number,
    rent_to_income_ratio: city.rent_to_income_ratio as number,
    population: city.population as number | undefined,
    currency: city.currency as string | undefined,
  }, getNationalMedianPrice());

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema({ name, country, slug, population: city.population as number, avg_home_price_usd: price })) }} />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <AnswerHero
        title={`${name} home prices & rent`}
        subtitle={`${country} · ${region}`}
        tagline={topAnswer}
        badges={[
          { label: `${ratio.toFixed(1)}x price-to-income`, tone: ratio > 10 ? "amber" as const : "emerald" as const },
          { label: change >= 0 ? `+${formatPercent(change)} 1Y` : `${formatPercent(change)} 1Y`, tone: change >= 0 ? "indigo" as const : "slate" as const },
          { label: region, tone: "slate" as const },
        ]}
        alternatives={similarPrice.slice(0, 3).map((r) => ({
          label: String(r.name),
          href: `/city/${r.slug}/`,
          sublabel: formatCurrency(r.avg_home_price_usd as number),
        }))}
        alternativesLabel="Cities at a similar price"
      />

      <TrustBlock
        sources={[
          {
            name: "Numbeo Property Prices",
            url: `https://www.numbeo.com/property-investment/in/${encodeURIComponent(name)}/`,
          },
          {
            name: "Census ACS Housing",
            url: "https://www.census.gov/topics/housing.html",
          },
          {
            name: "Federal Reserve H.15 (mortgage rates)",
            url: "https://www.federalreserve.gov/releases/h15/",
          },
          {
            name: "Freddie Mac PMMS",
            url: "https://www.freddiemac.com/pmms",
          },
          {
            name: "OECD Housing Prices",
            url: "https://data.oecd.org/price/housing-prices.htm",
          },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={getMethodologyUrl()}
      />

      <InsightBlock
        entityName={name}
        insights={generateInsights({
          name,
          country,
          avg_home_price_usd: price,
          median_income_usd: city.median_income_usd as number,
          price_change_1yr_pct: change,
          price_per_sqm_usd: city.price_per_sqm_usd as number,
          avg_rent_1br_usd: rent,
          mortgage_rate_pct: city.mortgage_rate_pct as number,
          price_to_income_ratio: ratio,
          nationalMedianPrice: getNationalMedianPrice() ?? 0,
        })}
      />

      <TableOfContents />

      {/* Hide legacy hero (kept for accessibility tooling) */}
      <div className="sr-only">
        <h2>{name} Home Prices &amp; Rent</h2>
      </div>

      <FreshnessTag
        source={c.dataSource.name}
        reviewedAt={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
      />

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

      <InsightCards price={price} change={change} medianIncome={city.median_income_usd as number} cityName={name} />

      <AffordabilityBar price={price} income={city.median_income_usd as number} />

      {/* Home Affordability Calculator */}
      <HomeAffordabilityCalc
        cityName={name}
        avgPrice={price}
        mortgageRate={city.mortgage_rate_pct as number}
      />

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

      {/* Why this matters — buyer / renter decision context */}
      <section className="mb-8 mt-6" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why home prices in {name} matter
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          {(() => {
            const isUS = country === "United States" || country === "USA";
            const veryExpensive = ratio > 12;
            const expensive = ratio > 8 && ratio <= 12;
            const moderate = ratio > 5 && ratio <= 8;
            const mortgageRate = city.mortgage_rate_pct as number;

            const primary = veryExpensive
              ? `${name} sits in the global &ldquo;very expensive&rdquo; tier for homebuyers. A price-to-income ratio of ${ratio.toFixed(1)}x means it would take roughly ${Math.round(ratio)} years of median household income to fully pay off an average home. For most households this implies either a long-distance move into a cheaper market, accepting a smaller place than expected, or staying in the rental market for the foreseeable future.`
              : expensive
              ? `${name}&apos;s price-to-income ratio of ${ratio.toFixed(1)}x places it in the &ldquo;expensive&rdquo; band. At a mortgage rate of ${formatPercent(mortgageRate)}, monthly principal and interest will consume a meaningful share of median income. The standard advice is to keep total housing costs (P&amp;I + tax + insurance + HOA) under 28% of gross income.`
              : moderate
              ? `${name} is moderately priced relative to local incomes (${ratio.toFixed(1)}x price-to-income). For a buyer with a stable job and a reasonable down payment, the math here generally works without extreme stretches.`
              : `${name} is on the affordable end relative to local incomes (${ratio.toFixed(1)}x). Markets like this favor buyers, but check the rental side too \u2014 sometimes &ldquo;cheap to buy&rdquo; reflects soft demand or out-migration that could affect resale.`;

            const trendNote = `Prices have ${priceChangeDir} ${priceChangeAbs.toFixed(1)}% over the past year. A single-year change isn&apos;t a trend, but it tells you which direction the market is moving right now and how aggressive an offer might need to be.`;

            const buyVsRentNote = `For a quick buy-vs-rent gut check: at $${rent}/mo for a 1-bedroom, annual rent is roughly ${formatCurrency((rent as number) * 12)}. Multiply that by 15-20 to get a rough &ldquo;break-even&rdquo; home price for renting versus buying with a 30-year mortgage \u2014 if average prices are well above that, renting often wins on a 5-year horizon.`;

            const usNote = isUS
              ? `For US buyers, also factor in: the SALT deduction cap of $10,000 (IRS Pub 530), state-specific transfer taxes at closing, and HOA fees in condo/townhouse markets. These can add 1-3% to your effective annual housing cost.`
              : null;

            return (
              <>
                <p dangerouslySetInnerHTML={{ __html: primary }} />
                <p dangerouslySetInnerHTML={{ __html: trendNote }} />
                <p dangerouslySetInnerHTML={{ __html: buyVsRentNote }} />
                {usNote && <p className="text-sm text-slate-500">{usNote}</p>}
              </>
            );
          })()}
        </div>
      </section>

      <DecisionNext
        cards={[
          {
            title: `Mortgage rates for ${country}`,
            blurb: `See current 30-year fixed and ARM rates and how they affect your monthly payment in ${name}.`,
            href: `https://homeloanpeek.com`,
            cta: `Open HomeLoanPeek`,
            tone: "indigo" as const,
          },
          {
            title: `Cost of living in ${name}`,
            blurb: `The other big lever in any relocation decision \u2014 housing is part of the picture, but not all of it.`,
            href: `https://costbycity.com`,
            cta: `Open CostByCity`,
            tone: "emerald" as const,
          },
          {
            title: `Property tax in this metro`,
            blurb: `Property tax can add 0.5\u20132% per year to the cost of owning. See your county's median bill.`,
            href: `https://propertytaxpeek.com`,
            cta: `Open PropertyTaxPeek`,
            tone: "amber" as const,
          },
        ]}
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-sm">
        <p className="text-slate-600">
          <strong>Related:</strong> Also check <a href="https://costbycity.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">cost of living</a> and <a href="https://fairrentwize.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">rent prices</a> for this area.
        </p>
      </div>

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

      {/* 2026-04-28 — 'Popular Comparisons' /compare/{a}-vs-{b}/ 위젯 제거
          (AdSense scaled-content remediation, /compare/* noindex).
          RelatedEntities 위젯이 비슷한 가격대 도시 탐색 경로 유지함. */}

      <RelatedEntities
        entityName={name}
        items={similarPrice.map(c => ({
          name: String(c.name),
          href: `/city/${c.slug}/`,
          stat: formatCurrency(c.avg_home_price_usd as number),
        }))}
        heading={`Cities with prices similar to ${name}`}
        statLabel="Avg price"
      />

      <AdSlot id="bottom" />

      <MethodologyInline
        source={{ name: 'Numbeo Property Prices', url: `https://www.numbeo.com/property-investment/in/${encodeURIComponent(name)}/` }}
        release="Crowd-sourced dataset, refreshed monthly"
        dataYear={c.dataSource.year}
        cadence="Monthly rebuild from Numbeo + Census ACS + Federal Reserve H.15"
        dbUpdated={siteConfig.dbUpdated ?? getReviewedAt() ?? '2026-04-19'}
        limits={[
          'Numbeo prices are user-submitted; spot checks against Census ACS and local MLS may diverge 5–15%.',
          'Mortgage rates reflect Freddie Mac PMMS national averages and not point-lender quotes.',
          `Currency displayed in USD; local ${String(city.currency)} figures round-tripped at the release date FX rate.`,
        ]}
        pageLimits={[
          `${name} price-to-income uses median household income (${formatCurrency(city.median_income_usd as number)}) — individual households may see materially different ratios.`,
        ]}
        fullHref="/methodology/"
      />

      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
