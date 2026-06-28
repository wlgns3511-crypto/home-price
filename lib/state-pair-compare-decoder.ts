/**
 * Phase 7 Compare-Wrap 8th pilot — state-pair home-price decoder
 * (homepricepeek). Second pilot in the cohort with a FRESHNESS layer:
 * V2 surfaces FHFA HPI state quarterly + S&P/Case-Shiller national
 * monthly via data/hpi-quarterly.json, refreshed monthly by
 * scripts/sync-hpi.ts off FRED.
 *
 * Maps each of the 5 canonical alphabetical state pairs to a 6-verdict
 * composite that triangulates FHFA HPI state quarterly (FRESH) +
 * Case-Shiller national monthly (FRESH overlay) + 5-yr cumulative
 * appreciation + Demographia price-to-income tier + CFPB monthly
 * mortgage burden + appreciation-vs-affordability divergence.
 *
 * 4-layer data-honesty taxonomy:
 *   federal-aggregate          — FHFA HPI state quarterly (FRESH),
 *                                S&P CoreLogic Case-Shiller CSUSHPISA
 *                                monthly national overlay (FRESH),
 *                                FHFA HPI 5-yr cumulative
 *   editorial-estimate         — Demographia 5-band price-to-income
 *                                tier (state median home / state
 *                                median income), CFPB-anchored monthly
 *                                P&I burden ratio at FRED MORTGAGE30US
 *                                × 80% LTV × state median home
 *   editorial-cross-reference  — appreciation-vs-affordability
 *                                divergence read (5-yr HPI gain × PIR
 *                                tier — did the state that appreciated
 *                                faster also become less affordable?)
 *
 * Trap #121 surveyability — STATE_PAIR_PILOT_SLUGS is the canonical
 * enumeration mirrored by middleware.ts COMPARE_STATE_ALLOWLIST and
 * scripts/gen-sitemap.py STATE_PAIR_COMPARE. Pairs mirror homeloanpeek
 * 7th + wagepeek 6th + netpaypeek 5th so /compare/state/{pair}/ aligns
 * housing-burden, gross wage, net-pay, and now home-price + appreciation
 * across the 4-bidirectional siblings.
 *
 * Trap #112 title cap — composeStatePairTitle ≤60 chars. Worst case
 * "Massachusetts vs New Hampshire: Home Prices Compared" = 52 chars.
 * Layout suffix " | HomePricePeek" is 16c which pushes to 68c — page
 * MUST use title.absolute (v2.2 §4.0).
 *
 * Trap #117 / #110 publisher diversity — homepricepeek SOURCE_AUTHORITIES
 * = 5 entries spanning 5 distinct hosts (oecd.org, census.gov, fhfa.gov,
 * stlouisfed.org, unstats.un.org). Audit threshold ≥4 SOURCE / ≥4 hosts.
 * Both PASS without modification.
 */

import { getStateBySlug, type StateData } from './states-data';
import { priceToIncomeBand, type PriceToIncomeResult } from './price-to-income-band';
import {
  mortgageBurdenDecoder,
  type MortgageBurdenResult,
} from './mortgage-burden-decoder';
import hpiPayload from '@/data/hpi-quarterly.json';
import { SOURCE_AUTHORITIES } from './authorship';

export const STATE_PAIR_PILOT_SLUGS = [
  'california-vs-texas',
  'florida-vs-new-york',
  'massachusetts-vs-new-hampshire',
  'new-jersey-vs-pennsylvania',
  'oregon-vs-washington',
] as const;

export type StatePairPilotSlug = (typeof STATE_PAIR_PILOT_SLUGS)[number];

const SLUG_TO_PAIR: ReadonlyMap<StatePairPilotSlug, readonly [string, string]> =
  new Map([
    ['california-vs-texas', ['california', 'texas']],
    ['florida-vs-new-york', ['florida', 'new-york']],
    ['massachusetts-vs-new-hampshire', ['massachusetts', 'new-hampshire']],
    ['new-jersey-vs-pennsylvania', ['new-jersey', 'pennsylvania']],
    ['oregon-vs-washington', ['oregon', 'washington']],
  ]);

export function isStatePairPilotSlug(slug: string): slug is StatePairPilotSlug {
  return (STATE_PAIR_PILOT_SLUGS as readonly string[]).includes(slug);
}

