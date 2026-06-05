import { Dialogue, Conversation } from '../types';
import { ConversationState, DialogueMemory, LongRangeReference } from '../agent/types';

export class DialogueValidationService {
  static validate(dialogues: Dialogue[], conversations: Conversation[], totalLength: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    let totalCoverage = 0;
    let prevEnd = 0;

    for (const d of dialogues) {
      if (d.boundary.startPosition >= d.boundary.endPosition) {
         errors.push(`Invalid boundary for dialogue ${d.id}`);
      }
      if (d.boundary.startPosition < prevEnd) {
         errors.push(`Overlap detected at position ${d.boundary.startPosition}`);
      }
      prevEnd = d.boundary.endPosition;
      totalCoverage += (d.boundary.endPosition - d.boundary.startPosition);
    }

    if (totalCoverage > totalLength) {
       errors.push('Dialogue bounds exceed total chapter length.');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateAgentState(
     states: Map<string, ConversationState>,
     memories: Map<string, DialogueMemory>,
     references: LongRangeReference[]
  ): { valid: boolean; errors: string[] } {
     const errors: string[] = [];

     for (const [id, state] of Array.from(states.entries())) {
        if (!state.state) errors.push(`Missing state for conversation ${id}`);
     }

     for (const [id, memory] of Array.from(memories.entries())) {
        if (memory.turnCount < 1) errors.push(`Invalid memory turn count for conversation ${id}`);
     }

     for (const ref of references) {
        if (ref.referenceDistance < 0) errors.push(`Negative reference distance for source dialogue ${ref.sourceDialogueId}`);
     }

     return { valid: errors.length === 0, errors };
  }
}
