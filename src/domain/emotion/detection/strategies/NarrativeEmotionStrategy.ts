import { EmotionDetectionStrategy } from './EmotionDetectionStrategy';
import { EmotionState, EmotionType } from '../../types';
import { randomUUID } from 'crypto';

export class NarrativeEmotionStrategy implements EmotionDetectionStrategy {
  name = 'NarrativeEmotionStrategy';

  async detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    const emotions: EmotionState[] = [];
    
    const paragraphs = text.split(/\n\n+/);
    
    for (const p of paragraphs) {
       const pLower = p.toLowerCase();
       const idx = text.indexOf(p);
       
       // Example 1: Suspense / Fear without explicit emotion words.
       // "Dark forest. Unknown footsteps. Silence." -> FEAR/SUSPENSE
       if ((pLower.includes('dark') || pLower.includes('இருட்டு')) && 
           (pLower.includes('silence') || pLower.includes('அமைதி')) &&
           (pLower.includes('footstep') || pLower.includes('காலடி'))) {
          
          emotions.push({
             id: randomUUID(),
             bookId, chapterId,
             emotionType: 'FEAR', // Maps suspense/tension to FEAR
             intensity: { level: 0.8, trend: 'RISING' },
             confidenceScore: 0.9,
             startPosition: idx,
             endPosition: idx + p.length,
             reasoning: {
                explanation: 'Narrative atmospheric analysis. Environmental cues (dark, silence, footsteps) strongly indicate suspense and fear.',
                evidence: [{ evidenceText: p.substring(0, 50) + '...', sourceType: 'NARRATIVE', position: idx }]
             }
          });
       }
       
       // Example 2: Romance / Peace
       if ((pLower.includes('நிலவு') || pLower.includes('moon')) && 
           (pLower.includes('தென்றல்') || pLower.includes('breeze')) &&
           (pLower.includes('கை') || pLower.includes('hand'))) {
          
          emotions.push({
             id: randomUUID(),
             bookId, chapterId,
             emotionType: 'LOVE',
             intensity: { level: 0.7, trend: 'STABLE' },
             confidenceScore: 0.85,
             startPosition: idx,
             endPosition: idx + p.length,
             reasoning: {
                explanation: 'Narrative atmospheric analysis. Environmental cues indicate a romantic or deeply peaceful setting.',
                evidence: [{ evidenceText: p.substring(0, 50) + '...', sourceType: 'NARRATIVE', position: idx }]
             }
          });
       }
    }

    return emotions;
  }
}
