/**
 * Phase 7 Compare-Wrap 8th pilot — state-pair home-price surface
 * (homepricepeek, /compare/state/{a-vs-b}/).
 *
 * 5 canonical alphabetical pilots:
 *   california-vs-texas, florida-vs-new-york,
 *   massachusetts-vs-new-hampshire, new-jersey-vs-pennsylvania,
 *   oregon-vs-washington.
 *
 * Mirror of homeloanpeek 7th + wagepeek 6th + netpaypeek 5th alphabetical
 * cohort so /compare/state/{pair}/ aligns home-price (this site), mortgage
 * burden (homeloanpeek), gross wage (wagepeek), and net pay (netpaypeek)
 * across the bidirectional siblings.
 *
 * Belt-and-suspender enforcement:
 *   1. dynamicParams = false on this route → unknown slugs auto-404 (Trap #127).
 *   2. middleware.ts COMPARE_STATE_ALLOWLIST → pilot 200 + edge-version header,
 *      non-pilot 404 + X-Robots-Tag: noindex, nofollow (soft-quarantine —
 *      mirrors homeloanpeek 7th + netpaypeek 5th + carinsurancepeek 1st;
 *      homepricepeek does NOT hard-kill /compare/* globally so 410 would be
 *      over-reaching).
 *   3. notFound() page-level guard for any decoder miss (defence-in-depth).
 *
 * Trap #112 (≤60c title cap) — worst-case pilot title
 *   "Massachusetts vs New Hampshire: Home Prices Compared" = 52 chars.
 * Layout suffix " | HomePricePeek" (16c) pushes to 68c → OVER cap. Route uses
 * title.absolute to bypass the layout suffix entirely (v2.2 §4.0).
 *
 * Freshness anchor — V2 (FHFA HPI state quarterly + Case-Shiller monthly
 * national) refreshes monthly via scripts/sync-hpi.ts off FRED. revalidate =
 * 86400 (24h) so HPI updates within one ISR cycle of the data file changing.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AuthorBox } from '@/components/AuthorBox';
import { StatePairCompareRich } from '@/components/StatePairCompareRich';
import { StatePairCrossWalkBridge } from '@/components/StatePairCrossWalkBridge';
import { breadcrumbSchema } from '@/lib/schema';
import {
  STATE_PAIR_PILOT_SLUGS,
  decodeStatePair,
  composeStatePairTitle,
  composeStatePairDescription,
  statePairCompareMultiCreatorDatasetSchema,
  HPI_STATE_QUARTER_DATE,
} from '@/lib/state-pair-compare-decoder';

const SITE_DOMAIN = 'homepricepeek.com';

interface Props {
  params: Promise<{ slugs: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return STATE_PAIR_PILOT_SLUGS.map((slugs) => ({ slugs }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const result = decodeStatePair(slugs);
  if (!result) return {};
  const title = composeStatePairTitle(result.a.meta, result.b.meta);
  const description = composeStatePairDescription(result);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/compare/state/${slugs}/` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `/compare/state/${slugs}/`,
      type: 'article',
      modifiedTime: HPI_STATE_QUARTER_DATE,
    },
    other: { 'article:modified_time': HPI_STATE_QUARTER_DATE },
  };
}

export default async function StatePairComparePage({ params }: Props) {
  const { slugs } = await params;
  const result = decodeStatePair(slugs);
  if (!result) notFound();

  const { a, b } = result;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'State Home Prices', url: '/state/' },
    {
      name: `${a.meta.name} vs ${b.meta.name}`,
      url: `/compare/state/${slugs}/`,
    },
  ];

  const datasetLd = statePairCompareMultiCreatorDatasetSchema(
    result,
    SITE_DOMAIN,
  );

  return (
    <article className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'State Home Prices', href: '/state/' },
          { label: `${a.meta.name} vs ${b.meta.name}` },
        ]}
      />

      <StatePairCompareRich result={result} />

      <section className="mb-8 rounded-md border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700 mb-2">
          How to use this comparison
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          A reader weighing a relocation, a job offer with a housing component,
          or a where-to-buy decision between these two states should treat the
          side-by-side as a triage. The FHFA HPI state quarterly anchor at the
          top refreshes monthly and uses a common 1980 Q1 = 100 base — so the
          directly comparable metric is the YoY % and multi-year cumulative,
          NOT the absolute index level. The S&amp;P CoreLogic Case-Shiller
          monthly overlay is the national reference cycle both states sit
          inside. The Demographia 5-band price-to-income tier reads
          affordability relative to state median household income (Census ACS);
          the CFPB-anchored monthly P&amp;I burden converts the price into an
          actual monthly payment at the current FRED MORTGAGE30US rate. The
          appreciation-vs-affordability divergence read at the bottom is the
          editorial cross-reference signal — each verdict carries a
          data-honesty layer chip. For the per-state surface, the /state/
          {`{slug}`}/ page drills into the same state with the full
          affordability landscape.
        </p>
      </section>

      <nav className="mb-6 grid sm:grid-cols-2 gap-3 text-sm">
        <Link
          href={`/state/${a.meta.slug}/`}
          className="rounded-md border border-slate-200 bg-white p-3 hover:border-stone-400 transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            {a.meta.name} alone
          </span>
          <span className="block text-sm font-semibold text-slate-900 mt-1">
            /state/{a.meta.slug}/
          </span>
        </Link>
        <Link
          href={`/state/${b.meta.slug}/`}
          className="rounded-md border border-slate-200 bg-white p-3 hover:border-stone-400 transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            {b.meta.name} alone
          </span>
          <span className="block text-sm font-semibold text-slate-900 mt-1">
            /state/{b.meta.slug}/
          </span>
        </Link>
      </nav>

      <StatePairCrossWalkBridge a={a.meta} b={b.meta} />

      <AuthorBox layer="state" />
    </article>
  );
}
