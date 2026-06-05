import { Dialogue, DialogueBoundary } from '../types';

export class DialogueBoundaryEngine {
  static sanitizeBoundaries(dialogues: Dialogue[], totalLength: number): Dialogue[] {
    // 1. Sort by start position
    dialogues.sort((a, b) => a.boundary.startPosition - b.boundary.startPosition);

    // 2. Resolve Overlaps (Keep higher confidence)
    const sanitized: Dialogue[] = [];
    for (let i = 0; i < dialogues.length; i++) {
      const current = dialogues[i];
      
      if (sanitized.length === 0) {
        sanitized.push(current);
        continue;
      }
      
      const last = sanitized[sanitized.length - 1];
      
      if (current.boundary.startPosition < last.boundary.endPosition) {
         // Overlap detected.
         if (current.confidenceScore > last.confidenceScore) {
            sanitized[sanitized.length - 1] = current;
         }
      } else {
         sanitized.push(current);
      }
    }

    return sanitized;
  }
}
