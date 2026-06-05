import { DialogueDetectionStrategy } from './DialogueDetectionStrategy';
import { DialogueCandidate, Dialogue } from '../../types';
import { randomUUID } from 'crypto';

export class SpeakerVerbStrategy implements DialogueDetectionStrategy {
  name = 'SpeakerVerbStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<DialogueCandidate> {
    const dialogues: Dialogue[] = [];
    
    // Detects implicit dialogue followed by specific speech verbs, often unquoted in old Tamil texts.
    // Example: நான் வருவேன் என்றார் குமார்.
    const verbs = ['என்றார்', 'கூறினார்', 'சொன்னார்', 'கேட்டார்', 'பதிலளித்தார்', 'அழுதார்', 'கத்தினார்', 'முணுமுணுத்தார்', 'சிரித்தார்', 'நினைத்தார்'];
    const verbPattern = verbs.join('|');
    const regex = new RegExp(`([^\\.\\n]+)\\s+(${verbPattern})`, 'g');
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const dialogueText = match[1].trim();
      
      if (dialogueText.length > 3 && !dialogueText.includes('"')) {
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
            boundary: { startPosition, endPosition: startPosition + dialogueText.length }
          }],
          context: {
            precedingText: text.substring(Math.max(0, startPosition - 50), startPosition),
            succeedingText: text.substring(endPosition, Math.min(text.length, endPosition + 50))
          },
          confidenceScore: 0.75,
          detectionStrategy: this.name
        });
      }
    }

    return { dialogues };
  }
}
