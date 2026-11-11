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

  // 1. Dual-role: both capabilities present — route by active_workspace (authoritative preference)
  if (hasBrand && hasCreator) {
    if (ws === 'brand')   return { workspace: 'brand',   path: '/brand-dashboard', role: 'brand' }
    if (ws === 'creator') return { workspace: 'creator', path: '/creator/find-work', role: 'talent' }
    // Both capabilities but no valid active_workspace → selector
    return { workspace: null, path: '/workspace-select', role: appMetaRole || 'talent' }
  }

  // 2a. Single brand capability
  if (hasBrand) return { workspace: 'brand', path: '/brand-dashboard', role: 'brand' }

  // 2b+2c. Creator capability present
  if (hasCreator) {
    // 2c. Legacy inconsistency guard: creator capability is set but app_metadata.role says brand.
    // This is the transition state before Phase 3 reconciliation: sync_capabilities_on_insert
    // used the client-writable profiles.role='talent' at signup and granted has_creator_access
    // instead of has_brand_access, while app_metadata.role was correctly set to 'brand'.
    // Route to brand so the user reaches their intended workspace during the transition period.
    if (appMetaRole === 'brand') {
      return { workspace: 'brand', path: '/brand-dashboard', role: 'brand' }
    }
    return { workspace: 'creator', path: '/creator/find-work', role: 'talent' }
  }

  // 3. Zero capabilities: fall back to app_metadata.role (legacy/pre-migration users)
  if (appMetaRole === 'brand') return { workspace: 'brand',   path: '/brand-dashboard', role: 'brand' }
  return { workspace: 'creator', path: '/creator/find-work', role: 'talent' }
}
