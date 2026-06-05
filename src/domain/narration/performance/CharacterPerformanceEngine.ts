import { CharacterPerformanceProfile } from '../types';

export class CharacterPerformanceEngine {
  static determinePerformance(characterId: string, emotionProfile: any): CharacterPerformanceProfile {
    let deliveryStyle = 'Neutral';
    let basePace = 'NORMAL';
    let baseEnergy = 0.5;

    if (emotionProfile) {
       const dom = emotionProfile.dominantEmotion;
       if (dom === 'FEAR' || dom === 'PANIC') {
          deliveryStyle = 'Trembling, Faster Breathing';
          basePace = 'FAST';
          baseEnergy = 0.8;
       } else if (dom === 'ANGER') {
          deliveryStyle = 'Controlled Authority, High Confidence';
          basePace = 'NORMAL';
          baseEnergy = 0.9;
       } else if (dom === 'GRIEF') {
          deliveryStyle = 'Broken, Whispered';
          basePace = 'SLOW';
          baseEnergy = 0.2;
       }
    }

    return {
       characterId,
       deliveryStyle,
       basePace,
       baseEnergy
    };
  }
}
