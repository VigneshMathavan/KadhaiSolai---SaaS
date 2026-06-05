import { DialogueDetectionStrategy } from './strategies/DialogueDetectionStrategy';
import { QuotationStrategy } from './strategies/QuotationStrategy';
import { NarrativeDialogueStrategy } from './strategies/NarrativeDialogueStrategy';
import { SpeakerVerbStrategy } from './strategies/SpeakerVerbStrategy';
import { ConversationPatternStrategy } from './strategies/ConversationPatternStrategy';
import { StructuralDialogueStrategy } from './strategies/StructuralDialogueStrategy';
import { DialogueConfidenceFusionEngine } from '../fusion/DialogueConfidenceFusionEngine';
import { DialogueDetectionResult } from '../types';

export class DialogueDetectionEngine {
  private strategies: DialogueDetectionStrategy[];

  constructor() {
    this.strategies = [
      new QuotationStrategy(),
      new NarrativeDialogueStrategy(),
      new SpeakerVerbStrategy(),
      new ConversationPatternStrategy(),
      new StructuralDialogueStrategy()
    ];
  }

  async processChapter(text: string, bookId: string, chapterId: string, traceId: string, knownCharacters: { id: string; names: string[] }[]): Promise<DialogueDetectionResult> {
    const fusionEngine = new DialogueConfidenceFusionEngine(this.strategies);
    return fusionEngine.fuseAndDetect(text, bookId, chapterId, traceId, knownCharacters);
  }
}
