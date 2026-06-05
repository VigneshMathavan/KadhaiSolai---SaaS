export interface SpeakerEvidence {
  evidenceText: string;
  verbUsed: string;
  proximity: number;
}

export interface ListenerEvidence {
  evidenceText: string;
  directionalityContext: string;
  proximity: number;
}

export interface DialogueSpeaker {
  characterId: string;
  confidenceScore: number;
  evidence: SpeakerEvidence;
}

export interface DialogueListener {
  characterId: string;
  confidenceScore: number;
  evidence: ListenerEvidence;
}

export interface DialogueBoundary {
  startPosition: number;
  endPosition: number;
}

export interface DialogueSegment {
  id?: string;
  dialogueId?: string;
  segmentText: string;
  boundary: DialogueBoundary;
}

export interface NarrationSegment {
  id?: string;
  bookId: string;
  chapterId: string;
  narrationText: string;
  boundary: DialogueBoundary;
}

export interface DialogueContext {
  precedingText: string;
  succeedingText: string;
}

export interface Dialogue {
  id: string;
  bookId: string;
  chapterId: string;
  conversationId?: string;
  dialogueText: string;
  boundary: DialogueBoundary;
  speaker?: DialogueSpeaker;
  listeners: DialogueListener[];
  segments: DialogueSegment[];
  context: DialogueContext;
  confidenceScore: number;
  detectionStrategy: string;
}

export interface ConversationTurn {
  dialogueId: string;
  turnIndex: number;
}

export interface ConversationParticipant {
  characterId: string;
}

export interface Conversation {
  id: string;
  bookId: string;
  chapterId: string;
  boundary: DialogueBoundary;
  participants: ConversationParticipant[];
  turns: ConversationTurn[];
  confidenceScore: number;
}

export interface DialogueExchange {
  conversationId: string;
  dialogues: Dialogue[];
}

export interface ConversationGraph {
  conversations: Conversation[];
  dialogues: Dialogue[];
}

export interface DialogueCandidate {
  dialogues: Dialogue[];
}

export interface DialogueConfidence {
  quotationScore: number;
  narrativeScore: number;
  structuralScore: number;
}

export interface DialogueDetectionResult {
  success: boolean;
  dialogues: Dialogue[];
  conversations: Conversation[];
  narrationSegments: NarrationSegment[];
  overallConfidence: number;
}

export interface DialogueQualityReport {
  bookId: string;
  traceId: string;
  dialogueCount: number;
  conversationCount: number;
  qualityScore: number;
  validationIssues: string[];
  processingTimeMs: number;
}

export interface DialogueEvaluationResult {
  precision: number;
  recall: number;
  f1: number;
}
