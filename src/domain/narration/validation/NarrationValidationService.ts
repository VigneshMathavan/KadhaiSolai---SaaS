import { NarrationDirective, PauseDirective, EmphasisDirective, TransitionDirective } from '../types';

export class NarrationValidationService {
  static validate(
     directives: NarrationDirective[], 
     pauses: PauseDirective[], 
     emphasis: EmphasisDirective[], 
     transitions: TransitionDirective[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const d of directives) {
       if (!d.planId) errors.push(`Directive ${d.id} missing planId`);
       if (!d.targetId) errors.push(`Directive ${d.id} missing targetId`);
    }

    for (const p of pauses) {
       if (p.position < 0) errors.push(`Pause ${p.id} has invalid position ${p.position}`);
       if (p.durationMs < 0) errors.push(`Pause ${p.id} has invalid duration ${p.durationMs}`);
    }

    for (const e of emphasis) {
       if (e.startPosition < 0 || e.endPosition <= e.startPosition) errors.push(`Emphasis ${e.id} has invalid bounds`);
    }

    if (directives.length > 0) {
       const planId = directives[0].planId;
       if (!planId) errors.push('Plan ID missing from directives mapping');
    }

    return { valid: errors.length === 0, errors };
  }
}
