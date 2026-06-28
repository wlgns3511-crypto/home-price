/**
 * homepricepeek-interpretation.ts — 5-bucket Housing Affordability Verdict.
 *
 * Composes three existing levers into a single human-readable verdict:
 *   1. priceToIncomeBand  (Demographia 5-band, ratio cutoff)
 *   2. mortgageBurdenDecoder (CFPB 28/36/43 + underwater tier)
 *   3. affordability-cluster (Demographia bucket rank within peer cohort)
 *
 * Each surface bound to an entity (US state, US city, INTL country) calls
 * this once with its measured inputs; the returned object drives a 4-paragraph
 * branching strip rendered just below the hero.
 */

import type { PriceToIncomeResult, PriceToIncomeTier } from './price-to-income-band';
import type { MortgageBurdenResult, MortgageBurdenTier } from './mortgage-burden-decoder';

export type HousingVerdict =
  | 'severely_unaffordable_high_burden'
  | 'seriously_unaffordable_stretched'
  | 'moderately_balanced'
  | 'affordable_comfortable'
  | 'highly_affordable_undervalued';

export interface InterpretationInput {
  pti: PriceToIncomeResult | null;
  burden: MortgageBurdenResult | null;
  bucketLabel?: string | null;
  bucketRank?: number | null;
  bucketSize?: number | null;
  hpi5yPct?: number | null;
  scope?: 'us' | 'intl';
}

export interface InterpretationResult {
  verdict: HousingVerdict;
  headlineLabel: string;
  shortLine: string;
  paragraphs: string[];
}

export function pickVerdict(input: InterpretationInput): HousingVerdict {
  const ptiTier: PriceToIncomeTier | null = input.pti?.tier ?? null;
  const burdenTier: MortgageBurdenTier | null = input.burden?.cfpbTier ?? null;

  const burdenIsHigh =
    burdenTier === 'D_over_43' || burdenTier === 'E_underwater';
  const burdenIsStretched = burdenTier === 'C_36_43';

  if (ptiTier === 'SeverelyUnaffordable' || (ptiTier === 'SeriouslyUnaffordable' && burdenIsHigh)) {
    return 'severely_unaffordable_high_burden';
  }
  if (ptiTier === 'SeriouslyUnaffordable' || burdenIsHigh || burdenIsStretched) {
    return 'seriously_unaffordable_stretched';
  }
  if (ptiTier === 'ModeratelyUnaffordable') {
    return 'moderately_balanced';
  }
  if (ptiTier === 'HighlyAffordable' && burdenTier === 'A_under_28') {
    return 'highly_affordable_undervalued';
  }
  return 'affordable_comfortable';
}

export function buildInterpretation(input: InterpretationInput): InterpretationResult | null {
  if (!input.pti && !input.burden) return null;

  const verdict = pickVerdict(input);
  const headlineLabel = VERDICT_LABEL[verdict];
  const shortLine = VERDICT_ONE_LINER[verdict];

  const paragraphs: string[] = [];

  // Paragraph 1 — price-to-income meaning + Demographia anchor
  if (input.pti) {
    paragraphs.push(
      `The price-to-income ratio measures how many years of median household income it would take to buy a median home in this area. At ${input.pti.ratio.toFixed(2)}, this market falls into the ${input.pti.longLabel.toLowerCase()} band. The Demographia International Housing Affordability annual report has used these cutoffs (≥9 / ≥5.1 / ≥4.1 / ≥3.1) since the early 2000s, and treats anything above 5.1 as "seriously" stretched relative to the historical 2-to-3 ratio that prevailed across most English-speaking markets for most of the 20th century.`,
    );
  } else {
    paragraphs.push(
      'The price-to-income ratio for this area is not currently published in the underlying dataset, so the Demographia 5-band tier cannot be displayed here. Median home value and median household income inputs are required.',
    );
  }

  // Paragraph 2 — monthly burden + CFPB rule
  if (input.burden) {
    const monthlyStr = `$${input.burden.monthly.toLocaleString('en-US')}`;
    paragraphs.push(
      `The implied monthly principal-and-interest payment under standard 30-year fixed amortization at the current FRED MORTGAGE30US weekly rate (assuming a 20% downpayment) is ${monthlyStr}. That works out to ${(input.burden.burdenRatio * 100).toFixed(1)}% of the median household income annually — ${input.burden.longLabel.toLowerCase()}. The Consumer Financial Protection Bureau's Qualified Mortgage rule (12 CFR §1026.43(c)) treats 43% back-end DTI as the safe-harbor ceiling; the 28% front-end figure is the conservative housing-only underwriting cutoff cited in the CFPB Owning a Home toolkit.`,
    );
  } else {
    paragraphs.push(
      'The mortgage burden tier cannot be computed for this area because at least one of (home value, current MORTGAGE30US rate, median income) is missing from the dataset. Where available, the calculation uses a standard 30-year fixed amortization at 80% loan-to-value.',
    );
  }

  // Paragraph 3 — peer cluster comparison
  if (input.bucketLabel && input.bucketRank && input.bucketSize) {
    paragraphs.push(
      `Within the ${input.bucketLabel} peer cluster, this market ranks ${input.bucketRank} of ${input.bucketSize}. The cluster contains every area in the dataset that lands in the same Demographia bucket, which is the only peer cohort that makes a meaningful "is this expensive?" comparison — comparing a Severely Unaffordable market against a Highly Affordable one would not be informative for buyers actually considering either.`,
    );
  } else if (input.scope === 'intl') {
    paragraphs.push(
      `For international scope, OECD Housing Prices (and national statistics offices where OECD does not publish) provide the cross-country baseline. Comparisons inside the same Demographia band remain the only honest peer cohort — pre-2008 baseline data from OECD lets readers see how far above or below the long-run national norm each ratio currently sits.`,
    );
  } else {
    paragraphs.push(
      'Peer cluster rank within the matching Demographia band is not currently computed for this surface; please refer to the rankings table on the relevant cluster guide to see comparable markets.',
    );
  }

  // Paragraph 4 — trajectory hint (FHFA HPI 12-month)
  if (typeof input.hpi5yPct === 'number') {
    const dir = input.hpi5yPct > 0 ? 'risen' : input.hpi5yPct < 0 ? 'declined' : 'been flat';
    paragraphs.push(
      `Over the most recent 5-year window covered by the FHFA House Price Index, prices in this area have ${dir} by approximately ${input.hpi5yPct.toFixed(1)}%. This is descriptive, not predictive — the FHFA HPI is a backward-looking purchase-only repeat-sales index, and HomePricePeek does not publish forward forecasts or recommend buy/sell timing.`,
    );
  } else {
    paragraphs.push(
      'The FHFA House Price Index 5-year cumulative appreciation for this area is not currently joined to this surface, so a backward-looking trajectory line cannot be shown here. FHFA HPI data is descriptive by design and HomePricePeek does not publish forward forecasts.',
    );
  }

  return { verdict, headlineLabel, shortLine, paragraphs };
}

