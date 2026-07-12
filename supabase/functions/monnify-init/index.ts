import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getMonnifyToken(): Promise<string> {
  const apiKey    = Deno.env.get('MONNIFY_API_KEY')!
  const secretKey = Deno.env.get('MONNIFY_SECRET_KEY')!
  const base      = Deno.env.get('MONNIFY_BASE_URL') ?? 'https://api.monnify.com'
  const credentials = btoa(`${apiKey}:${secretKey}`)

  const res  = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
  })
  const json = await res.json()
  if (!json.requestSuccessful) throw new Error(json.responseMessage ?? 'Monnify auth failed')
  return json.responseBody.accessToken
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { amount, email, metadata } = await req.json()
    const base         = Deno.env.get('MONNIFY_BASE_URL') ?? 'https://api.monnify.com'
    const contractCode = Deno.env.get('MONNIFY_CONTRACT_CODE')!
    const token        = await getMonnifyToken()
    const reference    = `brandior_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const res  = await fetch(`${base}/api/v1/merchant/transactions/init-transaction`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        customerName:       metadata?.customer_name ?? 'Brandior User',
        customerEmail:      email,
        paymentReference:   reference,
        paymentDescription: metadata?.type === 'wallet_fund' ? 'Wallet funding' : 'Collab payment',
        currencyCode:       'NGN',
        contractCode,
        redirectUrl:        'https://brandior.africa/payment/callback',
        paymentMethods:     ['CARD', 'ACCOUNT_TRANSFER'],
      }),
    })
    const json = await res.json()
    if (!json.requestSuccessful) throw new Error(json.responseMessage ?? 'Monnify init failed')

    return new Response(
      JSON.stringify({ checkoutUrl: json.responseBody.checkoutUrl, reference }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