export type DataHonestyLayer =
  | 'federal-aggregate'
  | 'editorial-estimate'
  | 'cite-only-reference'
  | 'editorial-cross-reference';

export const DATA_LAYER_LABEL: Record<DataHonestyLayer, string> = {
  'federal-aggregate': 'Federal aggregate',
  'editorial-estimate': 'Editorial estimate',
  'cite-only-reference': 'Cite-only reference',
  'editorial-cross-reference': 'Editorial cross-reference',
};

export interface StatePairVerdict {
  key:
    | 'state-hpi-quarterly-fresh'
    | 'case-shiller-national-overlay'
    | 'five-yr-cumulative-appreciation'
    | 'price-to-income-tier'
    | 'monthly-housing-burden'
    | 'appreciation-vs-affordability-cross-reference';
  layer: DataHonestyLayer;
  headline: string;
  body: string;
  source: { name: string; url: string };
}

interface HpiStateBlock {
  code: string;
  currentIndex: number;
  yoyPct: number;
  fiveYrCumPct: number;
  tenYrCumPct: number;
  history: { quarterDate: string; quarterLabel: string; index: number }[];
}

interface HpiShape {
  vintage: string;
  fetchedAt: string;
  source: string;
  sourceUrl: string;
  methodology: string;
  fredSeriesIds: { stateStHpiPattern: string; nationalCaseShiller: string };
  current: {
    stateQuarterDate: string;
    stateQuarterLabel: string;
    nationalMonth: string;
    nationalCsIndex: number;
    nationalCsYoyPct: number;
  };
  states: Record<string, HpiStateBlock>;
}

const HPI = hpiPayload as HpiShape;

export const HPI_STATE_QUARTER_DATE = HPI.current.stateQuarterDate;
export const HPI_STATE_QUARTER_LABEL = HPI.current.stateQuarterLabel;
export const HPI_NATIONAL_MONTH = HPI.current.nationalMonth;
export const HPI_NATIONAL_CS_INDEX = HPI.current.nationalCsIndex;
export const HPI_NATIONAL_CS_YOY_PCT = HPI.current.nationalCsYoyPct;
export const HPI_FETCHED_AT = HPI.fetchedAt;

export interface StateSlice {
  meta: StateData;
  hpi: HpiStateBlock | null;
  pti: PriceToIncomeResult | null;
  burden: MortgageBurdenResult | null;
}

export interface StatePairCompareResult {
  slug: StatePairPilotSlug;
  a: StateSlice;
  b: StateSlice;
  verdicts: readonly StatePairVerdict[];
  /** Absolute spread in state median home value $. */
  homeValueSpreadUsd: number;
  /** Absolute spread in 5-year cumulative HPI appreciation (pp). */
  fiveYrAppreciationSpreadPp: number;
  /** Absolute spread in YoY HPI change (pp). */
  yoyAppreciationSpreadPp: number;
  /** Absolute spread in monthly P&I burden $/mo. */
  monthlyBurdenSpreadUsd: number;
  /** Absolute spread in price-to-income ratio. */
  priceToIncomeSpread: number;
  /** FHFA HPI state quarterly vintage. */
  hpiQuarterDate: string;
  /** Case-Shiller national monthly vintage. */
  caseShillerMonth: string;
}

function buildSlice(stateSlug: string): StateSlice | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;
  const hpi = HPI.states[stateSlug] ?? null;
  const pti = priceToIncomeBand(
    state.medianHomePrice,
    state.medianHouseholdIncome,
  );
  const burden = mortgageBurdenDecoder(
    state.medianHomePrice,
    state.avgMortgageRate30yr,
    state.medianHouseholdIncome,
  );
  return { meta: state, hpi, pti, burden };
}

function fmtUsd(n: number | null | undefined): string {
  if (n == null) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtPctSigned(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
}

function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n == null) return '—';
  return `${n.toFixed(digits)}%`;
}

