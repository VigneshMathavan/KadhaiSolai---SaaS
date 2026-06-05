import { NarrationQualityReport, NarrationPlan, NarrationDirective } from '../types';

export class NarrationQualityScorer {
  static score(bookId: string, traceId: string, plan: NarrationPlan, directives: NarrationDirective[], validationIssues: string[]): NarrationQualityReport {
    // Arbitrary metric scoring logic based on directive density
    let pacingQuality = 0.8;
    let pauseQuality = 0.8;
    let transitionQuality = 0.8;
    let performanceQuality = 0.8;

    if (directives.some(d => d.directiveType === 'PAUSE')) pauseQuality = 0.9;
    if (directives.some(d => d.directiveType === 'TRANSITION')) transitionQuality = 0.9;
    
    if (validationIssues.length > 0) {
       pacingQuality -= 0.1;
       pauseQuality -= 0.1;
       transitionQuality -= 0.1;
       performanceQuality -= 0.1;
    }

    const overallScore = (pacingQuality + pauseQuality + transitionQuality + performanceQuality) / 4;

    return {
       bookId,
       traceId,
       pacingQuality,
       pauseQuality,
       transitionQuality,
       performanceQuality,
       overallScore,
       validationIssues
    };
  }
}
