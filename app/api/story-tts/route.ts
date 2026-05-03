import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { tamilTextToAudioWithProgress } from '@/lib/tts'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { storyId } = await req.json()
    if (!storyId) return NextResponse.json({ error: 'storyId required' }, { status: 400 })

    const admin = supabaseAdmin()
    const audioPath = `stories/${storyId}.wav`

    // Check if audio already exists
    const { data: existing } = await admin.storage
      .from('books-audio')
      .list('stories', { search: `${storyId}.wav` })

    if (existing && existing.find(f => f.name === `${storyId}.wav`)) {
      const { data: { publicUrl } } = admin.storage.from('books-audio').getPublicUrl(audioPath)
      return NextResponse.json({ audioUrl: publicUrl, cached: true })
    }

    // Fetch story text
    const { data: story, error } = await admin
      .from('stories')
      .select('body, title')
      .eq('id', storyId)
      .single()

    if (error || !story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })

    // Cap at 3000 chars for responsiveness
    const text = story.body.trim().slice(0, 3000)
    if (!text) return NextResponse.json({ error: 'Story has no text' }, { status: 400 })

    const audioBuffer = await tamilTextToAudioWithProgress(
      text,
      { voice: 'anand', pace: 0.9, language: 'ta-IN' },
      apiKey,
      async () => {}
    )

    const { error: uploadErr } = await admin.storage
      .from('books-audio')
      .upload(audioPath, audioBuffer, { contentType: 'audio/wav', upsert: true })

    if (uploadErr) throw uploadErr

    const { data: { publicUrl } } = admin.storage.from('books-audio').getPublicUrl(audioPath)
    return NextResponse.json({ audioUrl: publicUrl, cached: false })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'TTS failed' }, { status: 500 })
  }
}
