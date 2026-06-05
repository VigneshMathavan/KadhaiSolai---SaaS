import { EmotionState } from '../types';

export class EmotionReasoningEngine {
  static formatReasoning(state: EmotionState): string {
    let reasoning = `Why this emotion exists: ${state.emotionType}\n`;
    reasoning += `Why confidence exists: ${(state.confidenceScore * 100).toFixed(1)}% due to extracted evidence payload.\n`;
    reasoning += `What context supports it: ${state.reasoning.explanation}\n`;
    
    if (state.reasoning.evidence.length > 0) {
       reasoning += `What evidence supports it:\n`;
       for (const ev of state.reasoning.evidence) {
          reasoning += ` - [${ev.sourceType}] "${ev.evidenceText}" (pos: ${ev.position})\n`;
       }
    }
    
    return reasoning;
  }
}
