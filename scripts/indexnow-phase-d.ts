/**
 * indexnow-phase-d.ts — submit homepricepeek's 51 state pages + home + sitemap
 * to IndexNow after the depth-injection deploy. Phase D scope: state pages only,
 * no city/country (those have a separate sweep).
 *
 * Bing/Yandex IndexNow accepts up to 10,000 URLs per POST; we batch under 100
 * to keep retry pages quick.
 */

import { STATES } from '../lib/states-data';

const HOST = 'homepricepeek.com';
const KEY = '2f7a5f5ff624434084132a2b54d3388d'; // homepricepeek IndexNow key, also at /public/{KEY}.txt
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function main() {
  const urls = [
    `https://${HOST}/`,
    `https://${HOST}/sitemap.xml`,
    ...STATES.map(s => `https://${HOST}/state/${s.slug}/`),
  ];

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  console.log(`indexnow-phase-d: submitting ${urls.length} URLs to ${ENDPOINT}`);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  console.log(`status=${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    process.exit(1);
  }
  console.log(`indexnow-phase-d: ${urls.length} URLs accepted (HTTP ${res.status})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
