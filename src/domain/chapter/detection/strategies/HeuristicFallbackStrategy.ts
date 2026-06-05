import { ChapterDetectionStrategy } from './ChapterDetectionStrategy';
import { ChapterDetectionResult, Chapter } from '../../types';
import { randomUUID } from 'crypto';

export class HeuristicFallbackStrategy implements ChapterDetectionStrategy {
  name = 'HeuristicFallbackStrategy';

  async detect(text: string, bookId: string): Promise<ChapterDetectionResult> {
    const chapters: Chapter[] = [];
    const MAX_CHAPTER_LENGTH = 15000; // rough character target

    // Split strictly by double newlines to avoid cutting paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    let currentChapterText = '';
    let startPosition = 0;
    let orderIndex = 1;
    let currentStartPos = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      currentChapterText += p + '\n\n';

      if (currentChapterText.length >= MAX_CHAPTER_LENGTH || i === paragraphs.length - 1) {
        const endPosition = currentStartPos + currentChapterText.length;
        
        chapters.push({
          id: randomUUID(),
          bookId,
          type: 'CHAPTER', // Generated fallback chapters are just generic chunks
          title: `Generated Chunk ${orderIndex}`,
          orderIndex: orderIndex++,
          boundary: {
            startPosition: currentStartPos,
            endPosition: endPosition,
            startLine: 0, endLine: 0, startWord: 0, endWord: 0 // Mocked for fallback
          },
          contentLength: currentChapterText.length,
          characterCount: currentChapterText.replace(/\s/g, '').length,
          wordCount: currentChapterText.split(/\s+/).filter(w => w.length > 0).length,
          detectionStrategy: this.name,
          confidenceScore: 0.5, // Lowest confidence as it's purely length heuristic
          metadata: {
            originalTitle: null, normalizedTitle: null, detectedNumber: orderIndex - 1,
            isRomanNumeral: false, isTamilNumeral: false, languageDetected: 'Unknown'
          }
        });

        currentStartPos = endPosition;
        currentChapterText = '';
      }
    }

    return {
      success: chapters.length > 0,
      chapters,
      overallConfidence: 0.5,
      strategyUsed: this.name
    };
  }
}
