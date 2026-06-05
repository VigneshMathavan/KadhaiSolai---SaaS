import { EmotionDetectionStrategy } from './EmotionDetectionStrategy';
import { EmotionState, EmotionType } from '../../types';
import { randomUUID } from 'crypto';

export class MemoryEmotionStrategy implements EmotionDetectionStrategy {
  name = 'MemoryEmotionStrategy';

  async detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    const emotions: EmotionState[] = [];
    
    // Simulate long-range memory reactivation based on historical inputs.
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
       const sLower = sentence.toLowerCase();
       const idx = text.indexOf(sentence);
       
       // Example: Reactivation of grief at a grave or thinking of dead parent
       if (sLower.includes('grave') || sLower.includes('கல்லறை') || sLower.includes('நினைவு') || sLower.includes('memory')) {
          if (sLower.includes('mother') || sLower.includes('அம்மா') || sLower.includes('father') || sLower.includes('அப்பா')) {
             emotions.push({
                id: randomUUID(),
                bookId, chapterId,
                emotionType: 'GRIEF',
                intensity: { level: 0.8, trend: 'STABLE' },
                confidenceScore: 0.85,
                startPosition: idx,
                endPosition: idx + sentence.length,
                reasoning: {
                   explanation: 'Long-range memory reactivation. Traumatic entity (parent) recalled in memory context (grave/remembrance) triggers GRIEF.',
                   evidence: [{ evidenceText: sentence, sourceType: 'MEMORY', position: idx }]
                }
             });
          }
       }
    }

    return emotions;
  }
}
