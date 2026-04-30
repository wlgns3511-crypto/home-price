/**
 * housing-landscape.ts — Layer 1 facts derivation for state pages.
 *
 * Eight pure functions that take StateData (anchored inputs, see states-data.ts)
 * and return structured facts for components and narrative slots. Every output
 * is deterministic and traceable to a public source — no synthetic noise, no
 * LLM-generated claims, no forecasts.
 *
 * Veto alignment (memory: hcu-5chunk-rollout-20260428):
 *   - #7 (synthetic-base ban) — every input is anchored or derived from anchored
 *   - #11 (no forecasting) — all functions are point-in-time facts
 *   - #21 (stub trap) — every helper has real body
 */

import type { StateData, DemographiaBucket } from './states-data';
import { fleetSites } from '@/components/upgrades/getClusterLinks';

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. AFFORDABILITY INDEX (Demographia bucket + national rank)                */
/* ────────────────────────────────────────────────────────────────────────── */

export interface AffordabilityFacts {
  pir: number;
  bucket: DemographiaBucket;
  bucketLabel: string;
  rankAmongStates: number;        // 1 = least affordable
  totalStates: number;
  nationalMedianPir: number;
  pirVsNational: number;          // (pir / nationalMedianPir) - 1
}

const BUCKET_LABEL_EN: Record<DemographiaBucket, string> = {
  'affordable': 'Affordable',
  'moderately-unaffordable': 'Moderately Unaffordable',
  'seriously-unaffordable': 'Seriously Unaffordable',
  'severely-unaffordable': 'Severely Unaffordable',
};

