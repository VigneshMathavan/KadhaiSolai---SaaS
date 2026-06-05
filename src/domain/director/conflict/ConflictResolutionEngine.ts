import { PerformanceConflict, ConflictResolution } from '../types';

export class ConflictResolutionEngine {
  static resolve(conflicts: PerformanceConflict[]): ConflictResolution[] {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
       let winningLayer = conflict.layerA;
       let strategy = 'DEFAULT_OVERRIDE';
       let reasoning = 'Layer A naturally overrides Layer B due to hierarchy.';

       if (conflict.conflictType === 'PACING_MISMATCH') {
          // Generally trust emotion over baseline narration speed in intense scenes
          winningLayer = 'EMOTION_INTELLIGENCE';
          strategy = 'BOOST_PACING_TO_MATCH_EMOTION';
          reasoning = 'Emotional authenticity supersedes default narrative pacing speed.';
       } else if (conflict.conflictType === 'VOICE_DRIFT') {
          winningLayer = 'GLOBAL_CONSISTENCY';
          strategy = 'FORCE_ORIGINAL_ARCHETYPE';
          reasoning = 'Audiobook continuity requires stable voice casting across the entire project.';
       }

       resolutions.push({
          conflictId: conflict.id,
          winningLayer,
          resolutionStrategy: strategy,
          reasoning
       });
    }

    return resolutions;
  }
}
