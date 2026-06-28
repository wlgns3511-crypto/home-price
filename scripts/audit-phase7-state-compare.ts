/**
 * Phase 7 Compare-Wrap post-build audit — homepricepeek state-pair compare.
 *
 * 8th Compare-Wrap pilot (2026-05-26) — homepricepeek introduces the
 * home-price anchor cluster (FHFA HPI state quarterly + S&P CoreLogic
 * Case-Shiller national monthly + Demographia 5-band PIR + CFPB monthly
 * burden + ACS-anchored income). Second pilot in the cohort with a
 * **freshness layer** (V2 = FHFA HPI + Case-Shiller auto-refreshes monthly
 * via scripts/sync-hpi.ts off FRED) — surfaces in the page header banner
 * and OG metadata (modifiedTime = HPI_STATE_QUARTER_DATE).
 *
 * Verifies `/compare/state/{slugs}/` surfaces against the wrap:
 *   - 6 case-conditional verdicts (state-hpi-quarterly-fresh /
 *     case-shiller-national-overlay / five-yr-cumulative-appreciation /
 *     price-to-income-tier / monthly-housing-burden /
 *     appreciation-vs-affordability-cross-reference)
 *   - 4-layer data-honesty taxonomy DEFINED in DATA_LAYER_LABEL map; verdicts
 *     surface 3 of the 4 layers (federal-aggregate × 3 / editorial-estimate ×
 *     2 / editorial-cross-reference × 1).
 *   - Federal-aggregate FHFA HPI (FRESH MONTHLY-quarterly) + Case-Shiller
 *     national (FRESH MONTHLY) + Demographia PIR + CFPB QM + Census ACS +
 *     FRED redistribution
 *   - Sibling cross-walk (5 bare-slug siblings: homeloanpeek + propertytaxpeek
 *     + wagepeek + netpaypeek + fairrentwize — all PROD-200 as of 2026-05-26)
 *
 *   - Trap #110     (≥4 distinct publisher TLDs surfaced — homepricepeek has 5)
 *   - Trap #112     (title.absolute ≤ 60c — layout suffix " | HomePricePeek" bypass)
 *   - Trap #105     (page.tsx schema wiring regex-visible)
 *   - Trap #117     (full Phase 7 standard ≥4 SOURCE_AUTHORITIES — homepricepeek
 *                    has 5 SOURCE total)
 *   - Trap #121     (middleware allowlist consistency + 404 soft-quarantine
 *                    + noindex on non-pilot — matches homeloanpeek 7th + netpaypeek
 *                    5th pattern, NOT 410 hard-kill, because homepricepeek has
 *                    no global /compare/* kill policy)
 *   - Trap #127     (dynamicParams = false on /compare/state/[slugs]/)
 *   - Freshness     (HPI auto-refresh wired: sync-hpi.ts present + page
 *                    revalidate set + openGraph.modifiedTime = HPI_STATE_QUARTER_DATE)
 *   - Decoder coverage: 6 verdicts emitted per pilot pair, non-null fields
 *   - Sitemap entries: 5 pilot canonicals present in Python gen-sitemap.py
 *   - Cross-walk: 5 verified siblings, no DNS-failed entries
 *
 * Audit-only — does not mutate any source file. Adapts homeloanpeek 7th's
 * `scripts/audit-phase7-state-compare.ts` (2026-05-26 precedent) for
 * homepricepeek-specific surfaces:
 *   - SOURCE_AUTHORITIES (5)
 *   - HPI-based verdict shape (hpi.currentIndex / pti.ratio / burden.monthly,
 *     not monthlyPiUsd / LLS / hmdaConv)
 *   - x-homepricepeek-edge-version header
 *   - Python sitemap (scripts/gen-sitemap.py, not build-sitemap.ts)
 *   - Freshness audit block (sync-hpi.ts + data/hpi-quarterly.json +
 *     HPI_STATE_QUARTER_DATE + revalidate=86400 + OG modifiedTime).
 *
 *   npx tsx scripts/audit-phase7-state-compare.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  STATE_PAIR_PILOT_SLUGS,
  isStatePairPilotSlug,
  decodeStatePair,
  composeStatePairTitle,
  HPI_STATE_QUARTER_DATE,
  HPI_NATIONAL_CS_INDEX,
} from '../lib/state-pair-compare-decoder';
import { SOURCE_AUTHORITIES } from '../lib/authorship';

const repoRoot = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(repoRoot, rel), 'utf-8');

const TITLE_MAX = 60;

console.log('=== homepricepeek Phase 7 Compare-Wrap post-build audit (state-pair) ===');
console.log();

let failures = 0;

// ─── Pilot allowlist self-consistency (decoder side) ────────────────────────
console.log('--- Pilot allowlist self-consistency (decoder side) ---');
console.log(`STATE_PAIR_PILOT_SLUGS count: ${STATE_PAIR_PILOT_SLUGS.length}`);
const slugConsistent = STATE_PAIR_PILOT_SLUGS.length === 5;
console.log(`length === 5:                 ${slugConsistent ? 'PASS' : 'FAIL'}`);
if (!slugConsistent) failures++;

const canonicalOrdered = STATE_PAIR_PILOT_SLUGS.every((s) => {
  const [a, b] = s.split('-vs-');
  return a < b;
});
console.log(`each canonical alphabetised:  ${canonicalOrdered ? 'PASS' : 'FAIL'}`);
if (!canonicalOrdered) failures++;

const slugsValid = STATE_PAIR_PILOT_SLUGS.every((s) => isStatePairPilotSlug(s));
console.log(`isStatePairPilotSlug all-yes: ${slugsValid ? 'PASS' : 'FAIL'}`);
if (!slugsValid) failures++;

STATE_PAIR_PILOT_SLUGS.forEach((s, i) => console.log(`  [${i}] ${s}`));
console.log();

// ─── Decoder coverage probe (6 verdicts + non-null housing fields) ─────────
interface PairProbe {
  canonical: string;
  stateA: string;
  stateB: string;
  caseCount: number;
  hpiA: number;
  hpiB: number;
  fiveYrSpread: number;
  pirSpread: number;
  burdenSpread: number;
  homeValueSpread: number;
  titleAbsolute: string;
  titleLen: number;
}

console.log('--- Decoder coverage (decodeStatePair per pair) ---');
const probes: PairProbe[] = [];
let coverageOk = 0;
for (const canonical of STATE_PAIR_PILOT_SLUGS) {
  const result = decodeStatePair(canonical);
  if (!result) {
    console.log(`  FAIL ${canonical}: decodeStatePair returned null`);
    failures++;
    continue;
  }
  const titleAbsolute = composeStatePairTitle(result.a.meta, result.b.meta);
  const titleLen = titleAbsolute.length;
  const hpiOk =
    !!result.a.hpi && !!result.b.hpi &&
    result.a.hpi.currentIndex > 0 && result.b.hpi.currentIndex > 0;
  const ptiOk =
    !!result.a.pti && !!result.b.pti &&
    result.a.pti.ratio > 0 && result.b.pti.ratio > 0;
  const burdenOk =
    !!result.a.burden && !!result.b.burden &&
    result.a.burden.monthly > 0 && result.b.burden.monthly > 0;
  const caseOk = result.verdicts.length === 6;
  if (hpiOk && ptiOk && burdenOk && caseOk) coverageOk++;
  console.log(
    `  ${hpiOk && ptiOk && burdenOk && caseOk ? 'PASS' : 'FAIL'} ${canonical} verdicts=${result.verdicts.length} HPI=${result.a.hpi?.currentIndex.toFixed(1)}↔${result.b.hpi?.currentIndex.toFixed(1)} PIR=${result.a.pti?.ratio.toFixed(2)}↔${result.b.pti?.ratio.toFixed(2)} 5yrSpread=${result.fiveYrAppreciationSpreadPp.toFixed(1)}pp PIRSpread=${result.priceToIncomeSpread.toFixed(2)} burdenSpread=$${result.monthlyBurdenSpreadUsd.toLocaleString()}/mo`,
  );
  probes.push({
    canonical,
    stateA: result.a.meta.name,
    stateB: result.b.meta.name,
    caseCount: result.verdicts.length,
    hpiA: result.a.hpi?.currentIndex ?? 0,
    hpiB: result.b.hpi?.currentIndex ?? 0,
    fiveYrSpread: result.fiveYrAppreciationSpreadPp,
    pirSpread: result.priceToIncomeSpread,
    burdenSpread: result.monthlyBurdenSpreadUsd,
    homeValueSpread: result.homeValueSpreadUsd,
    titleAbsolute,
    titleLen,
  });
}
console.log(`Decoder coverage: ${coverageOk}/${STATE_PAIR_PILOT_SLUGS.length} ${coverageOk === STATE_PAIR_PILOT_SLUGS.length ? 'PASS' : 'FAIL'}`);
if (coverageOk !== STATE_PAIR_PILOT_SLUGS.length) failures++;
console.log();

// ─── Per-pair verdict-shape probe — every verdict must carry data-layer label
console.log('--- Per-pair verdict data-layer surface ---');
const expectedLayers = new Set([
  'federal-aggregate',
  'editorial-estimate',
  'editorial-cross-reference',
]);
const firstPair = STATE_PAIR_PILOT_SLUGS[0];
const firstResult = decodeStatePair(firstPair)!;
const layersSeen = new Set(firstResult.verdicts.map((v) => v.layer));
console.log(`verdict count (first pair):   ${firstResult.verdicts.length}`);
console.log(`distinct dataLayer labels:    ${layersSeen.size}`);
for (const l of expectedLayers) {
  const ok = layersSeen.has(l as 'federal-aggregate');
  console.log(`  ${ok ? '✓' : '✗'} ${l}`);
}
const layersOk =
  [...expectedLayers].every((l) => layersSeen.has(l as 'federal-aggregate'));
console.log(`all 3 surfaced data layers present: ${layersOk ? 'PASS' : 'FAIL'}`);
if (!layersOk) failures++;
const hasFederalAggregate = firstResult.verdicts.some((v) => v.layer === 'federal-aggregate');
console.log(`has federal-aggregate verdict: ${hasFederalAggregate ? 'PASS' : 'FAIL'}`);
if (!hasFederalAggregate) failures++;
const hasEditorialCrossRef = firstResult.verdicts.some((v) => v.layer === 'editorial-cross-reference');
console.log(`has editorial-cross-reference verdict (5yr-HPI × PIR): ${hasEditorialCrossRef ? 'PASS' : 'FAIL'}`);
if (!hasEditorialCrossRef) failures++;
console.log();

// ─── Trap #112: title.absolute ≤ 60c for every pilot pair ───────────────────
console.log('--- Trap #112: title.absolute ≤ 60c ---');
let overBudget = 0;
probes.forEach((p) => {
  const status = p.titleLen <= TITLE_MAX ? 'OK' : 'OVER';
  if (p.titleLen > TITLE_MAX) overBudget++;
  console.log(`  [${String(p.titleLen).padStart(2)}c ${status}] ${p.canonical}`);
  console.log(`         "${p.titleAbsolute}"`);
});
const longest = probes.reduce<PairProbe | null>(
  (acc, p) => (acc === null || p.titleLen > acc.titleLen ? p : acc),
  null,
);
if (longest) {
  console.log(`Longest: ${longest.canonical} (${longest.titleLen}c)`);
}
console.log(
  `Trap #112: ${overBudget === 0 ? 'PASS' : 'FAIL'} (every title ≤${TITLE_MAX}c, ${overBudget} over budget)`,
);
if (overBudget > 0) failures++;
console.log();

// ─── Trap #117: SOURCE_AUTHORITIES (full Phase 7 standard) ──────────────────
console.log('--- Trap #117: SOURCE_AUTHORITIES count ---');
console.log(`SOURCE_AUTHORITIES: ${SOURCE_AUTHORITIES.length}`);
SOURCE_AUTHORITIES.forEach((s, i) => console.log(`  [${i}] ${s.name} (${s.url})`));
const sourceCountOk = SOURCE_AUTHORITIES.length >= 4;
console.log(`Trap #117: ${sourceCountOk ? 'PASS' : 'FAIL'} (≥4 DB-backing SOURCE — full Phase 7 standard)`);
if (!sourceCountOk) failures++;
console.log();

// ─── Trap #110: distinct publisher hosts across SOURCE ──────────────────────
console.log('--- Trap #110: distinct publisher hosts ---');
const hosts = new Set<string>();
for (const s of SOURCE_AUTHORITIES) {
  try {
    hosts.add(new URL(s.url).host);
  } catch {
    /* ignore */
  }
}
console.log(`Distinct hosts: ${hosts.size}`);
hosts.forEach((h) => console.log(`  · ${h}`));
const hostsOk = hosts.size >= 4;
console.log(`Trap #110: ${hostsOk ? 'PASS' : 'FAIL'} (≥4 distinct publisher hosts — homepricepeek baseline)`);
if (!hostsOk) failures++;
console.log();

