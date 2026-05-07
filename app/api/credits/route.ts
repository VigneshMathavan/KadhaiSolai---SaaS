import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get('fp')
  if (!fp) return NextResponse.json({ error: 'fp required' }, { status: 400 })

  const admin = supabaseAdmin()

  // 1. Compute true balance — unlimited sum of all entries
  // Note: select only 'amount' — 'type' is a SQL reserved word that can trip PostgREST
  const { data: allData, error: balErr } = await admin
    .from('credits_ledger')
    .select('amount')
    .eq('fingerprint', fp)

  if (balErr) {
    console.error('[credits GET] balance query error:', balErr.message)
    return NextResponse.json({ balance: 0, transactions: [] })
  }

  // New user — grant welcome credits once
  if (!allData || allData.length === 0) {
    await admin.from('credits_ledger').insert({
      fingerprint: fp,
      amount: 100,
      type: 'welcome',
    })
    return NextResponse.json({ balance: 100, transactions: [] })
  }

  const balance = Math.max(0, allData.reduce((s, t) => s + t.amount, 0))

  // 2. Fetch recent transactions for display (last 20)
  const { data: txData } = await admin
    .from('credits_ledger')
    .select('id, amount, type, created_at')
    .eq('fingerprint', fp)
    .order('created_at', { ascending: false })
    .limit(20)

  const transactions = (txData || []).map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.type,
    note: null,
    created_at: t.created_at,
  }))

  return NextResponse.json({ balance, transactions })
}
