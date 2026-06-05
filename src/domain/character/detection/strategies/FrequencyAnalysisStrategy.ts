import { CharacterDetectionStrategy, CharacterExtractionCandidate } from './CharacterDetectionStrategy';
import { randomUUID } from 'crypto';

export class FrequencyAnalysisStrategy implements CharacterDetectionStrategy {
  name = 'FrequencyAnalysisStrategy';

  async detect(text: string, bookId: string, chapterId: string): Promise<CharacterExtractionCandidate> {
    const candidate: CharacterExtractionCandidate = { profiles: [], aliases: [], mentions: [], relationships: [] };
    
    // Scans the text for highly repeated capitalized tokens (English) or 
    // highly repeated distinct root words ending in specific noun markers (Tamil).
    
    const words = text.split(/\s+/);
    const frequency = new Map<string, number>();

    // Naive English Title Case extractor
    for (const w of words) {
      const clean = w.replace(/[.,;:"'!?-]/g, '');
      if (clean.length > 2 && /^[A-Z][a-z]+$/.test(clean)) {
        frequency.set(clean, (frequency.get(clean) || 0) + 1);
      }
    }

    for (const [name, count] of Array.from(frequency.entries())) {
      if (count > 5) { // Minimum threshold to be considered a prominent character vs random noun
         candidate.profiles.push({
            id: randomUUID(),
            bookId,
            name,
            normalizedName: name.toUpperCase(),
            confidenceScore: 0.6, // Frequency alone is weak without context
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
