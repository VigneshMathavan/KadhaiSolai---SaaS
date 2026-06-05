import { SceneExecutionPlan } from '../types';

export class SceneExecutionEngine {
  static planScene(sceneId: string, chapterId: string, sceneMood: string, intent: string, transitionType: string): SceneExecutionPlan {
    let deliveryStyle = 'Neutral Narration';

    if (sceneMood === 'suspenseful') deliveryStyle = 'Tense, hushed';
    if (sceneMood === 'romantic') deliveryStyle = 'Warm, slow, intimate';

    return {
       sceneId,
       chapterId,
       intent,
       energy: sceneMood === 'suspenseful' ? 0.8 : 0.4,
       deliveryStyle,
       transitionStrategy: transitionType
    };
  }
}
