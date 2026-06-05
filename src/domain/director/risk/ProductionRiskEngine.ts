import { ProductionRisk } from '../types';
import { randomUUID } from 'crypto';

export class ProductionRiskEngine {
  static analyzeRisks(planId: string, castingPlans: any[]): ProductionRisk[] {
    const risks: ProductionRisk[] = [];

    // Arbitrary risk: too many distinct voice archetypes might break small TTS models
    const uniqueVoices = new Set(castingPlans.map(c => c.voiceArchetype)).size;
    if (uniqueVoices > 10) {
       risks.push({
          id: randomUUID(),
          planId,
          riskType: 'VOICE_OVERLOAD',
          severity: 0.7,
          description: `Extremely high number of distinct voice actors required (${uniqueVoices}).`,
          mitigation: 'Consider coalescing minor characters into a generic Narrator voice.'
       });
    }

    return risks;
  }
}