function classifyAppreciationVsAffordability(
  fiveYrCumPct: number,
  ptiRatio: number,
): string {
  if (fiveYrCumPct >= 50 && ptiRatio >= 5.1) {
    return 'fast appreciation + already seriously unaffordable — the burden has compounded, not reset';
  }
  if (fiveYrCumPct >= 50 && ptiRatio >= 4.1) {
    return 'fast appreciation pushed it from balanced toward moderately unaffordable territory';
  }
  if (fiveYrCumPct >= 50) {
    return 'fast 5-yr appreciation but PIR stayed inside the affordable band — wages roughly kept pace';
  }
  if (fiveYrCumPct < 20 && ptiRatio >= 5.1) {
    return 'modest appreciation yet still seriously unaffordable — the affordability problem predates the recent run-up';
  }
  if (fiveYrCumPct < 20) {
    return 'modest appreciation in line with the affordability tier — no recent shock';
  }
  return 'moderate appreciation roughly tracking the affordability tier';
}

function buildVerdicts(a: StateSlice, b: StateSlice): readonly StatePairVerdict[] {
  const verdicts: StatePairVerdict[] = [];

  // 1. FHFA HPI state quarterly anchor (federal-aggregate, FRESH)
  verdicts.push({
    key: 'state-hpi-quarterly-fresh',
    layer: 'federal-aggregate',
    headline: `FHFA HPI ${HPI_STATE_QUARTER_LABEL} — state purchase-only repeat-sales index`,
    body:
      `${a.meta.name}: HPI ${a.hpi ? a.hpi.currentIndex.toFixed(2) : '—'} ` +
      `(YoY ${a.hpi ? fmtPctSigned(a.hpi.yoyPct) : '—'}). ` +
      `${b.meta.name}: HPI ${b.hpi ? b.hpi.currentIndex.toFixed(2) : '—'} ` +
      `(YoY ${b.hpi ? fmtPctSigned(b.hpi.yoyPct) : '—'}). ` +
      `Both states' FHFA HPI series share a common 1980 Q1 = 100 base, so ` +
      `comparing index *levels* is misleading — what's directly comparable is ` +
      `the YoY % change and the multi-year cumulative. This page refreshes ` +
      `monthly off the FRED CSV redistribution of {CODE}STHPI series; FHFA ` +
      `publishes state HPI quarterly with a ~2-month lag (Q4 lands late ` +
      `February, Q1 late May, and so on). The pair pages re-render within ` +
      `one ISR cycle of the data file updating.`,
    source: {
      name: 'FHFA House Price Index — state quarterly all-transactions (via FRED redistribution)',
      url: 'https://www.fhfa.gov/data/hpi',
    },
  });

  // 2. Case-Shiller national monthly overlay (federal-aggregate, FRESH overlay)
  verdicts.push({
    key: 'case-shiller-national-overlay',
    layer: 'federal-aggregate',
    headline: `S&P CoreLogic Case-Shiller national — ${HPI_NATIONAL_MONTH} ${HPI_NATIONAL_CS_INDEX.toFixed(2)} (YoY ${fmtPctSigned(HPI_NATIONAL_CS_YOY_PCT)})`,
    body:
      `Both ${a.meta.name} and ${b.meta.name} sit inside the same national ` +
      `Case-Shiller cycle. CSUSHPISA (seasonally adjusted) for ` +
      `${HPI_NATIONAL_MONTH}: ${HPI_NATIONAL_CS_INDEX.toFixed(2)}, ` +
      `${fmtPctSigned(HPI_NATIONAL_CS_YOY_PCT)} YoY. Case-Shiller is a ` +
      `monthly metro-weighted repeat-sales index — methodologically distinct ` +
      `from FHFA HPI's quarterly all-transactions index — so the absolute ` +
      `level numbers are NOT directly comparable to the state FHFA figures ` +
      `above. The two are read together for directional alignment: when the ` +
      `national Case-Shiller is climbing while a state's FHFA HPI is flat, ` +
      `that state is decoupling from the national cycle. National monthly ` +
      `data refreshes ~2 months in arrears (publishes the last Tuesday of ` +
      `each month).`,
    source: {
      name: 'S&P CoreLogic Case-Shiller U.S. National Home Price Index (CSUSHPISA) via FRED',
      url: 'https://fred.stlouisfed.org/series/CSUSHPISA',
    },
  });

  // 3. 5-yr cumulative appreciation (federal-aggregate)
  const aFive = a.hpi ? a.hpi.fiveYrCumPct : null;
  const bFive = b.hpi ? b.hpi.fiveYrCumPct : null;
  const fiveSpread =
    aFive != null && bFive != null ? Math.abs(aFive - bFive) : null;
  verdicts.push({
    key: 'five-yr-cumulative-appreciation',
    layer: 'federal-aggregate',
    headline: '5-year cumulative HPI appreciation — FHFA state quarterly',
    body:
      `${a.meta.name}: ${fmtPctSigned(aFive)} cumulative over the most recent ` +
      `20-quarter window. ${b.meta.name}: ${fmtPctSigned(bFive)}. ` +
      `Spread: ${fiveSpread != null ? `${fiveSpread.toFixed(1)} pp` : '—'} ` +
      `(${a.meta.name} ${aFive != null && bFive != null && aFive > bFive ? 'outpaced' : aFive != null && bFive != null && aFive < bFive ? 'lagged' : 'roughly matched'} ${b.meta.name}). ` +
      `The 10-year cumulative is ${a.hpi ? fmtPctSigned(a.hpi.tenYrCumPct) : '—'} / ` +
      `${b.hpi ? fmtPctSigned(b.hpi.tenYrCumPct) : '—'}. FHFA's purchase-only ` +
      `index excludes appraisal refis and is widely treated as the most ` +
      `state-comparable government HPI. The 5-yr window is the standard ` +
      `homeowner-equity reference horizon; Demographia and the Joint Center ` +
      `for Housing Studies both cite multi-year cumulative HPI rather than ` +
      `the headline YoY when characterising affordability stress.`,
    source: {
      name: 'FHFA HPI all-transactions — 5-year cumulative (state quarterly)',
      url: 'https://www.fhfa.gov/data/hpi',
    },
  });

  // 4. Demographia price-to-income tier (editorial-estimate)
  const aPirRatio = a.pti?.ratio ?? null;
  const bPirRatio = b.pti?.ratio ?? null;
  const aPirLabel = a.pti?.shortLabel ?? '—';
  const bPirLabel = b.pti?.shortLabel ?? '—';
  const pirSpread =
    aPirRatio != null && bPirRatio != null
      ? Math.abs(aPirRatio - bPirRatio)
      : null;
  verdicts.push({
    key: 'price-to-income-tier',
    layer: 'editorial-estimate',
    headline: 'Demographia 5-band price-to-income tier — state-level',
    body:
      `${a.meta.name}: state median home ${fmtUsd(a.meta.medianHomePrice)} ÷ ` +
      `median household income ${fmtUsd(a.meta.medianHouseholdIncome)} = ` +
      `${aPirRatio != null ? aPirRatio.toFixed(2) : '—'} (${aPirLabel}). ` +
      `${b.meta.name}: ${fmtUsd(b.meta.medianHomePrice)} ÷ ` +
      `${fmtUsd(b.meta.medianHouseholdIncome)} = ` +
      `${bPirRatio != null ? bPirRatio.toFixed(2) : '—'} (${bPirLabel}). ` +
      `Spread: ${pirSpread != null ? pirSpread.toFixed(2) : '—'}. ` +
      `Demographia cutoffs (≥9 / ≥5.1 / ≥4.1 / ≥3.1 / <3.1) are the canonical ` +
      `industry reference — the actual data backing is Zillow ZHVI for home ` +
      `value (Phase 6 enrichment, anchored Apr 2025) and Census ACS B19013 ` +
      `for income. The PIR is the headline Demographia metric the rest of ` +
      `the page hangs off of.`,
    source: {
      name: 'HomePricePeek editorial composition (Demographia 5-band × Census ACS × ZHVI)',
      url: 'https://homepricepeek.com/methodology/',
    },
  });

  // 5. Monthly mortgage burden (editorial-estimate)
  const aBurden = a.burden?.monthly ?? null;
  const bBurden = b.burden?.monthly ?? null;
  const aBurdenTier = a.burden?.shortLabel ?? '—';
  const bBurdenTier = b.burden?.shortLabel ?? '—';
  const burdenSpread =
    aBurden != null && bBurden != null ? Math.abs(aBurden - bBurden) : null;
  verdicts.push({
    key: 'monthly-housing-burden',
    layer: 'editorial-estimate',
    headline: `Monthly P&I burden at FRED MORTGAGE30US ${a.meta.avgMortgageRate30yr.toFixed(2)}% × 80% LTV`,
    body:
      `${a.meta.name}: ${fmtUsd(aBurden)}/mo P&I at ` +
      `${fmtUsd(a.meta.medianHomePrice)} median home (${aBurdenTier}). ` +
      `${b.meta.name}: ${fmtUsd(bBurden)}/mo P&I at ` +
      `${fmtUsd(b.meta.medianHomePrice)} median (${bBurdenTier}). ` +
      `Spread: ${fmtUsd(burdenSpread)}/mo P&I differential. ` +
      `Calculation uses standard 30-year fixed amortization with 20% ` +
      `downpayment; mortgage rate is the current FRED MORTGAGE30US weekly ` +
      `observation. The CFPB Qualified Mortgage rule at 12 CFR §1026.43(c) ` +
      `treats 43% back-end DTI as the safe-harbor ceiling, and the CFPB ` +
      `Owning a Home toolkit cites 28% front-end as the conservative ` +
      `housing-only underwriting cutoff. State effective property tax + ` +
      `homeowner insurance are NOT in the P&I figure here — see the ` +
      `propertytaxpeek sibling for the property-tax overlay.`,
    source: {
      name: 'HomePricePeek editorial composition (CFPB QM × FRED MORTGAGE30US × Census ACS)',
      url: 'https://homepricepeek.com/methodology/',
    },
  });

  // 6. Appreciation × affordability cross-reference (editorial-cross-reference)
  const aCross =
    a.hpi && a.pti
      ? classifyAppreciationVsAffordability(a.hpi.fiveYrCumPct, a.pti.ratio)
      : null;
  const bCross =
    b.hpi && b.pti
      ? classifyAppreciationVsAffordability(b.hpi.fiveYrCumPct, b.pti.ratio)
      : null;
  verdicts.push({
    key: 'appreciation-vs-affordability-cross-reference',
    layer: 'editorial-cross-reference',
    headline: 'Appreciation vs affordability — did the run-up compound or reset?',
    body:
      `${a.meta.name}: 5-yr cumulative ${fmtPctSigned(aFive)} × PIR ` +
      `${aPirRatio != null ? aPirRatio.toFixed(2) : '—'} (${aPirLabel}) — ` +
      `${aCross ?? 'data incomplete'}. ` +
      `${b.meta.name}: ${fmtPctSigned(bFive)} × PIR ` +
      `${bPirRatio != null ? bPirRatio.toFixed(2) : '—'} (${bPirLabel}) — ` +
      `${bCross ?? 'data incomplete'}. ` +
      `FHFA HPI measures price-only motion; Demographia PIR measures ` +
      `affordability relative to income. The cross-reference is where the ` +
      `signal lives: a state with fast appreciation AND a high PIR has had ` +
      `wages fail to keep pace; one with fast appreciation but a still-low ` +
      `PIR has had wages roughly track price. Neither FHFA nor Demographia ` +
      `publishes this composite directly — homepricepeek surfaces it ` +
      `because it's the call a reader actually wants when comparing two ` +
      `state markets.`,
    source: {
      name: 'HomePricePeek editorial cross-reference (FHFA HPI 5-yr × Demographia PIR)',
      url: 'https://homepricepeek.com/methodology/',
    },
  });

  return verdicts;
}

