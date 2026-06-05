import { SceneImportanceReport, ImportanceReasoning } from '../types';
import { randomUUID } from 'crypto';

export class SceneImportanceEngine {
  static rankScene(bookId: string, chapterId: string, sceneId: string, charCount: number, tension: number, arcType: string): SceneImportanceReport {
    let score = 0.5;
    const factors: string[] = [];

    if (charCount > 2) {
       score += 0.1;
       factors.push('High Character Density');
    }

    if (tension > 0.8) {
       score += 0.2;
       factors.push('High Tension');
    }

    if (arcType === 'Climax' || arcType === 'Inciting Incident') {
       score += 0.3;
       factors.push(`Critical Arc Position: ${arcType}`);
    }

    score = Math.min(1.0, score);

    const reasoning: ImportanceReasoning = {
       factors,
       explanation: `Calculated importance of ${score.toFixed(2)} based on structural and emotional weights.`
    };

    return {
       id: randomUUID(),
       bookId,
       chapterId,
       sceneId,
       importanceScore: score,
       reasoning
    };
  }
}
