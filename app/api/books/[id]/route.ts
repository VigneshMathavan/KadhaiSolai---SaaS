import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = supabaseAdmin()
    const { data, error } = await admin
      .from('books')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'ready')
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Get public audio URL
    let audio_url = null
    if (data.audio_path) {
      const { data: { publicUrl } } = admin.storage.from('books-audio').getPublicUrl(data.audio_path)
      audio_url = publicUrl
    }

    // Increment plays
    await admin.from('books').update({ plays_count: (data.plays_count || 0) + 1 }).eq('id', params.id)

    return NextResponse.json({ book: { ...data, audio_url } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
