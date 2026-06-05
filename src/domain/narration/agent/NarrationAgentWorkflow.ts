import { NarrationAgentResult, NarrationPlan, NarrationDirective, SceneDirective, PauseDirective, EmphasisDirective, TransitionDirective, NarrationTimeline } from '../types';
import { SceneAnalysisEngine } from '../scene/SceneAnalysisEngine';
import { PacingEngine } from '../pacing/PacingEngine';
import { PausePlanningEngine } from '../pacing/PausePlanningEngine';
import { EmphasisEngine } from '../emphasis/EmphasisEngine';
import { CharacterPerformanceEngine } from '../performance/CharacterPerformanceEngine';
import { ScenePerformanceEngine } from '../performance/ScenePerformanceEngine';
import { TransitionEngine } from '../transition/TransitionEngine';
import { NarrationQualityScorer } from '../scoring/NarrationQualityScorer';
import { NarrationValidationService } from '../validation/NarrationValidationService';
import { NarrativeSceneGraphEngine } from '../graph/NarrativeSceneGraphEngine';
import { NarrativeArcEngine } from '../arc/NarrativeArcEngine';
import { DirectorialIntentEngine } from '../intent/DirectorialIntentEngine';
import { NarrativeMomentumEngine } from '../momentum/NarrativeMomentumEngine';
import { SceneImportanceEngine } from '../importance/SceneImportanceEngine';
import { DirectorialReasoningEngine } from '../reasoning/DirectorialReasoningEngine';
import { randomUUID } from 'crypto';

export class NarrationAgentWorkflow {
  async execute(text: string, bookId: string, chapterId: string, traceId: string, contextData: any): Promise<NarrationAgentResult> {
    
    // 1. Scene Analysis
    const sceneDirectives: SceneDirective[] = [];
    const sceneId = chapterId; // Treating chapter as scene for MVP
    const emotionProfiles = contextData?.emotionProfiles || [];
    
    const sceneDir = SceneAnalysisEngine.analyze(text, sceneId, emotionProfiles);
    sceneDirectives.push(sceneDir);

    // 2. Pacing
    const paceInfo = PacingEngine.determinePacing(text, sceneDir.energy, 0.8);
    
    // 3. Pause Planning
    const directiveId = randomUUID(); // Master directive ID
    const pauseDirectives = PausePlanningEngine.planPauses(text, directiveId);

    // 4. Emphasis
    const emphasisDirectives = EmphasisEngine.planEmphasis(text, directiveId);

    // 5. Performance
    const charProfiles = [];
    for (const p of emotionProfiles.filter((x: any) => x.targetType === 'CHARACTER')) {
       charProfiles.push(CharacterPerformanceEngine.determinePerformance(p.targetId, p));
    }
    const sceneProfiles = [ScenePerformanceEngine.determinePerformance(sceneId, sceneDir.mood, sceneDir.energy)];

    // 6. Transition
    const transitionDirectives: TransitionDirective[] = [TransitionEngine.planTransition(directiveId, 'neutral', sceneDir.mood)];

    // 7. Director Readiness (Phase 5.1 Enhancements)
    const sceneGraph = NarrativeSceneGraphEngine.buildGraph(bookId, sceneId, chapterId, contextData);
    const arc = NarrativeArcEngine.determineArc(bookId, chapterId, contextData?.chapterIndex || 1, contextData?.totalChapters || 10, sceneDir.energy, sceneDir.tension);
    const intent = DirectorialIntentEngine.determineIntent(bookId, chapterId, sceneId, sceneDir.mood, sceneDir.energy, sceneDir.tension);
    const momentum = NarrativeMomentumEngine.calculateMomentum(bookId, chapterId, sceneDir.energy, sceneDir.tension);
    const importance = SceneImportanceEngine.rankScene(bookId, chapterId, sceneId, charProfiles.length, sceneDir.tension, arc.arcType);
    
    // Annotate the Directorial Intent with global reasoning mapping
    intent.reasoning = DirectorialReasoningEngine.buildExplanation(intent.intentType, paceInfo.paceScore, importance.importanceScore);

    // Master Directive mappings
    const directives: NarrationDirective[] = [
       { id: directiveId, planId: '', targetType: 'SCENE', targetId: sceneId, directiveType: 'SCENE', payload: { paceInfo, sceneProfiles, charProfiles } }
    ];

    const plan: NarrationPlan = {
       id: randomUUID(),
       bookId, chapterId,
       totalScenes: 1,
       pacingScore: paceInfo.paceScore,
       complexityScore: 0.8,
       narrativeArc: arc.arcType,
       directorialIntent: intent.intentType,
       momentumScore: momentum.momentumScore,
       sceneImportance: importance.importanceScore,
       sceneConnectivity: sceneGraph.connectivityScore,
       arcPosition: arc.arcPosition
    };

    directives[0].planId = plan.id;

    const timeline: NarrationTimeline = {
       id: randomUUID(),
       planId: plan.id,
       events: []
    };

    // Validation
    const validationResult = NarrationValidationService.validate(directives, pauseDirectives, emphasisDirectives, transitionDirectives);
    
    // Quality Scoring
    const qualityReport = NarrationQualityScorer.score(bookId, traceId, plan, directives, validationResult.errors);

    return {
       success: true,
       plan,
       directives,
       sceneDirectives,
       pauseDirectives,
       emphasisDirectives,
       transitionDirectives,
       timeline,
       qualityReport,
       // Adding new properties specifically passed through the pipeline scope
       _directorReadiness: {
         sceneGraph,
         arc,
         intent,
         momentum,
         importance
       }
    } as any; // Typecast because NarrationAgentResult hasn't technically exposed _directorReadiness yet
  }
}
