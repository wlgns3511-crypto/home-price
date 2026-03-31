export const LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'tr', 'it'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch',
  pt: 'Português', ja: '日本語', ko: '한국어', zh: '中文',
  ar: 'العربية', tr: 'Türkçe', it: 'Italiano',
};

export interface Dictionary {
  home_prices: string;
  rent: string;
  compare: string;
  buy: string;
  avg_home_price: string;
  price_per_sqm: string;
  rent_1br: string;
  rent_3br: string;
  mortgage_rate: string;
  price_change: string;
  median_income: string;
  price_to_income: string;
  rent_to_income: string;
  population: string;
  country: string;
  city: string;
  buying: string;
  renting: string;
  affordability: string;
  related_cities: string;
  similar_prices: string;
  compare_with: string;
  view_details: string;
  search: string;
  rankings: string;
  most_expensive: string;
  cheapest: string;
  data_source: string;
  last_updated: string;
  live_data: string;
  why_it_matters: string;
  faq_what_price: string;
  faq_how_much_rent: string;
  faq_affordable: string;
  faq_trend: string;
  per_month: string;
  per_year: string;
  years: string;
  vs: string;
  back_home: string;
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then(m => m.default),
  es: () => import('./dictionaries/es.json').then(m => m.default),
  fr: () => import('./dictionaries/fr.json').then(m => m.default),
  de: () => import('./dictionaries/de.json').then(m => m.default),
  pt: () => import('./dictionaries/pt.json').then(m => m.default),
  ja: () => import('./dictionaries/ja.json').then(m => m.default),
  ko: () => import('./dictionaries/ko.json').then(m => m.default),
  zh: () => import('./dictionaries/zh.json').then(m => m.default),
  ar: () => import('./dictionaries/ar.json').then(m => m.default),
  tr: () => import('./dictionaries/tr.json').then(m => m.default),
  it: () => import('./dictionaries/it.json').then(m => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

// Sync version for generateMetadata
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import fr from './dictionaries/fr.json';
import de from './dictionaries/de.json';
import pt from './dictionaries/pt.json';
import ja from './dictionaries/ja.json';
import ko from './dictionaries/ko.json';
import zh from './dictionaries/zh.json';
import ar from './dictionaries/ar.json';
import tr from './dictionaries/tr.json';
import it from './dictionaries/it.json';

const syncDicts: Record<Locale, Dictionary> = { en, es, fr, de, pt, ja, ko, zh, ar, tr, it };
export function getDictionarySync(locale: Locale): Dictionary { return syncDicts[locale]; }
