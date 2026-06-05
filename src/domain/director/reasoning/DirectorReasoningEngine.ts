import { ProductionReasoning } from '../types';

export class DirectorReasoningEngine {
  static buildReasoning(decisionType: string, rationale: string): ProductionReasoning {
    return {
       explanation: `[${decisionType}] ${rationale}`,
       evidence: []
    };
  }
}
