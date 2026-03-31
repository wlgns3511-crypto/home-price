import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import { getAllSlugs, getAllComparisonSlugs, getAllCountries, getAllRankings, getAllBudgets, getAllRegions, getAllCountryComparisonSlugs } from '@/lib/db';

const BASE = `https://${siteConfig.domain}`;
const TOP_LANGS = ['es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'tr', 'it'];

export default function sitemap(): MetadataRoute.Sitemap {
  const citySlugs = getAllSlugs();
  const comparisons = getAllComparisonSlugs();
  const countries = getAllCountries();
  const rankings = getAllRankings();
  const budgets = getAllBudgets();
  const regions = getAllRegions();
  const countryComps = getAllCountryComparisonSlugs();

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  entries.push(
    { url: `${BASE}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE}/compare/`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/search/`, lastModified: new Date(), priority: 0.6 },
    { url: `${BASE}/about/`, lastModified: new Date(), priority: 0.5 },
    { url: `${BASE}/methodology/`, lastModified: new Date(), priority: 0.5 },
  );

  // English city pages
  for (const s of citySlugs) {
    entries.push({ url: `${BASE}/city/${s.slug}/`, lastModified: new Date(), priority: 0.8 });
  }

  // English country pages
  for (const c of countries) {
    entries.push({ url: `${BASE}/country/${String(c.slug)}/`, lastModified: new Date(), priority: 0.7 });
  }

  // Rankings, budgets, regions
  for (const r of rankings) entries.push({ url: `${BASE}/rankings/${String(r.slug)}/`, lastModified: new Date(), priority: 0.7 });
  for (const b of budgets) entries.push({ url: `${BASE}/budget/${String(b.slug)}/`, lastModified: new Date(), priority: 0.6 });
  for (const r of regions) entries.push({ url: `${BASE}/region/${String(r.slug)}/`, lastModified: new Date(), priority: 0.6 });
  for (const s of citySlugs) entries.push({ url: `${BASE}/afford/${s.slug}/`, lastModified: new Date(), priority: 0.6 });

  // Top comparisons (limit sitemap size)
  const topComps = comparisons.slice(0, 500);
  for (const c of topComps) entries.push({ url: `${BASE}/compare/${c.slug}/`, lastModified: new Date(), priority: 0.6 });

  // Top country comparisons
  const topCC = countryComps.slice(0, 200);
  for (const c of topCC) entries.push({ url: `${BASE}/compare/country/${c.slug}/`, lastModified: new Date(), priority: 0.6 });

  // Localized pages — top 30 cities × 10 languages (high-value pages for sitemap)
  const topCities = citySlugs.slice(0, 30);
  for (const lang of TOP_LANGS) {
    for (const s of topCities) {
      entries.push({ url: `${BASE}/${lang}/city/${s.slug}/`, lastModified: new Date(), priority: 0.7 });
    }
  }

  // Localized comparisons — top 20 × 5 languages
  const topLangComps = comparisons.slice(0, 20);
  for (const lang of ['es', 'fr', 'de', 'ko', 'ja']) {
    for (const c of topLangComps) {
      entries.push({ url: `${BASE}/${lang}/compare/${c.slug}/`, lastModified: new Date(), priority: 0.5 });
    }
  }

  return entries;
}
