import { DailyPulse } from "@/components/DailyPulse";
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/site.config';
import { getStatesSortedByPrice } from '@/lib/states-data';
import { formatCurrency, formatPercent } from '@/lib/format';
import { datasetSchema } from '@/lib/schema';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const c = siteConfig;

// 2026-07-26 — 홈이 도시 축(lib/db → data/main.db cities 194행)을 헤드라인으로 쓰고 있었다.
// 그 194행은 미출처 편집 추정치라 전량 410 이 됐다(middleware.ts CITY_AXIS_KILL_RE).
// 홈은 이제 실제 인제스천된 축만 쓴다: lib/states-data.ts(Zillow ZHVI Apr 2025 · FHFA HPI ·
// Census ACS 2023 · Tax Foundation 2023 · NAIC 2023 · FRED MORTGAGE30US).
// 제목의 "500+ Cities Worldwide" 도 같은 거짓이었다 — 도시 행은 194개였고 그마저 추정치.
export const metadata: Metadata = {
  title: `${c.name} — Home Prices & Affordability in All 51 US States`,
  description: c.description,
  alternates: { canonical: '/' },
  openGraph: { title: `${c.name} — US Home Prices by State`, description: c.description, url: '/' },
};

export default function HomePage() {
  const states = getStatesSortedByPrice('desc');
  const nationalMedian = states.map(s => s.medianHomePrice).sort((a, b) => a - b)[Math.floor(states.length / 2)];
  const priciest = states.slice(0, 10);
  const cheapest = states.slice(-10).reverse();

  return (
      <>
      <DailyPulse />
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(c.name, c.description, '/')) }} />
      <h1 className="text-3xl font-bold mb-2">{c.name}</h1>
      <p className="text-lg text-slate-600 mb-8">{c.description}</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{states.length}</div>
          <div className="text-sm text-slate-500">States + DC</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{formatCurrency(nationalMedian)}</div>
          <div className="text-sm text-slate-500">Median of state medians</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{c.dataSource.year}</div>
          <div className="text-sm text-slate-500">Data Year</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-bold mb-3">Most expensive states</h2>
          <div className="border rounded-lg overflow-hidden">
            {priciest.map((s, i) => (
              <Link key={s.slug} href={`/state/${s.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
                <span><span className="text-slate-400 mr-2">{i + 1}.</span>{s.name}</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(s.medianHomePrice)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Most affordable states</h2>
          <div className="border rounded-lg overflow-hidden">
            {cheapest.map((s, i) => (
              <Link key={s.slug} href={`/state/${s.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
                <span><span className="text-slate-400 mr-2">{i + 1}.</span>{s.name}</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(s.medianHomePrice)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Year-over-year change ranges from {formatPercent(Math.min(...states.map(s => s.yoyChange)))} to{' '}
        {formatPercent(Math.max(...states.map(s => s.yoyChange)))} across the {states.length} state pages.{' '}
        <Link href="/state/" className="font-semibold text-blue-700 hover:underline">
          See all {states.length} states &rarr;
        </Link>
      </p>

      <CrossSiteLinks current={c.name} />
    </div>
      </>
  );
}
