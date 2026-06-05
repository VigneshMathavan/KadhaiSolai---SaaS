import { NarrationMemory } from '../types';

export class NarrationMemoryEngine {
  static buildMemory(chapterId: string, pacingScores: number[], energyScores: number[], moods: string[]): NarrationMemory {
    const avgPacing = pacingScores.length > 0 ? pacingScores.reduce((a, b) => a + b, 0) / pacingScores.length : 1.0;
    const avgIntensity = energyScores.length > 0 ? energyScores.reduce((a, b) => a + b, 0) / energyScores.length : 0.5;
    
    let dominantMood = 'neutral';
    if (moods.length > 0) {
       const counts = new Map<string, number>();
       for (const m of moods) counts.set(m, (counts.get(m) || 0) + 1);
       let max = 0;
       for (const [m, c] of Array.from(counts.entries())) {
          if (c > max) { max = c; dominantMood = m; }
       }
    }

    return {
       chapterId,
       avgPacing,
       avgIntensity,
       dominantMood
    };
  }
}
