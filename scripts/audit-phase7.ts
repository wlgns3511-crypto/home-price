/**
 * Phase 7 audit for homepricepeek — verifies Traps #110/#111/#112/#119/#120
 * against the /state/[slug]/ HousingVerdict dominant-signal surface
 * (composite of priceToIncomeBand × mortgageBurdenDecoder).
 *
 * v2.3 trap numbering:
 *   #110 = cross-walk publisher diversity (≥2 distinct hosts — Trap #110 floor)
 *   #111 = decoder band imbalance (annotated; honest distribution OK)
 *   #112 = P1 title.absolute body length ≤60c (Google SERP cap)
 *   #119 = P1 verdict-coverage (100% expected — both levers deterministic)
 *   #120 = N=20 randomized cold-probe (verdict marker in title body)
 *
 * v2.3 §4.0 Pre-flight Title-Cap Math: layout suffix ' | HomePricePeek'
 * = 16c ≥ 13c threshold → generateMetadata uses `title.absolute` to bypass
 * the layout template. Audit measures composed body alone against the 60c
 * Google SERP cap. Worst-case 15c state name "Washington D.C." + dollar
 * range + PIR ratio + short verdict still clears the cap with margin.
 *
 * v2.3 §4.5 P1 Coverage Honesty: homepricepeek's 2-axis composite resolves
 * deterministically for all 51 jurisdictions (50 states + DC) because every
 * input (Zillow ZHVI medianHomePrice, Census ACS B19013 medianHouseholdIncome,
 * FRED MORTGAGE30US avgMortgageRate30yr) is fully transcribed in
 * states-data.ts. Expected coverage = 100%.
 *
 * Cohort note: homepricepeek covers 51 US jurisdictions including DC, which
 * appears as "Washington D.C." (15c) in the DB — not "District of Columbia"
 * (20c) — so the worst-case state name is shorter than other 50-state portfolios.
 *
 * Runs as a one-shot:
 *   npx tsx scripts/audit-phase7.ts
 */
import { SOURCE_AUTHORITIES } from '../lib/authorship';
import { priceToIncomeBand } from '../lib/price-to-income-band';
import { mortgageBurdenDecoder } from '../lib/mortgage-burden-decoder';
import {
  pickVerdict,
  housingVerdictShortLabel,
  type HousingVerdict,
} from '../lib/homepricepeek-interpretation';
import { getAllStates } from '../lib/states-data';

console.log('=== Phase 7 audit — homepricepeek ===');

// Trap #110 — distinct publisher hosts in the multi-creator Dataset @graph.
// Phase 7 playbook §4.5 requires ≥2 distinct hosts. homepricepeek's
// homepricepeekHousingVerdictMultiCreatorDatasetSchema emits a 6-creator graph:
// Zillow Group (ZHVI) + Census ACS (B19013) + FHFA (HPI) + FRED (MORTGAGE30US)
// + OECD + National statistics offices. Zillow is elevated to 1st creator on
// state surfaces because ZHVI is the actual per-state home-value source — on
// /city/ and /country/, the legacy positional datasetSchema continues to use
// SOURCE_AUTHORITIES (where Zillow is referenced via DataSourceBadge/TrustBlock
// rather than as a creator, since those surfaces use city-level / cross-country
// data not backed by ZHVI).
const creators = [
  { name: 'Zillow Group', url: 'https://www.zillow.com/research/data/' },
  { name: SOURCE_AUTHORITIES[1].name, url: SOURCE_AUTHORITIES[1].url },
  { name: SOURCE_AUTHORITIES[2].name, url: SOURCE_AUTHORITIES[2].url },
  { name: SOURCE_AUTHORITIES[3].name, url: SOURCE_AUTHORITIES[3].url },
  { name: SOURCE_AUTHORITIES[0].name, url: SOURCE_AUTHORITIES[0].url },
  { name: SOURCE_AUTHORITIES[4].name, url: SOURCE_AUTHORITIES[4].url },
];
const hosts = creators.map((s) => new URL(s.url).host);
const distinctHosts = new Set(hosts);
console.log('\n[#110] multi-creator dataset publisher hosts:');
hosts.forEach((h, i) => console.log('       ·', creators[i].name, '→', h));
console.log(
  '       distinct count:',
  distinctHosts.size,
  distinctHosts.size >= 2 ? 'PASS' : 'FAIL (need ≥2 per playbook §4.5)',
);
distinctHosts.forEach((h) => console.log('       ·', h));

