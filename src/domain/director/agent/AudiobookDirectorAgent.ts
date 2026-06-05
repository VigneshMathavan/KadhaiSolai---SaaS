import { AudiobookDirectorResult } from '../types';
import { AudiobookDirectorWorkflow } from './AudiobookDirectorWorkflow';
import { IDirectorRepository } from '../interfaces/IDirectorRepository';

export class AudiobookDirectorAgent {
  private workflow: AudiobookDirectorWorkflow;

  constructor(private repository: IDirectorRepository) {
    this.workflow = new AudiobookDirectorWorkflow();
  }

  async executeProductionPlan(bookId: string, chapters: any[], intelligenceData: any, traceId: string): Promise<AudiobookDirectorResult> {
    console.log(`[AudiobookDirectorAgent] Initiating Master Production Blueprint for book: ${bookId}`);

    const result = await this.workflow.execute(bookId, chapters, intelligenceData, traceId);

    if (result.success) {
       await this.persistResult(result);
    }

    console.log(`[AudiobookDirectorAgent] Production Generation Complete. Quality Score: ${result.qualityReport.overallScore}`);
    return result;
  }

  private async persistResult(result: AudiobookDirectorResult): Promise<void> {
    await this.repository.saveMasterPlan(result.masterPlan);
    await this.repository.saveBlueprint(result.blueprint);
    await this.repository.saveCastingPlans(result.castingPlans);
    await this.repository.saveDecisions(result.decisions);
    await this.repository.saveRisks(result.risks);
    await this.repository.saveReviews(result.reviews);
    await this.repository.saveQualityReport(result.qualityReport);
  }
}
