import { Conversation, Dialogue } from '../types';
import { DialogueTimeline, DialogueEvent } from '../agent/types';

export class ConversationTimelineEngine {
  static generateTimeline(conversation: Conversation, dialogues: Dialogue[]): DialogueTimeline {
     const convDialogues = dialogues.filter(d => d.conversationId === conversation.id)
                                    .sort((a,b) => a.boundary.startPosition - b.boundary.startPosition);
     
     const events: DialogueEvent[] = [];
     
     for (const d of convDialogues) {
        if (d.speaker) {
           events.push({
              type: 'SPEAKER_ACTIVE',
              dialogueId: d.id,
              timestamp: d.boundary.startPosition
           });
        }
     }

     return {
        conversationId: conversation.id,
        startTime: conversation.boundary.startPosition,
        endTime: conversation.boundary.endPosition,
        events
     };
  }
}
