import { DialogueCandidate } from '../../types';

export interface DialogueDetectionStrategy {
  name: string;
  detect(text: string, bookId: string, chapterId: string): Promise<DialogueCandidate>;
}
