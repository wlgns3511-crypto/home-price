/**
 * housing-narrative.ts — Layer 2 commentary for state pages.
 *
 * Five narrative slots × three variants × slug-deterministic rotation. Every
 * variant is built from facts (housing-landscape.ts) — no fabricated forecasts,
 * no "great time to buy" CTAs, no investment-advice tone.
 *
 * Veto compliance (memory: hcu-5chunk-rollout-20260428):
 *   - "buy now / good time / hot market / don't wait" — banned (audit grep)
 *   - Forecasting language ("will rise", "expected to") — banned
 *   - Investment-advice tone — banned
 *   - All numerics traceable to data/sources.json
 *
 * Slot rotation: 3 variants per slot × 51 states = enough variety that no
 * two consecutive states share all five slots. fnv1a32(slug|salt) keeps the
 * pick stable across rebuilds.
 */

import type { StateData } from './states-data';
import { pickVariant, formatUsd, formatUsdCompact, formatPercent, formatPp, formatPercentPlain } from './content-helpers';
import {
  getAffordabilityIndex,
  getMortgageCostDelta,
  getBuyVsRentCrossover,
  getCostBurdenCompass,
  getAppreciationTrend,
  getOwnershipBurden,
  getPeerStates,
} from './housing-landscape';

export interface NarrativeSlots {
  affordability: string;
  rateContext: string;
  buyVsRent: string;
  appreciation: string;
  costBurden: string;
}

