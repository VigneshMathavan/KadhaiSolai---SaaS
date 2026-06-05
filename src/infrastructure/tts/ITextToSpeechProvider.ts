export interface TTSOptions {
  voice?: string;
  pace?: number;
  language?: string;
}

export interface ITextToSpeechProvider {
  generateAudio(text: string, options: TTSOptions, onProgress?: (done: number, total: number) => void): Promise<Buffer>;
}
