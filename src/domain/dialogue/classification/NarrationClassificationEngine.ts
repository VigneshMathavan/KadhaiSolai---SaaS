import { Dialogue, NarrationSegment } from '../types';
import { randomUUID } from 'crypto';

export class NarrationClassificationEngine {
  static classify(text: string, dialogues: Dialogue[], bookId: string, chapterId: string): NarrationSegment[] {
    const narrations: NarrationSegment[] = [];
    
    // Sort dialogues by position
    const sorted = [...dialogues].sort((a, b) => a.boundary.startPosition - b.boundary.startPosition);
    
    let currentPos = 0;
    
    for (const d of sorted) {
      if (d.boundary.startPosition > currentPos) {
         const segmentText = text.substring(currentPos, d.boundary.startPosition).trim();
         if (segmentText.length > 0) {
            narrations.push({
              id: randomUUID(),
              bookId, chapterId,
              narrationText: segmentText,
              boundary: { startPosition: currentPos, endPosition: d.boundary.startPosition }
            });
         }
      }
      currentPos = Math.max(currentPos, d.boundary.endPosition);
    }
    
    // Final tail
    if (currentPos < text.length) {
       const segmentText = text.substring(currentPos).trim();
       if (segmentText.length > 0) {
         narrations.push({
           id: randomUUID(),
           bookId, chapterId,
           narrationText: segmentText,
           boundary: { startPosition: currentPos, endPosition: text.length }
         });
       }
    }
    
    return narrations;
  }
}
