export interface PlatformCertification {
  id: string;
  certificationStatus: 'CERTIFIED' | 'BLOCKED' | 'PENDING';
  certificationScore: number;
  productionApproval: boolean;
  phase8Approval: boolean;
  requiredFixes: string[];
}

export interface GoldenPipelineReport {
  pipelineExecutionReport: string;
  pipelineCoverageReport: string;
  pipelinePerformanceReport: string;
  pipelineFailureReport: string[];
  success: boolean;
}

export interface AgentIntegrationReport {
  brokenDependencyReport: string[];
  integrationScore: number;
  success: boolean;
}

export interface WorkflowAuditReport {
  stateMachineReport: string;
  workflowHealthScore: number;
  success: boolean;
}

export interface DatabaseIntegrityReport {
  migrationHealthReport: string;
  repositoryHealthReport: string;
  success: boolean;
}

export interface QueueCertificationReport {
  workerHealthReport: string;
  recoveryReport: string;
  success: boolean;
}

export interface MemoryStressReport {
  performanceBottleneckReport: string[];
  scalingReport: string;
  success: boolean;
}

export interface DatasetCertificationReport {
  datasetReadinessScore: number;
  success: boolean;
}

export interface LineageAuditReport {
  brokenLineageReport: string[];
  traceabilityScore: number;
  success: boolean;
}

export interface RepositoryCleanupReport {
  repositorySizeReport: string;
  success: boolean;
}

export interface ProductionBlockerReport {
  critical: string[];
  high: string[];
  medium: string[];
  low: string[];
  future: string[];
}

export interface ProductionReadinessReport {
  productionReadinessScore: number;
  goNoGoDecision: 'GO' | 'NO_GO';
}

export interface SystemAuditDashboardData {
  pipelineHealth: number;
  agentHealth: number;
  workflowHealth: number;
  databaseHealth: number;
  datasetHealth: number;
  queueHealth: number;
  lineageHealth: number;
  readinessHealth: number;
}
