import { TransitionDirective } from '../types';
import { randomUUID } from 'crypto';

export class TransitionEngine {
  static planTransition(directiveId: string, fromMood: string, toMood: string): TransitionDirective {
    let transitionType: 'ABRUPT' | 'FADE' | 'SILENCE' | 'BUILDUP' = 'FADE';
    let durationMs = 1000;

    if (fromMood !== toMood) {
       if ((fromMood === 'suspenseful' || fromMood === 'FEAR') && (toMood === 'ANGER' || toMood === 'PANIC')) {
          transitionType = 'ABRUPT';
          durationMs = 200;
       } else if (toMood === 'tragic' || toMood === 'GRIEF') {
          transitionType = 'SILENCE';
          durationMs = 3000; // Long reflective silence
       } else if (toMood === 'suspenseful' || toMood === 'FEAR') {
          transitionType = 'BUILDUP';
          durationMs = 2000;
       }
    }

    return {
       id: randomUUID(),
       directiveId,
       transitionType,
       durationMs
    };
  }
}
