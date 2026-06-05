import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const genre = searchParams.get('genre')
    const search = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const admin = supabaseAdmin()
    let query = admin
      .from('books')
      .select('*')
      .eq('status', 'ready')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (genre && genre !== 'all') query = query.eq('genre', genre)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    // Get public audio URLs
    const booksWithUrls = data?.map(book => {
      if (book.audio_path) {
        const { data: { publicUrl } } = admin.storage
          .from('books-audio')
          .getPublicUrl(book.audio_path)
        return { ...book, audio_url: publicUrl }
      }
      return book
    })

    return NextResponse.json({ books: booksWithUrls || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
