import { siteConfig } from '@/site.config';
import { getPublisherName, getReviewedAt } from '@/lib/seo';
import { EDITORIAL_TEAM } from './authorship';

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

export function datasetSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: `${SITE_URL}${url}`,
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    temporalCoverage: `${siteConfig.dataSource.year}/${siteConfig.dataVintage ?? siteConfig.dataSource.year}`,
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: `${SITE_URL}${url}` },
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
