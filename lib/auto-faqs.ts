import { formatCurrency, formatPercent } from "./format";

export interface FaqItem {
  question: string;
  answer: string;
}

interface CityData {
  name: string;
  country: string;
  region?: string;
  avg_home_price_usd: number;
  price_per_sqm_usd: number;
  price_change_1yr_pct: number;
  avg_rent_1br_usd: number;
  avg_rent_3br_usd: number;
  median_income_usd: number;
  price_to_income_ratio: number;
  mortgage_rate_pct: number;
  rent_to_income_ratio: number;
  population?: number;
  currency?: string;
}

/**
 * Generate data-driven FAQ items for a city home price page.
 * Questions match real "People Also Ask" search patterns.
 */
export function generateCityFaqs(city: CityData, nationalMedianPrice?: number | null): FaqItem[] {
  return [];
}
