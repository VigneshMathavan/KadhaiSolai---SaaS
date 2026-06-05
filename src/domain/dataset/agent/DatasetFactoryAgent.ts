import { DatasetFactoryResult } from '../types';
import { DatasetFactoryWorkflow } from './DatasetFactoryWorkflow';
import { IDatasetRepository } from '../interfaces/IDatasetRepository';

export class DatasetFactoryAgent {
  private workflow: DatasetFactoryWorkflow;

  constructor(private repository: IDatasetRepository) {
    this.workflow = new DatasetFactoryWorkflow();
  }

  async executeFactoryPipeline(bookId: string, masterPlan: any, rawSentences: any[], traceId: string): Promise<DatasetFactoryResult> {
    console.log(`[DatasetFactoryAgent] Initiating dataset generation for book: ${bookId}`);

    const result = await this.workflow.execute(bookId, masterPlan, rawSentences, traceId);

    if (result.success) {
       await this.persistResult(result);
    }

    console.log(`[DatasetFactoryAgent] Corpus Generation Complete. Generated ${result.corpus.totalSamples} samples.`);
    return result;
  }

  private async persistResult(result: DatasetFactoryResult): Promise<void> {
    await this.repository.saveVersion(result.version);
    await this.repository.saveCorpus(result.corpus);
    await this.repository.saveManifest(result.manifest);
    await this.repository.saveExports(result.exports);
    await this.repository.saveRegistry(result.registry);
    await this.repository.saveQualityReport(result.quality);
    await this.repository.saveBalanceReport(result.balance);
    await this.repository.saveCoverageReport(result.coverage);

    const lContext = (result as any)._lineageContext;
    if (lContext) {
       await this.repository.saveVersionDiff(lContext.versionDiff);
       await this.repository.saveCorpusLineageReport(lContext.lineageReport);
       // Save lineages from all samples
       const lineages = result.corpus.samples.map(s => s.lineage!).filter(l => l);
       await this.repository.saveLineageData(lineages);
    }
  }
}
