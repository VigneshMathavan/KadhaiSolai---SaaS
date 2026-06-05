import { EmotionState, WeightedEmotionEvidence } from '../types';

export class EmotionWeightingEngine {
  static assignWeights(emotions: EmotionState[]): WeightedEmotionEvidence[] {
    const weighted: WeightedEmotionEvidence[] = [];

    // Group overlapping emotions by position for resolution
    for (const e of emotions) {
       // Base weighting configuration
       let lexW = 1.0, diagW = 1.0, ctxW = 1.0, relW = 1.0, memW = 1.0, narW = 1.0;

       // Increase weight for context and memory as they represent deeper intelligence
       const sourceType = e.reasoning.evidence.length > 0 ? e.reasoning.evidence[0].sourceType : 'LEXICAL';
       
       if (sourceType === 'MEMORY') memW = 1.5;
       if (sourceType === 'RELATIONSHIP') relW = 1.3;
       if (sourceType === 'CONTEXT') ctxW = 1.2;
       if (sourceType === 'DIALOGUE') diagW = 1.1;
       if (sourceType === 'NARRATIVE') narW = 1.1;
       
       const multiplier = (sourceType === 'MEMORY' ? memW :
                           sourceType === 'RELATIONSHIP' ? relW :
                           sourceType === 'CONTEXT' ? ctxW :
                           sourceType === 'DIALOGUE' ? diagW :
                           sourceType === 'NARRATIVE' ? narW : lexW);

       weighted.push({
          emotionType: e.emotionType,
          baseConfidence: e.confidenceScore,
          weightedConfidence: Math.min(1.0, e.confidenceScore * multiplier),
          breakdown: {
             lexicalWeight: lexW,
             dialogueWeight: diagW,
             contextWeight: ctxW,
             relationshipWeight: relW,
             memoryWeight: memW,
             narrativeWeight: narW
          },
          evidence: e.reasoning.evidence
       });
    }

    return weighted;
  }
}
