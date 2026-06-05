import { ChapterDetectionStrategy } from './ChapterDetectionStrategy';
import { ChapterDetectionResult, Chapter } from '../../types';
import { randomUUID } from 'crypto';

export class HeadingChapterStrategy implements ChapterDetectionStrategy {
  name = 'HeadingChapterStrategy';

  async detect(text: string, bookId: string): Promise<ChapterDetectionResult> {
    const chapters: Chapter[] = [];
    const lines = text.split('\n');
    let currentStartPos = 0;
    let orderIndex = 1;
    let charOffset = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineLen = line.length + 1;

      // Isolated Line Heading Heuristic:
      // A heading is typically short (<60 chars), surrounded by empty lines, 
      // doesn't end with a period or comma, and might be all caps or title case.
      if (trimmed.length > 0 && trimmed.length < 60) {
        const prevEmpty = i === 0 || lines[i - 1].trim().length === 0;
        const nextEmpty = i === lines.length - 1 || lines[i + 1].trim().length === 0;
        const noTerminalPunctuation = !/[.,;:]$/.test(trimmed);
        const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);

        if (prevEmpty && nextEmpty && (noTerminalPunctuation || isAllCaps)) {
          // Finalize previous
          if (chapters.length > 0) {
            chapters[chapters.length - 1].boundary.endPosition = charOffset;
          }
          
          chapters.push({
            id: randomUUID(), bookId, type: 'CHAPTER',
            title: trimmed, orderIndex: orderIndex++,
            boundary: { startPosition: charOffset, endPosition: text.length, startLine: i, endLine: lines.length - 1, startWord: 0, endWord: 0 },
            contentLength: 0, characterCount: 0, wordCount: 0,
            detectionStrategy: this.name, confidenceScore: 0.65,
            metadata: {
              originalTitle: trimmed, normalizedTitle: trimmed, detectedNumber: null,
              isRomanNumeral: false, isTamilNumeral: false, languageDetected: /[\u0B80-\u0BFF]/.test(trimmed) ? 'Tamil' : 'English'
            }
          });
          currentStartPos = charOffset;
        }
      }
      charOffset += lineLen;
    }

    this.calculateLengths(chapters, text);

    return {
      success: chapters.length > 0,
      chapters,
      overallConfidence: 0.65,
      strategyUsed: this.name
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
