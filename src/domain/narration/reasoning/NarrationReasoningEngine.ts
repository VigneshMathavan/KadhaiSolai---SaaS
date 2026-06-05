import { NarrationReasoning } from '../types';

export class NarrationReasoningEngine {
  static buildReasoning(targetId: string, type: string, explanation: string): NarrationReasoning {
    return {
       targetId,
       reasoningType: type,
       explanation
    };
  }
}
