import { ChapterDetectionStrategy } from './ChapterDetectionStrategy';
import { ChapterDetectionResult, Chapter, ChapterType } from '../../types';
import { randomUUID } from 'crypto';

export class RegexChapterStrategy implements ChapterDetectionStrategy {
  name = 'RegexChapterStrategy';

  private readonly KEYWORDS = {
    CHAPTER: ['அத்தியாயம்', 'chapter'],
    PART: ['பகுதி', 'part'],
    SECTION: ['இயல்', 'section'],
    VOLUME: ['தொகுதி', 'volume', 'book'],
    PROLOGUE: ['முன்னுரை', 'prologue'],
    EPILOGUE: ['பின்னுரை', 'epilogue'],
    INTRODUCTION: ['அறிமுகம்', 'introduction'],
    FOREWORD: ['foreword'],
    PREFACE: ['preface'],
    APPENDIX: ['இணைப்பு', 'appendix']
  };

  async detect(text: string, bookId: string): Promise<ChapterDetectionResult> {
    const lines = text.split('\n');
    const chapters: Chapter[] = [];
    let currentChapter: Partial<Chapter> | null = null;
    let orderIndex = 1;

    // Pattern for matching generic chapter headers
    // Example matches: "Chapter 1", "அத்தியாயம் ௧", "Part I: A new beginning"
    const pattern = /^\s*(அத்தியாயம்|பகுதி|இயல்|தொகுதி|முன்னுரை|அறிமுகம்|பின்னுரை|இணைப்பு|chapter|part|section|volume|book|prologue|epilogue|introduction|foreword|preface|appendix)\s*([0-9\u0BE6-\u0BEFivxlcdm]+)?\s*[:.\-]?\s*(.*)$/i;

    let charOffset = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLen = line.length + 1; // +1 for the newline char removed by split
      const isShortLine = line.trim().length > 0 && line.trim().length < 100;

      if (isShortLine) {
        const match = line.match(pattern);
        if (match) {
          const keyword = match[1].toLowerCase();
          const numberStr = match[2] || null;
          const remainingTitle = match[3] ? match[3].trim() : null;
          
          // Finalize previous chapter
          if (currentChapter) {
            currentChapter.boundary!.endPosition = charOffset;
            currentChapter.boundary!.endLine = i - 1;
            chapters.push(currentChapter as Chapter);
          }

          const type = this.mapType(keyword);
          
          currentChapter = {
            id: randomUUID(),
            bookId,
            type,
            title: line.trim(),
            orderIndex: orderIndex++,
            boundary: {
              startPosition: charOffset,
              endPosition: text.length, // Temporary, will be updated by next chapter
              startLine: i,
              endLine: lines.length - 1,
              startWord: 0, endWord: 0
            },
            contentLength: 0, wordCount: 0, characterCount: 0,
            detectionStrategy: this.name,
            confidenceScore: 0.95, // Explicit regex match is high confidence
            metadata: {
              originalTitle: line.trim(),
              normalizedTitle: remainingTitle,
              detectedNumber: numberStr ? this.parseNumeral(numberStr) : null,
              isRomanNumeral: numberStr ? /^[ivxlcdm]+$/i.test(numberStr) : false,
              isTamilNumeral: numberStr ? /[\u0BE6-\u0BEF]/.test(numberStr) : false,
              languageDetected: /[\u0B80-\u0BFF]/.test(line) ? 'Tamil' : 'English'
            }
          };
        }
      }
      charOffset += lineLen;
    }

    // Push the final chapter
    if (currentChapter) {
      currentChapter.boundary!.endPosition = text.length;
      currentChapter.boundary!.endLine = lines.length - 1;
      chapters.push(currentChapter as Chapter);
    }

    this.calculateLengths(chapters, text);

    return {
      success: chapters.length > 0,
      chapters,
      overallConfidence: chapters.length > 0 ? 0.95 : 0,
      strategyUsed: this.name
    };
  }

  private mapType(keyword: string): ChapterType {
    for (const [type, words] of Object.entries(this.KEYWORDS)) {
      if (words.includes(keyword)) return type as ChapterType;
    }
    return 'UNKNOWN';
  }

  private parseNumeral(numStr: string): number | null {
    if (/^\d+$/.test(numStr)) return parseInt(numStr, 10);
    // Basic Tamil numeral fallback (just an example, full parsing requires more logic)
    // Map ௧-௯ to 1-9
    if (/^[\u0BE6-\u0BEF]+$/.test(numStr)) {
       let val = '';
       for(let i=0; i<numStr.length; i++) {
         const code = numStr.charCodeAt(i);
         if (code >= 3046 && code <= 3055) val += (code - 3046).toString();
       }
       return val ? parseInt(val, 10) : null;
    }
    return null; // Roman parsing skipped for brevity in this simple parse
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
