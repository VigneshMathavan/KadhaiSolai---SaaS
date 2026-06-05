import { Dialogue, DialogueEvaluationResult } from '../types';

export class DialogueEvaluationEngine {
  static evaluate(extracted: Dialogue[], groundTruthBounds: {start: number, end: number}[]): DialogueEvaluationResult {
    let tp = 0; let fp = 0; let fn = 0;
    
    // Very basic overlap metric for bounds mapping
    for (const d of extracted) {
       const matched = groundTruthBounds.find(gt => Math.abs(gt.start - d.boundary.startPosition) < 10);
       if (matched) tp++;
       else fp++;
    }

    fn = Math.max(0, groundTruthBounds.length - tp);

    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1 = (2 * precision * recall) / (precision + recall || 1);

    return { precision, recall, f1 };
  }
}
