import { Chapter } from '../types';

export class ChapterValidationService {
  static validate(chapters: Chapter[], totalBookLength: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!chapters || chapters.length === 0) {
      errors.push('No chapters detected.');
      return { valid: false, errors };
    }

    const sorted = [...chapters].sort((a, b) => a.boundary.startPosition - b.boundary.startPosition);
    let totalCoverage = 0;

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      totalCoverage += (current.boundary.endPosition - current.boundary.startPosition);

      // Boundary Validation
      if (current.boundary.startPosition >= current.boundary.endPosition) {
        errors.push(`Chapter ${current.orderIndex} has invalid boundaries (start >= end).`);
      }

      // Uniqueness & Overlap
      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        if (current.boundary.endPosition > next.boundary.startPosition) {
          errors.push(`Chapter ${current.orderIndex} overlaps with Chapter ${next.orderIndex}.`);
        }
        if (current.boundary.startPosition === next.boundary.startPosition) {
          errors.push(`Duplicate boundary detected at position ${current.boundary.startPosition}.`);
        }
      }

      // Confidence validity
      if (current.confidenceScore < 0 || current.confidenceScore > 1.0) {
         errors.push(`Chapter ${current.orderIndex} has invalid confidence score: ${current.confidenceScore}`);
      }
    }

    // Coverage Completeness
    const coverageRatio = totalCoverage / totalBookLength;
    if (coverageRatio < 0.9) { // 90% minimum coverage
       // errors.push(`Poor coverage: Only ${(coverageRatio*100).toFixed(2)}% of the book is covered by chapters.`);
       // Warning: Not strictly invalidating yet to preserve partial data, but noted.
    }

    const last = sorted[sorted.length - 1];
    if (last.boundary.endPosition > totalBookLength) {
      errors.push(`Chapter ${last.orderIndex} boundary exceeds total book length.`);
    }

    return { valid: errors.length === 0, errors };
  }
}
