import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import { getAllSlugs, getAllCountries, getAllRankings, getAllBudgets, getAllRegions } from '@/lib/db';
import { FILTER_RANKINGS } from '@/lib/filter-rankings';

const BASE = `https://${siteConfig.domain}`;
const TOP_LANGS = ['es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'tr', 'it'];

export default function sitemap(): MetadataRoute.Sitemap {
  const citySlugs = getAllSlugs();
  const countries = getAllCountries();
  const rankings = getAllRankings();
  const budgets = getAllBudgets();
  const regions = getAllRegions();

  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // Static pages
  entries.push(
    { url: `${BASE}/`, lastModified: now, priority: 1.0 },
    { url: `${BASE}/compare/`, lastModified: now, priority: 0.8 },
    { url: `${BASE}/search/`, lastModified: now, priority: 0.6 },
    { url: `${BASE}/about/`, lastModified: now, priority: 0.5 },
    { url: `${BASE}/methodology/`, lastModified: now, priority: 0.5 },
  );

  // English city pages (194)
  for (const s of citySlugs) {
    entries.push({ url: `${BASE}/city/${s.slug}/`, lastModified: now, priority: 0.8 });
  }

  // English country pages (50)
  for (const c of countries) {
    entries.push({ url: `${BASE}/country/${String(c.slug)}/`, lastModified: now, priority: 0.7 });
  }

  // Rankings (DB + filter rankings)
  for (const r of rankings) entries.push({ url: `${BASE}/rankings/${String(r.slug)}/`, lastModified: now, priority: 0.7 });
  for (const fr of FILTER_RANKINGS) entries.push({ url: `${BASE}/rankings/${fr.slug}/`, lastModified: now, priority: 0.6 });

  // Budgets, regions, afford pages
  for (const b of budgets) entries.push({ url: `${BASE}/budget/${String(b.slug)}/`, lastModified: now, priority: 0.6 });
  for (const r of regions) entries.push({ url: `${BASE}/region/${String(r.slug)}/`, lastModified: now, priority: 0.6 });
  for (const s of citySlugs) entries.push({ url: `${BASE}/afford/${s.slug}/`, lastModified: now, priority: 0.6 });

  // ALL city comparisons — C(194, 2) = 18,721 pairs (alphabetically sorted slugs)
  const sortedSlugs = citySlugs.map(s => s.slug).sort();
  for (let i = 0; i < sortedSlugs.length; i++) {
    for (let j = i + 1; j < sortedSlugs.length; j++) {
      entries.push({ url: `${BASE}/compare/${sortedSlugs[i]}-vs-${sortedSlugs[j]}/`, lastModified: now, priority: 0.5 });
    }
  }

  // ALL country comparisons — C(50, 2) = 1,225 pairs
  const countrySlugs = countries.map(c => String(c.slug)).sort();
  for (let i = 0; i < countrySlugs.length; i++) {
    for (let j = i + 1; j < countrySlugs.length; j++) {
      entries.push({ url: `${BASE}/compare/country/${countrySlugs[i]}-vs-${countrySlugs[j]}/`, lastModified: now, priority: 0.5 });
    }
  }

  // Localized pages — top 30 cities × 10 languages
  const topCities = citySlugs.slice(0, 30);
  for (const lang of TOP_LANGS) {
    for (const s of topCities) {
      entries.push({ url: `${BASE}/${lang}/city/${s.slug}/`, lastModified: now, priority: 0.7 });
    }
  }

  // Localized comparisons — top 20 pairs × 5 languages
  const topPairs: string[] = [];
  for (let i = 0; i < sortedSlugs.length && topPairs.length < 20; i++) {
    for (let j = i + 1; j < sortedSlugs.length && topPairs.length < 20; j++) {
      topPairs.push(`${sortedSlugs[i]}-vs-${sortedSlugs[j]}`);
    }
  }
  for (const lang of ['es', 'fr', 'de', 'ko', 'ja']) {
    for (const slug of topPairs) {
      entries.push({ url: `${BASE}/${lang}/compare/${slug}/`, lastModified: now, priority: 0.5 });
    }
  }

  return entries;
}
