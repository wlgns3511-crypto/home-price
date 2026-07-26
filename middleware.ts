import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * homepricepeek middleware — 2026-05-06 Phase 6 410 kill cohort +
 * 2026-05-26 Phase 7 Compare-Wrap 8th pilot surveyability (Trap #121).
 *
 * ─── 2026-05-26 Phase 7 Compare-Wrap 8th pilot — Trap #121 surveyability ──
 *
 * `/compare/state/[slugs]/` is INTRODUCED for 5 canonical state-pair pilots
 * as `/compare/state/{a}-vs-{b}/`. Belt-and-suspender defense:
 *
 *   1. Next.js `dynamicParams = false` on the route auto-404s unknown slugs
 *      (Trap #127, primary mechanism).
 *   2. THIS middleware enumerates the 5-canonical allowlist and:
 *        - Passes pilot paths through with `x-homepricepeek-edge-version`
 *          stamped to the 8th-pilot identifier.
 *        - Soft-quarantines non-pilot `/compare/state/*` with
 *          `X-Robots-Tag: noindex, nofollow` (defense in depth).
 *   3. Legacy /compare/{a-vs-b}/ city-comparison route is preserved — the
 *      8th-pilot allowlist is a sub-path addition under /compare/state/, not
 *      a global /compare/* override (homepricepeek does NOT hard-kill /compare/*).
 *
 * 5-canonical allowlist is the SAME ordering as
 * lib/state-pair-compare-decoder.ts STATE_PAIR_PILOT_SLUGS (alphabetised pairs).
 */

const ES_KILL_RE = /^\/es(\/|$)/;
const EMBED_KILL_RE = /^\/embed(\/|$)/;

// /compare/country/* — 410 Gone (2026-07-24). 50개국 전조합 × 양방향 = 2,450 페이지가
// 매일 프리렌더되고 있었다. 내부 링크 0 · 사이트맵 0 · noindex 0 — 오직 robots.txt
// `Disallow: /compare/` 로만 가려져 있었고, 그게 문제였다: 크롤을 막으면 크롤러가
// 페이지를 재확인 못 해 색인이 안 죽는다. 형제 /compare/[slugs]/ (도시 비교) 는
// 2026-04-26 애드센스 scaled-content 대응 때 noindex 를 받았는데 여기만 누락됐다.
// 같은 파생 교차곱이라 판정도 같다. 슬러그·원본은 ops/compare-country-410-snapshot.json.
const COMPARE_COUNTRY_KILL_RE = /^\/compare\/country(\/|$)/;

// /country/* — 410 Gone (2026-07-24). data/main.db `countries` 50행이 3/31 동결 합성
// 시드였다(28개 고유값 · 50/50 이 $5,000 배수 · 모기지율 50/50 이 소수 1자리). 그런데
// 페이지는 schema.org datasetSchema 의 `creator` 로 OECD Housing Prices 를 데이터
// 제작자라고 검색엔진에 선언하고 있었다 — 레포 전체에 OECD 인제스천 스크립트 0건,
// data/sources.json 15개 필드에도 OECD 0건. 실재하지 않는 출처였다.
// 인바운드 내부 링크 0 · 사이트맵 0 인 고아 라우트라 연쇄 없음.
// robots.txt 에 /country/ Disallow 를 넣지 말 것 — 크롤을 막으면 크롤러가 이 410 을
// 못 읽어 색인이 안 죽는다(같은 이유로 /compare/country/ 도 robots 가 아니라 410).
// 슬러그·데이터·원본 라우트는 ops/country-410-snapshot.json + ops/country-page.tsx.killed-20260724.
const COUNTRY_KILL_RE = /^\/country(\/|$)/;

// 도시 축 전량 — 410 Gone (2026-07-26). data/main.db `cities` 194행이 `countries` 50행과
// 같은 2026-03-31 동결 합성 시드였다: avg_home_price_usd 가 194개 도시에 46개 값뿐이고
// 194/194 가 천 배수·163/194 가 만 배수, rent_to_income_ratio 는 21개 값, mortgage_rate_pct
// 는 최대 42.0·최소 0.0. 레포에 도시 인제스천 스크립트 0건이고 data/sources.json 15개
// 필드에도 cities 항목이 없다 — 측정값이 아니라 편집 추정치다.
//
// 같은 테이블이 먹이는 파생 축이라 판정도 같다:
//   /city/{slug}     194 (라이브 200·사이트맵 등재·index,follow)  ← 유일하게 색인돼 있던 축
//   /region/{slug}    15 (라이브 200·robots 메타 없음)
//   /budget/{slug}    13 (라이브 200·robots 메타 없음)
//   /insights/{slug}   5 + 허브 (라이브 200. lib/insights-data.ts 가 cities 를 5회 쿼리)
//   /afford/{slug}   194 (라이브 522 = 오리진 타임아웃, 그런데 매 빌드 프리렌더)
//   /rankings/{type}  24 (라이브 404, 프리렌더 155장)
//   /compare/{a-vs-b} 4,311 (라이브 404, 프리렌더 2,650장)
// 유지되는 축은 주(州)뿐 — lib/states-data.ts(Zillow ZHVI·FHFA HPI·Census ACS·Tax
// Foundation·FRED)와 data/hpi-quarterly.json(FRED STHPI 51시리즈, fetchedAt 2026-06-01).
//
// robots.txt 에 이 프리픽스들의 Disallow 를 넣지 말 것 — 크롤을 막으면 크롤러가 410 을
// 못 읽어 색인이 안 죽는다(/country/ 때와 같은 이유).
// 슬러그·행·Bing 실측·원본 라우트는 ops/city-410-snapshot.json + ops/app_*.killed-20260726.
const CITY_AXIS_KILL_RE = /^\/(city|region|budget|afford|rankings|insights)(\/|$)/;

// /compare/ 도시쌍 + 허브. /compare/state/* 5개 파일럿은 위 COMPARE_STATE_DETAIL_RE 에서
// 먼저 처리되므로 여기 도달하지 않는다. 허브(/compare/)는 죽은 도시쌍 100개를 링크하고
// 있었다 — 라이브 200 인데 링크 전부 404.
const COMPARE_CITY_KILL_RE = /^\/compare(\/(?!state(\/|$))[^/]*)?\/?$/;

// Trap #121 — middleware-surveyable enumeration. Must match
// lib/state-pair-compare-decoder.ts STATE_PAIR_PILOT_SLUGS exactly.
const COMPARE_STATE_ALLOWLIST: ReadonlySet<string> = new Set([
  'california-vs-texas',
  'florida-vs-new-york',
  'massachusetts-vs-new-hampshire',
  'new-jersey-vs-pennsylvania',
  'oregon-vs-washington',
]);

// Matches /compare/state/{slug}/  (trailing slash optional, no nested segments).
const COMPARE_STATE_DETAIL_RE = /^\/compare\/state\/([^/]+)\/?$/;

const EDGE_VERSION = '2026-05-26-state-pair-pilot-8th';

const GONE_BODY = `<!doctype html><html><head><meta charset="utf-8"><title>410 Gone</title><meta name="robots" content="noindex"></head><body><h1>410 Gone</h1><p>This URL was retired and is no longer served. Active surfaces are at <a href="/">homepricepeek.com</a>.</p></body></html>`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // (2026-07-26) `/es/accra/` → `/city/accra/` 301 삭제. "Accra is a complete
  // canonical city row" 라는 전제가 틀렸다 — cities 194행 전부 미출처 추정치라
  // 목적지가 410 이 됐다. 301→410 체인 대신 ES_KILL_RE 가 직접 410 한다.

  // ── /compare/state/{slug}/ — pilot allowlist gate (Trap #121) ────────────
  const stateMatch = pathname.match(COMPARE_STATE_DETAIL_RE);
  if (stateMatch) {
    const slug = stateMatch[1];
    if (COMPARE_STATE_ALLOWLIST.has(slug)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-pathname', pathname);
      const res = NextResponse.next({ request: { headers: requestHeaders } });
      res.headers.set('x-homepricepeek-edge-version', EDGE_VERSION);
      return res;
    }
    const res = new NextResponse('Not Found', { status: 404 });
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('x-homepricepeek-edge-version', EDGE_VERSION);
    return res;
  }

  if (
    ES_KILL_RE.test(pathname) ||
    EMBED_KILL_RE.test(pathname) ||
    COMPARE_COUNTRY_KILL_RE.test(pathname) ||
    COUNTRY_KILL_RE.test(pathname) ||
    CITY_AXIS_KILL_RE.test(pathname) ||
    COMPARE_CITY_KILL_RE.test(pathname)
  ) {
    return new NextResponse(GONE_BODY, {
      status: 410,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
        'x-homepricepeek-edge-version': EDGE_VERSION,
        'cache-control': 'public, max-age=0, s-maxage=86400',
      },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-homepricepeek-edge-version', EDGE_VERSION);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
