import { AudiobookDirectorResult } from '../types';
import { ProductionOrchestrator } from '../orchestration/ProductionOrchestrator';

export class AudiobookDirectorWorkflow {
  private orchestrator: ProductionOrchestrator;

  constructor() {
    this.orchestrator = new ProductionOrchestrator();
  }

  async execute(bookId: string, chapters: any[], intelligenceData: any, traceId: string): Promise<AudiobookDirectorResult> {
    return this.orchestrator.orchestrate(bookId, chapters, intelligenceData, traceId);
  }
}
