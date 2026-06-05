import { ITextToSpeechProvider, TTSOptions } from './ITextToSpeechProvider';
import { tamilTextToAudio, tamilTextToAudioWithProgress } from '@/lib/tts';

export class SarvamProvider implements ITextToSpeechProvider {
  async generateAudio(text: string, options: TTSOptions, onProgress?: (done: number, total: number) => void): Promise<Buffer> {
    const apiKey = process.env.SARVAM_API_KEY || '';
    if (onProgress) {
      return tamilTextToAudioWithProgress(text, options as any, apiKey, onProgress);
    }
    return tamilTextToAudio(text, options as any, apiKey);
  }
}
