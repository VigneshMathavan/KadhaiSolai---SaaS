import { TrainingCorpus, TrainingSample } from '../types';
import { randomUUID } from 'crypto';

export class TrainingCorpusGenerator {
  static generate(bookId: string, versionId: string, samples: TrainingSample[]): TrainingCorpus {
    return {
       id: randomUUID(),
       bookId,
       versionId,
       totalSamples: samples.length,
       qualityScore: 0.95,
       samples
    };
  }
}
