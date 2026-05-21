import { supabase } from './supabase'

// Phyllo work platform IDs (staging + production)
export const PHYLLO_PLATFORMS = {
  Instagram:  '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
  TikTok:     'de55aeec-0dc8-4119-bf90-16b3d1f0c987',
  YouTube:    '14d9ddf5-51c6-415e-bde6-f8ed36ad7054',
  'Twitter/X': '7645460a-96e0-4192-a3ce-a1fc30641f72',
}

// Step 1 — get or create a Phyllo user for the current Supabase user
export async function getOrCreatePhylloUser(supabaseUserId, name) {
  // Refresh session first to avoid 403s
  await supabase.auth.refreshSession()

  // Check localStorage cache first to avoid unnecessary DB calls
  const cached = localStorage.getItem('brandior_phyllo_user_id')
  if (cached) return cached

  // Check if we already stored the phyllo_user_id in DB
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('phyllo_user_id')
      .eq('id', supabaseUserId)
      .maybeSingle()

    if (profile?.phyllo_user_id) {
      localStorage.setItem('brandior_phyllo_user_id', profile.phyllo_user_id)
      return profile.phyllo_user_id
    }
  } catch (_) { /* continue to create */ }

  // Create new Phyllo user via our backend
  const res = await fetch('/api/phyllo-create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: supabaseUserId, name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create Phyllo user')

  // Save phyllo_user_id to profiles table + localStorage
  await supabase
    .from('profiles')
    .update({ phyllo_user_id: data.phyllo_user_id })
    .eq('id', supabaseUserId)
  localStorage.setItem('brandior_phyllo_user_id', data.phyllo_user_id)

  return data.phyllo_user_id
}

// Step 2 — get SDK token for the Phyllo user
export async function getPhylloSDKToken(phylloUserId) {
  const res = await fetch('/api/phyllo-sdk-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phyllo_user_id: phylloUserId,
      products: ['IDENTITY', 'ENGAGEMENT'],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to get SDK token')
  return data.sdk_token
}

// Step 3 — open Phyllo Connect via direct URL (bypasses SDK entirely)
export function openPhylloConnect({ token, userId, platformId, onConnected, onExit }) {
  const env = 'sandbox'
  const base = 'https://connect.sandbox.getphyllo.com'
  const redirectURL = encodeURIComponent(window.location.href)
  const platform = platformId ? `&workPlatformId=${platformId}` : ''
  const url = `${base}?userId=${userId}&appName=Brandior&token=${token}&env=${env}&redirectURL=${redirectURL}${platform}`

  console.log('[Phyllo] opening URL:', url)

  // Open in a popup window
  const popup = window.open(url, 'phyllo-connect', 'width=480,height=700,scrollbars=yes,resizable=yes')

  if (!popup) {
    // Fallback: open in same tab
    window.location.href = url
    return
  }

  // Poll for popup close
  const timer = setInterval(() => {
    if (popup.closed) {
      clearInterval(timer)
      console.log('[Phyllo] popup closed')
      onExit?.()
    }
  }, 500)

  // Listen for postMessage from Phyllo
  function handleMessage(e) {
    if (!e.origin.includes('getphyllo.com')) return
    console.log('[Phyllo] message received:', e.data)
    const data = e.data
    if (data?.accountConnected || data?.account_id) {
      window.removeEventListener('message', handleMessage)
      clearInterval(timer)
      popup.close()
      onConnected?.({ accountId: data.account_id || data.accountId, workplatformId: data.work_platform_id })
    }
  }
  window.addEventListener('message', handleMessage)
}

// Step 4 — fetch account data from Phyllo after connection
export async function fetchPhylloAccountData(phylloUserId, accountId) {
  const CLIENT_ID = import.meta.env.VITE_PHYLLO_CLIENT_ID
  const CLIENT_SECRET = import.meta.env.VITE_PHYLLO_CLIENT_SECRET

  // Fetch via our backend to keep credentials safe
  const res = await fetch(`/api/phyllo/account-data?user_id=${phylloUserId}&account_id=${accountId}`)
  const data = await res.json()
  return data
}
