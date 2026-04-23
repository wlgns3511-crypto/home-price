import { siteConfig } from '@/site.config';

const DEFAULT_LOCALE = siteConfig.defaultLocale ?? siteConfig.lang ?? 'en';
const RAW_SUPPORTED = siteConfig.supportedLocales ?? siteConfig.targetLangs ?? [DEFAULT_LOCALE];

export const supportedLocales = Array.from(
  new Set([DEFAULT_LOCALE, ...RAW_SUPPORTED.filter(Boolean)]),
);

export function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export function localePrefix(locale: string): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

export function stripLocalePrefix(path: string): { locale: string; path: string } {
  const normalized = normalizePath(path);
  const match = normalized.match(/^\/([a-z]{2})(\/.*)?$/i);
  const candidate = match?.[1]?.toLowerCase();

  if (candidate && supportedLocales.includes(candidate)) {
    return {
      locale: candidate,
      path: normalizePath(match?.[2] ?? '/'),
    };
  }

  return { locale: DEFAULT_LOCALE, path: normalized };
}

export function getLocaleFromPathname(pathname: string | null | undefined): string {
  return stripLocalePrefix(pathname ?? '/').locale;
}

export function getHtmlLang(pathname: string | null | undefined): string {
  return getLocaleFromPathname(pathname);
}

export function buildLocaleAlternates(path: string, locale?: string) {
  const normalizedLocale = locale ?? DEFAULT_LOCALE;
  const { path: localeAgnosticPath } = stripLocalePrefix(path);

  return {
    canonical: `${localePrefix(normalizedLocale)}${localeAgnosticPath}`.replace(/\/{2,}/g, '/'),
    languages: Object.fromEntries(
      [
        ...supportedLocales.map((lang) => [
          lang,
          `${localePrefix(lang)}${localeAgnosticPath}`.replace(/\/{2,}/g, '/'),
        ]),
        ['x-default', `${localePrefix(DEFAULT_LOCALE)}${localeAgnosticPath}`.replace(/\/{2,}/g, '/')],
      ],
    ),
  };
}

export function getPublisherName(): string {
  switch (siteConfig.publisherMode) {
    case 'team':
      return `${siteConfig.name} Editorial Team`;
    default:
      return siteConfig.name;
  }
}

export function getReviewedBy(): string {
  return siteConfig.reviewedBy ?? getPublisherName();
}

export function getReviewedAt(): string | undefined {
  return siteConfig.reviewedAt;
}

export function getDataVintageLabel(): string {
  return siteConfig.dataVintage ?? String(siteConfig.dataSource.year);
}

export function getMethodologyUrl(): string {
  return siteConfig.methodologyUrl ?? '/methodology/';
}