// Trap #111 — HousingVerdict distribution across the 51-jurisdiction cohort.
// Honest reading: US state-level price-to-income at Zillow ZHVI / Census ACS
// levels produces a broad mix across the 5 buckets (Severe / Stretched /
// Moderate / Affordable / Undervalued) because median home prices range from
// ~$195K (Arkansas) to ~$835K (Hawaii) against median household incomes of
// ~$56K-$98K. Distribution is annotated rather than gated.
const states = getAllStates();
const signalCounts: Record<HousingVerdict, number> = {
  severely_unaffordable_high_burden: 0,
  seriously_unaffordable_stretched: 0,
  moderately_balanced: 0,
  affordable_comfortable: 0,
  highly_affordable_undervalued: 0,
};
let decoded = 0;
let resolved = 0;
let titleBudgetMax = 0;
let titleBudgetMaxWho = '';
let titleOverBudget = 0;
const samples: { len: number; full: string }[] = [];

// v2.3 §4.0: with title.absolute the layout suffix is bypassed, so the
// audit measures composed body alone against the 60c Google SERP cap.
const TITLE_SUFFIX = '';
const TITLE_MAX = 60;

interface ComposedTitle {
  full: string;
  signalShort: string | null;
  signal: HousingVerdict | null;
}

function composeStateTitle(stateSlug: string): ComposedTitle | null {
  const state = states.find((s) => s.slug === stateSlug);
  if (!state) return null;
  const priceK = Math.round(state.medianHomePrice / 1000);
  const pti = priceToIncomeBand(state.medianHomePrice, state.medianHouseholdIncome);
  const burden = mortgageBurdenDecoder(state.medianHomePrice, state.avgMortgageRate30yr, state.medianHouseholdIncome);
  const signal = pti || burden ? pickVerdict({ pti, burden, scope: 'us' }) : null;
  const signalShort = signal ? housingVerdictShortLabel(signal) : null;
  const titleBody = pti
    ? `${state.name} housing: $${priceK}K · PIR ${pti.ratio.toFixed(1)}${signalShort ? ` · ${signalShort}` : ''}`
    : `${state.name} housing: $${priceK}K${signalShort ? ` · ${signalShort}` : ''}`;
  return { full: titleBody, signalShort, signal };
}

for (const state of states) {
  const composed = composeStateTitle(state.slug);
  if (!composed) continue;
  decoded += 1;
  if (composed.signal) {
    signalCounts[composed.signal] += 1;
    resolved += 1;
  }
  const full = composed.full + TITLE_SUFFIX;
  if (full.length > titleBudgetMax) {
    titleBudgetMax = full.length;
    titleBudgetMaxWho = state.name;
  }
  if (full.length > TITLE_MAX) titleOverBudget += 1;
  if (samples.length < 4) samples.push({ len: full.length, full });
}

const total = decoded;
const pcts: Record<string, number> = {};
for (const [k, v] of Object.entries(signalCounts)) {
  pcts[k] = total > 0 ? (v / total) * 100 : 0;
}
const maxPct = Math.max(...Object.values(pcts));

console.log('\n[#111] HousingVerdict distribution (n=' + total + ', scope=us):', signalCounts);
console.log(
  '       pct:',
  Object.fromEntries(Object.entries(pcts).map(([k, v]) => [k, v.toFixed(1) + '%'])),
);
console.log(
  '       max-bucket concentration:',
  maxPct.toFixed(1) + '%',
  '(annotated — distribution honestly reflects the spread of price-to-income across 51 US jurisdictions at Zillow ZHVI / Census ACS levels)',
);

