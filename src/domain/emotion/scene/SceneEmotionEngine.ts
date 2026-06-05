import { EmotionState, SceneEmotionProfile } from '../types';
import { randomUUID } from 'crypto';

export class SceneEmotionEngine {
  static buildProfiles(states: EmotionState[], bookId: string, chapterId: string): SceneEmotionProfile[] {
    // For MVP phase 4, chapterId is the scene.
    // We aggregate all states into the chapter scene.
    
    let atmosphere = 'neutral';
    const emotions = states.map(s => s.emotionType);
    if (emotions.includes('FEAR') || emotions.includes('PANIC')) atmosphere = 'suspenseful';
    if (emotions.includes('SADNESS') || emotions.includes('GRIEF')) atmosphere = 'tragic';
    if (emotions.includes('LOVE')) atmosphere = 'romantic';
    
    return [{
       id: randomUUID(),
       bookId, chapterId,
       targetType: 'SCENE',
       targetId: chapterId, // the scene is the chapter
       dominantEmotion: emotions.length > 0 ? emotions[0] : 'NEUTRAL',
       volatility: 0.4,
       emotionalStateHistory: states,
       atmosphere
    }];
  }
}
