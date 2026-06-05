import { ChapterDetectionStrategy } from './ChapterDetectionStrategy';
import { ChapterDetectionResult, Chapter } from '../../types';
import { randomUUID } from 'crypto';

export class StructuralChapterStrategy implements ChapterDetectionStrategy {
  name = 'StructuralChapterStrategy';

  async detect(text: string, bookId: string): Promise<ChapterDetectionResult> {
    const chapters: Chapter[] = [];
    const lines = text.split('\n');
    let currentStartPos = 0;
    let orderIndex = 1;
    let charOffset = 0;

    // A structural boundary is heavily indicated by visual scene breaks
    const typographicBreak = /^\s*(\*\*\*|\-\-\-|\_\_\_|\#\#\#)\s*$/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLen = line.length + 1; // +1 for the stripped newline

      if (typographicBreak.test(line)) {
        // High likelihood of a section/chapter break structurally
        chapters.push(this.createChapter(bookId, currentStartPos, charOffset, i, orderIndex++));
        currentStartPos = charOffset + lineLen;
      } else if (line.trim().length === 0 && i > 0 && i < lines.length - 1) {
        // Check for massive whitespace blocks (e.g., 3-4 empty lines)
        if (lines[i-1].trim() === '' && lines[i+1].trim() !== '') {
           // It's a potential boundary, but lower confidence structurally than a *** break
           // For now, we only trigger on explicit typographic breaks to reduce noise in structural strategy
        }
      }

      charOffset += lineLen;
    }

    if (currentStartPos < text.length) {
      chapters.push(this.createChapter(bookId, currentStartPos, text.length, lines.length - 1, orderIndex));
    }

    this.calculateLengths(chapters, text);

    return {
      success: chapters.length > 0,
      chapters,
      overallConfidence: 0.7, // Structural breaks are strong but not absolute
      strategyUsed: this.name
    };
  }

  private createChapter(bookId: string, start: number, end: number, endLine: number, order: number): Chapter {
    return {
      id: randomUUID(),
      bookId,
      type: 'SECTION',
      title: `Structural Section ${order}`,
      orderIndex: order,
      boundary: {
        startPosition: start, endPosition: end,
        startLine: 0, endLine, startWord: 0, endWord: 0
      },
      contentLength: 0, characterCount: 0, wordCount: 0,
      detectionStrategy: this.name,
      confidenceScore: 0.7,
      metadata: {
        originalTitle: null, normalizedTitle: null, detectedNumber: order,
        isRomanNumeral: false, isTamilNumeral: false, languageDetected: 'Unknown'
      }
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
