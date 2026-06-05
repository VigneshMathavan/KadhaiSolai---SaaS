import { DialogueContextScore, DialogueMemoryReport } from '../agent/types';

export class DialogueMemoryScorer {
  static generateReport(bookId: string, traceId: string, contextScore: DialogueContextScore, hasLongRangeReferences: boolean): DialogueMemoryReport {
    
    const longRangeScore = hasLongRangeReferences ? 0.9 : 0.5; // Baseline if no references exist
    
    // Memory Continuity is a blend of context retention and long range references
    const memoryContinuityScore = (contextScore.contextRetention * 0.7) + (longRangeScore * 0.3);

    return {
       bookId,
       traceId,
       memoryContinuityScore,
       speakerContinuityScore: contextScore.speakerContinuity,
       listenerContinuityScore: contextScore.listenerContinuity,
       longRangeConsistencyScore: longRangeScore
    };
  }
}
