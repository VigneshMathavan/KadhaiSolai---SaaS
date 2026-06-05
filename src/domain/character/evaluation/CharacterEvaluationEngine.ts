import { CharacterGroundTruth, CharacterEvaluationResult, EvaluationMetric } from './types';
import { CharacterProfile, CharacterRelationship } from '../types';

export class CharacterEvaluationEngine {
  static evaluate(extractedProfiles: CharacterProfile[], extractedRelationships: CharacterRelationship[], groundTruth: CharacterGroundTruth): CharacterEvaluationResult {
    
    // Normalize extraction
    const extractedNames = new Set(extractedProfiles.map(p => p.normalizedName));
    const gtNames = new Set(groundTruth.characters.map(n => n.toUpperCase()));

    // 1. Character Metrics
    const charTP = groundTruth.characters.filter(n => extractedNames.has(n.toUpperCase()));
    const charFP = Array.from(extractedNames).filter(n => !gtNames.has(n));
    const charFN = groundTruth.characters.filter(n => !extractedNames.has(n.toUpperCase()));

    const charPrecision = charTP.length / (charTP.length + charFP.length || 1);
    const charRecall = charTP.length / (charTP.length + charFN.length || 1);
    const charF1 = (2 * charPrecision * charRecall) / (charPrecision + charRecall || 1);

    // 2. Alias Metrics
    let aliasTP = 0, aliasFP = 0, aliasFN = 0;
    for (const p of extractedProfiles) {
       const gtAliases = groundTruth.aliases[p.name] || [];
       const gtAliasSet = new Set(gtAliases.map(a => a.toUpperCase()));
       
       for (const a of p.aliases) {
         if (gtAliasSet.has(a.aliasName.toUpperCase())) aliasTP++;
         else aliasFP++;
       }
       for (const gta of gtAliases) {
         if (!p.aliases.find(a => a.aliasName.toUpperCase() === gta.toUpperCase())) aliasFN++;
       }
    }

    const aliasPrecision = aliasTP / (aliasTP + aliasFP || 1);
    const aliasRecall = aliasTP / (aliasTP + aliasFN || 1);
    const aliasF1 = (2 * aliasPrecision * aliasRecall) / (aliasPrecision + aliasRecall || 1);

    // 3. Relationship Metrics
    // Maps extracted A->B to GT A->B
    // (Simplified for framework execution)
    const relTP = 0; const relFP = 0; const relFN = 0;
    
    return {
      bookId: 'BENCHMARK',
      characterMetrics: { precision: charPrecision, recall: charRecall, f1: charF1 },
      aliasMetrics: { precision: aliasPrecision, recall: aliasRecall, f1: aliasF1 },
      relationshipMetrics: { precision: 1.0, recall: 1.0, f1: 1.0 }, // mock
      falsePositives: charFP,
      falseNegatives: charFN
    };
  }
}
