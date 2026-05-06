import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import {
  getAllSlugs,
  getAllCountries,
  getAllRegions,
  getAllRankings,
  getAllBudgets,
  getAllComparisonSlugs,
} from '@/lib/db';
import { getAllStates } from '@/lib/states-data';
import { getAllInsightSlugs } from '@/lib/insights-data';
import { getAllPosts } from '@/lib/blog';
import { getAllGuides } from '@/lib/guides';
import { FILTER_RANKINGS } from '@/lib/filter-rankings';
import {
  DB_UPDATED,
  SITE_REBUILT,
  METHODOLOGY_REVIEWED,
  ABOUT_REVIEWED,
  LEGAL_REVIEWED,
} from '@/lib/authorship';

const BASE = `https://${siteConfig.domain}`;
const ENTITY_PREFIX = siteConfig.entity.slug; // 'city'

type Url = MetadataRoute.Sitemap[number];

function url(path: string, lastModified: string, priority = 0.5): Url {
  return {
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];

  // ── Site identity (root + listing surfaces) ──
  out.push(url('/', SITE_REBUILT, 1.0));
  out.push(url('/search/', SITE_REBUILT, 0.5));
  out.push(url('/compare/', SITE_REBUILT, 0.5));
  out.push(url('/insights/', SITE_REBUILT, 0.7));
  out.push(url('/blog/', SITE_REBUILT, 0.6));
  out.push(url('/guide/', SITE_REBUILT, 0.7));
  out.push(url('/rankings/all/', SITE_REBUILT, 0.6));
  out.push(url(`/${ENTITY_PREFIX}/`, SITE_REBUILT, 0.8));
  out.push(url('/state/', SITE_REBUILT, 0.8));

  // ── About / methodology / legal (per-section vintages) ──
  out.push(url('/about/', ABOUT_REVIEWED, 0.6));
  out.push(url('/methodology/', METHODOLOGY_REVIEWED, 0.6));
  out.push(url('/privacy/', LEGAL_REVIEWED, 0.3));
  out.push(url('/terms/', LEGAL_REVIEWED, 0.3));
  out.push(url('/disclaimer/', LEGAL_REVIEWED, 0.3));
  out.push(url('/contact/', LEGAL_REVIEWED, 0.3));
  out.push(url('/editorial-policy/', LEGAL_REVIEWED, 0.4));
  out.push(url('/corrections-policy/', LEGAL_REVIEWED, 0.4));

  // ── State pages + monthly-payment subpaths (entity vintage) ──
  for (const s of getAllStates()) {
    out.push(url(`/state/${s.slug}/`, DB_UPDATED, 0.7));
    out.push(url(`/state/${s.slug}/monthly-payment/`, DB_UPDATED, 0.6));
  }

  // ── City entity pages (entity vintage) ──
  const citySlugs = getAllSlugs().slice(0, 500);
  for (const c of citySlugs) {
    out.push(url(`/${ENTITY_PREFIX}/${c.slug}/`, DB_UPDATED, 0.6));
  }

  // ── Country pages (entity vintage) ──
  for (const co of getAllCountries()) {
    out.push(url(`/country/${String(co.slug)}/`, DB_UPDATED, 0.6));
  }

  // ── Region pages (entity vintage) ──
  for (const r of getAllRegions()) {
    out.push(url(`/region/${String(r.slug)}/`, DB_UPDATED, 0.5));
  }

  // ── Rankings (entity vintage) ──
  const dbRankings = getAllRankings();
  for (const r of dbRankings) {
    out.push(url(`/rankings/${String(r.slug)}/`, DB_UPDATED, 0.5));
  }
  for (const fr of FILTER_RANKINGS) {
    out.push(url(`/rankings/${fr.slug}/`, DB_UPDATED, 0.5));
  }

  // ── Budget pages (entity vintage) ──
  for (const b of getAllBudgets()) {
    out.push(url(`/budget/${String(b.slug)}/`, DB_UPDATED, 0.4));
  }

  // ── Afford pages (entity vintage, capped to top 200 by name order) ──
  for (const c of citySlugs.slice(0, 200)) {
    out.push(url(`/afford/${c.slug}/`, DB_UPDATED, 0.4));
  }

  // ── Compare pages (entity vintage, capped) ──
  const comparisonSlugs = getAllComparisonSlugs().slice(0, 100);
  for (const cmp of comparisonSlugs) {
    out.push(url(`/compare/${String(cmp.slug)}/`, DB_UPDATED, 0.4));
  }

  // ── Insights (entity vintage) ──
  for (const slug of getAllInsightSlugs()) {
    out.push(url(`/insights/${slug}/`, DB_UPDATED, 0.5));
  }

  // ── Blog posts (per-post updatedAt or DB vintage) ──
  for (const p of getAllPosts()) {
    const lastmod = (p as { updatedAt?: string; date?: string }).updatedAt
      ?? (p as { updatedAt?: string; date?: string }).date
      ?? DB_UPDATED;
    out.push(url(`/blog/${p.slug}/`, lastmod, 0.5));
  }

  // ── Guides (per-guide updatedAt or DB vintage) ──
  for (const g of getAllGuides()) {
    const lastmod = (g as { updatedAt?: string; date?: string }).updatedAt
      ?? (g as { updatedAt?: string; date?: string }).date
      ?? DB_UPDATED;
    out.push(url(`/guide/${g.slug}/`, lastmod, 0.6));
  }

  return out;
}
