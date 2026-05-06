import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get('fp')
  if (!fp) return NextResponse.json({ error: 'fp required' }, { status: 400 })

  const admin = supabaseAdmin()

  const { data, error } = await admin
    .from('credits_ledger')
    .select('id, amount, type, note, created_at')
    .eq('fingerprint', fp)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // New user — grant welcome credits
  if (!data || data.length === 0) {
    await admin.from('credits_ledger').insert({
      fingerprint: fp,
      amount: 100,
      type: 'welcome',
      note: 'Welcome to KadhaiSolai! 100 free credits to get started.',
    })
    return NextResponse.json({ balance: 100, transactions: [] })
  }

  const balance = Math.max(0, data.reduce((s, t) => s + t.amount, 0))
  return NextResponse.json({ balance, transactions: data })
}
