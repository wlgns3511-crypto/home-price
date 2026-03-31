import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import { getAllSlugs } from '@/lib/db';

const BASE = `https://${siteConfig.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE}/about/`, lastModified: new Date(), priority: 0.5 },
    { url: `${BASE}/privacy/`, lastModified: new Date(), priority: 0.3 },
    { url: `${BASE}/terms/`, lastModified: new Date(), priority: 0.3 },
    { url: `${BASE}/contact/`, lastModified: new Date(), priority: 0.3 },
    { url: `${BASE}/disclaimer/`, lastModified: new Date(), priority: 0.3 },
    { url: `${BASE}/search/`, lastModified: new Date(), priority: 0.6 },
    { url: `${BASE}/blog/`, lastModified: new Date(), priority: 0.7 },
  ];

  const entityPages: MetadataRoute.Sitemap = slugs.map(s => ({
    url: `${BASE}/${siteConfig.entity.slug}/${s.slug}/`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  return [...staticPages, ...entityPages];
}
