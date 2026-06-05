import { DirectorDecision, ProductionReasoning } from '../types';
import { randomUUID } from 'crypto';

export class DirectorDecisionEngine {
  static makeDecision(planId: string, decisionType: string, reasoningText: string): DirectorDecision {
    const reasoning: ProductionReasoning = {
       explanation: reasoningText,
       evidence: []
    };

    return {
       id: randomUUID(),
       planId,
       decisionType,
       confidence: 0.95,
       reasoning,
       evidence: []
    };
  }
}
