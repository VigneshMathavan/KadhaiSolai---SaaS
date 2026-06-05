import { VoiceCastingPlan, ProductionReasoning } from '../types';
import { randomUUID } from 'crypto';

export class VoiceCastingEngine {
  static castVoice(planId: string, characterId: string, charContext: any): VoiceCastingPlan {
    let archetype = 'Narrator';
    let reasoningText = 'Default narrator assignment.';
    
    // Archetype assignment based on Phase 2 character data logic simulation
    const age = charContext?.estimatedAge || 30;
    const gender = charContext?.estimatedGender || 'Male';
    const importance = charContext?.importanceScore || 0.5;

    if (age > 60) {
       archetype = gender === 'Female' ? 'Elder Female' : 'Elder Male';
       reasoningText = `Age mapped to ${age}, directing towards Elder profile.`;
    } else if (age < 15) {
       archetype = 'Child';
       reasoningText = `Age mapped to ${age}, directing towards Child profile.`;
    } else if (importance > 0.8 && charContext?.role === 'VILLAIN') {
       archetype = 'Villain';
       reasoningText = 'High importance antagonistic character, assigned Villain archetype.';
    } else {
       archetype = gender === 'Female' ? 'Young Female' : 'Young Male';
       reasoningText = 'Standard protagonist/supporting character archetype.';
    }

    const reasoning: ProductionReasoning = {
       explanation: reasoningText,
       evidence: [{ sourceType: 'CHARACTER_INTELLIGENCE', evidenceText: JSON.stringify(charContext) }]
    };

    return {
       id: randomUUID(),
       planId,
       characterId,
       voiceArchetype: archetype,
       castingConfidence: 0.9,
       castingReasoning: reasoning
    };
  }
}
