export interface ProprietaryAffordabilityMetrics {
  pirIndex: number; // 0 to 100
  mortgageBurden: number; // 0 to 100
  rentToBuyGrade: string; // A+ to F
  commentary: string;
}

/**
 * Calculates PIR Affordability Index (0 - 100).
 * Price-to-Income Ratio (PIR) below 3 is highly affordable (90+ score), above 10 is severely unaffordable.
 */
export function calculatePirIndex(pir: number): number {
  // scale pir (usually 2 to 15) to index where pir of 12 = 0 score, pir of 0 = 100 score
  return Math.max(0, Math.min(100, Math.round(100 - (pir / 12) * 100)));
}

/**
 * Calculates Mortgage Burden Index (0 - 100).
 * Represents estimated mortgage payment (assuming 20% down, 30yr term, local rate) as percentage of monthly median income.
 */
export function calculateMortgageBurden(
  price: number,
  rate: number,
  income: number
): number {
  const monthlyRate = rate / 100 / 12;
  const months = 360; // 30yr
  const loanAmount = price * 0.8; // 20% down
  const monthlyPayment = monthlyRate > 0 
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : loanAmount / months;
  
  const monthlyIncome = income / 12;
  if (monthlyIncome <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((monthlyPayment / monthlyIncome) * 100)));
}

/**
 * Assigns a Rent-to-Buy Efficiency Grade (A+ to F).
 * Price-to-Rent Ratio (PRR = avg_home_price_usd / (avg_rent_1br_usd * 12)).
 * PRR < 15: buying is highly efficient (A/A+).
 * PRR 15-20: balanced (B/C).
 * PRR 21+: renting is more cost-effective (D/F).
 */
export function calculateRentToBuyGrade(price: number, rent: number): string {
  if (rent <= 0) return "C";
  const prr = price / (rent * 12);
  if (prr < 12) return "A+";
  if (prr < 15) return "A";
  if (prr < 18) return "B";
  if (prr < 21) return "C";
  if (prr < 25) return "D";
  return "F";
}

/**
 * Deterministic hash to distribute content templates evenly across all slugs
 */
function getSlugHash(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates unique, SEO-friendly commentary analyzing local affordability indexes and financial guidelines.
 */
export function generateAffordabilityCommentary(
  slug: string,
  cityName: string,
  price: number,
  income: number,
  rent: number,
  pirIndex: number,
  mortgageBurden: number,
  rentToBuyGrade: string
): string {
  const hash = getSlugHash(slug);
  const variant = hash % 4;

  const pir = (price / income).toFixed(1);
  const prr = rent > 0 ? (price / (rent * 12)).toFixed(1) : "N/A";
  const formattedPrice = price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const formattedIncome = income.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const affordabilityContext = pirIndex >= 70
    ? "ranks as a relatively affordable purchase market where median earners can comfortably secure financing"
    : "presents a highly competitive and expensive purchase market, putting local homeownership out of reach for single median wage earners";

  const efficiencyMessage = rentToBuyGrade.startsWith("A") || rentToBuyGrade.startsWith("B")
    ? `buying represents a strong long-term wealth builder because the price-to-rent ratio is low (${prr}x)`
    : `renting a 1-bedroom apartment represents a much more cost-effective option due to the high price-to-rent ratio (${prr}x)`;

  switch (variant) {
    case 0:
      return `Our real estate analysis for ${cityName} indicates a PIR Affordability Index of ${pirIndex}/100 and a Rent-to-Buy Grade of ${rentToBuyGrade}. With an average home price of ${formattedPrice} and median household income of ${formattedIncome}, the market ${affordabilityContext}. Mortgage payments consume roughly ${mortgageBurden}% of local median monthly income. For families planning their budget, ${efficiencyMessage}.`;

    case 1:
      return `Evaluating housing affordability in ${cityName} yields a mortgage burden index of ${mortgageBurden}% and a rent-to-buy grade of ${rentToBuyGrade}. Because the price-to-income ratio sits at ${pir}x, this city ${affordabilityContext}. Under the standard 28% DTI threshold, ${efficiencyMessage} is one of the primary strategies to optimize your monthly housing overhead.`;

    case 2:
      return `For residents analyzing the ${cityName} housing market, the PIR index of ${pirIndex}/100 and mortgage load of ${mortgageBurden}% highlight key budget considerations. At an average home price of ${formattedPrice}, this market ${affordabilityContext}. Given the price-to-rent ratio of ${prr}x, ${efficiencyMessage} is the most financially efficient path for local households.`;

    case 3:
    default:
      return `With a median household income of ${formattedIncome} and average home price of ${formattedPrice}, ${cityName} lands at a Rent-to-Buy Grade of ${rentToBuyGrade} and PIR Affordability score of ${pirIndex}/100. This means typical mortgage payments take up ${mortgageBurden}% of gross median household earnings. In this environment, ${efficiencyMessage}.`;
  }
}

/**
 * Returns all calculated metrics in a single helper
 */
export function getProprietaryAffordabilityMetrics(
  slug: string,
  cityName: string,
  price: number,
  rate: number,
  income: number,
  rent: number
): ProprietaryAffordabilityMetrics {
  const pir = price / income;
  const pirIndex = calculatePirIndex(pir);
  const mortgageBurden = calculateMortgageBurden(price, rate, income);
  const rentToBuyGrade = calculateRentToBuyGrade(price, rent);
  const commentary = generateAffordabilityCommentary(
    slug,
    cityName,
    price,
    income,
    rent,
    pirIndex,
    mortgageBurden,
    rentToBuyGrade
  );

  return {
    pirIndex,
    mortgageBurden,
    rentToBuyGrade,
    commentary,
  };
}
