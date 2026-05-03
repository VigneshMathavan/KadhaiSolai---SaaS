import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { tamilTextToAudioWithProgress } from '@/lib/tts'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const { bookId } = await req.json()
    if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 })

    const admin = supabaseAdmin()

    const { data: book, error: bookErr } = await admin
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()

    if (bookErr || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const { data: job } = await admin
      .from('tts_jobs')
      .insert({ book_id: bookId, status: 'processing', started_at: new Date().toISOString() })
      .select()
      .single()

    const { data: txtFile, error: dlErr } = await admin.storage
      .from('books-txt')
      .download(book.txt_path)

    if (dlErr || !txtFile) {
      await admin.from('tts_jobs').update({ status: 'failed', error: 'Cannot read txt file' }).eq('id', job.id)
      await admin.from('books').update({ status: 'failed' }).eq('id', bookId)
      return NextResponse.json({ error: 'Cannot read text file' }, { status: 500 })
    }

    const tamilText = await txtFile.text()

    if (!tamilText.trim()) {
      await admin.from('books').update({ status: 'failed' }).eq('id', bookId)
      return NextResponse.json({ error: 'Text file is empty' }, { status: 400 })
    }

    const estimatedChunks = Math.ceil(tamilText.length / 2400)
    await admin.from('tts_jobs').update({
      chunks_total: estimatedChunks,
      progress: 0,
    }).eq('id', job.id)

    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 })
    }

    let lastProgress = 0
    const audioBuffer = await tamilTextToAudioWithProgress(
      tamilText,
      { voice: book.tts_voice || 'anand', pace: book.tts_pace || 1.0, language: 'ta-IN' },
      apiKey,
      async (done, total) => {
        const progress = Math.round((done / total) * 100)
        if (progress !== lastProgress) {
          lastProgress = progress
          await admin.from('tts_jobs').update({
            chunks_done: done,
            chunks_total: total,
            progress,
          }).eq('id', job.id)
        }
      }
    )

    const audioPath = `public/${bookId}.wav`
    const { error: uploadErr } = await admin.storage
      .from('books-audio')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/wav',
        upsert: true,
      })

    if (uploadErr) throw uploadErr

    const { data: { publicUrl } } = admin.storage.from('books-audio').getPublicUrl(audioPath)

    const WAV_HEADER = 44
    const pcmBytes = audioBuffer.length - WAV_HEADER
    const durationSeconds = Math.round(pcmBytes / (22050 * 1 * 2))

    await admin.from('books').update({
      status: 'ready',
      audio_path: audioPath,
      audio_duration: durationSeconds,
      updated_at: new Date().toISOString(),
    }).eq('id', bookId)

    await admin.from('tts_jobs').update({
      status: 'done',
      progress: 100,
      completed_at: new Date().toISOString(),
    }).eq('id', job.id)

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      durationSeconds,
      chunks: estimatedChunks,
    })

  } catch (err: any) {
    console.error('[TTS API Error]', err)

    try {
      const { bookId } = await (async () => {
        const body = await req.json().catch(() => ({}))
        return body
      })()
      if (bookId) {
        const admin = supabaseAdmin()
        await admin.from('books').update({ status: 'failed' }).eq('id', bookId)
        await admin.from('tts_jobs')
          .update({ status: 'failed', error: err.message })
          .eq('book_id', bookId)
      }
    } catch {}

    return NextResponse.json({ error: err.message || 'TTS processing failed' }, { status: 500 })
  }
}
