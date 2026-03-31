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
  name: 'UhomeUprice',
  domain: 'homepricepeek.com',
  description: 'Free data tool for exploring ...',

  // ── Theme ───────────────────────────────────────────────
  colors: { primary: 'blue', accent: 'teal' },
  lang: 'en',
  locale: 'en-US',

  // ── Data Entity ─────────────────────────────────────────
  entity: {
    slug: 'city',             // URL pattern: /item/[slug]
    label: 'citys',           // Plural label
    labelSingular: 'city',    // Singular label
    dbPath: './data/main.db', // SQLite database path
    tableName: 'items',       // Main table name
    slugColumn: 'slug',       // Slug column name
    nameColumn: 'name',       // Display name column
    categoryColumn: 'category', // Category column (null if none)
  },

  // ── Monetization ────────────────────────────────────────
  gaId: 'G-XXXXXXXXXX',
  adsenseId: 'ca-pub-5724806562146685',

  // ── Network ─────────────────────────────────────────────
  sameAs: DATAPEEK_SITES,

  // ── Data Source ─────────────────────────────────────────
  dataSource: {
    name: 'US Census Bureau',
    url: 'https://www.census.gov',
    year: 2024,
  },
};
