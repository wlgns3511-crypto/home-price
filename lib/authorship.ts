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
// 2026-07-24 — OECD Housing Prices 를 [0] 에서 제거했다. 위 "actually wired" 규칙을
// 이 배열 자신이 어기고 있었다: 레포에 OECD 인제스천 스크립트가 없고 data/sources.json
// 15개 필드 어디에도 OECD 가 없다. 그런데 [0] 은 datasetSchema 의 `creator` 로 쓰여
// (lib/schema.ts) 전 서피스가 "제작자 = OECD" 를 schema.org 로 선언하고 있었다.
// 자리를 비우지 않고 교체하는 이유: [0][1][2][3][4] 위치 인덱스가 lib/schema.ts 와
// lib/state-pair-compare-decoder.ts 에 하드코딩돼 있어 원소를 지우면 전부 한 칸씩
// 밀려 엉뚱한 기관이 creator 가 된다. 길이·순서 유지가 가장 짧고 안전한 수정.
// ponytail: 위치 기반 인덱싱은 그대로 뒀다. 이름 기반 조회로 바꿀 값어치는 슬롯이
// 또 바뀔 때 생긴다.
export const SOURCE_AUTHORITIES = [
  {
    name: 'Zillow Home Value Index (ZHVI)',
    url: 'https://www.zillow.com/research/data/',
    role: 'US state-level typical home value and 1-year change',
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
  // 2026-07-24 — 'National statistics offices' 를 교체했다. 이 항목이 받치던 유일한
  // 서피스가 /country/ 였는데 같은 날 410 으로 접었다(합성 시드). 남겨두면 아무 컬럼도
  // 배선하지 않은 채 목록에만 있는 reference-only authority 가 되어 위 규칙 위반.
  // Tax Foundation 은 lib/states-data.ts 의 avgPropertyTaxPct 에 실제로 배선돼 있다.
  {
    name: 'Tax Foundation',
    url: 'https://taxfoundation.org/data/all/state/property-taxes-by-state-2023/',
    role: 'US effective property tax rate as a share of owner-occupied home value',
  },
] as const;
