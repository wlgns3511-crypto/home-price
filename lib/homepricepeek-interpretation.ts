/**
 * homepricepeek-interpretation.ts — 5-bucket Housing Affordability Verdict.
 *
 * Composes three existing levers into a single human-readable verdict:
 *   1. priceToIncomeBand  (Demographia 5-band, ratio cutoff)
 *   2. mortgageBurdenDecoder (CFPB 28/36/43 + underwater tier)
 *   3. getPeerStates       (geographic-economic peer cluster, lib/housing-landscape.ts)
 *
 * 2026-07-26 — 세 번째 레버가 lib/affordability-cluster.ts (Demographia 버킷 내 순위) 라고
 * 적혀 있었지만, 그 모듈을 호출하는 페이지는 없다. 유일한 소비자인 주 페이지는
 * getPeerStates() 의 *지리* 클러스터 라벨을 bucketLabel prop 으로 넘기고 있었고, 아래 문단은
 * 그걸 "같은 Demographia 버킷" 이라고 설명했다 — 라벨≠계산. bucketRank 는 항상 null 이라
 * (getPeerStates 가 자기 주를 peer 목록에서 제외) 그 문장이 렌더된 적은 없지만, 대신 fallback
 * 문장이 같은 날 410 된 /rankings/ 를 가리키고 있었다. 축을 지리 클러스터 하나로 정직화.
 *
 * 유일한 소비자는 주 51개 페이지다 (도시/국가 서피스는 2026-07-26 전량 410).
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
  /** getPeerStates().clusterLabel — 지리·경제 클러스터. Demographia 밴드가 아니다. */
  peerClusterLabel?: string | null;
  hpi5yPct?: number | null;
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
  if (input.peerClusterLabel) {
    paragraphs.push(
      `For the "is this expensive?" comparison we place this state against its ${input.peerClusterLabel} peers — a hand-assigned geographic and economic grouping documented on /methodology/, not a Demographia band. That is a deliberate choice: grouping by affordability band would compare a state only against others that already share its price level, which tells a buyer nothing about the region they are actually choosing within. We do not publish a "rank N of M inside your Demographia bucket" line, because we do not compute that cohort.`,
    );
  } else {
    paragraphs.push(
      'A peer-cluster comparison is not available for this page, so the verdict above rests on the price-to-income band and the mortgage-burden tier alone.',
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
