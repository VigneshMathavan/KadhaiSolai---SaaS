export interface DatasetReasoning {
  explanation: string;
}

export interface TrainingSample {
  id: string;
  sampleId: string;
  corpusId: string;
  text: string;
  speaker: string;
  emotion: string;
  emotionIntensity: number;
  emotionPersistence: number;
  pacing: string;
  pauses: any[];
  emphasis: any[];
  narrativeArc: string;
  directorialIntent: string;
  voiceArchetype: string;
  metadata: any;
  lineage?: TrainingSampleLineage; // Injected Phase 7 Provenance
}

// ---------------------------------------------------------
// Phase 7 Provenance Extensions
// ---------------------------------------------------------

export interface TrainingSampleLineage {
  id?: string;
  sampleId: string;
  bookId: string;
  chapterId: string;
  sceneId: string;
  dialogueId?: string;
  characterId: string;
  emotionId?: string;
  narrationId?: string;
  directorDecisionId?: string;
  datasetVersionId: string;
  corpusVersionId: string;
  traceId: string;
  createdAt?: string;
}

export interface CorpusLineageReport {
  id: string;
  corpusId: string;
  lineageCoverage: number;
  missingLinks: number;
  brokenReferences: number;
  orphanSamples: number;
  versionDrift: number;
  traceCompleteness: number;
}

export interface LineageValidationReport {
  id: string;
  validationScore: number;
  validationIssues: string[];
}

export interface DatasetVersionDiff {
  id: string;
  previousVersionId: string;
  currentVersionId: string;
  addedSamples: number;
  removedSamples: number;
  modifiedSamples: number;
  emotionChanges: number;
  metadataChanges: number;
}

export interface TrainingUsageRecord {
  id: string;
  corpusId: string;
  modelId: string;
  usageType: 'FINE_TUNING' | 'RLHF' | 'BASE_TRAINING';
}

export interface CorpusTrainingHistory {
  id: string;
  modelId: string;
  historyMetadata: any;
}


export interface TrainingCorpus {
  id: string;
  bookId: string;
  versionId: string;
  totalSamples: number;
  qualityScore: number;
  samples: TrainingSample[];
}

export interface DatasetAlignment {
  alignmentScore: number;
  alignmentConfidence: number;
  alignmentEvidence: string[];
}

export interface DatasetQualityReport {
  id: string;
  corpusId: string;
  qualityScore: number;
  reasoning: DatasetReasoning;
}

export interface DatasetBalanceReport {
  id: string;
  corpusId: string;
  balanceScore: number;
  recommendations: string[];
}

export interface DatasetCoverageReport {
  id: string;
  corpusId: string;
  coverageScore: number;
  gaps: string[];
}

export interface DatasetRiskReport {
  id: string;
  corpusId: string;
  riskScore: number;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskRecommendations: string[];
}

export interface DatasetVersion {
  id: string;
  bookId: string;
  versionTag: string;
  diffMetadata: any;
}

export interface DatasetManifest {
  id: string;
  versionId: string;
  manifestData: any;
}

export interface ExportProfile {
  targetSystem: 'LJSpeech' | 'XTTS' | 'VITS' | 'Coqui' | 'HuggingFace' | 'KadhaisolaiNative';
  mappingRules: any;
}

export interface DatasetExport {
  id: string;
  corpusId: string;
  exportFormat: string;
  exportProfile: ExportProfile;
  path: string;
}

export interface DatasetRegistry {
  id: string;
  bookId: string;
  registrySnapshot: any;
}

export interface DatasetFactoryResult {
  success: boolean;
  corpus: TrainingCorpus;
  alignment: DatasetAlignment;
  quality: DatasetQualityReport;
  balance: DatasetBalanceReport;
  coverage: DatasetCoverageReport;
  version: DatasetVersion;
  manifest: DatasetManifest;
  exports: DatasetExport[];
  registry: DatasetRegistry;
  risks: DatasetRiskReport;
}
