import { Chapter } from '../../types';

export class VotingEngine {
  static fuse(allCandidates: { strategy: string; chapters: Chapter[] }[], totalLength: number): Chapter[] {
    const boundaryProposals: { position: number; weight: number; titles: string[]; types: string[] }[] = [];
    
    // Flatten all suggested boundaries
    for (const suite of allCandidates) {
      for (const ch of suite.chapters) {
        boundaryProposals.push({
          position: ch.boundary.startPosition,
          weight: ch.confidenceScore,
          titles: [ch.title],
          types: [ch.type]
        });
      }
    }

    // Sort by position
    boundaryProposals.sort((a, b) => a.position - b.position);

    // Merge boundaries that are within 500 characters of each other
    const mergedBoundaries: typeof boundaryProposals = [];
    for (const p of boundaryProposals) {
      if (mergedBoundaries.length === 0) {
        mergedBoundaries.push({ ...p, titles: [...p.titles], types: [...p.types] });
        continue;
      }
      
      const last = mergedBoundaries[mergedBoundaries.length - 1];
      if (Math.abs(p.position - last.position) < 500) {
        last.weight += p.weight;
        last.titles.push(...p.titles);
        last.types.push(...p.types);
        // Average the position slightly towards the stronger weight
        last.position = Math.floor((last.position + p.position) / 2);
      } else {
        mergedBoundaries.push({ ...p, titles: [...p.titles], types: [...p.types] });
      }
    }

    // Filter weak boundaries (Must cross a minimum threshold of fusion confidence)
    const validBoundaries = mergedBoundaries.filter(b => b.weight >= 0.5);

    // Reconstruct chapters
    const finalChapters: Chapter[] = [];
    for (let i = 0; i < validBoundaries.length; i++) {
      const start = validBoundaries[i];
      const endPos = (i < validBoundaries.length - 1) ? validBoundaries[i+1].position : totalLength;
      
      // Determine best title (longest non-generic one ideally, or most voted)
      const title = start.titles.sort((a, b) => b.length - a.length)[0] || `Section ${i+1}`;
      const type = start.types[0] as any || 'CHAPTER';

      // Normalize confidence (cap at 1.0)
      const fusedConfidence = Math.min(1.0, start.weight);

      finalChapters.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        bookId: 'FUSED', // temporary
        type,
        title,
        orderIndex: i + 1,
        boundary: { startPosition: start.position, endPosition: endPos, startLine: 0, endLine: 0, startWord: 0, endWord: 0 },
        contentLength: endPos - start.position,
        characterCount: endPos - start.position, // appx
        wordCount: Math.floor((endPos - start.position) / 6),
        detectionStrategy: 'FusionEngine',
        confidenceScore: fusedConfidence,
        fusionConfidence: fusedConfidence,
        detectionEvidence: { weights: start.weight, mergedVotes: start.titles.length },
        metadata: { originalTitle: title, normalizedTitle: title, detectedNumber: i+1, isRomanNumeral: false, isTamilNumeral: false, languageDetected: 'Unknown' }
      });
    }

    return finalChapters;
  }
}
