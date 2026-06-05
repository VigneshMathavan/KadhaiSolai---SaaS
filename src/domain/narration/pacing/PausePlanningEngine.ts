import { PauseDirective } from '../types';
import { randomUUID } from 'crypto';

export class PausePlanningEngine {
  static planPauses(text: string, directiveId: string): PauseDirective[] {
    const pauses: PauseDirective[] = [];
    
    // Simple sentence boundary pause logic
    const sentenceRegex = /([^.!?]+[.!?]+)/g;
    let match;
    while ((match = sentenceRegex.exec(text)) !== null) {
       const position = match.index + match[0].length;
       const durationMs = match[0].includes('?') || match[0].includes('!') ? 800 : 500;
       
       pauses.push({
          id: randomUUID(),
          directiveId,
          position,
          durationMs,
          pauseType: 'SENTENCE'
       });
    }

    // Paragraph pauses
    const paraRegex = /\n\n+/g;
    while ((match = paraRegex.exec(text)) !== null) {
       pauses.push({
          id: randomUUID(),
          directiveId,
          position: match.index,
          durationMs: 1500,
          pauseType: 'PARAGRAPH'
       });
    }

    return pauses;
  }
}
