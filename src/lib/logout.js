import { supabase } from './supabase'

/**
 * Fully signs the user out.
 * - Calls supabase.auth.signOut() to invalidate the session server-side
 * - Manually removes ALL Supabase session keys from localStorage (sb-*) so
 *   onAuthStateChange cannot restore the session on the next page load
 * - Clears our own app keys
 */
export async function logout() {
  // Best-effort server-side invalidation
  try { await supabase.auth.signOut() } catch {}

  // Wipe every Supabase key from localStorage (the session, refresh token, etc.)
  Object.keys(localStorage)
    .filter(k => k.startsWith('sb-'))
    .forEach(k => localStorage.removeItem(k))

  // Wipe our app keys
  localStorage.removeItem('brandiór_user')
  localStorage.removeItem('brandiór_role')
  localStorage.removeItem('brandiór_preview_profile')
}
