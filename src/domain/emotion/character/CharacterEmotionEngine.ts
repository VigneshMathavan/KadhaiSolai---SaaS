import { EmotionState, CharacterEmotionProfile } from '../types';
import { randomUUID } from 'crypto';

export class CharacterEmotionEngine {
  static buildProfiles(states: EmotionState[], bookId: string, chapterId: string): CharacterEmotionProfile[] {
    const charStates = states.filter(s => s.characterId);
    
    // Group by character
    const grouped = new Map<string, EmotionState[]>();
    for (const s of charStates) {
       if (!grouped.has(s.characterId!)) grouped.set(s.characterId!, []);
       grouped.get(s.characterId!)!.push(s);
    }

    const profiles: CharacterEmotionProfile[] = [];
    
    for (const [charId, stList] of Array.from(grouped.entries())) {
       // Determine dominant emotion
       const counts = new Map<string, number>();
       for (const s of stList) counts.set(s.emotionType, (counts.get(s.emotionType) || 0) + 1);
       
       let dominant: any = 'NEUTRAL';
       let max = 0;
       for (const [emo, count] of Array.from(counts.entries())) {
          if (count > max) { max = count; dominant = emo; }
       }

       profiles.push({
          id: randomUUID(),
          bookId, chapterId,
          targetType: 'CHARACTER',
          targetId: charId,
          dominantEmotion: dominant,
          volatility: stList.length > 5 ? 0.8 : 0.3,
          emotionalStateHistory: stList
       });
    }

    return profiles;
  }
}
