import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthDiagnosticPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [{ data: userData, error: userError }, { data: sessionData }] =
          await Promise.all([
            supabase.auth.getUser(),
            supabase.auth.getSession(),
          ])

        const uid = userData?.user?.id
        let profile = null
        let profileError = null

        if (uid) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name, role, has_brand_access, has_creator_access, active_workspace')
            .eq('id', uid)
            .maybeSingle()
          profile = data
          profileError = error?.message ?? null
        }

        setResult({
          userId:          userData?.user?.id          ?? 'null',
          email:           userData?.user?.email        ?? 'null',
          appMetadataRole: userData?.user?.app_metadata?.role ?? 'null',
          providers:       (userData?.user?.identities ?? []).map(i => i.provider).join(', ') || 'none',
          hasSession:      !!sessionData?.session,
          authError:       userError?.message ?? 'none',
          profile,
          profileError,
        })
      } catch (e) {
        setResult({ fatalError: e?.message ?? String(e) })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const lines = result ? buildText(result) : ''

  function buildText(r) {
    if (r.fatalError) return `FATAL ERROR: ${r.fatalError}`
    const p = r.profile
    return [
      '── AUTH ─────────────────────────────────────',
      `User ID:            ${r.userId}`,
      `Email:              ${r.email}`,
      `App Metadata Role:  ${r.appMetadataRole}`,
      `Providers:          ${r.providers}`,
      `Has Session:        ${r.hasSession}`,
      `Auth Error:         ${r.authError}`,
      '',
      '── PROFILE ──────────────────────────────────',
      p ? [
        `profiles.id:               ${p.id}`,
        `profiles.email:            ${p.email ?? 'null'}`,
        `profiles.full_name:        ${p.full_name ?? 'null'}`,
        `profiles.company_name:     ${p.company_name ?? 'null'}`,
        `profiles.role:             ${p.role ?? 'null'}`,
        `profiles.has_brand_access:   ${p.has_brand_access}`,
        `profiles.has_creator_access: ${p.has_creator_access}`,
        `profiles.active_workspace:   ${p.active_workspace ?? 'null'}`,
      ].join('\n') : `Profile Error: ${r.profileError ?? 'no row found'}`,
    ].join('\n')
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(lines)
    } catch {
      const el = document.getElementById('diag-output')
      if (el) { el.select(); document.execCommand('copy') }
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f0f0f', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'monospace',
    }}>
      <div style={{
        width: '100%', maxWidth: 640,
        backgroundColor: '#1a1a1a', borderRadius: 12,
        border: '1px solid #333', overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          padding: '12px 20px', backgroundColor: '#111',
          borderBottom: '1px solid #333', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
            BRANDIOR AUTH DIAGNOSTIC
          </span>
          <span style={{ color: '#555', fontSize: 11 }}>read-only · no data modified</span>
        </div>

        {/* body */}
        <div style={{ padding: 20 }}>
          {loading ? (
            <p style={{ color: '#888', fontSize: 13 }}>Fetching identity…</p>
          ) : (
            <>
              <textarea
                id="diag-output"
                readOnly
                value={lines}
                rows={lines.split('\n').length + 1}
                style={{
                  width: '100%', background: '#0d0d0d', color: '#e2e8f0',
                  border: '1px solid #2d2d2d', borderRadius: 8,
                  padding: '14px 16px', fontSize: 12, lineHeight: 1.7,
                  resize: 'none', outline: 'none', boxSizing: 'border-box',
                  whiteSpace: 'pre', overflowX: 'auto',
                }}
              />
              <button
                onClick={copyText}
                style={{
                  marginTop: 12, padding: '8px 20px', borderRadius: 8,
                  backgroundColor: '#7c3aed', color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Copy to clipboard
              </button>
            </>
          )}
        </div>
      </div>

      <p style={{ color: '#444', fontSize: 11, marginTop: 16, textAlign: 'center' }}>
        Temporary diagnostic · no tokens, JWTs, or secrets are displayed
      </p>
    </div>
  )
}
