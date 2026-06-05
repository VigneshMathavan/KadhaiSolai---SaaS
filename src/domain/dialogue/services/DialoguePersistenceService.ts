import { IDialogueRepository } from '../interfaces/IDialogueRepository';
import { DialogueDetectionResult } from '../types';

export class DialoguePersistenceService {
  constructor(private readonly repository: IDialogueRepository) {}

  async saveDetectionResult(result: DialogueDetectionResult, chapterId: string, traceId: string): Promise<void> {
    if (!result.success || result.dialogues.length === 0) return;

    try {
      // Clear old passes
      await this.repository.clearChapterData(chapterId);

      // Save Dialogues FIRST (Conversations rely on dialogues? Actually Conversations are parent)
      // Wait, DB schema: dialogues references conversation_id on delete cascade.
      // So we must insert conversations first.
      await this.repository.saveConversations(result.conversations);

      // Then Dialogues
      await this.repository.saveDialogues(result.dialogues);

      console.log(JSON.stringify({ event: 'DialoguePersistenceSuccess', traceId, chapterId }));
    } catch (error: any) {
      console.error(JSON.stringify({ event: 'DialoguePersistenceFailed', traceId, chapterId, error: error.message }));
      throw error;
    }
  }
}
