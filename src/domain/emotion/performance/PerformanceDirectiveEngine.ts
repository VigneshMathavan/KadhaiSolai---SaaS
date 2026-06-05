import { EmotionState, PerformanceDirective } from '../types';
import { EmotionPersistenceEngine } from '../memory/EmotionPersistenceEngine';
import { randomUUID } from 'crypto';

export class PerformanceDirectiveEngine {
  static generate(states: EmotionState[]): PerformanceDirective[] {
    return states.map(state => {
       let speechPace: 'SLOW' | 'NORMAL' | 'FAST' | 'RAPID' = 'NORMAL';
       let pauseIntensity: 'NONE' | 'SHORT' | 'LONG' | 'DRAMATIC' = 'SHORT';
       let emphasisLevel = 0.5;
       let energyLevel = 0.5;
       let voiceTension = 0.5;
       let dramaticIntensity = 0.5;
       let emotionalWeight: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'CRUSHING' = 'MODERATE';

       const persistenceScore = EmotionPersistenceEngine.trackPersistence(states, state.emotionType);
       
       switch (state.emotionType) {
          case 'PANIC':
          case 'FEAR':
             speechPace = 'RAPID';
             pauseIntensity = 'NONE';
             energyLevel = 0.95;
             voiceTension = 0.92;
             
             // If panic persists a long time, it turns into exhaustion
             if (persistenceScore.lifespan > 5000) {
                speechPace = 'SLOW';
                energyLevel = 0.4;
                voiceTension = 0.95; // High tension but low energy (exhausted panic)
             }
             break;
          case 'ANGER':
          case 'RAGE':
             speechPace = 'FAST';
             emphasisLevel = 0.9;
             energyLevel = 0.9;
             voiceTension = 0.8;
             dramaticIntensity = 0.8;
             
             // Sustained anger becomes cold/deliberate
             if (persistenceScore.lifespan > 5000) {
                speechPace = 'SLOW';
                pauseIntensity = 'DRAMATIC';
                dramaticIntensity = 1.0;
             }
             break;
          case 'SADNESS':
          case 'GRIEF':
             speechPace = 'SLOW';
             pauseIntensity = 'LONG';
             energyLevel = 0.2;
             voiceTension = 0.3;
             emotionalWeight = 'HEAVY';
             
             if (persistenceScore.lifespan > 10000) {
                emotionalWeight = 'CRUSHING';
                pauseIntensity = 'DRAMATIC';
             }
             break;
          case 'JOY':
          case 'EXCITEMENT':
             speechPace = 'FAST';
             pauseIntensity = 'SHORT';
             energyLevel = 0.85;
             voiceTension = 0.2;
             emotionalWeight = 'LIGHT';
             break;
       }

       return {
          id: randomUUID(),
          emotionId: state.id || randomUUID(), // ID mapping
          dialogueId: state.dialogueId,
          speechPace,
          pauseIntensity,
          emphasisLevel,
          energyLevel,
          voiceTension,
          dramaticIntensity,
          emotionalWeight
       };
    });
  }
}
