import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import { getAllSlugs, getAllComparisonSlugs, getAllCountries } from '@/lib/db';

const BASE = `https://${siteConfig.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const citySlugs = getAllSlugs();
  const comparisons = getAllComparisonSlugs();
  const countries = getAllCountries();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE}/compare/`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/search/`, lastModified: new Date(), priority: 0.6 },
    { url: `${BASE}/blog/`, lastModified: new Date(), priority: 0.7 },
    { url: `${BASE}/about/`, lastModified: new Date(), priority: 0.5 },
    { url: `${BASE}/methodology/`, lastModified: new Date(), priority: 0.5 },
  ];

  const cityPages: MetadataRoute.Sitemap = citySlugs.map(s => ({
    url: `${BASE}/city/${s.slug}/`, lastModified: new Date(), priority: 0.8,
  }));

  const countryPages: MetadataRoute.Sitemap = countries.map(c => ({
    url: `${BASE}/country/${String(c.slug)}/`, lastModified: new Date(), priority: 0.7,
  }));

  const comparePages: MetadataRoute.Sitemap = comparisons.map(c => ({
    url: `${BASE}/compare/${c.slug}/`, lastModified: new Date(), priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...countryPages, ...comparePages];
}
