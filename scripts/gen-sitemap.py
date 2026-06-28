#!/usr/bin/env python3
"""Generate static sitemap.xml from SQLite DB → public/sitemap.xml

Next.js 16 turbopack + VPS 환경에서 동적 sitemap.ts가 500 에러를 발생시키므로,
빌드 전에 이 스크립트로 정적 sitemap.xml을 생성합니다.

사용법: python3 scripts/gen-sitemap.py
빌드 전에 실행하거나 mac-build-deploy.sh에 추가하세요.

커스터마이즈: 사이트별 추가 라우트(state, industry 등)는 이 파일을 수정하세요.
"""
from pathlib import Path
import json
import re
import sqlite3

PROJECT = Path(__file__).parent.parent
DB_PATH = PROJECT / "data" / "main.db"
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

# entity slug 추출
entity_slug = "item"
for line in config_text.split("\n"):
    if "slug:" in line and "'" in line and "entity" not in line:
        entity_slug = line.split("'")[1]
        break

# table name 추출
table_name = "items"
for line in config_text.split("\n"):
    if "tableName:" in line and "'" in line:
        table_name = line.split("'")[1]
        break

# slug column 추출
slug_col = "slug"
for line in config_text.split("\n"):
    if "slugColumn:" in line and "'" in line:
        slug_col = line.split("'")[1]
        break


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
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    urls = []

    # Static pages
    static_pages = [
        ('/', 1.0, SITE_REBUILT),
        ('/compare/', 0.5, SITE_REBUILT),
        ('/search/', 0.5, SITE_REBUILT),
        # /blog/ + /guide/ surfaces 410-killed (2026-05) — not emitted (Trap #134)
        ('/about/', 0.5, ABOUT_REVIEWED),
        ('/methodology/', 0.5, METHODOLOGY_REVIEWED),
        ('/privacy/', 0.5, LEGAL_REVIEWED),
        ('/terms/', 0.5, LEGAL_REVIEWED),
        ('/contact/', 0.5, LEGAL_REVIEWED),
        ('/disclaimer/', 0.5, LEGAL_REVIEWED),
        # /rankings/all/ removed 2026-05-24: no /rankings/ hub exists and
        # rankings/[type]/ has dynamicParams=false ('all' isn't a valid slug).
        # Each ranking is emitted individually below via FILTER_RANKINGS +
        # getAllRankings(). Restoring an index would require a new app/rankings/page.tsx.
    ]
    for page, priority, lastmod in static_pages:
        urls.append((f"{BASE}{page}", priority, lastmod))

    # ─── /city/{slug} DROPPED 2026-04-28 (HCU sitemap-route mismatch) ───────────
    # site.config.entity.slug='city' but actual route is app/[city]/[slug]/
    # which only renders pre-defined slugs via getAllSlugs().slice(0,500).
    # The /city/X/ URL pattern emitted here matches nothing — all 194 returned 404.
    # Drop entirely: the [city][slug] route is orphaned/needs a separate refactor
    # before announcing in sitemap.
    # for row in c.execute(f"SELECT {slug_col} as slug FROM {table_name} ORDER BY {slug_col}"):
    #     urls.append((f"{BASE}/{entity_slug}/{row['slug']}/", 0.7))

    # Tier S HCU expansion 2026-04-21 — state pages + monthly-payment subpages (51 × 2)
    state_slugs = [
        'alabama', 'alaska', 'arizona', 'arkansas', 'california',
        'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
        'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
        'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
        'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri',
        'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey',
        'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
        'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina',
        'south-dakota', 'tennessee', 'texas', 'utah', 'vermont',
        'virginia', 'washington', 'washington-dc', 'west-virginia', 'wisconsin', 'wyoming',
    ]
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

    conn.close()

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
