import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM             = 'Brandior <support@brandior.africa>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify caller identity from JWT
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return errorResponse('Unauthorized', 401)

    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) return errorResponse('Unauthorized', 401)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // ── Fetch brand profile ──────────────────────────────────────────────────
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, company_name, owner_name, email, phone, location, industry, wallet_balance, created_at')
      .eq('id', user.id)
      .single()

    // ── Fetch all collabs ────────────────────────────────────────────────────
    const { data: collabs } = await admin
      .from('collabs')
      .select(`
        id, content_type, duration_label, platforms, total_amount,
        platform_fee, creator_payout, status, payment_status,
        created_at, updated_at,
        creator:creator_id ( full_name )
      `)
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })

    const totalSpent = (collabs ?? [])
      .filter(c => c.payment_status === 'paid' || c.payment_status === 'released')
      .reduce((sum, c) => sum + (c.total_amount ?? 0), 0)

    const exportedAt = new Date().toUTCString()
    const fmtN = (n: number) => '₦' + n.toLocaleString('en-NG')
    const fmtD = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const statusBadge = (s: string) => {
      const colours: Record<string, string> = {
        pending: '#f59e0b', in_progress: '#3b82f6', delivered: '#8b5cf6',
        completed: '#10b981', cancelled: '#ef4444', revision_requested: '#f97316',
      }
      return `<span style="background:${colours[s] ?? '#6b7280'}22;color:${colours[s] ?? '#6b7280'};font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">${s.replace('_', ' ')}</span>`
    }

    const collabRows = (collabs ?? []).map(c => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <td style="padding:10px 8px;color:rgba(255,255,255,0.85);font-size:13px;">${(c.creator as any)?.full_name ?? '—'}</td>
        <td style="padding:10px 8px;color:rgba(255,255,255,0.7);font-size:13px;">${c.content_type}</td>
        <td style="padding:10px 8px;color:rgba(255,255,255,0.7);font-size:13px;">${c.duration_label}</td>
        <td style="padding:10px 8px;color:#c084fc;font-size:13px;font-weight:700;">${fmtN(c.total_amount ?? 0)}</td>
        <td style="padding:10px 8px;">${statusBadge(c.status)}</td>
        <td style="padding:10px 8px;color:rgba(255,255,255,0.5);font-size:12px;">${fmtD(c.created_at)}</td>
      </tr>`).join('')

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0d0020;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0020;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo -->
  <tr><td align="center" style="padding-bottom:28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#4c1d95;border-radius:10px;padding:8px 12px;"><span style="color:#FA8112;font-size:18px;">⚡</span></td>
      <td style="padding-left:10px;"><span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Brandior</span></td>
    </tr></table>
  </td></tr>

  <!-- Header -->
  <tr><td style="background:rgba(76,29,149,0.25);border:1px solid rgba(124,58,237,0.4);border-radius:20px 20px 0 0;padding:32px 36px 24px;">
    <p style="color:#c084fc;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Data Export</p>
    <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 8px;">Your Brandior data</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">Exported on ${exportedAt}</p>
  </td></tr>

  <!-- Profile -->
  <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-top:none;padding:24px 36px;">
    <p style="color:#c084fc;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Brand Profile</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;width:140px;">Brand name</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${profile?.company_name ?? profile?.full_name ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Owner</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${profile?.owner_name ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Email</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${user.email}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Phone</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${profile?.phone ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Location</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${profile?.location ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Industry</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${profile?.industry ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Member since</td>
        <td style="color:#fff;font-size:13px;padding:5px 0;">${profile?.created_at ? fmtD(profile.created_at) : '—'}</td>
      </tr>
      <tr>
        <td style="color:rgba(255,255,255,0.4);font-size:13px;padding:5px 0;">Wallet balance</td>
        <td style="color:#c084fc;font-size:13px;font-weight:700;padding:5px 0;">${fmtN(profile?.wallet_balance ?? 0)}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Spend summary -->
  <tr><td style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3);border-top:none;padding:20px 36px;">
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="text-align:center;padding:0 16px;">
          <p style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Total Spent</p>
          <p style="color:#c084fc;font-size:22px;font-weight:900;margin:0;">${fmtN(totalSpent)}</p>
        </td>
        <td style="text-align:center;padding:0 16px;border-left:1px solid rgba(255,255,255,0.08);">
          <p style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Total Collabs</p>
          <p style="color:#fff;font-size:22px;font-weight:900;margin:0;">${(collabs ?? []).length}</p>
        </td>
        <td style="text-align:center;padding:0 16px;border-left:1px solid rgba(255,255,255,0.08);">
          <p style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Completed</p>
          <p style="color:#10b981;font-size:22px;font-weight:900;margin:0;">${(collabs ?? []).filter(c => c.status === 'completed').length}</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Collabs table -->
  <tr><td style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-top:none;border-radius:0 0 20px 20px;padding:24px 36px;">
    <p style="color:#c084fc;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Collab History</p>
    ${(collabs ?? []).length === 0
      ? `<p style="color:rgba(255,255,255,0.3);font-size:14px;margin:0;">No collabs yet.</p>`
      : `<div style="overflow-x:auto;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:8px 8px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;">Creator</th>
                <th style="padding:8px 8px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;">Type</th>
                <th style="padding:8px 8px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;">Duration</th>
                <th style="padding:8px 8px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;">Amount</th>
                <th style="padding:8px 8px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;">Status</th>
                <th style="padding:8px 8px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;">Date</th>
              </tr>
            </thead>
            <tbody>${collabRows}</tbody>
          </table>
        </div>`
    }
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding-top:28px;">
    <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
      © 2026 Brandior · Made in Africa 🌍<br/>
      <a href="mailto:support@brandior.africa" style="color:rgba(255,255,255,0.3);text-decoration:none;">support@brandior.africa</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [user.email!],
        subject: 'Your Brandior data export',
        html,
      }),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result?.message ?? 'Email send failed')

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return errorResponse(err.message ?? 'Internal error', 500)
  }
})

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    status,
  })
}
