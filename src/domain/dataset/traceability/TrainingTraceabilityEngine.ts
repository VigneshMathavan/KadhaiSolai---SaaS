import { TrainingUsageRecord, CorpusTrainingHistory } from '../types';
import { randomUUID } from 'crypto';

export class TrainingTraceabilityEngine {
  static logUsage(corpusId: string, modelId: string, usageType: 'FINE_TUNING' | 'RLHF' | 'BASE_TRAINING'): TrainingUsageRecord {
    return {
       id: randomUUID(),
       corpusId,
       modelId,
       usageType
    };
  }

  static generateHistoryMap(modelId: string, usageRecords: TrainingUsageRecord[]): CorpusTrainingHistory {
    return {
       id: randomUUID(),
       modelId,
       historyMetadata: { totalCorporaUtilized: usageRecords.length }
    };
  }
}
