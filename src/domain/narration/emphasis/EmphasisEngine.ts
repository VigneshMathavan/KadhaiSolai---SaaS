import { EmphasisDirective } from '../types';
import { randomUUID } from 'crypto';

export class EmphasisEngine {
  static planEmphasis(text: string, directiveId: string): EmphasisDirective[] {
    const emphasis: EmphasisDirective[] = [];
    
    // Look for capitalized words (names) or heavily punctuated emotional words
    // Basic implementation for Phase 5 structure
    const words = text.split(/\s+/);
    let offset = 0;

    for (const word of words) {
       const startPosition = text.indexOf(word, offset);
       const endPosition = startPosition + word.length;
       offset = endPosition;

       if (word.includes('!') || word.toUpperCase() === word && word.length > 3) {
          emphasis.push({
             id: randomUUID(),
             directiveId,
             startPosition,
             endPosition,
             emphasisLevel: 1.5,
             emphasisType: 'EMOTIONAL'
          });
       }
    }

    return emphasis;
  }
}
