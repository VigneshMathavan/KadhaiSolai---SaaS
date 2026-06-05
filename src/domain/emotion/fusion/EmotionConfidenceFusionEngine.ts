import { EmotionState } from '../types';
import { LexicalEmotionStrategy } from '../detection/strategies/LexicalEmotionStrategy';
import { DialogueEmotionStrategy } from '../detection/strategies/DialogueEmotionStrategy';
import { ContextEmotionStrategy } from '../detection/strategies/ContextEmotionStrategy';
import { RelationshipEmotionStrategy } from '../detection/strategies/RelationshipEmotionStrategy';
import { MemoryEmotionStrategy } from '../detection/strategies/MemoryEmotionStrategy';
import { NarrativeEmotionStrategy } from '../detection/strategies/NarrativeEmotionStrategy';
import { EmotionWeightingEngine } from './EmotionWeightingEngine';
import { EmotionConflictResolutionEngine } from './EmotionConflictResolutionEngine';

export class EmotionConfidenceFusionEngine {
  constructor(
     private lexical: LexicalEmotionStrategy,
     private dialogue: DialogueEmotionStrategy,
     private context: ContextEmotionStrategy,
     private relationship: RelationshipEmotionStrategy,
     private memory: MemoryEmotionStrategy,
     private narrative: NarrativeEmotionStrategy
  ) {}

  async fuse(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    // 1. Run all strategies concurrently
    const [lexResults, diagResults, ctxResults, relResults, memResults, narResults] = await Promise.all([
       this.lexical.detect(text, bookId, chapterId, contextData),
       this.dialogue.detect(text, bookId, chapterId, contextData),
       this.context.detect(text, bookId, chapterId, contextData),
       this.relationship.detect(text, bookId, chapterId, contextData),
       this.memory.detect(text, bookId, chapterId, contextData),
       this.narrative.detect(text, bookId, chapterId, contextData)
    ]);

    // 2. Aggregate all extracted emotions
    const allEmotions = [...lexResults, ...diagResults, ...ctxResults, ...relResults, ...memResults, ...narResults];

    // 3. Weighting Phase
    const weightedEmotions = EmotionWeightingEngine.assignWeights(allEmotions);

    // Map weights back to raw emotions
    for (let i = 0; i < allEmotions.length; i++) {
       allEmotions[i].confidenceScore = weightedEmotions[i].weightedConfidence;
    }

    // 4. Conflict Resolution (Simplistic grouping by pos for Phase 4)
    // We pass the entire block to resolution if they overlap. For MVP, we group all scene emotions.
    const resolution = EmotionConflictResolutionEngine.resolve(allEmotions);
    
    // Assign the resolved primary/dominant state
    for (const e of allEmotions) {
       if (e.emotionType !== resolution.primaryEmotion && e.emotionType !== resolution.secondaryEmotion) {
          // Severely penalize confidence of non-dominant conflicting emotions
          e.confidenceScore *= 0.2;
       }
    }
    
    return allEmotions;
  }
}
