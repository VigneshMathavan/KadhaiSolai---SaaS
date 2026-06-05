import { EmotionState, EmotionTransition } from '../types';
import { randomUUID } from 'crypto';

export class EmotionTransitionEngine {
  static extractTransitions(states: EmotionState[], bookId: string): EmotionTransition[] {
    const transitions: EmotionTransition[] = [];
    
    // Sort states by position
    const sorted = [...states].sort((a,b) => a.startPosition - b.startPosition);

    for (let i = 1; i < sorted.length; i++) {
       const prev = sorted[i-1];
       const curr = sorted[i];

       // Same target? (Character or Conversation)
       if ((prev.characterId && prev.characterId === curr.characterId) || 
           (prev.conversationId && prev.conversationId === curr.conversationId)) {
          
          if (prev.emotionType !== curr.emotionType) {
             transitions.push({
                id: randomUUID(),
                bookId,
                targetId: (prev.characterId || prev.conversationId)!,
                fromEmotion: prev.emotionType,
                toEmotion: curr.emotionType,
                transitionReason: `Narrative shift from ${prev.emotionType} to ${curr.emotionType}`,
                transitionTimestamp: curr.startPosition
             });
          }
       }
    }

    return transitions;
  }
}
