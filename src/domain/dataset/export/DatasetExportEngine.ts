import { DatasetExport } from '../types';
import { randomUUID } from 'crypto';

export class DatasetExportEngine {
  static generateExports(corpusId: string, requiresLineage: boolean = true): DatasetExport[] {
    return [
       {
          id: randomUUID(),
          corpusId,
          exportFormat: 'XTTS',
          exportProfile: { targetSystem: 'XTTS', mappingRules: { includeLineage: requiresLineage } },
          path: `/datasets/exports/xtts/${corpusId}.json`
       },
       {
          id: randomUUID(),
          corpusId,
          exportFormat: 'KadhaisolaiNative',
          exportProfile: { targetSystem: 'KadhaisolaiNative', mappingRules: { enforceStrictLineage: requiresLineage } },
          path: `/datasets/exports/native/${corpusId}/`
       }
    ];
  }
}
