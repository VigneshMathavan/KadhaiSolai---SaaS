import { EmotionQualityReport, EmotionState, EmotionTransition } from '../types';

export class EmotionQualityScorer {
  static score(bookId: string, traceId: string, emotions: EmotionState[], transitions: EmotionTransition[], processingTimeMs: number): EmotionQualityReport {
    // Simple heuristic for Quality Scoring
    
    let confidenceSum = 0;
    for (const e of emotions) confidenceSum += e.confidenceScore;
    
    const avgConfidence = emotions.length > 0 ? (confidenceSum / emotions.length) : 0;
    const hasTransitions = transitions.length > 0;
    
    let qualityScore = avgConfidence * 0.8;
    if (hasTransitions) qualityScore += 0.2; // Reward dynamic narrative extraction

    return {
       bookId,
       traceId,
       emotionsDetected: emotions.length,
       transitionsDetected: transitions.length,
       qualityScore: Math.min(1.0, qualityScore),
       processingTimeMs,
       validationIssues: []
    };
  }
}
