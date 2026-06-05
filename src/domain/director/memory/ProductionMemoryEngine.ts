import { ProductionMemory, DirectorDecision, PerformanceConflict } from '../types';

export class ProductionMemoryEngine {
  static buildMemory(bookId: string, priorDecisions: DirectorDecision[], priorConflicts: PerformanceConflict[], priorQualities: number[]): ProductionMemory {
    return {
       bookId,
       decisions: priorDecisions || [],
       conflictHistory: priorConflicts || [],
       qualityHistory: priorQualities || []
    };
  }
}
