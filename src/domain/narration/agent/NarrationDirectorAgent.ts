import { NarrationAgentResult } from '../types';
import { NarrationAgentWorkflow } from './NarrationAgentWorkflow';
import { INarrationRepository } from '../interfaces/INarrationRepository';

export class NarrationDirectorAgent {
  private workflow: NarrationAgentWorkflow;

  constructor(private repository: INarrationRepository) {
    this.workflow = new NarrationAgentWorkflow();
  }

  async executeChapterNarration(text: string, bookId: string, chapterId: string, traceId: string, contextData: any): Promise<NarrationAgentResult> {
    console.log(`[NarrationDirectorAgent] Starting narration planning for chapter ${chapterId}`);

    const result = await this.workflow.execute(text, bookId, chapterId, traceId, contextData);

    if (result.success) {
       await this.persistResult(result, chapterId);
    }

    console.log(`[NarrationDirectorAgent] Completed with Quality Score: ${result.qualityReport.overallScore}`);
    return result;
  }

  private async persistResult(result: NarrationAgentResult, chapterId: string): Promise<void> {
    await this.repository.clearChapterNarration(chapterId);
    await this.repository.savePlan(result.plan);
    await this.repository.saveDirectives(result.directives);
    await this.repository.saveSceneDirectives(result.sceneDirectives);
    await this.repository.savePauseDirectives(result.pauseDirectives);
    await this.repository.saveEmphasisDirectives(result.emphasisDirectives);
    await this.repository.saveTransitionDirectives(result.transitionDirectives);
    await this.repository.saveTimeline(result.timeline);
    await this.repository.saveQualityReport(result.qualityReport);

    const readiness = (result as any)._directorReadiness;
    if (readiness) {
       await this.repository.saveNarrativeArc(readiness.arc);
       await this.repository.saveSceneGraph(readiness.sceneGraph);
       await this.repository.saveDirectorialIntent(readiness.intent);
       await this.repository.saveMomentumProfile(readiness.momentum);
       await this.repository.saveSceneImportance(readiness.importance);
    }
  }
}
