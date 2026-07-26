/**
 * Phase 7 Compare-Wrap 8th pilot — state-pair cross-walk bridge
 * (homepricepeek, home-price anchor with FRESH MONTHLY HPI).
 *
 * Emits dual links per sibling row (state A + state B) so a reader can click
 * through to the adjacent housing / personal-finance context on either state —
 * matching the 4th-7th pilot DUAL pattern.
 *
 * 5 siblings (bidirectional pair targets):
 *   - homeloanpeek    (state mortgage burden + LLS — the rates leg of the
 *                      housing cluster; homeloanpeek 7th's bridge already lists
 *                      homepricepeek's home-value differential as a target)
 *   - propertytaxpeek (state effective property-tax rate — the tax leg of the
 *                      housing cluster, bidirectional pair across the 4-axis
 *                      cluster)
 *   - wagepeek        (state-level gross wage anchor — the income axis behind
 *                      the price-to-income ratio)
 *   - netpaypeek      (state-level net take-home pay — the post-tax income
 *                      that actually services the mortgage)
 *   - fairrentwize    (state-level rent affordability — the rent-vs-buy
 *                      counterpart at the same state level)
 *
 * All 5 use the bare `/state/{slug}/` path (Trap #126 normalised). All 5 are
 * PROD-200 on /state/{slug}/ as of 2026-05-26 (verified via prior pilot
 * cold-probes).
 */
import type { StateData } from '@/lib/states-data';

interface Props {
  a: StateData;
  b: StateData;
}

const SIBLING_SITES = [
  {
    domain: 'homeloanpeek.com',
    label: 'HomeLoanPeek',
    role: 'state mortgage burden + Freddie Mac PMMS rate + LoanLimitStackTier — the rates leg of the same housing cluster, bidirectional pair to the home-price axis',
  },
  {
    domain: 'propertytaxpeek.com',
    label: 'PropertyTaxPeek',
    role: 'state effective property-tax burden (IRS SOI + Census ACS) — the tax leg of the housing cluster',
  },
  {
    domain: 'wagepeek.com',
    label: 'WagePeek',
    role: 'state-level gross wage anchor (BLS OES + BEA RPP + Census ACS commute) — the income axis behind the price-to-income ratio',
  },
  {
    domain: 'netpaypeek.com',
    label: 'NetPayPeek',
    role: 'state-level net take-home pay after federal and state income tax — the post-tax income that services the mortgage at the state median home',
  },
  {
    domain: 'fairrentwize.com',
    label: 'FairRentWize',
    role: 'state-level rent affordability and median asking rent — the rent-vs-buy counterpart at the same state level',
  },
] as const;

export function StatePairCrossWalkBridge({ a, b }: Props) {
  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700 mb-2">
        DataPeek cross-walk · {a.name} ({a.code}) + {b.name} ({b.code})
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Home price never sits in isolation — adjacent mortgage-rate,
        property-tax, wage, net-pay, and rent context shape the calculus for
        either state in the pair. Click through to the sibling surface for each
        jurisdiction:
      </p>
      <ul className="space-y-3">
        {SIBLING_SITES.map((site) => (
          <li
            key={site.domain}
            className="rounded-lg border border-slate-200 p-3"
          >
            <div className="text-xs text-slate-600 mb-2">{site.role}</div>
            <div className="grid sm:grid-cols-2 gap-2">
              <a
                href={`https://${site.domain}/state/${a.slug}/`}
                rel="noopener"
                className="block rounded-md border border-slate-200 px-3 py-2 hover:border-stone-400 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-900">
                  {site.label} · {a.name}
                </span>
              </a>
              <a
                href={`https://${site.domain}/state/${b.slug}/`}
                rel="noopener"
                className="block rounded-md border border-slate-200 px-3 py-2 hover:border-stone-400 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-900">
                  {site.label} · {b.name}
                </span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
