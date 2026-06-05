import { IChapterRepository } from '@/domain/chapter/interfaces/IChapterRepository';
import { Chapter } from '@/domain/chapter/types';
import { supabaseAdmin } from '@/lib/supabase';

export class ChapterRepository implements IChapterRepository {
  async saveChapters(chapters: Chapter[]): Promise<void> {
    if (!chapters.length) return;
    
    const rows = chapters.map(ch => ({
      id: ch.id,
      book_id: ch.bookId,
      parent_id: ch.parentId || null,
      chapter_number: ch.metadata.detectedNumber,
      chapter_title: ch.title,
      chapter_type: ch.type,
      order_index: ch.orderIndex,
      start_position: ch.boundary.startPosition,
      end_position: ch.boundary.endPosition,
      start_line: ch.boundary.startLine,
      end_line: ch.boundary.endLine,
      content_length: ch.contentLength,
      word_count: ch.wordCount,
      character_count: ch.characterCount,
      detection_strategy: ch.detectionStrategy,
      confidence_score: ch.confidenceScore,
      fusion_confidence: ch.fusionConfidence || null,
      quality_score: ch.qualityScore || null,
      detection_evidence: ch.detectionEvidence || null,
      language_detected: ch.metadata.languageDetected,
      is_roman_numeral: ch.metadata.isRomanNumeral,
      is_tamil_numeral: ch.metadata.isTamilNumeral
    }));

    const { error } = await supabaseAdmin().from('chapters').insert(rows);
    if (error) throw new Error(`Bulk Chapter Insert Failed: ${error.message}`);
  }

  async getChaptersByBook(bookId: string): Promise<Chapter[]> {
    const { data, error } = await supabaseAdmin().from('chapters').select('*').eq('book_id', bookId).order('order_index', { ascending: true });
    if (error) throw new Error(error.message);
    return data.map(this.mapToDomain);
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    const { data, error } = await supabaseAdmin().from('chapters').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async updateChapter(chapter: Partial<Chapter> & { id: string }): Promise<void> {
    // Only mapping basic fields for brief implementation
    const updatePayload: any = {};
    if (chapter.title) updatePayload.chapter_title = chapter.title;
    if (chapter.type) updatePayload.chapter_type = chapter.type;
    
    const { error } = await supabaseAdmin().from('chapters').update(updatePayload).eq('id', chapter.id);
    if (error) throw new Error(error.message);
  }

  async deleteChapter(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('chapters').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteChaptersByBook(bookId: string): Promise<void> {
    const { error } = await supabaseAdmin().from('chapters').delete().eq('book_id', bookId);
    if (error) throw new Error(error.message);
  }

  private mapToDomain(row: any): Chapter {
    return {
      id: row.id,
      bookId: row.book_id,
      parentId: row.parent_id,
      type: row.chapter_type as any,
      title: row.chapter_title,
      orderIndex: row.order_index,
      boundary: {
        startPosition: row.start_position,
        endPosition: row.end_position,
        startLine: row.start_line || 0,
        endLine: row.end_line || 0,
        startWord: 0, endWord: 0
      },
      contentLength: row.content_length,
      wordCount: row.word_count,
      characterCount: row.character_count,
      detectionStrategy: row.detection_strategy,
      confidenceScore: row.confidence_score,
      fusionConfidence: row.fusion_confidence,
      qualityScore: row.quality_score,
      detectionEvidence: row.detection_evidence,
      metadata: {
        originalTitle: row.chapter_title,
        normalizedTitle: null,
        detectedNumber: row.chapter_number,
        isRomanNumeral: row.is_roman_numeral,
        isTamilNumeral: row.is_tamil_numeral,
        languageDetected: row.language_detected as any
      }
    };
  }
}
