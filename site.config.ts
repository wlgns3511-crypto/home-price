import type { SiteConfig } from './lib/types';

export const siteConfig: SiteConfig = {
  // ── Basic Info ──────────────────────────────────────────
  name: 'HomePricePeek',
  domain: 'homepricepeek.com',
  // 2026-07-26 — "Anchored to OECD … and national statistics offices" 를 지웠다. 둘 다
  // 레포에 인제스천이 0건이고 data/sources.json 15개 필드에도 없다(= 실재하지 않는 출처).
  // 이 문자열은 meta description·OG·WebSite/Organization JSON-LD·홈 H1 부제로 전 페이지에
  // 나가므로 314개 URL 전부가 같은 거짓을 발행하고 있었다. 남긴 5개는 실배선된 것만.
  // 2026-07-26 (2차) — "City pages carry editorial estimates…" 문장 삭제. 그 도시 페이지
  // 194장은 같은 날 전량 410 이 됐다(미출처 편집 추정치). 발행 중인 축만 남긴다.
  description:
    'Housing affordability for 51 US states — anchored to Zillow ZHVI, FHFA HPI, Census ACS, FRED MORTGAGE30US, and Tax Foundation.',

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
  // 2026-07-26 — 'city' / 'cities' 를 가리키고 있었다. data/main.db 의 cities(194) ·
  // countries(50) 는 둘 다 미출처 합성 시드로 판정돼 전량 410 이고, 그 테이블을 읽던
  // lib/db.ts 는 삭제됐다 — 이제 이 사이트에 SQLite 를 읽는 코드 경로가 없다.
  // SiteConfig 타입이 요구하는 필드라 블록은 남기되, 살아있는 유일한 엔티티 축
  // (주 51개 = lib/states-data.ts, 인제스천된 출처 앵커 보유)을 가리키게 고쳤다.
  // dbPath/tableName 을 비워 두는 이유: 다음 세션이 'cities' 를 보고 되살리지 않게.
  entity: {
    slug: 'state',
    label: 'States',
    labelSingular: 'State',
    dbPath: '',
    tableName: '',
    slugColumn: 'slug',
    nameColumn: 'name',
    categoryColumn: null,
  },

  // ── Monetization ────────────────────────────────────────
  gaId: 'G-GF31974ES5',
  adsenseId: 'ca-pub-5724806562146685',

  // ── Network ─────────────────────────────────────────────

  // ── Data Source (single primary anchor; full source list in lib/authorship.ts) ──
  // 2026-07-26 — OECD Housing Prices → Zillow ZHVI. 이 한 필드가 layout.tsx 푸터
  // ("Powered by data from X", 전 페이지)와 state/city/insights 의 FreshnessTag source 로
  // 흐른다 → 51개 주 페이지가 자기 TrustBlock(Zillow·FHFA·ACS·FRED)과 정면으로 모순되는
  // 출처를 달고 있었다. year 도 2026 → 2025: ZHVI 빈티지가 2025-04 이고, about 페이지가
  // "We do not relabel a corpus year" 라고 약속해 놓고 홈에서 현재 연도를 찍고 있었다.
  dataSource: {
    name: 'Zillow Home Value Index (ZHVI)',
    url: 'https://www.zillow.com/research/data/',
    year: 2025,
  },

  // ── Honest freshness (updated manually on each DB rebuild) ──
  dbUpdated: '2026-04-19',

  // ── Byline (consistent editor across the network) ─────────
  author: {
    name: 'James Park',
    role: 'Editor',
    bio: 'James Park curates public housing data for a small network of free data tools. HomePricePeek aggregates Zillow ZHVI, FHFA HPI, Census ACS, FRED mortgage rates, and Tax Foundation property-tax rates into comparable per-state views. Reach out through the contact form — every correction request is read.',
    sameAs: [
      'https://datapeekfacts.com',
      'https://costbycity.com',
      'https://salarybycity.com',
    ],
  },
};
