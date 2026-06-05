import { DirectorialIntent, IntentReasoning } from '../types';
import { randomUUID } from 'crypto';

export class DirectorialIntentEngine {
  static determineIntent(bookId: string, chapterId: string, sceneId: string, mood: string, energy: number, tension: number): DirectorialIntent {
    let intentType: DirectorialIntent['intentType'] = 'Build Curiosity';
    let reasoningText = 'Default intent for neutral scenes.';

    if (mood === 'suspenseful' || mood === 'FEAR') {
       intentType = 'Build Suspense';
       reasoningText = 'High tension and fearful mood requires suspense building.';
    } else if (mood === 'LOVE' || mood === 'romantic') {
       intentType = 'Build Romance';
       reasoningText = 'Romantic context requires soft, intimate build-up.';
    } else if (mood === 'GRIEF' || mood === 'tragic') {
       intentType = 'Build Grief';
       reasoningText = 'Tragic mood requires heavy emotional anchoring.';
    } else if (energy > 0.8 && tension > 0.8) {
       intentType = 'Build Conflict';
       reasoningText = 'Extreme energy and tension indicate conflict.';
    }

    const reasoning: IntentReasoning = {
       explanation: reasoningText,
       evidence: [{ sourceType: 'SCENE_MOOD', evidenceText: mood }]
    };

    return {
       id: randomUUID(),
       bookId,
       chapterId,
       sceneId,
       intentType,
       confidence: 0.85,
       reasoning
    };
  }
}
