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

  if (ES_KILL_RE.test(pathname) || EMBED_KILL_RE.test(pathname)) {
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
