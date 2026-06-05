import { INarrationRepository } from '@/domain/narration/interfaces/INarrationRepository';
import { NarrationPlan, NarrationDirective, SceneDirective, PauseDirective, EmphasisDirective, TransitionDirective, NarrationTimeline, NarrationQualityReport, NarrativeArc, NarrativeSceneGraph, DirectorialIntent, MomentumProfile, SceneImportanceReport } from '@/domain/narration/types';
import { supabaseAdmin } from '@/lib/supabase';

export class NarrationRepository implements INarrationRepository {
  async savePlan(plan: NarrationPlan): Promise<void> {
    const { error } = await supabaseAdmin().from('narration_plans').insert({
       id: plan.id,
       book_id: plan.bookId,
       chapter_id: plan.chapterId,
       total_scenes: plan.totalScenes,
       pacing_score: plan.pacingScore,
       complexity_score: plan.complexityScore,
       narrative_arc: plan.narrativeArc,
       directorial_intent: plan.directorialIntent,
       momentum_score: plan.momentumScore,
       scene_importance: plan.sceneImportance,
       scene_connectivity: plan.sceneConnectivity,
       arc_position: plan.arcPosition
    });
    if (error) throw new Error(`Plan insert failed: ${error.message}`);
  }

  async saveDirectives(directives: NarrationDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       plan_id: d.planId,
       target_type: d.targetType,
       target_id: d.targetId,
       directive_type: d.directiveType,
       payload: d.payload
    }));
    const { error } = await supabaseAdmin().from('narration_directives').insert(rows);
    if (error) throw new Error(`Directives insert failed: ${error.message}`);
  }

  async saveSceneDirectives(directives: SceneDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       directive_id: d.directiveId,
       mood: d.mood,
       energy: d.energy,
       tension: d.tension,
       pacing: d.pacing
    }));
    const { error } = await supabaseAdmin().from('scene_directives').insert(rows);
    if (error) throw new Error(`Scene directives insert failed: ${error.message}`);
  }

  async savePauseDirectives(directives: PauseDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       directive_id: d.directiveId,
       position: d.position,
       duration_ms: d.durationMs,
       pause_type: d.pauseType
    }));
    const { error } = await supabaseAdmin().from('pause_directives').insert(rows);
    if (error) throw new Error(`Pause directives insert failed: ${error.message}`);
  }

  async saveEmphasisDirectives(directives: EmphasisDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       directive_id: d.directiveId,
       start_position: d.startPosition,
       end_position: d.endPosition,
       emphasis_level: d.emphasisLevel,
       emphasis_type: d.emphasisType
    }));
    const { error } = await supabaseAdmin().from('emphasis_directives').insert(rows);
    if (error) throw new Error(`Emphasis directives insert failed: ${error.message}`);
  }

  async saveTransitionDirectives(directives: TransitionDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       directive_id: d.directiveId,
       from_scene: d.fromSceneId || null,
       to_scene: d.toSceneId || null,
       transition_type: d.transitionType,
       duration_ms: d.durationMs
    }));
    const { error } = await supabaseAdmin().from('transition_directives').insert(rows);
    if (error) throw new Error(`Transition directives insert failed: ${error.message}`);
  }

  async saveTimeline(timeline: NarrationTimeline): Promise<void> {
    const { error } = await supabaseAdmin().from('narration_timelines').insert({
       id: timeline.id,
       plan_id: timeline.planId,
       timeline_data: timeline.events
    });
    if (error) throw new Error(`Timeline insert failed: ${error.message}`);
  }

  async saveQualityReport(report: NarrationQualityReport): Promise<void> {
    const { error } = await supabaseAdmin().from('narration_quality_reports').insert({
       book_id: report.bookId,
       trace_id: report.traceId,
       pacing_quality: report.pacingQuality,
       pause_quality: report.pauseQuality,
       transition_quality: report.transitionQuality,
       performance_quality: report.performanceQuality,
       overall_score: report.overallScore,
       validation_issues: report.validationIssues
    });
    if (error) throw new Error(`Quality report insert failed: ${error.message}`);
  }

  async saveNarrativeArc(arc: NarrativeArc): Promise<void> {
    const { error } = await supabaseAdmin().from('narrative_arcs').insert({
       id: arc.id,
       book_id: arc.bookId,
       chapter_id: arc.chapterId,
       arc_type: arc.arcType,
       arc_position: arc.arcPosition,
       arc_confidence: arc.arcConfidence
    });
    if (error) throw new Error(`Arc insert failed: ${error.message}`);
  }

  async saveSceneGraph(graph: NarrativeSceneGraph): Promise<void> {
    const { error } = await supabaseAdmin().from('scene_graphs').insert({
       id: graph.id,
       book_id: graph.bookId,
       graph_snapshot: { nodes: graph.nodes, edges: graph.edges },
       connectivity_score: graph.connectivityScore
    });
    if (error) throw new Error(`Graph insert failed: ${error.message}`);
    
    if (graph.edges.length > 0) {
       const rows = graph.edges.map(e => ({
          id: crypto.randomUUID(),
          graph_id: graph.id,
          source_scene: e.sourceScene,
          target_scene: e.targetScene,
          relationship_type: e.relationshipType,
          weight: e.weight
       }));
       await supabaseAdmin().from('scene_relationships').insert(rows);
    }
  }

  async saveDirectorialIntent(intent: DirectorialIntent): Promise<void> {
    const { error } = await supabaseAdmin().from('directorial_intents').insert({
       id: intent.id,
       book_id: intent.bookId,
       chapter_id: intent.chapterId,
       scene_id: intent.sceneId,
       intent_type: intent.intentType,
       confidence: intent.confidence,
       reasoning: intent.reasoning
    });
    if (error) throw new Error(`Intent insert failed: ${error.message}`);
  }

  async saveMomentumProfile(profile: MomentumProfile): Promise<void> {
    const { error } = await supabaseAdmin().from('momentum_profiles').insert({
       id: profile.id,
       book_id: profile.bookId,
       chapter_id: profile.chapterId,
       momentum_score: profile.momentumScore,
       momentum_direction: profile.momentumDirection,
       momentum_trend: profile.momentumTrend,
       momentum_velocity: profile.momentumVelocity
    });
    if (error) throw new Error(`Momentum insert failed: ${error.message}`);
  }

  async saveSceneImportance(report: SceneImportanceReport): Promise<void> {
    const { error } = await supabaseAdmin().from('scene_importance_reports').insert({
       id: report.id,
       book_id: report.bookId,
       chapter_id: report.chapterId,
       scene_id: report.sceneId,
       importance_score: report.importanceScore,
       reasoning: report.reasoning
    });
    if (error) throw new Error(`Importance insert failed: ${error.message}`);
  }

  async clearChapterNarration(chapterId: string): Promise<void> {
    const { error } = await supabaseAdmin().from('narration_plans').delete().eq('chapter_id', chapterId);
    if (error) throw new Error(`Clear narration failed: ${error.message}`);
  }
}
