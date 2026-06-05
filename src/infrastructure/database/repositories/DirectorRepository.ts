import { IDirectorRepository } from '@/domain/director/interfaces/IDirectorRepository';
import { AudiobookMasterPlan, ProductionBlueprint, VoiceCastingPlan, DirectorDecision, ProductionRisk, DirectorReview, ProductionQualityReport, ProductionDirective, ProductionTimeline } from '@/domain/director/types';
import { supabaseAdmin } from '@/lib/supabase';

export class DirectorRepository implements IDirectorRepository {
  async saveMasterPlan(plan: AudiobookMasterPlan): Promise<void> {
    const { error } = await supabaseAdmin().from('audiobook_master_plans').insert({
       id: plan.id,
       book_id: plan.bookId,
       version: plan.version,
       global_objectives: plan.globalObjectives,
       continuity_rules: plan.continuityRules,
       performance_rules: plan.performanceRules,
       quality_rules: plan.qualityRules
    });
    if (error) throw new Error(`Plan insert failed: ${error.message}`);
  }

  async saveBlueprint(blueprint: ProductionBlueprint): Promise<void> {
    const { error } = await supabaseAdmin().from('production_blueprints').insert({
       id: blueprint.id,
       plan_id: blueprint.planId,
       chapter_plans: blueprint.chapterPlans,
       scene_plans: blueprint.scenePlans,
       character_plans: blueprint.characterPlans
    });
    if (error) throw new Error(`Blueprint insert failed: ${error.message}`);
  }

  async saveProductionDirectives(directives: ProductionDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       blueprint_id: d.blueprintId,
       target_id: d.targetId,
       directive_type: d.directiveType,
       payload: d.payload
    }));
    const { error } = await supabaseAdmin().from('production_directives').insert(rows);
    if (error) throw new Error(`Directives insert failed: ${error.message}`);
  }

  async saveCastingPlans(plans: VoiceCastingPlan[]): Promise<void> {
    if (plans.length === 0) return;
    const rows = plans.map(p => ({
       id: p.id,
       plan_id: p.planId,
       character_id: p.characterId,
       voice_archetype: p.voiceArchetype,
       casting_confidence: p.castingConfidence,
       casting_reasoning: p.castingReasoning
    }));
    const { error } = await supabaseAdmin().from('voice_casting_plans').insert(rows);
    if (error) throw new Error(`Casting insert failed: ${error.message}`);
  }

  async saveTimeline(timeline: ProductionTimeline): Promise<void> {
    const { error } = await supabaseAdmin().from('production_timelines').insert({
       id: timeline.id,
       plan_id: timeline.planId,
       timeline_data: timeline.timelineData
    });
    if (error) throw new Error(`Timeline insert failed: ${error.message}`);
  }

  async saveDecisions(decisions: DirectorDecision[]): Promise<void> {
    if (decisions.length === 0) return;
    const rows = decisions.map(d => ({
       id: d.id,
       plan_id: d.planId,
       decision_type: d.decisionType,
       confidence: d.confidence,
       reasoning: d.reasoning,
       evidence: d.evidence
    }));
    const { error } = await supabaseAdmin().from('director_decisions').insert(rows);
    if (error) throw new Error(`Decisions insert failed: ${error.message}`);
  }

  async saveReviews(reviews: DirectorReview[]): Promise<void> {
    if (reviews.length === 0) return;
    const rows = reviews.map(r => ({
       id: r.id,
       plan_id: r.planId,
       review_status: r.reviewStatus,
       feedback: r.feedback
    }));
    const { error } = await supabaseAdmin().from('director_reviews').insert(rows);
    if (error) throw new Error(`Reviews insert failed: ${error.message}`);
  }

  async saveRisks(risks: ProductionRisk[]): Promise<void> {
    if (risks.length === 0) return;
    const rows = risks.map(r => ({
       id: r.id,
       plan_id: r.planId,
       risk_type: r.riskType,
       severity: r.severity,
       description: r.description,
       mitigation: r.mitigation
    }));
    const { error } = await supabaseAdmin().from('production_risks').insert(rows);
    if (error) throw new Error(`Risks insert failed: ${error.message}`);
  }

  async saveQualityReport(report: ProductionQualityReport): Promise<void> {
    const { error } = await supabaseAdmin().from('production_quality_reports').insert({
       plan_id: report.planId,
       trace_id: report.traceId,
       casting_quality: report.castingQuality,
       consistency_quality: report.consistencyQuality,
       resolution_quality: report.resolutionQuality,
       overall_score: report.overallScore
    });
    if (error) throw new Error(`Quality Report insert failed: ${error.message}`);
  }
}
