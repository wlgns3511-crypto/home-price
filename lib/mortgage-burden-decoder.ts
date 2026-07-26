/**
 * mortgage-burden-decoder.ts — CFPB-tier monthly payment burden classifier.
 *
 * Pure deterministic function: given home value, mortgage rate (FRED
 * MORTGAGE30US current observation), and median household income (Census
 * ACS B19013 for US; INTL rows are editorial estimates with no ingested
 * source series — 2026-07-26 정정, 여기 "OECD or national statistics office
 * equivalents" 라고 적혀 있었지만 그 인제스천은 레포에 없다), computes the
 * monthly principal+interest payment under standard
 * 30-year amortization with 20% downpayment (80% loan-to-value), then
 * classifies the burden ratio against CFPB Qualified Mortgage cutoffs.
 *
 * Cutoffs are taken verbatim from the CFPB Qualified Mortgage rule at
 * 12 CFR §1026.43(c) — the 43% debt-to-income ceiling is the regulatory
 * line above which a loan generally fails the ability-to-repay safe
 * harbor. The 28% "front-end" cutoff (housing-only) is the conservative
 * underwriting standard widely quoted by mortgage lenders and the CFPB
 * "Owning a Home" toolkit.
 */

export type MortgageBurdenTier =
  | 'A_under_28'
  | 'B_28_36'
  | 'C_36_43'
  | 'D_over_43'
  | 'E_underwater';

export interface MortgageBurdenResult {
  monthly: number;
  burdenRatio: number;
  cfpbTier: MortgageBurdenTier;
  shortLabel: string;
  longLabel: string;
  assumptionNote: string;
  anchorCitation: string;
}

const LOAN_TO_VALUE = 0.8;
const TERM_MONTHS = 360;

export function mortgageBurdenDecoder(
  homeValueUsd: number | null | undefined,
  mortgage30Pct: number | null | undefined,
  medianIncomeUsd: number | null | undefined,
): MortgageBurdenResult | null {
  if (
    homeValueUsd == null ||
    mortgage30Pct == null ||
    medianIncomeUsd == null ||
    homeValueUsd <= 0 ||
    mortgage30Pct <= 0 ||
    medianIncomeUsd <= 0
  ) {
    return null;
  }

  const loanAmount = homeValueUsd * LOAN_TO_VALUE;
  const monthlyRate = mortgage30Pct / 100 / 12;
  const monthlyPaymentRaw =
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -TERM_MONTHS));
  const monthly = Number(monthlyPaymentRaw.toFixed(0));
  const burdenRatio = Number(((monthly * 12) / medianIncomeUsd).toFixed(3));

  const tier = classifyTier(burdenRatio);

  return {
    monthly,
    burdenRatio,
    cfpbTier: tier.cfpbTier,
    shortLabel: tier.shortLabel,
    longLabel: tier.longLabel,
    assumptionNote:
      'Calculation uses standard 30-year fixed amortization with 80% loan-to-value (20% downpayment). The mortgage rate is the current FRED MORTGAGE30US weekly observation.',
    anchorCitation:
      'CFPB Qualified Mortgage rule at 12 CFR §1026.43(c) (43% back-end DTI ceiling) and CFPB Owning a Home toolkit (28% front-end housing cutoff).',
  };
}

function classifyTier(burdenRatio: number): {
  cfpbTier: MortgageBurdenTier;
  shortLabel: string;
  longLabel: string;
} {
  if (burdenRatio >= 1.0) {
    return {
      cfpbTier: 'E_underwater',
      shortLabel: 'Underwater Burden',
      longLabel: 'Underwater (annual housing payment ≥ household income)',
    };
  }
  if (burdenRatio > 0.43) {
    return {
      cfpbTier: 'D_over_43',
      shortLabel: 'Above CFPB 43% Ceiling',
      longLabel: 'Above 43% back-end DTI safe harbor (12 CFR §1026.43(c))',
    };
  }
  if (burdenRatio > 0.36) {
    return {
      cfpbTier: 'C_36_43',
      shortLabel: 'Stretched (36–43%)',
      longLabel: 'Between 36% and 43% — stretched but within QM ceiling',
    };
  }
  if (burdenRatio > 0.28) {
    return {
      cfpbTier: 'B_28_36',
      shortLabel: 'Manageable (28–36%)',
      longLabel: 'Between 28% and 36% — above front-end cutoff, manageable',
    };
  }
  return {
    cfpbTier: 'A_under_28',
    shortLabel: 'Comfortable (<28%)',
    longLabel: 'Below 28% — front-end housing burden within conservative cutoff',
  };
}

export const MORTGAGE_BURDEN_TIER_LABELS: Record<MortgageBurdenTier, string> = {
  A_under_28: 'Comfortable (<28%)',
  B_28_36: 'Manageable (28–36%)',
  C_36_43: 'Stretched (36–43%)',
  D_over_43: 'Above CFPB 43% Ceiling',
  E_underwater: 'Underwater Burden',
};

export function mortgageBurdenToneClasses(tier: MortgageBurdenTier): string {
  switch (tier) {
    case 'A_under_28':
      return 'bg-teal-50 border-teal-300 text-teal-900';
    case 'B_28_36':
      return 'bg-emerald-50 border-emerald-300 text-emerald-900';
    case 'C_36_43':
      return 'bg-yellow-50 border-yellow-300 text-yellow-900';
    case 'D_over_43':
      return 'bg-amber-50 border-amber-300 text-amber-900';
    case 'E_underwater':
      return 'bg-rose-50 border-rose-300 text-rose-900';
  }
}
