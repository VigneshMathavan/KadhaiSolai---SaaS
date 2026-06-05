export type BookLanguage = 'Tamil' | 'English' | 'Mixed';

export interface BookSource {
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  format: 'PDF' | 'EPUB' | 'DOCX' | 'TXT' | 'MD';
}

export interface BookMetadata {
  title: string | null;
  author: string | null;
  description: string | null;
  publisher: string | null;
  language: BookLanguage | null;
  creationDate: Date | null;
  modifiedDate: Date | null;
  isbn: string | null;
}

export interface ParsedBook {
  metadata: BookMetadata;
  rawContent: string;
  source: BookSource;
}

export interface Book {
  id: string;
  parsedData: ParsedBook;
  createdAt: Date;
}

export interface BookParserResult {
  success: boolean;
  book?: ParsedBook;
  error?: Error;
}

export interface BookUploadResult {
  uploadId: string;
  status: 'SUCCESS' | 'FAILED';
  bookId?: string;
  message?: string;
}
