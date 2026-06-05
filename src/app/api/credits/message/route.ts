import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const MESSAGE_COST    = 100
const AUTHOR_SHARE    = 70   // 70% to author

export async function POST(req: NextRequest) {
  const { fromFp, fromName, toFp, storyId, messageText } = await req.json()

  if (!fromFp || !toFp || !messageText?.trim()) {
    return NextResponse.json({ error: 'fromFp, toFp and messageText are required' }, { status: 400 })
  }
  if (fromFp === toFp) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // ── Check sender balance ────────────────────────────────────────────────────
  const { data: ledger } = await admin
    .from('credits_ledger')
    .select('amount')
    .eq('fingerprint', fromFp)

  const balance = Math.max(0, (ledger || []).reduce((s: number, t: { amount: number }) => s + t.amount, 0))

  if (balance < MESSAGE_COST) {
    return NextResponse.json({ error: 'Insufficient credits', balance, required: MESSAGE_COST }, { status: 402 })
  }

  // ── Deduct from sender ──────────────────────────────────────────────────────
  await admin.from('credits_ledger').insert({
    fingerprint: fromFp,
    amount: -MESSAGE_COST,
    type: 'message_sent',
    reference_id: storyId || null,
    note: 'Message sent to author',
  })

  // ── Credit author ───────────────────────────────────────────────────────────
  await admin.from('credits_ledger').insert({
    fingerprint: toFp,
    amount: AUTHOR_SHARE,
    type: 'message_received',
    reference_id: storyId || null,
    note: `Message from ${fromName || 'a reader'}`,
  })

  // ── Store message ───────────────────────────────────────────────────────────
  await admin.from('author_messages').insert({
    from_fingerprint: fromFp,
    from_name: fromName?.trim() || 'Anonymous',
    to_fingerprint: toFp,
    story_id: storyId || null,
    message_text: messageText.trim(),
    credits_spent: MESSAGE_COST,
    author_credits_earned: AUTHOR_SHARE,
    status: 'sent',
  })

  const newBalance = balance - MESSAGE_COST
  return NextResponse.json({ success: true, newBalance })
}
