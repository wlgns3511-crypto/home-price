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

  // Evidence-backed legacy locale recovery. The Spanish shell was retired,
  // but Accra is a complete canonical city row and should not remain a 410.
  if (/^\/es\/accra\/?$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/city/accra/';
    return NextResponse.redirect(url, 301);
  }

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
    COUNTRY_KILL_RE.test(pathname)
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
