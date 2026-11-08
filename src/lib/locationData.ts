/**
 * Brandior location dataset — Nigeria-focused launch phase.
 * Covers all 36 states + FCT with state capitals and major population centres.
 * Format: "City, Nigeria" for consistent matching with existing free-text values.
 */
export const CITY_LIST: string[] = [
  // ── Lagos State ───────────────────────────────────────────────────────────
  'Lagos, Nigeria',
  'Ikeja, Nigeria',
  'Ikorodu, Nigeria',
  'Badagry, Nigeria',
  'Epe, Nigeria',

  // ── Ogun State ────────────────────────────────────────────────────────────
  'Abeokuta, Nigeria',
  'Sagamu, Nigeria',
  'Ijebu-Ode, Nigeria',
  'Ilaro, Nigeria',
  'Ijebu-Igbo, Nigeria',

  // ── Oyo State ─────────────────────────────────────────────────────────────
  'Ibadan, Nigeria',
  'Ogbomosho, Nigeria',
  'Oyo, Nigeria',
  'Iseyin, Nigeria',
  'Eruwa, Nigeria',

  // ── Osun State ────────────────────────────────────────────────────────────
  'Osogbo, Nigeria',
  'Ile-Ife, Nigeria',
  'Ilesa, Nigeria',
  'Ede, Nigeria',
  'Iwo, Nigeria',

  // ── Ekiti State ───────────────────────────────────────────────────────────
  'Ado-Ekiti, Nigeria',
  'Ikere-Ekiti, Nigeria',
  'Efon-Alaaye, Nigeria',

  // ── Ondo State ────────────────────────────────────────────────────────────
  'Akure, Nigeria',
  'Ondo, Nigeria',
  'Owo, Nigeria',
  'Okitipupa, Nigeria',
  'Ikare-Akoko, Nigeria',

  // ── Kwara State ───────────────────────────────────────────────────────────
  'Ilorin, Nigeria',
  'Offa, Nigeria',
  'Omu-Aran, Nigeria',
  'Share, Nigeria',

  // ── FCT (Abuja) ───────────────────────────────────────────────────────────
  'Abuja, Nigeria',
  'Gwagwalada, Nigeria',
  'Kuje, Nigeria',

  // ── Niger State ───────────────────────────────────────────────────────────
  'Minna, Nigeria',
  'Bida, Nigeria',
  'Suleja, Nigeria',
  'Kontagora, Nigeria',
  'New Bussa, Nigeria',

  // ── Kogi State ────────────────────────────────────────────────────────────
  'Lokoja, Nigeria',
  'Okene, Nigeria',
  'Idah, Nigeria',
  'Anyigba, Nigeria',
  'Ankpa, Nigeria',

  // ── Benue State ───────────────────────────────────────────────────────────
  'Makurdi, Nigeria',
  'Gboko, Nigeria',
  'Otukpo, Nigeria',
  'Zaki Biam, Nigeria',

  // ── Nasarawa State ────────────────────────────────────────────────────────
  'Lafia, Nigeria',
  'Keffi, Nigeria',
  'Nasarawa, Nigeria',

  // ── Plateau State ─────────────────────────────────────────────────────────
  'Jos, Nigeria',
  'Bukuru, Nigeria',
  'Pankshin, Nigeria',
  'Shendam, Nigeria',

  // ── Kaduna State ──────────────────────────────────────────────────────────
  'Kaduna, Nigeria',
  'Zaria, Nigeria',
  'Kafanchan, Nigeria',

  // ── Kano State ────────────────────────────────────────────────────────────
  'Kano, Nigeria',

  // ── Jigawa State ──────────────────────────────────────────────────────────
  'Dutse, Nigeria',
  'Hadejia, Nigeria',
  'Gumel, Nigeria',

  // ── Katsina State ─────────────────────────────────────────────────────────
  'Katsina, Nigeria',
  'Daura, Nigeria',
  'Funtua, Nigeria',

  // ── Sokoto State ──────────────────────────────────────────────────────────
  'Sokoto, Nigeria',

  // ── Kebbi State ───────────────────────────────────────────────────────────
  'Birnin Kebbi, Nigeria',
  'Argungu, Nigeria',

  // ── Zamfara State ─────────────────────────────────────────────────────────
  'Gusau, Nigeria',
  'Talata-Mafara, Nigeria',

  // ── Bauchi State ──────────────────────────────────────────────────────────
  'Bauchi, Nigeria',
  'Azare, Nigeria',

  // ── Gombe State ───────────────────────────────────────────────────────────
  'Gombe, Nigeria',
  'Deba, Nigeria',

  // ── Taraba State ──────────────────────────────────────────────────────────
  'Jalingo, Nigeria',
  'Wukari, Nigeria',
  'Bali, Nigeria',

  // ── Adamawa State ─────────────────────────────────────────────────────────
  'Yola, Nigeria',
  'Mubi, Nigeria',
  'Numan, Nigeria',

  // ── Borno State ───────────────────────────────────────────────────────────
  'Maiduguri, Nigeria',
  'Biu, Nigeria',

  // ── Yobe State ────────────────────────────────────────────────────────────
  'Damaturu, Nigeria',
  'Potiskum, Nigeria',
  'Nguru, Nigeria',

  // ── Enugu State ───────────────────────────────────────────────────────────
  'Enugu, Nigeria',
  'Nsukka, Nigeria',
  'Agbani, Nigeria',

  // ── Anambra State ─────────────────────────────────────────────────────────
  'Awka, Nigeria',
  'Onitsha, Nigeria',
  'Nnewi, Nigeria',
  'Ekwulobia, Nigeria',
  'Nkpor, Nigeria',

  // ── Imo State ─────────────────────────────────────────────────────────────
  'Owerri, Nigeria',
  'Orlu, Nigeria',
  'Okigwe, Nigeria',

  // ── Abia State ────────────────────────────────────────────────────────────
  'Umuahia, Nigeria',
  'Aba, Nigeria',
  'Arochukwu, Nigeria',

  // ── Ebonyi State ──────────────────────────────────────────────────────────
  'Abakaliki, Nigeria',
  'Afikpo, Nigeria',

  // ── Cross River State ─────────────────────────────────────────────────────
  'Calabar, Nigeria',
  'Ikom, Nigeria',
  'Ugep, Nigeria',

  // ── Akwa Ibom State ───────────────────────────────────────────────────────
  'Uyo, Nigeria',
  'Eket, Nigeria',
  'Ikot Ekpene, Nigeria',
  'Oron, Nigeria',

  // ── Rivers State ──────────────────────────────────────────────────────────
  'Port Harcourt, Nigeria',
  'Bonny, Nigeria',
  'Eleme, Nigeria',

  // ── Bayelsa State ─────────────────────────────────────────────────────────
  'Yenagoa, Nigeria',
  'Sagbama, Nigeria',

  // ── Delta State ───────────────────────────────────────────────────────────
  'Asaba, Nigeria',
  'Warri, Nigeria',
  'Sapele, Nigeria',
  'Ughelli, Nigeria',
  'Agbor, Nigeria',
  'Abraka, Nigeria',

  // ── Edo State ─────────────────────────────────────────────────────────────
  'Benin City, Nigeria',
  'Auchi, Nigeria',
  'Ekpoma, Nigeria',
  'Uromi, Nigeria',
  'Irrua, Nigeria',
]

/**
 * Returns matching city suggestions for a search query.
 * - Searches the full display string; case-insensitive.
 * - Returns the first `limit` entries when query is empty.
 */
export function searchLocations(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return CITY_LIST.slice(0, limit)
  return CITY_LIST.filter(entry => entry.toLowerCase().includes(q)).slice(0, limit)
}

/**
 * Checks whether a creator's stored location string matches a selected
 * "City, Nigeria" filter value.
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
  const clCity = cl.split(',')[0].trim()
  const flCity = fl.split(',')[0].trim()
  return clCity === flCity
}
