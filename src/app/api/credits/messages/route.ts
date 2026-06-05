import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/credits/messages?fp=<fingerprint>
// Returns messages received by this author fingerprint
export async function GET(req: NextRequest) {
  const fp = req.nextUrl.searchParams.get('fp')
  if (!fp) return NextResponse.json({ error: 'fp required' }, { status: 400 })

  const admin = supabaseAdmin()

  const { data, error } = await admin
    .from('author_messages')
    .select('id, from_name, story_id, message_text, credits_spent, author_credits_earned, status, created_at')
    .eq('to_fingerprint', fp)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark unread as read
  const unreadIds = (data || []).filter(m => m.status === 'sent').map(m => m.id)
  if (unreadIds.length > 0) {
    await admin
      .from('author_messages')
      .update({ status: 'read' })
      .in('id', unreadIds)
  }

  return NextResponse.json({ messages: data || [] })
}
