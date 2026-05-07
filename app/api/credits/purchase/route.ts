import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PACKS: Record<string, { credits: number; price: number; label: string }> = {
  starter: { credits: 500,  price: 59,  label: 'Starter Pack'    },
  popular: { credits: 1500, price: 149, label: 'Popular Pack'     },
  power:   { credits: 5000, price: 449, label: 'Power User Pack'  },
}

export async function POST(req: NextRequest) {
  const { fingerprint, packId } = await req.json()
  if (!fingerprint || !packId) {
    return NextResponse.json({ error: 'fingerprint and packId required' }, { status: 400 })
  }

  const pack = PACKS[packId]
  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

  const admin = supabaseAdmin()

  // 1. Read current balance BEFORE inserting (avoids read-after-write replica lag)
  const { data: existing } = await admin
    .from('credits_ledger')
    .select('amount')
    .eq('fingerprint', fingerprint)

  const currentBalance = Math.max(0, (existing || []).reduce(
    (s: number, t: { amount: number }) => s + t.amount, 0
  ))

  // 2. Insert the purchase record
  const { error: insertErr } = await admin.from('credits_ledger').insert({
    fingerprint,
    amount: pack.credits,
    type: 'purchase',
  })

  if (insertErr) {
    console.error('[credits purchase] insert error:', insertErr.message)
    return NextResponse.json({ error: 'Purchase failed. Please try again.' }, { status: 500 })
  }

  // 3. Return computed balance — no second DB query needed
  const newBalance = currentBalance + pack.credits
  return NextResponse.json({ success: true, newBalance, creditsAdded: pack.credits })
}
