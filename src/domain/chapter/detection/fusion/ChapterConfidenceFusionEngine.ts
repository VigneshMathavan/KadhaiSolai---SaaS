import { ChapterDetectionStrategy } from '../strategies/ChapterDetectionStrategy';
import { ChapterDetectionResult, Chapter } from '../../types';
import { VotingEngine } from './VotingEngine';
import { ChapterQualityScorer } from './ChapterQualityScorer';

export class ChapterConfidenceFusionEngine {
  constructor(private strategies: ChapterDetectionStrategy[]) {}

  async fuseAndDetect(text: string, bookId: string, traceId: string): Promise<ChapterDetectionResult> {
    const startTime = Date.now();
    const candidatePool: { strategy: string; chapters: Chapter[] }[] = [];

    // Run all strategies in parallel
    const promises = this.strategies.map(async (strategy) => {
      try {
        const res = await strategy.detect(text, bookId);
        if (res.success && res.chapters.length > 0) {
          candidatePool.push({ strategy: strategy.name, chapters: res.chapters });
        }
      } catch (err: any) {
        console.error(`[Fusion] Strategy ${strategy.name} failed:`, err.message);
      }
    });

    await Promise.all(promises);

    if (candidatePool.length === 0) {
      return { success: false, chapters: [], overallConfidence: 0, strategyUsed: 'FusionFailed' };
    }

    // Pass to voting engine
    const fusedChapters = VotingEngine.fuse(candidatePool, text.length);

    // Map correct bookId back to fused chapters
    fusedChapters.forEach(ch => ch.bookId = bookId);

    // Calculate overall quality
    const qualityScore = ChapterQualityScorer.score(fusedChapters, text.length);

    // Update chapters with the final quality score
    fusedChapters.forEach(ch => ch.qualityScore = qualityScore);

    console.log(JSON.stringify({
      event: 'FusionCompleted', traceId, bookId,
      strategiesParticipated: candidatePool.map(c => c.strategy),
      fusedChapterCount: fusedChapters.length,
      qualityScore,
      processingTimeMs: Date.now() - startTime
    }));

    return {
      success: fusedChapters.length > 0,
      chapters: fusedChapters,
      overallConfidence: qualityScore,
      strategyUsed: 'ConfidenceFusionEngine'
    };
  }
}
