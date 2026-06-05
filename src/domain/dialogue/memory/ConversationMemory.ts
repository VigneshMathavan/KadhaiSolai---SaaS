import { Dialogue, Conversation } from '../types';
import { DialogueMemory, ConversationSnapshot } from '../agent/types';

export class ConversationMemoryEngine {
  static buildMemory(conversations: Conversation[], dialogues: Dialogue[]): Map<string, DialogueMemory> {
    const memories = new Map<string, DialogueMemory>();

    for (const c of conversations) {
       const convDialogues = dialogues.filter(d => d.conversationId === c.id);
       
       if (convDialogues.length === 0) continue;

       const lastDialogue = convDialogues[convDialogues.length - 1];
       
       const snapshot: ConversationSnapshot = {
          timestamp: Date.now(),
          participants: c.participants.map((p: any) => p.characterId),
          topicContinuityScore: 0.8
       };

       memories.set(c.id, {
          currentSpeakerId: lastDialogue.speaker?.characterId,
          currentListenerId: lastDialogue.listeners.length > 0 ? lastDialogue.listeners[0].characterId : undefined,
          turnCount: c.turns.length,
          lastDialogueId: lastDialogue.id,
          snapshot
       });
    }

    return memories;
  }
}
