/**
 * Sarvam AI Bulbul v3 — Tamil Text to Speech
 * Docs: https://docs.sarvam.ai/api-reference-docs/text-to-speech
 *
 * Bulbul v3 caps at 2500 chars per request.
 * For full novels, we chunk at sentence boundaries and stitch the audio buffers.
 */

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech'
const MAX_CHUNK_CHARS = 2400 // stay under 2500 limit

export type SarvamVoice =
  | 'anand' | 'kavitha' | 'vijay' | 'shruti' // good Tamil voices
  | 'priya' | 'arvind' | 'amartya' | 'diya'
  | 'neel' | 'maitreyi' | 'pavithra' | 'bala'

export interface TTSOptions {
  voice?: SarvamVoice
  pace?: number        // 0.5 to 2.0
  language?: string    // default 'ta-IN'
}

/**
 * Split Tamil text into chunks ≤ MAX_CHUNK_CHARS
 * Splits on sentence-ending punctuation to keep natural pauses
 */
function chunkText(text: string): string[] {
  // Normalize whitespace
  const clean = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim()

  if (clean.length <= MAX_CHUNK_CHARS) return [clean]

  const chunks: string[] = []
  // Split on Tamil period (।), Tamil full stop (.), or newlines
  const sentences = clean.split(/(?<=[।.!\?\n])\s+/)

  let current = ''
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length <= MAX_CHUNK_CHARS) {
      current = current ? current + ' ' + sentence : sentence
    } else {
      if (current) chunks.push(current.trim())
      // If a single sentence is too long, force-split it
      if (sentence.length > MAX_CHUNK_CHARS) {
        const words = sentence.split(' ')
        let part = ''
        for (const word of words) {
          if ((part + ' ' + word).length > MAX_CHUNK_CHARS) {
            if (part) chunks.push(part.trim())
            part = word
          } else {
            part = part ? part + ' ' + word : word
          }
        }
        current = part
      } else {
        current = sentence
      }
    }
  }
  if (current) chunks.push(current.trim())

  return chunks.filter(c => c.length > 0)
}

/**
 * Convert a single chunk to base64 audio via Sarvam Bulbul v3
 */
async function chunkToAudio(
  text: string,
  options: TTSOptions,
  apiKey: string
): Promise<Buffer> {
  const res = await fetch(SARVAM_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: options.language ?? 'ta-IN',
      speaker: options.voice ?? 'anand',
      model: 'bulbul:v3',
      pace: options.pace ?? 1.0,
      enable_preprocessing: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sarvam TTS error (${res.status}): ${err}`)
  }

  const data = await res.json()

  // Sarvam returns: { "audios": ["<base64 WAV>"] }
  if (!data.audios?.[0]) throw new Error('Sarvam returned no audio data')

  return Buffer.from(data.audios[0], 'base64')
}

/**
 * Stitch multiple WAV buffers into one.
 * WAV format: 44-byte header + PCM data.
 * We take header from first chunk, concatenate PCM from all chunks.
 */
function stitchWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 1) return buffers[0]

  const WAV_HEADER_SIZE = 44
  const pcmChunks = buffers.map(b => b.slice(WAV_HEADER_SIZE))
  const totalPcm = Buffer.concat(pcmChunks)

  // Copy header from first chunk and update sizes
  const header = Buffer.from(buffers[0].slice(0, WAV_HEADER_SIZE))

  // Update ChunkSize (bytes 4-7): total file size - 8
  header.writeUInt32LE(totalPcm.length + WAV_HEADER_SIZE - 8, 4)
  // Update Subchunk2Size (bytes 40-43): PCM data size
  header.writeUInt32LE(totalPcm.length, 40)

  return Buffer.concat([header, totalPcm])
}

/**
 * Main function: Tamil text → WAV audio Buffer
 * Handles chunking + stitching automatically.
 *
 * @param text     Full Tamil text (any length)
 * @param options  Voice, pace, language options
 * @param apiKey   Sarvam API key
 * @returns        WAV audio as Buffer
 */
export async function tamilTextToAudio(
  text: string,
  options: TTSOptions = {},
  apiKey: string
): Promise<Buffer> {
  const chunks = chunkText(text)

  console.log(`[TTS] Processing ${chunks.length} chunk(s) for ${text.length} chars`)

  // Process chunks sequentially to respect rate limits
  const audioBuffers: Buffer[] = []
  for (let i = 0; i < chunks.length; i++) {
    console.log(`[TTS] Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`)
    const buf = await chunkToAudio(chunks[i], options, apiKey)
    audioBuffers.push(buf)

    // Small delay between chunks to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 300))
    }
  }

  return stitchWavBuffers(audioBuffers)
}

/**
 * Progress-tracked version for long novels
 * Calls onProgress(chunkIndex, totalChunks) after each chunk
 */
export async function tamilTextToAudioWithProgress(
  text: string,
  options: TTSOptions = {},
  apiKey: string,
  onProgress: (done: number, total: number) => void
): Promise<Buffer> {
  const chunks = chunkText(text)
  const audioBuffers: Buffer[] = []

  for (let i = 0; i < chunks.length; i++) {
    const buf = await chunkToAudio(chunks[i], options, apiKey)
    audioBuffers.push(buf)
    onProgress(i + 1, chunks.length)
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 300))
  }

  return stitchWavBuffers(audioBuffers)
}

export { chunkText }
