import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates, getStateBySlug, getStatesSortedByPrice, type StateData } from '@/lib/states-data';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { formatCurrency, formatPercent } from '@/lib/format';
import { buildLocaleAlternates } from '@/lib/seo';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { EditorNote } from '@/components/EditorNote';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from '@/components/FeedbackButton';

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const revalidate = 86400;

const DOWN_PAYMENT_PCTS = [0.05, 0.10, 0.15, 0.20, 0.25];
const MORTGAGE_RATES = [6.0, 6.5, 7.0, 7.25, 7.5, 8.0];
const PROP_TAX_RATE = 0.012;        // 1.2% annual, rough US avg
const INSURANCE_RATE = 0.0055;      // 0.55% annual, rough US avg
const PMI_RATE_ANNUAL = 0.007;      // 0.7% annual PMI when down < 20%
const HOA_DEFAULT = 50;             // $/mo placeholder — users should adjust for condo/HOA
const LOAN_YEARS = 30;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const sample = computeMonthly(state.medianHomePrice, 0.20, 7.0);
  const title = `${state.name} monthly mortgage payment \u2014 PITI by down payment & rate`;
  const description = `Monthly mortgage payment in ${state.name} on the ${formatCurrency(state.medianHomePrice)} median home: ${formatCurrency(sample.piti)}/mo with 20% down at 7.0%. Full matrix of down payment \u00d7 rate scenarios, plus income needed at 28/33/36% DTI. Not a quote \u2014 a benchmark.`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates(`/state/${slug}/monthly-payment/`),
    openGraph: { title, description, url: `/state/${slug}/monthly-payment/` },
  };
}

interface MonthlyBreakdown {
  downAmount: number;
  loanAmount: number;
  pi: number;   // principal + interest
  tax: number;
  ins: number;
  pmi: number;
  piti: number;
  rate: number;
  downPct: number;
}

function computeMonthly(price: number, downPct: number, ratePct: number): MonthlyBreakdown {
  const downAmount = Math.round(price * downPct);
  const loanAmount = price - downAmount;
  const r = ratePct / 100 / 12;
  const n = LOAN_YEARS * 12;
  const pi = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const tax = (price * PROP_TAX_RATE) / 12;
  const ins = (price * INSURANCE_RATE) / 12;
  const pmi = downPct < 0.20 ? (loanAmount * PMI_RATE_ANNUAL) / 12 : 0;
  return {
    downAmount,
    loanAmount,
    pi: Math.round(pi),
    tax: Math.round(tax),
    ins: Math.round(ins),
    pmi: Math.round(pmi),
    piti: Math.round(pi + tax + ins + pmi),
    rate: ratePct,
    downPct,
  };
}

function incomeNeededAt(dtiPct: number, piti: number): number {
  if (dtiPct <= 0) return 0;
  // front-end/back-end DTI: piti / monthly_income <= dti
  // annual income = piti * 12 / dti
  return Math.round((piti * 12) / (dtiPct / 100));
}

