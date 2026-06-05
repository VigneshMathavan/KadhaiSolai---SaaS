import { ChapterDetectionStrategy } from './strategies/ChapterDetectionStrategy';
import { RegexChapterStrategy } from './strategies/RegexChapterStrategy';
import { HeuristicFallbackStrategy } from './strategies/HeuristicFallbackStrategy';
import { StructuralChapterStrategy } from './strategies/StructuralChapterStrategy';
import { HeadingChapterStrategy } from './strategies/HeadingChapterStrategy';
import { StatisticalChapterStrategy } from './strategies/StatisticalChapterStrategy';
import { ChapterDetectionResult } from '../types';
import { ChapterConfidenceFusionEngine } from './fusion/ChapterConfidenceFusionEngine';

export class ChapterDetectionEngine {
  private strategies: ChapterDetectionStrategy[];

  constructor() {
    this.strategies = [
      new RegexChapterStrategy(),
      new StructuralChapterStrategy(),
      new HeadingChapterStrategy(),
      new StatisticalChapterStrategy(),
      new HeuristicFallbackStrategy()
    ];
  }

  async processBook(text: string, bookId: string, traceId: string): Promise<ChapterDetectionResult> {
    const fusionEngine = new ChapterConfidenceFusionEngine(this.strategies);
    return fusionEngine.fuseAndDetect(text, bookId, traceId);
  }
}
