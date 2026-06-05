import { EmotionState, EmotionMemory } from '../types';

export class EmotionMemoryEngine {
  static evaluateMemory(states: EmotionState[]): Map<string, EmotionMemory> {
    const memoryMap = new Map<string, EmotionMemory>();
    const charStates = states.filter(s => s.characterId);
    
    // Group by character
    const grouped = new Map<string, EmotionState[]>();
    for (const s of charStates) {
       if (!grouped.has(s.characterId!)) grouped.set(s.characterId!, []);
       grouped.get(s.characterId!)!.push(s);
    }

    for (const [charId, stList] of Array.from(grouped.entries())) {
       stList.sort((a: any,b: any) => a.startPosition - b.startPosition);
       
       const persistentEmotions = new Set<string>();
       let lastTraumatic: number | undefined;
       let lastJoyous: number | undefined;

       for (const s of stList) {
          if (s.emotionType === 'GRIEF' || s.emotionType === 'PANIC') {
             persistentEmotions.add(s.emotionType);
             lastTraumatic = s.startPosition;
          }
          if (s.emotionType === 'JOY' || s.emotionType === 'LOVE') {
             lastJoyous = s.startPosition;
          }
       }

       memoryMap.set(charId, {
          characterId: charId,
          persistentEmotions: Array.from(persistentEmotions) as any[],
          lastTraumaticEventPosition: lastTraumatic,
          lastJoyousEventPosition: lastJoyous
       });
    }

    return memoryMap;
  }
}
