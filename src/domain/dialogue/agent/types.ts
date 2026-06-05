import { Dialogue, Conversation } from '../types';

export type ConversationStateType = 'STARTED' | 'ACTIVE' | 'INTERRUPTED' | 'PAUSED' | 'RESUMED' | 'ENDED' | 'ABANDONED';

export interface ConversationState {
  conversationId: string;
  state: ConversationStateType;
  transitionReason?: string;
  updatedAt: number;
}

export interface ConversationSnapshot {
  timestamp: number;
  participants: string[];
  lastTopic?: string;
  topicContinuityScore: number;
}

export interface DialogueMemory {
  currentSpeakerId?: string;
  currentListenerId?: string;
  turnCount: number;
  lastDialogueId?: string;
  snapshot: ConversationSnapshot;
}

export interface ConversationReference {
  sourceDialogueId: string;
  targetConversationId: string;
  evidence: string;
}

export interface LongRangeReference {
  sourceDialogueId: string;
  targetDialogueId?: string;
  targetConversationId?: string;
  referenceConfidence: number;
  referenceDistance: number;
  evidence: string;
}

export interface DialogueEvent {
  type: string;
  dialogueId: string;
  timestamp: number;
}

export interface DialogueTransition {
  fromState: ConversationStateType;
  toState: ConversationStateType;
  reason: string;
}

export interface ConversationContinuation {
  originalConversationId: string;
  resumedConversationId: string;
  gapSize: number;
}

export interface DialogueContextScore {
  contextRetention: number;
  speakerContinuity: number;
  listenerContinuity: number;
}

export interface ConversationHistory {
  conversationId: string;
  states: ConversationState[];
  events: DialogueEvent[];
}

export interface ContextWindow {
  precedingDialogues: string[];
  succeedingDialogues: string[];
  timeGap: number;
}

export interface DialogueTimeline {
  conversationId: string;
  startTime: number;
  endTime: number;
  events: DialogueEvent[];
}

export interface DialogueMemoryReport {
  bookId: string;
  traceId: string;
  memoryContinuityScore: number;
  speakerContinuityScore: number;
  listenerContinuityScore: number;
  longRangeConsistencyScore: number;
}

export interface DialogueAgentResult {
  success: boolean;
  dialogues: Dialogue[];
  conversations: Conversation[];
  memories: Map<string, DialogueMemory>;
  states: Map<string, ConversationState>;
  longRangeReferences: LongRangeReference[];
  memoryReport: DialogueMemoryReport;
  traceId: string;
}
