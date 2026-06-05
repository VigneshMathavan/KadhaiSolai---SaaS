import { DialogueDetectionEngine } from '../detection/DialogueDetectionEngine';
import { ConversationMemoryEngine } from '../memory/ConversationMemory';
import { ConversationStateEngine } from '../state/ConversationStateEngine';
import { DialogueContextEngine } from '../context/DialogueContextEngine';
import { LongRangeReferenceEngine } from '../reference/LongRangeReferenceEngine';
import { DialogueMemoryScorer } from '../scoring/DialogueMemoryScorer';
import { DialogueAgentResult } from '../agent/types';

export class DialogueAgentWorkflow {
  constructor(private detectionEngine: DialogueDetectionEngine) {}

  async execute(text: string, bookId: string, chapterId: string, traceId: string, knownCharacters: { id: string; names: string[] }[]): Promise<DialogueAgentResult> {
    
    // 1. Core Detection & Attribution (Delegated to Detection Engine)
    const baseResult = await this.detectionEngine.processChapter(text, bookId, chapterId, traceId, knownCharacters);

    if (!baseResult.success) {
       throw new Error('Base dialogue detection failed');
    }

    // 2. Memory Construction
    const memories = ConversationMemoryEngine.buildMemory(baseResult.conversations, baseResult.dialogues);

    // 3. State Evaluation
    const states = ConversationStateEngine.evaluateStates(baseResult.conversations);

    // 4. Context Extraction
    const contextScore = DialogueContextEngine.evaluateContext(baseResult.conversations, baseResult.dialogues);

    // 5. Long Range Reference Extraction
    const longRangeReferences = LongRangeReferenceEngine.extractReferences(baseResult.dialogues, baseResult.conversations, text);

    // 6. Memory Quality Review
    const memoryReport = DialogueMemoryScorer.generateReport(bookId, traceId, contextScore, longRangeReferences.length > 0);

    return {
       success: true,
       dialogues: baseResult.dialogues,
       conversations: baseResult.conversations,
       memories,
       states,
       longRangeReferences,
       memoryReport,
       traceId
    };
  }
}
