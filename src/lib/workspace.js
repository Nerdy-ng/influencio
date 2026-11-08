/**
 * Determines the correct dashboard and localStorage values from a server-fetched profile row.
 * Never call with client-supplied values as authoritative — always pass the profile row
 * fetched directly from Supabase.
 *
 * Returns { workspace, path, role } where:
 *   workspace  — 'brand' | 'creator' | null (null means show workspace selector)
 *   path       — React Router path to navigate to
 *   role       — value to store in brandiór_role for Navbar/legacy compat
 */
export function resolveWorkspaceDestination(profile, appMetaRole) {
  const ws         = profile?.active_workspace
  const hasBrand   = profile?.has_brand_access   ?? false
  const hasCreator = profile?.has_creator_access  ?? false

  // Explicit workspace preference wins when the user actually has that capability
  if (ws === 'brand' && hasBrand) {
    return { workspace: 'brand', path: '/brand-dashboard', role: 'brand' }
  }
  if (ws === 'creator' && hasCreator) {
    return { workspace: 'creator', path: '/dashboard', role: 'talent' }
  }

  // Dual-role user with no valid workspace preference → selector
  if (hasBrand && hasCreator) {
    return { workspace: null, path: '/workspace-select', role: appMetaRole || 'talent' }
  }

  // Single-capability users
  if (hasBrand) {
    return { workspace: 'brand', path: '/brand-dashboard', role: 'brand' }
  }
  if (hasCreator) {
    return { workspace: 'creator', path: '/dashboard', role: 'talent' }
  }

  // Fallback: profile columns not yet seeded (old user, re-logging in before migration applied)
  if (appMetaRole === 'brand') {
    return { workspace: 'brand', path: '/brand-dashboard', role: 'brand' }
  }
  return { workspace: 'creator', path: '/dashboard', role: 'talent' }
}
