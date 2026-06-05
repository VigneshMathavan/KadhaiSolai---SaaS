import { EmotionAgentResult } from '../types';
import { EmotionAgentWorkflow } from './EmotionAgentWorkflow';
import { IEmotionRepository } from '../interfaces/IEmotionRepository';
import { EmotionConfidenceFusionEngine } from '../fusion/EmotionConfidenceFusionEngine';
import { LexicalEmotionStrategy } from '../detection/strategies/LexicalEmotionStrategy';
import { DialogueEmotionStrategy } from '../detection/strategies/DialogueEmotionStrategy';
import { ContextEmotionStrategy } from '../detection/strategies/ContextEmotionStrategy';
import { RelationshipEmotionStrategy } from '../detection/strategies/RelationshipEmotionStrategy';
import { MemoryEmotionStrategy } from '../detection/strategies/MemoryEmotionStrategy';
import { NarrativeEmotionStrategy } from '../detection/strategies/NarrativeEmotionStrategy';

export class EmotionDirectorAgent {
  private workflow: EmotionAgentWorkflow;

  constructor(private repository: IEmotionRepository) {
    const fusion = new EmotionConfidenceFusionEngine(
       new LexicalEmotionStrategy(),
       new DialogueEmotionStrategy(),
       new ContextEmotionStrategy(),
       new RelationshipEmotionStrategy(),
       new MemoryEmotionStrategy(),
       new NarrativeEmotionStrategy()
    );
    this.workflow = new EmotionAgentWorkflow(fusion);
  }

  async executeChapterAnalysis(text: string, bookId: string, chapterId: string, traceId: string, contextData: any): Promise<EmotionAgentResult> {
    console.log(`[EmotionDirectorAgent] Starting emotion extraction for chapter ${chapterId}`);

    const result = await this.workflow.execute(text, bookId, chapterId, traceId, contextData);

    if (result.success) {
       await this.persistResult(result, chapterId);
    }

    console.log(`[EmotionDirectorAgent] Completed with Quality Score: ${result.qualityReport.qualityScore}`);
    return result;
  }

  private async persistResult(result: EmotionAgentResult, chapterId: string): Promise<void> {
    await this.repository.clearChapterEmotions(chapterId);
    await this.repository.saveEmotions(result.emotions);
    await this.repository.saveProfiles(result.profiles);
    await this.repository.saveTransitions(result.transitions);
    await this.repository.saveDirectives(result.directives);
    await this.repository.saveTimelines(result.timelines);
    await this.repository.saveQualityReport(result.qualityReport);
  }
}
