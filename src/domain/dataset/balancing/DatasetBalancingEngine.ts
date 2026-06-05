import { DatasetBalanceReport, TrainingSample } from '../types';
import { randomUUID } from 'crypto';

export class DatasetBalancingEngine {
  static checkBalance(corpusId: string, samples: TrainingSample[]): DatasetBalanceReport {
    const emotionCounts: Record<string, number> = {};
    for (const s of samples) {
       emotionCounts[s.emotion] = (emotionCounts[s.emotion] || 0) + 1;
    }

    const recs: string[] = [];
    if (emotionCounts['Neutral'] && samples.length > 0) {
       const neutralRatio = emotionCounts['Neutral'] / samples.length;
       if (neutralRatio > 0.9) {
          recs.push('Dataset heavily skewed towards Neutral. Model may collapse.');
       }
    }

    return {
       id: randomUUID(),
       corpusId,
       balanceScore: recs.length === 0 ? 0.95 : 0.6,
       recommendations: recs
    };
  }
}
