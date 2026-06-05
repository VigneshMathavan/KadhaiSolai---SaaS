import { TrainingSampleLineage, CorpusLineageReport } from '../types';
import { randomUUID } from 'crypto';

export class DatasetLineageEngine {
  static trackSample(sampleId: string, bookId: string, corpusVersionId: string, traceId: string, contextData: any): TrainingSampleLineage {
    return {
       id: randomUUID(),
       sampleId,
       bookId,
       chapterId: contextData?.chapterId || randomUUID(),
       sceneId: contextData?.sceneId || randomUUID(),
       characterId: contextData?.characterId || randomUUID(),
       datasetVersionId: contextData?.versionId || randomUUID(),
       corpusVersionId,
       traceId
    };
  }

  static generateCorpusReport(corpusId: string, totalSamples: number, brokenLinks: number): CorpusLineageReport {
    return {
       id: randomUUID(),
       corpusId,
       lineageCoverage: totalSamples > 0 ? (totalSamples - brokenLinks) / totalSamples : 0,
       missingLinks: brokenLinks,
       brokenReferences: brokenLinks,
       orphanSamples: 0,
       versionDrift: 0,
       traceCompleteness: 1.0
    };
  }
}
