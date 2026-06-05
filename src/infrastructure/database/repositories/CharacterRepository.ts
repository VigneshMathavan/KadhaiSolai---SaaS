import { ICharacterRepository } from '@/domain/character/interfaces/ICharacterRepository';
import { CharacterProfile, CharacterAlias, CharacterMention, CharacterRelationship, CharacterTimeline } from '@/domain/character/types';
import { supabaseAdmin } from '@/lib/supabase';

export class CharacterRepository implements ICharacterRepository {
  async saveProfiles(profiles: CharacterProfile[]): Promise<void> {
    if (!profiles.length) return;
    
    const rows = profiles.map(p => ({
      id: p.id,
      book_id: p.bookId,
      name: p.name,
      normalized_name: p.normalizedName,
      confidence_score: p.confidenceScore,
      importance_score: p.importanceScore,
      mention_count: p.mentionCount,
      first_appearance: p.firstAppearance,
      last_appearance: p.lastAppearance
    }));

    const { error } = await supabaseAdmin().from('characters').insert(rows);
    if (error) throw new Error(`Profiles insert failed: ${error.message}`);
  }

  async saveAliases(aliases: CharacterAlias[]): Promise<void> {
    if (!aliases.length) return;
    
    const rows = aliases.map(a => ({
      id: a.id,
      character_id: a.characterId,
      alias_name: a.aliasName,
      confidence_score: a.confidenceScore,
      source_strategy: a.sourceStrategy
    }));

    const { error } = await supabaseAdmin().from('character_aliases').insert(rows);
    if (error) throw new Error(`Aliases insert failed: ${error.message}`);
  }

  async saveMentions(mentions: CharacterMention[]): Promise<void> {
    if (!mentions.length) return;
    
    const rows = mentions.map(m => ({
      id: m.id,
      character_id: m.characterId,
      chapter_id: m.chapterId,
      start_position: m.startPosition,
      end_position: m.endPosition,
      context_text: m.contextText
    }));

    const { error } = await supabaseAdmin().from('character_mentions').insert(rows);
    if (error) throw new Error(`Mentions insert failed: ${error.message}`);
  }

  async saveRelationships(relationships: CharacterRelationship[]): Promise<void> {
    if (!relationships.length) return;
    
    const rows = relationships.map(r => ({
      id: r.id,
      character_a_id: r.characterAId,
      character_b_id: r.characterBId,
      relationship_type: r.relationshipType,
      confidence_score: r.confidenceScore,
      evidence: r.evidence,
      frequency: r.frequency,
      directionality: r.directionality,
      source_chapters: r.sourceChapters
    }));

    const { error } = await supabaseAdmin().from('character_relationships').insert(rows);
    if (error) throw new Error(`Relationships insert failed: ${error.message}`);
  }

  async saveTimelines(timelines: CharacterTimeline[]): Promise<void> {
    if (!timelines.length) return;
    
    const rows = timelines.map(t => ({
      id: t.id,
      character_id: t.characterId,
      chapter_id: t.chapterId,
      appearance_count: t.appearanceCount,
      narrative_weight: t.narrativeWeight
    }));

    const { error } = await supabaseAdmin().from('character_timelines').insert(rows);
    if (error) throw new Error(`Timelines insert failed: ${error.message}`);
  }

  async clearBookData(bookId: string): Promise<void> {
    // Cascades on characters will handle the rest
    const { error } = await supabaseAdmin().from('characters').delete().eq('book_id', bookId);
    if (error) throw new Error(error.message);
  }

  async getProfilesByBook(bookId: string): Promise<CharacterProfile[]> {
    const { data, error } = await supabaseAdmin().from('characters').select('*').eq('book_id', bookId);
    if (error) throw new Error(error.message);
    
    return data.map((row: any) => ({
      id: row.id,
      bookId: row.book_id,
      name: row.name,
      normalizedName: row.normalized_name,
      confidenceScore: row.confidence_score,
      importanceScore: row.importance_score,
      mentionCount: row.mention_count,
      firstAppearance: row.first_appearance,
      lastAppearance: row.last_appearance,
      aliases: [], attributes: []
    }));
  }

  async getRelationshipsByBook(bookId: string): Promise<CharacterRelationship[]> {
     // Implementation requires join to characters. Simplified for foundation:
     return [];
  }
}
