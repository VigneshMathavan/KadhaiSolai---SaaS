import { DialogueDetectionStrategy } from './DialogueDetectionStrategy';
import { DialogueCandidate, Dialogue } from '../../types';

export class ConversationPatternStrategy implements DialogueDetectionStrategy {
  name = 'ConversationPatternStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<DialogueCandidate> {
    const dialogues: Dialogue[] = [];
    // Relies on back-and-forth structural clustering from other strategies,
    // hence typically runs in fusion stage or infers unquoted text embedded between quotes.
    return { dialogues };
  }
}
