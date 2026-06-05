import { TrainingSample } from '../types';
import { randomUUID } from 'crypto';

export class DatasetSampleBuilder {
  static build(corpusId: string, sentence: string, speaker: string, traceId: string): TrainingSample {
    return {
       id: randomUUID(),
       sampleId: `SPL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
       corpusId,
       text: sentence,
       speaker: speaker || 'NARRATOR',
       emotion: 'Neutral',
       emotionIntensity: 0.5,
       emotionPersistence: 0.8,
       pacing: 'MODERATE',
       pauses: [],
       emphasis: [],
       narrativeArc: 'Rising Action',
       directorialIntent: 'Build Suspense',
       voiceArchetype: 'Narrator',
       metadata: { traceId }
    };
  }
}
