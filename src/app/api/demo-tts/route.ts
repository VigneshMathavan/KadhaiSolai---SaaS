import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_VOICES = ['anand', 'kavitha', 'vijay', 'shruti', 'priya', 'pavithra', 'bala', 'neel', 'maitreyi', 'arvind']
const MAX_CHARS = 500

export async function POST(req: NextRequest) {
  try {
    const { voice = 'anand', text } = await req.json()

    if (!ALLOWED_VOICES.includes(voice)) {
      return NextResponse.json({ error: 'Invalid voice' }, { status: 400 })
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const trimmed = text.trim().slice(0, MAX_CHARS)

    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'TTS not configured' }, { status: 500 })

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        inputs: [trimmed],
        target_language_code: 'ta-IN',
        speaker: voice,
        model: 'bulbul:v3',
        pace: 1.0,
        enable_preprocessing: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Sarvam API error: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    if (!data.audios?.[0]) return NextResponse.json({ error: 'No audio returned' }, { status: 500 })

    return NextResponse.json({ audio: data.audios[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
