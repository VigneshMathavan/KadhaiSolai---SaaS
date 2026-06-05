export type EmotionType = 'JOY' | 'HAPPINESS' | 'LOVE' | 'AFFECTION' | 'EXCITEMENT' | 'HOPE' | 'RELIEF' | 'PRIDE' | 'GRATITUDE' | 'CALM' | 'FEAR' | 'ANXIETY' | 'PANIC' | 'ANGER' | 'RAGE' | 'FRUSTRATION' | 'SADNESS' | 'GRIEF' | 'LONELINESS' | 'GUILT' | 'SHAME' | 'REGRET' | 'SURPRISE' | 'CONFUSION' | 'DISGUST' | 'ADMIRATION' | 'RESPECT' | 'JEALOUSY' | 'ENVY' | 'DETERMINATION' | 'CURIOSITY' | 'NEUTRAL';

export interface EmotionEvidence {
  evidenceText: string;
  sourceType: 'LEXICAL' | 'DIALOGUE' | 'CONTEXT' | 'RELATIONSHIP' | 'MEMORY' | 'NARRATIVE';
  position: number;
}

export interface EmotionReasoning {
  explanation: string;
  trigger?: string;
  evidence: EmotionEvidence[];
}

export interface EmotionIntensity {
  level: number; // 0.0 to 1.0
  trend: 'RISING' | 'FALLING' | 'STABLE';
}

export interface EmotionState {
  id?: string;
  bookId: string;
  chapterId: string;
  characterId?: string;
  conversationId?: string;
  dialogueId?: string;
  emotionType: EmotionType;
  intensity: EmotionIntensity;
  confidenceScore: number;
  startPosition: number;
  endPosition: number;
  reasoning: EmotionReasoning;
}

export interface EmotionProfile {
  id?: string;
  bookId: string;
  chapterId: string;
  targetType: 'CHARACTER' | 'SCENE' | 'CONVERSATION';
  targetId: string;
  dominantEmotion: EmotionType;
  volatility: number; // 0.0 to 1.0
  emotionalStateHistory: EmotionState[];
}

export interface CharacterEmotionProfile extends EmotionProfile {
  targetType: 'CHARACTER';
}

export interface SceneEmotionProfile extends EmotionProfile {
  targetType: 'SCENE';
  atmosphere: string;
}

export interface ConversationEmotionProfile extends EmotionProfile {
  targetType: 'CONVERSATION';
  conflictLevel: number;
  alignmentLevel: number;
}

export interface EmotionTransition {
  id?: string;
  bookId: string;
  targetId: string;
  fromEmotion: EmotionType;
  toEmotion: EmotionType;
  transitionReason: string;
  transitionTimestamp: number; // document position
}

export interface PerformanceDirective {
  id?: string;
  emotionId: string;
  dialogueId?: string;
  speechPace: 'SLOW' | 'NORMAL' | 'FAST' | 'RAPID';
  pauseIntensity: 'NONE' | 'SHORT' | 'LONG' | 'DRAMATIC';
  emphasisLevel: number; // 0.0 to 1.0
  energyLevel: number; // 0.0 to 1.0
  voiceTension: number; // 0.0 to 1.0
  dramaticIntensity: number; // 0.0 to 1.0
  emotionalWeight: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'CRUSHING';
}

export interface EmotionEvent {
  eventType: 'APPEARANCE' | 'PEAK' | 'DECAY' | 'TRANSITION';
  emotionType: EmotionType;
  position: number;
}

export interface EmotionTimeline {
  id?: string;
  bookId: string;
  targetId: string;
  events: EmotionEvent[];
}

export interface EmotionMemory {
  characterId: string;
  persistentEmotions: EmotionType[];
  lastTraumaticEventPosition?: number;
  lastJoyousEventPosition?: number;
}

export interface EmotionConfidence {
  lexicalScore: number;
  dialogueScore: number;
  contextScore: number;
  relationshipScore: number;
  memoryScore: number;
  narrativeScore: number;
}

export interface EmotionQualityReport {
  bookId: string;
  traceId: string;
  emotionsDetected: number;
  transitionsDetected: number;
  qualityScore: number;
  processingTimeMs: number;
  validationIssues: string[];
}

export interface EmotionAgentResult {
  success: boolean;
  emotions: EmotionState[];
  profiles: EmotionProfile[];
  transitions: EmotionTransition[];
  directives: PerformanceDirective[];
  timelines: EmotionTimeline[];
  qualityReport: EmotionQualityReport;
  traceId: string;
}

export interface EmotionWeightBreakdown {
  lexicalWeight: number;
  dialogueWeight: number;
  contextWeight: number;
  relationshipWeight: number;
  memoryWeight: number;
  narrativeWeight: number;
}

export interface WeightedEmotionEvidence {
  emotionType: EmotionType;
  baseConfidence: number;
  weightedConfidence: number;
  breakdown: EmotionWeightBreakdown;
  evidence: EmotionEvidence[];
}

export interface EmotionConflictResolution {
  primaryEmotion: EmotionType;
  secondaryEmotion?: EmotionType;
  dominantEmotion: EmotionType;
  blendedEmotion?: string;
  confidence: number;
}

export interface EmotionPersistenceScore {
  lifespan: number;
  decayScore: number;
  reactivationScore: number;
  persistenceScore: number;
}

