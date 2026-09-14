const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function callAdminFn(name, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export async function validateAdminSession() {
  const token = localStorage.getItem('brandiór_admin_token')
  if (!token) return null
  const { ok, data } = await callAdminFn('admin-validate-session', { token })
  if (!ok || !data?.ok) return null
  return data // { ok, role, name, email, admin_user_id }
}

export function clearAdminSession() {
  localStorage.removeItem('brandiór_admin_token')
  localStorage.removeItem('brandiór_admin_user')
  localStorage.removeItem('brandiór_admin_role')
}

export function getAdminToken() {
  return localStorage.getItem('brandiór_admin_token')
}
