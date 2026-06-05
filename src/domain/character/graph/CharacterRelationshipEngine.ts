import { CharacterProfile, CharacterRelationship, CharacterMention } from '../types';
import { TamilRelationshipNormalizer } from './TamilRelationshipNormalizer';

export class CharacterRelationshipEngine {
  static extractRelationships(profiles: CharacterProfile[], mentions: CharacterMention[], text: string): CharacterRelationship[] {
    const relationships: CharacterRelationship[] = [];
    
    // Core English keywords fallback
    const englishKeywords = [
      { type: 'FATHER', words: ['father', 'dad'] },
      { type: 'MOTHER', words: ['mother', 'mom'] },
      { type: 'SIBLING', words: ['brother', 'sister'] },
      { type: 'FRIEND', words: ['friend'] },
      { type: 'SPOUSE', words: ['husband', 'wife'] },
      { type: 'ENEMY', words: ['enemy'] },
      { type: 'TEACHER', words: ['teacher', 'mentor'] }
    ];

    const tamilKeywords = TamilRelationshipNormalizer.getKeywords();

    // Scan consecutive mentions
    for (let i = 0; i < mentions.length - 1; i++) {
      const m1 = mentions[i];
      const m2 = mentions[i+1];
      
      if (!m1.characterId || !m2.characterId || m1.characterId === m2.characterId) continue;

      const distance = m2.startPosition - m1.endPosition;
      
      if (distance > 0 && distance < 150) {
        const gapText = text.substring(m1.endPosition, m2.startPosition).toLowerCase();
        
        let foundType = '';
        let foundDir: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL' = 'UNIDIRECTIONAL';
        
        // Check Tamil
        for (const word of tamilKeywords) {
          if (gapText.includes(word)) {
             const norm = TamilRelationshipNormalizer.normalize(word);
             foundType = norm.type;
             foundDir = norm.directionality;
             break;
          }
        }

        // Check English if Tamil not found
        if (!foundType) {
          for (const ek of englishKeywords) {
            for (const word of ek.words) {
              if (gapText.includes(word)) {
                foundType = ek.type;
                // Basic english directionality heuristic
                foundDir = ['FRIEND', 'SIBLING', 'SPOUSE', 'ENEMY'].includes(ek.type) ? 'BIDIRECTIONAL' : 'UNIDIRECTIONAL';
                break;
              }
            }
            if (foundType) break;
          }
        }

        if (foundType) {
          relationships.push({
            characterAId: m1.characterId,
            characterBId: m2.characterId,
            relationshipType: foundType,
            confidenceScore: 0.8,
            evidence: gapText.trim(),
            frequency: 1,
            directionality: foundDir,
            sourceChapters: [m1.chapterId]
          });
        }
      }
    }

    // Merge duplicate edges and sum frequency
    const uniqueMap = new Map<string, CharacterRelationship>();
    for (const rel of relationships) {
       // standardize key based on directionality
       let key = '';
       if (rel.directionality === 'BIDIRECTIONAL') {
          key = [rel.characterAId, rel.characterBId].sort().join('-') + '-' + rel.relationshipType;
       } else {
          key = rel.characterAId + '->' + rel.characterBId + '-' + rel.relationshipType;
       }

       if (uniqueMap.has(key)) {
          const existing = uniqueMap.get(key)!;
          existing.confidenceScore = Math.min(1.0, existing.confidenceScore + 0.05);
          existing.frequency += 1;
          if (!existing.sourceChapters.includes(rel.sourceChapters[0])) {
             existing.sourceChapters.push(rel.sourceChapters[0]);
          }
       } else {
          uniqueMap.set(key, rel);
       }
    }

    return Array.from(uniqueMap.values());
  }
}