export function decodeStatePair(slug: string): StatePairCompareResult | null {
  if (!isStatePairPilotSlug(slug)) return null;
  const pair = SLUG_TO_PAIR.get(slug);
  if (!pair) return null;
  const a = buildSlice(pair[0]);
  const b = buildSlice(pair[1]);
  if (!a || !b) return null;
  const homeValueSpread = Math.abs(
    a.meta.medianHomePrice - b.meta.medianHomePrice,
  );
  const fiveYrSpread =
    a.hpi && b.hpi ? Math.abs(a.hpi.fiveYrCumPct - b.hpi.fiveYrCumPct) : 0;
  const yoySpread =
    a.hpi && b.hpi ? Math.abs(a.hpi.yoyPct - b.hpi.yoyPct) : 0;
  const burdenSpread =
    a.burden && b.burden ? Math.abs(a.burden.monthly - b.burden.monthly) : 0;
  const pirSpread =
    a.pti && b.pti ? Math.abs(a.pti.ratio - b.pti.ratio) : 0;
  return {
    slug,
    a,
    b,
    verdicts: buildVerdicts(a, b),
    homeValueSpreadUsd: Math.round(homeValueSpread),
    fiveYrAppreciationSpreadPp: Math.round(fiveYrSpread * 10) / 10,
    yoyAppreciationSpreadPp: Math.round(yoySpread * 10) / 10,
    monthlyBurdenSpreadUsd: Math.round(burdenSpread),
    priceToIncomeSpread: Math.round(pirSpread * 100) / 100,
    hpiQuarterDate: HPI_STATE_QUARTER_DATE,
    caseShillerMonth: HPI_NATIONAL_MONTH,
  };
}

