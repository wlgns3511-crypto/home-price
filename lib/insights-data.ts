/**
 * Evergreen Insights — 5 fixed-URL topics regenerated monthly.
 *
 * Each topic has a stable slug + stable angle (the "thesis") but the
 * ranking rows underneath re-query the live DB every rebuild. A monthly
 * cron re-snapshots the data, writes a CHANGES delta, and triggers a
 * rebuild so lastmod + "what changed this month" stay honest.
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data/main.db');

let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface InsightCity {
  slug: string;
  name: string;
  country: string;
  avg_home_price_usd: number;
  avg_rent_1br_usd: number | null;
  price_to_income_ratio: number | null;
  price_change_1yr_pct: number | null;
  median_income_usd: number | null;
  price_per_sqm_usd: number | null;
  population: number | null;
  price_to_rent_ratio?: number;
}

export interface InsightTopic {
  slug: string;
  title: string;
  h1: string;
  description: string;
  thesis: string;
  methodNote: string;
  query: () => InsightCity[];
}

// ── 1. Most affordable first-home markets ───────────────────
function queryAffordable(): InsightCity[] {
  return getDb().prepare(`
    SELECT slug, name, country, avg_home_price_usd, avg_rent_1br_usd,
           price_to_income_ratio, price_change_1yr_pct, median_income_usd,
           price_per_sqm_usd, population
    FROM cities
    WHERE price_to_income_ratio IS NOT NULL
      AND price_to_income_ratio < 6
      AND avg_home_price_usd < 200000
      AND avg_home_price_usd IS NOT NULL
    ORDER BY price_to_income_ratio ASC
    LIMIT 25
  `).all() as InsightCity[];
}

// ── 2. Biggest price drops ──────────────────────────────────
function queryDrops(): InsightCity[] {
  return getDb().prepare(`
    SELECT slug, name, country, avg_home_price_usd, avg_rent_1br_usd,
           price_to_income_ratio, price_change_1yr_pct, median_income_usd,
           price_per_sqm_usd, population
    FROM cities
    WHERE price_change_1yr_pct IS NOT NULL
      AND price_change_1yr_pct < 0
    ORDER BY price_change_1yr_pct ASC
    LIMIT 25
  `).all() as InsightCity[];
}

// ── 3. Rent-vs-buy — renting wins ───────────────────────────
function queryRentWins(): InsightCity[] {
  const rows = getDb().prepare(`
    SELECT slug, name, country, avg_home_price_usd, avg_rent_1br_usd,
           price_to_income_ratio, price_change_1yr_pct, median_income_usd,
           price_per_sqm_usd, population,
           (CAST(avg_home_price_usd AS REAL) / (avg_rent_1br_usd * 12)) as price_to_rent_ratio
    FROM cities
    WHERE avg_rent_1br_usd IS NOT NULL AND avg_rent_1br_usd > 0
      AND avg_home_price_usd IS NOT NULL AND avg_home_price_usd > 0
      AND (CAST(avg_home_price_usd AS REAL) / (avg_rent_1br_usd * 12)) > 25
    ORDER BY price_to_rent_ratio DESC
    LIMIT 25
  `).all() as InsightCity[];
  return rows;
}

// ── 4. Luxury markets under pressure ────────────────────────
function queryLuxuryDrop(): InsightCity[] {
  return getDb().prepare(`
    SELECT slug, name, country, avg_home_price_usd, avg_rent_1br_usd,
           price_to_income_ratio, price_change_1yr_pct, median_income_usd,
           price_per_sqm_usd, population
    FROM cities
    WHERE avg_home_price_usd > 500000
      AND price_change_1yr_pct IS NOT NULL
      AND price_change_1yr_pct < 2
    ORDER BY price_change_1yr_pct ASC
    LIMIT 25
  `).all() as InsightCity[];
}

// ── 5. Emerging affordable cities to watch ──────────────────
function queryEmerging(): InsightCity[] {
  return getDb().prepare(`
    SELECT slug, name, country, avg_home_price_usd, avg_rent_1br_usd,
           price_to_income_ratio, price_change_1yr_pct, median_income_usd,
           price_per_sqm_usd, population
    FROM cities
    WHERE avg_home_price_usd < 250000
      AND price_change_1yr_pct IS NOT NULL
      AND price_change_1yr_pct > 3
      AND population IS NOT NULL
      AND population > 500000
    ORDER BY price_change_1yr_pct DESC
    LIMIT 25
  `).all() as InsightCity[];
}

export const INSIGHT_TOPICS: Record<string, InsightTopic> = {
  'most-affordable-first-home-markets': {
    slug: 'most-affordable-first-home-markets',
    title: 'Most Affordable First-Home Markets Worldwide',
    h1: 'Most Affordable First-Home Markets Worldwide',
    description: 'Cities where a median-income household can realistically buy — price-to-income under 6× and home prices under $200K.',
    thesis: 'A price-to-income ratio below 6 is the threshold where a typical dual-income household can realistically finance a home without heroic saving. We filter to cities where the average home is under $200K (a standard 20% down ≈ $40K) and rank by how few years of income buys a home.',
    methodNote: 'Average home prices and median household income are drawn from the OECD price-to-income series for OECD member economies and from named national statistics offices elsewhere. "Years of income" = price ÷ median household income. Where the underlying source has fewer than 20 observations for a city, the city is excluded.',
    query: queryAffordable,
  },
  'biggest-price-drops-this-year': {
    slug: 'biggest-price-drops-this-year',
    title: 'Biggest Home Price Drops Worldwide',
    h1: 'Biggest Home Price Drops Worldwide',
    description: 'Cities where home prices are falling year-over-year. Ranked by 1-year price change.',
    thesis: 'Price declines do not automatically signal opportunity — they often reflect local economic stress (capital flight, demographic decline, currency shocks). We track them as leading indicators of either buyer-friendly windows or structural weakness worth understanding before you buy.',
    methodNote: '1-year price change is computed in local currency where the source publishes a national index (OECD price-to-income / national statistics offices) to avoid exchange-rate noise, then expressed as a percentage. Cities with YoY decline below zero are included and ranked by magnitude of drop.',
    query: queryDrops,
  },
  'rent-vs-buy-renting-wins': {
    slug: 'rent-vs-buy-renting-wins',
    title: 'Cities Where Renting Beats Buying (Price-to-Rent > 25)',
    h1: 'Cities Where Renting Beats Buying',
    description: 'Markets with price-to-rent ratios above 25 — where the math favors renting unless you stay 10+ years.',
    thesis: 'A price-to-rent ratio above 25 means you are paying 25 years of rent in cash to own the place outright. Factor in mortgage interest, maintenance, and property tax, and breakeven vs renting stretches past a decade. In these cities, renting and investing the difference usually wins.',
    methodNote: 'Price-to-rent = average apartment price ÷ (1-bedroom monthly rent × 12). City-center 1BR rents are taken from the OECD rent-to-income series where published and from national statistics offices otherwise. Cities without comparable rent data are excluded.',
    query: queryRentWins,
  },
  'luxury-markets-under-pressure': {
    slug: 'luxury-markets-under-pressure',
    title: 'Luxury Markets Under Pressure ($500K+ Softening)',
    h1: 'Luxury Markets Under Pressure',
    description: 'High-priced cities (average home > $500K) where appreciation has stalled or reversed.',
    thesis: 'Luxury markets are first in and first out of cycles — wealthy buyers are rate-sensitive through opportunity cost, and ultra-prime cities rely on cross-border capital that dries up fast. Softening here often precedes broader corrections 6–12 months later.',
    methodNote: 'We include cities where the most recent average home price exceeds $500K and 1-year appreciation is below 2% (effectively flat after inflation). Prices come from the OECD price-to-income series and named national statistics offices.',
    query: queryLuxuryDrop,
  },
  'emerging-affordable-cities-to-watch': {
    slug: 'emerging-affordable-cities-to-watch',
    title: 'Emerging Affordable Cities Gaining Momentum',
    h1: 'Emerging Affordable Cities to Watch',
    description: 'Cities under $250K average home price with strong 1-year appreciation (3%+) and 500K+ population.',
    thesis: 'The combination of affordability and acceleration — sub-$250K prices rising 3%+ yearly in cities with real infrastructure — points to markets where demand is outrunning supply. These are not guaranteed winners, but they are the early signals worth tracking.',
    methodNote: 'We filter cities with average home price < $250K, 1-year price change > 3%, and population > 500K (to exclude small towns with noisy data). Sorted by magnitude of price growth.',
    query: queryEmerging,
  },
};

export function getInsightTopic(slug: string): InsightTopic | null {
  return INSIGHT_TOPICS[slug] || null;
}

export function getAllInsightSlugs(): string[] {
  return Object.keys(INSIGHT_TOPICS);
}

// ── Change-log file (written by monthly cron) ───────────────
// Format: data/insights-changelog/<slug>.json
//   { lastUpdated: "2026-04-19", priorRun: "2026-03-19", changes: string[] }

export interface ChangeLog {
  lastUpdated: string;
  priorRun: string | null;
  changes: string[];
}

export function readChangeLog(slug: string): ChangeLog | null {
  const p = path.join(process.cwd(), 'data/insights-changelog', `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as ChangeLog;
  } catch {
    return null;
  }
}
