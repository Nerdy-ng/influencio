import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function resolvePaystack(accountNumber: string, bankCode: string): Promise<string> {
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY')!
  const res    = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  )
  const json = await res.json()
  if (!json.status) throw new Error(json.message ?? 'Paystack: could not verify account')
  return json.data.account_name
}

async function resolveMonnify(accountNumber: string, bankCode: string): Promise<string> {
  const apiKey    = Deno.env.get('MONNIFY_API_KEY')!
  const secretKey = Deno.env.get('MONNIFY_SECRET_KEY')!
  const base      = Deno.env.get('MONNIFY_BASE_URL') ?? 'https://api.monnify.com'

  const authRes  = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${apiKey}:${secretKey}`)}`, 'Content-Type': 'application/json' },
  })
  const authJson = await authRes.json()
  if (!authJson.requestSuccessful) throw new Error('Monnify auth failed')

  const res  = await fetch(
    `${base}/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}&currencyCode=NGN`,
    { headers: { Authorization: `Bearer ${authJson.responseBody.accessToken}` } }
  )
  const json = await res.json()
  if (!json.requestSuccessful) throw new Error(json.responseMessage ?? 'Monnify: could not verify account')
  return json.responseBody.accountName
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { account_number, bank_code, provider = 'paystack' } = await req.json()
    if (!account_number || !bank_code) {
      return new Response(JSON.stringify({ error: 'account_number and bank_code are required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const account_name = provider === 'monnify'
      ? await resolveMonnify(account_number, bank_code)
      : await resolvePaystack(account_number, bank_code)

    return new Response(
      JSON.stringify({ account_name }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 422, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
