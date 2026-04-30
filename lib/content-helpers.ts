/**
 * content-helpers.ts — pure deterministic utilities for slug-stable variant
 * rotation. Reused across the housing-narrative slots so the same state always
 * gets the same variant on rebuild (good for cache + indexing stability).
 *
 * fnv1a32: FNV-1a 32-bit hash. Stable, fast, no deps. Identical output on Node
 * and browser. We use it instead of djb2 (used elsewhere in the fleet) because
 * its avalanche is slightly better for short strings — and we want every state
 * page's variant pick to feel uncorrelated with the alphabetical neighbour.
 */

export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

export function pickVariant<T>(slug: string, salt: string, variants: readonly T[]): T {
  const idx = fnv1a32(slug + '|' + salt) % variants.length;
  return variants[idx];
}

export function oneInEveryN(slug: string, salt: string, n: number): boolean {
  return (fnv1a32(slug + '|' + salt) % n) === 0;
}

export function formatUsd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function formatUsdCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

export function formatPercentPlain(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatPp(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)} pp`;
}

export function formatRank(rank: number, total: number): string {
  return `#${rank} of ${total}`;
}

/**
 * "an" vs "a" — handles vowel sounds and common silent letters in English.
 * Coverage is intentionally narrow; we only call this with a small set of
 * known prefixes ("affordable", "expensive", "older", "underbuilt").
 */
export function aOrAn(word: string): string {
  if (!word) return 'a';
  const ch = word[0].toLowerCase();
  return /[aeiou]/.test(ch) ? 'an' : 'a';
}
