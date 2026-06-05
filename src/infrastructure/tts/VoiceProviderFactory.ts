import { ITextToSpeechProvider } from './ITextToSpeechProvider';
import { SarvamProvider } from './SarvamProvider';

export class VoiceProviderFactory {
  static getProvider(name: string): ITextToSpeechProvider {
    if (name === 'sarvam') return new SarvamProvider();
    throw new Error('Unsupported provider');
  }
}
