export interface GlobalObjectives {
  artisticVision: string;
  targetPacing: string;
  targetIntensity: string;
}

export interface ContinuityRule {
  type: string;
  rule: string;
}

export interface ProductionEvidence {
  sourceType: string;
  evidenceText: string;
}

export interface ProductionReasoning {
  explanation: string;
  evidence: ProductionEvidence[];
}

export interface VoiceCastingPlan {
  id: string;
  planId: string;
  characterId: string;
  voiceArchetype: string;
  castingConfidence: number;
  castingReasoning: ProductionReasoning;
}

export interface ChapterExecutionPlan {
  chapterId: string;
  pace: string;
  intensity: number;
  performanceObjectives: string[];
  consistencyTargets: string[];
}

export interface SceneExecutionPlan {
  sceneId: string;
  chapterId: string;
  intent: string;
  energy: number;
  deliveryStyle: string;
  transitionStrategy: string;
}

export interface CharacterExecutionPlan {
  characterId: string;
  sceneId: string;
  voiceArchetype: string;
  performanceProfile: string;
  emotionProfile: string;
  growthProfile: string;
}

export interface ProductionBlueprint {
  id: string;
  planId: string;
  chapterPlans: ChapterExecutionPlan[];
  scenePlans: SceneExecutionPlan[];
  characterPlans: CharacterExecutionPlan[];
}

export interface DirectorDecision {
  id: string;
  planId: string;
  decisionType: string;
  confidence: number;
  reasoning: ProductionReasoning;
  evidence: ProductionEvidence[];
}

export interface ProductionRisk {
  id: string;
  planId: string;
  riskType: string;
  severity: number;
  description: string;
  mitigation: string;
}

export interface DirectorReview {
  id: string;
  planId: string;
  reviewStatus: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  feedback: string[];
}

export interface ProductionQualityReport {
  id?: string;
  planId: string;
  traceId: string;
  castingQuality: number;
  consistencyQuality: number;
  resolutionQuality: number;
  overallScore: number;
}

export interface AudiobookMasterPlan {
  id: string;
  bookId: string;
  version: number;
  globalObjectives: GlobalObjectives;
  continuityRules: ContinuityRule[];
  performanceRules: ContinuityRule[];
  qualityRules: ContinuityRule[];
}

export interface PerformanceConflict {
  id: string;
  layerA: string;
  layerB: string;
  conflictType: string;
  severity: number;
  description: string;
}

export interface ConflictResolution {
  conflictId: string;
  winningLayer: string;
  resolutionStrategy: string;
  reasoning: string;
}

export interface ProductionMemory {
  bookId: string;
  decisions: DirectorDecision[];
  qualityHistory: number[];
  conflictHistory: PerformanceConflict[];
}

export interface ProductionDirective {
  id: string;
  blueprintId: string;
  targetId: string;
  directiveType: string;
  payload: any;
}

export interface ProductionTimeline {
  id: string;
  planId: string;
  timelineData: any[];
}

export interface AudiobookDirectorResult {
  success: boolean;
  masterPlan: AudiobookMasterPlan;
  blueprint: ProductionBlueprint;
  castingPlans: VoiceCastingPlan[];
  decisions: DirectorDecision[];
  risks: ProductionRisk[];
  reviews: DirectorReview[];
  qualityReport: ProductionQualityReport;
}
