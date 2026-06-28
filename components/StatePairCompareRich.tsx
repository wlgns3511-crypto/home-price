/**
 * Phase 7 Compare-Wrap 8th pilot — state-pair compare body component
 * (homepricepeek, home-price anchor with FRESH MONTHLY HPI).
 *
 * Surfaces the 6 case-conditional verdicts (mapped to 4-layer data-honesty
 * taxonomy) for an alphabetised state pair from
 * lib/state-pair-compare-decoder.ts. The freshness anchor (FHFA HPI quarter
 * date + Case-Shiller month) is surfaced in the header banner so a reader
 * can immediately see how stale the index quoted on the page is.
 */
import {
  DATA_LAYER_LABEL,
  HPI_STATE_QUARTER_LABEL,
  HPI_NATIONAL_MONTH,
  HPI_NATIONAL_CS_INDEX,
  HPI_NATIONAL_CS_YOY_PCT,
  type StatePairCompareResult,
  type DataHonestyLayer,
  type StateSlice,
} from '@/lib/state-pair-compare-decoder';

const LAYER_CHIP_CLASS: Record<DataHonestyLayer, string> = {
  'federal-aggregate':
    'border-emerald-200 bg-emerald-50 text-emerald-900',
  'editorial-estimate':
    'border-amber-200 bg-amber-50 text-amber-900',
  'cite-only-reference':
    'border-slate-200 bg-slate-50 text-slate-800',
  'editorial-cross-reference':
    'border-sky-200 bg-sky-50 text-sky-900',
};

interface Props {
  result: StatePairCompareResult;
}

function fmtUsd(n: number | null | undefined): string {
  if (n == null) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtPctSigned(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
}

export function StatePairCompareRich({ result }: Props) {
  const {
    a,
    b,
    verdicts,
    homeValueSpreadUsd,
    fiveYrAppreciationSpreadPp,
    priceToIncomeSpread,
    monthlyBurdenSpreadUsd,
  } = result;

  return (
    <section className="mb-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
          State-pair cross-walk · FHFA HPI + Case-Shiller + Demographia PIR
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          {a.meta.name} vs {b.meta.name}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          {a.meta.name} ({a.meta.code}) {fmtUsd(a.meta.medianHomePrice)} median ·{' '}
          {b.meta.name} ({b.meta.code}) {fmtUsd(b.meta.medianHomePrice)} median
          {homeValueSpreadUsd > 0 && (
            <>
              {' '}· home value spread{' '}
              <strong>{fmtUsd(homeValueSpreadUsd)}</strong>
            </>
          )}
          {fiveYrAppreciationSpreadPp > 0 && (
            <>
              {' '}· 5-yr HPI appreciation spread{' '}
              <strong>{fiveYrAppreciationSpreadPp.toFixed(1)} pp</strong>
            </>
          )}
          {priceToIncomeSpread > 0 && (
            <>
              {' '}· PIR spread <strong>{priceToIncomeSpread.toFixed(2)}</strong>
            </>
          )}
          {monthlyBurdenSpreadUsd > 0 && (
            <>
              {' '}· monthly P&amp;I spread{' '}
              <strong>{fmtUsd(monthlyBurdenSpreadUsd)}/mo</strong>
            </>
          )}
          {' '}(FHFA HPI {HPI_STATE_QUARTER_LABEL} + Case-Shiller {HPI_NATIONAL_MONTH})
        </p>
      </header>

      <aside className="not-prose mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
        <strong>Freshness anchor.</strong> FHFA HPI state quarterly{' '}
        <strong>{HPI_STATE_QUARTER_LABEL}</strong> · S&amp;P CoreLogic
        Case-Shiller national <strong>{HPI_NATIONAL_MONTH}</strong> index{' '}
        <strong>{HPI_NATIONAL_CS_INDEX.toFixed(2)}</strong> (YoY{' '}
        <strong>{fmtPctSigned(HPI_NATIONAL_CS_YOY_PCT)}</strong>). The state HPI
        and national Case-Shiller above are fetched monthly from the FRED CSV
        redistribution of FHFA's quarterly state series and the S&amp;P
        CoreLogic CSUSHPISA monthly series. The pair pages re-render within one
        ISR cycle (24h) of the data file updating.
      </aside>

      <aside className="not-prose mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        <strong>Editorial scope.</strong> A side-by-side cross-walk of two
        state-level home-price surfaces. FHFA HPI is a quarterly purchase-only
        repeat-sales index (1980 Q1 = 100 base) — directly comparable across
        states via YoY % and multi-year cumulative, NOT via absolute index level.
        Case-Shiller is a methodologically distinct monthly national overlay.
        The Demographia 5-band price-to-income tier and the CFPB-anchored
        monthly P&amp;I burden are editorial estimates built from state median
        home value, Census ACS median household income, and the FRED
        MORTGAGE30US weekly rate. The appreciation-vs-affordability divergence
        read at the bottom is the editorial cross-reference signal — each
        verdict below carries its data-honesty layer chip.
      </aside>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <StateSummaryCard slice={a} />
        <StateSummaryCard slice={b} />
      </div>

      <ol className="space-y-4">
        {verdicts.map((v) => (
          <li
            key={v.key}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${LAYER_CHIP_CLASS[v.layer]}`}
              >
                {DATA_LAYER_LABEL[v.layer]}
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                {v.headline}
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{v.body}</p>
            <p className="text-xs text-slate-500 mt-3">
              Source:{' '}
              <a
                href={v.source.url}
                rel="noopener"
                className="underline hover:text-slate-900"
              >
                {v.source.name}
              </a>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StateSummaryCard({ slice }: { slice: StateSlice }) {
  const { meta, hpi, pti, burden } = slice;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
        {meta.name} ({meta.code})
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-1">
        {fmtUsd(meta.medianHomePrice)}
        <span className="text-xs text-slate-500 ml-1 font-normal">
          state median home value
        </span>
      </div>
      <ul className="text-xs text-slate-700 leading-relaxed space-y-1 mt-2">
        <li>
          <strong>Median household income:</strong>{' '}
          {fmtUsd(meta.medianHouseholdIncome)}
        </li>
        <li>
          <strong>Demographia PIR:</strong>{' '}
          {pti ? pti.ratio.toFixed(2) : '—'}{' '}
          {pti ? `(${pti.shortLabel})` : ''}
        </li>
        <li>
          <strong>FHFA HPI {HPI_STATE_QUARTER_LABEL}:</strong>{' '}
          {hpi ? hpi.currentIndex.toFixed(2) : '—'} · YoY{' '}
          {hpi ? fmtPctSigned(hpi.yoyPct) : '—'}
        </li>
        <li>
          <strong>5-yr cumulative HPI:</strong>{' '}
          {hpi ? fmtPctSigned(hpi.fiveYrCumPct) : '—'} · 10-yr{' '}
          {hpi ? fmtPctSigned(hpi.tenYrCumPct) : '—'}
        </li>
        <li>
          <strong>Monthly P&amp;I at {meta.avgMortgageRate30yr.toFixed(2)}%:</strong>{' '}
          {fmtUsd(burden?.monthly)} ({burden?.shortLabel ?? '—'})
        </li>
      </ul>
    </article>
  );
}
