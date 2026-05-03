export type AIMode = 'continue' | 'improve' | 'title'

export interface AIRequest {
  text: string
  mode: AIMode
  genre?: string
}

export interface AIResponse {
  result: string
  mode: AIMode
}

export async function aiAssist(req: AIRequest): Promise<AIResponse> {
  const res = await fetch('/api/ai-assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'AI service unavailable')
  return json as AIResponse
}
