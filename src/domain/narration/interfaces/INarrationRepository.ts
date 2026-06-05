import { NarrationPlan, NarrationDirective, SceneDirective, PauseDirective, EmphasisDirective, TransitionDirective, NarrationTimeline, NarrationQualityReport, NarrativeArc, NarrativeSceneGraph, DirectorialIntent, MomentumProfile, SceneImportanceReport } from '../types';

export interface INarrationRepository {
  savePlan(plan: NarrationPlan): Promise<void>;
  saveDirectives(directives: NarrationDirective[]): Promise<void>;
  saveSceneDirectives(directives: SceneDirective[]): Promise<void>;
  savePauseDirectives(directives: PauseDirective[]): Promise<void>;
  saveEmphasisDirectives(directives: EmphasisDirective[]): Promise<void>;
  saveTransitionDirectives(directives: TransitionDirective[]): Promise<void>;
  saveTimeline(timeline: NarrationTimeline): Promise<void>;
  saveQualityReport(report: NarrationQualityReport): Promise<void>;
  saveNarrativeArc(arc: NarrativeArc): Promise<void>;
  saveSceneGraph(graph: NarrativeSceneGraph): Promise<void>;
  saveDirectorialIntent(intent: DirectorialIntent): Promise<void>;
  saveMomentumProfile(profile: MomentumProfile): Promise<void>;
  saveSceneImportance(report: SceneImportanceReport): Promise<void>;
  clearChapterNarration(chapterId: string): Promise<void>;
}
