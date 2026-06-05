import { SpeakerCandidate } from '../types';

export class SpeakerCandidateEngine {
  static analyze(dialogueText: string, contextText: string, knownCharacters: { id: string; names: string[] }[]): SpeakerCandidate[] {
    const candidates: SpeakerCandidate[] = [];
    
    // Look for tags like "said Arjun", "shouted Meena", "அருண் கூறினான்"
    const englishVerbs = ['said', 'shouted', 'asked', 'replied', 'whispered'];
    const tamilVerbs = ['கூறினார்', 'சொன்னார்', 'கேட்டார்', 'அலறினார்', 'கூறினான்', 'சொன்னாள்'];

    // Score candidates based on presence in the immediate context
    for (const char of knownCharacters) {
       let score = 0;
       for (const name of char.names) {
         if (contextText.includes(name)) {
           score += 0.5;
           
           // Check adjacency to dialogue verbs
           for (const v of englishVerbs.concat(tamilVerbs)) {
             if (contextText.includes(`${v} ${name}`) || contextText.includes(`${name} ${v}`)) {
               score += 0.4;
             }
           }
         }
       }
       if (score > 0) {
         candidates.push({ characterId: char.id, confidence: Math.min(1.0, score), evidence: 'Contextual proximity and verb adjacency' });
       }
    }

    return candidates.sort((a, b) => b.confidence - a.confidence);
  }
}
