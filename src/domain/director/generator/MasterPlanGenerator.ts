import { AudiobookMasterPlan, GlobalObjectives, ContinuityRule } from '../types';
import { randomUUID } from 'crypto';

export class MasterPlanGenerator {
  static generate(bookId: string, overallIntent: string): AudiobookMasterPlan {
    const globalObjectives: GlobalObjectives = {
       artisticVision: overallIntent,
       targetPacing: 'DYNAMIC',
       targetIntensity: 'DYNAMIC'
    };

    const continuityRules: ContinuityRule[] = [
       { type: 'VOICE', rule: 'Voice archetype must remain strictly locked per characterId across all chapters.' }
    ];
    
    const performanceRules: ContinuityRule[] = [
       { type: 'EMOTION', rule: 'Emotional spikes > 0.8 intensity must force a pacing recalculation.' }
    ];

    const qualityRules: ContinuityRule[] = [
       { type: 'VALIDATION', rule: 'TTS outputs must pass boundary thresholds before final audio merge.' }
    ];

    return {
       id: randomUUID(),
       bookId,
       version: 1,
       globalObjectives,
       continuityRules,
       performanceRules,
       qualityRules
    };
  }
}
