import { CharacterProfile, CharacterRelationship } from '../types';

export class CharacterValidationService {
  static validate(profiles: CharacterProfile[], relationships: CharacterRelationship[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const names = new Set<string>();
    for (const p of profiles) {
      if (names.has(p.normalizedName)) {
        errors.push(`Duplicate character detected: ${p.name}`);
      }
      names.add(p.normalizedName);

      for (const a of p.aliases) {
        if (a.aliasName === p.name) {
           errors.push(`Alias collision: Character ${p.name} has identical alias.`);
        }
      }
    }

    // Relationship loops and consistency
    for (const rel of relationships) {
       if (rel.characterAId === rel.characterBId) {
         errors.push(`Self-referencing relationship loop detected for ID: ${rel.characterAId}`);
       }
       
       if (rel.directionality === 'BIDIRECTIONAL') {
          // Verify it's sorted A-B if bidirectional for graph integrity
          if (rel.characterAId > rel.characterBId) {
             errors.push(`Bidirectional edge not sorted canonically: ${rel.characterAId} -> ${rel.characterBId}`);
          }
       }
       
       if (rel.frequency < 1) {
          errors.push(`Relationship frequency cannot be < 1.`);
       }
    }

    return { valid: errors.length === 0, errors };
  }
}
