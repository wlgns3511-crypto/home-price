import { siteConfig } from '@/site.config';

/**
 * Authorship + 6-layer vintage anchors.
 *
 * Each section of the site anchors to its own honest vintage rather than a
 * single site-wide "today" cluster. This lets methodology/about/legal/db
 * dates evolve independently in the sitemap and in DataSourceBadge.
 */

export const DB_UPDATED = '2026-04-19';

// 6-layer vintage anchors (Phase 6 v6.3 pattern)
export const ENTITY_VINTAGE = '2026-04';        // DB rebuild (cities/states data ingested)
export const ENTITY_KEEP_VINTAGE = '2026-04';   // curated keep-set last regenerated
export const METHODOLOGY_REVIEWED = '2026-05-12';
export const ABOUT_REVIEWED = '2026-05-12';
export const GUIDE_REVIEWED = '2026-05-12';
export const SITE_REBUILT = '2026-05-12';
export const LEGAL_REVIEWED = '2026-05-12';

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description:
    'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: `${siteConfig.name} Editorial Team`,
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

/**
 * SOURCE_AUTHORITIES — actual data providers backing the DB.
 * Used by datasetSchema.sourceOrganization (schema.org) and AuthorBox.
 *
 * Honest minimalism: only orgs whose data is *actually wired* to a DB column
 * or surface. No reference-only authorities (like "Federal Reserve H.15"
 * unless that series populates a column).
 */
export const SOURCE_AUTHORITIES = [
  {
    name: 'OECD Housing Prices',
    url: 'https://data.oecd.org/price/housing-prices.htm',
    role: 'International price-to-income & price-to-rent benchmarks',
  },
  {
    name: 'US Census Bureau (ACS 5-year)',
    url: 'https://www.census.gov/programs-surveys/acs/',
    role: 'US median home value, median rent, household income, cost-burden share',
  },
  {
    name: 'FHFA House Price Index',
    url: 'https://www.fhfa.gov/data/hpi',
    role: 'US 5-year and 10-year cumulative state-level appreciation',
  },
  {
    name: 'FRED — Federal Reserve Economic Data',
    url: 'https://fred.stlouisfed.org/series/MORTGAGE30US',
    role: 'US 30-year fixed mortgage rate benchmark',
  },
  {
    name: 'National statistics offices',
    url: 'https://unstats.un.org/unsd/methodology/m49/',
    role:
      'Per-country housing snapshots where the OECD does not publish (Statistics Canada, ONS UK, INE, Eurostat aggregates)',
  },
] as const;
