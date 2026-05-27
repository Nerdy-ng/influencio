const RESEND_API_KEY = process.env.RESEND_API_KEY
const SUPABASE_URL = 'https://ruepnwhgehcwfeekkpjb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZXBud2hnZWhjd2ZlZWtrcGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjU2MzMsImV4cCI6MjA4OTk0MTYzM30.JQCiafSVHOX1DMgPDNSTTXJmXu34Spzj8j58PsU1fY0'
const FROM = 'Brandior <support@brandior.africa>'
const SUBJECT = '🌙 Eid Mubarak from Brandior'

function sallahEmail(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:'Helvetica Neue',Arial,sans-serif; -webkit-text-size-adjust:100%; }
    * { box-sizing:border-box; }
  </style>
</head>
<body bgcolor="#f4f4f5" style="background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f5" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(76,29,149,0.25);">

        <!-- HEADER: purple gradient with moon -->
        <tr>
          <td align="center" bgcolor="#4c1d95"
            style="background: linear-gradient(175deg,#3b0764 0%,#6d28d9 50%,#9333ea 100%);
                   background-color:#4c1d95;
                   padding:48px 32px 36px;
                   border-radius:20px 20px 0 0;">

            <!-- Stars row -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
              <tr>
                <td style="font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:12px;text-align:center;">
                  ✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ✦
                </td>
              </tr>
            </table>

            <!-- Crescent moon (emoji fallback + styled div) -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr>
                <td align="center" style="font-size:72px;line-height:1;">🌙</td>
              </tr>
            </table>

            <!-- Arabic -->
            <p style="margin:0 0 6px;font-size:28px;color:#FFD700;letter-spacing:4px;text-shadow:0 0 20px rgba(255,215,0,0.5);font-weight:700;">
              عيد مبارك
            </p>
            <p style="margin:0 0 2px;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:4px;text-transform:uppercase;">
              Eid Mubarak
            </p>

            <!-- Divider dots -->
            <p style="margin:16px 0 12px;color:rgba(255,215,0,0.4);letter-spacing:8px;font-size:10px;">
              ◆ &nbsp; ◆ &nbsp; ◆
            </p>

            <!-- Main title -->
            <h1 style="margin:0 0 6px;font-size:44px;font-weight:900;line-height:1;color:#ffffff;font-family:Georgia,serif;">
              Happy <em style="color:#FFD700;">Sallah</em>
            </h1>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:4px;text-transform:uppercase;">
              Eid ul Adha &nbsp;·&nbsp; 1447 AH
            </p>

            <!-- Lanterns row -->
            <p style="margin:24px 0 0;font-size:22px;letter-spacing:10px;">
              🏮🪔🏮🪔🏮
            </p>

          </td>
        </tr>

        <!-- BODY: message -->
        <tr>
          <td bgcolor="#4c1d95"
            style="background:linear-gradient(175deg,#6d28d9 0%,#7c3aed 50%,#9333ea 100%);
                   background-color:#6d28d9;
                   padding:36px 40px 32px;">

            <!-- Greeting -->
            <p style="margin:0 0 20px;font-size:16px;color:rgba(255,255,255,0.7);font-family:Georgia,serif;font-style:italic;line-height:1.8;text-align:center;">
              Salaam, <strong style="color:#FFD700;font-style:normal;">${firstName}</strong> 👋
            </p>

            <!-- Main message -->
            <p style="margin:0 0 16px;font-size:16px;color:rgba(255,255,255,0.9);font-family:Georgia,serif;font-style:italic;line-height:1.85;text-align:center;">
              Wishing you and your family a blessed<br/>
              and joyful Sallah. May this season bring<br/>
              <strong style="color:#FFD700;font-style:normal;">peace, love, and abundance</strong><br/>
              to every corner of your home.
            </p>

            <!-- Divider -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.12);font-size:0;">&nbsp;</td>
              </tr>
            </table>

            <!-- Sub message -->
            <p style="margin:0 0 28px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;text-align:center;">
              From the entire Brandior team, we are grateful<br/>
              you are part of this journey. Big things are coming. 🚀
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td align="center" bgcolor="#FA8112"
                  style="background:linear-gradient(135deg,#FA8112,#f97316);background-color:#FA8112;border-radius:100px;box-shadow:0 8px 24px rgba(250,129,18,0.4);">
                  <a href="https://www.brandior.africa"
                    style="display:inline-block;padding:13px 36px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;letter-spacing:0.3px;">
                    🎁 &nbsp;Share the love — invite a friend
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.1);font-size:0;">&nbsp;</td>
              </tr>
            </table>

            <!-- Logo -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
              <tr>
                <td align="center">
                  <img src="https://www.brandior.africa/logo.png" alt="Brandior"
                    style="height:80px;width:auto;display:block;"
                    onerror="this.style.display='none'"/>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);text-align:center;letter-spacing:3px;text-transform:uppercase;">
              brandior.africa
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" bgcolor="#3b0764"
            style="background:#3b0764;padding:16px 32px 20px;border-radius:0 0 20px 20px;">
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.25);line-height:1.7;">
              You received this because you joined the Brandior waitlist.<br/>
              © 2026 Brandior · Made in Africa 🌍
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function fetchWaitlist(key = SUPABASE_ANON_KEY) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?select=email,name&order=created_at.asc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`)
  return res.json()
}

async function sendBatch(emails) {
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      emails.map(({ email, name }) => {
        const firstName = name?.split(' ')[0] || 'there'
        return {
          from: FROM,
          to: [email],
          subject: SUBJECT,
          html: sallahEmail(firstName),
        }
      })
    ),
  })
  return res.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-send-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Basic protection — require secret header
  const secret = process.env.SEND_SECRET
  if (secret && req.headers['x-send-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const body = req.body || {}

    // Test mode — send to a single email without querying Supabase
    if (body.test_email) {
      const firstName = body.first_name || 'there'
      const result = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: [body.test_email],
          subject: SUBJECT,
          html: sallahEmail(firstName),
        }),
      })
      const data = await result.json()
      return res.status(200).json({ test: true, sent: 1, result: data })
    }

    // Bulk send — fetch from Supabase using service role key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
    const list = await fetchWaitlist(supabaseKey)
    if (!list.length) return res.status(200).json({ sent: 0, message: 'No subscribers found' })

    const results = []
    const BATCH = 50

    for (let i = 0; i < list.length; i += BATCH) {
      const chunk = list.slice(i, i + BATCH)
      const result = await sendBatch(chunk)
      results.push(result)
    }

    return res.status(200).json({ sent: list.length, batches: results.length, results })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
