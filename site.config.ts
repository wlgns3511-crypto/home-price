import type { SiteConfig } from './lib/types';

const DATAPEEK_SITES = [
  'https://vocabwize.com', 'https://vocablibre.com', 'https://wortwize.com',
  'https://kalimawize.com', 'https://dicionariowize.com', 'https://kotobapeek.com',
  'https://salarybycity.com', 'https://netpaypeek.com', 'https://wagepeek.com',
  'https://costbycity.com', 'https://fairrentwize.com', 'https://propertytaxpeek.com',
  'https://degreewize.com', 'https://nameblooms.com', 'https://myschoolpeek.com',
  'https://medcheckwize.com', 'https://medcostpeek.com', 'https://eldercarepeek.com',
  'https://ingredipeek.com', 'https://caloriewize.com', 'https://powerbillpeek.com',
  'https://sunpowerpeek.com', 'https://shipcalcwize.com', 'https://tariffpeek.com',
  'https://visapeek.com', 'https://zippeek.com', 'https://calcpeek.com',
  'https://datapeekfacts.com', 'https://guidebycity.com',
];

export const siteConfig: SiteConfig = {
  // ── Basic Info ──────────────────────────────────────────
  name: 'HomePricePeek',
  domain: 'homepricepeek.com',
  description: 'Compare home prices, rents, and affordability across 500+ cities worldwide. Price per sqm, rent vs buy analysis, and mortgage calculators.',

  // ── Theme ───────────────────────────────────────────────
  colors: { primary: 'emerald', accent: 'amber' },
  lang: 'en',
  locale: 'en-US',

  // ── Data Entity ─────────────────────────────────────────
  entity: {
    slug: 'city',
    label: 'Cities',
    labelSingular: 'City',
    dbPath: './data/main.db',
    tableName: 'cities',
    slugColumn: 'slug',
    nameColumn: 'name',
    categoryColumn: 'country',
  },

  // ── Monetization ────────────────────────────────────────
  gaId: 'G-XXXXXXXXXX',
  adsenseId: 'ca-pub-5724806562146685',

  // ── Network ─────────────────────────────────────────────
  sameAs: DATAPEEK_SITES,

  // ── Data Source ─────────────────────────────────────────
  dataSource: {
    name: 'OECD, Numbeo & National Statistics',
    url: 'https://data.oecd.org/price/housing-prices.htm',
    year: 2025,
  },
};