/**
 * Title pattern: "{State A} vs {State B}: Home Prices Compared".
 * Worst-case = "Massachusetts vs New Hampshire: Home Prices Compared" = 52c.
 * Layout suffix " | HomePricePeek" (16c) → 68c, over the 60c cap. Page MUST
 * use title.absolute (v2.2 §4.0).
 */
export function composeStatePairTitle(a: StateData, b: StateData): string {
  return `${a.name} vs ${b.name}: Home Prices Compared`;
}

/**
 * Description for metadata + OG. ≤160 chars target.
 */
export function composeStatePairDescription(
  result: StatePairCompareResult,
): string {
  const { a, b, fiveYrAppreciationSpreadPp, priceToIncomeSpread } = result;
  const aPir = a.pti?.ratio ?? null;
  const bPir = b.pti?.ratio ?? null;
  const tail =
    `${a.meta.name} PIR ${aPir != null ? aPir.toFixed(2) : '—'} vs ` +
    `${b.meta.name} PIR ${bPir != null ? bPir.toFixed(2) : '—'} ` +
    `(spread ${priceToIncomeSpread.toFixed(2)}); ` +
    `5-yr FHFA HPI spread ${fiveYrAppreciationSpreadPp.toFixed(1)} pp ` +
    `(${HPI_STATE_QUARTER_LABEL}).`;
  return tail.slice(0, 160);
}