export function getAffordabilityIndex(state: StateData, all: StateData[]): AffordabilityFacts {
  const sortedDesc = [...all].sort((a, b) => b.priceToIncomeRatio - a.priceToIncomeRatio);
  const rank = sortedDesc.findIndex(s => s.slug === state.slug) + 1;
  const median = medianOf(all.map(s => s.priceToIncomeRatio));
  return {
    pir: state.priceToIncomeRatio,
    bucket: state.demographiaBucket,
    bucketLabel: BUCKET_LABEL_EN[state.demographiaBucket],
    rankAmongStates: rank,
    totalStates: all.length,
    nationalMedianPir: Number(median.toFixed(2)),
    pirVsNational: Number(((state.priceToIncomeRatio / median) - 1).toFixed(3)),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. MORTGAGE COST DELTA (rate translator: $/month per 1% rate change)       */
/* ────────────────────────────────────────────────────────────────────────── */

export interface MortgageDeltaFacts {
  loanPrincipal: number;
  ratePct: number;
  monthlyPI: number;
  per1PctRise: number;            // $/month if rate climbs +1.0pp
  per1PctFall: number;            // $/month if rate drops -1.0pp
  per25BpRise: number;            // $/month if rate climbs +0.25pp
  totalInterest30yr: number;
}

export function getMortgageCostDelta(state: StateData): MortgageDeltaFacts {
  const principal = Math.round(state.medianHomePrice * 0.8);
  const baseMonthly = piMonthly(principal, state.avgMortgageRate30yr);
  const rise1pp = piMonthly(principal, state.avgMortgageRate30yr + 1.0);
  const fall1pp = piMonthly(principal, Math.max(0.5, state.avgMortgageRate30yr - 1.0));
  const rise25bp = piMonthly(principal, state.avgMortgageRate30yr + 0.25);
  return {
    loanPrincipal: principal,
    ratePct: state.avgMortgageRate30yr,
    monthlyPI: Math.round(baseMonthly),
    per1PctRise: Math.round(rise1pp - baseMonthly),
    per1PctFall: Math.round(baseMonthly - fall1pp),
    per25BpRise: Math.round(rise25bp - baseMonthly),
    totalInterest30yr: Math.round(baseMonthly * 360 - principal),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. BUY-VS-RENT CROSSOVER                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export interface CrossoverFacts {
  crossoverYr: number;
  cappedAt30: boolean;
  monthlyPITI: number;
  estimatedMonthlyRent: number;
  pitiVsRentRatio: number;
}

export function getBuyVsRentCrossover(state: StateData): CrossoverFacts {
  const principal = state.medianHomePrice * 0.8;
  const monthlyPI = piMonthly(principal, state.avgMortgageRate30yr);
  const monthlyTax = (state.medianHomePrice * (state.avgPropertyTaxPct / 100)) / 12;
  const monthlyIns = state.avgInsuranceAnnual / 12;
  const monthlyMaint = (state.medianHomePrice * 0.01) / 12;
  const monthlyPITI = monthlyPI + monthlyTax + monthlyIns + monthlyMaint;
  const monthlyRent = (state.medianHomePrice * 0.06) / 12;
  return {
    crossoverYr: state.buyVsRentCrossoverYr,
    cappedAt30: state.buyVsRentCrossoverYr >= 30,
    monthlyPITI: Math.round(monthlyPITI),
    estimatedMonthlyRent: Math.round(monthlyRent),
    pitiVsRentRatio: Number((monthlyPITI / monthlyRent).toFixed(2)),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. COST-BURDEN COMPASS (HUD owner + renter, with severity flags)            */
/* ────────────────────────────────────────────────────────────────────────── */

export interface CostBurdenFacts {
  ownerPct: number;
  renterPct: number;
  ownerVsRenterDelta: number;
  ownerNationalRank: number;       // 1 = highest burden
  renterNationalRank: number;
  burdenSeverity: 'low' | 'moderate' | 'high' | 'severe';
}

export function getCostBurdenCompass(state: StateData, all: StateData[]): CostBurdenFacts {
  const ownerSorted = [...all].sort((a, b) => b.costBurdenedOwnerPct - a.costBurdenedOwnerPct);
  const renterSorted = [...all].sort((a, b) => b.costBurdenedRenterPct - a.costBurdenedRenterPct);
  const ownerRank = ownerSorted.findIndex(s => s.slug === state.slug) + 1;
  const renterRank = renterSorted.findIndex(s => s.slug === state.slug) + 1;

  const combined = (state.costBurdenedOwnerPct + state.costBurdenedRenterPct) / 2;
  let severity: CostBurdenFacts['burdenSeverity'];
  if (combined >= 38) severity = 'severe';
  else if (combined >= 33) severity = 'high';
  else if (combined >= 28) severity = 'moderate';
  else severity = 'low';

  return {
    ownerPct: state.costBurdenedOwnerPct,
    renterPct: state.costBurdenedRenterPct,
    ownerVsRenterDelta: Number((state.costBurdenedRenterPct - state.costBurdenedOwnerPct).toFixed(1)),
    ownerNationalRank: ownerRank,
    renterNationalRank: renterRank,
    burdenSeverity: severity,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 5. APPRECIATION TREND (5yr / 10yr cumulative + CAGR)                        */
/* ────────────────────────────────────────────────────────────────────────── */

export interface AppreciationFacts {
  cum5yr: number;
  cum10yr: number;
  cagr5yr: number;
  cagr10yr: number;
  vsNational5yr: number;          // pp difference
  vsNational10yr: number;
  trend: 'accelerating' | 'decelerating' | 'flat';
}

export function getAppreciationTrend(state: StateData, all: StateData[]): AppreciationFacts {
  const nat5 = medianOf(all.map(s => s.fhfaHpi5yr));
  const nat10 = medianOf(all.map(s => s.fhfaHpi10yr));
  const cagr5 = cagrFromCumulative(state.fhfaHpi5yr, 5);
  const cagr10 = cagrFromCumulative(state.fhfaHpi10yr, 10);

  let trend: AppreciationFacts['trend'];
  if (cagr5 > cagr10 + 1) trend = 'accelerating';
  else if (cagr5 < cagr10 - 1) trend = 'decelerating';
  else trend = 'flat';

  return {
    cum5yr: state.fhfaHpi5yr,
    cum10yr: state.fhfaHpi10yr,
    cagr5yr: Number(cagr5.toFixed(1)),
    cagr10yr: Number(cagr10.toFixed(1)),
    vsNational5yr: Number((state.fhfaHpi5yr - nat5).toFixed(1)),
    vsNational10yr: Number((state.fhfaHpi10yr - nat10).toFixed(1)),
    trend,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 6. OWNERSHIP BURDEN (PITI breakdown for typical buyer)                      */
/* ────────────────────────────────────────────────────────────────────────── */

export interface OwnershipBurdenFacts {
  loanPrincipal: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyPITI: number;
  annualPITI: number;
  pitiToIncomePct: number;
  downPayment20: number;
}

export function getOwnershipBurden(state: StateData): OwnershipBurdenFacts {
  const principal = Math.round(state.medianHomePrice * 0.8);
  const monthlyPI = piMonthly(principal, state.avgMortgageRate30yr);
  const monthlyTax = (state.medianHomePrice * (state.avgPropertyTaxPct / 100)) / 12;
  const monthlyIns = state.avgInsuranceAnnual / 12;
  const monthlyMaint = (state.medianHomePrice * 0.01) / 12;
  const monthlyPITI = monthlyPI + monthlyTax + monthlyIns + monthlyMaint;
  const annual = monthlyPITI * 12;
  const pitiToIncome = state.medianHouseholdIncome > 0
    ? (annual / state.medianHouseholdIncome) * 100
    : 0;

  return {
    loanPrincipal: principal,
    monthlyPI: Math.round(monthlyPI),
    monthlyTax: Math.round(monthlyTax),
    monthlyInsurance: Math.round(monthlyIns),
    monthlyMaintenance: Math.round(monthlyMaint),
    monthlyPITI: Math.round(monthlyPITI),
    annualPITI: Math.round(annual),
    pitiToIncomePct: Number(pitiToIncome.toFixed(1)),
    downPayment20: Math.round(state.medianHomePrice * 0.2),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 7. PEER STATES (4-tier cluster: coastal / sun-belt / rust-belt / mountain) */
/* ────────────────────────────────────────────────────────────────────────── */

export type PeerCluster = 'coastal-highcost' | 'sun-belt-boom' | 'rust-belt-affordable' | 'mountain-migration' | 'plains-stable' | 'mid-atlantic';

export interface PeerFacts {
  cluster: PeerCluster;
  clusterLabel: string;
  peers: { slug: string; name: string; medianHomePrice: number; pir: number }[];
  closestByPrice: { slug: string; name: string; medianHomePrice: number }[];
}

const PEER_CLUSTERS: Record<string, PeerCluster> = {
  // Coastal high-cost
  'california': 'coastal-highcost', 'hawaii': 'coastal-highcost',
  'massachusetts': 'coastal-highcost', 'washington': 'coastal-highcost',
  'oregon': 'coastal-highcost', 'connecticut': 'coastal-highcost',
  'rhode-island': 'coastal-highcost', 'new-jersey': 'coastal-highcost',
  'new-york': 'coastal-highcost', 'maryland': 'coastal-highcost',
  // Sun-belt boom
  'florida': 'sun-belt-boom', 'arizona': 'sun-belt-boom',
  'texas': 'sun-belt-boom', 'nevada': 'sun-belt-boom',
  'georgia': 'sun-belt-boom', 'south-carolina': 'sun-belt-boom',
  'north-carolina': 'sun-belt-boom', 'tennessee': 'sun-belt-boom',
  // Rust-belt affordable
  'ohio': 'rust-belt-affordable', 'michigan': 'rust-belt-affordable',
  'pennsylvania': 'rust-belt-affordable', 'indiana': 'rust-belt-affordable',
  'illinois': 'rust-belt-affordable', 'wisconsin': 'rust-belt-affordable',
  'west-virginia': 'rust-belt-affordable', 'kentucky': 'rust-belt-affordable',
  // Mountain migration
  'colorado': 'mountain-migration', 'utah': 'mountain-migration',
  'idaho': 'mountain-migration', 'montana': 'mountain-migration',
  'wyoming': 'mountain-migration', 'new-mexico': 'mountain-migration',
  // Plains stable
  'iowa': 'plains-stable', 'kansas': 'plains-stable',
  'nebraska': 'plains-stable', 'north-dakota': 'plains-stable',
  'south-dakota': 'plains-stable', 'oklahoma': 'plains-stable',
  'missouri': 'plains-stable', 'arkansas': 'plains-stable',
  'mississippi': 'plains-stable', 'alabama': 'plains-stable',
  'louisiana': 'plains-stable', 'minnesota': 'plains-stable',
  // Mid-atlantic / new england
  'virginia': 'mid-atlantic', 'delaware': 'mid-atlantic',
  'washington-dc': 'mid-atlantic', 'new-hampshire': 'mid-atlantic',
  'vermont': 'mid-atlantic', 'maine': 'mid-atlantic',
  // Special
  'alaska': 'mountain-migration',
};

const CLUSTER_LABEL: Record<PeerCluster, string> = {
  'coastal-highcost': 'Coastal high-cost',
  'sun-belt-boom': 'Sun-Belt boom',
  'rust-belt-affordable': 'Rust-Belt affordable',
  'mountain-migration': 'Mountain migration',
  'plains-stable': 'Plains stable',
  'mid-atlantic': 'Mid-Atlantic / New England',
};

export function getPeerStates(state: StateData, all: StateData[]): PeerFacts {
  const cluster = PEER_CLUSTERS[state.slug] ?? 'plains-stable';
  const peers = all
    .filter(s => s.slug !== state.slug && PEER_CLUSTERS[s.slug] === cluster)
    .sort((a, b) => Math.abs(a.priceToIncomeRatio - state.priceToIncomeRatio) - Math.abs(b.priceToIncomeRatio - state.priceToIncomeRatio))
    .slice(0, 4)
    .map(s => ({
      slug: s.slug,
      name: s.name,
      medianHomePrice: s.medianHomePrice,
      pir: s.priceToIncomeRatio,
    }));

  const sortedByPrice = [...all].sort((a, b) => b.medianHomePrice - a.medianHomePrice);
  const idx = sortedByPrice.findIndex(s => s.slug === state.slug);
  const closest = sortedByPrice
    .filter((_, i) => i !== idx && Math.abs(i - idx) <= 2)
    .slice(0, 3)
    .map(s => ({ slug: s.slug, name: s.name, medianHomePrice: s.medianHomePrice }));

  return {
    cluster,
    clusterLabel: CLUSTER_LABEL[cluster],
    peers,
    closestByPrice: closest,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 8. CROSS-SITE LINKS (deep links to peer-data sites for the same state)     */
/* ────────────────────────────────────────────────────────────────────────── */

export interface CrossSiteLink {
  site: string;
  label: string;
  url: string;
  blurb: string;
}

/**
 * Returns deep links to /state/{slug}/ on peer sites that have a state-page
 * route and house an adjacent dataset (property tax, rent, mortgage, solar,
 * elder care). costbycity has no /state/ route — link goes to root.
 */
export function getCrossSiteLinks(state: StateData): CrossSiteLink[] {
  const slug = state.slug;
  const links: CrossSiteLink[] = [
    {
      site: 'propertytaxpeek',
      label: 'Property Tax in ' + state.name,
      url: `https://propertytaxpeek.com/state/${slug}/`,
      blurb: `County-level effective rates and median bills (${state.avgPropertyTaxPct.toFixed(2)}% avg used here).`,
    },
    {
      site: 'fairrentwize',
      label: 'Fair Rent in ' + state.name,
      url: `https://fairrentwize.com/state/${slug}/`,
      blurb: `Rent-to-income ratios and city rents — pairs with our buy-vs-rent crossover.`,
    },
    {
      site: 'homeloanpeek',
      label: 'Mortgage Rates in ' + state.name,
      url: `https://homeloanpeek.com/state/${slug}/`,
      blurb: `State-level rate context and qualifier guide for the ${state.avgMortgageRate30yr.toFixed(2)}% baseline.`,
    },
    {
      site: 'sunpowerpeek',
      label: 'Solar Payback in ' + state.name,
      url: `https://sunpowerpeek.com/state/${slug}/`,
      blurb: `Adds rooftop-solar payback context to the 1% maintenance assumption.`,
    },
  ];
  return links.filter(l => fleetSites[l.site] !== undefined);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* helpers                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function piMonthly(principal: number, ratePct: number): number {
  const r = ratePct / 100 / 12;
  const n = 360;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function medianOf(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function cagrFromCumulative(cumulativePct: number, years: number): number {
  if (years <= 0) return 0;
  const growth = 1 + cumulativePct / 100;
  return (Math.pow(growth, 1 / years) - 1) * 100;
}
