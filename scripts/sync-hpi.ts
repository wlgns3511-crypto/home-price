#!/usr/bin/env tsx
/**
 * Sync FRED-redistributed HPI series → data/hpi-quarterly.json.
 *
 * Two anchor layers:
 *   1. State quarterly — FHFA HPI all-transactions, 51 series keyed
 *      `{CODE}STHPI` (CASTHPI, TXSTHPI, DCSTHPI, ...). Quarterly, indexed
 *      1980 Q1 = 100, published ~2 months after quarter end.
 *   2. National monthly overlay — S&P/Case-Shiller `CSUSHPISA` U.S.
 *      National Home Price Index, seasonally adjusted, monthly. Both
 *      states in any pair share this national figure; it carries the
 *      "what's the broader market doing" frame.
 *
 * Anonymous CSV endpoint (no API key):
 *   https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES}
 *
 * Output shape:
 *   { vintage, fetchedAt, source, sourceUrl, methodology,
 *     fredSeriesIds: { stateStHpiPattern, nationalCaseShiller },
 *     current: { stateQuarterDate, stateQuarterLabel,
 *                nationalMonth, nationalCsIndex, nationalCsYoyPct },
 *     states: { [slug]: { code, currentIndex, yoyPct, fiveYrCumPct,
 *                          tenYrCumPct, history } } }
 *
 * Freshness anchor: FHFA state quarterly publishes late February (Q4) /
 * late May (Q1) / late August (Q2) / late November (Q3). Case-Shiller
 * national publishes the last Tuesday of each month for data ~2 months
 * back. Scheduler runs monthly to keep the national overlay in sync;
 * state quarterly only changes 4× per year so monthly cadence is
 * over-refresh insurance (idempotent).
 *
 * Source attribution: FHFA HPI all-transactions (state) is published by
 * the U.S. Federal Housing Finance Agency. CSUSHPISA is the S&P
 * CoreLogic Case-Shiller U.S. National Home Price Index. FRED is the
 * redistributor — per feedback-source-authorities-honest-20260506 the
 * publishers (FHFA, S&P/CoreLogic) stay in SOURCE_AUTHORITIES; FRED is
 * cited in body only.
 */

import { resolve } from 'path';
import { writeFileSync } from 'fs';

const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'data/hpi-quarterly.json');
const FRED_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';
const HISTORY_QUARTERS = 12; // 3 years of quarterly readings

const STATE_CODES: ReadonlyArray<{ slug: string; code: string }> = [
  { slug: 'alabama',         code: 'AL' },
  { slug: 'alaska',          code: 'AK' },
  { slug: 'arizona',         code: 'AZ' },
  { slug: 'arkansas',        code: 'AR' },
  { slug: 'california',      code: 'CA' },
  { slug: 'colorado',        code: 'CO' },
  { slug: 'connecticut',     code: 'CT' },
  { slug: 'delaware',        code: 'DE' },
  { slug: 'florida',         code: 'FL' },
  { slug: 'georgia',         code: 'GA' },
  { slug: 'hawaii',          code: 'HI' },
  { slug: 'idaho',           code: 'ID' },
  { slug: 'illinois',        code: 'IL' },
  { slug: 'indiana',         code: 'IN' },
  { slug: 'iowa',            code: 'IA' },
  { slug: 'kansas',          code: 'KS' },
  { slug: 'kentucky',        code: 'KY' },
  { slug: 'louisiana',       code: 'LA' },
  { slug: 'maine',           code: 'ME' },
  { slug: 'maryland',        code: 'MD' },
  { slug: 'massachusetts',   code: 'MA' },
  { slug: 'michigan',        code: 'MI' },
  { slug: 'minnesota',       code: 'MN' },
  { slug: 'mississippi',     code: 'MS' },
  { slug: 'missouri',        code: 'MO' },
  { slug: 'montana',         code: 'MT' },
  { slug: 'nebraska',        code: 'NE' },
  { slug: 'nevada',          code: 'NV' },
  { slug: 'new-hampshire',   code: 'NH' },
  { slug: 'new-jersey',      code: 'NJ' },
  { slug: 'new-mexico',      code: 'NM' },
  { slug: 'new-york',        code: 'NY' },
  { slug: 'north-carolina',  code: 'NC' },
  { slug: 'north-dakota',    code: 'ND' },
  { slug: 'ohio',            code: 'OH' },
  { slug: 'oklahoma',        code: 'OK' },
  { slug: 'oregon',          code: 'OR' },
  { slug: 'pennsylvania',    code: 'PA' },
  { slug: 'rhode-island',    code: 'RI' },
  { slug: 'south-carolina',  code: 'SC' },
  { slug: 'south-dakota',    code: 'SD' },
  { slug: 'tennessee',       code: 'TN' },
  { slug: 'texas',           code: 'TX' },
  { slug: 'utah',            code: 'UT' },
  { slug: 'vermont',         code: 'VT' },
  { slug: 'virginia',        code: 'VA' },
  { slug: 'washington',      code: 'WA' },
  { slug: 'washington-dc',   code: 'DC' },
  { slug: 'west-virginia',   code: 'WV' },
  { slug: 'wisconsin',       code: 'WI' },
  { slug: 'wyoming',         code: 'WY' },
];

