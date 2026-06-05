export interface AgentInput {
  traceId: string;
  bookId: string;
  segmentId?: string;
  payload: Record<string, any>;
}

export interface AgentResult {
  status: 'success' | 'partial' | 'failed';
  data: any;
  metadata: TraceMetadata;
}

export interface AgentError extends Error {
  code: string;
  agentName: string;
  retryable: boolean;
}

export interface AgentOutput {
  result?: AgentResult;
  error?: AgentError;
}

export interface TraceMetadata {
  traceId: string;
  executionTimeMs: number;
  tokensUsed?: number;
  modelVersions: Record<string, string>;
}
