import { EmotionDetectionStrategy } from './EmotionDetectionStrategy';
import { EmotionState, EmotionType } from '../../types';
import { randomUUID } from 'crypto';

export class RelationshipEmotionStrategy implements EmotionDetectionStrategy {
  name = 'RelationshipEmotionStrategy';

  async detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    const emotions: EmotionState[] = [];
    
    // We assume contextData provides graph arrays
    const relationships = contextData?.relationships || []; // e.g., [{source: 'A', target: 'B', type: 'ENEMY'}]

    // Simulating mapping.
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
       const sLower = sentence.toLowerCase();
       const idx = text.indexOf(sentence);
       
       // Example: Mentions of Father/Son with negative verbs -> Disappointment/Grief
       if (sLower.includes('father') || sLower.includes('தந்தை') || sLower.includes('son') || sLower.includes('மகன்')) {
          if (sLower.includes('shout') || sLower.includes('கத்தினார்') || sLower.includes('disappoint')) {
             emotions.push({
                id: randomUUID(),
                bookId, chapterId,
                emotionType: 'SADNESS', // Disappointment mapped to SADNESS taxonomy
                intensity: { level: 0.7, trend: 'STABLE' },
                confidenceScore: 0.8,
                startPosition: idx,
                endPosition: idx + sentence.length,
                reasoning: {
                   explanation: 'Family conflict detected (Father/Son) with negative interaction verbs.',
                   evidence: [{ evidenceText: sentence, sourceType: 'RELATIONSHIP', position: idx }]
                }
             });
          }
       }
       
       // Example: Lovers separation -> Grief/Longing
       if (sLower.includes('பிரிவு') || sLower.includes('பிரிந்து') || sLower.includes('parting') || sLower.includes('separation')) {
          emotions.push({
             id: randomUUID(),
             bookId, chapterId,
             emotionType: 'GRIEF',
             intensity: { level: 0.9, trend: 'STABLE' },
             confidenceScore: 0.85,
             startPosition: idx,
             endPosition: idx + sentence.length,
             reasoning: {
                explanation: 'Relational separation context detected implying deep grief.',
                evidence: [{ evidenceText: sentence, sourceType: 'RELATIONSHIP', position: idx }]
             }
          });
       }
    }

    return emotions;
  }
}