interface CsvRow {
  date: string; // ISO YYYY-MM-DD
  value: number;
}

async function fetchSeries(seriesId: string): Promise<CsvRow[]> {
  const url = `${FRED_BASE}?id=${seriesId}`;
  const res = await fetch(url, { headers: { Accept: 'text/csv' } });
  if (!res.ok) {
    throw new Error(`[hpi-sync] FRED ${seriesId} HTTP ${res.status}`);
  }
  const text = await res.text();
  const lines = text.trim().split('\n');
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, raw] = lines[i].split(',');
    if (!date || !raw || raw === '.') continue;
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) continue;
    rows.push({ date, value });
  }
  return rows;
}

function quarterLabel(isoDate: string): string {
  // FRED stamps quarterly observations on the first day of the quarter
  // (Jan/Apr/Jul/Oct). Convert to "Q1 2026" form.
  const [y, m] = isoDate.split('-');
  const month = parseInt(m, 10);
  const q = Math.floor((month - 1) / 3) + 1;
  return `Q${q} ${y}`;
}

function findRowAtOffset(rows: CsvRow[], quartersBack: number): CsvRow | null {
  if (rows.length === 0) return null;
  const idx = rows.length - 1 - quartersBack;
  if (idx < 0) return null;
  return rows[idx];
}

function pctChange(current: number, base: number): number {
  if (!Number.isFinite(base) || base <= 0) return 0;
  return ((current - base) / base) * 100;
}

interface StateOut {
  code: string;
  currentIndex: number;
  yoyPct: number;
  fiveYrCumPct: number;
  tenYrCumPct: number;
  history: { quarterDate: string; quarterLabel: string; index: number }[];
}

