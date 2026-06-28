import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBySlug, getAllSlugs, getSimilarPriceCities } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { TableOfContents } from '@/components/upgrades/TableOfContents';
import { InsightBlock } from '@/components/upgrades/InsightBlock';
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { FAQ } from '@/components/FAQ';
import { HomeAffordabilityCalc } from '@/components/tools/HomeAffordabilityCalc';
import { SOURCE_AUTHORITIES, ENTITY_VINTAGE } from '@/lib/authorship';
import { faqSchema } from '@/lib/schema';

// Upgrades and Proprietary Metrics Imports
import { getProprietaryAffordabilityMetrics } from '@/lib/proprietary-metrics';
import { ProprietaryMetricsBlock } from '@/components/upgrades/ProprietaryMetricsBlock';

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
  const metrics = getProprietaryAffordabilityMetrics(
    slug,
    String(city.name),
    city.avg_home_price_usd as number,
    city.mortgage_rate_pct as number,
    city.median_income_usd as number,
    city.avg_rent_1br_usd as number
  );
  return { 
    title: `What Salary Do You Need to Buy a Home in ${city.name}?`, 
    description: `Income needed to afford a home in ${city.name} (Affordability Index: ${metrics.pirIndex}/100, Rent-to-Buy: ${metrics.rentToBuyGrade}). Avg price: ${formatCurrency(city.avg_home_price_usd as number)}, mortgage rate: ${formatPercent(city.mortgage_rate_pct as number)}.`, 
    alternates: { canonical: `/afford/${slug}/` }, 
    openGraph: { url: `/afford/${slug}/` } 
  };
}

