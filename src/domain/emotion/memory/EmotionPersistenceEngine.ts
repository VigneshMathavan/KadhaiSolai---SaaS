import { EmotionState, EmotionPersistenceScore } from '../types';

export class EmotionPersistenceEngine {
  static trackPersistence(states: EmotionState[], targetEmotion: string): EmotionPersistenceScore {
     // Evaluates a chronological list of states to determine the lifespan of an emotion
     
     let firstAppearance = -1;
     let lastAppearance = -1;
     let reactivations = 0;
     
     for (let i = 0; i < states.length; i++) {
        if (states[i].emotionType === targetEmotion) {
           if (firstAppearance === -1) firstAppearance = states[i].startPosition;
           
           // If there was a gap between this and the last occurrence
           if (lastAppearance !== -1 && (states[i].startPosition - lastAppearance > 1000)) {
              reactivations++;
           }
           
           lastAppearance = states[i].endPosition;
        }
     }

     if (firstAppearance === -1) {
        return { lifespan: 0, decayScore: 1.0, reactivationScore: 0, persistenceScore: 0 };
     }

     const lifespan = lastAppearance - firstAppearance;
     const persistenceScore = Math.min(1.0, lifespan / 10000); // 10k chars is max persistence weight
     
     return {
        lifespan,
        decayScore: 1.0 - persistenceScore,
        reactivationScore: Math.min(1.0, reactivations * 0.2),
        persistenceScore
     };
  }
}