async function main() {
  // Sequential to be polite to FRED (52 series back-to-back is fine but
  // keeps load predictable).
  const stateRows: { slug: string; code: string; rows: CsvRow[] }[] = [];
  for (const s of STATE_CODES) {
    const seriesId = `${s.code}STHPI`;
    const rows = await fetchSeries(seriesId);
    if (rows.length === 0) {
      throw new Error(`[hpi-sync] empty series ${seriesId}`);
    }
    stateRows.push({ slug: s.slug, code: s.code, rows });
  }

  const nationalCs = await fetchSeries('CSUSHPISA');
  if (nationalCs.length === 0) {
    throw new Error('[hpi-sync] empty CSUSHPISA series');
  }

  // Build per-state output payload.
  const states: Record<string, StateOut> = {};
  for (const sr of stateRows) {
    const current = sr.rows[sr.rows.length - 1];
    // YoY = 4 quarters back. 5-yr = 20. 10-yr = 40.
    const yoyBase = findRowAtOffset(sr.rows, 4);
    const fiveYrBase = findRowAtOffset(sr.rows, 20);
    const tenYrBase = findRowAtOffset(sr.rows, 40);

    const tail = sr.rows.slice(-HISTORY_QUARTERS);
    const history = tail.map((r) => ({
      quarterDate: r.date,
      quarterLabel: quarterLabel(r.date),
      index: Math.round(r.value * 100) / 100,
    }));

    states[sr.slug] = {
      code: sr.code,
      currentIndex: Math.round(current.value * 100) / 100,
      yoyPct: yoyBase
        ? Math.round(pctChange(current.value, yoyBase.value) * 10) / 10
        : 0,
      fiveYrCumPct: fiveYrBase
        ? Math.round(pctChange(current.value, fiveYrBase.value) * 10) / 10
        : 0,
      tenYrCumPct: tenYrBase
        ? Math.round(pctChange(current.value, tenYrBase.value) * 10) / 10
        : 0,
      history,
    };
  }

  // Anchor the "current quarter" off the first state — all 51 series share
  // a single publication cadence, so all stateQuarterDates are equal.
  const firstSlug = stateRows[0].slug;
  const firstCurrent = stateRows[0].rows[stateRows[0].rows.length - 1];
  const stateQuarterDate = firstCurrent.date;
  const stateQuarterLabel = quarterLabel(stateQuarterDate);

  // Verify all 51 states agreed on the quarter (catch FRED partial-update
  // edge cases).
  for (const sr of stateRows) {
    const tail = sr.rows[sr.rows.length - 1];
    if (tail.date !== stateQuarterDate) {
      console.warn(
        `[hpi-sync] WARN: ${sr.slug} latest quarter ${tail.date} ≠ anchor ${stateQuarterDate}`,
      );
    }
  }

  // National Case-Shiller current + 12 months back for YoY.
  const csCurrent = nationalCs[nationalCs.length - 1];
  const csYoyIdx = nationalCs.length - 1 - 12;
  const csYoyBase = csYoyIdx >= 0 ? nationalCs[csYoyIdx] : null;
  const nationalCsYoyPct = csYoyBase
    ? Math.round(pctChange(csCurrent.value, csYoyBase.value) * 10) / 10
    : 0;

  const payload = {
    vintage: stateQuarterDate,
    fetchedAt: new Date().toISOString(),
    source:
      'FHFA House Price Index (state, all-transactions) · S&P CoreLogic Case-Shiller U.S. National HPI · redistributed by FRED',
    sourceUrl: 'https://fred.stlouisfed.org/release?rid=308',
    methodology:
      'State series = FHFA HPI all-transactions index, quarterly cadence ' +
      '(1980 Q1 = 100), one observation per state including DC. National ' +
      'overlay = S&P CoreLogic Case-Shiller CSUSHPISA, monthly seasonally ' +
      'adjusted national index. YoY = current quarter vs 4 quarters prior. ' +
      'Five-year cumulative = current vs 20 quarters prior (10-yr = 40). ' +
      'FHFA state HPI is purchase-only repeat-sales; methodology differs ' +
      'from Case-Shiller (which is national, monthly, and includes a ' +
      'larger metro-weighted basket) — the two are not directly comparable ' +
      'in level, only in directional sign. The pair pages disclose this ' +
      'explicitly: the state quarterly anchor is the FHFA repeat-sales ' +
      'index; Case-Shiller is shown as the national context overlay.',
    fredSeriesIds: {
      stateStHpiPattern: '{CODE}STHPI (51 series, e.g., CASTHPI, TXSTHPI, DCSTHPI)',
      nationalCaseShiller: 'CSUSHPISA',
    },
    current: {
      stateQuarterDate,
      stateQuarterLabel,
      nationalMonth: csCurrent.date,
      nationalCsIndex: Math.round(csCurrent.value * 100) / 100,
      nationalCsYoyPct,
    },
    states,
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2));

  const sampleSlugs = ['california', 'texas', 'massachusetts', 'new-hampshire'];
  const samples = sampleSlugs
    .map((slug) => {
      const s = states[slug];
      if (!s) return `${slug}=?`;
      return `${slug}=${s.currentIndex}(${s.yoyPct >= 0 ? '+' : ''}${s.yoyPct}%YoY)`;
    })
    .join(' ');
  console.log(
    `[hpi-sync] wrote ${OUT} (state ${stateQuarterLabel} / national ${csCurrent.date} ${csCurrent.value} ${nationalCsYoyPct >= 0 ? '+' : ''}${nationalCsYoyPct}%YoY, ${Object.keys(states).length} states, samples: ${samples})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
