import { CharacterProfile, CharacterAlias, CharacterMention, CharacterRelationship, CharacterTimeline } from '../types';

export interface ICharacterRepository {
  saveProfiles(profiles: CharacterProfile[]): Promise<void>;
  saveAliases(aliases: CharacterAlias[]): Promise<void>;
  saveMentions(mentions: CharacterMention[]): Promise<void>;
  saveRelationships(relationships: CharacterRelationship[]): Promise<void>;
  saveTimelines(timelines: CharacterTimeline[]): Promise<void>;
  
  getProfilesByBook(bookId: string): Promise<CharacterProfile[]>;
  getRelationshipsByBook(bookId: string): Promise<CharacterRelationship[]>;
  clearBookData(bookId: string): Promise<void>;
}
