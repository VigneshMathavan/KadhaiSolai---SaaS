import { DialogueDetectionStrategy } from './DialogueDetectionStrategy';
import { DialogueCandidate, Dialogue } from '../../types';
import { randomUUID } from 'crypto';

export class QuotationStrategy implements DialogueDetectionStrategy {
  name = 'QuotationStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<DialogueCandidate> {
    const dialogues: Dialogue[] = [];
    
    // Covers standard quotes, smart quotes, Tamil quotation styles, guillemets
    // Example: "Hello", “Hello”, «Hello»
    const regex = /([\"\'\u201C\u201D\u00AB\u00BB\u2018\u2019])([\s\S]*?)\1/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const dialogueText = match[2].trim();
      
      // Filter out empty quotes or single characters
      if (dialogueText.length > 1) {
        const startPosition = match.index;
        const endPosition = match.index + match[0].length;
        
        dialogues.push({
          id: randomUUID(),
          bookId,
          chapterId,
          dialogueText,
          boundary: { startPosition, endPosition },
          listeners: [],
          segments: [{
            segmentText: dialogueText,
            boundary: { startPosition: startPosition + 1, endPosition: endPosition - 1 }
          }],
          context: {
            precedingText: text.substring(Math.max(0, startPosition - 50), startPosition),
            succeedingText: text.substring(endPosition, Math.min(text.length, endPosition + 50))
          },
          confidenceScore: 0.95,
          detectionStrategy: this.name
        });
      }
    }

    return { dialogues };
  }
}
