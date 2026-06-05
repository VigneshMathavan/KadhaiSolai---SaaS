import { CharacterProfile } from '../types';

export class CharacterImportanceEngine {
  static calculateImportance(profiles: CharacterProfile[], totalBookLength: number): CharacterProfile[] {
    if (profiles.length === 0) return profiles;

    let maxMentions = 1;
    for (const p of profiles) {
      if (p.mentionCount > maxMentions) maxMentions = p.mentionCount;
    }

    return profiles.map(p => {
      // 1. Frequency ratio (relative to most mentioned character)
      const frequencyScore = Math.min(1.0, p.mentionCount / maxMentions);
      
      // 2. Narrative Spread (first vs last appearance)
      const spread = (p.lastAppearance - p.firstAppearance) / (totalBookLength || 1);
      const spreadScore = Math.min(1.0, Math.max(0, spread));

      // Weights: Frequency is 60% importance, Narrative spread is 40%
      const importanceScore = (frequencyScore * 0.6) + (spreadScore * 0.4);

      return {
        ...p,
        importanceScore: Math.min(1.0, Math.max(0.0, importanceScore))
      };
    }).sort((a, b) => b.importanceScore - a.importanceScore);
  }
}
