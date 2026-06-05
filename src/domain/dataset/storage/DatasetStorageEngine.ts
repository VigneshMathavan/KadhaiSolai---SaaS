import { DatasetManifest } from '../types';
import { randomUUID } from 'crypto';

export class DatasetStorageEngine {
  static saveManifest(versionId: string, metadata: any): DatasetManifest {
    return {
       id: randomUUID(),
       versionId,
       manifestData: metadata
    };
  }
}
