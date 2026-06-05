import { DatasetRegistry } from '../types';
import { randomUUID } from 'crypto';

export class DatasetRegistryEngine {
  static register(bookId: string, corpusId: string): DatasetRegistry {
    return {
       id: randomUUID(),
       bookId,
       registrySnapshot: { latestCorpus: corpusId, status: 'AVAILABLE' }
    };
  }
}
