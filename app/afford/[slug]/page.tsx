import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBySlug, getAllSlugs, getSimilarPriceCities } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { siteConfig } from '@/site.config';

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllSlugs().slice(0, 50).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) return {};
  return { title: `What Salary Do You Need to Buy a Home in ${city.name}?`, description: `Calculate the income needed to afford a home in ${city.name}. Average price: ${formatCurrency(city.avg_home_price_usd as number)}, mortgage rate: ${formatPercent(city.mortgage_rate_pct as number)}.`, alternates: { canonical: `/afford/${slug}` }, openGraph: { url: `/afford/${slug}` } };
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

  const crumbs = [{ name: 'Home', url: '/' }, { name: name, url: `/city/${slug}/` }, { name: 'Affordability', url: `/afford/${slug}` }];

  return (
    <>
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />
      <h1 className="text-3xl font-bold mb-2">Can You Afford to Buy in {name}?</h1>
      <FreshnessTag source={siteConfig.dataSource.name} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="bg-emerald-50 rounded-lg p-4 text-center"><div className="text-xl font-bold text-emerald-700">{formatCurrency(price)}</div><div className="text-xs text-slate-500">Home Price</div></div>
        <div className="bg-blue-50 rounded-lg p-4 text-center"><div className="text-xl font-bold text-blue-700">{formatCurrency(downPayment)}</div><div className="text-xs text-slate-500">Down Payment (20%)</div></div>
        <div className="bg-amber-50 rounded-lg p-4 text-center"><div className="text-xl font-bold text-amber-700">{formatCurrency(monthlyPayment)}/mo</div><div className="text-xs text-slate-500">Mortgage Payment</div></div>
        <div className={`${affordable ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4 text-center`}><div className={`text-xl font-bold ${affordable ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(requiredSalary)}/yr</div><div className="text-xs text-slate-500">Required Salary</div></div>
      </div>

      <InsightBox title={name} insight={`To afford a home in ${name} at ${formatPercent(rate)} mortgage rate, you need a salary of at least ${formatCurrency(requiredSalary)}/year. The local median income is ${formatCurrency(income)}/year — ${affordable ? 'making homeownership achievable for median earners.' : 'meaning most residents would struggle to buy at current prices.'} Alternatively, renting at ${formatCurrency(rent)}/mo may be more practical.`} />

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

      <section className="mt-6"><h2 className="text-lg font-bold mb-2">Similar Price Cities</h2><div className="grid grid-cols-2 md:grid-cols-5 gap-2">{similar.map(c => (<a key={String(c.slug)} href={`/afford/${c.slug}/`} className="p-3 border rounded-lg hover:bg-blue-50 text-sm text-center"><span className="font-medium text-blue-700">{String(c.name)}</span><span className="block text-xs text-slate-400">{formatCurrency(c.avg_home_price_usd as number)}</span></a>))}</div></section>

      <a href={`/city/${slug}/`} className="block mt-6 p-4 border rounded-lg hover:bg-emerald-50 text-center font-bold text-emerald-700">{name} Full Details &rarr;</a>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={siteConfig.name} />
    </>
  );
}
