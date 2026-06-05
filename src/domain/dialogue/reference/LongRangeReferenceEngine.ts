import { Dialogue, Conversation } from '../types';
import { LongRangeReference } from '../agent/types';
import { randomUUID } from 'crypto';

export class LongRangeReferenceEngine {
  static extractReferences(dialogues: Dialogue[], conversations: Conversation[], fullText: string): LongRangeReference[] {
    const references: LongRangeReference[] = [];
    
    // Identifies phrases that imply recalling past conversation.
    const referenceKeywords = [
       'like i said earlier', 'as i warned you', 'remember what happened',
       'நான் ஏற்கனவே சொன்னேன்', 'நினைவிருக்கிறதா', 'சொன்னபடி'
    ];

    for (let i = 0; i < dialogues.length; i++) {
       const curr = dialogues[i];
       const textLower = curr.dialogueText.toLowerCase();

       for (const keyword of referenceKeywords) {
          if (textLower.includes(keyword)) {
             // Look backwards for a matching conversation with the same speaker/listener pair
             // within the last 50000 characters.
             let targetConv: Conversation | undefined;
             let distance = 0;

             for (let j = i - 1; j >= 0; j--) {
                const prev = dialogues[j];
                const gap = curr.boundary.startPosition - prev.boundary.endPosition;
                
                if (gap > 50000) break; // Lookback window limit
                
                // If it's a different conversation and speaker is involved
                if (prev.conversationId && prev.conversationId !== curr.conversationId) {
                   if (prev.speaker?.characterId === curr.speaker?.characterId) {
                      targetConv = conversations.find(c => c.id === prev.conversationId);
                      distance = gap;
                      break;
                   }
                }
             }

             if (targetConv) {
                references.push({
                   sourceDialogueId: curr.id,
                   targetConversationId: targetConv.id,
                   referenceConfidence: 0.85,
                   referenceDistance: distance,
                   evidence: keyword
                });
             }
          }
       }
    }

    return references;
  }
}
