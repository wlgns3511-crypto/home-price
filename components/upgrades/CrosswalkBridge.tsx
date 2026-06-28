/**
 * components/upgrades/CrosswalkBridge.tsx — Phase 7 P5 internal cross-walk
 * linking for homepricepeek state entity pages.
 *
 * Renders a fold-1 aside on /state/[slug]/ surfaces with contextual links to
 * sibling public-data sites that share the same US-state-jurisdiction join
 * key. The HousingVerdict dominant signal (price-to-income × mortgage burden)
 * is the on-page PSU 1차 verdict; the bridge extends the reading to adjacent
 * household-cost dimensions that the dominant signal does NOT cover
 * (rent, property tax, mortgage closing cost, wage, take-home pay, utility,
 * safety). Each sibling answers a different household-cost question on the
 * SAME state-jurisdiction join.
 *
 * Footprint controls (Trap #118):
 *   • Anchor text is full site name + dimension noun, not keyword-stuffed.
 *   • rel="external" — natural outbound, no nofollow / sponsored.
 *   • Order is deterministic per state slug (FNV-1a seed) so cross-site
 *     footprint does not duplicate exact ordering across hosts.
 *   • Cap at 4 links per page (playbook §8.2).
 */

interface CrosswalkBridgeProps {
  stateName: string;
  stateSlug: string;
}

interface JoinSite {
  name: string;
  baseUrl: string;
  dimension: string;
  blurb: string;
  pathTemplate: string;
}

/**
 * State join cohort — sibling public-data sites that key off the same US
 * state. The 7-site housing cluster (fairrentwize / propertytaxpeek /
 * homeloanpeek / wagepeek / netpaypeek / powerbillpeek / safecitypeek) all
 * serve /state/{slug}/ per portfolio convention and each answers a different
 * household-cost question on the same jurisdiction that the HousingVerdict
 * dominant signal reads.
 */
const HOUSING_JOIN_SITES: ReadonlyArray<JoinSite> = [
  {
    name: 'FairRentWize',
    baseUrl: 'https://fairrentwize.com',
    dimension: 'rent affordability',
    blurb: 'HUD FMR + Census ACS + NLIHC — the rent axis paired with the same income median that drives the price-to-income ratio',
    pathTemplate: '/state/{slug}/',
  },
  {
    name: 'PropertyTaxPeek',
    baseUrl: 'https://propertytaxpeek.com',
    dimension: 'effective property tax',
    blurb: 'Tax Foundation + Census ACS — the recurring carrying cost stacked on top of the mortgage',
    pathTemplate: '/state/{slug}/',
  },
  {
    name: 'HomeLoanPeek',
    baseUrl: 'https://homeloanpeek.com',
    dimension: 'mortgage closing cost',
    blurb: 'CFPB + FRED MORTGAGE30US — the one-time origination cost the price-to-income ratio omits',
    pathTemplate: '/state/{slug}/',
  },
  {
    name: 'WagePeek',
    baseUrl: 'https://wagepeek.com',
    dimension: 'occupational wage',
    blurb: 'BLS OES — the household-income upper-bound by occupation on the same state',
    pathTemplate: '/state/{slug}/',
  },
  {
    name: 'NetPayPeek',
    baseUrl: 'https://netpaypeek.com',
    dimension: 'take-home pay',
    blurb: 'IRS + state DOR + SSA — the income headroom available against the surveyed mortgage burden',
    pathTemplate: '/state/{slug}/',
  },
  {
    name: 'PowerBillPeek',
    baseUrl: 'https://powerbillpeek.com',
    dimension: 'electricity bill',
    blurb: 'EIA Form 826 — the recurring utility cost not captured by the CFPB DTI rule',
    pathTemplate: '/state/{slug}/',
  },
  {
    name: 'SafeCityPeek',
    baseUrl: 'https://safecitypeek.com',
    dimension: 'crime rate',
    blurb: 'FBI UCR + BJS — the non-cost neighborhood axis buyers weigh against the same price',
    pathTemplate: '/state/{slug}/',
  },
];

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function deterministicPick(stateSlug: string, count: number): JoinSite[] {
  const seed = fnv1a(stateSlug);
  const pool = HOUSING_JOIN_SITES.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const s = (seed + i * 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function CrosswalkBridge({ stateName, stateSlug }: CrosswalkBridgeProps) {
  const slug = stateSlug.toLowerCase();
  const picks = deterministicPick(slug, 4);
  if (picks.length === 0) return null;

  return (
    <aside className="my-6 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 mb-2">
        {stateName} on other public-data dimensions
      </p>
      <ul className="space-y-1 text-sm">
        {picks.map((s) => {
          const href = `${s.baseUrl}${s.pathTemplate.replace('{slug}', slug)}`;
          return (
            <li key={s.name}>
              <a
                href={href}
                rel="external"
                className="text-emerald-700 hover:underline font-medium"
              >
                {s.name}: {s.dimension} &rarr;
              </a>
              <span className="text-slate-500 text-xs ml-2">{s.blurb}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Sibling public-data tools share the same state-jurisdiction join as
        the key — each answers a different household-cost question on the
        same jurisdiction the HousingVerdict dominant signal reads.
      </p>
    </aside>
  );
}
