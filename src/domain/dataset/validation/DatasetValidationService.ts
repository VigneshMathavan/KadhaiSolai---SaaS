import { TrainingCorpus } from '../types';

export class DatasetValidationService {
  static validateCorpus(corpus: TrainingCorpus): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    if (!corpus.id) errors.push('Missing corpus ID');
    if (corpus.samples.length !== corpus.totalSamples) errors.push('Sample count mismatch');
    
    // Lineage check
    corpus.samples.forEach(s => {
       if (!s.lineage) errors.push(`Sample ${s.sampleId} missing lineage payload.`);
       if (s.lineage && !s.lineage.traceId) errors.push(`Sample ${s.sampleId} lineage missing trace ID.`);
    });

    return { valid: errors.length === 0, errors };
  }
}
