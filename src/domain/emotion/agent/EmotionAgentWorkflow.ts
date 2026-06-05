import { EmotionAgentResult } from '../types';
import { EmotionConfidenceFusionEngine } from '../fusion/EmotionConfidenceFusionEngine';
import { CharacterEmotionEngine } from '../character/CharacterEmotionEngine';
import { ConversationEmotionEngine } from '../conversation/ConversationEmotionEngine';
import { SceneEmotionEngine } from '../scene/SceneEmotionEngine';
import { EmotionTransitionEngine } from '../transition/EmotionTransitionEngine';
import { EmotionTimelineEngine } from '../timeline/EmotionTimelineEngine';
import { PerformanceDirectiveEngine } from '../performance/PerformanceDirectiveEngine';
import { EmotionQualityScorer } from '../scoring/EmotionQualityScorer';

export class EmotionAgentWorkflow {
  constructor(private fusionEngine: EmotionConfidenceFusionEngine) {}

  async execute(text: string, bookId: string, chapterId: string, traceId: string, contextData: any): Promise<EmotionAgentResult> {
    const startTime = Date.now();
    
    // 1. Emotion Detection (Fusion)
    const emotions = await this.fusionEngine.fuse(text, bookId, chapterId, contextData);

    // 2. Emotion Context (Profiles)
    const charProfiles = CharacterEmotionEngine.buildProfiles(emotions, bookId, chapterId);
    const convProfiles = ConversationEmotionEngine.buildProfiles(emotions, bookId, chapterId);
    const sceneProfiles = SceneEmotionEngine.buildProfiles(emotions, bookId, chapterId);
    
    const profiles = [...charProfiles, ...convProfiles, ...sceneProfiles];

    // 3. Emotion Timeline
    const timelines = EmotionTimelineEngine.buildTimelines(emotions, bookId);

    // 4. Emotion Transitions
    const transitions = EmotionTransitionEngine.extractTransitions(emotions, bookId);

    // 5. Performance Directives
    const directives = PerformanceDirectiveEngine.generate(emotions);

    const processingTimeMs = Date.now() - startTime;

    // 6. Quality Review
    const qualityReport = EmotionQualityScorer.score(bookId, traceId, emotions, transitions, processingTimeMs);

    return {
       success: true,
       emotions,
       profiles,
       transitions,
       directives,
       timelines,
       qualityReport,
       traceId
    };
  }
}
