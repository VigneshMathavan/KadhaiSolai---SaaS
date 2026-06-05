import { Chapter, ChapterDetectionResult } from '../../types';

export interface ChapterDetectionStrategy {
  name: string;
  detect(text: string, bookId: string): Promise<ChapterDetectionResult>;
}
