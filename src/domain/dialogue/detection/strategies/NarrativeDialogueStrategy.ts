import { DialogueDetectionStrategy } from './DialogueDetectionStrategy';
import { DialogueCandidate, Dialogue } from '../../types';
import { randomUUID } from 'crypto';

export class NarrativeDialogueStrategy implements DialogueDetectionStrategy {
  name = 'NarrativeDialogueStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<DialogueCandidate> {
    const dialogues: Dialogue[] = [];
    
    // Detects dialogue formatted without quotes but marked by long dashes
    // Example: — How are you?
    const regex = /^[—\-\u2014]\s*(.+)$/gm;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const dialogueText = match[1].trim();
      
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
            boundary: { startPosition: startPosition + match[0].indexOf(dialogueText), endPosition }
          }],
          context: {
            precedingText: text.substring(Math.max(0, startPosition - 50), startPosition),
            succeedingText: text.substring(endPosition, Math.min(text.length, endPosition + 50))
          },
          confidenceScore: 0.85,
          detectionStrategy: this.name
        });
      }
    }

    return { dialogues };
  }
}