export default async function AffordPage({ params }: Props) {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) notFound();
  const name = String(city.name);
  const price = city.avg_home_price_usd as number;
  const rate = city.mortgage_rate_pct as number;
  const income = city.median_income_usd as number;
  const rent = city.avg_rent_1br_usd as number;

  // Calculate required salary (28% rule: housing cost <= 28% of gross)
  const monthlyRate = rate / 100 / 12;
  const months = 360; // 30yr
  const downPayment = price * 0.2;
  const loanAmount = price - downPayment;
  const monthlyPayment = monthlyRate > 0 ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1) : loanAmount / months;
  const requiredSalary = Math.round((monthlyPayment / 0.28) * 12);
  const affordable = income >= requiredSalary;
  const similar = getSimilarPriceCities(price, slug, 5);

  const crumbs = [{ name: 'Home', url: '/' }, { name: name, url: `/city/${slug}/` }, { name: 'Affordability', url: `/afford/${slug}/` }];

  const insights = [
    {
      text: `Buying a home in ${name} at the average price of ${formatCurrency(price)} requires a gross household income of at least ${formatCurrency(requiredSalary)}/year under the 28% debt-to-income guideline.`,
      sentiment: "neutral" as const,
    },
    {
      text: `The median household income in the area is ${formatCurrency(income)}/year, meaning local homeownership is ${affordable ? 'highly attainable' : 'financially out of reach'} for typical median earners.`,
      sentiment: (affordable ? "positive" : "negative") as "positive" | "neutral" | "negative",
    },
    {
      text: `For residents comparing renting versus buying, renting a 1-bedroom apartment averages ${formatCurrency(rent)}/month, representing an alternative housing path.`,
      sentiment: "neutral" as const,
    },
  ];

  const relatedItems = similar.map(c => ({
    name: `Affordability in ${String(c.name)}`,
    href: `/afford/${c.slug}/`,
    stat: formatCurrency(c.avg_home_price_usd as number),
  }));

  const faqs = [
    {
      question: `What salary is required to buy a house in ${name}?`,
      answer: `To afford a home priced at ${formatCurrency(price)} in ${name} with a 20% down payment at a ${formatPercent(rate)} interest rate, you need an annual gross income of at least ${formatCurrency(requiredSalary)}. This is calculated under the standard 28% rule, where monthly housing costs do not exceed 28% of gross monthly income.`,
    },
    {
      question: `What is the average home price in ${name}?`,
      answer: `The average home price in ${name} is ${formatCurrency(price)}, which requires a down payment of ${formatCurrency(downPayment)} (20%) and results in an estimated monthly mortgage payment of ${formatCurrency(monthlyPayment)}/month.`,
    },
    {
      question: `Is renting cheaper than buying in ${name}?`,
      answer: `Renting a 1-bedroom apartment in ${name} averages ${formatCurrency(rent)}/month compared to an estimated mortgage payment of ${formatCurrency(monthlyPayment)}/month. Depending on your down payment capacity and local median income (${formatCurrency(income)}/year), renting may offer lower immediate monthly overhead.`,
    },
  ];

  const metrics = getProprietaryAffordabilityMetrics(
    slug,
    name,
    price,
    rate,
    income,
    rent
  );

  return (
    <article data-toc-root>
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema(faqs)),
          }}
        />
      )}
      <h1 className="text-3xl font-bold mb-2">Can You Afford to Buy in {name}?</h1>
      <FreshnessTag source={siteConfig.dataSource.name} />

      <TrustBlock
        sources={SOURCE_AUTHORITIES.map(s => ({ name: s.name, url: s.url }))}
        updated={ENTITY_VINTAGE}
      />

      <ProprietaryMetricsBlock
        pirIndex={metrics.pirIndex}
        mortgageBurden={metrics.mortgageBurden}
        rentToBuyGrade={metrics.rentToBuyGrade}
        commentary={metrics.commentary}
      />

      <TableOfContents />

      <InsightBlock
        entityName={name}
        insights={insights}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="bg-emerald-50 rounded-lg p-4 text-center"><div className="text-xl font-bold text-emerald-700">{formatCurrency(price)}</div><div className="text-xs text-slate-500">Home Price</div></div>
        <div className="bg-blue-50 rounded-lg p-4 text-center"><div className="text-xl font-bold text-blue-700">{formatCurrency(downPayment)}</div><div className="text-xs text-slate-500">Down Payment (20%)</div></div>
        <div className="bg-amber-50 rounded-lg p-4 text-center"><div className="text-xl font-bold text-amber-700">{formatCurrency(monthlyPayment)}/mo</div><div className="text-xs text-slate-500">Mortgage Payment</div></div>
        <div className={`${affordable ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}><div className={`text-xl font-bold ${affordable ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(requiredSalary)}/yr</div><div className="text-xs text-slate-500">Required Salary</div></div>
      </div>

      <AdSlot id="top" />

      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">Mortgage Breakdown (30yr fixed)</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">Home Price</td><td className="p-3 text-right font-semibold">{formatCurrency(price)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Down Payment (20%)</td><td className="p-3 text-right font-semibold">{formatCurrency(downPayment)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Loan Amount</td><td className="p-3 text-right font-semibold">{formatCurrency(loanAmount)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Interest Rate</td><td className="p-3 text-right font-semibold">{formatPercent(rate)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Monthly Payment</td><td className="p-3 text-right font-semibold text-emerald-700">{formatCurrency(monthlyPayment)}/mo</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Required Annual Salary (28% rule)</td><td className={`p-3 text-right font-bold ${affordable ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(requiredSalary)}</td></tr>
            <tr><td className="p-3 text-slate-600">Local Median Income</td><td className="p-3 text-right font-semibold">{formatCurrency(income)}</td></tr>
          </tbody>
        </table>
      </section>

      <HomeAffordabilityCalc cityName={name} avgPrice={price} mortgageRate={rate} />

      <RelatedEntities
        entityName={name}
        items={relatedItems}
        heading="Affordability in Similar Price Cities"
      />

      <FAQ items={faqs} />

      <a href={`/city/${slug}/`} className="block mt-6 p-4 border rounded-lg hover:bg-emerald-50 text-center font-bold text-emerald-700">{name} Full Details &rarr;</a>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </article>
  );
}
