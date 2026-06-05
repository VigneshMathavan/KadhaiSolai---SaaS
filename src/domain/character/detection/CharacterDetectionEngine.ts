import { CharacterDetectionStrategy } from './strategies/CharacterDetectionStrategy';
import { NamedEntityStrategy } from './strategies/NamedEntityStrategy';
import { DialogueSpeakerStrategy } from './strategies/DialogueSpeakerStrategy';
import { PronounResolutionStrategy } from './strategies/PronounResolutionStrategy';
import { RelationshipInferenceStrategy } from './strategies/RelationshipInferenceStrategy';
import { FrequencyAnalysisStrategy } from './strategies/FrequencyAnalysisStrategy';
import { CharacterConfidenceFusionEngine } from '../scoring/CharacterConfidenceFusionEngine';
import { CharacterDetectionResult } from '../types';

export class CharacterDetectionEngine {
  private strategies: CharacterDetectionStrategy[];

  constructor() {
    this.strategies = [
      new NamedEntityStrategy(),
      new DialogueSpeakerStrategy(),
      new PronounResolutionStrategy(),
      new RelationshipInferenceStrategy(),
      new FrequencyAnalysisStrategy()
    ];
  }

  async processChapter(text: string, bookId: string, chapterId: string, traceId: string): Promise<CharacterDetectionResult> {
    const fusionEngine = new CharacterConfidenceFusionEngine(this.strategies);
    return fusionEngine.fuseAndDetect(text, bookId, chapterId, traceId);
  }
}
