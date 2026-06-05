import { DialogueDetectionStrategy } from '../detection/strategies/DialogueDetectionStrategy';
import { DialogueDetectionResult, Dialogue, NarrationSegment } from '../types';
import { DialogueBoundaryEngine } from '../boundary/DialogueBoundaryEngine';
import { NarrationClassificationEngine } from '../classification/NarrationClassificationEngine';
import { SpeakerAttributionEngine } from '../attribution/SpeakerAttributionEngine';
import { ListenerAttributionEngine } from '../attribution/ListenerAttributionEngine';
import { ConversationEngine } from '../conversation/ConversationEngine';
import { DialogueQualityScorer } from '../scoring/DialogueQualityScorer';
import { DialogueValidationService } from '../validation/DialogueValidationService';

export class DialogueConfidenceFusionEngine {
  constructor(private strategies: DialogueDetectionStrategy[]) {}

  async fuseAndDetect(text: string, bookId: string, chapterId: string, traceId: string, knownCharacters: { id: string; names: string[] }[]): Promise<DialogueDetectionResult> {
    const startTime = Date.now();
    const candidatePool: Dialogue[] = [];

    // Run all strategies
    const promises = this.strategies.map(async (strategy) => {
      try {
        const candidate = await strategy.detect(text, bookId, chapterId);
        candidatePool.push(...candidate.dialogues);
      } catch (err: any) {
        console.error(`[Dialogue Fusion] Strategy ${strategy.name} failed:`, err.message);
      }
    });

    await Promise.all(promises);

    // 1. Boundary Sanitization
    const sanitizedDialogues = DialogueBoundaryEngine.sanitizeBoundaries(candidatePool, text.length);

    // 2. Classify Narration
    const narrationSegments = NarrationClassificationEngine.classify(text, sanitizedDialogues, bookId, chapterId);

    // 3. Speaker Attribution
    let attributedDialogues = SpeakerAttributionEngine.attribute(sanitizedDialogues, knownCharacters);

    // 4. Listener Attribution
    attributedDialogues = ListenerAttributionEngine.attribute(attributedDialogues, knownCharacters);

    // 5. Build Conversations
    const conversations = ConversationEngine.group(attributedDialogues, bookId, chapterId);

    // 6. Validation
    const validation = DialogueValidationService.validate(attributedDialogues, conversations, text.length);
    if (!validation.valid) {
      console.warn(`[Trace: ${traceId}] Dialogue validation warnings:`, validation.errors);
    }

    // 7. Quality Scoring
    const qualityScore = DialogueQualityScorer.score(attributedDialogues, conversations);

    console.log(JSON.stringify({
      event: 'DialogueDetectionCompleted', traceId, bookId, chapterId,
      dialogueCount: attributedDialogues.length,
      conversationCount: conversations.length,
      narrationCount: narrationSegments.length,
      qualityScore,
      processingTimeMs: Date.now() - startTime
    }));

    return {
      success: true,
      dialogues: attributedDialogues,
      conversations,
      narrationSegments,
      overallConfidence: qualityScore
    };
  }
}
