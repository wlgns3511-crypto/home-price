import type { SiteConfig } from './lib/types';

export const siteConfig: SiteConfig = {
  // ── Basic Info ──────────────────────────────────────────
  name: 'HomePricePeek',
  domain: 'homepricepeek.com',
  description:
    'Housing affordability for 51 US states + 35 US cities (deep) and 159 international cities (broad). Anchored to OECD, FHFA, Census ACS, FRED, and national statistics offices.',

  // ── Theme ───────────────────────────────────────────────
  colors: { primary: 'emerald', accent: 'amber' },
  lang: 'en',
  locale: 'en-US',
  publisherMode: 'team',
  methodologyUrl: '/methodology/',
  // Top-level dataVintage is an anchor for the *site identity* layer (rebuild date).
  // Per-section vintages live in lib/authorship.ts (ENTITY/ABOUT/METHODOLOGY/LEGAL_REVIEWED).
  dataVintage: '2026-04 site rebuild',
  reviewedAt: '2026-04-19',
  reviewedBy: 'HomePricePeek Editorial Team',

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
  gaId: 'G-GF31974ES5',
  adsenseId: 'ca-pub-5724806562146685',

  // ── Network ─────────────────────────────────────────────

  // ── Data Source (single primary anchor; full source list in lib/authorship.ts) ──
  dataSource: {
    name: 'OECD Housing Prices',
    url: 'https://data.oecd.org/price/housing-prices.htm',
    year: 2026,
  },

  // ── Honest freshness (updated manually on each DB rebuild) ──
  dbUpdated: '2026-04-19',

  // ── Byline (consistent editor across the network) ─────────
  author: {
    name: 'James Park',
    role: 'Editor',
    bio: 'James Park curates public housing data for a small network of free data tools. HomePricePeek aggregates OECD price-to-income series, FHFA HPI, Census ACS, FRED mortgage rates, and national statistics offices into comparable per-state and per-city views. Reach out through the contact form — every correction request is read.',
    sameAs: [
      'https://datapeekfacts.com',
      'https://costbycity.com',
      'https://salarybycity.com',
    ],
  },
};
