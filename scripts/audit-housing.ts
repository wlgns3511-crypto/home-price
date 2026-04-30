/**
 * audit-housing.ts — homepricepeek Financial-YMYL audit gate.
 *
 * Walks .next/server/app/state/, parses each rendered state page, and reports
 * any page that fails the homepricepeek thin-page-escape thresholds OR contains
 * banned investment-advice phrasing.
 *
 * Thin-page thresholds (housing depth tier):
 *   - words >= 1200 (Financial YMYL — stricter than dictionary site)
 *   - h2 >= 6
 *   - faq >= 5 (<details> blocks or FAQPage JSON-LD)
 *   - internal links >= 8
 *
 * YMYL phrase blacklist (case-insensitive, word boundaries):
 *   - "buy now", "buy today", "good time to buy", "hot market"
 *   - "don't wait", "act now"
 *   - "guaranteed return", "will rise", "will fall", "will appreciate"
 *   - "investment opportunity", "best investment"
 *   - "should buy", "should sell"
 *
 * Usage:
 *   npx tsx scripts/audit-housing.ts            # report-only
 *   npx tsx scripts/audit-housing.ts --gate     # exit 1 on failure
 *   npx tsx scripts/audit-housing.ts --verbose
 */

import fs from 'node:fs';
import path from 'node:path';

const APP_OUTPUT = path.join(process.cwd(), '.next', 'server', 'app');

const THRESHOLDS = {
  words: 1200,
  h2: 6,
  faq: 5,
  internalLinks: 8,
};

const BANNED_PHRASES: { phrase: string; re: RegExp }[] = [
  { phrase: 'buy now', re: /\bbuy\s+now\b/i },
  { phrase: 'buy today', re: /\bbuy\s+today\b/i },
  { phrase: 'good time to buy', re: /\bgood\s+time\s+to\s+buy\b/i },
  { phrase: 'hot market', re: /\bhot\s+market\b/i },
  { phrase: "don't wait", re: /\bdon[’']?t\s+wait\b/i },
  { phrase: 'act now', re: /\bact\s+now\b/i },
  { phrase: 'guaranteed return', re: /\bguaranteed\s+return/i },
  { phrase: 'will rise', re: /\bwill\s+(?:rise|climb|surge|jump|soar)\b/i },
  { phrase: 'will fall', re: /\bwill\s+(?:fall|drop|crash|plunge|tank)\b/i },
  { phrase: 'will appreciate', re: /\bwill\s+appreciate\b/i },
  { phrase: 'investment opportunity', re: /\binvestment\s+opportunity\b/i },
  { phrase: 'best investment', re: /\bbest\s+investment\b/i },
  { phrase: 'should buy', re: /\byou\s+should\s+buy\b/i },
  { phrase: 'should sell', re: /\byou\s+should\s+sell\b/i },
];

interface PageReport {
  route: string;
  path: string;
  wordCount: number;
  h2Count: number;
  faqCount: number;
  internalLinks: number;
  bannedHits: string[];
  failures: string[];
  passes: boolean;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveRoute(filePath: string): string {
  const rel = filePath.replace(APP_OUTPUT, '').replace(/\.html$/, '');
  if (rel === '' || rel === '/index') return '/';
  return rel.endsWith('/') ? rel : rel + '/';
}

function isRedirectShell(html: string): boolean {
  if (/<meta[^>]+http-equiv=["']refresh["'][^>]+url=/i.test(html)) return true;
  if (/<html[^>]+id=["']__next_error__["']/i.test(html)) return true;
  return false;
}

function auditFile(filePath: string): PageReport {
  const route = deriveRoute(filePath);
  const html = fs.readFileSync(filePath, 'utf-8');
  const text = stripTags(html);

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  const detailsCount = (html.match(/<details\b/gi) || []).length;
  let jsonLdFaqCount = 0;
  const faqMatch = html.match(/"@type"\s*:\s*"FAQPage"[\s\S]*?"mainEntity"\s*:\s*\[([\s\S]*?)\]/);
  if (faqMatch) {
    jsonLdFaqCount = (faqMatch[1].match(/"@type"\s*:\s*"Question"/g) || []).length;
  }
  const faqCount = Math.max(detailsCount, jsonLdFaqCount);

  const linkMatches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  let internalLinks = 0;
  for (const m of linkMatches) {
    const href = m[1];
    if (href.startsWith('/') || href.startsWith('https://homepricepeek.com')) {
      internalLinks++;
    }
  }

  const bannedHits: string[] = [];
  for (const { phrase, re } of BANNED_PHRASES) {
    if (re.test(text)) bannedHits.push(phrase);
  }

  const failures: string[] = [];
  if (wordCount < THRESHOLDS.words) failures.push(`words ${wordCount} < ${THRESHOLDS.words}`);
  if (h2Count < THRESHOLDS.h2) failures.push(`h2 ${h2Count} < ${THRESHOLDS.h2}`);
  if (faqCount < THRESHOLDS.faq) failures.push(`faq ${faqCount} < ${THRESHOLDS.faq}`);
  if (internalLinks < THRESHOLDS.internalLinks) failures.push(`internal links ${internalLinks} < ${THRESHOLDS.internalLinks}`);
  if (bannedHits.length > 0) failures.push(`banned phrases: ${bannedHits.join(', ')}`);

  return { route, path: filePath, wordCount, h2Count, faqCount, internalLinks, bannedHits, failures, passes: failures.length === 0 };
}

function* walkHtml(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(full);
    else if (entry.isFile() && full.endsWith('.html')) yield full;
  }
}

function main() {
  const args = process.argv.slice(2);
  const gate = args.includes('--gate');
  const verbose = args.includes('--verbose');

  const stateDir = path.join(APP_OUTPUT, 'state');
  if (!fs.existsSync(stateDir)) {
    console.error(`audit-housing: ${stateDir} not found. Run 'next build' first.`);
    process.exit(1);
  }

  const reports: PageReport[] = [];
  let skipped = 0;
  for (const file of walkHtml(stateDir)) {
    const html = fs.readFileSync(file, 'utf-8');
    if (isRedirectShell(html)) { skipped++; continue; }
    reports.push(auditFile(file));
  }

  const failed = reports.filter(r => !r.passes);
  const bannedPages = reports.filter(r => r.bannedHits.length > 0);

  console.log(`\n=== homepricepeek state-page audit ===`);
  console.log(`Pages audited: ${reports.length} (skipped ${skipped} shells)`);
  console.log(`Pass: ${reports.length - failed.length}  Fail: ${failed.length}  Banned-phrase hits: ${bannedPages.length}`);
  console.log(`Thresholds: words >= ${THRESHOLDS.words}, h2 >= ${THRESHOLDS.h2}, faq >= ${THRESHOLDS.faq}, links >= ${THRESHOLDS.internalLinks}`);

  if (failed.length > 0 || verbose) {
    console.log(`\nFailures:`);
    for (const r of (verbose ? reports : failed)) {
      const status = r.passes ? 'PASS' : 'FAIL';
      console.log(`  [${status}] ${r.route}  words=${r.wordCount} h2=${r.h2Count} faq=${r.faqCount} links=${r.internalLinks}`);
      for (const f of r.failures) console.log(`    - ${f}`);
    }
  }

  if (gate && (failed.length > 0 || bannedPages.length > 0)) {
    console.error(`\naudit-housing: GATE FAILED — ${failed.length} threshold misses, ${bannedPages.length} pages with banned phrases`);
    process.exit(1);
  }

  if (failed.length === 0 && bannedPages.length === 0) {
    console.log(`\naudit-housing: all pages above thresholds, no banned phrases.`);
  }
}

main();
