import { SystemAuditDashboardData } from '../types';

export class SystemAuditDashboard {
  static compile(
    pipelineScore: number,
    agentScore: number,
    workflowScore: number,
    dbScore: number,
    datasetScore: number,
    queueScore: number,
    lineageScore: number
  ): SystemAuditDashboardData {
    return {
       pipelineHealth: pipelineScore,
       agentHealth: agentScore,
       workflowHealth: workflowScore,
       databaseHealth: dbScore,
       datasetHealth: datasetScore,
       queueHealth: queueScore,
       lineageHealth: lineageScore,
       readinessHealth: (pipelineScore + agentScore + dbScore + lineageScore) / 4
    };
  }
}
