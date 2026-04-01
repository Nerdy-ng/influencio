const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'Brandior <support@brandior.africa>'
const ADMIN_EMAIL = 'nerd.owl.integrated@gmail.com'

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  return res.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, name, role, industry } = req.body
    const firstName = name?.split(' ')[0] || 'there'
    const isCreator = role === 'creator'

    const subscriberHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <style>
    :root { color-scheme: light only; }
    body { margin:0; padding:0; background:#f4f4f5; font-family:'Helvetica Neue',Arial,sans-serif; -webkit-text-size-adjust:100%; color-scheme: light only; }
    * { box-shadow: none !important; border: none !important; }
    @media (prefers-color-scheme: dark) {
      body { background:#f4f4f5 !important; color:#374151 !important; }
      .card-td { background:#ffffff !important; color:#374151 !important; }
      .footer-td { background:#f4f4f5 !important; }
      .outer-td { background:#f4f4f5 !important; }
      h1.headline { color:#1a0040 !important; }
      p, td { color:#374151 !important; }
    }
    @media only screen and (max-width:600px) {
      .outer { padding: 20px 12px !important; }
      .card { padding: 28px 20px 24px !important; border-radius: 16px !important; }
      h1.headline { font-size: 20px !important; }
      .footer { padding-top: 20px !important; }
    }
  </style>
</head>
<body bgcolor="#f4f4f5" style="background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer" bgcolor="#f4f4f5" style="background:#f4f4f5;padding:0 0 40px;">
    <tr><td align="center" class="outer-td" bgcolor="#f4f4f5" style="background:#f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo header — dark purple -->
        <tr><td align="center" bgcolor="#1a0040" style="background:#1a0040;padding:24px 20px;">
          <img src="https://www.brandior.africa/logo.png" alt="Brandior" width="140" style="display:block;height:auto;max-width:140px;"/>
        </td></tr>

        <!-- Card — white -->
        <tr><td class="card card-td" bgcolor="#ffffff" style="background:#ffffff;padding:40px 36px 36px;">

          <h1 class="headline" style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
            You're officially on the waitlist, we're excited to have you.
          </h1>

          <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 26px;">
            We're building Brandior, a platform that connects brands and creators.
          </p>

          <p style="color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">
            Here's what you can expect next
          </p>

          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:26px;">
            <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
              <span style="color:#7c3aed;font-weight:700;">✦</span>&nbsp; Access to brand partnerships and top-tier talents
            </td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
              <span style="color:#7c3aed;font-weight:700;">✦</span>&nbsp; Early access to our core features before public launch
            </td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
              <span style="color:#7c3aed;font-weight:700;">✦</span>&nbsp; Tips on how to get the most out of Brandior
            </td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
              <span style="color:#7c3aed;font-weight:700;">✦</span>&nbsp; 24/7 support
            </td></tr>
          </table>

          <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 14px;">
            In the meantime, we're working hard to ensure everything is smooth, powerful, and truly valuable from day one.
          </p>

          <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 26px;">
            Stay in the loop. We'll keep you updated every step of the way.
          </p>

          <p style="color:#374151;font-size:15px;line-height:1.8;margin:0;">
            Best regards,<br/>
            <strong style="color:#a78bfa;">The Brandior Team 💜</strong>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" bgcolor="#f4f4f5" class="footer footer-td" style="background:#f4f4f5;padding-top:24px;">
          <p style="color:#9ca3af;font-size:12px;line-height:1.7;margin:0;">
            © 2026 Brandior · Made in Africa 🌍<br/>
            <a href="mailto:support@brandior.africa" style="color:#9ca3af;text-decoration:none;">support@brandior.africa</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const adminHtml = `
<div style="font-family:Arial,sans-serif;background:#0d0020;padding:32px;color:#fff;border-radius:12px;max-width:480px;">
  <p style="color:#c084fc;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">New Waitlist Subscriber</p>
  <h2 style="margin:0 0 20px;font-size:22px;">${name}</h2>
  <table cellpadding="0" cellspacing="0">
    <tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;width:90px;">Email</td><td style="color:#fff;font-size:13px;padding:4px 0;">${email}</td></tr>
    <tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;">Role</td>
      <td style="color:${isCreator ? '#FF6B9D' : '#c084fc'};font-size:13px;font-weight:700;padding:4px 0;">${isCreator ? 'Talent / Creator' : 'Brand / Business'}</td></tr>
    ${industry ? `<tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;">Industry</td><td style="color:#fff;font-size:13px;padding:4px 0;">${industry}</td></tr>` : ''}
    <tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:4px 0;">Signed up</td><td style="color:#fff;font-size:13px;padding:4px 0;">${new Date().toUTCString()}</td></tr>
  </table>
  <div style="margin-top:24px;">
    <a href="https://supabase.com/dashboard/project/ruepnwhgehcwfeekkpjb/editor"
      style="background:#4c1d95;color:#fff;font-size:12px;font-weight:700;padding:10px 20px;border-radius:100px;text-decoration:none;display:inline-block;">View in Supabase →</a>
  </div>
</div>`

    const [subscriberResult] = await Promise.all([
      sendEmail(email, `You're on the Brandior waitlist, ${firstName}!`, subscriberHtml),
      sendEmail(ADMIN_EMAIL, `🔔 New ${isCreator ? 'Talent' : 'Brand'} — ${name}`, adminHtml).catch(() => {}),
    ])

    return res.status(200).json(subscriberResult)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
