import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/site.config';
import { getAllStates } from '@/lib/states-data';

const c = siteConfig;

// 2026-07-26 — `search()`(lib/db → cities 194행)를 쓰고 있었는데 그 축이 전량 410 이 됐다.
// 남은 검색 대상은 주 51개뿐이라 인메모리 필터로 충분하다. ponytail: FTS 인덱스 불필요.
export const metadata: Metadata = {
  title: 'Search States',
  description: `Search home prices and affordability across all 51 US states in ${c.name}.`,
  robots: { index: false, follow: true },
  alternates: { canonical: '/search/' },
  openGraph: { url: "/search/" },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const needle = (q || '').trim().toLowerCase();
  const results = needle
    ? getAllStates().filter(s => s.name.toLowerCase().includes(needle) || s.code.toLowerCase() === needle)
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Search States</h1>
      <form action="/search" method="GET" className="mb-6 flex gap-2">
        <input type="text" name="q" defaultValue={q || ''} placeholder="Search states..."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      {q && (
        <p className="text-slate-500 mb-4">{results.length} results for &quot;{q}&quot;</p>
      )}

      <div className="border rounded-lg overflow-hidden">
        {results.map((s, i) => (
          <Link key={s.slug} href={`/state/${s.slug}/`}
            className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{s.name} <span className="text-slate-400">({s.code})</span></span>
          </Link>
        ))}
        {q && results.length === 0 && (
          <p className="p-6 text-center text-slate-500">No results found. Try a state name or two-letter code.</p>
        )}
      </div>
    </div>
  );
}
