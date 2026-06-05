import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const LISTEN_EARN = 20  // 20 credits (= ₹2) per qualified listen

// POST — called when a listener plays ≥70% of a story
// Body: { authorFp, referenceId }
export async function POST(req: NextRequest) {
  const { authorFp, referenceId } = await req.json()
  if (!authorFp || !referenceId) {
    return NextResponse.json({ error: 'authorFp and referenceId required' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // Idempotency: don't double-credit for the same story in 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: existing } = await admin
    .from('credits_ledger')
    .select('id')
    .eq('fingerprint', authorFp)
    .eq('type', 'listen_earn')
    .eq('reference_id', referenceId)
    .gte('created_at', since)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ skipped: true, reason: 'Already credited in last 24h' })
  }

  await admin.from('credits_ledger').insert({
    fingerprint: authorFp,
    amount: LISTEN_EARN,
    type: 'listen_earn',
    reference_id: referenceId,
    note: 'Qualified listening earn (≥70% played)',
  })

  return NextResponse.json({ success: true, creditsAdded: LISTEN_EARN })
}
