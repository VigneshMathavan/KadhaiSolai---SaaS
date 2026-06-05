import { Dialogue, DialogueSpeaker } from '../types';

export class SpeakerAttributionEngine {
  static attribute(dialogues: Dialogue[], knownCharacters: { id: string; names: string[] }[]): Dialogue[] {
    const verbs = ['said', 'shouted', 'asked', 'கூறினார்', 'கேட்டார்'];

    return dialogues.map(d => {
       // Search surrounding context for names and verbs
       const combinedContext = (d.context.precedingText + " " + d.context.succeedingText).toLowerCase();
       let bestMatch: DialogueSpeaker | undefined = undefined;
       let bestScore = 0;

       for (const char of knownCharacters) {
          for (const name of char.names) {
             const nameIdx = combinedContext.indexOf(name.toLowerCase());
             if (nameIdx !== -1) {
                let score = 0.5;
                for (const v of verbs) {
                   if (combinedContext.includes(`${v} ${name.toLowerCase()}`) || combinedContext.includes(`${name.toLowerCase()} ${v}`)) {
                      score = 0.9;
                   }
                }
                
                if (score > bestScore) {
                   bestScore = score;
                   bestMatch = {
                     characterId: char.id,
                     confidenceScore: score,
                     evidence: { evidenceText: combinedContext.substring(Math.max(0, nameIdx-20), nameIdx+20), verbUsed: 'inferred', proximity: nameIdx }
                   };
                }
             }
          }
       }
       
       if (bestMatch) {
         return { ...d, speaker: bestMatch };
       }
       return d;
    });
  }
}
