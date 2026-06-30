import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL          = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL       = 'claude-sonnet-4-6'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function fmtMessages(messages) {
  if (!messages?.length) return '(no messages exchanged)'
  return messages
    .map((m) => `[${new Date(m.created_at).toLocaleString()}] ${m.sender_type}: ${m.body}`)
    .join('\n')
}

function fmtDeliverables(deliverables) {
  if (!deliverables?.length) return '(no deliverables uploaded)'
  return deliverables
    .map((d) => `- "${d.file_name}" uploaded ${new Date(d.created_at).toLocaleString()}${d.note ? ` — note: ${d.note}` : ''}`)
    .join('\n')
}

function fmtPlatforms(platforms) {
  if (!platforms?.length) return '—'
  return platforms.map((p) => p.label || p.id).join(', ')
}

function fmtAddons(addons) {
  if (!addons?.length) return 'none'
  return addons.map((a) => a.label || a.id).join(', ')
}

function buildPrompt({ dispute, collab, messages, deliverables }) {
  const brief = collab?.brief || {}
  return `You are an impartial dispute-resolution analyst for Brandior, a marketplace connecting Brands and Creators (Talent) in Africa. A dispute has been raised between a Brand and a Talent over a collaboration. Review the case facts below and produce a fair, evidence-based recommendation. You are not the final decision-maker — a human admin will review your analysis before any action is taken.

## Collaboration
Content type: ${collab?.content_type || 'Unknown'}
Duration: ${collab?.duration_label || '—'}
Platforms: ${fmtPlatforms(collab?.platforms)}
Add-ons: ${fmtAddons(collab?.addons)}
Total agreed price: ${collab?.total_amount ?? '—'}
Payment status: ${collab?.payment_status || '—'}
Collab status: ${collab?.status || '—'}

## Brief given to the Talent
Product/Goal: ${brief.productName || '—'} — ${brief.goal || '—'}
Deadline: ${brief.deadline || '—'}
Instructions: ${brief.instructions || '—'}

## Message history between Brand and Talent
${fmtMessages(messages)}

## Deliverables submitted by Talent
${fmtDeliverables(deliverables)}

## Dispute
Raised by: ${dispute.raised_by_role}
Stated reason: ${dispute.reason}

Brand's statement:
${dispute.brand_statement || '(brand has not submitted a statement)'}

Talent's statement:
${dispute.talent_statement || '(talent has not submitted a statement)'}

## Your task
Weigh the agreed brief/requirements against what was actually delivered and communicated. Consider whether either party breached the agreed terms, missed deadlines, or acted in bad faith. Respond with ONLY a JSON object (no markdown fences, no commentary) in this exact shape:

{
  "summary": "2-3 sentence neutral summary of what happened",
  "recommendation": "favor_brand" | "favor_talent" | "split" | "more_info_needed",
  "confidence": <integer 0-100>,
  "reasoning": "3-5 sentence explanation citing specific evidence from above that justifies the recommendation"
}`
}

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Anthropic API error (${res.status}): ${errBody}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse AI response as JSON')
  return JSON.parse(jsonMatch[0])
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { disputeId } = req.body
    if (!disputeId) return res.status(400).json({ error: 'disputeId is required' })

    const { data: dispute, error: disputeErr } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .single()
    if (disputeErr || !dispute) return res.status(404).json({ error: 'Dispute not found' })

    const { data: collab } = dispute.collab_id
      ? await supabase.from('collabs').select('*').eq('id', dispute.collab_id).maybeSingle()
      : { data: null }

    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('brand_id', dispute.brand_id)
      .eq('talent_id', dispute.talent_id)
      .maybeSingle()

    let messages = []
    if (conversation?.id) {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })
      messages = data || []
    }

    let deliverables = []
    if (dispute.collab_id) {
      const { data } = await supabase
        .from('deliverables')
        .select('*')
        .eq('job_id', dispute.collab_id)
        .eq('talent_id', dispute.talent_id)
        .order('created_at', { ascending: true })
      deliverables = data || []
    }

    const prompt = buildPrompt({ dispute, collab, messages, deliverables })
    const analysis = await callClaude(prompt)

    const { data: updated, error: updateErr } = await supabase
      .from('disputes')
      .update({
        ai_summary: analysis.summary,
        ai_recommendation: analysis.recommendation,
        ai_confidence: analysis.confidence,
        ai_reasoning: analysis.reasoning,
        ai_analyzed_at: new Date().toISOString(),
        status: 'ai_analyzed',
      })
      .eq('id', disputeId)
      .select()
      .single()
    if (updateErr) throw updateErr

    return res.status(200).json(updated)
  } catch (err) {
    console.error('[analyze-dispute] error:', err)
    return res.status(500).json({ error: err.message })
  }
}
