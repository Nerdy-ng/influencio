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
    const { reference } = await req.json()
    const base  = Deno.env.get('MONNIFY_BASE_URL') ?? 'https://api.monnify.com'
    const token = await getMonnifyToken()

    // Monnify requires the reference to be URL-encoded
    const encoded = encodeURIComponent(reference)
    const res  = await fetch(`${base}/api/v2/transactions/${encoded}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()

    if (!json.requestSuccessful) throw new Error(json.responseMessage ?? 'Verification failed')

    const { paymentStatus, amountPaid } = json.responseBody
    if (paymentStatus !== 'PAID') throw new Error(`Payment not completed (status: ${paymentStatus})`)

    return new Response(
      JSON.stringify({ amount: amountPaid }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
