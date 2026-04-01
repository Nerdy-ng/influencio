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

function buildHtml(title, body, ctaText, ctaUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <style>
    :root { color-scheme: light only; }
    body { margin:0; padding:0; background:#f4f4f5; font-family:'Helvetica Neue',Arial,sans-serif; -webkit-text-size-adjust:100%; color-scheme: light only; }
    * { box-shadow: none !important; border: none !important; }
    @media only screen and (max-width:600px) {
      .outer { padding: 20px 12px !important; }
      .card { padding: 28px 20px 24px !important; border-radius: 16px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body { background:#f4f4f5 !important; }
      .card-td { background:#ffffff !important; color:#374151 !important; }
      .footer-td { background:#f4f4f5 !important; }
      p, td { color:#374151 !important; }
    }
  </style>
</head>
<body bgcolor="#f4f4f5" style="background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer" bgcolor="#f4f4f5" style="background:#f4f4f5;padding:0 0 40px;">
    <tr><td align="center" bgcolor="#f4f4f5" style="background:#f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo header -->
        <tr><td align="center" bgcolor="#1a0040" style="background:#1a0040;padding:24px 20px;">
          <img src="https://www.brandior.africa/logo.png" alt="Brandior" width="140" style="display:block;height:auto;max-width:140px;"/>
        </td></tr>

        <!-- Card -->
        <tr><td class="card card-td" bgcolor="#ffffff" style="background:#ffffff;padding:40px 36px 36px;">

          <h1 style="color:#1a0040;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
            ${title}
          </h1>

          <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 28px;">
            ${body}
          </p>

          ${ctaText && ctaUrl ? `
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td>
              <a href="${ctaUrl}"
                style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">
                ${ctaText}
              </a>
            </td></tr>
          </table>` : ''}

          <p style="color:#374151;font-size:15px;line-height:1.8;margin:0;">
            Best regards,<br/>
            <strong style="color:#a78bfa;">The Brandior Team 💜</strong>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" bgcolor="#f4f4f5" class="footer-td" style="background:#f4f4f5;padding-top:24px;">
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { to, subject, title, body, ctaText, ctaUrl } = req.body
    if (!to || !subject || !title || !body) return res.status(400).json({ error: 'Missing fields' })

    const html = buildHtml(title, body, ctaText, ctaUrl)
    const result = await sendEmail(to, subject, html)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
