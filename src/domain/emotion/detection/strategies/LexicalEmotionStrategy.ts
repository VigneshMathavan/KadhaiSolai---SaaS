import { EmotionDetectionStrategy } from './EmotionDetectionStrategy';
import { EmotionState, EmotionType } from '../../types';
import { randomUUID } from 'crypto';

export class LexicalEmotionStrategy implements EmotionDetectionStrategy {
  name = 'LexicalEmotionStrategy';

  async detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    const emotions: EmotionState[] = [];
    
    // Simplistic mapping for foundational layer. Future implementation uses Transformer models.
    const keywordMap: Record<string, EmotionType> = {
       'அழுதான்': 'SADNESS',
       'சிரித்தார்': 'JOY',
       'பயந்தான்': 'FEAR',
       'கோபம்': 'ANGER',
       'cried': 'SADNESS',
       'laughed': 'JOY',
       'scared': 'FEAR',
       'angry': 'ANGER'
    };

    const textLower = text.toLowerCase();
    
    for (const [keyword, emotion] of Object.entries(keywordMap)) {
       let idx = textLower.indexOf(keyword);
       while (idx !== -1) {
          emotions.push({
             id: randomUUID(),
             bookId, chapterId,
             emotionType: emotion,
             intensity: { level: 0.6, trend: 'STABLE' }, // Default lexical intensity
             confidenceScore: 0.7,
             startPosition: idx,
             endPosition: idx + keyword.length,
             reasoning: {
                explanation: `Lexical keyword match: ${keyword}`,
                evidence: [{ evidenceText: keyword, sourceType: 'LEXICAL', position: idx }]
             }
          });
          idx = textLower.indexOf(keyword, idx + 1);
       }
    }

    return emotions;
  }
}
