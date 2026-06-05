export type ChapterType = 
  | 'CHAPTER' | 'PART' | 'SECTION' | 'VOLUME' 
  | 'PROLOGUE' | 'EPILOGUE' | 'INTRODUCTION' 
  | 'FOREWORD' | 'PREFACE' | 'APPENDIX' | 'UNKNOWN';

export interface ChapterBoundary {
  startPosition: number; // char index
  endPosition: number;   // char index
  startLine: number;
  endLine: number;
  startWord: number;
  endWord: number;
}

export interface ChapterMetadata {
  originalTitle: string | null;
  normalizedTitle: string | null;
  detectedNumber: number | null;
  isRomanNumeral: boolean;
  isTamilNumeral: boolean;
  languageDetected: 'Tamil' | 'English' | 'Mixed' | 'Unknown';
}

export interface Chapter {
  id?: string;
  bookId: string;
  type: ChapterType;
  title: string;
  orderIndex: number;
  boundary: ChapterBoundary;
  contentLength: number;
  wordCount: number;
  characterCount: number;
  detectionStrategy: string;
  confidenceScore: number; // 0.0 - 1.0
  fusionConfidence?: number;
  qualityScore?: number;
  detectionEvidence?: Record<string, any>;
  metadata: ChapterMetadata;
  parentId?: string | null; // For hierarchical nesting
}

export interface BookSection {
  id: string;
  type: ChapterType;
  children: BookSection[];
  chapterRef?: Chapter;
}

export interface BookHierarchy {
  bookId: string;
  rootSections: BookSection[];
}

export interface ChapterDetectionResult {
  success: boolean;
  chapters: Chapter[];
  hierarchy?: BookHierarchy;
  overallConfidence: number;
  strategyUsed: string;
  error?: Error;
}
