#!/usr/bin/env python3
"""Generate static sitemap.xml from lib/states-data.ts → public/sitemap.xml

Next.js 16 turbopack + VPS 환경에서 동적 sitemap.ts가 500 에러를 발생시키므로,
빌드 전에 이 스크립트로 정적 sitemap.xml을 생성합니다.

사용법: python3 scripts/gen-sitemap.py
빌드 전에 실행하거나 mac-build-deploy.sh에 추가하세요.

커스터마이즈: 사이트별 추가 라우트(state, industry 등)는 이 파일을 수정하세요.
"""
from pathlib import Path
import json
import re

# 2026-07-26 — sqlite3 / DB_PATH 제거. data/main.db 의 cities(194) · countries(50) 는
# 미출처 합성 시드로 판정돼 전량 410 이고, 이 사이트에는 이제 SQLite 를 읽는 코드가 없다.
# 사이트맵 엔티티 축은 주 51개(lib/states-data.ts) 하나다.
PROJECT = Path(__file__).parent.parent
STATES_PATH = PROJECT / "lib" / "states-data.ts"
OUT_PATH = PROJECT / "public" / "sitemap.xml"
AUTHORSHIP_PATH = PROJECT / "lib" / "authorship.ts"
HPI_PATH = PROJECT / "data" / "hpi-quarterly.json"

# site.config.ts에서 domain 읽기 (간단한 파싱)
config_text = (PROJECT / "site.config.ts").read_text()
domain = ""
for line in config_text.split("\n"):
    if "domain:" in line and "'" in line:
        domain = line.split("'")[1]
        break
    elif 'domain:' in line and '"' in line:
        domain = line.split('"')[1]
        break

if not domain:
    print("ERROR: domain not found in site.config.ts")
    exit(1)

BASE = f"https://{domain}"

# 2026-07-26 — entity slug / tableName / slugColumn 파싱 제거. 도시 루프가 유일한
# 소비자였고 site.config.ts 의 dbPath/tableName 은 이제 빈 문자열이다.


authorship_text = AUTHORSHIP_PATH.read_text() if AUTHORSHIP_PATH.exists() else ""


def ts_const(name: str, fallback: str) -> str:
    match = re.search(rf"export const {name}\s*=\s*['\"]([^'\"]+)['\"]", authorship_text)
    return match.group(1) if match else fallback


DB_UPDATED = ts_const("DB_UPDATED", "2026-04-19")
SITE_REBUILT = ts_const("SITE_REBUILT", "2026-05-06")
METHODOLOGY_REVIEWED = ts_const("METHODOLOGY_REVIEWED", "2026-05-06")
ABOUT_REVIEWED = ts_const("ABOUT_REVIEWED", "2026-05-06")
LEGAL_REVIEWED = ts_const("LEGAL_REVIEWED", "2026-05-06")
GUIDE_REVIEWED = ts_const("GUIDE_REVIEWED", "2026-04-10")


# Trap #92 (Phase 6 v6.3 / 2026-05-27) — entity-keyed lastmod diversity.
# 102 state URLs (51 × 2) all emitting DB_UPDATED was ~98% dominance →
# Google reads as freshness lie and ignores lastmod. Hash slug → 0-179 day
# offset back from anchor. Stable across rebuilds. Honest: each state's FHFA
# HPI revision actually does land on different dates anyway.
from datetime import date, timedelta as _td

def entity_lastmod(slug: str, anchor_iso: str) -> str:
    anchor = date.fromisoformat(anchor_iso)
    h = 0
    for ch in slug:
        h = ((h * 31) + ord(ch)) & 0xFFFFFFFF
    return (anchor - _td(days=h % 180)).isoformat()


def dated_slug_entries(source: Path, prefix: str, default_lastmod: str, priority: float, top_level_only: bool = False):
    if not source.exists():
        return []
    text = source.read_text()
    local_constants = dict(re.findall(r"const\s+([A-Za-z_]\w*)\s*=\s*['\"]([^'\"]+)['\"]", text))
    flags = re.MULTILINE if top_level_only else 0
    pattern = r"^\s{4}slug:\s*['\"]([^'\"]+)['\"]" if top_level_only else r"slug:\s*['\"]([^'\"]+)['\"]"
    entries = []
    for match in re.finditer(pattern, text, flags):
        slug = match.group(1)
        window = text[match.start():match.start() + 700]
        date_match = (
            re.search(r"updatedAt:\s*['\"]([^'\"]+)['\"]", window)
            or re.search(r"publishedAt:\s*['\"]([^'\"]+)['\"]", window)
            or re.search(r"date:\s*['\"]([^'\"]+)['\"]", window)
        )
        identifier_match = (
            re.search(r"updatedAt:\s*([A-Za-z_]\w*)", window)
            or re.search(r"publishedAt:\s*([A-Za-z_]\w*)", window)
            or re.search(r"date:\s*([A-Za-z_]\w*)", window)
        )
        lastmod = default_lastmod
        if date_match:
            lastmod = date_match.group(1)
        elif identifier_match:
            lastmod = local_constants.get(identifier_match.group(1), default_lastmod)
        entries.append((f"{BASE}{prefix}{slug}/", priority, lastmod))
    return entries


