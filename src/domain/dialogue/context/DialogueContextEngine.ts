import { Dialogue, Conversation } from '../types';
import { DialogueContextScore } from '../agent/types';

export class DialogueContextEngine {
  static evaluateContext(conversations: Conversation[], dialogues: Dialogue[]): DialogueContextScore {
    let contextRetention = 0;
    let speakerContinuity = 0;
    let listenerContinuity = 0;
    let totalDialogues = 0;

    for (const c of conversations) {
       const convDialogues = dialogues.filter(d => d.conversationId === c.id);
       totalDialogues += convDialogues.length;

       for (let i = 1; i < convDialogues.length; i++) {
          const prev = convDialogues[i-1];
          const curr = convDialogues[i];

          // Are they responding to each other?
          if (curr.speaker && prev.listeners.find((l: any) => l.characterId === curr.speaker!.characterId)) {
             speakerContinuity += 1;
             contextRetention += 1;
          }
          if (curr.listeners.length > 0 && prev.speaker && curr.listeners.find((l: any) => l.characterId === prev.speaker!.characterId)) {
             listenerContinuity += 1;
             contextRetention += 1;
          }
       }
    }

    // Normalize
    const normalizationFactor = Math.max(1, totalDialogues - conversations.length);

    return {
      contextRetention: contextRetention / normalizationFactor,
      speakerContinuity: speakerContinuity / normalizationFactor,
      listenerContinuity: listenerContinuity / normalizationFactor
    };
  }
}
