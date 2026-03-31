import { siteConfig } from '@/site.config';

const SITE_NAME = siteConfig.name;
const SITE_URL = `https://${siteConfig.domain}`;

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
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
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
    temporalCoverage: `${siteConfig.dataSource.year}/${new Date().getFullYear()}`,
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

export function articleSchema(post: { title: string; description: string; slug: string; publishedAt: string; category?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
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
    dateModified: new Date().toISOString(),
  };
}
