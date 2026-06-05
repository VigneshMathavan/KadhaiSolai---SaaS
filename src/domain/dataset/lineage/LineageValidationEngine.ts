import { LineageValidationReport, TrainingSampleLineage } from '../types';
import { randomUUID } from 'crypto';

export class LineageValidationEngine {
  static validate(lineages: TrainingSampleLineage[]): LineageValidationReport {
    const issues: string[] = [];
    let score = 1.0;

    for (const lineage of lineages) {
       if (!lineage.bookId) {
          issues.push(`Lineage ${lineage.id} missing book reference`);
          score -= 0.01;
       }
       if (!lineage.traceId) {
          issues.push(`Lineage ${lineage.id} missing trace ID`);
          score -= 0.05;
       }
    }

    return {
       id: randomUUID(),
       validationScore: Math.max(0, score),
       validationIssues: issues
    };
  }
}
