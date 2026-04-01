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
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#4c1d95;border-radius:10px;padding:8px 12px;"><span style="color:#FA8112;font-size:18px;">⚡</span></td>
            <td style="padding-left:9px;"><span style="color:#1a0040;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Brandior</span></td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:20px;padding:40px 40px 36px;">

          <h1 style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">You're officially on the Brandior waitlist, and we're excited to have you.</h1>

          <p style="color:#4b5563;font-size:15px;line-height:1.8;margin:0 0 28px;">
            We're building Brandior, a platform that connects brands and creators to produce authentic, high-performing content without the usual friction.
          </p>

          <p style="color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Here's what you can expect next</p>

          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
            <tr><td style="padding:7px 0;color:#374151;font-size:14px;line-height:1.6;">✦ &nbsp;Access to brand partnerships and top-tier talent</td></tr>
            <tr><td style="padding:7px 0;color:#374151;font-size:14px;line-height:1.6;">✦ &nbsp;Early access to our core features before public launch</td></tr>
            <tr><td style="padding:7px 0;color:#374151;font-size:14px;line-height:1.6;">✦ &nbsp;Tips on how to get the most out of Brandior</td></tr>
            <tr><td style="padding:7px 0;color:#374151;font-size:14px;line-height:1.6;">✦ &nbsp;24/7 support</td></tr>
          </table>

          <p style="color:#4b5563;font-size:14px;line-height:1.8;margin:0 0 16px;">
            In the meantime, we're working hard to ensure everything is smooth, powerful, and truly valuable from day one.
          </p>

          <p style="color:#4b5563;font-size:14px;line-height:1.8;margin:0 0 28px;">
            Stay in the loop. We'll keep you updated every step of the way.
          </p>

          <p style="color:#374151;font-size:14px;line-height:1.8;margin:0;">Talk soon,<br/><strong style="color:#1a0040;">The Brandior Team</strong></p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
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
