import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates, getStateBySlug, getStatesSortedByPrice } from '@/lib/states-data';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDbPageGate } from '@/lib/db-page';
import { generateStateInsights } from '@/lib/state-insights';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { formatCurrency, formatPercent } from '@/lib/format';
import { buildLocaleAlternates, getDataVintageLabel, getMethodologyUrl, getReviewedAt, getReviewedBy } from '@/lib/seo';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from "@/components/FeedbackButton";
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { PIRGauge } from '@/components/upgrades/PIRGauge';
import { MortgageDeltaCard } from '@/components/upgrades/MortgageDeltaCard';
import { BuyVsRentCrossover } from '@/components/upgrades/BuyVsRentCrossover';
import { CostBurdenCompass } from '@/components/upgrades/CostBurdenCompass';
import { AppreciationSparkline } from '@/components/upgrades/AppreciationSparkline';
import { PITIBreakdownCard } from '@/components/upgrades/PITIBreakdownCard';
import {
  getAffordabilityIndex,
  getMortgageCostDelta,
  getBuyVsRentCrossover,
  getCostBurdenCompass,
  getAppreciationTrend,
  getOwnershipBurden,
  getPeerStates,
  getCrossSiteLinks,
} from '@/lib/housing-landscape';
import { buildNarrative } from '@/lib/housing-narrative';
import { siteConfig } from '@/site.config';
import { StateRich } from '@/components/state/StateRich';

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const revalidate = 86400;

function buildStateTopAnswer(state: NonNullable<ReturnType<typeof getStateBySlug>>) {
  return `${state.name} has a median home price of ${formatCurrency(state.medianHomePrice)} and a year-over-year change of ${state.yoyChange >= 0 ? '+' : ''}${formatPercent(state.yoyChange)}. The affordability index of ${state.affordabilityIndex}/100 is the quickest signal for whether homebuyers here are facing a manageable market or persistent price pressure.`;
}

