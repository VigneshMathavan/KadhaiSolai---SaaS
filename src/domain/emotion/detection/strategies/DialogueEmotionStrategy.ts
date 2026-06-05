import { EmotionDetectionStrategy } from './EmotionDetectionStrategy';
import { EmotionState, EmotionType } from '../../types';
import { randomUUID } from 'crypto';

export class DialogueEmotionStrategy implements EmotionDetectionStrategy {
  name = 'DialogueEmotionStrategy';

  async detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]> {
    const emotions: EmotionState[] = [];
    
    // For MVP rule-based extraction, we scan bounded dialogue text logic.
    // If we have actual contextData.dialogues, we iterate them.
    // For now we simulate parsing raw dialogue fragments.

    const fragments = text.match(/["“”«»](.*?)["“”«»]/g) || [];
    
    for (const frag of fragments) {
       const fragLower = frag.toLowerCase();
       const idx = text.indexOf(frag);

       let emotionType: EmotionType | null = null;
       let confidence = 0.5;
       let explanation = '';

       // Example 1: Repeated exclamation / questions (Anger/Panic)
       if (frag.match(/!{2,}/) || frag.match(/\?!/)) {
          emotionType = 'ANGER';
          confidence = 0.8;
          explanation = 'Repeated strong punctuation indicates elevated intensity and anger/panic';
       } 
       // Example 2: Very short fragmented speech (Panic/Fear/Shock)
       else if (frag.length < 15 && frag.includes('...')) {
          emotionType = 'FEAR';
          confidence = 0.75;
          explanation = 'Short fragmented trailing speech indicates hesitation, fear, or shock';
       }
       // Example 3: Sarcasm / Frustration (Tamil specifics)
       else if (fragLower.includes('அப்படியா') || fragLower.includes('ரொம்ப நல்லாருக்கு')) {
          emotionType = 'FRUSTRATION'; // Also Sarcasm
          confidence = 0.85;
          explanation = 'Tamil conversational idiom mapped to sarcasm/frustration';
       }
       else if (fragLower.includes('அச்சோ') || fragLower.includes('ஐயோ')) {
          emotionType = 'PANIC';
          confidence = 0.9;
          explanation = 'Tamil exclamation explicit panic/fear indicator';
       }

       if (emotionType) {
          emotions.push({
             id: randomUUID(),
             bookId, chapterId,
             emotionType,
             intensity: { level: 0.8, trend: 'STABLE' },
             confidenceScore: confidence,
             startPosition: idx,
             endPosition: idx + frag.length,
             reasoning: {
                explanation,
                evidence: [{ evidenceText: frag, sourceType: 'DIALOGUE', position: idx }]
             }
          });
       }
    }

    return emotions;
  }
}
