import { CharacterDetectionStrategy, CharacterExtractionCandidate } from './CharacterDetectionStrategy';
import { randomUUID } from 'crypto';

export class DialogueSpeakerStrategy implements CharacterDetectionStrategy {
  name = 'DialogueSpeakerStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<CharacterExtractionCandidate> {
    const candidate: CharacterExtractionCandidate = { profiles: [], aliases: [], mentions: [], relationships: [] };
    
    // Regex for dialogue chunks. Ex: "Hello," said Arun.
    const dialogueRegex = /(["'])(.*?)\1\s+(said|shouted|asked|replied|கூறினார்|சொன்னார்|கேட்டார்)\s+([A-Z][a-z]+|[\u0B80-\u0BFF]+)/g;
    
    let match;
    const speakerMap = new Map<string, number>();
    
    while ((match = dialogueRegex.exec(text)) !== null) {
      const speakerName = match[4];
      speakerMap.set(speakerName, (speakerMap.get(speakerName) || 0) + 1);
    }

    for (const [name, count] of Array.from(speakerMap.entries())) {
       if (count >= 2) { // Minimizes false positives from random capitalized words
         candidate.profiles.push({
            id: randomUUID(),
            bookId,
            name,
            normalizedName: name.toUpperCase(),
            confidenceScore: 0.85, // Direct dialogue attribution is strong evidence
            importanceScore: 0,
            mentionCount: count,
            firstAppearance: 0, lastAppearance: text.length,
            aliases: [], attributes: []
         });
       }
    }

    return candidate;
  }
}
