import { IChapterRepository } from '../interfaces/IChapterRepository';
import { Chapter } from '../types';

export class ChapterPersistenceService {
  constructor(private readonly repository: IChapterRepository) {}

  async saveDetectedChapters(chapters: Chapter[], bookId: string, traceId: string): Promise<void> {
    const startTime = Date.now();
    try {
      // Clean slate for re-detection scenarios
      await this.repository.deleteChaptersByBook(bookId);
      await this.repository.saveChapters(chapters);

      this.logAudit({
        traceId, bookId, chapterCount: chapters.length, 
        processingTime: Date.now() - startTime, status: 'SUCCESS'
      });
    } catch (error: any) {
      this.logAudit({
        traceId, bookId, chapterCount: chapters.length, 
        processingTime: Date.now() - startTime, status: 'FAILED', error: error.message
      });
      throw error;
    }
  }

  async getBookHierarchy(bookId: string): Promise<Chapter[]> {
    return this.repository.getChaptersByBook(bookId);
  }
  
  async getChapter(id: string): Promise<Chapter | null> {
    return this.repository.getChapterById(id);
  }

  private logAudit(payload: Record<string, any>) {
    console.log(JSON.stringify({ event: 'ChapterPersistenceAudit', ...payload }));
  }
}
