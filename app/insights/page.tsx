import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { INSIGHT_TOPICS, readChangeLog } from '@/lib/insights-data';
import { breadcrumbSchema } from '@/lib/schema';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const c = siteConfig;
export const revalidate = 86400;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: `Housing Market Insights — ${c.name}`,
  description: 'Monthly-refreshed rankings: affordable first-home markets, biggest price drops, rent-vs-buy winners, luxury markets under pressure, and emerging cities to watch.',
  alternates: { canonical: '/insights/' },
  openGraph: { url: '/insights/' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function InsightsHub() {
  const topics = Object.values(INSIGHT_TOPICS);
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Insights', url: '/insights/' }];

  return (
    <main className="max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Housing Market Insights</h1>
        <p className="text-slate-600 leading-relaxed">
          Five fixed-URL rankings of the global price-to-income, price-to-rent, and 1-year-change distributions in the city DB. Each page is rebuilt against the most recent ingestion of OECD price-to-income series, US Census ACS housing tables, and named national statistics offices.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map(t => {
          const log = readChangeLog(t.slug);
          const updated = log?.lastUpdated ?? null;
          return (
            <a
              key={t.slug}
              href={`/insights/${t.slug}/`}
              className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition"
            >
              <h2 className="font-semibold text-slate-900 mb-1">{t.h1}</h2>
              <p className="text-sm text-slate-600 line-clamp-2">{t.description}</p>
              {updated && (
                <p className="text-xs text-slate-500 mt-2">Updated {formatDate(updated)}</p>
              )}
            </a>
          );
        })}
      </div>

      <CrossSiteLinks current={c.name} />
    </main>
  );
}