export async function generateStaticParams() {
  return getAllStates().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const title = `Home Prices in ${state.name} — Median Values & Trends`;
  const description = buildStateTopAnswer(state);
  const gate = getDbPageGate({
    alternativeLinkCount: Math.max(3, state.topCities.length),
    topAnswer: description,
  });
  return {
    title,
    description,
    alternates: buildLocaleAlternates(`/state/${slug}/`),
    openGraph: { title, description, url: `/state/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

function buildFaqs(state: ReturnType<typeof getStateBySlug>) {
  if (!state) return [];
  return [
    {
      question: `What is the median home price in ${state.name}?`,
      answer: `The median home price in ${state.name} is ${formatCurrency(state.medianHomePrice)} based on the current ${getDataVintageLabel()} snapshot used on this page.`,
    },
    {
      question: `Are home prices rising or falling in ${state.name}?`,
      answer: `Home prices in ${state.name} changed by ${state.yoyChange >= 0 ? '+' : ''}${formatPercent(state.yoyChange)} year-over-year, ${state.yoyChange >= 0 ? 'indicating continued appreciation' : 'indicating a price decline'}.`,
    },
    {
      question: `Is ${state.name} affordable for homebuyers?`,
      answer: `${state.name} has an affordability index of ${state.affordabilityIndex} out of 100. ${state.affordabilityIndex >= 60 ? 'This is considered relatively affordable.' : state.affordabilityIndex >= 40 ? 'This represents moderate affordability.' : 'This indicates significant affordability challenges.'}`,
    },
    {
      question: `What are the most popular cities to buy a home in ${state.name}?`,
      answer: `The top cities for home purchases in ${state.name} include ${state.topCities.join(', ')}.`,
    },
    {
      question: `How does ${state.name} compare to the national average?`,
      answer: `The national median home price is approximately $350,000. ${state.name}'s median of ${formatCurrency(state.medianHomePrice)} is ${state.medianHomePrice > 350000 ? 'above' : 'below'} the national average.`,
    },
  ];
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
    { name: state.name, url: `/state/${slug}/` },
  ];
  const allStates = getAllStates();
  const faqs = buildFaqs(state);
  const insights = generateStateInsights(state, allStates);
  const topAnswer = buildStateTopAnswer(state);

  // Layer 1 facts (housing-landscape.ts)
  const affordability = getAffordabilityIndex(state, allStates);
  const mortgageDelta = getMortgageCostDelta(state);
  const crossover = getBuyVsRentCrossover(state);
  const costBurden = getCostBurdenCompass(state, allStates);
  const appreciation = getAppreciationTrend(state, allStates);
  const ownership = getOwnershipBurden(state);
  const peers = getPeerStates(state, allStates);
  const crossSite = getCrossSiteLinks(state);

  // Layer 2 narrative (housing-narrative.ts)
  const narrative = buildNarrative(state, allStates);

  // Rank among all states
  const sortedByPrice = getStatesSortedByPrice('desc');
  const priceRank = sortedByPrice.findIndex(s => s.slug === slug) + 1;
  const total = sortedByPrice.length;

  // Neighboring states by price
  const currentIdx = sortedByPrice.findIndex(s => s.slug === slug);
  const nearbyStates = sortedByPrice
    .filter((_, i) => Math.abs(i - currentIdx) > 0 && Math.abs(i - currentIdx) <= 3)
    .slice(0, 5);

  const affordLabel = state.affordabilityIndex >= 60
    ? 'Affordable'
    : state.affordabilityIndex >= 40
      ? 'Moderate'
      : 'Expensive';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
        />
      )}

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <div className="bg-emerald-600 rounded-xl p-6 mb-6 -mx-1">
        <h1 className="text-3xl font-bold text-white mb-1">Home Prices in {state.name}</h1>
        <p className="max-w-3xl text-sm leading-6 text-emerald-100 mt-3">
          {topAnswer}
        </p>
      </div>

      <FreshnessTag
        source={siteConfig.dataSource.name}
        reviewedAt={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
      />
      <TrustBlock
        sources={[
          { name: 'Zillow Home Value Index (ZHVI)', url: 'https://www.zillow.com/research/data/' },
          { name: 'FHFA House Price Index', url: 'https://www.fhfa.gov/data/hpi' },
          { name: 'US Census Bureau (ACS 5-year)', url: 'https://www.census.gov/programs-surveys/acs/' },
          { name: 'FRED MORTGAGE30US', url: 'https://fred.stlouisfed.org/series/MORTGAGE30US' },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={getMethodologyUrl()}
      />

      <InsightBox
        title={state.name}
        insight={`${state.name} ranks #${priceRank} out of ${total} states by median home price at ${formatCurrency(state.medianHomePrice)}. Prices have changed ${state.yoyChange >= 0 ? '+' : ''}${formatPercent(state.yoyChange)} over the past year. The state is rated "${affordLabel}" with an affordability index of ${state.affordabilityIndex}/100.`}
      />

      <section className="grid gap-4 md:grid-cols-2 my-6">
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">What the statewide median means</h2>
          <p className="text-sm leading-6 text-slate-600">
            Statewide medians are useful because they show whether high prices are isolated to a few metros or widespread across the market. In {state.name}, the combination of median price, annual change, and affordability gives you the baseline before you decide whether city-level hunting is likely to uncover materially cheaper options.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">How to use this page</h2>
          <p className="text-sm leading-6 text-slate-600">
            Start here for the state-level baseline, then compare top cities and similarly priced states to see where the real pressure sits. If the affordability score is weak, the next useful check is whether local metros are actually cheaper or just moving in the same direction.
          </p>
        </article>
      </section>

      <section className="my-6 p-6 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-xl border border-emerald-100">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Key Insights for {state.name}</h2>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-2">Affordability landscape</h2>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl leading-6">{narrative.affordability}</p>
      <PIRGauge facts={affordability} stateName={state.name} />

      <AdSlot id="top" />

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-2">Rate translator — what a 1% move costs</h2>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl leading-6">{narrative.rateContext}</p>
      <MortgageDeltaCard facts={mortgageDelta} stateName={state.name} />

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-2">PITI breakdown on the median home</h2>
      <PITIBreakdownCard facts={ownership} stateName={state.name} />

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-2">Buy vs rent crossover</h2>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl leading-6">{narrative.buyVsRent}</p>
      <BuyVsRentCrossover facts={crossover} stateName={state.name} />

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-2">Long-run appreciation path</h2>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl leading-6">{narrative.appreciation}</p>
      <AppreciationSparkline facts={appreciation} stateName={state.name} />

      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-2">Cost burden — HUD 30% threshold</h2>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl leading-6">{narrative.costBurden}</p>
      <CostBurdenCompass facts={costBurden} stateName={state.name} totalStates={allStates.length} />

      <section className="my-8 rounded-xl border border-slate-200 p-5 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          {peers.clusterLabel} peer states
        </h2>
        <p className="text-sm text-slate-600 mb-3">
          States with the most similar price-to-income structure to {state.name}.
        </p>
        {peers.peers.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-2">
            {peers.peers.map(p => (
              <Link
                key={p.slug}
                href={`/state/${p.slug}/`}
                className="flex justify-between items-center p-3 rounded-lg bg-white hover:bg-emerald-50 border border-slate-100 text-sm transition-colors"
              >
                <span className="font-medium text-slate-900">{p.name}</span>
                <span className="text-slate-600 tabular-nums">
                  {formatCurrency(p.medianHomePrice)} <span className="text-slate-400 ml-1">PIR {p.pir.toFixed(2)}×</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No peer states in this cluster.</p>
        )}
      </section>

      <aside className="my-8 rounded-xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Pair with</div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          Adjacent {state.name} datasets across the network
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {crossSite.map(l => (
            <li key={l.site}>
              <a
                href={l.url}
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-white hover:bg-emerald-50 border border-slate-100 transition-colors"
              >
                <div className="font-medium text-slate-900 text-sm">{l.label}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-5">{l.blurb}</div>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Monthly-payment cross-link (HCU depth expansion) */}
      <section className="my-6">
        <Link
          href={`/state/${slug}/monthly-payment/`}
          className="block rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Deeper breakdown
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {state.name} monthly mortgage payment &mdash; 5&times;6 PITI matrix at the {formatCurrency(state.medianHomePrice)} median
              </h3>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Full down-payment (5&ndash;25%) &times; rate (6.0&ndash;8.0%) scenario table, plus income
                needed at 28/33/36% DTI, plus 10 household-income affordability rows.
              </p>
            </div>
            <span className="text-blue-700 font-semibold shrink-0">View payment matrix &rarr;</span>
          </div>
        </Link>
      </section>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Median Price</div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(state.medianHomePrice)}</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">YoY Change</div>
          <div className={`text-2xl font-bold ${state.yoyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {state.yoyChange >= 0 ? '+' : ''}{formatPercent(state.yoyChange)}
          </div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Affordability</div>
          <div className="text-2xl font-bold text-slate-800">{state.affordabilityIndex}<span className="text-sm font-normal text-slate-400">/100</span></div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price Rank</div>
          <div className="text-2xl font-bold text-slate-800">#{priceRank}<span className="text-sm font-normal text-slate-400"> of {total}</span></div>
        </div>
      </div>

      {/* Affordability Bar */}
      <section className="my-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Affordability Overview</h2>
        <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all"
            style={{ width: `${state.affordabilityIndex}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Least Affordable</span>
          <span>{state.affordabilityIndex}/100</span>
          <span>Most Affordable</span>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          {state.affordabilityIndex >= 60
            ? `${state.name} is one of the more affordable states for homebuyers. Home prices remain well within reach for households earning the state median income.`
            : state.affordabilityIndex >= 40
              ? `${state.name} has moderate affordability. While not the cheapest, many working families can still find homes within their budget.`
              : `${state.name} faces significant affordability challenges. The median home price is well above what a typical household income can comfortably support.`}
        </p>
      </section>

      {/* Top Cities */}
      <section className="my-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Top Cities in {state.name}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {state.topCities.map(city => (
            <div key={city} className="border rounded-lg p-4 hover:bg-emerald-50 transition-colors">
              <span className="font-semibold text-slate-900">{city}</span>
              <span className="text-slate-400 ml-1">, {state.code}</span>
            </div>
          ))}
        </div>
      </section>

      <AdSlot id="mid" />

      {/* Similar States by Price */}
      {nearbyStates.length > 0 && (
        <section className="my-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">States with Similar Home Prices</h2>
          <div className="border rounded-lg overflow-hidden">
            {nearbyStates.map(s => (
              <Link
                key={s.slug}
                href={`/state/${s.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-emerald-50 border-b border-slate-100 text-sm"
              >
                <span>{s.name} <span className="text-slate-400">({s.code})</span></span>
                <span className="font-semibold text-emerald-700">{formatCurrency(s.medianHomePrice)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="my-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group border rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-slate-900 hover:bg-slate-50 transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-4 text-sm text-slate-600">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <DataSourceBadge sources={[
        { name: "Zillow ZHVI", url: "https://www.zillow.com/research/data/" },
        { name: "US Census Bureau", url: "https://www.census.gov/programs-surveys/acs" },
        { name: "Redfin", url: "https://www.redfin.com/news/data-center/" },
      ]} />

      <AdSlot id="bottom" />

      <StateRich slug={slug} state={state} />

      <AuthorBox />
      <FeedbackButton pageId={slug} />

      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
