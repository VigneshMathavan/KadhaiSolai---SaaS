import { EmotionDetectionStrategy } from './EmotionDetectionStrategy';
import { EmotionState, EmotionType } from '../../types';
import { randomUUID } from 'crypto';

export class ContextEmotionStrategy implements EmotionDetectionStrategy {
  name = 'ContextEmotionStrategy';

  async detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    const emotions: EmotionState[] = [];

    // Context analysis evaluates surrounding statements against the subject statement.
    // Example: "I am fine." -> If preceding context is highly negative, this is masking (SADNESS/GRIEF).

    // Simulate sliding window context analysis.
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

    for (let i = 1; i < sentences.length; i++) {
       const prev = sentences[i-1].toLowerCase();
       const curr = sentences[i].toLowerCase();
       const idx = text.indexOf(sentences[i]);

       if (curr.includes('i am fine') || curr.includes('நான் நன்றாக இருக்கிறேன்')) {
          if (prev.includes('died') || prev.includes('இறந்து') || prev.includes('lost') || prev.includes('cry')) {
             emotions.push({
                id: randomUUID(),
                bookId, chapterId,
                emotionType: 'GRIEF',
                intensity: { level: 0.9, trend: 'STABLE' },
                confidenceScore: 0.88,
                startPosition: idx,
                endPosition: idx + sentences[i].length,
                reasoning: {
                   explanation: `Context masking: Claim of well-being immediately following traumatic context indicator.`,
                   evidence: [
                      { evidenceText: sentences[i-1], sourceType: 'CONTEXT', position: text.indexOf(sentences[i-1]) },
                      { evidenceText: sentences[i], sourceType: 'CONTEXT', position: idx }
                   ]
                }
             });
          }
       }
    }

    return emotions;
  }
}
