import type { SiteConfig } from './lib/types';

export const siteConfig: SiteConfig = {
  // ── Basic Info ──────────────────────────────────────────
  name: 'HomePricePeek',
  domain: 'homepricepeek.com',
  description: 'Compare home prices, rents, and affordability across 500+ cities worldwide. Price per sqm, rent vs buy analysis, and mortgage calculators.',

  // ── Theme ───────────────────────────────────────────────
  colors: { primary: 'emerald', accent: 'amber' },
  lang: 'en',
  locale: 'en-US',
  publisherMode: 'team',
  methodologyUrl: '/methodology/',
  dataVintage: '2026 OECD, Numbeo & national statistics snapshot',
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

  // ── Data Source ─────────────────────────────────────────
  dataSource: {
    name: 'OECD, Numbeo & National Statistics',
    url: 'https://data.oecd.org/price/housing-prices.htm',
    year: 2026,
  },

  // ── Honest freshness (updated manually on each DB rebuild) ──
  dbUpdated: '2026-04-19',

  // ── Byline (consistent editor across the network) ─────────
  author: {
    name: 'James Park',
    role: 'Editor',
    bio: 'James Park curates public housing and cost-of-living data for a small network of free data tools. HomePricePeek aggregates Numbeo, OECD, and national-statistics housing data into comparable per-city views. Reach out through the contact form — every correction request is read.',
    sameAs: [
      'https://datapeekfacts.com',
      'https://costbycity.com',
      'https://salarybycity.com',
    ],
  },
};
