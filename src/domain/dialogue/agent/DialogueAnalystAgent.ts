import { DialogueAgentWorkflow } from './DialogueAgentWorkflow';
import { DialogueDetectionEngine } from '../detection/DialogueDetectionEngine';
import { DialogueAgentResult } from './types';
import { IDialogueRepository } from '../interfaces/IDialogueRepository';
import { supabaseAdmin } from '@/lib/supabase';

export class DialogueAnalystAgent {
  private workflow: DialogueAgentWorkflow;

  constructor(private repository: IDialogueRepository) {
    const detectionEngine = new DialogueDetectionEngine();
    this.workflow = new DialogueAgentWorkflow(detectionEngine);
  }

  async runAnalysis(text: string, bookId: string, chapterId: string, traceId: string, knownCharacters: { id: string; names: string[] }[]): Promise<DialogueAgentResult> {
     console.log(`[DialogueAnalystAgent] Starting analysis for chapter ${chapterId}`);
     
     const result = await this.workflow.execute(text, bookId, chapterId, traceId, knownCharacters);

     // Agent is responsible for orchestrating the persistence of memory and state
     await this.persistAgentState(result, bookId);

     console.log(`[DialogueAnalystAgent] Completed analysis with Memory Continuity Score: ${result.memoryReport.memoryContinuityScore}`);
     return result;
  }

  private async persistAgentState(result: DialogueAgentResult, bookId: string): Promise<void> {
     // Persist State
     const stateRows = Array.from(result.states.values()).map(s => ({
        conversation_id: s.conversationId,
        state: s.state,
        updated_at: new Date(s.updatedAt).toISOString()
     }));

     if (stateRows.length > 0) {
        await supabaseAdmin().from('conversation_states').insert(stateRows);
     }

     // Persist Memory
     const memoryRows = Array.from(result.memories.entries()).map(([convId, m]) => ({
        book_id: bookId,
        conversation_id: convId,
        current_speaker_id: m.currentSpeakerId || null,
        current_listener_id: m.currentListenerId || null,
        turn_count: m.turnCount,
        last_dialogue_id: m.lastDialogueId || null,
        memory_snapshot: m.snapshot
     }));

     if (memoryRows.length > 0) {
        await supabaseAdmin().from('conversation_memories').insert(memoryRows);
     }

     // Persist Long Range References
     const lrrRows = result.longRangeReferences.map(r => ({
        source_dialogue_id: r.sourceDialogueId,
        target_dialogue_id: r.targetDialogueId || null,
        target_conversation_id: r.targetConversationId || null,
        confidence_score: r.referenceConfidence,
        reference_distance: r.referenceDistance,
        evidence: r.evidence
     }));

     if (lrrRows.length > 0) {
        await supabaseAdmin().from('long_range_references').insert(lrrRows);
     }

     // Persist Report
     await supabaseAdmin().from('dialogue_memory_reports').insert({
        book_id: bookId,
        trace_id: result.traceId,
        memory_continuity_score: result.memoryReport.memoryContinuityScore,
        long_range_recall: result.memoryReport.longRangeConsistencyScore,
        report_data: result.memoryReport
     });
  }
}