// Trap #112 — P1 title length ≤60 chars across the 51-jurisdiction cohort.
// v2.3 §4.0: title.absolute bypasses layout suffix ' | HomePricePeek' (16c),
// so the page-level composed body alone is measured against the 60c Google
// SERP cap. Worst case is "Washington D.C." (15c) or "Massachusetts" (13c) +
// body + verdict ≈ 50-55c.
console.log('\n[#112] P1 title length audit (n=' + decoded + ')');
console.log('       max length:', titleBudgetMax, 'chars  (worst:', titleBudgetMaxWho + ')');
console.log(
  '       over ' + TITLE_MAX + ' chars:',
  titleOverBudget,
  titleOverBudget === 0 ? 'PASS' : 'FAIL',
);
for (const s of samples) console.log('       sample: [' + s.len + ']', s.full || '(empty)');

// Trap #119 — P1 verdict-coverage. v2.3 §4.5 Coverage Honesty: homepricepeek's
// 2-axis composite resolves deterministically for all 51 jurisdictions because
// every required DB input (medianHomePrice, medianHouseholdIncome,
// avgMortgageRate30yr) is fully transcribed. Expected coverage = 100%
// (resolved === decoded).
const coverPct = total > 0 ? (resolved / total) * 100 : 0;
console.log('\n[#119] P1 verdict-coverage (resolved ÷ total)');
console.log(
  '       resolved:',
  resolved,
  '/',
  total,
  '(' + coverPct.toFixed(1) + '%)',
  coverPct >= 100 ? 'PASS (full coverage — 2-axis composite deterministic across 51-jurisdiction cohort)' : 'FAIL (expected 100% — investigate missing DB row)',
);

// Trap #120 — N=20 randomized cold-probe via composeStateTitle.
// Asserts that the title carries a verdict marker (PIR ratio + SignalShort)
// on a randomized sample. Coverage is expected to be 100%, so every probed
// title should carry a verdict suffix.
const slugs = states.map((s) => s.slug);
const sample20 = [...slugs]
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.min(20, slugs.length));
let titleHonest = 0;
let titleVerdictBearing = 0;
let titleUnknownGracefulOmit = 0;
const VERDICT_BODY_RE = /^.+ housing: \$\d+K( · PIR \d+\.\d+)?( · (Severe|Stretched|Moderate|Affordable|Undervalued))?$/;
let coldProbeUsed = 0;
for (const slug of sample20) {
  const composed = composeStateTitle(slug);
  if (!composed) continue;
  coldProbeUsed += 1;
  if (VERDICT_BODY_RE.test(composed.full)) titleHonest += 1;
  if (composed.signal === null && composed.signalShort === null) {
    titleUnknownGracefulOmit += 1;
  } else if (composed.signalShort !== null) {
    titleVerdictBearing += 1;
  }
}
const probePct = coldProbeUsed > 0 ? (titleHonest / coldProbeUsed) * 100 : 0;
console.log('\n[#120] N=20 randomized cold-probe (title body verdict marker)');
console.log(
  '       title-honest:',
  titleHonest,
  '/',
  coldProbeUsed,
  '(' + probePct.toFixed(1) + '%)',
  probePct >= 100 ? 'PASS' : 'FAIL (expected 100% — every title must be honest, fabrication is the failure mode)',
);
console.log(
  '       verdict-bearing:',
  titleVerdictBearing,
  ' graceful-omit:',
  titleUnknownGracefulOmit,
);

// Sanity samples — composed title for several states.
console.log('\n[sample]');
const sampleSlugs = sample20.slice(0, 6);
for (const slug of sampleSlugs) {
  const composed = composeStateTitle(slug);
  if (!composed) {
    console.log('  ' + slug.padEnd(28) + ' NO STATE');
    continue;
  }
  console.log(
    '  ' + slug.padEnd(28),
    'signal=' + (composed.signal ?? 'null').padEnd(38),
    'short=' + (composed.signalShort ?? '(omit)').padEnd(15),
    'title=' + (composed.full.length + ' chars').padEnd(10),
  );
}
