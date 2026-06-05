import { Dialogue, Conversation, NarrationSegment } from '../types';

export interface IDialogueRepository {
  saveDialogues(dialogues: Dialogue[]): Promise<void>;
  saveConversations(conversations: Conversation[]): Promise<void>;
  saveNarrationSegments(segments: NarrationSegment[]): Promise<void>;
  clearChapterData(chapterId: string): Promise<void>;
}
