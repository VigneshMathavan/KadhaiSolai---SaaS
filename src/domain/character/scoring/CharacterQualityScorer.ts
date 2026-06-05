import { CharacterProfile, CharacterRelationship, CharacterTimeline } from '../types';

export class CharacterQualityScorer {
  static score(profiles: CharacterProfile[], relationships: CharacterRelationship[], timelines: CharacterTimeline[]): number {
    if (profiles.length === 0) return 0.0;

    let identityScore = 0;
    let aliasScore = 0;
    let relationshipScore = relationships.length > 0 ? 0.8 : 0.4;
    
    for (const p of profiles) {
      identityScore += p.confidenceScore;
      if (p.aliases.length > 0) aliasScore += 0.8;
      else aliasScore += 0.5; // Neutral
    }

    identityScore /= profiles.length;
    aliasScore /= profiles.length;

    // Timeline consistency
    const timelineScore = timelines.length > 0 ? 0.9 : 0.3;

    // Weights
    return (identityScore * 0.4) + (aliasScore * 0.2) + (relationshipScore * 0.2) + (timelineScore * 0.2);
  }
}
