import { AudiobookMasterPlan, ProductionBlueprint, VoiceCastingPlan } from '../types';

export class DirectorValidationService {
  static validate(plan: AudiobookMasterPlan, blueprint: ProductionBlueprint, casting: VoiceCastingPlan[]): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    if (!plan.id || !plan.bookId) errors.push('Master Plan missing vital IDs');
    if (blueprint.chapterPlans.length === 0) errors.push('Blueprint contains zero chapters');
    if (casting.length === 0) errors.push('No voices cast for the production');

    return { valid: errors.length === 0, errors };
  }
}
