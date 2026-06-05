import { DatasetVersionDiff } from '../types';
import { randomUUID } from 'crypto';

export class DatasetVersionDiffEngine {
  static calculateDiff(prevVersionId: string, currentVersionId: string, prevCount: number, currentCount: number): DatasetVersionDiff {
    return {
       id: randomUUID(),
       previousVersionId: prevVersionId,
       currentVersionId,
       addedSamples: Math.max(0, currentCount - prevCount),
       removedSamples: Math.max(0, prevCount - currentCount),
       modifiedSamples: 0,
       emotionChanges: 0,
       metadataChanges: 0
    };
  }
}
