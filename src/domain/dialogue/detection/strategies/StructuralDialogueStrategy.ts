import { DialogueDetectionStrategy } from './DialogueDetectionStrategy';
import { DialogueCandidate, Dialogue } from '../../types';

export class StructuralDialogueStrategy implements DialogueDetectionStrategy {
  name = 'StructuralDialogueStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<DialogueCandidate> {
    const dialogues: Dialogue[] = [];
    // Detects isolated short lines that are characteristic of rapid-fire dialogue
    // without attribution (often seen in fast-paced storytelling).
    return { dialogues };
  }
}
