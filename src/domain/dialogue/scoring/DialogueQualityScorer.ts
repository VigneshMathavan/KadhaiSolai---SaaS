import { Dialogue, Conversation } from '../types';

export class DialogueQualityScorer {
  static score(dialogues: Dialogue[], conversations: Conversation[]): number {
    if (dialogues.length === 0) return 0.0;

    let baseConfidence = 0;
    let attributionBonus = 0;

    for (const d of dialogues) {
      baseConfidence += d.confidenceScore;
      if (d.speaker) attributionBonus += 0.2;
      if (d.listeners.length > 0) attributionBonus += 0.1;
    }

    baseConfidence /= dialogues.length;
    attributionBonus /= dialogues.length;

    let finalScore = (baseConfidence * 0.7) + (attributionBonus * 0.3);
    return Math.min(1.0, Math.max(0.0, finalScore));
  }
}
