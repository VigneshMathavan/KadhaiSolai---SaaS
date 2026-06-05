import { EmotionState, EmotionTransition, PerformanceDirective, EmotionTimeline } from '../types';

export class EmotionValidationService {
  static validate(emotions: EmotionState[], transitions: EmotionTransition[], totalLength: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const e of emotions) {
       if (e.startPosition < 0 || e.endPosition > totalLength) {
          errors.push(`Emotion out of bounds at pos ${e.startPosition}`);
       }
       if (e.intensity.level < 0 || e.intensity.level > 1) {
          errors.push(`Invalid intensity level ${e.intensity.level}`);
       }
    }

    for (const t of transitions) {
       if (t.transitionTimestamp < 0 || t.transitionTimestamp > totalLength) {
          errors.push(`Transition timestamp out of bounds at pos ${t.transitionTimestamp}`);
       }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateExtended(directives: PerformanceDirective[], timelines: EmotionTimeline[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const d of directives) {
       if (d.energyLevel < 0 || d.energyLevel > 1.0) errors.push(`Invalid directive energy level ${d.energyLevel}`);
       if (d.voiceTension < 0 || d.voiceTension > 1.0) errors.push(`Invalid directive tension level ${d.voiceTension}`);
    }

    for (const t of timelines) {
       if (t.events.length === 0) errors.push(`Empty timeline array for target ${t.targetId}`);
    }

    return { valid: errors.length === 0, errors };
  }
}
