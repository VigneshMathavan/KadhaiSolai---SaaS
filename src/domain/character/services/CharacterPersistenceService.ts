import { ICharacterRepository } from '../interfaces/ICharacterRepository';
import { CharacterDetectionResult } from '../types';

export class CharacterPersistenceService {
  constructor(private readonly repository: ICharacterRepository) {}

  async saveDetectionResult(result: CharacterDetectionResult, bookId: string, traceId: string): Promise<void> {
    if (!result.success || result.profiles.length === 0) return;

    try {
      // Clear old passes
      await this.repository.clearBookData(bookId);

      // Save Core Profiles
      await this.repository.saveProfiles(result.profiles);

      // Collect Sub-Entities
      const aliases = result.profiles.flatMap(p => p.aliases.map(a => ({ ...a, characterId: p.id })));
      
      // Since mentions are extracted before profiles exist, map the ID back if possible
      // (In a full prod flow, ID mapping is done in Fusion)
      const mappedMentions = result.mentions.filter(m => m.characterId);
      
      // Save Sub-Entities
      await Promise.all([
        this.repository.saveAliases(aliases),
        this.repository.saveMentions(mappedMentions),
        this.repository.saveRelationships(result.relationships),
        this.repository.saveTimelines(result.timelines)
      ]);

      console.log(JSON.stringify({ event: 'CharacterPersistenceSuccess', traceId, bookId }));
    } catch (error: any) {
      console.error(JSON.stringify({ event: 'CharacterPersistenceFailed', traceId, bookId, error: error.message }));
      throw error;
    }
  }
}
