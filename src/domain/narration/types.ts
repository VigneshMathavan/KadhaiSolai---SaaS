export interface NarrationPlan {
  id: string;
  bookId: string;
  chapterId: string;
  totalScenes: number;
  pacingScore: number;
  complexityScore: number;
  narrativeArc?: string;
  directorialIntent?: string;
  momentumScore?: number;
  sceneImportance?: number;
  sceneConnectivity?: number;
  arcPosition?: number;
}

export interface NarrationDirective {
  id: string;
  planId: string;
  targetType: 'SCENE' | 'DIALOGUE' | 'CHARACTER' | 'GLOBAL';
  targetId: string;
  directiveType: 'SCENE' | 'PAUSE' | 'EMPHASIS' | 'TRANSITION' | 'PERFORMANCE';
  payload: any;
}

export interface SceneDirective {
  id: string;
  directiveId: string;
  mood: string;
  energy: number;
  tension: number;
  pacing: string;
}

export interface PauseDirective {
  id: string;
  directiveId: string;
  position: number;
  durationMs: number;
  pauseType: 'SENTENCE' | 'PARAGRAPH' | 'SCENE' | 'DRAMATIC' | 'EMOTIONAL' | 'REFLECTION';
}

export interface EmphasisDirective {
  id: string;
  directiveId: string;
  startPosition: number;
  endPosition: number;
  emphasisLevel: number;
  emphasisType: 'EMOTIONAL' | 'REVELATION' | 'NAME' | 'PIVOT';
}

export interface TransitionDirective {
  id: string;
  directiveId: string;
  fromSceneId?: string;
  toSceneId?: string;
  transitionType: 'ABRUPT' | 'FADE' | 'SILENCE' | 'BUILDUP';
  durationMs: number;
}

export interface NarrationTimeline {
  id: string;
  planId: string;
  events: any[];
}

export interface NarrationQualityReport {
  id?: string;
  bookId: string;
  traceId: string;
  pacingQuality: number;
  pauseQuality: number;
  transitionQuality: number;
  performanceQuality: number;
  overallScore: number;
  validationIssues: string[];
}

export interface NarrationAgentResult {
  success: boolean;
  plan: NarrationPlan;
  directives: NarrationDirective[];
  sceneDirectives: SceneDirective[];
  pauseDirectives: PauseDirective[];
  emphasisDirectives: EmphasisDirective[];
  transitionDirectives: TransitionDirective[];
  timeline: NarrationTimeline;
  qualityReport: NarrationQualityReport;
}

export interface NarrationMemory {
  chapterId: string;
  avgPacing: number;
  avgIntensity: number;
  dominantMood: string;
}

export interface ScenePerformanceProfile {
  sceneId: string;
  deliveryStyle: string;
  energy: number;
}

export interface CharacterPerformanceProfile {
  characterId: string;
  deliveryStyle: string;
  basePace: string;
  baseEnergy: number;
}

export interface NarrationState {
  currentPace: number;
  currentEnergy: number;
  currentTension: number;
}

export interface NarrationContext {
  previousSceneMood?: string;
  previousPace?: number;
  continuityScore: number;
}

export interface NarrationReasoning {
  targetId: string;
  reasoningType: string;
  explanation: string;
}

export interface NarrationSnapshot {
  timestamp: number;
  state: NarrationState;
}

export interface NarrationEvidence {
  sourceType: string;
  evidenceText: string;
}

export interface NarrationTransition {
  from: string;
  to: string;
  type: string;
}

// ---------------------------------------------------------
// Phase 5: Director Readiness Extensions
// ---------------------------------------------------------

export interface NarrativeSceneNode {
  sceneId: string;
  chapterId: string;
}

export interface SceneRelationship {
  sourceScene: string;
  targetScene: string;
  relationshipType: 'PRECEDES' | 'FOLLOWS' | 'CAUSES' | 'REFERENCES' | 'ESCALATES' | 'RESOLVES' | 'CONTRASTS' | 'FORESHADOWS' | 'CALLBACK';
  weight: number;
}

export interface NarrativeSceneGraph {
  id: string;
  bookId: string;
  nodes: NarrativeSceneNode[];
  edges: SceneRelationship[];
  connectivityScore: number;
}

export interface SceneGraphSnapshot {
  graph: NarrativeSceneGraph;
  timestamp: number;
}

export interface NarrativeArc {
  id: string;
  bookId: string;
  chapterId: string;
  arcType: 'Introduction' | 'Inciting Incident' | 'Rising Action' | 'Conflict' | 'Crisis' | 'Climax' | 'Resolution' | 'Epilogue';
  arcPosition: number;
  arcConfidence: number;
  arcTransition?: string;
}

export interface IntentEvidence {
  sourceType: string;
  evidenceText: string;
}

export interface IntentReasoning {
  explanation: string;
  evidence: IntentEvidence[];
}

export interface DirectorialIntent {
  id: string;
  bookId: string;
  chapterId: string;
  sceneId: string;
  intentType: 'Build Suspense' | 'Build Mystery' | 'Build Romance' | 'Build Emotional Release' | 'Build Grief' | 'Build Fear' | 'Build Wonder' | 'Build Celebration' | 'Build Conflict' | 'Build Tension' | 'Build Curiosity' | 'Build Resolution' | 'Build Hope' | 'Build Tragedy' | 'Build Reverence' | 'Build Spirituality';
  confidence: number;
  reasoning: IntentReasoning;
}

export interface MomentumProfile {
  id: string;
  bookId: string;
  chapterId: string;
  momentumScore: number;
  momentumDirection: 'ACCELERATING' | 'DECELERATING' | 'STABLE';
  momentumTrend: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  momentumVelocity: number;
}

export interface ImportanceReasoning {
  factors: string[];
  explanation: string;
}

export interface SceneImportanceReport {
  id: string;
  bookId: string;
  chapterId: string;
  sceneId: string;
  importanceScore: number;
  reasoning: ImportanceReasoning;
}

