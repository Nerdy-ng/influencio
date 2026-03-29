import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = 'Brandior <support@brandior.africa>'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { email, name, role, industry } = await req.json()

    const firstName = name?.split(' ')[0] || 'there'
    const isCreator = role === 'creator'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0d0020;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0020;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4c1d95;border-radius:12px;padding:10px 14px;">
                    <span style="color:#FA8112;font-size:20px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Brandior</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(76,29,149,0.3);border:1px solid #7c3aed;border-radius:24px;padding:40px 36px;">

              <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 12px;">
                You're on the list, ${firstName}! 🎉
              </h1>

              <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
                ${isCreator
                  ? `We're building Africa's first platform where <strong style="color:#FA8112;">talents & creators</strong> connect directly with brands — no middlemen, fair pay, real growth.`
                  : `We're building Africa's first platform where <strong style="color:#FA8112;">brands</strong> connect directly with the right talents — fast, transparent, and results-driven.`
                }
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;"></div>

              <!-- What's coming -->
              <p style="color:#c084fc;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">What's coming for you</p>

              ${isCreator ? `
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">🎯 &nbsp;Direct brand deals — no agency cuts</td></tr>
                <tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">💰 &nbsp;Rate card builder & payment protection</td></tr>
                <tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">📊 &nbsp;Campaign analytics & growth tools</td></tr>
              </table>
              ` : `
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">🎯 &nbsp;Discover verified talents across Africa</td></tr>
                <tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">📋 &nbsp;Post jobs & receive proposals fast</td></tr>
                <tr><td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;">🔒 &nbsp;Secure payments & campaign tracking</td></tr>
              </table>
              `}

              <!-- Divider -->
              <div style="border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;"></div>

              <!-- Share CTA -->
              <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 16px;">Move up the waitlist — share with your network:</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="https://twitter.com/intent/tweet?text=I%20just%20joined%20the%20waitlist%20for%20Brandior%20%E2%80%94%20Africa%27s%20talent%20marketplace.%20Join%20me%3A%20https%3A%2F%2Fbrandior.africa"
                      style="background:rgba(255,255,255,0.1);color:#ffffff;font-size:12px;font-weight:700;padding:10px 20px;border-radius:100px;text-decoration:none;display:inline-block;">
                      Share on X
                    </a>
                  </td>
                  <td>
                    <a href="https://wa.me/?text=I%20just%20joined%20the%20waitlist%20for%20Brandior%20%E2%80%94%20Africa%27s%20talent%20marketplace.%20Join%20here%3A%20https%3A%2F%2Fbrandior.africa"
                      style="background:#25D366;color:#ffffff;font-size:12px;font-weight:700;padding:10px 20px;border-radius:100px;text-decoration:none;display:inline-block;">
                      Share on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
                © 2026 Brandior · Made in Africa 🌍<br/>
                <a href="mailto:support@brandior.africa" style="color:rgba(255,255,255,0.3);text-decoration:none;">support@brandior.africa</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: `You're on the Brandior waitlist, ${firstName}! 🎉`,
        html,
      }),
    })

    const data = await res.json()

    // ── Admin alert ──────────────────────────────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: ['nerd.owl.integrated@gmail.com'],
        subject: `🔔 New ${isCreator ? 'Talent' : 'Brand'} — ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;background:#0d0020;padding:32px;color:#fff;border-radius:12px;">
            <p style="color:#c084fc;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">New Waitlist Subscriber</p>
            <h2 style="margin:0 0 20px;font-size:22px;">${name}</h2>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;width:90px;">Email</td><td style="color:#fff;font-size:13px;padding:4px 0;">${email}</td></tr>
              <tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;">Role</td><td style="color:${isCreator ? '#FF6B9D' : '#c084fc'};font-size:13px;font-weight:700;padding:4px 0;">${isCreator ? 'Talent / Creator' : 'Brand / Business'}</td></tr>
              ${industry ? `<tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;">Industry</td><td style="color:#fff;font-size:13px;padding:4px 0;">${industry}</td></tr>` : ''}
              <tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;">Signed up</td><td style="color:#fff;font-size:13px;padding:4px 0;">${new Date().toUTCString()}</td></tr>
            </table>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
              <a href="https://supabase.com/dashboard/project/ruepnwhgehcwfeekkpjb/editor" style="background:#4c1d95;color:#fff;font-size:12px;font-weight:700;padding:10px 20px;border-radius:100px;text-decoration:none;display:inline-block;">View in Supabase →</a>
            </div>
          </div>
        `,
      }),
    }).catch(() => {}) // fail silently — don't block subscriber email

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: res.ok ? 200 : 400,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    })
  }
})
