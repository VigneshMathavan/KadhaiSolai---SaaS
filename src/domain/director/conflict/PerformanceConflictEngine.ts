import { PerformanceConflict } from '../types';
import { randomUUID } from 'crypto';

export class PerformanceConflictEngine {
  static detectConflicts(narrationPace: string, emotionIntensity: number, sceneIntent: string): PerformanceConflict[] {
    const conflicts: PerformanceConflict[] = [];

    // Example: Emotion dictates high intensity but Narration pace is very slow and intent is suspense
    if (emotionIntensity > 0.8 && narrationPace === 'SLOW' && sceneIntent === 'Build Fear') {
       conflicts.push({
          id: randomUUID(),
          layerA: 'EMOTION_INTELLIGENCE',
          layerB: 'NARRATION_INTELLIGENCE',
          conflictType: 'PACING_MISMATCH',
          severity: 0.8,
          description: 'High emotion intensity conflicts with slow narration pace during a fear-building scene.'
       });
    }

    return conflicts;
  }
}
