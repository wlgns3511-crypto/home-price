import { siteConfig } from '@/site.config';
import { getPublisherName, getReviewedAt } from '@/lib/seo';
import {
  EDITORIAL_TEAM,
  PUBLISHER,
  SOURCE_AUTHORITIES,
  ENTITY_VINTAGE,
  METHODOLOGY_REVIEWED,
} from './authorship';

const SITE_NAME = siteConfig.name;
const SITE_URL = `https://${siteConfig.domain}`;
const PUBLISHER_NAME = getPublisherName();
const REVIEWED_AT = getReviewedAt();

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function itemListSchema(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function datasetSchema(name: string, description: string, url: string, scope: 'intl' | 'us' = 'intl') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: `${SITE_URL}${url}`,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    reviewedBy: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    creator: scope === 'us'
      ? { '@type': 'Organization', name: SOURCE_AUTHORITIES[1].name, url: SOURCE_AUTHORITIES[1].url }
      : { '@type': 'Organization', name: SOURCE_AUTHORITIES[0].name, url: SOURCE_AUTHORITIES[0].url },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    // Actual data providers backing the DB columns referenced by this surface.
    sourceOrganization: SOURCE_AUTHORITIES.map((s) => ({
      '@type': 'Organization',
      name: s.name,
      url: s.url,
    })),
    isBasedOn: SOURCE_AUTHORITIES.map((s) => s.url),
    temporalCoverage: `${ENTITY_VINTAGE}/${ENTITY_VINTAGE}`,
    dateModified: METHODOLOGY_REVIEWED,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: `${SITE_URL}${url}`,
    },
  };
}

/**
 * Phase 7 P4 multi-creator Dataset schema for the HousingVerdict surface
 * (state /[slug]/ pages). The on-page dominant signal is a 2-axis composite
 * of price-to-income (Demographia) × CFPB mortgage-burden tier, so each of
 * the underlying data providers gets first-class creator attribution.
 *
 * Dual-emit policy: this function is used ONLY on state surfaces where the
 * HousingVerdict is computed. /city/, /country/, and /compare/ continue to
 * use the positional `datasetSchema(name, description, url, scope)` above
 * — they do not emit a verdict and would over-attribute Zillow ZHVI.
 *
 * Creator order (6 distinct hosts):
 *   1. Zillow Group               → zillow.com  (ZHVI per-state median home value)
 *   2. US Census Bureau (ACS)     → census.gov  (B19013 median household income)
 *   3. FHFA                       → fhfa.gov    (HPI 5y/10y cumulative appreciation)
 *   4. FRED                       → stlouisfed.org (MORTGAGE30US weekly 30y rate)
 *   5. OECD                       → oecd.org    (price-to-income peer benchmark)
 *   6. National statistics offices → unstats.un.org (cross-country housing snapshots)
 *
 * Zillow ZHVI lives in DataSourceBadge / TrustBlock today (not in
 * SOURCE_AUTHORITIES — which only lists orgs whose data populates a DB
 * column elsewhere). On state pages it IS the median-home-value source,
 * so it is elevated to 1st creator here for honest attribution.
 */
export function homepricepeekHousingVerdictMultiCreatorDatasetSchema(opts: {
  name: string;
  description: string;
  url: string;
  variableMeasured: string[];
  leverAnchor: string;
  spatialName?: string;
}) {
  const creators = [
    { name: 'Zillow Group', url: 'https://www.zillow.com/research/data/' },
    { name: SOURCE_AUTHORITIES[1].name, url: SOURCE_AUTHORITIES[1].url },
    { name: SOURCE_AUTHORITIES[2].name, url: SOURCE_AUTHORITIES[2].url },
    { name: SOURCE_AUTHORITIES[3].name, url: SOURCE_AUTHORITIES[3].url },
    { name: SOURCE_AUTHORITIES[0].name, url: SOURCE_AUTHORITIES[0].url },
    { name: SOURCE_AUTHORITIES[4].name, url: SOURCE_AUTHORITIES[4].url },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${SITE_URL}${opts.url}#dataset`,
        name: opts.name,
        description: opts.description,
        url: `${SITE_URL}${opts.url}#${opts.leverAnchor}`,
        license: 'https://creativecommons.org/publicdomain/zero/1.0/',
        variableMeasured: opts.variableMeasured,
        creator: creators.map((c) => ({ '@type': 'Organization', name: c.name, url: c.url })),
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        reviewedBy: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
        sourceOrganization: creators.map((c) => ({ '@type': 'Organization', name: c.name, url: c.url })),
        isBasedOn: creators.map((c) => c.url),
        ...(opts.spatialName && {
          spatialCoverage: { '@type': 'Place', name: opts.spatialName, containedInPlace: { '@type': 'Country', name: 'United States' } },
        }),
        temporalCoverage: `${ENTITY_VINTAGE}/${ENTITY_VINTAGE}`,
        dateModified: METHODOLOGY_REVIEWED,
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'text/html',
          contentUrl: `${SITE_URL}${opts.url}#${opts.leverAnchor}`,
        },
      },
    ],
  };
}

export function placeSchema(city: { name: string; country: string; slug: string; population?: number; avg_home_price_usd?: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: city.name,
    url: `${SITE_URL}/city/${city.slug}`,
    address: { '@type': 'PostalAddress', addressCountry: city.country },
    ...(city.population && { maximumAttendeeCapacity: city.population }),
  };
}

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  // slug is treated as a full path fragment (e.g. "blog/my-post" or "guide/my-guide")
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}

export function webPageSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${SITE_URL}${url}`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    ...(REVIEWED_AT && { dateModified: REVIEWED_AT }),
  };
}
