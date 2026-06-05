import { TrainingCorpus, DatasetVersion, DatasetExport, DatasetManifest, DatasetRegistry, DatasetQualityReport, DatasetBalanceReport, DatasetCoverageReport, TrainingSampleLineage, CorpusLineageReport, DatasetVersionDiff, TrainingUsageRecord, CorpusTrainingHistory } from '../types';

export interface IDatasetRepository {
  saveCorpus(corpus: TrainingCorpus): Promise<void>;
  saveVersion(version: DatasetVersion): Promise<void>;
  saveExports(exportsData: DatasetExport[]): Promise<void>;
  saveManifest(manifest: DatasetManifest): Promise<void>;
  saveRegistry(registry: DatasetRegistry): Promise<void>;
  saveQualityReport(report: DatasetQualityReport): Promise<void>;
  saveBalanceReport(report: DatasetBalanceReport): Promise<void>;
  saveCoverageReport(report: DatasetCoverageReport): Promise<void>;
  
  saveLineageData(lineages: TrainingSampleLineage[]): Promise<void>;
  saveCorpusLineageReport(report: CorpusLineageReport): Promise<void>;
  saveVersionDiff(diff: DatasetVersionDiff): Promise<void>;
  saveTrainingUsage(usage: TrainingUsageRecord): Promise<void>;
  saveTrainingHistory(history: CorpusTrainingHistory): Promise<void>;
}
