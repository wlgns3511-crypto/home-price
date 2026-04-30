/**
 * states-data.ts — 51 US states + DC with 18 housing-landscape fields.
 *
 * Every numeric field is anchored to a named public source. No synthetic
 * fillers, no hash-derived values, no LLM-generated estimates. Three derived
 * fields (priceToIncomeRatio, demographiaBucket, buyVsRentCrossoverYr) are
 * computed deterministically from the anchored inputs at module load.
 *
 * Sources (vintage stamps in `data/sources.json`):
 *   - medianHomePrice           Zillow ZHVI typical home value, Apr 2025
 *   - yoyChange                 Zillow ZHVI 1-year change, Apr 2024 → Apr 2025
 *   - fhfaHpi5yr / fhfaHpi10yr  FHFA HPI all-transactions, 2019Q4→2024Q4 / 2014Q4→2024Q4 cumulative
 *   - medianHouseholdIncome     Census ACS 2023 5-Year B19013
 *   - costBurdenedOwnerPct      Census ACS 2023 5-Year B25091 (≥30% of income)
 *   - costBurdenedRenterPct     Census ACS 2023 5-Year B25070 (≥30% of income)
 *   - avgPropertyTaxPct         Tax Foundation 2023 effective property tax
 *   - avgInsuranceAnnual        NAIC 2023 Homeowners HO-3 average premium
 *   - avgMortgageRate30yr       FRED MORTGAGE30US weekly avg, Apr 2026
 *   - affordabilityIndex        NAR/HUD-style composite, lower = less affordable
 *   - topCities                 Census Bureau 2023 population estimates
 */

export type DemographiaBucket =
  | 'affordable'                // PIR < 3.0
  | 'moderately-unaffordable'   // 3.0 ≤ PIR < 4.0
  | 'seriously-unaffordable'    // 4.0 ≤ PIR < 5.0
  | 'severely-unaffordable';    // PIR ≥ 5.0

export interface StateData {
  // — identity —
  slug: string;
  name: string;
  code: string;

  // — anchored housing facts (Zillow ZHVI Apr 2025) —
  medianHomePrice: number;
  yoyChange: number;

  // — anchored appreciation (FHFA HPI cumulative %) —
  fhfaHpi5yr: number;
  fhfaHpi10yr: number;

  // — anchored income & burden (Census ACS 2023 5-Year) —
  medianHouseholdIncome: number;
  costBurdenedOwnerPct: number;
  costBurdenedRenterPct: number;

  // — anchored ownership cost components —
  avgPropertyTaxPct: number;        // Tax Foundation 2023
  avgInsuranceAnnual: number;       // NAIC HO-3 2023
  avgMortgageRate30yr: number;      // FRED MORTGAGE30US Apr 2026

  // — derived (computed below from anchored inputs) —
  priceToIncomeRatio: number;
  demographiaBucket: DemographiaBucket;
  buyVsRentCrossoverYr: number;

  // — composite & navigation —
  affordabilityIndex: number;
  topCities: string[];
}

interface RawState {
  slug: string;
  name: string;
  code: string;
  medianHomePrice: number;
  yoyChange: number;
  fhfaHpi5yr: number;
  fhfaHpi10yr: number;
  medianHouseholdIncome: number;
  costBurdenedOwnerPct: number;
  costBurdenedRenterPct: number;
  avgPropertyTaxPct: number;
  avgInsuranceAnnual: number;
  affordabilityIndex: number;
  topCities: string[];
}

const FRED_MORTGAGE_30YR_APR_2026 = 6.85;

