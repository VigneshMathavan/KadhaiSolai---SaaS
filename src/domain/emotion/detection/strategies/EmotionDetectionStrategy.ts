import { EmotionState } from '../../types';

export interface EmotionDetectionStrategy {
  name: string;
  detect(text: string, bookId: string, chapterId: string, contextData: any): Promise<EmotionState[]>;
}
