import { NarrativeArc } from '../types';
import { randomUUID } from 'crypto';

export class NarrativeArcEngine {
  static determineArc(bookId: string, chapterId: string, chapterIndex: number, totalChapters: number, sceneEnergy: number, tension: number): NarrativeArc {
    const position = totalChapters > 0 ? chapterIndex / totalChapters : 0.5;
    
    let arcType: NarrativeArc['arcType'] = 'Introduction';
    let arcConfidence = 0.8;

    if (position < 0.15) {
       arcType = 'Introduction';
    } else if (position >= 0.15 && position < 0.25) {
       arcType = 'Inciting Incident';
    } else if (position >= 0.25 && position < 0.6) {
       arcType = 'Rising Action';
    } else if (position >= 0.6 && position < 0.75) {
       arcType = 'Conflict';
    } else if (position >= 0.75 && position < 0.85) {
       arcType = tension > 0.8 ? 'Crisis' : 'Climax';
    } else if (position >= 0.85 && position < 0.95) {
       arcType = 'Resolution';
    } else {
       arcType = 'Epilogue';
    }

    // Adjust based on local spikes
    if (tension > 0.9 && position > 0.5) {
       arcType = 'Climax';
       arcConfidence = 0.95;
    }

    return {
       id: randomUUID(),
       bookId,
       chapterId,
       arcType,
       arcPosition: position,
       arcConfidence
    };
  }
}
