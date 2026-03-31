import type { RankingFilters } from './db';

export interface FilterRanking {
  slug: string;
  title: string;
  description: string;
  valueColumn: string;
  orderDir: string;
  valueLabel: string;
  filters: RankingFilters;
}

// ── Base ranking definitions (not region-specific) ──────────
const BASE_RANKINGS = [
  { slug: 'most-expensive-cities', title: 'Most Expensive Cities', col: 'avg_home_price_usd', dir: 'DESC', label: 'Avg Price' },
  { slug: 'cheapest-cities', title: 'Cheapest Cities', col: 'avg_home_price_usd', dir: 'ASC', label: 'Avg Price' },
  { slug: 'highest-price-per-sqm', title: 'Highest Price per sqm', col: 'price_per_sqm_usd', dir: 'DESC', label: 'Price/sqm' },
  { slug: 'cheapest-rent', title: 'Cheapest Rent', col: 'avg_rent_1br_usd', dir: 'ASC', label: 'Rent (1BR)' },
  { slug: 'most-expensive-rent', title: 'Most Expensive Rent', col: 'avg_rent_1br_usd', dir: 'DESC', label: 'Rent (1BR)' },
  { slug: 'best-affordability', title: 'Most Affordable', col: 'price_to_income_ratio', dir: 'ASC', label: 'Price-to-Income' },
  { slug: 'worst-affordability', title: 'Least Affordable', col: 'price_to_income_ratio', dir: 'DESC', label: 'Price-to-Income' },
  { slug: 'fastest-growing', title: 'Fastest Growing Markets', col: 'price_change_1yr_pct', dir: 'DESC', label: '1yr Change' },
  { slug: 'biggest-decline', title: 'Falling Home Prices', col: 'price_change_1yr_pct', dir: 'ASC', label: '1yr Change' },
  { slug: 'highest-income', title: 'Highest Income', col: 'median_income_usd', dir: 'DESC', label: 'Median Income' },
  { slug: 'highest-rent-burden', title: 'Highest Rent Burden', col: 'rent_to_income_ratio', dir: 'DESC', label: 'Rent Burden' },
  { slug: 'lowest-rent-burden', title: 'Lowest Rent Burden', col: 'rent_to_income_ratio', dir: 'ASC', label: 'Rent Burden' },
  { slug: 'best-roi-cities', title: 'Best ROI for Investment', col: 'price_to_income_ratio', dir: 'ASC', label: 'Price-to-Income' },
];

const REGIONS = ['Africa', 'Asia', 'Europe', 'Middle East', 'North America', 'Oceania', 'South America'];

const PRICE_BUCKETS = [
  { suffix: 'under-100k', label: 'Under $100K', max: 100000 },
  { suffix: 'under-200k', label: 'Under $200K', max: 200000 },
  { suffix: 'under-300k', label: 'Under $300K', max: 300000 },
  { suffix: 'under-500k', label: 'Under $500K', max: 500000 },
  { suffix: 'under-1m', label: 'Under $1M', max: 1000000 },
];

// Rankings where price bucket filter makes sense
const PRICE_FILTERABLE = [
  'cheapest-cities', 'best-affordability', 'cheapest-rent', 'fastest-growing',
  'biggest-decline', 'highest-income', 'lowest-rent-burden', 'best-roi-cities',
];

function regionSlug(region: string) {
  return region.toLowerCase().replace(/\s+/g, '-');
}

// ── Generate all filter ranking combinations ────────────────
function generateFilterRankings(): FilterRanking[] {
  const result: FilterRanking[] = [];

  // Region × Base Rankings (skip combos already in the DB)
  const existingRegionSlugs = new Set([
    'cheapest-in-europe', 'cheapest-in-asia', 'expensive-in-europe',
    'expensive-in-asia', 'cheapest-in-north-america', 'expensive-in-north-america',
    'best-rent-in-europe', 'best-rent-in-asia',
  ]);

  for (const base of BASE_RANKINGS) {
    for (const region of REGIONS) {
      const slug = `${base.slug}-in-${regionSlug(region)}`;
      if (existingRegionSlugs.has(slug)) continue;
      result.push({
        slug,
        title: `${base.title} in ${region}`,
        description: `${base.title} in ${region} — ranked by ${base.label.toLowerCase()}, based on OECD and national statistics data.`,
        valueColumn: base.col,
        orderDir: base.dir,
        valueLabel: base.label,
        filters: { region },
      });
    }
  }

  // Price bucket × applicable rankings
  for (const base of BASE_RANKINGS) {
    if (!PRICE_FILTERABLE.includes(base.slug)) continue;
    for (const bucket of PRICE_BUCKETS) {
      result.push({
        slug: `${base.slug}-${bucket.suffix}`,
        title: `${base.title} ${bucket.label}`,
        description: `${base.title} with average home prices ${bucket.label.toLowerCase()} — ranked by ${base.label.toLowerCase()}.`,
        valueColumn: base.col,
        orderDir: base.dir,
        valueLabel: base.label,
        filters: { maxPrice: bucket.max },
      });
    }
  }

  // Trend + Region combos
  const trendBases = BASE_RANKINGS.filter(b => b.slug === 'fastest-growing' || b.slug === 'biggest-decline');
  for (const base of trendBases) {
    for (const region of REGIONS) {
      const slug = `${base.slug}-in-${regionSlug(region)}`;
      // Skip if already generated above
      if (result.some(r => r.slug === slug)) continue;
      result.push({
        slug,
        title: `${base.title} in ${region}`,
        description: `Cities in ${region} with ${base.slug === 'fastest-growing' ? 'the fastest rising' : 'falling'} home prices.`,
        valueColumn: base.col,
        orderDir: base.dir,
        valueLabel: base.label,
        filters: { region },
      });
    }
  }

  return result;
}

export const FILTER_RANKINGS = generateFilterRankings();

// Map for O(1) lookup by slug
const FILTER_RANKINGS_MAP = new Map(FILTER_RANKINGS.map(fr => [fr.slug, fr]));

export function getFilterRankingBySlug(slug: string): FilterRanking | undefined {
  return FILTER_RANKINGS_MAP.get(slug);
}
