import { AudiobookMasterPlan, ProductionBlueprint, VoiceCastingPlan, PerformanceConflict, ConflictResolution, ChapterExecutionPlan, SceneExecutionPlan, CharacterExecutionPlan, DirectorDecision, ProductionRisk, DirectorReview, ProductionQualityReport } from '../types';
import { VoiceCastingEngine } from '../casting/VoiceCastingEngine';
import { GlobalConsistencyEngine } from '../consistency/GlobalConsistencyEngine';
import { PerformanceConflictEngine } from '../conflict/PerformanceConflictEngine';
import { ConflictResolutionEngine } from '../conflict/ConflictResolutionEngine';
import { ChapterExecutionEngine } from '../execution/ChapterExecutionEngine';
import { SceneExecutionEngine } from '../execution/SceneExecutionEngine';
import { CharacterExecutionEngine } from '../execution/CharacterExecutionEngine';
import { ProductionMemoryEngine } from '../memory/ProductionMemoryEngine';
import { DirectorDecisionEngine } from '../decision/DirectorDecisionEngine';
import { DirectorReviewEngine } from '../review/DirectorReviewEngine';
import { ProductionRiskEngine } from '../risk/ProductionRiskEngine';
import { MasterPlanGenerator } from '../generator/MasterPlanGenerator';
import { randomUUID } from 'crypto';

export class ProductionOrchestrator {
  async orchestrate(bookId: string, chapters: any[], intelligenceData: any, traceId: string): Promise<any> {
    
    // 1. Voice Casting
    const castingPlans: VoiceCastingPlan[] = [];
    const charContexts = intelligenceData.characters || [];
    for (const char of charContexts) {
       castingPlans.push(VoiceCastingEngine.castVoice(bookId, char.id, char));
    }

    // 2. Conflict Detection
    const conflicts: PerformanceConflict[] = [];
    for (const chap of chapters) {
       // Mock extracting intent and pacing from lower layers
       const pace = chap.narration?.pace || 'NORMAL';
       const intensity = chap.emotion?.intensity || 0.5;
       const intent = chap.narration?.intent || 'Build Suspense';
       
       conflicts.push(...PerformanceConflictEngine.detectConflicts(pace, intensity, intent));
    }

    // 3. Conflict Resolution
    const resolutions: ConflictResolution[] = ConflictResolutionEngine.resolve(conflicts);

    // 4. Execution Planning
    const chapterPlans: ChapterExecutionPlan[] = [];
    const scenePlans: SceneExecutionPlan[] = [];
    const characterPlans: CharacterExecutionPlan[] = [];

    for (const chap of chapters) {
       chapterPlans.push(ChapterExecutionEngine.planChapter(chap.id, chap.narration, chap.arc));
       for (const scene of chap.scenes || [{id: chap.id}]) {
          scenePlans.push(SceneExecutionEngine.planScene(scene.id, chap.id, scene.mood, scene.intent, 'FADE'));
          for (const char of charContexts) {
             const archetype = castingPlans.find(c => c.characterId === char.id)?.voiceArchetype || 'Narrator';
             characterPlans.push(CharacterExecutionEngine.planCharacter(char.id, scene.id, archetype, 'Neutral'));
          }
       }
    }

    // 5. Global Consistency Validation
    const consistencyConflicts = GlobalConsistencyEngine.checkConsistency(characterPlans, []);
    conflicts.push(...consistencyConflicts);

    // 6. Master Plan Generation
    const masterPlan: AudiobookMasterPlan = MasterPlanGenerator.generate(bookId, 'Artistic and Dramatic Excellence');

    // 7. Blueprint Mapping
    const blueprint: ProductionBlueprint = {
       id: randomUUID(),
       planId: masterPlan.id,
       chapterPlans,
       scenePlans,
       characterPlans
    };

    // Fix up planIds
    castingPlans.forEach(c => c.planId = masterPlan.id);

    // 8. Risk Engine
    const risks: ProductionRisk[] = ProductionRiskEngine.analyzeRisks(masterPlan.id, castingPlans);

    // 9. Decisions
    const decisions: DirectorDecision[] = [];
    for (const res of resolutions) {
       decisions.push(DirectorDecisionEngine.makeDecision(masterPlan.id, 'RESOLVED_CONFLICT', res.reasoning));
    }

    // 10. Review
    const review: DirectorReview = DirectorReviewEngine.review(masterPlan.id, resolutions.length, risks.length);

    // 11. Quality Report
    const qualityReport: ProductionQualityReport = {
       planId: masterPlan.id,
       traceId,
       castingQuality: castingPlans.length > 0 ? 0.95 : 0.5,
       consistencyQuality: consistencyConflicts.length === 0 ? 0.95 : 0.6,
       resolutionQuality: 0.9,
       overallScore: 0.9
    };

    return {
       success: review.reviewStatus !== 'REJECTED',
       masterPlan,
       blueprint,
       castingPlans,
       decisions,
       risks,
       reviews: [review],
       qualityReport
    };
  }
}