const VERDICT_LABEL: Record<HousingVerdict, string> = {
  severely_unaffordable_high_burden: 'Severely Unaffordable & High Burden',
  seriously_unaffordable_stretched: 'Seriously Unaffordable & Stretched',
  moderately_balanced: 'Moderately Balanced',
  affordable_comfortable: 'Affordable & Comfortable',
  highly_affordable_undervalued: 'Highly Affordable & Undervalued',
};

/**
 * Compact ≤13c verdict label for Phase 7 P1 title.absolute body
 * (`{State} housing: ${priceK}K · PIR {ratio} · {short}`). Each label is
 * the strongest single word that survives a 60c Google SERP cap after the
 * 14-15c worst-case state name + dollar range + PIR ratio body.
 */
const VERDICT_SHORT_LABELS: Record<HousingVerdict, string> = {
  severely_unaffordable_high_burden: 'Severe',
  seriously_unaffordable_stretched: 'Stretched',
  moderately_balanced: 'Moderate',
  affordable_comfortable: 'Affordable',
  highly_affordable_undervalued: 'Undervalued',
};

export function housingVerdictShortLabel(v: HousingVerdict): string {
  return VERDICT_SHORT_LABELS[v];
}

const VERDICT_ONE_LINER: Record<HousingVerdict, string> = {
  severely_unaffordable_high_burden:
    'Price-to-income at or above 9.0 with monthly burden above the CFPB 43% safe-harbor.',
  seriously_unaffordable_stretched:
    'Price-to-income in the 5.1–9.0 Seriously band, with monthly burden stretched beyond the 28% conservative cutoff.',
  moderately_balanced:
    'Price-to-income in the 4.1–5.1 Moderately band — above the historic norm, but below the Seriously cutoff.',
  affordable_comfortable:
    'Price-to-income at or below 4.1 with monthly burden within the CFPB 28–36% manageable band.',
  highly_affordable_undervalued:
    'Price-to-income below 3.1 with monthly burden under the 28% conservative cutoff — historically the "normal" range.',
};

export function verdictToneClasses(verdict: HousingVerdict): string {
  switch (verdict) {
    case 'severely_unaffordable_high_burden':
      return 'bg-rose-50 border-rose-300 text-rose-900';
    case 'seriously_unaffordable_stretched':
      return 'bg-amber-50 border-amber-300 text-amber-900';
    case 'moderately_balanced':
      return 'bg-yellow-50 border-yellow-300 text-yellow-900';
    case 'affordable_comfortable':
      return 'bg-emerald-50 border-emerald-300 text-emerald-900';
    case 'highly_affordable_undervalued':
      return 'bg-teal-50 border-teal-300 text-teal-900';
  }
}

export const HOUSING_VERDICT_LABELS = VERDICT_LABEL;
