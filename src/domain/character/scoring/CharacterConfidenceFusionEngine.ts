import { CharacterDetectionStrategy } from '../detection/strategies/CharacterDetectionStrategy';
import { CharacterDetectionResult, CharacterProfile, CharacterMention, CharacterRelationship, CharacterTimeline } from '../types';
import { AliasResolutionEngine } from '../resolution/AliasResolutionEngine';
import { CharacterImportanceEngine } from './CharacterImportanceEngine';
import { CharacterRelationshipEngine } from '../graph/CharacterRelationshipEngine';
import { CharacterQualityScorer } from './CharacterQualityScorer';
import { CharacterValidationService } from '../validation/CharacterValidationService';

export class CharacterConfidenceFusionEngine {
  constructor(private strategies: CharacterDetectionStrategy[]) {}

  async fuseAndDetect(text: string, bookId: string, chapterId: string, traceId: string): Promise<CharacterDetectionResult> {
    const startTime = Date.now();
    let allProfiles: CharacterProfile[] = [];
    const allMentions: CharacterMention[] = [];
    const allRelationships: CharacterRelationship[] = [];

    const promises = this.strategies.map(async (strategy) => {
      try {
        const candidate = await strategy.detect(text, bookId, chapterId);
        allProfiles.push(...candidate.profiles);
        allMentions.push(...candidate.mentions);
        allRelationships.push(...candidate.relationships);
      } catch (err: any) {
        console.error(`[Character Fusion] Strategy ${strategy.name} failed:`, err.message);
      }
    });

    await Promise.all(promises);

    // 1. Resolve Aliases to merge identities
    let resolvedProfiles = AliasResolutionEngine.resolve(allProfiles);

    // 2. Score Importance
    resolvedProfiles = CharacterImportanceEngine.calculateImportance(resolvedProfiles, text.length);

    // 3. Infer Relationships
    const inferredRels = CharacterRelationshipEngine.extractRelationships(resolvedProfiles, allMentions, text);
    allRelationships.push(...inferredRels);

    // 4. Generate Timelines (mocked for this layer)
    const timelines: CharacterTimeline[] = resolvedProfiles.map(p => ({
      characterId: p.id,
      chapterId,
      appearanceCount: p.mentionCount,
      narrativeWeight: p.importanceScore
    }));

    // 5. Validation
    const validation = CharacterValidationService.validate(resolvedProfiles, allRelationships);
    if (!validation.valid) {
      console.warn(`[Trace: ${traceId}] Character validation warnings:`, validation.errors);
    }

    // 6. Quality Scoring
    const qualityScore = CharacterQualityScorer.score(resolvedProfiles, allRelationships, timelines);

    console.log(JSON.stringify({
      event: 'CharacterDetectionCompleted', traceId, bookId, chapterId,
      charactersFound: resolvedProfiles.length,
      relationshipsFound: allRelationships.length,
      qualityScore,
      processingTimeMs: Date.now() - startTime
    }));

    return {
      success: true,
      profiles: resolvedProfiles,
      relationships: allRelationships,
      mentions: allMentions,
      timelines,
      overallConfidence: qualityScore
    };
  }
}
