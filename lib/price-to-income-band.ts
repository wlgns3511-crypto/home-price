/**
 * price-to-income-band.ts — Demographia 5-band classifier (verbatim 2024 edition).
 *
 * Deterministic function over (median home value, median household income).
 * 입력은 한 축뿐이다: ZHVI 주별 typical home value / Census ACS B19013.
 *
 * 2026-07-26 — "INTL scope: OECD or national statistics office equivalents" 를 지웠다.
 * ① 레포에 그 인제스천이 0건(data/sources.json 15필드에 없음), ② 그 비율을 쓰던 국제
 * 서피스(/city/ 194 · /country/ 50)는 같은 날 전량 410. 같은 비율 공식을 쓰는 것과
 * 같은 데이터 출처를 갖는 것은 다르다.
 *
 * Cutoffs taken verbatim from the Demographia International Housing
 * Affordability annual report (the canonical industry reference) — Demographia is
 * cited as the industry index for the *cutoffs*; the data behind the ratio is
 * ZHVI + Census ACS.
 */

export type PriceToIncomeTier =
  | 'SeverelyUnaffordable'
  | 'SeriouslyUnaffordable'
  | 'ModeratelyUnaffordable'
  | 'Affordable'
  | 'HighlyAffordable';

export interface PriceToIncomeResult {
  ratio: number;
  tier: PriceToIncomeTier;
  shortLabel: string;
  longLabel: string;
  cutoffNote: string;
  anchorCitation: string;
}

const TIER_BANDS: { min: number; tier: PriceToIncomeTier; shortLabel: string; longLabel: string }[] = [
  { min: 9.0, tier: 'SeverelyUnaffordable', shortLabel: 'Severely Unaffordable', longLabel: 'Severely Unaffordable (price-to-income ≥ 9.0)' },
  { min: 5.1, tier: 'SeriouslyUnaffordable', shortLabel: 'Seriously Unaffordable', longLabel: 'Seriously Unaffordable (5.1 ≤ price-to-income < 9.0)' },
  { min: 4.1, tier: 'ModeratelyUnaffordable', shortLabel: 'Moderately Unaffordable', longLabel: 'Moderately Unaffordable (4.1 ≤ price-to-income < 5.1)' },
  { min: 3.1, tier: 'Affordable', shortLabel: 'Affordable', longLabel: 'Affordable (3.1 ≤ price-to-income < 4.1)' },
  { min: 0, tier: 'HighlyAffordable', shortLabel: 'Highly Affordable', longLabel: 'Highly Affordable (price-to-income < 3.1)' },
];

export function priceToIncomeBand(
  homeValueUsd: number | null | undefined,
  medianIncomeUsd: number | null | undefined,
): PriceToIncomeResult | null {
  if (
    homeValueUsd == null ||
    medianIncomeUsd == null ||
    homeValueUsd <= 0 ||
    medianIncomeUsd <= 0
  ) {
    return null;
  }

  const ratio = Number((homeValueUsd / medianIncomeUsd).toFixed(2));
  const band = TIER_BANDS.find((b) => ratio >= b.min) ?? TIER_BANDS[TIER_BANDS.length - 1];

  return {
    ratio,
    tier: band.tier,
    shortLabel: band.shortLabel,
    longLabel: band.longLabel,
    cutoffNote:
      'Cutoffs (≥9 / ≥5.1 / ≥4.1 / ≥3.1 / <3.1) are taken verbatim from the Demographia International Housing Affordability annual report.',
    anchorCitation: 'Demographia International Housing Affordability 2024 edition',
  };
}

export const PRICE_TO_INCOME_TIER_LABELS: Record<PriceToIncomeTier, string> = {
  SeverelyUnaffordable: 'Severely Unaffordable',
  SeriouslyUnaffordable: 'Seriously Unaffordable',
  ModeratelyUnaffordable: 'Moderately Unaffordable',
  Affordable: 'Affordable',
  HighlyAffordable: 'Highly Affordable',
};

export function priceToIncomeToneClasses(tier: PriceToIncomeTier): string {
  switch (tier) {
    case 'SeverelyUnaffordable':
      return 'bg-rose-50 border-rose-300 text-rose-900';
    case 'SeriouslyUnaffordable':
      return 'bg-amber-50 border-amber-300 text-amber-900';
    case 'ModeratelyUnaffordable':
      return 'bg-yellow-50 border-yellow-300 text-yellow-900';
    case 'Affordable':
      return 'bg-emerald-50 border-emerald-300 text-emerald-900';
    case 'HighlyAffordable':
      return 'bg-teal-50 border-teal-300 text-teal-900';
  }
}