/**
 * Multi-creator Dataset schema. Lists all SOURCE_AUTHORITIES (5 entries
 * spanning 5 distinct hosts) plus the per-page variableMeasured payload.
 * 5 distinct hosts passes Trap #110 ≥4.
 *
 * Trap #105 — inline schema function call (regex-visible). Audit must match
 * `statePairCompareMultiCreatorDatasetSchema\(`.
 */
export function statePairCompareMultiCreatorDatasetSchema(
  result: StatePairCompareResult,
  siteDomain: string,
): Record<string, unknown> {
  const seenUrls = new Set<string>();
  const creators: Array<{
    '@type': 'Organization';
    name: string;
    url: string;
    description?: string;
  }> = [];

  const push = (entry: { name: string; url: string; description?: string }) => {
    if (seenUrls.has(entry.url)) return;
    seenUrls.add(entry.url);
    creators.push({
      '@type': 'Organization',
      name: entry.name,
      url: entry.url,
      description: entry.description,
    });
  };

  for (const s of SOURCE_AUTHORITIES) {
    push({ name: s.name, url: s.url, description: s.role });
  }

  const aHpi = result.a.hpi;
  const bHpi = result.b.hpi;

  const variableMeasured = [
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_quarter_date',
      value: result.hpiQuarterDate,
      description:
        'FHFA HPI state quarterly anchor date — the freshness anchor that refreshes monthly via scripts/sync-hpi.ts.',
    },
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_a_index',
      value: aHpi ? aHpi.currentIndex : null,
      description: `${result.a.meta.name} FHFA HPI all-transactions index (1980 Q1 = 100 base) at current quarter.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_b_index',
      value: bHpi ? bHpi.currentIndex : null,
      description: `${result.b.meta.name} FHFA HPI all-transactions index.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_a_yoy_pct',
      value: aHpi ? aHpi.yoyPct : null,
      description: `${result.a.meta.name} FHFA HPI year-over-year change (%).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_b_yoy_pct',
      value: bHpi ? bHpi.yoyPct : null,
      description: `${result.b.meta.name} FHFA HPI year-over-year change (%).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_a_five_yr_pct',
      value: aHpi ? aHpi.fiveYrCumPct : null,
      description: `${result.a.meta.name} FHFA HPI 5-year cumulative appreciation (%).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'hpi_state_b_five_yr_pct',
      value: bHpi ? bHpi.fiveYrCumPct : null,
      description: `${result.b.meta.name} FHFA HPI 5-year cumulative appreciation (%).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'five_yr_appreciation_spread_pp',
      value: result.fiveYrAppreciationSpreadPp,
      description:
        'Absolute spread between 5-year cumulative HPI appreciation rates in percentage points.',
    },
    {
      '@type': 'PropertyValue',
      name: 'case_shiller_national_month',
      value: result.caseShillerMonth,
      description:
        'S&P CoreLogic Case-Shiller national index observation month (monthly cadence, ~2-month lag).',
    },
    {
      '@type': 'PropertyValue',
      name: 'case_shiller_national_index',
      value: HPI_NATIONAL_CS_INDEX,
      description:
        'S&P CoreLogic Case-Shiller U.S. National HPI (CSUSHPISA, seasonally adjusted).',
    },
    {
      '@type': 'PropertyValue',
      name: 'case_shiller_national_yoy_pct',
      value: HPI_NATIONAL_CS_YOY_PCT,
      description: 'Case-Shiller national year-over-year change (%).',
    },
    {
      '@type': 'PropertyValue',
      name: 'state_median_home_value_a_usd',
      value: result.a.meta.medianHomePrice,
      description: `${result.a.meta.name} state median home value (Zillow ZHVI Apr 2025 anchor).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'state_median_home_value_b_usd',
      value: result.b.meta.medianHomePrice,
      description: `${result.b.meta.name} state median home value.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'home_value_spread_usd',
      value: result.homeValueSpreadUsd,
      description: 'Absolute spread in state median home values (USD).',
    },
    {
      '@type': 'PropertyValue',
      name: 'state_median_income_a_usd',
      value: result.a.meta.medianHouseholdIncome,
      description: `${result.a.meta.name} state median household income (Census ACS 2023 5-Year B19013).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'state_median_income_b_usd',
      value: result.b.meta.medianHouseholdIncome,
      description: `${result.b.meta.name} state median household income.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'price_to_income_ratio_a',
      value: result.a.pti?.ratio ?? null,
      description: `${result.a.meta.name} Demographia 5-band price-to-income ratio.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'price_to_income_ratio_b',
      value: result.b.pti?.ratio ?? null,
      description: `${result.b.meta.name} Demographia 5-band price-to-income ratio.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'price_to_income_tier_a',
      value: result.a.pti?.tier ?? null,
      description: `${result.a.meta.name} Demographia tier label.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'price_to_income_tier_b',
      value: result.b.pti?.tier ?? null,
      description: `${result.b.meta.name} Demographia tier label.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'price_to_income_spread',
      value: result.priceToIncomeSpread,
      description: 'Absolute PIR spread (ratio units).',
    },
    {
      '@type': 'PropertyValue',
      name: 'monthly_pi_a_usd',
      value: result.a.burden?.monthly ?? null,
      description: `${result.a.meta.name} monthly P&I at FRED MORTGAGE30US × 80% LTV × state median home (editorial estimate).`,
    },
    {
      '@type': 'PropertyValue',
      name: 'monthly_pi_b_usd',
      value: result.b.burden?.monthly ?? null,
      description: `${result.b.meta.name} monthly P&I.`,
    },
    {
      '@type': 'PropertyValue',
      name: 'monthly_burden_spread_usd',
      value: result.monthlyBurdenSpreadUsd,
      description: 'Absolute spread in monthly P&I burden (USD/mo).',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${result.a.meta.name} vs ${result.b.meta.name} — Home Price + FHFA HPI + Demographia PIR`,
    description:
      `State-pair cross-walk composing FHFA HPI quarterly state index ` +
      `(FRESH) + S&P CoreLogic Case-Shiller national monthly overlay ` +
      `(FRESH) + FHFA HPI 5-yr cumulative appreciation + Demographia ` +
      `5-band price-to-income tier + CFPB-anchored monthly P&I burden + ` +
      `appreciation-vs-affordability divergence cross-reference. The ` +
      `divergence read is the editorial-cross-reference signal keyed to ` +
      `the 4-layer data-honesty taxonomy.`,
    url: `https://${siteDomain}/compare/state/${result.slug}/`,
    isAccessibleForFree: true,
    inLanguage: 'en',
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    temporalCoverage: `${result.hpiQuarterDate}/..`,
    creator: creators,
    variableMeasured,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: `https://${siteDomain}/compare/state/${result.slug}/`,
    },
  };
}
