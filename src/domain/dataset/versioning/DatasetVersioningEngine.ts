import { DatasetVersion } from '../types';
import { randomUUID } from 'crypto';

export class DatasetVersioningEngine {
  static createVersion(bookId: string, prevVersionCount: number): DatasetVersion {
    return {
       id: randomUUID(),
       bookId,
       versionTag: `V${prevVersionCount + 1}`,
       diffMetadata: { note: 'Initial compilation' }
    };
  }
}
