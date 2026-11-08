/**
 * Curated global city list for the Brandior location selector.
 * Africa-focused; covers major diaspora and international brand hubs.
 * Format: "City, Country" — matches what brands see and select.
 */
export const CITY_LIST: string[] = [
  // ── Nigeria (primary market) ──────────────────────────────────────────────
  'Lagos, Nigeria',
  'Abuja, Nigeria',
  'Port Harcourt, Nigeria',
  'Ibadan, Nigeria',
  'Kano, Nigeria',
  'Enugu, Nigeria',
  'Benin City, Nigeria',
  'Warri, Nigeria',
  'Owerri, Nigeria',
  'Calabar, Nigeria',
  'Uyo, Nigeria',
  'Jos, Nigeria',
  'Ilorin, Nigeria',
  'Kaduna, Nigeria',
  'Onitsha, Nigeria',
  'Aba, Nigeria',
  'Zaria, Nigeria',
  'Maiduguri, Nigeria',
  'Abeokuta, Nigeria',
  'Akure, Nigeria',

  // ── West Africa ───────────────────────────────────────────────────────────
  'Accra, Ghana',
  'Kumasi, Ghana',
  'Tamale, Ghana',
  'Dakar, Senegal',
  'Abidjan, Côte d\'Ivoire',
  'Lomé, Togo',
  'Cotonou, Benin',
  'Ouagadougou, Burkina Faso',
  'Bamako, Mali',
  'Conakry, Guinea',
  'Freetown, Sierra Leone',
  'Monrovia, Liberia',
  'Banjul, Gambia',
  'Bissau, Guinea-Bissau',
  'Praia, Cape Verde',
  'Niamey, Niger',
  'Nouakchott, Mauritania',

  // ── East Africa ───────────────────────────────────────────────────────────
  'Nairobi, Kenya',
  'Mombasa, Kenya',
  'Kampala, Uganda',
  'Dar es Salaam, Tanzania',
  'Dodoma, Tanzania',
  'Addis Ababa, Ethiopia',
  'Kigali, Rwanda',
  'Bujumbura, Burundi',
  'Mogadishu, Somalia',
  'Djibouti, Djibouti',
  'Asmara, Eritrea',

  // ── Central Africa ────────────────────────────────────────────────────────
  'Kinshasa, DRC',
  'Brazzaville, Republic of Congo',
  'Yaoundé, Cameroon',
  'Douala, Cameroon',
  'Libreville, Gabon',
  'Malabo, Equatorial Guinea',
  'Bangui, Central African Republic',
  'N\'Djamena, Chad',

  // ── Southern Africa ───────────────────────────────────────────────────────
  'Johannesburg, South Africa',
  'Cape Town, South Africa',
  'Durban, South Africa',
  'Pretoria, South Africa',
  'Maputo, Mozambique',
  'Harare, Zimbabwe',
  'Bulawayo, Zimbabwe',
  'Lusaka, Zambia',
  'Windhoek, Namibia',
  'Gaborone, Botswana',
  'Lilongwe, Malawi',
  'Blantyre, Malawi',
  'Antananarivo, Madagascar',
  'Port Louis, Mauritius',

  // ── North Africa ──────────────────────────────────────────────────────────
  'Cairo, Egypt',
  'Alexandria, Egypt',
  'Casablanca, Morocco',
  'Rabat, Morocco',
  'Algiers, Algeria',
  'Tunis, Tunisia',
  'Tripoli, Libya',
  'Khartoum, Sudan',

  // ── Middle East ───────────────────────────────────────────────────────────
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, Saudi Arabia',
  'Jeddah, Saudi Arabia',
  'Doha, Qatar',
  'Kuwait City, Kuwait',

  // ── Europe ────────────────────────────────────────────────────────────────
  'London, United Kingdom',
  'Manchester, United Kingdom',
  'Birmingham, United Kingdom',
  'Leeds, United Kingdom',
  'Paris, France',
  'Berlin, Germany',
  'Amsterdam, Netherlands',
  'Stockholm, Sweden',
  'Oslo, Norway',
  'Copenhagen, Denmark',
  'Dublin, Ireland',
  'Madrid, Spain',
  'Rome, Italy',
  'Lisbon, Portugal',
  'Brussels, Belgium',

  // ── North America ─────────────────────────────────────────────────────────
  'New York, United States',
  'Los Angeles, United States',
  'Houston, United States',
  'Atlanta, United States',
  'Chicago, United States',
  'Dallas, United States',
  'Washington DC, United States',
  'Miami, United States',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Montreal, Canada',

  // ── Asia-Pacific ──────────────────────────────────────────────────────────
  'Sydney, Australia',
  'Melbourne, Australia',
  'Tokyo, Japan',
  'Singapore, Singapore',
  'Kuala Lumpur, Malaysia',
  'Hong Kong, Hong Kong',
]

/**
 * Returns matching city suggestions for a search query.
 * - Searches both the full display string and the city component.
 * - Case-insensitive, trims whitespace.
 */
export function searchLocations(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return CITY_LIST.slice(0, 8)
  return CITY_LIST.filter(entry => entry.toLowerCase().includes(q)).slice(0, limit)
}

/**
 * Checks whether a creator's stored location string matches a selected
 * "City, Country" filter value.
 *
 * Handles legacy free-text values:
 *   creator.location = "Lagos"       → matches filter "Lagos, Nigeria"  ✓
 *   creator.location = "Lagos, NG"   → matches filter "Lagos, Nigeria"  ✓
 *   creator.location = "Lagos, Nigeria" → exact match                   ✓
 */
export function locationMatches(creatorLocation: string, filterValue: string): boolean {
  if (!creatorLocation || !filterValue) return false
  const cl = creatorLocation.toLowerCase().trim()
  const fl = filterValue.toLowerCase().trim()
  if (cl === fl) return true
  // Extract city component from both sides and compare
  const clCity = cl.split(',')[0].trim()
  const flCity = fl.split(',')[0].trim()
  return clCity === flCity
}
