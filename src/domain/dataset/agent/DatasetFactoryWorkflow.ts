import { DatasetFactoryResult, TrainingSample, DatasetVersion } from '../types';
import { DatasetSampleBuilder } from '../builder/DatasetSampleBuilder';
import { DatasetAlignmentEngine } from '../alignment/DatasetAlignmentEngine';
import { DatasetQualityEngine } from '../quality/DatasetQualityEngine';
import { DatasetBalancingEngine } from '../balancing/DatasetBalancingEngine';
import { DatasetCoverageEngine } from '../coverage/DatasetCoverageEngine';
import { DatasetVersioningEngine } from '../versioning/DatasetVersioningEngine';
import { DatasetRegistryEngine } from '../registry/DatasetRegistryEngine';
import { DatasetStorageEngine } from '../storage/DatasetStorageEngine';
import { DatasetExportEngine } from '../export/DatasetExportEngine';
import { EmotionalLabelingEngine } from '../labeling/EmotionalLabelingEngine';
import { PerformanceLabelingEngine } from '../labeling/PerformanceLabelingEngine';
import { TrainingCorpusGenerator } from '../generator/TrainingCorpusGenerator';
import { DatasetRiskEngine } from '../risk/DatasetRiskEngine';
import { DatasetLineageEngine } from '../lineage/DatasetLineageEngine';
import { LineageValidationEngine } from '../lineage/LineageValidationEngine';
import { DatasetVersionDiffEngine } from '../versioning/DatasetVersionDiffEngine';

export class DatasetFactoryWorkflow {
  async execute(bookId: string, masterPlan: any, rawSentences: any[], traceId: string): Promise<DatasetFactoryResult> {
    
    // 1. Versioning
    const version: DatasetVersion = DatasetVersioningEngine.createVersion(bookId, 0);
    
    // 2. Build Samples & Labels
    const samples: TrainingSample[] = [];
    for (const sent of rawSentences) {
       const sample = DatasetSampleBuilder.build('TEMP_CORPUS', sent.text, sent.speaker, traceId);
       
       const emoLabels = EmotionalLabelingEngine.label(sent.text, sent.mood);
       const perfLabels = PerformanceLabelingEngine.label({});

       sample.emotion = emoLabels.emotion;
       sample.emotionIntensity = emoLabels.intensity;
       sample.emotionPersistence = emoLabels.persistence;

       sample.pacing = perfLabels.pacing;
       sample.directorialIntent = perfLabels.directorialIntent;

       // 2.5 Generate Lineage
       sample.lineage = DatasetLineageEngine.trackSample(sample.id, bookId, version.id, traceId, {
          chapterId: sent.chapterId,
          sceneId: sent.sceneId,
          characterId: sent.speaker,
          versionId: version.id
       });

       samples.push(sample);
    }

    // 3. Corpus Generation
    const corpus = TrainingCorpusGenerator.generate(bookId, version.id, samples);

    // Update samples corpusId
    samples.forEach(s => s.corpusId = corpus.id);

    // 4. Engines Validation
    const alignment = DatasetAlignmentEngine.validateAlignment(samples);
    const quality = DatasetQualityEngine.assessQuality(corpus.id, samples);
    const balance = DatasetBalancingEngine.checkBalance(corpus.id, samples);
    const coverage = DatasetCoverageEngine.calculateCoverage(corpus.id, samples);
    const risks = DatasetRiskEngine.analyze(corpus.id, samples);

    // 4.5 Lineage & Diff Validations
    const lineageValidation = LineageValidationEngine.validate(samples.map(s => s.lineage!));
    if (lineageValidation.validationIssues.length > 0) {
       risks.riskRecommendations.push(...lineageValidation.validationIssues);
    }
    const lineageReport = DatasetLineageEngine.generateCorpusReport(corpus.id, samples.length, lineageValidation.validationIssues.length);
    const versionDiff = DatasetVersionDiffEngine.calculateDiff('PREV_MOCK', version.id, 0, samples.length);

    // 5. Exports & Storage
    const manifest = DatasetStorageEngine.saveManifest(version.id, { total: samples.length, lineageCoverage: lineageReport.lineageCoverage });
    const exports = DatasetExportEngine.generateExports(corpus.id, true);
    const registry = DatasetRegistryEngine.register(bookId, corpus.id);

    return {
       success: quality.qualityScore > 0.5 && alignment.alignmentScore > 0.5,
       corpus,
       alignment,
       quality,
       balance,
       coverage,
       version,
       manifest,
       exports,
       registry,
       risks,
       // Expose lineage info internally for persistence agent
       _lineageContext: {
          lineageReport,
          versionDiff,
          lineageValidation
       }
    } as any;
  }
}
