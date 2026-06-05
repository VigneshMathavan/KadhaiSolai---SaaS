import { CharacterProfile, CharacterAlias, CharacterMention, CharacterRelationship } from '../../types';

export interface CharacterExtractionCandidate {
  profiles: CharacterProfile[];
  aliases: CharacterAlias[];
  mentions: CharacterMention[];
  relationships: CharacterRelationship[];
}

export interface CharacterDetectionStrategy {
  name: string;
  detect(text: string, bookId: string, chapterId: string): Promise<CharacterExtractionCandidate>;
}
