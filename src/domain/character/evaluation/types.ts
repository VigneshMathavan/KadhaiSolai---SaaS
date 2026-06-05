export interface CharacterQualityReport {
  id?: string;
  bookId: string;
  traceId: string;
  characterCount: number;
  aliasCount: number;
  relationshipCount: number;
  qualityScore: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  validationIssues: string[];
  processingTimeMs: number;
}

export interface CharacterGroundTruth {
  characters: string[];
  aliases: Record<string, string[]>;
  relationships: { a: string; b: string; type: string }[];
}

export interface EvaluationMetric {
  precision: number;
  recall: number;
  f1: number;
}

export interface CharacterEvaluationResult {
  bookId: string;
  characterMetrics: EvaluationMetric;
  aliasMetrics: EvaluationMetric;
  relationshipMetrics: EvaluationMetric;
  falsePositives: string[];
  falseNegatives: string[];
}
