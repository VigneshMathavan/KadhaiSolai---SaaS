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

  await admin.from('credits_ledger').insert({
    fingerprint,
    amount: pack.credits,
    type: 'purchase',
    note: `${pack.label} — ${pack.credits} credits (₹${pack.price}, simulated)`,
  })

  const { data } = await admin
    .from('credits_ledger')
    .select('amount')
    .eq('fingerprint', fingerprint)

  const newBalance = Math.max(0, (data || []).reduce((s: number, t: { amount: number }) => s + t.amount, 0))
  return NextResponse.json({ success: true, newBalance, creditsAdded: pack.credits })
}
