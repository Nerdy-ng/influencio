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

function emailWrapper(headerBg, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta name="color-scheme" content="light"/>
  <style>
    :root { color-scheme: light only; }
    body { margin:0; padding:0; background:#f4f4f5; font-family:'Helvetica Neue',Arial,sans-serif; -webkit-text-size-adjust:100%; }
    * { box-sizing:border-box; }
    @media only screen and (max-width:600px) {
      .outer { padding: 20px 12px !important; }
      .card { padding: 28px 20px 24px !important; border-radius: 16px !important; }
      h1.headline { font-size: 20px !important; }
    }
  </style>
</head>
<body bgcolor="#f4f4f5" style="background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer" bgcolor="#f4f4f5" style="background:#f4f4f5;padding:0 0 40px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td align="center" bgcolor="${headerBg}" style="background:${headerBg};padding:24px 20px;">
          <img src="https://www.brandior.africa/logo.png" alt="Brandior" width="140" style="display:block;height:auto;max-width:140px;"/>
        </td></tr>
        <tr><td class="card" bgcolor="#ffffff" style="background:#ffffff;padding:40px 36px 36px;">
          ${content}
        </td></tr>
        <tr><td align="center" bgcolor="#f4f4f5" style="background:#f4f4f5;padding-top:24px;">
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

function creatorWaitlistEmail(firstName) {
  return emailWrapper('#1a0040', `
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 20px;">
      Hey ${firstName},
    </p>

    <h1 class="headline" style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 20px;line-height:1.4;">
      You didn't just join a waitlist.
    </h1>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      You positioned yourself ahead of thousands who are still waiting to be noticed.
    </p>
    <p style="color:#1a0040;font-size:16px;font-weight:700;line-height:1.6;margin:0 0 24px;">
      Welcome to Brandior.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Right now, thousands of creators are posting every day—
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      hoping to be seen, hoping to be chosen.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      But the truth is:
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      <strong style="color:#1a0040;">visibility alone doesn't create opportunity.</strong>
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      <strong style="color:#1a0040;">Access does.</strong>
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      That's why Brandior exists.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      We're building something different—
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      a space where creators aren't judged by follower count, but by value.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Where brands don't just scroll past you,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      but actually find you, understand you, and work with you.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      And now, you're early.
    </p>

    <p style="color:#7c3aed;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:16px 0 14px;">
      What being early means:
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:700;">✦</span>&nbsp; You'll be among the first to access the platform
      </td></tr>
      <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:700;">✦</span>&nbsp; You'll get early opportunities before the crowd arrives
      </td></tr>
      <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:700;">✦</span>&nbsp; You'll receive insider updates as we build
      </td></tr>
    </table>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      This isn't just another platform.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      <strong style="color:#1a0040;">It's a shift.</strong>
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      For now, stay close.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 28px;">
      When it's time, you won't need to chase opportunities—<br/>
      you'll be positioned for them.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.8;margin:0;">
      We'll be in touch soon.<br/><br/>
      <strong style="color:#7c3aed;">Brandior Team 💜</strong>
    </p>
  `)
}

function brandWaitlistEmail(firstName) {
  return emailWrapper('#1a0040', `
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 20px;">
      Hey ${firstName},
    </p>

    <h1 class="headline" style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 20px;line-height:1.4;">
      You didn't just join a waitlist.
    </h1>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      You gave your brand an unfair advantage.
    </p>
    <p style="color:#1a0040;font-size:16px;font-weight:700;line-height:1.6;margin:0 0 24px;">
      Welcome to Brandior.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Right now, thousands of creators are producing content your audience would trust, engage with, and buy from—
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      but most of them will never cross your radar.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Not because they lack value.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      But because the system wasn't built for you to find them.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      So brands keep doing what's familiar:
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      recycling the same creators,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      paying more for attention,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      and hoping it converts.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      But attention isn't the problem.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      <strong style="color:#1a0040;">Access is.</strong>
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      That's why Brandior exists.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      We're building a space where brands don't just discover creators—
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      they discover the <em>right</em> ones.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Early. Aligned. Ready.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Where decisions aren't driven by vanity metrics,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      but by fit, voice, and real influence.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      And now, you're early.
    </p>

    <p style="color:#7c3aed;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:16px 0 14px;">
      Being on this waitlist means:
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:700;">✦</span>&nbsp; You'll be among the first to access a new wave of high-potential creators
      </td></tr>
      <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:700;">✦</span>&nbsp; You'll identify and secure talent before they become saturated or overpriced
      </td></tr>
      <tr><td style="padding:8px 0;color:#374151;font-size:15px;line-height:1.6;vertical-align:top;">
        <span style="color:#c084fc;font-weight:700;">✦</span>&nbsp; You'll receive insider updates as we build what's next
      </td></tr>
    </table>

    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      This isn't just another platform.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 24px;">
      <strong style="color:#1a0040;">It's a shift in how brands connect, choose, and win.</strong>
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      For now, stay close.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      Because when this opens,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 6px;">
      the advantage won't belong to the biggest brands—
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.9;margin:0 0 28px;">
      but to the earliest ones.
    </p>

    <p style="color:#374151;font-size:15px;line-height:1.8;margin:0;">
      We'll be in touch soon.<br/><br/>
      <strong style="color:#7c3aed;">Brandior Team 💜</strong>
    </p>
  `)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, name, role, industry } = req.body
    const firstName = name?.split(' ')[0] || 'there'
    const isCreator = role === 'creator'

    const subscriberHtml = isCreator
      ? creatorWaitlistEmail(firstName)
      : brandWaitlistEmail(firstName)

    const subject = isCreator
      ? `You didn't join a waitlist, ${firstName}`
      : `You didn't just join a waitlist, ${firstName}`

    const adminHtml = `
<div style="font-family:Arial,sans-serif;background:#0d0020;padding:32px;color:#fff;border-radius:12px;max-width:480px;">
  <p style="color:${isCreator ? '#FF6B9D' : '#c084fc'};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">
    New ${isCreator ? 'Talent / Creator' : 'Brand'} on Waitlist
  </p>
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
      sendEmail(email, subject, subscriberHtml),
      sendEmail(ADMIN_EMAIL, `🔔 New ${isCreator ? 'Talent' : 'Brand'} — ${name}`, adminHtml).catch(() => {}),
    ])

    return res.status(200).json(subscriberResult)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
