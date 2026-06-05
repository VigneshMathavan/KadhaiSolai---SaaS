import { NarrativeSceneGraph, SceneRelationship, NarrativeSceneNode } from '../types';
import { randomUUID } from 'crypto';

export class NarrativeSceneGraphEngine {
  static buildGraph(bookId: string, currentSceneId: string, chapterId: string, priorContext: any): NarrativeSceneGraph {
    const nodes: NarrativeSceneNode[] = [{ sceneId: currentSceneId, chapterId }];
    const edges: SceneRelationship[] = [];
    
    // Simulate finding prior edges. In reality, requires full db query of prior scene states.
    if (priorContext?.previousSceneId) {
       nodes.push({ sceneId: priorContext.previousSceneId, chapterId: priorContext.previousChapterId || chapterId });
       
       edges.push({
          sourceScene: priorContext.previousSceneId,
          targetScene: currentSceneId,
          relationshipType: 'PRECEDES',
          weight: 1.0
       });

       if (priorContext.continuityScore < 0.8) {
          edges.push({
             sourceScene: priorContext.previousSceneId,
             targetScene: currentSceneId,
             relationshipType: 'CONTRASTS',
             weight: 0.8
          });
       } else {
          edges.push({
             sourceScene: priorContext.previousSceneId,
             targetScene: currentSceneId,
             relationshipType: 'ESCALATES',
             weight: 0.5
          });
       }
    }

    // Connectivity score calculates graph density
    const maxPossibleEdges = nodes.length > 1 ? nodes.length * (nodes.length - 1) : 1;
    const connectivityScore = Math.min(1.0, edges.length / maxPossibleEdges);

    return {
       id: randomUUID(),
       bookId,
       nodes,
       edges,
       connectivityScore
    };
  }
}
