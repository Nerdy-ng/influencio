const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const SESSION_KEY = 'brandiór_admin_session_id'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours in ms

// ── Raw Supabase REST helper (no supabase-js dependency) ─────────────────────

async function dbInsert(table, row) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify(row),
  }).catch(() => {})
}

async function dbUpdate(table, match, patch) {
  const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&')
  return fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method:  'PATCH',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify(patch),
  }).catch(() => {})
}

async function dbSelect(table, params) {
  const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }).catch(() => null)
  if (!res?.ok) return []
  return res.json().catch(() => [])
}

// ── Core admin function caller ────────────────────────────────────────────────

export async function callAdminFn(name, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

// ── Security event logger ─────────────────────────────────────────────────────

export async function logSecurityEvent(eventType, adminData = {}, metadata = {}) {
  const sessionId = localStorage.getItem(SESSION_KEY)
  await dbInsert('admin_security_events', {
    event_type:  eventType,
    admin_email: adminData.email || null,
    admin_name:  adminData.name  || null,
    admin_role:  adminData.role  || null,
    session_id:  sessionId       || null,
    metadata:    metadata,
  })
}

// ── Session registration (called once after login) ────────────────────────────

export async function registerAdminSession(adminData) {
  // Generate and store a session UUID
  const sessionId  = crypto.randomUUID()
  const expiresAt  = new Date(Date.now() + SESSION_TTL).toISOString()
  const userAgent  = navigator.userAgent.slice(0, 250)

  localStorage.setItem(SESSION_KEY, sessionId)

  await dbInsert('admin_sessions', {
    id:          sessionId,
    admin_email: adminData.email || '',
    admin_name:  adminData.name  || '',
    admin_role:  adminData.role  || '',
    expires_at:  expiresAt,
    last_seen_at: new Date().toISOString(),
    is_active:   true,
    user_agent:  userAgent,
  })

  await logSecurityEvent('login', adminData, {
    user_agent: userAgent,
  })
}

// ── Heartbeat: update last_seen and check for server-side revocation ──────────

export async function refreshAdminSession(adminData) {
  const sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) return true  // no session tracked yet — allow (legacy)

  const rows = await dbSelect('admin_sessions', {
    id:       `eq.${sessionId}`,
    select:   'id,is_active,expires_at',
  })

  const session = rows?.[0]
  if (!session) return true  // session not in DB — allow (legacy)

  // Revoked by another admin
  if (!session.is_active) return false

  // Server-side expiry check
  if (new Date(session.expires_at) < new Date()) {
    await logSecurityEvent('session_expired', adminData)
    return false
  }

  // Update heartbeat (fire and forget)
  dbUpdate('admin_sessions', { id: sessionId }, { last_seen_at: new Date().toISOString() })

  return true
}

// ── Validate session (JWT + revocation check) ─────────────────────────────────

export async function validateAdminSession() {
  const token = localStorage.getItem('brandiór_admin_token')
  if (!token) return null

  const [{ ok, data }, revocationOk] = await Promise.all([
    callAdminFn('admin-validate-session', { token }),
    refreshAdminSession({}),
  ])

  if (!ok || !data?.ok) return null
  if (!revocationOk) return null

  return data // { ok, role, name, email, admin_user_id }
}

// ── Clear session (logout) ────────────────────────────────────────────────────

export async function clearAdminSession(adminData = {}) {
  const sessionId = localStorage.getItem(SESSION_KEY)
  if (sessionId) {
    await Promise.all([
      dbUpdate('admin_sessions', { id: sessionId }, {
        is_active:  false,
        revoked_at: new Date().toISOString(),
      }),
      logSecurityEvent('logout', adminData),
    ])
  }
  localStorage.removeItem('brandiór_admin_token')
  localStorage.removeItem('brandiór_admin_user')
  localStorage.removeItem('brandiór_admin_role')
  localStorage.removeItem(SESSION_KEY)
}

export function getAdminToken() {
  return localStorage.getItem('brandiór_admin_token')
}