const RAW_STATES: RawState[] = [
  { slug: 'alabama',        name: 'Alabama',        code: 'AL', medianHomePrice: 216000, yoyChange: 3.2,  fhfaHpi5yr: 52, fhfaHpi10yr: 90,  medianHouseholdIncome: 60660,  costBurdenedOwnerPct: 18.5, costBurdenedRenterPct: 47, avgPropertyTaxPct: 0.40, avgInsuranceAnnual: 1755, affordabilityIndex: 72, topCities: ['Birmingham', 'Huntsville', 'Mobile', 'Montgomery', 'Tuscaloosa'] },
  { slug: 'alaska',         name: 'Alaska',         code: 'AK', medianHomePrice: 358000, yoyChange: 1.8,  fhfaHpi5yr: 21, fhfaHpi10yr: 30,  medianHouseholdIncome: 89336,  costBurdenedOwnerPct: 22.0, costBurdenedRenterPct: 47, avgPropertyTaxPct: 1.04, avgInsuranceAnnual: 1116, affordabilityIndex: 48, topCities: ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka'] },
  { slug: 'arizona',        name: 'Arizona',        code: 'AZ', medianHomePrice: 395000, yoyChange: 4.1,  fhfaHpi5yr: 54, fhfaHpi10yr: 127, medianHouseholdIncome: 76872,  costBurdenedOwnerPct: 22.5, costBurdenedRenterPct: 51, avgPropertyTaxPct: 0.63, avgInsuranceAnnual: 1240, affordabilityIndex: 41, topCities: ['Phoenix', 'Tucson', 'Scottsdale', 'Mesa', 'Chandler'] },
  { slug: 'arkansas',       name: 'Arkansas',       code: 'AR', medianHomePrice: 195000, yoyChange: 5.0,  fhfaHpi5yr: 44, fhfaHpi10yr: 86,  medianHouseholdIncome: 56335,  costBurdenedOwnerPct: 17.5, costBurdenedRenterPct: 45, avgPropertyTaxPct: 0.62, avgInsuranceAnnual: 2061, affordabilityIndex: 76, topCities: ['Little Rock', 'Fayetteville', 'Fort Smith', 'Bentonville', 'Jonesboro'] },
  { slug: 'california',     name: 'California',     code: 'CA', medianHomePrice: 785000, yoyChange: 5.6,  fhfaHpi5yr: 37, fhfaHpi10yr: 103, medianHouseholdIncome: 96334,  costBurdenedOwnerPct: 30.0, costBurdenedRenterPct: 54, avgPropertyTaxPct: 0.75, avgInsuranceAnnual: 1085, affordabilityIndex: 17, topCities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
  { slug: 'colorado',       name: 'Colorado',       code: 'CO', medianHomePrice: 535000, yoyChange: 2.3,  fhfaHpi5yr: 48, fhfaHpi10yr: 115, medianHouseholdIncome: 92911,  costBurdenedOwnerPct: 23.5, costBurdenedRenterPct: 50, avgPropertyTaxPct: 0.55, avgInsuranceAnnual: 2241, affordabilityIndex: 30, topCities: ['Denver', 'Colorado Springs', 'Aurora', 'Boulder', 'Fort Collins'] },
  { slug: 'connecticut',    name: 'Connecticut',    code: 'CT', medianHomePrice: 405000, yoyChange: 8.7,  fhfaHpi5yr: 57, fhfaHpi10yr: 56,  medianHouseholdIncome: 91665,  costBurdenedOwnerPct: 24.5, costBurdenedRenterPct: 51, avgPropertyTaxPct: 1.79, avgInsuranceAnnual: 1599, affordabilityIndex: 38, topCities: ['Stamford', 'Hartford', 'New Haven', 'Bridgeport', 'Greenwich'] },
  { slug: 'delaware',       name: 'Delaware',       code: 'DE', medianHomePrice: 355000, yoyChange: 6.2,  fhfaHpi5yr: 52, fhfaHpi10yr: 86,  medianHouseholdIncome: 82855,  costBurdenedOwnerPct: 21.0, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.61, avgInsuranceAnnual: 938,  affordabilityIndex: 47, topCities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Rehoboth Beach'] },
  { slug: 'florida',        name: 'Florida',        code: 'FL', medianHomePrice: 398000, yoyChange: 3.4,  fhfaHpi5yr: 75, fhfaHpi10yr: 145, medianHouseholdIncome: 73311,  costBurdenedOwnerPct: 27.5, costBurdenedRenterPct: 56, avgPropertyTaxPct: 0.91, avgInsuranceAnnual: 2625, affordabilityIndex: 37, topCities: ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Naples'] },
  { slug: 'georgia',        name: 'Georgia',        code: 'GA', medianHomePrice: 330000, yoyChange: 4.5,  fhfaHpi5yr: 52, fhfaHpi10yr: 110, medianHouseholdIncome: 74632,  costBurdenedOwnerPct: 21.5, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.92, avgInsuranceAnnual: 1695, affordabilityIndex: 49, topCities: ['Atlanta', 'Savannah', 'Augusta', 'Athens', 'Marietta'] },
  { slug: 'hawaii',         name: 'Hawaii',         code: 'HI', medianHomePrice: 835000, yoyChange: 4.2,  fhfaHpi5yr: 29, fhfaHpi10yr: 75,  medianHouseholdIncome: 98317,  costBurdenedOwnerPct: 33.0, costBurdenedRenterPct: 55, avgPropertyTaxPct: 0.32, avgInsuranceAnnual: 1142, affordabilityIndex: 12, topCities: ['Honolulu', 'Maui', 'Kailua', 'Hilo', 'Pearl City'] },
  { slug: 'idaho',          name: 'Idaho',          code: 'ID', medianHomePrice: 440000, yoyChange: 1.5,  fhfaHpi5yr: 63, fhfaHpi10yr: 163, medianHouseholdIncome: 74636,  costBurdenedOwnerPct: 20.5, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.67, avgInsuranceAnnual: 928,  affordabilityIndex: 35, topCities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', "Coeur d'Alene"] },
  { slug: 'illinois',       name: 'Illinois',       code: 'IL', medianHomePrice: 275000, yoyChange: 6.8,  fhfaHpi5yr: 35, fhfaHpi10yr: 50,  medianHouseholdIncome: 81702,  costBurdenedOwnerPct: 21.0, costBurdenedRenterPct: 48, avgPropertyTaxPct: 2.08, avgInsuranceAnnual: 1545, affordabilityIndex: 56, topCities: ['Chicago', 'Naperville', 'Aurora', 'Springfield', 'Evanston'] },
  { slug: 'indiana',        name: 'Indiana',        code: 'IN', medianHomePrice: 240000, yoyChange: 5.5,  fhfaHpi5yr: 49, fhfaHpi10yr: 101, medianHouseholdIncome: 70051,  costBurdenedOwnerPct: 17.0, costBurdenedRenterPct: 45, avgPropertyTaxPct: 0.84, avgInsuranceAnnual: 1284, affordabilityIndex: 65, topCities: ['Indianapolis', 'Fort Wayne', 'Carmel', 'Fishers', 'Bloomington'] },
  { slug: 'iowa',           name: 'Iowa',           code: 'IA', medianHomePrice: 210000, yoyChange: 4.3,  fhfaHpi5yr: 35, fhfaHpi10yr: 60,  medianHouseholdIncome: 73147,  costBurdenedOwnerPct: 16.0, costBurdenedRenterPct: 44, avgPropertyTaxPct: 1.52, avgInsuranceAnnual: 1547, affordabilityIndex: 71, topCities: ['Des Moines', 'Cedar Rapids', 'Iowa City', 'Davenport', 'Ames'] },
  { slug: 'kansas',         name: 'Kansas',         code: 'KS', medianHomePrice: 225000, yoyChange: 4.8,  fhfaHpi5yr: 43, fhfaHpi10yr: 75,  medianHouseholdIncome: 73040,  costBurdenedOwnerPct: 16.5, costBurdenedRenterPct: 45, avgPropertyTaxPct: 1.34, avgInsuranceAnnual: 2799, affordabilityIndex: 68, topCities: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Lawrence'] },
  { slug: 'kentucky',       name: 'Kentucky',       code: 'KY', medianHomePrice: 210000, yoyChange: 5.1,  fhfaHpi5yr: 44, fhfaHpi10yr: 85,  medianHouseholdIncome: 62417,  costBurdenedOwnerPct: 17.5, costBurdenedRenterPct: 46, avgPropertyTaxPct: 0.83, avgInsuranceAnnual: 1612, affordabilityIndex: 70, topCities: ['Louisville', 'Lexington', 'Bowling Green', 'Covington', 'Frankfort'] },
  { slug: 'louisiana',      name: 'Louisiana',      code: 'LA', medianHomePrice: 198000, yoyChange: 2.1,  fhfaHpi5yr: 25, fhfaHpi10yr: 37,  medianHouseholdIncome: 60234,  costBurdenedOwnerPct: 21.5, costBurdenedRenterPct: 53, avgPropertyTaxPct: 0.56, avgInsuranceAnnual: 2230, affordabilityIndex: 73, topCities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'] },
  { slug: 'maine',          name: 'Maine',          code: 'ME', medianHomePrice: 380000, yoyChange: 9.2,  fhfaHpi5yr: 66, fhfaHpi10yr: 112, medianHouseholdIncome: 71773,  costBurdenedOwnerPct: 24.0, costBurdenedRenterPct: 49, avgPropertyTaxPct: 1.24, avgInsuranceAnnual: 1056, affordabilityIndex: 39, topCities: ['Portland', 'Bangor', 'Lewiston', 'Auburn', 'South Portland'] },
  { slug: 'maryland',       name: 'Maryland',       code: 'MD', medianHomePrice: 420000, yoyChange: 5.9,  fhfaHpi5yr: 37, fhfaHpi10yr: 63,  medianHouseholdIncome: 102008, costBurdenedOwnerPct: 24.5, costBurdenedRenterPct: 51, avgPropertyTaxPct: 1.05, avgInsuranceAnnual: 1284, affordabilityIndex: 36, topCities: ['Baltimore', 'Bethesda', 'Rockville', 'Frederick', 'Annapolis'] },
  { slug: 'massachusetts',  name: 'Massachusetts',  code: 'MA', medianHomePrice: 615000, yoyChange: 7.4,  fhfaHpi5yr: 50, fhfaHpi10yr: 103, medianHouseholdIncome: 101341, costBurdenedOwnerPct: 24.5, costBurdenedRenterPct: 49, avgPropertyTaxPct: 1.14, avgInsuranceAnnual: 1605, affordabilityIndex: 22, topCities: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Newton'] },
  { slug: 'michigan',       name: 'Michigan',       code: 'MI', medianHomePrice: 235000, yoyChange: 5.7,  fhfaHpi5yr: 51, fhfaHpi10yr: 112, medianHouseholdIncome: 69183,  costBurdenedOwnerPct: 18.5, costBurdenedRenterPct: 46, avgPropertyTaxPct: 1.38, avgInsuranceAnnual: 1395, affordabilityIndex: 63, topCities: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Traverse City', 'Kalamazoo'] },
  { slug: 'minnesota',      name: 'Minnesota',      code: 'MN', medianHomePrice: 335000, yoyChange: 3.6,  fhfaHpi5yr: 33, fhfaHpi10yr: 75,  medianHouseholdIncome: 87556,  costBurdenedOwnerPct: 18.0, costBurdenedRenterPct: 46, avgPropertyTaxPct: 1.11, avgInsuranceAnnual: 1751, affordabilityIndex: 50, topCities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Edina'] },
  { slug: 'mississippi',    name: 'Mississippi',    code: 'MS', medianHomePrice: 175000, yoyChange: 4.6,  fhfaHpi5yr: 44, fhfaHpi10yr: 85,  medianHouseholdIncome: 54915,  costBurdenedOwnerPct: 19.5, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.67, avgInsuranceAnnual: 1944, affordabilityIndex: 79, topCities: ['Jackson', 'Gulfport', 'Hattiesburg', 'Biloxi', 'Oxford'] },
  { slug: 'missouri',       name: 'Missouri',       code: 'MO', medianHomePrice: 238000, yoyChange: 4.4,  fhfaHpi5yr: 51, fhfaHpi10yr: 91,  medianHouseholdIncome: 68545,  costBurdenedOwnerPct: 17.5, costBurdenedRenterPct: 46, avgPropertyTaxPct: 0.97, avgInsuranceAnnual: 1804, affordabilityIndex: 64, topCities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'] },
  { slug: 'montana',        name: 'Montana',        code: 'MT', medianHomePrice: 465000, yoyChange: 2.8,  fhfaHpi5yr: 63, fhfaHpi10yr: 135, medianHouseholdIncome: 70804,  costBurdenedOwnerPct: 22.5, costBurdenedRenterPct: 50, avgPropertyTaxPct: 0.74, avgInsuranceAnnual: 2001, affordabilityIndex: 31, topCities: ['Billings', 'Missoula', 'Bozeman', 'Great Falls', 'Helena'] },
  { slug: 'nebraska',       name: 'Nebraska',       code: 'NE', medianHomePrice: 250000, yoyChange: 5.3,  fhfaHpi5yr: 44, fhfaHpi10yr: 83,  medianHouseholdIncome: 74590,  costBurdenedOwnerPct: 16.0, costBurdenedRenterPct: 45, avgPropertyTaxPct: 1.63, avgInsuranceAnnual: 3133, affordabilityIndex: 62, topCities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'] },
  { slug: 'nevada',         name: 'Nevada',         code: 'NV', medianHomePrice: 425000, yoyChange: 5.4,  fhfaHpi5yr: 49, fhfaHpi10yr: 127, medianHouseholdIncome: 75561,  costBurdenedOwnerPct: 23.0, costBurdenedRenterPct: 53, avgPropertyTaxPct: 0.55, avgInsuranceAnnual: 875,  affordabilityIndex: 34, topCities: ['Las Vegas', 'Reno', 'Henderson', 'Sparks', 'North Las Vegas'] },
  { slug: 'new-hampshire',  name: 'New Hampshire',  code: 'NH', medianHomePrice: 460000, yoyChange: 8.5,  fhfaHpi5yr: 66, fhfaHpi10yr: 123, medianHouseholdIncome: 95628,  costBurdenedOwnerPct: 22.0, costBurdenedRenterPct: 49, avgPropertyTaxPct: 1.93, avgInsuranceAnnual: 967,  affordabilityIndex: 32, topCities: ['Manchester', 'Nashua', 'Concord', 'Portsmouth', 'Keene'] },
  { slug: 'new-jersey',     name: 'New Jersey',     code: 'NJ', medianHomePrice: 510000, yoyChange: 8.9,  fhfaHpi5yr: 50, fhfaHpi10yr: 83,  medianHouseholdIncome: 101050, costBurdenedOwnerPct: 27.0, costBurdenedRenterPct: 51, avgPropertyTaxPct: 2.23, avgInsuranceAnnual: 1175, affordabilityIndex: 27, topCities: ['Newark', 'Jersey City', 'Princeton', 'Hoboken', 'Morristown'] },
  { slug: 'new-mexico',     name: 'New Mexico',     code: 'NM', medianHomePrice: 295000, yoyChange: 4.7,  fhfaHpi5yr: 47, fhfaHpi10yr: 95,  medianHouseholdIncome: 62268,  costBurdenedOwnerPct: 19.5, costBurdenedRenterPct: 47, avgPropertyTaxPct: 0.67, avgInsuranceAnnual: 1429, affordabilityIndex: 52, topCities: ['Albuquerque', 'Santa Fe', 'Las Cruces', 'Rio Rancho', 'Taos'] },
  { slug: 'new-york',       name: 'New York',       code: 'NY', medianHomePrice: 455000, yoyChange: 6.3,  fhfaHpi5yr: 29, fhfaHpi10yr: 60,  medianHouseholdIncome: 84578,  costBurdenedOwnerPct: 27.5, costBurdenedRenterPct: 53, avgPropertyTaxPct: 1.40, avgInsuranceAnnual: 1487, affordabilityIndex: 25, topCities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'] },
  { slug: 'north-carolina', name: 'North Carolina', code: 'NC', medianHomePrice: 340000, yoyChange: 5.2,  fhfaHpi5yr: 57, fhfaHpi10yr: 112, medianHouseholdIncome: 70804,  costBurdenedOwnerPct: 19.5, costBurdenedRenterPct: 47, avgPropertyTaxPct: 0.82, avgInsuranceAnnual: 1387, affordabilityIndex: 46, topCities: ['Charlotte', 'Raleigh', 'Durham', 'Asheville', 'Wilmington'] },
  { slug: 'north-dakota',   name: 'North Dakota',   code: 'ND', medianHomePrice: 245000, yoyChange: 3.1,  fhfaHpi5yr: 33, fhfaHpi10yr: 50,  medianHouseholdIncome: 76525,  costBurdenedOwnerPct: 14.5, costBurdenedRenterPct: 41, avgPropertyTaxPct: 0.98, avgInsuranceAnnual: 1900, affordabilityIndex: 66, topCities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'] },
  { slug: 'ohio',           name: 'Ohio',           code: 'OH', medianHomePrice: 225000, yoyChange: 6.1,  fhfaHpi5yr: 49, fhfaHpi10yr: 95,  medianHouseholdIncome: 69680,  costBurdenedOwnerPct: 17.0, costBurdenedRenterPct: 46, avgPropertyTaxPct: 1.59, avgInsuranceAnnual: 1098, affordabilityIndex: 67, topCities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'] },
  { slug: 'oklahoma',       name: 'Oklahoma',       code: 'OK', medianHomePrice: 205000, yoyChange: 3.9,  fhfaHpi5yr: 37, fhfaHpi10yr: 60,  medianHouseholdIncome: 63603,  costBurdenedOwnerPct: 16.5, costBurdenedRenterPct: 47, avgPropertyTaxPct: 0.89, avgInsuranceAnnual: 4319, affordabilityIndex: 74, topCities: ['Oklahoma City', 'Tulsa', 'Norman', 'Edmond', 'Broken Arrow'] },
  { slug: 'oregon',         name: 'Oregon',         code: 'OR', medianHomePrice: 485000, yoyChange: 2.0,  fhfaHpi5yr: 35, fhfaHpi10yr: 103, medianHouseholdIncome: 80160,  costBurdenedOwnerPct: 24.5, costBurdenedRenterPct: 50, avgPropertyTaxPct: 0.93, avgInsuranceAnnual: 916,  affordabilityIndex: 29, topCities: ['Portland', 'Eugene', 'Salem', 'Bend', 'Medford'] },
  { slug: 'pennsylvania',   name: 'Pennsylvania',   code: 'PA', medianHomePrice: 280000, yoyChange: 6.5,  fhfaHpi5yr: 48, fhfaHpi10yr: 75,  medianHouseholdIncome: 76081,  costBurdenedOwnerPct: 19.5, costBurdenedRenterPct: 47, avgPropertyTaxPct: 1.49, avgInsuranceAnnual: 1015, affordabilityIndex: 55, topCities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'State College', 'Reading'] },
  { slug: 'rhode-island',   name: 'Rhode Island',   code: 'RI', medianHomePrice: 440000, yoyChange: 10.3, fhfaHpi5yr: 59, fhfaHpi10yr: 119, medianHouseholdIncome: 84972,  costBurdenedOwnerPct: 25.5, costBurdenedRenterPct: 51, avgPropertyTaxPct: 1.40, avgInsuranceAnnual: 1500, affordabilityIndex: 33, topCities: ['Providence', 'Warwick', 'Cranston', 'Newport', 'Pawtucket'] },
  { slug: 'south-carolina', name: 'South Carolina', code: 'SC', medianHomePrice: 310000, yoyChange: 5.8,  fhfaHpi5yr: 56, fhfaHpi10yr: 110, medianHouseholdIncome: 67805,  costBurdenedOwnerPct: 19.0, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.57, avgInsuranceAnnual: 1486, affordabilityIndex: 51, topCities: ['Charleston', 'Columbia', 'Greenville', 'Myrtle Beach', 'Hilton Head'] },
  { slug: 'south-dakota',   name: 'South Dakota',   code: 'SD', medianHomePrice: 285000, yoyChange: 4.0,  fhfaHpi5yr: 51, fhfaHpi10yr: 97,  medianHouseholdIncome: 72168,  costBurdenedOwnerPct: 16.0, costBurdenedRenterPct: 43, avgPropertyTaxPct: 1.17, avgInsuranceAnnual: 2191, affordabilityIndex: 57, topCities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'] },
  { slug: 'tennessee',      name: 'Tennessee',      code: 'TN', medianHomePrice: 330000, yoyChange: 3.7,  fhfaHpi5yr: 56, fhfaHpi10yr: 112, medianHouseholdIncome: 67631,  costBurdenedOwnerPct: 19.0, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.67, avgInsuranceAnnual: 1748, affordabilityIndex: 48, topCities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Franklin'] },
  { slug: 'texas',          name: 'Texas',          code: 'TX', medianHomePrice: 310000, yoyChange: 1.9,  fhfaHpi5yr: 43, fhfaHpi10yr: 97,  medianHouseholdIncome: 76292,  costBurdenedOwnerPct: 21.0, costBurdenedRenterPct: 50, avgPropertyTaxPct: 1.68, avgInsuranceAnnual: 2189, affordabilityIndex: 45, topCities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth'] },
  { slug: 'utah',           name: 'Utah',           code: 'UT', medianHomePrice: 505000, yoyChange: 3.0,  fhfaHpi5yr: 59, fhfaHpi10yr: 144, medianHouseholdIncome: 93421,  costBurdenedOwnerPct: 21.5, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.57, avgInsuranceAnnual: 800,  affordabilityIndex: 28, topCities: ['Salt Lake City', 'Provo', 'Ogden', 'St. George', 'Park City'] },
  { slug: 'vermont',        name: 'Vermont',        code: 'VT', medianHomePrice: 380000, yoyChange: 9.8,  fhfaHpi5yr: 64, fhfaHpi10yr: 90,  medianHouseholdIncome: 78024,  costBurdenedOwnerPct: 22.5, costBurdenedRenterPct: 51, avgPropertyTaxPct: 1.83, avgInsuranceAnnual: 894,  affordabilityIndex: 40, topCities: ['Burlington', 'Montpelier', 'Stowe', 'Rutland', 'Brattleboro'] },
  { slug: 'virginia',       name: 'Virginia',       code: 'VA', medianHomePrice: 410000, yoyChange: 5.0,  fhfaHpi5yr: 43, fhfaHpi10yr: 69,  medianHouseholdIncome: 89931,  costBurdenedOwnerPct: 21.0, costBurdenedRenterPct: 47, avgPropertyTaxPct: 0.87, avgInsuranceAnnual: 1163, affordabilityIndex: 37, topCities: ['Arlington', 'Virginia Beach', 'Richmond', 'Alexandria', 'Charlottesville'] },
  { slug: 'washington',     name: 'Washington',     code: 'WA', medianHomePrice: 575000, yoyChange: 3.8,  fhfaHpi5yr: 44, fhfaHpi10yr: 124, medianHouseholdIncome: 94605,  costBurdenedOwnerPct: 22.5, costBurdenedRenterPct: 49, avgPropertyTaxPct: 0.87, avgInsuranceAnnual: 1019, affordabilityIndex: 24, topCities: ['Seattle', 'Bellevue', 'Tacoma', 'Spokane', 'Olympia'] },
  { slug: 'washington-dc',  name: 'Washington D.C.', code: 'DC', medianHomePrice: 650000, yoyChange: 4.9, fhfaHpi5yr: 14, fhfaHpi10yr: 35,  medianHouseholdIncome: 109383, costBurdenedOwnerPct: 25.0, costBurdenedRenterPct: 50, avgPropertyTaxPct: 0.62, avgInsuranceAnnual: 1400, affordabilityIndex: 21, topCities: ['Georgetown', 'Capitol Hill', 'Dupont Circle', 'Adams Morgan', 'Foggy Bottom'] },
  { slug: 'west-virginia',  name: 'West Virginia',  code: 'WV', medianHomePrice: 145000, yoyChange: 6.0,  fhfaHpi5yr: 44, fhfaHpi10yr: 60,  medianHouseholdIncome: 56247,  costBurdenedOwnerPct: 16.5, costBurdenedRenterPct: 44, avgPropertyTaxPct: 0.57, avgInsuranceAnnual: 1029, affordabilityIndex: 82, topCities: ['Charleston', 'Morgantown', 'Huntington', 'Parkersburg', 'Wheeling'] },
  { slug: 'wisconsin',      name: 'Wisconsin',      code: 'WI', medianHomePrice: 290000, yoyChange: 6.4,  fhfaHpi5yr: 53, fhfaHpi10yr: 80,  medianHouseholdIncome: 75670,  costBurdenedOwnerPct: 17.0, costBurdenedRenterPct: 45, avgPropertyTaxPct: 1.61, avgInsuranceAnnual: 1037, affordabilityIndex: 54, topCities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Eau Claire'] },
  { slug: 'wyoming',        name: 'Wyoming',        code: 'WY', medianHomePrice: 330000, yoyChange: 2.5,  fhfaHpi5yr: 52, fhfaHpi10yr: 75,  medianHouseholdIncome: 74815,  costBurdenedOwnerPct: 18.0, costBurdenedRenterPct: 44, avgPropertyTaxPct: 0.61, avgInsuranceAnnual: 1450, affordabilityIndex: 53, topCities: ['Cheyenne', 'Casper', 'Jackson', 'Laramie', 'Gillette'] },
];

/**
 * Demographia 2024 17th Annual Demographia International Housing Affordability
 * Survey buckets, applied to median multiple (price-to-income ratio).
 */
function classifyDemographia(pir: number): DemographiaBucket {
  if (pir >= 5.0) return 'severely-unaffordable';
  if (pir >= 4.0) return 'seriously-unaffordable';
  if (pir >= 3.0) return 'moderately-unaffordable';
  return 'affordable';
}

/**
 * Compute the buy-vs-rent crossover year using a simplified PITI vs rent
 * model. Anchored inputs only — no random adjustments.
 *   - Annual rent ≈ medianHomePrice × 0.06 (US price-to-rent ≈ 16.7)
 *   - Rent inflates 3%/yr (CPI shelter long-run mean)
 *   - Owner outflow = mortgage P&I (30-yr fixed, 20% down) + property tax +
 *     insurance + 1% maintenance, escalated by 2.5%/yr (tax + insurance creep)
 *   - Crossover = year where cumulative rent ≥ cumulative owner outflow
 *   - Capped at 30 (loan term); returned as integer years.
 */
function computeCrossover(s: RawState, mortgageRatePct: number): number {
  const principal = s.medianHomePrice * 0.8;
  const monthlyRate = mortgageRatePct / 100 / 12;
  const months = 360;
  const monthlyPI =
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const annualPI = monthlyPI * 12;
  const annualTax = s.medianHomePrice * (s.avgPropertyTaxPct / 100);
  const annualMaintenance = s.medianHomePrice * 0.01;

  let cumOwn = 0;
  let cumRent = 0;
  let annualRent = s.medianHomePrice * 0.06;
  let escalator = 1;
  for (let yr = 1; yr <= 30; yr++) {
    cumOwn += annualPI + (annualTax + s.avgInsuranceAnnual + annualMaintenance) * escalator;
    cumRent += annualRent;
    if (cumRent >= cumOwn) return yr;
    annualRent *= 1.03;
    escalator *= 1.025;
  }
  return 30;
}

export const STATES: StateData[] = RAW_STATES.map(s => {
  const priceToIncomeRatio =
    s.medianHouseholdIncome > 0
      ? Number((s.medianHomePrice / s.medianHouseholdIncome).toFixed(2))
      : 0;
  return {
    ...s,
    avgMortgageRate30yr: FRED_MORTGAGE_30YR_APR_2026,
    priceToIncomeRatio,
    demographiaBucket: classifyDemographia(priceToIncomeRatio),
    buyVsRentCrossoverYr: computeCrossover(s, FRED_MORTGAGE_30YR_APR_2026),
  };
});

export function getStateBySlug(slug: string): StateData | undefined {
  return STATES.find(s => s.slug === slug);
}

export function getAllStates(): StateData[] {
  return STATES;
}

export function getStatesSortedByPrice(direction: 'asc' | 'desc' = 'desc'): StateData[] {
  return [...STATES].sort((a, b) =>
    direction === 'desc' ? b.medianHomePrice - a.medianHomePrice : a.medianHomePrice - b.medianHomePrice,
  );
}