function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export default async function MonthlyPaymentPage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const price = state.medianHomePrice;

  // 5 down-payment \u00d7 6 rate matrix
  const matrix: MonthlyBreakdown[][] = DOWN_PAYMENT_PCTS.map((dp) =>
    MORTGAGE_RATES.map((r) => computeMonthly(price, dp, r)),
  );

  // Spotlight: 20% down \u00d7 7.0% (realistic current baseline)
  const base = computeMonthly(price, 0.20, 7.0);
  const noPmi = computeMonthly(price, 0.20, 7.0);
  const base10pct = computeMonthly(price, 0.10, 7.0);

  // Income needed at 28 / 33 / 36% DTI for the base scenario
  const incomeMatrix = [28, 33, 36].map((dti) => ({
    dti,
    income: incomeNeededAt(dti, base.piti),
  }));

  // 10 income scenarios $60k, $80k, ..., $240k — max payment at 28% DTI
  const incomeScenarios = [60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000].map((inc) => ({
    income: inc,
    maxPayment28: Math.round((inc * 0.28) / 12),
    maxPayment36: Math.round((inc * 0.36) / 12),
    pitiGap: Math.round((inc * 0.28) / 12 - base.piti),
  }));

  // 5-year total cost at base + total interest paid
  const totalInterest = Math.round(base.pi * 12 * LOAN_YEARS - base.loanAmount);
  const fiveYearPiti = base.piti * 60;

  // Peer states \u2014 4 closest by median home price
  const sortedByPrice = getStatesSortedByPrice('desc');
  const peers: StateData[] = sortedByPrice
    .filter((s) => s.slug !== slug)
    .sort((a, b) => Math.abs(a.medianHomePrice - price) - Math.abs(b.medianHomePrice - price))
    .slice(0, 4);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
    { name: state.name, url: `/state/${slug}/` },
    { name: 'Monthly payment', url: `/state/${slug}/monthly-payment/` },
  ];

  const faqs: { question: string; answer: string }[] = [
    {
      question: `What does PITI mean for ${state.name} homebuyers?`,
      answer: `PITI = Principal + Interest + property Tax + homeowners Insurance. On this page every monthly number is PITI \u2014 plus PMI when the down payment is under 20%. Lenders qualify borrowers on PITI, not just principal + interest. HOA dues, condo fees, and special assessments are not included.`,
    },
    {
      question: `Why does ${state.name} use ${pct(PROP_TAX_RATE, 1)} as the property tax rate?`,
      answer: `${pct(PROP_TAX_RATE, 1)} is a rough national-average effective rate. Actual ${state.name} rates vary by county and by exemption \u2014 New Jersey averages closer to 2.2%, Hawaii closer to 0.28%. Use this page as a starting benchmark, then check the county-specific assessed value and millage rate for your actual address.`,
    },
    {
      question: `Is the ${state.name} median home price realistic for what I'd actually buy?`,
      answer: `${formatCurrency(price)} is the statewide median across all listings and sales types. A starter single-family home in a ${state.name} metro is usually above the median; a rural ranch or small-town condo is often below. The matrix below is anchored to the median so the numbers are internally consistent \u2014 scale proportionally for a different target price.`,
    },
    {
      question: `Why include PMI in the 5/10/15% down scenarios?`,
      answer: `Private Mortgage Insurance is required by conventional lenders when loan-to-value exceeds 80% (i.e. down payment under 20%). This page applies ${pct(PMI_RATE_ANNUAL, 1)} annual PMI on the loan balance for 5%, 10%, and 15% down scenarios. PMI drops off automatically at 78% LTV or by refinance/appraisal once you hit 80%. FHA loans have their own MIP which does not drop off the same way.`,
    },
    {
      question: `What DTI do ${state.name} lenders actually use?`,
      answer: `Conventional loans typically cap at 43% back-end DTI (all debt) and 28% front-end (housing only). FHA can go to 50% back-end with compensating factors. Jumbo loans are often stricter. The 28 / 33 / 36% rows below give a conservative range so you can see how much income the base PITI requires under different underwriting assumptions.`,
    },
    {
      question: `How much will the ${state.name} monthly payment change if rates drop 1 point?`,
      answer: (() => {
        const lower = computeMonthly(price, 0.20, 6.0);
        const delta = base.piti - lower.piti;
        return `At 20% down, a 1-point rate drop from 7.0% to 6.0% cuts the ${state.name} median-home PITI from ${formatCurrency(base.piti)} to ${formatCurrency(lower.piti)} \u2014 a savings of ${formatCurrency(delta)}/mo, or ${formatCurrency(delta * 12)}/year. Over a 30-year loan that's ${formatCurrency(delta * 12 * LOAN_YEARS)} in interest not paid.`;
      })(),
    },
    {
      question: `Should I put more than 20% down in ${state.name}?`,
      answer: `Beyond 20% you no longer avoid PMI (you already did at 20%). The remaining benefit is smaller principal = smaller monthly interest. Whether that beats investing the cash depends on your mortgage rate vs expected return on other investments. At 7% mortgage and 7% expected stock return, the math is roughly a wash \u2014 at 6% mortgage and 8% expected return, investing usually wins. This page doesn't model that trade-off; it just shows the payment.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {(faqs?.length ?? 0) > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'By State', href: '/state/' },
          { label: state.name, href: `/state/${slug}/` },
          { label: 'Monthly payment' },
        ]}
      />

      {/* Hero */}
      <section className="mt-4 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          {state.name} monthly mortgage payment
        </h1>
        <p className="mt-3 text-slate-700 leading-relaxed max-w-3xl">
          Instead of quoting a single &ldquo;monthly payment&rdquo; number, this page prices the{' '}
          <strong>{state.name} median {formatCurrency(price)} home</strong> across a full 5&times;6 matrix of
          down payment and mortgage rate scenarios. All figures are <strong>PITI</strong> (principal, interest,
          property tax, insurance) plus PMI when down payment is under 20%. Use this as a benchmark for what
          the payment actually looks like before you talk to a lender.
        </p>
        <div className="mt-4">
          <FreshnessTag source="Zillow ZHVI, NAR, Census ACS" />
        </div>
      </section>

      <EditorNote
        note={`Every cell in the matrix below uses the same ${formatCurrency(price)} ${state.name} median home price. Property tax assumed at ${pct(PROP_TAX_RATE, 1)} of price, insurance at ${pct(INSURANCE_RATE, 2)} of price, PMI at ${pct(PMI_RATE_ANNUAL, 1)} of loan balance (only when down < 20%). HOA / condo fees are not included. This page is a payment calculator snapshot, not a loan quote.`}
      />

      {/* Spotlight cards */}
      <div className="grid sm:grid-cols-3 gap-3 my-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            Baseline PITI (20% down, 7.0%)
          </div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(base.piti)}/mo</div>
          <div className="text-xs text-blue-700 mt-1">
            Principal + interest: {formatCurrency(base.pi)} &middot; Tax: {formatCurrency(base.tax)} &middot;
            Insurance: {formatCurrency(base.ins)}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            10% down same rate
          </div>
          <div className="text-2xl font-bold text-amber-900">{formatCurrency(base10pct.piti)}/mo</div>
          <div className="text-xs text-amber-700 mt-1">
            +{formatCurrency(base10pct.piti - base.piti)}/mo vs 20% down (includes PMI of {formatCurrency(base10pct.pmi)})
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Income needed at 28% DTI
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            {formatCurrency(incomeNeededAt(28, base.piti))}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            For the baseline PITI. 36% DTI: {formatCurrency(incomeNeededAt(36, base.piti))}.
          </div>
        </div>
      </div>

      <AdSlot id="top" />

      {/* Matrix table: down payment x rate */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Payment matrix &mdash; {formatCurrency(price)} {state.name} median home
        </h2>
        <p className="text-sm text-slate-600 mb-4 max-w-3xl">
          Each cell is monthly PITI at that down-payment and mortgage rate combination. PMI is added in
          rows where down payment is under 20%.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="text-left p-3">Down payment</th>
                {MORTGAGE_RATES.map((r) => (
                  <th key={r} className="text-right p-3">
                    {r.toFixed(2)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row, i) => {
                const dp = DOWN_PAYMENT_PCTS[i];
                const dpDollars = Math.round(price * dp);
                return (
                  <tr key={dp} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{pct(dp)} down</div>
                      <div className="text-xs text-slate-500">{formatCurrency(dpDollars)} upfront</div>
                      {dp < 0.20 && <div className="text-xs text-amber-600 font-medium">PMI applies</div>}
                    </td>
                    {row.map((cell) => (
                      <td key={cell.rate} className="p-3 text-right">
                        <div className="font-semibold text-slate-900">{formatCurrency(cell.piti)}</div>
                        <div className="text-xs text-slate-500">P+I {formatCurrency(cell.pi)}</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Income needed breakdown */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Income needed for the baseline PITI in {state.name}
        </h2>
        <p className="text-sm text-slate-600 mb-4 max-w-3xl">
          DTI (debt-to-income) is the ratio of your housing payment to monthly income. 28% is the traditional
          front-end cap, 36% is a common back-end cap for conventional loans, 33% sits between them. Lower DTI
          = more comfortable budget, higher DTI = more stretch.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="text-left p-3">DTI assumption</th>
                <th className="text-right p-3">Monthly PITI</th>
                <th className="text-right p-3">Required monthly income</th>
                <th className="text-right p-3">Required annual income</th>
                <th className="text-left p-3">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomeMatrix.map((row) => (
                <tr key={row.dti} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">{row.dti}% DTI</td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(base.piti)}</td>
                  <td className="p-3 text-right font-semibold text-slate-900">{formatCurrency(Math.round(row.income / 12))}</td>
                  <td className="p-3 text-right font-semibold text-slate-900">{formatCurrency(row.income)}</td>
                  <td className="p-3 text-xs text-slate-600">
                    {row.dti === 28 && 'Conservative front-end ratio \u2014 comfortable budget.'}
                    {row.dti === 33 && 'Middle ground \u2014 most lenders fine, some stretch.'}
                    {row.dti === 36 && 'Back-end cap for conventional loans \u2014 your budget is tight.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Income scenarios: what can a given household afford */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          What your household income can cover in {state.name}
        </h2>
        <p className="text-sm text-slate-600 mb-4 max-w-3xl">
          Read this the other direction: at each income level, how far is the max monthly housing payment
          (at 28% and 36% DTI) from the baseline PITI on a median {state.name} home? A positive gap means
          you have headroom; a negative gap means you&apos;re stretched.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="text-left p-3">Household income</th>
                <th className="text-right p-3">Max PITI @ 28%</th>
                <th className="text-right p-3">Max PITI @ 36%</th>
                <th className="text-right p-3">Baseline PITI</th>
                <th className="text-right p-3">Headroom @ 28%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomeScenarios.map((row) => (
                <tr key={row.income} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">{formatCurrency(row.income)}/yr</td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(row.maxPayment28)}</td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(row.maxPayment36)}</td>
                  <td className="p-3 text-right text-slate-900 font-semibold">{formatCurrency(base.piti)}</td>
                  <td className={`p-3 text-right font-semibold ${row.pitiGap >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {row.pitiGap >= 0 ? '+' : ''}{formatCurrency(row.pitiGap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot id="mid" />

      {/* Lifetime cost panel */}
      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Lifetime cost at baseline &mdash; {state.name} 20% down, 7.0%, 30 years
        </h2>
        <div className="grid sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Loan amount</div>
            <div className="font-bold text-slate-900 text-lg">{formatCurrency(base.loanAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total interest over 30 years</div>
            <div className="font-bold text-slate-900 text-lg">{formatCurrency(totalInterest)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">5-year total PITI</div>
            <div className="font-bold text-slate-900 text-lg">{formatCurrency(fiveYearPiti)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Break-even vs renting (est.)</div>
            <div className="font-bold text-slate-900 text-lg">5&ndash;7 yrs</div>
            <div className="text-xs text-slate-500 mt-1">Typical range; depends on rent growth and home price trend.</div>
          </div>
        </div>
      </section>

      {/* Peer states */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          States with a similar median home price to {state.name}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {peers.map((p) => (
            <Link
              key={p.slug}
              href={`/state/${p.slug}/monthly-payment/`}
              className="rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Peer state</div>
              <div className="text-lg font-bold text-slate-900">{p.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                Median {formatCurrency(p.medianHomePrice)} &middot; YoY {p.yoyChange >= 0 ? '+' : ''}{formatPercent(p.yoyChange)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How to use */}
      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">How to use this page</h2>
        <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
          <li>
            <strong>Pricing an offer in {state.name}?</strong> Find your rate row, your down-payment row,
            and multiply the cell by (your target price / {formatCurrency(price)}). The ratio scales almost
            linearly for PITI at the same down-% and rate.
          </li>
          <li>
            <strong>Deciding between 10% and 20% down?</strong> Compare the 10%-down cell to the 20%-down
            cell at the same rate. The extra cost is mostly PMI + larger principal; if you plan to stay 7+
            years, the 20%-down route usually wins on total interest.
          </li>
          <li>
            <strong>Locking in a rate?</strong> The matrix shows how sensitive monthly cost is to rate
            changes. A 0.25% rate move on a ${(Math.round(base.loanAmount / 1000) * 1000).toLocaleString()} loan is usually ${Math.round(base.loanAmount * 0.0025 / 12)}&ndash;${Math.round(base.loanAmount * 0.003 / 12)}/mo.
          </li>
          <li>
            <strong>Reality check:</strong> this is a statewide median. A specific {state.name} metro
            (e.g. {state.topCities[0]}) usually prices above the median. Scale up accordingly.
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Frequently asked &mdash; {state.name} monthly payment
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-slate-200 bg-white">
              <summary className="p-4 font-semibold cursor-pointer hover:bg-slate-50 text-slate-900">
                {faq.question}
              </summary>
              <p className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 flex flex-wrap gap-2 text-sm">
        <Link
          href={`/state/${slug}/`}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors"
        >
          &larr; Back to {state.name} prices
        </Link>
        <Link
          href={`/afford/`}
          className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
        >
          Full affordability calculator &rarr;
        </Link>
      </section>

      <FeedbackButton pageId={`${slug}-monthly-payment`} />

      <DataSourceBadge
        sources={[
          { name: 'Zillow ZHVI', url: 'https://www.zillow.com/research/data/' },
          { name: 'NAR Existing Home Sales', url: 'https://www.nar.realtor/research-and-statistics' },
          { name: 'Census ACS', url: 'https://www.census.gov/programs-surveys/acs/' },
        ]}
      />

      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current="homepricepeek" />
    </>
  );
}
