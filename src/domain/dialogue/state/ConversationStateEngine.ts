import { Conversation } from '../types';
import { ConversationState } from '../agent/types';

export class ConversationStateEngine {
  static evaluateStates(conversations: Conversation[]): Map<string, ConversationState> {
    const states = new Map<string, ConversationState>();

    for (const c of conversations) {
      // In a multi-pass audiobook agent, we evaluate gaps between turns.
      // If a gap > 1000 characters, it might be INTERRUPTED or ENDED.
      // For a single batch pass, we initialize states based on structural completeness.
      
      let stateType: 'STARTED' | 'ACTIVE' | 'INTERRUPTED' | 'PAUSED' | 'RESUMED' | 'ENDED' | 'ABANDONED' = 'ACTIVE';

      if (c.turns.length === 1) stateType = 'STARTED';
      if (c.turns.length > 5) stateType = 'ACTIVE';

      // Very simple heuristic: if participants list is small but turns are many, it's highly active.
      
      states.set(c.id, {
         conversationId: c.id,
         state: stateType,
         updatedAt: Date.now()
      });
    }

    return states;
  }
}
