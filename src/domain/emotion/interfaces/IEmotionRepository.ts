import { EmotionState, EmotionProfile, EmotionTransition, PerformanceDirective, EmotionTimeline, EmotionQualityReport } from '../types';

export interface IEmotionRepository {
  saveEmotions(emotions: EmotionState[]): Promise<void>;
  saveProfiles(profiles: EmotionProfile[]): Promise<void>;
  saveTransitions(transitions: EmotionTransition[]): Promise<void>;
  saveDirectives(directives: PerformanceDirective[]): Promise<void>;
  saveTimelines(timelines: EmotionTimeline[]): Promise<void>;
  saveQualityReport(report: EmotionQualityReport): Promise<void>;
  clearChapterEmotions(chapterId: string): Promise<void>;
}
