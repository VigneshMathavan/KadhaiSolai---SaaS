import { DatasetCoverageReport, TrainingSample } from '../types';
import { randomUUID } from 'crypto';

export class DatasetCoverageEngine {
  static calculateCoverage(corpusId: string, samples: TrainingSample[]): DatasetCoverageReport {
    const gaps: string[] = [];
    
    if (samples.length < 100) {
       gaps.push('Extremely low sample volume for training corpus.');
    }

    return {
       id: randomUUID(),
       corpusId,
       coverageScore: gaps.length === 0 ? 0.9 : 0.5,
       gaps
    };
  }
}
