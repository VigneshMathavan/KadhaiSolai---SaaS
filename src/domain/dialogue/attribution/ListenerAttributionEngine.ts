import { Dialogue, DialogueListener } from '../types';

export class ListenerAttributionEngine {
  static attribute(dialogues: Dialogue[], knownCharacters: { id: string; names: string[] }[]): Dialogue[] {
    return dialogues.map(d => {
       // Search for "told X", "asked Y", "X-இடம் கூறினார்"
       const combinedContext = (d.context.precedingText + " " + d.context.succeedingText).toLowerCase();
       const listeners: DialogueListener[] = [];

       for (const char of knownCharacters) {
          if (d.speaker?.characterId === char.id) continue; // Speaker cannot be listener
          
          for (const name of char.names) {
             const lowerName = name.toLowerCase();
             if (combinedContext.includes(`to ${lowerName}`) || combinedContext.includes(`${lowerName}ிடம்`)) {
                listeners.push({
                   characterId: char.id,
                   confidenceScore: 0.8,
                   evidence: { evidenceText: combinedContext, directionalityContext: 'explicit', proximity: 0 }
                });
             }
          }
       }
       
       return { ...d, listeners };
    });
  }
}
