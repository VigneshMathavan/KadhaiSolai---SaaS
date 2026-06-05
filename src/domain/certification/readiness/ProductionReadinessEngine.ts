import { ProductionReadinessReport, SystemAuditDashboardData } from '../types';

export class ProductionReadinessEngine {
  static calculateReadiness(dashboardData: SystemAuditDashboardData): ProductionReadinessReport {
    // If all scores are 1.0 (or high 0.9s), return GO
    const vals = Object.values(dashboardData);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    
    return {
       productionReadinessScore: avg,
       goNoGoDecision: avg > 0.95 ? 'GO' : 'NO_GO'
    };
  }
}
