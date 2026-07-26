#!/usr/bin/env python3
"""
indexnow-410-removal.py — 410 으로 죽인 URL 의 철회 공지.

죽인 시점에 노출이 실재했으면 **회수할 색인이 실재한다** — IndexNow 에 다시 제출하면
Bing 이 재크롤해서 410 을 보고 인덱스에서 뺀다. 이게 "공지"의 전부다.
(ingredipeek 의 107개 제거는 노출 0이라 이 단계를 안 했다 — 차이는 노출 실측.)

  /country/ + /compare/country/  2,500개 (c7a5411) — Bing 노출 201
  city 축 7계열          4,763개 (2026-07-26) — Bing 노출 101 / 클릭 7
                         (/city 43·3, /rankings 36·2, /compare 11·1, /region 6·0, /afford 5·1)

URL 목록은 ops/*-410-snapshot.json 에서 읽는다. 스냅샷이 복구 경로이자 SoT 이므로
여기에 슬러그를 다시 하드코딩하지 않는다. 2026-07-26 — 인자를 안 주면 ops/ 의 모든
스냅샷을 읽는다: 킬마다 이 파일을 손으로 고쳐야 하면 반쪽만 이행된다
([[trap-keepset-hand-append-bing-earner-20260726]]). 이미 뺀 URL 재제출은 무해.

Usage: python3 scripts/indexnow-410-removal.py [--dry-run] [ops/foo-410-snapshot.json ...]
"""
import glob
import json
import os
import sys
import urllib.request

HOST = 'homepricepeek.com'
KEY = '2f7a5f5ff624434084132a2b54d3388d'  # public/{KEY}.txt
ENDPOINT = 'https://api.indexnow.org/indexnow'
BATCH = 1000  # 상한은 10,000 이지만 실패 시 재시도 단위를 작게 둔다
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# live_slugs_at_kill 만 담은 구형 스냅샷은 프리픽스가 파일 안에 없다. 파일명에서
# 유도하지 않고(compare-country → /compare/country 같은 마법) 여기 명시한다.
LEGACY_PREFIX = {
    'country-410-snapshot.json': '/country',
    'compare-country-410-snapshot.json': '/compare/country',
}


def snapshot_urls(path):
    """스냅샷 1개 → 절대 URL 목록. 두 포맷을 다 읽는다.

    신형: urls_410 = {계열: [상대경로, ...]}  — 경로가 스냅샷 안에 그대로 있다
    구형: live_slugs_at_kill = [slug, ...]    — 프리픽스는 LEGACY_PREFIX 에서
    """
    snap = json.load(open(path, encoding='utf-8'))
    if 'urls_410' in snap:
        return [
            f'https://{HOST}{p}'
            for group in snap['urls_410'].values()
            for p in group
        ]
    prefix = LEGACY_PREFIX[os.path.basename(path)]
    return [f'https://{HOST}{prefix}/{s}/' for s in snap['live_slugs_at_kill']]


def killed_urls(paths):
    out = []
    for path in paths:
        urls = snapshot_urls(path)
        print(f'  {os.path.relpath(path, ROOT)}: {len(urls)} URLs')
        out += urls
    return out


def post(urls):
    body = json.dumps({
        'host': HOST,
        'key': KEY,
        'keyLocation': f'https://{HOST}/{KEY}.txt',
        'urlList': urls,
    }).encode()
    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={'Content-Type': 'application/json; charset=utf-8'},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status


def main():
    dry = '--dry-run' in sys.argv
    paths = [a for a in sys.argv[1:] if not a.startswith('--')]
    paths = [os.path.abspath(p) for p in paths] or sorted(
        glob.glob(os.path.join(ROOT, 'ops', '*-410-snapshot.json'))
    )
    if not paths:
        sys.exit('FAIL: ops/*-410-snapshot.json 이 없다 — 공지할 킬 목록이 없음')
    urls = killed_urls(paths)
    print(f'410 removal notice: {len(urls)} URLs, batch={BATCH}, dry_run={dry}')
    if dry:
        for u in urls[:3] + ['...'] + urls[-3:]:
            print(' ', u)
        return
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        status = post(chunk)
        print(f'  batch {i // BATCH + 1}: {len(chunk)} URLs → HTTP {status}')
        if status not in (200, 202):
            sys.exit(f'FAIL: HTTP {status}')
    print('done')


if __name__ == '__main__':
    main()
