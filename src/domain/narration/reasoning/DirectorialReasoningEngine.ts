import { IntentReasoning, IntentEvidence } from '../types';

export class DirectorialReasoningEngine {
  static buildExplanation(intent: string, pacingScore: number, importanceScore: number): IntentReasoning {
    const evidence: IntentEvidence[] = [
       { sourceType: 'PACING', evidenceText: `Pacing multiplier set to ${pacingScore}` },
       { sourceType: 'IMPORTANCE', evidenceText: `Scene rated ${importanceScore} for narrative impact` }
    ];

    let explanation = `The director has chosen to ${intent} primarily because of the scene's calculated narrative weight.`;

    if (pacingScore > 1.2) {
       explanation += ' The accelerated pacing reinforces this intensity.';
    } else if (pacingScore < 0.9) {
       explanation += ' The deliberate, slowed pacing forces the listener to absorb the moment.';
    }

    return { explanation, evidence };
  }
}