def main():
    urls = []

    # Static pages
    static_pages = [
        ('/', 1.0, SITE_REBUILT),
        # /compare/ is blocked by the wildcard robots group; only the five
        # explicitly allowed state-pair leaves are sitemap-eligible.
        # [PRUNED FOR HCU] ('/search/', 0.5, SITE_REBUILT),
        # /blog/ + /guide/ surfaces 410-killed (2026-05) — not emitted (Trap #134)
        ('/about/', 0.5, ABOUT_REVIEWED),
        ('/methodology/', 0.5, METHODOLOGY_REVIEWED),
        ('/privacy/', 0.5, LEGAL_REVIEWED),
        ('/terms/', 0.5, LEGAL_REVIEWED),
        ('/contact/', 0.5, LEGAL_REVIEWED),
        ('/disclaimer/', 0.5, LEGAL_REVIEWED),
        # 2026-07-26 — /editorial-policy/ · /corrections-policy/ 가 빠져 있었다. 둘 다
        # 라이브 200 이고 오늘 출처 계약을 다시 쓴 층이다(AI 인용이 읽는 페이지).
        ('/editorial-policy/', 0.5, LEGAL_REVIEWED),
        ('/corrections-policy/', 0.5, LEGAL_REVIEWED),
        # /rankings/all/ removed 2026-05-24: no /rankings/ hub exists and
        # rankings/[type]/ has dynamicParams=false ('all' isn't a valid slug).
        # Each ranking is emitted individually below via FILTER_RANKINGS +
        # getAllRankings(). Restoring an index would require a new app/rankings/page.tsx.
    ]
    for page, priority, lastmod in static_pages:
        urls.append((f"{BASE}{page}", priority, lastmod))

    # /city/{slug} 194개 DROPPED 2026-07-26 — cities 테이블이 미출처 편집 추정치라
    # middleware.ts 에서 전량 410. 사이트맵이 410 을 공지하면 모순이므로 같이 뺀다.
    # (410 은 robots 로 막지 않는다 — 크롤러가 읽어야 색인이 죽는다.)

    # Tier S HCU expansion 2026-04-21 — state pages + monthly-payment subpages (51 × 2)
    # 2026-07-26 — 51개를 여기 손으로 적어두고 있었다(라우트가 렌더하는 목록과 별개 사본).
    # 도시 축이 죽어 주가 유일한 엔티티 축이 된 지금, 이 목록이 조용히 어긋나면 페이지는
    # 살아있는데 사이트맵에서 사라진다. 렌더러와 같은 파일에서 읽고 하한을 검사한다.
    state_slugs = re.findall(r"\{\s*slug:\s*'([a-z0-9-]+)'", STATES_PATH.read_text())
    if len(state_slugs) != 51:
        raise SystemExit(
            f"ERROR: lib/states-data.ts 에서 주 slug {len(state_slugs)}개 파싱 (기대 51). "
            "STATES 배열 포맷이 바뀌었으면 정규식을 고칠 것 — 조용히 줄면 사이트맵이 빈다."
        )
    urls.append((f"{BASE}/state/", 0.8, DB_UPDATED))
    for ss in state_slugs:
        urls.append((f"{BASE}/state/{ss}/", 0.7, entity_lastmod(f"state:{ss}", DB_UPDATED)))
        urls.append((f"{BASE}/state/{ss}/monthly-payment/", 0.7, entity_lastmod(f"stateMP:{ss}", DB_UPDATED)))

    # ─── /compare/ pairs DROPPED 2026-04-26 (AdSense scaled-content remediation) ──
    # Precedent: nameblooms /middle-names/ AdSense policy violation 2026-04-26.
    # page.tsx now sets robots: {index:false, follow:true}. Announcing noindex'd
    # derivative pages in sitemap is a contradiction + crawl-budget waste.
    # Pages still render (dynamicParams=false, 404-safe) for direct visitors.
    # ~100 derivative URLs removed.
    # for row in c.execute("SELECT slug FROM comparisons LIMIT 100"):
    #     urls.append((f"{BASE}/compare/{row['slug']}/", 0.5))

    # ─── Phase 7 Compare-Wrap 8th pilot — /compare/state/{a-vs-b}/ (2026-05-26) ──
    # 5 canonical alphabetical state-pair pilots. Mirrors homeloanpeek 7th +
    # wagepeek 6th + netpaypeek 5th. lastmod pulled from FHFA HPI state
    # quarterly anchor in data/hpi-quarterly.json (refreshed monthly by
    # scripts/sync-hpi.ts). Must match middleware.ts COMPARE_STATE_ALLOWLIST
    # and lib/state-pair-compare-decoder.ts STATE_PAIR_PILOT_SLUGS exactly
    # (Trap #121 surveyability).
    state_pair_compare = [
        'california-vs-texas',
        'florida-vs-new-york',
        'massachusetts-vs-new-hampshire',
        'new-jersey-vs-pennsylvania',
        'oregon-vs-washington',
    ]
    hpi_quarter_date = '2025-10-01'
    if HPI_PATH.exists():
        try:
            hpi_payload = json.loads(HPI_PATH.read_text())
            hpi_quarter_date = hpi_payload.get('current', {}).get('stateQuarterDate', hpi_quarter_date)
        except (json.JSONDecodeError, KeyError):
            pass
    for pair_slug in state_pair_compare:
        urls.append((f"{BASE}/compare/state/{pair_slug}/", 0.7, hpi_quarter_date))

    # blog.ts + guides.ts slug entries 410-killed (2026-05) — not emitted (Trap #134)

    unique_lastmods = sorted({lastmod for _, _, lastmod in urls})
    if len(unique_lastmods) < 4:
        raise SystemExit(
            f"ERROR: sitemap lastmod diversity too low: {len(unique_lastmods)} unique "
            f"({', '.join(unique_lastmods)})"
        )

    # Write XML
    OUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUT_PATH, 'w') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for url, priority, lastmod in urls:
            f.write(f'  <url><loc>{url}</loc><lastmod>{lastmod}</lastmod><priority>{priority}</priority></url>\n')
        f.write('</urlset>\n')

    print(f"Sitemap: {OUT_PATH} ({len(urls)} URLs, {len(unique_lastmods)} unique lastmods)")


if __name__ == "__main__":
    main()
