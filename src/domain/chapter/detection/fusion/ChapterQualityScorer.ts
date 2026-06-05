import { Chapter } from '../../types';

export class ChapterQualityScorer {
  static score(chapters: Chapter[], totalLength: number): number {
    if (chapters.length === 0) return 0.0;

    let totalCoverage = 0;
    let avgConfidence = 0;
    let overlapPenalty = 0;

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      totalCoverage += (ch.boundary.endPosition - ch.boundary.startPosition);
      avgConfidence += ch.confidenceScore;

      if (i < chapters.length - 1) {
        const next = chapters[i+1];
        if (ch.boundary.endPosition > next.boundary.startPosition) {
           overlapPenalty += 0.2; // heavy penalty for structural overlaps
        }
      }
    }

    avgConfidence = avgConfidence / chapters.length;
    
    // Coverage ratio
    const coverageRatio = Math.min(1.0, totalCoverage / (totalLength || 1));

    let finalScore = (coverageRatio * 0.4) + (avgConfidence * 0.6) - overlapPenalty;
    return Math.max(0.0, Math.min(1.0, finalScore));
  }
}