// ─── Trap #105 / #127: page.tsx wiring regex visibility ─────────────────────
console.log('--- Trap #105 / #127: page.tsx wiring regex visibility ---');
const pageFile = read('app/compare/state/[slugs]/page.tsx');
const decoderImported =
  /from\s+['"]@\/lib\/state-pair-compare-decoder['"]/.test(pageFile) ||
  /from\s+['"]\.{1,2}\/.*state-pair-compare-decoder['"]/.test(pageFile);
const multiCreatorSchemaCall = /statePairCompareMultiCreatorDatasetSchema\s*\(/.test(pageFile);
const richMounted = /<StatePairCompareRich\b[\s\S]{0,200}result=\{result\}/.test(pageFile);
const bridgeMounted = /<StatePairCrossWalkBridge\b/.test(pageFile);
const titleAbsoluteUsed = /title:\s*\{\s*absolute:/.test(pageFile);
const dynamicParamsFalse = /export const dynamicParams = false/.test(pageFile);
const robotsIndexable = /robots:\s*\{\s*index:\s*true/.test(pageFile);

console.log(`page imports state-pair-compare-decoder:                ${decoderImported ? 'yes' : 'no'} ${decoderImported ? 'PASS' : 'FAIL'}`);
console.log(`page calls statePairCompareMultiCreatorDatasetSchema:   ${multiCreatorSchemaCall ? 'yes' : 'no'} ${multiCreatorSchemaCall ? 'PASS' : 'FAIL'}`);
console.log(`StatePairCompareRich mounted with result={result}:      ${richMounted ? 'yes' : 'no'} ${richMounted ? 'PASS' : 'FAIL'}`);
console.log(`StatePairCrossWalkBridge mounted:                       ${bridgeMounted ? 'yes' : 'no'} ${bridgeMounted ? 'PASS' : 'FAIL'}`);
console.log(`title.absolute pattern:                                 ${titleAbsoluteUsed ? 'yes' : 'no'} ${titleAbsoluteUsed ? 'PASS' : 'FAIL'}`);
console.log(`dynamicParams = false (Trap #127):                      ${dynamicParamsFalse ? 'yes' : 'no'} ${dynamicParamsFalse ? 'PASS' : 'FAIL'}`);
console.log(`robots: { index: true ... }:                            ${robotsIndexable ? 'yes' : 'no'} ${robotsIndexable ? 'PASS' : 'FAIL'}`);
const p105Ok =
  decoderImported &&
  multiCreatorSchemaCall &&
  richMounted &&
  bridgeMounted &&
  titleAbsoluteUsed &&
  dynamicParamsFalse &&
  robotsIndexable;
console.log(`Trap #105 / #127 / page wiring: ${p105Ok ? 'PASS' : 'FAIL'}`);
if (!p105Ok) failures++;
console.log();

// ─── StatePairCompareRich surface + 4 data-layer chip labels ────────────────
console.log('--- StatePairCompareRich surface + data-layer chip surface ---');
const richFile = read('components/StatePairCompareRich.tsx');
const layerLabelMap =
  /DATA_LAYER_LABEL\b/.test(richFile) &&
  /'federal-aggregate'/.test(richFile) &&
  /'editorial-estimate'/.test(richFile) &&
  /'cite-only-reference'/.test(richFile) &&
  /'editorial-cross-reference'/.test(richFile);
const hpiSurfaced = /hpi\.currentIndex|HPI_STATE_QUARTER/.test(richFile);
const ptiSurfaced = /pti\.ratio|pti\?\.ratio/.test(richFile);
const burdenSurfaced = /burden\.monthly|burden\?\.monthly/.test(richFile);
const medianHomeRendered = /medianHomePrice/.test(richFile);
const medianIncomeRendered = /medianHouseholdIncome/.test(richFile);
const fiveYrCumRendered = /fiveYrCumPct/.test(richFile);
const caseShillerSurfaced = /HPI_NATIONAL_CS_INDEX|HPI_NATIONAL_MONTH/.test(richFile);
const verdictRendered = /verdict\b|verdicts/.test(richFile);
const layerChipClass = /LAYER_CHIP_CLASS\b/.test(richFile);
console.log(`4-layer DATA_LAYER_LABEL map:    ${layerLabelMap ? 'yes' : 'no'} ${layerLabelMap ? 'PASS' : 'FAIL'}`);
console.log(`HPI currentIndex surfaced:       ${hpiSurfaced ? 'yes' : 'no'} ${hpiSurfaced ? 'PASS' : 'FAIL'}`);
console.log(`PIR ratio surfaced:              ${ptiSurfaced ? 'yes' : 'no'} ${ptiSurfaced ? 'PASS' : 'FAIL'}`);
console.log(`Monthly P&I burden surfaced:     ${burdenSurfaced ? 'yes' : 'no'} ${burdenSurfaced ? 'PASS' : 'FAIL'}`);
console.log(`medianHomePrice rendered:        ${medianHomeRendered ? 'yes' : 'no'} ${medianHomeRendered ? 'PASS' : 'FAIL'}`);
console.log(`medianHouseholdIncome rendered:  ${medianIncomeRendered ? 'yes' : 'no'} ${medianIncomeRendered ? 'PASS' : 'FAIL'}`);
console.log(`5-yr HPI cum rendered:           ${fiveYrCumRendered ? 'yes' : 'no'} ${fiveYrCumRendered ? 'PASS' : 'FAIL'}`);
console.log(`Case-Shiller anchor surfaced:    ${caseShillerSurfaced ? 'yes' : 'no'} ${caseShillerSurfaced ? 'PASS' : 'FAIL'}`);
console.log(`verdict iteration:               ${verdictRendered ? 'yes' : 'no'} ${verdictRendered ? 'PASS' : 'FAIL'}`);
console.log(`LAYER_CHIP_CLASS color map:      ${layerChipClass ? 'yes' : 'no'} ${layerChipClass ? 'PASS' : 'FAIL'}`);
const richOk =
  layerLabelMap &&
  hpiSurfaced &&
  ptiSurfaced &&
  burdenSurfaced &&
  medianHomeRendered &&
  medianIncomeRendered &&
  fiveYrCumRendered &&
  caseShillerSurfaced &&
  verdictRendered &&
  layerChipClass;
console.log(`Rich wrap surface: ${richOk ? 'PASS' : 'FAIL'}`);
if (!richOk) failures++;
console.log();

// ─── Trap #121: middleware allowlist consistency + 404 + noindex ────────────
console.log('--- Trap #121: middleware/sitemap allowlist consistency ---');
const middleware = read('middleware.ts');
const sitemap = read('scripts/gen-sitemap.py');
let middlewareOk = true;
let sitemapAllowlistOk = true;
for (const canonical of STATE_PAIR_PILOT_SLUGS) {
  if (!middleware.includes(canonical)) {
    middlewareOk = false;
    console.log(`  FAIL middleware: missing ${canonical}`);
  }
  if (!sitemap.includes(canonical)) {
    sitemapAllowlistOk = false;
    console.log(`  FAIL sitemap: missing ${canonical}`);
  }
}
console.log(`middleware contains all ${STATE_PAIR_PILOT_SLUGS.length} pilot canonicals: ${middlewareOk ? 'yes' : 'no'} ${middlewareOk ? 'PASS' : 'FAIL'}`);
console.log(`sitemap contains all pilot canonicals:    ${sitemapAllowlistOk ? 'yes' : 'no'} ${sitemapAllowlistOk ? 'PASS' : 'FAIL'}`);
const stateCompareRegexPresent = /COMPARE_STATE_DETAIL_RE\b|COMPARE_STATE_ALLOWLIST\b/.test(middleware);
console.log(`middleware exports COMPARE_STATE_* gate: ${stateCompareRegexPresent ? 'yes' : 'no'} ${stateCompareRegexPresent ? 'PASS' : 'FAIL'}`);
const status404Present = /status:\s*404/.test(middleware);
const noindexPresent = /X-Robots-Tag[\s\S]{0,80}noindex/.test(middleware);
console.log(`middleware returns 404 for non-pilot:    ${status404Present ? 'yes' : 'no'} ${status404Present ? 'PASS' : 'FAIL'}`);
console.log(`middleware stamps noindex on non-pilot:  ${noindexPresent ? 'yes' : 'no'} ${noindexPresent ? 'PASS' : 'FAIL'}`);
const edgeVersionPresent = /x-homepricepeek-edge-version|EDGE_VERSION/.test(middleware);
console.log(`middleware stamps homepricepeek edge-version: ${edgeVersionPresent ? 'yes' : 'no'} ${edgeVersionPresent ? 'PASS' : 'FAIL'}`);
const t121Ok = middlewareOk && sitemapAllowlistOk && stateCompareRegexPresent && status404Present && noindexPresent && edgeVersionPresent;
console.log(`Trap #121: ${t121Ok ? 'PASS' : 'FAIL'}`);
if (!t121Ok) failures++;
console.log();

// ─── Cross-walk bridge: 5 verified siblings + bare-slug URL strategy ────────
console.log('--- Cross-walk bridge: sibling count + URL strategies ---');
const bridge = read('components/StatePairCrossWalkBridge.tsx');
const siblingDomains = bridge.match(/domain:\s*'([a-z]+(?:peek|wize)\.com)'/g) ?? [];
const uniqueSiblings = new Set(siblingDomains.map((m) => m.replace(/domain:\s*'/, '').replace(/'$/, '')));
console.log(`Sibling domain count: ${uniqueSiblings.size}`);
uniqueSiblings.forEach((h) => console.log(`  · ${h}`));
const siblingCountOk = uniqueSiblings.size === 5;
console.log(`Sibling count == 5: ${siblingCountOk ? 'PASS' : 'FAIL'}`);
if (!siblingCountOk) failures++;
// Forbidden hosts: DNS-failed / 404'd / probe-failed entries from prior
// 2026-05-25 + 2026-05-26 curl probes across the cluster.
const FORBIDDEN_HOSTS = ['medicarewize.com', 'insuresmartpick.com', 'sunpowerpeek.com'];
let dnsCleanedOk = true;
for (const f of FORBIDDEN_HOSTS) {
  if (uniqueSiblings.has(f) || (bridge.includes(`'${f}'`) && !bridge.includes(`// ${f}`))) {
    console.log(`  FAIL forbidden sibling present: ${f}`);
    dnsCleanedOk = false;
  }
}
console.log(`No DNS-failed sibling re-introduced: ${dnsCleanedOk ? 'PASS' : 'FAIL'}`);
if (!dnsCleanedOk) failures++;
const bareSlugPatternA = /href=\{`https:\/\/\$\{site\.domain\}\/state\/\$\{a\.slug\}/.test(bridge);
const bareSlugPatternB = /href=\{`https:\/\/\$\{site\.domain\}\/state\/\$\{b\.slug\}/.test(bridge);
console.log(`A-state bare-slug URL pattern present: ${bareSlugPatternA ? 'yes' : 'no'} ${bareSlugPatternA ? 'PASS' : 'FAIL'}`);
console.log(`B-state bare-slug URL pattern present: ${bareSlugPatternB ? 'yes' : 'no'} ${bareSlugPatternB ? 'PASS' : 'FAIL'}`);
const bareOk = bareSlugPatternA && bareSlugPatternB;
if (!bareOk) failures++;
console.log();

// ─── Sitemap: pilot pair entries present (Python sitemap) ───────────────────
console.log('--- Sitemap: pilot pair entries (gen-sitemap.py) ---');
const sitemapStateCompareUrlPattern = /\/compare\/state\/\{pair_slug\}\/|\/compare\/state\/.*-vs-/.test(sitemap);
console.log(`/compare/state/{slug}/ URL pattern:    ${sitemapStateCompareUrlPattern ? 'yes' : 'no'} ${sitemapStateCompareUrlPattern ? 'PASS' : 'FAIL'}`);
const sitemapReadsHpiData = /HPI_PATH|hpi-quarterly\.json|stateQuarterDate/.test(sitemap);
console.log(`Sitemap pulls lastmod from HPI JSON:    ${sitemapReadsHpiData ? 'yes' : 'no'} ${sitemapReadsHpiData ? 'PASS' : 'FAIL'}`);
const sitemapOkBlock = sitemapAllowlistOk && sitemapStateCompareUrlPattern && sitemapReadsHpiData;
console.log(`Sitemap block: ${sitemapOkBlock ? 'PASS' : 'FAIL'}`);
if (!sitemapOkBlock) failures++;
console.log();

// ─── Freshness layer: HPI auto-refresh wiring (homepricepeek-unique) ────────
console.log('--- Freshness layer: HPI auto-refresh wiring ---');
const syncScriptExists = existsSync(path.join(repoRoot, 'scripts/sync-hpi.ts'));
console.log(`scripts/sync-hpi.ts present:            ${syncScriptExists ? 'yes' : 'no'} ${syncScriptExists ? 'PASS' : 'FAIL'}`);
if (!syncScriptExists) failures++;
const hpiDataExists = existsSync(path.join(repoRoot, 'data/hpi-quarterly.json'));
console.log(`data/hpi-quarterly.json present:        ${hpiDataExists ? 'yes' : 'no'} ${hpiDataExists ? 'PASS' : 'FAIL'}`);
if (!hpiDataExists) failures++;
const hpiDateLooksFresh = /^20\d{2}-\d{2}-\d{2}$/.test(HPI_STATE_QUARTER_DATE);
console.log(`HPI_STATE_QUARTER_DATE ISO format:      ${hpiDateLooksFresh ? 'yes' : 'no'} (${HPI_STATE_QUARTER_DATE}) ${hpiDateLooksFresh ? 'PASS' : 'FAIL'}`);
if (!hpiDateLooksFresh) failures++;
const csIndexInRange = HPI_NATIONAL_CS_INDEX > 100 && HPI_NATIONAL_CS_INDEX < 600;
console.log(`Case-Shiller index plausible range:     ${csIndexInRange ? 'yes' : 'no'} (${HPI_NATIONAL_CS_INDEX.toFixed(2)}) ${csIndexInRange ? 'PASS' : 'FAIL'}`);
if (!csIndexInRange) failures++;
const pageHasRevalidate = /export const revalidate\s*=\s*86400/.test(pageFile);
console.log(`page revalidate = 86400 (24h ISR):      ${pageHasRevalidate ? 'yes' : 'no'} ${pageHasRevalidate ? 'PASS' : 'FAIL'}`);
if (!pageHasRevalidate) failures++;
const pageHasModifiedTime = /modifiedTime:\s*HPI_STATE_QUARTER_DATE/.test(pageFile);
console.log(`OG modifiedTime = HPI_STATE_QUARTER_DATE:${pageHasModifiedTime ? 'yes' : 'no'} ${pageHasModifiedTime ? 'PASS' : 'FAIL'}`);
if (!pageHasModifiedTime) failures++;
const syncScript = syncScriptExists ? read('scripts/sync-hpi.ts') : '';
const syncFetchesFred = /STHPI|CSUSHPISA|fredgraph\.csv/.test(syncScript);
console.log(`sync-hpi.ts fetches FRED STHPI/CSUSHPISA: ${syncFetchesFred ? 'yes' : 'no'} ${syncFetchesFred ? 'PASS' : 'FAIL'}`);
if (!syncFetchesFred) failures++;
console.log();

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('=== homepricepeek Phase 7 Compare-Wrap audit summary ===');
console.log(`       Trap failures: ${failures}`);
console.log(failures === 0 ? '✓ ALL CHECKS PASSED' : `✗ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
