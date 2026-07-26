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

// 2026-07-26 — `scope: 'intl' | 'us' = 'intl'` 파라미터 삭제. 국제 서피스(/country/ 50 ·
// /city/ 194)는 같은 날 전량 410 이라 'intl' 분기는 도달 불가이고, 남은 두 호출부(홈 ·
// /methodology/)는 둘 다 인자를 안 넘겨 **미국 전용 사이트가 기본값 'intl' 로** JSON-LD 를
// 찍고 있었다. creator 는 SOURCE_AUTHORITIES[0](Zillow ZHVI = site.config dataSource 앵커).
export function datasetSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: `${SITE_URL}${url}`,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    reviewedBy: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    creator: { '@type': 'Organization', name: SOURCE_AUTHORITIES[0].name, url: SOURCE_AUTHORITIES[0].url },
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
 * HousingVerdict is computed. The non-entity surfaces (home, /methodology/) use
 * the positional `datasetSchema(name, description, url)` above — they do not emit
 * a verdict and would over-attribute Zillow ZHVI.
 * (2026-07-26 — 이 문장이 /city/ · /country/ · /compare/ 를 소비자로 적고 있었다. 앞의 둘은
 *  같은 날 전량 410, /compare/state/ 5장은 자체 스키마를 쓴다.)
 *
 * Creator order = SOURCE_AUTHORITIES order (5 distinct hosts):
 *   1. Zillow ZHVI                → zillow.com     (per-state typical home value + 1y change)
 *   2. US Census Bureau (ACS)     → census.gov     (B19013 income, B25091/B25070 cost burden)
 *   3. FHFA HPI                   → fhfa.gov       (5y/10y cumulative appreciation)
 *   4. FRED                       → stlouisfed.org (MORTGAGE30US weekly 30y rate)
 *   5. Tax Foundation             → taxfoundation.org (effective property tax rate)
 *
 * 2026-07-26 — 이 목록을 SOURCE_AUTHORITIES 그대로로 바꿨다. 두 가지가 틀려 있었다:
 * ① 위 doc 이 5=OECD·6=national statistics offices 라고 적고 있었지만 c7a5411 이 그 두
 *    슬롯을 각각 Zillow ZHVI·Tax Foundation 으로 교체했다(둘 다 실배선 0건이라). 코드는
 *    고쳐졌고 주석만 남아 다음 사람을 오도했다.
 * ② 그 교체의 부작용으로 creators[0]='Zillow Group' 과 creators[4]=SOURCE_AUTHORITIES[0]
 *    ='Zillow Home Value Index (ZHVI)' 가 **같은 URL 로 중복** 등재됐다 → 51개 주 페이지의
 *    creator/sourceOrganization 에 Zillow 가 두 이름으로, isBasedOn 에 같은 URL 이 두 번.
 * ZHVI 가 1번 자리인 건 그대로다(SOURCE_AUTHORITIES[0] 이 ZHVI).
 */
export function homepricepeekHousingVerdictMultiCreatorDatasetSchema(opts: {
  name: string;
  description: string;
  url: string;
  variableMeasured: string[];
  leverAnchor: string;
  spatialName?: string;
}) {
  const creators = SOURCE_AUTHORITIES.map((s) => ({ name: s.name, url: s.url }));

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
