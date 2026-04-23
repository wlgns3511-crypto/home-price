export interface StateData {
  slug: string;
  name: string;
  code: string;
  medianHomePrice: number;
  yoyChange: number;
  affordabilityIndex: number;
  topCities: string[];
}

/**
 * 50 US states + DC with 2025 housing data.
 * Sources: Zillow ZHVI, NAR, Census ACS.
 */
export const STATES: StateData[] = [
  { slug: 'alabama', name: 'Alabama', code: 'AL', medianHomePrice: 216000, yoyChange: 3.2, affordabilityIndex: 72, topCities: ['Birmingham', 'Huntsville', 'Mobile', 'Montgomery', 'Tuscaloosa'] },
  { slug: 'alaska', name: 'Alaska', code: 'AK', medianHomePrice: 358000, yoyChange: 1.8, affordabilityIndex: 48, topCities: ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka'] },
  { slug: 'arizona', name: 'Arizona', code: 'AZ', medianHomePrice: 395000, yoyChange: 4.1, affordabilityIndex: 41, topCities: ['Phoenix', 'Tucson', 'Scottsdale', 'Mesa', 'Chandler'] },
  { slug: 'arkansas', name: 'Arkansas', code: 'AR', medianHomePrice: 195000, yoyChange: 5.0, affordabilityIndex: 76, topCities: ['Little Rock', 'Fayetteville', 'Fort Smith', 'Bentonville', 'Jonesboro'] },
  { slug: 'california', name: 'California', code: 'CA', medianHomePrice: 785000, yoyChange: 5.6, affordabilityIndex: 17, topCities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
  { slug: 'colorado', name: 'Colorado', code: 'CO', medianHomePrice: 535000, yoyChange: 2.3, affordabilityIndex: 30, topCities: ['Denver', 'Colorado Springs', 'Aurora', 'Boulder', 'Fort Collins'] },
  { slug: 'connecticut', name: 'Connecticut', code: 'CT', medianHomePrice: 405000, yoyChange: 8.7, affordabilityIndex: 38, topCities: ['Stamford', 'Hartford', 'New Haven', 'Bridgeport', 'Greenwich'] },
  { slug: 'delaware', name: 'Delaware', code: 'DE', medianHomePrice: 355000, yoyChange: 6.2, affordabilityIndex: 47, topCities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Rehoboth Beach'] },
  { slug: 'florida', name: 'Florida', code: 'FL', medianHomePrice: 398000, yoyChange: 3.4, affordabilityIndex: 37, topCities: ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Naples'] },
  { slug: 'georgia', name: 'Georgia', code: 'GA', medianHomePrice: 330000, yoyChange: 4.5, affordabilityIndex: 49, topCities: ['Atlanta', 'Savannah', 'Augusta', 'Athens', 'Marietta'] },
  { slug: 'hawaii', name: 'Hawaii', code: 'HI', medianHomePrice: 835000, yoyChange: 4.2, affordabilityIndex: 12, topCities: ['Honolulu', 'Maui', 'Kailua', 'Hilo', 'Pearl City'] },
  { slug: 'idaho', name: 'Idaho', code: 'ID', medianHomePrice: 440000, yoyChange: 1.5, affordabilityIndex: 35, topCities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Coeur d\'Alene'] },
  { slug: 'illinois', name: 'Illinois', code: 'IL', medianHomePrice: 275000, yoyChange: 6.8, affordabilityIndex: 56, topCities: ['Chicago', 'Naperville', 'Aurora', 'Springfield', 'Evanston'] },
  { slug: 'indiana', name: 'Indiana', code: 'IN', medianHomePrice: 240000, yoyChange: 5.5, affordabilityIndex: 65, topCities: ['Indianapolis', 'Fort Wayne', 'Carmel', 'Fishers', 'Bloomington'] },
  { slug: 'iowa', name: 'Iowa', code: 'IA', medianHomePrice: 210000, yoyChange: 4.3, affordabilityIndex: 71, topCities: ['Des Moines', 'Cedar Rapids', 'Iowa City', 'Davenport', 'Ames'] },
  { slug: 'kansas', name: 'Kansas', code: 'KS', medianHomePrice: 225000, yoyChange: 4.8, affordabilityIndex: 68, topCities: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Lawrence'] },
  { slug: 'kentucky', name: 'Kentucky', code: 'KY', medianHomePrice: 210000, yoyChange: 5.1, affordabilityIndex: 70, topCities: ['Louisville', 'Lexington', 'Bowling Green', 'Covington', 'Frankfort'] },
  { slug: 'louisiana', name: 'Louisiana', code: 'LA', medianHomePrice: 198000, yoyChange: 2.1, affordabilityIndex: 73, topCities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'] },
  { slug: 'maine', name: 'Maine', code: 'ME', medianHomePrice: 380000, yoyChange: 9.2, affordabilityIndex: 39, topCities: ['Portland', 'Bangor', 'Lewiston', 'Auburn', 'South Portland'] },
  { slug: 'maryland', name: 'Maryland', code: 'MD', medianHomePrice: 420000, yoyChange: 5.9, affordabilityIndex: 36, topCities: ['Baltimore', 'Bethesda', 'Rockville', 'Frederick', 'Annapolis'] },
  { slug: 'massachusetts', name: 'Massachusetts', code: 'MA', medianHomePrice: 615000, yoyChange: 7.4, affordabilityIndex: 22, topCities: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Newton'] },
  { slug: 'michigan', name: 'Michigan', code: 'MI', medianHomePrice: 235000, yoyChange: 5.7, affordabilityIndex: 63, topCities: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Traverse City', 'Kalamazoo'] },
  { slug: 'minnesota', name: 'Minnesota', code: 'MN', medianHomePrice: 335000, yoyChange: 3.6, affordabilityIndex: 50, topCities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Edina'] },
  { slug: 'mississippi', name: 'Mississippi', code: 'MS', medianHomePrice: 175000, yoyChange: 4.6, affordabilityIndex: 79, topCities: ['Jackson', 'Gulfport', 'Hattiesburg', 'Biloxi', 'Oxford'] },
  { slug: 'missouri', name: 'Missouri', code: 'MO', medianHomePrice: 238000, yoyChange: 4.4, affordabilityIndex: 64, topCities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'] },
  { slug: 'montana', name: 'Montana', code: 'MT', medianHomePrice: 465000, yoyChange: 2.8, affordabilityIndex: 31, topCities: ['Billings', 'Missoula', 'Bozeman', 'Great Falls', 'Helena'] },
  { slug: 'nebraska', name: 'Nebraska', code: 'NE', medianHomePrice: 250000, yoyChange: 5.3, affordabilityIndex: 62, topCities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'] },
  { slug: 'nevada', name: 'Nevada', code: 'NV', medianHomePrice: 425000, yoyChange: 5.4, affordabilityIndex: 34, topCities: ['Las Vegas', 'Reno', 'Henderson', 'Sparks', 'North Las Vegas'] },
  { slug: 'new-hampshire', name: 'New Hampshire', code: 'NH', medianHomePrice: 460000, yoyChange: 8.5, affordabilityIndex: 32, topCities: ['Manchester', 'Nashua', 'Concord', 'Portsmouth', 'Keene'] },
  { slug: 'new-jersey', name: 'New Jersey', code: 'NJ', medianHomePrice: 510000, yoyChange: 8.9, affordabilityIndex: 27, topCities: ['Newark', 'Jersey City', 'Princeton', 'Hoboken', 'Morristown'] },
  { slug: 'new-mexico', name: 'New Mexico', code: 'NM', medianHomePrice: 295000, yoyChange: 4.7, affordabilityIndex: 52, topCities: ['Albuquerque', 'Santa Fe', 'Las Cruces', 'Rio Rancho', 'Taos'] },
  { slug: 'new-york', name: 'New York', code: 'NY', medianHomePrice: 455000, yoyChange: 6.3, affordabilityIndex: 25, topCities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'] },
  { slug: 'north-carolina', name: 'North Carolina', code: 'NC', medianHomePrice: 340000, yoyChange: 5.2, affordabilityIndex: 46, topCities: ['Charlotte', 'Raleigh', 'Durham', 'Asheville', 'Wilmington'] },
  { slug: 'north-dakota', name: 'North Dakota', code: 'ND', medianHomePrice: 245000, yoyChange: 3.1, affordabilityIndex: 66, topCities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'] },
  { slug: 'ohio', name: 'Ohio', code: 'OH', medianHomePrice: 225000, yoyChange: 6.1, affordabilityIndex: 67, topCities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'] },
  { slug: 'oklahoma', name: 'Oklahoma', code: 'OK', medianHomePrice: 205000, yoyChange: 3.9, affordabilityIndex: 74, topCities: ['Oklahoma City', 'Tulsa', 'Norman', 'Edmond', 'Broken Arrow'] },
  { slug: 'oregon', name: 'Oregon', code: 'OR', medianHomePrice: 485000, yoyChange: 2.0, affordabilityIndex: 29, topCities: ['Portland', 'Eugene', 'Salem', 'Bend', 'Medford'] },
  { slug: 'pennsylvania', name: 'Pennsylvania', code: 'PA', medianHomePrice: 280000, yoyChange: 6.5, affordabilityIndex: 55, topCities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'State College', 'Reading'] },
  { slug: 'rhode-island', name: 'Rhode Island', code: 'RI', medianHomePrice: 440000, yoyChange: 10.3, affordabilityIndex: 33, topCities: ['Providence', 'Warwick', 'Cranston', 'Newport', 'Pawtucket'] },
  { slug: 'south-carolina', name: 'South Carolina', code: 'SC', medianHomePrice: 310000, yoyChange: 5.8, affordabilityIndex: 51, topCities: ['Charleston', 'Columbia', 'Greenville', 'Myrtle Beach', 'Hilton Head'] },
  { slug: 'south-dakota', name: 'South Dakota', code: 'SD', medianHomePrice: 285000, yoyChange: 4.0, affordabilityIndex: 57, topCities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'] },
  { slug: 'tennessee', name: 'Tennessee', code: 'TN', medianHomePrice: 330000, yoyChange: 3.7, affordabilityIndex: 48, topCities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Franklin'] },
  { slug: 'texas', name: 'Texas', code: 'TX', medianHomePrice: 310000, yoyChange: 1.9, affordabilityIndex: 45, topCities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth'] },
  { slug: 'utah', name: 'Utah', code: 'UT', medianHomePrice: 505000, yoyChange: 3.0, affordabilityIndex: 28, topCities: ['Salt Lake City', 'Provo', 'Ogden', 'St. George', 'Park City'] },
  { slug: 'vermont', name: 'Vermont', code: 'VT', medianHomePrice: 380000, yoyChange: 9.8, affordabilityIndex: 40, topCities: ['Burlington', 'Montpelier', 'Stowe', 'Rutland', 'Brattleboro'] },
  { slug: 'virginia', name: 'Virginia', code: 'VA', medianHomePrice: 410000, yoyChange: 5.0, affordabilityIndex: 37, topCities: ['Arlington', 'Virginia Beach', 'Richmond', 'Alexandria', 'Charlottesville'] },
  { slug: 'washington', name: 'Washington', code: 'WA', medianHomePrice: 575000, yoyChange: 3.8, affordabilityIndex: 24, topCities: ['Seattle', 'Bellevue', 'Tacoma', 'Spokane', 'Olympia'] },
  { slug: 'washington-dc', name: 'Washington D.C.', code: 'DC', medianHomePrice: 650000, yoyChange: 4.9, affordabilityIndex: 21, topCities: ['Georgetown', 'Capitol Hill', 'Dupont Circle', 'Adams Morgan', 'Foggy Bottom'] },
  { slug: 'west-virginia', name: 'West Virginia', code: 'WV', medianHomePrice: 145000, yoyChange: 6.0, affordabilityIndex: 82, topCities: ['Charleston', 'Morgantown', 'Huntington', 'Parkersburg', 'Wheeling'] },
  { slug: 'wisconsin', name: 'Wisconsin', code: 'WI', medianHomePrice: 290000, yoyChange: 6.4, affordabilityIndex: 54, topCities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Eau Claire'] },
  { slug: 'wyoming', name: 'Wyoming', code: 'WY', medianHomePrice: 330000, yoyChange: 2.5, affordabilityIndex: 53, topCities: ['Cheyenne', 'Casper', 'Jackson', 'Laramie', 'Gillette'] },
];

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
