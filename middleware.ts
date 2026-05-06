import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ES_KILL_RE = /^\/es(\/|$)/;
const EMBED_KILL_RE = /^\/embed(\/|$)/;
const EDGE_VERSION = '2026-05-06-phase6-410-multi-vintage';

const GONE_BODY = `<!doctype html><html><head><meta charset="utf-8"><title>410 Gone</title><meta name="robots" content="noindex"></head><body><h1>410 Gone</h1><p>This URL was retired and is no longer served. Active surfaces are at <a href="/">homepricepeek.com</a>.</p></body></html>`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
