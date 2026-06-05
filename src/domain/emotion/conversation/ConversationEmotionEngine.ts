import { EmotionState, ConversationEmotionProfile } from '../types';
import { randomUUID } from 'crypto';

export class ConversationEmotionEngine {
  static buildProfiles(states: EmotionState[], bookId: string, chapterId: string): ConversationEmotionProfile[] {
    const convStates = states.filter(s => s.conversationId);
    
    const grouped = new Map<string, EmotionState[]>();
    for (const s of convStates) {
       if (!grouped.has(s.conversationId!)) grouped.set(s.conversationId!, []);
       grouped.get(s.conversationId!)!.push(s);
    }

    const profiles: ConversationEmotionProfile[] = [];
    
    for (const [convId, stList] of Array.from(grouped.entries())) {
       let conflictLevel = 0.5;
       let alignmentLevel = 0.5;
       
       const emotions = stList.map((s: any) => s.emotionType);
       if (emotions.includes('ANGER') || emotions.includes('RAGE') || emotions.includes('FRUSTRATION')) {
          conflictLevel = 0.9;
          alignmentLevel = 0.1;
       }
       if (emotions.includes('LOVE') || emotions.includes('AFFECTION') || emotions.includes('JOY')) {
          conflictLevel = 0.1;
          alignmentLevel = 0.9;
       }

       profiles.push({
          id: randomUUID(),
          bookId, chapterId,
          targetType: 'CONVERSATION',
          targetId: convId,
          dominantEmotion: stList[0].emotionType,
          volatility: 0.5,
          emotionalStateHistory: stList,
          conflictLevel,
          alignmentLevel
       });
    }

    return profiles;
  }
}