export function buildNarrative(state: StateData, all: StateData[]): NarrativeSlots {
  return {
    affordability: affordabilitySlot(state, all),
    rateContext: rateSlot(state),
    buyVsRent: buyRentSlot(state),
    appreciation: appreciationSlot(state, all),
    costBurden: costBurdenSlot(state, all),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Slot 1: AFFORDABILITY (Demographia bucket framing)                          */
/* ────────────────────────────────────────────────────────────────────────── */

function affordabilitySlot(state: StateData, all: StateData[]): string {
  const f = getAffordabilityIndex(state, all);
  const peers = getPeerStates(state, all);
  const variants = [
    `${state.name}'s price-to-income ratio is ${f.pir.toFixed(2)}, which the Demographia survey would label "${f.bucketLabel}". The ratio means a household earning the state median (${formatUsd(state.medianHouseholdIncome)}) faces a ${formatUsd(state.medianHomePrice)} typical home — about ${f.pir.toFixed(1)} years of pre-tax income. The state-level median across all 51 jurisdictions is ${f.nationalMedianPir.toFixed(2)}, so ${state.name} sits ${formatPercent((f.pir / f.nationalMedianPir - 1) * 100)} ${f.pir > f.nationalMedianPir ? 'above' : 'below'} that midpoint.`,

    `If you anchor affordability to the Demographia framework — price divided by income — ${state.name} comes in at ${f.pir.toFixed(2)}× and lands in the "${f.bucketLabel}" tier. That's ${f.rankAmongStates}-out-of-${f.totalStates} from the least-affordable end. Within the ${peers.clusterLabel} peer cluster, this ratio is what determines whether household formation can keep pace with prices or whether buyers are stretched.`,

    `The arithmetic is straightforward: the typical ${state.name} home costs ${formatUsd(state.medianHomePrice)}, the typical household earns ${formatUsd(state.medianHouseholdIncome)}, and ${formatUsd(state.medianHomePrice)} ÷ ${formatUsd(state.medianHouseholdIncome)} = ${f.pir.toFixed(2)}. Demographia's bucket boundaries are 3.0, 4.0, and 5.0 — ${state.name}'s ${f.pir.toFixed(2)} puts it in "${f.bucketLabel}" and ranks ${f.rankAmongStates} of ${f.totalStates} for stretch.`,
  ];
  return pickVariant(state.slug, 'affordability', variants);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Slot 2: RATE / MORTGAGE COST CONTEXT (FRED MORTGAGE30US translator)         */
/* ────────────────────────────────────────────────────────────────────────── */

function rateSlot(state: StateData): string {
  const m = getMortgageCostDelta(state);
  const variants = [
    `At ${state.avgMortgageRate30yr.toFixed(2)}% (FRED MORTGAGE30US), a 20%-down loan on the median ${state.name} home means borrowing ${formatUsd(m.loanPrincipal)} and a P&I payment of ${formatUsd(m.monthlyPI)}/month. If the 30-year average climbs a full point, that figure becomes ${formatUsd(m.monthlyPI + m.per1PctRise)} (+${formatUsd(m.per1PctRise)}/month). A 25-bp move costs ${formatUsd(m.per25BpRise)}/month either way — useful when comparing lender quotes.`,

    `Translate the headline rate into ${state.name} dollars: ${state.avgMortgageRate30yr.toFixed(2)}% × ${formatUsd(m.loanPrincipal)} loan = ${formatUsd(m.monthlyPI)}/month for principal and interest only. Over the full 30 years that's ${formatUsdCompact(m.totalInterest30yr)} of interest, more than the borrowed principal itself. Each 1.0-point swing in the FRED weekly average shifts the monthly bill by roughly ${formatUsd(m.per1PctRise)}.`,

    `${state.name}'s headline math at the current ${state.avgMortgageRate30yr.toFixed(2)}% benchmark: principal ${formatUsd(m.loanPrincipal)}, monthly P&I ${formatUsd(m.monthlyPI)}, lifetime interest ${formatUsdCompact(m.totalInterest30yr)}. If rates drop a point, monthly bill falls ${formatUsd(m.per1PctFall)} — material, but only if you can refinance without resetting the clock.`,
  ];
  return pickVariant(state.slug, 'rate', variants);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Slot 3: BUY VS RENT (cumulative cost crossover)                             */
/* ────────────────────────────────────────────────────────────────────────── */

function buyRentSlot(state: StateData): string {
  const c = getBuyVsRentCrossover(state);
  const ratio = c.pitiVsRentRatio;
  const variants = [
    c.cappedAt30
      ? `Under a simple cumulative-cost model — 20% down, ${state.avgMortgageRate30yr.toFixed(2)}% fixed, 1% maintenance, 3% rent inflation, 2.5% own-cost escalator — the breakeven year for ${state.name} sits beyond the 30-year loan term. That means renting tracks below ownership cost across the whole horizon under these assumptions; the model excludes price appreciation and tax deductions, both of which can pull the crossover sooner.`
      : `Under a simple cumulative-cost model — 20% down, ${state.avgMortgageRate30yr.toFixed(2)}% fixed, 1% maintenance, 3% rent inflation, 2.5% own-cost escalator — ${state.name}'s buy-vs-rent crossover lands at year ${c.crossoverYr}. The first-month PITI works out to roughly ${formatUsd(c.monthlyPITI)} versus an estimated ${formatUsd(c.estimatedMonthlyRent)} rent (${ratio.toFixed(2)}× ratio). The model excludes price appreciation, tax deductions, and the opportunity cost of the down payment.`,

    c.cappedAt30
      ? `Cumulative-cost crossover (rent vs ownership outflows only, no appreciation, no deductions) doesn't trigger inside the 30-year window for ${state.name}. The first-year monthly PITI is ${formatUsd(c.monthlyPITI)} against ${formatUsd(c.estimatedMonthlyRent)} rent — a ${ratio.toFixed(2)}× starting gap that rent inflation doesn't close in three decades.`
      : `In ${state.name}, the rent-vs-ownership crossover under our base model is year ${c.crossoverYr}. PITI starts at ${formatUsd(c.monthlyPITI)}/month against ${formatUsd(c.estimatedMonthlyRent)}/month rent (${ratio.toFixed(2)}× starting ratio). Add capital appreciation or the mortgage-interest deduction back in and the crossover usually moves earlier; subtract a major repair year and it moves later.`,

    `${state.name} ownership starts at ${formatUsd(c.monthlyPITI)}/month PITI versus an estimated ${formatUsd(c.estimatedMonthlyRent)}/month rent (${(c.pitiVsRentRatio * 100 - 100).toFixed(0)}% premium for buying in year 1). Compounded with 3% rent inflation, the cumulative-cost model puts the breakeven at year ${c.cappedAt30 ? '> 30' : c.crossoverYr}. Don't read this as "should I buy?" — read it as "how long is my ownership horizon worth?".`,
  ];
  return pickVariant(state.slug, 'buyrent', variants);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Slot 4: APPRECIATION TREND (FHFA cumulative + CAGR)                         */
/* ────────────────────────────────────────────────────────────────────────── */

function appreciationSlot(state: StateData, all: StateData[]): string {
  const a = getAppreciationTrend(state, all);
  const trendWord =
    a.trend === 'accelerating' ? 'faster than its 10-year CAGR'
    : a.trend === 'decelerating' ? 'slower than its 10-year CAGR'
    : 'roughly in line with its 10-year CAGR';
  const variants = [
    `FHFA's all-transactions index has ${state.name} home prices up ${formatPercentPlain(a.cum5yr)} cumulatively over the past 5 years (${formatPercentPlain(a.cagr5yr)} CAGR) and ${formatPercentPlain(a.cum10yr)} over 10 years (${formatPercentPlain(a.cagr10yr)} CAGR). The 5-year pace is running ${trendWord}. Versus the 51-state median, ${state.name} is ${formatPp(a.vsNational5yr)} on the 5-year and ${formatPp(a.vsNational10yr)} on the 10-year window.`,

    `Looked at over a longer horizon, ${state.name} has compounded at ${formatPercentPlain(a.cagr10yr)}/year for a decade and ${formatPercentPlain(a.cagr5yr)}/year over the last five — ${a.trend} on the FHFA index. Cumulatively that's ${formatPercentPlain(a.cum10yr)} since 2014 and ${formatPercentPlain(a.cum5yr)} since 2019. The state runs ${formatPp(a.vsNational10yr)} versus the national 10-year median.`,

    `The 10-year FHFA path for ${state.name}: ${formatPercentPlain(a.cum10yr)} cumulative, ${formatPercentPlain(a.cagr10yr)} CAGR. The 5-year path: ${formatPercentPlain(a.cum5yr)} cumulative, ${formatPercentPlain(a.cagr5yr)} CAGR — ${trendWord}. Versus the median state, the 5-year delta is ${formatPp(a.vsNational5yr)}; the 10-year delta is ${formatPp(a.vsNational10yr)}. Past appreciation is data, not a forecast.`,
  ];
  return pickVariant(state.slug, 'appreciation', variants);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Slot 5: COST BURDEN (HUD owner + renter)                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function costBurdenSlot(state: StateData, all: StateData[]): string {
  const c = getCostBurdenCompass(state, all);
  const own = getOwnershipBurden(state);
  const variants = [
    `Census ACS 2023 5-Year data shows ${formatPercentPlain(c.ownerPct)} of ${state.name} mortgaged owners and ${formatPercentPlain(c.renterPct)} of renters paying 30% or more of household income on housing — HUD's "cost-burdened" threshold. Owners rank #${c.ownerNationalRank} of ${all.length} for owner-burden, renters rank #${c.renterNationalRank}. At the state median income, this site's PITI estimate (${formatUsd(own.monthlyPITI)}/month) implies ${formatPercentPlain(own.pitiToIncomePct)} of gross income going to housing.`,

    `HUD's 30%-of-income threshold catches ${formatPercentPlain(c.ownerPct)} of ${state.name} mortgaged owners and ${formatPercentPlain(c.renterPct)} of renters in the latest ACS 5-Year. The owner share ranks ${c.ownerNationalRank} of ${all.length}; the renter share ranks ${c.renterNationalRank}. The renter-vs-owner gap is ${formatPercentPlain(Math.abs(c.ownerVsRenterDelta))} pp — ${c.ownerVsRenterDelta >= 10 ? 'wide' : 'narrow'} compared with most states.`,

    `Two HUD cost-burden numbers anchor the affordability story for ${state.name}. Owner side: ${formatPercentPlain(c.ownerPct)} of mortgaged households are above the 30% threshold (national rank ${c.ownerNationalRank} of ${all.length}). Renter side: ${formatPercentPlain(c.renterPct)} (rank ${c.renterNationalRank}). Combined, the burden severity reads "${c.burdenSeverity}". Plug in the state median income (${formatUsd(state.medianHouseholdIncome)}) and the state median PITI of ${formatUsd(own.monthlyPITI)}/month and you get a ${formatPercentPlain(own.pitiToIncomePct)} housing-to-gross-income ratio.`,
  ];
  return pickVariant(state.slug, 'costburden', variants);
}
