/**
 * monthly-insights-update.ts
 *
 * Runs once a month (cron: 0 4 19 * *). For each insight topic:
 *   1. Load prior snapshot from data/insights-snapshots/<slug>.json
 *   2. Query live DB to get current top-25
 *   3. Diff: cities added / removed / rank-change ≥ 3 / top-5 leader change
 *   4. Write new snapshot + write human-readable changes into changelog
 *
 * Next.js ISR picks up lastUpdated on next rebuild (or we can force
 * a rebuild via docker-build-deploy.sh from the same cron).
 */
import fs from 'fs';
import path from 'path';
import { INSIGHT_TOPICS, type InsightCity } from '../lib/insights-data';

const ROOT = process.cwd();
const SNAP_DIR = path.join(ROOT, 'data/insights-snapshots');
const LOG_DIR = path.join(ROOT, 'data/insights-changelog');

fs.mkdirSync(SNAP_DIR, { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });

interface Snapshot {
  takenAt: string;
  rows: { slug: string; name: string; rank: number; metric: number }[];
}

function metricFor(topicSlug: string, c: InsightCity): number {
  switch (topicSlug) {
    case 'most-affordable-first-home-markets': return c.price_to_income_ratio ?? 0;
    case 'biggest-price-drops-this-year': return c.price_change_1yr_pct ?? 0;
    case 'rent-vs-buy-renting-wins': return c.price_to_rent_ratio ?? 0;
    case 'luxury-markets-under-pressure': return c.price_change_1yr_pct ?? 0;
    case 'emerging-affordable-cities-to-watch': return c.price_change_1yr_pct ?? 0;
    default: return 0;
  }
}

function metricLabel(topicSlug: string): string {
  switch (topicSlug) {
    case 'most-affordable-first-home-markets': return 'price-to-income';
    case 'biggest-price-drops-this-year': return '1Y change';
    case 'rent-vs-buy-renting-wins': return 'price-to-rent';
    case 'luxury-markets-under-pressure': return '1Y change';
    case 'emerging-affordable-cities-to-watch': return '1Y growth';
    default: return 'metric';
  }
}

function formatMetric(topicSlug: string, v: number): string {
  if (topicSlug === 'biggest-price-drops-this-year' || topicSlug === 'luxury-markets-under-pressure' || topicSlug === 'emerging-affordable-cities-to-watch') {
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  }
  if (topicSlug === 'rent-vs-buy-renting-wins') return `${v.toFixed(0)}×`;
  return `${v.toFixed(1)}×`;
}

function diffTopic(topicSlug: string): { changes: string[]; snapshot: Snapshot } {
  const topic = INSIGHT_TOPICS[topicSlug];
  const today = new Date().toISOString().slice(0, 10);
  const rows = topic.query();

  const snapshot: Snapshot = {
    takenAt: today,
    rows: rows.map((r, i) => ({ slug: r.slug, name: r.name, rank: i + 1, metric: metricFor(topicSlug, r) })),
  };

  const snapPath = path.join(SNAP_DIR, `${topicSlug}.json`);
  let prior: Snapshot | null = null;
  if (fs.existsSync(snapPath)) {
    try { prior = JSON.parse(fs.readFileSync(snapPath, 'utf8')) as Snapshot; } catch { /* first run — treat as null */ }
  }

  const changes: string[] = [];
  if (!prior) {
    changes.push(`Baseline snapshot published — ${today}. ${rows.length} cities tracked.`);
    return { changes, snapshot };
  }

  const priorSet = new Set(prior.rows.map(r => r.slug));
  const todaySet = new Set(snapshot.rows.map(r => r.slug));

  const added = snapshot.rows.filter(r => !priorSet.has(r.slug)).slice(0, 3);
  const removed = prior.rows.filter(r => !todaySet.has(r.slug)).slice(0, 3);

  if (added.length > 0) {
    const list = added.map(a => `${a.name} (${formatMetric(topicSlug, a.metric)})`).join(', ');
    changes.push(`New entries: ${list}.`);
  }
  if (removed.length > 0) {
    const list = removed.map(r => r.name).join(', ');
    changes.push(`Dropped off: ${list}.`);
  }

  // Top-5 leader shift
  const priorLeader = prior.rows[0];
  const todayLeader = snapshot.rows[0];
  if (priorLeader && todayLeader && priorLeader.slug !== todayLeader.slug) {
    changes.push(`New #1: ${todayLeader.name} at ${formatMetric(topicSlug, todayLeader.metric)} (${metricLabel(topicSlug)}) — replaces ${priorLeader.name}.`);
  }

  // Biggest rank movers (≥3 positions)
  const priorRank = new Map(prior.rows.map(r => [r.slug, r.rank]));
  const movers = snapshot.rows
    .map(r => ({ ...r, delta: (priorRank.get(r.slug) ?? r.rank) - r.rank }))
    .filter(r => Math.abs(r.delta) >= 3)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 2);
  for (const m of movers) {
    const dir = m.delta > 0 ? 'jumped' : 'slid';
    changes.push(`${m.name} ${dir} ${Math.abs(m.delta)} spots to #${m.rank}.`);
  }

  if (changes.length === 0) {
    changes.push(`No material rank changes vs ${prior.takenAt} snapshot — ranking stable.`);
  }

  return { changes, snapshot };
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  for (const slug of Object.keys(INSIGHT_TOPICS)) {
    const { changes, snapshot } = diffTopic(slug);

    // Read prior changelog for priorRun timestamp
    const logPath = path.join(LOG_DIR, `${slug}.json`);
    let priorRun: string | null = null;
    if (fs.existsSync(logPath)) {
      try {
        const prev = JSON.parse(fs.readFileSync(logPath, 'utf8')) as { lastUpdated: string };
        priorRun = prev.lastUpdated;
      } catch { /* ignore */ }
    }

    fs.writeFileSync(path.join(SNAP_DIR, `${slug}.json`), JSON.stringify(snapshot, null, 2));
    fs.writeFileSync(logPath, JSON.stringify({ lastUpdated: today, priorRun, changes }, null, 2));
    console.log(`[${slug}] ${changes.length} change line(s) written.`);
  }
}

main();
