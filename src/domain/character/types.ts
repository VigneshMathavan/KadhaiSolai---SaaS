export interface CharacterMention {
  id?: string;
  characterId?: string;
  chapterId: string;
  startPosition: number;
  endPosition: number;
  contextText: string;
}

export interface CharacterAlias {
  id?: string;
  characterId?: string;
  aliasName: string;
  confidenceScore: number;
  sourceStrategy: string;
}

export interface CharacterAttribute {
  id?: string;
  characterId?: string;
  attributeType: string;
  attributeValue: string;
  confidenceScore: number;
}

export interface CharacterRelationship {
  id?: string;
  characterAId: string;
  characterBId: string;
  relationshipType: string;
  confidenceScore: number;
  evidence: string;
  frequency: number;
  directionality: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL';
  sourceChapters: string[];
}

export interface CharacterTimeline {
  id?: string;
  characterId?: string;
  chapterId: string;
  appearanceCount: number;
  narrativeWeight: number;
}

export interface CharacterProfile {
  id: string;
  bookId: string;
  name: string;
  normalizedName: string;
  confidenceScore: number;
  importanceScore: number;
  mentionCount: number;
  firstAppearance: number;
  lastAppearance: number;
  aliases: CharacterAlias[];
  attributes: CharacterAttribute[];
}

export interface CharacterGraph {
  nodes: CharacterProfile[];
  edges: CharacterRelationship[];
}

export interface SpeakerCandidate {
  characterId: string;
  confidence: number;
  evidence: string;
}

export interface CharacterDetectionResult {
  success: boolean;
  profiles: CharacterProfile[];
  relationships: CharacterRelationship[];
  mentions: CharacterMention[];
  timelines: CharacterTimeline[];
  overallConfidence: number;
  error?: Error;
}

export interface CharacterConfidence {
  identityScore: number;
  aliasScore: number;
  relationshipScore: number;
}
