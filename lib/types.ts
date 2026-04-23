/**
 * UI theme variant — drives font family, corner radius, hero layout, header flavor.
 *
 *  'default'      — existing datapeek style (Inter, rounded-lg, stats-grid hero)
 *  'professional' — Inter, rounded-xl, search-first hero, sub-nav header  (careers/jobs sites)
 *  'calculator'   — IBM Plex Sans, rounded-md, calculator hero, CTA-button header  (tax/finance sites)
 *  'government'   — Source Sans 3, rounded-sm, map hero, formal header  (enforcement/gov data sites)
 *
 * Adopted incrementally:
 * - Existing 38 sites: implicit 'default' (no change).
 * - Tier-S batch (2026-04-15, 3 sites): professional/calculator/government.
 * - Tier-A/B next batch (10 sites): pick theme per content type.
 */
export type UiTheme = 'default' | 'professional' | 'calculator' | 'government';

export type PublisherMode = 'organization' | 'team' | 'person';

export interface SiteConfig {
  // Basic
  name: string;
  domain: string;
  description: string;
  tagline?: string;

  // Theme
  colors: { primary: string; accent: string };
  uiTheme?: UiTheme;              // optional — defaults to 'default' at render time
  lang: string;
  locale: string;
  defaultLocale?: string;
  supportedLocales?: string[];
  targetLangs?: string[];
  publisherMode?: PublisherMode;
  methodologyUrl?: string;
  dataVintage?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByUrl?: string;
  dbUpdated?: string;

  // Data Entity
  entity: {
    slug: string;
    label: string;
    labelSingular: string;
    dbPath: string;
    tableName: string;
    slugColumn: string;
    nameColumn: string;
    categoryColumn: string | null;
    compareFields?: string[];
    prerenderLimit?: number; // Detail pages to pre-render at build (rest on-demand via ISR)
    comparePrerenderLimit?: number; // Hot-set compare pairs to pre-render (rest on-demand via ISR)
  };

  // Monetization
  gaId: string;
  adsenseId: string;


  // Data Source
  dataSource: {
    name: string;
    url: string;
    year: number;
  };

  author: {
    name: string;
    role: string;
    bio: string;
    sameAs: string[];
  };
}

export interface Entity {
  slug: string;
  name: string;
  category: string | null;
  [key: string]: unknown;
}
