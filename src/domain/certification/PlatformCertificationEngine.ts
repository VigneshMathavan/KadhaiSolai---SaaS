import { PlatformCertification } from './types';
import { GoldenPipelineTestRunner } from './pipeline/GoldenPipelineTestRunner';
import { AgentIntegrationAuditEngine } from './audit/AgentIntegrationAuditEngine';
import { WorkflowAuditEngine } from './audit/WorkflowAuditEngine';
import { DatabaseIntegrityAuditEngine } from './audit/DatabaseIntegrityAuditEngine';
import { QueueCertificationEngine } from './audit/QueueCertificationEngine';
import { MemoryStressTestEngine } from './stress/MemoryStressTestEngine';
import { DatasetFactoryCertificationEngine } from './dataset/DatasetFactoryCertificationEngine';
import { LineageAuditEngine } from './audit/LineageAuditEngine';
import { RepositoryCleanupEngine } from './cleanup/RepositoryCleanupEngine';
import { SystemAuditDashboard } from './dashboard/SystemAuditDashboard';
import { ProductionReadinessEngine } from './readiness/ProductionReadinessEngine';
import { ProductionBlockerEngine } from './readiness/ProductionBlockerEngine';
import { randomUUID } from 'crypto';

export class PlatformCertificationEngine {
  static async certifyPlatform(): Promise<PlatformCertification> {
    const pipeline = await GoldenPipelineTestRunner.executeGoldenPipeline();
    const agents = await AgentIntegrationAuditEngine.verifyIntegrations();
    const workflow = await WorkflowAuditEngine.verifyWorkflows();
    const db = await DatabaseIntegrityAuditEngine.verifySchemas();
    const queue = await QueueCertificationEngine.verifyWorkers();
    const memory = await MemoryStressTestEngine.benchmark();
    const dataset = await DatasetFactoryCertificationEngine.certifyDatasetLogic();
    const lineage = await LineageAuditEngine.auditLineageTrace();
    const cleanup = await RepositoryCleanupEngine.auditRepositoryPollution();

    const dashboard = SystemAuditDashboard.compile(
       pipeline.success ? 1.0 : 0.0,
       agents.integrationScore,
       workflow.workflowHealthScore,
       db.success ? 1.0 : 0.0,
       dataset.datasetReadinessScore,
       queue.success ? 1.0 : 0.0,
       lineage.traceabilityScore
    );

    const readiness = ProductionReadinessEngine.calculateReadiness(dashboard);
    const blockers = ProductionBlockerEngine.identifyBlockers();

    const isCertified = readiness.goNoGoDecision === 'GO' && blockers.critical.length === 0 && blockers.high.length === 0;

    return {
       id: randomUUID(),
       certificationStatus: isCertified ? 'CERTIFIED' : 'BLOCKED',
       certificationScore: readiness.productionReadinessScore,
       productionApproval: isCertified,
       phase8Approval: isCertified,
       requiredFixes: blockers.critical.concat(blockers.high)
    };
  }
}
