import { NarrationContext, NarrationMemory } from '../types';

export class NarrationContextEngine {
  static evaluateContext(currentSceneMood: string, memory: NarrationMemory | null): NarrationContext {
    let continuityScore = 1.0;
    
    if (memory) {
       // Penalize continuity if the mood jumps erratically without reason
       if (memory.dominantMood === 'tragic' && currentSceneMood === 'romantic') {
          continuityScore = 0.5; // Jarring transition, might need intervention
       }
    }

    return {
       previousSceneMood: memory?.dominantMood,
       previousPace: memory?.avgPacing,
       continuityScore
    };
  }
}
