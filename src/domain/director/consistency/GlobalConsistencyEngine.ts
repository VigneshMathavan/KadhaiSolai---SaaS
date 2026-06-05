import { PerformanceConflict } from '../types';
import { randomUUID } from 'crypto';

export class GlobalConsistencyEngine {
  static checkConsistency(characterPlans: any[], emotionContext: any[]): PerformanceConflict[] {
    const conflicts: PerformanceConflict[] = [];

    // Detect drift across scenes
    const archetypeMap = new Map<string, string>();
    for (const char of characterPlans) {
       if (archetypeMap.has(char.characterId) && archetypeMap.get(char.characterId) !== char.voiceArchetype) {
          conflicts.push({
             id: randomUUID(),
             layerA: 'CHARACTER_EXECUTION',
             layerB: 'VOICE_CASTING',
             conflictType: 'VOICE_DRIFT',
             severity: 0.9,
             description: `Character ${char.characterId} has mismatched archetypes across scenes.`
          });
       }
       archetypeMap.set(char.characterId, char.voiceArchetype);
    }

    return conflicts;
  }
}
