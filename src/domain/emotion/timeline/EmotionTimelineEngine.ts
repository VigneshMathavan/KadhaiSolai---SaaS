import { EmotionState, EmotionTimeline, EmotionEvent } from '../types';
import { randomUUID } from 'crypto';

export class EmotionTimelineEngine {
  static buildTimelines(states: EmotionState[], bookId: string): EmotionTimeline[] {
    const timelines: EmotionTimeline[] = [];
    
    // Group states by target (character/conversation)
    const grouped = new Map<string, EmotionState[]>();
    for (const s of states) {
       const target = s.characterId || s.conversationId;
       if (!target) continue;
       if (!grouped.has(target)) grouped.set(target, []);
       grouped.get(target)!.push(s);
    }

    for (const [targetId, targetStates] of Array.from(grouped.entries())) {
       targetStates.sort((a: any,b: any) => a.startPosition - b.startPosition);
       
       const events: EmotionEvent[] = targetStates.map((s: any) => ({
          eventType: 'APPEARANCE',
          emotionType: s.emotionType,
          position: s.startPosition
       }));

       timelines.push({
          id: randomUUID(),
          bookId,
          targetId,
          events
       });
    }

    return timelines;
  }
}
