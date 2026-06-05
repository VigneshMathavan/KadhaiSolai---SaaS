import { Dialogue, Conversation } from '../types';
import { randomUUID } from 'crypto';

export class ConversationEngine {
  static group(dialogues: Dialogue[], bookId: string, chapterId: string): Conversation[] {
    const conversations: Conversation[] = [];
    
    if (dialogues.length === 0) return conversations;

    // Sort by position
    const sorted = [...dialogues].sort((a, b) => a.boundary.startPosition - b.boundary.startPosition);
    
    let currentConversation: Partial<Conversation> = {
      id: randomUUID(), bookId, chapterId,
      boundary: { startPosition: sorted[0].boundary.startPosition, endPosition: sorted[0].boundary.endPosition },
      participants: [], turns: [], confidenceScore: 0.9
    };
    
    let turnIndex = 1;

    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i];
      
      // Add turn
      d.conversationId = currentConversation.id;
      currentConversation.turns!.push({ dialogueId: d.id, turnIndex: turnIndex++ });
      currentConversation.boundary!.endPosition = d.boundary.endPosition;
      
      if (d.speaker && !currentConversation.participants!.find((p: any) => p.characterId === d.speaker!.characterId)) {
         currentConversation.participants!.push({ characterId: d.speaker.characterId });
      }

      // If gap is greater than 1000 chars, break conversation
      if (i < sorted.length - 1) {
         const next = sorted[i+1];
         if (next.boundary.startPosition - d.boundary.endPosition > 1000) {
            conversations.push(currentConversation as Conversation);
            currentConversation = {
              id: randomUUID(), bookId, chapterId,
              boundary: { startPosition: next.boundary.startPosition, endPosition: next.boundary.endPosition },
              participants: [], turns: [], confidenceScore: 0.9
            };
            turnIndex = 1;
         }
      }
    }
    
    if (currentConversation.turns!.length > 0) {
       conversations.push(currentConversation as Conversation);
    }

    return conversations;
  }
}
