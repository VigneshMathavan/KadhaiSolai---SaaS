import { DirectorReview } from '../types';
import { randomUUID } from 'crypto';

export class DirectorReviewEngine {
  static review(planId: string, conflictsResolved: number, risksFound: number): DirectorReview {
    let status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION' = 'APPROVED';
    const feedback: string[] = [];

    if (risksFound > 3) {
       status = 'NEEDS_REVISION';
       feedback.push('Too many unresolved production risks.');
    } else if (conflictsResolved > 5) {
       feedback.push('High volume of conflicts detected and automatically resolved. Monitor audio output closely.');
    }

    if (status === 'APPROVED') {
       feedback.push('Production blueprint meets all master continuity requirements.');
    }

    return {
       id: randomUUID(),
       planId,
       reviewStatus: status,
       feedback
    };
  }
}
