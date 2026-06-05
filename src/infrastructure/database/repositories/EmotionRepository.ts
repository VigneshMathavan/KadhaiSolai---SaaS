import { IEmotionRepository } from '@/domain/emotion/interfaces/IEmotionRepository';
import { EmotionState, EmotionProfile, EmotionTransition, PerformanceDirective, EmotionTimeline, EmotionQualityReport } from '@/domain/emotion/types';
import { supabaseAdmin } from '@/lib/supabase';

export class EmotionRepository implements IEmotionRepository {
  async saveEmotions(emotions: EmotionState[]): Promise<void> {
    if (emotions.length === 0) return;
    const rows = emotions.map(e => ({
       id: e.id,
       book_id: e.bookId,
       chapter_id: e.chapterId,
       character_id: e.characterId || null,
       conversation_id: e.conversationId || null,
       dialogue_id: e.dialogueId || null,
       emotion_type: e.emotionType,
       intensity: e.intensity.level,
       confidence_score: e.confidenceScore,
       start_position: e.startPosition,
       end_position: e.endPosition,
       reasoning: e.reasoning
    }));
    const { error } = await supabaseAdmin().from('emotions').insert(rows);
    if (error) throw new Error(`Emotion insert failed: ${error.message}`);
  }

  async saveProfiles(profiles: EmotionProfile[]): Promise<void> {
    if (profiles.length === 0) return;
    const rows = profiles.map(p => ({
       id: p.id,
       book_id: p.bookId,
       chapter_id: p.chapterId,
       target_type: p.targetType,
       target_id: p.targetId,
       dominant_emotion: p.dominantEmotion,
       volatility: p.volatility,
       emotional_state: p.emotionalStateHistory
    }));
    const { error } = await supabaseAdmin().from('emotion_profiles').insert(rows);
    if (error) throw new Error(`Emotion profiles insert failed: ${error.message}`);
  }

  async saveTransitions(transitions: EmotionTransition[]): Promise<void> {
    if (transitions.length === 0) return;
    const rows = transitions.map(t => ({
       id: t.id,
       book_id: t.bookId,
       target_id: t.targetId,
       from_emotion: t.fromEmotion,
       to_emotion: t.toEmotion,
       transition_reason: t.transitionReason,
       transition_timestamp: t.transitionTimestamp
    }));
    const { error } = await supabaseAdmin().from('emotion_transitions').insert(rows);
    if (error) throw new Error(`Emotion transitions insert failed: ${error.message}`);
  }

  async saveDirectives(directives: PerformanceDirective[]): Promise<void> {
    if (directives.length === 0) return;
    const rows = directives.map(d => ({
       id: d.id,
       emotion_id: d.emotionId,
       dialogue_id: d.dialogueId || null,
       speech_pace: d.speechPace,
       pause_intensity: d.pauseIntensity,
       emphasis_level: d.emphasisLevel,
       energy_level: d.energyLevel,
       voice_tension: d.voiceTension,
       dramatic_intensity: d.dramaticIntensity,
       emotional_weight: d.emotionalWeight
    }));
    const { error } = await supabaseAdmin().from('emotion_directives').insert(rows);
    if (error) throw new Error(`Emotion directives insert failed: ${error.message}`);
  }

  async saveTimelines(timelines: EmotionTimeline[]): Promise<void> {
    if (timelines.length === 0) return;
    const rows = timelines.map(t => ({
       id: t.id,
       book_id: t.bookId,
       target_id: t.targetId,
       timeline_data: t.events
    }));
    const { error } = await supabaseAdmin().from('emotion_timelines').insert(rows);
    if (error) throw new Error(`Emotion timelines insert failed: ${error.message}`);
  }

  async saveQualityReport(report: EmotionQualityReport): Promise<void> {
    const { error } = await supabaseAdmin().from('emotion_quality_reports').insert({
       book_id: report.bookId,
       trace_id: report.traceId,
       emotions_detected: report.emotionsDetected,
       transitions_detected: report.transitionsDetected,
       quality_score: report.qualityScore,
       processing_time_ms: report.processingTimeMs,
       validation_issues: report.validationIssues
    });
    if (error) throw new Error(`Emotion report insert failed: ${error.message}`);
  }

  async clearChapterEmotions(chapterId: string): Promise<void> {
    const { error } = await supabaseAdmin().from('emotions').delete().eq('chapter_id', chapterId);
    if (error) throw new Error(`Clear emotions failed: ${error.message}`);
  }
}
