import { ChapterDetectionStrategy } from './ChapterDetectionStrategy';
import { ChapterDetectionResult, Chapter } from '../../types';
import { randomUUID } from 'crypto';

export class StatisticalChapterStrategy implements ChapterDetectionStrategy {
  name = 'StatisticalChapterStrategy';

  async detect(text: string, bookId: string): Promise<ChapterDetectionResult> {
    const chapters: Chapter[] = [];
    // Average novel chapter is around 2500 - 4000 words.
    // We statically slice at ~15000 characters if no other markers exist, 
    // snapping to nearest double-newline.
    const TARGET_CHUNK_SIZE = 15000;
    
    let charOffset = 0;
    let orderIndex = 1;
    let currentStart = 0;

    // Find all double newlines
    const regex = /\n\n+/g;
    let match;
    let lastValidBoundary = 0;

    while ((match = regex.exec(text)) !== null) {
      const boundaryIndex = match.index;
      
      if (boundaryIndex - currentStart >= TARGET_CHUNK_SIZE) {
         chapters.push(this.createChapter(bookId, currentStart, boundaryIndex, orderIndex++));
         currentStart = boundaryIndex;
      }
      lastValidBoundary = boundaryIndex;
    }

    if (currentStart < text.length) {
       chapters.push(this.createChapter(bookId, currentStart, text.length, orderIndex));
    }

    this.calculateLengths(chapters, text);

    return {
      success: chapters.length > 0,
      chapters,
      overallConfidence: 0.4, // Statistical is very weak, used purely for fusion baseline
      strategyUsed: this.name
    };
  }

  private createChapter(bookId: string, start: number, end: number, order: number): Chapter {
    return {
      id: randomUUID(), bookId, type: 'SECTION',
      title: `Statistical Slice ${order}`, orderIndex: order,
      boundary: { startPosition: start, endPosition: end, startLine: 0, endLine: 0, startWord: 0, endWord: 0 },
      contentLength: 0, characterCount: 0, wordCount: 0,
      detectionStrategy: this.name, confidenceScore: 0.4,
      metadata: { originalTitle: null, normalizedTitle: null, detectedNumber: order, isRomanNumeral: false, isTamilNumeral: false, languageDetected: 'Unknown' }
    };
  }

  private calculateLengths(chapters: Chapter[], text: string) {
    for (const ch of chapters) {
      const slice = text.slice(ch.boundary.startPosition, ch.boundary.endPosition);
      ch.contentLength = slice.length;
      ch.characterCount = slice.replace(/\s/g, '').length;
      ch.wordCount = slice.split(/\s+/).filter(w => w.length > 0).length;
    }
  }
}
