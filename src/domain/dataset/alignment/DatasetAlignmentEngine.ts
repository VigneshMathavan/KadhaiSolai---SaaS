import { DatasetAlignment, TrainingSample } from '../types';

export class DatasetAlignmentEngine {
  static validateAlignment(samples: TrainingSample[]): DatasetAlignment {
    const evidence: string[] = [];
    let score = 1.0;

    for (const sample of samples) {
       if (!sample.text || sample.text.trim().length === 0) {
          score -= 0.1;
          evidence.push(`Empty text payload in sample ${sample.id}`);
       }
       if (!sample.speaker) {
          score -= 0.05;
          evidence.push(`Missing speaker metadata in sample ${sample.id}`);
       }
    }

    return {
       alignmentScore: Math.max(0, score),
       alignmentConfidence: score > 0.9 ? 0.95 : 0.6,
       alignmentEvidence: evidence
    };
  }
}
