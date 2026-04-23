export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface CityData {
  name: string;
  country: string;
  avg_home_price_usd: number;
  median_income_usd: number;
  price_change_1yr_pct: number;
  price_per_sqm_usd: number;
  avg_rent_1br_usd: number;
  mortgage_rate_pct: number;
  price_to_income_ratio: number;
  nationalMedianPrice: number;
}

export function generateInsights(data: CityData): Insight[] {
  const insights: Insight[] = [];
  const { avg_home_price_usd: price, median_income_usd: income, price_change_1yr_pct: change, avg_rent_1br_usd: rent, mortgage_rate_pct: rate, price_to_income_ratio: ratio, nationalMedianPrice: natMedian } = data;

  // 1. Price vs national/global median
  if (natMedian > 0) {
    const diff = ((price - natMedian) / natMedian) * 100;
    if (diff > 50) {
      insights.push({
        text: `Home prices in ${data.name} are ${Math.round(diff)}% above the global median of $${natMedian.toLocaleString()}. This is a premium market — expect higher barriers to entry.`,
        sentiment: "negative",
      });
    } else if (diff > 0) {
      insights.push({
        text: `Home prices are ${Math.round(diff)}% above the global median ($${natMedian.toLocaleString()}). Above average, but not extreme by global standards.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `Home prices are ${Math.round(Math.abs(diff))}% below the global median ($${natMedian.toLocaleString()}). A relatively affordable market for buyers.`,
        sentiment: "positive",
      });
    }
  }

  // 2. Affordability ratio (price / income)
  if (income > 0) {
    if (ratio > 15) {
      insights.push({
        text: `Severely unaffordable: it would take ${ratio.toFixed(0)} years of median income ($${income.toLocaleString()}) to pay off an average home. Most buyers will need dual incomes or significant savings.`,
        sentiment: "negative",
      });
    } else if (ratio > 8) {
      insights.push({
        text: `Challenging affordability: ${ratio.toFixed(1)}x price-to-income ratio. Budget carefully — the general guideline is a home costing no more than 4-5x annual income.`,
        sentiment: "negative",
      });
    } else if (ratio > 4) {
      insights.push({
        text: `Moderately affordable at ${ratio.toFixed(1)}x price-to-income. A household earning the median income can realistically own a home with standard financing.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `Highly affordable: at ${ratio.toFixed(1)}x price-to-income, homeownership is within reach for most working households.`,
        sentiment: "positive",
      });
    }
  }

  // 3. Price trend
  if (change > 10) {
    insights.push({
      text: `Prices surged ${change.toFixed(1)}% in the past year — a hot market. Buyers may face bidding wars and limited inventory.`,
      sentiment: "negative",
    });
  } else if (change > 3) {
    insights.push({
      text: `Steady growth of ${change.toFixed(1)}% year-over-year. A healthy market with moderate appreciation.`,
      sentiment: "positive",
    });
  } else if (change >= 0) {
    insights.push({
      text: `Prices were flat at +${change.toFixed(1)}% over the past year. A stable market favoring patient buyers.`,
      sentiment: "neutral",
    });
  } else {
    insights.push({
      text: `Prices declined ${Math.abs(change).toFixed(1)}% year-over-year. A cooling market — potential opportunity for buyers willing to time the bottom.`,
      sentiment: "positive",
    });
  }

  // 4. Mortgage cost estimate (30-year fixed, 20% down)
  if (rate > 0 && price > 0) {
    const principal = price * 0.8;
    const monthlyRate = rate / 100 / 12;
    const months = 360;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const pctOfIncome = income > 0 ? (monthlyPayment / (income / 12)) * 100 : 0;

    insights.push({
      text: `Estimated monthly mortgage: $${Math.round(monthlyPayment).toLocaleString()} (30-yr fixed at ${rate.toFixed(1)}%, 20% down).${pctOfIncome > 0 ? ` That is ${pctOfIncome.toFixed(0)}% of median monthly income${pctOfIncome > 28 ? " — above the recommended 28% threshold" : ""}.` : ""}`,
      sentiment: pctOfIncome > 28 ? "negative" : "positive",
    });
  }

  // 5. Buy vs rent quick check
  if (rent > 0 && price > 0) {
    const priceToRentRatio = price / (rent * 12);
    if (priceToRentRatio > 20) {
      insights.push({
        text: `Price-to-rent ratio: ${priceToRentRatio.toFixed(0)}x. At this level, renting is often more economical on a 5-year horizon unless you expect strong appreciation.`,
        sentiment: "neutral",
      });
    } else if (priceToRentRatio > 15) {
      insights.push({
        text: `Price-to-rent ratio: ${priceToRentRatio.toFixed(0)}x. Buying vs renting is roughly balanced — your decision depends on how long you plan to stay.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `Price-to-rent ratio: ${priceToRentRatio.toFixed(0)}x. Buying likely makes financial sense if you plan to stay 3+ years.`,
        sentiment: "positive",
      });
    }
  }

  return insights.slice(0, 5);
}
