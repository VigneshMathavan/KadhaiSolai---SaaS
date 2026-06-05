import { BookParser } from '../interfaces/BookParser';
import { BookParserResult, BookSource, BookMetadata } from '../types';
import { FileValidator } from '../validation/FileValidator';
import { BookContentNormalizer } from '../normalization/BookContentNormalizer';
import { BookParsingError } from '@/core/errors/BookErrors';

export class TxtBookParser implements BookParser {
  async parse(buffer: Buffer, fileName: string, mimeType: string): Promise<BookParserResult> {
    try {
      FileValidator.validate(buffer, fileName, mimeType);
      const rawText = buffer.toString('utf8'); // Preserves Tamil UTF-8 natively
      const normalizedContent = BookContentNormalizer.normalize(rawText);
      
      const source: BookSource = { 
        originalFileName: fileName, 
        mimeType, 
        fileSize: buffer.length, 
        format: fileName.toLowerCase().endsWith('.md') ? 'MD' : 'TXT' 
      };
      
      const metadata: BookMetadata = { 
        title: fileName.replace(/\.(txt|md)$/i, ''), 
        author: null, description: null, publisher: null, 
        language: null, creationDate: null, modifiedDate: null, isbn: null 
      };
      
      return { success: true, book: { metadata, rawContent: normalizedContent, source } };
    } catch (error: any) {
      return { success: false, error: new BookParsingError(`Text parsing failed: ${error.message}`) };
    }
  }
}
