import { AudiobookMasterPlan, ProductionBlueprint, VoiceCastingPlan, DirectorDecision, ProductionRisk, DirectorReview, ProductionQualityReport, ProductionDirective, ProductionTimeline } from '../types';

export interface IDirectorRepository {
  saveMasterPlan(plan: AudiobookMasterPlan): Promise<void>;
  saveBlueprint(blueprint: ProductionBlueprint): Promise<void>;
  saveProductionDirectives(directives: ProductionDirective[]): Promise<void>;
  saveCastingPlans(plans: VoiceCastingPlan[]): Promise<void>;
  saveTimeline(timeline: ProductionTimeline): Promise<void>;
  saveDecisions(decisions: DirectorDecision[]): Promise<void>;
  saveReviews(reviews: DirectorReview[]): Promise<void>;
  saveRisks(risks: ProductionRisk[]): Promise<void>;
  saveQualityReport(report: ProductionQualityReport): Promise<void>;
}
