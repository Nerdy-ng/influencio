const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'Brandior <support@brandior.africa>'

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

function emailWrapper(headerBg, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <style>
    :root { color-scheme: light only; }
    body { margin:0; padding:0; background:#f4f4f5; font-family:'Helvetica Neue',Arial,sans-serif; -webkit-text-size-adjust:100%; }
    @media only screen and (max-width:600px) {
      .card { padding: 28px 20px 24px !important; }
      h1 { font-size: 20px !important; }
    }
  </style>
</head>
<body bgcolor="#f4f4f5" style="background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f5" style="background:#f4f4f5;padding:0 0 40px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td align="center" bgcolor="${headerBg}" style="background:${headerBg};padding:24px 20px;">
          <img src="https://www.brandior.africa/logo.png" alt="Brandior" width="140" style="display:block;height:auto;max-width:140px;"/>
        </td></tr>
        <tr><td class="card" bgcolor="#ffffff" style="background:#ffffff;padding:40px 36px 36px;">
          ${content}
        </td></tr>
        <tr><td align="center" bgcolor="#f4f4f5" style="padding-top:24px;">
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
}

function talentWelcomeEmail(firstName) {
  return emailWrapper('#1a0040', `
    <h1 style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
      Welcome to Brandior, ${firstName}! Your creator journey starts now. 🎉
    </h1>
    <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Your account is live. You're now part of Africa's fastest-growing creator marketplace — where real brands come to find real talent.
    </p>
    <p style="color:#FF6B9D;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">
      Get started in 3 steps
    </p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:26px;">
      <tr><td style="padding:10px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#FF6B9D;font-weight:900;">1.</span>&nbsp; <strong>Complete your profile</strong> — add your bio, niche, and social accounts so brands can find you
      </td></tr>
      <tr><td style="padding:10px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#FF6B9D;font-weight:900;">2.</span>&nbsp; <strong>Set your rates</strong> — tell brands what you charge for posts, reels, and videos
      </td></tr>
      <tr><td style="padding:10px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#FF6B9D;font-weight:900;">3.</span>&nbsp; <strong>Browse open campaigns</strong> — apply to brand jobs that match your audience
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
      <tr><td>
        <a href="https://app.brandior.africa/dashboard"
          style="background:#FF6B9D;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;display:inline-block;">
          Go to My Dashboard →
        </a>
      </td></tr>
    </table>
    <p style="color:#374151;font-size:15px;line-height:1.8;margin:0;">
      Any questions? Reply to this email — we read everything.<br/><br/>
      <strong style="color:#FF6B9D;">The Brandior Team 💜</strong>
    </p>
  `)
}

function brandWelcomeEmail(firstName) {
  return emailWrapper('#1a0040', `
    <h1 style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
      Welcome to Brandior, ${firstName}! Africa's top creators are ready for you. 🚀
    </h1>
    <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 20px;">
      Your brand account is live. You can now discover, connect with, and run campaigns with verified African creators — all in one place.
    </p>
    <p style="color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">
      Get your first campaign running
    </p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:26px;">
      <tr><td style="padding:10px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:900;">1.</span>&nbsp; <strong>Browse the marketplace</strong> — search creators by niche, platform, and follower count
      </td></tr>
      <tr><td style="padding:10px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:900;">2.</span>&nbsp; <strong>Post a job</strong> — describe your campaign and let creators apply to you
      </td></tr>
      <tr><td style="padding:10px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:900;">3.</span>&nbsp; <strong>Pay securely</strong> — funds are held in escrow and released when work is approved
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
      <tr><td>
        <a href="https://app.brandior.africa/brand-dashboard"
          style="background:#7c3aed;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;display:inline-block;">
          Go to My Dashboard →
        </a>
      </td></tr>
    </table>
    <p style="color:#374151;font-size:15px;line-height:1.8;margin:0;">
      Need help? Reply to this email — we're here.<br/><br/>
      <strong style="color:#c084fc;">The Brandior Team 💜</strong>
    </p>
  `)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, name, role } = req.body
    if (!email || !role) return res.status(400).json({ error: 'email and role required' })

    const firstName = name?.split(' ')[0] || 'there'
    const isTalent = role === 'talent'

    const html = isTalent ? talentWelcomeEmail(firstName) : brandWelcomeEmail(firstName)
    const subject = isTalent
      ? `Welcome to Brandior, ${firstName} — your dashboard is ready 🎉`
      : `Welcome to Brandior, ${firstName} — find your first creator 🚀`

    const result = await sendEmail(email, subject, html)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
