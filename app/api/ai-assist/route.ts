import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const PROMPTS: Record<string, string> = {
  continue: 'You are a Tamil creative fiction writer. Continue this story naturally for 2–3 paragraphs, matching the tone and language. Return ONLY the continuation — no titles, no explanations.',
  improve: 'You are a Tamil creative writing editor. Improve the vocabulary, flow, and emotional depth. Preserve the original meaning and language (Tamil or English). Return ONLY the improved text.',
  title: 'Suggest 5 short, compelling Tamil story titles for this story. Return ONLY the titles, numbered 1–5, one per line.',
}

const FALLBACK: Record<string, string> = {
  continue: 'கதை தொடர்கிறது... AI உதவி இயக்க, Vercel இல் ANTHROPIC_API_KEY சேர்க்கவும்.',
  improve: 'எழுத்து மேம்பாடு... AI உதவி இயக்க, Vercel இல் ANTHROPIC_API_KEY சேர்க்கவும்.',
  title: '1. நம்பிக்கையின் விடியல்\n2. காலத்தின் குரல்\n3. வாழ்வின் திருப்பம்\n4. இதயத்தின் இசை\n5. கனவுகளின் பாதை',
}

export async function POST(req: NextRequest) {
  try {
    const { text, mode, genre } = await req.json()
    if (!text || typeof text !== 'string' || text.trim().length < 10)
      return NextResponse.json({ error: 'Write at least a few sentences first' }, { status: 400 })
    if (!PROMPTS[mode])
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ result: FALLBACK[mode], mode })

    const userMsg = genre
      ? `Genre: ${genre}\n\n${text.slice(0, 3500)}`
      : text.slice(0, 3500)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: PROMPTS[mode],
        messages: [{ role: 'user', content: userMsg }],
      }),
    })

    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    return NextResponse.json({ result: data.content?.[0]?.text || FALLBACK[mode], mode })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI failed' }, { status: 500 })
  }
}
