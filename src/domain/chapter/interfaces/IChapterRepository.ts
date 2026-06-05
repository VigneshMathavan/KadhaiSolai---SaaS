import { Chapter } from '../types';

export interface IChapterRepository {
  saveChapters(chapters: Chapter[]): Promise<void>;
  getChaptersByBook(bookId: string): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | null>;
  updateChapter(chapter: Partial<Chapter> & { id: string }): Promise<void>;
  deleteChapter(id: string): Promise<void>;
  deleteChaptersByBook(bookId: string): Promise<void>;
}
