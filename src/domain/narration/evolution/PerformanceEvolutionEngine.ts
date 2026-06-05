import { NarrationMemory } from '../types';

export class PerformanceEvolutionEngine {
  static evaluateEvolution(historicalMemories: NarrationMemory[]): { evolutionTrend: string, intensityProgression: number } {
    if (historicalMemories.length < 2) return { evolutionTrend: 'FLAT', intensityProgression: 0 };
    
    const first = historicalMemories[0];
    const last = historicalMemories[historicalMemories.length - 1];
    
    const diff = last.avgIntensity - first.avgIntensity;
    
    let trend = 'FLAT';
    if (diff > 0.2) trend = 'RISING';
    if (diff < -0.2) trend = 'FALLING';
    
    return { evolutionTrend: trend, intensityProgression: diff };
  }
}
