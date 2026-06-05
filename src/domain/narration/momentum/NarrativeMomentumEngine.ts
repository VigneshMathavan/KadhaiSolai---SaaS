import { MomentumProfile } from '../types';
import { randomUUID } from 'crypto';

export class NarrativeMomentumEngine {
  static calculateMomentum(bookId: string, chapterId: string, currentEnergy: number, currentTension: number, priorMomentum?: MomentumProfile): MomentumProfile {
    const currentScore = (currentEnergy * 0.6) + (currentTension * 0.4);
    
    let direction: MomentumProfile['momentumDirection'] = 'STABLE';
    let trend: MomentumProfile['momentumTrend'] = 'NEUTRAL';
    let velocity = 0;

    if (priorMomentum) {
       velocity = currentScore - priorMomentum.momentumScore;
       if (velocity > 0.1) {
          direction = 'ACCELERATING';
          trend = 'POSITIVE';
       } else if (velocity < -0.1) {
          direction = 'DECELERATING';
          trend = 'NEGATIVE';
       }
    } else {
       // Seed momentum
       if (currentScore > 0.7) {
          direction = 'ACCELERATING';
          trend = 'POSITIVE';
          velocity = 0.5;
       }
    }

    return {
       id: randomUUID(),
       bookId,
       chapterId,
       momentumScore: currentScore,
       momentumDirection: direction,
       momentumTrend: trend,
       momentumVelocity: velocity
    };
  }
}
