import { EmotionState, EmotionConflictResolution } from '../types';

export class EmotionConflictResolutionEngine {
  static resolve(overlappingEmotions: EmotionState[]): EmotionConflictResolution {
     if (overlappingEmotions.length === 0) {
        return { primaryEmotion: 'NEUTRAL', dominantEmotion: 'NEUTRAL', confidence: 1.0 };
     }

     if (overlappingEmotions.length === 1) {
        return { 
           primaryEmotion: overlappingEmotions[0].emotionType, 
           dominantEmotion: overlappingEmotions[0].emotionType, 
           confidence: overlappingEmotions[0].confidenceScore 
        };
     }

     // Sort by confidence
     overlappingEmotions.sort((a,b) => b.confidenceScore - a.confidenceScore);
     
     const primary = overlappingEmotions[0];
     const secondary = overlappingEmotions[1];

     let blended: string | undefined;

     // Resolve specific known conflicts
     const set = new Set([primary.emotionType, secondary.emotionType]);
     
     if (set.has('JOY') && set.has('GRIEF')) blended = 'BITTERSWEET';
     if (set.has('LOVE') && set.has('ANGER')) blended = 'BETRAYAL';
     if (set.has('FEAR') && set.has('DETERMINATION')) blended = 'COURAGE';
     if (set.has('HOPE') && set.has('SADNESS')) blended = 'MELANCHOLY';

     return {
        primaryEmotion: primary.emotionType,
        secondaryEmotion: secondary.emotionType,
        dominantEmotion: primary.emotionType, // Defaults to highest confidence
        blendedEmotion: blended,
        confidence: primary.confidenceScore * 0.9 // Mild penalty for conflict
     };
  }
}
